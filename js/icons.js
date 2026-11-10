// DartX — oyun simgeleri. demirkara.com Simgeler.tsx tarifi: 100×100 karo, kendi degrade zemini,
// üstünde oyunun kendi nesnesi (1–3 katman), nesnelerin altında yumuşak gölge.
// Karonun yansıması ve kenar ışığı CSS'te (.simge::before / ::after).

const P = id => 'dx' + id;
const n2 = v => v.toFixed(2);

// ── Ortak parçalar
function tahta(k, cx, cy, r) {
  // Gerçek dart tahtası: 20 dilim, triple ve double halkası, bull
  const sira = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  let s = `<circle cx="${cx}" cy="${cy}" r="${r + 3.2}" fill="#1a1a1a" filter="url(#${k}s)"/>`;
  const dilim = (r0, r1, i, renk) => {
    const a0 = ((i * 18 - 9 - 90) * Math.PI) / 180, a1 = ((i * 18 + 9 - 90) * Math.PI) / 180;
    const p = (rr, a) => `${n2(cx + rr * Math.cos(a))},${n2(cy + rr * Math.sin(a))}`;
    return `<path d="M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z" fill="${renk}"/>`;
  };
  sira.forEach((_, i) => {
    const koyu = i % 2 === 0;
    const zem = koyu ? '#1d1d1d' : '#efe3c4';
    const hal = koyu ? '#d8262c' : '#1d9a4a';
    s += dilim(r * .16, r * .58, i, zem) + dilim(r * .58, r * .66, i, hal) + dilim(r * .66, r * .9, i, zem) + dilim(r * .9, r, i, hal);
  });
  s += `<circle cx="${cx}" cy="${cy}" r="${r * .16}" fill="#1d9a4a"/><circle cx="${cx}" cy="${cy}" r="${r * .075}" fill="#d8262c"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#c9c9c9" stroke-width=".6" opacity=".7"/>`;
  return s;
}
function ok(k, x, y, aci, boy = 1, kanat = '#e0742c') {
  // Saplı dart: (x,y) ucu, aci derece (uçtan geriye doğru)
  return `<g transform="translate(${x} ${y}) rotate(${aci}) scale(${boy})" filter="url(#${k}s)">
    <path d="M0 0 L9 -1 L9 1 Z" fill="#dfe3e8"/>
    <rect x="9" y="-2.6" width="14" height="5.2" rx="2.4" fill="url(#${k}bar)"/>
    <path d="M12 -2.6v5.2M14.5 -2.6v5.2M17 -2.6v5.2M19.5 -2.6v5.2" stroke="#7a3f12" stroke-width=".7" opacity=".55"/>
    <rect x="23" y="-1.1" width="9" height="2.2" rx="1" fill="#2b2b2f"/>
    <path d="M30 0 L40 -9 L43 -8 L37 0 L43 8 L40 9 Z" fill="${kanat}"/>
    <path d="M30 0 L41 -1.3 L41 1.3 Z" fill="${kanat}" opacity=".7"/>
  </g>`;
}
const bar = k => `<linearGradient id="${k}bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b37a"/><stop offset=".5" stop-color="#c8642a"/><stop offset="1" stop-color="#7d3510"/></linearGradient>`;
const yazi = (x, y, t, boy, renk = '#fff', agirlik = 800) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${boy}" font-weight="${agirlik}" fill="${renk}" font-family="-apple-system, 'SF Pro Display', system-ui, sans-serif">${t}</text>`;
const etiket = (k, x, y, t, zemin = '#fff', renk = '#222') =>
  `<g filter="url(#${k}s)"><rect x="${x - 15}" y="${y - 9}" width="30" height="15" rx="7.5" fill="${zemin}"/>${yazi(x, y + 2.5, t, 10, renk)}</g>`;
function kara(k, renk = '#25302a') {
  return `<rect x="12" y="20" width="76" height="60" rx="6" fill="#a8743a" filter="url(#${k}s)"/>
    <rect x="16" y="24" width="68" height="52" rx="3" fill="${renk}"/>
    <path d="M18 28 L40 26" stroke="#fff" stroke-opacity=".08" stroke-width="6"/>`;
}
const tebesir = 'stroke="#f4f1e8" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".92"';
function hedef(k, cx, cy, r, renkler) {
  return renkler.map((c, i) => `<circle cx="${cx}" cy="${cy}" r="${n2(r * (1 - i / renkler.length))}" fill="${c}" ${i === 0 ? `filter="url(#${k}s)"` : ''}/>`).join('');
}

// ── Simgeler
const C = {
  x01: { z: ['#ff6b5e', '#c81e14'], g: k => tahta(k, 47, 53, 31) + ok(k, 47, 30, -40, .95) + etiket(k, 76, 84, '501') },

  cricket: {
    z: ['#7fe39a', '#138a3e'],
    g: k => kara(k) +
      `<g font-family="system-ui,sans-serif" font-weight="700" font-size="11" fill="#f4f1e8" opacity=".92"><text x="22" y="40">20</text><text x="22" y="56">19</text><text x="22" y="72">18</text></g>
       <path d="M48 31 L56 41" ${tebesir}/>
       <path d="M48 47 L56 57 M56 47 L48 57" ${tebesir}/>
       <path d="M48 63 L56 73 M56 63 L48 73" ${tebesir}/><circle cx="52" cy="68" r="7.5" ${tebesir}/>
       <path d="M66 63 L74 73 M74 63 L66 73" ${tebesir}/><circle cx="70" cy="68" r="7.5" ${tebesir}/>`,
  },

  cutthroat: {
    z: ['#9a6bd8', '#3f1a7a'],
    g: k => kara(k, '#2a2633') +
      `<path d="M24 36 L32 46 M32 36 L24 46" ${tebesir}/><circle cx="28" cy="41" r="7.5" ${tebesir}/>
       <path d="M24 56 L32 66" ${tebesir}/>
       ${yazi(52, 47, '+40', 12, '#ff7b7b')}${yazi(52, 67, '+20', 12, '#ff7b7b')}
       <g transform="rotate(-38 62 60)" filter="url(#${k}s)">
         <path d="M44 57 L84 57 L90 60 L84 63 L44 63 Z" fill="url(#${k}bl)"/>
         <path d="M44 60 L88 60" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>
         <rect x="38" y="54" width="7" height="12" rx="2" fill="#c9a24a"/>
         <rect x="24" y="56.5" width="15" height="7" rx="3.5" fill="#3a2414"/>
       </g>
       <defs><linearGradient id="${k}bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9aa3ad"/></linearGradient></defs>`,
  },

  killer: {
    z: ['#4a4a55', '#121218'],
    g: k => ok(k, 30, 30, 45 + 180, .9, '#d8262c').replace('translate(30 30)', 'translate(78 80)') + ok(k, 22, 80, -45, .9, '#d8262c').replace('translate(22 80)', 'translate(22 80)') +
      `<g filter="url(#${k}s)">
        <path d="M50 18 C31 18 22 31 22 45 C22 55 27 61 33 64 L33 73 C33 76 35 78 38 78 L62 78 C65 78 67 76 67 73 L67 64 C73 61 78 55 78 45 C78 31 69 18 50 18Z" fill="url(#${k}kf)"/>
       </g>
       <ellipse cx="39" cy="46" rx="7.5" ry="8.5" fill="#1b1b22"/><ellipse cx="61" cy="46" rx="7.5" ry="8.5" fill="#1b1b22"/>
       <circle cx="39" cy="47" r="2" fill="#ff4d4d"/><circle cx="61" cy="47" r="2" fill="#ff4d4d"/>
       <path d="M50 54 L46 61 L54 61 Z" fill="#1b1b22"/>
       <path d="M40 69v8M45 69v9M50 69v9M55 69v9M60 69v8" stroke="#1b1b22" stroke-width="1.6"/>
       <defs><linearGradient id="${k}kf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9d6cf"/></linearGradient></defs>`,
  },

  shanghai: {
    z: ['#fff09a', '#f2b200'],
    g: k => `<defs><radialGradient id="${k}fn" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#ff7a5a"/><stop offset=".6" stop-color="#e01e1e"/><stop offset="1" stop-color="#8f0a0a"/></radialGradient></defs>
       <path d="M50 8 V16" stroke="#6b3a12" stroke-width="2"/>
       <rect x="38" y="15" width="24" height="7" rx="2" fill="#d4a12a" filter="url(#${k}s)"/>
       <ellipse cx="50" cy="48" rx="31" ry="27" fill="url(#${k}fn)" filter="url(#${k}s)"/>
       <path d="M50 21 C35 30 35 66 50 75 M50 21 C65 30 65 66 50 75 M50 21 V75 M50 21 C25 30 25 66 50 75 M50 21 C75 30 75 66 50 75" stroke="#7a0808" stroke-width="1.3" fill="none" opacity=".55"/>
       <ellipse cx="40" cy="36" rx="8" ry="5" fill="#fff" opacity=".22"/>
       <rect x="38" y="73" width="24" height="7" rx="2" fill="#d4a12a"/>
       <path d="M44 80 L44 92 M50 80 L50 94 M56 80 L56 92" stroke="#d4a12a" stroke-width="2.2" stroke-linecap="round"/>
       ${yazi(50, 54, 'S·D·T', 10, '#ffe7a3')}`,
  },

  halveit: {
    z: ['#7beee0', '#0b8a80'],
    g: k => `<circle cx="50" cy="50" r="30" fill="#fff" filter="url(#${k}s)"/>
       <path d="M50 20 A30 30 0 0 0 50 80 Z" fill="#ff9a3d"/>
       <path d="M50 20 A30 30 0 0 0 50 80" fill="none" stroke="#e8701a" stroke-width="2"/>
       <path d="M50 16 V84" stroke="#0b5f58" stroke-width="2.4" stroke-dasharray="4 3"/>
       ${yazi(66, 58, '½', 22, '#0b8a80')}`,
  },

  atc: {
    z: ['#74a8ff', '#1a4fd1'],
    g: k => `<circle cx="50" cy="51" r="32" fill="#e9eef7" filter="url(#${k}s)"/><circle cx="50" cy="51" r="28" fill="#fff"/>
       ${Array.from({ length: 12 }, (_, i) => { const a = (i * 30 * Math.PI) / 180; const r0 = i % 3 ? 24 : 22; return `<path d="M${n2(50 + r0 * Math.sin(a))} ${n2(51 - r0 * Math.cos(a))} L${n2(50 + 26 * Math.sin(a))} ${n2(51 - 26 * Math.cos(a))}" stroke="#2b3550" stroke-width="${i % 3 ? 1.4 : 2.6}" stroke-linecap="round"/>`; }).join('')}
       ${yazi(50, 37, '20', 8.5, '#2b3550')}${yazi(68, 54, '5', 8.5, '#2b3550')}${yazi(50, 72, '10', 8.5, '#2b3550')}${yazi(32, 54, '15', 8.5, '#2b3550')}
       <path d="M50 51 L50 34" stroke="#2b3550" stroke-width="3" stroke-linecap="round"/>
       ${ok(k, 50, 51, -20, .62, '#ff6b3d').replace('<path d="M0 0 L9 -1 L9 1 Z" fill="#dfe3e8"/>', '<path d="M0 0 L9 -1 L9 1 Z" fill="#dfe3e8"/>')}
       <circle cx="50" cy="51" r="3" fill="#1a4fd1"/>`,
  },

  baseball: {
    z: ['#e2b07a', '#8b5a2b'],
    g: k => `<defs><radialGradient id="${k}top" cx=".38" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcd6cb"/></radialGradient></defs>
       <circle cx="50" cy="50" r="30" fill="url(#${k}top)" filter="url(#${k}s)"/>
       <path d="M30 28 C42 40 42 60 30 72" stroke="#d8262c" stroke-width="2" fill="none"/>
       <path d="M70 28 C58 40 58 60 70 72" stroke="#d8262c" stroke-width="2" fill="none"/>
       ${[0, 1, 2, 3, 4, 5].map(i => { const y = 34 + i * 6.5; const x = 34 + Math.sin((i / 5) * Math.PI) * 4.5; return `<path d="M${n2(x - 3)} ${n2(y - 2)} L${n2(x + 3)} ${n2(y + 1)} M${n2(100 - x + 3)} ${n2(y - 2)} L${n2(100 - x - 3)} ${n2(y + 1)}" stroke="#d8262c" stroke-width="1.4" stroke-linecap="round"/>`; }).join('')}`,
  },

  countup: {
    z: ['#aab4ff', '#3540b5'],
    g: k => `<defs><linearGradient id="${k}cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd6ff"/></linearGradient><linearGradient id="${k}cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f0a417"/></linearGradient></defs>
       <rect x="20" y="58" width="14" height="22" rx="3" fill="url(#${k}cb)" filter="url(#${k}s)"/>
       <rect x="39" y="46" width="14" height="34" rx="3" fill="url(#${k}cb)" filter="url(#${k}s)"/>
       <rect x="58" y="32" width="14" height="48" rx="3" fill="url(#${k}cg)" filter="url(#${k}s)"/>
       <path d="M18 50 L38 38 L52 42 L76 20" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M68 18 L78 18 L78 28" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <rect x="16" y="80" width="68" height="3" rx="1.5" fill="#fff" opacity=".7"/>`,
  },

  gotcha: {
    z: ['#bfe3ff', '#4f9be6'],
    g: k => `<defs><linearGradient id="${k}py" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff38a"/><stop offset="1" stop-color="#ffb300"/></linearGradient></defs>
       <path d="M50 12 L58 30 L78 22 L70 41 L89 50 L70 59 L78 78 L58 70 L50 88 L42 70 L22 78 L30 59 L11 50 L30 41 L22 22 L42 30 Z" fill="url(#${k}py)" filter="url(#${k}s)"/>
       <path d="M50 12 L58 30 L78 22 L70 41 L89 50 L70 59 L78 78 L58 70 L50 88 L42 70 L22 78 L30 59 L11 50 L30 41 L22 22 L42 30 Z" fill="none" stroke="#e08a00" stroke-width="1.2"/>
       ${yazi(50, 63, '!', 38, '#d8262c', 900)}`,
  },

  bobs27: {
    z: ['#ffc070', '#e8650a'],
    g: k => `<g filter="url(#${k}s)">${tahta(k, 50, 92, 74).replace(/filter="url\([^)]*\)"/, '')}</g>
       <circle cx="50" cy="44" r="19" fill="url(#${k}cn)" filter="url(#${k}s)"/>
       <circle cx="50" cy="44" r="15" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>
       ${yazi(50, 51, '27', 19, '#7a4a05', 900)}
       <defs><linearGradient id="${k}cn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#f3c142"/><stop offset="1" stop-color="#c88a12"/></linearGradient></defs>`,
  },

  atcsolo: {
    z: ['#8ee9ff', '#0a92bd'],
    g: k => `<defs><linearGradient id="${k}kr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#aab4c0"/></linearGradient></defs>
       <rect x="44" y="10" width="12" height="9" rx="2" fill="url(#${k}kr)" filter="url(#${k}s)"/>
       <rect x="68" y="20" width="9" height="6" rx="2" fill="url(#${k}kr)" transform="rotate(40 72 23)"/>
       <circle cx="50" cy="54" r="31" fill="url(#${k}kr)" filter="url(#${k}s)"/>
       <circle cx="50" cy="54" r="26" fill="#fff"/>
       ${Array.from({ length: 12 }, (_, i) => { const a = (i * 30 * Math.PI) / 180; return `<path d="M${n2(50 + 21 * Math.sin(a))} ${n2(54 - 21 * Math.cos(a))} L${n2(50 + 24 * Math.sin(a))} ${n2(54 - 24 * Math.cos(a))}" stroke="#3a4350" stroke-width="1.6" stroke-linecap="round"/>`; }).join('')}
       <path d="M50 54 A20 20 0 0 1 67.3 44" fill="none" stroke="#0a92bd" stroke-width="4" opacity=".35"/>
       <path d="M50 54 L65 41" stroke="#e8352a" stroke-width="2.6" stroke-linecap="round"/>
       <circle cx="50" cy="54" r="3" fill="#e8352a"/>`,
  },

  co121: {
    z: ['#d2a8ff', '#7a33d6'],
    g: k => {
      let kare = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) if ((r + c) % 2 === 0) kare += `<rect x="${32 + c * 9}" y="${18 + r * 8}" width="9" height="8" fill="#1d1d22"/>`;
      return `<rect x="28" y="14" width="4" height="72" rx="2" fill="#e9e3d4" filter="url(#${k}s)"/>
       <g filter="url(#${k}s)"><path d="M32 18 C45 14 55 22 77 18 L77 50 C55 54 45 46 32 50 Z" fill="#fff"/></g>
       <clipPath id="${k}fl"><path d="M32 18 C45 14 55 22 77 18 L77 50 C55 54 45 46 32 50 Z"/></clipPath>
       <g clip-path="url(#${k}fl)">${kare}</g>
       ${etiket(k, 62, 72, '121', '#fff', '#5a1fa8')}`;
    },
  },

  catch40: {
    z: ['#d9f77a', '#5f9e0c'],
    g: k => hedef(k, 46, 54, 30, ['#ffffff', '#e8352a', '#ffffff', '#e8352a', '#ffffff', '#e8352a']) +
      ok(k, 44, 52, -35, .7, '#2f7de1') + ok(k, 49, 56, -15, .7, '#2f7de1') + ok(k, 47, 49, -55, .7, '#2f7de1') + etiket(k, 76, 84, '40', '#fff', '#3f6e08'),
  },

  bigfinish: {
    z: ['#f3d48c', '#a8742a'],
    g: k => `<defs><linearGradient id="${k}ku" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8862a"/><stop offset=".35" stop-color="#ffe9a8"/><stop offset=".6" stop-color="#f2c44c"/><stop offset="1" stop-color="#9a6a14"/></linearGradient></defs>
       <g filter="url(#${k}s)">
         <path d="M30 18 H70 V36 C70 52 61 60 50 60 C39 60 30 52 30 36 Z" fill="url(#${k}ku)"/>
         <path d="M30 24 C18 24 18 44 33 46 M70 24 C82 24 82 44 67 46" stroke="url(#${k}ku)" stroke-width="5" fill="none"/>
         <rect x="45" y="60" width="10" height="12" fill="url(#${k}ku)"/>
         <rect x="34" y="72" width="32" height="10" rx="3" fill="#5a3a12"/>
       </g>
       <rect x="38" y="74.5" width="24" height="5" rx="1" fill="#e9c46a"/>
       ${yazi(50, 43, '170', 13, '#7a4a05', 900)}
       <path d="M36 22 C36 34 38 44 44 50" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  },

  scoring: {
    z: ['#d4576b', '#7a1030'],
    g: k => `<defs><linearGradient id="${k}gs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#38d06a"/><stop offset=".5" stop-color="#ffd23a"/><stop offset="1" stop-color="#ff3b3b"/></linearGradient></defs>
       <path d="M14 66 A36 36 0 0 1 86 66 Z" fill="#fff" filter="url(#${k}s)"/>
       <path d="M22 66 A28 28 0 0 1 78 66" fill="none" stroke="url(#${k}gs)" stroke-width="7"/>
       <path d="M50 66 L74 46" stroke="#1d1d22" stroke-width="3.4" stroke-linecap="round"/>
       <circle cx="50" cy="66" r="5" fill="#1d1d22"/>
       ${yazi(50, 86, '180', 17, '#fff', 900)}`,
  },

  bull: {
    z: ['#ffffff', '#e6e1d6'],
    g: k => `<circle cx="50" cy="50" r="33" fill="#1d9a4a" filter="url(#${k}s)"/>
       <circle cx="50" cy="50" r="33" fill="none" stroke="#156f35" stroke-width="2"/>
       <circle cx="50" cy="50" r="17" fill="#d8262c"/>
       <circle cx="45" cy="45" r="5" fill="#fff" opacity=".18"/>
       ${ok(k, 51, 49, -42, .95, '#2f7de1')}`,
  },

  dtdrill: {
    z: ['#ff9be0', '#c2188a'],
    g: k => `<circle cx="50" cy="50" r="30" fill="#fff" filter="url(#${k}s)"/>
       <circle cx="50" cy="50" r="24" fill="none" stroke="#c2188a" stroke-width="2"/>
       <circle cx="50" cy="50" r="12" fill="none" stroke="#c2188a" stroke-width="1.6" opacity=".6"/>
       <path d="M50 14 V36 M50 64 V86 M14 50 H36 M64 50 H86" stroke="#2a1a24" stroke-width="3" stroke-linecap="round"/>
       <circle cx="50" cy="50" r="4.5" fill="#e8352a"/>`,
  },

  jdc: {
    z: ['#ffb3c1', '#e2456a'],
    g: k => `<defs><linearGradient id="${k}md" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#f3c142"/><stop offset="1" stop-color="#b8820e"/></linearGradient></defs>
       <path d="M30 10 L44 10 L56 44 L44 50 Z" fill="#2f5fd6" filter="url(#${k}s)"/><path d="M70 10 L56 10 L44 44 L56 50 Z" fill="#ffffff" filter="url(#${k}s)"/>
       <path d="M33 10 L41 10 L51 38" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>
       <circle cx="50" cy="62" r="23" fill="url(#${k}md)" filter="url(#${k}s)"/>
       <circle cx="50" cy="62" r="18" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.3"/>
       ${yazi(50, 67, 'JDC', 13, '#7a4a05', 900)}`,
  },
};

// ── demirkara.com Simgeler.tsx'ten BİREBİR: personeller → Oyuncular, raporlar → İstatistik, ayarlar → Ayarlar
function disli(n, R, r, cx = 50, cy = 50) {
  const p = [];
  for (let i = 0; i < n * 2; i++) {
    const a0 = (Math.PI * i) / n - Math.PI / (n * 2.6);
    const a1 = (Math.PI * i) / n + Math.PI / (n * 2.6);
    const yr = i % 2 === 0 ? R : r;
    p.push(`${n2(cx + yr * Math.cos(a0))},${n2(cy + yr * Math.sin(a0))}`, `${n2(cx + yr * Math.cos(a1))},${n2(cy + yr * Math.sin(a1))}`);
  }
  return `M${p.join(' L')} Z`;
}
C.players = {
  // Oyuncu (Demir 08.11): atış pozundaki dartçı — yandan siluet, kol kalkık, elinde dart; karşısında tahta
  z: ['#ffcf7a', '#d9822b'],
  g: k => `<defs><linearGradient id="${k}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe9cf"/></linearGradient></defs>
    ${tahta(k, 80, 34, 13)}
    <g filter="url(#${k}s)" fill="url(#${k}p)" stroke="url(#${k}p)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="30" cy="30" r="10" stroke="none"/>
      <path d="M17 92 L19 58 Q20 46 31 45 Q42 46 43 58 L45 92 Z" stroke="none"/>
      <path d="M38 52 L55 54 L55 38" fill="none" stroke-width="8"/>
    </g>
    ${ok(k, 66, 36, 180, .5)}`,
};
C.stats = {
  z: ['#acbaff', '#3a49bd'],
  g: k => `<rect x="16" y="16" width="68" height="68" rx="11" fill="#fff" filter="url(#${k}s)"/>
    <rect x="26" y="58" width="10" height="16" rx="2.5" fill="#9fb0ff"/>
    <rect x="40" y="47" width="10" height="27" rx="2.5" fill="#5f77f2"/>
    <rect x="54" y="35" width="10" height="39" rx="2.5" fill="#ff8a1a"/>
    <rect x="68" y="52" width="8" height="22" rx="2.5" fill="#c3ccff"/>
    <polyline points="31,50 45,40 59,27 72,35" fill="none" stroke="#ff6a00" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${[[31, 50], [45, 40], [59, 27], [72, 35]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff" stroke="#ff6a00" stroke-width="1.8"/>`).join('')}`,
};
C.yardim = {
  // Yardım (Demir 11.11): can simidi — rehber, destek, hata bildir tek yerde
  z: ['#6fe3b0', '#13804f'],
  g: k => `<g filter="url(#${k}s)">
      <circle cx="50" cy="50" r="31" fill="#fff"/>
      <circle cx="50" cy="50" r="14" fill="#13804f"/>
    </g>
    ${[0, 90, 180, 270].map(a => `<path d="M50 50 L${50 + 33 * Math.cos((a - 20) * Math.PI / 180)} ${50 + 33 * Math.sin((a - 20) * Math.PI / 180)} A33 33 0 0 1 ${50 + 33 * Math.cos((a + 20) * Math.PI / 180)} ${50 + 33 * Math.sin((a + 20) * Math.PI / 180)} Z" fill="#ff5a4a" opacity=".95"/>`).join('')}
    <circle cx="50" cy="50" r="14.5" fill="#1a9a62"/>
    <circle cx="50" cy="50" r="31" fill="none" stroke="rgb(0 0 0 / .12)" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="14.5" fill="none" stroke="rgb(0 0 0 / .18)" stroke-width="1.5"/>`,
};
// Hesabım (Demir 11.11, seçilen: Kart)
C.hesap = {
  // Oyuncu kartı: bakır zemin, beyaz üyelik kartı, avatar, DX şeridi, karta saplanmış dart
  z: ['#ffb37a', '#b4501a'],
  g: k => `${bar(k)}<g filter="url(#${k}s)"><rect x="15" y="26" width="70" height="50" rx="8" fill="#fff"/></g>
    <rect x="15" y="64" width="70" height="12" rx="0" fill="#f3d79b"/><rect x="15" y="68" width="70" height="8" rx="8" fill="#f3d79b"/>
    <circle cx="35" cy="45" r="11" fill="#f4e6d2"/>
    <circle cx="35" cy="42" r="4.6" fill="#c8642a"/><path d="M27.5 53 C28 47.5 31 46 35 46 C39 46 42 47.5 42.5 53 Z" fill="#c8642a"/>
    <rect x="51" y="37" width="25" height="5" rx="2.5" fill="#d8c8b2"/><rect x="51" y="46" width="17" height="4" rx="2" fill="#e8ddcd"/>
    ${yazi(50, 74, 'DX', 8, '#8a4a12')}
    ${ok(k, 74, 30, -35, .55, '#d8262c')}`,
};
C.settings = {
  z: ['#6f7684', '#262a33'],
  g: k => `<defs><linearGradient id="${k}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a9a9b4"/></linearGradient></defs>
    <path d="${disli(10, 36, 29)}" fill="url(#${k}d)" filter="url(#${k}s)"/>
    <circle cx="50" cy="50" r="20" fill="#3a3f4b"/>
    <circle cx="50" cy="50" r="16" fill="url(#${k}d)"/>
    <circle cx="50" cy="50" r="7" fill="#2b2f38"/>`,
};

C.kamera = {
  // Kamera (Beta, Demir 10.11): eski çizgi kamera aynen; turkuaz zemin, beyaz-gümüş çizgi
  z: ['#5fe0cf', '#0b7a6e'], // turkuaz: Ayarlar'ın grisinden ayrı (Demir 10.11)
  g: k => `<defs><linearGradient id="${k}gv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a9a9b4"/></linearGradient></defs>
    <g filter="url(#${k}s)" transform="translate(14 14) scale(3)" fill="none" stroke="url(#${k}gv)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
    </g>`,
};

// ── Grup (klasör) simgeleri: Ana Maçlar / Grup Oyunları / Antrenman
const kisi = (k, x, y, s, renk, renk2) => `<g filter="url(#${k}s)">
    <path d="M${x - 13 * s} ${y + 16 * s} C${x - 13 * s} ${y + 4 * s} ${x - 7 * s} ${y} ${x} ${y} C${x + 7 * s} ${y} ${x + 13 * s} ${y + 4 * s} ${x + 13 * s} ${y + 16 * s} Z" fill="${renk2}"/>
    <circle cx="${x}" cy="${y - 8 * s}" r="${7.5 * s}" fill="${renk}"/></g>`;
C['grp-main'] = {
  z: ['#ffd27a', '#c8860f'],
  g: k => tahta(k, 48, 52, 31) + ok(k, 49, 38, -38, .8, '#d8262c') + ok(k, 44, 52, -12, .8, '#2f7de1') + ok(k, 53, 56, -62, .8, '#1d9a4a'),
};
C['grp-party'] = {
  // Grup (Demir 08.11): üç oyuncu, arkalarında dart tahtası; zemin mavi (Demir seçti: 4), oyuncular altın / beyaz / turkuaz
  z: ['#5b8cff', '#1c3c9e'],
  g: k => tahta(k, 50, 34, 21) + kisi(k, 24, 64, .92, '#ffd27a', '#e8a72a') + kisi(k, 76, 64, .92, '#7ee8d8', '#1fb5a3') + kisi(k, 50, 68, 1.2, '#ffffff', '#e9e3f7'),
};
C['grp-practice'] = {
  z: ['#8eeaa5', '#178a46'],
  g: k => `<defs><linearGradient id="${k}db" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f5"/><stop offset=".5" stop-color="#9aa3ad"/><stop offset="1" stop-color="#5d6570"/></linearGradient>
      <linearGradient id="${k}dp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f58"/><stop offset="1" stop-color="#1c1f24"/></linearGradient></defs>
    <g filter="url(#${k}s)" transform="rotate(-20 50 58)">
      <rect x="18" y="55" width="64" height="7" rx="3.5" fill="url(#${k}db)"/>
      <rect x="22" y="40" width="10" height="37" rx="3" fill="url(#${k}dp)"/><rect x="13" y="45" width="8" height="27" rx="3" fill="url(#${k}dp)"/>
      <rect x="68" y="40" width="10" height="37" rx="3" fill="url(#${k}dp)"/><rect x="79" y="45" width="8" height="27" rx="3" fill="url(#${k}dp)"/>
      <path d="M24 42v33M70 42v33" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
    </g>` + hedef(k, 72, 26, 14, ['#ffffff', '#e8352a', '#ffffff', '#e8352a']) + ok(k, 73, 25, -40, .55, '#ffd27a'),
};

// ── Cricket ailesi
const tebYazi = (x, y, t, boy, renk = '#f4f1e8') => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${boy}" font-weight="700" fill="${renk}" opacity=".93" font-family="system-ui, sans-serif">${t}</text>`;
C['grp-cricket'] = {
  z: ['#3fa874', '#0f3d27'],
  g: k => kara(k, '#1e2a24') + `<path d="M24 36 L34 50" ${tebesir}/><path d="M42 36 L52 50 M52 36 L42 50" ${tebesir}/>
    <path d="M60 36 L70 50 M70 36 L60 50" ${tebesir}/><circle cx="65" cy="43" r="9" ${tebesir}/>
    ${tebYazi(50, 70, '20 · 19 · B', 12)}`,
};
C.fullboard = {
  z: ['#ff7a7a', '#b3141f'], // kırmızı
  g: k => tahta(k, 50, 50, 32) + etiket(k, 74, 84, '1–20', '#fff', '#0f6b3a'),
};
C.tactics = {
  z: ['#ffb35c', '#c8560a'],
  g: k => kara(k, '#2a2620') + tebYazi(50, 47, '10 → 20', 15) + `<path d="M28 58 L36 68 M36 58 L28 68" ${tebesir}/><circle cx="32" cy="63" r="7" ${tebesir}/><path d="M48 58 L56 68" ${tebesir}/><path d="M66 58 L74 68 M74 58 L66 68" ${tebesir}/>`,
};
C.mickey = {
  z: ['#ff8fa3', '#c9184a'],
  g: k => kara(k, '#2a2224') + tebYazi(32, 50, 'D', 20, '#7ee0a1') + tebYazi(50, 50, 'T', 20, '#ff9a8a') + tebYazi(68, 50, 'B', 20, '#ffd27a') + tebYazi(50, 70, '12 – 20', 11),
};
C.turk = {
  z: ['#5a6070', '#1c1f27'], // kömür (bayrak öne çıksın)
  g: k => kara(k, '#1f2a28') + tebYazi(27, 48, 'D', 17, '#7ee0a1') + tebYazi(42, 48, 'T', 17, '#ff9a8a') + tebYazi(57, 48, 'B', 17, '#ffd27a') + tebYazi(73, 48, 'H', 17, '#9ad8ff') + tebYazi(50, 69, '10 – 20', 11) +
    // Türk bayrağı — yuvarlak madalyon (img/bayrak/tr.svg, dil düğmesindeki yuvarlak bayrak gibi); altın halkayla tahtanın köşesine oturur
    `<g filter="url(#${k}s)"><circle cx="83" cy="19" r="12" fill="url(#${k}bar)"/><circle cx="83" cy="19" r="12" fill="none" stroke="#fff3c9" stroke-opacity=".55" stroke-width=".8"/></g>
    <clipPath id="${k}tb"><circle cx="83" cy="19" r="9.8"/></clipPath>
    <g clip-path="url(#${k}tb)"><svg x="73.2" y="9.2" width="19.6" height="19.6" viewBox="0 0 512 512">
      <path fill="#e30a17" d="M0 0h512v512H0z"/><path fill="#fff" d="M348.8 264c0 70.6-58.3 127.9-130.1 127.9s-130.1-57.3-130.1-128 58.2-127.8 130-127.8S348.9 193.3 348.9 264z"/>
      <path fill="#e30a17" d="M355.3 264c0 56.5-46.6 102.3-104.1 102.3s-104-45.8-104-102.3 46.5-102.3 104-102.3 104 45.8 104 102.3z"/>
      <path fill="#fff" d="m374.1 204.2-1 47.3-44.2 12 43.5 15.5-1 43.3 28.3-33.8 42.9 14.8-24.8-36.3 30.2-36.1-46.4 12.8z"/></svg></g>
    <path d="M75 13a9.5 9.5 0 0 1 13-2.6" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>`,
};
C.minnesota = {
  z: ['#7ab8ff', '#1f5fa8'],
  g: k => kara(k, '#1f2530') + tebYazi(27, 48, 'D', 17, '#7ee0a1') + tebYazi(42, 48, 'T', 17, '#ff9a8a') + tebYazi(57, 48, 'B', 17, '#ffd27a') + tebYazi(75, 48, '3B', 15, '#9ad8ff') + tebYazi(50, 69, '15 – 20', 11),
};
C.hidden = {
  z: ['#5fe0ea', '#0b7d8f'], // turkuaz
  g: k => kara(k, '#25222f') + tebYazi(36, 62, '?', 34) + tebYazi(64, 62, '?', 34, '#ffd27a'),
};
C.crazy = {
  z: ['#ffe066', '#e09f00'],
  g: k => {
    const zar = (x, y, a, noktalar) => `<g transform="rotate(${a} ${x + 15} ${y + 15})" filter="url(#${k}s)"><rect x="${x}" y="${y}" width="30" height="30" rx="7" fill="#fff"/>${noktalar.map(([px, py]) => `<circle cx="${x + px}" cy="${y + py}" r="3.2" fill="#c9184a"/>`).join('')}</g>`;
    return zar(18, 34, -14, [[8, 8], [15, 15], [22, 22]]) + zar(50, 28, 12, [[8, 8], [22, 8], [8, 22], [22, 22], [15, 15]]) + tebYazi(50, 82, '20 · ? · 17', 11, '#7a4a05');
  },
};
C.english = {
  z: ['#d9a46a', '#7a4a1c'], // deri kahve
  g: k => `<defs><linearGradient id="${k}sp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3dfb2"/><stop offset=".5" stop-color="#e2c48a"/><stop offset="1" stop-color="#b8935a"/></linearGradient></defs>
    <g transform="rotate(-35 50 50)" filter="url(#${k}s)">
      <rect x="43" y="14" width="14" height="52" rx="5" fill="url(#${k}sp)"/>
      <rect x="47" y="64" width="6" height="22" rx="3" fill="#3a2414"/>
      <path d="M47 70h6M47 75h6M47 80h6" stroke="#6b4a2a" stroke-width="1.2"/>
    </g>
    <circle cx="70" cy="66" r="11" fill="#c8102e" filter="url(#${k}s)"/>
    <path d="M62 60 C67 64 67 68 62 72 M78 60 C73 64 73 68 78 72" stroke="#fff" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/>`,
};
C.crpractice = {
  z: ['#c9d88a', '#6b7a23'],
  g: k => kara(k, '#232a1e') + tebYazi(50, 52, 'MPR', 18, '#ffd27a') + `<path d="M26 64 L38 58 L50 62 L62 54 L74 50" stroke="#7ee0a1" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

// DartX Online (yakında): sitenin koyu simge zemini (kömür) üzerinde altın kupa, üstünde ince altın yayın dalgaları
C['grp-online'] = {
  z: ['#3b3936', '#121110'],
  g: k => `<defs><linearGradient id="${k}ku" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8862a"/><stop offset=".35" stop-color="#ffe9a8"/><stop offset=".6" stop-color="#f2c44c"/><stop offset="1" stop-color="#9a6a14"/></linearGradient></defs>
    <g fill="none" stroke="#e3b866" stroke-linecap="round">
      <path d="M38 22 A16 16 0 0 1 62 22" stroke-width="2.6" stroke-opacity=".95"/>
      <path d="M31 16 A26 26 0 0 1 69 16" stroke-width="2.4" stroke-opacity=".6"/>
      <path d="M24 10 A36 36 0 0 1 76 10" stroke-width="2.2" stroke-opacity=".32"/>
    </g>
    <g filter="url(#${k}s)">
      <path d="M32 30 H68 V46 C68 60 60 67 50 67 C40 67 32 60 32 46 Z" fill="url(#${k}ku)"/>
      <path d="M32 35 C21 35 21 53 34 55 M68 35 C79 35 79 53 66 55" stroke="url(#${k}ku)" stroke-width="5" fill="none"/>
      <rect x="45.5" y="67" width="9" height="10" fill="url(#${k}ku)"/>
      <rect x="35" y="77" width="30" height="10" rx="3" fill="#5a3a12"/>
    </g>
    <rect x="39" y="79.5" width="22" height="5" rx="1" fill="#e9c46a"/>
    <path d="M38 34 C38 46 40 55 46 61" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
};

// Nasıl Oynanır (Demir 09.11, 2 seçildi) · Gösterim ekranı: tablet ekranında tahta, okun noktalı uçuş yolu, altta ilerleme çubuğu (video)
C.nasil = {
  z: ['#7fd0ff', '#1f6fd1'],
  g: k => `<g filter="url(#${k}s)"><rect x="12" y="20" width="76" height="58" rx="8" fill="#14181f"/></g>` + tahta(k, 58, 46, 17) +
    `<path d="M22 32 Q34 22 50 40" stroke="#fff" stroke-width="2" stroke-dasharray="2.5 3" fill="none" stroke-linecap="round"/>` + ok(k, 55, 42, -150, .55) +
    `<rect x="20" y="68" width="60" height="3.5" rx="1.75" fill="#3a4250"/><rect x="20" y="68" width="34" height="3.5" rx="1.75" fill="#7fd0ff"/><circle cx="54" cy="69.75" r="3.4" fill="#fff"/>`,
};
export function ikon(id) {
  const c = C[id];
  if (!c) return '';
  const k = P(id);
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <linearGradient id="${k}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.z[0]}"/><stop offset="1" stop-color="${c.z[1]}"/></linearGradient>
      <filter id="${k}s" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.2" flood-color="#000" flood-opacity=".28"/></filter>
      ${bar(k)}
    </defs>
    <rect width="100" height="100" fill="url(#${k}z)"/>
    ${c.g(k)}
  </svg>`;
}
