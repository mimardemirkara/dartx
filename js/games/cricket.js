// Cricket ailesi: Standart, Cut-Throat, Full Board, Tactics, Mickey Mouse, Hidden, Crazy (+ Cricket antrenmanı)
// Hedef: sayı (1–20), 25 = Bull, 'D' = herhangi double, 'T' = herhangi triple.
import { esc, dartValue, adAvatar } from '../util.js';
import { t as tr } from '../i18n.js';

// Demir 09.11 (jargon): sayı TEK OKTA kapandıysa (ör. triple ile 0 → 3) halkanın içinde X yerine nokta
const markSym = (k, tek) => (k <= 0 ? '' : k === 1 ? '<i class="mk m1">/</i>' : k === 2 ? '<i class="mk m2">X</i>'
  : tek ? `<i class="mk m3 tek" aria-label="${tr('Tek okta kapandı')}"><b></b></i>` : '<i class="mk m3">X</i>');
const etiket = n => (n === 25 ? 'B' : n === 'B3' ? '3B' : n);
const hedefAd = n => (n === 25 ? 'Bull' : n === 'H' ? 'H' : n === 'B3' ? '3B' : n === 'D' ? 'D' : n === 'T' ? 'T' : n);
const aralik = (a, b) => Array.from({ length: a - b + 1 }, (_, i) => a - i);

function rastgeleSayilar(adet, haric = []) {
  const havuz = aralik(20, 1).filter(n => !haric.includes(n));
  for (let i = havuz.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [havuz[i], havuz[j]] = [havuz[j], havuz[i]]; }
  return havuz.slice(0, adet).sort((x, y) => y - x);
}

// Bir okun hedefe kaç işaret verdiği
function isaret(hedef, d) {
  if (d.n === 0) return 0;
  if (hedef === 'D') return d.m === 2 && d.n !== 25 ? 1 : 0;
  if (hedef === 'T') return d.m === 3 ? 1 : 0;
  if (hedef === 'H' || hedef === 'B3') return 0; // House / 3B turun sonunda ayrıca sayılır
  return d.n === hedef ? d.m : 0;
}

const TUR = {
  cricket:   { ad: 'Standart Kriket', hedef: () => [...aralik(20, 15), 25] },
  cutthroat: { ad: 'Cut-Throat Kriket', hedef: () => [...aralik(20, 15), 25], cut: true, min: 2 },
  fullboard: { ad: 'Full Board Kriket', hedef: () => [...aralik(20, 1), 25] },
  tactics:   { ad: 'Tactics', hedef: () => [...aralik(20, 10), 25] },
  mickey:    { ad: 'Mickey Mouse', hedef: () => [...aralik(20, 12), 'D', 'T', 25] },
  hidden:    { ad: 'Hidden Kriket', hedef: () => [...rastgeleSayilar(6), 25], gizli: true },
  crazy:     { ad: 'Crazy Kriket', hedef: () => [...rastgeleSayilar(6), 25], degisen: true },
  // Cezalı Kriket (Türkiye; darttr.com) — Demir'lerin sürekli oynadığı. Sayılar + D + T + B + H (House: 3 ok aynı sayı).
  // Puan kendine yazılır (en yüksek kazanır); Cezasız: puan yok. Double/triple/house'ta oyuncu seçer: sayıya mı, D/T/H'ye mi.
  turk: { ad: 'Türk Kriketi', hedef: m => [...aralik(20, Number(m?.opts?.sayilar) || 10), 'D', 'T', 25, 'H'], secimli: true,
    modlar: [['on', 'Cezalı'], ['off', 'Cezasız']],
    ek: [{ key: 'sayilar', label: 'Sayılar', type: 'choice', values: [[10, '20–10'], [12, '20–12'], [15, '20–15']], def: 10 }] },
  // Minnesota Kriket (dünyadaki hali; Wild Mouse): 20–15 + D + T + B + 3B ("3 in a bed": bir elde 3 ok aynı sayıda).
  // Seçim yok: ok hem sayısına hem D/T'ye işaret koyar; D, T ve 3B tahtadaki her sayıdan sayılır.
  minnesota: { ad: 'Minnesota Kriket', hedef: () => [...aralik(20, 15), 'D', 'T', 25, 'B3'] },
};

const KISA = {
  cricket: '15–20 ve Bull\'u kapat, açık sayılardan puan topla',
  cutthroat: 'Puanlar rakibe yazılır — en düşük puan kazanır',
  fullboard: '1\'den 20\'ye bütün sayılar ve Bull — tam tahta',
  tactics: '10–20 ve Bull — daha uzun, daha taktiksel',
  mickey: '12–20, herhangi double, herhangi triple ve Bull',
  hidden: 'Hedefler gizli — vurdukça ortaya çıkar',
  crazy: 'Kimsenin dokunmadığı hedefler her tur değişir',
  turk: '20–10, D, T, B, H — Cezalı ya da Cezasız; Türkiye\'de en çok oynanan kriket',
  minnesota: '20–15, D, T, B ve 3B (3 ok aynı sayı) — dünyadaki hali',
};
const ORTAK = 'Her hedefi 3 işaretle kapatırsın (single 1, double 2, triple 3; 25 = 1, Bull = 2).';
const KURAL = {
  minnesota: `Hedefler 20'den 15'e kadar sayılar, <b>D</b> (double), <b>T</b> (triple), <b>B</b> (Bull) ve <b>3B</b> ("3 in a bed"). ${ORTAK}
<b>D ve T:</b> tahtadaki her double D'ye, her triple T'ye 1 işaret koyar; ok aynı anda kendi sayısına da işaret koyar (seçim yok).
<b>3B:</b> bir elde 3 okun üçü de aynı sayıya girerse 1 işaret; tahtadaki her sayı geçerlidir.
Kapattığın ama rakibin kapatmadığı hedefe vurdukça puan alırsın (Oyun modu: Puanlı, Cezalı ya da Cezasız).
Tüm hedefleri kapatan ve puanda geride olmayan kazanır.`,
  turk: `Hedefler 20'den 10'a kadar sayılar (istersen 12'ye ya da 15'e kadar), <b>D</b> (double), <b>T</b> (triple), <b>B</b> (Bull) ve <b>H</b> (House). Her hedef 3 işaretle kapanır.
<b>Double attığında seçersin:</b> o sayıya 2 işaret ya da D'ye 1 işaret. <b>Triple'da:</b> sayıya 3 işaret (tek seferde kapatır) ya da T'ye 1 işaret. Double Bull: Bull'a 2 işaret ya da D'ye 1 işaret.
<b>House:</b> bir elde 3 okun üçü de tablodaki aynı sayıya girerse, ya o sayıya yazarsın ya da H'ye 1 işaret. Tablo dışındaki sayılar D, T ve H için de sayılmaz.
<b>Cezalı:</b> kapattığın ama rakibin kapatmadığı hedefe vurdukça puanı kendi hanene yazarsın (Bull 25, double Bull 50). Tüm hedefleri kapatan ve puanı yüksek olan kazanır; puanı düşük olan, rakibin açık hedeflerine vurarak öne geçebilir.
<b>Cezasız:</b> puan yok; bütün hedefleri ilk kapatan kazanır.`,
  cricket: `Hedefler 15–20 ve Bull. ${ORTAK}
Kapattığın ama rakibin henüz kapatmadığı sayıya vurdukça puan toplarsın.
Tüm sayıları kapatan ve puanı rakiplerden düşük olmayan kazanır.`,
  cutthroat: `Hedefler 15–20 ve Bull. ${ORTAK}
Kapattığın sayıya vurmaya devam edersen, o sayıyı <b>kapatmamış rakiplerin</b> hanesine puan yazılır.
Tüm sayıları kapatan ve <b>en düşük</b> (ya da eşit en düşük) puana sahip olan kazanır. Grupta en eğlenceli Kriket türü.`,
  fullboard: `Hedefler tahtanın tamamı: 1'den 20'ye bütün sayılar ve Bull. ${ORTAK}
Kapattığın ama rakibin kapatmadığı sayıya vurdukça puan toplarsın.
21 hedefin hepsini kapatan ve puanı rakiplerden düşük olmayan kazanır. Uzun ve dayanıklılık isteyen bir maç.`,
  tactics: `Hedefler 10'dan 20'ye ve Bull. ${ORTAK}
Kapattığın ama rakibin kapatmadığı sayıya vurdukça puan toplarsın.
Tüm hedefleri kapatan ve puanı rakiplerden düşük olmayan kazanır.`,
  mickey: `Hedefler 12'den 20'ye, <b>herhangi bir double</b>, <b>herhangi bir triple</b> ve Bull. ${ORTAK}
<b>Double hedefi:</b> tahtadaki her double 1 işaret sayılır. <b>Triple hedefi:</b> her triple 1 işaret sayılır.
Kapattığın ama rakibin kapatmadığı hedefe vurdukça okun değeri kadar puan toplarsın.
Tüm hedefleri kapatan ve puanı rakiplerden düşük olmayan kazanır.`,
  hidden: `Oyun başında rastgele 6 sayı ve Bull hedef olur ama sayılar <b>gizlidir</b>. ${ORTAK}
Bir oyuncu gizli bir sayıya vurunca o hedef herkes için ortaya çıkar.
Kapattığın ama rakibin kapatmadığı sayıya vurdukça puan toplarsın.
Tüm hedefleri kapatan ve puanı rakiplerden düşük olmayan kazanır.`,
  crazy: `Rastgele 6 sayı ve Bull hedef olur. ${ORTAK}
Her turun başında, <b>henüz kimsenin işaret koymadığı</b> sayılar yeni rastgele sayılarla değişir.
Kapattığın ama rakibin kapatmadığı sayıya vurdukça puan toplarsın.
Tüm hedefleri kapatan ve puanı rakiplerden düşük olmayan kazanır.`,
};

function make(id) {
  const T = TUR[id];
  // Oyun modu (her türde): Puanlı (standart) · Cezalı (Cut-Throat: puan rakibe) · Cezasız (puansız)
  const cezali = m => m.opts.scoring === 'ceza';
  const puanli = m => m.opts.scoring !== 'off';
  const hedefler = g => g.h;
  // Eski sürümde kaydedilmiş maç (g.h / g.acik yok): hedefleri oyuncu tablosundan çıkar, yeni biçime çevir
  const uyumla = g => {
    if (!g || !g.s || g.h) return;
    const k = Object.keys(g.s[0]?.k || {}).map(x => (isNaN(+x) ? x : +x));
    g.h = k.filter(n => n !== 25).sort((x, y) => (typeof y === 'number' ? y : 0) - (typeof x === 'number' ? x : 0)).concat(k.includes(25) ? [25] : []);
    if (!g.h.length) g.h = T.hedef();
    g.acik = g.h.slice(); g.tur = g.tur || 1;
  };
  // ---- Seçimli yazım (Cezalı Kriket)
  const faydali = (m, g, hedef) => {
    if (!hedefler(g).includes(hedef)) return false;
    const me = g.s[m.cur], others = g.s.filter((_, i) => i !== m.cur);
    return me.k[hedef] < 3 || (puanli(m) && others.some(o => o.k[hedef] < 3));
  };
  const sayiDegeri = n => (n === 25 ? 25 : n);
  function secimListesi(m, g, d) {
    const liste = [];
    const tablo = d.n > 0 && hedefler(g).includes(d.n);
    if (!tablo) return liste;
    const adet = d.m;
    if (faydali(m, g, d.n)) liste.push({ v: 'n', l: tr('{0} · {1} işaret', hedefAd(d.n), adet) });
    if (d.m === 2 && faydali(m, g, 'D')) liste.push({ v: 'D', l: tr('Double · 1 işaret') });
    if (d.m === 3 && faydali(m, g, 'T')) liste.push({ v: 'T', l: tr('Triple · 1 işaret') });
    const td = m.turnDarts || [];
    const onceki = td[td.length - 1] === d ? td.slice(0, -1) : td; // ok henüz eklenmemiş ya da eklenmiş olabilir
    if (onceki.length === 2 && onceki.every(x => x.n === d.n) && faydali(m, g, 'H')) liste.push({ v: 'H', l: tr('House · 1 işaret') });
    // Anlık hesap (Demir 09.11: "şu kadar puan / ceza gibi anlık hesaplarsan daha teşvik edici olur")
    liste.forEach(x => { x.e = onizle(m, g, d, x.v, onceki); });
    return liste;
  }
  // Bu seçenek yazılırsa ne olur: kaç puan (ya da rakibe ceza), hangi hedef kapanır
  function onizle(m, g, d, v, onceki) {
    const turBasi = g.turBasi && g.turBasi.tur === m.round && g.turBasi.cur === m.cur && onceki.length ? g.turBasi.s : null;
    const taban = v === 'H' && turBasi ? turBasi : g.s;
    const kopya = { ...g, s: JSON.parse(JSON.stringify(taban)) };
    const once = JSON.parse(JSON.stringify(taban));
    const rec = { marks: 0 };
    const hedef = v === 'n' ? d.n : v;
    const deger = v === 'H' ? onceki.concat([d]).reduce((a, x) => a + dartValue(x), 0) : v === 'n' ? sayiDegeri(d.n) : dartValue(d);
    yaz(m, kopya, rec, hedef, v === 'n' ? d.m : 1, deger);
    const ben = kopya.s[m.cur], benOnce = once[m.cur];
    const puan = ben.pts - benOnce.pts;
    const ceza = kopya.s.reduce((a, o, i) => a + (i === m.cur ? 0 : o.pts - once[i].pts), 0);
    const kapanir = benOnce.k[hedef] < 3 && ben.k[hedef] >= 3;
    const parca = [];
    if (kapanir) parca.push(tr('{0} kapanır', hedefAd(hedef)));
    // Türk Kriketi dilinde fazla yazılan puan rakibe cezadır (Demir 09.11: "2 ok için 22 ceza yazarsın")
    if (puan + ceza > 0) parca.push(tr('rakibe {0} ceza', puan + ceza));
    if (v === 'H' && turBasi && g.s[m.cur].pts > turBasi[m.cur].pts && puan <= 0 && !kapanir) parca.push(tr('önceki oklar silinir'));
    return { tur: puan > 0 || ceza > 0 ? 'puan' : kapanir ? 'kapat' : 'bos', metin: parca.join(' · ') || tr('{0} olur: {1}/3', hedefAd(hedef) === 'H' ? 'House' : hedefAd(hedef) === 'D' ? 'Double' : hedefAd(hedef) === 'T' ? 'Triple' : hedefAd(hedef), ben.k[hedef]) };
  }
  // Bir hedefe 'adet' işaret yaz; kapalıysa (rakip açıkken) puanı kendine yaz
  function yaz(m, g, rec, hedef, adet, deger) {
    const me = g.s[m.cur], others = g.s.filter((_, i) => i !== m.cur);
    for (let h = 0; h < adet; h++) {
      if (me.k[hedef] < 3) { me.k[hedef]++; rec.marks++; me.marks++; continue; }
      if (!puanli(m)) continue;
      if (!others.some(o => o.k[hedef] < 3)) continue;
      rec.marks++; me.marks++; me.pts += deger;
    }
  }
  function secimliDart(m, g, d, rec, oyunNesnesi) {
    if (!g.turBasi || g.turBasi.tur !== m.round || g.turBasi.cur !== m.cur || (m.turnDarts || []).length === 1)
      g.turBasi = { tur: m.round, cur: m.cur, s: JSON.parse(JSON.stringify(g.s)) };
    const liste = secimListesi(m, g, d);
    const sec = d.sec && liste.some(x => x.v === d.sec) ? d.sec : (liste[0] ? liste[0].v : null);
    if (sec === 'H') {
      // House: bu elin üç oku tek bir H işareti olur — önceki iki okun yazdıkları geri alınır
      g.s = JSON.parse(JSON.stringify(g.turBasi.s));
      rec.marks = 0;
      const td = (m.turnDarts || []).filter(x => x !== d).concat([d]).slice(-3);
      yaz(m, g, rec, 'H', 1, td.reduce((a, x) => a + dartValue(x), 0));
      m.msg = tr('House!');
    } else if (sec === 'D' || sec === 'T') {
      yaz(m, g, rec, sec, 1, dartValue(d));
    } else if (sec === 'n') {
      yaz(m, g, rec, d.n, d.m, sayiDegeri(d.n));
    }
    const w = oyunNesnesi.winnerNow(m, g);
    if (w !== null) return { legWinner: w };
  }

  const oyun = {
    id, name: T.ad, cat: 'cricket', short: KISA[id], rules: KURAL[id],
    min: T.min || 1, max: 8, maxTekli: 6, teams: true, legs: true, // tekli 6 (SE'de sütun 44 px), takım 4'e 4
    options: [
      ...(T.ek || []),
      { key: 'scoring', label: 'Oyun modu', type: 'choice', values: T.modlar || [['on', 'Puanlı'], ['ceza', 'Cezalı'], ['off', 'Cezasız']], def: T.cut ? 'ceza' : 'on' },
      { key: 'rounds', label: 'Tur sınırı', type: 'choice', values: [[0, 'Sınırsız'], [15, '15'], [20, '20'], [25, '25']], def: 0 },
    ],

    init(m) {
      const h = T.hedef(m);
      return { h, acik: T.gizli ? [25] : h.slice(), tur: 1, s: m.sides.map(() => ({ k: Object.fromEntries(h.map(n => [n, 0])), pts: 0, marks: 0 })) };
    },

    // Crazy: yeni round başında kimsenin dokunmadığı sayılar değişir
    startTurn(m, g) {
      if (!T.degisen || g.tur === m.round) return;
      g.tur = m.round;
      const dokunulmamis = g.h.filter(n => n !== 25 && g.s.every(s => s.k[n] === 0));
      if (!dokunulmamis.length) return;
      const kalan = g.h.filter(n => !dokunulmamis.includes(n));
      const yeni = rastgeleSayilar(dokunulmamis.length, kalan);
      g.h = [...kalan.filter(n => n !== 25), ...yeni].sort((a, b) => b - a).concat(25);
      g.acik = g.h.slice();
      g.s.forEach(s => { dokunulmamis.forEach(n => delete s.k[n]); yeni.forEach(n => (s.k[n] = 0)); });
      m.msg = tr('Hedefler değişti!');
    },

    // Tuş takımında yalnız oyundaki sayılar (Demir 08.11: "ekranda yere ihtiyacımız var"): başka sayının hiçbir şeye
    // sayılmadığı türlerde (Standart, Cut-Throat, Tactics, Crazy, Türk Kriketi). Herhangi double/triple'ın sayıldığı
    // (Mickey, Minnesota), gizli hedefli (Hidden) ve tam tahta (Full Board) türlerde 1–20'nin hepsi kalır.
    tuslar(m, g) {
      if (T.gizli) return null;
      const h = hedefler(g);
      if (!T.secimli && h.some(n => n === 'D' || n === 'T' || n === 'B3')) return null;
      const sayilar = h.filter(n => typeof n === 'number' && n !== 25).sort((a, b) => a - b);
      return sayilar.length >= 20 ? null : sayilar;
    },

    // Seçimli oyun (Cezalı Kriket): bu ok için olası yazımlar; birden fazlaysa uygulama oyuncuya sorar
    secenekler(m, g, d) {
      if (!T.secimli) return null;
      const sec = secimListesi(m, g, d);
      return sec.length > 1 ? sec : null;
    },

    dart(m, g, d, rec) {
      // Tek okta kapanış: bu oktan önce 0 işaretli olan hedef bu okla 3'e ulaştıysa işaretle
      const once = { ...g.s[m.cur].k };
      const r = this.tekOk(m, g, d, rec);
      const me = g.s[m.cur]; // House seçiminde g.s yeniden kurulabilir — güncel nesneyi al
      let tekOldu = false;
      for (const n of Object.keys(me.k)) if (once[n] === 0 && me.k[n] >= 3) { (me.tek = me.tek || {})[n] = 1; tekOldu = true; }
      // Sevinç anları (Demir 09.11): House / 3 in a bed / tek okta kapanış → kutlama animasyonu + sesi
      if (m.msg === tr('House!') || m.msg === tr('3 in a bed!')) m.kutla = true;
      // Demir 09.11: hepsini kapattığı an puanda gerideyse anlık uyarı — nereye vurması gerektiğiyle
      const kapaliOnce = hedefler(g).every(n => (once[n] || 0) >= 3), kapaliSimdi = hedefler(g).every(n => me.k[n] >= 3);
      if (!kapaliOnce && kapaliSimdi && puanli(m) && !cezali(m) && m.sides.length > 1 && !r?.legWinner) {
        const en = Math.max(...g.s.filter(x => x !== me).map(x => x.pts));
        if (me.pts < en) {
          const vur = this.vurHedef(m, g);
          m.msg = tr('Hepsini kapattın ama {0} puan geridesin!', en - me.pts) + (vur.length ? ' ' + tr('Puan için vur: {0}', vur.join(', ')) : '');
        }
      }
      else if (tekOldu && !m.msg) { m.msg = tr('Tek okta kapattı!'); m.kutla = true; }
      return r;
    },

    tekOk(m, g, d, rec) {
      rec.marks = rec.marks || 0;
      if (T.secimli) return secimliDart(m, g, d, rec, this);
      const me = g.s[m.cur];
      const others = g.s.filter((_, i) => i !== m.cur);
      for (const hedef of hedefler(g)) {
        const adet = isaret(hedef, d);
        if (!adet) continue;
        if (T.gizli && !g.acik.includes(hedef)) { g.acik.push(hedef); m.msg = tr('Gizli hedef: {0}', hedefAd(hedef)); }
        const deger = hedef === 'D' || hedef === 'T' ? dartValue(d) : (hedef === 25 ? 25 : hedef);
        for (let h = 0; h < adet; h++) {
          if (me.k[hedef] < 3) { me.k[hedef]++; rec.marks++; me.marks++; continue; }
          if (!puanli(m)) continue;
          const open = others.filter(o => o.k[hedef] < 3);
          if (!open.length) continue;
          rec.marks++; me.marks++;
          const p = hedef === 'D' || hedef === 'T' ? deger : deger; // D/T: okun değeri, sayı: sayının kendisi
          if (cezali(m)) open.forEach(o => (o.pts += p)); else me.pts += p;
          if (hedef === 'D' || hedef === 'T') break; // D/T için ok başına bir puanlama
        }
      }
      // House: turun üçüncü okunda üç ok da aynı sayı dilimindeyse 1 işaret (kapalıysa 3 okun toplamı kadar puan)
      const td = m.turnDarts || [];
      const hk = hedefler(g).includes('H') ? 'H' : hedefler(g).includes('B3') ? 'B3' : null;
      if (hk && td.length === 3 && td[0].n > 0 && td.every(x => x.n === td[0].n)) {
        m.msg = tr(hk === 'H' ? 'House!' : '3 in a bed!');
        if (me.k[hk] < 3) { me.k[hk]++; rec.marks++; me.marks++; }
        else if (puanli(m)) {
          const open = others.filter(o => o.k[hk] < 3);
          const p = td.reduce((a, x) => a + dartValue(x), 0);
          if (open.length) { rec.marks++; me.marks++; if (cezali(m)) open.forEach(o => (o.pts += p)); else me.pts += p; }
        }
      }
      const w = this.winnerNow(m, g);
      if (w !== null) return { legWinner: w };
    },

    winnerNow(m, g) {
      const me = g.s[m.cur];
      if (!hedefler(g).every(n => me.k[n] >= 3)) return null;
      if (!puanli(m)) return m.cur;
      const others = g.s.filter((_, i) => i !== m.cur).map(o => o.pts);
      if (!others.length) return m.cur;
      if (cezali(m) ? me.pts <= Math.min(...others) : me.pts >= Math.max(...others)) return m.cur;
      return null;
    },

    endTurn(m, g, rec, lastOfRound) {
      const lim = m.opts.rounds;
      if (lim && lastOfRound && m.round >= lim) {
        let best = 0;
        g.s.forEach((s, i) => {
          const b = g.s[best];
          const better = cezali(m) ? s.pts < b.pts : s.pts > b.pts;
          if (better || (s.pts === b.pts && s.marks > b.marks)) best = i;
        });
        return { legWinner: best };
      }
    },

    // Puan alınabilecek hedefler: ben kapattım, rakiplerden biri kapatmadı (hepsi kapalıyken ipucunun yanında renkli)
    vurHedef(m, g) {
      if (!puanli(m) || cezali(m)) return [];
      const me = g.s[m.cur], others = g.s.filter((_, i) => i !== m.cur);
      if (!hedefler(g).every(n => me.k[n] >= 3)) return [];
      return hedefler(g).filter(n => others.some(o => o.k[n] < 3)).map(n => (n === 25 ? 'B' : hedefAd(n)));
    },
    hint(m, g) {
      const me = g.s[m.cur];
      const left = hedefler(g).filter(n => me.k[n] < 3);
      if (!left.length) return tr(cezali(m) ? 'Hepsi kapalı — puanın en düşük olunca kazanırsın' : 'Hepsi kapalı — puanda öne geç!');
      const goster = left.map(n => (T.gizli && !g.acik.includes(n) ? '?' : n === 25 ? 'B' : hedefAd(n)));
      return tr('Açık: {0}', goster.join(' · '));
    },

    // Puan durumu (Demir 09.11: "komple kapatmış ama oyunun neden bitmediğini anlamamış"): kim önde, fark kaç,
    // geride olan nereye vurarak öne geçer. Her okta yenilenir.
    durum(m, g) {
      if (!puanli(m) || m.sides.length < 2) return null;
      const me = g.s[m.cur], others = g.s.map((s, i) => ({ s, i })).filter(x => x.i !== m.cur);
      const ad = i => m.sides[i].name || ('#' + (i + 1));
      const hepsiKapali = hedefler(g).every(n => me.k[n] >= 3);
      // puan alınabilecek hedefler: ben kapattım, rakiplerden biri kapatmadı
      const puanYeri = hedefler(g).filter(n => me.k[n] >= 3 && others.some(o => o.s.k[n] < 3)).map(hedefAd);
      if (cezali(m)) { // Cut-throat: düşük puan kazanır
        const en = others.reduce((a, b) => (b.s.pts < a.s.pts ? b : a));
        const fark = me.pts - en.s.pts;
        if (fark <= 0) return { tur: 'onde', metin: tr('Öndesin · fark {0}', -fark) };
        return { tur: 'geride', metin: tr('{0} puan fazlan var · rakiplerinin kapatmadığı hedefleri kapat', fark) };
      }
      const en = others.reduce((a, b) => (b.s.pts > a.s.pts ? b : a));
      const fark = me.pts - en.s.pts;
      if (fark > 0) return { tur: 'onde', metin: tr('Öndesin · +{0} puan', fark) + (hepsiKapali ? '' : ' · ' + tr('hepsini kapatırsan kazanırsın')) };
      const yer = puanYeri.length && !hepsiKapali ? ' · ' + tr('puan için vur: {0}', puanYeri.join(', ')) : ''; // hepsi kapalıyken hedefler ipucu satırında
      if (fark === 0) return { tur: 'esit', metin: tr('Puan eşit') + yer };
      return { tur: 'geride', metin: (hepsiKapali ? tr('Hepsini kapattın ama {0} puan geridesin', -fark) : tr('{0} puan geridesin', -fark)) + yer };
    },

    highlight(m, g) {
      const me = g.s[m.cur];
      const others = g.s.filter((_, i) => i !== m.cur);
      return hedefler(g).filter(n => typeof n === 'number' && (!T.gizli || g.acik.includes(n)) && (me.k[n] < 3 || others.some(o => o.k[n] < 3))).map(n => ({ n, m: 1 }));
    },

    view(m, g, ctx) {
      const orta = m.sides.length === 2;
      const headHucre = i =>
        `<th class="${ctx.active(i) ? 'active' : ''}" style="--pc:${ctx.color(i)}"><div class="cn">${adAvatar(ctx.name(i))}${esc(ctx.name(i))}${ctx.legInfo(i)}</div>${ctx.uyeler ? ctx.uyeler(i) : ''}<div class="cp">${puanli(m) ? g.s[i].pts : ''}</div></th>`;
      const rows = hedefler(g).map(n => {
        const gizli = T.gizli && !g.acik.includes(n);
        const allClosed = g.s.every(s => s.k[n] >= 3);
        // Dokunulabilir (yalnız açık sayı hedefleri): sayıya ya da sırası gelen oyuncunun hücresine dokununca isabet
        // D / T / H / 3B satırları (Demir 09.11: "Türk Kriketi'nde tablodan D, T, H basmıyor"): dokununca hangi sayı diye sorulur
        const dokun = gizli ? '' : typeof n === 'number' ? `data-act="dart" data-n="${n}"` : `data-act="ozelsatir" data-h="${n}"`;
        const tik = dokun ? 'tikla' : '';
        const sayi = `<td class="num ${tik}" ${dokun}>${gizli ? '?' : etiket(n)}</td>`;
        const hucre = (s, i) => `<td class="${ctx.active(i) ? 'active ' + tik : ''}" ${ctx.active(i) ? dokun : ''}>${markSym(s.k[n], s.tek && s.tek[n])}</td>`;
        // İki taraf (Demir 09.11): sayılar ortada, klasik kriket tahtası gibi — solda 1. taraf, sağda 2. taraf
        const ic = orta ? hucre(g.s[0], 0) + sayi + hucre(g.s[1], 1) : sayi + g.s.map(hucre).join('');
        return `<tr class="${allClosed ? 'dead' : ''} ${gizli ? 'gizli' : ''}">${ic}</tr>`;
      }).join('');
      const basliklar = m.sides.map((_, i) => headHucre(i));
      const ust = orta ? basliklar[0] + '<th class="orta-bas"></th>' + basliklar[1] : '<th></th>' + basliklar.join('');
      return `<div class="board cricket ${orta ? 'orta-sayi' : ''} ${hedefler(g).length > 10 ? 'uzun' : ''}"><table class="ctable"><thead><tr>${ust}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },

    summary(m, pid) {
      const t = m.log.filter(x => x.pid === pid);
      const marks = t.reduce((a, x) => a + (x.marks || 0), 0);
      const nd = t.reduce((a, x) => a + x.darts.length, 0);
      return [
        ['MPR (tur başı işaret)', nd ? ((marks / nd) * 3).toFixed(2) : '–'],
        ['Toplam işaret', marks],
        ['Ok', nd],
      ];
    },
  };
  // Her (m, g) çağrısından önce eski kayıtları uyumla
  for (const [ad, fn] of Object.entries(oyun)) if (typeof fn === 'function' && ad !== 'init') oyun[ad] = function (m, g, ...r) { uyumla(g); return fn.call(this, m, g, ...r); };
  return oyun;
}

export const cricket = make('cricket');
export const cutthroat = make('cutthroat');
export const fullboard = make('fullboard');
export const tactics = make('tactics');
export const mickey = make('mickey');
export const turk = make('turk');
export const minnesota = make('minnesota');
export const hidden = make('hidden');
export const crazy = make('crazy');

// ───────── Cricket antrenmanı (MPR): belirli turda 15–20 ve Bull'a kaç işaret
export const crpractice = {
  id: 'crpractice', name: 'Kriket Antrenmanı', cat: 'practice',
  short: '15–20 ve Bull\'a işaret topla, MPR\'ını ölç',
  rules: `Hedefler 15–20 ve Bull. Kapatma yok: her isabet işaret sayılır (single 1, double 2, triple 3; 25 = 1, Bull = 2).
Turlar bitince toplam işaretin ve <b>MPR</b>'ın (tur başına işaret) görünür. 3'ün üstü iyi, 5'in üstü çok iyi bir MPR'dır.`,
  min: 1, max: 8, teams: false,
  options: [{ key: 'rounds', label: 'Tur', type: 'choice', values: [[10, '10'], [15, '15'], [20, '20']], def: 10 }],
  init(m) { return { s: m.sides.map(() => ({ mk: 0 })) }; },
  dart(m, g, d, rec) {
    const ok = (d.n >= 15 && d.n <= 20) || d.n === 25 ? d.m : 0;
    g.s[m.cur].mk += ok; rec.marks = (rec.marks || 0) + ok; rec.points = (rec.points || 0) + ok;
  },
  endTurn(m, g, rec, last) {
    if (last && m.round >= m.opts.rounds) {
      const v = g.s.map(s => s.mk); const mx = Math.max(...v);
      return { legWinner: v.filter(x => x === mx).length > 1 ? -1 : v.indexOf(mx) };
    }
  },
  hint(m) { return tr('Tur {0}/{1}', m.round, m.opts.rounds) + ' · 15–20 · Bull'; },
  highlight() { return [20, 19, 18, 17, 16, 15, 25].map(n => ({ n })); },
  view(m, g, ctx) {
    return `<div class="board x01 n${m.sides.length}">` + m.sides.map((_, i) => {
      const t = m.log.filter(x => x.side === i); const d = t.reduce((a, x) => a + x.darts.length, 0);
      return `<div class="side ${ctx.active(i) ? 'active' : ''}" style="--pc:${ctx.color(i)}"><div class="side-name">${adAvatar(ctx.name(i))}${esc(ctx.name(i))}</div>${ctx.uyeler ? ctx.uyeler(i) : ''}<div class="side-big">${g.s[i].mk}</div><div class="side-sub"><span>MPR ${d ? ((g.s[i].mk / d) * 3).toFixed(2) : '–'}</span><span>${tr('Tur {0}/{1}', Math.min(m.round, m.opts.rounds), m.opts.rounds)}</span></div></div>`;
    }).join('') + '</div>';
  },
  summary(m, pid) {
    const t = m.log.filter(x => x.pid === pid); const mk = t.reduce((a, x) => a + (x.marks || 0), 0); const d = t.reduce((a, x) => a + x.darts.length, 0);
    return [['MPR (tur başı işaret)', d ? ((mk / d) * 3).toFixed(2) : '–'], ['Toplam işaret', mk]];
  },
  score: (m, pid) => m.log.filter(x => x.pid === pid).reduce((a, x) => a + (x.marks || 0), 0),
};

// ───────── English Cricket (vurucu ve atıcı) — iki kişilik
export const english = {
  id: 'english', name: 'English Kriket', cat: 'cricket',
  short: 'Vurucu 40 üstünü koşu yapar, atıcı Bull ile wicket alır',
  rules: `İki oyuncu sırayla <b>vurucu</b> ve <b>atıcı</b> olur.
<b>Vurucu:</b> turundaki 3 okun toplamının 40'ı aşan kısmı kadar koşu (run) yapar. 60 atarsa 20 koşu.
<b>Atıcı:</b> yalnız Bull'a atar; 25 bir, Bull iki wicket alır.
10 wicket düşünce sıra değişir: atıcı vurucu olur ve rakibin koşusunu geçmeye çalışır.
İkinci vurucu hedefi geçerse anında kazanır; geçemeden 10 wicket düşerse ilk vurucu kazanır.`,
  min: 2, max: 2, teams: false,
  options: [{ key: 'wickets', label: 'Wicket', type: 'choice', values: [[10, '10'], [5, '5']], def: 10 }],
  init(m) { return { inn: 1, bat: 0, runs: [0, 0], wk: 0, hedef: null }; },
  dart(m, g, d, rec) {
    rec.points = (rec.points || 0) + dartValue(d);
    if (m.cur === g.bat) return;
    const w = d.n === 25 ? d.m : 0;
    if (!w) return;
    g.wk = Math.min(m.opts.wickets, g.wk + w); rec.wk = (rec.wk || 0) + w;
    if (g.wk < m.opts.wickets) return;
    if (g.inn === 1) {
      g.inn = 2; g.hedef = g.runs[g.bat] + 1; g.bat = 1 - g.bat; g.wk = 0; g.degisti = true; // bu elin okları atıcınındı: koşu yazılmaz
      m.msg = tr('Sıra değişti! Hedef: {0}', g.hedef);
      return { endTurn: true };
    }
    const a = g.runs[0], b = g.runs[1];
    return { legWinner: a === b ? -1 : a > b ? 0 : 1 };
  },
  endTurn(m, g, rec) {
    if (g.degisti) { g.degisti = false; return; }
    if (m.cur !== g.bat) return;
    const kosu = Math.max(0, (rec.points || 0) - 40);
    g.runs[g.bat] += kosu; rec.runs = kosu;
    if (kosu) m.msg = tr('+{0} koşu', kosu);
    if (g.inn === 2 && g.runs[g.bat] >= g.hedef) return { legWinner: g.bat };
  },
  hint(m, g) {
    if (m.cur === g.bat) return tr('Vurucu: 40\'ı aşan her puan koşu') + (g.hedef ? ' · ' + tr('Hedef {0}', g.hedef) : '');
    return tr('Atıcı: Bull\'a at · wicket {0}/{1}', g.wk, m.opts.wickets);
  },
  highlight(m, g) { return m.cur === g.bat ? [{ n: 20 }] : [{ n: 25 }]; },
  view(m, g, ctx) {
    return `<div class="board x01 n2">` + m.sides.map((_, i) => {
      const vurucu = i === g.bat;
      return `<div class="side ${ctx.active(i) ? 'active' : ''}" style="--pc:${ctx.color(i)}">
        <div class="side-name">${adAvatar(ctx.name(i))}${esc(ctx.name(i))}</div>${ctx.uyeler ? ctx.uyeler(i) : ''}
        <div class="side-big">${g.runs[i]}</div>
        <div class="side-sub"><span>${tr(vurucu ? 'Vurucu' : 'Atıcı')}</span>${vurucu ? `<span>W ${g.wk}/${m.opts.wickets}</span>` : ''}${vurucu && g.hedef ? `<span>${tr('Hedef {0}', g.hedef)}</span>` : ''}</div>
      </div>`;
    }).join('') + '</div>';
  },
  summary(m, pid) {
    const t = m.log.filter(x => x.pid === pid);
    return [['Koşu', t.reduce((a, x) => a + (x.runs || 0), 0)], ['Wicket', t.reduce((a, x) => a + (x.wk || 0), 0)]];
  },
};
