// Kenardan kaydırarak geri / ileri (Demir 10.11: "telefon ve tabletlerdeki gibi")
// Sol kenardan sağa çek → geri; sağ kenardan sola çek → ileri (geri dönülen ekrana).
// Sayfa parmakla birlikte kayar, kenarda altın ok belirir; eşiği geçince bırakınca gider, geçmezse yerine döner.

const KENAR = 28;      // kenardan başlama payı (px)
const ESIK = 0.28;     // ekran genişliğinin bu oranı kadar çekilince gider
const HIZ_ESIK = 0.6;  // ya da hızlı fırlatınca (px/ms)

/** o: { geriVar(): bool, ileriVar(): bool, geri(), ileri(), sayfa(): HTMLElement, engel(hedef): bool } */
export function kenarKaydirKur(o) {
  const ok = document.createElement('div');
  ok.className = 'kk-ok';
  ok.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  document.body.appendChild(ok);
  let d = null; // { yon: 1 geri | -1 ileri, x0, y0, t0, el, karar }

  addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0], W = innerWidth;
    const yon = t.clientX <= KENAR ? 1 : t.clientX >= W - KENAR ? -1 : 0;
    if (!yon || (yon === 1 ? !o.geriVar() : !o.ileriVar()) || o.engel(e.target)) return;
    d = { yon, x0: t.clientX, y0: t.clientY, t0: performance.now(), el: o.sayfa(), karar: null, dx: 0 };
  }, { passive: true });

  addEventListener('touchmove', e => {
    if (!d) return;
    const t = e.touches[0], dx = (t.clientX - d.x0) * d.yon, dy = t.clientY - d.y0;
    if (d.karar === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      d.karar = dx > Math.abs(dy) * 1.2; // yatay mı? değilse sayfa normal kaysın
      if (!d.karar) { d = null; return; }
      if (d.el) d.el.style.transition = 'none';
      ok.classList.toggle('sag', d.yon === -1); ok.classList.add('gor');
    }
    e.preventDefault();
    d.dx = Math.max(0, dx);
    const W = innerWidth, oran = Math.min(1, d.dx / (W * ESIK));
    if (d.el) { d.el.style.transform = `translateX(${d.yon * d.dx}px)`; d.el.style.boxShadow = `${-d.yon * 12}px 0 30px rgb(0 0 0 / ${(.45 * (1 - d.dx / W)).toFixed(2)})`; } // iPhone gibi: sayfa parmağa yapışık, kenarında gölge
    ok.style.setProperty('--o', oran.toFixed(3));
    ok.classList.toggle('hazir', oran >= 1);
  }, { passive: false });

  const bitir = () => {
    if (!d) return;
    const { el, yon, dx, t0, karar } = d; d = null;
    ok.classList.remove('gor', 'hazir');
    if (!karar) return;
    const hiz = dx / Math.max(1, performance.now() - t0);
    const git = dx >= innerWidth * ESIK || (hiz > HIZ_ESIK && dx > 40);
    if (el) {
      el.style.transition = 'transform .25s cubic-bezier(.2,.8,.3,1), box-shadow .25s';
      el.style.transform = git ? `translateX(${yon * innerWidth}px)` : '';
      el.style.boxShadow = '';
    }
    if (git) setTimeout(() => {
      if (yon === 1) o.geri(); else o.ileri();
      // ekran değişmediyse (gidecek yer yoksa) sayfa yerine döner
      setTimeout(() => { if (el && el.isConnected) { el.style.transition = ''; el.style.transform = ''; el.style.boxShadow = ''; } }, 60);
    }, 180);
    else if (el) setTimeout(() => { el.style.transition = ''; }, 240);
  };
  addEventListener('touchend', bitir);
  addEventListener('touchcancel', bitir);
}
