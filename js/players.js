// Map ByteTrack tracks to configured players: known IDs first (with jump check), then court-distance matching.
import { COURT_L, COURT_W, NET_Y } from './court.js';

const L_ANKLE = 15, R_ANKLE = 16;

function iou(a, b) {
  const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]), x2 = Math.min(a[2], b[2]), y2 = Math.min(a[3], b[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter + 1e-9);
}

export const fpsAlpha = (a30, fps) => 1 - Math.pow(1 - a30, 30 / Math.max(fps, 1));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const NET_SLACK = 0.6;           // m a player may reach past the net line (lunges / net kills)
const APP_W = 10;                // appearance weight: (1 - similarity) * APP_W metres
const APP_LEARN = 45;            // clean samples averaged into a shirt fingerprint, then frozen
const APP_VETO = 0.12;           // detection looks this much more like a same-side partner → not this player

/** 16-bin shirt colour histogram of the torso (black, 3 greys, 12 hues). */
export function torsoHist(ctx, box) {
  const [x1, y1, x2, y2] = box, w = x2 - x1, h = y2 - y1;
  const X = Math.max(0, Math.round(x1 + 0.25 * w)), Y = Math.max(0, Math.round(y1 + 0.18 * h));
  const RW = Math.max(2, Math.round(0.5 * w)), RH = Math.max(2, Math.round(0.32 * h));
  let data;
  try { data = ctx.getImageData(X, Y, RW, RH).data; } catch { return null; }
  const hist = new Float32Array(16);
  let n = 0;
  for (let i = 0; i < data.length; i += 8) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx / 255, s = mx ? (mx - mn) / mx : 0;
    let bin;
    if (v < 0.2) bin = 0;
    else if (s < 0.22) bin = 1 + Math.min(2, Math.floor((v - 0.2) / 0.27));
    else {
      let hh = mx === r ? (g - b) / (mx - mn) : mx === g ? 2 + (b - r) / (mx - mn) : 4 + (r - g) / (mx - mn);
      hh = (hh * 60 + 360) % 360;
      bin = 4 + Math.min(11, Math.floor(hh / 30));
    }
    hist[bin]++; n++;
  }
  if (!n) return null;
  for (let k = 0; k < 16; k++) hist[k] /= n;
  return hist;
}
export const similarity = (a, b) => { let s = 0; for (let k = 0; k < 16; k++) s += Math.sqrt(a[k] * b[k]); return s; };

export function footPoint(det) {
  const [x1, y1, x2, y2] = det.box;
  let foot = [(x1 + x2) / 2, y2];
  const k = det.kps;
  if (k) {
    const xs = [], ys = [];
    for (const j of [L_ANKLE, R_ANKLE]) if (k[j * 3 + 2] > 0.35) { xs.push(k[j * 3]); ys.push(k[j * 3 + 1]); }
    if (xs.length) foot = [xs.reduce((a, b) => a + b) / xs.length, Math.min(Math.max(...ys) + 0.02 * (y2 - y1), y2)];
  }
  return foot;
}

export function defaultAnchors(players, court = null) {
  const cW = court?.W || COURT_W, cL = court?.L || COURT_L;
  const teams = [...new Set(players.map((p, i) => p.team || String(i)))];
  const groups = {};
  players.forEach((p, i) => {
    const side = p.side || (teams.indexOf(p.team || String(i)) % 2 === 0 ? 'far' : 'near');
    (groups[side] ||= []).push(i);
  });
  const anchors = [];
  for (const [side, idxs] of Object.entries(groups)) {
    const y = cL * (side === 'far' ? 0.25 : 0.75);
    idxs.forEach((i, k) => { anchors[i] = [cW * (k + 1) / (idxs.length + 1), y]; });
  }
  return anchors;
}

export class PlayerTracker {
  constructor(cfg, court, fps, seeds = {}) {
    this.court = court;
    const netY = court?.netY || NET_Y;
    const t = cfg.tracking, s = cfg.smoothing;
    this.maxSpeed = t.maxSpeed; this.maxJump = t.maxJump; this.lostTtl = t.lostTtl;
    this.aPos = fpsAlpha(s.posAlpha, fps);
    this.aTag = fpsAlpha(s.tagAlpha, fps);
    const anchors = defaultAnchors(cfg.players, court);
    this.players = cfg.players.map((p, i) => ({
      idx: i, name: p.name, color: p.color, team: p.team,
      half: (p.side || (anchors[i][1] < netY ? 'far' : 'near')) === 'far' ? 0 : 1,
      // shirt fingerprint: from the player card (named by the user) or learned from the first clean frames, then frozen
      app: p.hist?.length === 16 ? Float32Array.from(p.hist) : null, appN: p.hist?.length === 16 ? APP_LEARN : 0, appSum: null,
      anchor: seeds[i] || anchors[i],
      pos: null, head: null, box: null, trackId: null,
      vel: [0, 0],
      visible: false, everSeen: false, lastSeen: -1e9,
    }));
    this.owner = new Map();       // track id -> player idx
    this.lastDets = [];
  }

  refPos(p) { return p.everSeen ? p.pos : p.anchor; }
  predPos(p, t) {
    if (!p.everSeen) return p.anchor;
    const dt = Math.max(0, Math.min(t - p.lastSeen, 0.45));
    return [
      p.pos[0] + (p.vel?.[0] || 0) * dt,
      p.pos[1] + (p.vel?.[1] || 0) * dt
    ];
  }
  gate(p, t) {
    if (!p.everSeen) {
      // Frame đầu tiên: chỉ tìm VĐV quanh điểm đã xác nhận (seed), ngăn chặn nhảy sang khán giả ngồi ngoài
      return this.court?.sport === 'tennis' ? 3.8 : 2.5;
    }
    return Math.min(this.maxJump + this.maxSpeed * Math.max(t - p.lastSeen, 0), this.court?.sport === 'tennis' ? 6.5 : 4.5);
  }
  /** hard rule: players never change court half (end changes are not handled) */
  onSide(p, d) {
    const netY = this.court?.netY || NET_Y;
    return p.half === 0 ? d.court[1] < netY + NET_SLACK : d.court[1] > netY - NET_SLACK;
  }
  sim(p, d) { return p.appN >= APP_LEARN && d.hist ? similarity(p.app, d.hist) : null; }

  /** Chỉ dựa vào màu áo nếu 2 người chơi cùng sân mặc đồ khác màu rõ rệt */
  hasDistinctShirts(p) {
    if (p.appN < APP_LEARN || !p.app) return false;
    const partner = this.players.find(o => o.idx !== p.idx && o.half === p.half && o.appN >= APP_LEARN && o.app);
    if (!partner) return false;
    return similarity(p.app, partner.app) < 0.78;
  }

  /** true when d clearly wears a same-side partner's shirt rather than p's */
  vetoed(p, d) {
    if (!this.hasDistinctShirts(p)) return false; // Không phạt nếu mặc đồ cùng màu
    const mine = this.sim(p, d);
    if (mine === null) return false;
    return this.players.some(q => q !== p && q.half === p.half && (this.sim(q, d) ?? -1) > mine + APP_VETO);
  }

  cost(p, d, t) {
    const pred = this.predPos(p, t);
    let c = dist(d.court, pred);
    // Khóa người chơi: ưu tiên cao nếu trackId trùng khớp với frame trước
    if (p.trackId === d.tid) c *= 0.35;
    // Tính tương đồng tỷ lệ chiều cao bounding box
    if (p.box) {
      const h0 = p.box[3] - p.box[1], h1 = d.box[3] - d.box[1];
      const hRatio = Math.max(h0, h1) / Math.max(1, Math.min(h0, h1));
      if (hRatio > 2.0) c += 1.8;
    }
    // Chỉ bổ sung màu áo nếu người chơi có trang phục phân biệt
    if (this.hasDistinctShirts(p)) {
      const s = this.sim(p, d);
      if (s !== null) c += 4.0 * (1 - s);
    }
    return c;
  }

  /** tracks: ByteTrack output; frameCtx: 2D context of the current frame (for shirt colours) */
  update(tracks, t, frameCtx = null) {
    const dets = [];
    for (const d of tracks) {
      const foot = footPoint(d), court = this.court.toCourt(foot[0], foot[1]);
      if (court && this.court.inPlay(court)) dets.push({ ...d, foot, court, hist: frameCtx ? torsoHist(frameCtx, d.box) : null });
    }
    this.lastDets = dets;
    const assigned = new Map(), used = new Set();

    // 1) Giữ khóa track ID đang theo dõi — nếu cùng nửa sân và trong phạm vi chuyển động hợp lý
    const cands = new Map();
    dets.forEach((d, di) => {
      const pi = this.owner.get(d.tid);
      if (pi === undefined) return;
      const p = this.players[pi];
      const dd = p.everSeen ? dist(d.court, this.predPos(p, t)) : 0;
      const ok = this.onSide(p, d) && (!p.everSeen || dd <= this.gate(p, t)) && !this.vetoed(p, d);
      if (!ok) { this.owner.delete(d.tid); return; }
      if (!cands.has(pi) || dd < cands.get(pi)[0]) cands.set(pi, [dd, di]);
    });
    for (const [pi, [, di]] of cands) { assigned.set(pi, di); used.add(di); }

    // 2) Ghép cặp tối ưu cho từng nửa sân (Bipartite matching) tránh hoán đổi người chơi khi giao cắt
    for (const half of [0, 1]) {
      const unassignedPlayers = this.players.filter(p => p.half === half && !assigned.has(p.idx));
      const availDets = [];
      dets.forEach((d, di) => {
        if (!used.has(di) && this.onSide({ half }, d)) availDets.push(di);
      });
      if (unassignedPlayers.length === 1 && availDets.length >= 1) {
        const p = unassignedPlayers[0];
        let bestDi = -1, minCost = Infinity;
        for (const di of availDets) {
          if (this.vetoed(p, dets[di])) continue;
          const c = this.cost(p, dets[di], t);
          if (c < minCost && dist(dets[di].court, this.predPos(p, t)) <= this.gate(p, t)) {
            minCost = c; bestDi = di;
          }
        }
        if (bestDi >= 0) {
          assigned.set(p.idx, bestDi); used.add(bestDi);
          if (!this.owner.has(dets[bestDi].tid)) this.owner.set(dets[bestDi].tid, p.idx);
        }
      } else if (unassignedPlayers.length >= 2 && availDets.length >= 2) {
        // Đánh đôi: giải bài toán ghép cặp tối thiểu hóa tổng khoảng cách Cost A-1 + B-2 vs Cost A-2 + B-1
        const [pA, pB] = unassignedPlayers;
        let bestPair = null, minTotalCost = Infinity;
        for (let i = 0; i < availDets.length; i++) {
          for (let j = 0; j < availDets.length; j++) {
            if (i === j) continue;
            const diA = availDets[i], diB = availDets[j];
            if (this.vetoed(pA, dets[diA]) || this.vetoed(pB, dets[diB])) continue;
            const costA = this.cost(pA, dets[diA], t);
            const costB = this.cost(pB, dets[diB], t);
            const total = costA + costB;
            if (total < minTotalCost &&
                dist(dets[diA].court, this.predPos(pA, t)) <= this.gate(pA, t) &&
                dist(dets[diB].court, this.predPos(pB, t)) <= this.gate(pB, t)) {
              minTotalCost = total; bestPair = [diA, diB];
            }
          }
        }
        if (bestPair) {
          assigned.set(pA.idx, bestPair[0]); used.add(bestPair[0]);
          assigned.set(pB.idx, bestPair[1]); used.add(bestPair[1]);
          if (!this.owner.has(dets[bestPair[0]].tid)) this.owner.set(dets[bestPair[0]].tid, pA.idx);
          if (!this.owner.has(dets[bestPair[1]].tid)) this.owner.set(dets[bestPair[1]].tid, pB.idx);
        }
      }
    }

    // 3) Greedy fallback cho các trường hợp còn lại
    const pairs = [];
    for (const p of this.players) {
      if (assigned.has(p.idx)) continue;
      dets.forEach((d, di) => { if (!used.has(di) && this.onSide(p, d) && !this.vetoed(p, d)) pairs.push([this.cost(p, d, t), p.idx, di]); });
    }
    pairs.sort((a, b) => a[0] - b[0]);
    for (const [c, pi, di] of pairs) {
      const p = this.players[pi];
      if (assigned.has(pi) || used.has(di) || dist(dets[di].court, this.predPos(p, t)) > this.gate(p, t)) continue;
      assigned.set(pi, di); used.add(di);
      if (!this.owner.has(dets[di].tid)) this.owner.set(dets[di].tid, pi);
    }

    for (const p of this.players) {
      if (assigned.has(p.idx)) this.apply(p, dets[assigned.get(p.idx)], t);
      else p.visible = false;
    }
    // learn a shirt fingerprint once (clean, non-overlapping frames only), then freeze it — no drift after swaps
    for (const [pi, di] of assigned) {
      const p = this.players[pi], d = dets[di];
      if (p.appN >= APP_LEARN || !d.hist) continue;
      if (dets.some((o, oi) => oi !== di && iou(o.box, d.box) > 0.02)) continue;
      p.appSum ||= new Float32Array(16);
      for (let k = 0; k < 16; k++) p.appSum[k] += d.hist[k];
      if (++p.appN === APP_LEARN) p.app = p.appSum.map(v => v / APP_LEARN);
    }
    return this.players;
  }

  apply(p, d, t) {
    const head = [(d.box[0] + d.box[2]) / 2, d.box[1]];
    if (!p.everSeen || t - p.lastSeen > this.lostTtl * 2) {
      p.pos = [...d.court]; p.head = head;
      p.vel = [0, 0];
    } else {
      const dt = t - p.lastSeen;
      if (dt > 1e-3 && dt < 0.5) {
        const rawVx = (d.court[0] - p.pos[0]) / dt;
        const rawVy = (d.court[1] - p.pos[1]) / dt;
        const vMag = Math.hypot(rawVx, rawVy);
        if (vMag <= this.maxSpeed * 1.5) {
          p.vel = [
            (p.vel ? p.vel[0] : 0) * 0.5 + rawVx * 0.5,
            (p.vel ? p.vel[1] : 0) * 0.5 + rawVy * 0.5
          ];
        }
      }
      p.pos = [p.pos[0] + this.aPos * (d.court[0] - p.pos[0]), p.pos[1] + this.aPos * (d.court[1] - p.pos[1])];
      p.head = [p.head[0] + this.aTag * (head[0] - p.head[0]), p.head[1] + this.aTag * (head[1] - p.head[1])];
    }
    p.box = d.box; p.kps = d.kps; p.trackId = d.tid;
    p.visible = true; p.everSeen = true; p.lastSeen = t;
  }

  drawable(p, t) { return p.everSeen && (p.visible || t - p.lastSeen <= this.lostTtl); }

  bindings() {
    const out = {};
    for (const [tid, pi] of [...this.owner].sort((a, b) => a[0] - b[0])) (out[this.players[pi].name] ||= []).push(tid);
    return out;
  }
}

/**
 * Detection every `stride` frames leaves players' positions held in between (rings step, racket zones lag up to
 * stride - 1 frames). After pass 1, interpolate linearly between two detected frames where the player was seen in both:
 * snapshot pos/head/kps and the analysis boxes [x1, y1, x2, y2, idx, courtX, courtY]. Frames after the last detection hold.
 */
export function interpolateBetween(snaps, boxes, stride) {
  if (stride <= 1) return;
  const lerp = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);
  for (let a = 0; a + stride < snaps.length; a += stride) {
    const b = a + stride;
    snaps[a].players.forEach((pa, pi) => {
      const pb = snaps[b].players[pi];
      for (let i = a + 1; i < b; i++) {
        const p = snaps[i].players[pi], f = (i - a) / stride;
        if (pa.pos && pb?.pos) {
          p.pos = lerp(pa.pos, pb.pos, f);
          p.show = pa.show || pb.show;
          p.seen = pa.seen || pb.seen;
        }
        if (pa.head && pb?.head) p.head = lerp(pa.head, pb.head, f);
        if (pa.kps && pb?.kps) p.kps = Array.from(pa.kps, (v, k) => v + (pb.kps[k] - v) * f);
        if (snaps[a].dist && snaps[b].dist) {
          snaps[i].dist[pi] = snaps[a].dist[pi] + (snaps[b].dist[pi] - snaps[a].dist[pi]) * f;
        }
        if (snaps[a].sta && snaps[b].sta) {
          snaps[i].sta[pi] = snaps[a].sta[pi] + (snaps[b].sta[pi] - snaps[a].sta[pi]) * f;
        }
        if (snaps[a].staFrac && snaps[b].staFrac) {
          snaps[i].staFrac[pi] = snaps[a].staFrac[pi] + (snaps[b].staFrac[pi] - snaps[a].staFrac[pi]) * f;
        }
      }
    });
    for (const ba of boxes[a]) {
      const bb = boxes[b].find(x => x[4] === ba[4]);
      if (!bb) continue;
      for (let i = a + 1; i < b; i++) {
        const f = (i - a) / stride, v = [...lerp(ba.slice(0, 4), bb.slice(0, 4), f), ba[4], ...lerp(ba.slice(5), bb.slice(5), f)];
        const j = boxes[i].findIndex(x => x[4] === ba[4]);
        if (j >= 0) boxes[i][j] = v; else boxes[i].push(v);
      }
    }
  }
}
