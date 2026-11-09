// DartX sesli okuma (Demir 09.11): telefonun / tabletin kendi okuma sesiyle (Web Speech, internetsiz, ücretsiz)
// her ok, el toplamı, bust ve X01'de sıradakinin kalanı + bitiriş önerisi okunur. Ayarlar ve oyun menüsünden açılır.
// İngilizce terimler Türkçe seste İngilizce okunsun diye okunuşuyla yazılır (Demir'in kuralı: triple / double / bust İngilizce).
import { data } from './store.js';
import { dil } from './i18n.js';
import { checkout } from './checkout.js';

const TR = { triple: 'Tripıl', double: 'Dabıl', bull: 'Bul', dbull: 'Dabıl bul', iska: 'Iska', bust: 'Bast', oyun: 'Geym şat', yuzseksen: 'Yüz seksen!', kalan: 'kalan', sira: 'Sıra' };
const EN = { triple: 'Treble', double: 'Double', bull: 'Bull', dbull: 'Bullseye', iska: 'Miss', bust: 'Bust', oyun: 'Game shot', yuzseksen: 'One hundred and eighty!', kalan: 'you require', sira: 'Next' };
const S = () => (dil() === 'en' ? EN : TR);

export const acikMi = () => data().settings.sesliOkuma === true;
export const destekli = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

let sesler = [];
function sesSec() {
  const kod = dil() === 'en' ? 'en' : 'tr';
  if (!sesler.length && destekli()) sesler = speechSynthesis.getVoices();
  const uygun = sesler.filter(v => (v.lang || '').toLowerCase().startsWith(kod));
  // iPhone'da "gelişmiş / premium" sürüm varsa onu seç (daha doğal)
  return uygun.find(v => /premium|enhanced|geliş/i.test(v.name)) || uygun.find(v => /yelda|samantha|daniel/i.test(v.name)) || uygun[0] || null;
}
if (destekli()) speechSynthesis.addEventListener?.('voiceschanged', () => { sesler = speechSynthesis.getVoices(); });

/** Metni okur; kes=true ise önceki okumayı keser (hızlı ok girişinde sıra birikmesin) */
export function oku(metin, kes = false) {
  if (!acikMi() || !destekli() || !metin) return;
  if (kes) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(metin);
  u.lang = dil() === 'en' ? 'en-GB' : 'tr-TR';
  const v = sesSec(); if (v) u.voice = v;
  u.rate = 1.05; u.pitch = 1; u.volume = 1;
  speechSynthesis.speak(u);
}

/** Tek ok: "Tripıl 20", "Dabıl 16", "Bul", "Dabıl bul", "Iska" */
export function okSozu(d) {
  const k = S();
  if (!d || !d.n) return k.iska;
  if (d.n === 25) return d.m === 2 ? k.dbull : k.bull;
  return (d.m === 3 ? k.triple + ' ' : d.m === 2 ? k.double + ' ' : '') + d.n;
}

const x01Mi = m => !!(m && m.g && m.g.s && m.g.s[0] && typeof m.g.s[0].score === 'number' && m.opts && m.opts.out);

/** Atıştan sonra (app.js afterThrow): ne olduysa onu söyler */
export function atisOku(m, res, ad) {
  if (!acikMi() || !m || !res) return;
  const k = S();
  const son = (m.adimlar || []).slice().reverse().find(a => a.t === 'd');
  const ok = son ? son.d : null;
  if (res.event === 'dart') { oku(okSozu(ok), true); return; }
  if (res.event === 'bust') { oku(k.bust, true); return; }
  if (res.event === 'leg' || res.event === 'set' || res.event === 'match') { oku(k.oyun, true); return; }
  if (res.event !== 'turn') return;
  if (x01Mi(m)) {
    // X01: el toplamı, sonra sıradakinin kalanı ve bitirişi (170 ve altı)
    const l = m.log && m.log[m.log.length - 1];
    const top = l ? l.points : null;
    const metin = top === 180 ? k.yuzseksen : top != null ? String(top) : okSozu(ok);
    oku(metin, true);
    const s = m.g.s[m.cur];
    if (s && s.open !== false && s.score <= 170) {
      const yol = checkout(s.score, 3, m.opts.out);
      if (yol) oku(dil() === 'en' ? `${ad}, ${k.kalan} ${s.score}. ${yol.map(okSozu).join(', ')}` : `${ad}, ${k.kalan} ${s.score}. ${yol.map(okSozu).join(', ')}`);
    }
  } else {
    oku(okSozu(ok), true);
    if (ad) oku(dil() === 'en' ? `${ad}` : `${k.sira} ${ad}`);
  }
}
