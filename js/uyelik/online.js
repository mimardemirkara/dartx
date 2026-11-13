// Arkadaşlar ve online maç (Demir 11.11). Biri evde biri başka yerde: herkes kendi tahtasına atar, kendi okunu girer,
// karşı taraf anında görür. İki telefon arasında yalnız maçın hamle listesi (engine adimlar) eşitlenir; maç her iki
// telefonda da aynı listeden aynen kurulur (aynı tohum, aynı sonuç).
// Firestore: profiller/{uid} (ad, foto, kod) · kodlar/{kod} → uid · arkadaslik/{uidA_uidB} · online/{id} · varlik/{uid} (çevrimiçi durumu; yalnız arkadaşlar okur)
import { bulut } from './bulut.js';
import * as H from './hesap.js';
import { data, save, addPlayer, updatePlayer, setCurrent, araSil } from '../store.js';
import * as E from '../engine.js';
import { GAMES } from '../games/index.js';
import { t, gt } from '../i18n.js';
import { esc, adResim } from '../util.js';
import { seviyeRozet } from './meslek.js';
import { qrGoster, qrOku, qrKodBul, QR_SIMGE, OKU_SIMGE } from './qr.js';
import { dil, dilIki } from '../i18n.js';

let C = null;
const durum = { arkadaslik: [], maclar: [], profil: {}, dinliyor: null, varlik: {}, varlikDinle: {} };
const goruldu = new Set();
const siraGordum = new Map(); // maç id → sıra bende mi (son görülen)
const araGordum = new Map(); // maç id → rakip ara verdi mi (son görülen)
const clone = o => JSON.parse(JSON.stringify(o));

// ---- Uygulama içi bildirim (Demir 12.11): üst çubuktan aşağı inen şerit; birkaç saniye sonra geri çıkar, dokununca ilgili yere gider
const BILDIRIM_IC = {
  acik: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="9"/>',
  ara: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  don: '<polygon points="6 3 20 12 6 21 6 3"/>',
  iptal: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  davet: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  tamam: '<path d="M20 6 9 17l-5-5"/>',
  kisi: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
};
const bildirimKuyruk = []; let bildirimAcik = false;
/** yazi: HTML (adlar esc'li gelir) · tur: BILDIRIM_IC anahtarı · renk: iyi | kotu | '' · git: dokununca çalışır */
function bildir(yazi, { tur = 'acik', renk = '', foto = '', ad = '', git = null, sure = 3800 } = {}) {
  bildirimKuyruk.push({ yazi, tur, renk, foto, ad, git, sure });
  if (!bildirimAcik) bildirimGoster();
}
function bildirimGoster() {
  const b = bildirimKuyruk.shift(); if (!b) { bildirimAcik = false; return; }
  bildirimAcik = true;
  const el = document.createElement('button');
  el.type = 'button'; el.className = 'dx-bildirim ' + b.renk; el.setAttribute('role', 'status');
  el.innerHTML = `${b.ad || b.foto ? avatar(b.ad, b.foto, 'uy-av kucuk dxb-av') : ''}<span class="dxb-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BILDIRIM_IC[b.tur] || BILDIRIM_IC.acik}</svg></span><span class="dxb-yazi">${b.yazi}</span>`;
  document.body.appendChild(el);
  let bitti = false;
  const kapat = () => { if (bitti) return; bitti = true; el.classList.remove('gor'); setTimeout(() => { el.remove(); bildirimGoster(); }, 320); };
  el.addEventListener('click', () => { kapat(); if (b.git) { try { b.git(); } catch (_) { /* yok say */ } } });
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('gor')));
  if (C && C.vib) C.vib(10);
  setTimeout(kapat, b.sure);
}
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
  window.addEventListener('dartx-mac-bitti', () => { macPaylas(); }); // Yan yanayız: biten maç arkadaşa da gider
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
    durum.varlikDinle[u] = F.onSnapshot(F.doc(db, 'varlik', u), s => {
      const ilk = !(u in durum.varlik), once = ilk ? null : varlikDurum(u).tur;
      durum.varlik[u] = s.exists() ? s.data() : null;
      const simdi = varlikDurum(u).tur;
      // Demir 12.11: arkadaş çevrimdışıyken çevrimiçi olduysa şerit bildirimi (ilk yüklemede değil)
      if (!ilk && once === 'kapali' && simdi !== 'kapali') profilAl(u).then(p => bildir(t('{0} çevrimiçi oldu', `<b>${esc(p.ad || '')}</b>`), { tur: 'acik', renk: 'iyi', ad: p.ad, foto: p.foto, git: () => C.go('online') }));
      tazele();
    }, () => {});
  }
  for (const u of Object.keys(durum.varlikDinle)) if (!arkadaslar.includes(u)) { durum.varlikDinle[u](); delete durum.varlikDinle[u]; delete durum.varlik[u]; }
}
// bugünse yalnız saat (16:30), değilse gün + saat (11 Kas 16:30)
const saatYazi = ms => { if (!ms) return ''; const d = new Date(ms), yer = dil() !== 'tr' ? 'en-GB' : 'tr-TR'; const s = d.toLocaleTimeString(yer, { hour: '2-digit', minute: '2-digit' });
  return d.toDateString() === new Date().toDateString() ? s : `${d.toLocaleDateString(yer, { day: 'numeric', month: 'short' })} ${s}`; };
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
        goruldu.add('a' + c.doc.id); profilAl(d.isteyen).then(p => bildir(t('{0} seni arkadaş olarak ekledi', `<b>${esc(p.ad)}</b>`), { tur: 'kisi', ad: p.ad, foto: p.foto, git: () => C.go('online') }));
      }
    });
    durum.arkadaslik.forEach(a => a.uids.forEach(u => { if (u !== ben) profilAl(u); }));
    varlikIzle(durum.arkadaslik.filter(a => a.durum === 'kabul').map(a => a.uids.find(u => u !== ben)));
    tazele();
  }, () => {}));
  durum.dinliyor.push(F.onSnapshot(F.query(F.collection(db, 'online'), F.where('uids', 'array-contains', ben)), s => {
    durum.maclar = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.durum !== 'bitti' && d.durum !== 'red' && d.durum !== 'iptal');
    s.docChanges().forEach(c => {
      const d = { id: c.doc.id, ...c.doc.data() }; const karsi = d.uids.find(u => u !== ben);
      const ad = (d.adlar && d.adlar[karsi]) || '';
      if (d.durum === 'davet' && d.davetEden !== ben && !goruldu.has('d' + d.id)) {
        goruldu.add('d' + d.id); bildir(t('{0} seni {1} maçına çağırıyor', `<b>${esc(ad)}</b>`, esc(oyunAd(d.gameId, d.opts))), { tur: 'davet', ad, foto: d.fotolar && d.fotolar[karsi], git: () => C.go('online'), sure: 6000 });
      }
      if (d.durum === 'oyunda' && d.davetEden === ben && !goruldu.has('k' + d.id) && !(data().current && data().current.online && data().current.online.id === d.id)) {
        goruldu.add('k' + d.id);
        bildir(t('{0} davetini kabul etti', `<b>${esc(ad)}</b>`), { tur: 'tamam', renk: 'iyi', ad, foto: d.fotolar && d.fotolar[karsi] });
        if (C.S.view !== 'play') macaGir(d);
      }
      // Demir 12.11: rakip maçı iptal etti → uyarı, maç bu telefondan da kalkar
      if (d.durum === 'iptal' && d.iptalEden !== ben && !goruldu.has('i' + d.id)) {
        goruldu.add('i' + d.id);
        const cur = data().current;
        if (cur && cur.online && cur.online.id === d.id) { data().current = null; save(); E.clearUndo(); if (C.S.view === 'play') C.go('home'); }
        else { const p = (data().ara || []).find(x => x.online && x.online.id === d.id); if (p) araSil(p.id); }
        bildir(t('{0} maçı iptal etti', `<b>${esc(ad)}</b>`), { tur: 'iptal', renk: 'kotu', ad, foto: d.fotolar && d.fotolar[karsi], sure: 4500 });
      }
      // Demir 12.11: maç karşı tarafta bitti ama bu telefonda yarım duruyor (ara verilmiş ya da uygulama kapalıydı) → geçmişe taşınır
      if (d.durum === 'bitti' && !goruldu.has('b' + d.id)) {
        const cur = data().current, park = (data().ara || []).find(x => x.online && x.online.id === d.id);
        const yerel = cur && cur.online && cur.online.id === d.id ? null : park; // şimdiki maç aşağıda uygula() ile (son ok sesli/animasyonlu) biter
        if (yerel && !yerel.done) {
          goruldu.add('b' + d.id);
          try {
            E.hamlelerleKur(yerel, yereleCevir(d.adimlar, yerel.online.harita)); yerel.online.surum = d.surum || 0; yerel.online.anahtar = anahtar(yerel.adimlar);
            if (yerel.done) {
              if (yerel === cur) C.macBitti(yerel);
              else { araSil(yerel.id); delete yerel.hesap; data().history.unshift(yerel); save(); window.dispatchEvent(new Event('dartx-mac-bitti')); }
              bildir(t('{0} ile maçın bitti', `<b>${esc(ad)}</b>`), { tur: 'tamam', renk: 'iyi', ad, foto: d.fotolar && d.fotolar[karsi], git: () => C.go('stats'), sure: 5000 });
            }
          } catch (hata_) { console.warn('bitiş', hata_); }
        }
      }
      // Demir 12.11: rakip maça ara verdi / döndü
      if (d.durum === 'oyunda') {
        const araK = !!(d.ara && d.ara[karsi]), once = araGordum.get(d.id);
        if (once !== undefined && once !== araK) {
          bildir(araK ? t('{0} maça ara verdi', `<b>${esc(ad)}</b>`) : t('{0} maça döndü', `<b>${esc(ad)}</b>`), { tur: araK ? 'ara' : 'don', renk: araK ? 'kotu' : 'iyi', ad, foto: d.fotolar && d.fotolar[karsi], git: araK ? null : () => macaGir(d) });
        }
        araGordum.set(d.id, araK);
      }
      if (d.durum === 'red' && d.davetEden === ben && !goruldu.has('r' + d.id)) { goruldu.add('r' + d.id); bildir(t('{0} daveti kabul etmedi', `<b>${esc(ad)}</b>`), { tur: 'iptal', renk: 'kotu', ad, foto: d.fotolar && d.fotolar[karsi] }); }
      const m = data().current;
      if (m && m.online && m.online.id === d.id) uygula(d);
      // Demir 12.11: "sıra sende" — maç ekranında değilken rakip atışını bitirdiyse şerit bildirimi
      if (d.durum === 'oyunda') {
        try {
          const cur2 = data().current;
          let yerel = cur2 && cur2.online && cur2.online.id === d.id ? cur2 : null;
          if (!yerel) {
            const park = (data().ara || []).find(x => x.online && x.online.id === d.id);
            if (park && (d.surum || 0) > (park.online.surum || 0)) { E.hamlelerleKur(park, yereleCevir(d.adimlar, park.online.harita)); park.online.surum = d.surum || 0; park.online.anahtar = anahtar(park.adimlar); save(); }
            yerel = park || null;
          }
          if (yerel && !yerel.done && (yerel.adimlar || []).some(a => a.t === 'b')) {
            const bende = E.currentPid(yerel) === yerel.online.ben, once = siraGordum.get(d.id);
            const ekranda = yerel === cur2 && C.S.view === 'play';
            if (once === false && bende && !ekranda) bildir(t('Sıra sende: {0} ile {1}', `<b>${esc(ad)}</b>`, esc(oyunAd(d.gameId, d.opts))), { tur: 'davet', ad, foto: d.fotolar && d.fotolar[karsi], git: () => macaGir(d), sure: 6000 });
            siraGordum.set(d.id, bende);
          }
        } catch (hata_) { console.warn('sıra', hata_); }
      }
    });
    tazele();
  }, () => {}));
  // Yan yanayız: arkadaşların bu hesaba gönderdiği maçlar
  durum.dinliyor.push(F.onSnapshot(F.query(F.collection(db, 'paylasim'), F.where('alici', '==', ben)), s => {
    s.docChanges().forEach(c => {
      if (c.type !== 'added' || goruldu.has('p' + c.doc.id)) return; goruldu.add('p' + c.doc.id);
      const d = c.doc.data(); let ok = false;
      try { ok = macAl(d); } catch (e) { console.warn('maç al', e); }
      if (ok) {
        F.deleteDoc(c.doc.ref).catch(() => {});
        bildir(t('{0} ile yan yana oynadığın maç istatistiklerine eklendi', `<b>${esc(d.gonderenAd || '')}</b>`), { tur: 'tamam', renk: 'iyi', ad: d.gonderenAd || '', git: () => C.go('stats'), sure: 6000 });
        tazele();
      }
    });
  }, () => {}));
}
// ---- Yan yanayız (Demir 14.11): tek cihazda oynanan maç, oyuncusu olan arkadaşların hesabına da yazılır
const kabulArk = () => { const ben = benUid(); return durum.arkadaslik.filter(a => a.durum === 'kabul').map(a => a.uids.find(u => u !== ben)); };
/** Kurulum ekranı için: arkadaş listesi (uid, ad, foto, bu cihazdaki oyuncu kimliği varsa) */
export function yanYanaArkadaslar() {
  if (!acik()) return [];
  return kabulArk().map(u => { const p = durum.profil[u] || {}; const o = data().players.find(x => x.uid === u && !x.silindi); return { uid: u, ad: p.ad || '…', foto: p.foto || '', pid: o ? o.id : null }; })
    .sort((x, y) => x.ad.localeCompare(y.ad, 'tr'));
}
/** Arkadaşı bu cihaza oyuncu olarak ekler (aynı adlı yerel oyuncu varsa onunla birleşir); oyuncu kimliğini döner */
export function arkadasOyuncuEkle(uid) { const p = durum.profil[uid] || {}; return arkadasOyuncu(uid, p.ad, p.foto); }
const oyuncuAnahtar = (pid, ben) => { const o = data().players.find(x => x.id === pid) || {}; const benim = (H.uye().profil || {}).oyuncuId; return pid === benim ? 'u:' + ben : o.uid ? 'u:' + o.uid : 'n:' + (o.name || '?'); };
/** Biten yerel maçı, içinde oynayan arkadaşların hesabına gönderir */
async function macPaylas() {
  try {
    if (!acik()) return;
    const m = (data().history || [])[0]; if (!m || m.online || m.paylasildi || m.paylasan || !m.bas || !m.adimlar || !m.done) return;
    const ben = benUid(), ark = new Set(kabulArk());
    const pidler = m.sides.flatMap(s => s.members);
    const alicilar = [...new Set(pidler.map(pid => (data().players.find(x => x.id === pid) || {}).uid).filter(u => u && u !== ben && ark.has(u)))];
    if (!alicilar.length) return;
    const harita = {}; pidler.forEach(pid => { harita[pid] = oyuncuAnahtar(pid, ben); });
    const bas = clone(m.bas); bas.sides = bas.sides.map(s => ({ ...s, members: s.members.map(pid => harita[pid] || 'n:?') }));
    const adimlar = (m.adimlar || []).map(a => (a.p != null && harita[a.p] ? { ...a, p: harita[a.p] } : { ...a }));
    const oyuncular = {}; pidler.forEach(pid => { const o = data().players.find(x => x.id === pid) || {}; oyuncular[harita[pid]] = { ad: o.name || '', bot: !!o.bot }; });
    const { db, F } = await bulut(); const p = H.uye().profil || {};
    for (const alici of alicilar) {
      await F.setDoc(F.doc(F.collection(db, 'paylasim')), { gonderen: ben, alici, gonderenAd: p.ad || '', mac: { id: m.id, bas, adimlar, started: m.started, ended: m.ended }, oyuncular, olusturma: F.serverTimestamp() });
    }
    m.paylasildi = alicilar; save();
  } catch (e) { console.warn('paylaş', e); }
}
/** Arkadaşın gönderdiği maçı bu hesabın geçmişine ekler */
function macAl(d) {
  const ben = benUid(); const mac = d.mac || {}; const bas = mac.bas;
  if (!bas || !Array.isArray(mac.adimlar) || d.alici !== ben) return false;
  if ((data().history || []).some(h => h.id === mac.id)) return true; // zaten var
  const yerel = {};
  const cevir = k => {
    if (yerel[k]) return yerel[k];
    const bilgi = (d.oyuncular || {})[k] || {}; let id;
    if (k === 'u:' + ben) id = kendiOyuncum();
    else if (k.startsWith('u:')) { const u = k.slice(2); const pr = durum.profil[u] || {}; id = arkadasOyuncu(u, pr.ad || bilgi.ad, pr.foto); }
    else { const ad = bilgi.ad || k.slice(2); const o = data().players.find(x => !x.uid && !x.silindi && !!x.bot === !!bilgi.bot && x.name.toLocaleLowerCase('tr') === String(ad).toLocaleLowerCase('tr')) || addPlayer(ad || t('Arkadaş')); id = o.id; }
    return (yerel[k] = id);
  };
  const bas2 = clone(bas); bas2.sides = bas2.sides.map(s => ({ ...s, members: s.members.map(cevir) }));
  const adim2 = mac.adimlar.map(a => (a.p != null ? { ...a, p: cevir(a.p) } : { ...a }));
  const m = E.createMatch(bas2.gameId, clone(bas2.opts), clone(bas2.sides), bas2);
  E.hamlelerleKur(m, adim2);
  if (!m.done) return false; // bitmemiş ya da bozuk kayıt eklenmez
  m.started = mac.started || m.started; m.ended = mac.ended || Date.now();
  m.paylasan = { uid: d.gonderen, ad: d.gonderenAd || '' };
  data().history.unshift(m); data().history.sort((a, b) => (b.started || 0) - (a.started || 0)); save();
  window.dispatchEvent(new Event('dartx-mac-bitti'));
  return true;
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
  const p = durum.profil[u] || {}; const vd = varlikDurum(u); const en = dil() !== 'tr';
  const oz = en ? (p.okOzetEn || p.okOzet) : p.okOzet;
  const ok = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 19 5"/><path d="m19.8 6.6-2.4-2.4-4.2 4.2 2.4 2.4Z"/><path d="m16.2 6.4 1.4 1.4"/><path d="M14.4 9.6 9 15"/><path d="M9 15 2 16l2.8 3.2L8 22Z"/></svg>';
  const kisi = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const pd = document.createElement('div'); pd.className = 'modal-bg uy-soru';
  pd.innerHTML = `<div class="modal glass uy-soru-kart ark-profil" role="dialog" aria-modal="true"><h3 class="uy-soru-bas">${kisi}<span>${t('Arkadaş')}</span></h3>
    <div class="ark-bas"><span class="on-av-yer">${avatar(p.ad, p.foto, 'uy-av buyuk')}<i class="on-nokta ${vd.tur}"></i></span>
      <b>${esc(p.ad || '')}</b>${p.lakap || p.seviye ? `<span class="uy-ad-alt">${p.lakap ? `<i class="uy-lakap">“${esc(p.lakap)}”</i>` : ''}${seviyeRozet(p.seviye, dilIki())}</span>` : ''}
      <small class="on-durum ${vd.tur}">${esc(vd.yazi)}</small>${p.kod ? `<small class="ark-kod">${esc(p.kod)}</small>` : ''}</div>
    <div class="uy-alt-bas">${ok}<span>${t('Ok seti')}</span></div>
    <p class="ark-ok">${oz ? esc(oz) : `<span class="soluk">${t('Henüz eklememiş')}</span>`}</p>
    <div class="uy-soru-dugmeler"><button type="button" class="btn" data-h="kapat">${t('Kapat')}</button><button type="button" class="btn primary" data-h="davet">${t('Maça davet et')}</button></div>
    <div class="ark-guvenlik"><button type="button" data-h="cikar">${t('Arkadaşlıktan çıkar')}</button><button type="button" data-h="sikayet">${t('Şikayet et')}</button><button type="button" class="tehlike" data-h="engelle">${t('Engelle')}</button></div></div>`;
  document.body.appendChild(pd);
  const kapat = () => { pd.classList.add('kapan'); setTimeout(() => pd.remove(), 200); };
  pd.addEventListener('click', e => {
    if (e.target === pd || e.target.closest('[data-h="kapat"]')) return kapat();
    if (e.target.closest('[data-h="davet"]')) { kapat(); const b = document.querySelector(`[data-act="on-davet"][data-u="${u}"]`); if (b) b.click(); }
    const ad = (durum.profil[u] || {}).ad || '';
    if (e.target.closest('[data-h="cikar"]')) { kapat(); (async () => { if (!(await C.onayla({ baslik: t('{0} arkadaşlıktan çıkarılsın mı?', ad), metin: t('Birbirinizi listede görmezsiniz; istersen sonra yeniden ekleyebilirsin.'), evet: t('Çıkar'), tehlike: true }))) return; try { await arkadasCikar(u); C.toast(t('Arkadaşlıktan çıkarıldı'), 'ok'); } catch (er) { C.toast(hata(er), 'bad'); } })(); }
    if (e.target.closest('[data-h="engelle"]')) { kapat(); (async () => { if (!(await C.onayla({ baslik: t('{0} engellensin mi?', ad), metin: t('Arkadaşlığınız biter; sana istek ya da maç daveti gönderemez, çevrimiçi durumunu göremez. Engeli Hesabım → Engellediklerim’den kaldırabilirsin.'), evet: t('Engelle'), tehlike: true }))) return; try { await engelle(u); C.toast(t('{0} engellendi', ad), 'ok'); } catch (er) { C.toast(hata(er), 'bad'); } })(); }
    if (e.target.closest('[data-h="sikayet"]')) { const b = e.target.closest('[data-h="sikayet"]'); (async () => { const v = await C.secim(b, t('Neden şikayet ediyorsun?'), SIKAYET.map(([k, y]) => [k, t(y)]), null); if (!v) return; kapat(); try { await sikayetEt(u, v); C.toast(t('Şikayetin alındı. İnceleyeceğiz; istersen bu kişiyi engelleyebilirsin.'), 'ok', { sure: 4000 }); } catch (er) { C.toast(hata(er), 'bad'); } })(); }
  });
  pd.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(); });
}

// ---- engelle / şikayet et / arkadaşlıktan çıkar (Demir 11.11)
const ciftId = (a, b) => [a, b].sort().join('_');
export async function arkadasCikar(u) {
  const { db, F } = await bulut(); const ben = benUid();
  await F.deleteDoc(F.doc(db, 'arkadaslik', ciftId(ben, u)));
}
export async function engelle(u) {
  const { db, F } = await bulut(); const ben = benUid();
  await F.setDoc(F.doc(db, 'engeller', ben + '_' + u), { eden: ben, edilen: u, ad: (durum.profil[u] || {}).ad || '', zaman: F.serverTimestamp() });
  await F.deleteDoc(F.doc(db, 'arkadaslik', ciftId(ben, u))).catch(() => {});
  for (const d of durum.maclar.filter(m => m.uids.includes(u))) await F.deleteDoc(F.doc(db, 'online', d.id)).catch(() => {});
}
export async function engelKaldir(u) { const { db, F } = await bulut(); await F.deleteDoc(F.doc(db, 'engeller', benUid() + '_' + u)); }
export async function engellenenler() {
  const { db, F } = await bulut();
  const s = await F.getDocs(F.query(F.collection(db, 'engeller'), F.where('eden', '==', benUid())));
  return s.docs.map(d => d.data());
}
export async function sikayetEt(u, neden) {
  const { db, F } = await bulut(); const p = durum.profil[u] || {};
  await F.addDoc(F.collection(db, 'sikayetler'), { eden: benUid(), edilen: u, neden, ad: p.ad || '', lakap: p.lakap || '', foto: !!p.foto, zaman: F.serverTimestamp() });
}
const SIKAYET = [['ad', 'Uygunsuz ad ya da lakap'], ['foto', 'Uygunsuz fotoğraf'], ['hile', 'Hile / yanlış skor girişi'], ['taciz', 'Taciz ya da hakaret'], ['diger', 'Diğer']];

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
    adimlar: [], // Demir 12.11: ilk kim atacak, maç açılınca daveti gönderene sorulur (Bull'a At, Yazı Tura, Rastgele, Sen Seç)
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
  if (cur && cur.online && cur.online.id === d.id) { C.go('play', basModal(cur)); araBildir(cur, false); return; }
  const parkta = (data().ara || []).find(x => x.online && x.online.id === d.id);
  if (parkta) { C.devam(parkta.id); if (data().current) { Object.assign(C.S, basModal(data().current)); C.render(); araBildir(data().current, false); } return; }
  const ben = benUid();
  const harita = {};
  d.uids.forEach(u => { harita[u] = u === ben ? kendiOyuncum() : arkadasOyuncu(u, d.adlar && d.adlar[u], d.fotolar && d.fotolar[u]); });
  const bas = clone(d.bas); bas.sides = bas.sides.map(s => ({ ...s, members: s.members.map(u => harita[u]) }));
  const m = E.createMatch(bas.gameId, clone(bas.opts), clone(bas.sides), bas);
  m.online = { id: d.id, surum: d.surum || 0, harita, ben: harita[ben], davetci: d.davetEden === ben };
  E.hamlelerleKur(m, yereleCevir(d.adimlar, harita));
  m.online.anahtar = anahtar(m.adimlar);
  E.clearUndo();
  setCurrent(m);
  C.go('play', basModal(m));
}
/** Demir 12.11: başlayan henüz seçilmediyse daveti gönderen "İlk kim atacak?" ekranını görür, rakibi bekler */
export function basModal(m) {
  if (!(m && m.online) || m.done || (m.adimlar || []).some(a => a.t === 'b')) return {};
  return { modal: { type: m.online.davetci ? 'baslayan' : 'onlineBekle' } };
}
/** Demir 12.11: maça ara verince / dönünce rakibe haber gider (maç belgesinde ara.{uid}) */
export async function araBildir(m, ara) {
  if (!(m && m.online) || m.done || !acik()) return;
  if (!!m.online.araVerdim === !!ara) return;
  m.online.araVerdim = !!ara;
  try { const { db, F } = await bulut(); await F.updateDoc(F.doc(db, 'online', m.online.id), { ['ara.' + benUid()]: ara ? Date.now() : null, guncel: F.serverTimestamp() }); } catch (_) { m.online.araVerdim = !ara; }
}
/** Demir 12.11: online maçın rövanşı — aynı oyun ve ayarlarla rakibe yeni davet */
export async function rovans(m) {
  if (!(m && m.online)) return false;
  const ben = benUid(); const karsi = Object.keys(m.online.harita || {}).find(u => u !== ben);
  if (!karsi) return false;
  const ozel = clone(m.opts || {});
  await davetEt(karsi, m.gameId === 'x01' ? 'x01:' + (ozel.start || 501) : m.gameId, ozel);
  return true;
}
/** Demir 12.11: maç iptal edilince rakibe haber gider */
export async function onlineIptal(m) {
  if (!(m && m.online)) return;
  try { const { db, F } = await bulut(); await F.updateDoc(F.doc(db, 'online', m.online.id), { durum: 'iptal', iptalEden: benUid(), guncel: F.serverTimestamp() }); } catch (_) { /* yok say */ }
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
  if (m.done) {
    if (m.cekildi != null) { const kp = (m.sides[m.cekildi] || {}).members || []; const kisi = data().players.find(x => x.id === kp[0]); bildir(t('{0} maçtan çekildi, maçı sen kazandın', `<b>${esc(kisi ? kisi.name : '')}</b>`), { tur: 'tamam', renk: 'iyi', ad: kisi ? kisi.name : '', sure: 5000 }); }
    C.macBitti(m); return; // Demir 12.11: rakip maçı bitirdi (erken bitirme ve çekilme dahil)
  }
  if (C.S.modal && C.S.modal.type === 'onlineBekle' && m.adimlar.some(a => a.t === 'b')) C.S.modal = { type: 'ilksira' }; // Demir 12.11
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
  const sat = (u, sag, alt = '', vd = null) => `<div class="ay-satir on-ark" data-ara="${esc(araAnahtar(pr(u)))}"><button type="button" class="on-kisi" data-act="on-profil" data-u="${u}"><span class="on-av-yer">${avatar(pr(u).ad, pr(u).foto)}${vd ? `<i class="on-nokta ${vd.tur}" title="${esc(vd.yazi)}"></i>` : ''}</span><span class="ay-ad">${esc(pr(u).ad)}${pr(u).seviye ? ' ' + seviyeRozet(pr(u).seviye, dilIki()) : ''}${alt ? `<small>${alt}</small>` : ''}</span></button><span class="on-tuslar">${sag}</span></div>`;
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
    // Demir 12.11: biri ara verdiyse ya da uzun süredir hamle yoksa "oynanıyor" değil "ara verildi · saat"
    const araZ = Math.max(Number(d.ara && d.ara[ben]) || 0, Number(d.ara && d.ara[k]) || 0);
    const sonZ = d.guncel && d.guncel.toMillis ? d.guncel.toMillis() : 0;
    const araMi = araZ > 0 || (sonZ && Date.now() - sonZ > 15 * 60e3);
    if (araMi) return sat(k, kucuk('on-devam', t('Devam et'), `data-id="${d.id}"`, 'primary'), t('{0} · ara verildi · {1}', esc(oy), saatYazi(araZ || sonZ)));
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

export { bildir }; // şerit bildirimi (başka modüller de kullanabilir)
