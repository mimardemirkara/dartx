// DartX — uygulamanın kendi onay / bilgi penceresi (tarayıcının confirm / alert kutuları kullanılmaz).
// Görünüm demirkara.com telif uyarı kartıyla aynı: buzlu perde + cam kart.
import { t } from './i18n.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * onayla({ baslik, metin, evet, hayir, tehlike }) → Promise<boolean>
 * tehlike: true → onay düğmesi kırmızı (silme gibi geri alınamaz işler)
 */
export function onayla({ baslik, metin = '', evet = t('Tamam'), hayir = t('Vazgeç'), tehlike = false, tekDugme = false }) {
  return new Promise(coz => {
    document.getElementById('dx-onay')?.remove();
    const k = document.createElement('div');
    k.id = 'dx-onay';
    k.className = 'telif-ort';
    k.innerHTML = `<div class="telif-kart onay-kart" role="alertdialog" aria-modal="true" aria-label="${esc(baslik)}">
        <h2>${esc(baslik)}</h2>${metin ? `<p>${esc(metin)}</p>` : ''}
        <div class="telif-dugmeler">
          ${tekDugme ? '' : `<button type="button" class="pill" data-o="0">${esc(hayir)}</button>`}
          <button type="button" class="pill ${tehlike ? 'tehlike' : 'gold'}" data-o="1">${esc(evet)}</button>
        </div></div>`;
    const bitir = v => { if (k.classList.contains('kapan')) return; k.classList.add('kapan'); k.removeAttribute('id'); setTimeout(() => k.remove(), 230); document.removeEventListener('keydown', tus, true); coz(v); };
    const tus = e => { if (e.key === 'Escape') { e.stopPropagation(); bitir(false); } if (e.key === 'Enter') { e.preventDefault(); bitir(true); } };
    k.addEventListener('click', e => {
      if (e.target === k) return bitir(false);
      const b = e.target.closest('[data-o]');
      if (b) bitir(b.dataset.o === '1');
    });
    document.addEventListener('keydown', tus, true);
    document.body.appendChild(k);
    setTimeout(() => k.querySelector('[data-o="1"]')?.focus(), 30);
  });
}

export const bilgi = (baslik, metin) => onayla({ baslik, metin, tekDugme: true, evet: t('Tamam') });
