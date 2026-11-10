// Giriş ekranının arka planı (Demir 11.11): ArchX giriş ekranındaki dönen yıldız küresinin (arch_app YildizZemin.tsx)
// birebir uyarlaması. Mimari işaretler yerine DartX açılışındaki dart işaretleri, simgeleri ve DartX yazısı döner.
// Küre sayfanın arkasında, kalıcı tek bir tuvalde çizilir; giriş ekranından çıkınca durur.
import { IKONLAR, ISARETLER, MARKA } from '../acilis.js';

let tuval = null, raf = 0, calisiyor = false;
let veri = null;

function kur() {
  tuval = document.createElement('canvas');
  tuval.className = 'uy-zemin';
  tuval.setAttribute('aria-hidden', 'true');
  document.body.prepend(tuval);
  const N = window.innerWidth < 700 ? 800 : 1300;
  const P = [], base = [];
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = Math.random();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    base.push([Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph)]);
    P.push({ th, ph, r: 0.7 + Math.random() * 0.35, sp: 0.2 + Math.random() * 0.8, o: Math.random() * 6.283, sm: 0.3 + Math.random() * Math.random() * 1.4 });
  }
  // ~%9 yazı işareti, kalanların ~%4'ü çizgi simgesi, 8 yerde DartX
  const YAZI = [...ISARETLER, MARKA[0]];
  const isaret = new Int16Array(N).fill(-1);
  for (let i = 0; i < N; i++) {
    if (Math.random() < 0.09) isaret[i] = Math.floor(Math.random() * (YAZI.length - 1));
    else if (Math.random() < 0.04) isaret[i] = -2 - Math.floor(Math.random() * IKONLAR.length);
  }
  for (let k = 0; k < 8; k++) isaret[Math.floor((k + Math.random()) * (N / 8))] = YAZI.length - 1;
  const yollar = IKONLAR.map(d => new Path2D(d));
  const pairs = [];
  for (let i = 0; i < N; i++) {
    let nb = -1, nd = 1e9;
    for (let j = i + 1; j < N; j++) {
      const dx = base[i][0] - base[j][0], dy = base[i][1] - base[j][1], dz = base[i][2] - base[j][2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < 0.03 && d < nd) { nd = d; nb = j; }
    }
    if (nb >= 0) pairs.push([i, nb]);
  }
  veri = { N, P, isaret, YAZI, yollar, pairs, px: new Float32Array(N), py: new Float32Array(N), pd: new Float32Array(N), t0: performance.now(), cur: 0 };
}

function boyut() {
  if (!tuval) return;
  const DPR = Math.min(window.devicePixelRatio || 1, 2), r = tuval.getBoundingClientRect();
  tuval.width = Math.max(1, r.width * DPR); tuval.height = Math.max(1, r.height * DPR);
}

function kare(now) {
  if (!calisiyor) return;
  const ctx = tuval.getContext('2d'); const { N, P, isaret, YAZI, yollar, pairs, px, py, pd } = veri;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const t = (now - veri.t0) / 1000, W = tuval.width, H = tuval.height;
  const koyu = document.documentElement.dataset.tema !== 'acik';
  const bc = koyu ? '233,233,236' : '38,32,26', subtle = koyu ? 1 : 1.9;
  veri.cur += (0.85 - veri.cur) * 0.03; // yavaşça belirir
  const yumusak = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.62;
  const rY = t * 0.13, rX = Math.sin(t * 0.09) * 0.3;
  const cyy = Math.cos(rY), syy = Math.sin(rY), cxx = Math.cos(rX), sxx = Math.sin(rX);
  for (let i = 0; i < N; i++) {
    const p = P[i], st = Math.sin(p.ph), rr = p.r * (1 + 0.05 * Math.sin(t * p.sp + p.o));
    const x = st * Math.cos(p.th) * rr, y = st * Math.sin(p.th) * rr, z = Math.cos(p.ph) * rr;
    const x1 = x * cyy + z * syy, z1 = -x * syy + z * cyy, y1 = y * cxx - z1 * sxx, z2 = y * sxx + z1 * cxx, pe = 1 / (1.7 - z2 * 0.6);
    px[i] = cx + x1 * R * pe; py[i] = cy + y1 * R * pe; pd[i] = (z2 + 1) / 2;
  }
  // ortadaki kartın üstünde işaretler soluklaşır
  const sessizlik = (x, y) => { const ex = (x - cx) / (300 * DPR), ey = (y - cy) / (330 * DPR); return yumusak(0.75, 1.25, Math.sqrt(ex * ex + ey * ey)); };
  const kat = veri.cur;
  ctx.globalCompositeOperation = koyu ? 'lighter' : 'source-over';
  ctx.lineWidth = DPR * 0.5;
  for (let k = 0; k < pairs.length; k++) {
    const a = pairs[k][0], b = pairs[k][1], dep = (pd[a] + pd[b]) / 2;
    ctx.strokeStyle = `rgba(${bc},${(0.015 + dep * 0.05) * subtle * kat})`;
    ctx.beginPath(); ctx.moveTo(px[a], py[a]); ctx.lineTo(px[b], py[b]); ctx.stroke();
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    const dep = pd[i], s = isaret[i];
    if (s === -1) {
      ctx.fillStyle = `rgba(${bc},${(0.05 + dep * 0.42) * subtle * kat})`;
      ctx.beginPath(); ctx.arc(px[i], py[i], Math.max(0.01, (0.3 + dep * 1.3) * P[i].sm * DPR), 0, 6.283); ctx.fill(); continue;
    }
    const al = (0.12 + dep * 0.38) * subtle * sessizlik(px[i], py[i]) * kat;
    if (al < 0.01) continue;
    if (s >= 0) {
      ctx.fillStyle = `rgba(${bc},${al})`;
      ctx.font = Math.round((8 + dep * 4) * DPR) + 'px ui-monospace, "SF Mono", Consolas, monospace';
      ctx.fillText(YAZI[s], px[i], py[i]);
    } else {
      const sc = (0.32 + dep * 0.22) * DPR;
      ctx.save(); ctx.translate(px[i] - 12 * sc, py[i] - 12 * sc); ctx.scale(sc, sc);
      ctx.strokeStyle = `rgba(${bc},${al})`; ctx.lineWidth = (0.7 * DPR) / sc; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.stroke(yollar[-2 - s]); ctx.restore();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  raf = requestAnimationFrame(kare);
}

/** Giriş ekranındaysak küre döner, değilsek durur ve gizlenir */
export function zeminKontrol(acik) {
  if (acik === calisiyor) return;
  calisiyor = acik;
  if (acik) {
    if (!tuval) { kur(); window.addEventListener('resize', boyut); }
    tuval.hidden = false; boyut(); veri.cur = 0;
    raf = requestAnimationFrame(kare);
  } else if (tuval) { cancelAnimationFrame(raf); tuval.hidden = true; }
}
