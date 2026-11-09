// DartX kamera (Beta) — uygulamanın içi:
//  · Yalnız telefon: bu cihazın kamerası oyunda açılır, saplanan ok kendiliğinden yazılır (köşede küçük önizleme)
//  · Tablet + telefon: telefon kamera.html'de algılar, sonucu QR ile eşleşmiş tablete gönderir
import { algilayici, ayarOku, kameraAc, kameraKapat, flasVar, flasKoy, flasTercih } from './algila.js';
import { kalibre } from './tahta.js';
import { tabletBaslat, qrSvg, qrOku } from './baglanti.js';
import { IC } from './ekran.js';
// Pencere başlığı: üstte altın çerçeveli simge + başlık (Demir 10.11)
const SVG = p => `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const baslik = (ic, metin) => `<span class="kam-kart-ic">${SVG(ic)}</span><h3>${metin}</h3>`;

let atisCb = () => {}, durumCb = () => {};
let yerel = null;   // { video, alg, kutu }
let uzak = null;    // { baglanti, durum }

export function kur({ atis, durum }) { atisCb = atis; durumCb = durum || (() => {}); }

/** 'uzak' (telefon bağlı) · 'yerel' (bu cihazın kamerası açık) · 'hazir' (ayar var, kapalı) · 'ayarsiz' */
export function durum() {
  if (uzak && uzak.durum === 'bagli') return 'uzak';
  if (yerel) return 'yerel';
  return ayarOku() ? 'hazir' : 'ayarsiz';
}

// ---------- yalnız telefon ----------
export async function yerelAc() {
  if (yerel) return true;
  const ay = ayarOku(); if (!ay) return false;
  const video = await kameraAc();
  if (flasVar(video) && flasTercih()) flasKoy(video, true, false); // kamera ekranında flaş açık bırakıldıysa oyunda da açık
  const w = video.videoWidth, h = video.videoHeight;
  // ayar başka çözünürlükte yapıldıysa noktalar oranla taşınır
  const noktalar = ay.w === w && ay.h === h ? ay.noktalar : ay.noktalar.map(p => ({ x: p.x * w / ay.w, y: p.y * h / ay.h }));
  const kal = kalibre(noktalar);
  const kutu = document.createElement('div');
  kutu.className = 'kam-onizleme';
  kutu.innerHTML = '<span class="kam-nokta"></span><b class="kam-son"></b>';
  video.className = 'kam-video'; kutu.prepend(video);
  kutu.onclick = () => yerelKapat();
  document.body.appendChild(kutu);
  const alg = algilayici({
    kaynak: video, w, h, kal,
    okBulundu: (u, p) => { kutu.querySelector('.kam-son').textContent = p.ad; kutu.classList.remove('vurdu'); void kutu.offsetWidth; kutu.classList.add('vurdu'); atisCb(p, 'yerel'); },
    yeniEl: () => { kutu.querySelector('.kam-son').textContent = ''; },
  });
  alg.baslat();
  yerel = { video, alg, kutu };
  durumCb();
  return true;
}
export function yerelKapat() {
  if (!yerel) return;
  yerel.alg.durdur(); kameraKapat(yerel.video); yerel.kutu.remove(); yerel = null;
  durumCb();
}
/** Oyun tarafı: sıra değişti, geri alındı vb. → algılayıcı tahtayı yeniden boş saysın mı? (oklar çekilmeden olmaz; dokunma) */
export function elBitti() { /* oklar çekilince algılayıcı kendisi yeni el başlatır */ }

// ---------- tablet + telefon ----------
const PENCERE_CSS = 'kam-perde';
function pencere(html) {
  let p = document.querySelector('.' + PENCERE_CSS);
  if (!p) { p = document.createElement('div'); p.className = PENCERE_CSS; document.body.appendChild(p); }
  p.innerHTML = `<div class="kam-kart">${html}</div>`;
  p.onclick = e => { if (e.target === p || e.target.closest('[data-kam="kapat"]')) pencereKapat(); };
  return p;
}
let taramaDur = null, taramaVideo = null;
function pencereKapat() {
  if (taramaDur) taramaDur.dur(); taramaDur = null;
  if (taramaVideo) kameraKapat(taramaVideo); taramaVideo = null;
  const p = document.querySelector('.' + PENCERE_CSS); if (p) p.remove();
}

export async function eslestir(t = s => s) {
  if (uzak) { try { uzak.baglanti.kapat(); } catch (e) { /* yok say */ } uzak = null; durumCb(); }
  pencere(`<p class="kam-adim">${t('Hazırlanıyor…')}</p>`);
  // iPad/iPhone Safari, kamera izni olmayan sayfanın yerel ağ adresini paylaşmaz: önce kamera açılır (QR okumada da bu kamera kullanılır)
  if (!taramaVideo) { try { taramaVideo = await kameraAc('user'); } catch (e) { /* izin yoksa yine dene */ } }
  let b;
  try {
    b = await tabletBaslat({
      durum: d => {
        if (!uzak) return;
        uzak.durum = d; durumCb();
        if (d === 'bagli') { pencere(`<div class="kam-tamam">✓</div><h3>${t('Telefon bağlandı')}</h3><p>${t('Telefonun kamerası atışları bu cihaza yazacak. Yanlış gelen atışı Geri Al ile düzeltebilirsin.')}</p><button class="btn primary" data-kam="kapat">${t('Tamam')}</button>`); }
      },
      mesaj: m => { if (m && m.t === 'ok') atisCb({ n: m.n, m: m.m, ad: m.ad }, 'uzak'); },
    });
  } catch (e) { pencere(`<p>${t('Bağlantı kurulamadı')}: ${e.message}</p><button class="btn" data-kam="kapat">${t('Kapat')}</button>`); return; }
  uzak = { baglanti: b, durum: 'bekliyor' };
  const svg = await qrSvg(b.qr);
  pencere(`${baslik(IC.tablet, t('Kamerayı telefondan al'))}
    <ol class="kam-adimlar"><li>${t('İki cihaz aynı Wi-Fi’ye (ya da telefonun hotspot’una) bağlı olsun. İnternet gerekmez.')}</li>
    <li>${t('Telefonda DartX → <b>Kamera</b>: kamerayı aç, tahtayı ayarla, sonra <b>Tablete bağlan</b>; bu kodu telefonla okut.')}</li></ol>
    <div class="kam-qr">${svg}</div>
    <button class="btn primary" data-kam="ileri">${t('Telefon kodu gösteriyor ›')}</button>
    <button class="btn" data-kam="kapat">${t('Vazgeç')}</button>`);
  document.querySelector('[data-kam="ileri"]').onclick = () => cevapOkut(b, t);
}

async function cevapOkut(b, t) {
  pencere(`${baslik(IC.kamera, t('Telefonun kodunu okut'))}<p>${t('Telefon ekranındaki kodu bu cihazın kamerasına göster.')}</p>
    <div class="kam-tara"><span class="kam-cerceve"></span></div><p class="kam-hata"></p><button class="btn" data-kam="kapat">${t('Vazgeç')}</button>`);
  try {
    if (!taramaVideo) taramaVideo = await kameraAc('user');
  } catch (e) { document.querySelector('.kam-hata').textContent = t('Kamera açılamadı'); return; }
  document.querySelector('.kam-tara').prepend(taramaVideo);
  taramaDur = qrOku(taramaVideo, async kod => {
    kameraKapat(taramaVideo); taramaVideo = null;
    try { await b.tamamla(kod); pencere(`<p class="kam-adim">${t('Bağlanıyor…')}</p>`); }
    catch (e) { pencere(`<p>${e.message}</p><button class="btn" data-kam="kapat">${t('Kapat')}</button>`); }
  });
}
export function uzakKes() { if (uzak) { try { uzak.baglanti.kapat(); } catch (e) { /* yok say */ } uzak = null; durumCb(); } }
