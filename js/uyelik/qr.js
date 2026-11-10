// QR ile arkadaş ekleme (Demir 11.11): biri QR'ını gösterir, yanındaki okutur → arkadaşlık isteği gider, gösteren onaylar.
// QR internetsiz çizilir (js/qr/qrcode.mjs, MIT). Okuma: tarayıcının BarcodeDetector'ı (Android / uygulama);
// olmayan yerde (iPhone web) telefonun kendi kamerası QR'daki bağlantıyı açar: https://dartx.net/?arkadas=DX-XXXX
import qrcode from '../qr/qrcode.mjs';
import { t } from '../i18n.js';
import { esc, adResim } from '../util.js';

export const qrBaglanti = kod => `https://dartx.net/?arkadas=${encodeURIComponent(kod)}`;
/** Okunan yazıdan arkadaş kodu (bağlantı ya da düz kod) */
export const qrKodBul = yazi => { const m = String(yazi || '').toUpperCase().match(/DX-?([A-Z0-9]{4})(?![A-Z0-9])/); return m ? 'DX-' + m[1] : null; };

/** Yuvarlatılmış modüllü SVG QR (orta kısmı DartX logosu için boş bırakılır; düzeltme seviyesi H) */
export function qrSvg(yazi, boyut = 260) {
  const q = qrcode(0, 'H'); q.addData(yazi); q.make();
  const n = q.getModuleCount(), bos = 4, top = n + bos * 2, s = boyut / top;
  const orta = Math.floor(n * 0.22), oBas = Math.floor((n - orta) / 2), oSon = oBas + orta; // logo alanı
  const goz = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  let kare = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!q.isDark(r, c) || goz(r, c)) continue;
    if (r >= oBas && r < oSon && c >= oBas && c < oSon) continue;
    kare += `<rect x="${((c + bos) * s).toFixed(2)}" y="${((r + bos) * s).toFixed(2)}" width="${(s * 0.92).toFixed(2)}" height="${(s * 0.92).toFixed(2)}" rx="${(s * 0.3).toFixed(2)}"/>`;
  }
  const gozCiz = (r, c) => { const x = (c + bos) * s, y = (r + bos) * s;
    return `<rect x="${x + s * 0.5}" y="${y + s * 0.5}" width="${s * 6}" height="${s * 6}" rx="${s * 1.6}" fill="none" stroke="#1d160a" stroke-width="${s}"/><rect x="${x + s * 2}" y="${y + s * 2}" width="${s * 3}" height="${s * 3}" rx="${s * 0.9}" fill="#1d160a"/>`; };
  const lx = (oBas + bos) * s, lw = orta * s;
  return `<svg class="qr-svg" viewBox="0 0 ${boyut} ${boyut}" width="${boyut}" height="${boyut}" role="img" aria-label="QR">
    <rect width="${boyut}" height="${boyut}" rx="${s * 3}" fill="#fff"/><g fill="#1d160a">${kare}</g>${gozCiz(0, 0)}${gozCiz(0, n - 7)}${gozCiz(n - 7, 0)}
    <image href="img/logo-x.webp" x="${lx + lw * 0.08}" y="${lx + lw * 0.08}" width="${lw * 0.84}" height="${lw * 0.84}"/></svg>`;
}

function pencere(ic, sinif = '') {
  const p = document.createElement('div'); p.className = 'modal-bg uy-soru qr-perde';
  p.innerHTML = `<div class="modal glass uy-soru-kart qr-kart ${sinif}" role="dialog" aria-modal="true">${ic}</div>`;
  document.body.appendChild(p);
  const kapat = () => { p.classList.add('kapan'); document.removeEventListener('keydown', tus); setTimeout(() => p.remove(), 200); p.dispatchEvent(new Event('kapandi')); };
  const tus = e => { if (e.key === 'Escape') kapat(); };
  document.addEventListener('keydown', tus);
  p.addEventListener('click', e => { if (e.target === p || e.target.closest('[data-qr-kapat]')) kapat(); });
  return { p, kapat };
}
const QR_IC = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>';
const KAMERA_IC = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>';
export const QR_SIMGE = QR_IC, OKU_SIMGE = KAMERA_IC;

/** Kendi QR'ını göster */
export function qrGoster({ kod, ad, foto }) {
  const r = foto || adResim(ad);
  pencere(`<h3 class="uy-soru-bas">${QR_IC}<span>${t('Arkadaş QR kodum')}</span></h3>
    <div class="qr-cerceve">${qrSvg(qrBaglanti(kod))}</div>
    <div class="qr-kim">${r ? `<img class="uy-av kucuk" src="${r}" alt="">` : ''}<div><b>${esc(ad || '')}</b><small>${esc(kod)}</small></div></div>
    <p class="uy-ipucu">${t('Arkadaşın DartX’te “QR okut”a dokunsun ya da telefonunun kamerasıyla okutsun. İstek sana gelir, sen onaylarsın.')}</p>
    <div class="uy-soru-dugmeler"><button type="button" class="btn primary" data-qr-kapat>${t('Tamam')}</button></div>`);
}

export const qrOkuyabilir = () => typeof window !== 'undefined' && 'BarcodeDetector' in window && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

/** Kamerayla QR okut → arkadaş kodu (vazgeçilirse null) */
export function qrOku() {
  return new Promise(async ok => {
    if (!qrOkuyabilir()) {
      pencere(`<h3 class="uy-soru-bas">${KAMERA_IC}<span>${t('QR okut')}</span></h3>
        <p class="uy-not">${t('Bu cihazda uygulama içinden QR okunamıyor. Telefonunun kendi kamerasını arkadaşının QR’ına tut; açılan bağlantıya dokununca arkadaşlık isteği kendiliğinden gider.')}</p>
        <div class="uy-soru-dugmeler"><button type="button" class="btn primary" data-qr-kapat>${t('Tamam')}</button></div>`);
      return ok(null);
    }
    let akis = null, bitti = false, bulunan = null;
    const { p, kapat } = pencere(`<h3 class="uy-soru-bas">${KAMERA_IC}<span>${t('QR okut')}</span></h3>
      <div class="qr-kamera"><video playsinline muted autoplay></video><span class="qr-hedef"></span></div>
      <p class="uy-ipucu">${t('Arkadaşının ekranındaki QR’ı çerçevenin içine getir.')}</p>
      <div class="uy-soru-dugmeler"><button type="button" class="btn" data-qr-kapat>${t('Vazgeç')}</button></div>`, 'okuyucu');
    p.addEventListener('kapandi', () => { bitti = true; if (akis) akis.getTracks().forEach(tr => tr.stop()); ok(bulunan); });
    try {
      akis = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (bitti) { akis.getTracks().forEach(tr => tr.stop()); return; }
      const v = p.querySelector('video'); v.srcObject = akis; await v.play().catch(() => {});
      const dedektor = new window.BarcodeDetector({ formats: ['qr_code'] });
      const bak = async () => {
        if (bitti) return;
        try { const s = await dedektor.detect(v); const k = s.map(x => qrKodBul(x.rawValue)).find(Boolean); if (k) { bulunan = k; if (navigator.vibrate) navigator.vibrate(30); kapat(); return; } } catch (_) { /* kare hazır değil */ }
        setTimeout(bak, 220);
      };
      bak();
    } catch (e) {
      p.querySelector('.qr-kamera').outerHTML = `<p class="uy-not">${t('Kameraya izin verilmedi. Ayarlardan kamera iznini açıp tekrar dene.')}</p>`;
    }
  });
}
