// DartX açılışı — demirkara.com'un "yıldız küresi → logo" açılışı (web/src/components/giris/YildizLogo.tsx + Giris.tsx)
// birebir uyarlaması: ortada bir atom parlar, patlayarak dönen küre açılır, küredeki yıldızların bir kısmı
// dart işaretleri / simgeleri / yazıları; sonra yıldızlar akıp DartX logosunun noktalarına dizilir, gerçek logo netleşir.
// Logo netleşince sitedeki gibi "Kaydır ya da dokun" yazar ve bekler; kaydırınca / dokununca logo küçülüp
// yıldızlar dağılır, uygulama arkadan açılır.
import { patlamaSesi, donmeSesi, logoSesi, dartUcusSesi, dartVurusSesi } from './acilis-ses.js';
import { t } from './i18n.js';

// Dart simgeleri: 24×24 çizgi çizimleri (lucide target / crosshair / trophy / medal / award + dart, tahta, çetele)
const IKONLAR = [
  'M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M6 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', // hedef (lucide target)
  'M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M22 12h-4 M6 12H2 M12 6V2 M12 22v-4', // nişangâh (lucide crosshair)
  'M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978 M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978 M18 9h1.5a1 1 0 0 0 0-5H18 M4 22h16 M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z M6 9H4.5a1 1 0 0 1 0-5H6', // kupa (lucide trophy)
  'M11 12 5.12 2.2 M13 12l5.88-9.8 M8 7h8 M7 17a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M12 18v-2h-.5', // madalya (lucide medal)
  'M6 8a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M15.477 12.89 17 22l-5-3-5 3 1.523-9.11', // rozet (lucide award)
  'M2.5 21.5 L9 15 M9 15 L12.5 11.5 M12.5 11.5 L15 9 M15 9 L21 3 M15 9 l-1.2 -4.2 l3.2 1 M15 9 l4.2 1.2 l-1 -3.2', // dart
  'M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0 M12 2v20 M2 12h20 M4.9 4.9l14.2 14.2 M19.1 4.9 4.9 19.1 M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', // dart tahtası
  'M5 4v16 M9 4v16 M13 4v16 M17 4v16 M3 18 L19 6', // çetele (tebeşir)
  'M4 4h16v16H4z M4 9h16 M12 9v11 M7 13h2 M15 13h2 M7 16h2 M15 16h2', // skor tahtası
  'M12 3 L14.5 9.2 L21 9.5 L16 13.6 L17.8 20 L12 16.3 L6.2 20 L8 13.6 L3 9.5 L9.5 9.2 Z', // yıldız (180!)
];

// Dart dili: skorlar, bitirişler, terimler, oyun adları — ISARETLER (sitedeki gibi oyun adları iki kez, daha sık görünsün)
const OYUNLAR = ['501', '301', 'Cricket', 'Kriket', 'Türk Kriketi', 'Minnesota', 'Killer', 'Shanghai', 'Halve-It', 'Baseball', 'Count-Up', 'Gotcha', "Bob's 27", 'Full Board', 'Cut-Throat', 'Tactics', 'Mickey Mouse', 'Around the Clock'];
const ISARETLER = [
  '180', '180!', 'ONE HUNDRED AND EIGHTY', '171', '177', '140', '100', '60', '45', '26',
  'T20', 'T19', 'T18', 'T17', 'D20', 'D16', 'D8', 'D1', 'Bull', 'Bullseye', '25', '50', 'Double Bull',
  '170', '167', '164', '161', '160', '121', '81', '40', '32', '36', 'T20 T20 Bull', 'T20 T19 D12',
  'Game shot', 'Double out', 'Double in', 'Master out', 'Checkout', '9-darter', 'Ton', 'Ton-80', 'High score', 'Bust',
  'Leg', 'Set', 'Match', 'MPR', '3-dart avg', 'Oche', '2.37 m', '1.73 m', 'Flight', 'Shaft', 'Barrel', 'Tungsten 90%',
  'House', 'D T B H', '20–10', '3 in a bed', 'Robin Hood', 'Bed', 'Treble',
  ...OYUNLAR, ...OYUNLAR,
];
const MARKA = ['DartX', 'DartX 1.0', 'Demir Kara'];

const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const kenet = x => Math.min(1, Math.max(0, x));
// Zaman çizgisi (saniye) — sitedeki ile aynı
const ZAMAN = { acilis: 1.2, kureSon: 1.9, akisSon: 3.6, logoGel: 3.3 };
const ATOM = 0.45;

const LOGO = { src: 'img/logo-dartx.webp', noktalar: 'img/logo-dartx-noktalar.json', olcek: 0.9 };
// Uçan dart (Demir 09.11): vuruş anı (sn), uçuş süresi, logodaki dartın ucu ve açısı (logo görseli 1000×370)
const DART = { vurus: 3.5, ucus: 0.42, uc: [86, 194], aci: 43.8 };
// Uçan dart (Demir 09.11: "saplanan okla logodaki ok aynı değil"): logodaki dartın kendisi görselden kesildi
// (img/acilis-dart.webp = logo görselinin 70,40 – 232,206 kırpığı); uç bu kırpıkta 15,152.5'te. Saplanınca piksel piksel aynı.
const DART_IMG = { src: 'img/acilis-dart.webp', x0: 70, y0: 40, w: 162, h: 166 };

export function acilisGoster(acik = true) {
  // Sistemde "hareketi azalt" açıksa atlanır (sitedeki gibi); ?acilis=1 ile yine de gösterilir (önizleme / deneme)
  // Ayarlar > Açılış efekti kapalıysa atlanır (Demir 08.11: sistemin "hareketi azalt" ayarı artık atlatmaz); ?acilis=1 her zaman gösterir
  const zorla = new URLSearchParams(location.search).get('acilis') === '1';
  if (!zorla && !acik) return;
  const kat = document.createElement('div');
  kat.className = 'acilis';
  kat.innerHTML = `<div class="acilis-zemin"></div><canvas class="acilis-tuval" aria-hidden="true"></canvas>
    <img class="acilis-logo" src="${LOGO.src}" alt="DartX"><p class="acilis-ipucu">${t('Kaydır ya da dokun')}</p>`;
  document.body.appendChild(kat);
  const canvas = kat.querySelector('canvas'), logoImg = kat.querySelector('.acilis-logo');
  const ctx = canvas.getContext('2d');
  const A = { t0: performance.now(), cikis: null };
  let raf = 0, bitti = false, oran = 2.712;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const boyut = () => { canvas.width = Math.max(1, innerWidth * DPR); canvas.height = Math.max(1, innerHeight * DPR); logoBoy(); };
  // Demir 08.11: tablette logo %50 küçük (telefonda 0.9, tablette 0.45)
  // Demir 08.11: telefonda %20 küçük (0.72), tablette %50 küçük (0.45)
  const olcek = () => (innerWidth >= 720 ? 0.45 : 0.72);
  const logoH = () => Math.min((canvas.width * 0.72) / oran, canvas.height * 0.44) * olcek(); // piksel (tuval)
  const logoBoy = () => { logoImg.style.height = `${logoH() / DPR}px`; };

  // ── Dart atışı: logodaki dartın ucu (logo görselinde 86,194 / 1000×370), gövdesi sağ üste 43.8° ──
  function dartAt() {
    if (A.cikis !== null || bitti) return;
    const r = logoImg.getBoundingClientRect(); if (!r.width) return;
    const s = r.width / 1000, ux = r.left + DART.uc[0] * s, uy = r.top + DART.uc[1] * s;
    const uz = Math.max(innerWidth, innerHeight) * 0.85; // geldiği uzaklık (gövde yönünde)
    const yx = Math.cos(DART.aci * Math.PI / 180), yy = -Math.sin(DART.aci * Math.PI / 180);
    const d = document.createElement('div');
    d.className = 'acilis-dart';
    d.style.left = ux + 'px'; d.style.top = uy + 'px';
    d.innerHTML = `<img class="ad-resim" src="${DART_IMG.src}" alt="" style="left:${(DART_IMG.x0 - DART.uc[0]) * s}px;top:${(DART_IMG.y0 - DART.uc[1]) * s}px;width:${DART_IMG.w * s}px;height:${DART_IMG.h * s}px">`;
    kat.appendChild(d);
    dartUcusSesi(DART.ucus);
    const uc = d.animate([
      { transform: `translate(${yx * uz}px, ${yy * uz}px) scale(2.4)`, opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
    ], { duration: DART.ucus * 1000, easing: 'cubic-bezier(.45,0,.9,.6)', fill: 'forwards' });
    uc.onfinish = () => {
      if (A.cikis !== null) return;
      dartVurusSesi();
      // saplanma: küçük geri tepme, halka dalgası, kıvılcım; logo sarsılır
      const tep = 6 * s * 10;
      d.animate([{ transform: 'translate(0px, 0px)' }, { transform: `translate(${yx * tep}px, ${yy * tep}px)` }, { transform: 'translate(0px, 0px)' }],
        { duration: 160, easing: 'ease-out' });
      const h = document.createElement('div');
      h.className = 'acilis-halka'; h.style.left = ux + 'px'; h.style.top = uy + 'px'; h.style.setProperty('--b', (r.height * 0.9) + 'px');
      h.innerHTML = '<i></i><i></i>' + Array.from({ length: 10 }, (_, i) => `<b style="--a:${i * 36 + Math.random() * 20}deg;--u:${(0.35 + Math.random() * 0.4) * r.height}px"></b>`).join('');
      kat.appendChild(h);
      logoImg.classList.add('sars');
      setTimeout(() => h.remove(), 1200);
      // logo tam netleşince uçan dart logodaki dartın içinde kaybolur
      setTimeout(() => d.classList.add('git'), 1300);
      setTimeout(() => d.remove(), 1800);
    };
  }

  new Image().src = DART_IMG.src; // uçan dart resmi önceden yüklensin
  const kapat = () => {
    if (A.cikis !== null) return;
    A.cikis = performance.now();
    kat.classList.add('cikis');
    // Kapatan dokunuş alttaki düğmeye / kutuya düşmesin: katman 0,8 sn daha dokunuşları tutar (görünmez olsa da),
    // bu sürede gelen tıklamalar ve odaklanmalar da yutulur; sonra geçirgen olur ve kaldırılır.
    setTimeout(() => kat.classList.add('gecirgen'), 800);
    // kapanışı başlatan dokunuş arkadaki düğmeye düşmesin (sitedeki gibi 0,8 sn yut)
    const yut = e => { e.preventDefault(); e.stopPropagation(); };
    const olaylar = ['click', 'mousedown', 'mouseup', 'touchend', 'pointerup', 'focusin', 'contextmenu'];
    olaylar.forEach(o => window.addEventListener(o, yut, true));
    setTimeout(() => olaylar.forEach(o => window.removeEventListener(o, yut, true)), 800);
    setTimeout(() => { bitti = true; cancelAnimationFrame(raf); removeEventListener('resize', boyut); kat.remove(); }, 1300);
  };
  // sitedeki gibi: dokunma, kaydırma (parmak / tekerlek) ya da Enter / boşluk / aşağı ok / Esc
  kat.addEventListener('pointerdown', kapat);
  kat.addEventListener('touchmove', kapat, { passive: true });
  kat.addEventListener('wheel', kapat, { passive: true });
  const tus = e => { if (['Enter', ' ', 'ArrowDown', 'Escape'].includes(e.key)) { removeEventListener('keydown', tus); kapat(); } };
  addEventListener('keydown', tus);

  fetch(LOGO.noktalar).then(r => r.json()).then(d => {
    oran = d.oran || oran;
    boyut(); addEventListener('resize', boyut);
    A.noktalar = d.n;
    baslat(); // Demir 09.11: intro beklemeden doğrudan açılır (dokunuş bekleyen sürüm geri alındı)
  }).catch(() => kat.remove());


  function baslat() {
    // ?an=1.6 → o saniyeden başla; &dur=1 → zamanı orada dondur (sitedeki gibi, yalnız kontrol görüntüsü için)
    const q = new URLSearchParams(location.search);
    const an = Number(q.get('an') || 0);
    A.t0 = performance.now() - an * 1000;
    if (q.get('dur') === '1') { A.donuk = an; if (an >= ZAMAN.logoGel) kat.classList.add('logo'); return kareBaslat(); }
    setTimeout(() => kat.classList.add('logo'), Math.max(0, ZAMAN.logoGel - an) * 1000);
    // Açılış efekt sesleri — demirkara.com Giris.tsx ile aynı anlar (Demir 09.11): atom patlar → küre döner (pırıltı) →
    // yıldızlar logoya akar (süpürme). Tarayıcı sesi açmadıysa sessizce atlanır.
    if (!an) {
      setTimeout(() => patlamaSesi(), 450);
      setTimeout(() => donmeSesi((ZAMAN.kureSon - ZAMAN.acilis) + 0.4), ZAMAN.acilis * 1000 - 300);
      setTimeout(() => logoSesi(), ZAMAN.kureSon * 1000);
    }
    // Demir 09.11: logo belirirken bir dart uçup logodaki bullseye'a saplanır
    const kalan = DART.vurus - an;
    if (kalan > DART.ucus) setTimeout(dartAt, (kalan - DART.ucus) * 1000);
    kareBaslat();
  }

  function kareBaslat() {
    const noktalar = A.noktalar;

    const mobil = innerWidth < 700;
    const N = mobil ? 800 : 1300;
    const P = [], base = [];
    for (let i = 0; i < N; i++) {
      const u = Math.random(), v = Math.random();
      const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
      base.push([Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph)]);
      P.push({ th, ph, r: 0.72 + Math.random() * 0.34, sp: 0.3 + Math.random() * 1.1, o: Math.random() * 6.283, sm: 0.16 + Math.random() * Math.random() * Math.random() * 1.9, gec: Math.random() * 0.45 });
    }
    const ciftler = [];
    for (let i = 0; i < N; i++) {
      let nb = -1, nd = 1e9;
      for (let j = i + 1; j < N; j++) {
        const dx = base[i][0] - base[j][0], dy = base[i][1] - base[j][1], dz = base[i][2] - base[j][2];
        const dd = dx * dx + dy * dy + dz * dz;
        if (dd < 0.028 && dd < nd) { nd = dd; nb = j; }
      }
      if (nb >= 0) ciftler.push([i, nb]);
    }
    const hedef = Array.from({ length: N }, (_, i) => noktalar[i % noktalar.length]);
    const px = new Float32Array(N), py = new Float32Array(N), pd = new Float32Array(N), akisF = new Float32Array(N);

    // yazıları ve simgeleri bir kez küçük tuvallere çiz (sitedeki gibi)
    const yaziSprite = (y, renk = '#f3f1ec', agirlik = 300, boy = 11) => {
      const fs = boy * DPR, c = document.createElement('canvas'), x = c.getContext('2d');
      const font = `${agirlik} ${fs}px ui-monospace, "SF Mono", Consolas, monospace`;
      x.font = font; c.width = Math.ceil(x.measureText(y).width) + 4; c.height = Math.ceil(fs * 1.4);
      x.font = font; x.fillStyle = renk; x.textBaseline = 'middle'; x.fillText(y, 2, c.height / 2);
      return c;
    };
    const sprite = ISARETLER.map(y => yaziSprite(y));
    const markaBas = sprite.length;
    MARKA.forEach(y => sprite.push(yaziSprite(y, '#e3b866', 600, 12)));
    const ikonBas = sprite.length;
    for (const d of IKONLAR) {
      const n = Math.ceil(22 * DPR), c = document.createElement('canvas'), x = c.getContext('2d');
      c.width = n; c.height = n; x.scale(n / 24, n / 24);
      x.strokeStyle = '#f3f1ec'; x.lineWidth = 1.25; x.lineCap = 'round'; x.lineJoin = 'round';
      x.stroke(new Path2D(d));
      sprite.push(c);
    }
    // yıldızların ~%10'u yazı, birkaçı marka (DartX), ~%4'ü dart simgesi
    const isaret = Array.from({ length: N }, () => (Math.random() < (mobil ? 0.1 : 0.09) ? Math.floor(Math.random() * ISARETLER.length) : -1));
    const adet = mobil ? 5 : 8;
    for (let k = 0; k < adet; k++) isaret[Math.floor((k + Math.random()) * (N / adet))] = markaBas + (k % MARKA.length);
    for (let i = 0; i < N; i++) if (isaret[i] === -1 && Math.random() < (mobil ? 0.045 : 0.04)) isaret[i] = ikonBas + Math.floor(Math.random() * IKONLAR.length);
    const kacis = Array.from({ length: N }, () => { const a = Math.random() * 6.283; const s = 0.6 + Math.random() * 1.4; return [Math.cos(a) * s, Math.sin(a) * s]; });

    const kare = () => {
      if (bitti) return;
      const now = performance.now();
      const t = A.donuk ?? (now - A.t0) / 1000;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const bas = ZAMAN.kureSon;
      const ac = kenet((t - ATOM) / (ZAMAN.acilis - ATOM));
      const acE = 1 - Math.pow(1 - ac, 4);
      const R = Math.min(W, H) * 0.62 * (0.004 + acE * 0.996);
      const lH = logoH();
      const rY = t * 0.26 + (1 - acE) * 2.4, rX = Math.sin(t * 0.17) * 0.4;
      const cyy = Math.cos(rY), syy = Math.sin(rY), cxx = Math.cos(rX), sxx = Math.sin(rX);
      let c = 0;
      if (A.cikis !== null) c = kenet((now - A.cikis) / 1000 / 1.3);
      const ce = c * c;

      for (let i = 0; i < N; i++) {
        const p = P[i], st = Math.sin(p.ph), rr = p.r * (1 + 0.07 * Math.sin(t * p.sp + p.o));
        const x = st * Math.cos(p.th) * rr, y = st * Math.sin(p.th) * rr, z = Math.cos(p.ph) * rr;
        const x1 = x * cyy + z * syy, z1 = -x * syy + z * cyy, y1 = y * cxx - z1 * sxx, z2 = y * sxx + z1 * cxx, pe = 1 / (1.7 - z2 * 0.6);
        const kx = cx + x1 * R * pe, ky = cy + y1 * R * pe, kd = (z2 + 1) / 2;
        const f = ease(kenet((t - bas - p.gec) / (ZAMAN.akisSon - ZAMAN.kureSon - 0.45)));
        const nefes = 1 + Math.sin(t * 1.3 + p.o) * 0.004;
        const lx = cx + hedef[i][0] * lH * nefes, ly = cy + hedef[i][1] * lH * nefes;
        let X = kx + (lx - kx) * f, Y = ky + (ly - ky) * f;
        const kav = Math.sin(f * Math.PI) * 0.18;
        X += -(ky - cy) * kav; Y += (kx - cx) * kav;
        X += kacis[i][0] * ce * Math.max(W, H) * 0.7;
        Y += kacis[i][1] * ce * Math.max(W, H) * 0.7;
        px[i] = X; py[i] = Y; pd[i] = kd + (0.85 - kd) * f; akisF[i] = f;
      }

      const akis = ease(kenet((t - bas) / (ZAMAN.akisSon - ZAMAN.kureSon)));
      const son = 1 - ce;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = DPR * 0.6; ctx.strokeStyle = '#c9ced6';
      const cizgiA = (1 - akis) * son * kenet((t - ZAMAN.acilis * 0.5) / (ZAMAN.acilis * 0.7));
      if (cizgiA > 0.01) {
        for (let k = 0; k < ciftler.length; k++) {
          const a = ciftler[k][0], b = ciftler[k][1], dep = (pd[a] + pd[b]) / 2;
          ctx.globalAlpha = (0.02 + dep * 0.09) * cizgiA;
          ctx.beginPath(); ctx.moveTo(px[a], py[a]); ctx.lineTo(px[b], py[b]); ctx.stroke();
        }
      }
      ctx.fillStyle = '#f3f1ec';
      const logodaSon = 1 - kenet((t - bas - (ZAMAN.logoGel - ZAMAN.kureSon)) / 1.2);
      for (let i = 0; i < N; i++) {
        const dep = pd[i];
        const alfa = (0.12 + dep * 0.72) * son * logodaSon;
        const si = isaret[i];
        if (si >= 0) {
          const g = 1 - akisF[i];
          if (g > 0.02) {
            const sp = sprite[si], k = (0.5 + dep * 0.6) * (0.4 + g * 0.6);
            ctx.globalAlpha = Math.min(1, alfa * 0.95) * g;
            ctx.drawImage(sp, px[i] - (sp.width * k) / 2, py[i] - (sp.height * k) / 2, sp.width * k, sp.height * k);
          }
          ctx.globalAlpha = alfa * (1 - g);
        } else ctx.globalAlpha = alfa;
        const r = (0.35 + dep * 1.5) * P[i].sm * DPR * 1.15 * (1 + akis * 0.35);
        ctx.beginPath(); ctx.arc(px[i], py[i], r, 0, 6.283); ctx.fill();
      }
      const atomA = kenet(t / 0.25) * (1 - kenet((t - ATOM) / 0.35)) * son;
      if (atomA > 0.01) {
        const nf = 1 + Math.sin(t * 14) * 0.18;
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 * DPR * nf);
        gr.addColorStop(0, 'rgba(255,255,255,1)');
        gr.addColorStop(0.25, 'rgba(243,241,236,.55)');
        gr.addColorStop(1, 'rgba(243,241,236,0)');
        ctx.globalAlpha = atomA; ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(cx, cy, 14 * DPR * nf, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (!(A.cikis !== null && c >= 1)) raf = requestAnimationFrame(kare);
    };
    raf = requestAnimationFrame(kare);
  }
}
