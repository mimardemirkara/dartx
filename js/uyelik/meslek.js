// Meslek listesi ve dart ünvanları (Demir 11.11). Meslek: listeden seçilir ya da yazılır; ünvanı herkes kendisi seçer.
// Kayıtta Türkçe ad saklanır; İngilizcede listedeki karşılığı gösterilir.
const MESLEK = [
  ['Akademisyen', 'Academic'], ['Aktör / Aktris', 'Actor / Actress'], ['Analist', 'Analyst'], ['Antrenör', 'Coach'], ['Aşçı', 'Cook'], ['Avukat', 'Lawyer'],
  ['Bahçıvan', 'Gardener'], ['Bankacı', 'Banker'], ['Barmen', 'Bartender'], ['Barista', 'Barista'], ['Berber', 'Barber'], ['Bilgisayar mühendisi', 'Computer engineer'],
  ['Biyolog', 'Biologist'], ['Botanikçi', 'Botanist'], ['Cerrah', 'Surgeon'], ['Çevirmen', 'Translator'], ['Çiftçi', 'Farmer'], ['Çilingir', 'Locksmith'],
  ['Danışman', 'Consultant'], ['Diş hekimi', 'Dentist'], ['Diyetisyen', 'Dietitian'], ['Doktor', 'Doctor'], ['Doğum uzmanı', 'Obstetrician'], ['Ebe', 'Midwife'],
  ['Eczacı', 'Pharmacist'], ['Editör', 'Editor'], ['Ekonomist', 'Economist'], ['Elektrikçi', 'Electrician'], ['Elektrik mühendisi', 'Electrical engineer'], ['Emekli', 'Retired'],
  ['Emlakçı', 'Real estate agent'], ['Endüstri mühendisi', 'Industrial engineer'], ['Esnaf', 'Shopkeeper'], ['Ev hanımı / Ev erkeği', 'Homemaker'], ['Fizikçi', 'Physicist'], ['Fizyoterapist', 'Physiotherapist'],
  ['Fotoğrafçı', 'Photographer'], ['Garson', 'Waiter / Waitress'], ['Gazeteci', 'Journalist'], ['Gemi kaptanı', 'Ship captain'], ['Girişimci', 'Entrepreneur'], ['Grafik tasarımcı', 'Graphic designer'],
  ['Güvenlik görevlisi', 'Security guard'], ['Hakem', 'Referee'], ['Halkla ilişkiler uzmanı', 'PR specialist'], ['Harita mühendisi', 'Surveying engineer'], ['Hemşire', 'Nurse'], ['Hostes / Kabin memuru', 'Flight attendant'],
  ['İç mimar', 'Interior designer'], ['İnsan kaynakları uzmanı', 'HR specialist'], ['İnşaat mühendisi', 'Civil engineer'], ['İnşaat işçisi', 'Construction worker'], ['İşçi', 'Worker'], ['İş insanı', 'Businessperson'],
  ['İtfaiyeci', 'Firefighter'], ['Jeolog', 'Geologist'], ['Kameraman', 'Camera operator'], ['Kaptan pilot', 'Airline captain'], ['Kasap', 'Butcher'], ['Kasiyer', 'Cashier'],
  ['Kimyager', 'Chemist'], ['Kimya mühendisi', 'Chemical engineer'], ['Kuaför', 'Hairdresser'], ['Kurye', 'Courier'], ['Kütüphaneci', 'Librarian'], ['Makine mühendisi', 'Mechanical engineer'],
  ['Makinist', 'Machinist'], ['Mali müşavir', 'Financial advisor'], ['Marangoz', 'Carpenter'], ['Matematikçi', 'Mathematician'], ['Memur', 'Civil servant'], ['Mimar', 'Architect'],
  ['Moda tasarımcısı', 'Fashion designer'], ['Muhasebeci', 'Accountant'], ['Müdür / Yönetici', 'Manager'], ['Müzisyen', 'Musician'], ['Noter', 'Notary'], ['Oyun geliştirici', 'Game developer'],
  ['Öğrenci', 'Student'], ['Öğretmen', 'Teacher'], ['Öğretim görevlisi', 'Lecturer'], ['Pastacı', 'Pastry chef'], ['Pazarlamacı', 'Marketer'], ['Pilot', 'Pilot'],
  ['Polis', 'Police officer'], ['Proje yöneticisi', 'Project manager'], ['Psikolog', 'Psychologist'], ['Psikiyatrist', 'Psychiatrist'], ['Radyolog', 'Radiologist'], ['Rehber', 'Tour guide'],
  ['Reklamcı', 'Advertiser'], ['Ressam', 'Painter (artist)'], ['Satış temsilcisi', 'Sales representative'], ['Savcı', 'Prosecutor'], ['Sağlık teknikeri', 'Health technician'], ['Sekreter', 'Secretary'],
  ['Serbest çalışan', 'Freelancer'], ['Sigortacı', 'Insurance agent'], ['Sosyal hizmet uzmanı', 'Social worker'], ['Sosyal medya uzmanı', 'Social media specialist'], ['Sporcu', 'Athlete'], ['Subay', 'Officer (military)'],
  ['Astsubay', 'Non-commissioned officer'], ['Asker', 'Soldier'], ['Şoför', 'Driver'], ['Tır şoförü', 'Truck driver'], ['Taksici', 'Taxi driver'], ['Tamirci', 'Repairer'],
  ['Oto tamircisi', 'Car mechanic'], ['Teknisyen', 'Technician'], ['Tekstilci', 'Textile worker'], ['Terzi', 'Tailor'], ['Tesisatçı', 'Plumber'], ['Turizmci', 'Tourism professional'],
  ['Uçak teknisyeni', 'Aircraft technician'], ['Veri bilimci', 'Data scientist'], ['Veteriner', 'Veterinarian'], ['Web tasarımcı', 'Web designer'], ['Yazar', 'Writer'], ['Yazılımcı', 'Software developer'],
  ['Yönetmen', 'Director (film)'], ['Yapımcı', 'Producer'], ['Yüzme öğretmeni', 'Swimming instructor'], ['Zabıta', 'Municipal police'], ['Ziraat mühendisi', 'Agricultural engineer'], ['Kuyumcu', 'Jeweller'],
  ['Fırıncı', 'Baker'], ['Balıkçı', 'Fisher'], ['Madenci', 'Miner'], ['Kaynakçı', 'Welder'], ['Boyacı', 'Painter (decorator)'], ['Döşemeci', 'Upholsterer'],
  ['Mobilyacı', 'Furniture maker'], ['Kafe / Bar işletmecisi', 'Café / bar owner'], ['Restoran işletmecisi', 'Restaurant owner'], ['Otel çalışanı', 'Hotel staff'], ['Lojistikçi', 'Logistics specialist'], ['Depo görevlisi', 'Warehouse worker'],
  ['Gümrük müşaviri', 'Customs broker'], ['Dış ticaret uzmanı', 'Foreign trade specialist'], ['Finans uzmanı', 'Finance specialist'], ['Borsacı', 'Trader'], ['Aktüer', 'Actuary'], ['Denetçi', 'Auditor'],
  ['Hâkim', 'Judge'], ['Diplomat', 'Diplomat'], ['Siyasetçi', 'Politician'], ['İmam / Din görevlisi', 'Religious official'], ['Sanatçı', 'Artist'], ['Heykeltıraş', 'Sculptor'],
  ['Dansçı', 'Dancer'], ['Sunucu', 'Presenter'], ['Spiker', 'Announcer'], ['DJ', 'DJ'], ['YouTuber / İçerik üreticisi', 'Content creator'], ['Profesyonel dart oyuncusu', 'Professional darts player'],
  ['Kişisel antrenör', 'Personal trainer'], ['Beden eğitimi öğretmeni', 'PE teacher'], ['Okul öncesi öğretmeni', 'Preschool teacher'], ['Çocuk gelişimci', 'Child development specialist'], ['Laborant', 'Lab technician'], ['Paramedik', 'Paramedic'],
  ['Optisyen', 'Optician'], ['Odyolog', 'Audiologist'], ['Tıbbi sekreter', 'Medical secretary'], ['Siber güvenlik uzmanı', 'Cybersecurity specialist'], ['Sistem yöneticisi', 'System administrator'], ['Ağ uzmanı', 'Network specialist'],
  ['Elektronik mühendisi', 'Electronics engineer'], ['Uzay / Havacılık mühendisi', 'Aerospace engineer'], ['Gıda mühendisi', 'Food engineer'], ['Çevre mühendisi', 'Environmental engineer'], ['Peyzaj mimarı', 'Landscape architect'], ['Şehir plancısı', 'Urban planner'],
  ['Tasarımcı', 'Designer'], ['Ürün yöneticisi', 'Product manager'], ['Arkeolog', 'Archaeologist'], ['Tarihçi', 'Historian'], ['Sosyolog', 'Sociologist'], ['Filozof', 'Philosopher'],
  ['İşsiz / İş arıyor', 'Job seeker'], ['Diğer', 'Other'],
];
const EN = Object.fromEntries(MESLEK);
export const meslekAd = (ad, dil) => (dil === 'en' && EN[ad]) || ad || '';
export const meslekler = dil => MESLEK.map(([tr, en]) => ({ deger: tr, ad: dil === 'en' ? en : tr }))
  .sort((a, b) => a.ad.localeCompare(b.ad, dil === 'en' ? 'en' : 'tr'));

// Dart seviyesi (Demir 11.11): liglerdeki "skill level" gibi; herkes kendisi seçer. Simge + renk.
export const SEVIYELER = [
  { k: 'baslangic', tr: 'Başlangıç', en: 'Beginner', ic: '🌱', renk: '#9ca3af' },
  { k: 'amator', tr: 'Amatör', en: 'Amateur', ic: '🎯', renk: '#60a5fa' },
  { k: 'klasman', tr: 'Klasman', en: 'Ranked', ic: '⭐', renk: '#34d399' },
  { k: 'usta', tr: 'Usta', en: 'Master', ic: '🔥', renk: '#e3b866' },
  { k: 'elit', tr: 'Elit', en: 'Elite', ic: '💎', renk: '#a78bfa' },
  { k: 'pro', tr: 'Profesyonel', en: 'Professional', ic: '🏆', renk: '#f59e0b' },
];
export const seviyeBul = k => SEVIYELER.find(u => u.k === k) || null;
/** Küçük seviye rozeti (profil, menü, arkadaş listesi) */
export const seviyeRozet = (k, dil) => { const u = seviyeBul(k); return u ? `<span class="seviye-rozet" style="--ur:${u.renk}"><i>${u.ic}</i>${dil === 'en' ? u.en : u.tr}</span>` : ''; };
