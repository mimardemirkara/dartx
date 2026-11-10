// Firebase bağlantısı (Demir 11.11: üyelik). Kütüphaneler js/firebase/ altında gömülü; yalnız üyelik
// ekranı açılınca ya da oturum varsa yüklenir (misafir kullanıcı hiç indirmez).
// FIREBASE_AYAR: Firebase Console → Proje ayarları → Web uygulaması. Proje açılınca doldurulur.
// (Bu bilgiler gizli değildir; güvenlik Firestore kurallarıyla sağlanır — firebase/firestore.rules)
export const FIREBASE_AYAR = {
  apiKey: 'AIzaSyAxMa6c5OHMFjwudcHD2EF_9tLYmwvmZpw',
  authDomain: 'dartx-1b030.firebaseapp.com',
  projectId: 'dartx-1b030',
  storageBucket: 'dartx-1b030.firebasestorage.app',
  messagingSenderId: '692421669754',
  appId: '1:692421669754:web:50bd47b5fce4b39b595cc3',
};

// Deneme: ?emu=1 → bilgisayarda çalışan Firebase emülatörü (proje gerekmez, "demo-dartx")
const EMU = typeof location !== 'undefined' && /[?&]emu=1\b/.test(location.search);
const AYAR = EMU ? { apiKey: 'demo-key', authDomain: 'demo-dartx.firebaseapp.com', projectId: 'demo-dartx', appId: 'demo' } : FIREBASE_AYAR;

/** Üyelik kullanılabilir mi (ayar girilmiş ya da emülatör) */
export const hazirMi = () => !!AYAR;

let yukleme = null;
/** { app, auth, db, A (auth fonksiyonları), F (firestore fonksiyonları) } */
export function bulut() {
  if (!AYAR) return Promise.reject(new Error('ayar-yok'));
  if (yukleme) return yukleme;
  yukleme = (async () => {
    const [{ initializeApp }, A, F] = await Promise.all([
      import('../firebase/firebase-app.js'), import('../firebase/firebase-auth.js'), import('../firebase/firebase-firestore.js'),
    ]);
    const app = initializeApp(AYAR);
    const auth = A.initializeAuth(app, { persistence: [A.indexedDBLocalPersistence, A.browserLocalPersistence], popupRedirectResolver: A.browserPopupRedirectResolver });
    // internetsiz de çalışsın: veriler telefonda saklanır, internet gelince eşitlenir
    const db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
    if (EMU) {
      A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      F.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    return { app, auth, db, A, F };
  })();
  yukleme.catch(() => { yukleme = null; });
  return yukleme;
}
