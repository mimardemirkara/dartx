// DartX kamera — telefon (kamera) ile tablet (skor ekranı) arasında İNTERNETSİZ bağlantı.
// WebRTC veri kanalı; aynı Wi-Fi ya da telefonun hotspot'u yeterli, sunucu yok.
// Eşleştirme iki QR ile: tablet "teklif" gösterir → telefon okur; telefon "cevap" gösterir → tablet okur.

const ON = 'DX1.';

async function sikistir(metin) {
  try {
    if (typeof CompressionStream === 'undefined') throw 0;
    const s = new Blob([metin]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const b = new Uint8Array(await new Response(s).arrayBuffer());
    let ikili = ''; b.forEach(x => { ikili += String.fromCharCode(x); });
    return 'z' + btoa(ikili).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) { return 'j' + btoa(unescape(encodeURIComponent(metin))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
}
async function ac(kod) {
  const tur = kod[0], b64 = kod.slice(1).replace(/-/g, '+').replace(/_/g, '/');
  const ikili = atob(b64 + '==='.slice((b64.length + 3) % 4));
  if (tur === 'j') return decodeURIComponent(escape(ikili));
  const b = Uint8Array.from(ikili, c => c.charCodeAt(0));
  const s = new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return await new Response(s).text();
}
// SDP'den gereksiz satırlar atılır (QR küçük kalsın)
const sade = sdp => sdp.split('\r\n').filter(l => l && !/^a=(extmap|rtcp-fb|ssrc|msid|fmtp|rtpmap)/.test(l)).join('\r\n') + '\r\n';

async function topla(pc) { // ICE adayları toplanana kadar bekle (en çok 3 sn)
  if (pc.iceGatheringState === 'complete') return;
  await new Promise(r => {
    const t = setTimeout(r, 3000);
    pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); r(); } });
  });
}
export const paketle = async (tur, sdp) => ON + await sikistir(JSON.stringify({ t: tur, s: sade(sdp) }));
export async function coz(kod) {
  if (!kod || !kod.startsWith(ON)) throw new Error('Bu bir DartX QR kodu değil');
  return JSON.parse(await ac(kod.slice(ON.length)));
}

function kanalBagla(dc, olay) {
  dc.onopen = () => olay.durum && olay.durum('bagli');
  dc.onclose = () => olay.durum && olay.durum('koptu');
  dc.onmessage = e => { try { olay.mesaj && olay.mesaj(JSON.parse(e.data)); } catch (er) { /* yok say */ } };
}
const yeniPc = () => new RTCPeerConnection({ iceServers: [] }); // yalnız yerel ağ

/** Tablet: teklif oluşturur. Döner: { qr, tamamla(cevapQr), gonder(obj), kapat() } */
export async function tabletBaslat(olay = {}) {
  const pc = yeniPc(), dc = pc.createDataChannel('dartx');
  kanalBagla(dc, olay);
  pc.onconnectionstatechange = () => { if (['failed', 'disconnected'].includes(pc.connectionState)) olay.durum && olay.durum('koptu'); };
  await pc.setLocalDescription(await pc.createOffer());
  await topla(pc);
  return {
    qr: await paketle('teklif', pc.localDescription.sdp),
    async tamamla(kod) {
      const c = await coz(kod); if (c.t !== 'cevap') throw new Error('Telefonun cevap kodu bekleniyordu');
      await pc.setRemoteDescription({ type: 'answer', sdp: c.s });
    },
    gonder: o => { if (dc.readyState === 'open') dc.send(JSON.stringify(o)); },
    kapat: () => pc.close(),
  };
}

/** Telefon: tabletin teklifini okur, cevap üretir. Döner: { qr, gonder(obj), kapat() } */
export async function telefonBagla(teklifKod, olay = {}) {
  const c = await coz(teklifKod); if (c.t !== 'teklif') throw new Error('Tabletteki eşleştirme kodu bekleniyordu');
  const pc = yeniPc(); let dc = null;
  pc.ondatachannel = e => { dc = e.channel; kanalBagla(dc, olay); };
  pc.onconnectionstatechange = () => { if (['failed', 'disconnected'].includes(pc.connectionState)) olay.durum && olay.durum('koptu'); };
  await pc.setRemoteDescription({ type: 'offer', sdp: c.s });
  await pc.setLocalDescription(await pc.createAnswer());
  await topla(pc);
  return {
    qr: await paketle('cevap', pc.localDescription.sdp),
    gonder: o => { if (dc && dc.readyState === 'open') dc.send(JSON.stringify(o)); },
    kapat: () => pc.close(),
  };
}

// ---------- QR çizme / okuma (js/vendor: qrcode-generator, jsQR — MIT) ----------
function betikYukle(src, ad) {
  if (window[ad]) return Promise.resolve(window[ad]);
  return new Promise((r, h) => { const s = document.createElement('script'); s.src = src; s.onload = () => r(window[ad]); s.onerror = h; document.head.appendChild(s); });
}
const kok = new URL('../../', import.meta.url).href;
export async function qrSvg(metin) {
  const qrcode = await betikYukle(kok + 'js/vendor/qrcode.js', 'qrcode');
  const q = qrcode(0, 'L'); q.addData(metin); q.make();
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}
/** Kamera görüntüsünde QR arar; bulunca metni döner. dur() ile iptal edilir */
export function qrOku(video, bulundu) {
  let bitti = false;
  const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
  betikYukle(kok + 'js/vendor/jsQR.js', 'jsQR').then(jsQR => {
    const tara = () => {
      if (bitti) return;
      if (video.videoWidth) {
        const w = Math.min(960, video.videoWidth), h = Math.round(w * video.videoHeight / video.videoWidth);
        c.width = w; c.height = h; x.drawImage(video, 0, 0, w, h);
        const s = jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
        if (s && s.data && s.data.startsWith(ON)) { bitti = true; bulundu(s.data); return; }
      }
      setTimeout(tara, 200);
    };
    tara();
  });
  return { dur() { bitti = true; } };
}
