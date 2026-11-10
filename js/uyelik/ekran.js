// Üyelik ekranları (Demir 11.11): giriş, e-posta ile üye ol / giriş, doğrulama, profili tamamla,
// "bu cihazdaki hangi oyuncu sensin", profil + hesap. DartX cam temasıyla (ay-grup kartları, altın düğme).
import * as H from './hesap.js';
import { hazirMi } from './bulut.js';
import { data, save, updatePlayer, addPlayer } from '../store.js';
import { t, dil } from '../i18n.js';
import { bayrak, ulkeAd, ulkeler, sehirler } from './yer.js';
import { meslekAd, meslekler, SEVIYELER, seviyeBul, seviyeRozet } from './meslek.js';
import { ILCELER } from './ilce.js';
import { MARKALAR, TUNGSTEN, UCLAR, GOVDELER, KANATLAR, secenekAd, secenekler, modeller, markaRozet } from './okset.js';
import { esc, adResim } from '../util.js';
import { ikon } from '../icons.js';
import { bekleyenSayi, varlikTazele, engellenenler, engelKaldir } from './online.js';
import { zeminKontrol } from './zemin.js';
import { saatKontrol } from './saat.js';

let C = null; // app.js'ten gelen yardımcılar: { S, render, go, toast, onayla, bilgi, header, kart, ikonKutu, AY, LUCIDE, vib }
const IC = {};
export function uyelikKur(ctx) {
  C = ctx;
  const L = ctx.LUCIDE;
  Object.assign(IC, {
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2.1 1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.2.1 2.3-.6 3.1-1.5z"/></svg>',
    eposta: L('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>', 18),
    kisi: L('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 17),
    kilit: L('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', 17),
    kamera: L('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>', 16),
    kopya: L('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>', 15),
    el: L('<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>', 17),
    canta: L('<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>', 17),
    madalya: L('<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>', 17),
    lakap: L('<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>', 17),
    // Demir 11.11: ok ağırlığı = dart oku simgesi (terazi değil): uç, gövde, kanatlar
    terazi: L('<path d="M21 3 16.5 7.5"/><path d="m16.5 7.5-2 .6-.6 2 1.5 1.5 2-.6.6-2Z"/><path d="M14 10 6.5 17.5"/><path d="M6.5 17.5 3 16l1.6 2.4L3 21l2.6-1.6L8 21l-1.5-3.5Z"/>', 17),
    yildiz: L('<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>', 17),
    arkadas: L('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', 17),
    nokta: L('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>', 17),
    telefon: L('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>', 17),
    hedefUc: L('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', 17),
    govde: L('<path d="M5 19 19 5"/><path d="m8 16 2 2"/><path d="m14 10 2 2"/>', 17),
    kanat: L('<path d="M12 2 4 10l8 4 8-4Z"/><path d="M12 14v8"/>', 17),
    bilgi: L('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>', 17),
    kure: L('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>', 17),
    ara: L('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', 17),
    konum: L('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', 17),
    bulut: L('<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 15 2 2 4-4"/>', 17),
    geri: L('<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>', 17),
    indir: L('<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>', 17),
    cikis: L('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>', 17),
    sil: L('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>', 17),
    zarf: L('<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>', 40),
    tamam: L('<path d="M20 6 9 17l-5-5"/>', 18),
    giris: L('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>', 16),
    uyeol: L('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>', 16),
    misafir: L('<path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>', 18),
    etiket: L('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', 17),
    goz: L('<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>', 17),
    kural: L('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', 14),
    selam: L('<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>', 22),
    arkadas: L('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', 17),
    ustKisi: L('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>', 17),
  });
  // e-posta bağlantısıyla gelindiyse ya da önceden oturum açıksa Firebase arkada yüklenir
  H.baslat().catch(() => {});
  H.dinle(u => {
    // açılış giriş ekranındayken kayıtlı oturum bulunursa (profil tamam) doğrudan ana sayfaya geç
    if (C.S.view === 'uye' && C.S.uyeIlk && !C.S.uyeMesgul && u.user && u.profil && H.dogrulandi()) { C.S.uyeIlk = false; C.go('home'); return; }
    if (['uye', 'settings', 'online', 'home'].includes(C.S.view)) C.render(); else window.dispatchEvent(new Event('dartx-hesap-rozet'));
  });
  const app = document.getElementById('app');
  app.addEventListener('click', tikla);
  app.addEventListener('submit', gonder);
  app.addEventListener('change', e => { const s = e.target.closest && e.target.closest('select[data-secim]'); if (s) secimDegisti(s); });
  app.addEventListener('change', degisti);
  app.addEventListener('input', yaziyor);
  // oyun sırasında bütün ekran yenilenmesin: yalnız üst çubuktaki hesap düğmesi (rozet) değişir
  window.addEventListener('dartx-hesap-rozet', () => { const d = document.querySelector('.mc-hesap'); if (d) d.outerHTML = hesapDugme(); });
  // Maç bitince ve internet gelince bulut yedeği sessizce güncellenir (hata olursa bir sonrakinde tekrar denenir)
  let yedekT = null;
  const otoYedek = () => { clearTimeout(yedekT); yedekT = setTimeout(() => { if (H.girisli() && H.dogrulandi() && H.uye().profil && navigator.onLine !== false) H.yedekGonder().catch(() => {}); }, 1500); };
  window.addEventListener('dartx-mac-bitti', otoYedek);
  window.addEventListener('online', otoYedek);
  let sonUid = null; // girişte bir kez (her profil değişikliğinde değil)
  H.dinle(u => { const id = u.user && u.profil && u.profil.oyuncuId != null ? u.user.uid : null; if (id && id !== sonUid) otoYedek(); sonUid = id; });
}

// ---- hangi adım gösterilir
function adim() {
  const u = H.uye(), S = C.S;
  if (!H.girisli()) return 'eposta'; // Demir 11.11: girişte doğrudan form gelir
  if (!H.dogrulandi()) return 'dogrula';
  if (!u.profil) return 'tamamla';
  if (u.profil.oyuncuId == null && !u.profil.eslesmeAtlandi && data().players.some(p => !p.silindi)) return 'eslestir';
  return 'profil';
}
const mesgul = () => C.S.uyeMesgul;
// Demir 11.11: görünen ad en çok 12 karakter ve en fazla bir boşluk (skor kartları bozulmasın)
export const SINIR = { ad: [2, 25], soyad: [2, 25], gorunen: [2, 12] };
const GORUNEN_RE = /^[\p{L}\p{N}._-]+( [\p{L}\p{N}._-]+)?$/u;
export function gorunenHata(s) {
  const d = String(s || '').trim();
  if (d.length < SINIR.gorunen[0] || d.length > SINIR.gorunen[1]) return t('{0} {1}–{2} karakter olmalı', t('Maçlarda görünen ad'), SINIR.gorunen[0], SINIR.gorunen[1]);
  if ((d.match(/ /g) || []).length > 1) return t('Görünen adda en fazla bir boşluk olabilir');
  if (!GORUNEN_RE.test(d)) return t('Görünen adda yalnız harf, rakam ve . - _ kullanılabilir');
  return null;
}
const ISIM_RE = /^[\p{L} .'-]+$/u;
export const SIFRE_KURAL = [
  ['uzun', '6+ karakter', s => s.length >= 6],
  ['buyuk', 'Büyük harf', s => /[A-ZÇĞİÖŞÜ]/.test(s)],
  ['rakam', 'Rakam', s => /\d/.test(s)],
  ['ozel', 'Özel karakter (!?*#)', s => /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü\s]/.test(s)],
];
export const sifreUygun = s => SIFRE_KURAL.every(([, , f]) => f(String(s || '')));
const kurallarHtml = (s = '') => `<ul class="uy-kurallar">${SIFRE_KURAL.map(([k, y, f]) => `<li data-k="${k}" class="${f(s) ? 'tamam' : ''}">${IC.kural}<span>${t(y)}</span></li>`).join('')}</ul>`;
// simgeli giriş kutusu
// Demir 11.11: ArchX giriş kartı gibi — simge başlığın başında, kutu sade
// ---- sistem seçicisi (Demir 11.11): satıra dokununca telefonun kendi seçicisi açılır (iPhone tekerlek, Android liste).
// Satırın üstünde görünmez bir <select> durur; seçilince kaydedilir. "Listede yok, yaz" ve "Kaldır" seçenekleri listenin sonunda.
export const emojiBayrak = kod => {
  if (!kod) return '';
  const alt = { 'gb-eng': 'eng', 'gb-sct': 'sct', 'gb-wls': 'wls' }[kod];
  if (alt) return '\u{1F3F4}' + [...('gb' + alt)].map(c => String.fromCodePoint(0xE0000 + c.charCodeAt(0))).join('') + '\u{E007F}';
  if (kod.length !== 2) return '';
  return [...kod.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
};
const BELIRTME = '__belirtme__'; // Demir 11.11: "Belirtmek istemiyorum" — her listenin başında
const secSatir = (act, ic, ad, sag, ogeler, secili, serbest = false) => {
  const s = secili == null ? '' : String(secili);
  if (s === BELIRTME) sag = `<span class="soluk">${t('Belirtmek istemiyorum')}</span>`;
  ogeler = [{ deger: BELIRTME, ad: t('Belirtmek istemiyorum') }, ...ogeler];
  const listede = ogeler.some(o => String(o.deger) === s);
  const sec = (ogeler.length ? '' : '') + (!s ? `<option value="" selected disabled>${t('Seç')}</option>` : '')
    + (s && !listede ? `<option value="${esc(s)}" selected>${esc(s)}</option>` : '')
    + ogeler.map(o => `<option value="${esc(o.deger)}" ${String(o.deger) === s ? 'selected' : ''}>${esc(o.ad)}</option>`).join('')
    + (serbest ? `<option value="__yaz__">✎ ${t('Diğer (elle yaz)')}</option>` : '')
    + (s ? `<option value="__sil__">✕ ${t('Kaldır')}</option>` : '');
  return `<div role="button" tabindex="0" class="ay-satir tikla secim-satir" data-act="uy-secim" data-s="${act}" data-serbest="${serbest ? 1 : ''}" data-ad="${esc(String(ad).replace(/<[^>]+>/g, ''))}">${C.ikonKutu(ic)}<span class="ay-ad">${ad}</span><span class="ay-deger">${sag || `<span class="soluk">${t('Seç')}</span>`}</span><span class="ay-ok">${C.AY.ok}</span>
    <select class="secim-gizli" data-secim="${act}" aria-label="${esc(String(ad).replace(/<[^>]+>/g, ''))}">${sec}</select></div>`;
};
function secimListe(act, p) {
  const dl = dil();
  const sirala = a => a.slice().sort((x, y) => x.localeCompare(y, 'tr'));
  switch (act) {
    case 'uy-el': return [{ deger: 'sag', ad: t('Sağ') }, { deger: 'sol', ad: t('Sol') }];
    case 'uy-seviye': return SEVIYELER.map(s => ({ deger: s.k, ad: `${s.ic} ${dl === 'en' ? s.en : s.tr}` }));
    case 'uy-meslek': return meslekler(dl);
    case 'uy-sevilen': return C.oyunlar().map(([v, l]) => ({ deger: v, ad: l }));
    case 'uy-ulke': return ulkeler(dl).map(o => ({ deger: o.deger, ad: `${emojiBayrak(o.deger)} ${o.ad}` }));
    case 'uy-sehir': return sehirler(p.ulke || (dl === 'tr' ? 'tr' : null)).map(s => ({ deger: s, ad: s }));
    case 'uy-ilce': return sirala(ILCELER[p.sehir] || []).map(s => ({ deger: s, ad: s }));
    case 'uy-okmodel': return modeller(p.okMarka);
    case 'uy-okmarka': return MARKALAR.filter(m => m !== 'Diğer').map(m => ({ deger: m, ad: m }));
    case 'uy-agirlik': return Array.from({ length: 27 }, (_, i) => ({ deger: String(12 + i), ad: `${12 + i} g` }));
    case 'uy-oktungsten': return secenekler(TUNGSTEN, dl);
    case 'uy-okuc': return secenekler(UCLAR, dl);
    case 'uy-okgovde': return secenekler(GOVDELER, dl);
    case 'uy-okkanat': return secenekler(KANATLAR, dl);
  }
  return [];
}
const SECIM_ALAN = { 'uy-el': 'el', 'uy-seviye': 'seviye', 'uy-meslek': 'meslek', 'uy-sevilen': 'sevilenOyun', 'uy-ulke': 'ulke', 'uy-sehir': 'sehir', 'uy-ilce': 'ilce',
  'uy-okmarka': 'okMarka', 'uy-okmodel': 'okModel', 'uy-agirlik': 'agirlik', 'uy-oktungsten': 'okTungsten', 'uy-okuc': 'okUc', 'uy-okgovde': 'okGovde', 'uy-okkanat': 'okKanat' };
// Demir 11.11: dokunmatikte (telefon, tablet) telefonun kendi seçicisi; farede (bilgisayar) DartX temalı aramalı pencere
const dokunmatik = () => matchMedia('(pointer: coarse)').matches;
async function secimDegisti(sel) { return secimKaydet(sel.dataset.secim, sel.value, sel.getAttribute('aria-label') || ''); }
async function secimPencere(el) {
  if (dokunmatik() || document.querySelector('.uy-liste-kart')) return; // dokunmatikte <select> zaten açıldı
  const act = el.dataset.s, p = H.uye().profil || {}, alan = SECIM_ALAN[act];
  const ogeler = [{ deger: BELIRTME, ad: t('Belirtmek istemiyorum') }, ...secimListe(act, p)].map(o => ({ ...o, on: act === 'uy-ulke' ? bayrak(o.deger) : act === 'uy-okmarka' ? markaRozet(o.deger) : '', ad: act === 'uy-ulke' ? o.ad.replace(/^\S+\s/, '') : o.ad }));
  if (el.dataset.serbest) ogeler.push({ deger: '__yaz__', ad: '✎ ' + t('Diğer (elle yaz)') }); // Demir 11.11: listede yoksa elle yazılır
  const v = await listeSec({ baslik: el.dataset.ad, ikon: el.querySelector('.ay-ikon') ? el.querySelector('.ay-ikon').innerHTML : '', ogeler, secili: p[alan] == null ? '' : String(p[alan]), serbest: !!el.dataset.serbest });
  if (v == null) return;
  return secimKaydet(act, v === '' ? '__sil__' : v, el.dataset.ad);
}
async function secimKaydet(act, v, ad) {
  const alan = SECIM_ALAN[act]; if (!alan) return;
  const p = H.uye().profil || {};
  if (v === '__yaz__') {
    const y = await formSor(ad, IC.lakap, [{ ad: 'v', etiket: ad, deger: '', max: 40 }]);
    if (!y || !y.v.trim()) { C.render(); return; }
    v = y.v.trim().replace(/\s+/g, ' ').slice(0, 40);
  }
  if (v === '__sil__') v = '';
  if (String(p[alan] == null ? '' : p[alan]) === v) return;
  let alanlar = { [alan]: v === '' ? null : (alan === 'agirlik' && v !== BELIRTME ? Number(v) : v) };
  if (act === 'uy-okmarka' && v !== (p.okMarka || '')) alanlar.okModel = null;
  if (act === 'uy-ulke' && v !== (p.ulke || '')) alanlar = { ...alanlar, sehir: null, ilce: null };
  if (act === 'uy-sehir') { if (v !== (p.sehir || '')) alanlar.ilce = null; if (!p.ulke && dil() === 'tr') alanlar.ulke = 'tr'; }
  await is(() => H.profilKaydet(alanlar), t('Kaydedildi'));
}
const kutu = (ic, etiket, girdi, ek = '') => `<label class="uy-alan"><span class="uy-etiket">${ic}${etiket}</span><span class="uy-girdi-yer">${girdi}${ek}</span></label>`;
const gozBtn = () => `<button type="button" class="uy-goz" data-act="uy-goz" aria-label="${t('Şifreyi göster')}">${IC.goz}</button>`;
function isimKontrol(deger, [en, ec], ad) {
  const s = String(deger || '').trim();
  if (s.length < en || s.length > ec) return t('{0} {1}–{2} karakter olmalı', ad, en, ec);
  if (!ISIM_RE.test(s)) return t('{0} yalnız harf içerebilir', ad);
  return null;
}
const btn = (act, yazi, ek = '', tur = '') => `<button type="button" class="btn ${tur} uy-btn" data-act="${act}" ${ek} ${mesgul() ? 'disabled' : ''}>${yazi}</button>`;
const sayfa = (ic, sinif = '') => `<main class="page ayarlar uye-sayfa ${sinif} ${C.S.uyeIlk && sinif !== 'profil' ? 'ilk' : ''}">${C.header(t('Hesabım'), C.S.uyeDonus || 'home')}${ic}</main>`;
/** Demir 11.11: giriş ekranlarında üst çubuk yok (programa daha girilmedi) */
export const girisEkrani = () => C.S.view === 'eylem' || (C.S.view === 'uye' && hazirMi() && adim() !== 'profil');

// ---- e-posta bağlantısı sayfası (Demir 11.11): Firebase'in sade sayfası yerine DartX temasıyla dartx.net'te açılır
const EYLEMLER = ['verifyEmail', 'resetPassword', 'verifyAndChangeEmail'];
/** Açılışta çağrılır: adres bir e-posta bağlantısıysa sayfayı hazırlar → true */
export function eylemBaslat() {
  const q = new URLSearchParams(location.search);
  const tur = q.get('eylem'), kod = q.get('kod');
  if (!hazirMi() || !EYLEMLER.includes(tur) || !kod) return false;
  C.S.eylem = { tur, kod, durum: 'bekliyor', eposta: '' };
  C.S.view = 'eylem';
  (async () => {
    const E = C.S.eylem;
    try {
      if (tur === 'resetPassword') { E.eposta = await H.sifreKodBak(kod); E.durum = 'form'; }
      else { await H.eylemUygula(kod); E.durum = 'tamam'; }
    } catch (e) { console.warn(e); E.durum = 'hata'; }
    C.render();
  })();
  return true;
}
const EYLEM_IC = {
  tamam: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12.5 2.7 2.7L16 9.8"/></svg>',
  hata: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4.5"/><path d="M12 16h.01"/></svg>',
};
export function viewEylem() {
  const E = C.S.eylem || { durum: 'hata' };
  const kap = ic => `<main class="page ayarlar uye-sayfa ilk eylem"><div class="uy-duzen tek">${logo()}${kartAc()}<div class="uy-ic uy-eylem">${ic}</div>${kartKapa()}</div></main>`;
  const ac = `<button type="button" class="btn primary uy-btn" data-act="uy-eylembitir">${t('DartX’i aç')}</button>`;
  if (E.durum === 'bekliyor') return kap(`<div class="uy-eylem-ic yukleniyor">${IC.zarf}</div><h2 class="uy-baslik">${t('Bağlantı kontrol ediliyor…')}</h2>`);
  if (E.durum === 'hata') return kap(`<div class="uy-eylem-ic kotu">${EYLEM_IC.hata}</div><h2 class="uy-baslik">${t('Bu bağlantı artık geçerli değil')}</h2>
    <p class="uy-not">${t('Süresi dolmuş ya da daha önce kullanılmış olabilir. Uygulamadan yeni bağlantı ya da kod isteyebilirsin.')}</p>${ac}`);
  if (E.durum === 'tamam') {
    const [b, m] = E.tur === 'verifyEmail' ? [t('E-postan doğrulandı'), t('Hesabın hazır. DartX’e dön; uygulama doğrulamayı kendiliğinden algılar.')]
      : E.tur === 'verifyAndChangeEmail' ? [t('E-posta adresin değişti'), t('Uygulamada yeni adresinle yeniden giriş yap.')]
      : [t('Şifren değişti'), t('Uygulamada yeni şifrenle giriş yapabilirsin.')];
    return kap(`<div class="uy-eylem-ic iyi">${EYLEM_IC.tamam}</div><h2 class="uy-baslik">${b}</h2><p class="uy-not">${m}</p>${ac}`);
  }
  // şifre sıfırlama formu
  return kap(`<div class="uy-eylem-ic">${IC.kilit}</div><h2 class="uy-baslik">${t('Yeni şifre belirle')}</h2>
    <p class="uy-not">${esc(E.eposta)}</p>
    <form class="uy-form uy-sifreyeni" data-act="uy-sifreyeni" novalidate>
      ${kutu(IC.kilit, t('Yeni şifre'), `<input name="sifre" type="password" minlength="6" maxlength="64" autocomplete="new-password" placeholder="${t('Yeni şifren')}">`, gozBtn())}
      ${kutu(IC.kilit, t('Şifre (tekrar)'), `<input name="sifre2" type="password" maxlength="64" autocomplete="new-password" placeholder="${t('Şifreni tekrar yaz')}">`, gozBtn())}
      <p class="uy-ipucu uy-eslesme" hidden></p>
      ${kurallarHtml()}
      <button type="submit" class="btn primary uy-btn" ${mesgul() ? 'disabled' : ''}>${t('Şifremi kaydet')}</button>
    </form>`);
}
// Demir 11.11: logonun altında açıklama yok (giriş ekranları sade)
// Demir 11.11: giriş ekranında saat/tarih yok (üst çubukta zaten var); üstte DartX logosu
// Demir 11.11: logoya ve alttaki telif yazısına basınca "DartX Hakkında" penceresi açılır (ArchX giriş ekranı gibi)
const hatirla = () => localStorage.getItem('dartx.hatirla') !== '0';
const logo = () => `<div class="uy-kapak"><button type="button" class="uy-logo-dugme" data-act="uy-hakkinda" aria-label="${t('DartX Hakkında')}"><img class="uy-logo" src="img/logo-dartx.webp" alt="DartX"></button></div>`;
// ArchX giriş kartı: çevresinde dönen fitil (cam-fitil), altta DartX logosu, telif, tema ve dil düğmeleri
const FITIL = '<span class="cam-fitil-hale" aria-hidden="true"><span class="cam-fitil-halka"><span class="cam-fitil"></span></span></span>';
const kartAc = () => `<div class="uy-cerceve">${FITIL}<section class="ay-grup uy-kart">`;
const kartKapa = () => `<span class="cam-fitil-cizgi" aria-hidden="true"><span class="cam-fitil"></span></span>
  <div class="uy-alt"><div class="uy-alt-dugmeler">${C.altDugmeler()}</div><button type="button" class="uy-alt-telif" data-act="uy-hakkinda">© ${new Date().getFullYear()} DartX · ${t('Tüm hakları saklıdır.')}</button></div>
  </section></div>`;
/** Ekran çizildikten sonra: giriş ekranlarında yıldız küresi ve cam saat */
// Demir 11.11: doğrulama ekranındayken birkaç saniyede bir sessizce bakılır; bağlantıya dokunulunca kendiliğinden geçer
let dogrulaSaat = null;
function dogrulaIzle(acik) {
  if (acik && !dogrulaSaat) {
    const bak = () => { if (document.visibilityState === 'visible' && !C.S.uyeMesgul) H.yenile().catch(() => {}); };
    dogrulaSaat = setInterval(bak, 4000);
    document.addEventListener('visibilitychange', bak); window.addEventListener('focus', bak);
    dogrulaSaat.bak = bak;
  } else if (!acik && dogrulaSaat) {
    clearInterval(dogrulaSaat); document.removeEventListener('visibilitychange', dogrulaSaat.bak); window.removeEventListener('focus', dogrulaSaat.bak); dogrulaSaat = null;
  }
}
export function ekranSonra() {
  dogrulaIzle(C.S.view === 'uye' && !!document.querySelector('.uy-kodform'));
  const giris = C.S.view === 'eylem' || (C.S.view === 'uye' && !!document.querySelector('.uye-sayfa:not(.profil)'));
  zeminKontrol(giris);
  saatKontrol();
}

export function viewUye() {
  if (!hazirMi()) {
    return sayfa(`<div class="uy-duzen tek">${logo(t('Üyelik çok yakında: maçların ve istatistiklerin her cihazında, arkadaşlarınla online maç.'))}
      ${C.kart(IC.kisi, t('Şimdilik'), `<div class="hk-metin"><p>${t('DartX üye olmadan, internetsiz çalışmaya devam ediyor. Verilerin yalnız bu cihazda.')}</p></div>`)}</div>`);
  }
  const a = adim();
  if (a === 'giris') return sayfa(`<div class="uy-duzen">
      ${logo(t('Maçların ve istatistiklerin her cihazında. Üye olunca arkadaşlarınla online maç da yakında.'))}
      ${kartAc()}
        <div class="uy-hosgeldin"><h2><span class="uy-baslik-ic">${IC.selam}</span>${t('Hoş geldin')}</h2><p>${t('Hesabınla devam et ya da hemen oyna')}</p></div>
        <div class="uy-ic">
          ${btn('uy-google', `<span class="uy-marka">${IC.google}</span>${t('Google ile devam et')}`, '', 'uy-saglayici')}
          ${btn('uy-apple', `<span class="uy-marka">${IC.apple}</span>${t('Apple ile devam et')}`, '', 'uy-saglayici')}
          ${btn('uy-epostaac', `<span class="uy-marka">${IC.eposta}</span>${t('E-posta ile devam et')}`, '', 'uy-saglayici')}
          <div class="uy-ayrac"><span>${t('veya')}</span></div>
          ${btn('uy-misafir', `<span class="uy-marka misafir"><img src="img/logo-x.webp" alt=""></span>${t('Misafir olarak devam et')}`, '', 'uy-saglayici uy-misafir-btn')}
          <p class="uy-not">${t('Misafirken oyuncuların, maçların ve istatistiklerin yalnız bu cihazda kalır. İstediğin zaman üye olabilirsin.')}</p>
        </div>
      ${kartKapa()}</div>`);
  if (a === 'eposta') {
    const kayit = C.S.uyeMod === 'kayit';
    return sayfa(`<div class="uy-duzen ${kayit ? 'kayit' : ''}">
      ${logo()}
      ${kartAc()}
        <form class="uy-ic uy-form ${kayit ? 'kayit' : ''}" data-act="uy-eposta" novalidate>
          <div class="ay-seg uy-seg"><button type="button" class="${kayit ? '' : 'on'}" data-act="uy-mod" data-v="giris">${IC.giris}${t('Giriş yap')}</button><button type="button" class="${kayit ? 'on' : ''}" data-act="uy-mod" data-v="kayit">${IC.uyeol}${t('Üye ol')}</button></div>
          ${kayit ? `<div class="uy-kolonlar">
          <div class="uy-kolon">
            <div class="uy-iki">
              ${kutu(IC.kisi, t('Ad'), `<input name="isim" autocomplete="given-name" maxlength="${SINIR.ad[1]}" placeholder="${t('Adın')}" value="${esc(C.S.uyeTaslak?.isim || '')}">`)}
              ${kutu(IC.kisi, t('Soyad'), `<input name="soyisim" autocomplete="family-name" maxlength="${SINIR.soyad[1]}" placeholder="${t('Soyadın')}" value="${esc(C.S.uyeTaslak?.soyisim || '')}">`)}
            </div>
            ${kutu(IC.etiket, t('Maçlarda görünen ad'), `<input name="ad" autocomplete="nickname" maxlength="${SINIR.gorunen[1]}" placeholder="${t('Örn. Demir, D.Kara, Kartal')}" value="${esc(C.S.uyeTaslak?.ad || '')}">`)}
            <p class="uy-ipucu uy-ad-durum" hidden></p>
            <p class="uy-ipucu">${t('En çok {1} karakter ve bir boşluk; eşsiz olmalı. Arkadaşların ve skor tablosu bu adı görür.', SINIR.gorunen[0], SINIR.gorunen[1])}</p>
            ${kutu(IC.eposta, t('E-posta'), `<input name="eposta" type="email" inputmode="email" autocomplete="email" maxlength="80" placeholder="ornek@eposta.com" value="${esc(C.S.uyeTaslak?.eposta || '')}">`)}
          </div>
          <div class="uy-kolon">
            ${kutu(IC.kilit, t('Şifre'), `<input name="sifre" type="password" minlength="6" maxlength="64" autocomplete="new-password" placeholder="${t('Yeni şifren')}">`, gozBtn())}
            ${kutu(IC.kilit, t('Şifre (tekrar)'), `<input name="sifre2" type="password" maxlength="64" autocomplete="new-password" placeholder="${t('Şifreni tekrar yaz')}">`, gozBtn())}
            <p class="uy-ipucu uy-eslesme" hidden></p>
            ${kurallarHtml()}
            <label class="uy-onay"><input type="checkbox" name="yas" ${C.S.uyeTaslak?.yas ? 'checked' : ''}><span>${t('13 yaşından büyüğüm')}</span></label>
            <label class="uy-onay"><input type="checkbox" name="sozlesme" ${C.S.uyeTaslak?.sozlesme ? 'checked' : ''}><span>${t('Kullanım şartlarını ve {0} okudum', `<a href="#" data-act="uy-gizlilik">${t('gizlilik politikasını')}</a>`)}</span></label>
          </div>
          </div>
          <p class="uy-ipucu uy-dogrula-not">${t('Üye olduktan sonra e-postana gelen bağlantıyla hesabını doğrulaman gerekir.')}</p>
          <button type="submit" class="btn primary uy-btn" ${mesgul() ? 'disabled' : ''}>${IC.uyeol + t('Üye ol')}</button>`
          : `${kutu(IC.eposta, t('E-posta'), `<input name="eposta" type="email" inputmode="email" autocomplete="email" maxlength="80" placeholder="ornek@eposta.com" value="${esc(C.S.uyeTaslak?.eposta || (hatirla() && localStorage.getItem('dartx.sonEposta')) || '')}">`)}
          ${kutu(IC.kilit, t('Şifre'), `<input name="sifre" type="password" minlength="6" maxlength="64" autocomplete="current-password" placeholder="${t('Şifren')}">`, gozBtn() + `<button type="submit" class="uy-ok" aria-label="${t('Giriş yap')}" title="${t('Giriş yap')}" ${mesgul() ? 'disabled' : ''}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>`)}
          <div class="uy-linkler uy-linkler-giris"><label class="uy-onay uy-hatirla"><input type="checkbox" name="hatirla" ${hatirla() ? 'checked' : ''}><span>${t('Beni hatırla')}</span></label><button type="button" data-act="uy-sifreunut">${t('Şifremi unuttum?')}</button></div>`}
        </form>
        <div class="uy-ic uy-diger">
          <div class="uy-ayrac"><span>${t('veya')}</span></div>
          ${btn('uy-google', `<span class="uy-marka">${IC.google}</span>${t('Google ile devam et')}`, '', 'uy-saglayici')}
          ${btn('uy-apple', `<span class="uy-marka">${IC.apple}</span>${t('Apple ile devam et')}`, '', 'uy-saglayici')}
          ${btn('uy-misafir', `<span class="uy-marka misafir"><img src="img/logo-x.webp" alt=""></span>${t('Misafir olarak devam et')}`, '', 'uy-saglayici uy-misafir-btn')}
          <p class="uy-not">${t('Misafirken oyuncuların, maçların ve istatistiklerin yalnız bu cihazda kalır. İstediğin zaman üye olabilirsin.')}</p>
        </div>
      ${kartKapa()}</div>`);
  }
  const u = H.uye();
  if (a === 'dogrula') return sayfa(`<div class="uy-duzen tek">
      <section class="ay-grup uy-kart uy-ortala">
        <div class="uy-zarf">${IC.zarf}</div>
        <h2 class="uy-baslik">${t('E-postanı kontrol et')}</h2>
        <p class="uy-not">${t('{0} adresine doğrulama bağlantısı ve 6 haneli kod gönderdik. Bağlantıya dokunduğunda burası kendiliğinden geçer.', `<b>${esc(u.user.email)}</b>`)}</p>
        <p class="uy-bekle"><span class="uy-bekle-nokta"></span>${t('Doğrulama bekleniyor…')}</p>
        <div class="uy-ic">
          <form class="uy-kodform" data-act="uy-kodla" novalidate>
            <label class="uy-kod-etiket">${IC.kilit}<span>${t('Kodla doğrula')}</span></label>
            <div class="uy-kod-satir"><input class="uy-girdi uy-kod-girdi" name="kod" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" maxlength="6" placeholder="••••••" aria-label="${t('Kodla doğrula')}">
            <button type="submit" class="btn primary uy-btn" ${mesgul() ? 'disabled' : ''}>${t('Doğrula')}</button></div>
            <p class="uy-ipucu">${t('Kod 24 saat geçerli.')}</p>
          </form>
          ${btn('uy-yenidengonder', t('Yeniden gönder'))}
          <p class="uy-not">${t('Gelmediyse Spam klasörüne bak. Gönderen: noreply@dartx.net')}</p>
          <button type="button" class="uy-misafir soluk" data-act="uy-cikis">${t('Başka bir hesapla giriş yap')}</button>
        </div>
      </section></div>`);
  if (a === 'tamamla') { try { const ts = JSON.parse(localStorage.getItem('dartx.uyeTaslak') || 'null'); if (ts && !C.S.uyeTaslak) C.S.uyeTaslak = ts; } catch (_) { /* yok */ } }
  if (a === 'tamamla') return sayfa(`<div class="uy-duzen tek">
      <section class="ay-grup uy-kart">
        <div class="kart-bas">${IC.kisi}<span>${t('Profilini tamamla')}</span></div>
        <form class="uy-ic uy-form" data-act="uy-tamamla" novalidate>
          <div class="uy-iki">
            ${kutu(IC.kisi, t('Ad'), `<input name="isim" autocomplete="given-name" maxlength="${SINIR.ad[1]}" value="${esc(C.S.uyeTaslak?.isim || (u.user.displayName || '').split(' ').slice(0, -1).join(' ') || u.user.displayName || '')}" placeholder="${t('Adın')}">`)}
            ${kutu(IC.kisi, t('Soyad'), `<input name="soyisim" autocomplete="family-name" maxlength="${SINIR.soyad[1]}" value="${esc(C.S.uyeTaslak?.soyisim || ((u.user.displayName || '').includes(' ') ? (u.user.displayName || '').split(' ').pop() : ''))}" placeholder="${t('Soyadın')}">`)}
          </div>
          ${kutu(IC.etiket, t('Maçlarda görünen ad'), `<input name="ad" autocomplete="nickname" maxlength="${SINIR.gorunen[1]}" value="${esc(C.S.uyeTaslak?.ad || (u.user.displayName || '').split(' ')[0] || '')}" placeholder="${t('Örn. Demir, D.Kara, Kartal')}">`)}
          <p class="uy-ipucu uy-ad-durum" hidden></p>
          <p class="uy-ipucu">${t('En çok {1} karakter ve bir boşluk; eşsiz olmalı. Arkadaşların ve skor tablosu bu adı görür.', SINIR.gorunen[0], SINIR.gorunen[1])}</p>
          <label class="uy-onay"><input type="checkbox" name="yas" ${C.S.uyeTaslak?.yas ? 'checked' : ''}><span>${t('13 yaşından büyüğüm')}</span></label>
          <label class="uy-onay"><input type="checkbox" name="sozlesme" ${C.S.uyeTaslak?.sozlesme ? 'checked' : ''}><span>${t('Kullanım şartlarını ve {0} okudum', `<a href="#" data-act="uy-gizlilik">${t('gizlilik politikasını')}</a>`)}</span></label>
          <button type="submit" class="btn primary uy-btn" ${mesgul() ? 'disabled' : ''}>${t('Devam et')}</button>
        </form>
      </section></div>`);
  if (a === 'eslestir') {
    const say = id => (data().history || []).filter(h => h.sides && h.sides.some(s => s.members && s.members.includes(id))).length;
    const oyuncular = data().players.filter(p => !p.silindi && !/^dartbot/i.test(p.name));
    const sec = C.S.uyeSecili;
    return sayfa(`<div class="uy-duzen tek">
      <section class="ay-grup uy-kart">
        <div class="kart-bas">${IC.kisi}<span>${t('Bu cihazdaki hangi oyuncu sensin?')}</span></div>
        <div class="uy-ic">
          <p class="uy-not sol">${t('Seçtiğin oyuncunun bütün maçları ve istatistikleri hesabına bağlanır. Diğer oyuncular bu cihazda misafir olarak kalır.')}</p>
          <div class="uy-liste">${oyuncular.map(p => `<button type="button" class="ay-satir tikla uy-oyuncu ${sec === p.id ? 'on' : ''}" data-act="uy-oyuncusec" data-id="${p.id}">
            ${avatarHtml(p.name, p.foto, p.color, 'uy-av kucuk')}<span class="ay-ad">${esc(p.name)}<small>${t('{0} maç', say(p.id))}</small></span>${sec === p.id ? `<span class="uy-tik">${IC.tamam}</span>` : ''}</button>`).join('')}</div>
          ${btn('uy-eslestir', t('Bu benim, bağla'), sec ? '' : 'disabled', 'primary')}
          <button type="button" class="uy-misafir" data-act="uy-eslesmeatla">${t('Hiçbiri değil, yeni başla')}</button>
        </div>
      </section></div>`);
  }
  return viewProfil();
}

function avatarHtml(ad, foto, renk, sinif = 'uy-av') {
  const r = foto || adResim(ad); // profil fotoğrafı yoksa karakter avatarı (Demir, Tuncay, Kenan)
  if (r) return `<img class="${sinif}" src="${r}" alt="">`;
  const harf = (String(ad || '?').trim()[0] || '?').toLocaleUpperCase('tr');
  return `<span class="${sinif} harf" style="--pc:${renk || 'var(--brand)'}">${esc(harf)}</span>`;
}

function viewProfil() {
  const u = H.uye(), p = u.profil || {};
  const pw = H.saglayici() === 'password';
  const yer = { 'google.com': 'Google', 'apple.com': 'Apple', password: t('E-posta') }[H.saglayici()] || '';
  const deger = (k, bos) => (p[k] ? esc(p[k]) : `<span class="soluk">${bos}</span>`);
  const elAd = { sag: t('Sağ'), sol: t('Sol') };
  const zaman = data().bulutZaman ? new Date(data().bulutZaman).toLocaleString(document.documentElement.lang || 'tr', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : t('Henüz yok');
  const satir = (act, ic, ad, sag = '', ek = '') => `<button type="button" class="ay-satir tikla ${ek}" data-act="${act}">${C.ikonKutu(ic)}<span class="ay-ad">${ad}</span>${sag ? `<span class="ay-deger">${sag}</span>` : ''}<span class="ay-ok">${C.AY.ok}</span></button>`;
  return sayfa(`<div class="uy-duzen iki">
    <section class="ay-grup uy-kart uy-profil">
      <div class="uy-foto-yer">
        <label class="uy-foto" aria-label="${t('Profil fotoğrafı')}">${avatarHtml(p.ad, p.foto, null, 'uy-av buyuk')}<span class="uy-foto-ic">${IC.kamera}</span>
          <input type="file" accept="image/*" data-act="uy-foto" hidden></label>
        <b class="uy-ad">${esc(p.ad || u.user.displayName || '')}</b>
        ${p.lakap || p.seviye ? `<span class="uy-ad-alt">${p.lakap ? `<i class="uy-lakap">“${esc(p.lakap)}”</i>` : ''}${seviyeRozet(p.seviye, dil())}</span>` : ''}
        <small class="uy-eposta">${esc(u.user.email || '')} · ${yer}</small>
        ${p.kod ? `<button type="button" class="uy-kod" data-act="uy-kodkopya">${t('Arkadaş kodu')}: <b>${p.kod}</b> ${IC.kopya}</button>` : ''}        ${p.foto ? `<button type="button" class="uy-misafir soluk" data-act="uy-fotosil">${t('Fotoğrafı kaldır')}</button>` : ''}
      </div>
      ${satir('uy-adsoyad', IC.kisi, t('Ad soyad'), p.isim || p.soyisim ? esc(`${p.isim || ''} ${p.soyisim || ''}`.trim()) : `<span class="soluk">${t('Yaz')}</span>`)}
      ${satir('uy-lakap', IC.lakap, t('Lakap'), p.lakap ? esc(p.lakap) : `<span class="soluk">${t('Yaz')}</span>`)}
      ${satir('uy-ad', IC.etiket, t('Maçlarda görünen ad'), deger('ad', ''))}
      ${secSatir('uy-el', IC.el, t('Atış eli'), p.el ? elAd[p.el] : '', secimListe('uy-el', p), p.el)}
      ${secSatir('uy-seviye', IC.madalya, t('Seviye'), p.seviye ? seviyeRozet(p.seviye, dil()) : '', secimListe('uy-seviye', p), p.seviye)}
      ${secSatir('uy-meslek', IC.canta, t('Meslek'), p.meslek ? esc(meslekAd(p.meslek, dil())) : '', secimListe('uy-meslek', p), p.meslek, true)}
      ${secSatir('uy-sevilen', IC.yildiz, t('Sevdiğin oyun'), p.sevilenOyun ? esc(p.sevilenOyun) : '', secimListe('uy-sevilen', p), p.sevilenOyun)}
      ${secSatir('uy-ulke', IC.kure, t('Ülke'), p.ulke ? `<span class="yer-deger">${bayrak(p.ulke)}${esc(ulkeAd(p.ulke, dil()))}</span>` : '', secimListe('uy-ulke', p), p.ulke)}
      ${secSatir('uy-sehir', IC.konum, t('Şehir'), p.sehir ? esc(p.sehir) : '', secimListe('uy-sehir', p), p.sehir, true)}
      ${(p.ulke || 'tr') === 'tr' && p.sehir ? secSatir('uy-ilce', IC.konum, t('İlçe'), p.ilce ? esc(p.ilce) : '', secimListe('uy-ilce', p), p.ilce, true) : ''}
      ${satir('uy-telefon', IC.telefon, t('Cep telefonu'), p.telefonGorunen ? esc(p.telefonGorunen) : `<span class="soluk">${t('Ekle (isteğe bağlı)')}</span>`)}
      <div class="kart-bas uy-ic-bas">${IC.terazi}<span>${t('Ok setim')}</span></div>
      ${(() => { const sec = v => v || `<span class="soluk">${t('Seç')}</span>`; const dl = dil();
        return secSatir('uy-okmarka', IC.yildiz, t('Marka'), p.okMarka ? `<span class="yer-deger">${markaRozet(p.okMarka)}${esc(p.okMarka)}</span>` : '', secimListe('uy-okmarka', p), p.okMarka, true)
          // Demir 11.11: model her zaman seçici; markanın listesi yoksa "Listede yok, yaz" ile yazılır
          + secSatir('uy-okmodel', IC.lakap, t('Model'), p.okModel ? esc(p.okModel) : '', modeller(p.okMarka), p.okModel, true)
          + secSatir('uy-agirlik', IC.terazi, t('Ağırlık'), p.agirlik ? `${p.agirlik} g` : '', secimListe('uy-agirlik', p), p.agirlik ? String(p.agirlik) : '')
          + secSatir('uy-oktungsten', IC.madalya, t('Malzeme'), secenekAd(TUNGSTEN, p.okTungsten, dl), secimListe('uy-oktungsten', p), p.okTungsten)
          + secSatir('uy-okuc', IC.hedefUc, t('Uç'), secenekAd(UCLAR, p.okUc, dl), secimListe('uy-okuc', p), p.okUc)
          + secSatir('uy-okgovde', IC.govde, t('Gövde (shaft)'), secenekAd(GOVDELER, p.okGovde, dl), secimListe('uy-okgovde', p), p.okGovde)
          + secSatir('uy-okkanat', IC.kanat, t('Kanat (flight)'), secenekAd(KANATLAR, p.okKanat, dl), secimListe('uy-okkanat', p), p.okKanat); })()}
    </section>
    <section class="ay-grup uy-kart">
      <div class="kart-bas">${IC.kilit}<span>${t('Hesap')}</span></div>
      ${(n => satir('uy-arkadaslar', IC.arkadas, t('Arkadaşlarım'), n ? `<i class="uy-satir-sayi">${n}</i>` : ''))(bekleyenSayi())}
      ${satir('uy-engeller', IC.sil, t('Engellediklerim'))}
      ${satir('uy-durumgizle', IC.nokta, t('Çevrimiçi durumumu göster'), `<span class="uy-anahtar ${p.durumGizli ? '' : 'acik'}" role="switch" aria-checked="${p.durumGizli ? 'false' : 'true'}"><i></i></span>`)}
      ${satir('uy-yedekle', IC.bulut, t('Bulut yedeği'), zaman)}
      ${satir('uy-buluttanal', IC.geri, t('Buluttaki yedeği bu cihaza yükle'))}
      ${pw ? satir('uy-epostadegis', IC.eposta, t('E-postamı değiştir'), p.epostaBekleyen && p.epostaBekleyen !== u.user.email
        // Demir 11.11: onay maili gittiyse yeni adres "onay bekliyor" olarak görünür; onaylanıp yeni adresle girilince kalkar
        ? `<span class="uy-eposta-deger"><span class="uy-eposta-bekle">${t('Onay bekliyor')}</span>${esc(p.epostaBekleyen)}</span>`
        : `<span class="uy-eposta-deger">${esc(u.user.email || '')}</span>`) : ''}
      ${pw ? satir('uy-sifredegis', IC.kilit, t('Şifremi değiştir')) : ''}
      ${satir('uy-indir', IC.indir, t('Verilerimi indir'))}
      ${satir('uy-cikis', IC.cikis, t('Çıkış yap'))}
      ${satir('uy-hesapsil', IC.sil, t('Hesabımı sil'), '', 'uy-tehlike')}
      <p class="uy-not sol">${t('Hesabını silince buluttaki her şey kalıcı olarak gider. Bu cihazdaki maçlar kalır.')}</p>
    </section></div>`, 'profil');
}

// ---- Üst çubukta hesap düğmesi + ArchX logo menüsü gibi açılır menü (Demir 11.11); ana ekranda "Hesabım" simgesi
const avatarIc = (sinif) => { const u = H.uye(), p = u.profil || {}; return H.girisli() ? avatarHtml(p.ad || (u.user && u.user.displayName), p.foto, null, sinif) : `<span class="${sinif} misafir">${IC.ustKisi}</span>`; };
export function hesapDugme() {
  if (!hazirMi()) return '';
  const n = H.girisli() ? bekleyenSayi() : 0;
  return `<button class="mc-dugme mc-hesap" data-act="uy-menu" aria-label="${t('Hesabım')}" title="${t('Hesabım')}">${avatarIc('mc-av')}${n ? `<i class="mc-hesap-sayi">${n}</i>` : ''}${H.girisli() && H.uye().profil ? `<i class="mc-durum ${H.uye().profil.durumGizli ? 'gizli' : 'acik'}" aria-hidden="true"></i>` : ''}</button>`;
}
export function hesapKaro() {
  if (!hazirMi()) return '';
  const n = H.girisli() ? bekleyenSayi() : 0;
  return `<button class="app" data-act="uy-ac"><span class="app-ico simge">${ikon('hesap')}${n ? `<i class="klasor-sayi">${n}</i>` : ''}</span><span class="app-ad">${t('Hesabım')}</span></button>`;
}
function menuKapat() { const m = document.getElementById('uy-acilir'); if (m) { m.classList.add('kapan'); setTimeout(() => m.remove(), 160); } document.removeEventListener('pointerdown', disTik, true); }
function disTik(e) { if (!e.target.closest('#uy-acilir, [data-act="uy-menu"]')) menuKapat(); }
function menuAc(dugme) {
  if (document.getElementById('uy-acilir')) { menuKapat(); return; }
  const u = H.uye(), p = u.profil || {};
  const satir = (act, ic, yazi, sag = '') => `<button type="button" data-act="${act}"><i class="uy-m-ic">${ic}</i><span>${yazi}</span>${sag ? `<small>${sag}</small>` : ''}</button>`;
  let ic;
  if (!H.girisli()) {
    ic = `<div class="uy-m-bas">${avatarIc('uy-m-av')}<div><b>${t('Misafir')}</b><small>${t('Veriler yalnız bu cihazda')}</small></div></div><span class="cizgi"></span>
      ${satir('uy-m-giris', IC.giris, t('Giriş yap'))}${satir('uy-m-uyeol', IC.uyeol, t('Üye ol'))}<span class="cizgi"></span>${satir('uy-m-hakkinda', IC.bilgi, t('Hakkında'))}`;
  } else {
    const n = bekleyenSayi();
    const zaman = data().bulutZaman ? new Date(data().bulutZaman).toLocaleTimeString(document.documentElement.lang || 'tr', { hour: '2-digit', minute: '2-digit' }) : t('Henüz yok');
    ic = `<div class="uy-m-bas">${avatarIc('uy-m-av')}<div><b>${esc(p.ad || u.user.displayName || '')}</b><small>${p.kod ? `${t('Arkadaş kodu')}: ${p.kod}` : esc(u.user.email || '')}</small><button type="button" class="uy-m-durum ${p.durumGizli ? 'gizli' : 'acik'}" data-act="uy-durumgizle" title="${t('Dokun: değiştir')}"><i></i>${p.durumGizli ? t('Görünmez') : t('Çevrimiçi')}</button></div></div><span class="cizgi"></span>
      ${H.dogrulandi() ? '' : satir('uy-ac', IC.eposta, t('E-postanı doğrula'))}
      ${satir('uy-ac', IC.kisi, t('Profilim'))}
      ${satir('uy-m-online', IC.arkadas, t('Arkadaşlar ve online maçlar'), n ? `<i class="uy-m-sayi">${n}</i>` : '')}
      ${satir('uy-yedekle', IC.bulut, t('Bulut yedeği'), zaman)}
      ${satir('uy-m-hakkinda', IC.bilgi, t('Hakkında'))}
      <span class="cizgi"></span>
      ${satir('uy-cikis', IC.cikis, t('Çıkış yap'))}`;
  }
  const m = document.createElement('div'); m.id = 'uy-acilir'; m.className = 'uy-acilir'; m.innerHTML = ic;
  document.body.appendChild(m);
  const r = dugme.getBoundingClientRect();
  m.style.top = Math.round(r.bottom + 8) + 'px';
  m.style.right = Math.max(6, Math.round(window.innerWidth - r.right - 4)) + 'px';
  m.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) { menuKapat(); tikla({ target: b, preventDefault() {} }); } });
  setTimeout(() => document.addEventListener('pointerdown', disTik, true), 0);
}

// ---- Ayarlar ve Online sayfası için küçük kart
export function hesapKarti() {
  if (!hazirMi()) return '';
  const u = H.uye();
  if (!H.girisli()) return `<button type="button" class="ay-satir tikla uy-giris-satir" data-act="uy-ac">${C.ikonKutu(IC.kisi)}<span class="ay-ad">${t('Giriş yap ya da üye ol')}<small>${t('Maçların her cihazında, yakında online maç')}</small></span><span class="ay-ok">${C.AY.ok}</span></button>`;
  const p = u.profil || {};
  return `<button type="button" class="ay-satir tikla uy-giris-satir" data-act="uy-ac">${avatarHtml(p.ad || u.user.displayName, p.foto, null, 'uy-av kucuk')}<span class="ay-ad">${esc(p.ad || u.user.displayName || u.user.email)}<small>${H.dogrulandi() ? (p.kod ? `${t('Arkadaş kodu')}: ${p.kod}` : '') : t('E-postanı doğrula')}</small></span><span class="ay-ok">${C.AY.ok}</span></button>`;
}
/** İlk açılışta bir kez giriş ekranı (misafir seçilebilir) */
export function ilkAcilisSor() {
  const s = data().settings;
  // Demir 11.11: üye girişi açık değilse HER açılışta (açılış efektinden sonra) önce giriş ekranı gelir; misafir oradan geçer
  if (!hazirMi() || H.girisli() || s.uyeOturum) return false;
  C.S.uyeIlk = true; // ilk açılış: geri düğmesi yok, misafir ya da giriş ile uygulamaya girilir
  H.baslat(true).catch(() => {}); // cihazda kayıtlı oturum varsa bulunur, giriş ekranı kendiliğinden geçilir
  return true;
}

// ---- olaylar
async function is(fn, basari) {
  C.S.uyeMesgul = true; C.render();
  try { const r = await fn(); if (basari) C.toast(basari, 'ok'); return r; }
  catch (e) { console.warn(e); C.toast(H.hataMetni(e), 'bad', { sure: 3200 }); return undefined; }
  finally { C.S.uyeMesgul = false; C.render(); }
}
const tasla = f => { const v = n => (f.elements[n] ? (f.elements[n].type === 'checkbox' ? f.elements[n].checked : f.elements[n].value) : undefined); C.S.uyeTaslak = { ad: v('ad'), isim: v('isim'), soyisim: v('soyisim'), eposta: v('eposta'), yas: v('yas'), sozlesme: v('sozlesme') }; return C.S.uyeTaslak; };
const epostaGecerli = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

async function tikla(e) {
  const el = e.target.closest('[data-act^="uy-"]'); if (!el || el.disabled) return;
  const act = el.dataset.act, S = C.S;
  if (el.tagName === 'INPUT' || el.tagName === 'FORM') return;
  if (act !== 'uy-gizlilik' && el.tagName === 'A') e.preventDefault();
  C.vib && C.vib(6);
  switch (act) {
    case 'uy-ac': C.go('uye', { uyeDonus: S.view === 'uye' ? S.uyeDonus : S.view, uyeAdim: null }); break;
    case 'uy-misafir': { const d = !S.uyeIlk && S.uyeDonus && S.uyeDonus !== 'uye' ? S.uyeDonus : 'home'; S.uyeIlk = false; C.go(d); break; }
    case 'uy-menu': menuAc(el); return;
    case 'uy-hakkinda': hakkindaAc(); return;
    case 'uy-m-hakkinda': if (C.S.view !== 'about') C.S.hakkindaDonus = C.S.view; C.go('about'); return;
    case 'uy-secim': await secimPencere(el); return;
    case 'uy-eylembitir': { const q = new URLSearchParams(location.search); ['eylem', 'kod', 'lang'].forEach(k => q.delete(k)); location.replace(location.pathname + (q.toString() ? '?' + q : '')); return; }
    case 'uy-m-giris': C.go('uye', { uyeDonus: S.view === 'uye' ? S.uyeDonus : S.view, uyeMod: 'giris' }); break;
    case 'uy-m-uyeol': C.go('uye', { uyeDonus: S.view === 'uye' ? S.uyeDonus : S.view, uyeMod: 'kayit' }); break;
    case 'uy-m-online': C.go('online'); break;
    case 'uy-goz': { const i = el.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; el.classList.toggle('acik', i.type === 'text'); return; }
    case 'uy-epostaac': S.uyeAdim = 'eposta'; S.uyeMod = 'kayit'; C.render(); break;
    case 'uy-girisgeri': S.uyeAdim = 'giris'; C.render(); break;
    case 'uy-mod': { const f = el.closest('form'); if (f) tasla(f); S.uyeMod = el.dataset.v; C.render(); break; }
    case 'uy-gizlilik': e.preventDefault(); { const f = el.closest('form'); if (f) tasla(f); } C.go('gizlilik', { gizlilikDonus: 'uye' }); break;
    case 'uy-google': await is(() => H.googleGiris()); break;
    case 'uy-apple': await is(() => H.appleGiris()); break;
    case 'uy-sifreunut': {
      const f = el.closest('form'); const eposta = f && f.elements.eposta.value;
      if (!epostaGecerli(eposta)) { C.toast(t('Önce e-posta adresini yaz'), 'bad'); return; }
      await is(() => H.sifreSifirla(eposta), t('Şifre sıfırlama bağlantısı gönderildi'));
      break;
    }
    case 'uy-baglanti': {
      const f = el.closest('form'); const eposta = f && f.elements.eposta.value;
      if (!epostaGecerli(eposta)) { C.toast(t('Önce e-posta adresini yaz'), 'bad'); return; }
      if (await is(() => H.baglantiGonder(eposta)) !== undefined) C.bilgi(t('Bağlantı gönderildi'), t('{0} adresine giriş bağlantısı gönderdik. Bu cihazda bağlantıya dokununca giriş yapılır.', esc(eposta)));
      break;
    }
    case 'uy-dogruladim': await is(async () => { await H.yenile(); if (!H.dogrulandi()) C.toast(t('Henüz doğrulanmadı. E-postadaki bağlantıya dokun.'), 'bad', { sure: 3000 }); }); break;
    case 'uy-yenidengonder': await is(() => H.dogrulamaGonder(), t('Yeni bağlantı ve kod gönderildi')); break;
    case 'uy-cikis': if (await C.onayla({ baslik: t('Çıkış yapılsın mı?'), metin: t('Bu cihazdaki maçların kalır. İstediğin zaman yeniden giriş yapabilirsin.'), evet: t('Çıkış yap') })) { await is(() => H.cikis(), t('Çıkış yapıldı')); S.uyeAdim = 'giris'; } break;
    case 'uy-oyuncusec': S.uyeSecili = el.dataset.id; C.render(); break;
    case 'uy-eslestir': {
      const p = data().players.find(x => x.id === S.uyeSecili); if (!p) return;
      await is(async () => {
        const prof = H.uye().profil || {};
        await H.profilKaydet({ oyuncuId: p.id, ...(prof.foto ? {} : p.foto ? { foto: p.foto } : {}) });
        if (prof.foto && !p.foto) updatePlayer(p.id, { foto: prof.foto });
        await H.yedekGonder();
      }, t('{0} hesabına bağlandı, maçlar buluta yedeklendi', esc(p.name)));
      break;
    }
    case 'uy-eslesmeatla': await is(async () => {
      const prof = H.uye().profil || {};
      // yeni oyuncu: profil adıyla bu cihaza eklenir
      const ad = prof.ad || H.uye().user.displayName || 'Oyuncu';
      const var_ = data().players.find(x => x.name.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'));
      const p = var_ || addPlayer(ad);
      if (prof.foto) updatePlayer(p.id, { foto: prof.foto });
      await H.profilKaydet({ oyuncuId: p.id });
    }); break;
    case 'uy-kodkopya': { const k = (H.uye().profil || {}).kod; try { await navigator.clipboard.writeText(k); C.toast(t('Arkadaş kodu kopyalandı'), 'ok'); } catch (_) { C.bilgi(t('Arkadaş kodu'), k); } break; }
    case 'uy-fotosil': await fotoKoy(null); break;
    case 'uy-ad': {
      const y = await soru(t('Maçlarda görünen ad'), (H.uye().profil || {}).ad || '', SINIR.gorunen[1]); if (y == null) break;
      const s = y.trim(); const gh = gorunenHata(s); if (gh) { C.toast(gh, 'bad', { sure: 2800 }); break; }
      await is(() => H.profilKaydet({ ad: s }), t('Kaydedildi')); break;
    }
    case 'uy-adsoyad': {
      const p = H.uye().profil || {};
      const y = await formSor(t('Ad soyad'), IC.kisi, [{ ad: 'isim', etiket: t('Ad'), deger: p.isim || '', max: SINIR.ad[1], ac: 'given-name' }, { ad: 'soyisim', etiket: t('Soyad'), deger: p.soyisim || '', max: SINIR.soyad[1], ac: 'family-name' }]);
      if (!y) break; const a = y.isim, s = y.soyisim;
      const hata = isimKontrol(a, SINIR.ad, t('Ad')) || isimKontrol(s, SINIR.soyad, t('Soyad'));
      if (hata) { C.toast(hata, 'bad', { sure: 2800 }); break; }
      await is(() => H.profilKaydet({ isim: a.trim(), soyisim: s.trim() }), t('Kaydedildi')); break;
    }
    case 'uy-durumgizle': { const gizli = !(H.uye().profil || {}).durumGizli; await is(() => H.profilKaydet({ durumGizli: gizli }), gizli ? t('Arkadaşların seni çevrimdışı görecek') : t('Arkadaşların çevrimiçi olduğunu görecek')); varlikTazele(); break; }
    case 'uy-lakap': {
      const y = await formSor(t('Lakap'), IC.lakap, [{ ad: 'lakap', etiket: t('Lakabın'), deger: (H.uye().profil || {}).lakap || '', max: 16 }], t('Profesyonel dartçılar gibi sahne adın; en çok 16 karakter. Boş bırakırsan kaldırılır.'));
      if (!y) break; const l = y.lakap.trim().replace(/\s+/g, ' ');
      await is(() => H.profilKaydet({ lakap: l || null }), t('Kaydedildi')); break;
    }
    case 'uy-engeller': {
      const liste = await engellenenler().catch(() => []);
      if (!liste.length) { C.bilgi(t('Engellediklerim'), t('Engellediğin kimse yok.')); break; }
      const v = await listeSec({ baslik: t('Engellediklerim'), ikon: IC.sil, ogeler: liste.map(e => ({ deger: e.edilen, ad: e.ad || '—' })), secili: '', kaldir: false });
      if (!v) break;
      const kisi = liste.find(e => e.edilen === v);
      if (!(await C.onayla({ baslik: t('{0} için engel kaldırılsın mı?', (kisi && kisi.ad) || ''), metin: t('Sana yeniden arkadaşlık isteği gönderebilir.'), evet: t('Engeli kaldır') }))) break;
      await is(() => engelKaldir(v), t('Engel kaldırıldı')); break;
    }
    case 'uy-arkadaslar': C.go('online'); break; // Demir 11.11: Hesabım'dan arkadaş listesine kısayol
    case 'uy-telefon': {
      const p = H.uye().profil || {};
      const y = await telefonSor(p);
      if (y === undefined) break;
      await is(() => H.profilKaydet(y ? { telefon: y.e164, telefonUlke: y.ulke, telefonGorunen: y.gorunen, telefonTekil: true } : { telefon: null, telefonUlke: null, telefonGorunen: null, telefonTekil: null }), y ? t('Kaydedildi') : t('Telefon kaldırıldı')); break;
    }
    case 'uy-okmodel': {
      const y = await formSor(t('Model'), IC.lakap, [{ ad: 'm', etiket: t('Ok modeli'), deger: (H.uye().profil || {}).okModel || '', max: 40 }], t('Örn. Power 9Five, MvG Exact. Boş bırakırsan kaldırılır.'));
      if (!y) break; const m = y.m.trim().replace(/\s+/g, ' '); await is(() => H.profilKaydet({ okModel: m || null }), t('Kaydedildi')); break;
    }
    case 'uy-yedekle': { const n = await is(() => H.yedekGonder()); if (n !== undefined) C.toast(n ? t('{0} yeni maç buluta yedeklendi', n) : t('Bulut yedeği güncel'), 'ok'); break; }
    case 'uy-buluttanal': {
      const y = await is(() => H.yedekGetir()); if (y === undefined) return;
      if (!y) { C.bilgi(t('Bulut yedeği yok'), t('Bu hesapta henüz yedek yok. Bulut yedeği satırına dokunarak bu cihazdakileri yedekleyebilirsin.')); return; }
      if (!(await C.onayla({ baslik: t('Buluttaki yedek yüklensin mi?'), metin: t('Buluttaki {0} oyuncu ve {1} maç bu cihazdakilerle birleştirilir; aynı maç iki kez eklenmez.', y.ana.players.length, y.maclar.length), evet: t('Yükle') }))) return;
      const d = data(); const ids = new Set(d.players.map(p => p.id)); y.ana.players.forEach(p => { if (!ids.has(p.id)) d.players.push(p); });
      const hs = new Set((d.history || []).map(h => h.id)); y.maclar.forEach(h => { if (!hs.has(h.id)) d.history.push(h); });
      d.history.sort((a, b) => (b.started || 0) - (a.started || 0)); // en yeni başta
      d.bulutMaclar = [...new Set([...(d.bulutMaclar || []), ...y.maclar.map(h => h.id)])]; save();
      C.toast(t('Yedek yüklendi'), 'ok'); C.render(); break;
    }
    case 'uy-epostadegis': {
      const y = await formSor(t('E-postamı değiştir'), IC.eposta, [{ ad: 'yeni', etiket: t('Yeni e-posta'), max: 80, tur: 'email', ac: 'email' }, { ad: 'sifre', etiket: t('Şu anki şifren'), max: 64, tur: 'password', ac: 'current-password' }], t('Şu anki adresin: {0}', H.uye().user.email));
      if (!y) return;
      if (!epostaGecerli(y.yeni)) { C.toast(t('E-posta adresi geçersiz'), 'bad'); return; }
      if (await is(() => H.epostaDegistir(y.sifre, y.yeni)) !== true) return;
      H.profilKaydet({ epostaBekleyen: y.yeni.trim().toLowerCase() }).catch(() => {});
      C.bilgi(t('Onay e-postası gönderildi'), t('{0} adresine onay bağlantısı gönderdik. Bağlantıya dokununca adresin değişir; sonra uygulamada yeni adresinle yeniden giriş yap.', y.yeni.trim()));
      break;
    }
    case 'uy-sifredegis': {
      const y = await formSor(t('Şifremi değiştir'), IC.kilit, [{ ad: 'eski', etiket: t('Şu anki şifren'), max: 64, tur: 'password', ac: 'current-password' }, { ad: 'yeni', etiket: t('Yeni şifre'), max: 64, tur: 'password', ac: 'new-password' }, { ad: 'yeni2', etiket: t('Yeni şifre (tekrar)'), max: 64, tur: 'password', ac: 'new-password' }], t('En az 6 karakter, 1 büyük harf, 1 rakam, 1 özel karakter'));
      if (!y) return; const eski = y.eski, yeni = y.yeni;
      if (yeni !== y.yeni2) { C.toast(t('Şifreler aynı değil'), 'bad'); return; }
      if (!sifreUygun(yeni)) { C.toast(t('Şifre kurallara uymuyor: en az 6 karakter, 1 büyük harf, 1 rakam, 1 özel karakter'), 'bad', { sure: 3200 }); return; }
      await is(() => H.sifreDegistir(eski, yeni), t('Şifre değiştirildi')); break;
    }
    case 'uy-indir': await is(() => H.verilerimiIndir()); break;
    case 'uy-hesapsil': {
      if (!(await C.onayla({ baslik: t('Hesabın silinsin mi?'), metin: t('Profilin, arkadaş kodun ve buluttaki bütün yedeklerin kalıcı olarak silinir. Bu işlem geri alınamaz. Bu cihazdaki maçlar kalır.'), evet: t('Devam et'), tehlike: true }))) return;
      if (!(await C.onayla({ baslik: t('Son onay'), metin: t('Hesabını silmek istediğinden emin misin?'), evet: t('Hesabımı sil'), tehlike: true }))) return;
      const r = await is(() => H.hesapSil());
      if (r !== undefined) { C.toast(t('Hesabın silindi'), 'ok'); S.uyeAdim = 'giris'; C.render(); }
      else if (H.girisli()) C.bilgi(t('Yeniden giriş gerekiyor'), t('Güvenlik için çıkış yapıp yeniden giriş yap, sonra hesabını hemen silebilirsin.'));
      break;
    }
  }
}

const adMesaj = d => ({ alinmis: t('Bu ad başka bir üye tarafından alınmış. Başka bir ad seç.'), ayrilmis: t('Bu ad ayrılmış. Başka bir ad seç.'), gecersiz: t('Bu ad kullanılamaz') }[d] || '');
let adT = null, adSira = 0;
function adSorgula(input) {
  const f = input.form; const p = f && f.querySelector('.uy-ad-durum'); if (!p) return;
  clearTimeout(adT); const no = ++adSira; const deger = input.value.trim();
  if (deger.length < SINIR.gorunen[0]) { p.hidden = true; return; }
  const bh = gorunenHata(deger); if (bh) { p.hidden = false; p.className = 'uy-ipucu uy-ad-durum kotu'; p.textContent = bh; return; }
  p.hidden = false; p.className = 'uy-ipucu uy-ad-durum'; p.textContent = t('Bakılıyor…');
  adT = setTimeout(async () => {
    const eposta = f.elements.eposta ? f.elements.eposta.value : null;
    let d; try { d = await H.adDurumu(deger, eposta); } catch (_) { d = null; }
    if (no !== adSira) return;
    if (!d) { p.hidden = true; return; }
    const iyi = d === 'musait' || d === 'senin';
    p.className = 'uy-ipucu uy-ad-durum ' + (iyi ? 'iyi' : 'kotu');
    p.textContent = iyi ? t('{0} kullanılabilir', deger) : adMesaj(d);
  }, 450);
}
function isimHatasi(v) {
  return isimKontrol(v.isim, SINIR.ad, t('Ad')) || isimKontrol(v.soyisim, SINIR.soyad, t('Soyad'))
    || gorunenHata(v.ad);
}
// şifre yazılırken kurallar tek tek yeşerir; tekrar alanı eşleşmiyorsa uyarı
function alanNot(input, hata) {
  const yer = input.closest('.uy-alan'); if (!yer) return;
  let p = yer.nextElementSibling && yer.nextElementSibling.classList.contains('uy-alan-not') ? yer.nextElementSibling : null;
  const dolu = input.value.length > 0;
  input.classList.toggle('hatali', dolu && !!hata); input.classList.toggle('gecerli', dolu && !hata);
  if (dolu && hata) { if (!p) { p = document.createElement('p'); p.className = 'uy-ipucu uy-alan-not'; yer.after(p); } p.textContent = hata; }
  else if (p) p.remove();
}
const sifreEksik = s => { const k = SIFRE_KURAL.find(([, , f]) => !f(s)); return k ? t('Şifre: {0}', t(k[1]).toLocaleLowerCase(document.documentElement.lang || 'tr')) : null; };
function yaziyor(e) {
  const el = e.target; const f = el.form; if (!f) return;
  if (el.name === 'eposta') alanNot(el, epostaGecerli(el.value) ? null : t('Geçerli bir e-posta adresi yaz'));
  if (el.name === 'sifre') alanNot(el, sifreEksik(el.value));
  if (el.name === 'ad' && (f.dataset.act === 'uy-eposta' || f.dataset.act === 'uy-tamamla')) { adSorgula(el); return; }
  // kurucu adı e-postaya bağlı: e-posta değişince görünen ad yeniden sorulur (önce ad, sonra e-posta yazılsa da doğru sonuç)
  if (el.name === 'eposta' && f.elements.ad && f.elements.ad.value.trim()) adSorgula(f.elements.ad);
  if (f.dataset.act !== 'uy-eposta' && f.dataset.act !== 'uy-sifreyeni') return;
  if (el.name === 'sifre') f.querySelectorAll('.uy-kurallar li').forEach(li => { const k = SIFRE_KURAL.find(x => x[0] === li.dataset.k); li.classList.toggle('tamam', k[2](el.value)); });
  if ((el.name === 'sifre' || el.name === 'sifre2') && f.elements.sifre2) {
    const m = f.querySelector('.uy-eslesme'); const s2 = f.elements.sifre2.value;
    m.hidden = !s2; m.textContent = s2 && s2 !== f.elements.sifre.value ? t('Şifreler aynı değil') : t('Şifreler aynı');
    m.classList.toggle('iyi', !!s2 && s2 === f.elements.sifre.value);
  }
}

async function gonder(e) {
  const f = e.target; const act = f.dataset.act; if (!act || !act.startsWith('uy-')) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (act === 'uy-sifreyeni') {
    const E = C.S.eylem; const s1 = f.elements.sifre.value || '', s2 = f.elements.sifre2.value || '';
    if (!sifreUygun(s1)) { C.toast(t('Şifre kurallara uymuyor: en az 6 karakter, 1 büyük harf, 1 rakam, 1 özel karakter'), 'bad', { sure: 3200 }); return; }
    if (s1 !== s2) { C.toast(t('Şifreler aynı değil'), 'bad'); return; }
    try { C.S.uyeMesgul = true; C.render(); await H.sifreYenile(E.kod, s1); E.durum = 'tamam'; }
    catch (err) { console.warn(err); if (['auth/invalid-action-code', 'auth/expired-action-code'].includes(err && err.code)) E.durum = 'hata'; else C.toast(H.hataMetni(err), 'bad', { sure: 3200 }); }
    finally { C.S.uyeMesgul = false; C.render(); }
    return;
  }
  if (act === 'uy-kodla') { // taslak formu (ad, e-posta) bozulmasın diye tasla()'dan önce
    const kod = String(f.elements.kod.value || '').replace(/\D/g, '');
    if (kod.length !== 6) { C.toast(t('6 haneli kodu yaz'), 'bad'); return; }
    await is(() => H.kodlaDogrula(kod));
    if (H.dogrulandi()) C.toast(t('E-postan doğrulandı'), 'ok');
    return;
  }
  const v = tasla(f), S = C.S;
  if (act === 'uy-eposta') {
    const kayit = S.uyeMod === 'kayit';
    if (!epostaGecerli(v.eposta)) { C.toast(t('E-posta adresi geçersiz'), 'bad'); return; }
    if (kayit) {
      const hata = isimHatasi(v); if (hata) { C.toast(hata, 'bad', { sure: 2800 }); return; }
      const s1 = f.elements.sifre.value || '', s2 = f.elements.sifre2.value || '';
      if (!sifreUygun(s1)) { C.toast(t('Şifre kurallara uymuyor: en az 6 karakter, 1 büyük harf, 1 rakam, 1 özel karakter'), 'bad', { sure: 3200 }); return; }
      if (s1 !== s2) { C.toast(t('Şifreler aynı değil'), 'bad'); return; }
      if (!v.yas) { C.toast(t('Üye olmak için 13 yaşından büyük olmalısın'), 'bad', { sure: 2800 }); return; }
      if (!v.sozlesme) { C.toast(t('Kullanım şartlarını ve gizlilik politikasını onayla'), 'bad', { sure: 2800 }); return; }
      const ad = await is(() => H.adDurumu(v.ad, v.eposta)); if (ad === undefined) return;
      if (ad !== 'musait' && ad !== 'senin') { C.toast(adMesaj(ad), 'bad', { sure: 3000 }); return; }
      // ad, soyad ve görünen ad doğrulamadan sonra "Profilini tamamla"da hazır gelsin
      localStorage.setItem('dartx.uyeTaslak', JSON.stringify({ isim: v.isim.trim(), soyisim: v.soyisim.trim(), ad: v.ad.trim(), yas: true, sozlesme: true }));
      await is(() => H.epostaUyeOl(v.ad.trim(), v.eposta, s1));
    } else {
      if (!f.elements.sifre.value) { C.toast(t('Şifreni yaz'), 'bad'); return; }
      if (!sifreUygun(f.elements.sifre.value)) { C.toast(t('Şifre kurallara uymuyor: en az 6 karakter, 1 büyük harf, 1 rakam, 1 özel karakter'), 'bad', { sure: 3200 }); return; }
      // Demir 11.11: "Beni hatırla" — açıkken oturum ve e-posta kalır; kapalıyken uygulama kapanınca çıkış yapılır
      const hat = !!(f.elements.hatirla && f.elements.hatirla.checked);
      localStorage.setItem('dartx.hatirla', hat ? '1' : '0');
      if (hat) localStorage.setItem('dartx.sonEposta', v.eposta.trim()); else localStorage.removeItem('dartx.sonEposta');
      // Demir 11.11: "e-posta kayıtlı değil" ile "şifre yanlış" ayrı söylenir; uyarı ekranda daha uzun kalır
      C.S.uyeMesgul = true; C.render();
      try { await H.epostaGiris(v.eposta, f.elements.sifre.value, hat); }
      catch (err) {
        console.warn(err);
        const kod = err && err.code;
        if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(kod)) {
          const kayitli = await H.epostaKayitliMi(v.eposta).catch(() => null);
          if (kayitli === false) C.toast(t('Bu e-posta kayıtlı değil. Üye ol sekmesinden hesap açabilirsin.'), 'bad', { sure: 5000 });
          else if (kayitli === true) C.toast(t('Şifre yanlış. Tekrar dene ya da “Şifremi unuttum?”a dokun.'), 'bad', { sure: 5000 });
          else C.toast(t('E-posta ya da şifre hatalı'), 'bad', { sure: 5000 });
        } else C.toast(H.hataMetni(err), 'bad', { sure: 5000 });
      } finally { C.S.uyeMesgul = false; C.render(); }
    }
  } else if (act === 'uy-tamamla') {
    const hata = isimHatasi(v); if (hata) { C.toast(hata, 'bad', { sure: 2800 }); return; }
    if (!v.yas) { C.toast(t('Üye olmak için 13 yaşından büyük olmalısın'), 'bad', { sure: 2800 }); return; }
    if (!v.sozlesme) { C.toast(t('Kullanım şartlarını ve gizlilik politikasını onayla'), 'bad', { sure: 2800 }); return; }
    const ad = await is(() => H.adDurumu(v.ad)); if (ad === undefined) return;
    if (ad !== 'musait' && ad !== 'senin') { C.toast(adMesaj(ad), 'bad', { sure: 3000 }); return; }
    if (await is(() => H.profilOlustur({ ad: v.ad.trim(), isim: v.isim.trim(), soyisim: v.soyisim.trim(), yasOnay: true, sozlesmeOnay: true })) !== undefined) localStorage.removeItem('dartx.uyeTaslak');
  }
}

async function degisti(e) {
  const el = e.target; if (el.dataset.act !== 'uy-foto') return;
  const dosya = el.files && el.files[0]; el.value = '';
  if (!dosya) return;
  try { await fotoKoy(await kucult(dosya)); } catch (err) { C.toast(t('Fotoğraf açılamadı'), 'bad'); }
}
/** Fotoğraf: ortadan kare kesilir, 256 px JPEG (~25 KB) — profilde ve bağlı oyuncuda */
function kucult(dosya, boy = 256) {
  return new Promise((ok, hata) => {
    const img = new Image(); const url = URL.createObjectURL(dosya);
    img.onload = () => {
      const k = Math.min(img.naturalWidth, img.naturalHeight);
      const c = document.createElement('canvas'); c.width = c.height = boy;
      c.getContext('2d').drawImage(img, (img.naturalWidth - k) / 2, (img.naturalHeight - k) / 2, k, k, 0, 0, boy, boy);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); hata(new Error('resim')); };
    img.src = url;
  });
}
async function fotoKoy(foto) {
  await is(async () => {
    await H.profilKaydet({ foto });
    const oid = (H.uye().profil || {}).oyuncuId;
    if (oid && data().players.some(p => p.id === oid)) updatePlayer(oid, { foto });
  }, foto ? t('Profil fotoğrafı kaydedildi') : t('Fotoğraf kaldırıldı'));
}
/** DartX Hakkında penceresi: ✕ ile, dışarı dokununca ya da Esc ile kapanır */
function hakkindaAc() {
  if (document.querySelector('.uy-hk-perde')) return;
  const yil = new Date().getFullYear();
  const satir = (ad, deger) => `<div class="uy-hk-satir"><span>${ad}</span><b>${deger}</b></div>`;
  const p = document.createElement('div'); p.className = 'uy-hk-perde';
  p.innerHTML = `<div class="uy-hk" role="dialog" aria-modal="true" aria-labelledby="uy-hk-baslik">
    <button type="button" class="uy-hk-kapat" aria-label="${t('Kapat')}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    <h2 id="uy-hk-baslik" class="uy-hk-baslik"><span class="uy-baslik-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>${t('DartX Hakkında')}</h2>
    <img class="uy-hk-logo" src="img/logo-dartx.webp" alt="DartX">
    <p class="uy-hk-metin">${t('Dart maçlarının skorunu tutan, istatistiklerini saklayan ve arkadaşlarınla online oynamanı sağlayan uygulama. Sesli spiker, DartBot ve 30’a yakın oyunla.')}</p>
    <div class="uy-hk-bilgi">
      ${satir(t('Sürüm'), esc(C.surum || ''))}
      ${satir(t('Geliştirici'), 'Demir Kara')}
      ${satir(t('Şirket'), 'DK Design Consulting Technology LLC')}
      ${satir('Web', '<a href="https://dartx.net" target="_blank" rel="noopener">dartx.net</a>')}
    </div>
    <p class="uy-hk-telif">© ${yil} DK Design Consulting Technology LLC. ${t('Tüm hakları saklıdır.')}</p>
    <a class="uy-hk-gizlilik" href="gizlilik.html#${(document.documentElement.lang || 'tr').startsWith('en') ? 'en' : 'tr'}" target="_blank" rel="noopener">${t('Gizlilik politikası')}</a>
  </div>`;
  document.body.appendChild(p);
  const kapat = () => { p.classList.add('kapan'); document.removeEventListener('keydown', tus); setTimeout(() => p.remove(), 200); };
  const tus = e => { if (e.key === 'Escape') kapat(); };
  p.addEventListener('click', e => { if (e.target === p || e.target.closest('.uy-hk-kapat')) kapat(); });
  document.addEventListener('keydown', tus);
}

/** Birden çok alanlı küçük form penceresi (ör. ad + soyad ayrı ayrı) → { alan: değer } ya da null */
function formSor(baslik, ikonHtml, alanlar, not = '') {
  return new Promise(ok => {
    const p = document.createElement('div'); p.className = 'modal-bg uy-soru';
    p.innerHTML = `<form class="modal glass uy-soru-kart"><h3 class="uy-soru-bas">${ikonHtml || ''}<span>${esc(baslik)}</span></h3>
      ${alanlar.map(a => `<label class="uy-soru-alan"><span>${esc(a.etiket)}</span><input class="uy-girdi" name="${a.ad}" type="${a.tur || 'text'}" maxlength="${a.max || 40}" value="${esc(a.deger || '')}" autocomplete="${a.ac || 'off'}"></label>`).join('')}
      ${not ? `<p class="uy-ipucu">${esc(not)}</p>` : ''}
      <div class="uy-soru-dugmeler"><button type="button" class="btn" data-h="vazgec">${t('Vazgeç')}</button><button type="submit" class="btn primary">${t('Kaydet')}</button></div></form>`;
    document.body.appendChild(p);
    const kapat = v => { p.classList.add('kapan'); setTimeout(() => p.remove(), 200); ok(v); };
    p.addEventListener('click', ev => { if (ev.target === p || ev.target.closest('[data-h="vazgec"]')) kapat(null); });
    p.addEventListener('keydown', ev => { if (ev.key === 'Escape') kapat(null); });
    p.querySelector('form').addEventListener('submit', ev => { ev.preventDefault(); const o = {}; alanlar.forEach(a => { o[a.ad] = p.querySelector(`[name="${a.ad}"]`).value; }); kapat(o); });
    setTimeout(() => { const i = p.querySelector('input'); i.focus(); i.select && i.select(); }, 50);
  });
}

/** Aranabilir liste penceresi (ülke, şehir). serbest: listede yoksa yazılanı kabul eder. → değer, '' (kaldır) ya da null (vazgeç) */
function listeSec({ baslik, ikon: ikonHtml, ogeler, secili, serbest, kaldir = true }) {
  return new Promise(ok => {
    const p = document.createElement('div'); p.className = 'modal-bg uy-soru';
    const kucuk = s => String(s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
    p.innerHTML = `<div class="modal glass uy-soru-kart uy-liste-kart" role="dialog" aria-modal="true"><h3 class="uy-soru-bas">${ikonHtml || ''}<span>${esc(baslik)}</span></h3>
      <label class="uy-liste-ara">${IC.ara}<input class="uy-girdi" type="search" placeholder="${t('Ara')}${serbest ? ' ' + t('ya da yaz') : ''}" autocomplete="off"></label>
      <div class="uy-liste" role="listbox"></div>
      <div class="uy-soru-dugmeler">${secili && kaldir ? `<button type="button" class="btn" data-h="temizle">${t('Kaldır')}</button>` : ''}<button type="button" class="btn" data-h="vazgec">${t('Vazgeç')}</button></div></div>`;
    document.body.appendChild(p);
    const ara = p.querySelector('input'), kutu = p.querySelector('.uy-liste');
    const ciz = () => {
      const yazi = ara.value.trim(), q = kucuk(yazi);
      const bulunan = ogeler.filter(o => !q || kucuk(o.ad).includes(q));
      const yaz = serbest && yazi && !ogeler.some(o => kucuk(o.ad) === q)
        ? `<button type="button" class="uy-liste-oge yaz" data-v="${esc(yazi.slice(0, 40))}">${IC.konum}<span>“${esc(yazi.slice(0, 40))}” ${t('olarak kaydet')}</span></button>` : '';
      kutu.innerHTML = bulunan.map(o => `<button type="button" class="uy-liste-oge ${o.deger === secili ? 'secili' : ''}" role="option" data-v="${esc(o.deger)}">${o.on || ''}<span>${esc(o.ad)}</span>${o.deger === secili ? '<b class="uy-liste-tik">✓</b>' : ''}</button>`).join('') + yaz
        + (!bulunan.length && !yaz ? `<p class="uy-ipucu">${t('Sonuç yok')}</p>` : '');
    };
    ciz();
    const kapat = v => { p.classList.add('kapan'); document.removeEventListener('keydown', tus); setTimeout(() => p.remove(), 200); ok(v); };
    const tus = e => { if (e.key === 'Escape') kapat(null); if (e.key === 'Enter') { e.preventDefault(); const ilk = kutu.querySelector('.uy-liste-oge'); if (ilk) kapat(ilk.dataset.v); } };
    document.addEventListener('keydown', tus);
    ara.addEventListener('input', ciz);
    p.addEventListener('click', ev => {
      if (ev.target === p || ev.target.closest('[data-h="vazgec"]')) return kapat(null);
      if (ev.target.closest('[data-h="temizle"]')) return kapat('');
      const o = ev.target.closest('.uy-liste-oge'); if (o) kapat(o.dataset.v);
    });
    setTimeout(() => { const s = kutu.querySelector('.secili'); if (s) s.scrollIntoView({ block: 'center' }); if (matchMedia('(pointer: fine)').matches) ara.focus(); }, 60);
  });
}

/** Cep telefonu (isteğe bağlı): ülke kodu bayraklı listeden, numara o ülkenin kurallarına göre (libphonenumber, mobil).
 *  → { e164, ulke, gorunen } · null (kaldır) · undefined (vazgeç) */
async function telefonSor(p) {
  const L = await import('../telefon/telefon.mjs');
  const dl = dil() === 'en' ? 'en' : 'tr';
  let ulke = (p.telefonUlke || (p.ulke && p.ulke.length === 2 ? p.ulke : 'tr')).toUpperCase();
  if (!L.getCountries().includes(ulke)) ulke = 'TR';
  const ilk = p.telefon ? (L.parsePhoneNumberFromString(p.telefon) || null) : null;
  return new Promise(ok => {
    const pd = document.createElement('div'); pd.className = 'modal-bg uy-soru';
    pd.innerHTML = `<form class="modal glass uy-soru-kart tel-kart" novalidate><h3 class="uy-soru-bas">${IC.telefon}<span>${t('Cep telefonu')}</span></h3>
      <div class="tel-satir"><div class="tel-ulke" role="button" tabindex="0"><span class="tel-ulke-ic"></span><select class="secim-gizli tel-ulke-sec" aria-label="${t('Ülke kodu')}"></select></div><input class="uy-girdi tel-no" name="no" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="20"></div>
      <p class="uy-ipucu tel-not"></p>
      <p class="uy-ipucu">${t('İsteğe bağlı. Numaran yalnız sende durur; arkadaşların ve diğer üyeler göremez.')}</p>
      <div class="uy-soru-dugmeler">${p.telefon ? `<button type="button" class="btn" data-h="sil">${t('Kaldır')}</button>` : ''}<button type="button" class="btn" data-h="vazgec">${t('Vazgeç')}</button><button type="submit" class="btn primary">${t('Kaydet')}</button></div></form>`;
    document.body.appendChild(pd);
    const no = pd.querySelector('.tel-no'), not = pd.querySelector('.tel-not'), ub = pd.querySelector('.tel-ulke-ic'), us = pd.querySelector('.tel-ulke-sec');
    const kodlar = L.getCountries();
    us.innerHTML = ulkeler(dl).filter(o => o.deger.length === 2 && kodlar.includes(o.deger.toUpperCase()))
      .map(o => `<option value="${o.deger.toUpperCase()}">${emojiBayrak(o.deger)} ${esc(o.ad)} (+${L.getCountryCallingCode(o.deger.toUpperCase())})</option>`).join('');
    us.value = ulke;
    us.addEventListener('change', () => { ulke = us.value; ulkeCiz(); denetle(); no.focus(); });
    pd.querySelector('.tel-ulke').addEventListener('click', async e => {
      if (dokunmatik()) return; e.preventDefault();
      const ogeler = [...us.options].map(o => ({ deger: o.value, ad: o.textContent.replace(/^\S+\s/, ''), on: bayrak(o.value.toLowerCase()) }));
      const v = await listeSec({ baslik: t('Ülke kodu'), ikon: IC.kure, ogeler, secili: ulke, kaldir: false });
      if (v) { ulke = v; us.value = v; ulkeCiz(); denetle(); no.focus(); }
    });
    const ulkeCiz = () => { ub.innerHTML = `<img class="yer-bayrak" src="img/bayrak/${ulke.toLowerCase()}.svg" alt="" onerror="this.remove()"><b>+${L.getCountryCallingCode(ulke)}</b><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>`; no.placeholder = ulke === 'TR' ? '5XX XXX XX XX' : t('Numaran'); };
    const coz = () => { const s = no.value.replace(/[^\d+]/g, ''); if (!s) return null; return L.parsePhoneNumberFromString(s.startsWith('+') ? s : s.replace(/^0+/, ''), ulke) || null; };
    const denetle = () => {
      const n = coz(), dolu = no.value.trim().length > 0, gecerli = !!(n && n.isValid() && n.country === ulke);
      no.classList.toggle('hatali', dolu && !gecerli); no.classList.toggle('gecerli', gecerli);
      not.textContent = !dolu ? '' : gecerli ? '✓ ' + n.formatInternational() : t('Bu ülke için geçerli bir cep telefonu numarası yaz');
      not.className = 'uy-ipucu tel-not ' + (dolu ? (gecerli ? 'iyi' : 'kotu') : '');
      return gecerli ? n : null;
    };
    ulkeCiz();
    if (ilk) no.value = ilk.formatNational();
    denetle();
    // yazarken ülkenin biçimine göre boşluk koyar (ör. 532 123 45 67); başta 0 yazılırsa atılır
    no.addEventListener('input', () => { const r = no.value.replace(/\D/g, '').replace(/^0+/, ''); if (!no.value.trim().startsWith('+') && r) no.value = new L.AsYouType(ulke).input(r); denetle(); });
    const kapat = v => { pd.classList.add('kapan'); setTimeout(() => pd.remove(), 200); ok(v); };
    pd.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(undefined); });
    pd.addEventListener('click', async e => {
      if (e.target === pd || e.target.closest('[data-h="vazgec"]')) return kapat(undefined);
      if (e.target.closest('[data-h="sil"]')) return kapat(null);
    });
    pd.querySelector('form').addEventListener('submit', e => {
      e.preventDefault(); const n = denetle();
      if (!no.value.trim()) return kapat(p.telefon ? null : undefined);
      if (!n) { C.toast(t('Bu ülke için geçerli bir cep telefonu numarası yaz'), 'bad', { sure: 2800 }); return; }
      kapat({ e164: n.number, ulke: ulke.toLowerCase(), gorunen: n.formatInternational() });
    });
    setTimeout(() => no.focus(), 60);
  });
}

/** Uygulama içi yazı penceresi (tarayıcının prompt'u kullanılmaz) */
function soru(baslik, deger, max, tur = 'text') {
  return new Promise(ok => {
    const p = document.createElement('div'); p.className = 'modal-bg uy-soru';
    p.innerHTML = `<form class="modal glass uy-soru-kart"><h3>${esc(baslik)}</h3><input class="uy-girdi" name="v" type="${tur}" maxlength="${max}" value="${esc(deger)}" autocomplete="off">
      <div class="uy-soru-dugmeler"><button type="button" class="btn" data-h="vazgec">${t('Vazgeç')}</button><button type="submit" class="btn primary">${t('Kaydet')}</button></div></form>`;
    document.body.appendChild(p);
    const kapat = v => { p.classList.add('kapan'); setTimeout(() => p.remove(), 200); ok(v); };
    p.addEventListener('click', ev => { if (ev.target === p || ev.target.closest('[data-h="vazgec"]')) kapat(null); });
    p.querySelector('form').addEventListener('submit', ev => { ev.preventDefault(); kapat(p.querySelector('input').value); });
    setTimeout(() => { const i = p.querySelector('input'); i.focus(); i.select && i.select(); }, 50);
  });
}
