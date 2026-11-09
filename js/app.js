// DartX — arayüz
import * as store from './store.js';
import { DERLEME } from './derleme.js';
import { botAt, botHedef, BOT_SEVIYE } from './bot.js';
import { data, player } from './store.js';
import { GAMES, GAME_LIST, CATS } from './games/index.js';
import * as E from './engine.js';
import { dartLabel, dartValue, esc, fmt1, pct, adAvatar, adResim, botMu, botAvatar } from './util.js';
import { playerStats } from './stats.js';
import { IMPOSSIBLE } from './games/x01.js';
import { ikon } from './icons.js';
import { t, gt, dil, dilKoy, yerel, DILLER } from './i18n.js';
import { korumaKur, telifAc } from './telif.js';
import { kuralMaddeleri, KURAL_IKON } from './kurallar.js';
import { onayla, bilgi } from './dialog.js';
import { acilisGoster } from './acilis.js';
import { dartVurusSesi } from './acilis-ses.js';
import * as okuma from './okuma.js';
import * as kam from './kamera/oyun.js';
import * as kamEkran from './kamera/ekran.js';
import { kenarKaydirKur } from './kenar-kaydir.js';
import './kaydir.js'; // kayan listelerde "devamı var" işareti (kenar solması + ok)
import { yedekAl, yedekYukle } from './yedek.js';
import { hesapKur, hesapKapat, kenarlar } from './hesap.js';
import { acilirAc, acilirKapat, acilirAcik, dokunmatik } from './acilir.js';
import * as ses from './ses.js';
import { nasilListe, nasilSahne, nasilBaslat, nasilDurdur, nasilKontrol, demoVar, OK_DEFS, OK_CIZ } from './nasil.js';

const app = document.getElementById('app');
const S = {
  view: 'home',     // home | setup | play | end | players | stats | settings
  gameId: null,
  setup: null,
  mod: 1,           // tuş takımı çarpanı
  totalBuf: '',
  statPid: null,
  modal: null,
};

// ---------- yardımcılar
// Titreşim: Android'de navigator.vibrate; iPhone'da (iOS 18+) Safari'nin "switch" kutusuna dokunma anındaki
// dokunsal tık (haptic) kullanılır — gizli bir switch etiketine tıklanır. Yalnız kullanıcının dokunuşu sırasında çalışır.
let iosTik = null;
function iosTitret() {
  if (!iosTik) {
    iosTik = document.createElement('label');
    iosTik.setAttribute('aria-hidden', 'true');
    iosTik.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9px;top:-9px';
    const k = document.createElement('input');
    k.type = 'checkbox'; k.setAttribute('switch', ''); k.tabIndex = -1;
    iosTik.appendChild(k);
    document.body.appendChild(iosTik);
  }
  iosTik.click();
}
const vib = ms => {
  if (!data().settings.vibrate) return;
  if (navigator.vibrate) navigator.vibrate(ms);
  else iosTitret();
};
let toastT, uyariKilit = 0;
// Oyun uyarıları (BUST!, YARIYA İNDİ!, House!, leg aldı…) — Demir 08.11: ekranın ortasında, arka plan buzlanır,
// kısa süre kalıp kendiliğinden kaybolur. Dokunmayı engellemez (oyun devam eder).
// Demir 09.11 (kural): her uyarıda konuyla ilgili simge + o ana uygun animasyon. Simgeler lucide (demirkara.com ile aynı set).
const UI = (d) => `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const UYARI_IC = {
  bomba: UI('<circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/>'),
  ates: UI('<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>'),
  kupa: UI('<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>'),
  ev: UI('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  house: UI('<circle cx="8" cy="16" r="6"/><circle cx="8" cy="16" r="2"/><path d="M8 16 18.5 5.5"/><path d="m18.5 5.5 2.6-.4"/><path d="m18.5 5.5.4-2.6"/><path d="M8 16 21 11.5"/><path d="m21 11.5 1.6 1.4"/><path d="m21 11.5.3-2.1"/><path d="M8 16 12.5 3.5"/><path d="m12.5 3.5-1.9-1"/><path d="m12.5 3.5 1.9-.6"/>'),
  hedef: UI('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  yildiz: UI('<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>'),
  kurukafa: UI('<path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>'),
  kirikKalp: UI('<path d="M12.409 5.824c-.702.792-1.15 1.496-1.415 2.166l2.153 2.156a.5.5 0 0 1 0 .707l-2.293 2.293a.5.5 0 0 0 0 .707L12 15"/><path d="M13.508 20.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.677.6.6 0 0 0 .818.001A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5z"/>'),
  asagi: UI('<path d="M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 0 1 1h3.293a.707.707 0 0 1 .5 1.207l-7.086 7.086a1 1 0 0 1-1.414 0l-7.086-7.086a.707.707 0 0 1 .5-1.207H8a1 1 0 0 0 1-1z"/>'),
  goz: UI('<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>'),
  karisik: UI('<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>'),
  arti: UI('<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>'),
  carpi: UI('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  dikkat: UI('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  // Tek okta kapanış (Demir 09.11: "dart üstte, 12'den vurmuş güzel bir dart animasyonu"): tahta + sağ üstten uçup tam ortaya saplanan ok
  dart: `<svg class="u-dart" width="76" height="76" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <g class="dt-tahta"><circle cx="32" cy="32" r="27" fill="rgb(0 0 0 / .35)" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="32" r="19" stroke="#4fd08a" stroke-width="3"/><circle cx="32" cy="32" r="11" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="5" fill="#f0715f"/><circle cx="32" cy="32" r="2" fill="#4fd08a"/></g>
    ${OK_DEFS('ud')}<g class="dt-ok"><g transform="translate(32 32) rotate(-42) scale(.78)">${OK_CIZ('ud')}</g></g></svg>`,
  kisi: UI('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  geri: UI('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>'),
  bot: UI('<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>'),
  kamera: UI('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),
  tablet: UI('<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>'),
  simsek: UI('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'),
};
// Uyarı metni → simge, animasyon (a-*), renk türü, ses. Kalıplar her iki dilde çalışsın diye t() ile kurulur.
const kalip = key => new RegExp('^' + t(key).replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\d\}/g, '.*') + '$', 'i');
const UYARI_TUR = [
  [['BUST!', 'BUST', 'Sıfırın altı — bitti'], { ic: 'bomba', a: 'a-sars', k: 'bad', ses: 'bust' }],
  [['180!'], { ic: 'ates', a: 'a-zipla', k: 'kutla' }],
  [['{0} leg\'i aldı!', '{0} set\'i aldı!'], { ic: 'kupa', a: 'a-zipla', k: 'good kutla' }],
  [['House!', '3 in a bed!'], { ic: 'house3', a: 'a-zipla', k: 'kutla', ses: 'kutlama' }],
  [['Hepsini kapattın ama {0}'], { ic: 'dikkat', a: 'a-buyu', k: 'bad', ses: 'hata' }],
  [['Tek okta kapattı!'], { ic: 'dart', a: 'a-dart', k: 'kutla', ses: 'kutlama' }],
  [['SHANGHAI!', 'SHANGHAI +100', 'GOTCHA!'], { ic: 'yildiz', a: 'a-don', k: 'kutla', ses: 'kutlama' }],
  [['KILLER oldun!'], { ic: 'kurukafa', a: 'a-buyu', k: 'killer', ses: 'killer' }],
  [['Elendi!', 'Kendi canından gitti!'], { ic: 'kirikKalp', a: 'a-dus', k: 'bad', ses: 'dusus' }],
  [['YARIYA İNDİ!'], { ic: 'asagi', a: 'a-dus', k: 'bad', ses: 'dusus' }],
  [['Gizli hedef: {0}'], { ic: 'goz', a: 'a-perde', k: '', ses: 'sira' }],
  [['Hedefler değişti!', 'Sıra değişti! Hedef: {0}'], { ic: 'karisik', a: 'a-don', k: '', ses: 'sira' }],
  [['+{0} koşu', '{0} bitti! +{1}', 'Bitti!'], { ic: 'arti', a: 'a-suz', k: 'good', ses: 'sira' }],
  [['{0} olmadı'], { ic: 'carpi', a: 'a-sal', k: 'bad', ses: 'hata' }],
  [['{0} atılamaz', 'Bu isim zaten var', 'Takım {0}\'de oyuncu yok'], { ic: 'dikkat', a: 'a-sal', k: 'bad' }],
];
function uyariTur(msg) {
  const duz = String(msg).replace(/<[^>]*>/g, '').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');
  for (const [keys, tur] of UYARI_TUR) if (keys.some(k => kalip(k).test(duz))) return tur;
  return { ic: 'simsek', a: 'a-zipla', k: '' };
}

// House kutlaması (Demir 10.11): yandan uçan üç DartX dartı (logodaki dartın kendisi, img/acilis-dart.webp) hedefe pat pat pat saplanır
const HOUSE3_HTML = `<span class="h3" aria-hidden="true"><svg class="h3-hedef" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1c1a17" stroke="rgb(255 255 255 / .35)" stroke-width="2"/><circle cx="32" cy="32" r="20" fill="none" stroke="#e94b3c" stroke-width="5"/><circle cx="32" cy="32" r="11" fill="none" stroke="rgb(255 255 255 / .55)" stroke-width="3"/><circle cx="32" cy="32" r="4.5" fill="#2fb36d"/></svg>${[1, 2, 3].map(i => `<img class="h3-ok h3-ok${i}" src="img/acilis-dart.webp" alt="">`).join('')}</span>`;
function toast(msg, kind = '', ozel = null) {
  const el = document.getElementById('toast');
  let perde = document.getElementById('toast-perde');
  if (!perde) { perde = document.createElement('div'); perde.id = 'toast-perde'; perde.className = 'toast-perde'; document.body.appendChild(perde); }
  const tur = (ozel && ozel.tur) || uyariTur(msg);
  if (!kind) kind = tur.k;
  el.style.setProperty('--pc', (ozel && ozel.renk) || '');
  el.className = `toast ${kind} ${tur.a}`;
  const ic = tur.ic === 'house3' ? HOUSE3_HTML : String(tur.ic).startsWith('resim:') ? `<img class="u-resim" src="${tur.ic.slice(6)}" alt="">` : UYARI_IC[tur.ic];
  el.innerHTML = `<span class="u-ic">${ic}</span><span class="u-yazi">${msg}</span>`;
  void el.offsetWidth; // animasyon her uyarıda baştan başlasın
  el.classList.add('show'); perde.classList.add('show');
  uyariKilit = Date.now() + 1500 + 450; // uyarı ve sönme animasyonu boyunca alttaki tuşlar basılmaz
  if (/\bkutla\b/.test(kind)) konfeti();
  // House: üç dart arka arkaya saplanır, her birinde "tak" sesi (uyarı biraz daha uzun kalır)
  const h3 = tur.ic === 'house3';
  if (h3) { uyariKilit += 600; [380, 680, 980].forEach(ms => setTimeout(() => dartVurusSesi(), ms)); }
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.classList.remove('show'); perde.classList.remove('show'); }, h3 ? 2100 : 1500);
}

// Sıra değişti (Demir 09.11: "Sıra Tuncay'da" — kimde olduğu anlaşılsın): üstten kayan küçük cam hap, oyuncunun
// renginde; büyük bir uyarı varsa o söndükten sonra gelir. Türkçede ek ünlü uyumuna göre: Tuncay'da, Demir'de, Kenan'da, Erdal'da, Murat'ta.
function bulunmaEki(ad) {
  const s = String(ad).toLocaleLowerCase('tr').replace(/[^a-zçğıöşü]/g, '');
  const unlu = (s.match(/[aeıioöuü]/g) || ['e']).pop();
  const kalin = 'aıou'.includes(unlu);
  const sert = 'çfhkpsşt'.includes(s.slice(-1));
  return '\'' + (sert ? 't' : 'd') + (kalin ? 'a' : 'e');
}
// Demir 09.11 (ikinci istek): "sayfanın içinde kaybolup gidiyor" → diğer uyarılar gibi ORTADA, buzlu arka planla açılır;
// oyuncunun renginde kişi simgesi, kart yandan kayarak gelir (a-gec).
let siraT1;
// Sıra duyurusu sürerken (Demir 09.11) ekrana dokunmak alttaki tuşa basmasın: dokunuş yalnız duyuruyu kapatır
let siraKilit = 0;
function siraKilitAc() { siraKilit = 0; clearTimeout(toastT); document.getElementById('toast')?.classList.remove('show'); document.getElementById('toast-perde')?.classList.remove('show'); }
// Demir 09.11 (ikinci kez): HER uyarıda (sıra, bust, House…) ve sönme animasyonu bitene kadar ekranın
// neresine dokunulursa dokunulsun alttaki düğme çalışmaz; dokunuş yalnız uyarıyı kapatır.
function kilitliMi() { const n = Date.now(); return n < uyariKilit || (siraKilit && n < siraKilit && S.view === 'play' && !S.modal); }
addEventListener('click', e => {
  if (!kilitliMi()) return;
  e.preventDefault(); e.stopPropagation();
  if (document.getElementById('toast')?.classList.contains('show')) { siraKilitAc(); uyariKilit = Date.now() + 250; }
}, true);
function siraGoster(m, gecikme) {
  clearTimeout(siraT1);
  siraKilit = Date.now() + (gecikme || 0) + 1500;
  const pid = E.currentPid(m); const p = player(pid); if (!p || m.done) return;
  const takim = m.sides[m.cur].members.length > 1 ? E.sideName(m, m.cur, player) : '';
  // Bot elini bitirdiyse attıkları da yazılır (Demir 10.11: "botun attıkları görünmüyor")
  const bo = S.botOzet; S.botOzet = null;
  if (bo) gecikme = (gecikme || 0) + 500;
  const yazi = (bo ? `<span class="bot-ozet"><b>${esc(bo.ad)}</b>${bo.oklar.map(x => `<i>${esc(x)}</i>`).join('')}</span>` : '') + (dil() === 'tr' ? `Sıra <b>${esc(p.name)}</b>${bulunmaEki(p.name)}` : `<b>${esc(p.name)}</b>'s turn`) + (takim ? `<small>${esc(takim)}</small>` : '');
  const goster = () => {
    toast(yazi, 'sira', { tur: { ic: botMu(p.name) ? 'bot' : adResim(p.name) ? 'resim:' + adResim(p.name) : 'kisi', a: 'a-gec', k: 'sira' }, renk: p.color });
    if (!okuma.acikMi()) ses.oyun('sira'); // Demir 09.11: sesli okuma "Sıra …" diyor, efekt çakışmasın
  };
  // sesli okuma açıksa uyarı okuma bitince gelir (görüntü ve ses üst üste binmesin)
  siraT1 = setTimeout(goster, gecikme); // Demir 09.11: uyarı okumayı beklemez (hızlı basışta geç geliyordu)
}

// Sevinç anı (Demir 09.11): uyarının çevresinden altın / yeşil / beyaz konfeti ve yıldız patlar
function konfeti() {
  const k = document.createElement('div');
  k.className = 'konfeti'; k.setAttribute('aria-hidden', 'true');
  const renk = ['#e3b866', '#f5d38f', '#4fd08a', '#ffffff', '#f0715f', '#e3b866'];
  let ic = '';
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * 360 + Math.random() * 10, d = 110 + Math.random() * 150;
    ic += `<i class="${i % 5 === 0 ? 'yildiz' : ''}" style="--a:${a}deg;--d:${d}px;--r:${Math.round(Math.random() * 720 - 360)}deg;--g:${(Math.random() * 0.12).toFixed(2)}s;--c:${renk[i % renk.length]}"></i>`;
  }
  k.innerHTML = ic;
  document.body.appendChild(k);
  setTimeout(() => k.remove(), 1500);
}

// ---------- tema (demirkara.com DK Steel koyu / açık)
const koyuMQ = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const t = data().settings.theme || 'koyu';
  const tema = t === 'auto' ? (koyuMQ.matches ? 'koyu' : 'acik') : t;
  document.documentElement.dataset.tema = tema;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = tema === 'acik' ? '#d8cfc2' : '#151311';
}
koyuMQ.addEventListener('change', applyTheme);
applyTheme();

// ---------- üst çubuk (demirkara.com menü çubuğu: telefonda ⌂ saat tarih hava · tema; tablette logo, ad, menüler, saat)
const TEMA_SIRA = { koyu: 'acik', acik: 'auto', auto: 'koyu' };
const TEMA_AD = { koyu: 'Koyu', acik: 'Açık', auto: 'Sistem' };
// KURAL (Demir 08.11): üst çubuk simgeleri demirkara.com'dakilerin AYNISI — lucide-react 1.26.0 çizimleri,
// sitedeki boyutlarla (House 17 / 1.9, Moon·Sun·Monitor 16, Search 15). Kafadan simge çizilmez.
const LUCIDE = (d, s, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  ev: LUCIDE('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', 17, 1.9),
  ay: LUCIDE('<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>', 16),
  gunes: LUCIDE('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', 16),
  ekran: LUCIDE('<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>', 16),
  ara: LUCIDE('<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>', 15),
  kitap: LUCIDE('<path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>', 16),
};
// ---------- hava durumu (Demir 08.11 geri istedi): telefonun konumu (izin) + Open-Meteo (ücretsiz, anahtarsız);
// şehir adı BigDataCloud (ücretsiz). Yarım saatte bir yenilenir, önbellekte durur; izin yoksa / internetsizse gizli.
const HV = (d) => LUCIDE(d, 15, 2);
const HAVA_IC = {
  gunes: HV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  parcali: HV('<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>'),
  sis: HV('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/>'),
  yagmur: HV('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>'),
  kar: HV('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>'),
  firtina: HV('<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>'),
};
const havaSimge = k => HAVA_IC[k === 0 ? 'gunes' : k <= 3 ? 'parcali' : k <= 48 ? 'sis' : k <= 67 || (k >= 80 && k <= 82) ? 'yagmur' : k <= 77 || k === 85 || k === 86 ? 'kar' : 'firtina'];
let hava = null;
const HAVA_ANAHTAR = 'dartx.hava';
function konumAl() {
  return new Promise((coz, red) => {
    try {
      const c = JSON.parse(localStorage.getItem('dartx.konum') || 'null');
      if (c && Date.now() - c.t < 6 * 3600e3) return coz(c);
    } catch (e) { /* yoksay */ }
    if (!navigator.geolocation) return red(new Error('konum yok'));
    navigator.geolocation.getCurrentPosition(p => {
      const c = { lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), t: Date.now() };
      localStorage.setItem('dartx.konum', JSON.stringify(c)); coz(c);
    }, red, { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600e3 });
  });
}
async function havaGetir(zorla = false) {
  try {
    const c = JSON.parse(localStorage.getItem(HAVA_ANAHTAR) || 'null');
    if (c && c.h) { hava = c.h; if (!zorla && Date.now() - c.t < 30 * 60000 && c.dil === dil()) { havaCiz(); return; } }
    const k = await konumAl();
    const [r, sh] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${k.lat}&longitude=${k.lon}&current=temperature_2m,weather_code&timezone=auto`).then(x => x.json()),
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${k.lat}&longitude=${k.lon}&localityLanguage=${dil()}`).then(x => x.json()).catch(() => null),
    ]);
    hava = { s: Math.round(r.current.temperature_2m), k: r.current.weather_code, sehir: sh ? (sh.city || sh.locality || sh.principalSubdivision || '') : '' };
    localStorage.setItem(HAVA_ANAHTAR, JSON.stringify({ t: Date.now(), h: hava, dil: dil() }));
    havaCiz();
  } catch (e) { /* izin yok / internetsiz: önbellektekini göster ya da gizli kal */ havaCiz(); }
}
function havaYaz(sehirli) {
  if (!hava) return '';
  return `${havaSimge(hava.k)}<span>${hava.s}°</span>${sehirli && hava.sehir ? `<small>${esc(hava.sehir)}</small>` : ''}`;
}
// Tüm ekranı yeniden çizmeden yalnız hava alanlarını güncelle
function havaCiz() { document.querySelectorAll('[data-hava]').forEach(e => { e.innerHTML = havaYaz(e.dataset.hava === 'uzun'); e.hidden = !hava; }); }
setInterval(() => havaGetir(), 30 * 60000);
const saatYaz = () => {
  const d = new Date();
  return {
    kisa: d.toLocaleTimeString(yerel(), { hour: '2-digit', minute: '2-digit' }),
    tarih: d.toLocaleDateString(yerel(), { day: 'numeric', month: 'short' }),
    gun: d.toLocaleDateString(yerel(), { weekday: 'long' }),
    tamTarih: d.toLocaleDateString(yerel(), { day: 'numeric', month: 'long', year: 'numeric' }),
    uzun: `${d.toLocaleDateString(yerel(), { weekday: 'short' })} ${d.getDate()} ${d.toLocaleDateString(yerel(), { month: 'short' })} ${d.toLocaleTimeString(yerel(), { hour: '2-digit', minute: '2-digit' })}`,
  };
};
setInterval(() => {
  const s = saatYaz();
  document.querySelectorAll('[data-saat]').forEach(e => (e.textContent = s[e.dataset.saat]));
}, 5000);

function topbar() {
  const s = saatYaz();
  const tema = data().settings.theme || 'koyu';
  const temaIc = tema === 'koyu' ? IC.ay : tema === 'acik' ? IC.gunes : IC.ekran;
  const m = data().current;
  const aktif = S.view === 'play' && m ? gt(GAMES[m.gameId], 'name')
    : S.view === 'setup' && S.gameId ? gt(GAMES[S.gameId], 'name')
    : t({ home: 'Oyunlar', players: 'Oyuncular', stats: 'İstatistik', settings: 'Ayarlar', setup: 'Kurulum', end: 'Sonuç', about: 'Hakkında', online: 'Online', nasil: 'Nasıl Oynanır', nasiloyna: 'Nasıl Oynanır' }[S.view] || 'DartX');
  const menu = [['home', 'Oyunlar'], ['players', 'Oyuncular'], ['stats', 'İstatistik'], ['settings', 'Ayarlar']]
    .map(([v, l]) => `<button class="mc-dugme ${S.view === v ? 'on' : ''}" data-act="tab" data-v="${v}">${t(l)}</button>`).join('');
  return `<header class="menu-cubugu">
    <button class="mc-logo" data-act="home" aria-label="DartX"><img src="img/logo-dartx.webp" alt="DartX"></button>
    <div class="mc-sol">
      <button class="mc-evim" data-act="home" aria-label="${t('Ana sayfa')}">${IC.ev}</button>
      <span class="mc-durum-saat" data-saat="kisa">${s.kisa}</span>
      <span class="mc-durum-tarih" data-saat="tarih">${s.tarih}</span>
      <span class="mc-hava mc-hava-kisa" data-hava="kisa" ${hava ? '' : 'hidden'}>${havaYaz(false)}</span>
      <button class="mc-dugme dk" data-act="home" aria-label="DartX"><img src="img/logo-x.webp" alt=""></button>
      <b class="mc-uygulama">${esc(aktif)}</b>
      <span class="mc-menuler">${menu}</span>
    </div>
    <div class="mc-sag">
      <button class="mc-dugme mc-ses ${data().settings.sessiz ? 'kapali' : ''}" data-act="sesmenu" aria-label="${t('Sesler')}" title="${t('Sesler')}">${data().settings.sessiz ? SESSIZ_IC : SESLI_IC}</button>
      <button class="mc-dugme mc-ara" data-act="ara" aria-label="${t('Ara')}" title="${t('Ara')}">${IC.ara}</button>
      <button class="mc-dugme" data-act="temadon" aria-label="${t('Tema')}: ${t(TEMA_AD[tema])}" title="${t('Tema')}: ${t(TEMA_AD[tema])}">${temaIc}</button>
      <span class="mc-hava mc-hava-uzun" data-hava="uzun" ${hava ? '' : 'hidden'}>${havaYaz(true)}</span>
      <span class="mc-saat" data-saat="uzun">${s.uzun}</span>
      ${dilDugme()}
    </div>
  </header>`;
}

function dilDugme() {
  const secili = DILLER.find(d => d.kod === dil()) || DILLER[0];
  // Demir 08.11: liste açılmaz, bayrağa basınca dil doğrudan değişir (TR ↔ EN)
  const sonraki = DILLER[(DILLER.indexOf(secili) + 1) % DILLER.length];
  return `<button class="mc-dugme mc-dil" data-act="dil" data-v="${sonraki.kod}" aria-label="${t('Dil')}: ${secili.ad} → ${sonraki.ad}" title="${sonraki.ad}"><img src="img/bayrak/${secili.bayrak}.svg" alt=""></button>`;
}

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && data().settings.keepAwake && 'wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => (wakeLock = null));
    } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { /* desteklenmiyor */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.view === 'play') keepAwake(true); });

// Kenardan kaydırma ile geri / ileri (Demir 10.11): geri dönülen ekranlar "ileri" yığınında durur;
// başka bir yere gidilince (sekme, oyun vb.) yığın temizlenir — tarayıcıdaki gibi.
const ILERI_OLUR = ['players', 'stats', 'settings', 'kamera', 'about', 'online', 'nasil', 'nasiloyna'];
const ileriYigin = [];
let gezinme = null; // 'geri' | 'ileri' — go() yığını temizlemesin
function go(view, extra = {}) {
  if (!gezinme) ileriYigin.length = 0;
  gezinme = null;
  Object.assign(S, { view, modal: null }, extra);
  keepAwake(view === 'play');
  render();
  window.scrollTo(0, 0);
}

const matchCtx = m => ({
  name: i => E.sideName(m, i, player),
  // Takım kartında oyuncu isimleri; sıradaki atıcı vurgulu
  uyeler: i => {
    const s = m.sides[i];
    if (!s.members || s.members.length < 2 || !s.name) return '';
    const simdi = !m.done && i === m.cur ? E.currentPid(m) : null;
    // Demir 09.11: atan oyuncu alt çizgiyle değil, "Sıra · Hediye" yazan altın rozetle; diğerleri sönük
    return `<div class="side-uye ${simdi ? 'sirada' : ''}">${s.members.map(pid => pid === simdi
      ? `<span class="atan">${TUS_IC.bull}<em>${t('Sırada')}</em>${esc(player(pid).name)}</span>`
      : `<span>${esc(player(pid).name)}</span>`).join('')}</div>`;
  },
  color: i => player(m.sides[i].members[0]).color,
  active: i => !m.done && i === m.cur,
  legInfo: i => {
    const g = GAMES[m.gameId];
    if (!g.legs || ((m.opts.legs || 1) === 1 && (m.opts.sets || 1) === 1)) return '';
    // Demir 09.11: "0S 0L okunmuyor" — açık etiketli sayaç: Set 0 · Leg 0
    const sets = (m.opts.sets || 1) > 1 ? `<span class="lg-ch"><i>${t('Set')}</i><b>${m.setsWon[i]}</b></span>` : '';
    return ` <span class="legs">${sets}<span class="lg-ch"><i>${t('Leg')}</i><b>${m.legsWon[i]}</b></span></span>`;
  },
});

// ---------- ekranlar
// Uzun Kriket tablosu (Full Board 21 satır, Türk Kriketi 15…) kaydırmadan tek ekrana sığsın (Demir 08.11):
// skor alanının yüksekliği satır sayısına bölünür; satırlar yalnız gerekirse incelir (en az 20 px)
// Demir 09.11 ("her okta board sekiyor, titriyor"): bulunan satır yüksekliği hatırlanır ve tablo ekrana yansımadan
// önce uygulanır; yeniden ölçüm yalnız satır sayısı ya da alanın boyu değişince (çevirme, yeni leg, tablodan yaz) yapılır.
let tabloOlcu = null; // { anahtar, y } — y null: küçültme gerekmiyor
function tabloSigdir() {
  const tablo = document.querySelector('.ctable'), alan = document.querySelector('.scores');
  if (!tablo || !alan) return;
  const satirlar = tablo.tBodies[0] ? tablo.tBodies[0].rows.length : 0;
  const anahtar = [satirlar, tablo.tHead ? tablo.tHead.rows[0].cells.length : 0, alan.clientHeight, alan.clientWidth].join('|');
  const uygula = y => { if (y == null) { tablo.classList.remove('olcekli'); tablo.style.removeProperty('--satir'); } else { tablo.classList.add('olcekli'); tablo.style.setProperty('--satir', y + 'px'); } };
  if (tabloOlcu && tabloOlcu.anahtar === anahtar) { uygula(tabloOlcu.y); return; }
  // yeni ölçü (Demir 10.11): satır yüksekliği, tablo alanı dolduracak şekilde sığan en büyük değer
  // (uzun tabloda incelir, az satırlıda büyür; boşluk kalmaz). Kısa ekranda en az 12 px, telefonda en çok 52, tablette 72.
  uygula(null);
  let y = null;
  if (satirlar) {
    const enAz = innerHeight < 760 ? 12 : 16, enCok = innerWidth >= 700 ? 72 : 52;
    const sigar = v => { uygula(v); return alan.scrollHeight <= alan.clientHeight + 1; };
    const bas = tablo.tHead ? tablo.tHead.getBoundingClientRect().height : 0;
    y = Math.max(enAz, Math.min(enCok, Math.floor((alan.clientHeight - bas - 4) / satirlar)));
    while (y > enAz && !sigar(y)) y--;
    while (y < enCok && sigar(y + 1)) y++;
    uygula(y);
  }
  tabloOlcu = { anahtar, y };
}
// Tablet çevrilince (Demir 09.11: "dikey/yatay çevirince Türk Kriketi skorboard bozuluyor"): iPad'de ekran boyu
// çevirme boyunca birkaç adımda değişir; ara ölçüye kilitlenmesin diye ölçü sıfırlanır ve yerleşim oturana dek tekrar ölçülür.
let cevirT = [];
function cevrildi() {
  if (S.view !== 'play') return;
  cevirT.forEach(clearTimeout);
  tabloOlcu = null; tabloSigdir();
  cevirT = [120, 350, 700].map(ms => setTimeout(() => { if (S.view === 'play') { tabloOlcu = null; tabloSigdir(); } }, ms));
}
addEventListener('resize', cevrildi);
addEventListener('orientationchange', cevrildi);
if (window.visualViewport) visualViewport.addEventListener('resize', cevrildi);

// Açılan pencereler (menü, kurallar, klasör, arama…) kapanırken kapanış efekti oynar, sonra ekran yenilenir
let kapaniyor = false;
function render() {
  const eski = !S.modal && !kapaniyor && app.querySelector('.modal-bg, .spot-perde');
  if (eski) {
    kapaniyor = true; eski.classList.add('kapan');
    setTimeout(() => { render(); kapaniyor = false; }, 230);
    return;
  }
  const v = S.view;
  let html = '';
  if (v === 'home') html = viewHome();
  else if (v === 'setup') html = viewSetup();
  else if (v === 'play') {
    // Güvenlik ağı: kayıtlı maç açılamazsa uygulama donmasın — ana ekrana dön, uygulama içi pencereyle sor
    try { html = viewPlay(); }
    catch (e) {
      console.error(e); S.view = 'home'; html = viewHome();
      setTimeout(async () => {
        if (await onayla({ baslik: t('Maç açılamadı'), metin: t('Bu maç eski bir sürümde kaydedilmiş ve açılamıyor. Maçı bitirip geçmişe kaydedelim mi?'), evet: t('Maçı bitir'), hayir: t('Vazgeç') })) { store.finishCurrent(); render(); }
      }, 0);
    }
  }
  else if (v === 'end') html = viewEnd();
  else if (v === 'players') html = viewPlayers();
  else if (v === 'stats') html = viewStats();
  else if (v === 'settings') html = viewSettings();
  else if (v === 'kamera') html = viewKamera();
  else if (v === 'about') html = viewAbout();
  else if (v === 'online') html = viewOnline();
  else if (v === 'nasil') html = nasilListe(header(t('Nasıl Oynanır')));
  else if (v === 'nasiloyna') html = nasilSahne(S.nasilId, header(S.nasilId === 'tarih' ? t('Dartın Tarihi') : esc(gt(GAMES[S.nasilId], 'name')), 'nasilliste'));
  // Dock yok (Demir 08.11): tablette üst çubuk menüsü, telefonda ana ekran simgeleri + ⌂
  // Kenar ışıkları (hesap makinesi): ana ekranda ve oyunda; başka ekrana geçince açık hesap makinesi kapanır
  const hmYer = S.view === 'play' && !S.modal;
  if (S.view !== 'home' && S.view !== 'play') hesapKapat(true);
  if (S.view !== 'setup') acilirKapat();
  const yeniHtml = topbar() + html + (hmYer ? kenarlar(hesapBaglam()) : '') + (S.modal ? modal() : '');
  // Oyun ekranında her okta bütün sayfa baştan kurulmaz (Demir 09.11: titreme): yalnız değişen parçalar değişir;
  // cam yüzeyler, kenar ışıkları, üst çubuk yerinde kalır. Tablo ölçüsü ekrana yansımadan önce uygulanır.
  if (v === 'play' && app.dataset.view === 'play') yamala(app, yeniHtml);
  else app.innerHTML = yeniHtml;
  if (v === 'kamera') kamEkran.yerlestir(document.getElementById('kam-yer')); else kamEkran.ayril(); // kamera ekranı kalıcı öğe
  if (S.view === 'play') tabloSigdir();
  if (v === 'nasiloyna') nasilBaslat(S.nasilId); else nasilDurdur();
  app.dataset.view = v;
  if (v === 'play') botKontrol();
}

// Kapsayıcının çocuklarını yeni HTML ile karşılaştırıp yalnız farklı olanları değiştirir; .play içinde bir kat daha iner.
// Karşılaştırma, öğenin kurulduğu HTML ile yapılır (sonradan eklenen sınıf / stil — ör. tablo ölçüsü — fark sayılmaz).
const kurHtml = new WeakMap();
function yamala(kap, yeniHtml) {
  const tpl = document.createElement('template');
  tpl.innerHTML = yeniHtml;
  const yeni = [...tpl.content.children];
  const eski = [...kap.children];
  for (let i = 0; i < Math.max(yeni.length, eski.length); i++) {
    const n = yeni[i], o = eski[i];
    if (!n) { o.remove(); continue; }
    const h = n.outerHTML;
    if (!o) { kap.appendChild(n); kurHtml.set(n, h); continue; }
    if ((kurHtml.get(o) ?? o.outerHTML) === h) continue;
    if (n.tagName === o.tagName && n.classList.contains('play') && o.classList.contains('play')) {
      o.className = n.className; kurHtml.set(o, h);
      yamala(o, n.innerHTML);
      continue;
    }
    o.replaceWith(n); kurHtml.set(n, h);
  }
}

// Cam Dock (demirkara.com telefon Dock'u gibi: 4 simge)
const ICONS = {
  home: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  players: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9" r="2.6"/><path d="M15.5 14.2c2.4-.2 4.4 1.4 5 4.3"/></svg>',
  stats: '<svg viewBox="0 0 24 24"><path d="M5 20V11M10 20V5M15 20v-7M20 20V8"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/></svg>',
};
function tabbar() {
  const tb = (id, label) => `<button class="tab ${S.view === id ? 'on' : ''}" data-act="tab" data-v="${id}" aria-label="${t(label)}"><span class="ico">${ICONS[id]}</span><span class="tl">${t(label)}</span></button>`;
  return `<nav class="tabbar glass">${tb('home', 'Oyunlar')}${tb('players', 'Oyuncular')}${tb('stats', 'İstatistik')}${tb('settings', 'Ayarlar')}</nav>`;
}

function header(title, back) {
  // Ana ekranda logo. Alt sayfalarda: solda geri, ortada küçük simge + başlık (Demir 08.11: simge başlığın başında, üst taraf sade)
  if (!title) return '<header class="top"><button class="logo-dugme" data-act="home" aria-label="DartX"><img class="logo" src="img/logo-dartx.webp" alt="DartX"></button></header>';
  const simge = { players: ikon('players'), stats: ikon('stats'), settings: ikon('settings'), online: ikon('grp-online'), nasil: ikon('nasil'), nasiloyna: S.nasilId ? (S.nasilId === 'tarih' ? ikon('nasil') : ikon(S.nasilId)) : '' }[S.view];
  return `<header class="kurulum-ust">
      <button class="geri-dugme" data-act="${back || 'home'}" aria-label="${t('Geri')}">${GERI_OK}<span>${t('Geri')}</span></button>
      <h1>${S.view === 'kamera' ? `<span class="kam-kart-ic kam-baslik-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kamEkran.IC.kamera}</svg></span>` : simge ? `<span class="app-ico simge">${simge}</span>` : ''}<span class="b-ad">${title}</span></h1>
      <span></span>
    </header>`;
}

// Ana sayfa
function viewHome() {
  store.araYukari();
  const cur = data().current;
  const d = data();
  const now = new Date();
  let widget;
  if (cur) {
    const g = GAMES[cur.gameId];
    // Demir 08.11: solda oyunun simgesi, oyuncular ve kısa skor (X01: kalan, Kriket: puan; leg/set varsa o da)
    // Her oyuncu bir satır: renkli rozet (baş harf) · ad · skor simgesiyle · leg kupayla (lucide, kurallar.js seti)
    const legVar = (cur.opts.legs || 1) > 1 || (cur.opts.sets || 1) > 1;
    const ozet = cur.sides.slice(0, 4).map((_, i) => {
      const s = cur.g && cur.g.s && cur.g.s[i];
      let skor = '', skorIc = KURAL_IKON.hedef;
      if (s && typeof s.score === 'number') skor = s.score;
      else if (s && typeof s.pts === 'number') { skor = s.pts; skorIc = KURAL_IKON.arti; }
      else if (s && typeof s.lives === 'number') { skor = s.lives; skorIc = KURAL_IKON.kalp; }
      const ad = E.sideName(cur, i, player);
      const renk = player(cur.sides[i].members[0]).color;
      return `<span class="dv-oyuncu ${i === cur.cur ? 'sirada' : ''} ${acikRenk(renk) ? 'dv-acik' : 'dv-koyu'}" style="--pc:${renk}">
        <span class="pc-av">${avatarIc(ad, esc(basHarf(ad)))}</span><span class="dv-ad">${esc(ad)}</span>
        ${skor !== '' ? `<span class="dv-deger">${skorIc}<b>${esc(String(skor))}</b></span>` : ''}
        ${legVar ? `<span class="dv-deger leg">${KURAL_IKON.kupa}<b>${cur.legsWon[i]}</b></span>` : ''}</span>`;
    }).join('');
    // Kalabalık maç (3+ taraf, Demir 08.11): liste uzamasın — üst üste rozetler + "N oyuncu", sıradaki ve öndeki tek satırda
    let ozetHtml = `<span class="dv-skorlar">${ozet}</span>`;
    if (cur.sides.length > 2) {
      const ss = cur.g && cur.g.s;
      const deger = i => (ss && ss[i] ? (typeof ss[i].score === 'number' ? ss[i].score : typeof ss[i].pts === 'number' ? ss[i].pts : typeof ss[i].lives === 'number' ? ss[i].lives : null) : null);
      const azIyi = ss && ss[0] && (typeof ss[0].score === 'number' || (typeof ss[0].pts === 'number' && cur.opts.scoring === 'ceza'));
      let onde = -1;
      cur.sides.forEach((_, i) => { const v = deger(i); if (v === null) return; if (onde < 0 || (azIyi ? v < deger(onde) : v > deger(onde))) onde = i; });
      const hepsiAyni = onde >= 0 && cur.sides.every((_, i) => deger(i) === deger(onde));
      const ad = i => esc(E.sideName(cur, i, player));
      const rozetler = cur.sides.slice(0, 5).map((sd, i) => `<span class="pc-av" style="--pc:${player(sd.members[0]).color}">${avatarIc(E.sideName(cur, i, player), esc(basHarf(E.sideName(cur, i, player))))}</span>`).join('')
        + (cur.sides.length > 5 ? `<span class="pc-av dv-fazla">+${cur.sides.length - 5}</span>` : '');
      ozetHtml = `<span class="dv-kalabalik">
          <span class="dv-rozetler">${rozetler}</span><span class="dv-sayi">${t('{0} oyuncu', cur.sides.length)}</span></span>
        <span class="dv-bilgi">
          <span>${KURAL_IKON.oynat}<i>${t('Sırada')}</i><b>${ad(cur.cur)}</b></span>
          ${onde >= 0 && !hepsiAyni ? `<span>${KURAL_IKON.kupa}<i>${t('Önde')}</i><b>${ad(onde)} · ${deger(onde)}</b></span>` : ''}
        </span>`;
    }
    widget = `<button class="widget glass resume devam-kart" data-act="resume">
      <span class="app-ico simge dv-ikon">${ikon(g.id)}</span>
      <span class="dv-govde">
        <span class="w-ust">${t('Devam eden maç')} · ${t('Tur {0}', cur.round)}</span>
        <b class="dv-oyun">${esc(gt(g, 'name'))}</b>
        ${ozetHtml}
      </span>
      <span class="pill gold dv-dugme">${t('Devam et →')}</span></button>`;
  } else widget = ''; // Demir 08.11: sade ana ekran — kutu yalnız devam eden maç varsa
  // Ortada "Ara" (sitedeki telefon ana ekranı gibi): basınca arama açılır
  const ara = `<button class="ara-hap" data-act="ara">${IC.ara}<span>${t('Ara')}</span></button>`;
  // Oyunlar 3 klasörde (iPhone klasörü gibi: içindeki oyunların minik simgeleri) + Oyuncular / İstatistik / Ayarlar
  const klasorler = CATS.map(([cat, label]) => `
      <button class="app" data-act="klasor" data-v="${cat}">
        <span class="app-ico simge">${ikon('grp-' + cat)}</span>
        <span class="app-ad">${t(label)}</span>
      </button>`).join('');
  const menu = [['players', 'Oyuncular'], ['stats', 'İstatistik'], ['settings', 'Ayarlar']].map(([v, l]) => `
      <button class="app" data-act="tab" data-v="${v}"><span class="app-ico simge">${ikon(v)}</span><span class="app-ad">${t(l)}</span></button>`).join('')
    + `<button class="app" data-act="tab" data-v="nasil"><span class="app-ico simge">${ikon('nasil')}</span><span class="app-ad">${t('Nasıl Oynanır')}</span></button>`
    + `<button class="app" data-act="tab" data-v="online"><span class="app-ico simge yakinda">${ikon('grp-online')}<i class="rozet-yakinda">${t('Yakında')}</i></span><span class="app-ad">${t('Online')}</span></button>`
    + `<button class="app" data-act="tab" data-v="about"><span class="app-ico simge resimli"><img src="icons/icon-192.png" alt=""></span><span class="app-ad">${t('Hakkında')}</span></button>`;
  // Ara verilmiş diğer maçlar (Demir 10.11): büyük kartın altında küçük satırlar — Devam ve Sil
  // Demir 10.11: iPad ana ekranı gibi — tablette solda analog saat aracı, yanında "Yarım Maçlar" aracı;
  // maçlar aracın içinde sağa-sola kaydırılarak gezilir (alt alta değil). Telefonda saat yok.
  const yarim = [cur, ...(data().ara || [])].filter(Boolean);
  const kayit = (am, ilk) => { const ag = GAMES[am.gameId]; if (!ag) return '';
    const rozet = am.sides.slice(0, 5).map((sd, i) => { const ad = E.sideName(am, i, player); return `<span class="pc-av" style="--pc:${player(sd.members[0]).color}">${avatarIc(ad, esc(basHarf(ad)))}</span>`; }).join('');
    const sirada = !am.done ? E.sideName(am, am.cur, player) : '';
    return `<div class="ym-sayfa">
      <div class="ym-ust"><span class="app-ico simge ym-ic">${ikon(ag.id)}</span>
        <span class="ym-ad"><small>${t('Tur {0}', am.round)}${ilk ? ' · ' + t('Son oynanan') : ''}</small><b>${esc(gt(ag, 'name'))}</b></span>
        <button class="ara-sil" data-act="arasil" data-id="${am.id}" aria-label="${t('Sil')}">${CARPI}</button></div>
      <div class="ym-kisiler"><span class="dv-rozetler">${rozet}</span><span>${t('{0} oyuncu', am.sides.length)}</span></div>
      ${sirada ? `<div class="ym-sira">${KURAL_IKON.oynat}<i>${t('Sırada')}</i><b>${esc(sirada)}</b></div>` : ''}
      <button class="pill gold ym-devam" data-act="${ilk ? 'resume' : 'aradevam'}" data-id="${am.id}">${t('Devam et →')}</button>
    </div>`; };
  const ymArac = yarim.length ? `<div class="arac ym-arac glass">
      <div class="arac-bas">${DURAKLAT_IC}<span>${t('Yarım Maçlar')}</span><small>${yarim.length}</small></div>
      <div class="ym-kaydir">${yarim.map((am, i) => kayit(am, i === 0)).join('')}</div>
      ${yarim.length > 1 ? `<div class="ym-noktalar">${yarim.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
    </div>` : '';
  // Demir 10.11: dijital saat (Apple gibi) — altında gün, tarih (yıllı) ve hava durumu
  const sy = saatYaz();
  const saatArac = `<div class="arac saat-arac glass" aria-hidden="true">
      <div class="ds-saat" data-saat="kisa">${sy.kisa}</div>
      <div class="ds-gun" data-saat="gun">${esc(sy.gun)}</div>
      <div class="ds-tarih" data-saat="tamTarih">${esc(sy.tamTarih)}</div>
      <div class="ds-hava" data-hava="uzun" ${hava ? '' : 'hidden'}>${havaYaz(true)}</div></div>`;
  const araListe = `<div class="araclar ${yarim.length ? '' : 'tek'}">${saatArac}${ymArac}</div>`;
  widget = '';
  return `<main class="page home">${header('')}${ara}${widget}${araListe}<div class="apps ana">${klasorler}${menu}</div></main>`;
}

// Klasör açılınca: buzlu perde üstünde grubun oyunları (iPhone klasörü gibi)
function klasorPano(cat) {
  const label = (CATS.find(c => c[0] === cat) || [])[1] || '';
  const oyunlar = GAME_LIST.filter(g => g.cat === cat).map(g => `
      <button class="app" data-act="pick" data-id="${g.id}" title="${esc(gt(g, 'short'))}">
        <span class="app-ico simge">${ikon(g.id)}</span><span class="app-ad">${esc(t(g.label))}</span>
      </button>`).join('');
  const say = GAME_LIST.filter(g => g.cat === cat).length;
  return `<div class="spot-perde klasor-perde" data-act="bg"><div class="klasor-pano">
    <div class="klasor-baslik"><span class="app-ico simge">${ikon('grp-' + cat)}</span><div><h2>${t(label)}</h2><small>${t('{0} oyun', say)}</small></div></div>
    <div class="apps">${oyunlar}</div></div></div>`;
}

// Kurulum
function defaultSetup(game) {
  const last = data().lastSetup[game.id];
  const opts = {};
  (game.options || []).forEach(o => (opts[o.key] = o.def));
  opts.legs = 1; opts.sets = 1;
  if (game.totalInput) opts.input = data().settings.x01Input || 'darts';
  const s = { opts, pids: [], teams: false, takim: {} };
  if (last) {
    Object.assign(s.opts, last.opts);
    s.pids = last.pids.filter(id => data().players.some(p => p.id === id));
    s.teams = !!last.teams;
    s.takim = {}; s.takimElle = false; // eski maçın takım dağılımı taşınmaz (Demir 09.11)
  }
  return s;
}

// Oyuncu seçimi (Demir 08.11: "listede 20 oyuncu olursa uzayıp gitmesin"): telefonun kendi çoklu seçicisi —
// iPhone'da işaretli liste, Android'de onay kutulu pencere. Seçilenler yukarıdaki sıraya eklenir, kaldırılanlar çıkar.
// Demir 10.11: oyuncu seçme listesinde DartBot'lar her zaman var; seçilince oyuncusu yoksa oluşturulur
function botOyuncu(sv) {
  const ad = 'DartBot ' + t(BOT_SEVIYE[sv].ad);
  let p = data().players.find(x => x.bot === sv) || data().players.find(x => x.name === ad);
  if (!p) { p = store.addPlayer(ad); store.updatePlayer(p.id, { bot: sv }); }
  else if (!p.bot) store.updatePlayer(p.id, { bot: sv });
  return p.id;
}
function secilebilir(pids) {
  const ps = data().players;
  const insan = ps.filter(p => !p.bot && !botMu(p.name) && !pids.includes(p.id)).map(p => ({ v: p.id, l: p.name, renk: p.color }));
  const botlar = Object.keys(BOT_SEVIYE).map(sv => ({ sv, p: ps.find(x => x.bot === sv) })).filter(x => !x.p || !pids.includes(x.p.id))
    .map(({ sv, p }) => ({ v: 'bot:' + sv, l: 'DartBot ' + t(BOT_SEVIYE[sv].ad), renk: p ? p.color : '#e3b866', bot: BOT_IC }));
  return [...insan, ...botlar];
}
const secimId = v => String(v).startsWith('bot:') ? botOyuncu(String(v).slice(4)) : v;
function oyuncuSecici(all, pids) {
  const sec = pids.length;
  return `<span class="secici oyuncu-secici" data-act="oyuncusecac" role="button" tabindex="0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/></svg>
      <span>${t('Oyuncu seç')}</span><small>${t('{0} / {1}', sec, all.length)}</small>
      <select multiple data-act="oyuncusec" aria-label="${t('Oyuncu seç')}">
        ${secilebilir(pids).map(x => `<option value="${x.v}">${x.bot ? '🤖 ' : ''}${esc(x.l)}</option>`).join('')}
      </select></span>`;
}
function secenekYaz(k, raw) {
  const o = (GAMES[S.gameId].options || []).find(x => x.key === k);
  const val = o ? o.values.find(v => String(v[0]) === raw)[0] : (['legs', 'sets'].includes(k) ? Number(raw) : raw);
  S.setup.opts[k] = val;
  render();
}
function chips(key, values, cur, act = 'opt') {
  // Demir 08.11: 4'ten fazla seçenek → telefonun kendi seçicisi (iPhone'da alttan çark, Android'de liste); cam hap görünümünde
  if (act === 'opt' && values.length > 4) {
    const secili = values.find(([v]) => String(v) === String(cur)) || values[0];
    return `<span class="secici" data-act="secac" data-k="${key}" role="button" tabindex="0">${t(String(secili[1]))}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      <select data-act="optsec" data-k="${key}" aria-label="${esc(key)}">${values.map(([v, l]) => `<option value="${esc(String(v))}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(t(String(l)))}</option>`).join('')}</select></span>`;
  }
  return `<div class="chips">` + values.map(([v, l, ic]) =>
    `<button class="chip ${ic ? 'chip-ic' : ''} ${String(cur) === String(v) ? 'on' : ''}" data-act="${act}" data-k="${key}" data-v="${v}">${ic || ''}${t(String(l))}</button>`).join('') + '</div>';
}
// Tekli / Takım seçeneklerinin simgeleri (lucide user / users)
// Oyun tuşlarının simgeleri (Demir 08.11): Double = iki katman, Triple = üç katman, Bull = hedef, Iska = yasak işareti
const TUS_IC = {
  // Demir 09.11 öneri: dart tahtası; double = dış ince halka dolu, triple = orta halka dolu
  double: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-width="3.6"/><circle cx="12" cy="12" r="6.4" opacity=".55"/><circle cx="12" cy="12" r="3.6" opacity=".55"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" opacity=".7"/></svg>',
  triple: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10" opacity=".55"/><circle cx="12" cy="12" r="6.4" stroke-width="3.6"/><circle cx="12" cy="12" r="3.6" opacity=".55"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" opacity=".7"/></svg>',
  eskiDouble: LUCIDE('<path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z"/><path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845"/>', 16, 2),
  eskiTriple: LUCIDE('<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>', 16, 2),
  bull: LUCIDE('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', 16, 2),
  disBull: LUCIDE('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/>', 16, 2), // lucide "disc"
  iska: LUCIDE('<circle cx="12" cy="12" r="10"/><path d="M4.929 4.929 19.07 19.071"/>', 15, 2),
};
const GIRIS_IC = LUCIDE('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>', 16, 2); // lucide layout-grid
// House (Demir 10.11): ev değil, tek hedefe saplanmış üç ok — Türk Kriketi'nde House = aynı sayıya üç ok
const HS_EV = LUCIDE('<circle cx="8" cy="16" r="6"/><circle cx="8" cy="16" r="2"/><path d="M8 16 18.5 5.5"/><path d="m18.5 5.5 2.6-.4"/><path d="m18.5 5.5.4-2.6"/><path d="M8 16 21 11.5"/><path d="m21 11.5 1.6 1.4"/><path d="m21 11.5.3-2.1"/><path d="M8 16 12.5 3.5"/><path d="m12.5 3.5-1.9-1"/><path d="m12.5 3.5 1.9-.6"/>', 16, 2);
const HS_CARPI = LUCIDE('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 16, 2);
const TEK_IC = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

// Kurulum alan başlıklarının simgeleri (lucide, kurallar.js ile aynı set)
const ALAN_IKON = { start: 'hedef', out: 'bayrak', in: 'oynat', scoring: 'arti', rounds: 'tekrar', legs: 'kupa', sets: 'yildiz',
  input: 'nisan', lives: 'kalp', zone: 'hedef', mode: 'hedef', bull: 'hedef', skip: 'tekrar', target: 'bayrak', count: 'tekrar',
  order: 'tekrar', sayilar: 'hedef', wickets: 'kurukafa', players: 'kisiler', teams: 'kisiler' };
const alanIkon = k => `<span class="alan-ikon">${KURAL_IKON[ALAN_IKON[k] || 'nisan']}</span>`;

const TUTAMAK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>';
const ARTI = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const CARPI = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

function viewSetup() {
  const g = GAMES[S.gameId];
  const st = S.setup;
  // Demir 09.11 (A · Ayar satırları): her ayar tek cam satır — solda simge + ad, sağda seçenekler
  const opts = (g.options || []).map(o => `<div class="field ayar-satir"><label>${alanIkon(o.key)}${t(o.label)}</label>${chips(o.key, o.values, st.opts[o.key])}</div>`).join('');
  const legs = g.legs ? `
    <div class="field ayar-satir"><label>${alanIkon('legs')}${t('Leg (ilk kazanan)')}</label><span class="sayac"><button class="sayac-b" data-act="legadim" data-d="-1" ${(st.opts.legs || 1) <= 1 ? 'disabled' : ''} aria-label="${t('Azalt')}">−</button><b>${st.opts.legs || 1}</b><button class="sayac-b" data-act="legadim" data-d="1" ${(st.opts.legs || 1) >= 9 ? 'disabled' : ''} aria-label="${t('Artır')}">+</button></span></div>
    <div class="field ayar-satir"><label>${alanIkon('sets')}${t('Set (ilk kazanan)')}</label>${chips('sets', [[1, 'Yok'], [2, '2'], [3, '3'], [4, '4']], st.opts.sets)}</div>` : '';
  const input = g.totalInput ? `<div class="field ayar-satir"><label>${alanIkon('input')}${t('Skor girişi')}</label>${chips('input', [['darts', 'Ok ok'], ['total', 'Tur toplamı']], st.opts.input)}</div>` : '';

  const all = data().players;
  st.pids = st.pids.filter(id => all.some(p => p.id === id)); // silinmiş oyuncu sırada kalmasın
  // Oynama sırası (Demir 08.11): seçilenler alt alta, tutamaktan sürükleyerek yer değiştirir; ✕ sıradan çıkarır
  const takimModu = g.teams && st.teams && st.pids.length >= 4;
  if (takimModu) takimlar(st);
  const sira = st.pids.map((id, i) => { const p = player(id); return `
    <div class="pchip on sira-satir" style="--pc:${p.color}" data-sira="${id}">
      <span class="sira-tut" aria-label="${t('Sürükle')}">${TUTAMAK}</span>
      <span class="pc-av">${avatarIc(p.name, i + 1)}</span><span class="pc-ad">${esc(p.name)}</span>
      ${takimModu ? `<button class="takim-rozet t-${st.takim[id].toLowerCase()}" data-act="takim" data-id="${id}" aria-label="${t('Takım ' + st.takim[id])}">${KALKAN(st.takim[id])}</button>` : ''}
      <button class="sira-cik" data-act="togglep" data-id="${id}" aria-label="${t('Sıradan çıkar')}">${CARPI}</button>
    </div>`; }).join('');
  const bekleyen = all.filter(p => !st.pids.includes(p.id));
  // Seçilmemişler de alt alta (Demir 08.11): dokununca sıranın sonuna eklenir
  const plist = bekleyen.map(p => `<button class="pchip sira-satir bekleyen" style="--pc:${p.color}" data-act="togglep" data-id="${p.id}">
      <span class="sira-tut"></span><span class="pc-av">${avatarIc(p.name, esc(basHarf(p.name)))}</span><span class="pc-ad">${esc(p.name)}</span>
      <span class="sira-cik sira-ekle" aria-hidden="true">${ARTI}</span></button>`).join('');

  const teamsOk = g.teams && st.pids.length >= 4;
  const teamsOn = teamsOk && st.teams;
  let teamPrev = '', takimBos = false;
  if (teamsOn) {
    const [a, b] = takimlar(st);
    takimBos = !a.length || !b.length;
    const kart = (h, ids) => `<div class="takim-kart t-${h.toLowerCase()}">${KALKAN(h)}<b>${t('Takım ' + h)}</b>
      <span>${ids.length ? ids.map(id => esc(player(id).name)).join(' · ') : `<i>${t('Boş')}</i>`}</span></div>`;
    teamPrev = `<div class="takimlar">${kart('A', a)}${kart('B', b)}</div><small class="muted takim-not">${t('Takımını değiştirmek için oyuncunun kalkanına dokun')}</small>`;
  }
  const n = st.pids.length;
  // Oynama sınırı (Demir 08.11: "oyuncu istediğimiz kadar, oynama sınırlarını sen belirle"): takımda g.max, tekli g.maxTekli
  const sinir = teamsOn ? (g.max || 8) : (g.maxTekli || g.max || 8);
  const okCount = n >= (g.min || 1) && n <= sinir && !takimBos;
  // Baş: solda geri, ortada oyunun adı, sağda oyunun simgesi
  return `<main class="page kurulum">
    <header class="kurulum-ust">
      <button class="geri-dugme" data-act="home" aria-label="${t('Geri')}">${GERI_OK}<span>${t('Geri')}</span></button>
      <h1><span class="app-ico simge">${ikon(g.id)}</span><span class="b-ad">${esc(gt(g, 'name'))}</span></h1>
      <span></span>
    </header>
    <div class="oyun-kart">
      <p>${esc(gt(g, 'short'))}</p>
      <button class="kural-dugme" data-act="rules">${IC.kitap}<span>${t('Kurallar')}</span></button>
    </div>
    <!-- Demir 09.11 (1 · İki eş panel): solda Ayarlar, sağda Oyuncular; Başla iki paneli kaplar -->
    <div class="kur-izgara"><section class="kur-panel kur-sol"><h2 class="kp-bas">${KURAL_IKON.nisan}<span>${t('Ayarlar')}</span></h2>${opts}${legs}${input}</section><section class="kur-panel kur-sag">
    <h2 class="kp-bas">${alanIkon('players')}<span>${t('Oyuncular')}</span><small class="kp-sayi">${n}</small><span class="kp-araclar">${n > 1 ? `<button class="kp-ic" data-act="shuffle" aria-label="${t('Sırayı karıştır')}" title="${t('Sırayı karıştır')}">${KARISTIR_IC}</button>` : ''}</span></h2>
      ${n ? `<div class="sira-liste">${sira}</div>` : `<p class="muted sira-bos">${t('Aşağıdan oyuncu seç — oynama sırası buraya gelir')}</p>`}
      <div class="ekle-satir">${oyuncuSecici(all, st.pids)}<form class="addp" data-act="addp"><input name="name" placeholder="${t('Yeni oyuncu adı')}" maxlength="14" autocomplete="off"><button class="btn sm">${t('Ekle')}</button></form></div>
    ${g.teams ? `<div class="field ayar-satir mod-satir"><label>${alanIkon('teams')}${t('Mod')}</label>${chips('teams', [['0', 'Tekli', TEK_IC], ['1', 'Takım (2 takım)', KURAL_IKON.kisiler]], teamsOn ? '1' : '0', 'teams')}${!teamsOk ? `<small class="muted">${t('Takım için en az 4 oyuncu seç')}</small>` : ''}${teamPrev}</div>` : ''}
    </section></div>
    <div class="kur-alt">
    <button class="btn primary big" data-act="start" ${okCount ? '' : 'disabled'}>${t('Başla')}</button>
    ${!okCount ? `<p class="muted center">${n > sinir ? (g.teams && !teamsOn && g.maxTekli && n <= (g.max || 8) ? t('Tekli en fazla {0} oyuncu — {1} kişi için Takım seç', sinir, n) : t('Bu oyun en fazla {0} oyuncuyla oynanır', sinir)) : g.min > 1 ? t('En az {0} oyuncu seç', g.min) : t('En az 1 oyuncu seç')}</p>` : ''}
    </div>
  </main>`;
}

// Takımlar (Demir 08.11): her oyuncunun takımı st.takim'de; atanmamışlar sırayla A, B, A, B… dağıtılır.
// Takım içindeki atış sırası listedeki sıradır; oyuncunun kalkanına dokununca takımı değişir.
// Demir 09.11: kendiliğinden dağılım her zaman sıraya göre eşit (1. A, 2. B, 3. A, 4. B…); eski maçın dağılımı geri
// gelmez. Kalkana dokunulunca (takimElle) o dağılım korunur — eşitsiz takım (3'e 1) yalnız bilerek kurulur.
function takimlar(st) {
  st.takim = st.takim || {};
  if (!st.takimElle) st.takim = Object.fromEntries(st.pids.map((id, i) => [id, i % 2 ? 'B' : 'A']));
  st.pids.forEach(id => {
    if (st.takim[id] !== 'A' && st.takim[id] !== 'B') {
      const a = st.pids.filter(x => st.takim[x] === 'A').length, b = st.pids.filter(x => st.takim[x] === 'B').length;
      st.takim[id] = a <= b ? 'A' : 'B';
    }
  });
  return [st.pids.filter(id => st.takim[id] === 'A'), st.pids.filter(id => st.takim[id] === 'B')];
}
// Takım simgesi: lucide shield (demirkara.com seti) + içinde takım harfi
const KALKAN = h => `<svg class="kalkan" viewBox="0 0 24 24" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><text x="12" y="15.6" text-anchor="middle" font-size="9.5" font-weight="800" fill="currentColor" fill-opacity="1" stroke="none" font-family="system-ui, sans-serif">${h}</text></svg>`;

// House / 3 in a bed: elin üç oku da aynı sayıya; son okta H seçilir
function houseAt(m, n) {
  const gg = GAMES[m.gameId];
  if ((m.turnDarts || []).length) { toast(t('House için elin ilk okundan başla'), 'bad'); render(); return; }
  let res = null;
  for (let k = 0; k < 3; k++) {
    const ok = { n, m: 1 };
    if (k === 2 && gg.secenekler) { const s = gg.secenekler(m, m.g, ok); if (s && s.some(x => x.v === 'H')) ok.sec = 'H'; }
    S.sonOk = ok; res = E.throwDart(m, ok);
    if (k < 2 && res && res.event && res.event !== 'dart') break;
  }
  afterThrow(res);
}
// Kura bitti: kazanan ilk atışı yapar
function kuraBitti(m, i) {
  if (!S.modal || S.modal.type !== 'baslayan') return;
  E.baslayanSec(m, i); store.setCurrent(m); vib(15); ses.oyun('kutlama');
  S.modal = { type: 'ilksira' }; render();
}
// İlk atış ekranı simgeleri: dart tahtası (Bull'a At) ve para yüzü
const BS_TAHTA = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#1c1a17" stroke="rgb(255 255 255 / .25)"/>${Array.from({ length: 20 }, (_, i) => { const a1 = (i * 18 - 9) * Math.PI / 180, a2 = (i * 18 + 9) * Math.PI / 180; const p = (r, a) => `${(32 + r * Math.sin(a)).toFixed(2)} ${(32 - r * Math.cos(a)).toFixed(2)}`; return `<path d="M ${p(27, a1)} A 27 27 0 0 1 ${p(27, a2)} L 32 32 Z" fill="${i % 2 ? '#e8dcc0' : '#26231f'}"/>`; }).join('')}<circle cx="32" cy="32" r="27" fill="none" stroke="#c0392b" stroke-width="3" opacity=".85"/><circle cx="32" cy="32" r="10" fill="#1e9e57"/><circle cx="32" cy="32" r="4.6" fill="#e74c3c" class="bs-merkez"/></svg>`;
const BS_ZAR = LUCIDE('<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>', 24, 1.8); // lucide dices
const BS_SEC = LUCIDE('<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/>', 24, 1.8); // lucide mouse-pointer-click
const BS_PARA_YUZ = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6" opacity=".55"/><path d="M12 8.5v7M9.8 10.2c.4-1 1.2-1.5 2.2-1.5 1.3 0 2.2.7 2.2 1.7 0 2.1-4.4 1.4-4.4 3.4 0 1 .9 1.7 2.2 1.7 1 0 1.8-.5 2.2-1.5"/></svg>`;

function startMatch() {
  const g = GAMES[S.gameId];
  const st = S.setup;
  let sides;
  if (g.teams && st.teams && st.pids.length >= 4) {
    const [a, b] = takimlar(st);
    // Boş takımla maç başlamaz; eşitsiz takım (3'e 1) bilerek kurulduysa bir kez sorulur (Demir 09.11)
    if (!a.length || !b.length) { ses.oyun('hata'); toast(t('Takım {0}\'de oyuncu yok', a.length ? 'B' : 'A'), 'bad'); return; }
    if (a.length !== b.length && !st.esitsizOnay) {
      onayla({ baslik: t('Takımlar eşit değil'), metin: t('Takım A {0} kişi, Takım B {1} kişi. Az kişili takımın oyuncuları daha sık atar. Başlayalım mı?', a.length, b.length), evet: t('Başla') })
        .then(ok => { if (ok) { st.esitsizOnay = true; startMatch(); st.esitsizOnay = false; } });
      return;
    }
    sides = [{ name: 'Takım A', members: a }, { name: 'Takım B', members: b }];
  } else sides = st.pids.map(id => ({ name: '', members: [id] }));
  data().lastSetup[g.id] = JSON.parse(JSON.stringify(st));
  if (st.opts.input) data().settings.x01Input = st.opts.input;
  E.clearUndo();
  const m = E.createMatch(g.id, { ...st.opts }, sides);
  store.setCurrent(m);
  S.mod = 1; S.totalBuf = '';
  // Başlama atışı (Demir 09.11: "oyun açınca mutlaka sor"): birden çok taraf varsa ilk leg'i kimin açacağı sorulur
  go('play', sides.length > 1 ? { modal: { type: 'baslayan' } } : {});
}

// Demir ve Kenan istisnası (Demir 09.11: "Demir ve Kenan yazınca mutlaka bizim resimlerimiz gelsin"):
// adı tam "Demir" ya da "Kenan" (ilk kelime) olan oyuncunun rozetinde baş harf / sıra numarası yerine kendi avatarı
const ozelResim = adResim;
// Kendimizi şımartalım (Demir 09.11): Oyuncular listesinde Demir ve Kenan'ın altın çerçeveli avatarı + unvanı
const UNVAN = ad => { const k = String(ad || '').trim().split(/\s+/)[0].toLocaleLowerCase('tr');
  return k === 'demir' ? `<small class="unvan">${t("DartX'in yaratıcısı")}</small>` : k === 'kenan' ? `<small class="unvan">${t('Siyah okların ustası')}</small>` : ''; };
const avatarIc = (ad, yedek) => { if (botMu(ad)) return botAvatar('oz-av'); const r = ozelResim(ad); return r ? `<img class="oz-av" src="${r}" alt="">` : yedek; };

// Oyun ekranı
function viewPlay() {
  const m = data().current;
  if (!m) return viewHome();
  const g = GAMES[m.gameId];
  const ctx = matchCtx(m);
  const pid = E.currentPid(m);
  const p = player(pid);
  const slots = [0, 1, 2].slice(0, g.dartsPerTurn || 3).map(i => {
    const d = m.turnDarts[i];
    return `<span class="slot ${d ? 'f' : ''}">${d ? dartLabel(d) : ''}</span>`;
  }).join('');
  const turnPts = m.turnDarts.reduce((a, d) => a + dartValue(d), 0);
  const hint = g.hint ? g.hint(m, m.g) : '';
  const cokLeg = g.legs && ((m.opts.legs || 1) > 1 || (m.opts.sets || 1) > 1);
  const setNo = (m.setsWon || []).reduce((a, b) => a + b, 0) + 1;
  const legTxt = cokLeg ? `${(m.opts.sets || 1) > 1 ? `<span class="pt-seg"><i>${t('Set')}</i><b>${setNo}</b></span>` : ''}<span class="pt-seg"><i>${t('Leg')}</i><b>${m.legNo}</b></span>` : '';
  const useTotal = g.totalInput && m.opts.input === 'total';
  const tabloYaz = tabloYazAcik(m, g);
  return `<div class="play ${g.cat === 'cricket' ? 'kriket' : ''} ${tabloYaz ? 'tablo-yaz' : ''} ${botSirasi(m) ? 'bot-sirasi' : ''}">
    <header class="top play-top">
      <button class="icon-btn" data-act="menu">☰</button>
      <h1><span class="pt-ad"><span class="app-ico simge pt-ic">${ikon(g.id)}</span>${esc(gt(g, 'name'))}</span><small class="pt-tur"><span class="pt-seg"><i>${t('Tur')}</i><b>${m.round}</b></span>${legTxt}</small></h1>
      ${kamDugme(useTotal)}
      ${okuma.destekli() ? `<button class="icon-btn pt-ses ${okuma.acikMi() ? 'acik' : ''}" data-sv="${okuma.seviye()}" data-act="sesliokuma" aria-label="${t('Sesli Okuma')}" title="${t('Sesli Okuma')}: ${okuma.acikMi() ? t('Açık') : t('Kapalı')}">${okuma.acikMi() ? OKUMA_IC : OKUMA_KAPALI_IC}</button>` : ''}
      <button class="geri-al" data-act="undo" ${E.canUndo(m) ? '' : 'disabled'} title="${t('Son oku geri al')}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg><span>${t('Atışı Geri Al')}</span></button>
    </header>
    <section class="scores">${g.view(m, m.g, ctx)}</section>
    <section class="turn" style="--pc:${p.color}">
      <div class="who" data-act="durumoku">${adAvatar(p.name)}<b>${esc(p.name)}</b>${m.sides[m.cur].members.length > 1 ? `<small>${esc(ctx.name(m.cur))}</small>` : ''}</div>
      ${useTotal ? `<div class="totalbuf">${S.totalBuf || '0'}</div>` : `<div class="slots">${slots}</div><div class="tp">${turnPts}</div>`}
      ${hint ? `<div class="hint">${esc(hint)}</div>` : ''}
      ${(() => { const ip = g.ipucu ? g.ipucu(m, m.g) : null; return ip ? `<div class="ipucu i-${ip.tur}">${IPUCU_IC}<span>${esc(ip.metin)}</span></div>` : ''; })()}
      ${(() => { const d = g.durum ? g.durum(m, m.g) : null; return d ? `<div class="durum-satir d-${d.tur}">${DURUM_YUZ[d.tur] || ''}<span>${esc(kelimeBuyuk(d.metin)).replace(/([+]?\d+ (Puan|Points|Ceza)|Puan Eşit|\d+ (Puan|Points) Behind)/, '<b class="ds-puan">$1</b>')}</span></div>` : ''; })()}
    </section>
    ${useTotal ? numpad() : keypad(m, g)}
  </div>`;
}

// "Tablodan yaz" (Demir 09.11, telefon): sayı tuşları gizlenir, sayı tablodaki hücreye dokunarak yazılır; tablo büyür.
// Kriket türlerinde, telefonda. Oyun başına hatırlanır; seçilmemişse uzun tablolarda (Full Board, 16+ satır) açık başlar.
const TABLO_IC = LUCIDE('<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>', 16, 2);
const KLAVYE_IC = LUCIDE('<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>', 16, 2);
function tabloYazAcik(m, g) {
  if (g.cat !== 'cricket' || innerWidth >= 720 || !g.view) return false;
  const kayit = (data().settings.tabloYaz || {})[m.gameId];
  if (kayit !== undefined) return kayit;
  return (m.g && m.g.h ? m.g.h.length : 0) > 15;
}

const GERI_IC = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>';
// Durum satırı (Demir 09.11): öndeyse gülen yüz + yeşil, gerideyse üzgün yüz + kırmızı, eşitse düz yüz; kelimeler büyük harfle
const yuz = agiz => LUCIDE('<circle cx="12" cy="12" r="10"/>' + agiz + '<line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>', 22, 2.2);
const DURUM_YUZ = { onde: yuz('<path d="M8 14s1.5 2 4 2 4-2 4-2"/>'), geride: yuz('<path d="M16 16s-1.5-2-4-2-4 2-4 2"/>'), esit: yuz('<line x1="8" x2="16" y1="15" y2="15"/>') };
const kelimeBuyuk = s => String(s).split(' ').map(w => w ? w.charAt(0).toLocaleUpperCase(dil() === 'en' ? 'en' : 'tr') + w.slice(1) : w).join(' ');
// Renk açık mı (Demir 09.11: açık renkte yazı siyah, koyu renkte beyaz)
function acikRenk(hex) {
  const h = String(hex || '').replace('#', ''); if (h.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4));
  return .2126 * r + .7152 * g + .0722 * b > .32;
}
// Sesli okuma (Demir 09.11): hoparlör simgesi
const SESLI_IC = LUCIDE('<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>', 22, 2);
const SESSIZ_IC = LUCIDE('<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>', 22, 2);
// Sesli okuma simgesi (Demir 09.11: "hoparlör değil, sesli okumayla ilgili"): konuşan kişi (lucide speech); kapalıyken üstü çizili
const OKUMA_IC = LUCIDE('<path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20"/><path d="M19.8 17.8a7.5 7.5 0 0 0 .003-10.603"/><path d="M17 15a3.5 3.5 0 0 0-.025-4.975"/>', 22, 2);
const OKUMA_KAPALI_IC = LUCIDE('<path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20"/><path d="m16 8 6 6"/><path d="m22 8-6 6"/>', 22, 2);
const TUS_SES_IC = LUCIDE('<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>', 22, 2);
const EFEKT_IC = LUCIDE('<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>', 22, 2);
const DURAKLAT_IC = LUCIDE('<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>', 24, 2);
// Sayfa geri düğmesi (Demir 09.11): ok simgesi tam ortada; tablette yanında "Geri" yazısı
const GERI_OK = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const IPUCU_IC = LUCIDE('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>', 16, 2);
const KARISTIR_IC = LUCIDE('<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>', 18, 2);
// Sıradaki Oyuncu simgesi (lucide skip-forward)
const SIRADAKI_IC = LUCIDE('<path d="M21 4v16"/><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/>', 20, 2.2);
// Analog saat aracı (tablet ana ekranı)
const SAAT_SVG = `<svg class="saat-svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" class="saat-yuz"/>${Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 86 : 80; return `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 90 * Math.sin(a)).toFixed(1)}" y2="${(100 - 90 * Math.cos(a)).toFixed(1)}" class="${i % 5 ? 'dk-cizgi' : 'sa-cizgi'}"/>`; }).join('')}${[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => { const a = i * 30 * Math.PI / 180; return `<text x="${(100 + 66 * Math.sin(a)).toFixed(1)}" y="${(100 - 66 * Math.cos(a) + 7).toFixed(1)}" class="saat-no">${n}</text>`; }).join('')}<line x1="100" y1="100" x2="100" y2="52" class="ibre-sa"/><line x1="100" y1="100" x2="100" y2="30" class="ibre-dk"/><line x1="100" y1="114" x2="100" y2="24" class="ibre-sn"/><circle cx="100" cy="100" r="5" class="ibre-orta"/></svg>`;
function saatIbre() {
  const s = document.querySelector('.saat-svg'); if (!s) return;
  const d = new Date(), sn = d.getSeconds(), dk = d.getMinutes() + sn / 60, sa = (d.getHours() % 12) + dk / 60;
  s.querySelector('.ibre-sa').setAttribute('transform', `rotate(${sa * 30} 100 100)`);
  s.querySelector('.ibre-dk').setAttribute('transform', `rotate(${dk * 6} 100 100)`);
  s.querySelector('.ibre-sn').setAttribute('transform', `rotate(${sn * 6} 100 100)`);
}
setInterval(saatIbre, 1000);
// Yarım maç aracı: kaydırınca alttaki noktalar
addEventListener('scroll', e => {
  const k = e.target; if (!k.classList || !k.classList.contains('ym-kaydir')) return;
  const i = Math.round(k.scrollLeft / k.clientWidth);
  k.parentElement.querySelectorAll('.ym-noktalar i').forEach((n, j) => n.classList.toggle('on', i === j));
}, true);
// Konuşma seviyesi (Demir 10.11): Sade = atışlar + sıra · Standart = + toplam, kalan, kapanan · Koç = + durum ve tavsiye
const SEVIYELER = [['kisa', 'Sade · yalnız atışlar'], ['normal', 'Standart · + toplam, kalan'], ['koc', 'Koç · + tavsiye']];
function seviyeKoy(sv) {
  data().settings.okumaSeviye = sv; store.save(); vib(6);
  document.querySelectorAll('.pt-ses').forEach(b => { b.dataset.sv = sv; });
}
// Konuşan kişi düğmesine basılı tutunca seviye menüsü (kısa dokunuş okumayı açar/kapatır)
let svUzun = false, svT = null;
app.addEventListener('pointerdown', e => {
  const b = e.target.closest('.pt-ses'); if (!b) return;
  clearTimeout(svT);
  svT = setTimeout(() => {
    svUzun = true; vib(20); ses.tus();
    acilirAc(b, () => SEVIYELER.map(([v, l]) => ({ v, l: t(l), on: okuma.seviye() === v, ic: OKUMA_IC })), v => seviyeKoy(v), { baslik: t('Konuşma'), en: 250 });
  }, 500);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => app.addEventListener(ev, () => clearTimeout(svT)));
// ---------- Kamera (Beta): telefonun kendi kamerası ya da eşleşmiş telefondan gelen atış ----------
const KAM_IC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';
function kamDugme(useTotal) {
  const d = kam.durum();
  if (d === 'ayarsiz' || useTotal) return '';
  return `<button class="icon-btn pt-kam" data-d="${d}" data-act="kamera" aria-label="${t('Kamera')}" title="${t('Kamera')}">${KAM_IC}</button>`;
}
function kameraAtis(p) {
  const m = data().current;
  if (S.view !== 'play' || !m || m.done) return;
  const g = GAMES[m.gameId];
  if (S.modal || botSirasi(m) || (g.totalInput && m.opts.input === 'total')) { toast(t('Kamera atışı yazılamadı: önce açık pencereyi kapat'), 'bad'); return; }
  const ok = { n: p.n, m: p.n === 0 ? 1 : p.m };
  const sec = g.secenekler ? g.secenekler(m, m.g, ok) : null;
  if (sec) { S.modal = { type: 'hedefsec', ok, sec }; vib(10); render(); return; }
  S.house = null; S.mod = 1; S.sonOk = ok;
  afterThrow(E.throwDart(m, ok));
}
kam.kur({
  atis: kameraAtis,
  durum: () => { if (S.view === 'play') render(); else if (S.view === 'settings') render(); },
});

// Atışı Geri Al'a uzun basma → geri al listesi
let uzunBasildi = false, uzunT = null;
app.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-act="undo"]'); if (!b || b.disabled || botSirasi(data().current)) return;
  clearTimeout(uzunT);
  uzunT = setTimeout(() => { uzunBasildi = true; vib(25); ses.tus(); S.modal = { type: 'gerilist' }; render(); }, 550);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => app.addEventListener(ev, () => clearTimeout(uzunT)));
app.addEventListener('contextmenu', e => { if (e.target.closest('[data-act="undo"]')) e.preventDefault(); });
// ---- DartBot sırası (Demir 10.11): sıra bota gelince okları kendisi atar; seçim sorulursa en anlamlısını seçer
// Seviye simgeleri (Demir 10.11): Kolay filiz, Orta hedef, Zor alev, Usta taç
const BOT_SV_IC = {
  kolay: LUCIDE('<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>', 22, 2),
  orta: LUCIDE('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', 22, 2),
  zor: LUCIDE('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 22, 2),
  usta: LUCIDE('<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>', 22, 2),
};
const BOT_IC = LUCIDE('<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>', 22, 2);
let botT = null, botEl = [];
function botSirasi(m) { if (!m || m.done) return false; const p = player(E.currentPid(m)); return !!(p && p.bot); }
function botKontrol() {
  clearTimeout(botT);
  const m = data().current;
  if (!m || m.done || S.view !== 'play' || S.modal || S.house) return;
  const p = player(E.currentPid(m)); if (!p || !p.bot) return;
  const ilk = !(m.turnDarts || []).length;
  botT = setTimeout(() => {
    const m2 = data().current;
    if (!m2 || m2 !== m || m2.done || S.view !== 'play' || S.modal) return;
    if (player(E.currentPid(m2)).id !== p.id) return;
    const gg = GAMES[m2.gameId];
    const ok = botAt(botHedef(gg, m2, p.bot), p.bot);
    if (gg.secenekler) { const sec = gg.secenekler(m2, m2.g, ok); if (sec) { const iyi = sec.find(x => !x.etkisiz && x.e && x.e.tur !== 'bos') || sec.find(x => !x.etkisiz) || sec[0]; ok.sec = iyi.v; } }
    S.sonOk = ok;
    if (ilk) botEl = [];
    botEl.push(ok.n === 0 ? t('Iska') : dartLabel(ok));
    const res = E.throwDart(m2, ok);
    if (res && ['turn', 'bust', 'leg', 'set'].includes(res.event)) S.botOzet = { ad: p.name, oklar: botEl.slice() };
    afterThrow(res);
  }, ilk ? 2100 : 850);
}

// Isı haritası: tahta (20 dilim × tekli dış, triple, tekli iç, double) + bull; renk yoğunluğu isabet sayısına göre
const TAHTA_SIRA = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
function isiTahta(isi) {
  const k = isi.k, en = Math.max(1, ...Object.entries(k).filter(([a]) => a !== 'iska').map(([, v]) => v));
  const renk = v => { if (!v) return 'rgb(255 255 255 / .06)'; const o = v / en; return `rgb(${Math.round(255)} ${Math.round(200 - 170 * o)} ${Math.round(80 - 60 * o)} / ${(.25 + .75 * o).toFixed(2)})`; };
  const yay = (r1, r2, a1, a2) => { const P = (r, a) => `${(100 + r * Math.sin(a)).toFixed(2)} ${(100 - r * Math.cos(a)).toFixed(2)}`;
    return `M ${P(r2, a1)} A ${r2} ${r2} 0 0 1 ${P(r2, a2)} L ${P(r1, a2)} A ${r1} ${r1} 0 0 0 ${P(r1, a1)} Z`; };
  const halka = [[78, 86, 2], [52, 78, 1], [46, 52, 3], [14, 46, 1]];
  let svg = '';
  TAHTA_SIRA.forEach((n, i) => {
    const a1 = (i * 18 - 9) * Math.PI / 180, a2 = (i * 18 + 9) * Math.PI / 180;
    halka.forEach(([r1, r2, mm], hi) => { const key = n + ':' + mm; const v = hi === 3 ? (k[n + ':1'] || 0) : (hi === 1 ? 0 : (k[key] || 0));
      const sayi = hi === 1 || hi === 3 ? (k[n + ':1'] || 0) / 2 : v;
      svg += `<path d="${yay(r1, r2, a1, a2)}" fill="${renk(sayi)}" stroke="rgb(255 255 255 / .18)" stroke-width=".6"><title>${mm === 3 ? 'T' : mm === 2 ? 'D' : ''}${n}: ${k[key] || 0}</title></path>`; });
    const a = i * 18 * Math.PI / 180;
    svg += `<text x="${(100 + 94 * Math.sin(a)).toFixed(1)}" y="${(100 - 94 * Math.cos(a) + 3.5).toFixed(1)}" class="isi-no">${n}</text>`;
  });
  svg += `<circle cx="100" cy="100" r="14" fill="${renk(k.b25 || 0)}" stroke="rgb(255 255 255 / .25)" stroke-width=".6"><title>25: ${k.b25 || 0}</title></circle>`;
  svg += `<circle cx="100" cy="100" r="6" fill="${renk(k.b50 || 0)}" stroke="rgb(255 255 255 / .35)" stroke-width=".6"><title>Bull: ${k.b50 || 0}</title></circle>`;
  // en çok vurulan 5 bölge
  const ilk5 = Object.entries(k).filter(([a]) => a !== 'iska').sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([a, v]) => { const ad = a === 'b25' ? '25' : a === 'b50' ? 'Bull' : (a.split(':')[1] === '3' ? 'T' : a.split(':')[1] === '2' ? 'D' : '') + a.split(':')[0]; return `<span><b>${ad}</b> %${Math.round(v / isi.n * 100)}</span>`; }).join('');
  return `<div class="isi-icerik"><svg class="isi-svg" viewBox="0 0 200 200">${svg}</svg><div class="isi-ilk">${ilk5}<span class="isi-iska"><b>${t('Iska')}</b> %${Math.round((k.iska || 0) / isi.n * 100)}</span></div></div>`;
}

function keypad(m, g) {
  const hl = new Set((g.highlight ? g.highlight(m, m.g) : []).map(d => d.n));
  const mod = S.mod;
  // Hızlı giriş (Demir 09.11: "tuşları 3'e bölsek, 10 single 10 double 10 triple"): kriket oyunlarında her sayı kutucuğu
  // üstte tekli, altta D (mavi) ve T (mor) — her ok tek dokunuş. Ayarı oyun başına; varsayılan açık.
  // Kural (Demir 09.11): ok ok girilen BÜTÜN oyunlarda Hızlı (sayı + D + T) ve Klasik (Double/Triple tuşu) seçilebilir
  const hizli = (data().settings.kriketGiris || {})[m.gameId] !== 'klasik';
  const num = n => hizli
    ? `<div class="k3 ${hl.has(n) ? 'hl' : ''}"><button class="k num k3-s" data-act="dart" data-n="${n}" data-fix="1">${n}</button><div class="k3-alt"><button class="k3-d" data-act="dart" data-n="${n}" data-fix="2" aria-label="D${n}">D</button><button class="k3-t" data-act="dart" data-n="${n}" data-fix="3" aria-label="T${n}">T</button></div></div>`
    : `<button class="k num ${hl.has(n) ? 'hl' : ''}" data-act="dart" data-n="${n}">${n}</button>`;
  const nums = [];
  // Oyun yalnız belli sayılarla oynanıyorsa (ör. Türk Kriketi 20–10) tuş takımında yalnız onlar; geri kalan oklar "Iska"
  const sadece = g.tuslar ? g.tuslar(m, m.g) : null;
  if (sadece && sadece.length) sadece.forEach(n => nums.push(num(n)));
  else for (let n = 1; n <= 20; n++) nums.push(num(n));
  const sutun = !sadece ? 5 : sadece.length <= 6 ? 3 : sadece.length <= 8 ? 4 : sadece.length <= 12 ? 4 : 5;
  // Demir 09.11: sayı ızgarasında boş kalan yere "Son Atışı Geri Al" (üstteki gizlenir)
  const bos = (sutun - nums.length % sutun) % sutun;
  if (bos) nums.push(`<button class="k geri-tus" style="grid-column: span ${bos}" data-act="undo" ${E.canUndo(m) ? '' : 'disabled'}>${GERI_IC}<span>${t('Atışı Geri Al')}</span><small class="geri-not">${t('Basılı tut: liste')}</small></button>`);
  return `<section class="keypad mod${mod} ${hizli ? 'hizli' : ''} ${S.house ? 'modH' : ''}">
    <div class="mods">
      ${hizli ? '' : `<button class="k mod ${mod === 2 ? 'on' : ''}" data-act="mod" data-m="2">${TUS_IC.double}<span>DOUBLE</span></button>
      <button class="k mod ${mod === 3 ? 'on' : ''}" data-act="mod" data-m="3">${TUS_IC.triple}<span>TRIPLE</span></button>`}
      ${(m.g && m.g.h || []).includes('H') ? `<button class="k mod house-tus ${S.house ? 'on' : ''}" data-act="housemod" data-h="H" ${(m.turnDarts || []).length && !S.house ? 'disabled' : ''}>${HS_EV}<span>HOUSE</span></button>` : ''}
      ${(m.g && m.g.h || []).includes('B3') ? `<button class="k mod house-tus ${S.house ? 'on' : ''}" data-act="housemod" data-h="B3" ${(m.turnDarts || []).length && !S.house ? 'disabled' : ''}>${HS_EV}<span>3 IN A BED</span></button>` : ''}
      ${`<button class="k mod giris-dugme" data-act="kriketgiris" aria-label="${hizli ? t('Klasik giriş') : t('Hızlı giriş')}" title="${hizli ? t('Klasik giriş (Double/Triple tuşu)') : t('Hızlı giriş (her sayıda D ve T)')}">${hizli ? GIRIS_IC : TUS_IC.double}<span>${hizli ? t('Hızlı') : t('Klasik')}<i class="gd-degis" aria-hidden="true">⇄</i></span></button>`}
      ${!bos ? `<button class="k mod geri-tus geri-modda" data-act="undo" ${E.canUndo(m) ? '' : 'disabled'}>${GERI_IC}<span>${t('Atışı Geri Al')}</span><small class="geri-not">${t('Basılı tut: liste')}</small></button>` : ''}
      ${g.cat === 'cricket' && g.view ? (tabloYazAcik(m, g)
        ? `<button class="k mod tablo-dugme" data-act="tabloyaz" data-v="0" aria-label="${t('Tuşlarla yaz')}" title="${t('Tuşlarla yaz')}">${KLAVYE_IC}</button>`
        : `<button class="k mod tablo-dugme" data-act="tabloyaz" data-v="1" aria-label="${t('Tablodan yaz')}" title="${t('Tablodan yaz')}">${TABLO_IC}</button>`) : ''}
    </div>
    <div class="nums ${bos ? 'geri-icte' : ''}" style="--sutun:${sutun}">${nums.join('')}</div>
    <div class="extra">
      <button class="k bull-dis ${hl.has(25) ? 'hl' : ''}" data-act="dart" data-n="25" data-fix="1"><span class="b-ust">${TUS_IC.disBull}<span>BULL</span></span><small>25</small></button>
      <button class="k bull ${hl.has(25) ? 'hl' : ''}" data-act="dart" data-n="25" data-fix="2"><span class="b-ust">${TUS_IC.bull}<span>D-BULL</span></span><small>50</small></button>
      <button class="k miss" data-act="dart" data-n="0">${TUS_IC.iska}<span>${t('Iska')}</span></button>
      <button class="k next" data-act="pass">${SIRADAKI_IC}<span>${t('Sıradaki Oyuncu')}</span></button>
    </div>
  </section>`;
}

function numpad() {
  const b = (v, l = v, cls = '') => `<button class="k ${cls}" data-act="np" data-v="${v}">${l}</button>`;
  const quick = [26, 41, 45, 60, 81, 85, 100, 140, 180].map(v => `<button class="k q" data-act="npq" data-v="${v}">${v}</button>`).join('');
  return `<section class="keypad numpad">
    <div class="quick">${quick}</div>
    <div class="np">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => b(n)).join('')}${b('del', '⌫', 'miss')}${b(0)}${b('ok', t('GİR'), 'next')}</div>
  </section>`;
}

// Oyun sesi (Demir 09.11): ok saplanır; tur sonunda 180 / bust / leg / maç sesi ardından çalar
function oyunSesi(res, m) {
  const son = m.log[m.log.length - 1];
  const ok = S.sonOk; S.sonOk = null;
  if (ok) ok.n === 0 ? ses.oyun('iska') : ok.n === 25 ? ses.oyun('bull', ok.m) : ses.oyun('isabet', ok.m);
  const sonra = ad => setTimeout(() => ses.oyun(ad), ok ? 140 : 0);
  if (res.event === 'match') sonra('mac');
  else if (res.event === 'leg' || res.event === 'set') sonra('leg');
  else if (res.event === 'bust') sonra('bust');
  else if (res.event === 'turn' && son && son.points === 180) sonra('yuzseksen');
  else if (m.msg) { const u = uyariTur(m.msg); if (u.ses) sonra(u.ses); }
}

function afterThrow(res) {
  const m = data().current;
  if (!res) return;
  vib(res.event === 'dart' ? 12 : 30);
  oyunSesi(res, m);
  try { const sp = player(E.currentPid(m)); okuma.atisOku(m, res, sp && sp.name, GAMES[m.gameId]); } catch (e) { /* okuma hatası oyunu durdurmasın */ }
  if (res.event === 'bust') toast('BUST!', 'bad');
  else if (res.event === 'leg' || res.event === 'set') { S.modal = { type: 'legbitti', ev: res.event, kazanan: res.winner }; konfeti(); }
  else if (m.msg) toast(esc(m.msg), m.kutla ? 'kutla' : '');
  else if (res.event === 'turn' && m.log.length && m.log[m.log.length - 1].points === 180) toast('180!', 'kutla');
  const buyukUyari = res.event === 'bust' || res.event === 'leg' || res.event === 'set' || !!m.msg || (res.event === 'turn' && m.log.length && m.log[m.log.length - 1].points === 180);
  if (['turn', 'bust'].includes(res.event)) siraGoster(m, buyukUyari ? 1600 : 120); // leg/set: pencere kapanınca
  delete m.kutla;
  if (res.event === 'match') {
    store.finishCurrent();
    S.lastMatch = m;
    setTimeout(konfeti, 120); setTimeout(konfeti, 700); // maç bitti: kupa + iki dalga konfeti (Demir 09.11)
    go('end');
    return;
  }
  store.setCurrent(m);
  render();
}

// Maç sonu
function viewEnd() {
  const m = S.lastMatch;
  if (!m) return viewHome();
  const g = GAMES[m.gameId];
  const ctx = matchCtx(m);
  const solo = m.sides.length === 1;
  const title = solo ? t(g.cat === 'practice' ? 'Antrenman tamam!' : 'Oyun bitti!') : m.winner === -1 ? t('Berabere!') : t('{0} kazandı!', esc(ctx.name(m.winner)));
  const pids = m.sides.flatMap(s => s.members);
  const rows = g.summary ? g.summary(m, pids[0]).map(([label], ri) =>
    `<tr><th>${t(label)}</th>${pids.map(pid => `<td>${g.summary(m, pid)[ri][1]}</td>`).join('')}</tr>`).join('') : '';
  const legs = g.legs && m.legLog.length > 1 ? `<p class="center muted">Leg: ${m.sides.map((_, i) => `${esc(ctx.name(i))} ${m.legLog.filter(l => l.winner === i).length}`).join(' · ')}</p>` : '';
  return `<main class="page end">
    <div class="lb-ust mac-sonu"><span class="lb-ikon">${UYARI_IC.kupa}</span></div>
    <h1 class="center">${title}</h1>
    <p class="center muted">${esc(gt(g, 'name'))} · ${t('{0} dk', Math.max(1, Math.round((m.ended - m.started) / 60000)))}</p>
    ${legs}
    ${rows ? `<div class="tablewrap"><table class="sum"><thead><tr><th></th>${pids.map(pid => `<th style="color:${player(pid).color}">${esc(player(pid).name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>` : ''}
    <button class="btn primary big" data-act="rematch">${t('Rövanş')}</button>
    <div class="row">
      <button class="btn" data-act="undoend" ${E.canUndo(m) ? '' : 'disabled'}>${t('↶ Son oku geri al')}</button>
      <button class="btn" data-act="home">${t('Ana sayfa')}</button>
    </div>
  </main>`;
}

// Oyuncular — çöp kutusu: lucide trash-2 (demirkara.com ile aynı set); silmeden önce uygulama içi onay
const GRAFIK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>';
const KALEM = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
const COP = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
function viewPlayers() {
  // Demir 08.11: üstte arama — yazdıkça liste süzülür (ekran yeniden çizilmez, klavye kapanmaz)
  const q = (S.oyuncuAra || '').trim().toLocaleLowerCase('tr');
  const list = data().players.map(p => `
    <div class="prow" style="--pc:${p.color}" data-sira="${p.id}" data-ad="${esc(p.name.toLocaleLowerCase('tr'))}" ${q && !p.name.toLocaleLowerCase('tr').includes(q) ? 'hidden' : ''}>
      <span class="prow-tut" aria-label="${t('Sürükle')}" title="${t('Sürükle')}">${TUTAMAK}</span>
      ${botMu(p.name) ? botAvatar('bot-prow') : ozelResim(p.name) ? `<img class="oz-av prow-av" src="${ozelResim(p.name)}" alt="">` : '<span class="dot"></span>'}<b>${esc(p.name)}${UNVAN(p.name)}</b>
      <button class="prow-ic" data-act="pstats" data-id="${p.id}" aria-label="${t('İstatistik')}" title="${t('İstatistik')}">${GRAFIK}</button>
      <button class="prow-ic" data-act="pedit" data-id="${p.id}" aria-label="${t('Düzenle')}" title="${t('Düzenle')}">${KALEM}</button>
      <button class="prow-sil" data-act="pdel" data-id="${p.id}" aria-label="${t('Oyuncuyu sil')}" title="${t('Oyuncuyu sil')}">${COP}</button>
    </div>`).join('') || `<p class="muted center">${t('Henüz oyuncu yok. Aşağıdan ekle.')}</p>`;
  const ara = data().players.length ? `<label class="oyuncu-ara">${IC.ara}<input type="search" data-act="oyuncuara" value="${esc(S.oyuncuAra || '')}" placeholder="${t('Oyuncu ara')}" autocomplete="off" enterkeyhint="search"><span class="oa-sayi">${data().players.length}</span></label>
    <p class="muted center oa-bos" hidden>${t('Sonuç yok')}</p>` : '';
  return `<main class="page oyuncular">${header(t('Oyuncular'))}
    ${ara}
    <div class="prow-liste">${list}</div>
    <form class="addp" data-act="addp"><input name="name" placeholder="${t('Yeni oyuncu adı')}" maxlength="14" autocomplete="off"><button class="btn sm">${t('Ekle')}</button></form>
    <div class="bot-ekle glass"><div class="bot-bas">${BOT_IC}<b>DartBot</b><small>${t('Bilgisayara karşı oyna — seviye seç')}</small></div>
      <div class="bot-seviyeler">${Object.entries(BOT_SEVIYE).map(([k, v]) => `<button class="btn bot-sv bot-${k}" data-act="botekle" data-v="${k}"><span class="bsv-ic">${BOT_SV_IC[k]}</span><span class="bsv-yazi"><b>${t(v.ad)}</b><small>${t('~{0} ort.', v.ort)}</small></span></button>`).join('')}</div></div>
  </main>`;
}

// İstatistik
function viewStats() {
  const players = data().players;
  if (!players.length) return `<main class="page">${header(t('İstatistik'))}<p class="muted center">${t('Önce oyuncu ekle.')}</p></main>`;
  const pid = S.statPid && players.some(p => p.id === S.statPid) ? S.statPid : players[0].id;
  const st = playerStats(pid);
  const sel = `<div class="pchips">${players.map(p => `<button class="pchip ${p.id === pid ? 'on' : ''}" style="--pc:${p.color}" data-act="statp" data-id="${p.id}"><span class="pc-av">${avatarIc(p.name, esc(basHarf(p.name)))}</span><span class="pc-ad">${esc(p.name)}</span></button>`).join('')}</div>`;
  const tile = (v, l) => `<div class="tile"><b>${v}</b><span>${t(l)}</span></div>`;
  const x = st.x01;
  const c = st.cricket;
  const recent = st.recent.map(m => {
    const w = m.winner >= 0 && m.sides[m.winner].members.includes(pid);
    return `<div class="hrow"><span class="${w ? 'w' : 'l'}">${m.winner === -1 ? '=' : t(w ? 'G' : 'M')}</span><b>${esc(gt(GAMES[m.gameId], 'name'))}</b><small>${new Date(m.started).toLocaleDateString(yerel())} · ${m.sides.map((_, i) => esc(E.sideName(m, i, player))).join(' vs ')}</small></div>`;
  }).join('');
  return `<main class="page istatistik">${header(t('İstatistik'))}${sel}
    <div class="tiles">${tile(st.played, 'Maç')}${tile(st.wins, 'Galibiyet')}${tile(pct(st.wins, st.played), 'Kazanma')}</div>
    ${x ? `<h2 class="sec">X01</h2><div class="tiles">
      ${tile(fmt1(x.avg), '3 ok ort.')}${tile(fmt1(x.first9), 'İlk 9 ort.')}${tile(Number.isFinite(x.checkout) ? Math.round(x.checkout * 100) + '%' : '–', t('Checkout ({0}/{1})', x.coHits, x.coAtt))}
      ${tile(x.hiCo || '–', 'En yüksek bitiriş')}${tile(x.bestLeg || '–', 'En kısa leg (ok)')}${tile(x.hiTurn || '–', 'En yüksek tur')}
      ${tile(x.t100, '100+')}${tile(x.t140, '140+')}${tile(x.t180, '180')}</div>` : ''}
    ${c ? `<h2 class="sec">${t('Kriket')}</h2><div class="tiles">${tile(Number.isFinite(c.mpr) ? c.mpr.toFixed(2) : '–', 'MPR')}${tile(c.bestTurn, 'En iyi tur (işaret)')}${tile(c.darts, 'Ok')}</div>` : ''}
    ${st.records.length ? `<h2 class="sec">${t('Rekorlar')}</h2><div class="tiles">${st.records.map(r => tile(r.best + (r.unit ? ' ' + t(r.unit) : ''), `${esc(gt(GAMES[r.id], 'name'))} · ${t('{0} kez', r.n)}`)).join('')}</div>` : ''}
    ${st.isi && st.isi.n ? `<h2 class="sec">${t('Isı haritası')}</h2><div class="isi-kutu glass">${isiTahta(st.isi)}<p class="muted isi-not">${t('{0} ok · koyu kırmızı = en çok isabet', st.isi.n)}</p></div>` : ''}
    <h2 class="sec">${t('Son maçlar')}</h2>${recent || `<p class="muted">${t('Henüz maç yok.')}</p>`}
  </main>`;
}

// Ayarlar
// Ayarlar (iPhone Ayarlar uygulaması gibi gruplu cam liste). Satır simgeleri lucide-react 1.26.0 — demirkara.com ile aynı set.
const AY = {
  kamera: LUCIDE('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>', 17),
  telefon: LUCIDE('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>', 17),
  sirket: LUCIDE('<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>', 18),
  insta: LUCIDE('<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>', 18),
  disari: LUCIDE('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/>', 14),
  dil: LUCIDE('<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>', 17),
  tema: LUCIDE('<path d="M12 2v2"/><path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/><path d="M16 12a4 4 0 0 0-4-4"/><path d="m19 5-1.256 1.256"/><path d="M20 12h2"/>', 17),
  tusSes: LUCIDE('<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>', 17),
  oyunSes: LUCIDE('<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>', 17),
  titresim: LUCIDE('<path d="m2 8 2 2-2 2 2 2-2 2"/><path d="m22 8-2 2 2 2-2 2 2 2"/><rect width="8" height="14" x="8" y="5" rx="1"/>', 17),
  ekran: LUCIDE('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>', 17),
  indir: LUCIDE('<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>', 17),
  yukle: LUCIDE('<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>', 17),
  veri: LUCIDE('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>', 17),
  sil: LUCIDE('<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', 17),
  ok: LUCIDE('<path d="m9 18 6-6-6-6"/>', 16),
  yildiz: LUCIDE('<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/>', 17), // boyut yoktu: kutuyu dolduruyordu (Demir 10.11)
  kisi: LUCIDE('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 17),
  etiket: LUCIDE('<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>', 17),
  hediye: LUCIDE('<path d="M12 7v14"/><path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"/><rect x="3" y="7" width="18" height="4" rx="1"/>', 17),
  bilgi: LUCIDE('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>', 15),
  tokmak: LUCIDE('<path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381"/><path d="m16 16 6-6"/><path d="m21.5 10.5-8-8"/><path d="m8 8 6-6"/><path d="m8.5 7.5 8 8"/>', 17),
  kure: LUCIDE('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>', 17),
};
// Hakkında: yazan, neden yazıldı, telif
const SURUM = `1.1 Beta · ${t('Derleme')} ${DERLEME}`;
// Kart: başlığı kartın içinde, simgeli (Demir 08.11: dışarıda asılı başlık sırıtıyordu)
const kart = (ic, baslik, ic2, ek = '') => `<section class="ay-grup ${ek}"><div class="kart-bas">${ic}<span>${baslik}</span></div>${ic2}</section>`;
const ikonKutu = ic => `<span class="ay-ikon">${ic}</span>`;

function viewAbout() {
  const bilgi = (ic, ad, deger) => `<div class="ay-satir">${ikonKutu(ic)}<span class="ay-ad">${ad}</span><span class="ay-deger">${deger}</span></div>`;
  const yil = new Date().getFullYear();
  return `<main class="page ayarlar hakkinda">
    <header class="kurulum-ust">
      <button class="geri-dugme" data-act="home" aria-label="${t('Geri')}">${GERI_OK}<span>${t('Geri')}</span></button>
      <h1><span class="app-ico simge resimli"><img src="icons/icon-192.png" alt=""></span><span class="b-ad">${t('Hakkında')}</span></h1>
      <span></span>
    </header>
    <div class="hk-kapak"><img class="hk-logo" src="img/logo-dartx.webp" alt="DartX"></div>
    <div class="ay-grup hk-metin">
      <div class="hk-profil"><img src="img/demir-kara.webp" alt="Demir Kara"><div><b>Demir Kara</b><small>${t('Mimar · DartX\'in geliştiricisi')}</small></div></div>
      <p>${t('Asıl mesleğim mimarlık; günlerim çizim masasında ve şantiyede geçiyor. Bilgisayara olan merakım ise beni yıllar önce ilk işime taşımıştı; dart da yıllardır en sevdiğim hobim. Tahtanın başında geçen akşamlar, dostlarla atılan oklar, her atışta biraz daha iyi olma isteği… Bugün kendimi iyi bir dart oyuncusu olarak görüyorsam, bunda bu sevginin payı büyük.')}</p>
      <p>${t('Bir gün bu merakları birleştirip DartX\'i yazdım. Skor için kâğıt kalem aramayın, antrenmanlarınızı kaydedin, maçlarınızı dostlarınızla daha keyifli oynayın diye.')}</p>
      <p>${t('DartX\'i bu oyunu sevenler için ücretsiz yaptım. Çizdiğim her çizginin, attığım her okun, yazdığım her satırın arkasındayım. İyi oyunlar, bol 180\'ler!')}</p>
      <div class="hk-imza"><img class="imza-beyaz" src="img/imza-beyaz.png" alt="Demir Kara"><img class="imza-siyah" src="img/imza-siyah.png" alt="" aria-hidden="true"></div>
    </div>
    ${kart(AY.bilgi, t('Bilgi'), `
      ${bilgi(AY.kisi, t('Geliştirici'), 'Demir Kara')}
      ${bilgi(AY.etiket, t('Sürüm'), SURUM)}
      ${bilgi(AY.hediye, t('Fiyat'), t('Ücretsiz'))}
      ${bilgi(AY.sirket, t('Şirket'), 'DK Design Consulting Technology LLC')}
      <a class="ay-satir tikla" href="https://demirkara.com" target="_blank" rel="noopener">${ikonKutu(AY.kure)}<span class="ay-ad">Web</span><span class="ay-deger ay-link">demirkara.com ${AY.disari}</span></a>
      <a class="ay-satir tikla" href="https://www.instagram.com/mimardemirkara/" target="_blank" rel="noopener">${ikonKutu(AY.insta)}<span class="ay-ad">Instagram</span><span class="ay-deger ay-link">@mimardemirkara ${AY.disari}</span></a>`)}
    ${kart(AY.tokmak, t('Telif'), `<div class="hk-metin hk-telif tikla" data-act="telif" role="button">
      <p><b>© ${yil} DK Design Consulting Technology LLC. ${t('Tüm hakları saklıdır.')}</b></p>
      <p>${t('DartX adı, logosu, tasarımı ve yazılımı ABD\'deki şirketim DK Design Consulting Technology LLC\'ye (Albuquerque, New Mexico) aittir; geliştirici Demir Kara\'dır. Uygulama kişisel kullanım için ücretsizdir; izinsiz kopyalanması, değiştirilerek dağıtılması veya satılması yasaktır.')}</p></div>
      <button class="ay-satir tikla" data-act="telif">${ikonKutu(AY.tokmak)}<span class="ay-ad">${t('Telif Hakları')}</span><span class="ay-ok">${AY.ok}</span></button>`)}
    <p class="ay-surum"><img src="img/logo-x.webp" alt=""> DartX ${SURUM} · © ${yil} DK Design Consulting Technology LLC</p>
  </main>`;
}

// DartX Online · Yakında: gelecek özelliklerin tanıtımı (Demir 08.11). Online gelince bu sayfa gerçek ekranlarla değişir.
const ON = {
  uye: LUCIDE('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>', 18),
  lig: LUCIDE('<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>', 18),
  kayit: LUCIDE('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>', 18),
  duyuru: LUCIDE('<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/>', 18),
  sira: LUCIDE('<path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/>', 18),
  sponsor: LUCIDE('<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>', 18),
  telefon: LUCIDE('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>', 18),
};
function viewOnline() {
  const oz = (ic, ad, ac) => `<div class="ay-satir on-satir">${ikonKutu(ic)}<div class="on-metin"><b>${t(ad)}</b><small>${t(ac)}</small></div></div>`;
  return `<main class="page ayarlar online">
    <header class="kurulum-ust">
      <button class="geri-dugme" data-act="home" aria-label="${t('Geri')}">${GERI_OK}<span>${t('Geri')}</span></button>
      <h1><span class="app-ico simge">${ikon('grp-online')}</span><span class="b-ad">${t('Online')}</span></h1>
      <span></span>
    </header>
    <div class="on-kapak">
      <img class="on-logo" src="img/logo-dartx.webp" alt="DartX">
      <div class="on-yazi">ONLINE</div>
      <span class="on-rozet">${t('Yakında')}</span>
      <p>${t('Dart tutkunlarını bir araya getiren online DartX çok yakında. Üye ol, ligde yarış, turnuvalara kayıt yaptır, sıralamada yerini al.')}</p>
    </div>
    ${kart(ON.lig, t('Neler geliyor'), `
      ${oz(ON.uye, 'Üyelik', 'Kendi DartX hesabın; istatistiklerin her cihazda seninle.')}
      ${oz(ON.lig, 'Ligler', 'Sezonluk ligler, fikstür, puan tablosu ve şampiyonluk.')}
      ${oz(ON.kayit, 'Turnuva kaydı', 'Turnuvaları gör, telefondan tek dokunuşla kayıt ol.')}
      ${oz(ON.duyuru, 'Duyurular', 'Turnuva tarihleri, kulüp akşamları ve haberler.')}
      ${oz(ON.sira, 'Sıralamalar', 'Ortalama, checkout ve 180\'lerle genel sıralama.')}
      ${oz(ON.sponsor, 'Sponsorlar', 'Dart kulüpleri ve ekipman markalarıyla iş birlikleri.')}`)}
    ${kart(ON.telefon, t('Şimdilik'), `<div class="hk-metin"><p>${t('DartX şu an internetsiz çalışır; oyuncuların, maçların ve istatistiklerin yalnız bu cihazda kalır. Online özellikler geldiğinde uygulama kendiliğinden güncellenir, yeniden kurman gerekmez.')}</p></div>`)}
    <p class="ay-surum"><img src="img/logo-x.webp" alt=""> DartX ${SURUM}</p>
  </main>`;
}

// Kamera (Beta) ekranı: içeriği js/kamera/ekran.js kurar (kalıcı öğe, her çizimde #kam-yer'e takılır)
function viewKamera() {
  return `<main class="page kamera-sayfa">${header(t('Kamera') + ' <span class="beta-rozet">BETA</span>', 'kamgeri')}<div id="kam-yer"></div></main>`;
}
function viewSettings() {
  const s = data().settings;
  const seg = (act, list, cur) => `<div class="ay-seg">${list.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-act="${act}" data-v="${v}">${t(l)}</button>`).join('')}</div>`;
  const anahtar = (k, acik = s[k]) => `<label class="ay-anahtar"><input type="checkbox" data-act="set" data-k="${k}" ${acik ? 'checked' : ''}><span></span></label>`;
  const satir = (ic, ad, sag = '') => `<div class="ay-satir">${ikonKutu(ic)}<span class="ay-ad">${ad}</span>${sag}</div>`;
  return `<main class="page ayarlar">${header(t('Ayarlar'))}
    ${kart(AY.tema, t('Görünüm'), `
      ${satir(AY.dil, t('Dil'), seg('dil', DILLER.map(d => [d.kod, `<img class="seg-bayrak" src="img/bayrak/${d.bayrak}.svg" alt="">${d.kod === 'tr' ? 'Türkçe' : 'English'}`]), dil()))}
      ${satir(AY.tema, t('Tema'), seg('tema', [['auto', `${IC.ekran}${t('Otomatik')}`], ['koyu', `${IC.ay}${t('Koyu')}`], ['acik', `${IC.gunes}${t('Açık')}`]], s.theme || 'koyu'))}`)}
    ${kart(AY.titresim, t('Oyun'), `
      ${satir(AY.titresim, t('Titreşim'), anahtar('vibrate'))}
      ${satir(AY.tusSes, t('Tuş sesi'), anahtar('tusSes', s.tusSes !== false))}
      ${satir(AY.oyunSes, t('Oyun sesleri'), anahtar('oyunSes', s.oyunSes !== false))}
      ${satir(AY.ekran, t('Oyunda ekran açık kalsın'), anahtar('keepAwake'))}
      ${satir(AY.yildiz, t('Açılış efekti'), anahtar('acilis', data().settings.acilis !== false))}
      ${okuma.destekli() ? satir(AY.oyunSes, t('Sesli okuma (atışlar ve bitiriş)'), anahtar('sesliOkuma', s.sesliOkuma === true)) : ''}`)}
    ${kart(AY.kamera, t('Kamera') + ' <span class="beta-rozet">BETA</span>', `
      <button class="ay-satir tikla" data-act="kamsayfa">${ikonKutu(AY.kamera)}<span class="ay-ad">${t('Bu cihaz kamera')}<small>${t('Tahtayı ayarla, dene, tablete bağlan')}</small></span><span class="ay-ok">${AY.ok}</span></button>
      <button class="ay-satir tikla" data-act="kameslestir">${ikonKutu(AY.telefon)}<span class="ay-ad">${t('Kamerayı telefondan al')}<small>${kam.durum() === 'uzak' ? t('Telefon bağlı') : t('QR ile eşleştir · aynı Wi-Fi, internet gerekmez')}</small></span><span class="ay-ok">${AY.ok}</span></button>
      <p class="ay-not">${t('Kamera saplanan oku tanır, puanı kendiliğinden yazar. Yanlış yazarsa Atışı Geri Al ile düzelt. Deneme aşamasında: ışık ve açı isabeti etkiler.')}</p>`)}
    ${kart(AY.indir, t('Yedek'), `
      <button class="ay-satir tikla" data-act="export">${ikonKutu(AY.indir)}<span class="ay-ad">${t('Yedek al')}</span><span class="ay-ok">${AY.ok}</span></button>
      <label class="ay-satir tikla">${ikonKutu(AY.yukle)}<span class="ay-ad">${t('Yedeği yükle')}</span><span class="ay-ok">${AY.ok}</span><input type="file" accept=".json,application/json" data-act="import" hidden></label>
      <p class="ay-not">${t('Tüm veriler yalnız bu cihazda tutulur. Telefon değiştirirken ya da tablete aktarırken yedek dosyası kullan.')}</p>`)}
    ${kart(AY.veri, t('Veri'), `
      ${satir(AY.veri, t('Kayıtlı'), `<span class="ay-deger">${t('{0} oyuncu · {1} maç', data().players.length, data().history.length)}</span>`)}
      <button class="ay-satir tikla tehlike" data-act="reset">${ikonKutu(AY.sil)}<span class="ay-ad">${t('Tüm verileri sil')}</span></button>`)}
    <p class="ay-surum"><img src="img/logo-x.webp" alt=""> DartX ${SURUM}</p>
  </main>`;
}

// Modal
// Arama (sitedeki Spotlight gibi): buzlu perde + üstte "Ara" kutusu, oyunları iki dilde süzer
const kucult = s => String(s || '').toLocaleLowerCase('tr');
function araSonuc(q) {
  const k = kucult(q).trim();
  if (!k) return ''; // yazmadan sonuç gösterme (Demir 08.11)
  // önce adı eşleşenler, sonra yalnız açıklaması eşleşenler
  const adda = g => [g.name, g.nameEn, g.label, t(g.label)].some(x => kucult(x).includes(k));
  const aciklamada = g => [g.short, g.shortEn].some(x => kucult(x).includes(k));
  const list = [...GAME_LIST.filter(adda), ...GAME_LIST.filter(g => !adda(g) && aciklamada(g))];
  if (!list.length) return `<p class="muted center">${t('Sonuç yok')}</p>`;
  return list.map(g => `<button class="spot-satir" data-act="pick" data-id="${g.id}"><span class="app-ico simge">${ikon(g.id)}</span><span><b>${esc(gt(g, 'name'))}</b><small>${esc(gt(g, 'short'))}</small></span></button>`).join('');
}

// Kurallarda oyuncu sınırı (Demir 08.11: "oyuncu sınırı varsa mutlaka yaz") — kural listesinin ilk maddesi, kişiler simgesiyle
function oyuncuSiniri(g) {
  const en = g.min || 1, cok = g.max || 8;
  let yazi;
  if (en === cok) yazi = t('Tam {0} oyuncuyla oynanır.', cok);
  else if (en === 1 && cok === 1) yazi = t('Tek kişilik antrenman.');
  else yazi = t('{0}–{1} oyuncu.', en, cok);
  if (g.teams && g.maxTekli && g.maxTekli < cok) yazi = t('Tekli {0}–{1} oyuncu; takım hâlinde en fazla {2} oyuncu (2 takım).', en, g.maxTekli, cok);
  else if (g.teams && cok >= 4) yazi += ' ' + t('4 ve üstü oyuncuda 2 takım hâlinde de oynanabilir.');
  return `<ul class="kural-liste kural-sinir"><li><span class="kural-ikon">${KURAL_IKON.kisiler}</span><div><b>${t('Oyuncu')}</b><p>${yazi}</p></div></li></ul>`;
}
// Leg / set bitti (Demir 09.11: "hemen gelip gidiyor"): kazanan animasyonu + skor tablosu; bir tuşa basılana kadar bekler.
// Düğme sıradakini söyler: "Leg 3 başlasın", "Set 2 başlasın". Yanlış okla bittiyse "Son oku geri al".
function legBittiPencere(md) {
  const m = data().current; if (!m) return '';
  const ctx = matchCtx(m);
  const setli = (m.opts.sets || 1) > 1;
  const ad = esc(ctx.name(md.kazanan));
  const baslik = t(md.ev === 'set' ? '{0} set\'i aldı!' : '{0} leg\'i aldı!', `<b style="color:${ctx.color(md.kazanan)}">${ad}</b>`);
  const satirlar = m.sides.map((sd, i) => `<tr class="${i === md.kazanan ? 'kazanan' : ''}" style="--pc:${ctx.color(i)}">
      <th>${adAvatar(ctx.name(i)) || '<span class="lb-nokta"></span>'}${esc(ctx.name(i))}${i === md.kazanan ? `<span class="lb-kupa">${UYARI_IC.kupa}</span>` : ''}</th>
      ${setli ? `<td>${m.setsWon[i]}</td>` : ''}<td>${md.ev === 'set' ? m.legLog.filter(l => l.winner === i).length : m.legsWon[i]}</td></tr>`).join('');
  const hedef = setli ? t('{0} set alan kazanır', m.opts.sets) : t('{0} leg alan kazanır', m.opts.legs || 1);
  const basla = player(m.sides[m.starter].members[0]);
  const dugme = md.ev === 'set' ? t('Set {0} başlasın ›', m.setsWon.reduce((a, b) => a + b, 0) + 1) : t('Leg {0} başlasın ›', m.legNo);
  return `<div class="modal-bg lb-perde"><div class="modal lb-kart">
    <div class="lb-ust"><span class="lb-ikon">${UYARI_IC.kupa}</span></div>
    <h2 class="lb-baslik">${baslik}</h2>
    <p class="lb-alt">${esc(gt(GAMES[m.gameId], 'name'))} · ${hedef}</p>
    <table class="lb-tablo"><thead><tr><th></th>${setli ? `<th>${t('Set')}</th>` : ''}<th>${t('Leg')}</th></tr></thead><tbody>${satirlar}</tbody></table>
    <p class="lb-sonraki">${t('Sıradaki eli {0} başlatır', `<b style="color:${basla.color}">${esc(basla.name)}</b>`)}</p>
    <button class="btn primary big" data-act="legdevam">${dugme}</button>
    <div class="lb-alt-dugmeler">
      <button class="btn" data-act="undo">${t('↶ Son oku geri al')}</button>
      <button class="btn lb-bitir" data-act="oyunubitir">${UYARI_IC.kupa}<span>${t('Oyunu bitir')}</span></button>
    </div>
  </div></div>`;
}

function modal() {
  const md = S.modal;
  if (md.type === 'legbitti') return legBittiPencere(md);
  if (md.type === 'klasor') return klasorPano(md.cat);
  if (md.type === 'rules') {
    const g = GAMES[md.id];
    const metin = kuralMaddeleri(gt(g, 'rules') || gt(g, 'short'));
    return `<div class="spot-perde klasor-perde" data-act="bg"><div class="klasor-pano kural-pano">
      <div class="klasor-baslik"><span class="app-ico simge">${ikon(g.id)}</span><div><h2>${esc(gt(g, 'name'))}</h2><small>${t('Kurallar')}</small></div></div>
      <div class="kural-metin">${oyuncuSiniri(g)}${metin}</div>
      ${demoVar(g.id) ? `<button class="btn kural-izle" data-act="nasiloyna" data-id="${g.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>${t('Nasıl oynanır · izle')}</button>` : ''}
      <button class="btn primary big" data-act="close">${t('Tamam')}</button></div></div>`;
  }
  if (md.type === 'oyuncusec') {
    // Telefonda bunun yerine telefonun kendi çoklu seçicisi açılır; fareyle (bilgisayarda) bu cam liste
    const pids = S.setup.pids;
    const satirlar = data().players.map(p => { const i = pids.indexOf(p.id); return `<button class="os-satir ${i >= 0 ? 'on' : ''}" style="--pc:${p.color}" data-act="oyuncutik" data-id="${p.id}">
      <span class="pc-av">${avatarIc(p.name, i >= 0 ? i + 1 : esc(basHarf(p.name)))}</span><span class="os-ad">${esc(p.name)}</span><span class="os-tik">${i >= 0 ? KURAL_IKON.onay : ''}</span></button>`; }).join('');
    return `<div class="spot-perde klasor-perde" data-act="bg"><div class="klasor-pano os-pano">
      <div class="klasor-baslik"><span class="hm-ikon">${KURAL_IKON.kisiler}</span><div><h2>${t('Oyuncu seç')}</h2><small>${t('{0} / {1}', pids.length, data().players.length)}</small></div></div>
      <div class="os-liste">${satirlar}</div>
      <button class="btn primary big" data-act="close">${t('Tamam')}</button></div></div>`;
  }
  if (md.type === 'ara') {
    return `<div class="spot-perde" data-act="bg"><div class="spot-kutu">
      <label class="spot-giris">${IC.ara}<input id="ara-giris" placeholder="${t('Ara')}" autocomplete="off" enterkeyhint="search"></label>
      <div class="spot-sonuc" id="ara-sonuc"></div></div></div>`;
  }
  let body = '';
  if (md.type === 'rules') {
    const g = GAMES[md.id];
    body = `<h2>${esc(gt(g, 'name'))}</h2><p class="rules">${(gt(g, 'rules') || gt(g, 'short')).replace(/\n/g, '<br>')}</p><button class="btn primary" data-act="close">${t('Tamam')}</button>`;
  } else if (md.type === 'menu') {
    const m = data().current;
    // Menü düğmeleri simgeli (lucide: kitap, ev, x-daire, oynat)
    const mi = (ic, yazi) => `<span class="menu-ic">${ic}</span><span>${yazi}</span>`;
    // Demir 09.11: menü tuşları çizgi değil, kare kutucuk (uygulama simgeleri gibi)
    const kutu = (act, ic, yazi, alt, cls) => `<button class="btn menu-kutu ${cls}" data-act="${act}"><span class="mk-ic">${ic}</span><b>${yazi}</b>${alt ? `<small>${alt}</small>` : ''}</button>`;
    body = `<h2>${t('Menü')}</h2>
      <div class="menu-izgara">
        ${kutu('close', KURAL_IKON.oynat, t('Oyuna Dön'), '', 'mk-altin')}
        ${kutu('rulesplay', IC.kitap, t('Kurallar'), '', 'mk-mavi')}
        ${kutu('home', DURAKLAT_IC, t('Maça Ara Ver'), t('Maç Kayıtlı Kalır'), 'mk-celik')}
        ${kutu('abort', KURAL_IKON.bust, t('Maçı İptal Et'), '', 'mk-kirmizi')}
      </div>
      ${okuma.destekli() ? `<button class="btn menu-okuma ${okuma.acikMi() ? 'acik' : ''}" data-act="sesliokuma">${OKUMA_IC}<span>${t('Sesli Okuma')}</span><b>${okuma.acikMi() ? t('Açık') : t('Kapalı')}</b></button>` : ''}`;
  } else if (md.type === 'hedefsec') {
    // Cezalı Kriket: double / triple / house nereye yazılsın
    const etk = md.ok.n === 25 ? (md.ok.m === 2 ? 'D-Bull' : 'Bull') : (md.ok.m === 3 ? 'T' : md.ok.m === 2 ? 'D' : '') + md.ok.n;
    body = `<h2>${t('{0} nereye yazılsın?', esc(etk))}</h2>
      <div class="hs-izgara">${md.sec.map((x, i) => {
        // simge solda (tuş takımı ve uyarılarla aynı), adı ortada, kaç işaret yazılacağı sağda küçük (Demir 09.11)
        const ic = x.v === 'n' && md.ok.n === 25 ? (md.ok.m === 2 ? TUS_IC.bull : TUS_IC.disBull) : ({ n: TUS_IC.bull, D: TUS_IC.double, T: TUS_IC.triple, H: HS_EV }[x.v] || TUS_IC.bull);
        let [ad, not = ''] = String(x.l).split(' · ');
        // D-Bull'a basıldıysa (Demir 09.11) kutucuk tuşla aynı kırmızı, adı D-Bull; tekli Bull yeşil
        const bullKutu = x.v === 'n' && md.ok.n === 25 ? (md.ok.m === 2 ? 'dbull' : 'bull25') : '';
        if (bullKutu === 'dbull') ad = 'D-Bull';
        return `<button class="btn hedef-sec hs-${x.v === 'n' ? 'sayi' : x.v} ${bullKutu ? 'hs-' + bullKutu : ''} ${x.etkisiz ? 'etkisiz' : ''}" data-act="hedefsec" data-v="${x.v}"><span class="hs-ic">${ic}</span><span class="hs-ad">${esc(ad)}</span><span class="hs-not">${esc(not)}</span>${x.e && x.e.metin ? `<span class="hs-etki e-${x.e.tur}">${esc(kelimeBuyuk(x.e.metin))}</span>` : ''}</button>`;
      }).join('')}</div>
      <button class="btn hs-vazgec" data-act="close">${HS_CARPI}${t('Vazgeç')}</button>`;
  } else if (md.type === 'gerilist') {
    // Atışı Geri Al'a uzun basınca: son 10 hamle; dokununca o hamle dahil sonrası geri alınır (Demir 10.11)
    const m = data().current; if (!m) { S.modal = null; return ''; }
    const ad = pid => esc(player(pid).name);
    const etiket = a => a.t === 'd' ? (a.d.n === 0 ? t('Iska') : dartLabel(a.d) + (a.d.sec && a.d.sec !== 'n' ? ' → ' + a.d.sec : ''))
      : a.t === 'p' ? t('Sıradaki Oyuncu') : a.t === 'T' ? t('Tur toplamı {0}', a.total) : t('Oyunu bitir');
    const liste = E.sonHamleler(m, 10);
    body = `<div class="gl-ust"><span class="gl-ic">${GERI_IC}</span><h2>${t('Nereye kadar geri alınsın?')}</h2></div>
      <p class="muted gl-not">${t('Bir atışa dokun: o atış ve sonrakiler silinir. Maçın başına kadar geri alınabilir.')}</p>
      <div class="gl-liste">${liste.map((a, i) => `<button class="btn gl-satir" data-act="gerilist" data-n="${i + 1}" style="--pc:${player(a.p).color}">
        <span class="gl-no">${i + 1}</span><span class="gl-kim"><b>${ad(a.p)}</b><small>${t('Tur {0}', a.r)}</small></span><span class="gl-ok">${esc(etiket(a))}</span></button>`).join('') || `<p class="muted">${m.adimlar ? t('Geri alınacak atış yok') : t('Bu maç güncellemeden önce başladı; atış listesi yeni maçlarda çalışır. Bu maçta düğmeye kısa basarak tek tek geri alabilirsin.')}</p>`}</div>
      <button class="btn hs-vazgec" data-act="close">${HS_CARPI}${t('Vazgeç')}</button>`;
  } else if (md.type === 'ilksira') {
    const m = data().current; if (!m) { S.modal = null; return ''; }
    const p = player(E.currentPid(m));
    body = `<div class="ilk-sira" style="--pc:${p.color}">
      ${adAvatar(p.name, 'ilk-av') || `<span class="ilk-nokta"></span>`}
      <div class="ilk-ust">${t('İlk atış')}</div>
      <div class="ilk-ad">${dil() === 'tr' ? `Sıra <b>${esc(p.name)}</b>${bulunmaEki(p.name)}` : `<b>${esc(p.name)}</b> ${t('throws first')}`}</div>
      ${(() => { const gg = GAMES[m.gameId]; if (gg.cat !== 'cricket' || m.opts.scoring === 'off' || m.gameId === 'english') return '';
        return `<p class="ilk-kural">${m.opts.scoring === 'ceza' ? t('Kazanmak için: bütün hedefleri kapat ve en düşük puanda ol. Kapattığın hedefe vurdukça puan, kapatmamış rakiplerine yazılır.') : t('Kazanmak için: bütün hedefleri kapat ve puanda önde ol. Rakibinin kapatmadığı hedefe vurdukça puan senin hanene yazılır; geride kalırsan hepsini kapatsan da oyun bitmez.')}</p>`; })()}
      <button class="btn primary big" data-act="ilkbasla">${t('Başla')}</button>
      <small class="muted">${t('Başlamak için ekrana dokun')}</small></div>`;
  } else if (md.type === 'baslayan') {
    // İlk atış ekranı (Demir 09.11, DartX tarzı): önce yöntem — Bull'a At / Yazı Tura — sonra kişi ya da kura
    const m = data().current; if (!m) { S.modal = null; return ''; }
    const ad = i => E.sideName(m, i, player), renk = i => player(m.sides[i].members[0]).color;
    const rozet = i => adAvatar(ad(i), 'bs-av') || `<span class="bs-harf" style="--pc:${renk(i)}">${esc(String(ad(i)).trim().charAt(0).toLocaleUpperCase('tr'))}</span>`;
    const adim = md.adim || 'secim';
    const takimli = m.sides.some(sd => sd.members.length > 1);
    if (adim === 'secim') {
      body = `<h2 class="bs-baslik">${t('İlk kim atacak?')}</h2>
        <div class="bs-yontem">
          <button class="btn bs-kart bs-bull" data-act="bsyontem" data-v="bull"><span class="bs-kart-ic">${BS_TAHTA}</span><b>${t("Bull'a At")}</b><small>${t('Herkes bir ok atar, en yakın başlar')}</small></button>
          <button class="btn bs-kart bs-para" data-act="bsyontem" data-v="kura"><span class="bs-kart-ic"><span class="bs-coin">${BS_PARA_YUZ}</span></span><b>${t('Yazı Tura')}</b><small>${m.sides.length > 2 ? t('Kura çekilir') : t('Para atılır')}</small></button>
          <button class="btn bs-kart bs-zar" data-act="baslayan" data-i="r"><span class="bs-kart-ic bs-zar-ic">${BS_ZAR}</span><b>${t('Rastgele')}</b><small>${t('DartX karar versin')}</small></button>
          <button class="btn bs-kart bs-sec" data-act="bsyontem" data-v="sec"><span class="bs-kart-ic bs-sec-ic">${BS_SEC}</span><b>${t('Kimin Başlayacağını Sen Seç')}</b><small>${t('Oyunculardan birine dokun')}</small></button>
        </div>`;
    } else if (adim === 'bull' || adim === 'sec') {
      body = `<h2 class="bs-baslik">${adim === 'sec' ? t('Kim başlasın?') : t("Bull'a en yakın kim?")}</h2>
        <p class="muted bs-not">${t("Sonraki leg'leri sırayla diğerleri açar.")}</p>
        <div class="bs-kisiler n${m.sides.length} ${takimli ? 'takimli' : ''}">${m.sides.map((sd, i) => takimli
          ? `<button class="btn bs-takim" style="--pc:${renk(i)}" data-act="baslayan" data-i="${i}"><b class="bs-takim-ad">${esc(ad(i))}</b><span class="bs-uyeler">${sd.members.map(pid => { const p = player(pid); return `<span class="bs-uye">${adAvatar(p.name, 'bs-av') || `<span class="bs-harf" style="--pc:${p.color}">${esc(p.name.trim().charAt(0).toLocaleUpperCase('tr'))}</span>`}<span>${esc(p.name)}</span></span>`; }).join('')}</span></button>`
          : `<button class="btn bs-kisi-kutu" style="--pc:${renk(i)}" data-act="baslayan" data-i="${i}">${rozet(i)}<span>${esc(ad(i))}</span></button>`).join('')}</div>
        <button class="btn bs-geri" data-act="bsyontem" data-v="secim">‹ ${t('Geri')}</button>`;
    } else { // kura: iki kişide para, daha çokta oyuncular arasında dolaşan ışık
      const iki = m.sides.length === 2;
      body = `<h2 class="bs-baslik">${iki ? t('Yazı Tura') : t('Kura çekiliyor')}</h2>
        ${iki ? `<div class="bs-sahne"><div class="bs-buyuk-para ${md.sonuc != null ? 'don-' + md.sonuc : ''}">
            <div class="bs-yuz on" style="--pc:${renk(0)}">${rozet(0)}<span>${esc(ad(0))}</span></div>
            <div class="bs-yuz arka" style="--pc:${renk(1)}">${rozet(1)}<span>${esc(ad(1))}</span></div></div></div>`
          : `<div class="bs-liste bs-kura">${m.sides.map((_, i) => `<div class="btn bs-kisi" data-kura="${i}" style="--pc:${renk(i)}">${rozet(i)}<span>${esc(ad(i))}</span></div>`).join('')}</div>`}`;
    }
  } else if (md.type === 'ozelsec') {
    const ad = { D: t('Hangi double?'), T: t('Hangi triple?'), H: t('House: hangi sayıya üç ok?'), B3: t('3 in a bed: hangi sayıya üç ok?') }[md.h];
    const on = md.h === 'D' ? 'D' : md.h === 'T' ? 'T' : '';
    body = `<h2>${ad}</h2><div class="ozel-sayilar">${md.sayilar.map(n => `<button class="btn" data-act="ozelsayi" data-n="${n}">${n === 25 ? 'D-Bull' : on + n}</button>`).join('')}</div>
      <button class="btn hs-vazgec" data-act="close">${HS_CARPI}${t('Vazgeç')}</button>`;
  } else if (md.type === 'codarts') {
    body = `<h2>${t('Kaç okla bitirdin?')}</h2><div class="row three">${[1, 2, 3].map(n => `<button class="btn big" data-act="codarts" data-n="${n}">${n}</button>`).join('')}</div><button class="btn" data-act="close">${t('Vazgeç')}</button>`;
  } else if (md.type === 'pedit') {
    const p = player(md.id);
    body = `<h2>${t('Oyuncuyu düzenle')}</h2>
      <form data-act="psave" data-id="${p.id}"><input name="name" value="${esc(p.name)}" maxlength="14">
      <div class="colors">${store.COLOR_LIST.map(c => `<label><input type="radio" name="color" value="${c}" ${c === p.color ? 'checked' : ''}><span style="background:${c}"></span></label>`).join('')}</div>
      <button class="btn primary">${t('Kaydet')}</button></form>
      <button class="btn danger" data-act="pdel" data-id="${p.id}">${t('Oyuncuyu sil')}</button>
      <button class="btn" data-act="close">${t('Vazgeç')}</button>`;
  }
  return `<div class="modal-bg" data-act="bg"><div class="modal">${body}</div></div>`;
}

// ---------- sürükle-bırak: kurulumda oynama sırası (fare + dokunmatik)
// Satır parmağı/fareyi izler ama listenin dışına çıkamaz; komşusunun ortasını geçince yer değiştirir.
// Bırakma, iptal, pencereden çıkma ya da odak kaybında her zaman yerine oturur (takılı kalmaz).
let surukle = null;
app.addEventListener('pointerdown', e => {
  const satir = e.target.closest('.sira-satir');
  if (surukle || !satir || satir.classList.contains('bekleyen') || e.target.closest('.sira-cik, .takim-rozet') || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const liste = satir.parentElement;
  e.preventDefault();
  try { satir.setPointerCapture(e.pointerId); } catch {}
  const lr = liste.getBoundingClientRect();
  surukle = { satir, liste, id: e.pointerId, tutma: e.clientY - lr.top - satir.offsetTop };
  satir.classList.add('surukleniyor'); liste.classList.add('siralaniyor'); vib(8);
});
function surukleTasi(ev) {
  if (!surukle || ev.pointerId !== surukle.id) return;
  ev.preventDefault();
  const { satir, liste, tutma } = surukle;
  const lr = liste.getBoundingClientRect();
  const h = satir.offsetHeight;
  const ust = Math.max(0, Math.min(liste.offsetHeight - h, ev.clientY - lr.top - tutma));
  const orta = ust + h / 2;
  let o;
  while ((o = satir.previousElementSibling) && orta <= o.offsetTop + o.offsetHeight / 2 + 0.5) { liste.insertBefore(satir, o); vib(5); }
  while ((o = satir.nextElementSibling) && orta >= o.offsetTop + o.offsetHeight / 2 - 0.5) { liste.insertBefore(o, satir); vib(5); }
  satir.style.transform = `translateY(${ust - satir.offsetTop}px) scale(1.03)`;
  [...liste.children].forEach((r, i) => { const av = r.querySelector('.pc-av'); if (av && !av.querySelector('.oz-av')) av.textContent = i + 1; });
}
function surukleBirak() {
  if (!surukle) return;
  const { liste } = surukle;
  surukle = null;
  S.setup.pids = [...liste.children].map(r => r.dataset.sira).filter(Boolean);
  render();
}
addEventListener('pointermove', surukleTasi, { passive: false });

// ---------- sürükle-bırak: Oyuncular listesinde sıra (Demir 09.11). Tablette liste ızgara olduğu için her yöne:
// satır parmağı izler, üzerine geldiği satırın yerine geçer; bırakınca yeni sıra kaydedilir. Aramada kapalı.
let oySur = null;
app.addEventListener('pointerdown', e => {
  const tut = e.target.closest('.prow-tut');
  if (!tut || oySur || surukle || (e.pointerType === 'mouse' && e.button !== 0)) return;
  if ((S.oyuncuAra || '').trim()) { toast(t('Sıralamak için aramayı temizle'), 'bad'); return; }
  const satir = tut.closest('.prow'), liste = satir.parentElement, r = satir.getBoundingClientRect();
  e.preventDefault();
  try { tut.setPointerCapture(e.pointerId); } catch {}
  oySur = { satir, liste, id: e.pointerId, offX: e.clientX - r.left, offY: e.clientY - r.top };
  satir.classList.add('surukleniyor'); liste.classList.add('siralaniyor'); vib(8);
});
addEventListener('pointermove', ev => {
  if (!oySur || ev.pointerId !== oySur.id) return;
  ev.preventDefault();
  const { satir, liste, offX, offY } = oySur;
  // üzerine gelinen satır: imleç onun içindeyse yer değiştir (önce / sonra)
  const diger = [...liste.querySelectorAll('.prow')].filter(x => x !== satir && !x.hidden);
  const hedef = diger.find(x => { const b = x.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom; });
  if (hedef) {
    const kardes = [...liste.children];
    if (kardes.indexOf(satir) < kardes.indexOf(hedef)) liste.insertBefore(satir, hedef.nextSibling); else liste.insertBefore(satir, hedef);
    vib(5);
  }
  // satırı imlecin altında tut (yeni doğal konumuna göre)
  satir.style.transform = '';
  const n = satir.getBoundingClientRect();
  satir.style.transform = `translate(${ev.clientX - offX - n.left}px, ${ev.clientY - offY - n.top}px) scale(1.03)`;
}, { passive: false });
function oySurBirak() {
  if (!oySur) return;
  const { liste } = oySur; oySur = null;
  const sira = [...liste.querySelectorAll('.prow')].map(r => r.dataset.sira);
  const pl = data().players;
  pl.sort((a, b) => sira.indexOf(a.id) - sira.indexOf(b.id));
  store.save(); vib(8); render();
}
addEventListener('pointerup', e => { if (oySur && e.pointerId === oySur.id) oySurBirak(); });
addEventListener('pointercancel', e => { if (oySur && e.pointerId === oySur.id) oySurBirak(); });
addEventListener('blur', oySurBirak);
addEventListener('pointerup', e => { if (surukle && e.pointerId === surukle.id) surukleBirak(); });
addEventListener('pointercancel', e => { if (surukle && e.pointerId === surukle.id) surukleBirak(); });
addEventListener('blur', surukleBirak);
document.documentElement.addEventListener('mouseleave', surukleBirak);

// ---------- olaylar
app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const act = el.dataset.act;
  if (el.tagName === 'FORM' || el.tagName === 'INPUT') return;
  if (S.dilAcik && act !== 'dilac' && act !== 'dil') { S.dilAcik = false; render(); }
  const m = data().current;
  // Sıra DartBot'taysa tuş takımı ve tablo kilitli (Demir 10.11: yanlışlıkla basınca botun eli bozuluyordu)
  if (S.view === 'play' && botSirasi(m) && el.closest('.keypad, .board, .numpad')) { vib(6); return; }

  switch (act) {
    case 'tab': go(el.dataset.v); break;
    case 'nasilliste': go('nasil'); break;
    case 'nasiloyna': go('nasiloyna', { nasilId: el.dataset.id }); break;
    case 'nsoynat': case 'nsgeri': case 'nsileri': case 'nsadim': case 'nsses': nasilKontrol(el.dataset.act, el); vib(6); break;
    case 'nskural': S.modal = { type: 'rules', id: el.dataset.id }; render(); break;
    case 'home': go('home'); break;
    case 'resume': { E.clearUndo(); go('play'); const cm = data().current; if (cm && !cm.done) siraGoster(cm, 350); break; } // Demir 09.11: ara sonrası sıra kimde, söylensin
    case 'pick': {
      const g = GAMES[el.dataset.id];
      if (g.soon) { toast('Bu oyun bir sonraki adımda geliyor'); return; }
      go('setup', { gameId: g.id, setup: defaultSetup(g) });
      break;
    }
    case 'rules': S.modal = { type: 'rules', id: S.gameId }; render(); break;
    case 'rulesplay': S.modal = { type: 'rules', id: m.gameId }; render(); break;
    case 'opt': secenekYaz(el.dataset.k, el.dataset.v); break;
    case 'legadim': { const o = S.setup.opts; o.legs = Math.max(1, Math.min(9, (Number(o.legs) || 1) + Number(el.dataset.d))); vib(6); ses.tus(); render(); break; }
    case 'teams': S.setup.teams = el.dataset.v === '1'; render(); break;
    case 'oyuncusecac': {
      // dokunmatikte üstteki <select multiple> (telefonun seçicisi) zaten açılır; fareyle cam menü
      if (dokunmatik()) break;
      // Demir 08.11: listede yalnız henüz seçilmemişler; en üstte arama. Seçilen sıraya eklenir ve listeden düşer
      acilirAc(el, () => secilebilir(S.setup.pids).map(x => ({ ...x, on: false })), v => {
        const id = secimId(v); if (!S.setup.pids.includes(id)) S.setup.pids.push(id); vib(6); render();
      }, { coklu: true, baslik: t('Oyuncu seç'), ara: true, araYazi: t('Ara…'), sonucYok: t('Sonuç yok'), bos: t('Bütün oyuncular seçildi') });
      break;
    }
    case 'secac': {
      if (dokunmatik()) break;
      const k = el.dataset.k, sel = el.querySelector('select');
      acilirAc(el, () => [...sel.options].map(o => ({ v: o.value, l: o.textContent, on: String(S.setup.opts[k]) === o.value })), v => { vib(6); secenekYaz(k, v); });
      break;
    }
    case 'oyuncutik': { const a = S.setup.pids, id = el.dataset.id, i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); vib(6); render(); break; }
    case 'takim': { takimlar(S.setup); S.setup.takimElle = true; const tk = S.setup.takim; tk[el.dataset.id] = tk[el.dataset.id] === 'A' ? 'B' : 'A'; vib(8); render(); break; }
    case 'tema': data().settings.theme = el.dataset.v; store.save(); applyTheme(); render(); break;
    case 'dil': dilKoy(el.dataset.v); S.dilAcik = false; render(); break;
    case 'dilac': S.dilAcik = !S.dilAcik; render(); break;
    case 'telif': telifAc(); break;
    case 'klasor': S.modal = { type: 'klasor', cat: el.dataset.v }; render(); break;
    case 'ara': S.modal = { type: 'ara' }; render(); setTimeout(() => document.getElementById('ara-giris')?.focus(), 30); break;
    case 'temadon': {
      const yeni = TEMA_SIRA[data().settings.theme || 'koyu'];
      data().settings.theme = yeni; store.save(); applyTheme(); render();
      break;
    }
    case 'togglep': {
      const id = el.dataset.id, a = S.setup.pids;
      const i = a.indexOf(id);
      if (i >= 0) a.splice(i, 1); else a.push(id);
      render();
      break;
    }
    case 'shuffle': {
      const a = S.setup.pids;
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      render();
      break;
    }
    case 'start': {
      // Demir 10.11: 5 yarım maç doluysa en eskisi silinmeden önce sorulur
      const eski = store.silinecekAra();
      if (!eski) { startMatch(); break; }
      onayla({ baslik: t('Yarım maç silinecek'), metin: t('En fazla {0} yarım maç saklanır. Yeni maç başlarsa en eskisi ({1}) silinir.', store.ARA_SINIR, gt(GAMES[eski.gameId], 'name')), evet: t('Başla'), tehlike: true })
        .then(ok => { if (ok) { store.araSil(eski.id); startMatch(); } });
      break;
    }
    case 'aradevam': { E.clearUndo(); const am = store.araDevam(el.dataset.id); if (am) { go('play'); if (!am.done) siraGoster(am, 350); } break; }
    case 'arasil': {
      const am = [data().current, ...data().ara].find(x => x && x.id === el.dataset.id); if (!am) break;
      onayla({ baslik: t('Yarım maç silinsin mi?'), metin: t('{0} maçı kaydedilmeden silinir.', gt(GAMES[am.gameId], 'name')), evet: t('Sil'), tehlike: true })
        .then(ok => { if (ok) { if (data().current && data().current.id === am.id) { data().current = null; store.save(); E.clearUndo(); } else store.araSil(am.id); render(); } });
      break;
    }

    // House modu (Demir 09.11): ayrı pencere yok — basınca sayı tuşları turkuaza döner, sayıya dokununca 3 ok o sayıya
    case 'housemod': {
      if ((m.turnDarts || []).length && !S.house) { toast(t('House için elin ilk okundan başla'), 'bad'); break; }
      S.house = S.house ? null : el.dataset.h; S.mod = 1; vib(8); ses.tus(); render(); break;
    }
    case 'kriketgiris': { const s = data().settings, k = s.kriketGiris || {}; k[m.gameId] = k[m.gameId] === 'klasik' ? 'hizli' : 'klasik'; s.kriketGiris = k; S.mod = 1; store.save(); vib(8); ses.tus(); render(); break; }
    case 'tabloyaz': { const s = data().settings; s.tabloYaz = { ...(s.tabloYaz || {}), [m.gameId]: el.dataset.v === '1' }; store.save(); vib(8); ses.tus(); render(); break; }
    case 'mod': S.house = null; S.mod = S.mod === Number(el.dataset.m) ? 1 : Number(el.dataset.m); vib(8); ses.tus(); render(); break;
    case 'dart': {
      if (S.house) { const n = Number(el.dataset.n); S.house = null; if (!n || n === 25) { render(); break; } houseAt(m, n); break; }
      const n = Number(el.dataset.n);
      let mm = el.dataset.fix ? Number(el.dataset.fix) : S.mod;
      if (n === 0) mm = 1;
      if (n === 25 && !el.dataset.fix) mm = Math.min(mm, 2);
      S.mod = 1;
      const ok = { n, m: mm };
      const gg = GAMES[m.gameId];
      const sec = gg.secenekler ? gg.secenekler(m, m.g, ok) : null;
      if (sec) { S.modal = { type: 'hedefsec', ok, sec }; vib(10); ses.tus(); render(); break; }
      S.sonOk = ok;
      afterThrow(E.throwDart(m, ok));
      break;
    }
    case 'bsyontem': {
      const md = S.modal; if (!md || md.type !== 'baslayan') break;
      md.adim = el.dataset.v; vib(8); ses.tus();
      if (md.adim !== 'kura') { render(); break; }
      // kura: sonuç baştan belli, animasyon onu gösterir
      const kazanan = Math.floor(Math.random() * m.sides.length);
      md.sonuc = null; render();
      if (m.sides.length === 2) {
        ses.oyun('para');
        requestAnimationFrame(() => requestAnimationFrame(() => { md.sonuc = kazanan; const p = document.querySelector('.bs-buyuk-para'); if (p) p.classList.add('don-' + kazanan); }));
        setTimeout(() => kuraBitti(m, kazanan), 2300);
      } else {
        let adimNo = 0; const toplam = m.sides.length * 3 + kazanan + 1;
        const yak = () => {
          const i = adimNo % m.sides.length;
          document.querySelectorAll('[data-kura]').forEach(x => x.classList.toggle('isik', Number(x.dataset.kura) === i));
          ses.oyun('kura'); adimNo++;
          if (adimNo < toplam) setTimeout(yak, 90 + adimNo * adimNo * 3); else setTimeout(() => kuraBitti(m, kazanan), 700);
        };
        setTimeout(yak, 150);
      }
      break;
    }
    case 'baslayan': {
      const md = S.modal; if (!md || md.type !== 'baslayan') break;
      const i = el.dataset.i === 'r' ? Math.floor(Math.random() * m.sides.length) : Number(el.dataset.i);
      E.baslayanSec(m, i); store.setCurrent(m); vib(10); ses.tus();
      // Demir 09.11: ilk başlayanın duyurusu hemen kaybolmasın; ekrana dokununca oyun başlar
      S.modal = { type: 'ilksira' }; render(); break;
    }
    // Tablodan yaz: D / T / H / 3B satırına dokunuldu → hangi sayıya atıldığı sorulur
    case 'ozelsatir': {
      const h = el.dataset.h;
      const hedefler = (m.g.h || []).filter(x => typeof x === 'number' && x !== 25);
      const turk = m.gameId === 'turk';
      // Türk Kriketi'nde yalnız tablodaki sayılar sayılır; diğerlerinde tahtadaki her sayı
      let sayilar = turk ? hedefler.slice().sort((a, b) => b - a) : Array.from({ length: 20 }, (_, i) => 20 - i);
      if (h === 'D' && (!turk || (m.g.h || []).includes(25))) sayilar = sayilar.concat([25]);
      const td = m.turnDarts || [];
      if ((h === 'H' || h === 'B3') && td.length) { toast(t('House için elin ilk okundan başla'), 'bad'); break; }
      S.modal = { type: 'ozelsec', h, sayilar }; vib(10); ses.tus(); render(); break;
    }
    case 'ozelsayi': {
      const md = S.modal; if (!md || md.type !== 'ozelsec') break;
      const n = Number(el.dataset.n), h = md.h, gg = GAMES[m.gameId];
      S.modal = null;
      if (h === 'D' || h === 'T') {
        const ok = { n, m: h === 'D' ? 2 : 3 };
        if (gg.secenekler && gg.secenekler(m, m.g, ok)) ok.sec = h; // Türk Kriketi: seçimi D/T olarak yap
        S.sonOk = ok; afterThrow(E.throwDart(m, ok)); break;
      }
      houseAt(m, n); break;
    }
    case 'hedefsec': {
      const md = S.modal; if (!md || md.type !== 'hedefsec') break;
      md.ok.sec = el.dataset.v; S.modal = null;
      S.sonOk = md.ok;
      afterThrow(E.throwDart(m, md.ok));
      break;
    }
    case 'pass': ses.tus(); afterThrow(E.passTurn(m)); break;
    case 'botekle': {
      const sv = el.dataset.v, ad = 'DartBot ' + t(BOT_SEVIYE[sv].ad);
      if (data().players.some(p => p.name === ad)) { toast(t('Bu isim zaten var'), 'bad'); break; }
      const p = store.addPlayer(ad); store.updatePlayer(p.id, { bot: sv });
      vib(10); ses.tus(); toast(t('{0} eklendi', ad), 'good'); render(); break;
    }
    case 'durumoku': { // Demir 09.11: oyuncu kartına dokununca sesli koç durumu bir daha söyler
      if (okuma.acikMi()) { okuma.durumuOku(m, GAMES[m.gameId], player(E.currentPid(m)).name); vib(6); }
      break;
    }
    case 'sesmenu': {
      if (acilirAcik()) { acilirKapat(); break; } // Demir 09.11: bastığımda açılsın, bir daha bastığımda kapansın
      // Demir 09.11: üst çubukta ses menüsü — bütün sesler, sesli okuma, tuş sesi, oyun efektleri
      const st = data().settings;
      // Demir 09.11 ("mantığa al"): üç ses ayrı ayrı açılıp kapanır; altta ayrı "Sessize al" hepsini susturur, ayarlar korunur
      const liste = () => {
        const sz = st.sessiz === true;
        return [
          ...(okuma.destekli() ? [{ v: 'sesliOkuma', l: t('Sesli okuma'), on: st.sesliOkuma === true, ic: OKUMA_IC, soluk: sz }] : []),
          { v: 'tusSes', l: t('Tuş sesi'), on: st.tusSes !== false, ic: TUS_SES_IC, soluk: sz },
          { v: 'oyunSes', l: t('Oyun efektleri'), on: st.oyunSes !== false, ic: EFEKT_IC, soluk: sz },
          ...(okuma.destekli() ? SEVIYELER.map(([v, l], i) =>
            ({ v: 'sv_' + v, l: t(l), on: okuma.seviye() === v, ic: OKUMA_IC, ayir: i === 0, soluk: sz || st.sesliOkuma !== true })) : []),
          { v: 'sessiz', l: t('Sessize al'), on: sz, ic: SESSIZ_IC, ayir: true },
        ];
      };
      acilirAc(el, liste, v => {
        if (v.startsWith('sv_')) { seviyeKoy(v.slice(3)); return; } // konuşma seviyesi (Sade / Standart / Koç)
        if (v === 'sessiz') { st.sessiz = !st.sessiz; if (st.sessiz) okuma.sustur(); }
        else {
          // sessizdeyken bir sese dokunulursa sessizlik kalkar ve o ses açılır
          if (st.sessiz) { st.sessiz = false; st[v] = true; }
          else if (v === 'sesliOkuma') st.sesliOkuma = !st.sesliOkuma;
          else st[v] = st[v] === false;
          if (v === 'sesliOkuma') { okuma.sustur(); okuma.duyur(okuma.acikMi()); }
          if (v === 'tusSes' && st.tusSes) ses.tus();
        }
        store.save(); vib(6);
        document.querySelectorAll('.mc-ses').forEach(b => { b.classList.toggle('kapali', !!st.sessiz); b.innerHTML = st.sessiz ? SESSIZ_IC : SESLI_IC; });
        const ok = okuma.acikMi();
        document.querySelectorAll('.pt-ses').forEach(b => { b.classList.toggle('acik', ok); b.innerHTML = ok ? OKUMA_IC : OKUMA_KAPALI_IC; });
      }, { coklu: true, baslik: t('Sesler'), en: 250 }); // Demir 10.11: "Konuşma: Normal" sığsın
      break;
    }
    case 'sesliokuma': {
      if (svUzun) { svUzun = false; break; } // basılı tutup seviye menüsü açıldı
      const st = data().settings;
      if (st.sessiz) { st.sessiz = false; st.sesliOkuma = true; document.querySelectorAll('.mc-ses').forEach(b => { b.classList.remove('kapali'); b.innerHTML = SESLI_IC; }); }
      else st.sesliOkuma = !st.sesliOkuma;
      store.save(); vib(8);
      okuma.sustur(); okuma.duyur(okuma.acikMi()); // Mert: "Sesli okuma açık / kapalı"
      // Demir 09.11: menüdeyken ekranı baştan çizme (menü kapanıp açılıyordu) — yalnız düğmeler güncellenir
      const acik = okuma.acikMi();
      document.querySelectorAll('.menu-okuma').forEach(b => { b.classList.toggle('acik', acik); const y = b.querySelector('b'); if (y) y.textContent = acik ? t('Açık') : t('Kapalı'); });
      document.querySelectorAll('.pt-ses').forEach(b => { b.classList.toggle('acik', acik); b.innerHTML = acik ? OKUMA_IC : OKUMA_KAPALI_IC; b.title = t('Sesli Okuma') + ': ' + (acik ? t('Açık') : t('Kapalı')); });
      break;
    }
    case 'gerilist': { // listeden bir hamleye kadar tek seferde geri dön
      const n = Number(el.dataset.n);
      S.modal = null;
      if (E.geriAl(m, n)) { S.mod = 1; S.totalBuf = ''; S.house = null; store.setCurrent(m); vib(20); ses.oyun('geri'); toast(t('{0} atış geri alındı', n), '', { tur: { ic: 'karisik', a: 'a-don', k: '' } }); }
      render(); break;
    }
    case 'undo':
      if (uzunBasildi) { uzunBasildi = false; break; }
      // Demir 10.11: açıklaması sığmayan ince düğmede, ilk geri almada bir kez ipucu (çizimden önce bakılır)
      const aciklamaGorunur = !!el.querySelector('.geri-not')?.offsetParent;
      if (E.undo(m)) { S.mod = 1; S.totalBuf = ''; if (S.modal && S.modal.type === 'legbitti') S.modal = null; store.setCurrent(m); vib(20); ses.oyun('geri'); render();
        const st = data().settings;
        if (!st.geriIpucu && !aciklamaGorunur) {
          st.geriIpucu = true; store.save();
          setTimeout(() => toast(t("İpucu: Atışı Geri Al'a basılı tutarsan son 10 atıştan istediğine dönebilirsin"), '', { tur: { ic: 'geri', a: 'a-don', k: '' } }), 400);
        }
      }
      break;
    case 'np': {
      const v = el.dataset.v;
      if (v === 'del') S.totalBuf = S.totalBuf.slice(0, -1);
      else if (v === 'ok') return submitTotal(Number(S.totalBuf || 0));
      else if (S.totalBuf.length < 3) S.totalBuf = (S.totalBuf + v).replace(/^0+(?=\d)/, '');
      vib(8); ses.tus();
      render();
      break;
    }
    case 'npq': ses.tus(); submitTotal(Number(el.dataset.v)); break;
    case 'codarts': {
      const tot = S.pendingTotal;
      S.modal = null;
      S.totalBuf = '';
      afterThrow(E.throwTotal(m, tot, Number(el.dataset.n)));
      break;
    }

    case 'menu': S.modal = { type: 'menu' }; render(); break;
    case 'abort':
      onayla({ baslik: t('Maç iptal edilsin mi?'), metin: t('Bu maç kaydedilmez.'), evet: t('Maçı iptal et'), tehlike: true })
        .then(ok => { if (ok) { store.setCurrent(null); E.clearUndo(); go('home'); } });
      break;
    case 'close': S.modal = null; render(); break;
    case 'oyunubitir': {
      if (!m || !S.modal || S.modal.type !== 'legbitti') break;
      E.erkenBitir(m); S.modal = null;
      store.finishCurrent(); S.lastMatch = m; ses.oyun('mac');
      setTimeout(konfeti, 120);
      go('end'); break;
    }
    case 'legdevam': S.modal = null; render(); okuma.legBasladi(); if (data().current) siraGoster(data().current, 150); break;
    case 'ilkbasla': S.modal = null; vib(8); ses.tus(); render(); okuma.macBasladi(); break;
    case 'bg': if (S.modal && S.modal.type === 'ilksira') { S.modal = null; vib(8); render(); okuma.macBasladi(); break; }
      if (e.target === el && !(S.modal && S.modal.type === 'baslayan')) { S.modal = null; render(); } break; // başlama atışı boşluğa dokunarak geçilmez

    case 'rematch': {
      const lm = S.lastMatch;
      E.clearUndo();
      // başlayan sırayı kaydır
      const sides = lm.sides.map(s => ({ name: s.name, members: s.members }));
      sides.push(sides.shift());
      const nm = E.createMatch(lm.gameId, { ...lm.opts }, sides);
      store.setCurrent(nm);
      S.mod = 1; S.totalBuf = '';
      go('play');
      // Demir 10.11: rövanşta da kimin başladığı gösterilsin (İlk atış ekranı, animasyonlu)
      S.modal = { type: 'ilksira' }; render();
      break;
    }
    case 'undoend': {
      const lm = S.lastMatch;
      store.removeHistory(lm.id);
      lm.done = false; lm.ended = null; lm.winner = null;
      E.undo(lm);
      store.setCurrent(lm);
      go('play');
      break;
    }

    case 'pstats': go('stats', { statPid: el.dataset.id }); break;
    case 'statp': S.statPid = el.dataset.id; render(); break;
    case 'pedit': S.modal = { type: 'pedit', id: el.dataset.id }; render(); break;
    case 'pdel':
      { const id = el.dataset.id; onayla({ baslik: t('Oyuncu silinsin mi?'), metin: `${data().players.find(x => x.id === id)?.name || ''} — ${t('Geçmiş maçlarda "Silinmiş" olarak görünür.')}`, evet: t('Oyuncuyu sil'), tehlike: true })
        .then(ok => { if (ok) { store.removePlayer(id); S.modal = null; render(); } }); }
      break;

    case 'export': exportBackup(); break;
    case 'kamsayfa': kam.yerelKapat(); go('kamera'); break;
    case 'kamgeri': go('settings'); break;
    case 'kameslestir': kam.eslestir(t); break;
    case 'kamera': { // oyunda kamera düğmesi
      const d = kam.durum();
      if (d === 'uzak') { toast(t('Kamera: telefon bağlı'), ''); break; }
      if (d === 'yerel') { kam.yerelKapat(); toast(t('Kamera kapandı'), ''); break; }
      if (d === 'ayarsiz') { go('kamera'); break; }
      kam.yerelAc().then(ok => { if (ok) toast(t('Kamera açık: atışlar kendiliğinden yazılır'), ''); })
        .catch(e => toast(t('Kamera açılamadı') + (e && e.name === 'NotAllowedError' ? ': ' + t('izin verilmedi') : ''), 'bad'));
      break;
    }
    case 'reset':
      onayla({ baslik: t('Tüm veriler silinsin mi?'), metin: t('TÜM oyuncular ve maçlar silinecek. Bu işlem geri alınamaz.'), evet: t('Tümünü sil'), tehlike: true })
        .then(ok => { if (ok) { store.resetAll(); go('home'); } });
      break;
  }
});

function submitTotal(tot) {
  const m = data().current;
  if (tot > 180 || IMPOSSIBLE.has(tot)) { ses.oyun('hata'); toast(t('{0} atılamaz', tot), 'bad'); S.totalBuf = ''; render(); return; }
  const g = GAMES[m.gameId];
  const left = m.g.s[m.cur].score;
  if (tot === left && g.canCheckout(m, m.g)) {
    S.pendingTotal = tot;
    S.modal = { type: 'codarts' };
    render();
    return;
  }
  S.totalBuf = '';
  afterThrow(E.throwTotal(m, tot));
}

// İsim kuralı (Demir 08.11): 2–14 karakter; harf, rakam, boşluk ve . - ' ; fazla boşluk temizlenir
const ISIM_MIN = 2, ISIM_MAX = 14;
// Demir 08.11: isim nasıl yazılırsa yazılsın yalnız baş harfler büyük (Türkçe kurallı: i → İ, I → ı); kesme / tire sonrası da
const basHarfBuyuk = s => s.toLocaleLowerCase('tr').replace(/(^|[\s'\-.])(\p{L})/gu, (_, on, h) => on + h.toLocaleUpperCase('tr'));
const isimTemizle = s => basHarfBuyuk(String(s || '').replace(/\s+/g, ' ').trim()).replace(/^Dartbot(?=\s|$)/u, 'DartBot').slice(0, ISIM_MAX); // DartBot yazımı korunur
const isimGecerli = s => s.length >= ISIM_MIN && s.length <= ISIM_MAX && /^[\p{L}\p{N} .'\-]+$/u.test(s);
const basHarf = s => (String(s).trim()[0] || '?').toLocaleUpperCase('tr');

app.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const act = f.dataset.act;
  const name = isimTemizle(f.elements.name?.value);
  if ((act === 'addp' || act === 'psave') && (f.elements.name?.value || '').trim() && !isimGecerli(name)) {
    bilgi(t('İsim uygun değil'), t("İsim {0}–{1} karakter olmalı; harf, rakam, boşluk ve . - ' kullanılabilir.", ISIM_MIN, ISIM_MAX));
    return;
  }
  if (act === 'addp') {
    if (!name) return;
    if (data().players.some(p => p.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'))) { toast(t('Bu isim zaten var'), 'bad'); return; }
    const p = store.addPlayer(name);
    if (S.view === 'setup') S.setup.pids.push(p.id);
    render();
    const inp = app.querySelector('.addp input');
    if (inp) inp.focus();
  } else if (act === 'psave') {
    if (!name) return;
    if (data().players.some(p => p.id !== f.dataset.id && p.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'))) { toast(t('Bu isim zaten var'), 'bad'); return; }
    store.updatePlayer(f.dataset.id, { name, color: f.elements.color.value });
    S.modal = null;
    render();
  }
});

app.addEventListener('input', e => {
  if (e.target.id === 'ara-giris') document.getElementById('ara-sonuc').innerHTML = araSonuc(e.target.value);
  if (e.target.dataset.act === 'oyuncuara') {
    S.oyuncuAra = e.target.value;
    const q = e.target.value.trim().toLocaleLowerCase('tr');
    let gorunen = 0;
    document.querySelectorAll('.prow[data-ad]').forEach(r => { const ok = !q || r.dataset.ad.includes(q); r.hidden = !ok; if (ok) gorunen++; });
    const bos = document.querySelector('.oa-bos'); if (bos) bos.hidden = gorunen > 0;
    const say = document.querySelector('.oa-sayi'); if (say) say.textContent = q ? `${gorunen} / ${data().players.length}` : data().players.length;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) { S.modal = null; render(); } });

app.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'oyuncusec') {
    // listede yalnız seçilmemişler var: işaretlenenler sıranın sonuna eklenir (çıkarmak satırdaki ✕ ile)
    const a = S.setup.pids;
    [...el.selectedOptions].forEach(o => { const id = secimId(o.value); if (!a.includes(id)) a.push(id); });
    S.setup.pids = a; vib(8); render(); return;
  }
  if (el.dataset.act === 'optsec') { vib(8); secenekYaz(el.dataset.k, el.value); return; }
  if (el.dataset.act === 'set') {
    data().settings[el.dataset.k] = el.checked;
    store.save();
    if (el.checked && (el.dataset.k === 'tusSes' || el.dataset.k === 'oyunSes')) ses.dene(el.dataset.k);
  } else if (el.dataset.act === 'import') {
    const file = el.files[0];
    if (!file) return;
    file.text().then(txt => {
      onayla({ baslik: t('Yedek yüklensin mi?'), metin: t('Bu cihazdaki tüm veriler yedektekilerle değiştirilecek.'), evet: t('Yükle') }).then(ok => { if (!ok) return;
        yedekYukle(txt, x => { store.importJSON(x); return { oyuncu: data().players.length, mac: data().history.length }; }, () => go('home'));
      });
      el.value = '';
    });
  }
});

function exportBackup() { yedekAl(store.exportJSON()); } // açılan pencerede yüzdeli halka, sonra İndir

// ---------- başlat
window.addEventListener('dartx-uyari', e => bilgi(t('Uyarı'), t(e.detail)));
korumaKur();
// Kayıtlı oyuncu adlarını da aynı biçime getir (bir kez, her açılışta zararsız)
{ let degisti = false; data().players.forEach(p => { const y = isimTemizle(p.name); if (y && y !== p.name) { p.name = y; degisti = true; } }); if (degisti) store.save(); }
// Hesap makinesi (Demir 08.11): oyunda sol = 1. taraf (Takım A), sağ = 2. taraf (Takım B); 3+ tarafta sırası gelenin
// makinesi açılır, üstten diğer oyunculara geçilir (Demir 09.11); durumları maçın içinde
// saklanır, maç bitince / iptal edilince silinir. Ana ekranda tek, genel hesap makinesi (iki kenar da onu açar).
const hmGenel = {};
function hesapBaglam() {
  const m = data().current;
  if (S.view === 'play' && m) {
    const ad = i => (m.sides[i] ? E.sideName(m, i, player) : '');
    const renk = i => (m.sides[i] ? player(m.sides[i].members[0]).color : '');
    const n = m.sides.length, hep = [...Array(n).keys()];
    return { mac: true, n, cur: m.cur || 0, adlar: hep.map(ad), renkler: hep.map(renk) };
  }
  return { mac: false, n: 0, cur: 0, adlar: [], renkler: [] };
}
hesapKur({
  baglam: hesapBaglam,
  izinli: () => S.view === 'play' && !S.modal,
  oku: taraf => { const m = data().current; return S.view === 'play' && m ? (m.hesap || {})[taraf] : hmGenel.d; },
  yaz: (taraf, d) => {
    const m = data().current;
    if (S.view === 'play' && m) { m.hesap = { ...(m.hesap || {}), [taraf]: d }; store.save(); } else hmGenel.d = d;
  },
  titret: () => vib(6),
});
// Geri tuşu (dokunarak ya da kenardan kaydırarak): bulunulan ekran "ileri" için saklanır
app.addEventListener('click', e => {
  if (!e.target.closest('.kurulum-ust .geri-dugme')) return;
  if (ILERI_OLUR.includes(S.view)) { ileriYigin.push({ view: S.view, nasilId: S.nasilId }); if (ileriYigin.length > 10) ileriYigin.shift(); }
  gezinme = 'geri';
  setTimeout(() => { if (gezinme === 'geri') gezinme = null; }, 0); // geri tuşu go() çağırmadıysa bayrak kalmasın
}, true);
kenarKaydirKur({
  geriVar: () => !S.modal && S.view !== 'play' && S.view !== 'home' && !!app.querySelector('.kurulum-ust .geri-dugme'),
  ileriVar: () => !S.modal && S.view !== 'play' && ileriYigin.length > 0,
  geri: () => { const b = app.querySelector('.kurulum-ust .geri-dugme'); if (b) b.click(); },
  ileri: () => { const h = ileriYigin.pop(); if (!h) return; gezinme = 'ileri'; go(h.view, h.view === 'nasiloyna' ? { nasilId: h.nasilId } : {}); },
  sayfa: () => app.querySelector('main.page, .page') || app.lastElementChild,
  engel: el => !!(el.closest && el.closest('.kam-tuval, input, textarea, select, .modal-bg, .kam-perde, .dx-acilir, .spot-perde')) || !!document.querySelector('.kam-perde, .modal-bg'),
});
kamEkran.kur({ bildir: (m, ic) => toast(m, '', { tur: { ic: ic || 'kamera', a: ic === 'dikkat' ? 'a-sal' : 'a-zipla', k: ic === 'dikkat' ? 'bad' : '' } }) });
if (location.hash === '#kamera') { S.view = 'kamera'; history.replaceState(null, '', location.pathname + location.search); } // eski kamera.html bağlantısı
acilisGoster(data().settings.acilis !== false); // demirkara.com açılışı: yıldız küresi patlar, dart işaretleriyle döner, DartX logosuna akar
document.documentElement.lang = dil();
if (data().current && data().current.done) { store.finishCurrent(); }
render();
havaGetir(); // hava durumu (Demir 08.11 geri istedi)

// Geliştirirken (localhost) önbellek kapalı; yayında açık
const isDev = ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !isDev) {
  // Otomatik güncelleme (Demir 09.11: "tablette neden güncellenmedi"): sw.js tarayıcı önbelleğine takılmadan kontrol edilir,
  // uygulama her öne gelişinde yeni sürüm aranır; yeni sürüm devreye girince ekran bir kez kendiliğinden yenilenir.
  const ilkKontrol = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    const bak = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') bak(); });
    setInterval(bak, 30 * 60 * 1000);
  }).catch(() => {});
  let yenilendi = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!ilkKontrol || yenilendi) return; // ilk kurulumda değil, yalnız sürüm değişince
    // maç sırasında açık pencere varsa (seçim, leg sonu) kullanıcıyı bölmemek için bir sonraki boş anda yenile
    yenilendi = true;
    const yenile = () => { if (S.modal) return setTimeout(yenile, 3000); location.reload(); };
    yenile();
  });
}
