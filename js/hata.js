// DartX — hata kaydı ve "Hata bildir" (Demir 11.11). Hiçbir şey kendiliğinden gönderilmez:
// hatalar yalnız cihazda tutulur (son 20); kullanıcı isterse e-postasına eklenir ve kendisi gönderir.
import { DERLEME } from './derleme.js';

const ANAHTAR = 'dartx.hatalar';
const EN_COK = 20;
let yazanGorunum = () => '';

function oku() { try { return JSON.parse(localStorage.getItem(ANAHTAR) || '[]'); } catch (e) { return []; } }
function yaz(l) { try { localStorage.setItem(ANAHTAR, JSON.stringify(l.slice(-EN_COK))); } catch (e) { /* depo dolu: yok say */ } }

export function hataKaydet(tur, mesaj, yer) {
  const m = String(mesaj || '').slice(0, 300);
  if (!m || /ResizeObserver loop/.test(m)) return; // tarayıcının zararsız uyarısı
  const l = oku(), son = l[l.length - 1];
  if (son && son.m === m && Date.now() - son.t < 5000) { son.n = (son.n || 1) + 1; yaz(l); return; } // aynı hata art arda: sayaç
  l.push({ t: Date.now(), tur, m, y: String(yer || '').slice(0, 160), d: DERLEME, v: yazanGorunum() });
  yaz(l);
}

/** Uygulama açılışta bir kez: tüm yakalanmamış hatalar kaydedilir */
export function hataKur(gorunum) {
  if (gorunum) yazanGorunum = gorunum;
  addEventListener('error', e => hataKaydet('hata', e.message || (e.error && e.error.message), e.filename ? `${e.filename.split('/').pop()}:${e.lineno}:${e.colno}` : (e.target && e.target.src) || ''));
  addEventListener('unhandledrejection', e => { const r = e.reason; hataKaydet('söz', r && (r.message || r), r && r.stack ? r.stack.split('\n')[1] : ''); });
}

export const hataSayisi = () => oku().length;
export function hatalariSil() { try { localStorage.removeItem(ANAHTAR); } catch (e) { /* yok say */ } }

/** E-posta gövdesi: kullanıcının yazdığı + cihaz bilgisi + son hatalar (mailto uzunluk sınırı için kısa) */
export function raporMetni(not) {
  const l = oku().slice(-8).reverse();
  const cihaz = [
    `Derleme: ${DERLEME}`,
    `Ekran: ${screen.width}x${screen.height} · pencere ${innerWidth}x${innerHeight}`,
    `Cihaz: ${navigator.userAgent.replace(/\s+/g, ' ').slice(0, 180)}`,
    `Dil: ${document.documentElement.lang || '-'}`,
  ].join('\n');
  const hatalar = l.length
    ? l.map(h => `• ${new Date(h.t).toLocaleString('tr-TR')} [${h.v || '-'}] ${h.m}${h.n > 1 ? ` (×${h.n})` : ''}${h.y ? ' @ ' + h.y : ''}`).join('\n')
    : '(kayıtlı hata yok)';
  return `${(not || '').trim() || '(açıklama yok)'}\n\n— — —\n${cihaz}\n\nSon hatalar:\n${hatalar}`.slice(0, 1800);
}
