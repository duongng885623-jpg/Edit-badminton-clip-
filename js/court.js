// Multi-Sport Court geometry: Badminton, Pickleball, Tennis.
// Court coords (m): x = width, y = length, net at length / 2.

export const SPORT_CONFIGS = {
  badminton: {
    name: 'Cầu lông (Badminton)',
    W: 6.1,
    L: 13.4,
    shortService: 1.98,
    longServiceD: 0.76,
    singlesIn: 0.46,
    lines: (W, L) => {
      const netY = L / 2, s1 = netY - 1.98, s2 = netY + 1.98, sIn = 0.46, lsd = 0.76;
      return [
        [[0, 0], [W, 0]], [[0, L], [W, L]],
        [[0, 0], [0, L]], [[W, 0], [W, L]],
        [[sIn, 0], [sIn, L]], [[W - sIn, 0], [W - sIn, L]],
        [[0, lsd], [W, lsd]], [[0, L - lsd], [W, L - lsd]],
        [[0, s1], [W, s1]], [[0, s2], [W, s2]],
        [[W / 2, 0], [W / 2, s1]], [[W / 2, s2], [W / 2, L]],
      ];
    },
    speedRanks: [
      { rank: 'SSS', name: 'SIÊU CÚ ĐẬP (GODLIKE)', color: '#D96BFF', min: 400 },
      { rank: 'SS', name: 'ĐẬP SẤM SÉT (MONSTER)', color: '#FF3D7F', min: 320 },
      { rank: 'S', name: 'CÚ ĐẬP MẠNH (SMASH)', color: '#FF9100', min: 250 },
      { rank: 'A', name: 'ĐÁNH UY LỰC (POWER)', color: '#FFC400', min: 180 },
      { rank: 'B', name: 'TẠT CẦU (DRIVE)', color: '#7CFF4F', min: 100 },
      { rank: 'C', name: 'GÀI CẦU / CHẠM (TOUCH)', color: '#9FB4D0', min: 0 },
    ]
  },
  pickleball: {
    name: 'Pickleball',
    W: 6.10, // 20 feet
    L: 13.41, // 44 feet
    kitchen: 2.13, // 7 feet Non-Volley Zone
    lines: (W, L) => {
      const netY = L / 2, k1 = netY - 2.13, k2 = netY + 2.13;
      return [
        [[0, 0], [W, 0]], [[0, L], [W, L]], // 2 Đường biên ngang (baseline)
        [[0, 0], [0, L]], [[W, 0], [W, L]], // 2 Đường biên dọc (sidelines)
        [[0, k1], [W, k1]], [[0, k2], [W, k2]], // Vạch bếp (Kitchen / Non-Volley Zone)
        [[W / 2, 0], [W / 2, k1]], [[W / 2, k2], [W / 2, L]], // Đường trung tâm chia ô giao bóng
        [[0, netY], [W, netY]], // Đường lưới
      ];
    },
    speedRanks: [
      { rank: 'SSS', name: 'SPEEDUP ĐỈNH CAO', color: '#D96BFF', min: 100 },
      { rank: 'SS', name: 'ĐẬP CẦU LỬA (FIRE SMASH)', color: '#FF3D7F', min: 85 },
      { rank: 'S', name: 'TĂNG TỐC (SPEEDUP)', color: '#FF9100', min: 70 },
      { rank: 'A', name: 'BẮN DRIVE MẠNH', color: '#FFC400', min: 55 },
      { rank: 'B', name: 'THẢ BÓNG (DROP)', color: '#7CFF4F', min: 35 },
      { rank: 'C', name: 'GÀI BẾP (DINK)', color: '#9FB4D0', min: 0 },
    ]
  },
  tennis: {
    name: 'Quần vợt (Tennis)',
    W: 10.97, // 36 feet doubles
    L: 23.77, // 78 feet
    singlesIn: 1.37, // 4.5 feet each side
    serviceDist: 6.40, // 21 feet from net
    lines: (W, L) => {
      const netY = L / 2, sDist = 6.40, sIn = 1.37;
      const s1 = netY - sDist, s2 = netY + sDist;
      return [
        [[0, 0], [W, 0]], [[0, L], [W, L]], // Baselines
        [[0, 0], [0, L]], [[W, 0], [W, L]], // Doubles sidelines
        [[sIn, 0], [sIn, L]], [[W - sIn, 0], [W - sIn, L]], // Singles sidelines
        [[sIn, s1], [W - sIn, s1]], [[sIn, s2], [W - sIn, s2]], // Service lines
        [[W / 2, s1], [W / 2, s2]], // Center service line
        [[0, netY], [W, netY]], // Net line
      ];
    },
    speedRanks: [
      { rank: 'SSS', name: 'GIAO BÓNG TIA CHỚP (ACE)', color: '#D96BFF', min: 190 },
      { rank: 'SS', name: 'CÚ ĐẬP SẤM SÉT (SMASH)', color: '#FF3D7F', min: 160 },
      { rank: 'S', name: 'CÚ WINNER UY LỰC', color: '#FF9100', min: 130 },
      { rank: 'A', name: 'BÓNG BỀN MẠNH (DRIVE)', color: '#FFC400', min: 100 },
      { rank: 'B', name: 'CẮT BÓNG (SLICE)', color: '#7CFF4F', min: 70 },
      { rank: 'C', name: 'BỎ NHỎ (DROP SHOT)', color: '#9FB4D0', min: 0 },
    ]
  }
};

export let CURRENT_SPORT = 'badminton';
export const setSport = (s) => { if (SPORT_CONFIGS[s]) CURRENT_SPORT = s; };
export const getSportConfig = (s = CURRENT_SPORT) => SPORT_CONFIGS[s] || SPORT_CONFIGS.badminton;

export const COURT_W = 6.1;
export const COURT_L = 13.4;
export const NET_Y = COURT_L / 2;

export function courtLines(sport = CURRENT_SPORT) {
  const cfg = getSportConfig(sport);
  return cfg.lines(cfg.W, cfg.L);
}

/**
 * 4 image corners in any click order → TL, TR, BR, BL: clockwise on screen from the left end of the top edge.
 */
export function orderCorners(pts) {
  if (pts.length !== 4) return pts;
  const cx = pts.reduce((s, p) => s + p[0], 0) / 4, cy = pts.reduce((s, p) => s + p[1], 0) / 4;
  const cw = [...pts].sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx)); // clockwise on screen
  let top = 0; // edge top → (top + 1) % 4 with the smallest mean y
  for (let i = 1; i < 4; i++) {
    if (cw[i][1] + cw[(i + 1) % 4][1] < cw[top][1] + cw[(top + 1) % 4][1]) top = i;
  }
  return [0, 1, 2, 3].map(k => cw[(top + k) % 4]);
}

/** Court-meter targets for image corners TL, TR, BR, BL. */
function courtTargets(orientation, W, L) {
  return orientation === 'side'
    ? [[0, 0], [0, L], [W, L], [W, 0]]
    : [[0, 0], [W, 0], [W, L], [0, L]];
}

function solve(A, b) { // Gaussian elimination, partial pivot
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    if (Math.abs(A[p][i]) < 1e-12) return null;
    [A[i], A[p]] = [A[p], A[i]];
    [b[i], b[p]] = [b[p], b[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

export function homography(src, dst) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = solve(A, b);
  if (!h) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function invert3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  return [
    A, -(b * i - c * h), b * f - c * e,
    B, a * i - c * g, -(a * f - c * d),
    C, -(a * h - b * g), a * e - b * d
  ].map(v => v / det);
}

export function applyH(H, x, y) {
  const w = H[6] * x + H[7] * y + H[8];
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

export class Court {
  constructor(corners, orientation = 'behind', marginM = 1.2, sport = CURRENT_SPORT) {
    this.sport = sport;
    const cfg = getSportConfig(sport);
    this.W = cfg.W;
    this.L = cfg.L;
    this.netY = cfg.L / 2;
    this.corners = orderCorners(corners);
    this.orientation = orientation;
    this.marginM = marginM ?? 1.2;
    this.margin = this.marginM;
    this.H = homography(this.corners, courtTargets(orientation, this.W, this.L)); // image -> court
    if (!this.H) throw new Error('Invalid court homography matrix');
    this.Hinv = invert3(this.H); // court -> image
    if (!this.Hinv) throw new Error('Cannot invert court homography matrix');
  }

  toCourt(x, y) { return applyH(this.H, x, y); }
  toImg(x, y) { return applyH(this.Hinv, x, y); }
  toImage(x, y) { return applyH(this.Hinv, x, y); }

  inPlay(pt) {
    if (!pt) return false;
    const [x, y] = pt, m = this.marginM;
    return x >= -m && x <= this.W + m && y >= -m && y <= this.L + m;
  }

  isFar(pt) {
    if (!pt) return false;
    return pt[1] < this.netY;
  }

  drawLines(ctx, color = '#39ff88', width = 2) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
    for (const [a, b] of courtLines(this.sport)) {
      ctx.beginPath();
      for (let k = 0; k <= 24; k++) { // sampled: stays geometrically correct even with extreme perspective
        const t = k / 24;
        const [x, y] = this.toImg(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Đường dóng mô phỏng mở rộng ra ngoài mép sân để dễ canh chỉnh khi góc bị che khuất hoặc quay thiếu sân */
  drawExtendedGuidelines(ctx, lw = 2) {
    const W = this.W, L = this.L, netY = this.netY;
    const extraY = Math.max(4, L * 0.4);
    const extraX = Math.max(3, W * 0.45);

    ctx.save();
    // 1. Tia dóng kéo dài vô tận qua biên sân
    const lExt = [this.toImg(0, -extraY), this.toImg(0, L + extraY)];
    const rExt = [this.toImg(W, -extraY), this.toImg(W, L + extraY)];
    const fExt = [this.toImg(-extraX, 0), this.toImg(W + extraX, 0)];
    const nExt = [this.toImg(-extraX, L), this.toImg(W + extraX, L)];
    const netExt = [this.toImg(-extraX, netY), this.toImg(W + extraX, netY)];

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = lw;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    for (const [p1, p2] of [lExt, rExt, fExt, nExt, netExt]) {
      if (Number.isFinite(p1[0]) && Number.isFinite(p1[1]) && Number.isFinite(p2[0]) && Number.isFinite(p2[1])) {
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
      }
    }
    ctx.stroke();

    // 2. Tia dóng đường chéo góc sân hỗ trợ khớp góc khuất
    ctx.strokeStyle = 'rgba(255, 196, 0, 0.65)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const cTL = this.toImg(0, 0), cTR = this.toImg(W, 0), cBR = this.toImg(W, L), cBL = this.toImg(0, L);
    const rays = [
      [cTL, this.toImg(-extraX * 0.5, -extraY * 0.5)],
      [cTR, this.toImg(W + extraX * 0.5, -extraY * 0.5)],
      [cBR, this.toImg(W + extraX * 0.5, L + extraY * 0.5)],
      [cBL, this.toImg(-extraX * 0.5, L + extraY * 0.5)],
    ];
    for (const [p1, p2] of rays) {
      if (Number.isFinite(p1[0]) && Number.isFinite(p1[1]) && Number.isFinite(p2[0]) && Number.isFinite(p2[1])) {
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Overlapping image tiles [x, y, w, h] over the band of the far half (+ room for a standing player above the
   * baseline), detected near native resolution: far players are small after the downscale.
   */
  farTiles(W, H, size = 640, maxTiles = 4) {
    const m = this.marginM, pts = [[-m, -m], [this.W + m, -m], [this.W + m, this.netY + 1], [-m, this.netY + 1]].map(p => this.toImg(...p));
    if (!pts.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1]))) return [];
    const tall = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) / (this.W + 2 * m) * 2.4; // ~2.4 m in px at the far baseline
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x1 = 0, x2 = W;
    const y1 = Math.max(0, Math.min(...ys) - tall), y2 = Math.min(H, Math.max(...ys) + tall * 0.2);
    if (y2 - y1 < 16 || Math.max(...xs) < 0 || Math.min(...xs) > W) return [];
    const ov = Math.min(Math.max(tall * 0.5, 64), 200);
    const starts = (a, b, s) => {
      if (b - a <= s) return [a];
      const n = Math.ceil((b - a - ov) / (s - ov));
      return Array.from({ length: n }, (_, i) => a + (b - a - s) * i / (n - 1));
    };
    let s = size, tiles;
    for (;;) {
      const sx = starts(x1, x2, s), sy = starts(y1, y2, s);
      tiles = sy.flatMap(y => sx.map(x => [x, y, Math.min(s, x2 - x), Math.min(s, y2 - y)].map(Math.round)));
      if (tiles.length <= maxTiles) return tiles;
      s *= 1.25;
    }
  }

  /**
   * Image polygon (convex hull) of the air above this court: floor + margin, lifted up to `height` m.
   */
  airPolygon(height = 8, margin = 1.5) {
    const m = margin, floor = [[-m, -m], [this.W + m, -m], [this.W + m, this.L + m], [-m, this.L + m]];
    const pts = [];
    for (const [x, y] of floor) {
      const p = this.toImg(x, y), ax = this.toImg(x + 1, y), ay = this.toImg(x, y + 1);
      const ppm = Math.max(Math.hypot(ax[0] - p[0], ax[1] - p[1]), Math.hypot(ay[0] - p[0], ay[1] - p[1]));
      pts.push(p, [p[0], p[1] - ppm * height]);
    }
    if (!pts.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1]))) return null;
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // monotone-chain convex hull
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = list => {
      const h = [];
      for (const p of list) { while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); }
      return h.slice(0, -1);
    };
    return half(pts).concat(half([...pts].reverse()));
  }

  static half(p, hyst = 0, netY = NET_Y) {
    const d = p[1] - netY;
    if (Math.abs(d) < hyst) return null;
    return d < 0 ? 0 : 1;
  }
}
