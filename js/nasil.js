// DartX — Nasıl oynanır (Demir 09.11): her oyun için kısa, kendiliğinden oynayan gösterim.
// Üstte dart tahtası (oklar uçup saplanır, vurulan dilim parlar), yanında canlı skor tablosu, altta tek cümle açıklama.
// Video değil: uygulamanın içinde çizilir — internetsiz çalışır, uygulamayı büyütmez, Türkçe / İngilizce yazı kendiliğinden değişir.
import { t, gt, dil } from './i18n.js';
import { GAMES, GAME_LIST, CATS } from './games/index.js';
import { ikon } from './icons.js';
import { esc } from './util.js';
import * as ses from './ses.js';
import { data, save } from './store.js';
import { TARIH, TARIH_RESIM, avatar } from './nasil-tarih.js';

const TR = () => dil() !== 'en';
const Y = (tr, en) => (TR() ? tr : en);

import { DEMOLAR } from './nasil-demolar.js';
export const demoVar = id => !!DEMOLAR[id];
const TARIH_DEMO = { tarih: true, oyuncular: [], adimlar: TARIH };
const demoAl = id => (id === 'tarih' ? TARIH_DEMO : DEMOLAR[id]);

// ── Sesli anlatım (Demir 09.11: "anlatımlarda ses olmalı"). İlk aşama: telefonun kendi Türkçe sesi (internetsiz, ücretsiz).
//    Sonra ElevenLabs ile üretilen ses dosyaları gelince: adımın dosyası varsa o çalar, yoksa telefonun sesi okur.
const anlatimAcik = () => data().settings.anlatim !== false;
let sesler = [];
const sesleriAl = () => { try { sesler = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { sesler = []; } };
if (window.speechSynthesis) { sesleriAl(); speechSynthesis.addEventListener?.('voiceschanged', sesleriAl); }
function sesSec(dilKod) {
  const uygun = sesler.filter(v => v.lang && v.lang.toLowerCase().startsWith(dilKod));
  // doğal sesler önce (iPhone "Yelda (Gelişmiş)", Android / Chrome "Google Türkçe")
  return uygun.find(v => /enhanced|gelişmiş|premium|natural|google/i.test(v.name)) || uygun[0] || null;
}
// ElevenLabs ile üretilmiş ses dosyaları (Ozan Karaca). Dosyası olan adımda o çalar, olmayanda telefonun sesi okur.
const SES_DOSYALARI = { atc: { tr: [0, 1, 2, 3] }, atcsolo: { tr: [0, 1, 2] }, baseball: { tr: [0, 1, 2, 3, 4] }, bigfinish: { tr: [0, 1, 2] }, bobs27: { tr: [0, 1, 2, 3] }, bull: { tr: [0, 1, 2] }, catch40: { tr: [0, 1, 2] }, co121: { tr: [0, 1, 2] }, countup: { tr: [0, 1, 2, 3] }, crazy: { tr: [0, 1, 2, 3, 4] }, cricket: { tr: [0, 1, 2, 3, 4, 5] }, crpractice: { tr: [0, 1, 2, 3] }, cutthroat: { tr: [0, 1, 2, 3, 4] }, dtdrill: { tr: [0, 1, 2, 3] }, english: { tr: [0, 1, 2, 3, 4] }, fullboard: { tr: [0, 1, 2, 3, 4] }, gotcha: { tr: [0, 1, 2, 3] }, halveit: { tr: [0, 1, 2, 3, 4, 5] }, hidden: { tr: [0, 1, 2, 3] }, jdc: { tr: [0, 1, 2, 3] }, killer: { tr: [0, 1, 2, 3, 4, 5] }, mickey: { tr: [0, 1, 2, 3] }, minnesota: { tr: [0, 1, 2, 3] }, scoring: { tr: [0, 1, 2] }, shanghai: { tr: [0, 1, 2, 3, 4] }, tactics: { tr: [0, 1, 2, 3] }, tarih: { tr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, turk: { tr: [0, 1, 2, 3, 4, 5, 6] }, x01: { tr: [0, 1, 2, 3, 4, 5, 6] } }; // tarihçe: Ozan Karaca, oyunlar: Nino (ElevenLabs)
let calan = null;
// Tek oynatıcı (Demir 09.11, tablette ses yoktu): iPad/iPhone ve Android, dokunuş dışında başlatılan YENİ ses öğesini
// engeller. Aynı öğe ilk dokunuşta bir kez çalınıp durdurulunca sonraki adımlarda (zamanlayıcıdan) da çalabilir.
const oynatici = typeof Audio !== 'undefined' ? new Audio() : null;
if (oynatici) { oynatici.preload = 'auto'; oynatici.setAttribute('playsinline', ''); }
const SESSIZ = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let oynaticiAcik = false;
function oynaticiKilit() {
  if (!oynatici || oynaticiAcik) return;
  if (calan) { oynaticiAcik = true; return; } // zaten bir anlatım çalıyor
  oynatici.src = SESSIZ;
  const s = oynatici.play();
  if (s && s.then) s.then(() => { oynaticiAcik = true; if (!calan) oynatici.pause(); }).catch(() => {});
}
['pointerdown', 'touchend', 'keydown'].forEach(o => addEventListener(o, oynaticiKilit, true));
function dosyaVar(id, i) { const d = SES_DOSYALARI[id]; return !!(d && d[dil()] && d[dil()].includes(i)); }
function dosyaCal(id, i, bitince) {
  if (!anlatimAcik()) return false;
  sustur();
  const a = oynatici || new Audio();
  a.src = `ses/${id}/${dil()}-${String(i).padStart(2, '0')}.mp3`;
  let bitti = false; const son = () => { if (!bitti) { bitti = true; bitince(); } };
  a.onended = son; a.onerror = son;
  calan = a;
  a.play().catch(son);
  return true;
}
function sustur() {
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* yok say */ }
  if (calan) { try { calan.onended = calan.onerror = null; calan.pause(); } catch (e) { /* yok say */ } calan = null; }
}
// Dart terimleri İngilizce okunur (Demir 09.11: "triple ve double'ı Türkçe gibi okuyamazsın"): Türkçe ses için söylendiği gibi yazılır
const TERIM_OKUNUS = [[/\btriple\b/gi, 'tripıl'], [/\bdouble'?(ın|ı|a|da)?\b/gi, (m, e) => 'dabıl' + (e ? "'" + ({ ın: 'ın', ı: 'ı', a: 'a', da: 'da' }[e.toLowerCase()]) : '')],
  [/\bbust\b/gi, 'bast'], [/\bbull\b/gi, 'bul'], [/\bhouse\b/gi, 'haus'], [/\bkiller\b/gi, 'kilır'], [/\bshanghai\b/gi, 'şanghay'],
  [/\bgotcha\b/gi, 'gaça'], [/\bleg\b/gi, 'leg'], [/\bcheckout\b/gi, 'çekaut'], [/\bcricket\b/gi, 'kriket'], [/\bbed\b/gi, 'bed']];
const okunus = m => TERIM_OKUNUS.reduce((s, [r, y]) => s.replace(r, y), m);
function konus(metin, bitince) {
  if (!anlatimAcik() || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  sustur();
  const tr = dil() !== 'en';
  if (tr) metin = okunus(metin.replace(/\b([TD])(\d+)\b/g, (_, h, n) => (h === 'T' ? 'triple ' : 'double ') + n));
  const u = new SpeechSynthesisUtterance(metin.replace(/·/g, ',').replace(/→/g, tr ? ', sonra ' : ', then ').replace(/\b([TD])(\d+)\b/g, (_, h, n) => (h === 'T' ? (tr ? 'triple ' : 'treble ') : 'double ') + n));
  u.lang = tr ? 'tr-TR' : 'en-GB';
  const v = sesSec(tr ? 'tr' : 'en'); if (v) u.voice = v;
  u.rate = tr ? 1.02 : 1; u.pitch = 1;
  let bitti = false; const son = () => { if (!bitti) { bitti = true; bitince(); } };
  u.onend = son; u.onerror = son;
  speechSynthesis.speak(u);
  return true;
}

// ── Tahta (200×200; tepede 20). Dilim sırası saat yönünde.
const SIRA = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const R = 78, CX = 100, CY = 100;
const f2 = v => v.toFixed(2);
const nokta = (r, aci) => [CX + r * Math.cos(aci), CY + r * Math.sin(aci)];
const aciOf = i => ((i * 18 - 90) * Math.PI) / 180;
function dilimYol(r0, r1, i) {
  const a0 = aciOf(i) - Math.PI / 20, a1 = aciOf(i) + Math.PI / 20;
  const p = (r, a) => nokta(r, a).map(f2).join(',');
  return `M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
}
function tahtaSvg() {
  let s = `<circle cx="${CX}" cy="${CY}" r="${R + 18}" fill="#141414"/><circle cx="${CX}" cy="${CY}" r="${R + 18}" fill="none" stroke="#3a3a3a" stroke-width="1.2"/>`;
  SIRA.forEach((n, i) => {
    const koyu = i % 2 === 0, zem = koyu ? '#1d1d1d' : '#efe3c4', hal = koyu ? '#d8262c' : '#1d9a4a';
    s += `<path d="${dilimYol(R * .16, R * .58, i)}" fill="${zem}"/><path d="${dilimYol(R * .58, R * .66, i)}" fill="${hal}"/><path d="${dilimYol(R * .66, R * .9, i)}" fill="${zem}"/><path d="${dilimYol(R * .9, R, i)}" fill="${hal}"/>`;
    const [x, y] = nokta(R + 9.5, aciOf(i));
    s += `<text x="${f2(x)}" y="${f2(y + 3.4)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#e8e2d6" font-family="system-ui, sans-serif">${n}</text>`;
  });
  s += `<circle cx="${CX}" cy="${CY}" r="${R * .16}" fill="#1d9a4a"/><circle cx="${CX}" cy="${CY}" r="${R * .075}" fill="#d8262c"/>`;
  return s;
}
// Okun saplanacağı yer (dilim ortası; ufak rastgele kayma ile iki ok üst üste binmesin)
function hedefNokta(n, m, sira) {
  const kay = (sira - 1) * 0.045;
  if (n === 25) return m === 2 ? [CX + sira * 2 - 2, CY - 1] : nokta(R * .12, -Math.PI / 2 + sira);
  if (n === 0) return nokta(R + 12, aciOf(7 + sira * 5) + kay);
  const i = SIRA.indexOf(n), r = m === 3 ? R * .62 : m === 2 ? R * .95 : R * (.36 + sira * .1);
  return nokta(r, aciOf(i) + kay);
}
function isikYol(n, m) {
  if (n === 25) return `M${CX - R * (m === 2 ? .075 : .16)} ${CY} a${R * (m === 2 ? .075 : .16)} ${R * (m === 2 ? .075 : .16)} 0 1 0 ${2 * R * (m === 2 ? .075 : .16)} 0 a${R * (m === 2 ? .075 : .16)} ${R * (m === 2 ? .075 : .16)} 0 1 0 ${-2 * R * (m === 2 ? .075 : .16)} 0`;
  if (n === 'D' || n === 'T') return SIRA.map((_, i) => n === 'D' ? dilimYol(R * .9, R, i) : dilimYol(R * .58, R * .66, i)).join(' ');
  const i = SIRA.indexOf(n); if (i < 0) return '';
  return m === 3 ? dilimYol(R * .58, R * .66, i) : m === 2 ? dilimYol(R * .9, R, i) : dilimYol(R * .16, R * .9, i);
}
// Oklar (Demir 09.11): her oyuncunun kendi oku. Marka logosu / adı / amblemi yok — yalnız o havada kendi çizimimiz.
//   buz  (Demir) : koyu tungsten torpido gövde, buz mavisi halkalar, kristal desenli mavi kanatlar (Iceman havası)
//   kont (Kenan) : siyah-gri (Demir'in gönderdiği fotoğraftaki hava): parlak krom ince gövde, gümüş halkalı + beyaz noktalı
//                  siyah sap, petek desenli siyah kanat (amblem / imza yok)
//   kor  (Hediye): siyah gövde, kırmızı halkalar, kor kırmızısı kanat
// Ucu (0,0), +x yönünde uzanır.
export const OK_DEFS = (k = 'ns') => `<defs>
  <linearGradient id="${k}Uc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c9d1d9"/><stop offset="1" stop-color="#6b7480"/></linearGradient>
  <linearGradient id="${k}Govde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa3ad"/><stop offset=".28" stop-color="#4a525c"/><stop offset=".55" stop-color="#1c2128"/><stop offset="1" stop-color="#0b0e12"/></linearGradient>
  <linearGradient id="${k}Sap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#555b63"/><stop offset=".4" stop-color="#15181c"/><stop offset="1" stop-color="#050607"/></linearGradient>
  <linearGradient id="${k}Kanat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2fdff"/><stop offset=".35" stop-color="#8fe0ff"/><stop offset=".7" stop-color="#2f8fe0"/><stop offset="1" stop-color="#103f86"/></linearGradient>
  <linearGradient id="${k}MatGovde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3b6b9"/><stop offset=".3" stop-color="#7b7f84"/><stop offset=".7" stop-color="#55595e"/><stop offset="1" stop-color="#2e3135"/></linearGradient>
  <linearGradient id="${k}Limon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ffb0" stop-opacity=".95"/><stop offset=".45" stop-color="#8cff2e" stop-opacity=".85"/><stop offset="1" stop-color="#3fbf12" stop-opacity=".9"/></linearGradient>
  <linearGradient id="${k}Titan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7b4dff"/><stop offset=".3" stop-color="#2fb5ff"/><stop offset=".55" stop-color="#3bd67a"/><stop offset=".8" stop-color="#ffc23d"/><stop offset="1" stop-color="#d44df0"/></linearGradient>
  <linearGradient id="${k}Yesil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f7e0" stop-opacity=".9"/><stop offset=".4" stop-color="#2fa84f"/><stop offset="1" stop-color="#0c4a22"/></linearGradient>
  <linearGradient id="${k}Siyah" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6d72"/><stop offset=".35" stop-color="#25272b"/><stop offset="1" stop-color="#08090a"/></linearGradient>
  <linearGradient id="${k}Kor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd1a8"/><stop offset=".35" stop-color="#ff6a3d"/><stop offset=".75" stop-color="#c8102e"/><stop offset="1" stop-color="#5e0612"/></linearGradient>
  <linearGradient id="${k}Krom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="#d7dbe0"/><stop offset=".5" stop-color="#8d939a"/><stop offset=".75" stop-color="#c9ced4"/><stop offset="1" stop-color="#4b5056"/></linearGradient>
  <pattern id="${k}PetekDes" width="1.6" height="1.4" patternUnits="userSpaceOnUse"><path d="M.4 0 H1.2 L1.6 .7 L1.2 1.4 H.4 L0 .7 Z" fill="none" stroke="#3a3e44" stroke-width=".18"/></pattern>
  <linearGradient id="${k}PetekZ" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3f45"/><stop offset=".5" stop-color="#16181b"/><stop offset="1" stop-color="#050506"/></linearGradient>
  <filter id="${k}Golge" x="-30%" y="-60%" width="160%" height="220%"><feDropShadow dx="1.2" dy="2" stdDeviation="1.4" flood-color="#000" flood-opacity=".55"/></filter>
</defs>`;
const UC_CIZ = (k, boy = 12.5) => `<path d="M0 0 L${boy} -.85 L${boy} .85 Z" fill="url(#${k}Uc)"/>`;
const OKLAR = {
  buz: k => `${UC_CIZ(k)}
  <path d="M12 -1.9 C14 -2.9 23.5 -2.9 27 -2.1 L27 2.1 C23.5 2.9 14 2.9 12 1.9 Z" fill="url(#${k}Govde)"/>
  <path d="M14.2 -2.6v5.2M15.4 -2.7v5.4M16.6 -2.75v5.5M17.8 -2.8v5.6M19 -2.8v5.6M20.2 -2.8v5.6M21.4 -2.75v5.5" stroke="#05070a" stroke-width=".55" opacity=".85"/>
  <path d="M23.2 -2.65v5.3M25.1 -2.45v4.9" stroke="#7fdcff" stroke-width=".9"/>
  <path d="M13 -1.6 C16 -2.35 22 -2.35 26 -1.75" stroke="#fff" stroke-opacity=".45" stroke-width=".5" fill="none"/>
  <rect x="27" y="-.95" width="8.5" height="1.9" rx=".9" fill="url(#${k}Sap)"/><rect x="27.4" y="-1.15" width="1.1" height="2.3" rx=".4" fill="#2a8fd8"/>
  <path d="M33.5 0 L37.5 -1.6 L45.5 -9.8 L47.6 -8.9 L43.6 0 Z" fill="url(#${k}Kanat)" stroke="#0d3a72" stroke-width=".4"/>
  <path d="M33.5 0 L37.5 1.6 L45.5 9.8 L47.6 8.9 L43.6 0 Z" fill="url(#${k}Kanat)" stroke="#0d3a72" stroke-width=".4"/>
  <path d="M38.5 -1.4 L44.6 -7.9 M40.5 -.6 L46.2 -6.5 M39.4 -3.4 L42.6 -2.2 L41.2 -5.3 M38.5 1.4 L44.6 7.9 M40.5 .6 L46.2 6.5 M39.4 3.4 L42.6 2.2 L41.2 5.3" stroke="#fff" stroke-opacity=".7" stroke-width=".38" fill="none"/>
  <path d="M33.5 0 H44" stroke="#0d3a72" stroke-width=".5"/>`,
  kont: k => `${UC_CIZ(k, 14)}
  <path d="M13.5 -1.25 L15.5 -1.75 H28 L28.6 -1.5 V1.5 L28 1.75 H15.5 L13.5 1.25 Z" fill="url(#${k}Krom)"/>
  <path d="M15.6 -1.2 H27.6" stroke="#fff" stroke-opacity=".85" stroke-width=".42"/>
  <path d="M15.6 .9 H27.6" stroke="#2b2e33" stroke-opacity=".5" stroke-width=".35"/>
  <rect x="26.6" y="-1.75" width="2" height="3.5" rx=".4" fill="#15171a"/>
  <rect x="28.6" y="-.95" width="8.6" height="1.9" rx=".5" fill="url(#${k}Sap)"/>
  <circle cx="29.7" cy="0" r=".55" fill="#f4f4f4"/>
  <path d="M31.2 -.95v1.9M32.4 -.95v1.9M33.6 -.95v1.9M34.8 -.95v1.9" stroke="#d9dde2" stroke-width=".5"/>
  <path d="M36.6 0 L39 -1.8 L46.6 -9.2 L50.2 -7.4 L49.2 -2 L44.6 0 Z" fill="url(#${k}PetekZ)" stroke="#000" stroke-width=".35"/>
  <path d="M36.6 0 L39 1.8 L46.6 9.2 L50.2 7.4 L49.2 2 L44.6 0 Z" fill="url(#${k}PetekZ)" stroke="#000" stroke-width=".35"/>
  <path d="M36.6 0 L39 -1.8 L46.6 -9.2 L50.2 -7.4 L49.2 -2 L44.6 0 Z M36.6 0 L39 1.8 L46.6 9.2 L50.2 7.4 L49.2 2 L44.6 0 Z" fill="url(#${k}PetekDes)"/>
  <circle cx="45.2" cy="-4.6" r="1.6" fill="none" stroke="#9aa0a7" stroke-width=".45"/><circle cx="45.2" cy="4.6" r="1.6" fill="none" stroke="#9aa0a7" stroke-width=".45"/>
  <path d="M36.6 0 H45" stroke="#000" stroke-width=".45"/>`,
  kor: k => `${UC_CIZ(k)}
  <path d="M12 -1.8 C14 -2.7 24 -2.7 27 -2 L27 2 C24 2.7 14 2.7 12 1.8 Z" fill="url(#${k}Siyah)"/>
  <path d="M15 -2.4v4.8M16.5 -2.5v5M18 -2.55v5.1M19.5 -2.55v5.1M21 -2.5v5" stroke="#c8102e" stroke-width=".55" opacity=".9"/>
  <path d="M13 -1.5 C16 -2.2 22 -2.2 26 -1.7" stroke="#fff" stroke-opacity=".3" stroke-width=".45" fill="none"/>
  <rect x="27" y="-.95" width="8.5" height="1.9" rx=".9" fill="#c8102e"/>
  <path d="M33.5 0 L37.5 -1.6 L45.5 -9.8 L47.6 -8.9 L43.6 0 Z M33.5 0 L37.5 1.6 L45.5 9.8 L47.6 8.9 L43.6 0 Z" fill="url(#${k}Kor)" stroke="#4a0410" stroke-width=".4"/>
  <path d="M33.5 0 H44" stroke="#4a0410" stroke-width=".5"/>`,
};
export const OK_CIZ = (k = 'ns', tema = 'buz') => (OKLAR[tema] || OKLAR.buz)(k);
const okSvg = tema => `<g class="ns-ok-ic" transform="rotate(-42) scale(1.25)" filter="url(#nsGolge)">${OK_CIZ('ns', tema)}</g>`;

// ── Skor durumu: adımları baştan oynatarak bulunur (geri / ileri atlamada doğru kalsın)
//    x01   : kalan puan (ok.x yeni kalan, ok.geri bust dönüşü)
//    kriket: satır işaretleri (ok.k [[satır, +işaret]]), ok.tek, ok.p (kendine puan), ok.pd [[oyuncu, puan]] (başkasına puan),
//            ok.ac [satır, etiket] (gizli sayı açılır), adım.degis {satır: etiket} (Crazy: hedefler değişir)
//    alan  : oyuncu başına alanlar (puan, can, koşu…): ok.v {alan: değer}, ok.dv {alan: +fark}, ok.dd [[oyuncu, {alan: +fark}]]
function bosDurum(d) {
  if (d.tur === 'x01') return { kalan: d.oyuncular.map(() => d.baslangic) };
  if (d.tur === 'alan') return { f: d.oyuncular.map((_, i) => Object.fromEntries(d.alanlar.map(a => [a.k, Array.isArray(a.bas) ? a.bas[i] : (a.bas ?? 0)]))) };
  return { k: d.oyuncular.map(() => ({})), tek: d.oyuncular.map(() => ({})), p: d.oyuncular.map(() => 0), etiket: { ...(d.etiketler || {}) } };
}
function okUygula(d, s, kim, ok) {
  if (kim == null) return;
  if (d.tur === 'x01') { if (ok.geri != null) s.kalan[kim] = ok.geri; else if (ok.x != null) s.kalan[kim] = ok.x; return; }
  if (d.tur === 'alan') {
    Object.assign(s.f[kim], ok.v || {});
    Object.entries(ok.dv || {}).forEach(([k, v]) => (s.f[kim][k] += v));
    (ok.dd || []).forEach(([o, fk]) => Object.entries(fk).forEach(([k, v]) => (s.f[o][k] += v)));
    return;
  }
  if (ok.ac) s.etiket[ok.ac[0]] = ok.ac[1];
  (ok.k || []).forEach(([r, k]) => (s.k[kim][r] = Math.min(3, (s.k[kim][r] || 0) + k)));
  if (ok.tek) s.tek[kim][ok.tek] = 1;
  if (ok.p) s.p[kim] += ok.p;
  (ok.pd || []).forEach(([o, p]) => (s.p[o] += p));
}
function adimBasi(d, s, a) { if (d.tur === 'kriket' && a.degis) Object.assign(s.etiket, a.degis); }
function durumAdim(d, adim) {
  const s = bosDurum(d);
  for (let i = 0; i < adim; i++) { adimBasi(d, s, d.adimlar[i]); (d.adimlar[i].oklar || []).forEach(o => okUygula(d, s, d.adimlar[i].kim, o)); }
  adimBasi(d, s, d.adimlar[adim]);
  return s;
}
const isaret = (k, tek) => (!k ? '' : k === 1 ? '<i class="mk m1">/</i>' : k === 2 ? '<i class="mk m2">X</i>' : tek ? '<i class="mk m3 tek"><b></b></i>' : '<i class="mk m3">X</i>');
const KALP = '<svg width="15" height="15" viewBox="0 0 24 24" fill="#f0715f" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>';
function alanDeger(a, v) {
  if (a.bicim === 'kalp') return v > 0 ? `<span class="ns-kalpler">${KALP.repeat(v)}</span>` : `<span class="ns-elendi">${Y('Elendi', 'Out')}</span>`;
  if (a.bicim === 'evet') return v ? `<span class="ns-rozet">${typeof a.evet === 'function' ? a.evet() : a.evet}</span>` : '<span class="ns-sonuk">–</span>';
  return `${a.on ? a.on : ''}${v}${a.son ? a.son : ''}`;
}
function skorHtml(d, s, kim, a) {
  const hedef = a && a.hedef ? `<div class="ns-hedef"><span>${Y('Hedef', 'Target')}</span><b>${typeof a.hedef === 'function' ? a.hedef() : a.hedef}</b></div>` : '';
  const ana = d.tur === 'x01' ? i => s.kalan[i] : d.tur === 'alan' ? i => (d.alanlar[0].bicim ? '' : alanDeger(d.alanlar[0], s.f[i][d.alanlar[0].k])) : i => (d.puansiz ? '' : s.p[i]);
  const bas = d.oyuncular.map((o, i) => `<th class="${i === kim ? 'sirada' : ''}" style="--pc:${o.renk}"><span>${o.ad === 'Demir' || o.ad === 'Kenan' ? avatar(o.ad) : ''}${esc(o.ad)}</span>${ana(i) !== '' ? `<b>${ana(i)}</b>` : ''}</th>`).join('');
  if (d.tur === 'x01') return `${hedef}<table class="ns-tablo x01"><tr>${bas}</tr></table>`;
  if (d.tur === 'alan') {
    const ilk = d.alanlar[0].bicim ? 0 : 1;
    const sat = d.alanlar.slice(ilk).map(al => `<tr><td class="num">${typeof al.ad === 'function' ? al.ad() : al.ad}</td>${d.oyuncular.map((_, i) => `<td class="${i === kim ? 'sirada' : ''}">${alanDeger(al, s.f[i][al.k])}</td>`).join('')}</tr>`).join('');
    const altBaslik = ilk ? `<caption>${typeof d.alanlar[0].ad === 'function' ? d.alanlar[0].ad() : d.alanlar[0].ad}</caption>` : '';
    return `${hedef}<table class="ns-tablo alan ${d.oyuncular.length === 1 ? 'tek-oyuncu' : ''}">${altBaslik}<thead><tr><th></th>${bas}</tr></thead><tbody>${sat}</tbody></table>`;
  }
  const sat = d.satirlar.map(r => r === '…' ? `<tr class="bos"><td>…</td>${d.oyuncular.map(() => '<td></td>').join('')}</tr>`
    : `<tr data-r="${r}"><td class="num">${s.etiket[r] ?? r}</td>${d.oyuncular.map((_, i) => `<td class="${i === kim ? 'sirada' : ''}">${isaret(s.k[i][r], s.tek[i][r])}</td>`).join('')}</tr>`).join('');
  return `${hedef}<table class="ns-tablo kriket"><thead><tr><th></th>${bas}</tr></thead><tbody>${sat}</tbody></table>`;
}

// ── Sayfalar
export function nasilListe(header) {
  const grup = CATS.map(([cat, ad]) => {
    const oyunlar = GAME_LIST.filter(g => g.cat === cat && !g.soon);
    if (!oyunlar.length) return '';
    return `<section class="nasil-grup"><h2 class="nasil-baslik"><span class="app-ico simge">${ikon('grp-' + cat)}</span><span>${t(ad)}</span><small>${t('{0} oyun', oyunlar.length)}</small></h2><div class="nasil-izgara">${oyunlar.map(g => {
      const var_ = demoVar(g.id);
      return `<button class="nasil-kart ${var_ ? '' : 'yakinda'}" ${var_ ? `data-act="nasiloyna" data-id="${g.id}"` : 'disabled'}>
        <span class="app-ico simge">${ikon(g.id)}</span><span class="nk-ad"><b>${esc(gt(g, 'name'))}</b><small>${esc(gt(g, 'short') || '')}</small></span>
        <span class="nk-rozet">${var_ ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>${t('İzle')}` : t('Yakında')}</span></button>`;
    }).join('')}</div></section>`;
  }).join('');
  return `<main class="page nasil">${header}
    <p class="nasil-giris">${t('Her oyunun kısa bir gösterimi: oklar tahtaya uçar, skor tablosu canlı değişir, altta ne olduğu yazar. Dokunarak durdurabilir, ileri geri gidebilirsin.')}</p>
    <button class="tarih-kart" data-act="nasiloyna" data-id="tarih">
      <span class="tk-resim">${TARIH_RESIM.kutuk}</span>
      <span class="tk-ad"><small>${t('Geçmişten bugüne')}</small><b>${t('Dartın Tarihi')}</b><span>${t('Ortaçağ\'daki kütükten Alexandra Palace\'a')}</span></span>
      <span class="nk-rozet"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>${t('İzle')}</span>
    </button>
    ${grup}</main>`;
}

// Telif notu + imza (Demir 09.11: "her animasyonun altına Demir Kara'nın yaptığını, telifinin ona ait olduğunu yaz, imzamı koy")
const TELIF = () => `<footer class="ns-telif">
    <div class="ns-imza"><img class="imza-beyaz" src="img/imza-beyaz.png" alt="Demir Kara"><img class="imza-siyah" src="img/imza-siyah.png" alt="" aria-hidden="true"></div>
    <p>${t('Bu gösterimin anlatımı, çizimleri ve animasyonları Demir Kara tarafından hazırlanmıştır. Tüm hakları Demir Kara\'ya aittir; izinsiz kopyalanamaz, çoğaltılamaz ve kullanılamaz.').replace(/\. (Tüm|All)/, '.<br>$1')}</p>
    <small>© ${new Date().getFullYear()} Demir Kara <img class="ns-telif-logo" src="img/logo-dartx.webp" alt="DartX"></small>
  </footer>`;
const KONTROLLER = n => `<div class="ns-kontrol">
        <button class="ns-dugme" data-act="nsgeri" aria-label="${t('Geri')}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
        <button class="ns-dugme ana" data-act="nsoynat" aria-label="${t('Oynat')}"></button>
        <button class="ns-dugme" data-act="nsileri" aria-label="${t('İleri')}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
        <button class="ns-dugme ns-ses" data-act="nsses" aria-label="${t('Sesli anlatım')}"></button>
      </div>
      <div class="ns-noktalar">${Array.from({ length: n }, (_, i) => `<button class="ns-nokta" data-act="nsadim" data-i="${i}" aria-label="${i + 1}"></button>`).join('')}</div>`;

function tarihSahne(header) {
  const duraklar = TARIH.map((a, i) => `<button class="tr-durak" data-act="nsadim" data-i="${i}" style="left:${(i / (TARIH.length - 1)) * 100}%"><i></i><small>${typeof a.yil === 'function' ? a.yil() : a.yil}</small></button>`).join('');
  return `<main class="page nasil-oyna tarih">${header}
    <div class="ns-sahne tarih-sahne" data-id="tarih">
      <div class="tr-ust"><div class="tr-resim"></div><div class="tr-bilgi"><div class="tr-yil" data-yil=""></div><div class="tr-baslik"></div></div></div>
      <div class="tr-cizgi"><div class="tr-ray"><div class="tr-dolu"></div></div>${duraklar}</div>
      <div class="ns-yazi"><p></p></div>
      ${KONTROLLER(TARIH.length)}
    </div>${TELIF()}</main>`;
}

export function nasilSahne(id, header) {
  if (id === 'tarih') return tarihSahne(header);
  const g = GAMES[id], d = DEMOLAR[id];
  if (!g || !d) return '';
  return `<main class="page nasil-oyna">${header}
    <div class="ns-sahne" data-id="${id}">
      <div class="ns-ust">
        <div class="ns-tahta"><svg viewBox="0 0 200 200" aria-hidden="true">${OK_DEFS('ns')}${tahtaSvg()}<path class="ns-hedef-isik" d=""/><path class="ns-isik" d=""/><g class="ns-oklar"></g></svg><div class="ns-uyari"></div></div>
        <div class="ns-skor"></div>
      </div>
      <div class="ns-yazi"><span class="ns-kim"></span><p></p></div>
      ${KONTROLLER(d.adimlar.length)}
      <button class="btn" data-act="nskural" data-id="${id}">${t('Kuralların tamamı')}</button>
    </div>${TELIF()}</main>`;
}

// ── Oynatıcı
const OYNAT = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
const DURDUR = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
const TEKRAR = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
let P = null; // { id, d, adim, oynuyor, zaman: [], jeton }
const SES_AC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>';
const SES_KAPA = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>';

export function nasilDurdur() {
  // Demir 09.11: bu her ekran çiziminde çağrılıyor; anlatım çalmıyorsa konuşmaya dokunma (yoksa oyundaki sesli okumayı kesiyordu)
  if (!P && !calan) return;
  sustur();
  if (!P) return;
  P.zaman.forEach(clearTimeout); P = null;
}
const kok = () => document.querySelector('.ns-sahne');
function zamanla(fn, ms) { const z = setTimeout(fn, ms); P.zaman.push(z); }

export function nasilBaslat(id) {
  nasilDurdur();
  const d = demoAl(id); if (!d || !kok()) return;
  P = { id, d, adim: 0, oynuyor: true, zaman: [], jeton: 0 };
  adimGoster(0);
}

function dugmeleriYaz() {
  const k = kok(); if (!k || !P) return;
  const son = P.adim >= P.d.adimlar.length - 1;
  const ana = k.querySelector('.ns-dugme.ana');
  ana.innerHTML = P.oynuyor ? DURDUR : son ? TEKRAR : OYNAT;
  k.querySelectorAll('.ns-nokta').forEach((b, i) => { b.classList.toggle('on', i === P.adim); b.classList.toggle('gecti', i < P.adim); });
  k.querySelector('[data-act="nsgeri"]').disabled = P.adim === 0;
  k.querySelector('[data-act="nsileri"]').disabled = son;
  const sd = k.querySelector('[data-act="nsses"]');
  if (sd) { sd.innerHTML = anlatimAcik() ? SES_AC : SES_KAPA; sd.classList.toggle('kapali', !anlatimAcik()); }
}

// Bir adımın bitmesi için iki şey gerekir: animasyon süresi doldu VE anlatım bitti (anlatım kapalıysa yalnız süre)
function adimBitir(jeton, neden) {
  if (!P || P.jeton !== jeton) return;
  P[neden] = true;
  if (!P.sureBitti || !P.sesBitti) return;
  zamanla(() => {
    if (!P || P.jeton !== jeton || !P.oynuyor) return;
    if (P.adim < P.d.adimlar.length - 1) adimGoster(P.adim + 1);
    else { P.oynuyor = false; dugmeleriYaz(); }
  }, 700);
}

function adimGoster(i) {
  const k = kok(); if (!k || !P) return;
  P.zaman.forEach(clearTimeout); P.zaman = []; sustur();
  P.adim = i; P.jeton++; P.sureBitti = false; P.sesBitti = false;
  const jeton = P.jeton;
  const d = P.d, a = d.adimlar[i];
  const metin = (a.baslik ? a.baslik() + '. ' : '') + a.yazi();
  // anlatım (oynatılıyorsa): bitince adımın bitişine haber verir
  if (P.oynuyor) zamanla(() => {
    const bit = () => adimBitir(jeton, 'sesBitti');
    const oldu = dosyaVar(P.id, i) ? dosyaCal(P.id, i, bit) : konus(metin, bit);
    if (!oldu) bit();
  }, 350);
  else P.sesBitti = true;
  if (d.tarih) { tarihGoster(k, a, i); dugmeleriYaz(); zamanla(() => adimBitir(jeton, 'sureBitti'), 4200); return; }
  const s = durumAdim(d, i);
  k.querySelector('.ns-oklar').innerHTML = '';
  k.querySelector('.ns-isik').setAttribute('d', '');
  k.querySelector('.ns-skor').innerHTML = skorHtml(d, s, a.kim, a);
  hedefIsik(k, a.isaret);
  const kim = a.kim == null ? null : d.oyuncular[a.kim];
  const kimEl = k.querySelector('.ns-kim');
  kimEl.innerHTML = a.kapanis ? `<img class="ns-kapanis-logo" src="img/logo-dartx.webp" alt="DartX"><span class="ns-kapanis-imza">Demir Kara</span>` : kim ? `${kim.ad === 'Demir' || kim.ad === 'Kenan' ? avatar(kim.ad) : `<i style="background:${kim.renk}"></i>`}${esc(kim.ad)}` : `<i class="giris"></i>${esc(gt(GAMES[P.id], 'name'))}`;
  const p = k.querySelector('.ns-yazi p');
  p.textContent = a.yazi();
  const yazi = k.querySelector('.ns-yazi'); yazi.classList.remove('yeni'); void yazi.offsetWidth; yazi.classList.add('yeni');
  dugmeleriYaz();
  const oklar = a.oklar || [];
  oklar.forEach((ok, j) => zamanla(() => okAt(d, s, a.kim, ok, j), 900 + j * 1150));
  zamanla(() => adimBitir(jeton, 'sureBitti'), 900 + oklar.length * 1150 + (oklar.length ? 1600 : 2600));
}

// Tarihçe adımı: yıl sayarak değişir, dönemin resmi canlanır, zaman çizgisi dolar
let yilSayac = null;
function tarihGoster(k, a, i) {
  const yilEl = k.querySelector('.tr-yil');
  const hedef = typeof a.yil === 'function' ? a.yil() : a.yil;
  clearInterval(yilSayac);
  const once = Number(yilEl.dataset.yil);
  if (typeof hedef === 'number' && Number.isFinite(once) && once && once !== hedef) {
    const t0 = performance.now(), sure = 900;
    yilSayac = setInterval(() => {
      const x = Math.min(1, (performance.now() - t0) / sure), e = 1 - Math.pow(1 - x, 3);
      yilEl.textContent = Math.round(once + (hedef - once) * e);
      if (x >= 1) clearInterval(yilSayac);
    }, 30);
  } else yilEl.textContent = hedef;
  yilEl.dataset.yil = typeof hedef === 'number' ? hedef : '';
  yilEl.classList.remove('yeni'); void yilEl.offsetWidth; yilEl.classList.add('yeni');
  const r = k.querySelector('.tr-resim');
  r.innerHTML = TARIH_RESIM[a.resim] || '';
  r.classList.remove('yeni'); void r.offsetWidth; r.classList.add('yeni');
  const tb = k.querySelector('.tr-baslik'); if (a.baslikHtml) tb.innerHTML = a.baslikHtml(); else tb.textContent = a.baslik();
  const p = k.querySelector('.ns-yazi p'); p.textContent = a.yazi();
  const yazi = k.querySelector('.ns-yazi'); yazi.classList.remove('yeni'); void yazi.offsetWidth; yazi.classList.add('yeni');
  k.querySelector('.tr-dolu').style.width = `${(i / (P.d.adimlar.length - 1)) * 100}%`;
  k.querySelectorAll('.tr-durak').forEach((d2, j) => { d2.classList.toggle('on', j === i); d2.classList.toggle('gecti', j < i); });
}

function okAt(d, s, kim, ok, j) {
  const k = kok(); if (!k || !P) return;
  const [x, y] = hedefNokta(ok.n, ok.m, j);
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'ns-ok');
  g.innerHTML = okSvg((d.oyuncular[kim] || {}).ok || 'buz');
  k.querySelector('.ns-oklar').appendChild(g);
  const uc = g.animate([
    { transform: `translate(${x + 70}px, ${y - 78}px) scale(1.7)`, opacity: 0 },
    { opacity: 1, offset: .35 },
    { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
  ], { duration: 430, easing: 'cubic-bezier(.55,0,.9,.45)', fill: 'forwards' });
  uc.onfinish = () => {
    if (!P) return;
    g.querySelector('.ns-ok-ic').animate([{ rotate: '0deg' }, { rotate: '-6deg' }, { rotate: '4deg' }, { rotate: '-2deg' }, { rotate: '0deg' }], { duration: 420, easing: 'ease-out' });
    const isik = k.querySelector('.ns-isik');
    isik.setAttribute('d', isikYol(ok.n, ok.m));
    isik.animate([{ opacity: 0 }, { opacity: .75 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
    ok.n === 0 ? ses.oyun('iska') : ok.n === 25 ? ses.oyun('bull', ok.m) : ses.oyun('isabet', ok.m);
    okUygula(d, s, kim, ok);
    k.querySelector('.ns-skor').innerHTML = skorHtml(d, s, kim, P.d.adimlar[P.adim]);
    const hucre = ok.k && ok.k.length ? k.querySelector(`.ns-tablo.kriket tbody tr[data-r="${ok.k[0][0]}"] td:nth-child(${kim + 2})`)
      : k.querySelector(`.ns-tablo th:nth-of-type(${kim + 1 + (d.tur === 'x01' ? 0 : 1)}) b`) || k.querySelector(`.ns-tablo tbody td:nth-child(${kim + 2})`);
    if (hucre) hucre.animate([{ transform: 'scale(1.5)', filter: 'brightness(1.8)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    if (ok.uyari) uyariGoster(typeof ok.uyari === 'function' ? ok.uyari() : ok.uyari, ok.ses);
  };
}

// Adımın hedefi tahtada yavaşça yanıp söner (ör. Shanghai'de o turun sayısı, Bob's 27'de double)
function hedefIsik(k, h) {
  const el = k.querySelector('.ns-hedef-isik');
  if (!h) { el.setAttribute('d', ''); return; }
  el.setAttribute('d', [].concat(h).map(x => isikYol(x.n, x.m)).join(' '));
}

function uyariGoster(yazi, sesAd) {
  const k = kok(); if (!k) return;
  const u = k.querySelector('.ns-uyari');
  u.textContent = yazi;
  u.classList.toggle('kotu', sesAd === 'bust' || sesAd === 'dusus' || sesAd === 'hata');
  u.classList.remove('show'); void u.offsetWidth; u.classList.add('show');
  if (sesAd) setTimeout(() => ses.oyun(sesAd), 120);
  zamanla(() => u.classList.remove('show'), 1700);
}

// Kontroller (app.js tıklama dağıtıcısından)
export function nasilKontrol(act, el) {
  if (!P) return;
  if (act === 'nsoynat') {
    if (P.oynuyor) { P.oynuyor = false; sustur(); dugmeleriYaz(); return; }
    P.oynuyor = true;
    if (P.adim >= P.d.adimlar.length - 1) adimGoster(0); else adimGoster(P.adim + 1);
    return;
  }
  if (act === 'nsses') {
    data().settings.anlatim = !anlatimAcik(); save();
    if (!anlatimAcik()) { sustur(); adimBitir(P.jeton, 'sesBitti'); }
    dugmeleriYaz(); return;
  }
  P.oynuyor = false; // elle gezinince kendiliğinden ilerleme durur; o adımın okları yine atılır
  if (act === 'nsgeri' && P.adim > 0) adimGoster(P.adim - 1);
  else if (act === 'nsileri' && P.adim < P.d.adimlar.length - 1) adimGoster(P.adim + 1);
  else if (act === 'nsadim') adimGoster(Number(el.dataset.i));
}
