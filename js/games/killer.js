// Killer — grup eleme oyunu
import { cards, playerTurns, sumRec } from './common.js';
import { t as tr } from '../i18n.js';

const pickNumbers = n => {
  const pool = Array.from({ length: 20 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
};

export default {
  id: 'killer',
  name: 'Killer',
  cat: 'main',
  short: 'Kendi sayının double\'ı ile killer ol, rakiplerin canını al',
  rules: `Her oyuncuya rastgele bir sayı verilir (1–20) ve herkesin canı vardır.
Önce <b>kendi sayının double'ını</b> vurup <b>Killer</b> olmalısın.
Killer olunca rakiplerin sayısının double'ını vurdukça onların canı gider. Canı biten elenir.
Dikkat: Killer'ken <b>kendi double'ını</b> vurursan kendi canın gider!
"Tüm bölge" modunda single 1, double 2, triple 3 isabet sayılır.
Son kalan kazanır.`,
  min: 2, max: 12, teams: false, legs: false,
  options: [
    { key: 'lives', label: 'Can', type: 'choice', values: [[3, '3'], [5, '5']], def: 3 },
    { key: 'zone', label: 'Sayılan', type: 'choice', values: [['double', 'Sadece double'], ['segment', 'Tüm bölge']], def: 'double' },
  ],

  init(m) {
    const nums = pickNumbers(m.sides.length);
    return { s: m.sides.map((_, i) => ({ n: nums[i], lives: m.opts.lives, killer: false })) };
  },

  isOut(m, g, i) { return g.s[i].lives <= 0; },

  dart(m, g, d, rec) {
    const me = g.s[m.cur];
    const hits = m.opts.zone === 'segment' ? (d.n ? d.m : 0) : (d.m === 2 ? 1 : 0);
    if (!hits || d.n === 25) return;
    rec.kills = rec.kills || 0;
    if (d.n === me.n) {
      if (!me.killer) { me.killer = true; rec.becameKiller = true; m.msg = tr('KILLER oldun!'); return; }
      me.lives = Math.max(0, me.lives - hits);
      m.msg = tr('Kendi canından gitti!');
    } else if (me.killer) {
      g.s.forEach(o => {
        if (o !== me && o.n === d.n && o.lives > 0) {
          o.lives = Math.max(0, o.lives - hits);
          rec.kills += hits;
          if (o.lives === 0) m.msg = tr('Elendi!');
        }
      });
    }
    const alive = g.s.map((o, i) => (o.lives > 0 ? i : -1)).filter(i => i >= 0);
    if (alive.length === 1) return { legWinner: alive[0] };
    if (alive.length === 0) return { legWinner: -1 };
    if (me.lives <= 0) return { endTurn: true };
  },

  hint(m, g) {
    const me = g.s[m.cur];
    const z = m.opts.zone === 'segment' ? '' : 'D';
    if (!me.killer) return tr('Killer olmak için: {0}', z + me.n);
    const t = g.s.filter(o => o !== me && o.lives > 0).map(o => z + o.n);
    return tr('Vur: {0}', t.join(' · '));
  },

  highlight(m, g) {
    const me = g.s[m.cur];
    if (!me.killer) return [{ n: me.n }];
    return g.s.filter(o => o !== me && o.lives > 0).map(o => ({ n: o.n }));
  },

  view(m, g, ctx) {
    return cards(m, ctx, i => {
      const s = g.s[i];
      const hearts = s.lives > 0 ? '●'.repeat(s.lives) + '<span class="bos">' + '●'.repeat(Math.max(0, m.opts.lives - s.lives)) + '</span>' : tr('Elendi');
      return {
        big: s.n,
        sub: [`<span class="can">${hearts}</span>`],
        tag: s.lives <= 0 ? '' : s.killer ? '🎯 KILLER' : tr('Killer değil'),
        out: s.lives <= 0,
      };
    });
  },

  summary(m, pid) {
    const t = playerTurns(m, pid);
    return [['Can alma', sumRec(t, 'kills')], ['Atılan ok', t.reduce((a, x) => a + x.darts.length, 0)]];
  },
};
