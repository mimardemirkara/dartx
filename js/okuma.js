// DartX sesli okuma (Demir 09.11). İki kaynak:
//  1) Spiker kayıtları (Mesut Bayazıt, ElevenLabs; ses/spiker/*.mp3, uygulamaya gömülü): sayılar 0–180, Triple/Double 1–20,
//     Bull, Bullseye, Iska, Bust, Game shot, Yüz seksen, House, "Sıradaki oyuncu", "Kalan", karakter adları.
//     Okuma bu parçaların art arda çalınmasıyla kurulur: "Sıradaki oyuncu" + "Tuncay" + "Kalan" + "kırk" + "Double yirmi".
//  2) Kaydı olmayan bir şey (bilinmeyen ad, İngilizce dil, kayıtlar yüklenemezse) telefonun okuma sesine düşer.
// Bilinmeyen oyuncu adı okunmaz, yalnız "Sıradaki oyuncu" denir (Demir'in seçimi: ses tek ve tutarlı kalsın).
import { data } from './store.js';
import { dil } from './i18n.js';
import { checkout } from './checkout.js';

const TR = { house: 'Haus', triple: 'Tripıl', double: 'Dabıl', bull: 'Bul', dbull: 'Dabıl bul', iska: 'Iska', bust: 'Bast', oyun: 'Geym şat', yuzseksen: 'Yüz seksen!', kalan: 'kalan', sira: 'Sıra' };
const EN = { house: 'House', triple: 'Treble', double: 'Double', bull: 'Bull', dbull: 'Bullseye', iska: 'Miss', bust: 'Bust', oyun: 'Game shot', yuzseksen: 'One hundred and eighty!', kalan: 'you require', sira: 'Next up,' };
const S = () => (dil() === 'en' ? EN : TR);

export const acikMi = () => data().settings.sesliOkuma === true && data().settings.sessiz !== true;
const ttsVar = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
const sesVar = () => typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
export const destekli = () => ttsVar() || sesVar();

// ---- spiker kayıtları (Web Audio): ilk açılışta indirilip çözülür, sonra anında çalar
const KAYIT = 'ses/spiker/';
let ctx = null, tampon = {}, liste = null, yukleniyor = null;
function sesBaglam() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
export function kayitlariYukle() {
  if (yukleniyor || !sesVar()) return yukleniyor;
  yukleniyor = fetch(KAYIT + 'liste.json').then(r => r.json()).then(async ids => {
    liste = new Set(ids);
    const c = sesBaglam(); if (!c) return;
    await Promise.all(ids.map(id => fetch(KAYIT + id + '.mp3').then(r => r.arrayBuffer())
      .then(b => new Promise((ok, hata) => c.decodeAudioData(b, ok, hata))).then(t => { tampon[id] = t; }).catch(() => {})));
  }).catch(() => { liste = new Set(); });
  return yukleniyor;
}
const kayitVar = id => !!tampon[id];
const adId = ad => 'ad_' + String(ad || '').trim().split(/\s+/)[0].toLocaleLowerCase('tr')
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]/g, '');

let sesler = [];
function sesSec() {
  const kod = dil() === 'en' ? 'en' : 'tr';
  if (!sesler.length && ttsVar()) sesler = speechSynthesis.getVoices();
  const uygun = sesler.filter(v => (v.lang || '').toLowerCase().startsWith(kod));
  return uygun.find(v => /premium|enhanced|geliş/i.test(v.name)) || uygun.find(v => /yelda|samantha|daniel/i.test(v.name)) || uygun[0] || null;
}
if (ttsVar()) speechSynthesis.addEventListener?.('voiceschanged', () => { sesler = speechSynthesis.getVoices(); });

// Okuma kuyruğu (Demir 09.11): o an çalınan kesilmez; başlamamış eski ok okuması yeni ok gelince atlanır; el özeti atlanmaz.
// Her öğe: { parca: [kayıt id'leri] | null, metin: telefon sesi için yedek, atlanir }
const kuyruk = [];
let suan = null, suanT = null, kaynaklar = [];
function bitir(o) { if (suan !== o) return; clearTimeout(suanT); suan = null; pompala(); }
function pompala() {
  if (suan || !kuyruk.length) return;
  const o = kuyruk.shift(); suan = o;
  const c = sesBaglam();
  const kayitla = dil() !== 'en' && c && o.parca && o.parca.length && o.parca.every(kayitVar);
  if (kayitla) {
    // parçalar art arda, aralarında 50 ms
    let t = c.currentTime + 0.02;
    kaynaklar = o.parca.map(id => { const k = c.createBufferSource(); k.buffer = tampon[id]; k.connect(c.destination); k.start(t); t += tampon[id].duration + 0.05; return k; });
    suanT = setTimeout(() => bitir(o), (t - c.currentTime) * 1000 + 30);
    return;
  }
  if (!ttsVar() || !o.metin) { suan = null; pompala(); return; }
  const u = new SpeechSynthesisUtterance(o.metin);
  u.lang = dil() === 'en' ? 'en-GB' : 'tr-TR';
  const v = sesSec(); if (v) u.voice = v;
  u.rate = 1.25; u.pitch = 1; u.volume = 1;
  u.onend = u.onerror = () => bitir(o);
  o.u = u; // referans tutulur (bazı tarayıcılarda bitiş olayı kaybolmasın)
  suanT = setTimeout(() => bitir(o), 900 + o.metin.length * 110); // bitiş olayı hiç gelmezse (iOS)
  speechSynthesis.speak(u);
}
/** Sıraya koyar. parca: kayıt id'leri; metin: kayıt yoksa telefonun okuyacağı yazı. ok=true: tek ok (eski başlamamış ok atlanır) */
function seslendir(parca, metin, ok = false, atlanir = ok) {
  if (!acikMi() || !destekli()) return;
  kayitlariYukle();
  if (ok) for (let i = kuyruk.length - 1; i >= 0; i--) if (kuyruk[i].atlanir) kuyruk.splice(i, 1);
  kuyruk.push({ parca, metin, atlanir });
  pompala();
}
/** Serbest metin (ör. "Sesli okuma açık") — telefonun sesiyle */
export function oku(metin, kes = false) {
  if (kes) sustur();
  seslendir(null, metin);
}

/** Tek ok: yazısı ("Tripıl 20") ve kayıt parçaları */
export function okSozu(d) {
  const k = S();
  if (!d || !d.n) return k.iska;
  if (d.n === 25) return d.m === 2 ? k.dbull : k.bull;
  if (d.sec === 'H') return k.house + ' ' + d.n;
  return (d.m === 3 ? k.triple + ' ' : d.m === 2 ? k.double + ' ' : '') + d.n;
}
function okParca(d) {
  if (!d || !d.n) return ['iska'];
  if (d.n === 25) return [d.m === 2 ? 'dbull' : 'bull'];
  if (d.sec === 'H') return ['house', 'n' + d.n];
  return [(d.m === 3 ? 't' : d.m === 2 ? 'd' : 'n') + d.n];
}
const sayiParca = n => (n >= 0 && n <= 180 ? ['n' + n] : null);
// "Sıradaki oyuncu" + adı (kaydı varsa); bilinmeyen ad kayıtla okunmaz
function siraParca(ad) { const id = adId(ad); return kayitVar(id) ? ['siradaki', id] : ['siradaki']; }

const x01Mi = m => !!(m && m.g && m.g.s && m.g.s[0] && typeof m.g.s[0].score === 'number' && m.opts && m.opts.out);

/** Atıştan sonra (app.js afterThrow): ne olduysa onu söyler */
export function atisOku(m, res, ad) {
  if (!acikMi() || !m || !res) return;
  const k = S();
  // yalnız son adım gerçekten bir oksa okunur ("Sıradaki Oyuncu" ve toplam girişinde önceki ok tekrar okunmasın)
  const son = (m.adimlar || [])[(m.adimlar || []).length - 1];
  const ok = son && son.t === 'd' ? son.d : null;
  if (ok) seslendir(okParca(ok), okSozu(ok), true, res.event === 'dart'); // elin son oku atlanmaz
  if (res.event === 'dart') return;
  if (res.event === 'bust') { seslendir(['bust'], k.bust); if (ad) seslendir(siraParca(ad), `${k.sira} ${ad}`); return; }
  if (res.event === 'match') { seslendir(['gameshot_mac'], k.oyun); return; }
  if (res.event === 'leg' || res.event === 'set') { seslendir(['gameshot'], k.oyun); return; }
  if (res.event !== 'turn') return;
  if (x01Mi(m)) {
    // X01: el toplamı, sonra sıradaki; kalanı 170 ve altıysa kalan ve bitiriş yolu
    const l = m.log && m.log[m.log.length - 1];
    const top = l ? l.points : null;
    if (top != null) seslendir(top === 180 ? ['yuzseksen'] : sayiParca(top), top === 180 ? k.yuzseksen : String(top));
    const s = m.g.s[m.cur];
    const yol = s && s.open !== false && s.score <= 170 ? checkout(s.score, 3, m.opts.out) : null;
    if (yol) seslendir([...siraParca(ad), 'kalan', 'n' + s.score, ...yol.flatMap(okParca)], `${k.sira} ${ad}, ${k.kalan} ${s.score}. ${yol.map(okSozu).join(', ')}`);
    else if (ad) seslendir(siraParca(ad), `${k.sira} ${ad}`);
  } else if (ad) seslendir(siraParca(ad), `${k.sira} ${ad}`);
}

/** Okuma bitince cb (en çok enCok ms bekler) */
export function bitince(cb, enCok = 4500) {
  if (!acikMi()) { cb(); return; }
  const bas = Date.now();
  const bak = () => { if (!suan && !kuyruk.length) cb(); else if (Date.now() - bas > enCok) cb(); else setTimeout(bak, 120); };
  setTimeout(bak, 150);
}
export function sustur() {
  kuyruk.length = 0; suan = null; clearTimeout(suanT);
  kaynaklar.forEach(k => { try { k.stop(); } catch (e) { /* yok say */ } }); kaynaklar = [];
  if (ttsVar()) speechSynthesis.cancel();
}
