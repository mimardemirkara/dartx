// Bildirimler (Demir 14.11): üstten inen şerit birkaç saniyede kayboluyor; kaçırılan bildirim burada kalır.
// Üst çubukta zil + okunmamış sayısı; dokununca son bildirimler listesi açılır, satıra dokununca ilgili yere gider.
// Yalnız bu cihazda saklanır (sunucu yok); hesap başına ayrı, en çok 40 kayıt. Duyurular / lig haberleri panelle birlikte buraya eklenecek.
import { t } from '../i18n.js';
import { esc, adResim } from '../util.js';

const SINIR = 40;
const k = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('k') : null;
const ANAHTAR = 'dartx.bildirim' + (k ? '.' + k : '');
const oku = () => { try { const v = JSON.parse(localStorage.getItem(ANAHTAR) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
const yaz = l => { try { localStorage.setItem(ANAHTAR, JSON.stringify(l.slice(0, SINIR * 3))); } catch (_) { /* yer yoksa yok say */ } };
const benim = uid => oku().filter(b => b.uid === uid);

const svg = (d, n = 20, w = 2) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ZIL = '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>'; // lucide bell
const ZIL_YOK = '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/>'; // lucide bell-off

/** Yeni bildirim kaydı. yazi: HTML (adlar esc'li) · hedef: dokununca açılacak sayfa ('online', 'stats'…) */
export function bildirimEkle(uid, { yazi, tur = 'acik', renk = '', ad = '', hedef = '' }) {
  if (!uid || !yazi) return;
  const hepsi = oku();
  hepsi.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), uid, z: Date.now(), yazi, tur, renk, ad, hedef, okundu: false });
  // hesap başına SINIR: eski kayıtlar düşer
  let say = 0; yaz(hepsi.filter(b => (b.uid !== uid ? true : ++say <= SINIR)));
  zilTazele(uid);
}
export const okunmamis = uid => (uid ? benim(uid).filter(b => !b.okundu).length : 0);

/** Üst çubuktaki zil düğmesi (yalnız giriş yapmış üyede) */
export function zilDugme(uid) {
  if (!uid) return '';
  const n = okunmamis(uid);
  return `<button class="mc-dugme mc-zil ${n ? 'yeni' : ''}" data-act="on-zil" aria-label="${t('Bildirimler')}${n ? ' (' + n + ')' : ''}" title="${t('Bildirimler')}">${svg(ZIL, 18)}${n ? `<i class="mc-hesap-sayi">${n > 9 ? '9+' : n}</i>` : ''}</button>`;
}
function zilTazele(uid) { const d = document.querySelector('.mc-zil'); if (d) d.outerHTML = zilDugme(uid); }

const neZaman = z => {
  const dk = Math.round((Date.now() - z) / 60e3);
  if (dk < 1) return t('Şimdi');
  return dk < 60 ? t('{0} dk önce', dk) : dk < 1440 ? t('{0} sa önce', Math.round(dk / 60)) : t('{0} gün önce', Math.round(dk / 1440));
};
const avatar = ad => { const r = adResim(ad); return r ? `<img class="uy-av kucuk" src="${r}" alt="">` : `<span class="uy-av kucuk harf">${esc((String(ad || '?').trim()[0] || '?').toLocaleUpperCase('tr'))}</span>`; };

/** Bildirim listesini açar. git: hedef sayfaya götüren işlev · ikonlar: tur → svg içi (şeritteki simgelerle aynı) */
export function bildirimAc(uid, { git, ikonlar = {} }) {
  if (!uid || document.querySelector('.bld-pencere')) return;
  const liste = benim(uid);
  const pd = document.createElement('div'); pd.className = 'modal-bg uy-soru bld-pencere';
  const satir = b => `<button type="button" class="bld-satir ${b.okundu ? '' : 'yeni'} ${b.renk || ''}" data-id="${b.id}" ${b.hedef ? '' : 'data-yok="1"'}>
      <span class="bld-av">${b.ad ? avatar(b.ad) : ''}<i class="bld-ic">${svg(ikonlar[b.tur] || ikonlar.acik || ZIL, 14, 2.4)}</i></span>
      <span class="bld-yazi">${b.yazi}<small>${esc(neZaman(b.z))}</small></span>${b.okundu ? '' : '<i class="bld-nokta" aria-hidden="true"></i>'}</button>`;
  pd.innerHTML = `<div class="modal glass uy-soru-kart bld-kart" role="dialog" aria-modal="true" aria-label="${t('Bildirimler')}"><h3 class="uy-soru-bas">${svg(ZIL)}<span>${t('Bildirimler')}</span>${liste.length ? `<small class="bld-sayi">${liste.length}</small>` : ''}</h3>
    ${liste.length ? `<div class="bld-liste">${liste.map(satir).join('')}</div>` : `<div class="bld-bos"><span class="bld-bos-ic">${svg(ZIL_YOK, 30, 1.8)}</span><p class="uy-not">${t('Henüz bildirim yok. Davetler, istekler ve maç haberleri burada birikir.')}</p></div>`}
    <div class="uy-soru-dugmeler">${liste.length ? `<button type="button" class="btn" data-h="temizle">${t('Temizle')}</button>` : ''}<button type="button" class="btn primary" data-h="kapat">${t('Kapat')}</button></div></div>`;
  document.body.appendChild(pd);
  // açılınca hepsi okundu sayılır (liste bu açılışta "yeni" işaretlerini göstermeye devam eder)
  if (liste.some(b => !b.okundu)) { yaz(oku().map(b => (b.uid === uid ? { ...b, okundu: true } : b))); zilTazele(uid); }
  const kapat = () => { pd.classList.add('kapan'); setTimeout(() => pd.remove(), 200); document.removeEventListener('keydown', tus, true); };
  const tus = e => { if (e.key === 'Escape') { e.stopPropagation(); kapat(); } };
  document.addEventListener('keydown', tus, true);
  pd.addEventListener('click', e => {
    if (e.target === pd || e.target.closest('[data-h="kapat"]')) return kapat();
    if (e.target.closest('[data-h="temizle"]')) { yaz(oku().filter(b => b.uid !== uid)); zilTazele(uid); return kapat(); }
    const s = e.target.closest('.bld-satir'); if (!s) return;
    const b = liste.find(x => x.id === s.dataset.id); kapat();
    if (b && b.hedef && git) { try { git(b.hedef); } catch (_) { /* yok say */ } }
  });
}
