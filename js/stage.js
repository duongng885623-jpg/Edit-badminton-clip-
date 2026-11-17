// Interactive frame view: court calibration (click/drag 4 corners) and player assignment (click a box).
import { Court, orderCorners } from './court.js';
import { t } from './i18n.js';

const MAX_PX = 2560 * 1440;   // display canvas cap: a 4K frame + border was ~16 M px (WebKit/iOS canvas memory limit)


export class Stage {
  constructor(canvas, { onChange } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onChange = onChange;
    this.mode = 'calibrate';
    this.sport = 'badminton';
    this.frame = null;
    this.points = [];
    this.orientation = 'behind';
    this.dets = [];
    this.labels = new Map();     // det index -> {name, color}
    this.onPickDet = null;
    this.onManualBox = null;
    this.drag = -1;
    this.padPx = 0;
    this.k = 1;                  // canvas px per frame px (< 1 for big frames, see MAX_PX)
    this.showGuidelines = true;  // Tia dóng mô phỏng kéo dài
    this.manualAdd = false;      // Chế độ thêm thủ công
    this.dragBox = null;         // [x1, y1, x2, y2] khi đang kéo chuột khoanh vùng

    canvas.addEventListener('pointerdown', e => this.down(e));
    canvas.addEventListener('pointermove', e => this.move(e));
    window.addEventListener('pointerup', e => this.up(e));
  }

  get pad() { return this.mode === 'calibrate' ? this.padPx : 0; }
  // border wide enough for off-frame corners; expanded to 0.55 (55%) for generous breathing space
  fitPad() {
    const f = this.frame;
    if (!f) return;
    let need = 0.55 * Math.max(f.width, f.height);
    for (const [x, y] of this.points) need = Math.max(need, -x, -y, x - f.width, y - f.height);
    this.padPx = Math.round(need + 0.12 * f.height);
  }

  setFrame(frame) {
    this.frame = frame;
    this.fitPad();
    this.draw();
  }
  setMode(mode) { this.mode = mode; this.fitPad(); this.draw(); }
  setSport(sport) { this.sport = sport; this.draw(); }

  toImage(e) {
    const r = this.canvas.getBoundingClientRect(), k = this.canvas.width / this.k / r.width;
    return [(e.clientX - r.left) * k - this.pad, (e.clientY - r.top) * k - this.pad];
  }
  // image px per CSS px, so handles stay the same on-screen size on a phone and a desktop
  unit() { const w = this.canvas.getBoundingClientRect().width; return w ? this.canvas.width / this.k / w : 1; }
  hitRadius(e) { return (e.pointerType === 'touch' ? 28 : 14) * this.unit(); }

  down(e) {
    if (!this.frame) return;
    const [x, y] = this.toImage(e);
    if (this.mode === 'calibrate') {
      const i = this.points.findIndex(p => Math.hypot(p[0] - x, p[1] - y) < this.hitRadius(e));
      if (i >= 0) { this.drag = i; this.canvas.setPointerCapture(e.pointerId); this.draw(); return; }
      if (this.points.length < 4) {
        // keep dragging the new corner too: on touch the finger covers it, the loupe shows where it lands
        this.points.push([x, y]); this.drag = this.points.length - 1; this.canvas.setPointerCapture(e.pointerId);
        this.draw(); this.onChange?.(); return;
      }
      // all 4 set: snap the nearest corner to the click and keep dragging it
      let near = 0;
      this.points.forEach((p, j) => { if (Math.hypot(p[0] - x, p[1] - y) < Math.hypot(this.points[near][0] - x, this.points[near][1] - y)) near = j; });
      this.points[near] = [x, y]; this.drag = near; this.canvas.setPointerCapture(e.pointerId); this.draw();
    } else if (this.mode === 'assign') {
      let best = -1, area = Infinity;
      if (!this.manualAdd) {
        this.dets.forEach((d, i) => {
          const [x1, y1, x2, y2] = d.box, a = (x2 - x1) * (y2 - y1);
          if (x >= x1 && x <= x2 && y >= y1 && y <= y2 && a < area) { best = i; area = a; }
        });
      }
      if (best >= 0) {
        this.onPickDet?.(best);
      } else {
        // Chế độ thêm thủ công hoặc kéo thả khoanh vùng trên video
        this.dragBox = [x, y, x, y];
        this.canvas.setPointerCapture(e.pointerId);
        this.draw();
      }
    }
  }

  move(e) {
    const [x, y] = this.toImage(e);
    if (this.mode === 'calibrate' && this.drag >= 0) {
      this.points[this.drag] = [x, y];
      this.draw();
    } else if (this.mode === 'assign' && this.dragBox) {
      this.dragBox[2] = x;
      this.dragBox[3] = y;
      this.draw();
    }
  }

  up(e) {
    if (this.drag >= 0) {
      this.drag = -1;
      this.points = orderCorners(this.points); // any click order; saved as TL, TR, BR, BL
      this.draw();
      this.onChange?.();
    }
    if (this.dragBox) {
      const f = this.frame;
      const [x1, y1, x2, y2] = this.dragBox;
      this.dragBox = null;
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      const bw = maxX - minX, bh = maxY - minY;
      const s = (f?.height || 720) / 720;
      let finalBox = null;

      if (bw >= 15 && bh >= 25 && f) {
        // Người dùng kéo thả chuột khoanh vùng cầu thủ
        const bx1 = Math.max(0, Math.min(minX, f.width));
        const by1 = Math.max(0, Math.min(minY, f.height));
        const bx2 = Math.max(0, Math.min(maxX, f.width));
        const by2 = Math.max(0, Math.min(maxY, f.height));
        if (bx2 - bx1 >= 10 && by2 - by1 >= 20) {
          finalBox = [bx1, by1, bx2, by2];
        }
      } else if (f && (this.manualAdd || this.mode === 'assign')) {
        // Nhấp chuột 1 điểm: tạo khung kích thước chuẩn quanh vị trí nhấp (chân tại y1)
        const defW = Math.round(50 * s), defH = Math.round(120 * s);
        const bx1 = Math.max(0, Math.min(x1 - defW / 2, f.width - defW));
        const by1 = Math.max(0, Math.min(y1 - defH, f.height - defH));
        const bx2 = Math.min(f.width, bx1 + defW);
        const by2 = Math.min(f.height, by1 + defH);
        finalBox = [bx1, by1, bx2, by2];
      }

      if (finalBox) {
        this.onManualBox?.(finalBox);
      }
      this.draw();
    }
  }

  undo() { this.points.pop(); this.draw(); this.onChange?.(); }
  reset() { this.points = []; this.fitPad(); this.draw(); this.onChange?.(); }

  court() {
    if (this.points.length !== 4) return null;
    try { return new Court(this.points, this.orientation, 1.2, this.sport); } catch { return null; }
  }

  draw() {
    const f = this.frame, ctx = this.ctx;
    if (!f) return;
    const pad = this.pad, W = f.width + pad * 2, H = f.height + pad * 2;
    this.k = Math.min(1, Math.sqrt(MAX_PX / (W * H)));   // drawing stays in frame px, scaled down to the canvas
    const cw = Math.round(W * this.k), ch = Math.round(H * this.k);
    if (this.canvas.width !== cw || this.canvas.height !== ch) { this.canvas.width = cw; this.canvas.height = ch; }
    ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
    ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, W, H);
    // Draw subtle border guides around the real video frame
    ctx.strokeStyle = 'rgba(212, 248, 44, 0.35)'; ctx.lineWidth = Math.max(1, 1.5 * this.unit());
    ctx.strokeRect(pad, pad, f.width, f.height);
    ctx.drawImage(f, pad, pad);
    const s = f.height / 720;
    ctx.save();
    ctx.translate(pad, pad);
    if (this.mode === 'calibrate') {
      const court = this.court(), u = this.unit();
      if (court) {
        court.drawLines(ctx, '#D4F82C', Math.max(2.5 * s, 2 * u));
        if (this.showGuidelines) {
          court.drawExtendedGuidelines(ctx, Math.max(1.5 * s, 1.2 * u));
        }
      } else if (this.showGuidelines) {
        // Tia dóng mô phỏng trung gian khi mới chấm 2 hoặc 3 điểm
        if (this.points.length === 2) {
          const [p0, p1] = this.points;
          const dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy) || 1;
          const ex0 = [p0[0] - (dx / len) * 2000, p0[1] - (dy / len) * 2000];
          const ex1 = [p1[0] + (dx / len) * 2000, p1[1] + (dy / len) * 2000];
          ctx.save();
          ctx.strokeStyle = 'rgba(212, 248, 44, 0.85)';
          ctx.lineWidth = Math.max(1.5 * s, 1.2 * u);
          ctx.setLineDash([10 * s, 6 * s]);
          ctx.beginPath(); ctx.moveTo(ex0[0], ex0[1]); ctx.lineTo(ex1[0], ex1[1]); ctx.stroke();
          ctx.restore();
        } else if (this.points.length === 3) {
          const [p0, p1, p2] = this.points;
          ctx.save();
          ctx.strokeStyle = 'rgba(212, 248, 44, 0.85)';
          ctx.lineWidth = Math.max(1.5 * s, 1.2 * u);
          ctx.setLineDash([10 * s, 6 * s]);
          ctx.beginPath();
          ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
          // Dự đoán góc 4 theo hình bình hành phối cảnh
          const p3 = [p0[0] + p2[0] - p1[0], p0[1] + p2[1] - p1[1]];
          ctx.strokeStyle = 'rgba(255, 196, 0, 0.8)';
          ctx.beginPath();
          ctx.moveTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p0[0], p0[1]);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 196, 0, 0.25)';
          ctx.beginPath(); ctx.arc(p3[0], p3[1], 12 * u, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(p3[0], p3[1], 12 * u, 0, Math.PI * 2); ctx.stroke();
          ctx.font = `bold ${Math.round(12 * u)}px "Be Vietnam Pro", sans-serif`;
          ctx.fillStyle = '#ffc400';
          ctx.fillText('📐 Góc 4 (Gợi ý mô phỏng)', p3[0] + 16 * u, p3[1] + 4 * u);
          ctx.restore();
        }
      }
      ctx.font = `bold ${Math.round(13 * u)}px "Be Vietnam Pro", sans-serif`;
      const ord = orderCorners(this.points);   // corner names only once all 4 are set (click order is free)
      this.points.forEach(([x, y], i) => {
        ctx.fillStyle = i === this.drag ? '#FF5A36' : '#D4F82C'; ctx.strokeStyle = '#050810'; ctx.lineWidth = 2.5 * u;
        ctx.beginPath(); ctx.arc(x, y, 7.5 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 3 * u;
        const label = ord.length === 4 ? t(`corner.${ord.indexOf(this.points[i])}`) : String(i + 1);
        ctx.strokeText(label, x + 10 * u, y - 9 * u); ctx.fillText(label, x + 10 * u, y - 9 * u);
      });
    } else if (this.mode === 'assign') {
      ctx.font = `${Math.round(22 * s)}px "Be Vietnam Pro", sans-serif`;
      this.dets.forEach((d, i) => {
        const [x1, y1, x2, y2] = d.box, lab = this.labels.get(i);
        ctx.lineWidth = 3 * s; ctx.strokeStyle = lab ? lab.color : 'rgba(255,255,255,0.7)';
        ctx.setLineDash(lab ? [] : [8 * s, 6 * s]); ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); ctx.setLineDash([]);
        if (lab) {
          const tw = ctx.measureText(lab.name).width + 16 * s;
          ctx.fillStyle = lab.color; ctx.fillRect(x1, y1 - 32 * s, tw, 30 * s);
          ctx.fillStyle = '#04121f'; ctx.fillText(lab.name, x1 + 8 * s, y1 - 10 * s);
        }
      });
      // Vẽ khung đang kéo chuột khoanh vùng thủ công
      if (this.dragBox) {
        ctx.save();
        const [x1, y1, x2, y2] = this.dragBox;
        const rx = Math.min(x1, x2), ry = Math.min(y1, y2);
        const rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
        ctx.fillStyle = 'rgba(212, 248, 44, 0.2)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#D4F82C';
        ctx.lineWidth = Math.max(2.5 * s, 2);
        ctx.setLineDash([8 * s, 4 * s]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.font = `bold ${Math.round(13 * s)}px "Be Vietnam Pro", sans-serif`;
        ctx.fillStyle = '#D4F82C';
        ctx.fillText(`🎯 ${Math.round(rw)} × ${Math.round(rh)} px`, rx + 4, ry - 6);
        ctx.restore();
      }
    }
    ctx.restore();
    if (this.mode === 'calibrate' && this.drag >= 0) this.drawLoupe(this.points[this.drag]);
    if (this.mode === 'assign' && this.manualAdd) {
      // Thanh thông báo hướng dẫn thêm thủ công nổi trên góc canvas
      ctx.save();
      ctx.fillStyle = 'rgba(7, 11, 18, 0.9)';
      ctx.strokeStyle = '#D4F82C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(16, 16, 460, 36, 8);
      else ctx.rect(16, 16, 460, 36);
      ctx.fill(); ctx.stroke();
      ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#D4F82C';
      ctx.fillText('🎯 Kéo thả chuột để khoanh vùng người chơi trên video', 30, 39);
      ctx.restore();
    }
  }

  // magnified view of the dragged corner, in the top corner away from it
  drawLoupe([x, y]) {
    const ctx = this.ctx, u = this.unit(), D = 120 * u, zoom = 3, r = D / 2 / zoom, m = 8 * u;
    const CW = this.canvas.width / this.k;
    const cx = x + this.pad < CW / 2 ? CW - m - D / 2 : m + D / 2, cy = m + D / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, D / 2, 0, Math.PI * 2); ctx.fillStyle = '#0b1220'; ctx.fill(); ctx.clip();
    ctx.drawImage(this.frame, x - r, y - r, 2 * r, 2 * r, cx - D / 2, cy - D / 2, D, D);   // raw frame: the dot would hide the target
    ctx.restore();
    ctx.strokeStyle = '#ffc400'; ctx.lineWidth = 1.5 * u;
    ctx.beginPath(); ctx.moveTo(cx - D / 2, cy); ctx.lineTo(cx + D / 2, cy); ctx.moveTo(cx, cy - D / 2); ctx.lineTo(cx, cy + D / 2); ctx.stroke();
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.arc(cx, cy, D / 2, 0, Math.PI * 2); ctx.stroke();
  }
}
