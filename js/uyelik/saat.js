// Giriş ekranı saati (Demir 11.11): ArchX giriş ekranındaki cam saatin (arch_app components/cam/CamSaat.tsx) birebir uyarlaması.
// Tarih sütlü beyaz cam; saat arkadaki duvar kağıdını harf kenarlarında mercek gibi büken kırılan cam (Chromium'da),
// sol üstten vuran ışıkla 3B görünür. Harfler sayfanın yazı tipiyle tuvale çizilir; dakika değişince yeniden çizilir.

function harfCiz(metin, boy, en, H, kalinlik, kirilma) {
  const aile = getComputedStyle(document.body).fontFamily;
  const font = `${kalinlik} ${boy}px ${aile}`;
  const y = boy * 0.98;
  const W = Math.ceil(en), Y = Math.ceil(H);
  const tuval = () => { const c = document.createElement('canvas'); c.width = W; c.height = Y; return c; };
  const m = tuval(); const mx = m.getContext('2d', { willReadFrequently: true }); if (!mx) return null;
  mx.font = font; mx.textAlign = 'center'; mx.textBaseline = 'alphabetic'; mx.fillStyle = '#000'; mx.fillText(metin, en / 2, y);
  const maske = `url(${m.toDataURL()})`;
  if (!kirilma) return { maske, isik: '', harita: '' };
  const h = tuval(); const hx = h.getContext('2d', { willReadFrequently: true }); if (!hx) return null;
  hx.filter = `blur(${Math.max(2, boy * 0.06)}px)`;
  hx.font = font; hx.textAlign = 'center'; hx.textBaseline = 'alphabetic'; hx.fillStyle = '#fff'; hx.fillText(metin, en / 2, y);
  const yuk = hx.getImageData(0, 0, W, Y).data, ic = mx.getImageData(0, 0, W, Y).data;
  const harita = tuval(), isik = tuval(); const kx = harita.getContext('2d'), ix = isik.getContext('2d');
  const kd = kx.createImageData(W, Y), id = ix.createImageData(W, Y);
  const a = (x, yy) => yuk[(Math.min(Y - 1, Math.max(0, yy)) * W + Math.min(W - 1, Math.max(0, x))) * 4 + 3] / 255;
  const S = 6;
  for (let yy = 0; yy < Y; yy++) {
    for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 4; const icMi = ic[i + 3] / 255;
      let gx = (a(x + 1, yy) - a(x - 1, yy)) * S, gy = (a(x, yy + 1) - a(x, yy - 1)) * S;
      gx = Math.max(-1, Math.min(1, gx)); gy = Math.max(-1, Math.min(1, gy));
      kd.data[i] = 128 + gx * 127 * icMi; kd.data[i + 1] = 128 + gy * 127 * icMi; kd.data[i + 2] = 128; kd.data[i + 3] = 255;
      const yon = gx * 0.62 + gy * 0.78;
      if (icMi > 0) {
        if (yon > 0) { id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = Math.min(255, yon * yon * 330) * icMi; }
        else { id.data[i] = id.data[i + 1] = id.data[i + 2] = 0; id.data[i + 3] = Math.min(90, yon * yon * 90) * icMi; }
      }
    }
  }
  kx.putImageData(kd, 0, 0); ix.putImageData(id, 0, 0);
  return { maske, isik: `url(${isik.toDataURL()})`, harita: harita.toDataURL() };
}
const chromium = () => /Chrome\/|Edg\//.test(navigator.userAgent) && !/Firefox\//.test(navigator.userAgent);

let dugum = null, sonDakika = '', zaman = null, no = 0;
function ciz() {
  const boy = window.innerWidth < 500 ? 72 : 96;
  const d = new Date(); const yerel = document.documentElement.lang || 'tr';
  const hm = d.toLocaleTimeString(yerel, { hour: '2-digit', minute: '2-digit' });
  const tarih = d.toLocaleDateString(yerel, { weekday: 'long', day: 'numeric', month: 'long' });
  const anahtar = hm + tarih + boy;
  if (anahtar === sonDakika) return; sonDakika = anahtar;
  const tarihBoy = Math.round(boy * 0.21);
  const tEn = boy * 4.2, tH = tarihBoy * 1.25, sEn = boy * 3.4, sH = boy * 1.25;
  const tc = harfCiz(tarih, tarihBoy, tEn, tH, 700, false);
  const kr = chromium(); const sc = harfCiz(hm, boy, sEn, sH, 800, kr);
  const k = 'uys' + (++no); const W = Math.ceil(sEn), Y = Math.ceil(sH);
  const arka = kr && sc && sc.harita ? `url(#${k})` : 'blur(6px) saturate(200%) brightness(1.8)';
  dugum.innerHTML = `
    <div class="uy-saat-tarih" style="width:${tEn}px;height:${tH}px"><div style="position:absolute;inset:0;backdrop-filter:blur(10px) saturate(220%) brightness(1.6);-webkit-backdrop-filter:blur(10px) saturate(220%) brightness(1.6);background:linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.74) 38%,rgba(255,255,255,.6) 70%,rgba(255,255,255,.72) 100%);mask-image:${tc.maske};-webkit-mask-image:${tc.maske};mask-size:100% 100%;-webkit-mask-size:100% 100%"></div></div>
    <div class="uy-saat-saat" style="width:${sEn}px;height:${sH}px">
      ${kr && sc.harita ? `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="${k}" x="0" y="0" width="${W}" height="${Y}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/><feImage href="${sc.harita}" x="0" y="0" width="${W}" height="${Y}" preserveAspectRatio="none" result="h"/>
        <feDisplacementMap in="b" in2="h" scale="${boy * 0.42}" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="d" type="saturate" values="1.7" result="s"/>
        <feComponentTransfer in="s"><feFuncR type="linear" slope="2" intercept=".04"/><feFuncG type="linear" slope="2" intercept=".04"/><feFuncB type="linear" slope="2" intercept=".05"/></feComponentTransfer></filter></svg>` : ''}
      <div style="position:absolute;inset:0;backdrop-filter:${arka};-webkit-backdrop-filter:${arka};background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,.1) 55%,rgba(255,255,255,.18));mask-image:${sc.maske};-webkit-mask-image:${sc.maske};mask-size:100% 100%;-webkit-mask-size:100% 100%"></div>
      ${sc.isik ? `<div style="position:absolute;inset:0;background-image:${sc.isik};background-size:100% 100%"></div>` : ''}
    </div>`;
  dugum.setAttribute('aria-label', `${tarih} ${hm}`);
}

/** Sayfadaki [data-uy-saat] yerine kalıcı saat düğümünü takar (ekran yenilense de baştan çizilmez) */
export async function saatKontrol() {
  const yer = document.querySelector('[data-uy-saat]');
  if (!yer) { clearInterval(zaman); zaman = null; return; }
  if (!dugum) { dugum = document.createElement('div'); dugum.className = 'uy-saat'; dugum.setAttribute('role', 'img'); try { await document.fonts.ready; } catch (_) { /* yok */ } }
  ciz();
  if (yer.firstChild !== dugum) yer.replaceChildren(dugum);
  if (!zaman) zaman = setInterval(() => { if (document.querySelector('[data-uy-saat]')) ciz(); else { clearInterval(zaman); zaman = null; } }, 1000);
}
