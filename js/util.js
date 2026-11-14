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
// Demir 11.11: Türkçede yüzde başta (%27), ondalık virgülle (58,6); İngilizcede 27% ve 58.6
const trMi = () => (document.documentElement.lang || 'tr').startsWith('tr');
export const ondalik = (n, b = 1) => { const s = Number(n).toFixed(b); return trMi() ? s.replace('.', ',') : s; };
export const yuzde = n => (trMi() ? '%' + n : n + '%');
export const fmt1 = n => (Number.isFinite(n) ? ondalik(n) : '–');
export const pct = (a, b) => (b ? yuzde(Math.round((a / b) * 100)) : '–');

// Demir 14.11: ada göre özel resim yok (eskiden Demir / Kenan / Tuncay adına karakter resmi çıkıyordu). Herkes gibi:
// üye olup profil fotoğrafını ekleyen oyuncunun fotoğrafı görünür; misafir oyuncular baş harfle.
let fotoBul = () => '';
export const fotoBulKur = f => { fotoBul = f; };
export function adResim(ad) { return fotoBul(ad) || ''; }
// DartBot (Demir 10.11): renk noktası yerine oyuncunun renginde robot simgesi
export const botMu = ad => String(ad || '').trim().split(/\s+/)[0].toLocaleLowerCase('tr') === 'dartbot';
const BOT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
export const botAvatar = (cls = 'ad-av') => `<span class="${cls} bot-av">${BOT_SVG}</span>`;
export const adAvatar = (ad, cls = 'ad-av') => { if (botMu(ad)) return botAvatar(cls); const r = adResim(ad); return r ? `<img class="${cls}" src="${r}" alt="">` : ''; };
