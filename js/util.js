// DartX — küçük yardımcılar
export const dartValue = d => (d.n === 0 ? 0 : d.n * d.m);

export function dartLabel(d) {
  if (!d) return '';
  if (d.n === 0) return 'Iska';
  if (d.n === 25) return d.m === 2 ? 'Bull' : '25';
  return (d.m === 3 ? 'T' : d.m === 2 ? 'D' : '') + d.n;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const sum = a => a.reduce((x, y) => x + y, 0);
export const fmt1 = n => (Number.isFinite(n) ? n.toFixed(1) : '–');
export const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '–');

// Demir ve Kenan istisnası (Demir 09.11): adı (ilk kelimesi) Demir / Kenan olan oyuncunun yanında kendi avatarı
export function adResim(ad) {
  const k = String(ad || '').trim().split(/\s+/)[0].toLocaleLowerCase('tr');
  return k === 'demir' || k === 'kenan' || k === 'tuncay' ? `img/karakter/${k}-avatar.webp` : '';
}
// DartBot (Demir 10.11): renk noktası yerine oyuncunun renginde robot simgesi
export const botMu = ad => String(ad || '').trim().split(/\s+/)[0].toLocaleLowerCase('tr') === 'dartbot';
const BOT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
export const botAvatar = (cls = 'ad-av') => `<span class="${cls} bot-av">${BOT_SVG}</span>`;
export const adAvatar = (ad, cls = 'ad-av') => { if (botMu(ad)) return botAvatar(cls); const r = adResim(ad); return r ? `<img class="${cls}" src="${r}" alt="">` : ''; };
