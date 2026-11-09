// DartX açılış sesleri — demirkara.com web/src/lib/ses.ts'ten BİREBİR (patlamaSesi, donmeSesi, logoSesi; Demir 09.11:
// "patlamanın sesini getirmemişsin, sadece animasyon geldi"). Web Audio ile üretilir, dosya yok.
// Tarayıcı sesi henüz açmadıysa (hiç dokunulmadıysa) sitedeki gibi sessizce atlanır.
import { data } from './store.js';

let ctx = null;
function getCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Ses bağlamını açmayı dener; tarayıcı 250 ms içinde açarsa bağlamı verir, açmazsa (izin yok) null. */
async function hazir() {
  if (data().settings.oyunSes === false) return null; // Ayarlar > Oyun sesleri kapalıysa açılış da sessiz
  const c = getCtx();
  if (!c) return null;
  if (c.state === 'running') return c;
  await Promise.race([c.resume().catch(() => {}), new Promise(r => setTimeout(r, 250))]);
  return c.state === 'running' ? c : null;
}

/** Beyaz gürültü kaynağı (rüzgâr/whoosh için) */
function gurultu(c, sure) {
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * sure), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  s.buffer = b;
  return s;
}

/** Atom patlarken: yumuşak, aşağıdan yukarı açılan hava akımı + derin bir nefes */
export async function patlamaSesi() {
  const c = await hazir();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const n = gurultu(c, 1.6);
  const f = c.createBiquadFilter();
  f.type = 'bandpass'; f.Q.value = 0.9;
  f.frequency.setValueAtTime(220, t);
  f.frequency.exponentialRampToValueAtTime(2600, t + 0.9);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  n.connect(f); f.connect(g); g.connect(c.destination);
  n.start(t); n.stop(t + 1.6);
  // alttan derin gövde
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(110, t + 1);
  const og = c.createGain();
  og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.06, t + 0.15); og.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  o.connect(og); og.connect(c.destination); o.start(t); o.stop(t + 1.35);
}

/** Küre dönerken: ince, ışıltılı yıldız tozu (rastgele yüksek çan pırıltıları) */
export async function donmeSesi(sure = 1.2) {
  const c = await hazir();
  if (!c) return;
  const t0 = c.currentTime + 0.02;
  const nota = [1318.5, 1568, 1975.5, 2349.3, 2637]; // Mi6 Sol6 Si6 Re7 Mi7 — mi minör pentatonik pırıltı
  const adet = 14;
  for (let i = 0; i < adet; i++) {
    const t = t0 + (i / adet) * sure + Math.random() * 0.05;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.value = nota[Math.floor(Math.random() * nota.length)];
    const g = c.createGain();
    const tepe = 0.012 + Math.random() * 0.012;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(tepe, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    const p = c.createStereoPanner(); p.pan.value = Math.random() * 1.6 - 0.8;
    o.connect(g); g.connect(p); p.connect(c.destination); o.start(t); o.stop(t + 0.65);
  }
}

/** Yıldızlar logoya akarken: yükselen yumuşak süpürme */
export async function logoSesi() {
  const c = await hazir();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const n = gurultu(c, 1.4);
  const f = c.createBiquadFilter(); f.type = 'highpass';
  f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(6000, t + 1.2);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 1.0); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);
  n.connect(f); f.connect(g); g.connect(c.destination); n.start(t); n.stop(t + 1.4);
  /* sondaki akor (dırınt) kaldırıldı — Demir, 13.10 (sitedeki gibi) */
}

/** Dokunuş anında çağrılır: tarayıcının ses bağlamını açar */
export function sesiAc() { getCtx(); }

// İlk dokunuşta açılış ses bağlamı da uyansın (tablet/telefon)
function acilisKilit() { const c = getCtx(); if (c && c.state === 'running') ['pointerdown', 'touchend'].forEach(o => removeEventListener(o, acilisKilit, true)); }
['pointerdown', 'touchend'].forEach(o => addEventListener(o, acilisKilit, true));

/** Dart uçuşu (Demir 09.11): kısa, yükselen hava sesi */
export async function dartUcusSesi(sure = 0.42) {
  const c = await hazir();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const n = gurultu(c, sure + 0.05);
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
  f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(3200, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + sure * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + sure + 0.04);
  n.connect(f).connect(g).connect(c.destination);
  n.start(t); n.stop(t + sure + 0.06);
}

/** Dart saplanması: tok "tak" — kısa tahta vuruşu + alçak gövde sesi */
export async function dartVurusSesi() {
  const c = await hazir();
  if (!c) return;
  const t = c.currentTime + 0.005;
  const n = gurultu(c, 0.09);
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 2.2;
  const g = c.createGain(); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  n.connect(f).connect(g).connect(c.destination); n.start(t); n.stop(t + 0.09);
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.22);
  const g2 = c.createGain(); g2.gain.setValueAtTime(0.75, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  o.connect(g2).connect(c.destination); o.start(t); o.stop(t + 0.28);
}
