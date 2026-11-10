// Arkadaşlar ve online maç (Demir 11.11). Biri evde biri başka yerde: herkes kendi tahtasına atar, kendi okunu girer,
// karşı taraf anında görür. İki telefon arasında yalnız maçın hamle listesi (engine adimlar) eşitlenir; maç her iki
// telefonda da aynı listeden aynen kurulur (aynı tohum, aynı sonuç).
// Firestore: profiller/{uid} (ad, foto, kod) · kodlar/{kod} → uid · arkadaslik/{uidA_uidB} · online/{id} · varlik/{uid} (çevrimiçi durumu; yalnız arkadaşlar okur)
import { bulut } from './bulut.js';
import * as H from './hesap.js';
import { data, save, addPlayer, updatePlayer, setCurrent } from '../store.js';
import * as E from '../engine.js';
import { GAMES } from '../games/index.js';
import { t, gt } from '../i18n.js';
import { esc, adResim } from '../util.js';
import { seviyeRozet } from './meslek.js';
import { qrGoster, qrOku, qrKodBul, QR_SIMGE, OKU_SIMGE } from './qr.js';
import { dil } from '../i18n.js';

let C = null;
const durum = { arkadaslik: [], maclar: [], profil: {}, dinliyor: null, varlik: {}, varlikDinle: {} };
const goruldu = new Set();
const clone = o => JSON.parse(JSON.stringify(o));
const benUid = () => (H.uye().user ? H.uye().user.uid : null);
/** Bekleyen: gelen arkadaşlık istekleri + gelen maç davetleri (rozet sayısı) */
export const bekleyenSayi = () => { const ben = benUid(); if (!ben) return 0;
  return durum.arkadaslik.filter(a => a.durum === 'bekliyor' && a.isteyen !== ben).length + durum.maclar.filter(d => d.durum === 'davet' && d.davetEden !== ben).length; };
export const acik = () => !!(H.girisli() && H.dogrulandi() && H.uye().profil);

// Online oynanabilen oyunlar (ilk sürüm): X01 ve kriket ailesi
export const ONLINE_OYUN = [['x01:501', '501'], ['x01:301', '301'], ['turk', null], ['cricket', null], ['fullboard', null]];
const oyunAd = (gameId, opts) => (gameId === 'x01' ? String(opts && opts.start || 501) : gt(GAMES[gameId], 'name'));

const QR_BEKLEYEN = 'dartx.qrArkadas';
export function onlineKur(ctx) {
  C = ctx;
  // Demir 11.11: QR'daki bağlantıyla açıldıysa (?arkadas=DX-XXXX) istek, giriş yapılınca kendiliğinden gönderilir
  try {
    const q = new URLSearchParams(location.search); const k = qrKodBul(q.get('arkadas'));
    if (k) { localStorage.setItem(QR_BEKLEYEN, k); q.delete('arkadas'); history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : '')); }
  } catch (_) { /* yok say */ }
  H.dinle(() => { if (acik()) dinle(); else birak(); });
  const app = document.getElementById('app');
  app.addEventListener('click', e => { const el = e.target.closest('[data-act^="on-"]'); if (!el || el.disabled || el.tagName === 'FORM' || el.tagName === 'INPUT') return; C.vib && C.vib(6); onlineTikla(el.dataset.act, el); });
  app.addEventListener('submit', e => { const f = e.target; if (f.dataset.act === 'on-ekle') { e.preventDefault(); onlineGonder(f); } });
  app.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-on-ara]')) araSuz(e.target); });
}

// ---- dinleme: arkadaşlıklar ve maçlar canlı gelir
function birak() {
  if (durum.dinliyor) { durum.dinliyor.forEach(f => f()); durum.dinliyor = null; durum.arkadaslik = []; durum.maclar = []; }
  Object.values(durum.varlikDinle).forEach(f => f()); durum.varlikDinle = {}; durum.varlik = {};
  varlikDurdur();
}

// ---- çevrimiçi durumu (Demir 11.11): uygulama açık ve ekrandayken dakikada bir "buradayım" yazılır.
// Son 2,5 dakikada yazmışsa çevrimiçi sayılır; arka plana geçince hemen "kapalı" yazılır. Hesabım'dan gizlenebilir.
const VARLIK_ARALIK = 60e3, VARLIK_SINIR = 150e3;
let varlikSaat = null, varlikKurulu = false;
export const durumGizli = () => !!(H.uye().profil && H.uye().profil.durumGizli);
async function varlikYaz(kapali = false) {
  const ben = benUid(); if (!ben || !acik()) return;
  const { db, F } = await bulut();
  const m = data().current;
  const v = durumGizli() ? { gizli: true, son: null, kapali: true, macta: false }
    : { gizli: false, son: F.serverTimestamp(), kapali, macta: !kapali && !!(m && m.online && !m.finished) };
  await F.setDoc(F.doc(db, 'varlik', ben), v).catch(() => {});
}
function varlikBaslat() {
  if (!varlikKurulu) {
    varlikKurulu = true;
    document.addEventListener('visibilitychange', () => { if (!acik()) return; if (document.visibilityState === 'visible') { varlikYaz(false); } else varlikYaz(true); });
    window.addEventListener('pagehide', () => { if (acik()) varlikYaz(true); });
  }
  if (varlikSaat) return;
  varlikYaz(document.visibilityState !== 'visible');
  varlikSaat = setInterval(() => {
    if (document.visibilityState === 'visible') varlikYaz(false);
    if (C.S.view === 'online') C.render(); // "5 dk önce" yazıları tazelensin
  }, VARLIK_ARALIK);
}
function varlikDurdur() { if (varlikSaat) { clearInterval(varlikSaat); varlikSaat = null; } }
export const varlikTazele = () => varlikYaz(document.visibilityState !== 'visible');
async function varlikIzle(arkadaslar) {
  const { db, F } = await bulut();
  for (const u of arkadaslar) if (!durum.varlikDinle[u]) {
    durum.varlikDinle[u] = F.onSnapshot(F.doc(db, 'varlik', u), s => { durum.varlik[u] = s.exists() ? s.data() : null; tazele(); }, () => {});
  }
  for (const u of Object.keys(durum.varlikDinle)) if (!arkadaslar.includes(u)) { durum.varlikDinle[u](); delete durum.varlikDinle[u]; delete durum.varlik[u]; }
}
/** { tur: 'acik' | 'macta' | 'kapali', yazi } */
function varlikDurum(u) {
  const v = durum.varlik[u];
  if (!v || v.gizli) return { tur: 'kapali', yazi: t('Çevrimdışı') };
  const son = v.son && v.son.toMillis ? v.son.toMillis() : 0;
  const fark = Date.now() - son;
  if (!v.kapali && son && fark < VARLIK_SINIR) return v.macta ? { tur: 'macta', yazi: t('Maçta') } : { tur: 'acik', yazi: t('Çevrimiçi') };
  if (!son) return { tur: 'kapali', yazi: t('Çevrimdışı') };
  const dk = Math.max(1, Math.round(fark / 60e3));
  const ne = dk < 60 ? t('{0} dk önce', dk) : dk < 1440 ? t('{0} sa önce', Math.round(dk / 60)) : t('{0} gün önce', Math.round(dk / 1440));
  return { tur: 'kapali', yazi: t('Çevrimdışı') + ' · ' + ne };
}
async function dinle() {
  if (durum.dinliyor) return;
  durum.dinliyor = [];
  const { db, F } = await bulut(); const ben = benUid();
  varlikBaslat();
  qrBekleyenGonder();
  durum.dinliyor.push(F.onSnapshot(F.query(F.collection(db, 'arkadaslik'), F.where('uids', 'array-contains', ben)), s => {
    durum.arkadaslik = s.docs.map(d => ({ id: d.id, ...d.data() }));
    s.docChanges().forEach(c => {
      const d = c.doc.data();
      if (c.type === 'added' && d.durum === 'bekliyor' && d.isteyen !== ben && !goruldu.has('a' + c.doc.id)) {
        goruldu.add('a' + c.doc.id); profilAl(d.isteyen).then(p => C.toast(t('{0} seni arkadaş olarak ekledi', esc(p.ad)), '', { sure: 3000 }));
      }
    });
    durum.arkadaslik.forEach(a => a.uids.forEach(u => { if (u !== ben) profilAl(u); }));
    varlikIzle(durum.arkadaslik.filter(a => a.durum === 'kabul').map(a => a.uids.find(u => u !== ben)));
    tazele();
  }, () => {}));
  durum.dinliyor.push(F.onSnapshot(F.query(F.collection(db, 'online'), F.where('uids', 'array-contains', ben)), s => {
    durum.maclar = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.durum !== 'bitti' && d.durum !== 'red');
    s.docChanges().forEach(c => {
      const d = { id: c.doc.id, ...c.doc.data() }; const karsi = d.uids.find(u => u !== ben);
      const ad = (d.adlar && d.adlar[karsi]) || '';
      if (d.durum === 'davet' && d.davetEden !== ben && !goruldu.has('d' + d.id)) {
        goruldu.add('d' + d.id); C.toast(t('{0} seni {1} maçına çağırıyor', esc(ad), esc(oyunAd(d.gameId, d.opts))), '', { sure: 3500 });
      }
      if (d.durum === 'oyunda' && d.davetEden === ben && !goruldu.has('k' + d.id) && !(data().current && data().current.online && data().current.online.id === d.id)) {
        goruldu.add('k' + d.id);
        C.toast(t('{0} davetini kabul etti', esc(ad)), 'ok', { sure: 2500 });
        if (C.S.view !== 'play') macaGir(d);
      }
      if (d.durum === 'red' && d.davetEden === ben && !goruldu.has('r' + d.id)) { goruldu.add('r' + d.id); C.toast(t('{0} daveti kabul etmedi', esc(ad)), 'bad', { sure: 2500 }); }
      const m = data().current;
      if (m && m.online && m.online.id === d.id) uygula(d);
    });
    tazele();
  }, () => {}));
}
const tazele = () => { if (C.S.view === 'online' || C.S.view === 'home') C.render(); else window.dispatchEvent(new Event('dartx-hesap-rozet')); };

async function profilAl(uid) {
  if (durum.profil[uid]) return durum.profil[uid];
  const { db, F } = await bulut();
  const s = await F.getDoc(F.doc(db, 'profiller', uid)).catch(() => null);
  durum.profil[uid] = s && s.exists() ? s.data() : { ad: '?' };
  tazele();
  return durum.profil[uid];
}

// ---- arkadaş profili (Demir 11.11): ad, lakap, seviye, ok seti özeti
function arkadasProfil(u) {
  const p = durum.profil[u] || {}; const vd = varlikDurum(u); const en = dil() === 'en';
  const oz = en ? (p.okOzetEn || p.okOzet) : p.okOzet;
  const ok = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 16.5 7.5"/><path d="m16.5 7.5-2 .6-.6 2 1.5 1.5 2-.6.6-2Z"/><path d="M14 10 6.5 17.5"/><path d="M6.5 17.5 3 16l1.6 2.4L3 21l2.6-1.6L8 21l-1.5-3.5Z"/></svg>';
  const kisi = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const pd = document.createElement('div'); pd.className = 'modal-bg uy-soru';
  pd.innerHTML = `<div class="modal glass uy-soru-kart ark-profil" role="dialog" aria-modal="true"><h3 class="uy-soru-bas">${kisi}<span>${t('Arkadaş')}</span></h3>
    <div class="ark-bas"><span class="on-av-yer">${avatar(p.ad, p.foto, 'uy-av buyuk')}<i class="on-nokta ${vd.tur}"></i></span>
      <b>${esc(p.ad || '')}</b>${p.lakap || p.seviye ? `<span class="uy-ad-alt">${p.lakap ? `<i class="uy-lakap">“${esc(p.lakap)}”</i>` : ''}${seviyeRozet(p.seviye, dil())}</span>` : ''}
      <small class="on-durum ${vd.tur}">${esc(vd.yazi)}</small>${p.kod ? `<small class="ark-kod">${esc(p.kod)}</small>` : ''}</div>
    <div class="uy-alt-bas">${ok}<span>${t('Ok seti')}</span></div>
    <p class="ark-ok">${oz ? esc(oz) : `<span class="soluk">${t('Henüz eklememiş')}</span>`}</p>
    <div class="uy-soru-dugmeler"><button type="button" class="btn" data-h="kapat">${t('Kapat')}</button><button type="button" class="btn primary" data-h="davet">${t('Maça davet et')}</button></div></div>`;
  document.body.appendChild(pd);
  const kapat = () => { pd.classList.add('kapan'); setTimeout(() => pd.remove(), 200); };
  pd.addEventListener('click', e => {
    if (e.target === pd || e.target.closest('[data-h="kapat"]')) return kapat();
    if (e.target.closest('[data-h="davet"]')) { kapat(); const b = document.querySelector(`[data-act="on-davet"][data-u="${u}"]`); if (b) b.click(); }
  });
  pd.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(); });
}

// ---- QR ile gelen arkadaş kodu: giriş yapılınca istek gönderilir, Online ekranı açılır
async function qrBekleyenGonder() {
  const k = localStorage.getItem(QR_BEKLEYEN); if (!k) return;
  localStorage.removeItem(QR_BEKLEYEN);
  await qrIleEkle(k);
}
async function qrIleEkle(k) {
  try {
    const r = await arkadasEkle(k);
    C.toast(r === 'kabul' ? t('Artık arkadaşsınız') : t('Arkadaşlık isteği gönderildi'), 'ok', { sure: 2800 });
  } catch (e) { C.toast(hata(e), e && (e.code === 'zaten-arkadas' || e.code === 'istek-var') ? '' : 'bad', { sure: 3000 }); }
  if (C.S.view !== 'online' && C.S.view !== 'play') C.go('online');
}

// ---- arkadaşlık
const kodDuzelt = k => { const s = String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); const c = s.startsWith('DX') ? s.slice(2) : s; return c.length === 4 ? 'DX-' + c : null; };
export async function arkadasEkle(kodYazi) {
  const kod = kodDuzelt(kodYazi); if (!kod) throw Object.assign(new Error(), { code: 'kod-gecersiz' });
  const { db, F } = await bulut(); const ben = benUid();
  const k = await F.getDoc(F.doc(db, 'kodlar', kod));
  if (!k.exists()) throw Object.assign(new Error(), { code: 'kod-yok' });
  const o = k.data().uid;
  if (o === ben) throw Object.assign(new Error(), { code: 'kod-senin' });
  const id = [ben, o].sort().join('_'); const ref = F.doc(db, 'arkadaslik', id);
  const var_ = await F.getDoc(ref);
  if (var_.exists()) {
    const v = var_.data();
    if (v.durum === 'kabul') throw Object.assign(new Error(), { code: 'zaten-arkadas' });
    if (v.isteyen !== ben) { await F.updateDoc(ref, { durum: 'kabul' }); return 'kabul'; }
    throw Object.assign(new Error(), { code: 'istek-var' });
  }
  await F.setDoc(ref, { uids: [ben, o], isteyen: ben, durum: 'bekliyor', zaman: F.serverTimestamp() });
  profilAl(o);
  return 'istek';
}
export async function istekKabul(id) { const { db, F } = await bulut(); await F.updateDoc(F.doc(db, 'arkadaslik', id), { durum: 'kabul' }); }
export async function arkadaslikSil(id) { const { db, F } = await bulut(); await F.deleteDoc(F.doc(db, 'arkadaslik', id)); }

// ---- davet
export async function davetEt(karsi, secim, ozel = null) {
  const [gameId, bas] = secim.split(':'); const g = GAMES[gameId];
  const opts = {}; (g.options || []).forEach(o => (opts[o.key] = o.def));
  if (gameId === 'x01') opts.start = Number(bas) || 501;
  opts.legs = 1; opts.sets = 1;
  if (ozel) Object.assign(opts, clone(ozel)); // Demir 11.11: kurulum ekranından gelen ayarlar (Cezalı, 20–10, leg, set…) aynen maça gider
  if (g.totalInput) opts.input = 'darts'; // online: ok ok giriş
  const { db, F } = await bulut(); const ben = benUid();
  const ref = F.doc(F.collection(db, 'online'));
  const tohum = Math.floor(Math.random() * 2 ** 31);
  const basla = { gameId, opts, sides: [{ name: '', members: [ben] }, { name: '', members: [karsi] }], tohum, id: ref.id, started: Date.now() };
  const p = H.uye().profil || {}; const kp = await profilAl(karsi);
  await F.setDoc(ref, {
    uids: [ben, karsi], davetEden: ben, durum: 'davet', gameId, opts, bas: basla,
    adimlar: [{ t: 'b', i: Math.random() < 0.5 ? 0 : 1 }], // ilk leg'i kim açacak: yazı tura
    surum: 0, adlar: { [ben]: p.ad || '', [karsi]: kp.ad || '' }, fotolar: { [ben]: p.foto || null, [karsi]: kp.foto || null },
    olusturma: F.serverTimestamp(), guncel: F.serverTimestamp(),
  });
}
export async function davetKabul(d) {
  const { db, F } = await bulut();
  await F.updateDoc(F.doc(db, 'online', d.id), { durum: 'oyunda', guncel: F.serverTimestamp() });
  macaGir({ ...d, durum: 'oyunda' });
}
export async function davetRed(d) { const { db, F } = await bulut(); await F.updateDoc(F.doc(db, 'online', d.id), { durum: 'red', guncel: F.serverTimestamp() }); }
export async function macIptal(d) { const { db, F } = await bulut(); await F.deleteDoc(F.doc(db, 'online', d.id)); }

// ---- yerel oyuncular: ben = profilimdeki oyuncu; arkadaş = uid'li oyuncu (aynı adlı misafir varsa ona bağlanır)
function kendiOyuncum() {
  const p = H.uye().profil || {};
  let o = data().players.find(x => x.id === p.oyuncuId);
  if (!o) { o = addPlayer(p.ad || 'Ben'); H.profilKaydet({ oyuncuId: o.id }).catch(() => {}); }
  if (p.foto && o.foto !== p.foto) updatePlayer(o.id, { foto: p.foto });
  return o.id;
}
function arkadasOyuncu(uid, ad, foto) {
  let o = data().players.find(x => x.uid === uid)
    || data().players.find(x => !x.uid && x.name.toLocaleLowerCase('tr') === String(ad || '').toLocaleLowerCase('tr'))
    || addPlayer(ad || t('Arkadaş'));
  const yama = { uid }; if (foto) yama.foto = foto;
  updatePlayer(o.id, yama);
  return o.id;
}

// ---- maç
const anahtar = adimlar => JSON.stringify((adimlar || []).map(a => [a.t, a.d, a.total, a.co, a.i]));
const yereleCevir = (adimlar, harita) => (adimlar || []).map(a => (a.p && harita[a.p] ? { ...a, p: harita[a.p] } : { ...a }));
const uzagaCevir = (adimlar, harita) => { const ters = Object.fromEntries(Object.entries(harita).map(([u, l]) => [l, u])); return (adimlar || []).map(a => (a.p && ters[a.p] ? { ...a, p: ters[a.p] } : { ...a })); };

export function macaGir(d) {
  const cur = data().current;
  if (cur && cur.online && cur.online.id === d.id) { C.go('play'); return; }
  const parkta = (data().ara || []).find(x => x.online && x.online.id === d.id);
  if (parkta) { C.devam(parkta.id); return; }
  const ben = benUid();
  const harita = {};
  d.uids.forEach(u => { harita[u] = u === ben ? kendiOyuncum() : arkadasOyuncu(u, d.adlar && d.adlar[u], d.fotolar && d.fotolar[u]); });
  const bas = clone(d.bas); bas.sides = bas.sides.map(s => ({ ...s, members: s.members.map(u => harita[u]) }));
  const m = E.createMatch(bas.gameId, clone(bas.opts), clone(bas.sides), bas);
  m.online = { id: d.id, surum: d.surum || 0, harita, ben: harita[ben] };
  E.hamlelerleKur(m, yereleCevir(d.adimlar, harita));
  m.online.anahtar = anahtar(m.adimlar);
  E.clearUndo();
  setCurrent(m);
  C.go('play');
}

/** Sıra bende değilse tuşlar kilitli */
export const kilitli = m => !!(m && m.online && !m.done && E.currentPid(m) !== m.online.ben);
/** Yalnız kendi son atışın geri alınabilir */
export const geriAlinabilir = m => { if (!(m && m.online)) return true; const son = (m.adimlar || []).filter(a => a.t !== 'b').pop(); return !!(son && son.p === m.online.ben); };

let kuyruk = Promise.resolve();
/** Yerel değişiklik varsa karşıya gönderir (ekran her yenilendiğinde ve her atıştan sonra çağrılır) */
export function esitle(m) {
  if (!(m && m.online)) return;
  const bekleyen = durum.maclar.find(x => x.id === m.online.id);
  if (bekleyen && (bekleyen.surum || 0) > (m.online.surum || 0)) { uygula(bekleyen); return; }
  if (anahtar(m.adimlar) === m.online.anahtar) return;
  m.online.anahtar = anahtar(m.adimlar);
  kuyruk = kuyruk.then(async () => {
    const { db, F } = await bulut(); const ref = F.doc(db, 'online', m.online.id);
    const sur = m.online.surum || 0; const adimlar = uzagaCevir(m.adimlar, m.online.harita);
    await F.runTransaction(db, async tx => {
      const s = await tx.get(ref); if (!s.exists()) throw new Error('yok');
      if ((s.data().surum || 0) !== sur) throw new Error('cakisma');
      tx.update(ref, { adimlar, surum: sur + 1, durum: m.done ? 'bitti' : 'oyunda', guncel: F.serverTimestamp() });
    });
    m.online.surum = sur + 1;
  }).catch(e => { if (e && e.message !== 'cakisma') C.toast(t('Online maça bağlanılamadı. İnternet gelince tekrar denenecek.'), 'bad', { sure: 2500 }); m.online.anahtar = null; });
}

/** Karşıdan gelen hamleler: tek adım ilerideyse o ok atılmış gibi oynanır (ses, okuma, uyarı); değilse maç baştan kurulur */
function uygula(d) {
  const m = data().current; if (!(m && m.online && m.online.id === d.id)) return;
  if ((d.surum || 0) <= (m.online.surum || 0)) return;
  const uzak = yereleCevir(d.adimlar, m.online.harita);
  m.online.surum = d.surum || 0;
  const sade = a => anahtar(a);
  if (sade(uzak) === sade(m.adimlar)) { m.online.anahtar = sade(m.adimlar); setCurrent(m); return; }
  if (uzak.length === m.adimlar.length + 1 && sade(uzak.slice(0, -1)) === sade(m.adimlar)) {
    const a = uzak[uzak.length - 1]; let res = null;
    if (a.t === 'd') { C.S.sonOk = a.d; res = E.throwDart(m, clone(a.d)); }
    else if (a.t === 'p') res = E.passTurn(m);
    m.online.anahtar = sade(m.adimlar);
    if (res) { C.afterThrow(res); return; }
  }
  E.hamlelerleKur(m, uzak);
  m.online.anahtar = sade(m.adimlar);
  setCurrent(m);
  if (C.S.view === 'play') C.render();
}

// ---- Oyun kurulum ekranı (Demir 11.11): "Bu cihazda | Online" — Online'da arkadaş seçilir, ayarlarla davet gider
export const ONLINE_OYUNLAR = ['x01', 'turk', 'cricket', 'fullboard'];
export const onlineDestekli = gameId => ONLINE_OYUNLAR.includes(gameId);
export function kurulumArkadaslar(secili) {
  const ben = benUid(); if (!ben) return '';
  const pr = u => durum.profil[u] || { ad: '…' };
  const sira = { acik: 0, macta: 1, kapali: 2 };
  const ark = durum.arkadaslik.filter(a => a.durum === 'kabul').map(a => a.uids.find(u => u !== ben))
    .sort((x, y) => (sira[varlikDurum(x).tur] - sira[varlikDurum(y).tur]) || pr(x).ad.localeCompare(pr(y).ad, 'tr'));
  if (!ark.length) return `<p class="muted sira-bos">${t('Henüz arkadaşın yok. Online ekranından kodla ya da QR ile arkadaş ekle.')}</p>
    <button type="button" class="btn sm kur-onl-git" data-act="tab" data-v="online">${t('Arkadaş ekle')}</button>`;
  return `<div class="kur-ark-liste">${ark.map(u => { const vd = varlikDurum(u); const on = u === secili; return `
    <button type="button" class="pchip sira-satir kur-ark ${on ? 'on' : ''}" data-act="kurark" data-u="${u}" aria-pressed="${on}">
      <span class="on-av-yer">${avatar(pr(u).ad, pr(u).foto)}<i class="on-nokta ${vd.tur}"></i></span>
      <span class="pc-ad">${esc(pr(u).ad)}<small class="on-durum ${vd.tur}">${esc(vd.yazi)}</small></span>
      <span class="kur-ark-tik" aria-hidden="true">${on ? '✓' : ''}</span></button>`; }).join('')}</div>`;
}
export async function kurulumDavet(uid, gameId, opts) {
  await davetEt(uid, gameId, opts);
}

// ---- Online sayfası kartları
const IC = {};
// Demir 11.11: arkadaş çoğalınca 6'dan fazlasında arama kutusu, çevrimdışılardan ilk 5'i + "Tümünü göster"
const ARK_SINIR = 6;
const araAnahtar = p => String((p.ad || '') + ' ' + (p.lakap || '')).toLocaleLowerCase('tr');
const svgA = d => `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC_ALT = {
  acik: '<i class="on-alt-nokta acik"></i>', kapali: '<i class="on-alt-nokta"></i>',
  istek: svgA('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'),
  bekle: svgA('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  ara: svgA('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
};
const altBas = (ic, yazi, n, sinif = '') => `<div class="on-alt-bas ${sinif}">${ic}<span>${yazi}</span><b>${n}</b></div>`;
// arama: yeniden çizmeden satırları süzer (yazarken klavye kapanmasın)
function araSuz(input) {
  const kart = input.closest('.ay-grup'); if (!kart) return;
  const q = input.value.trim().toLocaleLowerCase('tr');
  if (q && !durum.hepsi) { durum.hepsi = true; C.render(); const yeni = document.querySelector('[data-on-ara]'); if (yeni) { yeni.value = input.value; yeni.focus(); araSuz(yeni); } return; }
  let gorunen = 0;
  kart.querySelectorAll('.on-ark[data-ara]').forEach(r => { const g = !q || r.dataset.ara.includes(q); r.hidden = !g; if (g) gorunen++; });
  const yok = kart.querySelector('.on-ara-yok'); if (yok) yok.hidden = !q || gorunen > 0;
}
function avatar(ad, foto, sinif = 'uy-av kucuk') {
  const r = foto || adResim(ad);
  if (r) return `<img class="${sinif}" src="${r}" alt="">`;
  return `<span class="${sinif} harf">${esc((String(ad || '?').trim()[0] || '?').toLocaleUpperCase('tr'))}</span>`;
}
export function onlineKartlari() {
  if (!acik()) return '';
  const ben = benUid(); const p = H.uye().profil || {};
  const A = durum.arkadaslik;
  const karsi = a => a.uids.find(u => u !== ben);
  const pr = u => durum.profil[u] || { ad: '…' };
  const gelen = A.filter(a => a.durum === 'bekliyor' && a.isteyen !== ben);
  const giden = A.filter(a => a.durum === 'bekliyor' && a.isteyen === ben);
  const sira = { acik: 0, macta: 1, kapali: 2 };
  const ark = A.filter(a => a.durum === 'kabul').sort((x, y) => (sira[varlikDurum(karsi(x)).tur] - sira[varlikDurum(karsi(y)).tur]) || pr(karsi(x)).ad.localeCompare(pr(karsi(y)).ad, 'tr'));
  const sat = (u, sag, alt = '', vd = null) => `<div class="ay-satir on-ark" data-ara="${esc(araAnahtar(pr(u)))}"><button type="button" class="on-kisi" data-act="on-profil" data-u="${u}"><span class="on-av-yer">${avatar(pr(u).ad, pr(u).foto)}${vd ? `<i class="on-nokta ${vd.tur}" title="${esc(vd.yazi)}"></i>` : ''}</span><span class="ay-ad">${esc(pr(u).ad)}${pr(u).seviye ? ' ' + seviyeRozet(pr(u).seviye, dil()) : ''}${alt ? `<small>${alt}</small>` : ''}</span></button><span class="on-tuslar">${sag}</span></div>`;
  const arkSat = a => { const vd = varlikDurum(karsi(a)); return sat(karsi(a), kucuk('on-davet', t('Maça davet et'), `data-u="${karsi(a)}"`, 'primary'), `<span class="on-durum ${vd.tur}">${esc(vd.yazi)}</span>`, vd); };
  const arkListe = () => {
    if (!ark.length) return '';
    const acikO = ark.filter(a => varlikDurum(karsi(a)).tur !== 'kapali');
    const kapaliO = ark.filter(a => varlikDurum(karsi(a)).tur === 'kapali');
    const kalabalik = ark.length > ARK_SINIR;
    const gorunen = kalabalik && !durum.hepsi ? kapaliO.slice(0, ARK_SINIR - 1) : kapaliO;
    return (kalabalik ? `<label class="on-ara">${IC_ALT.ara}<input class="uy-girdi" type="search" data-on-ara placeholder="${t('Arkadaş ara ({0})', ark.length)}" autocomplete="off"></label>` : '')
      + (acikO.length ? altBas(IC_ALT.acik, t('Çevrimiçi'), acikO.length, 'acik') + acikO.map(arkSat).join('') : '')
      + (kapaliO.length ? altBas(IC_ALT.kapali, acikO.length ? t('Diğer arkadaşlar') : t('Arkadaşlar'), kapaliO.length) + `<div class="on-kapali-liste">${gorunen.map(arkSat).join('')}</div>` : '')
      + (kalabalik && kapaliO.length > gorunen.length ? `<button type="button" class="on-hepsi" data-act="on-hepsi">${t('Tümünü göster ({0})', kapaliO.length)}</button>` : '')
      + (kalabalik && durum.hepsi ? `<button type="button" class="on-hepsi" data-act="on-hepsi">${t('Daha az göster')}</button>` : '')
      + `<p class="uy-not on-bos on-ara-yok" hidden>${t('Bu adla arkadaş yok')}</p>`;
  };
  const kucuk = (act, yazi, ek = '', tur = '') => `<button type="button" class="btn on-btn ${tur}" data-act="${act}" ${ek}>${yazi}</button>`;
  const arkadasHtml = `
    <form class="on-ekle" data-act="on-ekle"><input class="uy-girdi" name="kod" placeholder="${t('Arkadaş kodu (DX-…)')}" autocomplete="off" autocapitalize="characters" maxlength="8"><button type="submit" class="btn primary on-btn"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>${t('Ekle')}</button></form>
    <div class="on-kodum">${t('Senin kodun')}: <button type="button" class="uy-kod" data-act="on-kodpaylas"><b>${p.kod || ''}</b> ${t('Paylaş')}</button>
      <span class="on-qr-tuslar"><button type="button" class="on-qr-btn" data-act="on-qr">${QR_SIMGE}<span>${t('QR kodum')}</span></button><button type="button" class="on-qr-btn" data-act="on-qroku">${OKU_SIMGE}<span>${t('QR okut')}</span></button></span></div>
    ${gelen.length ? altBas(IC_ALT.istek, t('Arkadaşlık istekleri'), gelen.length) : ''}
    ${gelen.map(a => sat(karsi(a), kucuk('on-kabul', t('Kabul et'), `data-id="${a.id}"`, 'primary') + kucuk('on-sil', '✕', `data-id="${a.id}" aria-label="${t('Reddet')}"`), t('Seni arkadaş olarak eklemek istiyor'))).join('')}
    ${arkListe()}
    ${giden.length ? altBas(IC_ALT.bekle, t('Gönderdiğin istekler'), giden.length) : ''}
    ${giden.map(a => sat(karsi(a), kucuk('on-sil', t('İptal'), `data-id="${a.id}"`), t('Kabul etmesi bekleniyor'))).join('')}
    ${!A.length ? `<p class="uy-not on-bos">${t('Arkadaşının kodunu yaz ya da kendi kodunu ona gönder. İkiniz de üye olmalısınız.')}</p>` : ''}`;
  const M = durum.maclar.slice().sort((x, y) => (y.guncel?.seconds || 0) - (x.guncel?.seconds || 0));
  const macHtml = M.length ? M.map(d => {
    const k = d.uids.find(u => u !== ben); const ad = (d.adlar && d.adlar[k]) || pr(k).ad; const oy = oyunAd(d.gameId, d.opts);
    if (d.durum === 'davet' && d.davetEden !== ben) return sat(k, kucuk('on-kabulmac', t('Kabul et'), `data-id="${d.id}"`, 'primary') + kucuk('on-redmac', '✕', `data-id="${d.id}" aria-label="${t('Reddet')}"`), t('{0} · seni çağırıyor', esc(oy)));
    if (d.durum === 'davet') return sat(k, kucuk('on-iptalmac', t('İptal'), `data-id="${d.id}"`), t('{0} · kabul etmesi bekleniyor', esc(oy)));
    return sat(k, kucuk('on-devam', t('Devam et'), `data-id="${d.id}"`, 'primary'), t('{0} · oynanıyor', esc(oy)));
  }).join('') : `<p class="uy-not on-bos">${t('Bir arkadaşını maça davet et; kabul edince maç ikinizde de açılır.')}</p>`;
  return C.kart(C.IC.uye, t('Arkadaşlar'), arkadasHtml, 'on-kart') + C.kart(C.IC.lig, t('Online maçlar'), macHtml, 'on-kart');
}

// ---- olaylar (app.js'ten çağrılır)
export async function onlineTikla(act, el) {
  const is = async (fn, basari) => { try { const r = await fn(); if (basari) C.toast(basari, 'ok'); return r; } catch (e) { console.warn(e); C.toast(hata(e), 'bad', { sure: 3000 }); return undefined; } };
  const bul = id => durum.maclar.find(x => x.id === id);
  switch (act) {
    case 'on-kodpaylas': {
      const kod = (H.uye().profil || {}).kod; const metin = t('DartX\'te arkadaş olalım! Kodum: {0} · https://dartx.net', kod);
      try { if (navigator.share) await navigator.share({ text: metin }); else { await navigator.clipboard.writeText(metin); C.toast(t('Arkadaş kodu kopyalandı'), 'ok'); } } catch (_) { /* vazgeçti */ }
      return true;
    }
    case 'on-qr': { const p = H.uye().profil || {}; qrGoster({ kod: p.kod || '', ad: p.ad, foto: p.foto }); return true; }
    case 'on-qroku': { const k = await qrOku(); if (k) await qrIleEkle(k); return true; }
    case 'on-profil': arkadasProfil(el.dataset.u); return true;
    case 'on-hepsi': durum.hepsi = !durum.hepsi; C.render(); return true;
    case 'on-kabul': await is(() => istekKabul(el.dataset.id), t('Artık arkadaşsınız')); return true;
    case 'on-sil': await is(() => arkadaslikSil(el.dataset.id)); return true;
    case 'on-davet': {
      const liste = ONLINE_OYUN.map(([v, ad]) => [v, ad || gt(GAMES[v], 'name')]);
      const v = await C.secim(el, t('Hangi oyun?'), liste, null); if (!v) return true;
      await is(() => davetEt(el.dataset.u, v), t('Davet gönderildi'));
      return true;
    }
    case 'on-kabulmac': { const d = bul(el.dataset.id); if (d) await is(() => davetKabul(d)); return true; }
    case 'on-redmac': { const d = bul(el.dataset.id); if (d) await is(() => davetRed(d)); return true; }
    case 'on-iptalmac': { const d = bul(el.dataset.id); if (d) await is(() => macIptal(d)); return true; }
    case 'on-devam': { const d = bul(el.dataset.id); if (d) macaGir(d); return true; }
  }
  return false;
}
export async function onlineGonder(f) {
  if (f.dataset.act !== 'on-ekle') return false;
  const kod = f.elements.kod.value;
  try {
    const r = await arkadasEkle(kod);
    C.toast(r === 'kabul' ? t('Artık arkadaşsınız') : t('Arkadaşlık isteği gönderildi'), 'ok');
    f.elements.kod.value = '';
  } catch (e) { C.toast(hata(e), 'bad', { sure: 3000 }); }
  return true;
}
const HATA = { 'kod-gecersiz': 'Kod DX- ile başlayan 4 harf/rakam olmalı', 'kod-yok': 'Bu kodla bir üye bulunamadı', 'kod-senin': 'Bu senin kendi kodun',
  'zaten-arkadas': 'Zaten arkadaşsınız', 'istek-var': 'İsteğin zaten gönderildi' };
const hata = e => (HATA[e && e.code] ? t(HATA[e.code]) : H.hataMetni(e));
