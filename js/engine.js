// DartX — ortak maç motoru: sıra, tur, leg/set, geri al, kayıt
import { uid } from './store.js';
import { GAMES } from './games/index.js';
import { t } from './i18n.js';
export { dartValue, dartLabel } from './util.js';
// Bir ok: {n: 0..20 | 25, m: 1|2|3}  (n=0 ıska)

/**
 * sides: [{name, members:[pid...]}]  — tekli oyunda her side tek kişi
 */
export function createMatch(gameId, opts, sides) {
  const game = GAMES[gameId];
  const m = {
    id: uid(),
    gameId,
    opts,
    sides: sides.map(s => ({ name: s.name, members: s.members.slice(), memberIdx: 0 })),
    started: Date.now(),
    ended: null,
    legsWon: sides.map(() => 0),
    setsWon: sides.map(() => 0),
    legNo: 1,
    starter: 0,
    cur: 0,
    round: 1,
    turnDarts: [],
    rec: {},
    log: [],     // biten turlar
    legLog: [],  // biten leg'ler {leg, winner, darts}
    winner: null,
    done: false,
    msg: null,
  };
  m.g = game.init(m);
  startTurn(m);
  return m;
}

export const gameOf = m => GAMES[m.gameId];
export const currentPid = m => {
  const s = m.sides[m.cur];
  return s.members[s.memberIdx % s.members.length];
};

function startTurn(m) {
  m.turnDarts = [];
  m.rec = {};
  const game = gameOf(m);
  if (game.startTurn) game.startTurn(m, m.g);
}

const clone = o => JSON.parse(JSON.stringify(o));

// Geri al yığını (yalnız bellekte, log dışarıda tutulur)
const undoStack = [];
/** Başlama atışı (Demir 09.11): ilk leg'i kim açacak — maç başında, ilk ok atılmadan */
export function baslayanSec(m, i) {
  if (m.log.length || m.turnDarts.length) return;
  m.ilk = i; m.starter = i; m.cur = i;
  startTurn(m);
}
/** Oyunu bitir (Demir 09.11): leg bitiminde maç burada kapanır; kazanan en çok set/leg alan, eşitse berabere.
 *  Yeni leg'e hiç ok atılmadığı için istatistikler bozulmaz. */
export function erkenBitir(m) {
  if (m.done) return;
  const puan = i => (m.setsWon[i] || 0) * 1000 + (m.legsWon[i] || 0);
  const en = Math.max(...m.sides.map((_, i) => puan(i)));
  const kim = m.sides.map((_, i) => i).filter(i => puan(i) === en);
  m.done = true; m.ended = Date.now(); m.winner = kim.length === 1 ? kim[0] : -1; m.erkenBitti = true;
  m.turnDarts = [];
}
export function clearUndo() { undoStack.length = 0; }
export const canUndo = () => undoStack.length > 0;

function snapshot(m) {
  const { log, ...rest } = m;
  undoStack.push({ s: clone(rest), logLen: log.length });
  if (undoStack.length > 120) undoStack.shift();
}
export function undo(m) {
  const snap = undoStack.pop();
  if (!snap) return false;
  const log = m.log.slice(0, snap.logLen);
  for (const k of Object.keys(m)) delete m[k];
  Object.assign(m, snap.s, { log });
  return true;
}

/** Ok gir. Sonuç: {event: 'dart'|'turn'|'bust'|'leg'|'match', ...} */
export function throwDart(m, d) {
  if (m.done) return null;
  snapshot(m);
  const game = gameOf(m);
  m.msg = null;
  m.turnDarts.push(d);
  const r = game.dart(m, m.g, d, m.rec) || {};
  if (r.legWinner !== undefined) return endLeg(m, r.legWinner);
  const max = game.dartsPerTurn || 3;
  if (r.endTurn || m.turnDarts.length >= max) return endTurn(m, r.bust ? 'bust' : 'turn');
  return { event: 'dart' };
}

/** Tur toplamı girişi (yalnız X01) */
export function throwTotal(m, total, checkoutDarts) {
  if (m.done) return null;
  snapshot(m);
  const game = gameOf(m);
  m.msg = null;
  const r = game.total(m, m.g, total, m.rec, checkoutDarts) || {};
  if (r.legWinner !== undefined) return endLeg(m, r.legWinner);
  return endTurn(m, r.bust ? 'bust' : 'turn');
}

/** Turu erken bitir (ör. "Sonraki oyuncu") — kalan oklar ıska sayılır */
export function passTurn(m) {
  if (m.done) return null;
  const max = gameOf(m).dartsPerTurn || 3;
  let res = null;
  const once = undoStack.length;
  while (!m.done && m.turnDarts.length < max && (!res || res.event === 'dart')) {
    res = throwDart(m, { n: 0, m: 1 });
  }
  // Tek "geri al" eklenen ıskaların hepsini birden geri alsın (fuzz testi 09.11): yalnız ilk anlık görüntü kalır
  if (undoStack.length > once + 1) undoStack.splice(once + 1);
  return res;
}

function pushLog(m) {
  m.log.push({
    pid: currentPid(m),
    side: m.cur,
    leg: m.legNo,
    round: m.round,
    darts: m.turnDarts.slice(),
    ...m.rec,
  });
}

// Sıradaki taraf (elenmişleri atlar) ve round başa döndü mü?
function nextSide(m) {
  const n = m.sides.length;
  const game = gameOf(m);
  let next = m.cur, wrapped = false;
  for (let i = 0; i < n; i++) {
    next = (next + 1) % n;
    if (next === m.starter) wrapped = true;
    if (!(game.isOut && game.isOut(m, m.g, next))) break;
  }
  return { next, wrapped };
}

function advance(m) {
  m.sides[m.cur].memberIdx++;
  const { next, wrapped } = nextSide(m);
  m.cur = next;
  if (wrapped) m.round++;
  startTurn(m);
}

function endTurn(m, kind) {
  const game = gameOf(m);
  const lastOfRound = isLastOfRound(m);
  let r = {};
  if (game.endTurn) r = game.endTurn(m, m.g, m.rec, lastOfRound) || {};
  pushLog(m);
  if (r.legWinner !== undefined) return endLeg(m, r.legWinner, true);
  advance(m);
  return { event: kind };
}

// Turu atan taraf, bu round'da sıradaki son taraf mı?
function isLastOfRound(m) {
  return nextSide(m).wrapped;
}

function endLeg(m, winner, logged) {
  const game = gameOf(m);
  if (!logged) pushLog(m);
  m.legLog.push({ leg: m.legNo, winner });
  const legsToWin = m.opts.legs || 1;
  const setsToWin = m.opts.sets || 1;

  if (winner === -1) {
    // berabere: maç biter
    m.done = true; m.ended = Date.now(); m.winner = -1;
    return { event: 'match', winner: -1 };
  }

  m.legsWon[winner]++;
  let event = 'leg';
  if (m.legsWon[winner] >= legsToWin) {
    if (setsToWin > 1) {
      m.setsWon[winner]++;
      if (m.setsWon[winner] >= setsToWin) event = 'match';
      else { event = 'set'; m.legsWon = m.legsWon.map(() => 0); }
    } else event = 'match';
  }
  if (event === 'match') {
    m.done = true; m.ended = Date.now(); m.winner = winner;
    return { event, winner };
  }
  // yeni leg: başlayan sırayla değişir
  m.legNo++;
  m.starter = ((m.ilk || 0) + m.legNo - 1) % m.sides.length; // ilk leg'i başlama atışını kazanan açar, sonra sırayla
  m.cur = m.starter;
  m.round = 1;
  m.sides.forEach(s => (s.memberIdx = 0));
  m.g = game.init(m);
  startTurn(m);
  return { event, winner };
}

export function sideName(m, i, playerFn) {
  const s = m.sides[i];
  if (s.name) return t(s.name);
  return s.members.map(pid => playerFn(pid).name).join(' & ');
}
