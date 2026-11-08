// DartX — sesler (Demir 09.11: tuş sesleri + oyun sesleri)
// Ses dosyası yok: hepsi Web Audio ile anında üretilir (internetsiz, uygulama büyümez).
// iPhone'da sessiz düğmesi açıksa ses çıkmaz (telefonun kendi kuralı). İlk dokunuşta ses motoru uyanır.
import { data } from './store.js';

let ctx = null, ana = null;
function motor() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    ana = ctx.createGain(); ana.gain.value = 0.55; ana.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Tek nota: dalga, frekans (başlangıç → bitiş), süre, ses yüksekliği, gecikme
function nota({ dalga = 'sine', f = 440, f2 = null, sure = 0.12, vol = 0.5, gec = 0, atak = 0.004 }) {
  const c = motor(); if (!c) return;
  const t0 = c.currentTime + gec;
  const o = c.createOscillator(), g = c.createGain();
  o.type = dalga;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + sure);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + atak);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);
  o.connect(g); g.connect(ana);
  o.start(t0); o.stop(t0 + sure + 0.02);
}

// Kısa gürültü patlaması (okun tahtaya saplanma "tok"u için)
let gurultuTampon = null;
function gurultu({ sure = 0.05, vol = 0.4, gec = 0, suzgec = 1800 }) {
  const c = motor(); if (!c) return;
  if (!gurultuTampon) {
    gurultuTampon = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
    const d = gurultuTampon.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + gec;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = gurultuTampon;
  f.type = 'bandpass'; f.frequency.value = suzgec; f.Q.value = 0.9;
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);
  s.connect(f); f.connect(g); g.connect(ana);
  s.start(t0); s.stop(t0 + sure + 0.02);
}

const tusAcik = () => data().settings.tusSes !== false;
const oyunAcik = () => data().settings.oyunSes !== false;

// ---- tuş sesi: kısa, yumuşak tık
export function tus() {
  if (!tusAcik()) return;
  nota({ dalga: 'triangle', f: 1350, f2: 900, sure: 0.045, vol: 0.22 });
}

// ---- oyun sesleri
const SES = {
  // ok saplandı: tahta "tok" + çarpana göre yükselen ton (tekli / double / triple)
  isabet(m = 1) {
    gurultu({ sure: 0.045, vol: 0.5, suzgec: 2200 });
    nota({ dalga: 'sine', f: 180, f2: 90, sure: 0.09, vol: 0.45 });
    if (m === 2) nota({ dalga: 'triangle', f: 880, sure: 0.14, vol: 0.18, gec: 0.03 });
    if (m === 3) { nota({ dalga: 'triangle', f: 1046, sure: 0.12, vol: 0.18, gec: 0.03 }); nota({ dalga: 'triangle', f: 1568, sure: 0.16, vol: 0.15, gec: 0.09 }); }
  },
  bull(m = 1) {
    gurultu({ sure: 0.045, vol: 0.5, suzgec: 2200 });
    nota({ dalga: 'sine', f: 180, f2: 90, sure: 0.09, vol: 0.45 });
    nota({ dalga: 'sine', f: m === 2 ? 1318 : 988, sure: 0.35, vol: 0.22, gec: 0.03 });
    if (m === 2) nota({ dalga: 'sine', f: 1976, sure: 0.4, vol: 0.12, gec: 0.08 });
  },
  iska() { nota({ dalga: 'sine', f: 140, f2: 70, sure: 0.16, vol: 0.35 }); gurultu({ sure: 0.08, vol: 0.18, suzgec: 500 }); },
  sira() { nota({ dalga: 'sine', f: 660, sure: 0.09, vol: 0.18 }); nota({ dalga: 'sine', f: 880, sure: 0.12, vol: 0.16, gec: 0.08 }); },
  bust() { nota({ dalga: 'sawtooth', f: 220, f2: 110, sure: 0.32, vol: 0.2 }); nota({ dalga: 'square', f: 165, f2: 82, sure: 0.34, vol: 0.08, gec: 0.02 }); },
  leg() { [523, 659, 784, 1046].forEach((f, i) => nota({ dalga: 'triangle', f, sure: 0.22, vol: 0.22, gec: i * 0.09 })); },
  mac() {
    [523, 659, 784].forEach((f, i) => nota({ dalga: 'triangle', f, sure: 0.18, vol: 0.22, gec: i * 0.11 }));
    [1046, 1318, 1568].forEach(f => nota({ dalga: 'triangle', f, sure: 0.7, vol: 0.14, gec: 0.36 }));
  },
  yuzseksen() {
    [784, 988, 1175, 1568].forEach((f, i) => nota({ dalga: 'square', f, sure: 0.16, vol: 0.09, gec: i * 0.07 }));
    nota({ dalga: 'triangle', f: 2093, sure: 0.6, vol: 0.14, gec: 0.3 });
  },
  // sevinç: parlak yükselen arpej + yıldız tozu pırıltısı (demirkara.com donmeSesi notaları)
  kutlama() {
    [659, 784, 988, 1318].forEach((f, i) => nota({ dalga: 'triangle', f, sure: 0.2, vol: 0.2, gec: i * 0.07 }));
    const parilti = [1318.5, 1568, 1975.5, 2349.3, 2637];
    for (let i = 0; i < 10; i++) nota({ dalga: 'sine', f: parilti[Math.floor(Math.random() * parilti.length)], sure: 0.5, vol: 0.05 + Math.random() * 0.04, gec: 0.28 + i * 0.06 + Math.random() * 0.03 });
  },
  // KILLER oldun: alçak, tok iki vuruş + yükselen ton
  killer() { nota({ dalga: 'sawtooth', f: 110, sure: 0.18, vol: 0.16 }); nota({ dalga: 'sawtooth', f: 110, sure: 0.18, vol: 0.16, gec: 0.2 }); nota({ dalga: 'square', f: 220, f2: 440, sure: 0.4, vol: 0.08, gec: 0.38 }); },
  // elendi / yarıya indi: aşağı kayan üzgün ton
  dusus() { nota({ dalga: 'triangle', f: 523, f2: 392, sure: 0.2, vol: 0.18 }); nota({ dalga: 'triangle', f: 392, f2: 262, sure: 0.35, vol: 0.16, gec: 0.18 }); },
  geri() { nota({ dalga: 'sine', f: 700, f2: 420, sure: 0.12, vol: 0.2 }); },
  hata() { nota({ dalga: 'square', f: 200, sure: 0.12, vol: 0.08 }); },
};
export function oyun(ad, ...arg) {
  if (!oyunAcik() || !SES[ad]) return;
  SES[ad](...arg);
}

// Ayarlarda deneme sesi (anahtar açılınca)
export function dene(hangi) { if (hangi === 'tusSes') tus(); else oyun('isabet', 3); }

// iOS / Android: ses motoru ancak bir dokunuşla uyanır — ilk dokunuşta hazırla
document.addEventListener('pointerdown', () => { if (tusAcik() || oyunAcik()) motor(); }, { once: true, capture: true });

// ---- Ses kilidi (Demir 09.11: "tablette sesler çalışmıyor"): tablet/telefon tarayıcıları sesi yalnız bir dokunuşun
// içinde açmaya izin verir. İlk dokunuşta ses motoru uyanır, sessiz bir an çalınır; iPhone/iPad'de (iOS 17+) sessiz
// düğmesine rağmen oyun sesleri duyulsun diye ses oturumu "playback" yapılır.
function kilidiAc() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* eski sürüm */ }
  const c = motor(); if (!c) return;
  try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) { /* yok say */ }
  if (c.state === 'running') ['pointerdown', 'touchend', 'keydown'].forEach(o => removeEventListener(o, kilidiAc, true));
}
['pointerdown', 'touchend', 'keydown'].forEach(o => addEventListener(o, kilidiAc, true));
