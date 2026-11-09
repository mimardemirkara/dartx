// DartX kamera (deneme) — tahta geometrisi, kalibrasyon (homografi) ve puan hesabı
// Tahta koordinatı: mm, merkez (0,0), x sağa, y yukarı. Standart çelik uçlu tahta ölçüleri.

export const HALKA = { dbull: 6.35, bull: 15.9, tIc: 99, tDis: 107, dIc: 162, dDis: 170 };
// Saat yönünde, tepeden başlayarak dilimler
export const DILIM = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

// Kalibrasyon noktaları (Demir 10.11, DeepDarts gibi): iki dilim arasındaki TELİN double halkasının DIŞ çizgisiyle kesiştiği yer
// — görüntüde net bir nokta, dokunması ve oturtması kolay. 5|20 (99°), 13|6 (9°), 17|3 (279°), 8|11 (189°)
const kes = (ad, aci) => ({ ad, x: HALKA.dDis * Math.cos(aci * Math.PI / 180), y: HALKA.dDis * Math.sin(aci * Math.PI / 180) });
export const AYAR_NOKTALARI = [kes('5|20', 99), kes('13|6', 9), kes('17|3', 279), kes('8|11', 189)];
// Ana yönler (kalıp ve açı ölçüsü için): 20 üst, 6 sağ, 3 alt, 11 sol
export const ANA_YONLER = [{ x: 0, y: HALKA.dDis }, { x: HALKA.dDis, y: 0 }, { x: 0, y: -HALKA.dDis }, { x: -HALKA.dDis, y: 0 }];

/** Tahtadaki bir noktanın puanı: { n, m, ad } — m: 0 ıska, 1 tek, 2 double, 3 triple */
export function puan(x, y) {
  const r = Math.hypot(x, y);
  if (r <= HALKA.dbull) return { n: 25, m: 2, ad: 'D-Bull' };
  if (r <= HALKA.bull) return { n: 25, m: 1, ad: 'Bull' };
  if (r > HALKA.dDis) return { n: 0, m: 0, ad: 'Iska' };
  const aci = Math.atan2(y, x) * 180 / Math.PI; // 90 = tepe
  const i = Math.floor((((90 - aci) + 9) % 360 + 360) % 360 / 18);
  const n = DILIM[i];
  if (r >= HALKA.dIc) return { n, m: 2, ad: 'D' + n };
  if (r >= HALKA.tIc && r <= HALKA.tDis) return { n, m: 3, ad: 'T' + n };
  return { n, m: 1, ad: String(n) };
}

/** 4 nokta çiftinden homografi (kaynak → hedef). 3x3 dizi (satır sırasıyla 9 eleman) döner */
export function homografi(kaynak, hedef) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = kaynak[i], { x: u, y: v } = hedef[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = coz(A, b);
  return h ? [...h, 1] : null;
}

function coz(A, b) { // Gauss eleme (kısmi pivot)
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}

export function uygula(H, x, y) {
  const w = H[6] * x + H[7] * y + H[8];
  return { x: (H[0] * x + H[1] * y + H[2]) / w, y: (H[3] * x + H[4] * y + H[5]) / w };
}

export function ters(H) {
  const [a, b, c, d, e, f, g, h, i] = H;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map(v => v / det);
}

/** Kalibrasyon: görüntüdeki 4 nokta (AYAR_NOKTALARI sırasıyla) → { tahtadanGoruntuye, goruntudenTahtaya } */
export function kalibre(goruntuNoktalari) {
  const T2G = homografi(AYAR_NOKTALARI, goruntuNoktalari);
  if (!T2G) return null;
  const G2T = ters(T2G);
  return G2T ? { T2G, G2T } : null;
}
