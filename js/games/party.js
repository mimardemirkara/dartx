// Grup oyunları: Shanghai, Halve-It, Around the Clock, Baseball, Count-Up, Gotcha
import { dartValue, ondalik } from '../util.js';
import { cards, best, roundLimit, label, playerTurns, sumRec, dartsOf, roundsOpt } from './common.js';
import { t as tr } from '../i18n.js';

const scoreSum = (m, i) => m.log.filter(t => t.side === i).reduce((a, t) => a + (t.points || 0), 0);

// ───────── Shanghai
export const shanghai = {
  id: 'shanghai', name: 'Shanghai', cat: 'party',
  short: '7 tur — single + double + triple = anında kazanma',
  rules: `Her turun bir hedef sayısı var: 1. turda 1, 2. turda 2… Yalnız o sayıya vurduğun oklar puan getirir (sayı × çarpan).
Aynı turda hedefin <b>single, double ve triple</b>'ını vurursan <b>SHANGHAI</b>: oyunu anında kazanırsın.
Turlar bitince en yüksek puan kazanır.`,
  min: 1, max: 12, teams: true,
  options: [roundsOpt([7, 10, 20], 7)],
  init(m) { return { s: m.sides.map(() => ({ pts: 0 })) }; },
  dart(m, g, d, rec) {
    const t = m.round;
    rec.points = rec.points || 0;
    rec.hm = rec.hm || [];
    if (d.n !== t) return;
    const v = dartValue(d);
    g.s[m.cur].pts += v;
    rec.points += v;
    rec.hits = (rec.hits || 0) + 1;
    if (!rec.hm.includes(d.m)) rec.hm.push(d.m);
    if (rec.hm.length === 3) { rec.shanghai = true; m.msg = 'SHANGHAI!'; return { legWinner: m.cur }; }
  },
  endTurn(m, g, rec, last) { return roundLimit(m, last, m.opts.rounds, g.s.map(s => s.pts)); },
  hint(m) { return tr('Hedef: {0}', m.round) + (m.round <= 20 ? tr('  · Shanghai için S + D + T') : ''); },
  highlight(m) { return [{ n: m.round }]; },
  view(m, g, ctx) { return cards(m, ctx, i => ({ big: g.s[i].pts, sub: [tr('Tur {0}/{1}', Math.min(m.round, m.opts.rounds), m.opts.rounds)] })); },
  summary(m, pid) { const t = playerTurns(m, pid); return [['Puan', sumRec(t, 'points')], ['İsabet', sumRec(t, 'hits') + '/' + dartsOf(t)]]; },
  score: (m, pid) => sumRec(playerTurns(m, pid), 'points'),
};

// ───────── Halve-It
const HALVE_TARGETS = [15, 16, 'D', 17, 18, 'T', 19, 20, 'B'];
const halveHit = (t, d) =>
  t === 'D' ? d.m === 2 && d.n > 0 : t === 'T' ? d.m === 3 : t === 'B' ? d.n === 25 : d.n === t;

export const halveit = {
  id: 'halveit', name: 'Halve-It', cat: 'party',
  short: 'Hedefi tutturamazsan puanın yarıya iner',
  rules: `9 tur, her turun hedefi sırayla: 15 · 16 · herhangi double · 17 · 18 · herhangi triple · 19 · 20 · Bull.
Hedefe vurduğun okların değeri puanına eklenir.
Bir turda hedefe <b>hiç</b> vuramazsan puanın <b>yarıya iner</b>!
Turlar bitince en yüksek puan kazanır.`,
  min: 1, max: 12, teams: true,
  options: [{ key: 'start', label: 'Başlangıç puanı', type: 'choice', values: [[0, '0'], [40, '40']], def: 40 }],
  init(m) { return { s: m.sides.map(() => ({ pts: m.opts.start })) }; },
  target: m => HALVE_TARGETS[Math.min(m.round, HALVE_TARGETS.length) - 1],
  dart(m, g, d, rec) {
    rec.points = rec.points || 0;
    if (!halveHit(this.target(m), d)) return;
    const v = dartValue(d);
    g.s[m.cur].pts += v;
    rec.points += v;
    rec.hits = (rec.hits || 0) + 1;
  },
  endTurn(m, g, rec, last) {
    if (!rec.hits) {
      const s = g.s[m.cur];
      rec.halved = s.pts - Math.floor(s.pts / 2);
      s.pts = Math.floor(s.pts / 2);
      m.msg = tr('YARIYA İNDİ!');
    }
    return roundLimit(m, last, HALVE_TARGETS.length, g.s.map(s => s.pts));
  },
  hint(m) { return tr('Hedef: {0}', label(this.target(m))); },
  highlight(m) {
    const t = this.target(m);
    return typeof t === 'number' ? [{ n: t }] : t === 'B' ? [{ n: 25 }] : [];
  },
  view(m, g, ctx) {
    return `<div class="hedefler">${HALVE_TARGETS.map((t, k) => `<span class="${k + 1 === m.round ? 'on' : k + 1 < m.round ? 'gecti' : ''}">${t === 'B' ? 'B' : t}</span>`).join('')}</div>` +
      cards(m, ctx, i => ({ big: g.s[i].pts }));
  },
  summary(m, pid) { const t = playerTurns(m, pid); return [['Toplanan', sumRec(t, 'points')], ['Yarıya inme', t.filter(x => x.halved !== undefined).length]]; },
};

// ───────── Around the Clock (yarış + solo)
function atcFactory(solo) {
  const seq = bull => [...Array.from({ length: 20 }, (_, i) => i + 1), ...(bull ? [25] : [])];
  const fits = (mode, t, d) => d.n === t && (mode === 'all' || (mode === 'double' ? d.m === 2 : mode === 'triple' ? (t === 25 ? d.m === 2 : d.m === 3) : true));
  return {
    id: solo ? 'atcsolo' : 'atc',
    name: solo ? 'Around the Clock (solo)' : 'Around the Clock',
    cat: solo ? 'practice' : 'party',
    short: solo ? 'İsabet: tümü / sadece double / sadece triple' : '1\'den 20\'ye sırayla, sonra Bull — ilk bitiren kazanır',
    rules: solo
      ? `1'den 20'ye sırayla (isteğe bağlı sonunda Bull) her sayıyı vur. Hedefi vurmadan sonrakine geçemezsin.
Mod: tüm bölge / sadece double / sadece triple. Amaç: en az okla bitirmek. Sonunda isabet yüzdesi görünür.`
      : `Herkes 1'den başlar; hedef sayıyı vurunca bir sonrakine geçer (1 → 2 → … → 20 → Bull).
"Çarpan atlatır" açıksa double 2, triple 3 sayı ilerletir. Sona ilk ulaşan kazanır.`,
    min: 1, max: solo ? 8 : 12, teams: !solo,
    options: [
      ...(solo ? [{ key: 'mode', label: 'Mod', type: 'choice', values: [['all', 'Tüm bölge'], ['double', 'Sadece double'], ['triple', 'Sadece triple']], def: 'all' }] : []),
      { key: 'bull', label: 'Sonda Bull', type: 'choice', values: [[1, 'Var'], [0, 'Yok']], def: 1 },
      ...(!solo ? [{ key: 'skip', label: 'Çarpan atlatır', type: 'choice', values: [[0, 'Hayır'], [1, 'Evet']], def: 0 }] : []),
    ],
    init(m) { return { seq: seq(m.opts.bull), s: m.sides.map(() => ({ i: 0, darts: 0, hits: 0, done: false })) }; },
    isOut(m, g, i) { return solo && g.s[i].done; },
    dart(m, g, d, rec) {
      const s = g.s[m.cur];
      s.darts++;
      const t = g.seq[s.i];
      const mode = solo ? m.opts.mode : 'all';
      if (!fits(mode, t, d)) return;
      s.hits++; rec.hits = (rec.hits || 0) + 1;
      const adim = !solo && m.opts.skip && t !== 25 ? d.m : 1;
      // çarpan atlatırken sona (Bull'a) gelmeden diziden taşmasın: son hedefte durur, onu da vurmak gerekir
      s.i = s.i < g.seq.length - 1 ? Math.min(s.i + adim, g.seq.length - 1) : s.i + 1;
      if (s.i >= g.seq.length) {
        s.done = true;
        if (!solo) return { legWinner: m.cur };
        m.msg = tr('Bitti!');
        return { endTurn: true };
      }
    },
    endTurn(m, g) {
      if (solo && g.s.every(s => s.done)) return { legWinner: best(g.s.map(s => s.darts), false) };
    },
    tgt(m, g) { return g.seq[Math.min(g.s[m.cur].i, g.seq.length - 1)]; },
    hint(m, g) {
      const t = this.tgt(m, g);
      const mode = solo ? m.opts.mode : 'all';
      const p = mode === 'double' ? 'D' : mode === 'triple' ? 'T' : '';
      return tr('Hedef: {0}', t === 25 ? 'Bull' : p + t);
    },
    highlight(m, g) { return [{ n: this.tgt(m, g) }]; },
    view(m, g, ctx) {
      return cards(m, ctx, i => {
        const s = g.s[i], t = g.seq[Math.min(s.i, g.seq.length - 1)];
        return {
          big: s.done ? '✓' : (t === 25 ? 'B' : t),
          sub: [`${s.i}/${g.seq.length}`, tr('{0} ok', s.darts), s.darts ? `%${Math.round((s.hits / s.darts) * 100)}` : ''],
          out: s.done && solo,
        };
      });
    },
    summary(m, pid) {
      const t = playerTurns(m, pid), d = dartsOf(t), h = sumRec(t, 'hits');
      return [['Ok', d], ['İsabet', d ? `%${Math.round((h / d) * 100)}` : '–']];
    },
    score: solo ? (m, pid) => dartsOf(playerTurns(m, pid)) : undefined,
    lowerBetter: solo,
  };
}
export const atc = atcFactory(false);
export const atcsolo = atcFactory(true);

// ───────── Baseball
export const baseball = {
  id: 'baseball', name: 'Baseball', cat: 'party',
  short: '9 inning, her inning\'de o sayı',
  rules: `9 inning (tur). 1. inning'de 1'e, 2.'de 2'ye… atarsın.
O sayıya vurunca: single 1, double 2, triple 3 koşu (run). Diğer sayılar sayılmaz.
9 inning sonunda en çok koşu yapan kazanır.`,
  min: 1, max: 12, teams: true,
  init(m) { return { s: m.sides.map(() => ({ runs: 0, inn: [] })) }; },
  dart(m, g, d, rec) {
    rec.points = rec.points || 0;
    if (d.n !== m.round) return;
    g.s[m.cur].runs += d.m;
    rec.points += d.m;
  },
  endTurn(m, g, rec, last) {
    g.s[m.cur].inn[m.round - 1] = rec.points || 0;
    return roundLimit(m, last, 9, g.s.map(s => s.runs));
  },
  hint(m) { return tr('Inning {0} · Hedef: {1}', m.round, m.round); },
  highlight(m) { return [{ n: m.round }]; },
  view(m, g, ctx) {
    return cards(m, ctx, i => ({ big: g.s[i].runs, sub: [g.s[i].inn.map(x => x ?? 0).join(' · ') || '–'] }));
  },
  summary(m, pid) { const t = playerTurns(m, pid); return [['Koşu', sumRec(t, 'points')]]; },
};

// ───────── Toplam puan oyunları: Count-Up, Scoring (T20), Bull antrenmanı
function totalFactory({ id, name, cat, short, rules, rounds, def, valueOf, statRows, target }) {
  return {
    id, name, cat, short, rules,
    min: 1, max: cat === 'practice' ? 8 : 12, teams: cat !== 'practice',
    options: [roundsOpt(rounds, def)],
    init(m) { return { s: m.sides.map(() => ({ pts: 0 })) }; },
    dart(m, g, d, rec) {
      rec.points = rec.points || 0;
      const v = valueOf(d);
      g.s[m.cur].pts += v;
      rec.points += v;
      if (v) rec.hits = (rec.hits || 0) + 1;
    },
    endTurn(m, g, rec, last) { return roundLimit(m, last, m.opts.rounds, g.s.map(s => s.pts)); },
    hint(m) { return tr('Tur {0}/{1}', m.round, m.opts.rounds) + (target ? ' · ' + target : ''); },
    highlight() { return target === 'Bull' ? [{ n: 25 }] : target === 'T20' ? [{ n: 20 }] : []; },
    view(m, g, ctx) {
      return cards(m, ctx, i => {
        const t = m.log.filter(x => x.side === i), d = dartsOf(t);
        return { big: g.s[i].pts, sub: [d ? tr('Ort {0}', ondalik((scoreSum(m, i) / d) * 3, 1)) : tr('Ort –'), tr('{0} ok', d)] };
      });
    },
    summary: statRows,
    score: (m, pid) => sumRec(playerTurns(m, pid), 'points'),
  };
}

export const countup = totalFactory({
  id: 'countup', name: 'Count-Up', cat: 'party',
  short: 'Belirli tur sayısında en yüksek toplam',
  rules: 'Her okun değeri toplanır (T20 = 60, Bull = 50). Turlar bitince en yüksek toplam kazanır. Yeni başlayanlar için ideal.',
  rounds: [5, 8, 10, 15], def: 8, valueOf: dartValue,
  statRows(m, pid) { const t = playerTurns(m, pid), d = dartsOf(t), p = sumRec(t, 'points'); return [['Toplam', p], ['Ortalama', d ? ondalik((p / d) * 3, 1) : '–'], ['En iyi tur', Math.max(0, ...t.map(x => x.points || 0))]]; },
});

export const scoring = totalFactory({
  id: 'scoring', name: 'Scoring (T20)', cat: 'practice',
  short: '10 tur skor ve ortalama takibi',
  rules: 'T20\'ye (ya da en iyi skor yaptığın bölgeye) at. Her okun değeri sayılır. Amaç: 3 ok ortalamanı yükseltmek. 100+, 140+ ve 180\'ler sayılır.',
  rounds: [10, 20, 30], def: 10, valueOf: dartValue, target: 'T20',
  statRows(m, pid) {
    const t = playerTurns(m, pid), d = dartsOf(t), p = sumRec(t, 'points');
    return [['Ortalama', d ? ondalik((p / d) * 3, 1) : '–'], ['100+', t.filter(x => x.points >= 100).length], ['140+', t.filter(x => x.points >= 140).length], ['180', t.filter(x => x.points === 180).length]];
  },
});

export const bull = totalFactory({
  id: 'bull', name: 'Bull Antrenmanı', cat: 'practice',
  short: '25 / Bull isabet çalışması',
  rules: 'Yalnız merkeze at. 25 = 1 puan, Bull = 2 puan. Turlar bitince toplam ve isabet yüzdesi görünür.',
  rounds: [10, 20, 30], def: 10, valueOf: d => (d.n === 25 ? d.m : 0), target: 'Bull',
  statRows(m, pid) {
    const t = playerTurns(m, pid), d = dartsOf(t);
    const all = t.flatMap(x => x.darts);
    const b = all.filter(x => x.n === 25 && x.m === 2).length, o = all.filter(x => x.n === 25 && x.m === 1).length;
    return [['Puan', sumRec(t, 'points')], ['Bull', b], ['25', o], ['İsabet', d ? `%${Math.round(((b + o) / d) * 100)}` : '–']];
  },
});

// ───────── Gotcha
export const gotcha = {
  id: 'gotcha', name: 'Gotcha', cat: 'party',
  short: 'Rakibin puanına eşitlersen onu sıfıra gönder',
  rules: `Herkes 0'dan başlar, okların değeri eklenir. Hedef puana (301) <b>tam</b> ulaşan kazanır; geçersen tur geçersiz (bust).
Bir okla puanın bir rakibinkine <b>eşit</b> olursa: <b>Gotcha!</b> O rakip 0'a döner.`,
  min: 2, max: 12, teams: false,
  options: [{ key: 'target', label: 'Hedef', type: 'choice', values: [[301, '301'], [501, '501']], def: 301 }],
  init(m) { return { s: m.sides.map(() => ({ pts: 0 })), start: 0 }; },
  startTurn(m, g) { g.start = g.s[m.cur].pts; g.snap = g.s.map(s => s.pts); },
  dart(m, g, d, rec) {
    const me = g.s[m.cur];
    const ns = me.pts + dartValue(d);
    if (ns > m.opts.target) {
      g.s.forEach((s, i) => (s.pts = g.snap[i]));
      rec.bust = true; m.msg = 'BUST!';
      return { endTurn: true, bust: true };
    }
    me.pts = ns;
    rec.points = (rec.points || 0) + dartValue(d);
    if (ns === m.opts.target) return { legWinner: m.cur };
    g.s.forEach((s, i) => {
      if (i !== m.cur && s.pts === ns && ns > 0) { s.pts = 0; rec.gotcha = (rec.gotcha || 0) + 1; m.msg = 'GOTCHA!'; }
    });
  },
  hint(m, g) {
    const me = g.s[m.cur].pts, left = m.opts.target - me;
    const prey = g.s.map((s, i) => (i !== m.cur && s.pts > me && s.pts - me <= 60 ? s.pts - me : null)).filter(x => x);
    return tr('Hedefe {0}', left) + (prey.length ? tr(' · Gotcha için {0} at', prey.join(' / ')) : '');
  },
  view(m, g, ctx) { return cards(m, ctx, i => ({ big: g.s[i].pts, sub: [tr('Kalan {0}', m.opts.target - g.s[i].pts)] })); },
  summary(m, pid) { const t = playerTurns(m, pid); return [['Gotcha', sumRec(t, 'gotcha')], ['Bust', t.filter(x => x.bust).length]]; },
};
