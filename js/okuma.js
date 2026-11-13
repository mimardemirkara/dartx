// DartX sesli okuma (Demir 09.11). İki kaynak:
//  1) Spiker kayıtları (Mesut Bayazıt, ElevenLabs; ses/spiker/*.mp3, uygulamaya gömülü): sayılar 0–180, Triple/Double 1–20,
//     Bull, Bullseye, Iska, Bust, Game shot, Yüz seksen, House, "Sıradaki oyuncu", "Kalan", karakter adları.
//     Okuma bu parçaların art arda çalınmasıyla kurulur: "Sıradaki oyuncu" + "Tuncay" + "Kalan" + "kırk" + "Double yirmi".
//  2) Kaydı olmayan bir şey (bilinmeyen ad, İngilizce dil, kayıtlar yüklenemezse) telefonun okuma sesine düşer.
// Bilinmeyen oyuncu adı okunmaz, yalnız "Sıradaki oyuncu" denir (Demir'in seçimi: ses tek ve tutarlı kalsın).
import './tts-yerel.js'; // Android uygulamasında telefonun okuyucusu
import { data, player } from './store.js';
import { dil } from './i18n.js';
import { checkout } from './checkout.js';

const TR = { house: 'Haus', triple: 'Tripıl', double: 'Dabıl', bull: 'Bul', dbull: 'Dabıl bul', iska: 'Iska', bust: 'Bast', oyun: 'Geym şat', yuzseksen: 'Yüz seksen!', kalan: 'kalan', sira: 'Sıra' };
const EN = { house: 'House', triple: 'Treble', double: 'Double', bull: 'Bull', dbull: 'Bullseye', iska: 'Miss', bust: 'Bust', oyun: 'Game shot', yuzseksen: 'One hundred and eighty!', kalan: 'you require', sira: 'Next up,' };
const S = () => (dil() !== 'tr' ? EN : TR);

export const acikMi = () => data().settings.sesliOkuma === true && data().settings.sessiz !== true && destekli();
const ttsVar = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
const sesVar = () => typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
// Demir 11.11: İngilizcede spiker kaydı yok → telefonun kendi okuyucusu (iOS/Android sesi) okur
const enMi = () => dil() !== 'tr';
export const destekli = () => (enMi() ? ttsVar() : ttsVar() || sesVar());

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
  if (enMi()) return Promise.resolve(); // İngilizcede Türkçe kayıtlar indirilmez
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
const adId = ad => 'sira_' + String(ad || '').trim().split(/\s+/)[0].toLocaleLowerCase('tr')
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/î/g, 'i').replace(/[^a-z0-9]/g, '');

let sesler = [];
function sesSec() {
  const kod = dil() !== 'tr' ? 'en' : 'tr';
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
  const kayitla = !enMi() && c && o.parca && o.parca.length && o.parca.every(kayitVar);
  if (kayitla) {
    // parçalar art arda, aralarında 50 ms
    let t = c.currentTime + 0.02;
    kaynaklar = o.parca.map(id => { const k = c.createBufferSource(); k.buffer = tampon[id]; k.connect(c.destination); k.start(t); t += tampon[id].duration + 0.05; return k; });
    suanT = setTimeout(() => bitir(o), (t - c.currentTime) * 1000 + 30);
    return;
  }
  const metin = enMi() && o.parca ? enMetin(o.parca) || o.metin : o.metin;
  if (!ttsVar() || !metin) { suan = null; pompala(); return; }
  const u = new SpeechSynthesisUtterance(metin);
  u.lang = dil() !== 'tr' ? 'en-GB' : 'tr-TR';
  const v = sesSec(); if (v) u.voice = v;
  u.rate = enMi() ? 1.1 : 1.25; u.pitch = 1; u.volume = 1;
  u.onend = u.onerror = () => bitir(o);
  o.u = u; // referans tutulur (bazı tarayıcılarda bitiş olayı kaybolmasın)
  suanT = setTimeout(() => bitir(o), 900 + metin.length * 110); // bitiş olayı hiç gelmezse (iOS)
  speechSynthesis.speak(u);
}
// İngilizce: kayıt parçaları telefonun okuyacağı cümleye çevrilir. '@…' = olduğu gibi okunur (ad, koç cümlesi)
const EN_SOZ = { iska: 'Miss', bull: 'Bull', dbull: 'Bullseye', bust: 'Bust!', house: 'House', yuzseksen: 'One hundred and eighty!',
  gameshot: 'Game shot!', gameshot_mac: 'Game shot, and the match!', siradaki: 'Next up', kalan: 'you require', tekok: 'Closed in one dart!',
  k_kapandi: 'closed', k_double_ac: 'You need a double to start', okuma_acik: 'Voice caller on', okuma_kapali: 'Voice caller off' };
function enMetin(parca) {
  const s = [];
  for (const id of parca) {
    if (id.startsWith('@')) { s.push(id.slice(1)); continue; }
    let m;
    if ((m = /^n(\d+)$/.exec(id))) s.push(m[1]);
    else if ((m = /^t(\d+)$/.exec(id))) s.push('Treble ' + m[1]);
    else if ((m = /^d(\d+)$/.exec(id))) s.push('Double ' + m[1]);
    else if (EN_SOZ[id]) s.push(EN_SOZ[id]);
  }
  return s.join(', ').replace(/you require, /g, 'you require ');
}

/** Sıraya koyar. parca: kayıt id'leri; metin: kayıt yoksa telefonun okuyacağı yazı. ok=true: tek ok (eski başlamamış ok atlanır) */
function seslendir(parca, metin, ok = false, atlanir = ok) {
  if (!acikMi() || !destekli()) return;
  kayitlariYukle();
  if (ok) for (let i = kuyruk.length - 1; i >= 0; i--) if (kuyruk[i].atlanir) kuyruk.splice(i, 1);
  kuyruk.push({ parca, metin, atlanir });
  pompala();
}
/** "Sesli okuma açık / kapalı" duyurusu (Mert'in kaydı) — okuma kapalıyken de çalar; "Sessize al" açıksa susar */
export async function duyur(acik) {
  if (data().settings.sessiz === true) return;
  await kayitlariYukle();
  const id = acik ? 'okuma_acik' : 'okuma_kapali', c = sesBaglam();
  if (c && tampon[id]) { const k = c.createBufferSource(); k.buffer = tampon[id]; k.connect(c.destination); k.start(); kaynaklar.push(k); return; }
  if (ttsVar()) { const u = new SpeechSynthesisUtterance(enMi() ? (acik ? 'Voice caller on' : 'Voice caller off') : (acik ? 'Sesli okuma açık' : 'Sesli okuma kapalı')); u.lang = enMi() ? 'en-GB' : 'tr-TR'; const v = sesSec(); if (v) u.voice = v; speechSynthesis.speak(u); }
}
/** Serbest metin — telefonun sesiyle */
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
// "Kalan kırk" tek kayıt (Demir 10.11: "kalan" tek başına "kalaaan" diye uzuyordu); kayıt yoksa iki parça
const kalanParca = n => (kayitVar('kalan_' + n) ? ['kalan_' + n] : ['kalan', 'n' + n]);
// Karakterlerin adı Türkçe okunsun diye tam cümle kaydı var: "Sıradaki oyuncu, Demir." (Demir 09.11: tek kelime İngilizce gibi okunuyordu)
// Bilinmeyen ad kayıtla okunmaz, yalnız "Sıradaki oyuncu" denir
function siraParca(ad) { if (enMi()) return ['siradaki', ...(ad ? ['@' + ad] : [])]; const id = adId(ad); return kayitVar(id) ? [id] : ['siradaki']; }

const x01Mi = m => !!(m && m.g && m.g.s && m.g.s[0] && typeof m.g.s[0].score === 'number' && m.opts && m.opts.out);

// Konuşma seviyesi (Demir 09.11, sesli koç): kisa = oklar + sıra · normal = + el toplamı, kapanan sayılar · koc = + durum ve öneri
export const seviye = () => data().settings.okumaSeviye || 'normal'; // Demir 10.11: varsayılan Standart (yeni kullanıcı bunalmasın)
const enAz = sv => ({ kisa: 0, normal: 1, koc: 2 }[seviye()] >= ({ kisa: 0, normal: 1, koc: 2 }[sv]));

// Kriket ailesinde kapanan sayıyı yakalamak için işaretlerin bir önceki hali
let onceIsaret = null;
const isaretler = m => (m && m.g && Array.isArray(m.g.s) && m.g.s[0] && m.g.s[0].k ? m.g.s.map(x => ({ ...x.k })) : null);
function kapananlar(m) {
  const simdi = isaretler(m), once = onceIsaret; onceIsaret = simdi;
  if (!simdi || !once || once.length !== simdi.length) return [];
  const sonuc = [];
  simdi.forEach((k, i) => Object.keys(k).forEach(h => {
    const a = once[i][h] || 0, b = k[h] || 0;
    if (a < 3 && b >= 3) sonuc.push({ h: isNaN(h) ? h : Number(h), tek: a === 0 });
  }));
  return sonuc;
}
const hedefParca = h => (h === 25 ? 'bull' : typeof h === 'number' ? 'n' + h : h === 'H' ? 'house' : null);

/** Sıra başı durum özeti (koç): kriket ailesinde puan farkı + öneri; X01'de kalan + bitiriş */
function durumParca(m, g) {
  if (!m || !g) return [];
  if (x01Mi(m)) {
    const s = m.g.s[m.cur]; if (!s) return [];
    if (s.open === false) return ['k_double_ac'];
    const yol = s.score <= 170 ? checkout(s.score, 3, m.opts.out) : null;
    if (yol) return [...kalanParca(s.score), ...yol.flatMap(okParca)];
    if (s.score <= 180) return [...kalanParca(s.score)];
    return [];
  }
  const p = [];
  // İngilizcede koç cümlesi ekrandaki (çevrilmiş) yazıyla okunur
  const al = x => { if (!x) return; if (enMi()) { if (x.metin) p.push('@' + String(x.metin).replace(/<[^>]+>/g, '').replace(/·/g, ',')); } else if (x.ses) p.push(...x.ses); };
  try { al(g.durum && g.durum(m, m.g)); } catch (e) { /* yok say */ }
  try { al(g.ipucu && g.ipucu(m, m.g)); } catch (e) { /* yok say */ }
  return p;
}

// Maç cümleleri (Demir 10.11): kayıt varsa çalınır, yoksa sessizce atlanır (eski okuma sürer)
const varsa = (...ids) => ids.filter(id => id && kayitVar(id));
function birini(on, adet) { const l = varsa(...Array.from({ length: adet }, (_, i) => on + (i + 1))); return l.length ? [l[Math.floor(Math.random() * l.length)]] : []; }
const kazananId = ad => adId(ad).replace(/^sira_/, 'kazanan_');
function kazananAd(m, i) {
  const sd = m && m.sides && m.sides[i]; if (!sd) return null;
  if (sd.members && sd.members.length === 1) { const p = player(sd.members[0]); return p && p.name; }
  return null; // takımın adı için kayıt yok
}
const toplamParca = top => (kayitVar('toplam_' + top) ? ['toplam_' + top] : sayiParca(top));
/** Maç başladı (ilk atış ekranı kapanınca): "Maç başlıyor, bol şans!" */
export function macBasladi() { if (acikMi() && enMi()) { seslendir(['@Game on!'], ''); return; } if (acikMi()) { kayitlariYukle().then(() => { const p = birini('mac_bas_', 4); if (p.length) seslendir(p, ''); }); } }
/** Yeni leg başladı */
export function legBasladi() { if (acikMi() && enMi()) { seslendir(['@Game on!'], ''); return; } if (acikMi()) { kayitlariYukle().then(() => { const p = birini('leg_bas_', 2); if (p.length) seslendir(p, ''); }); } }

/** Atıştan sonra (app.js afterThrow): ne olduysa onu söyler. g: oyunun tanımı (GAMES[m.gameId]) */
export function atisOku(m, res, ad, g) {
  if (!acikMi() || !m || !res) { onceIsaret = isaretler(m); return; }
  const k = S();
  // yalnız son adım gerçekten bir oksa okunur ("Sıradaki Oyuncu" ve toplam girişinde önceki ok tekrar okunmasın)
  const son = (m.adimlar || [])[(m.adimlar || []).length - 1];
  const ok = son && son.t === 'd' ? son.d : null;
  const kapanan = kapananlar(m);
  if (ok) seslendir(okParca(ok), okSozu(ok), true, res.event === 'dart'); // elin son oku atlanmaz
  // kapanan sayı: "On dokuz kapandı." · tek okta: "Tek okta kapandı!"
  if (ok && enAz('normal')) kapanan.forEach(x => { const hp = hedefParca(x.h); if (x.tek) seslendir(['tekok'], ''); else if (hp) seslendir([hp, 'k_kapandi'], ''); });
  if (res.event === 'dart') return;
  if (res.event === 'bust') { seslendir(['bust'], k.bust); if (ad) seslendir(siraParca(ad), `${k.sira} ${ad}`); return; }
  if (res.event === 'match' || res.event === 'leg' || res.event === 'set') {
    const kad = res.winner >= 0 ? kazananAd(m, res.winner) : null;
    const mac = res.event === 'match';
    seslendir([mac ? 'gameshot_mac' : 'gameshot', ...(kad ? (enMi() ? ['@' + kad] : varsa(kazananId(kad))) : []), ...(mac ? birini('mac_son_', 3) : [])], k.oyun);
    return;
  }
  if (res.event !== 'turn') return;
  if (x01Mi(m) && enAz('normal')) {
    const l = m.log && m.log[m.log.length - 1];
    const top = l ? l.points : null;
    if (top != null) seslendir(top === 180 ? ['yuzseksen', ...(Math.random() < .6 ? birini('ek180_', 2) : [])] : toplamParca(top), top === 180 ? k.yuzseksen : String(top));
  }
  // sıradaki oyuncu; koç seviyesinde ardından durum ve öneri (X01: kalan + bitiriş; kriket: puan farkı + ipucu)
  const durum = enAz('koc') || x01Mi(m) && enAz('normal') ? durumParca(m, g) : [];
  if (ad) seslendir([...siraParca(ad), ...durum], `${k.sira} ${ad}`);
}

/** Oyuncu kartına dokununca: sıradakinin durumunu bir daha söyler */
export function durumuOku(m, g, ad) {
  if (!acikMi() || !m) return;
  const k = S();
  sustur();
  seslendir([...siraParca(ad), ...durumParca(m, g)], `${k.sira} ${ad}`);
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
