// DartX kamera — ok algılama (görüntü farkı). Hem kamera sayfası hem oyun ekranı kullanır.
// Kaynak (video) küçük çözünürlükte izlenir; görüntü ~0,5 sn kıpırtısız kalınca karar verilir:
//  · küçük değişiklik = yeni ok → ucu bulunur, okBulundu(nokta) çağrılır
//  · tahta elin başındaki boş haline döndü = oklar çekildi → yeniEl()
//  · büyük değişiklik (biri önde durdu, ışık değişti) = yeni boş tahta kabul edilir
import { HALKA, puan, uygula } from './tahta.js';

const KW = 480;          // izleme genişliği (piksel)
const RENK_ESIK = 40;    // |ΔR|+|ΔG|+|ΔB| — gümüş gövde krem dilimde griyle seçilmez, renkle seçilir
const HAREKET_ESIK = 6;  // kare arası oynayan piksel: ince bir ok bile bunu geçer
const AZ = 0.0008, COK = 0.06;

const renkFark = (a, b, j) => { const i = j * 4; return Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); };

/** @param o { kaynak, w, h, kal, okBulundu(nokta, puan, kutu), yeniEl(), bilgi(metin) } */
export function algilayici(o) {
  const kucuk = document.createElement('canvas'), kc = kucuk.getContext('2d', { willReadFrequently: true });
  const kh = Math.round(KW * o.h / o.w), N = KW * kh, olc = o.w / KW;
  kucuk.width = KW; kucuk.height = kh;
  // maske: tahta + çevresi (kanatçık tahtanın dışına taşabilir)
  const maske = new Uint8Array(N); let maskeSay = 0;
  for (let y = 0; y < kh; y++) for (let x = 0; x < KW; x++) {
    const t = uygula(o.kal.G2T, (x + .5) * olc, (y + .5) * olc);
    if (Math.hypot(t.x, t.y) <= HALKA.dDis + 70) { maske[y * KW + x] = 1; maskeSay++; }
  }
  let ref = null, bosRef = null, once = null, sabit = 0, zaman = null, okSay = 0;

  function kare() {
    kc.drawImage(o.kaynak, 0, 0, KW, kh);
    const d = kc.getImageData(0, 0, KW, kh).data, g = new Uint8Array(N);
    for (let i = 0, j = 0; j < N; i += 4, j++) g[j] = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8;
    return { g, c: d };
  }

  function adim() {
    if (!o.kaynak.videoWidth && o.kaynak.tagName === 'VIDEO') return;
    const g = kare();
    if (!ref) { ref = once = bosRef = g; return; }
    let hareket = 0, fark = 0, bosFark = 0;
    for (let i = 0; i < N; i++) {
      if (!maske[i]) continue;
      if (Math.abs(g.g[i] - once.g[i]) > 25) hareket++;
      if (renkFark(g.c, ref.c, i) > RENK_ESIK) fark++;
      if (okSay && renkFark(g.c, bosRef.c, i) > RENK_ESIK) bosFark++;
    }
    once = g;
    if (hareket > HAREKET_ESIK) { sabit = 0; return; }
    if (++sabit !== 4) return; // ~0,5 sn kıpırtısız kalınca bir kez karar ver
    const oran = fark / maskeSay;
    if (okSay && oran >= AZ && bosFark / maskeSay < AZ) { ref = bosRef = g; okSay = 0; o.yeniEl && o.yeniEl(); return; } // oklar çekildi
    if (oran < AZ) { ref = g; if (!okSay) bosRef = g; return; } // değişiklik yok (ışık kaymasını da sıfırlar)
    if (oran > COK) { ref = bosRef = g; if (okSay) { okSay = 0; o.yeniEl && o.yeniEl(); } return; }
    const u = ucBul(g);
    ref = g;
    if (!u) return;
    okSay++;
    const t = uygula(o.kal.G2T, u.x, u.y);
    o.okBulundu(u, puan(t.x, t.y), u.kutu, okSay);
  }

  /** Farktaki parçalar (gövde + kanatçık) birlikte; ana eksen boyunca İNCE olan uç = sivri uç */
  function ucBul(g) {
    const b = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (maske[i] && renkFark(g.c, ref.c, i) > RENK_ESIK) b[i] = 1;
    const etiket = new Uint8Array(N), yigin = [], tum = [];
    for (let i = 0; i < N; i++) {
      if (!b[i] || etiket[i]) continue;
      const parca = []; etiket[i] = 1; yigin.push(i);
      while (yigin.length) {
        const j = yigin.pop(); parca.push(j);
        const x = j % KW, y = (j / KW) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= KW || ny >= kh) continue;
          const k = ny * KW + nx; if (b[k] && !etiket[k]) { etiket[k] = 1; yigin.push(k); }
        }
      }
      if (parca.length >= 4) for (const j of parca) tum.push(j); // kırıntılar atılır
    }
    if (tum.length < 12) return null;
    let mx = 0, my = 0;
    for (const j of tum) { mx += j % KW; my += (j / KW) | 0; }
    mx /= tum.length; my /= tum.length;
    let sxx = 0, syy = 0, sxy = 0;
    for (const j of tum) { const dx = j % KW - mx, dy = ((j / KW) | 0) - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    const a = 0.5 * Math.atan2(2 * sxy, sxx - syy), ex = Math.cos(a), ey = Math.sin(a);
    const pr = tum.map(j => { const x = j % KW, y = (j / KW) | 0; return { x, y, t: (x - mx) * ex + (y - my) * ey }; }).sort((p, q) => p.t - q.t);
    const n = pr.length, boy = pr[n - 1].t - pr[0].t || 1;
    const bas = pr.filter(p => p.t < pr[0].t + boy * .2).length, son = pr.filter(p => p.t > pr[n - 1].t - boy * .2).length;
    const k = Math.max(2, Math.round(n * .03));
    const uc = bas <= son ? pr.slice(0, k) : pr.slice(-k);
    const x = uc.reduce((s, p) => s + p.x, 0) / uc.length, y = uc.reduce((s, p) => s + p.y, 0) / uc.length;
    let x0 = KW, y0 = kh, x1 = 0, y1 = 0;
    for (const p of pr) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    return { x: (x + .5) * olc, y: (y + .5) * olc, kutu: { x: x0 * olc, y: y0 * olc, w: (x1 - x0 + 1) * olc, h: (y1 - y0 + 1) * olc } };
  }

  return {
    baslat() { clearInterval(zaman); ref = null; okSay = 0; sabit = 0; zaman = setInterval(adim, 120); },
    durdur() { clearInterval(zaman); zaman = null; },
    yeniEl() { ref = bosRef = null; okSay = 0; }, // dışarıdan: tahta boş say
    get okSay() { return okSay; },
  };
}

// ---------- kalibrasyon kaydı (cihaz başına) ----------
const ANAHTAR = 'dartx.kamera.v1';
export function ayarOku(w, h) {
  try { const k = JSON.parse(localStorage.getItem(ANAHTAR) || 'null'); if (k && k.noktalar && k.noktalar.length === 4 && (!w || (k.w === w && k.h === h))) return k; } catch (e) { /* yok say */ }
  return null;
}
export function ayarYaz(w, h, noktalar) { localStorage.setItem(ANAHTAR, JSON.stringify({ w, h, noktalar })); }

// ---------- arka kamerayı aç ----------
export async function kameraAc(yon = 'environment') {
  const akis = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: yon }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
  const v = document.createElement('video');
  v.playsInline = true; v.muted = true; v.setAttribute('playsinline', ''); v.srcObject = akis;
  v.play().catch(() => {});
  if (!v.videoWidth) await new Promise(r => { v.onloadedmetadata = r; });
  return v;
}
export function kameraKapat(v) { try { v.srcObject && v.srcObject.getTracks().forEach(t => t.stop()); } catch (e) { /* yok say */ } }
