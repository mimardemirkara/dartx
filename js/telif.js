// DartX — Telif Hakları ve kopya koruması.
// Kaynak: demirkara.com GorselKoruma.tsx (koruma davranışı, uyarı kartı, mühür) ve TelifMetni.tsx (maddeler, 5846 sayılı FSEK
// ve 17 U.S.C. dayanakları). Metin mimarlıktan yazılıma uyarlandı; hukukçu gözden geçirince yalnız bu dosya değişir.
import { dil } from './i18n.js';

export const TELIF_GUNCELLEME = '08.11.2026';

const L = (d, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const S = { // lucide-react 1.26.0 (demirkara.com ile aynı set)
  kalkan: L('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
  yasak: L('<circle cx="12" cy="12" r="10"/><path d="M4.929 4.929 19.07 19.071"/>'),
  tokmak: L('<path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381"/><path d="m16 16 6-6"/><path d="m21.5 10.5-8-8"/><path d="m8 8 6-6"/><path d="m8.5 7.5 8 8"/>'),
  kure: L('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  anahtar: L('<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>'),
  bayrak: L('<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>'),
  kod: L('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
  kopya: L('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  x: L('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 10),
};

const METIN = {
  tr: {
    uyariBaslik: 'Telif Hakkı Uyarısı',
    uyari: 'DartX\'in tasarımı, görselleri ve yazılımı telif hakkıyla korunmaktadır. İzinsiz kopyalanamaz, indirilemez ve kullanılamaz.',
    dugmeYasa: 'Telif Hakları', dugmeTamam: 'Anladım',
    baslik: 'Telif Hakları', guncelleme: 'Son güncelleme: {0}',
    giris: 'DartX\'teki yazılım, tasarım, görsel ve metinler; özgün emeğin ürünüdür ve kanunla korunur. Yazılı izin olmadan kullanmak suçtur. Tespit edilen ihlallerde hukuki ve cezai yollara başvurulur.',
    bolumler: [
      ['kalkan', 'Neler Korunuyor', [
        'Aksi belirtilmedikçe DartX\'in bütün içeriği ve hakları DK Design Consulting Technology LLC\'ye (Albuquerque, New Mexico, ABD) aittir. Eser sahibi ve geliştirici Demir Kara\'dır:',
        ['kod', 'Yazılım, kaynak kodu ve oyun kuralı motoru'],
        ['kopya', 'Arayüz tasarımı, simgeler, ekranlar ve metinler'],
        ['kalkan', 'DartX adı, logosu, bakır X amblemi ve Demir Kara imzası'],
        'Bilgisayar programları, 5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) madde 2 kapsamında ilim ve edebiyat eseri sayılır. Eser sahibi olmak için tescil şartı aranmaz.',
      ]],
      ['yasak', 'Yazılı İzin Olmadan Yapılamayanlar', [
        ['kopya', 'Uygulamayı, kodunu, görsellerini ya da metinlerini kopyalamak, indirmek, başka bir yerde yayımlamak'],
        ['kod', 'Değiştirerek ya da adını değiştirerek dağıtmak, satmak, kendi uygulaması gibi göstermek'],
        ['yasak', 'Logoyu, imzayı ya da telif bilgisini silmek, kırpmak, üstünü kapatmak'],
        ['kod', 'İçerikleri yapay zekâ eğitiminde kullanmak, yapay zekâyla türetmek ya da toplu olarak çekmek'],
        'DartX kişisel kullanım için ücretsizdir; ücretsiz olması bu hakları ortadan kaldırmaz.',
      ]],
      ['tokmak', 'Türkiye\'de Yaptırımlar', [
        ['Hapis cezası', 'İzinsiz çoğaltma, işleme, yayma ya da internette paylaşma: 1 yıldan 5 yıla kadar hapis veya adli para cezası (FSEK m. 71/1).'],
        ['Sahiplenme', 'Başkasının eserine kendi adını koymak: 6 aydan 2 yıla kadar hapis veya adli para cezası; dağıtılır ya da yayımlanırsa üst sınır 5 yıl hapis (FSEK m. 71/2).'],
        ['Telif bilgisini silme', 'Eser üzerindeki sahiplik bilgisini yetkisiz kaldırmak ya da değiştirmek yasaktır (FSEK ek m. 4).'],
        ['Üç kat bedel', 'Yazılı izin almadan kullananlardan, rayiç bedelin en çok üç katı istenebilir (FSEK m. 68).'],
        ['Tazminat', 'Maddi ve manevi tazminat ile ihlalden elde edilen kârın verilmesi istenebilir (FSEK m. 70).'],
        ['Durdurma', 'İhlalin kaldırılması ve önlenmesi için dava açılabilir; kaldırma davasında kusur aranmaz (FSEK m. 66, 69).'],
        ['İnternet', 'İhlal eden içerik için 3 gün içinde kaldırma istenir; devam ederse savcılık başvurusuyla hizmet durdurulabilir (FSEK ek m. 4).'],
      ]],
      ['kure', 'Amerika Birleşik Devletleri\'nde Yaptırımlar', [
        'Yazılım ve görseller ABD Telif Kanunu kapsamındadır (17 U.S.C. § 102). Türkiye ve ABD, Bern Sözleşmesi\'ne taraftır.',
        ['Kanuni tazminat', 'Eser başına 750 ile 30.000 dolar; kasıtlı ihlalde 150.000 dolara kadar (17 U.S.C. § 504; koşulları için § 412).'],
        ['Telif bilgisini silme', 'İhlal başına 2.500 ile 25.000 dolar (17 U.S.C. § 1202, § 1203).'],
        ['Kaldırma', 'Barındırma ve platform şirketlerine içerik kaldırma bildirimi (17 U.S.C. § 512).'],
      ]],
      ['anahtar', 'İzin Almak Kolay', [
        'Basın, yayın, kulüp ya da başka bir kullanım için yazın, değerlendirelim. İzin yalnız yazılı olarak geçerlidir ve belirtilen kullanımla sınırlıdır. Uygulamayı tanıtmak ve bağlantısını paylaşmak serbesttir. Kanunun izin verdiği sınırlı kullanımlar saklıdır.',
      ]],
      ['bayrak', 'İhlal mi Gördünüz?', [
        'DartX\'in izinsiz kullanıldığını görürseniz bağlantısıyla birlikte info@demirkara.com adresine yazın.',
      ]],
    ],
  },
  en: {
    uyariBaslik: 'Copyright Notice',
    uyari: 'The design, graphics and software of DartX are protected by copyright. They may not be copied, downloaded or used without permission.',
    dugmeYasa: 'Copyright', dugmeTamam: 'Understood',
    baslik: 'Copyright', guncelleme: 'Last updated: {0}',
    giris: 'The software, design, graphics and texts in DartX are the result of original work and are protected by law. Using them without written permission is an offence. Legal and criminal action is taken against infringements.',
    bolumler: [
      ['kalkan', 'What Is Protected', [
        'Unless stated otherwise, all content of DartX and all rights in it belong to DK Design Consulting Technology LLC (Albuquerque, New Mexico, USA). Author and developer: Demir Kara:',
        ['kod', 'The software, source code and game rules engine'],
        ['kopya', 'The interface design, icons, screens and texts'],
        ['kalkan', 'The DartX name, logo, copper X emblem and Demir Kara\'s signature'],
        'Computer programs are works of science and literature under Article 2 of the Turkish Law on Intellectual and Artistic Works No. 5846 (FSEK). No registration is required to be the author.',
      ]],
      ['yasak', 'Not Allowed Without Written Permission', [
        ['kopya', 'Copying, downloading or republishing the app, its code, graphics or texts'],
        ['kod', 'Distributing it modified or renamed, selling it, or presenting it as your own'],
        ['yasak', 'Removing, cropping or covering the logo, signature or copyright information'],
        ['kod', 'Using the content to train AI, generating derivatives with AI or scraping it in bulk'],
        'DartX is free for personal use; being free does not waive these rights.',
      ]],
      ['tokmak', 'Penalties in Türkiye', [
        ['Imprisonment', 'Unauthorised reproduction, adaptation, distribution or online sharing: 1 to 5 years in prison or a judicial fine (FSEK Art. 71/1).'],
        ['Claiming authorship', 'Putting your name on someone else\'s work: 6 months to 2 years in prison or a fine; up to 5 years if distributed or published (FSEK Art. 71/2).'],
        ['Removing copyright info', 'Removing or altering ownership information on a work without authorisation is prohibited (FSEK Add. Art. 4).'],
        ['Triple fee', 'Up to three times the market value can be claimed from those using it without written permission (FSEK Art. 68).'],
        ['Damages', 'Material and moral damages and the profit gained from the infringement can be claimed (FSEK Art. 70).'],
        ['Injunction', 'Action can be brought to stop and prevent the infringement; no fault is required (FSEK Art. 66, 69).'],
        ['Internet', 'Infringing content must be removed within 3 days; otherwise the service can be suspended via the public prosecutor (FSEK Add. Art. 4).'],
      ]],
      ['kure', 'Penalties in the United States', [
        'Software and graphics are covered by the US Copyright Act (17 U.S.C. § 102). Türkiye and the US are parties to the Berne Convention.',
        ['Statutory damages', '$750 to $30,000 per work; up to $150,000 for wilful infringement (17 U.S.C. § 504; see § 412 for conditions).'],
        ['Removing copyright info', '$2,500 to $25,000 per violation (17 U.S.C. § 1202, § 1203).'],
        ['Takedown', 'Takedown notices to hosting and platform companies (17 U.S.C. § 512).'],
      ]],
      ['anahtar', 'Asking Permission Is Easy', [
        'For press, clubs or any other use, write to us and we will consider it. Permission is valid only in writing and only for the stated use. Introducing the app and sharing its link is free. Limited uses permitted by law are reserved.',
      ]],
      ['bayrak', 'Seen an Infringement?', [
        'If you see DartX being used without permission, write to info@demirkara.com with the link.',
      ]],
    ],
  },
};

const m = () => METIN[dil()] || METIN.tr;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function telifMetniHtml() {
  const M = m();
  const bolum = ([ic, bas, ogeler]) => {
    const satirlar = ogeler.map(o => {
      if (typeof o === 'string') return `<p>${esc(o)}</p>`;
      if (S[o[0]]) return `<div class="tl-madde"><span>${S[o[0]]}</span><p>${esc(o[1])}</p></div>`;
      return `<div class="tl-tanim"><b>${esc(o[0])}</b><p>${esc(o[1])}</p></div>`;
    }).join('');
    return `<h3>${S[ic]}${esc(bas)}</h3>${satirlar}`;
  };
  return `<div class="tl-bas"><div><h2>${esc(M.baslik)}</h2><small>${esc(M.guncelleme.replace('{0}', TELIF_GUNCELLEME))}</small></div><img src="img/telif-muhur.webp" alt="" draggable="false"></div>
    <p class="tl-giris">${esc(M.giris)}</p>${M.bolumler.map(bolum).join('')}`;
}

// ── Uyarı kartı ve tam metin (sitedeki .telif-ort / .telif-kart / .telif-yasa)
function kapat() { document.getElementById('telif-katman')?.remove(); }
export function telifUyari() {
  if (document.getElementById('telif-katman')) return;
  const M = m();
  const k = document.createElement('div');
  k.id = 'telif-katman';
  k.className = 'telif-ort';
  k.innerHTML = `<div class="telif-kart" role="alertdialog" aria-modal="true" aria-label="${esc(M.uyariBaslik)}">
      <button type="button" class="telif-kapat telif-kapat-kart" data-tl="kapat" aria-label="Kapat">${S.x}</button>
      <img class="telif-muhur" src="img/telif-muhur.webp" alt="" draggable="false">
      <h2>${esc(M.uyariBaslik)}</h2><p>${esc(M.uyari)}</p><small>© ${new Date().getFullYear()} DK Design Consulting Technology LLC</small>
      <div class="telif-dugmeler"><button type="button" class="pill" data-tl="yasa">${S.tokmak} ${esc(M.dugmeYasa)}</button><button type="button" class="pill gold" data-tl="kapat">${esc(M.dugmeTamam)}</button></div>
    </div>`;
  k.addEventListener('click', e => {
    const a = e.target.closest('[data-tl]')?.dataset.tl;
    if (e.target === k || a === 'kapat') kapat();
    else if (a === 'yasa') { kapat(); telifAc(); }
  });
  document.body.appendChild(k);
}
export function telifAc() {
  kapat();
  const M = m();
  const k = document.createElement('div');
  k.id = 'telif-katman';
  k.className = 'telif-ort';
  k.innerHTML = `<div class="telif-yasa" role="dialog" aria-modal="true" aria-label="${esc(M.baslik)}">
      <div class="telif-yasa-bas"><button type="button" class="telif-kapat" data-tl="kapat" aria-label="Kapat">${S.x}</button><span class="telif-yasa-ad">${S.tokmak}${esc(M.baslik)}</span></div>
      <div class="telif-yasa-ic">${telifMetniHtml()}<div class="telif-dugmeler"><button type="button" class="pill gold" data-tl="kapat">${esc(M.dugmeTamam)}</button></div></div>
    </div>`;
  k.addEventListener('click', e => { if (e.target === k || e.target.closest('[data-tl="kapat"]')) kapat(); });
  document.body.appendChild(k);
}

// ── Koruma: sağ tık, kopyalama, sürükleme, kaydet / yazdır kısayolları, Print Screen (sitedeki GorselKoruma)
const yaziAlani = el => !!el?.closest?.('input, textarea, [contenteditable="true"]');
export function korumaKur() {
  document.addEventListener('contextmenu', e => { if (!yaziAlani(e.target)) { e.preventDefault(); telifUyari(); } }, true);
  document.addEventListener('dragstart', e => { if (!yaziAlani(e.target)) { e.preventDefault(); } }, true);
  ['copy', 'cut'].forEach(ad => document.addEventListener(ad, e => { if (!yaziAlani(e.target)) { e.preventDefault(); telifUyari(); } }, true));
  const tus = e => {
    const k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(k)) { e.preventDefault(); telifUyari(); }
    if (e.key === 'PrintScreen') {
      document.documentElement.classList.add('ekran-koru');
      setTimeout(() => document.documentElement.classList.remove('ekran-koru'), 2000);
      telifUyari();
    }
    if (e.key === 'Escape' && document.getElementById('telif-katman')) { e.stopPropagation(); kapat(); }
  };
  window.addEventListener('keydown', tus, true);
  window.addEventListener('keyup', tus, true);
}
