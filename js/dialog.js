// DartX — uygulamanın kendi onay / bilgi penceresi (tarayıcının confirm / alert kutuları kullanılmaz).
// Görünüm demirkara.com telif uyarı kartıyla aynı: buzlu perde + cam kart.
import { t } from './i18n.js';

// Demir 09.11: onay düğmeleri büyük ve simgeli (kolay dokunulsun)
const IC = d => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC_HAYIR = IC('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
const IC_EVET = IC('<path d="M20 6 9 17l-5-5"/>');
const IC_TEHLIKE = IC('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>');
const IC_COP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * onayla({ baslik, metin, evet, hayir, tehlike }) → Promise<boolean>
 * tehlike: true → onay düğmesi kırmızı (silme gibi geri alınamaz işler)
 */
export function onayla({ baslik, metin = '', evet = t('Tamam'), hayir = t('Vazgeç'), tehlike = false, tekDugme = false, simge = '' }) {
  return new Promise(coz => {
    document.getElementById('dx-onay')?.remove();
    const k = document.createElement('div');
    k.id = 'dx-onay';
    k.className = 'telif-ort';
    k.innerHTML = `<div class="telif-kart onay-kart" role="alertdialog" aria-modal="true" aria-label="${esc(baslik)}">
        ${tehlike ? `<span class="onay-ic tehlike-ic">${IC_COP}</span>` : simge ? `<span class="onay-ic simge-ic">${simge}</span>` : ''}<h2>${esc(baslik)}</h2>${metin ? `<p>${esc(metin)}</p>` : ''}
        <div class="telif-dugmeler onay-dugmeler ${tekDugme ? 'tek' : ''}">
          ${tekDugme ? '' : `<button type="button" class="pill onay-tus" data-o="0">${IC_HAYIR}<span>${esc(hayir)}</span></button>`}
          <button type="button" class="pill onay-tus ${tehlike ? 'tehlike' : 'gold'}" data-o="1">${tehlike ? IC_TEHLIKE : IC_EVET}<span>${esc(evet)}</span></button>
        </div></div>`;
    const bitir = v => { if (k.classList.contains('kapan')) return; k.classList.add('kapan'); k.removeAttribute('id'); setTimeout(() => k.remove(), 230); document.removeEventListener('keydown', tus, true); coz(v); };
    const tus = e => { if (e.key === 'Escape') { e.stopPropagation(); bitir(false); } if (e.key === 'Enter') { e.preventDefault(); bitir(!tehlike); } };
    k.addEventListener('click', e => {
      if (e.target === k) return bitir(false);
      const b = e.target.closest('[data-o]');
      if (b) bitir(b.dataset.o === '1');
    });
    document.addEventListener('keydown', tus, true);
    document.body.appendChild(k);
    setTimeout(() => k.querySelector(tehlike && !tekDugme ? '[data-o="0"]' : '[data-o="1"]')?.focus(), 30);
  });
}

export const bilgi = (baslik, metin) => onayla({ baslik, metin, tekDugme: true, evet: t('Tamam') });
