// DartX kamera (deneme) — telefon kamerası tahtaya bakar; tahta 4 noktayla ayarlanır,
// saplanan ok görüntü farkından bulunur, puan ÖNERİ olarak gösterilir, oyuncu onaylar ya da düzeltir.
import { HALKA, DILIM, puan, kalibre, uygula } from './tahta.js';
import { algilayici, ayarOku, ayarYaz, kameraAc } from './algila.js';
import { telefonBagla, qrSvg, qrOku } from './baglanti.js';

const $ = id => document.getElementById(id);
const tuval = $('tuval'), cx = tuval.getContext('2d');

const S = {
  kaynak: null, video: false, w: 0, h: 0,
  noktalar: [], kal: null, mod: 'bos', // bos | ayar | hazir | duzelt
  izgara: true, algila: false, oneri: null, kayit: [], surukle: -1, alg: null, tablet: null,
};

// ---------- kaynak: kamera ya da fotoğraf ----------
$('kamera-ac').onclick = async () => {
  try {
    const v = await kameraAc();
    kaynakKoy(v, v.videoWidth, v.videoHeight, true);
    $('kamera-ac').textContent = 'Kamera açık'; $('kamera-ac').disabled = true;
  } catch (e) {
    yonerge('Kamera açılamadı: ' + (e && e.name === 'NotAllowedError' ? 'izin verilmedi' : (e && e.message) || 'bilinmeyen hata'));
  }
};
$('foto').onchange = e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => kaynakKoy(img, img.naturalWidth, img.naturalHeight, false);
  img.src = URL.createObjectURL(f);
};

function kaynakKoy(k, w, h, video) {
  Object.assign(S, { kaynak: k, w, h, video });
  tuval.width = w; tuval.height = h;
  $('bos').style.display = 'none';
  ['ayarla', 'izgara'].forEach(id => { $(id).disabled = false; });
  $('algila').disabled = !video; $('tablet').disabled = !video;
  // önceki ayar aynı çözünürlükteyse geri gelir
  const k2 = ayarOku(w, h);
  if (k2) { S.noktalar = k2.noktalar; ayarBitir(false); return; }
  ayarBasla();
}

// ---------- kalibrasyon ----------
const AYAR_YAZI = ['20', '6', '3', '11'];
function ayarBasla() {
  S.noktalar = []; S.kal = null; S.mod = 'ayar'; S.oneri = null; oneriGoster();
  ayarYonerge();
}
function ayarYonerge() {
  const i = S.noktalar.length;
  yonerge(`Ayar ${i + 1}/4: <b>${AYAR_YAZI[i]}</b> diliminin <b>double halkasının dış çizgisine</b>, dilimin tam ortasına dokun`);
}
function ayarBitir(kaydet = true) {
  S.kal = kalibre(S.noktalar);
  if (!S.kal) { yonerge('Noktalar hatalı, yeniden ayarla'); ayarBasla(); return; }
  S.mod = 'hazir'; S.izgara = true; $('izgara').classList.add('acik');
  if (kaydet) ayarYaz(S.w, S.h, S.noktalar);
  if (S.algila) algilamaKur();
  yonerge(S.video ? 'Izgara tahtaya oturdu mu? Oturmadıysa noktaları sürükle. Sonra <b>Otomatik algıla</b>.' : 'Izgara oturdu mu? Bir yere dokun, puanını göstereyim.');
}
$('ayarla').onclick = ayarBasla;
$('izgara').onclick = () => { S.izgara = !S.izgara; $('izgara').classList.toggle('acik', S.izgara); };

// ---------- dokunma ----------
function tuvalNoktasi(e) {
  const r = tuval.getBoundingClientRect();
  return { x: (e.clientX - r.left) * S.w / r.width, y: (e.clientY - r.top) * S.h / r.height };
}
const olcek = () => S.w / tuval.getBoundingClientRect().width; // ekran pikseli → görüntü pikseli
tuval.addEventListener('pointerdown', e => {
  if (!S.kaynak) return;
  const p = tuvalNoktasi(e);
  if (S.mod === 'ayar') {
    S.noktalar.push(p);
    if (S.noktalar.length === 4) ayarBitir(); else ayarYonerge();
    return;
  }
  // ayar noktasını sürükleme
  const yakin = S.noktalar.findIndex(q => Math.hypot(q.x - p.x, q.y - p.y) < 28 * olcek());
  if (yakin >= 0 && S.mod === 'hazir') { S.surukle = yakin; tuval.setPointerCapture(e.pointerId); return; }
  if (!S.kal) return;
  if (S.mod === 'duzelt' || !S.algila) { oneriKoy(p, S.mod === 'duzelt'); S.mod = 'hazir'; }
});
tuval.addEventListener('pointermove', e => {
  if (S.surukle < 0) return;
  S.noktalar[S.surukle] = tuvalNoktasi(e);
  const k = kalibre(S.noktalar); if (k) S.kal = k;
});
tuval.addEventListener('pointerup', () => { if (S.surukle >= 0) { S.surukle = -1; ayarBitir(); } });

// ---------- öneri ----------
function oneriKoy(p, duz = false) {
  const t = uygula(S.kal.G2T, p.x, p.y);
  S.oneri = { x: p.x, y: p.y, p: puan(t.x, t.y), duz };
  oneriGoster();
}
function oneriGoster(gitti = false) {
  $('oneri').classList.toggle('on', !!S.oneri);
  $('oneri').classList.toggle('gitti', gitti);
  if (S.oneri) $('oneri-puan').textContent = S.oneri.p.ad;
}
function onayla() {
  if (!S.oneri) return;
  S.kayit.push(S.oneri); S.oneri = null; oneriGoster(); kayitCiz();
  if (navigator.vibrate) navigator.vibrate(8);
}
$('onayla').onclick = onayla;
$('duzelt').onclick = () => { S.mod = 'duzelt'; yonerge('Okun <b>ucunun</b> saplandığı yere dokun'); };
function kayitCiz() {
  const k = $('kayit');
  if (!S.kayit.length) { k.innerHTML = '<em>Atışlar burada görünür</em>'; return; }
  k.innerHTML = S.kayit.slice(-12).map((o, i, a) => `<span class="${o.duz ? 'duz' : ''}" title="${o.duz ? 'elle düzeltildi' : 'kamera'}">${o.p.ad}</span>${(S.kayit.length - a.length + i + 1) % 3 === 0 ? '<em>·</em>' : ''}`).join('');
  k.scrollLeft = k.scrollWidth;
  const d = S.kayit.filter(o => o.duz).length;
  yonerge(`İsabet: ${S.kayit.length - d}/${S.kayit.length} kamera doğru bildi`);
}

// ---------- çizim ----------
function ciz() {
  requestAnimationFrame(ciz);
  if (!S.kaynak) return;
  cx.drawImage(S.kaynak, 0, 0, S.w, S.h);
  const lw = Math.max(1.5, 2 * olcek());
  if (S.kal && S.izgara) {
    const T = (x, y) => uygula(S.kal.T2G, x, y);
    cx.lineWidth = lw; cx.strokeStyle = 'rgb(240 207 134 / .85)';
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
    cx.fillStyle = '#f3d48f'; cx.font = `700 ${Math.round(16 * olcek())}px system-ui`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    DILIM.forEach((n, i) => { const a = (90 - i * 18) * Math.PI / 180, q = T(Math.cos(a) * 186, Math.sin(a) * 186); cx.fillText(n, q.x, q.y); });
  }
  // ayar noktaları
  S.noktalar.forEach((q, i) => {
    cx.beginPath(); cx.arc(q.x, q.y, 10 * olcek(), 0, Math.PI * 2);
    cx.fillStyle = 'rgb(233 75 60 / .9)'; cx.fill(); cx.lineWidth = lw; cx.strokeStyle = '#fff'; cx.stroke();
    cx.fillStyle = '#fff'; cx.font = `800 ${Math.round(11 * olcek())}px system-ui`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(AYAR_YAZI[i], q.x, q.y);
  });
  // öneri işareti
  if (S.oneri) {
    const r = 14 * olcek();
    cx.lineWidth = 3 * olcek(); cx.strokeStyle = '#2fb36d';
    cx.beginPath(); cx.arc(S.oneri.x, S.oneri.y, r, 0, Math.PI * 2); cx.stroke();
    cx.beginPath(); cx.moveTo(S.oneri.x - r * 1.6, S.oneri.y); cx.lineTo(S.oneri.x + r * 1.6, S.oneri.y); cx.moveTo(S.oneri.x, S.oneri.y - r * 1.6); cx.lineTo(S.oneri.x, S.oneri.y + r * 1.6); cx.stroke();
  }
  if (S.ipucuKutu) { cx.lineWidth = lw; cx.strokeStyle = 'rgb(80 160 255 / .9)'; const b = S.ipucuKutu; cx.strokeRect(b.x, b.y, b.w, b.h); }
}
requestAnimationFrame(ciz);

// ---------- otomatik algılama (ortak modül: algila.js) ----------
function algilamaKur() {
  if (S.alg) S.alg.durdur();
  S.alg = algilayici({
    kaynak: S.kaynak, w: S.w, h: S.h, kal: S.kal,
    okBulundu: (u, p, kutu, say) => {
      S.ipucuKutu = kutu;
      if (S.tablet) { // tablete bağlıyken onay beklenmez: atış hemen gider, düzeltme tablette Geri Al ile
        S.tablet.gonder({ t: 'ok', n: p.n, m: p.m, ad: p.ad });
        S.kayit.push({ x: u.x, y: u.y, p }); kayitCiz(); S.oneri = { x: u.x, y: u.y, p }; oneriGoster(true);
      } else {
        if (S.oneri) onayla(); // önceki öneri cevapsız kaldıysa kabul edilir
        oneriKoy(u);
      }
      if (navigator.vibrate) navigator.vibrate([10, 40, 10]);
      if (say >= 3) yonerge('3 ok tamam. Okları çekince yeni el başlar.');
    },
    yeniEl: () => { if (S.oneri && !S.tablet) onayla(); S.oneri = null; oneriGoster(); S.ipucuKutu = null; yonerge('Yeni el: oklar çekildi'); },
  });
  S.alg.baslat();
}
function algilamaAc(ac) {
  if (!S.kal) { yonerge('Önce tahtayı ayarla'); return; }
  S.algila = ac;
  $('algila').classList.toggle('acik', ac);
  $('algila').textContent = ac ? 'Algılama açık' : 'Otomatik algıla';
  if (ac) { algilamaKur(); yonerge('Tahta boşken başla. Ok atınca puanı bulacağım.'); }
  else if (S.alg) { S.alg.durdur(); S.alg = null; }
}
$('algila').onclick = () => algilamaAc(!S.algila);

// ---------- tablete bağlan (internetsiz: aynı Wi-Fi / hotspot, iki QR) ----------
let tarama = null;
$('tablet').onclick = () => {
  if (S.tablet) { S.tablet.kapat(); S.tablet = null; tabletDurum(); return; }
  if (!S.kal) { yonerge('Önce tahtayı ayarla'); return; }
  yonerge('Tabletteki <b>Kamerayı telefondan al</b> kodunu bu kameraya göster');
  $('tablet').textContent = 'Kod aranıyor…';
  tarama = qrOku(S.kaynak, async kod => {
    tarama = null;
    try {
      const b = await telefonBagla(kod, {
        durum: d => { if (d === 'bagli') { S.tablet = b; qrKapat(); tabletDurum(); algilamaAc(true); yonerge('Tablete bağlandı. Atışlar tablete yazılıyor.'); } else if (d === 'koptu') { S.tablet = null; tabletDurum(); yonerge('Tabletle bağlantı koptu'); } },
      });
      qrGoster(await qrSvg(b.qr));
    } catch (e) { yonerge(e.message); tabletDurum(); }
  });
};
function qrGoster(svg) {
  let p = document.getElementById('qr-perde');
  if (!p) { p = document.createElement('div'); p.id = 'qr-perde'; document.body.appendChild(p); }
  p.innerHTML = `<div class="qr-kart"><h3>Bu kodu tablete okut</h3><div class="qr-kod">${svg}</div><p>Tablette “Telefon kodu gösteriyor” deyip kodu tabletin kamerasına göster.</p><button id="qr-vazgec">Vazgeç</button></div>`;
  $('qr-vazgec').onclick = () => { qrKapat(); tabletDurum(); };
}
function qrKapat() { const p = document.getElementById('qr-perde'); if (p) p.remove(); }
function tabletDurum() {
  if (tarama) { tarama.dur(); tarama = null; }
  $('tablet').textContent = S.tablet ? 'Tablete bağlı ✓' : 'Tablete bağlan';
  $('tablet').classList.toggle('acik', !!S.tablet);
}

function yonerge(html) { $('yonerge').innerHTML = html; }
