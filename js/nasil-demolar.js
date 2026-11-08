// DartX — Nasıl oynanır gösterimlerinin senaryoları (Kenan 09.11). Motor: nasil.js
// Her adım: kim (sıradaki oyuncu; null = açıklama), yazi(), oklar, isteğe bağlı hedef (tablo üstünde), isaret (tahtada yanıp sönen hedef).
// Ok: n (sayı; 0 ıska, 25 bull), m (çarpan) + tabloya etkisi (bkz. nasil.js okUygula), uyari, ses.
import { dil } from './i18n.js';

const Y = (tr, en) => (dil() !== 'en' ? tr : en);
// Kenan 09.11: ilk atan Kenan (mavi buz okları), rakibi Kenan (siyah-gri okları); üçüncü oyuncu Hediye (kor kırmızı okları)
const DEMIR = { ad: 'Demir', renk: '#e94b3c', ok: 'buz' }, KENAN = { ad: 'Kenan', renk: '#aab2bd', ok: 'kont' }, HEDIYE = { ad: 'Hediye', renk: '#2fb36d', ok: 'kor' };
const IKI = [DEMIR, KENAN], UC = [DEMIR, KENAN, HEDIYE], TEK = [DEMIR];
const A = (n, m = 1, e = {}) => ({ n, m, ...e }); // ok kısaltması
const ISKA = A(0);
const kriketAlt = (satirlar, extra = {}) => ({ tur: 'kriket', satirlar, oyuncular: IKI, ...extra });

export const DEMOLAR = {
  // ═══ ANA MAÇLAR
  x01: {
    tur: 'x01', baslangic: 301, oyuncular: IKI,
    adimlar: [
      { kim: null, yazi: () => Y('Herkes 301 (ya da 501) puanla başlar. Sırayla üçer ok atılır; attığın puan kalanından düşer. Sıfıra ilk inen leg\'i alır.', 'Everyone starts on 301 (or 501). Take turns throwing three darts; your score is subtracted. First to reach zero wins the leg.') },
      { kim: 0, yazi: () => Y('Demir üç oku da triple 20\'ye attı: 60 + 60 + 60 = 180, bir elde yapılabilecek en yüksek puan. 301 → 121.', 'Demir hits treble 20 three times: 60 + 60 + 60 = 180, the highest possible turn. 301 → 121.'),
        oklar: [A(20, 3, { x: 241 }), A(20, 3, { x: 181 }), A(20, 3, { x: 121, uyari: '180!', ses: 'yuzseksen' })] },
      { kim: 1, yazi: () => Y('Kenan: 20 + 5 + 1 = 26. 301 → 275.', 'Kenan: 20 + 5 + 1 = 26. 301 → 275.'),
        oklar: [A(20, 1, { x: 281 }), A(5, 1, { x: 276 }), A(1, 1, { x: 275 })] },
      { kim: 0, yazi: () => Y('Demir 121\'de. T20 ile 61\'e, bir T20 daha ile 1\'e indi. Son ok double olmak zorunda olduğu için 1 bitirilemez: BUST! Puan elin başındaki 121\'e döner, sıra geçer.', 'Demir is on 121. T20 takes him to 61, another T20 to 1. You must finish on a double, so 1 can\'t be finished: BUST! The score goes back to 121.'),
        oklar: [A(20, 3, { x: 61 }), A(20, 3, { x: 1, uyari: 'BUST!', ses: 'bust', geri: 121 })] },
      { kim: 1, yazi: () => Y('Kenan: T20 + 19 + 19 = 98. 275 → 177.', 'Kenan: T20 + 19 + 19 = 98. 275 → 177.'),
        oklar: [A(20, 3, { x: 215 }), A(19, 1, { x: 196 }), A(19, 1, { x: 177 })] },
      { kim: 0, yazi: () => Y('Demir yine 121\'de: T20 (61), 11 (50) ve Bull. Bull (50) double sayılır: tam sıfır, leg Demir\'in!', 'Demir is on 121 again: T20 (61), 11 (50) and the Bull. The bull (50) counts as a double: exactly zero, Demir wins the leg!'),
        oklar: [A(20, 3, { x: 61 }), A(11, 1, { x: 50 }), A(25, 2, { x: 0, uyari: () => Y('Demir kazandı!', 'Demir wins!'), ses: 'leg' })] },
    ],
  },

  killer: {
    tur: 'alan', oyuncular: UC,
    alanlar: [{ k: 'sayi', ad: () => Y('Sayısı', 'Number'), bas: [7, 14, 3] }, { k: 'can', ad: () => Y('Can', 'Lives'), bicim: 'kalp', bas: 3 }, { k: 'kil', ad: 'Killer', bicim: 'evet', evet: 'KILLER', bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Herkesin bir sayısı ve 3 canı var: Demir 7, Kenan 14, Hediye 3. Önce kendi sayının double\'ını vurup KILLER olmalısın.', 'Everyone gets a number and 3 lives: Demir 7, Kenan 14, Hediye 3. First hit the double of your own number to become a KILLER.') },
      { kim: 0, isaret: { n: 7, m: 2 }, yazi: () => Y('Demir tekli 7 attı: sayılmaz, double gerekir. Sonra double 7: artık KILLER!', 'Demir hits a single 7: it doesn\'t count, it must be the double. Then double 7: he is now a KILLER!'),
        oklar: [A(7), A(7, 2, { v: { kil: 1 }, uyari: 'KILLER!', ses: 'killer' }), ISKA] },
      { kim: 1, isaret: { n: 14, m: 2 }, yazi: () => Y('Kenan 14\'e iki tekli attı ama double tutturamadı; henüz killer değil, kimseye zarar veremez.', 'Kenan hits two single 14s but no double; not a killer yet, he can\'t hurt anyone.'),
        oklar: [A(14), A(14), A(11)] },
      { kim: 0, isaret: [{ n: 14, m: 2 }, { n: 3, m: 2 }], yazi: () => Y('Killer Demir rakiplerin double\'ına atar: D14 Kenan\'dan, D3 Hediye\'den bir can götürür. Ama dikkat: üçüncü ok kendi D7\'si — kendi canından gitti!', 'Killer Demir aims at his rivals\' doubles: D14 takes a life from Kenan, D3 from Hediye. Careful: the third dart hits his own D7 — he loses a life himself!'),
        oklar: [A(14, 2, { dd: [[1, { can: -1 }]] }), A(3, 2, { dd: [[2, { can: -1 }]] }), A(7, 2, { dv: { can: -1 }, uyari: () => Y('Kendi canından gitti!', 'Lost own life!'), ses: 'dusus' })] },
      { kim: 2, isaret: { n: 3, m: 2 }, yazi: () => Y('Hediye D3 ile killer oldu, ardından iki kez D14: Kenan\'ın canı bitti, elendi. Son kalan oyuncu kazanır.', 'Hediye becomes a killer with D3, then hits D14 twice: Kenan is out of lives. The last player standing wins.'),
        oklar: [A(3, 2, { v: { kil: 1 }, uyari: 'KILLER!', ses: 'killer' }), A(14, 2, { dd: [[1, { can: -1 }]] }), A(14, 2, { dd: [[1, { can: -1 }]], uyari: () => Y('Kenan elendi!', 'Kenan is out!'), ses: 'dusus' })] },
    ],
  },

  // ═══ KRİKET
  cricket: kriketAlt(['20', '19', '18', '17', '16', '15', 'B'], {
    adimlar: [
      { kim: null, yazi: () => Y('Standart Kriket: hedefler 20\'den 15\'e ve Bull. Her hedef 3 işaretle kapanır: single 1, double 2, triple 3 işaret.', 'Standard Cricket: targets 20 down to 15 and the Bull. Each closes with 3 marks: single 1, double 2, treble 3.') },
      { kim: 0, yazi: () => Y('Demir triple 20 attı: 20 tek okta kapandı. Kenan 20\'yi kapatmadığı için ikinci 20 puan getirdi: +20. Son ok 19\'a bir işaret.', 'Demir hits treble 20: closed in one dart. Kenan hasn\'t closed 20, so the next 20 scores: +20. The last dart puts one mark on 19.'),
        oklar: [A(20, 3, { k: [['20', 3]], tek: '20', uyari: () => Y('Tek okta kapattı!', 'Closed in one dart!'), ses: 'kutlama' }), A(20, 1, { p: 20 }), A(19, 1, { k: [['19', 1]] })] },
      { kim: 1, yazi: () => Y('Kenan iki kez 20 attı (/ ve X), sonra double 18: 18\'e iki işaret.', 'Kenan hits 20 twice (/ and X), then double 18: two marks on 18.'),
        oklar: [A(20, 1, { k: [['20', 1]] }), A(20, 1, { k: [['20', 1]] }), A(18, 2, { k: [['18', 2]] })] },
      { kim: 0, yazi: () => Y('Demir bir 20 daha: +20 (toplam 40). Sonra Bull: Bull 2 işaret sayılır.', 'Demir hits another 20: +20 (40 in total). Then the Bull: a bullseye counts as 2 marks.'),
        oklar: [A(20, 1, { p: 20 }), A(25, 2, { k: [['B', 2]] }), ISKA] },
      { kim: 1, yazi: () => Y('Kenan 20\'yi kapattı; artık 20\'den kimse puan alamaz. Bütün hedefleri kapatan ve puanda geride olmayan kazanır.', 'Kenan closes 20; now nobody can score on it. Close every target while not behind on points to win.'),
        oklar: [A(20, 1, { k: [['20', 1]] }), A(18, 1, { k: [['18', 1]] }), ISKA] },
    ],
  }),

  fullboard: kriketAlt(['20', '19', '…', '3', '2', '1', 'B'], {
    adimlar: [
      { kim: null, yazi: () => Y('Full Board: tahtanın tamamı hedef — 1\'den 20\'ye bütün sayılar ve Bull, 21 hedef. Kurallar Standart Kriket ile aynı; daha uzun bir maç.', 'Full Board: the whole board — every number 1 to 20 plus the Bull, 21 targets. Same rules as Standard Cricket; a longer match.') },
      { kim: 0, yazi: () => Y('Küçük sayılar da önemli: Demir 1, 1, 1 ile 1\'i kapattı.', 'Small numbers count too: Demir closes 1 with 1, 1, 1.'),
        oklar: [A(1, 1, { k: [['1', 1]] }), A(1, 1, { k: [['1', 1]] }), A(1, 1, { k: [['1', 1]] })] },
      { kim: 1, yazi: () => Y('Kenan T3 ile 3\'ü tek okta kapattı, sonra iki tekli 2.', 'Kenan closes 3 in one dart with T3, then two single 2s.'),
        oklar: [A(3, 3, { k: [['3', 3]], tek: '3', uyari: () => Y('Tek okta kapattı!', 'Closed in one dart!'), ses: 'kutlama' }), A(2, 1, { k: [['2', 1]] }), A(2, 1, { k: [['2', 1]] })] },
      { kim: 0, yazi: () => Y('Demir Kenan\'ın açık bıraktığı 1\'e vurdukça puan toplar: +1, +1. 21 hedefin hepsini kapatan ve puanda geride olmayan kazanır.', 'Demir scores on 1 while Kenan leaves it open: +1, +1. Close all 21 targets while not behind on points to win.'),
        oklar: [A(1, 1, { p: 1 }), A(1, 1, { p: 1 }), A(20, 1, { k: [['20', 1]] })] },
    ],
  }),

  turk: kriketAlt(['20', '19', '18', '…', 'D', 'T', 'B', 'H'], {
    adimlar: [
      { kim: null, yazi: () => Y('Türk Kriketi: 20\'den 10\'a sayılar ile D (double), T (triple), B (bull) ve H (house). Her birini 3 işaretle kapat; kapattığın yerden puan topla.', 'Turkish Cricket: numbers 20 down to 10 plus D (double), T (treble), B (bull) and H (house). Close each with 3 marks, then score on what you have closed.') },
      { kim: 0, yazi: () => Y('Demir 20, 20 attı: iki işaret (/ ve X). Sonra double 20: ister 20\'ye 2 işaret, ister Double kutusuna 1. 20\'yi seçti; 20 kapandı, artan işaret puan oldu: +20.', 'Demir throws 20, 20: two marks (/ and X). Then double 20: either 2 marks on 20 or 1 on D. He picks 20; it closes and the extra mark scores: +20.'),
        oklar: [A(20, 1, { k: [['20', 1]] }), A(20, 1, { k: [['20', 1]] }), A(20, 2, { k: [['20', 1]], p: 20, uyari: () => Y('20 kapandı · +20', '20 closed · +20') })] },
      { kim: 1, yazi: () => Y('Kenan triple 19 attı: 19 tek okta kapandı. Bizim masada bunun işareti içi noktalı halkadır. Sonraki iki ok ıska.', 'Kenan hits treble 19: closed in one dart. At our table that\'s a ring with a dot. The next two darts miss.'),
        oklar: [A(19, 3, { k: [['19', 3]], tek: '19', uyari: () => Y('Tek okta kapattı!', 'Closed in one dart!'), ses: 'kutlama' }), ISKA, ISKA] },
      { kim: 0, yazi: () => Y('Demir üç oku da 18 dilimine attı. Üçü aynı dilimde olunca oyuncu isterse hepsini tek bir House sayar!', 'Demir puts all three darts in the 18 segment. When all three land in the same segment, he may count them as one H mark: House!'),
        oklar: [A(18), A(18), A(18, 1, { k: [['H', 1]], uyari: 'House!', ses: 'kutlama' })] },
      { kim: 1, yazi: () => Y('Kenan 20\'yi henüz kapatmadı. Demir\'in kapattığı 20\'ye her isabet Demir\'e puan yazar; Kenan 20\'yi kapatınca bu biter.', 'Kenan hasn\'t closed 20 yet. Every hit by Demir on his closed 20 scores for him, until Kenan closes it.'),
        oklar: [A(17), ISKA, A(20, 1, { k: [['20', 1]] })] },
      { kim: 0, yazi: () => Y('Demir iki kez daha 20: +40, toplam 60 puan. Bütün hedefleri kapatıp puanda önde olan kazanır.', 'Demir hits 20 twice more: +40, 60 points in total. Close everything while ahead on points to win.'),
        oklar: [A(20, 1, { p: 20 }), A(20, 1, { p: 20 }), ISKA] },
    ],
  }),

  minnesota: kriketAlt(['20', '19', '18', '…', 'D', 'T', 'B', '3B'], {
    adimlar: [
      { kim: null, yazi: () => Y('Minnesota Kriket: 20\'den 15\'e, D, T, B ve 3B (aynı elde 3 ok aynı sayıya). Türk Kriketi\'nden farkı: seçim yok, her şey kendiliğinden yazılır.', 'Minnesota Cricket: 20 down to 15, D, T, B and 3B (three darts in the same number). Unlike Turkish Cricket there is no choice; everything is marked automatically.') },
      { kim: 0, yazi: () => Y('Demir double 20 attı: 20\'ye 2 işaret VE Double kutusuna 1 işaret — ikisi birden. Sonra triple 19: 19 kapandı, Triple kutusuna da 1 işaret.', 'Demir hits double 20: 2 marks on 20 AND 1 mark on D — both at once. Then treble 19: 19 closes and T gets a mark too.'),
        oklar: [A(20, 2, { k: [['20', 2], ['D', 1]] }), A(19, 3, { k: [['19', 3], ['T', 1]], tek: '19', uyari: () => Y('Tek okta kapattı!', 'Closed in one dart!'), ses: 'kutlama' }), ISKA] },
      { kim: 1, yazi: () => Y('Kenan üç oku da 18\'e attı: 18 kapandı ve 3B\'ye 1 işaret — "3 in a bed". 3B için tahtadaki her sayı geçerlidir.', 'Kenan puts all three darts in 18: 18 closes and 3B gets a mark — "3 in a bed". Any number on the board counts for 3B.'),
        oklar: [A(18, 1, { k: [['18', 1]] }), A(18, 1, { k: [['18', 1]] }), A(18, 1, { k: [['18', 1], ['3B', 1]], uyari: '3 in a bed!', ses: 'kutlama' })] },
    ],
  }),

  cutthroat: kriketAlt(['20', '19', '18', '…', 'B'], {
    oyuncular: UC,
    adimlar: [
      { kim: null, yazi: () => Y('Cut-Throat: hedefler Standart Kriket ile aynı ama puan ters işler — kapattığın sayıya vurursan puan, o sayıyı kapatmamış RAKİPLERE yazılır. En düşük puan kazanır.', 'Cut-Throat: same targets as Standard Cricket, but points work in reverse — hit a number you have closed and the points go to RIVALS who haven\'t closed it. Lowest score wins.') },
      { kim: 0, yazi: () => Y('Demir T20 ile 20\'yi kapattı. Sonraki iki 20 hem Kenan\'a hem Hediye\'ye 20\'şer puan yazdı.', 'Demir closes 20 with T20. The next two 20s give 20 points each to both Kenan and Hediye.'),
        oklar: [A(20, 3, { k: [['20', 3]], tek: '20' }), A(20, 1, { pd: [[1, 20], [2, 20]] }), A(20, 1, { pd: [[1, 20], [2, 20]] })] },
      { kim: 1, yazi: () => Y('Kenan da T20 ile 20\'yi kapattı; artık 20\'den yalnız Hediye\'ye puan gider. Kenan bir 20 daha attı: Hediye +20.', 'Kenan closes 20 with T20 too; now 20s only hurt Hediye. Kenan hits another 20: Hediye +20.'),
        oklar: [A(20, 3, { k: [['20', 3]], tek: '20' }), A(20, 1, { pd: [[2, 20]] }), ISKA] },
      { kim: 2, yazi: () => Y('Hediye 60 puanla en kötü durumda; hemen 20\'yi kapatmalı. Hepsini kapatan ve en düşük puanlı olan kazanır.', 'Hediye is worst off on 60; she must close 20 quickly. Close everything with the lowest score to win.'),
        oklar: [A(20, 1, { k: [['20', 1]] }), A(20, 2, { k: [['20', 2]] }), A(19, 1, { k: [['19', 1]] })] },
    ],
  }),

  tactics: kriketAlt(['20', '19', '…', '11', '10', 'B'], {
    adimlar: [
      { kim: null, yazi: () => Y('Tactics: Kriket\'in uzun hâli — hedefler 10\'dan 20\'ye ve Bull. Kurallar Standart Kriket ile aynı.', 'Tactics: the long version of Cricket — targets 10 to 20 and the Bull. Same rules as Standard Cricket.') },
      { kim: 0, yazi: () => Y('Demir 10, 10, 10 ile 10\'u kapattı. Küçük sayıları erken kapatmak taktiktir: rakip onlardan puan alamaz.', 'Demir closes 10 with 10, 10, 10. Closing small numbers early is tactical: your rival can\'t score on them.'),
        oklar: [A(10, 1, { k: [['10', 1]] }), A(10, 1, { k: [['10', 1]] }), A(10, 1, { k: [['10', 1]] })] },
      { kim: 1, yazi: () => Y('Kenan büyük oynadı: T20 ile 20 kapandı, T19 ile 19 kapandı.', 'Kenan goes big: T20 closes 20, T19 closes 19.'),
        oklar: [A(20, 3, { k: [['20', 3]], tek: '20' }), A(19, 3, { k: [['19', 3]], tek: '19' }), A(11, 1, { k: [['11', 1]] })] },
    ],
  }),

  mickey: kriketAlt(['20', '19', '…', '12', 'D', 'T', 'B'], {
    adimlar: [
      { kim: null, yazi: () => Y('Mickey Mouse: hedefler 12\'den 20\'ye, "herhangi bir double" (D), "herhangi bir triple" (T) ve Bull.', 'Mickey Mouse: targets 12 to 20, "any double" (D), "any treble" (T) and the Bull.') },
      { kim: 0, isaret: { n: 'D', m: 2 }, yazi: () => Y('Tahtadaki her double, Double kutusuna 1 işaret yazar: Demir D5 attı — 5 hedef değil ama Double kutusuna işaret yazıldı. Sonra T3: Triple kutusuna 1 işaret.', 'Every double on the board marks D: Demir hits D5 — 5 isn\'t a target but D gets a mark. Then T3: one mark on T.'),
        oklar: [A(5, 2, { k: [['D', 1]] }), A(3, 3, { k: [['T', 1]] }), A(20, 1, { k: [['20', 1]] })] },
      { kim: 1, yazi: () => Y('Kenan 12, 12, 12 ile 12\'yi kapattı. Kapattığın ama rakibin kapatmadığı hedefe vurdukça puan alırsın.', 'Kenan closes 12 with 12, 12, 12. Hit targets you have closed and your rival hasn\'t to score.'),
        oklar: [A(12, 1, { k: [['12', 1]] }), A(12, 1, { k: [['12', 1]] }), A(12, 1, { k: [['12', 1]] })] },
    ],
  }),

  hidden: kriketAlt(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'B'], {
    etiketler: { h1: '?', h2: '?', h3: '?', h4: '?', h5: '?', h6: '?' },
    adimlar: [
      { kim: null, yazi: () => Y('Hidden Kriket: oyun başında 6 sayı ve Bull hedef olur ama sayılar gizlidir. Biri gizli sayıya vurunca o hedef herkes için açılır.', 'Hidden Cricket: 6 numbers and the Bull are targets, but the numbers are hidden. When someone hits a hidden number, it is revealed for everyone.') },
      { kim: 0, yazi: () => Y('Demir 17 attı: 17 gizli hedeflerden biriymiş — açıldı ve 1 işaret aldı. 5 ise hedef değil.', 'Demir hits 17: it was one of the hidden targets — revealed with one mark. 5 isn\'t a target.'),
        oklar: [A(17, 1, { ac: ['h1', '17'], k: [['h1', 1]], uyari: () => Y('Gizli hedef: 17', 'Hidden target: 17'), ses: 'sira' }), A(5), A(17, 1, { k: [['h1', 1]] })] },
      { kim: 1, yazi: () => Y('Kenan T12 attı: 12 de gizli hedefmiş, açıldı ve tek okta kapandı.', 'Kenan hits T12: 12 was hidden too — revealed and closed in one dart.'),
        oklar: [A(12, 3, { ac: ['h2', '12'], k: [['h2', 3]], tek: 'h2', uyari: () => Y('Gizli hedef: 12', 'Hidden target: 12'), ses: 'kutlama' }), ISKA, A(17, 1, { k: [['h1', 1]] })] },
    ],
  }),

  crazy: kriketAlt(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'B'], {
    etiketler: { h1: '17', h2: '8', h3: '3', h4: '12', h5: '19', h6: '6' },
    adimlar: [
      { kim: null, yazi: () => Y('Crazy Kriket: rastgele 6 sayı ve Bull hedef olur. Her turun başında kimsenin işaret koymadığı sayılar yeni rastgele sayılarla değişir.', 'Crazy Cricket: 6 random numbers plus the Bull. At the start of each turn, numbers nobody has marked are swapped for new random ones.') },
      { kim: 0, yazi: () => Y('Demir 17, 17 ve 8 attı: 17\'ye iki, 8\'e bir işaret. Bu ikisi artık sabit.', 'Demir hits 17, 17 and 8: two marks on 17, one on 8. Those two are now fixed.'),
        oklar: [A(17, 1, { k: [['h1', 1]] }), A(17, 1, { k: [['h1', 1]] }), A(8, 1, { k: [['h2', 1]] })] },
      { kim: 1, yazi: () => Y('Kenan T19 ile 19\'u tek okta kapattı, sonra bir 6. Tur bitti: işaretsiz sayılar şimdi değişecek.', 'Kenan closes 19 in one dart with T19, then hits a 6. The turn is over: unmarked numbers are about to change.'),
        oklar: [A(19, 3, { k: [['h5', 3]], tek: 'h5', uyari: () => Y('Tek okta kapattı!', 'Closed in one dart!'), ses: 'kutlama' }), ISKA, A(6, 1, { k: [['h6', 1]] })] },
      { kim: 0, degis: { h3: '14', h4: '20' }, yazi: () => Y('Yeni tur: kimsenin işaret koymadığı 3 ve 12 değişti → 14 ve 20. Demir yeni gelen 20\'ye iki ok attı.', 'New turn: the unmarked 3 and 12 changed to 14 and 20. Demir throws two darts at the new 20.'),
        oklar: [A(20, 1, { k: [['h4', 1]] }), A(20, 1, { k: [['h4', 1]] }), ISKA] },
    ],
  }),

  english: {
    tur: 'alan', oyuncular: IKI,
    alanlar: [{ k: 'kosu', ad: () => Y('Koşu', 'Runs'), bas: 0 }, { k: 'rol', ad: () => Y('Rol', 'Role'), bas: [0, 0], bicim: 'evet', evet: () => Y('Vurucu', 'Batting') }, { k: 'wk', ad: 'Wicket', bas: 0, son: ' / 10' }],
    adimlar: [
      { kim: null, yazi: () => Y('English Kriket: bir oyuncu vurucu, diğeri atıcıdır. Vurucu 40\'ı aşan her puanı koşu olarak yazar; atıcı yalnız Bull\'a atıp wicket alır.', 'English Cricket: one player bats, the other bowls. The batter scores runs for every point over 40; the bowler aims only at the Bull to take wickets.') },
      { kim: 0, yazi: () => Y('Vurucu Demir: T20 + T20 + 20 = 140. 40\'ı aşan 100 puan koşu oldu: 100 koşu.', 'Demir batting: T20 + T20 + 20 = 140. The 100 over 40 become runs: 100 runs.'),
        oklar: [A(20, 3, { v: { rol: 1 } }), A(20, 3), A(20, 1, { v: { kosu: 100 } })] },
      { kim: 1, isaret: { n: 25, m: 1 }, yazi: () => Y('Atıcı Kenan Bull\'a atar: 25 bir wicket, Bull iki wicket. 3 wicket aldı.', 'Kenan bowling aims at the Bull: 25 is one wicket, the bullseye two. He takes 3 wickets.'),
        oklar: [A(25, 1, { dd: [[0, { wk: 1 }]] }), A(25, 2, { dd: [[0, { wk: 2 }]] }), ISKA] },
      { kim: null, yazi: () => Y('10 wicket düşünce roller değişir: Kenan vurucu olur ve Demir\'in koşusunu geçmeye çalışır. Geçerse kazanır; geçemeden 10 wicket düşerse Demir kazanır.', 'After 10 wickets the roles swap: Kenan bats and tries to beat Demir\'s runs. If he does he wins; if 10 wickets fall first, Demir wins.') },
    ],
  },

  // ═══ GRUP OYUNLARI
  shanghai: {
    tur: 'alan', oyuncular: IKI, alanlar: [{ k: 'p', ad: () => Y('Puan', 'Points'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Shanghai: her turun bir hedef sayısı var — 1. turda 1, 2. turda 2… Yalnız o sayıya giren oklar puan getirir (sayı × çarpan).', 'Shanghai: each round has a target — round 1 is 1, round 2 is 2… Only darts in that number score (number × multiplier).') },
      { kim: 0, hedef: '1', isaret: { n: 1, m: 1 }, yazi: () => Y('1. tur, hedef 1: Demir 1 + D1 = 3 puan. 5 hedef değil, sayılmaz.', 'Round 1, target 1: Demir scores 1 + D1 = 3. The 5 doesn\'t count.'),
        oklar: [A(1, 1, { dv: { p: 1 } }), A(1, 2, { dv: { p: 2 } }), A(5)] },
      { kim: 1, hedef: '1', isaret: { n: 1, m: 1 }, yazi: () => Y('Kenan T1: 3 puan.', 'Kenan hits T1: 3 points.'), oklar: [A(1, 3, { dv: { p: 3 } }), A(20), ISKA] },
      { kim: 0, hedef: '2', isaret: { n: 2, m: 1 }, yazi: () => Y('2. tur, hedef 2: Demir aynı elde 2, D2 ve T2 attı — single, double ve triple: SHANGHAI! Oyunu anında kazanır.', 'Round 2, target 2: Demir hits 2, D2 and T2 in one turn — single, double and treble: SHANGHAI! He wins on the spot.'),
        oklar: [A(2, 1, { dv: { p: 2 } }), A(2, 2, { dv: { p: 4 } }), A(2, 3, { dv: { p: 6 }, uyari: 'SHANGHAI!', ses: 'kutlama' })] },
    ],
  },

  halveit: {
    tur: 'alan', oyuncular: IKI, alanlar: [{ k: 'p', ad: () => Y('Puan', 'Points'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Halve-It: 9 tur, her turun hedefi sırayla 15 · 16 · herhangi double · 17 · 18 · herhangi triple · 19 · 20 · Bull. Hedefe giren okların değeri eklenir.', 'Halve-It: 9 rounds with targets 15 · 16 · any double · 17 · 18 · any treble · 19 · 20 · Bull. Darts in the target add their value.') },
      { kim: 0, hedef: '15', isaret: { n: 15, m: 1 }, yazi: () => Y('Hedef 15: Demir 15 + 15 + T15 = 75 puan.', 'Target 15: Demir scores 15 + 15 + T15 = 75.'),
        oklar: [A(15, 1, { dv: { p: 15 } }), A(15, 1, { dv: { p: 15 } }), A(15, 3, { dv: { p: 45 } })] },
      { kim: 1, hedef: '15', isaret: { n: 15, m: 1 }, yazi: () => Y('Kenan: tek bir 15, 15 puan.', 'Kenan: one 15, 15 points.'), oklar: [A(15, 1, { dv: { p: 15 } }), A(2), A(10)] },
      { kim: 0, hedef: '16', isaret: { n: 16, m: 1 }, yazi: () => Y('Hedef 16: Demir üç okta da 16\'yı ıskaladı. Hedefe hiç vuramayanın puanı yarıya iner: 75 → 37!', 'Target 16: Demir misses 16 with all three. Miss the target completely and your score is halved: 75 → 37!'),
        oklar: [A(8), A(7), A(11, 1, { v: { p: 37 }, uyari: () => Y('YARIYA İNDİ!', 'HALVED!'), ses: 'dusus' })] },
      { kim: 1, hedef: () => Y('Herhangi double', 'Any double'), isaret: { n: 'D', m: 2 }, yazi: () => Y('Kenan bir 16 attı (+16 → 31). Sıradaki tur "herhangi double": her double sayılır. Turlar bitince en yüksek puan kazanır.', 'Kenan hit 16 (+16 → 31). Next round is "any double": every double counts. Highest score after all rounds wins.'),
        oklar: [A(16, 1, { dv: { p: 16 } }), ISKA, ISKA] },
    ],
  },

  atc: {
    tur: 'alan', oyuncular: IKI, alanlar: [{ k: 'h', ad: () => Y('Sıradaki hedef', 'Next target'), bas: 1 }],
    adimlar: [
      { kim: null, yazi: () => Y('Around the Clock: herkes 1\'den başlar; hedefi vurunca sonrakine geçer: 1 → 2 → … → 20 → Bull. Sona ilk ulaşan kazanır.', 'Around the Clock: everyone starts at 1; hit the target to move on: 1 → 2 → … → 20 → Bull. First to the end wins.') },
      { kim: 0, isaret: { n: 1, m: 1 }, yazi: () => Y('Demir 1\'i vurdu → hedef 2. 2\'yi vurdu → hedef 3. Üçüncü ok 3\'ü ıskaladı.', 'Demir hits 1 → target 2. Hits 2 → target 3. The third dart misses 3.'),
        oklar: [A(1, 1, { v: { h: 2 } }), A(2, 1, { v: { h: 3 } }), A(17)] },
      { kim: 1, isaret: { n: 1, m: 1 }, yazi: () => Y('Kenan 1\'i iki kez ıskaladı, üçüncüde vurdu → hedef 2. "Çarpan atlatır" açıksa double 2, triple 3 sayı ilerletir.', 'Kenan misses 1 twice, hits it with the third → target 2. With "multipliers skip" on, a double moves 2 numbers, a treble 3.'),
        oklar: [A(20), A(18), A(1, 1, { v: { h: 2 } })] },
    ],
  },

  baseball: {
    tur: 'alan', oyuncular: IKI, alanlar: [{ k: 'k', ad: () => Y('Koşu', 'Runs'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Baseball: 9 inning. 1. inning\'de 1\'e, 2.\'de 2\'ye atarsın. O sayıya vurunca single 1, double 2, triple 3 koşu.', 'Baseball: 9 innings. Aim at 1 in inning 1, 2 in inning 2… In the inning\'s number, single 1, double 2, treble 3 runs.') },
      { kim: 0, hedef: '1', isaret: { n: 1, m: 1 }, yazi: () => Y('1. inning: Demir 1 ve D1 = 3 koşu.', 'Inning 1: Demir hits 1 and D1 = 3 runs.'), oklar: [A(1, 1, { dv: { k: 1 } }), A(1, 2, { dv: { k: 2 } }), A(20)] },
      { kim: 1, hedef: '1', isaret: { n: 1, m: 1 }, yazi: () => Y('Kenan T1: 3 koşu.', 'Kenan hits T1: 3 runs.'), oklar: [A(1, 3, { dv: { k: 3 } }), ISKA, A(18)] },
      { kim: 0, hedef: '2', isaret: { n: 2, m: 1 }, yazi: () => Y('2. inning, hedef 2: Demir T2 + 2 = 4 koşu, toplam 7. 9 inning sonunda en çok koşu yapan kazanır.', 'Inning 2, target 2: Demir T2 + 2 = 4 runs, 7 in total. Most runs after 9 innings wins.'),
        oklar: [A(2, 3, { dv: { k: 3 } }), A(2, 1, { dv: { k: 1 } }), A(15)] },
    ],
  },

  countup: {
    tur: 'alan', oyuncular: IKI, alanlar: [{ k: 'p', ad: () => Y('Toplam', 'Total'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Count-Up: her okun değeri toplanır. Turlar bitince en yüksek toplam kazanır. Yeni başlayanlar için ideal.', 'Count-Up: every dart\'s value is added. Highest total after all rounds wins. Ideal for beginners.') },
      { kim: 0, yazi: () => Y('Demir: T20 (60) + T20 (60) + 20 = 140.', 'Demir: T20 (60) + T20 (60) + 20 = 140.'), oklar: [A(20, 3, { dv: { p: 60 } }), A(20, 3, { dv: { p: 60 } }), A(20, 1, { dv: { p: 20 } })] },
      { kim: 1, yazi: () => Y('Kenan: Bull (50) + 19 + T19 (57) = 126.', 'Kenan: Bull (50) + 19 + T19 (57) = 126.'), oklar: [A(25, 2, { dv: { p: 50 } }), A(19, 1, { dv: { p: 19 } }), A(19, 3, { dv: { p: 57 } })] },
    ],
  },

  gotcha: {
    tur: 'alan', oyuncular: IKI, alanlar: [{ k: 'p', ad: () => Y('Puan · hedef 301', 'Score · target 301'), bas: [100, 140] }],
    adimlar: [
      { kim: null, yazi: () => Y('Gotcha: herkes 0\'dan yukarı sayar; hedef puana (301) TAM ulaşan kazanır. Bir okla puanın bir rakibinkine eşit olursa: Gotcha! O rakip 0\'a döner.', 'Gotcha: everyone counts up from 0; reach the target (301) EXACTLY to win. If a dart makes your score equal a rival\'s: Gotcha! That rival drops to 0.') },
      { kim: 0, yazi: () => Y('Demir 100\'de, Kenan 140\'ta. Demir 20 + 20 attı: 140 — Kenan\'a eşit! Gotcha: Kenan 0\'a döndü.', 'Demir is on 100, Kenan on 140. Demir hits 20 + 20: 140 — equal to Kenan! Gotcha: Kenan drops to 0.'),
        oklar: [A(20, 1, { dv: { p: 20 } }), A(20, 1, { dv: { p: 20 }, dd: [[1, { p: -140 }]], uyari: 'GOTCHA!', ses: 'kutlama' }), A(1, 1, { dv: { p: 1 } })] },
      { kim: 1, yazi: () => Y('Kenan sıfırdan yeniden başlıyor: T20 + T20 + T19 = 177. 301\'i geçen bust olur, tur sayılmaz.', 'Kenan starts again from zero: T20 + T20 + T19 = 177. Going over 301 is a bust; the turn doesn\'t count.'),
        oklar: [A(20, 3, { dv: { p: 60 } }), A(20, 3, { dv: { p: 60 } }), A(19, 3, { dv: { p: 57 } })] },
    ],
  },

  // ═══ ANTRENMAN (tek oyuncu)
  bobs27: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'p', ad: () => Y('Puan', 'Score'), bas: 27 }],
    adimlar: [
      { kim: null, yazi: () => Y('Bob\'s 27: 27 puanla başlarsın. Her tur bir double\'a 3 ok: D1, D2, … D20. İsabet double\'ın değerini ekler; üçü de ıskalarsa o kadar düşersin.', 'Bob\'s 27: start on 27. Each round, three darts at one double: D1, D2, … D20. Hits add the double\'s value; miss all three and you lose that much.') },
      { kim: 0, hedef: 'D1', isaret: { n: 1, m: 2 }, yazi: () => Y('D1: üç okta da ıska. D1 = 2 puan düşer: 27 → 25.', 'D1: all three miss. D1 = 2 is deducted: 27 → 25.'),
        oklar: [A(1), A(18), A(20, 1, { v: { p: 25 }, uyari: '−2', ses: 'hata' })] },
      { kim: 0, hedef: 'D2', isaret: { n: 2, m: 2 }, yazi: () => Y('D2: iki isabet, her biri +4: 25 → 33. Puan sıfırın altına inerse oyun biter.', 'D2: two hits, +4 each: 25 → 33. Drop below zero and the game ends.'),
        oklar: [A(2, 2, { dv: { p: 4 } }), A(2, 1), A(2, 2, { dv: { p: 4 } })] },
    ],
  },

  crpractice: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'i', ad: () => Y('İşaret', 'Marks'), bas: 0 }, { k: 'mpr', ad: 'MPR', bas: '–' }],
    adimlar: [
      { kim: null, yazi: () => Y('Kriket Antrenmanı: hedefler 15–20 ve Bull. Kapatma yok, her isabet işaret sayılır. Amaç MPR (tur başına işaret) yükseltmek.', 'Cricket practice: targets 15–20 and the Bull. Nothing closes; every hit counts as marks. Goal: raise your MPR (marks per round).') },
      { kim: 0, yazi: () => Y('1. tur: T20 (3) + 19 (1) + Bull (2) = 6 işaret. MPR 6,0.', 'Round 1: T20 (3) + 19 (1) + Bull (2) = 6 marks. MPR 6.0.'),
        oklar: [A(20, 3, { dv: { i: 3 } }), A(19, 1, { dv: { i: 1 } }), A(25, 2, { dv: { i: 2 }, v: { mpr: '6,0' } })] },
      { kim: 0, yazi: () => Y('2. tur: yalnız bir 18 = 1 işaret. Toplam 7, MPR 3,5. 3\'ün üstü iyi, 5\'in üstü çok iyi.', 'Round 2: just one 18 = 1 mark. 7 in total, MPR 3.5. Above 3 is good, above 5 very good.'),
        oklar: [A(18, 1, { dv: { i: 1 } }), A(4), A(12, 1, { v: { mpr: '3,5' } })] },
    ],
  },

  atcsolo: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'h', ad: () => Y('Hedef', 'Target'), bas: 1 }, { k: 'ok', ad: () => Y('Ok', 'Darts'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Around the Clock (solo): 1\'den 20\'ye sırayla her sayıyı vur. Amaç en az okla bitirmek.', 'Around the Clock (solo): hit every number from 1 to 20 in order. Goal: finish in the fewest darts.') },
      { kim: 0, isaret: { n: 1, m: 1 }, yazi: () => Y('1 vuruldu → 2. 2 ıska. 2 vuruldu → 3. Her ok sayılır.', '1 hit → 2. 2 missed. 2 hit → 3. Every dart counts.'),
        oklar: [A(1, 1, { v: { h: 2 }, dv: { ok: 1 } }), A(15, 1, { dv: { ok: 1 } }), A(2, 1, { v: { h: 3 }, dv: { ok: 1 } })] },
    ],
  },

  co121: {
    tur: 'x01', baslangic: 121, oyuncular: TEK,
    adimlar: [
      { kim: null, yazi: () => Y('Checkout 121: 121\'den başlarsın, 9 okun var, double ile bitirmelisin. Başarırsan hedef 1 artar (122, 123…).', 'Checkout 121: start on 121 with 9 darts and finish on a double. Succeed and the target goes up by 1 (122, 123…).') },
      { kim: 0, yazi: () => Y('T20 (61), 11 (50), Bull (0): 3 okta bitti! Sıradaki hedef 122.', 'T20 (61), 11 (50), Bull (0): finished in 3 darts! Next target 122.'),
        oklar: [A(20, 3, { x: 61 }), A(11, 1, { x: 50 }), A(25, 2, { x: 0, uyari: () => Y('Başardın! → 122', 'Done! → 122'), ses: 'leg' })] },
    ],
  },

  catch40: {
    tur: 'x01', baslangic: 61, oyuncular: TEK,
    adimlar: [
      { kim: null, yazi: () => Y('Catch 40: 61\'den 100\'e her sayıyı bitirmeye çalışırsın; her biri için 6 ok, double ile bitir. 2 okla 3 puan, 3 okla 2, 4–6 okla 1 puan.', 'Catch 40: try to check out every number from 61 to 100, 6 darts each, finishing on a double. 2 darts = 3 points, 3 darts = 2, 4–6 darts = 1.') },
      { kim: 0, yazi: () => Y('61: T15 (16), D8 (0) — 2 okta bitti: 3 puan. Sıradaki 62.', '61: T15 (16), D8 (0) — done in 2 darts: 3 points. Next 62.'),
        oklar: [A(15, 3, { x: 16 }), A(8, 2, { x: 0, uyari: '+3', ses: 'kutlama' })] },
    ],
  },

  bigfinish: {
    tur: 'x01', baslangic: 132, oyuncular: TEK,
    adimlar: [
      { kim: null, yazi: () => Y('Büyük Bitiriş: rastgele 100–170 arası bitirişler gelir; her biri için 9 ok, double ile bitir. 3 okla 3 puan, 4–6 okla 2, 7–9 okla 1.', 'Big Finish: random checkouts from 100 to 170; 9 darts each, finish on a double. 3 darts = 3 points, 4–6 = 2, 7–9 = 1.') },
      { kim: 0, yazi: () => Y('132: Bull (82), T14 (40), D20 (0) — 3 okta: 3 puan.', '132: Bull (82), T14 (40), D20 (0) — in 3 darts: 3 points.'),
        oklar: [A(25, 2, { x: 82 }), A(14, 3, { x: 40 }), A(20, 2, { x: 0, uyari: '+3', ses: 'kutlama' })] },
    ],
  },

  scoring: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'p', ad: () => Y('Toplam', 'Total'), bas: 0 }, { k: 'ort', ad: () => Y('3 ok ort.', '3-dart avg'), bas: '–' }],
    adimlar: [
      { kim: null, isaret: { n: 20, m: 3 }, yazi: () => Y('Scoring: T20\'ye at, her okun değeri sayılır. Amaç 3 ok ortalamanı yükseltmek; 100+, 140+ ve 180\'ler ayrıca sayılır.', 'Scoring: aim at T20; every dart counts. Goal: raise your 3-dart average; 100+, 140+ and 180s are tracked.') },
      { kim: 0, isaret: { n: 20, m: 3 }, yazi: () => Y('T20 + T20 + T19 = 177. 3 ok ortalaması 177.', 'T20 + T20 + T19 = 177. 3-dart average 177.'),
        oklar: [A(20, 3, { dv: { p: 60 } }), A(20, 3, { dv: { p: 60 } }), A(19, 3, { dv: { p: 57 }, v: { ort: 177 } })] },
    ],
  },

  bull: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'p', ad: () => Y('Puan', 'Points'), bas: 0 }],
    adimlar: [
      { kim: null, isaret: { n: 25, m: 1 }, yazi: () => Y('Bull Antrenmanı: yalnız merkeze at. 25 = 1 puan, Bull = 2 puan.', 'Bull practice: aim only at the centre. 25 = 1 point, bullseye = 2 points.') },
      { kim: 0, isaret: { n: 25, m: 1 }, yazi: () => Y('25 (+1), Bull (+2), ıska: 3 puan. Sonunda isabet yüzdesi görünür.', '25 (+1), bull (+2), miss: 3 points. Your hit rate shows at the end.'),
        oklar: [A(25, 1, { dv: { p: 1 } }), A(25, 2, { dv: { p: 2 } }), ISKA] },
    ],
  },

  dtdrill: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'p', ad: () => Y('İsabet', 'Hits'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('Double / Triple Avı: her tur rastgele bir hedef gelir (ör. D16, T19). 3 okla o hedefe at; her isabet 1 puan.', 'Double / Treble hunt: each round gives a random target (e.g. D16, T19). Three darts at it; each hit is 1 point.') },
      { kim: 0, hedef: 'D16', isaret: { n: 16, m: 2 }, yazi: () => Y('Hedef D16: D16 (+1), tekli 16 sayılmaz, D16 (+1).', 'Target D16: D16 (+1), a single 16 doesn\'t count, D16 (+1).'),
        oklar: [A(16, 2, { dv: { p: 1 } }), A(16), A(16, 2, { dv: { p: 1 } })] },
      { kim: 0, hedef: 'T19', isaret: { n: 19, m: 3 }, yazi: () => Y('Hedef T19: bir isabet. Turlar bitince isabet yüzdesi görünür.', 'Target T19: one hit. Your hit rate shows at the end.'),
        oklar: [A(19), A(19, 3, { dv: { p: 1 } }), A(7)] },
    ],
  },

  jdc: {
    tur: 'alan', oyuncular: TEK, alanlar: [{ k: 'p', ad: () => Y('Puan', 'Points'), bas: 0 }],
    adimlar: [
      { kim: null, yazi: () => Y('JDC Challenge: 19 tur, üç bölüm. 1–6: 10\'dan 15\'e Shanghai. 7–13: D1\'den D20\'ye ve Bull, her isabet 50, Bull 100. 14–19: 15\'ten 20\'ye Shanghai.', 'JDC Challenge: 19 rounds in three parts. 1–6: Shanghai on 10 to 15. 7–13: D1 to D20 and Bull, 50 per hit, Bull 100. 14–19: Shanghai on 15 to 20.') },
      { kim: 0, hedef: '10', isaret: { n: 10, m: 1 }, yazi: () => Y('1. tur, hedef 10: 10 + D10 + T10 = 60, aynı turda single-double-triple: +100 bonus. Toplam 160.', 'Round 1, target 10: 10 + D10 + T10 = 60; single, double and treble in one round: +100 bonus. 160 in total.'),
        oklar: [A(10, 1, { dv: { p: 10 } }), A(10, 2, { dv: { p: 20 } }), A(10, 3, { dv: { p: 130 }, uyari: '+100', ses: 'kutlama' })] },
      { kim: 0, hedef: 'D1 · D2 · D3', isaret: [{ n: 1, m: 2 }, { n: 2, m: 2 }, { n: 3, m: 2 }], yazi: () => Y('Double bölümü: her ok sıradaki double\'a; D1 ve D3 isabet: +100.', 'Doubles part: each dart at the next double; D1 and D3 hit: +100.'),
        oklar: [A(1, 2, { dv: { p: 50 } }), A(2), A(3, 2, { dv: { p: 50 } })] },
    ],
  },
};

// Kapanış (Demir 09.11): her gösterimin sonunda oyuna özel bir uğurlama + DartX'i Demir Kara'nın yazdığı
const KAPANIS = {
  x01: ['Unutma: sıfıra inen kazanır, son ok double olsun! Bol 180\'ler.', 'Remember: first to zero wins, finish on a double! Plenty of 180s.'],
  killer: ['Kendi canına dikkat et, killer! İyi avlar.', 'Mind your own lives, killer! Happy hunting.'],
  cricket: ['Kapat ve puanla, gerisi kendiliğinden gelir! İyi kriketler.', 'Close and score! Good cricket.'],
  fullboard: ['Nefesini topla, 21 hedef seni bekliyor! İyi kriketler.', 'Pace yourself, 21 targets await! Good cricket.'],
  turk: ['Kapat, puan topla, House\'u kaçırma! İyi kriketler.', 'Close, score, don\'t miss the House! Good cricket.'],
  minnesota: ['Üç oku bir yatağa göndermeyi unutma! İyi kriketler.', 'Don\'t forget three in a bed! Good cricket.'],
  cutthroat: ['Acıma ama puanını düşük tut! İyi eğlenceler.', 'No mercy, but keep your score low! Have fun.'],
  tactics: ['Taktiğini kur, sabırla kapat! İyi kriketler.', 'Plan your tactics, close with patience! Good cricket.'],
  mickey: ["Double'ları ve triple'ları kovala! İyi eğlenceler.", 'Chase the doubles and trebles! Have fun.'],
  hidden: ['Gizli sayıları bul, sürprizlere hazır ol! İyi kriketler.', 'Find the hidden numbers! Good cricket.'],
  crazy: ['Tahta her an değişebilir, gözün açık olsun! İyi eğlenceler.', 'The board can change any time! Have fun.'],
  english: ['Vuruşun bol koşulu, atışın isabetli olsun! İyi maçlar.', 'Plenty of runs, accurate bowling! Good match.'],
  shanghai: ['Tekli, double, triple: Shanghai seni bekliyor! İyi oyunlar.', 'Single, double, treble: Shanghai awaits! Good darts.'],
  halveit: ['Hedefi kaçırma, puanın yarıya inmesin! İyi oyunlar.', 'Don\'t miss, or you\'re halved! Good darts.'],
  atc: ['Birden bula, saatin etrafında tur at! İyi oyunlar.', 'From 1 to the bull, go round the clock! Good darts.'],
  baseball: ['Bol home run! İyi maçlar.', 'Plenty of home runs! Good match.'],
  countup: ['Topla, topla, topla! İyi oyunlar.', 'Add it up! Good darts.'],
  gotcha: ['Gözün rakibin puanında olsun. Gotcha! İyi eğlenceler.', 'Keep an eye on your rival\'s score. Gotcha! Have fun.'],
  bobs27: ["Double'lar dostun olsun! İyi antrenmanlar.", 'May the doubles be your friends! Good practice.'],
  crpractice: ['MPR\'ın hep yükselsin! İyi antrenmanlar.', 'Keep that MPR rising! Good practice.'],
  atcsolo: ['En az okla tur at! İyi antrenmanlar.', 'Go round in as few darts as you can! Good practice.'],
  co121: ['Her başarı bir puan, hedef hep yukarı! İyi antrenmanlar.', 'Every success is a point, aim higher! Good practice.'],
  catch40: ['Kırkını da yakala! İyi antrenmanlar.', 'Catch all forty! Good practice.'],
  bigfinish: ['Büyük bitirişler seni bekliyor! İyi antrenmanlar.', 'Big finishes await! Good practice.'],
  scoring: ['Hep triple 20! İyi antrenmanlar.', 'Treble 20, always! Good practice.'],
  bull: ['Merkez seninle olsun! İyi antrenmanlar.', 'May the bull be with you! Good practice.'],
  dtdrill: ['Avın bol olsun! İyi antrenmanlar.', 'Happy hunting! Good practice.'],
  jdc: ['İyi antrenmanlar!', 'Good practice!'],
};
for (const [id, [tr, en]] of Object.entries(KAPANIS)) if (DEMOLAR[id]) DEMOLAR[id].adimlar.push({ kim: null, kapanis: true, yazi: () => Y(tr + ' DartX\'i senin için Demir Kara yazdı.', en + ' DartX was written for you by Demir Kara.') });
