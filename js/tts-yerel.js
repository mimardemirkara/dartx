// Android uygulamasında (Capacitor) web görünümünün okuma sesi güvenilir değil (Demir 11.11):
// telefonun kendi okuyucusu (@capacitor-community/text-to-speech) speechSynthesis gibi sarılır.
// Tarayıcıda ve iPhone'da hiçbir şey yapmaz; oralarda speechSynthesis zaten var.
const C = typeof window !== 'undefined' ? window.Capacitor : null;
const android = !!(C && C.getPlatform && C.getPlatform() === 'android');
const T = android ? (C.registerPlugin ? C.registerPlugin('TextToSpeech') : C.Plugins && C.Plugins.TextToSpeech) : null;

if (T) {
  class Soz {
    constructor(text) { this.text = text; this.lang = 'en-GB'; this.rate = 1; this.pitch = 1; this.volume = 1; this.voice = null; this.onend = null; this.onerror = null; }
  }
  const yerel = {
    speak(u) {
      // Android hızı: 1 = normal; web'deki 1.1–1.25 biraz hızlı gelir, yumuşatılır
      T.speak({ text: u.text, lang: u.lang, rate: Math.min(1.6, Math.max(0.5, u.rate * 0.9)), pitch: u.pitch, volume: u.volume, category: 'playback' })
        .then(() => { u.onend && u.onend(); })
        .catch(() => { u.onerror && u.onerror(); });
    },
    cancel() { T.stop().catch(() => {}); },
    getVoices: () => [],
    addEventListener() {},
  };
  try {
    Object.defineProperty(window, 'speechSynthesis', { value: yerel, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Soz, configurable: true });
  } catch (e) { /* tanımlanamazsa okuma sessiz kalır */ }
}
