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

export function orderCorners(pts) {
  if (pts.length !== 4) return pts;
  const cx = pts.reduce((s, p) => s + p[0], 0) / 4, cy = pts.reduce((s, p) => s + p[1], 0) / 4;
  const cw = [...pts].sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
  let top = 0;
  for (let i = 1; i < 4; i++) if (cw[i][1] + cw[(i + 1) % 4][1] < cw[top][1] + cw[(top + 1) % 4][1]) top = i;
  const ord = [cw[top], cw[(top + 1) % 4], cw[(top + 2) % 4], cw[(top + 3) % 4]];
  if (ord[0][0] > ord[1][0]) ord.reverse();
  return ord;
}

export class Court {
  constructor(imageCorners, orientation = 'behind', marginM = 2.5, sport = CURRENT_SPORT) {
    this.sport = sport;
    const cfg = getSportConfig(sport);
    this.W = cfg.W;
    this.L = cfg.L;
    this.netY = cfg.L / 2;
    this.corners = orderCorners(imageCorners);
    this.orientation = orientation;
    this.marginM = marginM ?? 2.5;
    this.H = findHomography(this.corners, this.standardCorners(this.W, this.L));
    this.Hinv = invert3x3(this.H);
    if (!Number.isFinite(this.H[0][0]) || !Number.isFinite(this.Hinv[0][0])) {
      throw new Error('Invalid homography matrix');
    }
  }

  standardCorners(W, L) {
    return [[0, 0], [W, 0], [W, L], [0, L]];
  }

  toCourt(ix, iy) {
    const [cx, cy] = applyH(this.H, ix, iy);
    return [cx, cy];
  }

  toImage(cx, cy) {
    const [ix, iy] = applyH(this.Hinv, cx, cy);
    return [ix, iy];
  }

  toImg(cx, cy) {
    return this.toImage(cx, cy);
  }

  drawLines(ctx, color = '#39ff88', width = 2) {
    const lines = courtLines(this.sport);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (const [p1, p2] of lines) {
      const im1 = this.toImage(p1[0], p1[1]);
      const im2 = this.toImage(p2[0], p2[1]);
      ctx.moveTo(im1[0], im1[1]);
      ctx.lineTo(im2[0], im2[1]);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Đường dóng mô phỏng mở rộng ra ngoài mép sân để dễ canh chỉnh khi góc bị che khuất hoặc quay thiếu sân */
  drawExtendedGuidelines(ctx, lw = 2) {
    const W = this.W, L = this.L, netY = this.netY;
    const extraY = Math.max(6, L * 0.45);
    const extraX = Math.max(4, W * 0.6);

    ctx.save();
    // 1. Tia dóng kéo dài vô tận qua biên sân
    const lExt = [this.toImage(0, -extraY), this.toImage(0, L + extraY)];
    const rExt = [this.toImage(W, -extraY), this.toImage(W, L + extraY)];
    const fExt = [this.toImage(-extraX, 0), this.toImage(W + extraX, 0)];
    const nExt = [this.toImage(-extraX, L), this.toImage(W + extraX, L)];
    const netExt = [this.toImage(-extraX, netY), this.toImage(W + extraX, netY)];

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = lw;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    for (const [p1, p2] of [lExt, rExt, fExt, nExt, netExt]) {
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
    }
    ctx.stroke();

    // 2. Tia dóng đường chéo góc sân hỗ trợ khớp góc khuất
    ctx.strokeStyle = 'rgba(255, 196, 0, 0.65)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const cTL = this.toImage(0, 0), cTR = this.toImage(W, 0), cBR = this.toImage(W, L), cBL = this.toImage(0, L);
    const rays = [
      [cTL, this.toImage(-extraX * 0.5, -extraY * 0.5)],
      [cTR, this.toImage(W + extraX * 0.5, -extraY * 0.5)],
      [cBR, this.toImage(W + extraX * 0.5, L + extraY * 0.5)],
      [cBL, this.toImage(-extraX * 0.5, L + extraY * 0.5)],
    ];
    for (const [p1, p2] of rays) {
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
    }
    ctx.stroke();

    ctx.restore();
  }

  inPlay(pt) {
    if (!pt) return false;
    const [x, y] = pt, m = this.marginM;
    return x >= -m && x <= this.W + m && y >= -m && y <= this.L + m;
  }

  isFar([x, y]) { return y < this.netY; }

  farTiles(W, H) {
    // Generate far court ROI that comfortably includes:
    // 1. Players standing up to 2.5m behind the far baseline
    // 2. Players standing up to 2.0m outside the left/right sidelines
    // 3. Players standing up to 1.5m past the net line
    // 4. Headroom: Far players' heads and racquets extend ~28% of frame height above their feet
    const pts = [];
    for (const [cx, cy] of [
      [-2.0, -2.5], [this.W + 2.0, -2.5],
      [this.W + 2.0, this.netY + 1.5], [-2.0, this.netY + 1.5],
      [0, 0], [this.W, 0], [this.W, this.netY], [0, this.netY]
    ]) {
      try {
        const [ix, iy] = this.toImage(cx, cy);
        if (Number.isFinite(ix) && Number.isFinite(iy)) pts.push([ix, iy]);
      } catch {}
    }
    if (pts.length < 4) return [];
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const headRoom = Math.round(H * 0.28);
    const x1 = Math.max(0, Math.floor(Math.min(...xs) - 20));
    const y1 = Math.max(0, Math.floor(Math.min(...ys) - headRoom));
    const x2 = Math.min(W, Math.ceil(Math.max(...xs) + 20));
    const y2 = Math.min(H, Math.ceil(Math.max(...ys) + 25));
    if (x2 <= x1 || y2 <= y1) return [];
    return [[x1, y1, x2 - x1, y2 - y1]];
  }

  airPolygon() {
    const [tl, tr, br, bl] = this.corners;
    const dx = tr[0] - tl[0], dy = tr[1] - tl[1];
    const topOffset = [dx * 0.2, dy * 0.2];
    return [
      [tl[0] - topOffset[0], tl[1] - topOffset[1] - 80],
      [tr[0] + topOffset[0], tr[1] - topOffset[1] - 80],
      [br[0] + 30, br[1] + 30],
      [bl[0] - 30, bl[1] + 30],
    ];
  }
}

function findHomography(src, dst) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i];
    A.push([-x, -y, -1, 0, 0, 0, u * x, u * y, u]);
    A.push([0, 0, 0, -x, -y, -1, v * x, v * y, v]);
  }
  const h = solveSVD(A);
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], h[8]],
  ];
}

function solveSVD(A) {
  const AtA = Array.from({ length: 9 }, () => new Float64Array(9));
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let sum = 0;
      for (let k = 0; k < 8; k++) sum += A[k][i] * A[k][j];
      AtA[i][j] = sum;
    }
  }
  let v = new Float64Array(9);
  v[8] = 1;
  for (let iter = 0; iter < 40; iter++) {
    const nv = new Float64Array(9);
    for (let i = 0; i < 9; i++) {
      let sum = 0;
      for (let j = 0; j < 9; j++) sum += AtA[i][j] * v[j];
      nv[i] = sum;
    }
    let norm = 0;
    for (let i = 0; i < 9; i++) norm += nv[i] * nv[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < 9; i++) v[i] = nv[i] / norm;
  }
  const c = v[8] || 1;
  return Array.from(v).map(x => x / c);
}

function invert3x3(m) {
  const a = m[0][0], b = m[0][1], c = m[0][2];
  const d = m[1][0], e = m[1][1], f = m[1][2];
  const g = m[2][0], h = m[2][1], k = m[2][2];
  const A = e * k - f * h, B = -(d * k - f * g), C = d * h - e * g;
  const D = -(b * k - c * h), E = a * k - c * g, F = -(a * h - b * g);
  const G = b * f - c * e, H = -(a * f - c * d), K = a * e - b * d;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return m;
  const invDet = 1 / det;
  return [
    [A * invDet, D * invDet, G * invDet],
    [B * invDet, E * invDet, H * invDet],
    [C * invDet, F * invDet, K * invDet],
  ];
}

function applyH(H, x, y) {
  const w = H[2][0] * x + H[2][1] * y + H[2][2] || 1;
  return [
    (H[0][0] * x + H[0][1] * y + H[0][2]) / w,
    (H[1][0] * x + H[1][1] * y + H[1][2]) / w,
  ];
}
