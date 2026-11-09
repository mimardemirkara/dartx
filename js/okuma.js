// DartX sesli okuma (Demir 09.11): telefonun / tabletin kendi okuma sesiyle (Web Speech, internetsiz, ücretsiz)
// her ok, el toplamı, bust ve X01'de sıradakinin kalanı + bitiriş önerisi okunur. Ayarlar ve oyun menüsünden açılır.
// İngilizce terimler Türkçe seste İngilizce okunsun diye okunuşuyla yazılır (Demir'in kuralı: triple / double / bust İngilizce).
import { data } from './store.js';
import { dil } from './i18n.js';
import { checkout } from './checkout.js';

const TR = { house: 'Haus', triple: 'Tripıl', double: 'Dabıl', bull: 'Bul', dbull: 'Dabıl bul', iska: 'Iska', bust: 'Bast', oyun: 'Geym şat', yuzseksen: 'Yüz seksen!', kalan: 'kalan', sira: 'Sıra' };
const EN = { house: 'House', triple: 'Treble', double: 'Double', bull: 'Bull', dbull: 'Bullseye', iska: 'Miss', bust: 'Bust', oyun: 'Game shot', yuzseksen: 'One hundred and eighty!', kalan: 'you require', sira: 'Next up,' };
const S = () => (dil() === 'en' ? EN : TR);

export const acikMi = () => data().settings.sesliOkuma === true && data().settings.sessiz !== true;
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

// Okuma kuyruğu (Demir 09.11 "hızlı basınca geç geliyor"): o an konuşulan kesilmez; henüz başlamamış eski ok
// okuması yeni ok gelince atlanır (en son basılan okunur); el özeti ("81. Sıra Tuncay") hiç atlanmaz.
const kuyruk = [];
let suan = null, suanT = null;
function pompala() {
  if (suan || !kuyruk.length) return;
  const { metin } = kuyruk.shift();
  const u = new SpeechSynthesisUtterance(metin);
  u.lang = dil() === 'en' ? 'en-GB' : 'tr-TR';
  const v = sesSec(); if (v) u.voice = v;
  u.rate = 1.25; u.pitch = 1; u.volume = 1;
  const bitti = () => { if (suan !== u) return; clearTimeout(suanT); suan = null; pompala(); };
  u.onend = bitti; u.onerror = bitti;
  suan = u; // referans tutulur (bazı tarayıcılarda bitiş olayı kaybolmasın)
  // güvenlik: bitiş olayı hiç gelmezse (iOS) tahmini süre sonra sıradakine geç
  suanT = setTimeout(bitti, 900 + metin.length * 110);
  speechSynthesis.speak(u);
}
/** Metni sıraya koyar. ok=true: tek ok okuması (yeni ok gelince başlamamış eskisi atlanır) */
export function oku(metin, kes = false, ok = false, atlanir = ok) {
  if (!acikMi() || !destekli() || !metin) return;
  if (kes) { kuyruk.length = 0; speechSynthesis.cancel(); suan = null; clearTimeout(suanT); }
  if (ok) for (let i = kuyruk.length - 1; i >= 0; i--) if (kuyruk[i].atlanir) kuyruk.splice(i, 1);
  kuyruk.push({ metin, atlanir });
  pompala();
}

/** Tek ok: "Tripıl 20", "Dabıl 16", "Bul", "Dabıl bul", "Iska" */
export function okSozu(d) {
  const k = S();
  if (!d || !d.n) return k.iska;
  if (d.n === 25) return d.m === 2 ? k.dbull : k.bull;
  if (d.sec === 'H') return k.house + ' ' + d.n; // Türk Kriketi House (üç ok aynı sayı): "Haus 18"
  return (d.m === 3 ? k.triple + ' ' : d.m === 2 ? k.double + ' ' : '') + d.n;
}

const x01Mi = m => !!(m && m.g && m.g.s && m.g.s[0] && typeof m.g.s[0].score === 'number' && m.opts && m.opts.out);

/** Atıştan sonra (app.js afterThrow): ne olduysa onu söyler */
export function atisOku(m, res, ad) {
  if (!acikMi() || !m || !res) return;
  const k = S();
  // yalnız son adım gerçekten bir oksa okunur ("Sıradaki Oyuncu" ve toplam girişinde önceki ok tekrar okunmasın)
  const son = (m.adimlar || [])[(m.adimlar || []).length - 1];
  const ok = son && son.t === 'd' ? son.d : null;
  // Demir 09.11: her ok basıldığı anda okunur, hiçbiri kesilmez (elin son oku dahil); özet okların arkasından gelir
  if (ok) oku(okSozu(ok), false, true, res.event === 'dart'); // elin son oku atlanmaz
  if (res.event === 'dart') return;
  if (res.event === 'bust') { oku(k.bust); if (ad) oku(`${k.sira} ${ad}`); return; }
  if (res.event === 'leg' || res.event === 'set' || res.event === 'match') { oku(k.oyun); return; }
  if (res.event !== 'turn') return;
  if (x01Mi(m)) {
    // X01: el toplamı, sonra sıradaki; kalanı 170 ve altıysa kalan ve bitiriş yolu
    const l = m.log && m.log[m.log.length - 1];
    const top = l ? l.points : null;
    if (top != null) oku(top === 180 ? k.yuzseksen : String(top));
    const s = m.g.s[m.cur];
    const yol = s && s.open !== false && s.score <= 170 ? checkout(s.score, 3, m.opts.out) : null;
    if (yol) oku(`${k.sira} ${ad}, ${k.kalan} ${s.score}. ${yol.map(okSozu).join(', ')}`);
    else if (ad) oku(`${k.sira} ${ad}`);
  } else if (ad) oku(`${k.sira} ${ad}`);
}

/** Okuma bitince cb (en çok enCok ms bekler) — sıra uyarısı konuşmanın üstüne binmesin */
export function bitince(cb, enCok = 4500) {
  if (!acikMi() || !destekli()) { cb(); return; }
  const bas = Date.now();
  const bak = () => { if (!speechSynthesis.speaking && !speechSynthesis.pending) cb(); else if (Date.now() - bas > enCok) cb(); else setTimeout(bak, 120); };
  setTimeout(bak, 150);
}
export function sustur() { kuyruk.length = 0; suan = null; clearTimeout(suanT); if (destekli()) speechSynthesis.cancel(); }
