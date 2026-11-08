// DartX — Dartın tarihi (Demir 09.11: "geçmişten bugüne bir tarih animasyonu"). Motor: nasil.js (tarih türü)
// Kesin bilinmeyen, rivayet olarak anlatılan olaylar metinde öyle belirtilir ("anlatılır", "rivayete göre").
import { dil } from './i18n.js';

const Y = (tr, en) => (dil() !== 'en' ? tr : en);
// Sahne 160×120: komik karakterler + dönemin nesnesi (Demir 09.11: "anlatımın olduğu yerlere göre karakterler ekle, komik olsun")
const S = (ic) => `<svg viewBox="0 0 160 120" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic}</svg>`;
const ALTIN = '#e3b866', KREM = '#f4ead2', KOYU = '#2a2118', TEN = '#f2c9a0', TEN2 = '#d9a77c';

// Çizgi film kişi: (x, y) ayak hizası. sapka: migfer | peruk | kep | tac | sac | yok. kol: at (ok atar) | yukari (sevinç) | tokmak | gazete | normal
function kisi({ x, y, s = 1, renk = '#c8102e', sapka = 'sac', kol = 'normal', yuz = 'gul', cls = '' }) {
  const bas = { migfer: `<path d="M-9 -47 A9 9 0 0 1 9 -47 V-44 H-9 Z" fill="#9aa3ad" stroke="${KOYU}" stroke-width="1"/><path d="M0 -56 V-52" stroke="#c8102e" stroke-width="2.4"/>`,
    peruk: `<path d="M-9.5 -44 C-10 -55 10 -55 9.5 -44 C6 -49 -6 -49 -9.5 -44 Z" fill="#f5f5f0" stroke="#cfcfc6" stroke-width=".8"/>${[-40, -35, -30].map(y => `<circle cx="-10.5" cy="${y}" r="3.2" fill="#f5f5f0" stroke="#cfcfc6" stroke-width=".6"/><circle cx="10.5" cy="${y}" r="3.2" fill="#f5f5f0" stroke="#cfcfc6" stroke-width=".6"/>`).join('')}`,
    kep: `<path d="M-9 -46 A9 7 0 0 1 9 -46 Z" fill="#3b4a6b"/><path d="M4 -46 H13" stroke="#3b4a6b" stroke-width="2.4"/>`,
    tac: `<path d="M-8 -48 L-8 -56 L-4 -51 L0 -58 L4 -51 L8 -56 L8 -48 Z" fill="${ALTIN}" stroke="${KOYU}" stroke-width=".8"/>`,
    sac: `<path d="M-8.5 -45 C-8 -53 8 -53 8.5 -45 C5 -48 -5 -48 -8.5 -45 Z" fill="#4a3220"/>`, yok: '' }[sapka] || '';
  const goz = yuz === 'saskin' ? `<circle cx="-3" cy="-41" r="1.6" fill="${KOYU}"/><circle cx="3" cy="-41" r="1.6" fill="${KOYU}"/><circle cx="0" cy="-36" r="1.8" fill="${KOYU}"/>`
    : `<circle cx="-3" cy="-41" r="1.2" fill="${KOYU}"/><circle cx="3" cy="-41" r="1.2" fill="${KOYU}"/><path d="M-3 -37 Q0 -34.5 3 -37" stroke="${KOYU}" stroke-width="1.1"/>`;
  const kollar = {
    at: `<g class="tr-kol-at" style="transform-origin:5px -27px"><path d="M5 -27 L15 -35" stroke="${TEN2}" stroke-width="3.2"/><path d="M15 -35 L21 -40" stroke="${KREM}" stroke-width="1.4"/></g><path d="M-5 -27 L-11 -18" stroke="${TEN2}" stroke-width="3.2"/>`,
    yukari: `<g class="tr-kol-sev"><path d="M5 -27 L12 -40" stroke="${TEN2}" stroke-width="3.2"/><path d="M-5 -27 L-12 -40" stroke="${TEN2}" stroke-width="3.2"/></g>`,
    tokmak: `<g class="tr-kol-tokmak" style="transform-origin:5px -27px"><path d="M5 -27 L15 -33" stroke="${TEN2}" stroke-width="3.2"/><rect x="12" y="-42" width="10" height="6" rx="2" transform="rotate(-20 17 -39)" fill="#8a5a2b"/><path d="M15 -33 L17 -39" stroke="#8a5a2b" stroke-width="1.6"/></g><path d="M-5 -27 L-11 -18" stroke="${TEN2}" stroke-width="3.2"/>`,
    gazete: `<g class="tr-kol-sev"><path d="M5 -27 L13 -38" stroke="${TEN2}" stroke-width="3.2"/><rect x="10" y="-52" width="14" height="16" rx="1" fill="${KREM}" stroke="${KOYU}" stroke-width=".8"/><path d="M12 -48 H22 M12 -45 H20 M12 -42 H22" stroke="${KOYU}" stroke-width=".9"/></g><path d="M-5 -27 L-11 -18" stroke="${TEN2}" stroke-width="3.2"/>`,
    normal: `<path d="M5 -27 L11 -18" stroke="${TEN2}" stroke-width="3.2"/><path d="M-5 -27 L-11 -18" stroke="${TEN2}" stroke-width="3.2"/>`,
  }[kol];
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="tr-kisi ${cls}">
    <path d="M-4 -8 L-5 0 M4 -8 L5 0" stroke="${KOYU}" stroke-width="3"/>
    <path d="M-8 -29 C-8 -32 8 -32 8 -29 L7 -8 H-7 Z" fill="${renk}" stroke="${KOYU}" stroke-width="1"/>
    ${kollar}
    <circle cx="0" cy="-40" r="8.5" fill="${TEN}" stroke="${KOYU}" stroke-width="1"/>${goz}${bas}
  </g></g>`;
}
// Demir ve Kenan'ın çizgi film hâlleri (Demir 09.11, fotoğraflarından). Baş (0,-41) merkezli; yuz() yalnız başı çizer (avatar için de kullanılır).
const DERI = '#f0c8a0';
export function yuz(kim) {
  if (kim === 'Demir') return `
    <circle cx="0" cy="-41" r="8.6" fill="${DERI}" stroke="${KOYU}" stroke-width="1"/>
    <path d="M-8 -40 C-8 -33.5 -4.2 -31.2 0 -31.2 C4.2 -31.2 8 -33.5 8 -40 C7 -37.6 5.2 -35.4 3.6 -35.2 Q0 -33.6 -3.6 -35.2 C-5.2 -35.4 -7 -37.6 -8 -40 Z" fill="#3b302a"/>
    <path d="M-2.9 -36.1 Q0 -33.3 2.9 -36.1 Z" fill="#fff" stroke="#5a2a1e" stroke-width=".6"/>
    <path d="M-3.4 -37 Q0 -38.1 3.4 -37" stroke="#3b302a" stroke-width="1.1" fill="none"/>
    <path d="M-4 -41.2 Q-3 -42.6 -2 -41.2 M2 -41.2 Q3 -42.6 4 -41.2" stroke="${KOYU}" stroke-width="1.15" fill="none"/>
    <path d="M-5 -44.4 L-1.6 -44.8 M1.6 -44.8 L5 -44.4" stroke="#2a221c" stroke-width="1.1"/>
    <path d="M-8.4 -42.5 C-9.4 -52 -3 -55.8 2 -54.6 C7.5 -53.6 10 -48.8 8.4 -42.5 C7.6 -46.4 4.6 -48.6 0 -48.4 C-4.2 -48.2 -7.2 -46.4 -8.4 -42.5 Z" fill="#2b2420"/>
    <path d="M-8 -44 C-8.3 -42 -8.1 -40.4 -7.7 -39.6 M8 -44 C8.3 -42 8.1 -40.4 7.7 -39.6" stroke="#b3aea7" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M-2 -52.6 C1.5 -54.2 5 -53.2 7 -50.6" stroke="#5a4b42" stroke-width=".7" fill="none"/>`;
  return `
    <circle cx="0" cy="-41" r="8.6" fill="${DERI}" stroke="${KOYU}" stroke-width="1"/>
    <path d="M-8.2 -41 C-8 -33 -4.2 -30.6 0 -30.6 C4.2 -30.6 8 -33 8.2 -41 C7.2 -38.4 5.6 -36.6 4 -36.4 Q0 -35 -4 -36.4 C-5.6 -36.6 -7.2 -38.4 -8.2 -41 Z" fill="#33302d"/>
    ${[[-5, -34], [-2, -32.6], [2.4, -32.8], [5.2, -34.4], [-6.4, -37], [6.6, -37.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".28" fill="#7e7974"/>`).join('')}
    <path d="M-3.6 -36.4 Q0 -32.4 3.6 -36.4 Z" fill="#fff" stroke="#5a2a1e" stroke-width=".6"/>
    <path d="M-3.8 -37.3 Q0 -38.6 3.8 -37.3" stroke="#33302d" stroke-width="1.2" fill="none"/>
    <rect x="-7.4" y="-44.6" width="6.4" height="4.6" rx="2" fill="#5f6670" fill-opacity=".85" stroke="#c9b27a" stroke-width=".55"/>
    <rect x="1" y="-44.6" width="6.4" height="4.6" rx="2" fill="#5f6670" fill-opacity=".85" stroke="#c9b27a" stroke-width=".55"/>
    <path d="M-1 -43.4 Q0 -44.3 1 -43.4 M-7.4 -43.6 L-8.6 -44.4 M7.4 -43.6 L8.6 -44.4" stroke="#c9b27a" stroke-width=".6" fill="none"/>
    <path d="M-6.2 -44 L-4.6 -42.4 M2.2 -44 L3.8 -42.4" stroke="#fff" stroke-opacity=".55" stroke-width=".5"/>
    <path d="M-8.5 -43.6 C-9.6 -51.8 -4 -55.4 1 -54.6 C6.5 -54.2 10 -50.6 8.5 -43.6 C7.4 -47 5 -49 1 -49.4 C-1 -48 -3 -49.6 -5 -48.4 C-6.6 -47.6 -7.8 -46 -8.5 -43.6 Z" fill="#26211d"/>
    <path d="M-4.8 -52.2 L-3.2 -50.4 M-1.4 -53.8 L-0.4 -51.2 M2.4 -53.6 L2.6 -51" stroke="#3d342e" stroke-width=".8"/>`;
}
// Tam boy: Demir siyah takım elbise + kravat; Kenan siyah örgü kazak (polo yaka). İki kol havada, elinde kendi oku.
function karakter(kim, x, y, s = 1, cls = '') {
  const demir = kim === 'Demir';
  const govde = demir
    ? `<path d="M-9 -30 C-9 -33 9 -33 9 -30 L8 -8 H-8 Z" fill="#141414" stroke="${KOYU}" stroke-width="1"/>
       <path d="M-3 -31.5 L0 -24 L3 -31.5 Z" fill="#fff"/><path d="M-1 -30 L0 -19 L1 -30 Z" fill="#0d0d0d"/>
       <path d="M-3 -31.5 L-1 -22 M3 -31.5 L1 -22" stroke="#3a3a3a" stroke-width=".9"/><path d="M3.6 -26.6 h3" stroke="#fff" stroke-width="1.3"/>`
    : `<path d="M-9 -30 C-9 -33 9 -33 9 -30 L8 -8 H-8 Z" fill="#1d1d20" stroke="${KOYU}" stroke-width="1"/>
       <path d="M-7.6 -22 H7.6 M-7.6 -14 H7.6" stroke="#2a2a2f" stroke-width=".7" opacity=".7"/>
       <path d="M-4.4 -31.8 L0 -27.6 L4.4 -31.8 L2.8 -33 L0 -30.4 L-2.8 -33 Z" fill="#2c2c31" stroke="#0f0f11" stroke-width=".6"/>`;
  const kanat = demir ? '#2f8fe0' : '#16181b';
  const kol = demir ? '#141414' : '#1d1d20';
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="tr-kisi ${cls}">
    <path d="M-4.5 -9 L-5.5 0 M4.5 -9 L5.5 0" stroke="#111" stroke-width="3.4"/><path d="M-6.5 0 h5 M1.5 0 h5" stroke="#0b0b0b" stroke-width="2.2"/>
    ${govde}
    <g class="tr-kol-sev"><path d="M6 -28 L13 -41" stroke="${kol}" stroke-width="3.6"/><circle cx="13.5" cy="-42" r="1.9" fill="${DERI}"/>
      <path d="M-6 -28 L-13 -41" stroke="${kol}" stroke-width="3.6"/><circle cx="-13.5" cy="-42" r="1.9" fill="${DERI}"/>
      <g transform="translate(14 -44) rotate(-70)"><path d="M0 0 H9" stroke="#c9d1d9" stroke-width="1"/><path d="M9 -0.9 H15 V0.9 H9 Z" fill="${demir ? '#2b3036' : '#c9ced4'}"/>
        <path d="M15 0 L19 -3 L18 0 L19 3 Z" fill="${kanat}" stroke="${demir ? 'none' : '#8a8f96'}" stroke-width=".4"/></g></g>
    ${yuz(kim)}
  </g></g>`;
}
// Avatar: yalnız baş, küçük yuvarlak çerçeve içinde (oyun gösterimlerinin skor tablosunda)
// Avatar: ChatGPT ile üretilmiş 3D chibi portreler (Demir 09.11)
export const avatar = kim => `<img class="ns-avatar" src="img/karakter/${kim === 'Demir' ? 'demir' : 'kenan'}-avatar.webp" alt="" aria-hidden="true">`;
// Konuşma balonu (sonradan belirir)
const balon = (x, y, yazi, w = 56) => `<g class="tr-balon" style="transform-origin:${x}px ${y + 14}px"><rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="16" rx="8" fill="#fff"/><path d="M${x - 6} ${y + 6} L${x - 10} ${y + 12} L${x} ${y + 6}" fill="#fff"/>
  <text x="${x}" y="${y + 2}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7.4" font-weight="800" fill="${KOYU}">${yazi}</text></g>`;
// Uçan ok (Demir 09.11: "okların gidişini de göster"): elden çıkar, noktalı kavisli yoldan hedefe uçar, saplanır, titrer; döngüde tekrar eder
function ucanOk(x0, y0, x1, y1, gecikme = 0) {
  const aci = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 18; // kavis tepesi
  return `<path class="tr-iz" style="animation-delay:${gecikme}s" d="M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}" stroke="${KREM}" stroke-width="1.2" stroke-dasharray="2.5 3" opacity=".7"/>
  <g transform="translate(${x1} ${y1})"><g class="tr-ucan" style="--dx:${(x0 - x1).toFixed(1)}px;--dy:${(y0 - y1).toFixed(1)}px;animation-delay:${gecikme}s">
    <g transform="rotate(${aci.toFixed(1)})"><g class="tr-sap"><path d="M-20 0 H-1" stroke="#c8a072" stroke-width="1.8"/><path d="M0 0 L-5 -2.6 L-5 2.6 Z" fill="#c9d1d9"/>
    <path d="M-20 0 L-24 -4 L-17 0 L-24 4 Z" fill="#c8102e"/></g></g></g></g>`;
}
const tahtaMini = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1d1d1d" stroke="${ALTIN}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="${r * .62}" stroke="#1d9a4a" stroke-width="${r * .16}"/><circle cx="${cx}" cy="${cy}" r="${r * .2}" fill="#d8262c"/>`;
const minikOk = (x, y, aci = -35, cls = '') => `<g transform="translate(${x} ${y}) rotate(${aci})"><g class="${cls}"><path d="M0 0 L16 0" stroke="${KREM}" stroke-width="1.6"/><path d="M14 0 L19 -3 L18 0 L19 3 Z" fill="${ALTIN}"/></g></g>`;

const RESIM = {
  // Ortaçağ: iki sıkılmış asker fıçıya ok atıyor; "Bahse var mısın?"
  kutuk: S(`<g class="tr-don" style="transform-origin:112px 64px">
    <path d="M106 30 H140 A16 34 0 0 1 140 98 H106 Z" fill="#5a3b20" stroke="${KOYU}" stroke-width="2.4"/>
    <path d="M112 36 H138 M110 50 H142 M110 66 H143 M110 82 H142 M112 94 H138" stroke="#3e2914" stroke-width="1.2" opacity=".7"/>
    <ellipse cx="106" cy="64" rx="17" ry="34" fill="#8a6038" stroke="${KOYU}" stroke-width="2.4"/>
    ${[.78, .56, .35, .15].map(f => `<ellipse cx="106" cy="64" rx="${(17 * f).toFixed(1)}" ry="${(34 * f).toFixed(1)}" stroke="#c09060" stroke-width="1.6"/>`).join('')}
    <path d="M106 64 L95 42 M106 64 L114 92" stroke="${KOYU}" stroke-width="1.2" opacity=".55"/></g>
    ${kisi({ x: 30, y: 112, s: 1.15, renk: '#9b1c1c', sapka: 'migfer', kol: 'at' })}
    ${kisi({ x: 58, y: 114, s: .95, renk: '#6b7b3a', sapka: 'migfer', kol: 'normal', cls: 'tr-zipla' })}
    ${ucanOk(48, 70, 100, 56, .6)}${ucanOk(48, 70, 102, 74, 1.8)}${balon(52, 16, 'Bahse var mısın?', 68)}`),
  // 1896: marangoz sayıları diziyor
  dizilim: S(`<g transform="translate(20 0)"><circle cx="78" cy="56" r="42" stroke="${ALTIN}" stroke-width="2.4"/><circle cx="78" cy="56" r="28" stroke="${KREM}" stroke-width="1.4" opacity=".6"/><circle cx="78" cy="56" r="4.5" fill="${ALTIN}"/>
    <g class="tr-don" style="transform-origin:78px 56px" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="${KREM}" text-anchor="middle">
    ${[20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5].map((n, i) => { const a = (i * 18 - 90) * Math.PI / 180; return `<text x="${(78 + 35 * Math.cos(a)).toFixed(1)}" y="${(59 + 35 * Math.sin(a)).toFixed(1)}">${n}</text>`; }).join('')}</g></g>
    ${kisi({ x: 26, y: 114, s: 1.1, renk: '#7a5230', sapka: 'kep', kol: 'yukari', cls: 'tr-zipla' })}${balon(30, 20, 'Iskalayan yanar!', 70)}`),
  // 1908: peruklu hâkim tokmağı vuruyor, oyuncu üç ok atmış
  tokmak: S(`<rect x="72" y="78" width="80" height="34" rx="3" fill="#6b4a2a" stroke="${KOYU}" stroke-width="1.5"/><path d="M76 86 H148" stroke="#8a5a2b" stroke-width="2"/>
    ${kisi({ x: 112, y: 86, s: 1.05, renk: '#1b1b1b', sapka: 'peruk', kol: 'tokmak' })}
    <g transform="rotate(12 146 70)"><text class="tr-tak" x="146" y="70" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="900" fill="${ALTIN}">TAK!</text></g>
    ${tahtaMini(40, 40, 16)}${minikOk(44, 38, -30)}${minikOk(38, 44, -40)}${minikOk(42, 42, -20)}
    ${kisi({ x: 30, y: 114, s: .9, renk: '#2f6fb0', sapka: 'sac', kol: 'yukari', cls: 'tr-zipla' })}`),
  // 1924: birlik rozeti, mahalle takımları sevinçte
  rozet: S(`<g class="tr-don" style="transform-origin:80px 40px"><circle cx="80" cy="40" r="26" fill="${ALTIN}"/><circle cx="80" cy="40" r="19" stroke="${KOYU}" stroke-width="1.6" opacity=".5"/>
    <text x="80" y="45" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="900" fill="${KOYU}">1924</text></g>
    ${kisi({ x: 40, y: 114, s: .9, renk: '#c8102e', kol: 'yukari', cls: 'tr-zipla' })}${kisi({ x: 80, y: 116, s: .9, renk: '#1d9a4a', sapka: 'kep', kol: 'yukari', cls: 'tr-zipla tr-gec1' })}${kisi({ x: 120, y: 114, s: .9, renk: '#2f6fb0', kol: 'yukari', cls: 'tr-zipla tr-gec2' })}`),
  // 1927: gazeteci çocuk bağırıyor
  gazete: S(`<g class="tr-don" style="transform-origin:110px 56px"><rect x="82" y="22" width="58" height="66" rx="3" fill="${KREM}"/><rect x="88" y="28" width="46" height="12" fill="${KOYU}"/>
    <text x="111" y="37" text-anchor="middle" font-family="system-ui" font-size="7" font-weight="900" fill="${KREM}">DART!</text>
    <path d="M88 48 H110 M88 55 H110 M88 62 H110 M88 69 H104" stroke="#8a7d66" stroke-width="2.4"/>${tahtaMini(124, 62, 10)}</g>
    ${kisi({ x: 40, y: 114, s: 1.1, renk: '#7a5230', sapka: 'kep', kol: 'gazete', cls: 'tr-zipla' })}${balon(36, 18, 'Son dakika!', 54)}`),
  // 1978: koltukta izleyiciler "180!" diye bağırıyor
  tv: S(`<g class="tr-don" style="transform-origin:110px 46px"><rect x="78" y="14" width="68" height="50" rx="8" fill="${KOYU}" stroke="${ALTIN}" stroke-width="2.4"/>
    ${tahtaMini(112, 39, 15)}<text class="tr-tak" x="112" y="60" text-anchor="middle" font-family="system-ui" font-size="9" font-weight="900" fill="#ff5f57">180!</text><path d="M100 70 H124" stroke="${ALTIN}" stroke-width="3"/></g>
    <rect x="8" y="92" width="70" height="20" rx="6" fill="#7a1622"/>
    ${kisi({ x: 26, y: 108, s: .85, renk: '#2f6fb0', kol: 'yukari', cls: 'tr-zipla' })}${kisi({ x: 56, y: 108, s: .85, renk: '#e3b866', sapka: 'sac', kol: 'yukari', cls: 'tr-zipla tr-gec1' })}`),
  // 1994: iki oyuncu iki kupa
  kupalar: S(`<g class="tr-sol">${kupa(44)}${kisi({ x: 44, y: 118, s: .8, renk: '#c8102e', kol: 'yukari' })}</g><g class="tr-sag">${kupa(116)}${kisi({ x: 116, y: 118, s: .8, renk: '#2f6fb0', kol: 'yukari' })}</g>`),
  // 2008: Ally Pally — kostümlü kalabalık, spotlar, 180 pankartları
  saray: S(`<path class="tr-spot" d="M30 0 L50 70 L10 70 Z M130 0 L150 70 L110 70 Z" fill="${ALTIN}" opacity=".18"/>
    <g class="tr-don" style="transform-origin:80px 50px"><path d="M30 76 V46 L48 38 V30 H58 V26 L80 14 L102 26 V30 H112 V38 L130 46 V76 Z" fill="${KOYU}" stroke="${ALTIN}" stroke-width="2"/>
    <path d="M72 76 V62 A8 8 0 0 1 88 62 V76" stroke="${ALTIN}" stroke-width="2"/></g>
    ${kisi({ x: 22, y: 118, s: .75, renk: '#1d9a4a', sapka: 'sac', kol: 'yukari', cls: 'tr-zipla' })}${kisi({ x: 52, y: 118, s: .75, renk: '#c8102e', sapka: 'tac', kol: 'yukari', cls: 'tr-zipla tr-gec1' })}
    ${kisi({ x: 108, y: 118, s: .75, renk: '#2f6fb0', kol: 'yukari', cls: 'tr-zipla tr-gec2' })}${kisi({ x: 138, y: 118, s: .75, renk: '#e3b866', sapka: 'kep', kol: 'yukari', cls: 'tr-zipla' })}
    <g class="tr-tak"><rect x="68" y="84" width="24" height="14" rx="2" fill="#fff"/><text x="80" y="94.5" text-anchor="middle" font-family="system-ui" font-size="9" font-weight="900" fill="#c8102e">180</text></g>`),
  // 2013: taçlı efsane, çevresinde 16 küçük kupa
  tac: S(`${Array.from({ length: 16 }, (_, i) => { const a = (-160 + i * (140 / 15)) * Math.PI / 180; return `<g class="tr-kupa-mini" style="animation-delay:${(i * .06).toFixed(2)}s"><path d="M${(80 + 60 * Math.cos(a) - 4).toFixed(1)} ${(80 + 60 * Math.sin(a) - 4).toFixed(1)} h8 v4 c0 4 -8 4 -8 0 z" fill="${ALTIN}"/></g>`; }).join('')}
    ${kisi({ x: 80, y: 116, s: 1.35, renk: '#1b1b1b', sapka: 'tac', kol: 'yukari', cls: 'tr-zipla' })}
    <text class="tr-tak" x="80" y="16" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="900" fill="${KREM}">× 16</text>`),
  // Bugün: oyuncu atış çizgisinde, ölçüler
  olcu: S(`<path d="M8 102 H156" stroke="${KREM}" stroke-width="1.6"/>
    <rect x="145" y="18" width="5" height="84" fill="#6b4a2a"/>${tahtaMini(143, 34, 10)}
    <path d="M30 97 V107" stroke="#c8102e" stroke-width="3.5"/>
    ${kisi({ x: 24, y: 102, s: 1, renk: '#2f6fb0', kol: 'at' })}${ucanOk(40, 67, 137, 34, .6)}
    <g stroke="${ALTIN}" stroke-width="1.2"><path d="M30 112 H143" stroke-dasharray="3 3"/><path d="M30 108 V116 M143 108 V116"/></g>
    <rect x="72" y="106" width="34" height="12" rx="3" fill="#1a1612"/>
    <text x="89" y="115" text-anchor="middle" font-family="system-ui" font-size="8.5" font-weight="800" fill="${KREM}">2,37 m</text>
    <g stroke="${ALTIN}" stroke-width="1.2"><path d="M131 34 V102" stroke-dasharray="3 3"/><path d="M127 34 H135 M127 102 H135"/></g>
    <rect x="98" y="62" width="30" height="12" rx="3" fill="#1a1612"/>
    <text x="113" y="71" text-anchor="middle" font-family="system-ui" font-size="8.5" font-weight="800" fill="${KREM}">1,73 m</text>`),
  // 2026: Demir ve Kenan telefonla sevinçte
  telefon: S(`<g class="tr-don" style="transform-origin:80px 54px"><rect x="56" y="6" width="48" height="94" rx="9" fill="${KOYU}" stroke="${ALTIN}" stroke-width="2.4"/>
    <rect x="61" y="15" width="38" height="74" rx="3" fill="#1a1612"/>
    <image href="img/logo-dartx.webp" x="66" y="18" width="28" height="9" preserveAspectRatio="xMidYMid meet"/>
    <rect x="63" y="30" width="16" height="20" rx="2.5" fill="#3a2a22" stroke="#e94b3c" stroke-width=".8"/><rect x="81" y="30" width="16" height="20" rx="2.5" fill="#26282c"/>
    <text x="71" y="44" text-anchor="middle" font-family="system-ui" font-size="7" font-weight="900" fill="#fff">121</text>
    <text x="89" y="44" text-anchor="middle" font-family="system-ui" font-size="7" font-weight="900" fill="#cfd3d8">177</text>
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${64 + c * 11}" y="${54 + r * 8.5}" width="9.5" height="7" rx="1.6" fill="#5a4630"/>`).join('')).join('')}
    <rect x="64" y="80" width="31" height="6" rx="3" fill="${ALTIN}"/><path d="M73 96 h14" stroke="${ALTIN}" stroke-width="2.4"/></g>
    <g class="tr-kisi tr-zipla"><image href="img/karakter/demir.webp" x="-6" y="18" width="66" height="100" preserveAspectRatio="xMidYMax meet"/></g>
    <g class="tr-kisi tr-zipla tr-gec1"><image href="img/karakter/kenan.webp" x="100" y="18" width="66" height="100" preserveAspectRatio="xMidYMax meet"/></g>`),
};
function kupa(x) {
  return `<path d="M${x - 14} 30 H${x + 14} V46 C${x + 14} 58 ${x + 7} 63 ${x} 63 C${x - 7} 63 ${x - 14} 58 ${x - 14} 46 Z" fill="${ALTIN}"/>
    <path d="M${x - 14} 35 C${x - 23} 35 ${x - 23} 49 ${x - 12} 51 M${x + 14} 35 C${x + 23} 35 ${x + 23} 49 ${x + 12} 51" stroke="${ALTIN}" stroke-width="3.5"/>
    <rect x="${x - 3.5}" y="63" width="7" height="8" fill="${ALTIN}"/><rect x="${x - 11}" y="71" width="22" height="6" rx="2" fill="#6b4a2a"/>`;
}

export const TARIH = [
  { yil: () => Y('Ortaçağ', 'Middle Ages'), resim: 'kutuk', baslik: () => Y('Kütükten tahtaya', 'From log to board'),
    yazi: () => Y('Hayal edin: Ortaçağ İngilteresi, savaş yok, askerler sıkılmış. Ellerinde kısa oklar, karşılarında ters çevrilmiş bir şarap fıçısı. Biri "Bahse var mısın?" diyor ve dartın hikâyesi başlıyor! Fıçının, ya da kesilmiş bir ağaç kütüğünün halkaları ilk puan bölgeleri oldu, çatlakları da ilk dilimler.', 'Legend has it that darts began in medieval England, with soldiers throwing short arrows at the bottom of an upturned barrel or a cut tree trunk. Its rings became the first scoring zones and its cracks the first segments.') },
  { yil: 1896, resim: 'dizilim', baslik: () => Y('Sayıların yeri', 'The number order'),
    yazi: () => Y('Rivayete göre Lancashire\'lı bir marangoz, Brian Gamlin, tahtadaki sayıları öyle bir dizdi ki, yirminin hemen yanına bir ile beşi koydu. Neden mi? Iskalayan cezasını çeksin diye! O günden beri şansla değil, isabetle kazanılıyor. Teşekkürler usta!', 'Today\'s 20 – 1 – 18 – 4… order is credited, according to legend, to Lancashire carpenter Brian Gamlin. Big numbers sit between small ones, so a miss is punished: accuracy wins, not luck.') },
  { yil: 1908, resim: 'tokmak', baslik: () => Y('Şans değil, beceri', 'Skill, not chance'),
    yazi: () => Y('İngiltere\'de şans oyunları barlarda yasak, dart da mahkemelik! Anlatılır ki Leeds\'teki duruşmada bir oyuncu tahtayı mahkeme salonuna getirdi, hâkim nereyi söylediyse oraya attı. Üç ok, üç isabet! Hâkim tokmağı vurdu: "Bu şans değil, beceri!" Ve dart, barlarda kaldı.', 'Games of chance were banned in English pubs back then. The story goes that in a Leeds court a player hit wherever he was asked, three times in a row, proving darts was a game of skill — and darts stayed in the pubs.') },
  { yil: 1924, resim: 'rozet', baslik: () => Y('İlk birlik', 'The first association'),
    yazi: () => Y('Dartçılar bir araya gelip Ulusal Dart Birliği\'ni kurdu. Kurallar kâğıda döküldü, bar ligleri mantar gibi çoğaldı. Artık her mahallenin bir dart takımı vardı!', 'The National Darts Association was founded in England. The rules were written down and pub leagues spread.') },
  { yil: 1927, resim: 'gazete', baslik: () => Y('Gazetenin turnuvası', 'The newspaper\'s tournament'),
    yazi: () => Y('Bir gazete, News of the World, kendi dart turnuvasını başlattı. Zamanla öyle büyüdü ki on binlerce oyuncu katıldı, salonlar tıklım tıklım doldu. Gazeteler artık dart manşetleri atıyordu!', 'The News of the World darts tournament began. Over the years it went national and became a championship with tens of thousands of entrants and packed halls.') },
  { yil: 1978, resim: 'tv', baslik: () => Y('Televizyon çağı', 'The TV era'),
    yazi: () => Y('İlk Dünya Şampiyonası düzenlendi ve kupayı Leighton Rees kaldırdı. Maçlar televizyona çıktı; milyonlar evlerinden "yüz seksen!" diye bağırmaya başladı. Dart artık bir izleyici sporuydu.', 'The British Darts Organisation, founded in 1973, held its first World Championship; Leighton Rees won. Matches went on TV and darts became a spectator sport.') },
  { yil: 1994, resim: 'kupalar', baslik: () => Y('İki dünya şampiyonası', 'Two world championships'),
    yazi: () => Y('En iyi oyuncuların bir kısmı kendi yolunu çizip bugünkü PDC\'yi kurdu. İlk şampiyonalarını Dennis Priestley kazandı. Sonuç? O günden beri dartta bir değil, iki dünya şampiyonası var. Daha çok kupa, daha çok heyecan!', 'Some of the top players broke away and formed what is now the PDC. Dennis Priestley won their first championship in 1994. Since then there have been two world championships.') },
  { yil: 2008, resim: 'saray', baslik: () => Y('Saraydaki şampiyona', 'The championship at the Palace'),
    yazi: () => Y('PDC Dünya Şampiyonası, Londra\'daki Alexandra Palace\'a taşındı. Süper kahraman kostümlü seyirciler, hep bir ağızdan şarkılar ve her yüz seksende yıkılan salon! Her aralık ayı dünyanın en eğlenceli spor partisi burada yaşanır.', 'The PDC World Championship moved to London\'s Alexandra Palace. Costumed crowds, songs and roars of "180!" make it the most famous darts party every December.') },
  { yil: 2013, resim: 'tac', baslik: () => Y('Efsane', 'The legend'),
    yazi: () => Y('Phil "The Power" Taylor, on altıncı dünya şampiyonluğunu kazandı. On altı! Bu rekoru kırmak için çok, ama çok yüz seksen atmak gerekecek.', 'Phil "The Power" Taylor won his 16th world title in 2013 — the undisputed greatest of the game.') },
  { yil: () => Y('Bugün', 'Today'), resim: 'olcu', baslik: () => Y('Her yerde aynı ölçü', 'The same everywhere'),
    yazi: () => Y('Bugün dünyanın her yerinde kural aynı: tahtanın merkezi yerden 1,73 m yüksekte, atış çizgisi tahtadan 2,37 m uzakta. Türkiye\'de de dart, Türkiye Bocce, Bowling ve Dart Federasyonu çatısı altında oynanıyor.', 'Everywhere in the world the bullseye is 1.73 m high and the throw line is 2.37 m from the board. In Turkey, darts is governed by the Turkish Bocce, Bowling and Darts Federation.') },
  { yil: 2026, resim: 'telefon', baslik: () => Y('Ve DartX', 'And DartX'), baslikHtml: () => `${Y('Ve', 'And')} <img class="tr-baslik-logo" src="img/logo-dartx.webp" alt="DartX">`,
    yazi: () => Y('Hikâyeye yeni bir sayfa eklendi: DartX. Mimar ve dart tutkunu Demir Kara, kâğıt kalemle skor tutmaktan sıkılınca kendi programını yazdı. Skorlar, istatistikler, kurallar ve dostlarla oynadığın bütün oyunlar artık tek bir uygulamada, cebinde. Sıra sende: iyi oyunlar, bol 180\'ler!', 'A new page in the story: DartX. Architect and darts lover Demir Kara got tired of keeping score with pen and paper, so he wrote his own app. Scores, stats, rules and every game you play with friends, now in one app, in your pocket. Your turn: good darts, plenty of 180s!') },
];
export const TARIH_RESIM = RESIM;
