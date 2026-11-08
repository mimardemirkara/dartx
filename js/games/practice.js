// Antrenmanlar: Bob's 27, Checkout 121, Catch 40, Büyük Bitiriş, Double/Triple Avı, JDC Challenge
// (Around the Clock solo, Scoring ve Bull party.js içinde)
import { dartValue, dartLabel } from '../util.js';
import { checkout } from '../checkout.js';
import { cards, best, roundLimit, playerTurns, sumRec, dartsOf, roundsOpt } from './common.js';
import { t as tr } from '../i18n.js';

// ───────── Bob's 27
export const bobs27 = {
  id: 'bobs27', name: "Bob's 27", cat: 'practice',
  short: 'Double antrenmanı: D1\'den D20\'ye',
  rules: `27 puanla başlarsın. Her tur bir double'a 3 ok atarsın: D1, D2, … D20 (isteğe bağlı sonunda Bull).
Her isabet double'ın değerini ekler (D5 = 10). Üç okta da ıskalarsan double'ın değeri kadar düşersin.
Puanın sıfırın altına inerse oyun biter. Hedef: olabildiğince yüksek bitirmek.`,
  min: 1, max: 8, teams: false,
  options: [{ key: 'bull', label: 'Sonda Bull', type: 'choice', values: [[1, 'Var'], [0, 'Yok']], def: 1 }],
  n: m => (m.opts.bull ? 21 : 20),
  tgt(m) { return m.round > 20 ? 25 : m.round; },
  init(m) { return { s: m.sides.map(() => ({ pts: 27, out: false })) }; },
  isOut(m, g, i) { return g.s[i].out; },
  dart(m, g, d, rec) {
    const t = this.tgt(m);
    if (d.n === t && d.m === 2) {
      const v = t === 25 ? 50 : t * 2;
      g.s[m.cur].pts += v; rec.points = (rec.points || 0) + v; rec.hits = (rec.hits || 0) + 1;
    }
  },
  endTurn(m, g, rec, last) {
    const s = g.s[m.cur];
    if (!rec.hits) {
      const t = this.tgt(m), v = t === 25 ? 50 : t * 2;
      s.pts -= v; rec.points = -v;
      if (s.pts < 0) { s.out = true; m.msg = tr('Sıfırın altı — bitti'); }
    }
    if (g.s.every(x => x.out)) return { legWinner: best(g.s.map(x => x.pts)) };
    return roundLimit(m, last, this.n(m), g.s.map(x => x.pts));
  },
  hint(m) { const t = this.tgt(m); return tr('Hedef: {0} · {1}/{2}', t === 25 ? 'Bull' : 'D' + t, Math.min(m.round, this.n(m)), this.n(m)); },
  highlight(m) { return [{ n: this.tgt(m) }]; },
  view(m, g, ctx) { return cards(m, ctx, i => ({ big: g.s[i].pts, out: g.s[i].out, tag: g.s[i].out ? tr('Bitti') : '' })); },
  summary(m, pid) {
    const t = playerTurns(m, pid), h = sumRec(t, 'hits'), d = dartsOf(t);
    const side = m.sides.findIndex(s => s.members.includes(pid));
    return [['Skor', m.g.s[side].pts], ['Double isabeti', `${h}/${d}`], ['Yüzde', d ? `%${Math.round((h / d) * 100)}` : '–']];
  },
  score: (m, pid) => m.g.s[m.sides.findIndex(s => s.members.includes(pid))].pts,
};

// ───────── Checkout antrenmanları (ortak motor)
const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);
const randFinish = (lo, hi) => { let v; do { v = lo + Math.floor(Math.random() * (hi - lo + 1)); } while (BOGEY.has(v)); return v; };

function coFactory({ id, name, short, rules, options, darts, firstTarget, nextTarget, count, pts }) {
  return {
    id, name, cat: 'practice', short, rules, options,
    min: 1, max: 4, teams: false,
    init(m) {
      return { s: m.sides.map(() => { const t = firstTarget(m); return { target: t, rest: t, used: 0, done: 0, ok: 0, pts: 0, best: 0, fin: false, turnRest: t }; }) };
    },
    isOut(m, g, i) { return g.s[i].fin; },
    startTurn(m, g) { const s = g.s[m.cur]; s.turnRest = s.rest; },
    dart(m, g, d, rec) {
      const s = g.s[m.cur];
      s.used++;
      if (s.rest <= 170 && checkout(s.rest, 1, 'double')) rec.att = (rec.att || 0) + 1;
      const ns = s.rest - dartValue(d);
      if (ns < 0 || ns === 1 || (ns === 0 && d.m !== 2)) {
        s.rest = s.turnRest; rec.bust = true; m.msg = 'BUST';
        s.used = Math.min(darts, s.used + 3 - m.turnDarts.length); // bust eli bitirir: atılmayan oklar da haktan düşer
        if (s.used >= darts) return this.close(m, g, s, false, rec);
        return { endTurn: true, bust: true };
      }
      s.rest = ns;
      if (ns === 0) return this.close(m, g, s, true, rec);
      if (s.used >= darts) return this.close(m, g, s, false, rec);
    },
    close(m, g, s, ok, rec) {
      const p = ok ? pts(s.used) : 0;
      s.done++; s.pts += p;
      if (ok) { s.ok++; s.best = Math.max(s.best, s.target); rec.checkout = s.target; rec.cod = s.used; m.msg = tr('{0} bitti! +{1}', s.target, p); }
      else m.msg = tr('{0} olmadı', s.target);
      rec.attempt = { target: s.target, ok, darts: s.used };
      if (s.done >= count(m)) s.fin = true;
      else { s.target = nextTarget(m, s.target, ok); s.rest = s.target; s.turnRest = s.target; }
      s.used = 0;
      return { endTurn: true };
    },
    endTurn(m, g) {
      if (g.s.every(x => x.fin)) return { legWinner: best(g.s.map(x => x.pts * 1000 + x.best)) };
    },
    hint(m, g) {
      const s = g.s[m.cur];
      const left = darts - s.used;
      const r = checkout(s.rest, Math.min(3 - m.turnDarts.length, left), 'double');
      return tr('{0} · {1} ok kaldı', s.target, left) + (r ? ' · ' + r.map(dartLabel).join(' ') : '');
    },
    highlight(m, g) { const r = checkout(g.s[m.cur].rest, 3 - m.turnDarts.length, 'double'); return r ? [r[0]] : []; },
    view(m, g, ctx) {
      return cards(m, ctx, i => {
        const s = g.s[i];
        return { big: s.fin ? '✓' : s.rest, sub: [tr('Hedef {0}', s.target), tr('{0}/{1} başarı', s.ok, s.done), tr('{0} puan', s.pts)], out: s.fin };
      });
    },
    summary(m, pid) {
      const side = m.sides.findIndex(x => x.members.includes(pid)), s = m.g.s[side];
      return [['Başarı', `${s.ok}/${s.done}`], ['Puan', s.pts], ['En yüksek bitiriş', s.best || '–']];
    },
    score: (m, pid) => m.g.s[m.sides.findIndex(x => x.members.includes(pid))].pts,
  };
}

export const co121 = coFactory({
  id: 'co121', name: 'Checkout 121',
  short: '121\'i 9 okta bitir, başardıkça hedef artar',
  rules: `121'den başlarsın ve 9 okun (3 tur) var, double ile bitirmen gerekir.
Başarırsan hedef 1 artar (122, 123…), başaramazsan aynı hedefi tekrar denersin.
Her başarı 1 puan. Seçilen deneme sayısı bitince en yüksek hedef ve başarı sayın görünür.`,
  options: [{ key: 'count', label: 'Deneme', type: 'choice', values: [[5, '5'], [10, '10'], [20, '20']], def: 10 }],
  darts: 9, firstTarget: () => 121, nextTarget: (m, t, ok) => (ok ? Math.min(170, t + 1) : t),
  count: m => m.opts.count, pts: () => 1,
});

export const catch40 = coFactory({
  id: 'catch40', name: 'Catch 40',
  short: '61–100 arası bitirişler',
  rules: `Hedefler 61'den 100'e (ya da seçtiğin kadar). Her hedef için 6 ok (2 tur), double ile bitir.
2 okla bitirirsen 3 puan, 3 okla 2 puan, 4–6 okla 1 puan. Bitiremezsen 0.`,
  options: [
    { key: 'count', label: 'Hedef sayısı', type: 'choice', values: [[10, '10'], [20, '20'], [40, '40 (tam)']], def: 10 },
    { key: 'order', label: 'Sıra', type: 'choice', values: [['seq', '61 → 100'], ['rand', 'Karışık']], def: 'seq' },
  ],
  darts: 6,
  firstTarget: m => (m.opts.order === 'rand' ? randFinish(61, 100) : 61),
  nextTarget: (m, t) => (m.opts.order === 'rand' ? randFinish(61, 100) : t + 1),
  count: m => m.opts.count, pts: u => (u <= 2 ? 3 : u === 3 ? 2 : 1),
});

export const bigfinish = coFactory({
  id: 'bigfinish', name: 'Büyük Bitiriş',
  short: 'Rastgele 100+ checkout antrenmanı',
  rules: `Rastgele 100–170 arası bitirişler gelir (bitmeyen sayılar hariç). Her biri için 9 ok, double ile bitir.
3 okla bitirirsen 3 puan, 4–6 okla 2, 7–9 okla 1 puan.`,
  options: [{ key: 'count', label: 'Hedef sayısı', type: 'choice', values: [[5, '5'], [10, '10'], [20, '20']], def: 10 }],
  darts: 9, firstTarget: () => randFinish(100, 170), nextTarget: () => randFinish(100, 170),
  count: m => m.opts.count, pts: u => (u <= 3 ? 3 : u <= 6 ? 2 : 1),
});

// ───────── Double / Triple Avı
const randTarget = mode => {
  const mm = mode === 'mixed' ? (Math.random() < 0.5 ? 2 : 3) : mode === 'triple' ? 3 : 2;
  const n = mm === 2 && Math.random() < 0.05 ? 25 : 1 + Math.floor(Math.random() * 20);
  return { n, m: mm };
};
export const dtdrill = {
  id: 'dtdrill', name: 'Double / Triple Avı', cat: 'practice',
  short: 'Rastgele hedef, isabet yüzdesi',
  rules: 'Her tur sana rastgele bir hedef verilir (ör. D16, T19). 3 okla o hedefe at; her isabet 1 puan. Turlar bitince isabet yüzdesi görünür.',
  min: 1, max: 8, teams: false,
  options: [
    { key: 'mode', label: 'Hedefler', type: 'choice', values: [['double', 'Double'], ['triple', 'Triple'], ['mixed', 'Karışık']], def: 'double' },
    roundsOpt([10, 20, 30], 10),
  ],
  init(m) { return { s: m.sides.map(() => ({ pts: 0, t: null })) }; },
  startTurn(m, g) { g.s[m.cur].t = randTarget(m.opts.mode); },
  dart(m, g, d, rec) {
    const t = g.s[m.cur].t;
    rec.target = t;
    if (d.n === t.n && d.m === t.m) { g.s[m.cur].pts++; rec.points = (rec.points || 0) + 1; rec.hits = (rec.hits || 0) + 1; }
  },
  endTurn(m, g, rec, last) { return roundLimit(m, last, m.opts.rounds, g.s.map(s => s.pts)); },
  hint(m, g) { return tr('Hedef: {0} · Tur {1}/{2}', dartLabel(g.s[m.cur].t), m.round, m.opts.rounds); },
  highlight(m, g) { return [{ n: g.s[m.cur].t.n }]; },
  view(m, g, ctx) {
    return cards(m, ctx, i => {
      const t = m.log.filter(x => x.side === i), d = dartsOf(t);
      return { big: g.s[i].pts, sub: [d ? `%${Math.round((g.s[i].pts / d) * 100)}` : '–', ctx.active(i) && g.s[i].t ? tr('Hedef {0}', dartLabel(g.s[i].t)) : ''] };
    });
  },
  summary(m, pid) { const t = playerTurns(m, pid), d = dartsOf(t), h = sumRec(t, 'hits'); return [['İsabet', `${h}/${d}`], ['Yüzde', d ? `%${Math.round((h / d) * 100)}` : '–']]; },
  score: (m, pid) => sumRec(playerTurns(m, pid), 'hits'),
};

// ───────── JDC Challenge
// Tur 1–6: Shanghai 10–15 · Tur 7–13: D1…D20 + Bull (her ok ayrı double) · Tur 14–19: Shanghai 15–20
const jdcTarget = (round, k) => {
  if (round <= 6) return { kind: 'sh', n: 9 + round };
  if (round <= 13) { const i = (round - 7) * 3 + k; return { kind: 'd', n: i >= 20 ? 25 : i + 1 }; }
  return { kind: 'sh', n: round + 1 };
};
export const jdc = {
  id: 'jdc', name: 'JDC Challenge', cat: 'practice',
  short: 'Triple + Shanghai + double karma test',
  rules: `19 tur, üç bölüm:
<b>1–6. tur:</b> 10'dan 15'e Shanghai — hedef sayıya vurduğun okların değeri; aynı turda S+D+T = +100 bonus.
<b>7–13. tur:</b> D1'den D20'ye ve Bull — her ok sıradaki double'a; her isabet 50 puan, Bull 100.
<b>14–19. tur:</b> 15'ten 20'ye Shanghai.
Toplam puanın sonuçtur.`,
  min: 1, max: 8, teams: false,
  init(m) { return { s: m.sides.map(() => ({ pts: 0 })) }; },
  dart(m, g, d, rec) {
    const k = m.turnDarts.length - 1;
    const t = jdcTarget(m.round, k);
    rec.points = rec.points || 0;
    rec.hm = rec.hm || [];
    let v = 0;
    if (t.kind === 'd') { if (d.n === t.n && d.m === 2) { v = t.n === 25 ? 100 : 50; rec.hits = (rec.hits || 0) + 1; } }
    else if (d.n === t.n) {
      v = dartValue(d);
      if (!rec.hm.includes(d.m)) rec.hm.push(d.m);
      if (rec.hm.length === 3 && !rec.sh) { v += 100; rec.sh = true; m.msg = 'SHANGHAI +100'; }
    }
    g.s[m.cur].pts += v; rec.points += v;
  },
  endTurn(m, g, rec, last) { return roundLimit(m, last, 19, g.s.map(s => s.pts)); },
  hint(m) {
    const t = jdcTarget(m.round, m.turnDarts.length);
    const part = m.round <= 6 ? 1 : m.round <= 13 ? 2 : 3;
    return tr('Bölüm {0} · Tur {1}/19 · Hedef: {2}', part, m.round, t.kind === 'd' ? (t.n === 25 ? 'Bull' : 'D' + t.n) : t.n + ' (S+D+T)');
  },
  highlight(m) { return [{ n: jdcTarget(m.round, Math.min(2, m.turnDarts.length)).n }]; },
  view(m, g, ctx) { return cards(m, ctx, i => ({ big: g.s[i].pts, sub: [tr('Tur {0}/19', Math.min(m.round, 19))] })); },
  summary(m, pid) { const t = playerTurns(m, pid); return [['Puan', sumRec(t, 'points')], ['Double isabeti', sumRec(t, 'hits') + '/21'], ['Shanghai', t.filter(x => x.sh).length]]; },
  score: (m, pid) => sumRec(playerTurns(m, pid), 'points'),
};
