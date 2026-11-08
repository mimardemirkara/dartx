// DartX — bitiriş önerisi (X01)
// out: 'double' | 'master' (double veya triple) | 'single' (herhangi)

const T = n => ({ n, m: 3 }), D = n => ({ n, m: 2 }), S = n => ({ n, m: 1 });

// Kurulum okları için tercih sırası (yaygın profesyonel tercihler önde)
const SETUP = [
  T(20), T(19), T(18), T(17), T(16), T(15), T(14), T(13), T(12), T(11), T(10),
  { n: 25, m: 2 }, { n: 25, m: 1 },
  ...[20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(S),
  T(9), T(8), T(7), T(6), T(5), T(4), T(3), T(2), T(1),
];
// Bitiriş double'ları tercih sırası
const DOUBLES = [20, 16, 18, 12, 10, 8, 19, 17, 14, 15, 13, 11, 9, 6, 4, 7, 5, 3, 2, 1].map(D).concat([{ n: 25, m: 2 }]);

const val = d => d.n * d.m;

function finishers(out) {
  if (out === 'double') return DOUBLES;
  if (out === 'master') return DOUBLES.concat([20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(T));
  return SETUP.concat(DOUBLES); // single out: herhangi bir ok
}

const cache = new Map();

/** Kalan puanı en fazla `darts` okla bitiren en iyi rota; yoksa null */
export function checkout(rest, darts = 3, out = 'double') {
  const key = rest + ':' + darts + ':' + out;
  if (cache.has(key)) return cache.get(key);
  const res = solve(rest, darts, out);
  cache.set(key, res);
  return res;
}

// En az okla biten rotayı seç; eşitse iyi double'a bırakanı tercih et
function solve(rest, darts, out) {
  if (rest <= 0 || rest > 180) return null;
  const fin = finishers(out);
  const finIdx = new Map();
  fin.forEach((f, i) => { if (!finIdx.has(val(f))) finIdx.set(val(f), i); });

  if (finIdx.has(rest)) return [fin[finIdx.get(rest)]];
  let best = null, bestCost = Infinity;
  if (darts >= 2) {
    SETUP.forEach((a, ia) => {
      const r = rest - val(a);
      if (!finIdx.has(r)) return;
      const cost = ia + finIdx.get(r) * 3;
      if (cost < bestCost) { bestCost = cost; best = [a, fin[finIdx.get(r)]]; }
    });
    if (best) return best;
  }
  if (darts >= 3) {
    SETUP.forEach((a, ia) => {
      const r1 = rest - val(a);
      if (r1 <= 1) return;
      SETUP.forEach((b, ib) => {
        const r2 = r1 - val(b);
        if (!finIdx.has(r2)) return;
        const cost = ia + ib + finIdx.get(r2) * 3;
        if (cost < bestCost) { bestCost = cost; best = [a, b, fin[finIdx.get(r2)]]; }
      });
    });
  }
  return best;
}
