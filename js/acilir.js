// DartX — cam açılır menü (demirkara.com menü çubuğu açılırları: Masaustu.tsx .acilir + .ms .acilir camı birebir).
// Telefonda / tablette dokunmatik ekranda telefonun kendi seçicisi (iOS çark, Android liste) açılır; fareyle kullanılan
// ekranda (bilgisayar, önizleme) tarayıcının düz Windows listesi yerine bu cam menü açılır.
import { esc } from './util.js';

const TIK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
let acik = null;

export function acilirKapat() {
  if (!acik) return;
  const { el, temizle } = acik;
  acik = null;
  temizle();
  el.classList.add('kapan');
  setTimeout(() => el.remove(), 180);
}

/**
 * capa: menünün altında açılacağı öğe. liste(): [{ v, l, on, renk? }] (her açılışta ve her seçimde yeniden okunur).
 * sec(v): seçilince. coklu: true → menü açık kalır, işaretler değişir (oyuncu seçimi).
 */
export function acilirAc(capa, liste, sec, { coklu = false, baslik = '', ara = false, bos = '', araYazi = 'Ara…', sonucYok = 'Sonuç yok', en = 280 } = {}) {
  acilirKapat();
  const el = document.createElement('div');
  el.className = 'acilir dx-acilir';
  el.setAttribute('role', 'listbox');
  // demirkara.com SelectMenu gibi: uzun listede en üstte arama kutusu (yazdıkça süzer); liste kutusu ayrı kayar
  el.innerHTML = (baslik ? `<div class="ac-baslik">${esc(baslik)}</div>` : '')
    + (ara ? `<div class="ac-ara"><input type="search" placeholder="${esc(araYazi)}" autocomplete="off" enterkeyhint="search"></div>` : '')
    + '<div class="ac-liste"></div>';
  const kutu = el.querySelector('.ac-liste'), giris = el.querySelector('.ac-ara input');
  const ciz = () => {
    const q = giris ? giris.value.trim().toLocaleLowerCase('tr') : '';
    const hepsi = liste();
    const gorunen = q ? hepsi.filter(x => String(x.l).toLocaleLowerCase('tr').includes(q)) : hepsi;
    kutu.innerHTML = gorunen.map(x =>
      `<button type="button" role="option" aria-selected="${x.on}" data-v="${esc(String(x.v))}" class="${x.on ? 'secili' : ''} ${x.ayir ? 'ac-ayir' : ''} ${x.soluk ? 'ac-soluk' : ''}">
        ${x.ic ? `<span class="ac-ic">${x.ic}</span>` : x.bot ? `<span class="bot-av ac-bot" style="--pc:${x.renk}">${x.bot}</span>` : x.renk ? `<span class="ac-nokta" style="--pc:${x.renk}"></span>` : ''}<span class="ac-ad">${esc(x.l)}</span><span class="ac-tik">${x.on ? TIK : ''}</span></button>`).join('')
      || `<p class="ac-bos">${esc(hepsi.length ? sonucYok : bos || sonucYok)}</p>`;
  };
  ciz();
  if (giris) { giris.addEventListener('input', ciz); setTimeout(() => giris.focus({ preventScroll: true }), 30); }
  document.body.appendChild(el);
  // konum: çapanın altında, ortalı; ekrana sığmazsa üstünde
  const r = capa.getBoundingClientRect();
  const w = Math.max(r.width, Math.min(en, innerWidth - 16));
  el.style.width = w + 'px';
  el.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  const asagi = innerHeight - r.bottom - 12, yukari = r.top - 12;
  if (asagi >= Math.min(el.scrollHeight, 260) || asagi >= yukari) { el.style.top = (r.bottom + 6) + 'px'; el.style.maxHeight = asagi + 'px'; }
  else { el.style.bottom = (innerHeight - r.top + 6) + 'px'; el.style.maxHeight = yukari + 'px'; }
  const seciliEl = kutu.querySelector('.secili');
  if (seciliEl) seciliEl.scrollIntoView({ block: 'nearest' });

  el.addEventListener('click', e => {
    const b = e.target.closest('.ac-liste button[data-v]');
    if (!b) return;
    e.stopPropagation();
    sec(b.dataset.v);
    if (coklu) ciz(); else acilirKapat();
  });
  const disari = e => { if (!el.contains(e.target) && e.target !== capa && !capa.contains(e.target)) acilirKapat(); };
  const tus = e => { if (e.key === 'Escape') acilirKapat(); };
  setTimeout(() => { document.addEventListener('pointerdown', disari, true); document.addEventListener('keydown', tus); }, 0);
  const kaydir = () => acilirKapat();
  addEventListener('resize', kaydir);
  acik = { el, temizle: () => { document.removeEventListener('pointerdown', disari, true); document.removeEventListener('keydown', tus); removeEventListener('resize', kaydir); } };
}

/** Dokunmatik ekran mı (telefon / tablet): o zaman telefonun kendi seçicisi kullanılır */
export const dokunmatik = () => window.matchMedia('(pointer: coarse)').matches;

/** Bir açılır menü şu an açık mı (aynı düğmeye ikinci basış kapatsın diye) */
export const acilirAcik = () => !!acik;
