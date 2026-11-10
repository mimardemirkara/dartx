// Ülke ve şehir seçimi (Demir 11.11): bayraklar img/bayrak/<kod>.svg (flag-icons, MIT), adlar cihazın dilinde (Intl)
const KODLAR = ['ad','ae','af','ag','ai','al','am','ao','ar','as','at','au','aw','ax','az','ba','bb','bd','be','bf','bg','bh','bi','bj','bl','bm','bn','bo','bq','br','bs','bt','bw','by','bz','ca','cc','cd','cf','cg','ch','ci','ck','cl','cm','cn','co','cr','cu','cv','cw','cx','cy','cz','de','dj','dk','dm','do','dz','ec','ee','eg','eh','er','es','et','fi','fj','fk','fm','fo','fr','ga','gb-eng','gb-nir','gb-sct','gb-wls','gb','gd','ge','gf','gg','gh','gi','gl','gm','gn','gp','gq','gr','gt','gu','gw','gy','hk','hn','hr','ht','hu','id','ie','il','im','in','iq','ir','is','it','je','jm','jo','jp','ke','kg','kh','ki','km','kn','kp','kr','kw','ky','kz','la','lb','lc','li','lk','lr','ls','lt','lu','lv','ly','ma','mc','md','me','mf','mg','mh','mk','ml','mm','mn','mo','mp','mq','mr','ms','mt','mu','mv','mw','mx','my','mz','na','nc','ne','nf','ng','ni','nl','no','np','nr','nu','nz','om','pa','pe','pf','pg','ph','pk','pl','pm','pn','pr','ps','pt','pw','py','qa','re','ro','rs','ru','rw','sa','sb','sc','sd','se','sg','sh','si','sj','sk','sl','sm','sn','so','sr','ss','st','sv','sx','sy','sz','tc','td','tg','th','tj','tk','tl','tm','tn','to','tr','tt','tv','tw','tz','ua','ug','us','uy','uz','va','vc','ve','vg','vi','vn','vu','wf','ws','xk','ye','yt','za','zm','zw'];
// dartta ayrı yarışan İngiltere / İskoçya / Galler / Kuzey İrlanda
const OZEL = { tr: { 'gb-eng': 'İngiltere', 'gb-sct': 'İskoçya', 'gb-wls': 'Galler', 'gb-nir': 'Kuzey İrlanda', xk: 'Kosova' },
  en: { 'gb-eng': 'England', 'gb-sct': 'Scotland', 'gb-wls': 'Wales', 'gb-nir': 'Northern Ireland', xk: 'Kosovo' } };
// listenin başında gösterilenler (Türkiye + dartın güçlü olduğu ülkeler)
const ONCE = ['tr', 'gb-eng', 'nl', 'de', 'be', 'gb-sct', 'gb-wls', 'ie', 'us', 'au'];

const TR_IL = ['Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul','İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kilis','Kırıkkale','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Şanlıurfa','Siirt','Sinop','Şırnak','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak'];
// diğer ülkelerde büyük şehirler; listede yoksa kullanıcı kendisi yazar
const SEHIR = {
  tr: TR_IL,
  'gb-eng': ['Birmingham','Blackpool','Bristol','Leeds','Leicester','Liverpool','London','Manchester','Milton Keynes','Newcastle','Nottingham','Sheffield','Southampton','Stoke-on-Trent','Wolverhampton'],
  'gb-sct': ['Aberdeen','Dundee','Edinburgh','Glasgow','Inverness','Perth','Stirling'],
  'gb-wls': ['Bangor','Cardiff','Newport','Swansea','Wrexham'],
  'gb-nir': ['Belfast','Derry','Lisburn','Newry'],
  gb: ['Belfast','Birmingham','Cardiff','Edinburgh','Glasgow','Leeds','Liverpool','London','Manchester','Newcastle'],
  ie: ['Cork','Dublin','Galway','Limerick','Waterford'],
  nl: ['Amsterdam','Den Haag','Eindhoven','Groningen','Rotterdam','Utrecht','Venlo','Zwolle'],
  be: ['Antwerpen','Brugge','Brussel','Charleroi','Gent','Hasselt','Leuven','Liège'],
  de: ['Berlin','Bremen','Dortmund','Dresden','Düsseldorf','Essen','Frankfurt','Hamburg','Hannover','Köln','Leipzig','München','Nürnberg','Stuttgart'],
  at: ['Graz','Innsbruck','Linz','Salzburg','Wien'],
  us: ['Atlanta','Boston','Chicago','Dallas','Denver','Houston','Las Vegas','Los Angeles','Miami','New York','Philadelphia','Phoenix','San Francisco','Seattle'],
  au: ['Adelaide','Brisbane','Canberra','Melbourne','Perth','Sydney'],
  az: ['Bakü','Gence','Sumgayıt'], cy: ['Girne','Gazimağusa','Lefkoşa','Limasol','Larnaka','Baf'],
};

export const bayrak = kod => kod ? `<img class="yer-bayrak" src="img/bayrak/${kod}.svg" alt="" loading="lazy">` : '';
const adlar = {};
export function ulkeAd(kod, dil = 'tr') {
  if (!kod) return '';
  const d = dil === 'en' ? 'en' : 'tr';
  if (OZEL[d][kod]) return OZEL[d][kod];
  try { adlar[d] = adlar[d] || new Intl.DisplayNames([d], { type: 'region' }); return adlar[d].of(kod.toUpperCase()) || kod.toUpperCase(); }
  catch (_) { return kod.toUpperCase(); }
}
/** [{deger, ad}] — öne çıkanlar başta, kalanı alfabetik */
export function ulkeler(dil = 'tr') {
  const hepsi = KODLAR.map(k => ({ deger: k, ad: ulkeAd(k, dil) }));
  const yer = dil === 'en' ? 'en' : 'tr';
  const on = ONCE.map(k => hepsi.find(x => x.deger === k)).filter(Boolean);
  const kalan = hepsi.filter(x => !ONCE.includes(x.deger)).sort((a, b) => a.ad.localeCompare(b.ad, yer));
  return [...on, ...kalan];
}
export const sehirler = kod => (SEHIR[kod] || []).slice().sort((a, b) => a.localeCompare(b, 'tr'));
