// DartX — dil (Türkçe asıl, İngilizce çeviri). t('Türkçe metin {0}', değer)
import { data, save } from './store.js';

export const DILLER = [
  { kod: 'tr', ad: 'Türkçe', bayrak: 'tr', yerel: 'tr-TR' },
  { kod: 'en', ad: 'English', bayrak: 'gb', yerel: 'en-GB' },
];

export function dil() {
  const s = data().settings;
  if (!s.lang) s.lang = (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  return s.lang;
}
export function dilKoy(kod) { data().settings.lang = kod; save(); document.documentElement.lang = kod; }
export const yerel = () => (DILLER.find(d => d.kod === dil()) || DILLER[0]).yerel;

export function t(s, ...a) {
  let r = dil() === 'en' && EN[s] !== undefined ? EN[s] : s;
  return a.length ? r.replace(/\{(\d)\}/g, (_, i) => a[i]) : r;
}
/** Oyun nesnesindeki çevrilmiş alan: g.nameEn / g.shortEn / g.rulesEn */
export const gt = (g, k) => (dil() === 'en' && g[k + 'En'] ? g[k + 'En'] : g[k]);

const EN = {
  // genel / gezinme
  'Oyunlar': 'Games', 'Oyuncular': 'Players', 'İstatistik': 'Stats', 'Ayarlar': 'Settings', 'Kurulum': 'Setup', 'Sonuç': 'Result',
  'Ana sayfa': 'Home', 'Tema': 'Theme', 'Koyu': 'Dark', 'Açık': 'Light', 'Sistem': 'System', 'Otomatik': 'Auto', 'Dil': 'Language',
  'Tema: {0}': 'Theme: {0}', 'Ara': 'Search', 'Sonuç yok': 'No results', '{0} oyun': '{0} games', 'Görünüm': 'Appearance', 'Oyun': 'Game', 'Kayıtlı': 'Saved',
  // online · yakında
  'Online': 'Online', 'Yakında': 'Soon', 'Neler geliyor': 'What\'s coming', 'Şimdilik': 'For now',
  'Dart tutkunlarını bir araya getiren online DartX çok yakında. Üye ol, ligde yarış, turnuvalara kayıt yaptır, sıralamada yerini al.':
    'Online DartX, bringing darts lovers together, is coming soon. Sign up, compete in leagues, register for tournaments and take your place in the rankings.',
  'Üyelik': 'Membership', 'Kendi DartX hesabın; istatistiklerin her cihazda seninle.': 'Your own DartX account; your stats with you on every device.',
  'Ligler': 'Leagues', 'Sezonluk ligler, fikstür, puan tablosu ve şampiyonluk.': 'Seasonal leagues, fixtures, standings and a champion.',
  'Turnuva kaydı': 'Tournament sign-up', 'Turnuvaları gör, telefondan tek dokunuşla kayıt ol.': 'See tournaments and sign up from your phone with a single tap.',
  'Duyurular': 'Announcements', 'Turnuva tarihleri, kulüp akşamları ve haberler.': 'Tournament dates, club nights and news.',
  'Sıralamalar': 'Rankings', 'Ortalama, checkout ve 180\'lerle genel sıralama.': 'Overall rankings by average, checkout and 180s.',
  'Sponsorlar': 'Sponsors', 'Dart kulüpleri ve ekipman markalarıyla iş birlikleri.': 'Partnerships with darts clubs and equipment brands.',
  'DartX şu an internetsiz çalışır; oyuncuların, maçların ve istatistiklerin yalnız bu cihazda kalır. Online özellikler geldiğinde uygulama kendiliğinden güncellenir, yeniden kurman gerekmez.':
    'DartX currently works offline; your players, matches and stats stay on this device only. When the online features arrive, the app updates itself and you won\'t need to reinstall it.',
  // hakkında
  'Hakkında': 'About', 'Bilgi': 'Info', 'Geliştirici': 'Developer', 'Sürüm': 'Version', 'Fiyat': 'Price', 'Ücretsiz': 'Free', 'Telif': 'Copyright',
  'Demir Kara tarafından tasarlandı ve yazıldı': 'Designed and written by Demir Kara',
  'Dart, yıllardır benim en büyük merakım ve hobim. Tahtanın başında geçen saatler, her atışta biraz daha iyi olma isteği ve bu oyuna duyduğum sevgi beni iyi bir dart oyuncusu yaptı.':
    'Darts has been my greatest passion and hobby for years. Hours at the board, the urge to get a little better with every throw and my love for the game made me a good darts player.',
  'DartX\'i bu tutkuyla yazdım: skor tutmayı kolaylaştırmak, antrenmanları takip etmek ve arkadaşlarla oynanan maçları daha keyifli hale getirmek için.':
    'I wrote DartX out of that passion: to make scoring easy, to track practice and to make games with friends even more fun.',
  'DartX, dartı seven herkes için tamamen ücretsizdir. İyi oyunlar, bol 180\'ler!': 'DartX is completely free for everyone who loves darts. Good games and plenty of 180s!',
  'Bilgisayara olan merakım beni yıllar önce ilk işime taşımıştı; dart ise yıllardır en sevdiğim hobim. Tahtanın başında geçen akşamlar, dostlarla atılan oklar, her atışta biraz daha iyi olma isteği… Bugün kendimi iyi bir dart oyuncusu olarak görüyorsam, bunda bu sevginin payı büyük.':
    'My curiosity about computers led me into my first business years ago; darts has long been my favourite hobby. Evenings at the board, darts thrown with friends, the urge to get a little better with every throw… If I can call myself a good darts player today, that love has a lot to do with it.',
  'Bir gün bu iki merakımı birleştirip DartX\'i yazdım. Skor için kâğıt kalem aramayın, antrenmanlarınızı kaydedin, maçlarınızı dostlarınızla daha keyifli oynayın diye.':
    'One day I brought these two passions together and wrote DartX, so you never have to hunt for pen and paper to keep score, can record your practice and enjoy your games with friends even more.',
  'DartX\'i bu oyunu sevenler için ücretsiz yaptım. Attığım her okun, yazdığım her satırın arkasındayım. İyi oyunlar, bol 180\'ler!':
    'I made DartX free for everyone who loves this game. I stand behind every dart I throw and every line I write. Good games and plenty of 180s!',
  'Tüm hakları saklıdır.': 'All rights reserved.', 'DartX\'in geliştiricisi': 'Developer of DartX',
  'Mimar · DartX\'in geliştiricisi': 'Architect · Developer of DartX', 'Telif Hakları': 'Copyright',
  'Asıl mesleğim mimarlık; günlerim çizim masasında ve şantiyede geçiyor. Bilgisayara olan merakım ise beni yıllar önce ilk işime taşımıştı; dart da yıllardır en sevdiğim hobim. Tahtanın başında geçen akşamlar, dostlarla atılan oklar, her atışta biraz daha iyi olma isteği… Bugün kendimi iyi bir dart oyuncusu olarak görüyorsam, bunda bu sevginin payı büyük.':
    'Architecture is my profession; my days are spent at the drawing table and on site. My curiosity about computers led me into my first business years ago, and darts has long been my favourite hobby. Evenings at the board, darts thrown with friends, the urge to get a little better with every throw… If I can call myself a good darts player today, that love has a lot to do with it.',
  'Bir gün bu merakları birleştirip DartX\'i yazdım. Skor için kâğıt kalem aramayın, antrenmanlarınızı kaydedin, maçlarınızı dostlarınızla daha keyifli oynayın diye.':
    'One day I brought these passions together and wrote DartX, so you never have to hunt for pen and paper to keep score, can record your practice and enjoy your games with friends even more.',
  'DartX\'i bu oyunu sevenler için ücretsiz yaptım. Çizdiğim her çizginin, attığım her okun, yazdığım her satırın arkasındayım. İyi oyunlar, bol 180\'ler!':
    'I made DartX free for everyone who loves this game. I stand behind every line I draw, every dart I throw and every line of code I write. Good games and plenty of 180s!',
  'DartX adı, logosu, tasarımı ve yazılımı Demir Kara\'ya aittir. Uygulama kişisel kullanım için ücretsizdir; izinsiz kopyalanması, değiştirilerek dağıtılması veya satılması yasaktır.':
    'The DartX name, logo, design and software belong to Demir Kara. The app is free for personal use; copying, modifying for redistribution or selling it without permission is prohibited.',
  // ana ekran
  'Ana Maçlar': 'Main Games', 'Grup Oyunları': 'Party Games', 'Antrenman': 'Practice',
  'Devam eden maç': 'Match in progress', 'Devam et →': 'Continue →', 'Hazır mısın?': 'Ready to throw?',
  '{0} oyuncu · {1} maç': '{0} players · {1} matches', ' · son: {0}': ' · last: {0}', 'Hızlı 501 →': 'Quick 501 →', 'yakında': 'soon',
  'Saat Turu': 'Clock', 'Saat Solo': 'Clock Solo', 'Checkout': 'Checkout', 'Bitiriş': 'Finish', 'D/T Avı': 'D/T Hunt',
  // kurulum
  'Leg (ilk kazanan)': 'Legs (first to)', 'Set (ilk kazanan)': 'Sets (first to)', 'Yok': 'None', 'Skor girişi': 'Score input',
  'Ok ok': 'Per dart', 'Tur toplamı': 'Turn total', 'Takım A': 'Team A', 'Takım B': 'Team B', 'Kurallar': 'Rules',
  'sıraya göre dokun': 'tap in throwing order', 'Yeni oyuncu adı': 'New player name', 'Ekle': 'Add', 'Sırayı karıştır': 'Shuffle order',
  'Mod': 'Mode', 'Tekli': 'Singles', 'Takım (2 takım)': 'Teams (2 teams)', 'Takım için en az 4 oyuncu seç': 'Pick at least 4 players for teams',
  'Başla': 'Start', 'En az {0} oyuncu seç': 'Pick at least {0} players', 'En az 1 oyuncu seç': 'Pick at least 1 player',
  // oyun ekranı
  'Tur {0}': 'Round {0}', 'Iska': 'Miss', 'Sonraki ›': 'Next ›', 'Sıradaki Oyuncu ›': 'Next Player ›', 'GİR': 'ENTER',
  '{0} set\'i aldı!': '{0} wins the set!', '{0} leg\'i aldı!': '{0} wins the leg!',
  // maç sonu
  'Antrenman tamam!': 'Practice complete!', 'Oyun bitti!': 'Game over!', 'Berabere!': 'Draw!', '{0} kazandı!': '{0} wins!',
  '{0} dk': '{0} min', 'Rövanş': 'Rematch', '↶ Son oku geri al': '↶ Undo last dart',
  // oyuncular
  'Düzenle': 'Edit', 'Henüz oyuncu yok. Aşağıdan ekle.': 'No players yet. Add one below.',
  // istatistik
  'Önce oyuncu ekle.': 'Add a player first.', 'Maç': 'Matches', 'Galibiyet': 'Wins', 'Kazanma': 'Win rate',
  '3 ok ort.': '3-dart avg', 'İlk 9 ort.': 'First 9 avg', 'Checkout ({0}/{1})': 'Checkout ({0}/{1})',
  'En yüksek bitiriş': 'Highest checkout', 'En kısa leg (ok)': 'Best leg (darts)', 'En yüksek tur': 'Highest turn',
  'En iyi tur (işaret)': 'Best turn (marks)', 'Ok': 'Darts', 'Rekorlar': 'Records', '{0} kez': '{0}×', 'Son maçlar': 'Recent matches',
  'Henüz maç yok.': 'No matches yet.', 'G': 'W', 'M': 'L', 'ok': 'darts', 'vs': 'vs',
  // ayarlar
  'Titreşim': 'Vibration', 'Tuş sesi': 'Key sounds', 'Oyun sesleri': 'Game sounds', 'Oyunda ekran açık kalsın': 'Keep screen on during play', 'Yedek': 'Backup',
  'Tüm veriler yalnız bu cihazda tutulur. Telefon değiştirirken ya da tablete aktarırken yedek dosyası kullan.':
    'All data stays on this device only. Use a backup file when switching phones or moving to a tablet.',
  'Yedek al': 'Export backup', 'Yedeği yükle': 'Import backup', 'Veri': 'Data', '{0} oyuncu · {1} maç kayıtlı': '{0} players · {1} matches saved',
  'Tüm verileri sil': 'Delete all data',
  // pencereler
  'Tamam': 'OK', 'Menü': 'Menu', 'Ana sayfa (maç kayıtlı kalır)': 'Home (match is saved)', 'Maçı iptal et': 'Abandon match',
  'Maç açılamadı': "Couldn't open the match",
  'Bu maç eski bir sürümde kaydedilmiş ve açılamıyor. Maçı bitirip geçmişe kaydedelim mi?': 'This match was saved by an older version and cannot be opened. End it and save it to history?',
  'Maçı bitir': 'End match',
  'sürükleyerek sırala': 'drag to reorder', 'Sürükle': 'Drag', 'Sıradan çıkar': 'Remove from order', 'Eklemek için dokun': 'Tap to add',
  'Aşağıdan oyuncu seç — oynama sırası buraya gelir': 'Pick players below — the playing order appears here',
  'Geri al': 'Undo',
  'Son oku geri al': 'Undo last dart',
  'Boş': "Empty",
  'Takımını değiştirmek için oyuncunun kalkanına dokun': "Tap a player's shield to switch team",
  'Sayılar': "Numbers",
  'House!': "House!", 'Tek okta kapattı!': 'Closed in one dart!', 'Sırada': 'Up', "Bağlanıyor…": "Connecting…", "Telefon ekranındaki kodu bu cihazın kamerasına göster.": "Hold the code on the phone screen up to this device's camera.", "Telefonun kodunu okut": "Scan the phone's code", "Telefon kodu gösteriyor ›": "Phone is showing a code ›", "Telefonda DartX → Ayarlar → Kamera → <b>Bu cihaz kamera</b>, sonra <b>Tablete bağlan</b>; bu kodu telefonla okut.": "On the phone: DartX → Settings → Camera → <b>This device is the camera</b>, then <b>Connect to tablet</b>; scan this code with the phone.", "İki cihaz aynı Wi-Fi’ye (ya da telefonun hotspot’una) bağlı olsun. İnternet gerekmez.": "Both devices on the same Wi-Fi (or the phone's hotspot). No internet needed.", "Bağlantı kurulamadı": "Connection failed", "Telefonun kamerası atışları bu cihaza yazacak. Yanlış gelen atışı Geri Al ile düzeltebilirsin.": "The phone camera will score throws on this device. Fix a wrong one with Undo.", "Telefon bağlandı": "Phone connected", "Hazırlanıyor…": "Preparing…", "Kamera atışı yazılamadı: önce açık pencereyi kapat": "Camera throw not entered: close the open window first", "izin verilmedi": "permission denied", "Kamera açılamadı": "Camera could not start", "Kamera açık: atışlar kendiliğinden yazılır": "Camera on: throws are scored automatically", "Kamera kapandı": "Camera off", "Kamera: telefon bağlı": "Camera: phone connected", "Kamera saplanan oku tanır, puanı kendiliğinden yazar. Yanlış yazarsa Atışı Geri Al ile düzelt. Deneme aşamasında: ışık ve açı isabeti etkiler.": "The camera spots each dart and scores it automatically. If it is wrong, fix it with Undo. In testing: light and angle affect accuracy.", "QR ile eşleştir · aynı Wi-Fi, internet gerekmez": "Pair by QR · same Wi-Fi, no internet needed", "Telefon bağlı": "Phone connected", "Kamerayı telefondan al": "Use a phone as camera", "Tahtayı ayarla, dene, tablete bağlan": "Calibrate the board, test, connect to tablet", "Bu cihaz kamera": "This device is the camera", "Kamera": "Camera", "Konuşma": "Speech", "Koç · + tavsiye": "Coach · + tips", "Standart · + toplam, kalan": "Standard · + totals", "Sade · yalnız atışlar": "Simple · throws only", "Konuşma: Koç": "Speech: Coach", "Konuşma: Normal": "Speech: Normal", "Konuşma: Kısa": "Speech: Short", "Başlamak için dokun": "Tap to start", "Sessize al": "Mute all", "Oyun efektleri": "Game effects", "Sesli okuma": "Voice caller", "Bütün sesler": "All sounds", "Sesler": "Sounds", "Kapalı": "Off", "Sesli okuma açık": "Voice caller on", "Sesli Okuma": "Voice Caller", "Sesli okuma (atışlar ve bitiriş)": "Voice caller (throws and checkouts)", "İpucu: Atışı Geri Al'a basılı tutarsan son 10 atıştan istediğine dönebilirsin": "Tip: hold Undo to go back to any of the last 10 throws", "Basılı tut: liste": "Hold: list", "{0} ok · koyu kırmızı = en çok isabet": "{0} darts · deep red = most hits", "Isı haritası": "Heat map", "{0} eklendi": "{0} added", "Usta": "Master", "Zor": "Hard", "Orta": "Medium", "Kolay": "Easy", "~{0} ort.": "~{0} avg.", "Bilgisayara karşı oyna — seviye seç": "Play against the computer — pick a level", "Bu maç güncellemeden önce başladı; atış listesi yeni maçlarda çalışır. Bu maçta düğmeye kısa basarak tek tek geri alabilirsin.": "This match started before the update; the throw list works in new matches. Here, tap the button to undo one throw at a time.", "{0} kapalı kalır · bu ok boşa": "{0} stays closed · this dart is wasted", "Bu ok boşa · etkisi yok": "Wasted dart · no effect", "{0} geri açılır ({1}/3)": "{0} reopens ({1}/3)", "Geri alınacak atış yok": "Nothing to undo", "Tur toplamı {0}": "Turn total {0}", "Bir atışa dokun: o atış ve sonrakiler silinir. Maçın başına kadar geri alınabilir.": "Tap a throw: it and everything after it is removed. You can go back to the start of the match.", "Nereye kadar geri alınsın?": "Undo back to where?", "{0} atış geri alındı": "{0} throws undone", "Kapalı · etkisi yok": "Closed · no effect", "Şirket": "Company", "Derleme": "Build", "DartX adı, logosu, tasarımı ve yazılımı ABD'deki şirketim DK Design Consulting Technology LLC'ye (Albuquerque, New Mexico) aittir; geliştirici Demir Kara'dır. Uygulama kişisel kullanım için ücretsizdir; izinsiz kopyalanması, değiştirilerek dağıtılması veya satılması yasaktır.": "The DartX name, logo, design and software belong to my US company DK Design Consulting Technology LLC (Albuquerque, New Mexico); developed by Demir Kara. The app is free for personal use; copying, modified redistribution or sale without permission is prohibited.", "Son oynanan": "Last played", "Yarım Maçlar": "Unfinished Matches", "Atışı Geri Al": "Undo Throw", "Devam": "Resume", "Ara verilen maçlar": "Paused matches", "{0} maçı kaydedilmeden silinir.": "The {0} match will be deleted without saving.", "Yarım maç silinsin mi?": "Delete paused match?", "En fazla {0} yarım maç saklanır. Yeni maç başlarsa en eskisi ({1}) silinir.": "Up to {0} unfinished matches are kept. Starting a new one deletes the oldest ({1}).", "Yarım maç silinecek": "Paused match will be deleted", "Hepsini kapattın ama puan eşit — öne geçmelisin!": "All closed but level — you must get ahead!", "Sıradaki Oyuncu": "Next Player", "Artır": "Increase", "Azalt": "Decrease", "Rakip {0} kapattı, sana ceza yazabilir: önce {0} kapat": "Opponent closed {0} and can penalise you: close {0} first", "{0} sende kapalı: vurdukça kapatmayan rakiplere ceza yazılır": "{0} is closed for you: each hit penalises opponents still open", "Öne geçmek için {0} puan lazım: T{1} ile {2} yazarsın": "You need {0} to lead: T{1} scores {2}", "Öne geçmek için {0} puan lazım: {1} vur": "You need {0} to lead: hit {1}", "Rakip {0} kapattı, puan toplayabilir: önce {0} kapat": "Opponent closed {0} and can score: close {0} first", "{0} sende kapalı, rakipte açık: vurdukça rakibe ceza yazarsın": "{0} closed for you, open for opponent: each hit penalises them", "{0} sende kapalı, rakipte açık: vurdukça puan yazarsın": "{0} closed for you, open for opponent: each hit scores", "Rakip {0} kapattı: önce {0} kapat": "Opponent closed {0}: close {0} first", "{0} kapanmaya 1 işaret kaldı": "{0} needs 1 more mark", "{0} kapanmaya {1} işaret kaldı": "{0} needs {1} more marks", "Kimse {0} açmadı: T{0} ile tek okta kapatırsın": "Nobody has opened {0}: T{0} closes it in one dart", "{0} tek okta kapanır ⊙": "{0} closed in one dart ⊙", "Oyuna Dön": "Back to Game", "Maça Ara Ver": "Pause Match", "Maç Kayıtlı Kalır": "Match Is Saved", "Maçı İptal Et": "Cancel Match", "Ceza": "Penalty", "Hepsini kapattın ama {0} puan geridesin!": "All closed but {0} points behind!", "Puan için vur: {0}": "Score on: {0}", "Vur": "Hit", "{0} olur: {1}/3": "{0} becomes {1}/3", "{0} işaret": "{0} marks", "önceki oklar silinir": "earlier darts are undone", "rakibe {0} ceza": "{0} penalty to opponents", "+{0} puan": "+{0} points", "{0} kapanır": "{0} closes", 'Kimin Başlayacağını Sen Seç': 'You Choose Who Starts', 'Oyunculardan birine dokun': 'Tap one of the players', 'Kim başlasın?': 'Who starts?', 'Rastgele': 'Random', 'DartX karar versin': 'Let DartX decide', "Öndesin · fark {0}": "You lead · gap {0}", "{0} puan fazlan var · rakiplerinin kapatmadığı hedefleri kapat": "{0} points too many · close targets your rivals keep open", "Öndesin · +{0} puan": "You lead · +{0}", "hepsini kapatırsan kazanırsın": "close everything to win", "puan için vur: {0}": "score on: {0}", "Puan eşit": "Level on points", "Hepsini kapattın ama {0} puan geridesin": "All closed but {0} behind", "{0} puan geridesin": "{0} points behind", "Kazanmak için: bütün hedefleri kapat ve en düşük puanda ol. Kapattığın hedefe vurdukça puan, kapatmamış rakiplerine yazılır.": "To win: close every target with the lowest score. Hitting a target you closed gives points to rivals who haven't.", "Kazanmak için: bütün hedefleri kapat ve puanda önde ol. Rakibinin kapatmadığı hedefe vurdukça puan senin hanene yazılır; geride kalırsan hepsini kapatsan da oyun bitmez.": "To win: close every target and lead on points. Hitting a target your rival hasn't closed scores for you; if you're behind, the game goes on even when you've closed everything.", 'Klasik giriş': 'Classic input', 'Hızlı giriş': 'Quick input', 'Klasik giriş (Double/Triple tuşu)': 'Classic input (Double/Triple key)', 'Hızlı giriş (her sayıda D ve T)': 'Quick input (D and T on every number)', 'Klasik': 'Classic', 'Hızlı': 'Quick', 'Oyunu bitir': 'End match', 'Ana sayfa': 'Home', 'maç kayıtlı kalır': 'match stays saved', "İlk kim atacak?": "Who throws first?", "Bull'a At": "Bull-off", "Herkes bir ok atar, en yakın başlar": "One dart each, closest starts", "Yazı Tura": "Coin toss", "Kura çekilir": "Random draw", "Para atılır": "Flip a coin", "Atla, {0} başlasın": "Skip, {0} starts", "Bull'a en yakın kim?": "Who was closest to the Bull?", "Sonraki leg'leri sırayla diğerleri açar.": "Later legs are opened in turn by the others.", "Kura çekiliyor": "Drawing…", 'House · 1 işaret': 'House · 1 mark', 'Son Atışı Geri Al': 'Undo Last Dart', 'İlk atış': 'First throw', 'throws first': 'throws first', 'Başlamak için ekrana dokun': 'Tap the screen to start', 'Kim başlıyor?': 'Who throws first?', "Başlama atışı: herkes Bull'a birer ok atar, Bull'a en yakın olan başlar. Sonraki leg'leri sırayla diğerleri açar.": 'Bull-off: everyone throws one dart at the Bull; closest to the Bull starts. Later legs are opened in turn by the others.', 'Rastgele seç': 'Pick at random', 'Hangi double?': 'Which double?', 'Hangi triple?': 'Which treble?', 'House: hangi sayıya üç ok?': 'House: three darts in which number?', '3 in a bed: hangi sayıya üç ok?': '3 in a bed: which number?', 'House için elin ilk okundan başla': 'Start House from the first dart of the turn', 'Sıralamak için aramayı temizle': 'Clear the search to reorder', "DartX'in yaratıcısı": 'Creator of DartX', 'Siyah okların ustası': 'Master of the black darts', 'Bu gösterimin anlatımı, çizimleri ve animasyonları Demir Kara tarafından hazırlanmıştır. Tüm hakları Demir Kara\'ya aittir; izinsiz kopyalanamaz, çoğaltılamaz ve kullanılamaz.': 'The narration, illustrations and animations of this demo were created by Demir Kara. All rights reserved by Demir Kara; they may not be copied, reproduced or used without permission.', 'Sesli anlatım': 'Voice narration', 'Geçmişten bugüne': 'From then to now', 'Dartın Tarihi': 'History of Darts', 'Ortaçağ\'daki kütükten Alexandra Palace\'a': 'From a medieval log to Alexandra Palace', 'Nasıl Oynanır': 'How to Play', 'İzle': 'Watch', 'Nasıl oynanır · izle': 'How to play · watch', 'Kuralların tamamı': 'Full rules', 'Oynat': 'Play', 'Geri': 'Back', 'İleri': 'Next', 'Her oyunun kısa bir gösterimi: oklar tahtaya uçar, skor tablosu canlı değişir, altta ne olduğu yazar. Dokunarak durdurabilir, ileri geri gidebilirsin.': 'A short demo of each game: darts fly to the board, the scoreboard updates live and a line below explains what happened. Pause or step back and forth any time.', '{0} set alan kazanır': 'First to {0} sets', '{0} leg alan kazanır': 'First to {0} legs', 'Set {0} başlasın ›': 'Start set {0} ›', 'Leg {0} başlasın ›': 'Start leg {0} ›', 'Sıradaki eli {0} başlatır': '{0} throws first next', 'Tablodan yaz': 'Tap the board', 'Tuşlarla yaz': 'Use keypad', 'Takım {0}\'de oyuncu yok': 'Team {0} has no players', 'Takımlar eşit değil': 'Teams are uneven', 'Takım A {0} kişi, Takım B {1} kişi. Az kişili takımın oyuncuları daha sık atar. Başlayalım mı?': 'Team A has {0} players, Team B has {1}. Players on the smaller team throw more often. Start anyway?', 'Tek okta kapandı': 'Closed in one dart',
  '{0} · {1} işaret': "{0} · {1} marks",
  'Double · 1 işaret': "Double · 1 mark",
  'Triple · 1 işaret': "Treble · 1 mark",
  'H · 1 işaret': "H · 1 mark",
  '{0} nereye yazılsın?': "Where should {0} go?",
  'Kriket': "Cricket",
  'Türk Kriketi': "Turkish",
  'Minnesota': "Minnesota",
  '3 in a bed!': "3 in a bed!",
  'Yedekleniyor': "Backing up",
  'Yedek hazır': "Backup ready",
  'İndir': "Download",
  'Kapat': "Close",
  'Yedek yükleniyor': "Restoring backup",
  'Yüklenemedi': "Could not restore",
  'Açılış efekti': "Intro animation",
  'Kaydır ya da dokun': "Swipe or tap",
  '{0} oyuncu': "{0} players",
  'Sırada': "Up",
  'Önde': "Leading",
  'Bu oyun en fazla {0} oyuncuyla oynanır': "This game is for up to {0} players",
  'Tekli en fazla {0} oyuncu — {1} kişi için Takım seç': "Up to {0} players solo — choose Teams for {1}",
  'Tam {0} oyuncuyla oynanır.': "Played with exactly {0} players.",
  'Tek kişilik antrenman.': "Single-player practice.",
  '{0}–{1} oyuncu.': "{0}–{1} players.",
  'Tekli {0}–{1} oyuncu; takım hâlinde en fazla {2} oyuncu (2 takım).': "Solo {0}–{1} players; in teams up to {2} players (2 teams).",
  '4 ve üstü oyuncuda 2 takım hâlinde de oynanabilir.': "With 4 or more players it can also be played as 2 teams.",
  'Oyuncu': "Players",
  'Oyuncu seç': "Choose players",
  '{0} / {1}': "{0} / {1}",
  'Dış Bull': "Outer bull",
  'Ara…': "Search…",
  'Bütün oyuncular seçildi': "All players are in",
  'Oyuncu ara': "Search players",
  'Oyuna dön': 'Back to game', 'Kaç okla bitirdin?': 'How many darts to finish?', 'Vazgeç': 'Cancel', 'Oyuncuyu düzenle': 'Edit player',
  'Kaydet': 'Save', 'Oyuncuyu sil': 'Delete player',
  'Maç iptal edilsin mi? Bu maç kaydedilmez.': 'Abandon this match? It will not be saved.',
  'Oyuncu silinsin mi? Geçmiş maçlarda "Silinmiş" olarak görünür.': 'Delete this player? Past matches will show "Deleted".',
  'TÜM oyuncular ve maçlar silinecek. Emin misin?': 'ALL players and matches will be deleted. Are you sure?',
  'Geri alınamaz. Son kez: silinsin mi?': 'This cannot be undone. Delete everything?',
  'Bu cihazdaki tüm veriler yedektekilerle değiştirilecek. Devam?': 'All data on this device will be replaced by the backup. Continue?',
  'İsim uygun değil': 'Invalid name', "İsim {0}–{1} karakter olmalı; harf, rakam, boşluk ve . - ' kullanılabilir.": "Names must be {0}–{1} characters; letters, numbers, spaces and . - ' are allowed.",
  'Maç iptal edilsin mi?': 'Abandon this match?', 'Bu maç kaydedilmez.': 'It will not be saved.',
  'Oyuncu silinsin mi?': 'Delete this player?', 'Geçmiş maçlarda "Silinmiş" olarak görünür.': 'Past matches will show "Deleted".',
  'Tüm veriler silinsin mi?': 'Delete all data?', 'TÜM oyuncular ve maçlar silinecek. Bu işlem geri alınamaz.': 'ALL players and matches will be deleted. This cannot be undone.',
  'Tümünü sil': 'Delete all', 'Yedek yüklensin mi?': 'Restore backup?', 'Bu cihazdaki tüm veriler yedektekilerle değiştirilecek.': 'All data on this device will be replaced by the backup.',
  'Yükle': 'Restore', 'Uyarı': 'Warning',
  'Standart': 'Standard', 'Kriket MPR': 'Cricket MPR', 'Vurucu': 'Batter', 'Atıcı': 'Bowler', 'Koşu': 'Runs', 'Wicket': 'Wickets',
  'Sıra değişti! Hedef: {0}': 'Innings over! Target: {0}', '+{0} koşu': '+{0} runs', 'Hedef {0}': 'Target {0}',
  'Vurucu: 40\'ı aşan her puan koşu': 'Batter: every point above 40 is a run', 'Atıcı: Bull\'a at · wicket {0}/{1}': 'Bowler: aim at the Bull · wickets {0}/{1}',
  'Hedefler değişti!': 'Targets changed!', 'Gizli hedef: {0}': 'Hidden target: {0}', 'Oyun modu': 'Game mode', 'Cezalı': 'Cut-throat', 'Cezasız': 'No score',
  '{0} atılamaz': '{0} is not possible', 'Bu isim zaten var': 'That name already exists', 'Yedek yüklendi': 'Backup restored',
  'Dosya okunamadı: {0}': 'Could not read file: {0}', 'Silinmiş': 'Deleted',
  'Kayıt alanı doldu. Ayarlar > Yedek al ile yedekleyip eski maçları silebilirsin.': 'Storage is full. Export a backup in Settings and delete old matches.',

  // ── oyun seçenekleri
  'Başlangıç': 'Start', 'Başlama': 'In', 'Serbest': 'Straight in', 'Puan': 'Points', 'Puanlı': 'With points', 'Puansız': 'No points',
  'Tur sınırı': 'Round limit', 'Sınırsız': 'Unlimited', 'Can': 'Lives', 'Sayılan': 'Counts', 'Sadece double': 'Doubles only',
  'Tüm bölge': 'Whole segment', 'Sadece triple': 'Triples only', 'Sonda Bull': 'Bull at the end', 'Var': 'Yes', 'Hayır': 'No', 'Evet': 'Yes',
  'Çarpan atlatır': 'Multipliers skip', 'Tur': 'Rounds', 'Başlangıç puanı': 'Starting score', 'Hedef': 'Target', 'Deneme': 'Attempts',
  'Hedef sayısı': 'Targets', 'Sıra': 'Order', 'Karışık': 'Mixed', '40 (tam)': '40 (full)', 'Hedefler': 'Targets',

  // ── oyun içi yazılar
  'Ort {0}': 'Avg {0}', 'Ort –': 'Avg –', 'Son {0}': 'Last {0}', '{0} ok': '{0} darts', 'Double In bekliyor': 'Waiting for double in',
  'Başlamak için double vur': 'Hit a double to start', 'Bitiriş: {0}': 'Checkout: {0}', 'Bu puan 3 okta bitmez': 'No 3-dart checkout',
  'Ortalama': 'Average', 'Hepsi kapalı — puanın en düşük olunca kazanırsın': 'All closed — lowest score wins',
  'Hepsi kapalı — puanda öne geç!': 'All closed — get ahead on points!', 'Açık: {0}': 'Open: {0}',
  'MPR (tur başı işaret)': 'MPR (marks per round)', 'Toplam işaret': 'Total marks',
  'KILLER oldun!': "You're a KILLER!", 'Kendi canından gitti!': 'You lost one of your own lives!', 'Elendi!': 'Eliminated!',
  'Killer olmak için: {0}': 'To become killer: {0}', 'Vur: {0}': 'Hit: {0}', 'Elendi': 'Out', 'Killer değil': 'Not killer', 'Can alma': 'Lives taken',
  'Hedef: {0}': 'Target: {0}', '  · Shanghai için S + D + T': '  · S + D + T for Shanghai', 'Tur {0}/{1}': 'Round {0}/{1}', 'İsabet': 'Hits',
  'Herhangi double': 'Any double', 'Herhangi triple': 'Any triple', 'YARIYA İNDİ!': 'HALVED!', 'Toplanan': 'Scored', 'Yarıya inme': 'Halved',
  'Bitti!': 'Done!', 'Inning {0} · Hedef: {1}': 'Inning {0} · Target: {1}', 'Koşu': 'Runs', 'Toplam': 'Total', 'En iyi tur': 'Best turn',
  'Hedefe {0}': '{0} to go', ' · Gotcha için {0} at': ' · throw {0} for Gotcha', 'Kalan {0}': 'Left {0}',
  'Sıfırın altı — bitti': 'Below zero — game over', 'Bitti': 'Done', 'Skor': 'Score', 'Double isabeti': 'Double hits', 'Yüzde': 'Percent',
  '{0} bitti! +{1}': '{0} checked out! +{1}', '{0} olmadı': '{0} missed', '{0} · {1} ok kaldı': '{0} · {1} darts left',
  'Hedef {0}': 'Target {0}', '{0}/{1} başarı': '{0}/{1} hits', '{0} puan': '{0} pts', 'Başarı': 'Success',
  'Hedef: {0} · Tur {1}/{2}': 'Target: {0} · Round {1}/{2}', 'Bölüm {0} · Tur {1}/19 · Hedef: {2}': 'Part {0} · Round {1}/19 · Target: {2}',
  'Tur {0}/19': 'Round {0}/19', 'Hedef: {0} · {1}/{2}': 'Target: {0} · {1}/{2}',
};
