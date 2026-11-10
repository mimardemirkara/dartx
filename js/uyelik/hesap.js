// Üyelik işlemleri (Demir 11.11): misafir + üye (Google, Apple, e-posta + şifre, şifresiz e-posta bağlantısı).
// Profil: users/{uid} · arkadaş kodu: kodlar/{kod} · bulut yedeği: users/{uid}/yedek/ana + users/{uid}/maclar/{id}
import { bulut, hazirMi } from './bulut.js';
import { data, save } from '../store.js';
import { t, dil } from '../i18n.js';
import { okOzet } from './okset.js';

const DONUS = 'https://dartx.net/'; // doğrulama / şifresiz giriş bağlantıları buraya döner
// Demir 11.11: doğrulama ve şifre e-postaları DartX tasarımıyla noreply@dartx.net'ten (Cloudflare Worker + Resend).
// Sunucuya ulaşılamazsa Firebase'in kendi e-postasına düşülür.
const EPOSTA_SUNUCU = 'https://dartx-eposta.demirkaramimar.workers.dev';
const emu = () => new URLSearchParams(location.search).has('emu');
async function sunucuyaSor(yol, govde, jeton) {
  if (emu()) throw new Error('emu');
  const kontrol = new AbortController(); const zaman = setTimeout(() => kontrol.abort(), 12000);
  try {
    const r = await fetch(EPOSTA_SUNUCU + yol, { method: 'POST', signal: kontrol.signal,
      headers: { 'Content-Type': 'application/json', ...(jeton ? { Authorization: 'Bearer ' + jeton } : {}) },
      body: JSON.stringify({ ...govde, dil: dil() === 'en' ? 'en' : 'tr' }) });
    if (r.status === 429) { const e = new Error('sik'); e.code = 'auth/too-many-requests'; e.sik = true; throw e; }
    if (!r.ok) { const v = await r.json().catch(() => ({})); const e = new Error('sunucu ' + r.status); if (v.hata) { e.code = 'dx/' + v.hata; e.dx = true; } throw e; }
    return r.json();
  } finally { clearTimeout(zaman); }
}
const durum = { hazir: false, user: null, profil: null };
const dinleyenler = new Set();
const haber = () => dinleyenler.forEach(f => { try { f(durum); } catch (e) { /* yok say */ } });
export const uye = () => durum;
export const dinle = f => { dinleyenler.add(f); return () => dinleyenler.delete(f); };
export const girisli = () => !!durum.user;
export const dogrulandi = () => !!(durum.user && (durum.user.emailVerified || saglayici() !== 'password'));
export const saglayici = () => (durum.user && durum.user.providerData[0] && durum.user.providerData[0].providerId) || (durum.user ? 'password' : null);

// ---- hata metinleri
const HATA = {
  'auth/invalid-email': 'E-posta adresi geçersiz',
  'auth/email-already-in-use': 'Bu e-postayla zaten bir hesap var. Giriş yap ya da şifreni sıfırla.',
  'auth/weak-password': 'Şifre en az 8 karakter olmalı',
  'auth/invalid-credential': 'E-posta ya da şifre hatalı',
  'auth/wrong-password': 'E-posta ya da şifre hatalı',
  'auth/user-not-found': 'E-posta ya da şifre hatalı',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.',
  'auth/network-request-failed': 'İnternet bağlantısı yok',
  'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı',
  'auth/cancelled-popup-request': 'Giriş penceresi kapatıldı',
  'auth/popup-blocked': 'Giriş penceresi açılamadı. Tarayıcının açılır pencere iznini kontrol et.',
  'auth/requires-recent-login': 'Güvenlik için yeniden giriş yapman gerekiyor',
  'auth/operation-not-allowed': 'Bu giriş yöntemi henüz açılmadı',
  'auth/invalid-action-code': 'Bağlantının süresi dolmuş ya da kullanılmış. Yenisini iste.',
  'dx/var': 'Bu e-postayla zaten bir DartX hesabı var',
  'dx/eposta': 'Geçerli ve farklı bir e-posta adresi yaz',
  'dx/yeniden': 'Güvenlik için şifreni yeniden gir',
  'kod-gecersiz': 'Kod DX- ve 4 harf ya da rakam olmalı',
  'kod-alinmis': 'Bu kod başka bir üyede',
  'tel-alinmis': 'Bu telefon numarası başka bir hesapta kayıtlı',
  'dx/kod': 'Kod yanlış. E-postadaki 6 haneli kodu kontrol et.',
  'dx/sure': 'Kodun süresi dolmuş. Yeniden gönder’e dokun.',
  'dx/deneme': 'Çok fazla yanlış deneme. Yeniden gönder’e dokunup yeni kod iste.',
  'ayar-yok': 'Üyelik henüz açılmadı',
  'ad-alinmis': 'Bu ad başka bir üye tarafından alınmış. Başka bir ad seç.',
  'ad-ayrilmis': 'Bu ad ayrılmış. Başka bir ad seç.',
  'ad-gecersiz': 'Bu ad kullanılamaz',
  'permission-denied': 'Bu işlem için yetkin yok. E-postanı doğruladığından emin ol.',
};
export const hataMetni = e => t(HATA[(e && (e.code || e.message)) || ''] || 'Bir sorun oldu. Tekrar dene.');

// ---- başlangıç: oturum varsa (ya da e-posta bağlantısıyla gelindiyse) Firebase yüklenir
let basladi = null;
export function baslat(zorla = false) {
  if (!hazirMi()) return Promise.resolve(null);
  const s = data().settings;
  const baglantiyla = typeof location !== 'undefined' && /[?&](oobCode|apiKey)=/.test(location.search);
  if (!zorla && !s.uyeOturum && !baglantiyla) return Promise.resolve(null);
  if (basladi) return basladi;
  basladi = (async () => {
    const { auth, A } = await bulut();
    A.onAuthStateChanged(auth, async u => {
      durum.user = u; durum.hazir = true;
      data().settings.uyeOturum = !!u; save();
      durum.profil = u ? await profilGetir().catch(() => durum.profil) : null;
      // e-posta değişikliği onaylanıp yeni adresle girildiyse "onay bekliyor" kaydı silinir
      if (u && durum.profil && durum.profil.epostaBekleyen && String(u.email || '').toLowerCase() === durum.profil.epostaBekleyen) profilKaydet({ epostaBekleyen: null }).catch(() => {});
      // tekillik kuralından önce kaydedilmiş numara bir kez bu hesaba ayrılır (Demir 11.11)
      if (u && durum.profil && durum.profil.telefon && !durum.profil.telefonTekil) {
        telefonAyir(durum.profil.telefon, null).then(() => profilKaydet({ telefonTekil: true })).catch(() => {});
      }
      haber();
    });
    if (baglantiyla && A.isSignInWithEmailLink(auth, location.href)) {
      const eposta = localStorage.getItem('dartx.baglantiEposta');
      if (eposta) {
        try { await A.signInWithEmailLink(auth, eposta, location.href); localStorage.removeItem('dartx.baglantiEposta'); } catch (e) { durum.hata = hataMetni(e); }
      }
      history.replaceState(history.state, '', location.pathname); // bağlantı adresi geçmişte kalmasın
    }
    return durum;
  })();
  basladi.catch(() => { basladi = null; });
  return basladi;
}

const fb = async () => { await baslat(true); return bulut(); };
const ayarDil = async () => { const { auth } = await bulut(); auth.languageCode = dil() === 'en' ? 'en' : 'tr'; };

// ---- giriş yolları
export async function googleGiris() {
  const { auth, A } = await fb(); await ayarDil();
  const yerel = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
  if (yerel) {
    // Uygulamada (Android/iOS) Google, web penceresine izin vermez: telefonun kendi Google girişi kullanılır
    const FA = window.Capacitor.registerPlugin('FirebaseAuthentication');
    const r = await FA.signInWithGoogle({ skipNativeAuth: true });
    return A.signInWithCredential(auth, A.GoogleAuthProvider.credential(r.credential.idToken, r.credential.accessToken));
  }
  const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  return A.signInWithPopup(auth, p);
}
export async function appleGiris() {
  const { auth, A } = await fb(); await ayarDil();
  const yerel = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
  if (yerel) {
    const FA = window.Capacitor.registerPlugin('FirebaseAuthentication');
    const r = await FA.signInWithApple({ skipNativeAuth: true });
    const p = new A.OAuthProvider('apple.com');
    return A.signInWithCredential(auth, p.credential({ idToken: r.credential.idToken, rawNonce: r.credential.nonce }));
  }
  const p = new A.OAuthProvider('apple.com'); p.addScope('email'); p.addScope('name');
  return A.signInWithPopup(auth, p);
}
export async function epostaUyeOl(ad, eposta, sifre) {
  const { auth, A } = await fb(); await ayarDil();
  const r = await A.createUserWithEmailAndPassword(auth, eposta.trim(), sifre);
  await A.updateProfile(r.user, { displayName: ad.trim() });
  await dogrulamaYolla(A, r.user, true).catch(() => {});
  return r;
}
export async function epostaGiris(eposta, sifre, hatirla = true) {
  const { auth, A } = await fb();
  // beni hatırla kapalıysa oturum yalnız bu açılışta kalır
  await A.setPersistence(auth, hatirla ? A.indexedDBLocalPersistence : A.browserSessionPersistence).catch(() => {});
  return A.signInWithEmailAndPassword(auth, eposta.trim(), sifre);
}
export async function sifreSifirla(eposta) {
  const { auth, A } = await fb(); await ayarDil();
  try { await sunucuyaSor('/sifre', { eposta: eposta.trim() }); return; } catch (e) { if (e.sik) throw e; }
  return A.sendPasswordResetEmail(auth, eposta.trim(), { url: DONUS });
}
export async function baglantiGonder(eposta) {
  const { auth, A } = await fb(); await ayarDil();
  await A.sendSignInLinkToEmail(auth, eposta.trim(), { url: DONUS, handleCodeInApp: true });
  localStorage.setItem('dartx.baglantiEposta', eposta.trim());
}
async function dogrulamaYolla(A, u, yeniJeton) {
  try { await sunucuyaSor('/dogrula', {}, await u.getIdToken(!!yeniJeton)); return; } catch (e) { if (e.sik) throw e; }
  return A.sendEmailVerification(u, { url: DONUS });
}
// ---- e-posta bağlantıları dartx.net'te açılır (Demir 11.11): ?eylem=verifyEmail|resetPassword|verifyAndChangeEmail&kod=…
/** Doğrulama / e-posta değiştirme bağlantısını uygula */
export async function eylemUygula(kod) {
  const { auth, A } = await bulut();
  await A.applyActionCode(auth, kod);
  if (auth.currentUser) await yenile().catch(() => {});
}
/** Şifre sıfırlama kodu geçerli mi → e-posta adresi */
export async function sifreKodBak(kod) { const { auth, A } = await bulut(); return A.verifyPasswordResetCode(auth, kod); }
export async function sifreYenile(kod, yeni) { const { auth, A } = await bulut(); await A.confirmPasswordReset(auth, kod, yeni); }
/** E-postadaki 6 haneli kodla doğrula (24 saat geçerli; sunucu doğrular) */
export async function kodlaDogrula(kod) {
  await fb(); const u = durum.user; if (!u) return;
  await sunucuyaSor('/kod', { kod }, await u.getIdToken());
  await yenile();
}
export async function dogrulamaGonder() { const { A } = await fb(); return dogrulamaYolla(A, durum.user); }
export async function yenile() { if (!durum.user) return; await durum.user.reload(); durum.user = (await bulut()).auth.currentUser; if (durum.user.emailVerified) await durum.user.getIdToken(true).catch(() => {}); haber(); }
export async function cikis() { const { auth, A } = await fb(); await A.signOut(auth); }
/** E-posta değiştir: şifreyle yeniden doğrula → yeni adrese onay bağlantısı (DartX tasarımı; olmazsa Firebase'in kendi e-postası).
 *  Onaylanınca Firebase adresi değiştirir ve oturumu kapatır; kullanıcı yeni adresle girer. */
export async function epostaDegistir(sifre, yeni) {
  const { A } = await fb(); const u = durum.user;
  await A.reauthenticateWithCredential(u, A.EmailAuthProvider.credential(u.email, sifre));
  try { await sunucuyaSor('/eposta', { yeni: yeni.trim() }, await u.getIdToken(true)); return true; }
  catch (e) { if (e.dx || e.sik) throw e; }
  await A.verifyBeforeUpdateEmail(u, yeni.trim(), { url: DONUS }); return true;
}
export async function sifreDegistir(eski, yeni) {
  const { A } = await fb(); const u = durum.user;
  await A.reauthenticateWithCredential(u, A.EmailAuthProvider.credential(u.email, eski));
  return A.updatePassword(u, yeni);
}

// ---- görünen ad: eşsiz (adlar/{anahtar}); kurucu adları yalnız Demir'e (Demir 11.11). Aynı kural Firestore'da da var.
// Demir 11.11: yalnız adı yazılı adresler kurucu (alan adı kuralı yok: ileride açılan çalışan adresleri kurucu olmasın)
export const KURUCU = ['demirkaramimar@gmail.com', 'info@demirkara.com', 'demirkara@yahoo.com', 'mimardemirkara@gmail.com', 'demirkaradesign@gmail.com', 'demir@demirkara.com'];
const AYRILMIS = /^(demir|demirkara|karademir|mimardemirkara|mimardemir|demirmimar|ironman|iron)[0-9]*$/;
/** "Demir Kara", "demir.kara", "DEMİRKARA" → "demirkara" */
export const adAnahtar = s => String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u').replace(/[^a-z0-9]/g, '');
export const kurucuMu = eposta => { const e = String(eposta || '').trim().toLowerCase(); return KURUCU.includes(e); };
/** 'musait' | 'senin' | 'alinmis' | 'ayrilmis' | 'gecersiz' */
export async function adDurumu(ad, eposta) {
  const k = adAnahtar(ad); if (k.length < 2) return 'gecersiz';
  if (AYRILMIS.test(k) && !kurucuMu(eposta || (durum.user && durum.user.email))) return 'ayrilmis';
  const { db, F } = await bulut();
  const s = await F.getDoc(F.doc(db, 'adlar', k));
  if (!s.exists()) return 'musait';
  return durum.user && s.data().uid === durum.user.uid ? 'senin' : 'alinmis';
}
/** Adı işlem içinde ayırır (eski adı bırakır) */
async function adAyir(yeni, eski) {
  const { db, F } = await bulut(); const u = durum.user;
  const k = adAnahtar(yeni), ek = eski ? adAnahtar(eski) : null;
  if (k.length < 2) throw Object.assign(new Error('ad'), { code: 'ad-gecersiz' });
  if (AYRILMIS.test(k) && !kurucuMu(u.email)) throw Object.assign(new Error('ad'), { code: 'ad-ayrilmis' });
  await F.runTransaction(db, async tx => {
    const ref = F.doc(db, 'adlar', k); const s = await tx.get(ref);
    if (s.exists() && s.data().uid !== u.uid) throw Object.assign(new Error('ad'), { code: 'ad-alinmis' });
    if (!s.exists()) tx.set(ref, { uid: u.uid });
    if (ek && ek !== k) tx.delete(F.doc(db, 'adlar', ek));
  });
  return k;
}

// ---- profil
const KOD_HARF = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // karışan harfler yok (0/O, 1/I)
const SABIT_KOD = { 'demirkaramimar@gmail.com': 'DX-0001' }; // Demir (kurucu) her zaman DX-0001
const kodUret = () => 'DX-' + Array.from({ length: 4 }, () => KOD_HARF[Math.floor(Math.random() * KOD_HARF.length)]).join('');
export async function profilGetir() {
  const { db, F } = await bulut(); const u = durum.user; if (!u) return null;
  const s = await F.getDoc(F.doc(db, 'users', u.uid));
  return s.exists() ? s.data() : null;
}
/** İlk kayıtta profil + benzersiz arkadaş kodu */
export async function profilOlustur({ ad, isim, soyisim, yasOnay, sozlesmeOnay }) {
  const { db, F } = await fb(); const u = durum.user;
  const ref = F.doc(db, 'users', u.uid);
  const var_ = await F.getDoc(ref);
  if (var_.exists()) { durum.profil = var_.data(); haber(); return durum.profil; }
  const temizAd = (ad || u.displayName || '').trim().replace(/\s+/g, ' ').slice(0, 12);
  const adK = await adAyir(temizAd, null); // önce ad: alınmışsa profil hiç açılmaz
  let kod = null;
  // Demir 11.11: kurucunun kodu sabit — hesap yeniden açılsa da hep DX-0001 (kod değiştirme yok)
  const sabit = SABIT_KOD[String(u.email || '').toLowerCase()];
  if (sabit) {
    await F.runTransaction(db, async tx => {
      const kref = F.doc(db, 'kodlar', sabit); const s = await tx.get(kref);
      if (s.exists() && s.data().uid !== u.uid) return; // başka hesapta kalmışsa rastgele koda düş
      tx.set(kref, { uid: u.uid }); kod = sabit;
    }).catch(() => { kod = null; });
  }
  for (let i = 0; i < 8 && !kod; i++) {
    const aday = kodUret();
    try {
      await F.runTransaction(db, async tx => {
        const kref = F.doc(db, 'kodlar', aday);
        if ((await tx.get(kref)).exists()) throw new Error('dolu');
        tx.set(kref, { uid: u.uid });
      });
      kod = aday;
    } catch (e) { if (e.message !== 'dolu') throw e; }
  }
  const profil = { ad: temizAd, adAnahtar: adK, isim: (isim || '').trim().slice(0, 25), soyisim: (soyisim || '').trim().slice(0, 25), kod, foto: null, dil: dil(), yasOnay: !!yasOnay, sozlesmeOnay: !!sozlesmeOnay,
    olusturma: F.serverTimestamp(), el: null, agirlik: null, sevilenOyun: null, ulke: dil() === 'tr' ? 'tr' : null, sehir: null, oyuncuId: null };
  await F.setDoc(ref, profil);
  await genelYaz({ ad: profil.ad, adAnahtar: adK, foto: null, kod });
  // Demir 11.11: tek seferlik hoş geldin e-postası (sunucu ikinci kez göndermez); beklenmez, hata yok sayılır
  u.getIdToken().then(j => sunucuyaSor('/hosgeldin', {}, j)).catch(() => {});
  durum.profil = { ...profil, olusturma: Date.now() }; haber();
  return durum.profil;
}
// Demir 11.11: bir telefon numarası yalnız bir hesapta. telefonlar/{özet} → uid (numara açık yazılmaz, SHA-256 özeti)
async function telOzet(e164) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('dartx-tel:' + e164));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function telefonAyir(yeni, eski) {
  const { db, F } = await bulut(); const u = durum.user;
  const yo = yeni ? await telOzet(yeni) : null, eo = eski ? await telOzet(eski) : null;
  if (yo === eo) return;
  await F.runTransaction(db, async tx => {
    if (yo) {
      const ref = F.doc(db, 'telefonlar', yo); const s = await tx.get(ref);
      if (s.exists() && s.data().uid !== u.uid) throw Object.assign(new Error('tel'), { code: 'tel-alinmis' });
      if (!s.exists()) tx.set(ref, { uid: u.uid });
    }
    if (eo) tx.delete(F.doc(db, 'telefonlar', eo));
  });
}
export async function profilKaydet(alanlar) {
  const { db, F } = await fb();
  if ('telefon' in alanlar) await telefonAyir(alanlar.telefon, durum.profil && durum.profil.telefon);
  if ('ad' in alanlar && adAnahtar(alanlar.ad) !== (durum.profil && durum.profil.adAnahtar)) alanlar = { ...alanlar, adAnahtar: await adAyir(alanlar.ad, durum.profil && durum.profil.ad) };
  await F.setDoc(F.doc(db, 'users', durum.user.uid), alanlar, { merge: true });
  durum.profil = { ...(durum.profil || {}), ...alanlar }; haber();
  if (Object.keys(alanlar).some(k => k.startsWith('ok') || k === 'agirlik')) await genelYaz({ okOzet: okOzet(durum.profil, 'tr') || null, okOzetEn: okOzet(durum.profil, 'en') || null }).catch(() => {});
  if ('seviye' in alanlar || 'lakap' in alanlar) await genelYaz({ seviye: durum.profil.seviye || null, lakap: durum.profil.lakap || null }).catch(() => {});
  if ('ad' in alanlar || 'foto' in alanlar) await genelYaz({ ad: durum.profil.ad, adAnahtar: durum.profil.adAnahtar || null, foto: durum.profil.foto || null, kod: durum.profil.kod || null }).catch(() => {});
  if (alanlar.ad && durum.user.displayName !== alanlar.ad) { const { A } = await bulut(); A.updateProfile(durum.user, { displayName: alanlar.ad }).catch(() => {}); }
}

/** Herkese açık küçük profil (arkadaşlar görür): ad, fotoğraf, arkadaş kodu — e-posta asla */
async function genelYaz(alan) {
  const { db, F } = await bulut();
  await F.setDoc(F.doc(db, 'profiller', durum.user.uid), alan, { merge: true });
}

// ---- bulut yedeği: oyuncular + ayarlar tek belge, her maç ayrı belge (belge sınırı 1 MB)
export async function yedekGonder() {
  const { db, F } = await fb(); const u = durum.user; if (!u) return 0;
  const d = data();
  const ana = { players: d.players, silinen: d.silinen || [], settings: { ...d.settings, uyeOturum: undefined }, guncel: F.serverTimestamp() };
  delete ana.settings.uyeOturum;
  await F.setDoc(F.doc(db, 'users', u.uid, 'yedek', 'ana'), JSON.parse(JSON.stringify(ana)));
  const gonderilen = new Set(d.bulutMaclar || []);
  const yeni = (d.history || []).filter(h => h && h.id && !gonderilen.has(h.id));
  for (let i = 0; i < yeni.length; i += 400) {
    const b = F.writeBatch(db);
    yeni.slice(i, i + 400).forEach(h => b.set(F.doc(db, 'users', u.uid, 'maclar', String(h.id)), JSON.parse(JSON.stringify(h))));
    await b.commit();
  }
  d.bulutMaclar = [...gonderilen, ...yeni.map(h => h.id)]; d.bulutZaman = Date.now(); save();
  return yeni.length;
}
/** Buluttaki yedek: { ana, maclar } (yoksa null) */
export async function yedekGetir() {
  const { db, F } = await fb(); const u = durum.user;
  const a = await F.getDoc(F.doc(db, 'users', u.uid, 'yedek', 'ana'));
  if (!a.exists()) return null;
  const m = await F.getDocs(F.collection(db, 'users', u.uid, 'maclar'));
  return { ana: a.data(), maclar: m.docs.map(x => x.data()) };
}
/** Hesap verilerini indir (KVKK): profil + bulut yedeği tek JSON */
export async function verilerimiIndir() {
  const y = await yedekGetir().catch(() => null);
  const icerik = { hesap: { eposta: durum.user.email, uid: durum.user.uid }, profil: durum.profil, yedek: y };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(icerik, null, 2)], { type: 'application/json' }));
  a.download = 'dartx-hesap-verilerim.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
/** Hesabı ve buluttaki her şeyi kalıcı olarak siler (telefondaki misafir verileri kalır) */
export async function hesapSil() {
  const { db, F, A } = await fb(); const u = durum.user;
  // Firebase silmek için yakın zamanda giriş ister: veriler silinmeden önce bakılır (yarım silme olmasın)
  if (Date.now() - Date.parse(u.metadata.lastSignInTime || 0) > 4 * 60e3) { const e = new Error('tekrar'); e.code = 'auth/requires-recent-login'; throw e; }
  const maclar = await F.getDocs(F.collection(db, 'users', u.uid, 'maclar'));
  for (let i = 0; i < maclar.docs.length; i += 400) { const b = F.writeBatch(db); maclar.docs.slice(i, i + 400).forEach(x => b.delete(x.ref)); await b.commit(); }
  await F.deleteDoc(F.doc(db, 'users', u.uid, 'yedek', 'ana')).catch(() => {});
  if (durum.profil && durum.profil.kod) await F.deleteDoc(F.doc(db, 'kodlar', durum.profil.kod)).catch(() => {});
  if (durum.profil && durum.profil.telefon) await F.deleteDoc(F.doc(db, 'telefonlar', await telOzet(durum.profil.telefon))).catch(() => {});
  // arkadaşlıklar ve online maçlar da gider
  for (const kol of ['arkadaslik', 'online']) {
    const q = await F.getDocs(F.query(F.collection(db, kol), F.where('uids', 'array-contains', u.uid))).catch(() => null);
    if (q) for (const x of q.docs) await F.deleteDoc(x.ref).catch(() => {});
  }
  await F.deleteDoc(F.doc(db, 'profiller', u.uid)).catch(() => {});
  if (durum.profil && durum.profil.adAnahtar) await F.deleteDoc(F.doc(db, 'adlar', durum.profil.adAnahtar)).catch(() => {});
  await F.deleteDoc(F.doc(db, 'users', u.uid));
  await A.deleteUser(u);
  const d = data(); delete d.bulutMaclar; delete d.bulutZaman; save();
}
