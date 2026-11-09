// DartX — DartBot (Demir 10.11): çevrimdışı bilgisayar oyuncusu. Seviyesine göre gerçekçi dağılımla ok atar.
// Hedef: oyunun önerdiği ok (X01'de bitiriş yolu, kriket/antrenmanlarda açık hedef); yoksa T20.
// Sapma modeli: isabet olasılığı seviyeye göre; ıskalarsa komşu dilime ya da bir alt halkaya kayar.

export const BOT_SEVIYE = {
  kolay: { ad: 'Kolay', ort: 35, isabet: { t: 0.08, d: 0.10, s: 0.55, b: 0.06 } },
  orta: { ad: 'Orta', ort: 55, isabet: { t: 0.22, d: 0.22, s: 0.75, b: 0.14 } },
  zor: { ad: 'Zor', ort: 75, isabet: { t: 0.40, d: 0.36, s: 0.88, b: 0.28 } },
  usta: { ad: 'Usta', ort: 95, isabet: { t: 0.58, d: 0.48, s: 0.95, b: 0.42 } },
};

// Tahtadaki sayı sırası (saat yönü, tepe 20)
const TAHTA = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const komsu = n => { const i = TAHTA.indexOf(n); return TAHTA[(i + (Math.random() < 0.5 ? 1 : -1) + 20) % 20]; };

/** Hedefe nişan alıp seviyeye göre bir ok üret */
export function botAt(hedef, seviye = 'orta') {
  const S = (BOT_SEVIYE[seviye] || BOT_SEVIYE.orta).isabet;
  const r = Math.random();
  if (!hedef || !hedef.n) hedef = { n: 20, m: 3 };
  const n = hedef.n, m = hedef.m || 1;
  if (n === 25) {
    if (r < S.b) return { n: 25, m: m === 2 ? 2 : 1 };
    if (r < S.b * 2.6) return { n: 25, m: 1 };
    return Math.random() < 0.85 ? { n: 1 + Math.floor(Math.random() * 20), m: 1 } : { n: 0, m: 1 };
  }
  const p = m === 3 ? S.t : m === 2 ? S.d : S.s;
  if (r < p) return { n, m };
  const r2 = Math.random();
  if (m === 2) { // double ıskası: çoğu dışarı (ıska) ya da aynı sayının teklisi
    if (r2 < 0.45) return { n: 0, m: 1 };
    if (r2 < 0.85) return { n, m: 1 };
    return { n: komsu(n), m: r2 < 0.93 ? 1 : 2 };
  }
  if (m === 3) { // triple ıskası: çoğu aynı sayının teklisi, bazen komşu
    if (r2 < 0.62) return { n, m: 1 };
    if (r2 < 0.9) return { n: komsu(n), m: 1 };
    return { n: komsu(n), m: 3 };
  }
  // tekli ıskası
  if (r2 < 0.75) return { n: komsu(n), m: 1 };
  if (r2 < 0.9) return { n, m: Math.random() < 0.5 ? 3 : 2 };
  return { n: 0, m: 1 };
}

/** Oyun ve durum için nişan noktası */
export function botHedef(g, m) {
  let h = null;
  try { const l = g.highlight ? g.highlight(m, m.g) : []; h = l && l[0]; } catch (e) { h = null; }
  if (!h) return { n: 20, m: 3 };
  if (h.m) return h;
  // kriket gibi oyunlarda yalnız sayı gelir: triple'a nişan al (Bull'da tek)
  return h.n === 25 ? { n: 25, m: 1 } : { n: h.n, m: 3 };
}
