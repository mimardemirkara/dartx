// Kayan listelerde "devamı var" işareti (Demir 09.11): kaydırma çubukları gizli olduğu için listenin devamı belli olmuyordu.
// A · gizli satır olan kenar yumuşakça silikleşir   B · o yönde küçük altın ok; dokununca kaydırır, sona gelince kaybolur.
const SEC = '.gl-liste, .os-liste, .dx-acilir .ac-liste, .kural-metin, .spot-sonuc, .telif-yasa-ic';
const OK_ALT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const OK_UST = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
const oklar = new WeakMap();

function okYap(el, yon) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'kd-ok kd-' + yon; b.innerHTML = yon === 'alt' ? OK_ALT : OK_UST;
  b.setAttribute('aria-label', yon === 'alt' ? 'Aşağı kaydır' : 'Yukarı kaydır');
  b.addEventListener('click', e => { e.stopPropagation(); el.scrollBy({ top: (yon === 'alt' ? 1 : -1) * el.clientHeight * 0.7, behavior: 'smooth' }); });
  return b;
}

function guncelle(el) {
  const ana = el.parentElement; if (!ana) return;
  const tasiyor = el.scrollHeight > el.clientHeight + 4;
  const ust = tasiyor && el.scrollTop > 4;
  const alt = tasiyor && el.scrollTop + el.clientHeight < el.scrollHeight - 4;
  el.classList.toggle('kd-ust', ust);
  el.classList.toggle('kd-alt', alt);
  let o = oklar.get(el);
  if (!tasiyor) { if (o) { o.ust.hidden = o.alt.hidden = true; } return; }
  if (!o || !o.ust.isConnected) {
    if (getComputedStyle(ana).position === 'static') ana.style.position = 'relative';
    o = { ust: okYap(el, 'ust'), alt: okYap(el, 'alt') };
    ana.append(o.ust, o.alt); oklar.set(el, o);
  }
  // oklar listenin üst ve alt kenarının ortasına oturur (liste kaymaz, oklar yerinde kalır)
  const x = el.offsetLeft + el.offsetWidth / 2;
  o.ust.style.left = o.alt.style.left = x + 'px';
  o.ust.style.top = (el.offsetTop + 4) + 'px';
  o.alt.style.top = (el.offsetTop + el.offsetHeight - 26) + 'px';
  o.ust.hidden = !ust; o.alt.hidden = !alt;
}

function tara() { document.querySelectorAll(SEC).forEach(guncelle); }
let bekleyen = 0;
const sonra = () => { if (bekleyen) return; bekleyen = requestAnimationFrame(() => { bekleyen = 0; tara(); }); };
addEventListener('scroll', e => { const el = e.target; if (el && el.matches && el.matches(SEC)) guncelle(el); }, true);
addEventListener('resize', sonra);
new MutationObserver(sonra).observe(document.body, { childList: true, subtree: true });
