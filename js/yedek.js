// DartX — yedek al / yükle penceresi (Demir 08.11): açılan cam pencerede yuvarlak ilerleme halkası ve yüzde,
// bitince "İndir" (yedek al) ya da "Tamam" (yedek yükle). Görünüm dialog.js'teki cam kartla aynı (.telif-ort / .telif-kart).
import { t } from './i18n.js';
import { esc } from './util.js';

const R = 46, CEVRE = 2 * Math.PI * R;
// lucide check / x (demirkara.com ile aynı set)
const ONAY = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const CARPI = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

const boyutYaz = n => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`);

/** Pencereyi aç; { ilerle(baslik) → Promise (halka %100'e varınca), bitti({...}), hata(metin), kapat() } döner */
function pencere(baslik) {
  document.getElementById('dx-yedek')?.remove();
  const k = document.createElement('div');
  k.id = 'dx-yedek';
  k.className = 'telif-ort';
  k.innerHTML = `<div class="telif-kart yedek-kart" role="dialog" aria-modal="true">
    <h2>${esc(baslik)}</h2>
    <div class="yedek-halka">
      <svg viewBox="0 0 110 110" aria-hidden="true"><circle class="yh-iz" cx="55" cy="55" r="${R}"/><circle class="yh-dolu" cx="55" cy="55" r="${R}" stroke-dasharray="${CEVRE}" stroke-dashoffset="${CEVRE}"/></svg>
      <div class="yh-ic"><b class="yh-yuzde">%0</b></div>
    </div>
    <p class="yedek-not"></p>
    <div class="telif-dugmeler yedek-dugmeler"></div></div>`;
  document.body.appendChild(k);
  const dolu = k.querySelector('.yh-dolu'), yuzde = k.querySelector('.yh-yuzde'), ic = k.querySelector('.yh-ic');
  const not = k.querySelector('.yedek-not'), dugmeler = k.querySelector('.yedek-dugmeler'), h2 = k.querySelector('h2');
  const kapat = () => { if (k.classList.contains('kapan')) return; k.classList.add('kapan'); setTimeout(() => k.remove(), 230); };

  const ilerle = (sure = 1200) => new Promise(coz => {
    const bas = performance.now();
    // setTimeout ile (rAF arka planda durur; halka her durumda sonuna varsın)
    const kare = () => {
      const x = Math.min(1, (performance.now() - bas) / sure);
      const e = 1 - Math.pow(1 - x, 3);
      dolu.style.strokeDashoffset = String(CEVRE * (1 - e));
      yuzde.textContent = `%${Math.round(e * 100)}`;
      if (x < 1) setTimeout(kare, 16); else coz();
    };
    kare();
  });
  const sonuc = ({ baslik: b, metin, ikon = ONAY, sinif = 'tamam', butonlar }) => {
    if (b) h2.textContent = b;
    k.querySelector('.yedek-halka').classList.add(sinif);
    ic.innerHTML = `<span class="yh-ikon">${ikon}</span>`;
    not.innerHTML = metin || '';
    dugmeler.innerHTML = butonlar.map((x, i) => `<button type="button" class="pill ${x.gold ? 'gold' : ''}" data-i="${i}">${esc(x.yazi)}</button>`).join('');
    dugmeler.querySelectorAll('button').forEach(b2 => b2.addEventListener('click', () => butonlar[Number(b2.dataset.i)].is()));
  };
  return { ilerle, sonuc, kapat };
}

/** Yedek al: %0 → %100, sonra "İndir" (iPhone'da paylaş menüsü → Dosyalar'a kaydet) */
export async function yedekAl(json) {
  const ad = `dartx-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  const dosya = new File([json], ad, { type: 'application/json' });
  const p = pencere(t('Yedekleniyor'));
  await p.ilerle(1300);
  const indir = async () => {
    // dokunuş anında çalışır (iOS paylaş menüsü kullanıcı dokunuşu ister)
    if (navigator.canShare && navigator.canShare({ files: [dosya] })) {
      try { await navigator.share({ files: [dosya], title: 'DartX yedek' }); p.kapat(); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(dosya); a.download = ad;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    p.kapat();
  };
  p.sonuc({
    baslik: t('Yedek hazır'),
    metin: `<b>${esc(ad)}</b><br>${boyutYaz(dosya.size)}`,
    butonlar: [{ yazi: t('Kapat'), is: p.kapat }, { yazi: t('İndir'), gold: true, is: indir }],
  });
}

/** Yedek yükle: %0 → %100, sonra özet ve "Tamam" (ya da hata) */
export async function yedekYukle(metin, yukle, bitince) {
  const p = pencere(t('Yedek yükleniyor'));
  let hata = null, ozet = null;
  try { ozet = yukle(metin); } catch (e) { hata = e; }
  await p.ilerle(1300);
  if (hata) {
    p.sonuc({ baslik: t('Yüklenemedi'), metin: esc(t('Dosya okunamadı: {0}', hata.message)), ikon: CARPI, sinif: 'hata', butonlar: [{ yazi: t('Tamam'), gold: true, is: p.kapat }] });
    return;
  }
  p.sonuc({
    baslik: t('Yedek yüklendi'),
    metin: ozet ? t('{0} oyuncu · {1} maç', ozet.oyuncu, ozet.mac) : '',
    butonlar: [{ yazi: t('Tamam'), gold: true, is: () => { p.kapat(); bitince && bitince(); } }],
  });
}
