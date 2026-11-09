// DartX — cihazda veri saklama (localStorage)
// ?k=... ayrı veri alanı (önizleme sayfasında telefon ve tablet birbirini etkilemesin)
const KEY = 'dartx.v1' + (new URLSearchParams(location.search).get('k') ? '.' + new URLSearchParams(location.search).get('k') : '');

const COLORS = ['#e94b3c', '#2fb36d', '#3d8bfd', '#f5b82e', '#b45cf0', '#1fc7c7', '#ff7a2f', '#ec5aa5', '#8bc34a', '#a1887f', '#5c6bc0', '#c0ca33'];

function blank() {
  return {
    version: 1,
    players: [],      // {id, name, color, created}
    history: [],      // biten maçlar
    current: null,    // devam eden maç
    ara: [],          // ara verilmiş maçlar (en yeni başta; current ile birlikte en fazla 5)
    settings: { vibrate: true, keepAwake: true, x01Input: 'darts', theme: 'auto' },
    lastSetup: {},    // oyun başına son ayarlar
  };
}

let db = load();
// 08.11: eski "minnesota" kayıtları Türk Kriketi'ydi → yeni kimliği "turk" (yeni minnesota = dünyadaki Minnesota Kriket)
if (!db.gocTurk) {
  const cevir = m => { if (m && m.gameId === 'minnesota') m.gameId = 'turk'; };
  cevir(db.current); (db.history || []).forEach(cevir);
  if (db.lastSetup && db.lastSetup.minnesota) { db.lastSetup.turk = db.lastSetup.minnesota; delete db.lastSetup.minnesota; }
  db.gocTurk = 1;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* yer yoksa sessiz geç */ }
}

// Demir 09.11: iki oyuncunun rengi asla aynı olmasın — çakışan (sonradan eklenen) oyuncuya boştaki renk verilir
function renkleriAyir() {
  const kullanilan = new Set(); let degisti = false;
  for (const p of db.players) {
    if (!kullanilan.has(p.color)) { kullanilan.add(p.color); continue; }
    const yeni = COLORS.find(c => !kullanilan.has(c));
    if (!yeni) continue; // 12'den fazla oyuncuda tekrar kaçınılmaz
    p.color = yeni; kullanilan.add(yeni); degisti = true;
  }
  return degisti;
}
if (renkleriAyir()) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* sessiz */ } }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    return Object.assign(blank(), JSON.parse(raw));
  } catch (e) {
    console.error('DartX veri okunamadı', e);
    return blank();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    console.error('DartX kaydedilemedi', e);
    // tarayıcı kutusu yerine uygulamanın kendi penceresi (app.js dinler)
    window.dispatchEvent(new CustomEvent('dartx-uyari', { detail: 'Kayıt alanı doldu. Ayarlar > Yedek al ile yedekleyip eski maçları silebilirsin.' }));
  }
}

export const data = () => db;

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---- Oyuncular
export function addPlayer(name) {
  const used = new Set(db.players.map(p => p.color));
  const color = COLORS.find(c => !used.has(c)) || COLORS[db.players.length % COLORS.length];
  const p = { id: uid(), name: name.trim(), color, created: Date.now() };
  db.players.push(p);
  save();
  return p;
}
export function updatePlayer(id, patch) {
  const p = db.players.find(x => x.id === id);
  if (p) {
    // seçilen renk başkasındaysa ikisi yer değiştirir (aynı renk iki kişide olmaz)
    const diger = patch.color && db.players.find(x => x.id !== id && x.color === patch.color);
    if (diger) diger.color = p.color;
    Object.assign(p, patch);
  }
  save();
}
export function removePlayer(id) {
  db.players = db.players.filter(p => p.id !== id);
  save();
}
export const player = id => db.players.find(p => p.id === id) || { id, name: 'Silinmiş', color: '#777' };
export const COLOR_LIST = COLORS;

// ---- Maç
// Demir 10.11: en fazla 5 yarım maç — biri "current", diğerleri "ara" listesinde (en yeni başta)
export const ARA_SINIR = 5;
if (!Array.isArray(db.ara)) db.ara = [];
function parkla(m) {
  if (!m || m.done) return;
  db.ara = [m, ...db.ara.filter(x => x.id !== m.id)].slice(0, ARA_SINIR - 1);
}
export function setCurrent(match) {
  if (match && db.current && db.current.id !== match.id) parkla(db.current);
  db.current = match; save();
}
/** Yeni maç başlarsa silinecek en eski yarım maç (yoksa null) */
export function silinecekAra() {
  return db.current && !db.current.done && db.ara.length >= ARA_SINIR - 1 ? db.ara[db.ara.length - 1] : null;
}
/** Listeden bir maça dön: o maç current olur, şimdiki listeye girer */
export function araDevam(id) {
  const m = db.ara.find(x => x.id === id); if (!m) return null;
  db.ara = db.ara.filter(x => x.id !== id);
  parkla(db.current); db.current = m; save(); return m;
}
export function araSil(id) { db.ara = db.ara.filter(x => x.id !== id); save(); }
/** current boşsa listedeki en yeni maç büyük karta çıkar */
export function araYukari() {
  if (!db.current && db.ara.length) { db.current = db.ara.shift(); save(); }
}
export function finishCurrent() {
  if (db.current) {
    delete db.current.hesap; // maçın hesap makineleri maçla biter
    db.history.unshift(db.current);
    db.current = null;
    save();
  }
}
export function removeHistory(id) {
  db.history = db.history.filter(m => m.id !== id);
  save();
}

// ---- Yedek
export function exportJSON() {
  return JSON.stringify(db, null, 1);
}
export function importJSON(text) {
  const obj = JSON.parse(text);
  if (!obj || !Array.isArray(obj.players) || !Array.isArray(obj.history)) throw new Error('Geçersiz yedek dosyası');
  db = Object.assign(blank(), obj);
  save();
}
export function resetAll() {
  db = blank();
  save();
}
