// DartX — oyunların ortak yardımcıları
import { esc, adAvatar } from '../util.js';
import { t as tr } from '../i18n.js';

/** Skor kartları (X01 görünümüyle aynı cam kartlar). fn(i) → {big, sub[], tag, out} */
export function cards(m, ctx, fn) {
  return `<div class="board x01 n${m.sides.length}">` + m.sides.map((_, i) => {
    const c = fn(i);
    return `<div class="side ${ctx.active(i) ? 'active' : ''} ${c.out ? 'out' : ''}" style="--pc:${ctx.color(i)}">
      <div class="side-name">${adAvatar(ctx.name(i))}${esc(ctx.name(i))}${ctx.legInfo(i)}</div>${ctx.uyeler ? ctx.uyeler(i) : ''}
      <div class="side-big">${c.big}</div>
      ${c.sub && c.sub.length ? `<div class="side-sub">${c.sub.map(s => `<span>${s}</span>`).join('')}</div>` : ''}
      ${c.tag ? `<div class="side-tag">${c.tag}</div>` : ''}
    </div>`;
  }).join('') + '</div>';
}

/** En iyi taraf; eşitlikte -1 (berabere). high=false → en düşük kazanır */
export function best(vals, high = true, alive = null) {
  let bi = -1, bv = null, tie = false;
  vals.forEach((v, i) => {
    if (alive && !alive[i]) return;
    if (bv === null || (high ? v > bv : v < bv)) { bv = v; bi = i; tie = false; }
    else if (v === bv) tie = true;
  });
  return tie ? -1 : bi;
}

/** Tur sınırı dolduysa kazanan; değilse undefined */
export function roundLimit(m, lastOfRound, limit, vals, high = true) {
  if (lastOfRound && m.round >= limit) return { legWinner: best(vals, high) };
}

export const label = t =>
  t === 'D' ? tr('Herhangi double') : t === 'T' ? tr('Herhangi triple') : t === 'B' ? 'Bull (25 / 50)' : t === 25 ? 'Bull' : String(t);

export const dlab = (n, mult) => (n === 25 ? (mult === 2 ? 'Bull' : '25') : (mult === 3 ? 'T' : mult === 2 ? 'D' : '') + n);

export const playerTurns = (m, pid) => m.log.filter(x => x.pid === pid);
export const sumRec = (t, k) => t.reduce((a, x) => a + (x[k] || 0), 0);
export const dartsOf = t => t.reduce((a, x) => a + (x.nd ?? x.darts.length), 0);

/** Tur sayısı seçeneği */
export const roundsOpt = (vals, def, label = 'Tur') => ({ key: 'rounds', label, type: 'choice', values: vals.map(v => [v, String(v)]), def });
