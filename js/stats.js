// DartX — oyuncu istatistikleri (biten maçlardan hesaplanır)
import { data } from './store.js';
import { GAMES } from './games/index.js';

const won = (m, pid) => m.winner !== null && m.winner >= 0 && m.sides[m.winner].members.includes(pid);

export function playerStats(pid) {
  const hist = data().history.filter(m => m.done && m.sides.some(s => s.members.includes(pid)));
  const res = {
    played: hist.length,
    wins: hist.filter(m => won(m, pid)).length,
    byGame: {},
    x01: null,
    cricket: null,
    recent: hist.slice(0, 15),
    // Demir 11.11: bütün maçlar tarih tarih, en yeni üstte (istatistik ekranında gün gün listelenir)
    tum: hist.slice().sort((a, b) => (b.ended || b.started || 0) - (a.ended || a.started || 0)),
    son: hist.reduce((en, m) => Math.max(en, m.ended || m.started || 0), 0) || null,
  };
  hist.forEach(m => {
    const b = (res.byGame[m.gameId] = res.byGame[m.gameId] || { played: 0, wins: 0 });
    b.played++;
    if (won(m, pid)) b.wins++;
  });

  // X01
  const xm = hist.filter(m => m.gameId === 'x01');
  if (xm.length) {
    let pts = 0, nd = 0, f9p = 0, f9d = 0, att = 0, co = 0, hiCo = 0, t100 = 0, t140 = 0, t180 = 0, hiTurn = 0, bestLeg = Infinity;
    xm.forEach(m => {
      const turns = m.log.filter(t => t.pid === pid);
      const perLeg = {};
      turns.forEach(t => {
        const d = t.nd ?? t.darts.length;
        pts += t.points || 0; nd += d;
        const L = (perLeg[t.leg] = perLeg[t.leg] || { i: 0, d: 0 });
        if (L.i < 3) { f9p += t.points || 0; f9d += d; }
        L.i++; L.d += d;
        att += t.att || 0;
        if (t.checkout) {
          hiCo = Math.max(hiCo, t.checkout);
          if (t.att) co++; // yüzde yalnız ok ok girişte hesaplanır
        }
        const p = t.points || 0;
        hiTurn = Math.max(hiTurn, p);
        if (p >= 100) t100++;
        if (p >= 140) t140++;
        if (p === 180) t180++;
      });
      // en kısa leg: oyuncunun tek başına oynadığı ve kazandığı leg'ler
      const side = m.sides.findIndex(s => s.members.includes(pid));
      if (m.sides[side].members.length === 1) {
        m.legLog.filter(l => l.winner === side).forEach(l => {
          if (perLeg[l.leg]) bestLeg = Math.min(bestLeg, perLeg[l.leg].d);
        });
      }
    });
    res.x01 = {
      avg: nd ? (pts / nd) * 3 : NaN,
      first9: f9d ? (f9p / f9d) * 3 : NaN,
      checkout: att ? co / att : NaN,
      coHits: co, coAtt: att,
      hiCo, hiTurn, t100, t140, t180,
      bestLeg: Number.isFinite(bestLeg) ? bestLeg : null,
      darts: nd,
    };
  }

  // Cricket (iki tür birlikte)
  const cm = hist.filter(m => m.gameId === 'cricket' || m.gameId === 'cutthroat');
  if (cm.length) {
    let marks = 0, nd = 0, best = 0;
    cm.forEach(m => m.log.filter(t => t.pid === pid).forEach(t => {
      marks += t.marks || 0; nd += t.darts.length; best = Math.max(best, t.marks || 0);
    }));
    res.cricket = { mpr: nd ? (marks / nd) * 3 : NaN, bestTurn: best, darts: nd };
  }

  // Isı haritası (Demir 10.11): bütün maçlardaki okların dilim / halka dağılımı
  const isi = {}; let isiN = 0;
  hist.forEach(m => m.log.filter(t => t.pid === pid).forEach(t => (t.darts || []).forEach(d => {
    const k = d.n === 0 ? 'iska' : d.n === 25 ? (d.m === 2 ? 'b50' : 'b25') : d.n + ':' + d.m;
    isi[k] = (isi[k] || 0) + 1; isiN++;
  })));
  res.isi = { k: isi, n: isiN };

  // Rekorlar: skoru olan oyunlarda en iyi sonuç (yalnız tek kişilik taraf)
  res.records = [];
  Object.values(GAMES).forEach(g => {
    if (!g.score) return;
    const vals = hist.filter(m => m.gameId === g.id && m.sides.some(s => s.members.length === 1 && s.members[0] === pid))
      .map(m => { try { return g.score(m, pid); } catch (e) { return null; } })
      .filter(v => Number.isFinite(v));
    if (!vals.length) return;
    res.records.push({ id: g.id, name: g.name, best: g.lowerBetter ? Math.min(...vals) : Math.max(...vals), n: vals.length, unit: g.lowerBetter ? 'ok' : '' });
  });
  return res;
}
