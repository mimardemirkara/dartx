// DartX Kamera (Beta) — uygulamanın içindeki ekran (Ayarlar → Kamera → Bu cihaz kamera)
// Kalıcı bir kök öğe kurulur; uygulama her çizimde onu yerine takar (kamera görüntüsü ve ayar kaybolmaz).
// Telefon tahtaya bakar; tahta 4 noktayla ayarlanır; ok algılanır; puan önerilir ya da eşleşmiş tablete gider.
import { HALKA, DILIM, puan, kalibre, uygula } from './tahta.js';
import { algilayici, ayarOku, ayarYaz, kameraAc, kameraKapat } from './algila.js';
import { telefonBagla, qrSvg, qrOku } from './baglanti.js';
import { t } from '../i18n.js';

const L = (p, b = 20) => `<svg width="${b}" height="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const IC = {
  kamera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  resim: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  ayar: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/>',
  izgara: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><path d="M12 2v20"/><path d="M2 12h20"/>',
  algila: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>',
  tablet: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  liste: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  adim: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  onay: '<path d="M20 6 9 17l-5-5"/>',
  kalem: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
};

const S = {
  kaynak: null, video: false, w: 0, h: 0, akis: null,
  noktalar: [], kal: null, mod: 'bos', // bos | ayar | hazir | duzelt
  izgara: true, algila: false, oneri: null, kayit: [], surukle: -1, alg: null, tablet: null, kutu: null,
};
let kok = null, tuval = null, cx = null, bildir = () => {}, tarama = null;
const $ = s => kok.querySelector(s);

/** Uygulama: bildir(metin, simge) — uygulamanın simgeli uyarısı */
export function kur(o) { bildir = o.bildir || bildir; }

function kokKur() {
  kok = document.createElement('div');
  kok.className = 'kam-duzen';
  kok.innerHTML = `
  <section class="ay-grup kam-sol">
    <div class="kam-sahne">
      <canvas class="kam-tuval" width="16" height="9"></canvas>
      <div class="kam-bos">
        <span class="kam-bos-ic">${L(IC.kamera, 44)}</span>
        <b>${t('Telefonu tahtaya bakacak şekilde sabitle')}</b>
        <span>${t('Sonra Kamerayı aç’a dokun. Kamera yoksa tahtanın bir fotoğrafıyla da deneyebilirsin.')}</span>
      </div>
      <div class="kam-yonerge" hidden></div>
      <div class="kam-oneri"><strong class="kam-oneri-puan">T20</strong>
        <button class="btn sm primary" data-k="onayla">${L(IC.onay, 18)}${t('Onayla')}</button>
        <button class="btn sm" data-k="duzelt">${L(IC.kalem, 16)}${t('Düzelt')}</button><em class="kam-gitti">${t('tablete gitti')}</em></div>
    </div>
    <div class="kam-araclar">
      <button class="btn sm primary" data-k="ac">${L(IC.kamera, 18)}<span>${t('Kamerayı aç')}</span></button>
      <label class="btn sm">${L(IC.resim, 18)}<span>${t('Fotoğraf')}</span><input type="file" accept="image/*" hidden data-k="foto"></label>
      <button class="btn sm" data-k="ayarla" disabled>${L(IC.ayar, 18)}<span>${t('Tahtayı ayarla')}</span></button>
      <button class="btn sm" data-k="izgara" disabled>${L(IC.izgara, 18)}<span>${t('Izgara')}</span></button>
      <button class="btn sm" data-k="algila" disabled>${L(IC.algila, 18)}<span>${t('Otomatik algıla')}</span></button>
      <button class="btn sm" data-k="tablet" disabled>${L(IC.tablet, 18)}<span>${t('Tablete bağlan')}</span></button>
    </div>
  </section>
  <div class="kam-sag">
    <section class="ay-grup kam-adimlar-kart">
      <div class="kart-bas">${L(IC.adim, 16)}<span>${t('Adımlar')}</span></div>
      <ol class="kam-adim-liste">
        <li data-a="1"><i>1</i><span><b>${t('Kamerayı aç')}</b><small>${t('Telefon tahtaya 30–40° açıyla, yaklaşık 1 m uzakta, bull hizasında dursun')}</small></span></li>
        <li data-a="2"><i>2</i><span><b>${t('Tahtayı ayarla')}</b><small>${t('20, 6, 3 ve 11’in double halkasının dış çizgisine sırayla dokun')}</small></span></li>
        <li data-a="3"><i>3</i><span><b>${t('Izgarayı kontrol et')}</b><small>${t('Altın çizgiler tahtaya oturmalı; oturmazsa kırmızı noktaları sürükle')}</small></span></li>
        <li data-a="4"><i>4</i><span><b>${t('Algılamayı aç ya da tablete bağlan')}</b><small>${t('Tahta boşken başla; ok saplanınca puan gelir')}</small></span></li>
      </ol>
    </section>
    <section class="ay-grup kam-kayit-kart">
      <div class="kart-bas">${L(IC.liste, 16)}<span>${t('Atışlar')}</span><span class="kam-isabet"></span></div>
      <div class="kam-kayit"><em>${t('Atışlar burada görünür')}</em></div>
    </section>
  </div>`;
  tuval = $('.kam-tuval'); cx = tuval.getContext('2d');
  $('[data-k="ac"]').onclick = kameraBaslat;
  $('[data-k="foto"]').onchange = e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const img = new Image(); img.onload = () => kaynakKoy(img, img.naturalWidth, img.naturalHeight, false); img.src = URL.createObjectURL(f);
  };
  $('[data-k="ayarla"]').onclick = ayarBasla;
  $('[data-k="izgara"]').onclick = () => { S.izgara = !S.izgara; dugmeler(); };
  $('[data-k="algila"]').onclick = () => algilamaAc(!S.algila);
  $('[data-k="tablet"]').onclick = tabletTikla;
  $('[data-k="onayla"]').onclick = onayla;
  $('[data-k="duzelt"]').onclick = () => { S.mod = 'duzelt'; yonerge(t('Okun ucunun saplandığı yere dokun')); };
  tuval.addEventListener('pointerdown', dokun);
  tuval.addEventListener('pointermove', e => { if (S.surukle < 0) return; S.noktalar[S.surukle] = tuvalNoktasi(e); const k = kalibre(S.noktalar); if (k) S.kal = k; });
  tuval.addEventListener('pointerup', () => { if (S.surukle >= 0) { S.surukle = -1; ayarBitir(); } });
  requestAnimationFrame(ciz);
  adimlar();
}

/** Uygulama her çizimde çağırır: kök öğeyi yer tutucuya takar */
export function yerlestir(yer) { if (!yer) return; if (!kok) kokKur(); if (kok.parentNode !== yer) yer.replaceWith(kok); }
/** Ekrandan çıkılınca: kamera ve algılama kapanır (tablete bağlıysa bağlantı da kapanır) */
export function ayril() {
  if (!kok || !S.kaynak) return;
  if (S.alg) { S.alg.durdur(); S.alg = null; } S.algila = false;
  if (S.tablet) { try { S.tablet.kapat(); } catch (e) { /* yok say */ } S.tablet = null; }
  if (tarama) { tarama.dur(); tarama = null; }
  qrKapat();
  if (S.video) kameraKapat(S.kaynak);
  Object.assign(S, { kaynak: null, video: false, w: 0, h: 0, noktalar: [], kal: null, mod: 'bos', oneri: null, kutu: null });
  $('.kam-bos').hidden = false; tuval.width = 16; tuval.height = 9;
  dugmeler(); oneriGoster(); adimlar(); yonerge('');
}

// ---------- kaynak ----------
async function kameraBaslat() {
  try { const v = await kameraAc(); kaynakKoy(v, v.videoWidth, v.videoHeight, true); bildir(t('Kamera açık'), 'kamera'); }
  catch (e) { bildir(t('Kamera açılamadı') + (e && e.name === 'NotAllowedError' ? ': ' + t('izin verilmedi') : ''), 'dikkat'); }
}
function kaynakKoy(k, w, h, video) {
  if (S.video && S.kaynak && S.kaynak !== k) kameraKapat(S.kaynak);
  Object.assign(S, { kaynak: k, w, h, video });
  tuval.width = w; tuval.height = h;
  $('.kam-bos').hidden = true;
  const k2 = ayarOku(w, h);
  if (k2) { S.noktalar = k2.noktalar; ayarBitir(false); } else ayarBasla();
  dugmeler();
}

// ---------- kalibrasyon ----------
const AYAR_YAZI = ['20', '6', '3', '11'];
function ayarBasla() {
  if (S.alg) { S.alg.durdur(); S.alg = null; S.algila = false; }
  S.noktalar = []; S.kal = null; S.mod = 'ayar'; S.oneri = null; oneriGoster(); ayarYonerge(); dugmeler(); adimlar();
}
function ayarYonerge() {
  const i = S.noktalar.length;
  yonerge(t('Ayar {0}/4: {1} diliminde double halkasının dış çizgisine, dilimin ortasına dokun', i + 1, `<b>${AYAR_YAZI[i]}</b>`));
}
function ayarBitir(kaydet = true) {
  S.kal = kalibre(S.noktalar);
  if (!S.kal) { bildir(t('Noktalar hatalı, yeniden ayarla'), 'dikkat'); ayarBasla(); return; }
  S.mod = 'hazir'; S.izgara = true;
  if (kaydet) ayarYaz(S.w, S.h, S.noktalar);
  if (S.algila) algilamaKur();
  yonerge(S.video ? t('Izgara oturdu mu? Oturmadıysa noktaları sürükle. Sonra Otomatik algıla.') : t('Izgara oturdu mu? Bir yere dokun, puanını göstereyim.'));
  dugmeler(); adimlar();
}

// ---------- dokunma ----------
function tuvalNoktasi(e) { const r = tuval.getBoundingClientRect(); return { x: (e.clientX - r.left) * S.w / r.width, y: (e.clientY - r.top) * S.h / r.height }; }
const olcek = () => S.w / (tuval.getBoundingClientRect().width || 1);
function dokun(e) {
  if (!S.kaynak) return;
  const p = tuvalNoktasi(e);
  if (S.mod === 'ayar') { S.noktalar.push(p); if (S.noktalar.length === 4) { ayarBitir(); bildir(t('Tahta ayarlandı'), 'hedef'); } else ayarYonerge(); adimlar(); return; }
  const yakin = S.noktalar.findIndex(q => Math.hypot(q.x - p.x, q.y - p.y) < 28 * olcek());
  if (yakin >= 0 && S.mod === 'hazir') { S.surukle = yakin; tuval.setPointerCapture(e.pointerId); return; }
  if (!S.kal) return;
  if (S.mod === 'duzelt' || !S.algila) { oneriKoy(p, S.mod === 'duzelt'); S.mod = 'hazir'; }
}

// ---------- öneri ve kayıt ----------
function oneriKoy(p, duz = false) { const q = uygula(S.kal.G2T, p.x, p.y); S.oneri = { x: p.x, y: p.y, p: puan(q.x, q.y), duz }; oneriGoster(); }
function oneriGoster(gitti = false) {
  const o = $('.kam-oneri'); o.classList.toggle('on', !!S.oneri); o.classList.toggle('gitti', gitti);
  if (S.oneri) { $('.kam-oneri-puan').textContent = S.oneri.p.ad; o.classList.remove('gir'); void o.offsetWidth; o.classList.add('gir'); }
}
function onayla() { if (!S.oneri) return; S.kayit.push(S.oneri); S.oneri = null; oneriGoster(); kayitCiz(); if (navigator.vibrate) navigator.vibrate(8); }
function kayitCiz() {
  const k = $('.kam-kayit');
  if (!S.kayit.length) { k.innerHTML = `<em>${t('Atışlar burada görünür')}</em>`; $('.kam-isabet').textContent = ''; return; }
  const son = S.kayit.slice(-15), bas = S.kayit.length - son.length;
  k.innerHTML = son.map((o, i) => `<span class="kam-ok ${o.duz ? 'duz' : ''}">${o.p.ad}</span>${(bas + i + 1) % 3 === 0 ? '<i class="kam-ayrac"></i>' : ''}`).join('');
  k.scrollLeft = k.scrollWidth;
  const d = S.kayit.filter(o => o.duz).length;
  $('.kam-isabet').innerHTML = `${t('İsabet')} <b>${S.kayit.length - d}/${S.kayit.length}</b>`;
}

// ---------- algılama ----------
function algilamaKur() {
  if (S.alg) S.alg.durdur();
  S.alg = algilayici({
    kaynak: S.kaynak, w: S.w, h: S.h, kal: S.kal,
    okBulundu: (u, p, kutu, say) => {
      S.kutu = kutu;
      if (S.tablet) { S.tablet.gonder({ t: 'ok', n: p.n, m: p.m, ad: p.ad }); S.kayit.push({ x: u.x, y: u.y, p }); kayitCiz(); S.oneri = { x: u.x, y: u.y, p }; oneriGoster(true); }
      else { if (S.oneri) onayla(); oneriKoy(u); }
      if (navigator.vibrate) navigator.vibrate([10, 40, 10]);
      if (say >= 3) yonerge(t('3 ok tamam. Okları çekince yeni el başlar.'));
    },
    yeniEl: () => { if (S.oneri && !S.tablet) onayla(); S.oneri = null; S.kutu = null; oneriGoster(); bildir(t('Yeni el: oklar çekildi'), 'hedef'); },
  });
  S.alg.baslat();
}
function algilamaAc(ac) {
  if (!S.kal) { bildir(t('Önce tahtayı ayarla'), 'dikkat'); return; }
  S.algila = ac;
  if (ac) { algilamaKur(); yonerge(t('Tahta boşken başla. Ok atınca puanı bulacağım.')); }
  else if (S.alg) { S.alg.durdur(); S.alg = null; }
  dugmeler(); adimlar();
}

// ---------- tablete bağlan (internetsiz: aynı Wi-Fi / hotspot, iki QR) ----------
function tabletTikla() {
  if (S.tablet) { S.tablet.kapat(); S.tablet = null; dugmeler(); return; }
  if (!S.kal) { bildir(t('Önce tahtayı ayarla'), 'dikkat'); return; }
  if (tarama) { tarama.dur(); tarama = null; dugmeler(); yonerge(''); return; }
  yonerge(t('Tabletteki Kamerayı telefondan al kodunu bu kameraya göster'));
  tarama = qrOku(S.kaynak, async kod => {
    tarama = null; dugmeler();
    try {
      const b = await telefonBagla(kod, {
        durum: d => {
          if (d === 'bagli') { S.tablet = b; qrKapat(); dugmeler(); algilamaAc(true); bildir(t('Tablete bağlandı'), 'tablet'); yonerge(t('Atışlar tablete yazılıyor. Yanlışsa tablette Geri Al.')); }
          else if (d === 'koptu' && S.tablet) { S.tablet = null; dugmeler(); bildir(t('Tabletle bağlantı koptu'), 'dikkat'); }
        },
      });
      qrGoster(await qrSvg(b.qr));
    } catch (e) { bildir(e.message, 'dikkat'); dugmeler(); }
  });
  dugmeler();
}
function qrGoster(svg) {
  let p = document.querySelector('.kam-perde');
  if (!p) { p = document.createElement('div'); p.className = 'kam-perde'; document.body.appendChild(p); }
  p.innerHTML = `<div class="kam-kart"><span class="kam-kart-ic">${L(IC.tablet, 30)}</span><h3>${t('Bu kodu tablete okut')}</h3><div class="kam-qr">${svg}</div>
    <p>${t('Tablette “Telefon kodu gösteriyor” deyip bu kodu tabletin kamerasına göster.')}</p><button class="btn" data-q="vazgec">${t('Vazgeç')}</button></div>`;
  p.querySelector('[data-q="vazgec"]').onclick = () => qrKapat();
}
function qrKapat() { const p = document.querySelector('.kam-perde'); if (p) p.remove(); }

// ---------- görünüm durumu ----------
function dugmeler() {
  if (!kok) return;
  const b = k => $(`[data-k="${k}"]`), var_ = !!S.kaynak;
  const ac = b('ac'); ac.disabled = S.video; ac.classList.toggle('primary', !S.video); ac.querySelector('span').textContent = S.video ? t('Kamera açık') : t('Kamerayı aç');
  b('ayarla').disabled = !var_;
  b('izgara').disabled = !S.kal; b('izgara').classList.toggle('on', !!S.kal && S.izgara);
  b('algila').disabled = !S.video || !S.kal; b('algila').classList.toggle('on', S.algila);
  b('algila').querySelector('span').textContent = S.algila ? t('Algılama açık') : t('Otomatik algıla');
  b('tablet').disabled = !S.video || !S.kal; b('tablet').classList.toggle('on', !!S.tablet);
  b('tablet').querySelector('span').textContent = S.tablet ? t('Tablete bağlı') : tarama ? t('Kod aranıyor…') : t('Tablete bağlan');
}
function adimlar() {
  if (!kok) return;
  const n = !S.kaynak ? 1 : S.mod === 'ayar' ? 2 : !S.algila && !S.tablet ? 3 : 5;
  kok.querySelectorAll('.kam-adim-liste li').forEach(li => { const a = Number(li.dataset.a); li.classList.toggle('tamam', a < n); li.classList.toggle('simdi', a === n || (n === 3 && a === 4)); });
}
function yonerge(html) { if (kok) { const y = $('.kam-yonerge'); y.innerHTML = html; y.hidden = !html; } }

// ---------- çizim ----------
function ciz() {
  requestAnimationFrame(ciz);
  if (!S.kaynak || !kok || !kok.isConnected) return;
  cx.drawImage(S.kaynak, 0, 0, S.w, S.h);
  const o = olcek(), lw = Math.max(1.5, 2 * o);
  if (S.kal && S.izgara) {
    const T = (x, y) => uygula(S.kal.T2G, x, y);
    cx.lineWidth = lw; cx.strokeStyle = 'rgb(240 207 134 / .9)'; cx.shadowColor = 'rgb(0 0 0 / .6)'; cx.shadowBlur = 3 * o;
    for (const r of [HALKA.dbull, HALKA.bull, HALKA.tIc, HALKA.tDis, HALKA.dIc, HALKA.dDis]) {
      cx.beginPath();
      for (let a = 0; a <= 360; a += 4) { const q = T(r * Math.cos(a * Math.PI / 180), r * Math.sin(a * Math.PI / 180)); a ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y); }
      cx.stroke();
    }
    cx.beginPath();
    for (let i = 0; i < 20; i++) {
      const a = (90 - i * 18 + 9) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      const p1 = T(c * HALKA.bull, s * HALKA.bull), p2 = T(c * HALKA.dDis, s * HALKA.dDis);
      cx.moveTo(p1.x, p1.y); cx.lineTo(p2.x, p2.y);
    }
    cx.stroke();
    cx.fillStyle = '#f3d48f'; cx.font = `800 ${Math.round(16 * o)}px system-ui`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    DILIM.forEach((n, i) => { const a = (90 - i * 18) * Math.PI / 180, q = T(Math.cos(a) * 186, Math.sin(a) * 186); cx.fillText(n, q.x, q.y); });
    cx.shadowBlur = 0;
  }
  S.noktalar.forEach((q, i) => {
    cx.beginPath(); cx.arc(q.x, q.y, 11 * o, 0, Math.PI * 2);
    cx.fillStyle = 'rgb(233 75 60 / .92)'; cx.fill(); cx.lineWidth = 2 * o; cx.strokeStyle = '#fff'; cx.stroke();
    cx.fillStyle = '#fff'; cx.font = `800 ${Math.round(11 * o)}px system-ui`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(AYAR_YAZI[i], q.x, q.y);
  });
  if (S.kutu) { cx.lineWidth = lw; cx.strokeStyle = 'rgb(61 139 253 / .9)'; cx.setLineDash([6 * o, 4 * o]); cx.strokeRect(S.kutu.x, S.kutu.y, S.kutu.w, S.kutu.h); cx.setLineDash([]); }
  if (S.oneri) {
    const r = 14 * o;
    cx.lineWidth = 3 * o; cx.strokeStyle = '#2fb36d';
    cx.beginPath(); cx.arc(S.oneri.x, S.oneri.y, r, 0, Math.PI * 2); cx.stroke();
    cx.beginPath(); cx.moveTo(S.oneri.x - r * 1.6, S.oneri.y); cx.lineTo(S.oneri.x + r * 1.6, S.oneri.y); cx.moveTo(S.oneri.x, S.oneri.y - r * 1.6); cx.lineTo(S.oneri.x, S.oneri.y + r * 1.6); cx.stroke();
  }
}
