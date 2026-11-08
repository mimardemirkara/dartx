// DartX — oyun kurallarını simgeli maddelere çevirir (19 oyun, iki dil; metin oyun dosyalarındaki rules / rulesEn).
// Simgeler lucide-react 1.26.0 (demirkara.com ile aynı set). Konu anahtar kelimeyle seçilir; sıra önceliktir.
const L = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  bust: L('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  yildiz: L('<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>'),
  kupa: L('<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>'),
  kurukafa: L('<path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>'),
  kalp: L('<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>'),
  bolu: L('<circle cx="12" cy="6" r="1"/><line x1="5" x2="19" y1="12" y2="12"/><circle cx="12" cy="18" r="1"/>'),
  oynat: L('<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>'),
  bayrak: L('<path d="M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5"/>'),
  tekrar: L('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
  arti: L('<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>'),
  onay: L('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  kisiler: L('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>'),
  hedef: L('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  nisan: L('<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>'),
};

export const KURAL_IKON = I;

// Öncelik sırasıyla: [simge, desen]
const KURAL = [
  ['bust', /\bbust\b|geçersiz|\bvoid\b/],
  ['yildiz', /shanghai|bonus/],
  ['kurukafa', /\bkiller\b/],
  ['bayrak', /double out|master out/],
  ['kalp', /\bcan(ı|ın|lar)?\b|\blives?\b|elen|eliminat/],
  ['bolu', /yarı|halv/],
  ['oynat', /double in|başlamak için|before you start|başlarsın|start on|starts? (at|on|from)/],
  ['bayrak', /double out|master out|bitir|check ?out|finish/],
  ['kupa', /kazan|\bwins?\b|winner|son kalan|last player|en yüksek|highest|most runs|en çok/],
  ['tekrar', /\btur\b|turlar|round|inning|deneme|attempt/],
  ['onay', /kapat|\bclose|işaret|\bmarks?\b/],
  ['arti', /puan|point|skor|score|koşu|\bruns?\b|değeri|value/],
  ['kisiler', /herkes|everyone|oyuncu|player|rakip|opponent/],
  ['hedef', /hedef|target/],
];
const simgeSec = metin => {
  const k = metin.toLocaleLowerCase('tr');
  for (const [ic, re] of KURAL) if (re.test(k)) return I[ic];
  return I.nisan;
};

/** Kural metni → simgeli maddeler (HTML). Satır başları ve satır içindeki her <b>Başlık:</b> yeni madde açar. */
export function kuralMaddeleri(metin) {
  const maddeler = [];
  String(metin || '').split('\n').map(s => s.trim()).filter(Boolean).forEach(satir => {
    // satır içindeki ikinci, üçüncü <b>…:</b> ayrı madde olsun
    satir.split(/(?=<b>[^<]{1,40}:<\/b>)/).map(s => s.trim()).filter(Boolean).forEach(p => maddeler.push(p));
  });
  return `<ul class="kural-liste">${maddeler.map(p => {
    const m = p.match(/^<b>([^<]{1,40}):<\/b>\s*(.*)$/);
    const baslik = m ? m[1] : '';
    const govde = m ? m[2] : p;
    const duz = (baslik + ' ' + govde).replace(/<[^>]+>/g, '');
    return `<li><span class="kural-ikon">${simgeSec(duz)}</span><div>${baslik ? `<b>${baslik}</b>` : ''}<p>${govde}</p></div></li>`;
  }).join('')}</ul>`;
}
