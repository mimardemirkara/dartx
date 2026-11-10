// Ok setim (Demir 11.11): marka, model, ağırlık, tungsten, uç, gövde, kanat. Listeler buradan; marka ve model yazılabilir.
export const MARKALAR = ['Target', 'Winmau', 'Harrows', 'Red Dragon', 'Unicorn', 'Mission', 'Shot', "Bull's", 'Cosmo Darts', 'L-Style', 'Trinidad',
  'Dynasty', 'One80', 'Loxley', 'Designa', 'McKicks', 'Datadart', 'Laser Darts', 'Bottelsen', 'Kotobuki', 'Viper', 'GLD Products', 'Karella',
  'Elkadart', 'Monster Darts', 'Condor', 'Fit Flight', 'Pentathlon', 'Masters', 'Diğer'];

// Markaya göre bilinen seriler (Demir 11.11); listede yoksa kullanıcı yazar
export const MODELLER = {
  'Target': ['Power 9Five', 'Phil Taylor Power Series', 'Luke Littler', 'Rob Cross', 'Nathan Aspinall', 'Vapor8', 'Daytona Fire', 'Carrera', 'Swiss Point', 'Agora', 'Origin', 'Ultra'],
  'Winmau': ['MvG Exact', 'MvG Design', 'MvG Absolute', 'Sniper', 'Blackout', 'Navigator', 'Simon Whitlock', 'Daryl Gurney', 'Firestorm', 'Onyx'],
  'Red Dragon': ['Gerwyn Price Iceman', 'Peter Wright Snakebite', 'Jonny Clayton', 'Luke Humphries', 'Razor Edge', 'Amberjack', 'Javelin', 'Defiant', 'Hellfire'],
  'Harrows': ['Supergrip', 'Assassin', 'Silica', 'Noble', 'Wolfram', 'Club Brass', 'Rapide', 'Dave Chisnall'],
  'Unicorn': ['Gary Anderson Phase', 'Purist', 'Sigma', 'Core', 'Striker', 'Silver Star', 'World Champion'],
  'Mission': ['Fallon Sherrock', 'Damon Heta', 'Ryan Searle', 'Kuro', 'Sabotage', 'Hydra'],
  'Shot': ['Tribal Weapon', 'Viking', 'Zen', 'Michael Smith', 'Warrior', 'Mana'],
  "Bull's": ['Champion', 'Meteor', 'Grip-X', 'Daniel Larsson'],
  'Cosmo Darts': ['Discovery', 'Ultra Grip'],
  'L-Style': ['Champagne', 'L-Shaft Lock'],
  'Dynasty': ['A-Flow', 'Black Line', 'Paul Lim'],
  'One80': ['Nexus', 'Gladiator', 'Strike'],
  'Loxley': ['Carry', 'Vulcan'],
  'Condor': ['AXE', 'AXE Small', 'Zero-Stress', 'Neon'],
  'Fit Flight': ['AIR', 'Fit Shaft Gear', 'Fit Shaft Carbon'],
};
export const modeller = marka => (MODELLER[marka] || []).map(m => ({ deger: m, ad: m }));

// [anahtar, tr, en]
export const TUNGSTEN = [['80', '%80 tungsten', '80% tungsten'], ['85', '%85 tungsten', '85% tungsten'], ['90', '%90 tungsten', '90% tungsten'],
  ['95', '%95 tungsten', '95% tungsten'], ['97', '%97 tungsten', '97% tungsten'], ['pirinc', 'Pirinç', 'Brass'], ['nikel', 'Nikel-gümüş', 'Nickel silver']];
export const UCLAR = [['celik', 'Çelik uç', 'Steel tip'], ['soft', 'Soft uç', 'Soft tip']];
export const GOVDELER = [['kisa', 'Kısa', 'Short'], ['orta-kisa', 'Orta-kısa', 'In-between'], ['orta', 'Orta', 'Medium'], ['uzun', 'Uzun', 'Long'],
  // Demir 11.11: shaft ve flight'ı tek parça kullananlar (ör. Condor AXE)
  ['birlesik-kisa', 'Birleşik · kısa (shaft + flight tek parça)', 'Integrated · short (one-piece shaft + flight)'],
  ['birlesik-orta', 'Birleşik · orta (shaft + flight tek parça)', 'Integrated · medium (one-piece shaft + flight)'],
  ['birlesik-uzun', 'Birleşik · uzun (shaft + flight tek parça)', 'Integrated · long (one-piece shaft + flight)']];
export const KANATLAR = [['standart', 'Standart', 'Standard'], ['slim', 'Slim', 'Slim'], ['kite', 'Kite', 'Kite'], ['pear', 'Pear', 'Pear'],
  ['teardrop', 'Teardrop', 'Teardrop'], ['fantail', 'Fantail', 'Fantail'], ['vortex', 'Vortex', 'Vortex'], ['shape', 'Shape', 'Shape']];

export const secenekAd = (liste, k, dil) => { const s = liste.find(x => x[0] === k); return s ? (dil === 'en' ? s[2] : s[1]) : ''; };
export const secenekler = (liste, dil) => liste.map(([k, tr, en]) => ({ deger: k, ad: dil === 'en' ? en : tr }));

/** Arkadaşların gördüğü kısa özet: "Target · Power 9Five · 23 g · %90 tungsten · Slim" */
export function okOzet(p, dil) {
  const birlesik = String(p.okGovde || '').startsWith('birlesik') ? (dil === 'en' ? 'Integrated shaft+flight' : 'Birleşik shaft+flight') : '';
  const g = v => (v === '__belirtme__' ? '' : v);
  const parca = [g(p.okMarka), g(p.okModel), typeof p.agirlik === 'number' ? `${p.agirlik} g` : '', secenekAd(TUNGSTEN, p.okTungsten, dil), secenekAd(UCLAR, p.okUc, dil), birlesik, secenekAd(KANATLAR, p.okKanat, dil)];
  return parca.filter(Boolean).join(' · ');
}

// Marka rozeti (Demir 11.11): tescilli logo yerine bizim tasarımımız — baş harfler + markaya sabit renk
const ROZET_RENK = ['#e3b866', '#60a5fa', '#f87171', '#34d399', '#a78bfa', '#f59e0b', '#22d3ee', '#fb7185', '#84cc16', '#c084fc'];
export const markaBas = m => { const s = String(m || '').replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/); return (s.length > 1 ? s[0][0] + s[1][0] : s[0].slice(0, 2)).toUpperCase(); };
export function markaRozet(m) {
  if (!m) return '';
  let h = 0; for (const c of String(m)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const renk = ROZET_RENK[h % ROZET_RENK.length];
  return `<i class="marka-rozet" style="--mr:${renk}" aria-hidden="true">${markaBas(m)}</i>`;
}
