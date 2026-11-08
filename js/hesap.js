// DartX — hesap makinesi (Demir 08.11): demirkara.com ArchX hesap makinesinin (web/src/components/archx/Calculator.tsx)
// sade hâli — döviz, bilimsel ve yakıt bölümleri yok. Ekran: üstte canlı işlem dizisi, altında büyük sayı;
// tuşlar: C ⌫ % ÷ / 7 8 9 × / 4 5 6 − / 1 2 3 + / ± 0 , =.
// Ekranın sol / sağ kenarındaki nefes alan ışıktan (demirkara.com ana ekranındaki .ev-ipucu) ya da kenardan
// içeri kaydırınca yandan açılır. Maç sırasında solda A tarafının (ilk oyuncu / Takım A), sağda B tarafının
// ayrı hesap makinesi; maç bitince ya da iptal edilince ikisi de silinir.
import { t } from './i18n.js';
import { esc } from './util.js';

const L = (d, b = 18) => `<svg width="${b}" height="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
// lucide (demirkara.com ile aynı set)
const IC = {
  sil: L('<path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="m12 9 6 6"/><path d="m18 9-6 6"/>', 19),
  yuzde: L('<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'),
  bol: L('<circle cx="12" cy="6" r="1"/><line x1="5" x2="19" y1="12" y2="12"/><circle cx="12" cy="18" r="1"/>'),
  carp: L('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  eksi: L('<path d="M5 12h14"/>'),
  arti: L('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  esit: L('<line x1="5" x2="19" y1="9" y2="9"/><line x1="5" x2="19" y1="15" y2="15"/>'),
  kapat: L('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 20),
  hesap: L('<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>', 18),
  sag: L('<path d="m9 18 6-6-6-6"/>', 15),
  sol: L('<path d="m15 18-6-6 6-6"/>', 15),
};

// ---- hesap mantığı (sitedeki reducer'ın sade kısmı)
const BOS = () => ({ cur: '0', acc: null, op: null, fresh: true, chain: '', done: false });
const fmt = n => (!isFinite(n) || Number.isNaN(n) ? 'Hata' : Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0) ? n.toExponential(6) : String(Math.round(n * 1e10) / 1e10));
const opSym = o => (o === '*' ? '×' : o === '/' ? '÷' : o === '-' ? '−' : o);
const hesapla = (a, b, o) => (o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? (b === 0 ? NaN : a / b) : b);
/** Ekran biçimi: binlik nokta, ondalık virgül (sitedeki trShow) */
const goster = s => {
  if (s === 'Hata') return t('Hata');
  const neg = s.startsWith('-'), ham = neg ? s.slice(1) : s;
  const [tam, ond] = ham.split('.');
  return (neg ? '-' : '') + tam.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (ond !== undefined ? ',' + ond : '');
};
function isle(s, a) {
  switch (a.t) {
    case 'rakam': {
      const b = s.done ? { ...s, chain: '', done: false } : s;
      if (a.d === ',') { if (b.fresh) return { ...b, cur: '0.', fresh: false }; return b.cur.includes('.') ? b : { ...b, cur: b.cur + '.' }; }
      if (b.fresh) return { ...b, cur: a.d, fresh: false };
      if (b.cur === '0') return { ...b, cur: a.d };
      if (b.cur.replace(/[-.]/g, '').length >= 14) return b;
      return { ...b, cur: b.cur + a.d };
    }
    case 'op': {
      const v = parseFloat(s.cur);
      if (s.fresh && s.op && s.acc !== null && !s.done) return { ...s, op: a.o, chain: s.chain.replace(/\S+\s*$/, opSym(a.o) + ' ') };
      if (s.acc !== null && s.op && !s.fresh) {
        const r = hesapla(s.acc, v, s.op);
        return { ...s, cur: fmt(r), acc: r, op: a.o, fresh: true, done: false, chain: s.chain + goster(s.cur) + ' ' + opSym(a.o) + ' ' };
      }
      return { ...s, acc: v, op: a.o, fresh: true, done: false, chain: (s.done ? '' : s.chain) + goster(s.cur) + ' ' + opSym(a.o) + ' ' };
    }
    case 'esit': {
      if (s.acc === null || !s.op) return s;
      const r = hesapla(s.acc, parseFloat(s.cur), s.op);
      return { ...s, cur: fmt(r), acc: null, op: null, fresh: true, done: true, chain: `${s.chain}${goster(s.cur)} =` };
    }
    case 'temizle': return BOS();
    case 'geri':
      if (s.fresh || s.cur.length <= 1 || (s.cur.length === 2 && s.cur.startsWith('-'))) return { ...s, cur: '0' };
      return { ...s, cur: s.cur.slice(0, -1) };
    case 'yuzde': {
      const v = parseFloat(s.cur);
      return { ...s, cur: fmt(s.acc !== null && (s.op === '+' || s.op === '-') ? (s.acc * v) / 100 : v / 100), fresh: true };
    }
    case 'isaret': return { ...s, cur: s.cur.startsWith('-') ? s.cur.slice(1) : s.cur === '0' ? s.cur : '-' + s.cur };
  }
  return s;
}

// ---- panel
let ctx = null;        // app.js'ten: { baglam(): {mac, adlar:[sol, sag], renkler}, oku(taraf), yaz(taraf, durum), titret() }
let acik = null;       // açık makinenin sahibi: 'sol' | 'sag' (1. / 2. taraf) | 'k2', 'k3'… (3. taraftan sonrası) | null
let kenar = null;      // panelin geldiği kenar: 'sol' | 'sag'
let panel = null, perde = null;

const TUSLAR = [
  ['temizle', 'C', 'kirmizi'], ['geri', IC.sil], ['yuzde', IC.yuzde, 'islem'], ['op/', IC.bol, 'islem'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['op*', IC.carp, 'islem'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['op-', IC.eksi, 'islem'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['op+', IC.arti, 'islem'],
  ['isaret', '±'], ['0', '0'], [',', ','], ['esit', IC.esit, 'esit'],
];

function durum(taraf) { return ctx.oku(taraf) || BOS(); }

function ciz() {
  if (!panel) return;
  const s = durum(acik);
  panel.querySelector('.hm-dizi').textContent = (s.chain + (s.fresh ? '' : goster(s.cur))).trim() || ' ';
  const ekran = panel.querySelector('.hm-sayi');
  ekran.textContent = goster(s.cur);
  ekran.style.fontSize = ekran.textContent.length > 12 ? '30px' : ekran.textContent.length > 9 ? '38px' : '';
  const d = panel.querySelector('.hm-dizi'); d.scrollLeft = d.scrollWidth;
}

function bas(k) {
  const s = durum(acik);
  let a;
  if (/^[0-9]$/.test(k) || k === ',') a = { t: 'rakam', d: k };
  else if (k.startsWith('op')) a = { t: 'op', o: k.slice(2) };
  else a = { t: k };
  ctx.yaz(acik, isle(s, a));
  ctx.titret && ctx.titret();
  ciz();
}

// Taraf sırası ↔ hesap anahtarı: 1. taraf 'sol', 2. taraf 'sag' (eski kayıtlar bozulmasın), sonrası 'k2', 'k3'…
const anahtar = i => (i === 0 ? 'sol' : i === 1 ? 'sag' : 'k' + i);
const sira = k => (k === 'sol' ? 0 : k === 'sag' ? 1 : +String(k).slice(1));

/** Kenardan açılış (Demir 09.11): iki taraflı maçta sol kenar 1. tarafın, sağ kenar 2. tarafın makinesi.
 *  3 ve daha çok tarafta (4 kişilik oyunlar) hangi kenardan açılırsa açılsın sırası gelen oyuncunun makinesi
 *  gelir; üstteki oyuncu düğmeleriyle başkasınınkine geçilir. Ana ekranda tek, genel makine. */
export function hesapAc(yon, kim) {
  if (!ctx) return;
  const b = ctx.baglam();
  if (kim === undefined) kim = b.mac && b.n > 2 ? anahtar(b.cur) : yon;
  if (acik === kim && kenar === yon) return;
  if (acik) hesapKapat(true);
  acik = kim; kenar = yon;
  const i = sira(kim);
  const ad = b.mac ? b.adlar[i] || t('Hesap Makinesi') : t('Hesap Makinesi');
  const renk = b.mac ? b.renkler[i] || '' : '';
  const secici = b.mac && b.n > 2
    ? `<div class="hm-kimler" role="tablist">${b.adlar.map((a, j) => `<button type="button" role="tab" class="hm-kim ${j === i ? 'secili' : ''} ${j === b.cur ? 'sirada' : ''}" style="--pc:${b.renkler[j]}" data-kim="${anahtar(j)}" aria-selected="${j === i}">${esc(a)}</button>`).join('')}</div>`
    : '';
  perde = document.createElement('div');
  perde.className = 'hm-perde';
  perde.addEventListener('click', () => hesapKapat());
  panel = document.createElement('aside');
  panel.className = `hm-panel hm-${yon}`;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', ad);
  if (renk) panel.style.setProperty('--pc', renk);
  panel.innerHTML = `<header class="hm-ust">
      <span class="hm-ikon ${renk ? 'renkli' : ''}">${IC.hesap}</span><b>${esc(ad)}</b>
      <button type="button" class="hm-kapat" aria-label="${t('Kapat')}">${IC.kapat}</button></header>${secici}
    <div class="hm-ekran"><div class="hm-dizi"></div><div class="hm-sayi">0</div></div>
    <div class="hm-tuslar">${TUSLAR.map(([k, y, c = '']) => `<button type="button" class="hm-tus ${c}" data-k="${k}">${y}</button>`).join('')}</div>`;
  panel.querySelector('.hm-kapat').addEventListener('click', () => hesapKapat());
  panel.querySelectorAll('.hm-tus').forEach(b2 => b2.addEventListener('click', () => bas(b2.dataset.k)));
  panel.querySelectorAll('.hm-kim').forEach(b2 => b2.addEventListener('click', () => hesapSec(b2.dataset.kim)));
  kaydirKapat(panel, yon);
  document.body.append(perde, panel);
  ciz();
}

/** Açık paneli kapatmadan başka oyuncunun makinesine geçir (başlık, renk, ekran) */
function hesapSec(kim) {
  if (!panel || kim === acik) return;
  const b = ctx.baglam(), i = sira(kim);
  acik = kim;
  const ad = b.adlar[i] || t('Hesap Makinesi');
  panel.style.setProperty('--pc', b.renkler[i] || '');
  panel.setAttribute('aria-label', ad);
  panel.querySelector('.hm-ust b').textContent = ad;
  panel.querySelectorAll('.hm-kim').forEach(x => { const s2 = x.dataset.kim === kim; x.classList.toggle('secili', s2); x.setAttribute('aria-selected', s2); });
  ctx.titret && ctx.titret();
  ciz();
}

export function hesapKapat(hemen = false) {
  if (!panel) { acik = null; return; }
  const p = panel, pr = perde;
  panel = null; perde = null; acik = null; kenar = null;
  if (hemen) { p.remove(); pr.remove(); return; }
  p.classList.add('kapan'); pr.classList.add('kapan');
  setTimeout(() => { p.remove(); pr.remove(); }, 330); // CSS kapanışı .32 sn (açılışla aynı)
}

export const hesapAcikMi = () => !!acik;

// Panel açıkken kenara doğru kaydırınca kapanır
function kaydirKapat(el, taraf) {
  let x0 = null, y0 = 0;
  el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && (taraf === 'sol' ? dx < 0 : dx > 0)) hesapKapat();
  });
}

/** Kenardaki nefes alan ışık tutamakları (demirkara.com .ev-ipucu) — ana ekranda ve oyunda gösterilir */
export function kenarlar(baglam) {
  const cok = baglam && baglam.mac && baglam.n > 2;
  const ad = (i) => (baglam && baglam.mac ? baglam.adlar[cok ? baglam.cur : i] : t('Hesap Makinesi')) || t('Hesap Makinesi');
  return `<button type="button" class="ev-ipucu" data-yon="sol" data-hm="sol" aria-label="${esc(ad(0))}">${IC.sol}</button>
    <button type="button" class="ev-ipucu" data-yon="sag" data-hm="sag" aria-label="${esc(ad(1))}">${IC.sag}</button>`;
}

/** Bir kez kur: kenar tutamağına dokununca ya da kenardan içeri kaydırınca açılır; klavye */
export function hesapKur(c) {
  ctx = c;
  document.addEventListener('click', e => {
    const k = e.target.closest('[data-hm]');
    if (k) { e.preventDefault(); e.stopPropagation(); hesapAc(k.dataset.hm); }
  }, true);
  // kenardan içeri kaydırma (soldan sağa → sol hesap, sağdan sola → sağ hesap); kenar şeridi 28 px
  let bas0 = null;
  document.addEventListener('touchstart', e => {
    if (acik || !ctx.izinli()) { bas0 = null; return; }
    const x = e.touches[0].clientX, w = innerWidth;
    bas0 = x < 28 ? { taraf: 'sol', x, y: e.touches[0].clientY } : x > w - 28 ? { taraf: 'sag', x, y: e.touches[0].clientY } : null;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!bas0) return;
    const dx = e.changedTouches[0].clientX - bas0.x, dy = e.changedTouches[0].clientY - bas0.y;
    const b = bas0; bas0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && (b.taraf === 'sol' ? dx > 0 : dx < 0)) hesapAc(b.taraf);
  });
  document.addEventListener('keydown', e => {
    if (!acik) return;
    const m = { Enter: 'esit', '=': 'esit', Escape: null, Backspace: 'geri', Delete: 'temizle', '%': 'yuzde', '+': 'op+', '-': 'op-', '*': 'op*', x: 'op*', '/': 'op/', ',': ',', '.': ',' };
    if (e.key === 'Escape') { hesapKapat(); return; }
    const k = /^[0-9]$/.test(e.key) ? e.key : m[e.key];
    if (k) { e.preventDefault(); bas(k); }
  });
}
