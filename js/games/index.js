// DartX — oyun kataloğu
import x01 from './x01.js';
import { cricket, cutthroat, fullboard, tactics, mickey, turk, minnesota, hidden, crazy, english, crpractice } from './cricket.js';
import killer from './killer.js';
import { shanghai, halveit, atc, atcsolo, baseball, countup, gotcha, scoring, bull } from './party.js';
import { bobs27, co121, catch40, bigfinish, dtdrill, jdc } from './practice.js';
import { EN_GAMES } from './en.js';

const LIST = [
  x01, killer,
  cricket, fullboard, turk, minnesota, cutthroat, tactics, mickey, hidden, crazy, english,
  shanghai, halveit, atc, baseball, countup, gotcha,
  bobs27, crpractice, atcsolo, co121, catch40, bigfinish, scoring, bull, dtdrill, jdc,
];

// Ana ekran simgesi: kısa yazı + kısa ad
const ICON = {
  x01: ['501', 'X01'], cricket: ['C', 'Standart'], cutthroat: ['CT', 'Cut-Throat'], killer: ['K', 'Killer'],
  fullboard: ['FB', 'Full Board'], tactics: ['TC', 'Tactics'], mickey: ['MM', 'Mickey Mouse'], turk: ['TK', 'Türk Kriketi'], minnesota: ['MN', 'Minnesota'], hidden: ['?', 'Hidden'], crazy: ['CR', 'Crazy'], english: ['EC', 'English'], crpractice: ['MPR', 'Kriket MPR'],
  shanghai: ['SH', 'Shanghai'], halveit: ['½', 'Halve-It'], atc: ['1·20', 'Saat Turu'], baseball: ['9', 'Baseball'],
  countup: ['∑', 'Count-Up'], gotcha: ['G!', 'Gotcha'],
  bobs27: ['27', "Bob's 27"], atcsolo: ['↻', 'Saat Solo'], co121: ['121', 'Checkout'], catch40: ['40', 'Catch 40'],
  bigfinish: ['170', 'Bitiriş'], scoring: ['T20', 'Scoring'], bull: ['◎', 'Bull'], dtdrill: ['D·T', 'D/T Avı'], jdc: ['JDC', 'JDC'],
};
LIST.forEach(g => { [g.glyph, g.label] = ICON[g.id] || [g.name[0], g.name]; });
// İngilizce ad / açıklama / kurallar (i18n.gt ile okunur)
LIST.forEach(g => {
  const e = EN_GAMES[g.id] || {};
  g.nameEn = e.name || g.name;
  g.shortEn = e.short;
  g.rulesEn = e.rules;
});

export const GAMES = Object.fromEntries(LIST.map(g => [g.id, g]));
export const GAME_LIST = LIST;
export const CATS = [
  ['main', 'Ana Maçlar'],
  ['cricket', 'Kriket Oyunları'], // Demir 11.11: içinin dolu olduğu anlaşılsın
  ['party', 'Grup Oyunları'],
  ['practice', 'Antrenmanlar'],
];
