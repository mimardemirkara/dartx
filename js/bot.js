// DartX — DartBot (Demir 10.11): çevrimdışı bilgisayar oyuncusu.
// Gerçek tahta ölçüleriyle (mm) atış: nişan noktasının çevresine seviyeye göre normal dağılımlı sapma.
// Seviye düştükçe sapma büyür: Kolay çoğu oku hedefin dışına, komşu dilimlere, hatta tahta dışına atar.
// Hedef: oyunun önerdiği ok (X01'de bitiriş yolu, kriket/antrenmanlarda açık hedef); yoksa T20.

// sapma: mm cinsinden standart sapma (her eksende); ort: T20'ye nişanla yaklaşık 3 ok ortalaması
export const BOT_SEVIYE = {
  kolay: { ad: 'Kolay', ort: 30, sapma: 42 },
  orta: { ad: 'Orta', ort: 45, sapma: 25 },
  zor: { ad: 'Zor', ort: 70, sapma: 14 },
  usta: { ad: 'Usta', ort: 90, sapma: 9.5 },
};

// Tahtadaki sayı sırası (saat yönü, tepe 20) ve halka yarıçapları (mm, resmi ölçü)
const TAHTA = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const R = { bull: 6.35, dbull: 15.9, t1: 99, t2: 107, d1: 162, d2: 170 };

// standart normal (Box–Muller)
function normal() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/** Hedefin tahtadaki nişan noktası (x sağ, y yukarı, mm) */
function nisan(n, m) {
  if (n === 25) return [0, 0];
  const i = TAHTA.indexOf(n); if (i < 0) return [0, 0];
  const r = m === 3 ? (R.t1 + R.t2) / 2 : m === 2 ? (R.d1 + R.d2) / 2 : (R.t2 + R.d1) / 2; // tekli: büyük tek alanın ortası
  const a = (90 - i * 18) * Math.PI / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

/** Tahtadaki noktanın değeri */
function nokta(x, y) {
  const r = Math.hypot(x, y);
  if (r <= R.bull) return { n: 25, m: 2 };
  if (r <= R.dbull) return { n: 25, m: 1 };
  if (r > R.d2) return { n: 0, m: 1 }; // tahta dışı: ıska
  let derece = 90 - Math.atan2(y, x) * 180 / Math.PI; // tepe 0, saat yönü artar
  const i = ((Math.round(derece / 18) % 20) + 20) % 20;
  const n = TAHTA[i];
  const m = r >= R.d1 ? 2 : (r >= R.t1 && r <= R.t2) ? 3 : 1;
  return { n, m };
}

/** Hedefe nişan alıp seviyeye göre bir ok üret */
export function botAt(hedef, seviye = 'orta') {
  const s = (BOT_SEVIYE[seviye] || BOT_SEVIYE.orta).sapma;
  if (!hedef || !hedef.n) hedef = { n: 20, m: 3 };
  const [x, y] = nisan(hedef.n, hedef.m || 1);
  return nokta(x + normal() * s, y + normal() * s);
}

/** Oyun ve durum için nişan noktası */
export function botHedef(g, m, seviye) {
  let h = null;
  try { const l = g.highlight ? g.highlight(m, m.g) : []; h = l && l[0]; } catch (e) { h = null; }
  // zayıf bot triple'a değil büyük tekliye nişan alır (gerçek oyuncular gibi)
  const zayif = seviye === 'kolay';
  if (!h) return { n: 20, m: zayif ? 1 : 3 };
  if (h.m) return h;
  // kriket gibi oyunlarda yalnız sayı gelir: güçlü bot triple'a, zayıf bot tekliye nişan alır (Bull'da tek)
  return h.n === 25 ? { n: 25, m: 1 } : { n: h.n, m: zayif ? 1 : 3 };
}
