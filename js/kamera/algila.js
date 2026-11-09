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


/** @param o { kaynak, w, h, kal, okBulundu(nokta, puan, kutu), yeniEl(), bilgi(metin) } */
export function algilayici(o) {
  const kucuk = document.createElement('canvas'), kc = kucuk.getContext('2d', { willReadFrequently: true });
  const kh = Math.round(KW * o.h / o.w), N = KW * kh, olc = o.w / KW;
  kucuk.width = KW; kucuk.height = kh;
  kc.imageSmoothingEnabled = true; kc.imageSmoothingQuality = 'high'; // küçültürken ortalama: kamera kumlanması yumuşar
  // maske: tahta + çevresi (kanatçık tahtanın dışına taşabilir)
  const maske = new Uint8Array(N); let maskeSay = 0;
  for (let y = 0; y < kh; y++) for (let x = 0; x < KW; x++) {
    const t = uygula(o.kal.G2T, (x + .5) * olc, (y + .5) * olc);
    if (Math.hypot(t.x, t.y) <= HALKA.dDis + 70) { maske[y * KW + x] = 1; maskeSay++; }
  }
  let ref = null, bosRef = null, once = null, sabit = 0, zaman = null, okSay = 0;

  // Gerçek kamerada (Demir 10.11 simülasyonu): parlaklık kendiliğinden kayar, tripod piksel altı titrer.
  // · ofset: iki kare arasındaki genel renk kayması (kanal başına ortalama) çıkarılır
  // · fark: piksel, karşılaştırılan karede KENDİSİ ve 8 KOMŞUSUNUN en yakını ile kıyaslanır → ≤1 piksellik kayma fark sayılmaz,
  //   ince ok (komşuları da tahta) yine fark sayılır
  function ofset(a, b) {
    let r = 0, y = 0, m = 0, n = 0;
    for (let j = 0; j < N; j += 5) if (maske[j]) { const i = j * 4; r += a[i] - b[i]; y += a[i + 1] - b[i + 1]; m += a[i + 2] - b[i + 2]; n++; }
    return n ? [r / n, y / n, m / n] : [0, 0, 0];
  }
  function fark(a, b, j, o) {
    const x = j % KW, y = (j / KW) | 0, i = j * 4;
    const r = a[i] - o[0], g = a[i + 1] - o[1], m = a[i + 2] - o[2];
    let en = 1e9;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy; if (ny < 0 || ny >= kh) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx; if (nx < 0 || nx >= KW) continue;
        const k = (ny * KW + nx) * 4, d = Math.abs(r - b[k]) + Math.abs(g - b[k + 1]) + Math.abs(m - b[k + 2]);
        if (d < en) { en = d; if (en <= RENK_ESIK) return en; }
      }
    }
    return en;
  }

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
    let hareket = 0, fk = 0, bosFark = 0;
    const oO = ofset(g.c, once.c), oR = ofset(g.c, ref.c), oB = okSay ? ofset(g.c, bosRef.c) : null;
    for (let i = 0; i < N; i++) {
      if (!maske[i]) continue;
      if (fark(g.c, once.c, i, oO) > RENK_ESIK + 15) hareket++;
      if (fark(g.c, ref.c, i, oR) > RENK_ESIK) fk++;
      if (oB && fark(g.c, bosRef.c, i, oB) > RENK_ESIK) bosFark++;
    }
    once = g;
    if (o.iz) o.iz({ hareket, fk, oran: fk / maskeSay, sabit, oO, oR });
    if (hareket > HAREKET_ESIK) { sabit = 0; return; }
    if (++sabit !== 3) return; // ~0,4 sn kıpırtısız kalınca bir kez karar ver
    const oran = fk / maskeSay;
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
    const b = new Uint8Array(N), oR = ofset(g.c, ref.c), c = g.c, rc = ref.c;
    // gölge sayılmaz: üç kanal da aynı oranda kararmış (renk tonu aynı) piksel okun gölgesidir
    const golge = i => { const k = i * 4, r0 = rc[k] + 8, g0 = rc[k + 1] + 8, b0 = rc[k + 2] + 8;
      const a = (c[k] + 8) / r0, e = (c[k + 1] + 8) / g0, f = (c[k + 2] + 8) / b0;
      return a < .88 && e < .88 && f < .88 && Math.max(a, e, f) - Math.min(a, e, f) < .14; };
    for (let i = 0; i < N; i++) if (maske[i] && fark(g.c, ref.c, i, oR) > RENK_ESIK && !golge(i)) b[i] = 1;
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
    // uç tarafı hafif (ince gövde), kanatçık tarafı ağır: eksenin iki yarısındaki piksel sayısı
    const orta = pr[0].t + boy / 2, bas = pr.filter(p => p.t < orta).length, son = n - bas;
    const k = Math.max(2, Math.round(n * .03));
    // uç seçimi: iki uçtan yalnız biri tahtanın içindeyse uç odur (kanatçık çoğu zaman dışarı taşar); yoksa İNCE olan uç
    const ort = l => ({ x: (l.reduce((s, p) => s + p.x, 0) / l.length + .5) * olc, y: (l.reduce((s, p) => s + p.y, 0) / l.length + .5) * olc });
    const yaricap = q => { const t = uygula(o.kal.G2T, q.x, q.y); return Math.hypot(t.x, t.y); };
    const rBas = yaricap(ort(pr.slice(0, k))), rSon = yaricap(ort(pr.slice(-k))), ICERI = HALKA.dDis + 4;
    const basSec = (rBas <= ICERI) !== (rSon <= ICERI) ? rBas <= ICERI : bas <= son;
    const uc = basSec ? pr.slice(0, k) : pr.slice(-k);
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
