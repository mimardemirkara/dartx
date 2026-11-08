// X01: 301 / 501 / 701
import { dartValue, dartLabel, esc, adAvatar } from '../util.js';
import { checkout } from '../checkout.js';
import { t as tr } from '../i18n.js';

const finishOk = (d, out) => (out === 'single' ? true : out === 'master' ? d.m >= 2 : d.m === 2);
const oneDartFinish = (s, out) =>
  out === 'single' ? (s <= 20 || s === 25 || s === 50 || (s <= 40 && s % 2 === 0) || (s <= 60 && s % 3 === 0))
    : out === 'master' ? ((s <= 40 && s % 2 === 0) || s === 50 || (s <= 60 && s % 3 === 0))
      : (s <= 40 && s % 2 === 0) || s === 50;

export const IMPOSSIBLE = new Set([179, 178, 176, 175, 173, 172, 169, 166, 163]);

export default {
  id: 'x01',
  name: 'X01',
  cat: 'main',
  short: '301 / 501 / 701 — geriye say, tam sıfırla bitir',
  rules: `Herkes seçilen puandan (501 vb.) başlar ve her turda 3 ok atar. Vurduğun puan kalan puandan düşülür.
<b>Double Out:</b> Son ok bir double (veya Bull) olmalı. <b>Master Out:</b> double veya triple.
<b>Double In:</b> Puan saymaya başlamak için önce bir double vurmalısın.
<b>Bust:</b> 0'ın altına iner, 1'de kalır (double/master out'ta) ya da yanlış okla 0'a inersen tur geçersiz olur, puan tur başındaki haline döner.`,
  min: 1, max: 8, teams: true, legs: true, totalInput: true,
  options: [
    { key: 'start', label: 'Başlangıç', type: 'choice', values: [[301, '301'], [501, '501'], [701, '701']], def: 501 },
    { key: 'out', label: 'Bitiriş', type: 'choice', values: [['double', 'Double Out'], ['master', 'Master Out'], ['single', 'Single Out']], def: 'double' },
    { key: 'in', label: 'Başlama', type: 'choice', values: [['single', 'Serbest'], ['double', 'Double In']], def: 'single' },
  ],

  init(m) {
    return { s: m.sides.map(() => ({ score: m.opts.start, open: m.opts.in !== 'double' })), turnStart: 0, openStart: true };
  },

  startTurn(m, g) {
    const s = g.s[m.cur];
    g.turnStart = s.score;
    g.openStart = s.open;
  },

  dart(m, g, d, rec) {
    const s = g.s[m.cur];
    const out = m.opts.out;
    rec.points = rec.points || 0;
    if (s.open && oneDartFinish(s.score, out)) rec.att = (rec.att || 0) + 1;
    if (!s.open) {
      if (d.m === 2 && d.n !== 0) { s.open = true; rec.opened = true; }
      else return;
    }
    const v = dartValue(d);
    const ns = s.score - v;
    const bust = ns < 0 || (out !== 'single' && ns === 1) || (ns === 0 && !finishOk(d, out));
    if (bust) {
      s.score = g.turnStart;
      s.open = g.openStart;
      rec.bust = true;
      rec.points = 0;
      m.msg = 'BUST!';
      return { endTurn: true, bust: true };
    }
    s.score = ns;
    rec.points += v;
    if (ns === 0) {
      rec.checkout = g.turnStart;
      return { legWinner: m.cur };
    }
  },

  // Tur toplamı girişi
  total(m, g, total, rec, checkoutDarts) {
    const s = g.s[m.cur];
    const out = m.opts.out;
    rec.nd = 3;
    if (!s.open) { if (total > 0) s.open = true; else { rec.points = 0; return; } }
    const ns = s.score - total;
    const bust = ns < 0 || (out !== 'single' && ns === 1) || (ns === 0 && !checkout(s.score, 3, out));
    if (bust) {
      rec.bust = true; rec.points = 0; m.msg = 'BUST!';
      return { bust: true };
    }
    s.score = ns;
    rec.points = total;
    if (ns === 0) {
      rec.checkout = g.turnStart;
      rec.nd = checkoutDarts || 3;
      return { legWinner: m.cur };
    }
  },

  canCheckout(m, g) {
    const s = g.s[m.cur];
    return !!checkout(s.score, 3, m.opts.out);
  },

  hint(m, g) {
    const s = g.s[m.cur];
    if (!s.open) return tr('Başlamak için double vur');
    const left = 3 - m.turnDarts.length;
    const route = checkout(s.score, left, m.opts.out);
    if (route) return tr('Bitiriş: {0}', route.map(dartLabel).join('  '));
    if (s.score <= 170 && !checkout(s.score, 3, m.opts.out)) return tr('Bu puan 3 okta bitmez');
    return '';
  },

  highlight(m, g) {
    const s = g.s[m.cur];
    const route = checkout(s.score, 3 - m.turnDarts.length, m.opts.out);
    return route ? [route[0]] : [];
  },

  view(m, g, ctx) {
    return `<div class="board x01 n${m.sides.length}">` + m.sides.map((side, i) => {
      const s = g.s[i];
      const turns = m.log.filter(t => t.side === i && t.leg === m.legNo);
      const pts = turns.reduce((a, t) => a + (t.points || 0), 0);
      const nd = turns.reduce((a, t) => a + (t.nd ?? t.darts.length), 0);
      const avg = nd ? ((pts / nd) * 3).toFixed(1) : '–';
      const last = turns.length ? turns[turns.length - 1] : null;
      const lastTxt = last ? (last.bust ? 'Bust' : last.points) : '–';
      return `<div class="side ${ctx.active(i) ? 'active' : ''}" style="--pc:${ctx.color(i)}">
        <div class="side-name">${adAvatar(ctx.name(i))}${esc(ctx.name(i))}${ctx.legInfo(i)}</div>${ctx.uyeler ? ctx.uyeler(i) : ''}
        <div class="side-big">${s.score}</div>
        <div class="side-sub"><span>${tr('Ort {0}', avg)}</span><span>${tr('Son {0}', lastTxt)}</span><span>${tr('{0} ok', nd)}</span></div>
        ${!s.open ? `<div class="side-tag">${tr('Double In bekliyor')}</div>` : ''}
      </div>`;
    }).join('') + '</div>';
  },

  // Maç sonu özet satırı (oyuncu bazlı)
  summary(m, pid) {
    const t = m.log.filter(x => x.pid === pid);
    const pts = t.reduce((a, x) => a + (x.points || 0), 0);
    const nd = t.reduce((a, x) => a + (x.nd ?? x.darts.length), 0);
    const co = t.filter(x => x.checkout);
    const att = t.reduce((a, x) => a + (x.att || 0), 0);
    const coHits = co.filter(x => x.att).length;
    return [
      ['Ortalama', nd ? ((pts / nd) * 3).toFixed(1) : '–'],
      ['180', t.filter(x => x.points === 180).length],
      ['140+', t.filter(x => x.points >= 140).length],
      ['En yüksek bitiriş', co.length ? Math.max(...co.map(x => x.checkout)) : '–'],
      ['Checkout', att ? `${coHits}/${att}` : co.length || '–'],
    ];
  },
};
