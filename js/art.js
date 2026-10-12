/* NYR Sports — renders vectoriales de producto.
   Cada función devuelve un <svg> con gradientes propios (ids únicos)
   para que el catálogo se vea nítido a cualquier resolución sin depender
   de fotografías. Sustituibles por fotos reales en /assets/img. */
(function () {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  // Aclara/oscurece un color hex (amt entre -1 y 1)
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }
  const isLight = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 170;
  };

  function body(fillId, base) {
    return `<linearGradient id="${fillId}" x1="0" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="${shade(base, 0.28)}"/>
      <stop offset=".5" stop-color="${base}"/>
      <stop offset="1" stop-color="${shade(base, -0.45)}"/></linearGradient>`;
  }
  function gloss(gId) {
    return `<linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  }
  const floor = (cx, cy, rx) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.09}" fill="#0B1F3A" opacity=".16" filter="blur(4px)"/>`;

  const A = {
    helmet(a = '#0B1F3A', b = '#C6F432') {
      const f = id('h'), g = id('g'), m = id('m');
      return `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs>${body(f, a)}${gloss(g)}
        <linearGradient id="${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9ECF1"/><stop offset="1" stop-color="#8A93A3"/></linearGradient></defs>
        ${floor(130, 182, 92)}
        <path d="M48 150C30 110 36 60 78 36c34-20 84-18 112 10 16 16 22 38 20 58l-10 4c-4-10-14-16-28-14l-22 4c-8 2-12 10-10 18l6 24c2 10-6 18-18 18l-56 2c-12 0-20-4-24-10z" fill="url(#${f})"/>
        <path d="M76 40c36-22 86-20 116 12" stroke="${b}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M76 40c36-22 86-20 116 12" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none" stroke-linecap="round" transform="translate(0 -3)"/>
        <path d="M66 56c22-22 60-30 96-20-40 0-74 14-92 40-8 10-14 8-4-20z" fill="url(#${g})" opacity=".8"/>
        <circle cx="108" cy="120" r="9" fill="${shade(a, -0.6)}"/><circle cx="108" cy="120" r="4" fill="${shade(a, 0.2)}"/>
        <path d="M50 150c6 8 14 10 24 10" stroke="${shade(a, -0.6)}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <g fill="none" stroke="url(#${m})" stroke-width="6" stroke-linecap="round">
          <path d="M150 102c30-4 60 2 74 14"/><path d="M148 126c30-2 58 2 78 8"/><path d="M146 148c30 2 58 2 76 4"/>
          <path d="M224 116c6 14 4 30-2 38"/><path d="M196 106l2 46"/>
        </g>
        <path d="M128 158c22 12 52 10 72-2" stroke="#1d1d1f" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
      </svg>`;
    },

    pads(a = '#0B1F3A', b = '#C6F432') {
      const f = id('p'), g = id('g'), w = id('w');
      return `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs>${body(f, a)}${gloss(g)}${body(w, '#F2F4F7')}</defs>
        ${floor(120, 182, 100)}
        <path d="M70 60c20-14 80-14 100 0l8 92c-28 15-88 15-116 0z" fill="url(#${w})"/>
        <path d="M70 58C40 52 14 70 12 104c18 0 38 8 50 20zM170 58c30-6 56 12 58 46-18 0-38 8-50 20z" fill="url(#${f})"/>
        <path d="M22 84c12-16 30-22 46-20M218 84c-12-16-30-22-46-20" stroke="url(#${g})" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M66 70c16 6 22 30 18 76M174 70c-16 6-22 30-18 76" stroke="${a}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <ellipse cx="120" cy="58" rx="28" ry="12" fill="${shade(a, -0.55)}"/>
        <path d="M120 72v74" stroke="#C8CDD6" stroke-width="2"/>
        <g stroke="${b}" stroke-width="3" stroke-linecap="round">${[84, 98, 112, 126].map((y) => `<path d="M112 ${y}l16 6M128 ${y}l-16 6"/>`).join('')}</g>
        <g fill="#C8CDD6">${[[92, 96], [92, 116], [148, 96], [148, 116], [100, 136], [140, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>
      </svg>`;
    },

    cleat(a = '#0B1F3A', b = '#C6F432') {
      const f = id('c'), g = id('g');
      return `<svg class="art" viewBox="0 0 260 160" aria-hidden="true"><defs>${body(f, a)}${gloss(g)}</defs>
        ${floor(134, 146, 108)}
        <path d="M30 100c-2-30 10-50 32-54l38-6c10-10 20-14 30-10l20 22c30 10 64 18 86 34 10 8 8 22-4 24H36z" fill="url(#${f})"/>
        <path d="M70 96c40-14 92-24 150-12 6 2 6 8 0 8-56-6-104 2-150 14z" fill="${b}"/>
        <path d="M44 56c20-8 50-12 86-14" stroke="url(#${g})" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
        <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9">${[0, 1, 2, 3].map((i) => `<path d="M${118 + i * 14} ${46 + i * 5}l10 -8"/>`).join('')}</g>
        <path d="M26 108h212c6 0 8 8 2 12-20 6-180 8-210 4-8-2-10-14-4-16z" fill="#F2F4F7"/>
        <path d="M26 112h214" stroke="${b}" stroke-width="2"/>
        <g fill="${shade(a, -0.3)}">${[46, 78, 150, 182, 212].map((x) => `<path d="M${x} 124h14l-2 12h-10z"/>`).join('')}</g>
      </svg>`;
    },

    // style: 'football' (fútbol americano) · 'soccer' (fútbol, vóley, balonmano) · 'baseball'
    jersey(a = '#0B1F3A', b = '#C6F432', num = '27', team = '', style = 'football') {
      const f = id('j'), g = id('g');
      const ink = isLight(a) ? (isLight(b) ? '#0B1F3A' : b) : b;
      const label = (team || '').toUpperCase().slice(0, 18).replace(/[<&>"]/g, '');
      const n = String(num || '').replace(/\D/g, '').slice(0, 2);
      const font = 'Inter,-apple-system,Arial,sans-serif';
      const shapes = {
        football: 'M80 30c12 10 68 10 80 0l46 20 22 58-32 12-12-24v118c-34 8-94 8-128 0V96l-12 24-32-12 22-58z',
        soccer: 'M82 30c12 8 64 8 76 0l40 14 30 52-28 16-18-28v130c-34 8-94 8-128 0V84l-18 28-28-16 30-52z',
      };
      const d = style === 'football' ? shapes.football : shapes.soccer;
      const stroke = isLight(ink) ? shade(a, -0.4) : '#fff';
      let detail = '';
      if (style === 'football') {
        detail = `<path d="M80 30c16 22 64 22 80 0" stroke="${b}" stroke-width="7" fill="none"/>
          <path d="M18 100l30 11M222 100l-30 11" stroke="${b}" stroke-width="6"/>
          ${label ? `<text x="120" y="88" text-anchor="middle" font-family="${font}" font-size="11" font-weight="700" letter-spacing="2" fill="${ink}">${label}</text>` : ''}
          <text x="120" y="168" text-anchor="middle" font-family="${font}" font-size="74" font-weight="800" letter-spacing="-3" fill="${ink}" stroke="${stroke}" stroke-opacity=".35" stroke-width="2">${n}</text>`;
      } else if (style === 'soccer') {
        detail = `<path d="M82 30c14 14 62 14 76 0" stroke="${b}" stroke-width="6" fill="none"/>
          <path d="M226 94l-27 15M14 94l27 15" stroke="${b}" stroke-width="6"/>
          <path d="M60 84v128M180 84v128" stroke="${b}" stroke-width="3" opacity=".8"/>
          <circle cx="150" cy="78" r="9" fill="none" stroke="${ink}" stroke-width="2.5"/><path d="M146 78h8M150 74v8" stroke="${ink}" stroke-width="2"/>
          ${label ? `<text x="120" y="110" text-anchor="middle" font-family="${font}" font-size="11" font-weight="700" letter-spacing="2" fill="${ink}">${label}</text>` : ''}
          <text x="120" y="178" text-anchor="middle" font-family="${font}" font-size="64" font-weight="800" letter-spacing="-3" fill="${ink}" stroke="${stroke}" stroke-opacity=".35" stroke-width="2">${n}</text>`;
      } else {
        detail = `<path d="M82 30c14 14 62 14 76 0" stroke="${b}" stroke-width="5" fill="none"/>
          <path d="M120 40v176" stroke="${b}" stroke-width="5"/>
          <g fill="${ink}">${[64, 92, 120, 148, 176].map((y) => `<circle cx="128" cy="${y}" r="2.6"/>`).join('')}</g>
          <path d="M226 94l-27 15M14 94l27 15" stroke="${b}" stroke-width="5"/>
          <text x="120" y="112" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-size="${label.length > 10 ? 16 : 24}" font-weight="700" fill="${ink}" transform="rotate(-6 120 112)">${label ? label[0] + label.slice(1).toLowerCase() : 'Team'}</text>
          <text x="86" y="176" text-anchor="middle" font-family="${font}" font-size="34" font-weight="800" fill="${ink}">${n}</text>`;
      }
      return `<svg class="art" viewBox="0 0 240 240" aria-hidden="true"><defs>${body(f, a)}
        <radialGradient id="${g}" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        ${floor(120, 228, 84)}
        <path d="${d}" fill="url(#${f})"/><path d="${d}" fill="url(#${g})"/>
        ${detail}
      </svg>`;
    },

    // Camiseta de baloncesto (sin mangas)
    tank(a = '#1F6FEB', b = '#F2F4F7', num = '23', team = '') {
      const f = id('k'), g = id('g');
      const ink = isLight(a) ? (isLight(b) ? '#0B1F3A' : b) : b;
      const label = (team || '').toUpperCase().slice(0, 14).replace(/[<&>"]/g, '');
      const n = String(num || '').replace(/\D/g, '').slice(0, 2);
      const d = 'M84 24c10 22 62 22 72 0l22 4c0 30 8 50 24 58v128c-40 8-124 8-164 0V86c16-8 24-28 24-58z';
      return `<svg class="art" viewBox="0 0 240 240" aria-hidden="true"><defs>${body(f, a)}
        <radialGradient id="${g}" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        ${floor(120, 228, 84)}
        <path d="${d}" fill="url(#${f})"/><path d="${d}" fill="url(#${g})"/>
        <path d="M84 24c10 26 62 26 72 0" stroke="${b}" stroke-width="6" fill="none"/>
        <path d="M62 28c0 30-8 50-24 58M178 28c0 30 8 50 24 58" stroke="${b}" stroke-width="6" fill="none"/>
        <text x="120" y="98" text-anchor="middle" font-family="Inter,-apple-system,Arial,sans-serif" font-size="13" font-weight="800" letter-spacing="2" fill="${ink}">${label}</text>
        <text x="120" y="172" text-anchor="middle" font-family="Inter,-apple-system,Arial,sans-serif" font-size="70" font-weight="800" letter-spacing="-3" fill="${ink}" stroke="${isLight(ink) ? shade(a, -0.4) : '#fff'}" stroke-opacity=".35" stroke-width="2">${n}</text>
        <path d="M38 200c40 8 124 8 164 0" stroke="${b}" stroke-width="4" fill="none"/>
      </svg>`;
    },

    shorts(a = '#0B1F3A', b = '#C6F432') {
      const f = id('s');
      return `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs>${body(f, a)}</defs>
        ${floor(120, 186, 84)}
        <path d="M56 30h128l18 140-70 8-12-64-12 64-70-8z" fill="url(#${f})"/>
        <rect x="56" y="30" width="128" height="14" rx="4" fill="${shade(a, -0.25)}"/>
        <path d="M60 46l-14 118M180 46l14 118" stroke="${b}" stroke-width="6"/>
        <path d="M38 166l70 8M202 166l-70 8" stroke="${b}" stroke-width="4"/>
      </svg>`;
    },

    cap(a = '#0B1F3A', b = '#C6F432') {
      const f = id('cp');
      return `<svg class="art" viewBox="0 0 240 180" aria-hidden="true"><defs>${body(f, a)}</defs>
        ${floor(120, 166, 90)}
        <path d="M44 120c-4-50 30-86 80-86s76 34 76 82c-40-6-110-6-156 4z" fill="url(#${f})"/>
        <path d="M196 116c22 2 36 10 34 20-30 6-62 2-86-6z" fill="${shade(a, -0.35)}"/>
        <path d="M124 34c-20 20-30 50-30 82M124 34c10 24 14 50 12 80" stroke="${shade(a, -0.4)}" stroke-width="2" fill="none"/>
        <circle cx="124" cy="36" r="5" fill="${shade(a, -0.2)}"/>
        <path d="M76 86l18-14 12 14 12-14 18 14" stroke="${b}" stroke-width="6" fill="none" stroke-linejoin="round"/>
        <path d="M46 118c46-10 116-10 154-2" stroke="${b}" stroke-width="3" fill="none"/>
      </svg>`;
    },

    bat() {
      const f = id('bt');
      return `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs>
        <linearGradient id="${f}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7ECF3"/><stop offset=".5" stop-color="#9AA6B8"/><stop offset="1" stop-color="#3A4A63"/></linearGradient></defs>
        ${floor(120, 186, 96)}
        <g transform="rotate(-28 120 100)">
          <path d="M20 94h70c40-6 90-12 126-12 8 0 12 8 12 18s-4 18-12 18c-36 0-86-6-126-12H20z" fill="url(#${f})"/>
          <rect x="14" y="90" width="10" height="20" rx="4" fill="#0B1F3A"/>
          <path d="M24 94h56v12H24z" fill="#0B1F3A"/>
          <path d="M120 96h60" stroke="#C6F432" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>`;
    },

    mitt(a = '#8A4B22', b = '#0B1F3A') {
      const f = id('mt');
      return `<svg class="art" viewBox="0 0 240 220" aria-hidden="true"><defs>${body(f, a)}</defs>
        ${floor(120, 206, 80)}
        <path d="M70 196c-26-30-40-70-34-110 4-26 20-28 26-6l8 30 4-70c2-16 20-16 22 0l4 64 6-74c2-16 20-16 22 0l2 72 10-62c4-16 22-14 20 2l-8 76 22-34c10-14 26-6 20 10-14 40-30 80-62 106z" fill="url(#${f})"/>
        <path d="M84 150c24 10 52 10 74 0" stroke="${shade(a, 0.4)}" stroke-width="3" stroke-dasharray="4 5" fill="none"/>
        <rect x="70" y="182" width="96" height="20" rx="6" fill="${b}"/>
        <path d="M110 70v60M134 70l-2 60" stroke="${shade(a, -0.4)}" stroke-width="2"/>
      </svg>`;
    },

    pants(a = '#F2F4F7', b = '#0B1F3A') {
      const f = id('t');
      return `<svg class="art" viewBox="0 0 240 240" aria-hidden="true"><defs>${body(f, a)}</defs>
        ${floor(120, 222, 80)}
        <path d="M64 30h112l14 170-56 6-14-96-14 96-56-6z" fill="url(#${f})"/>
        <rect x="64" y="30" width="112" height="14" rx="3" fill="${shade(a, -0.2)}"/>
        <path d="M68 50l-12 148M172 50l12 148" stroke="${b}" stroke-width="7"/>
        <path d="M72 50l-12 148M168 50l12 148" stroke="#C6F432" stroke-width="2"/>
        <path d="M120 44v40" stroke="${shade(a, -0.3)}" stroke-width="2"/>
      </svg>`;
    },

    gloves(a = '#0B1F3A', b = '#C6F432') {
      const f = id('v'), g = id('g');
      return `<svg class="art" viewBox="0 0 240 240" aria-hidden="true"><defs>${body(f, a)}${gloss(g)}</defs>
        ${floor(118, 226, 64)}
        <path d="M80 210v-90c-10-10-24-24-30-40-4-10 8-16 16-8l20 24-2-56c0-10 14-10 14 0l2 50 4-60c0-10 14-10 14 0v60l6-54c0-10 14-10 14 0l-2 58 6-42c0-10 14-10 14 0l-4 78c-2 30-6 60-2 80z" fill="url(#${f})"/>
        <path d="M92 130c18-8 40-8 56 0" stroke="${b}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <rect x="78" y="196" width="76" height="20" rx="5" fill="${b}"/>
        <path d="M100 48l2 40M118 40v44" stroke="url(#${g})" stroke-width="4" stroke-linecap="round" opacity=".6"/>
      </svg>`;
    },

    // kind: football · soccer · basket · volley · hand · baseball · softball
    ball(kind = 'football') {
      const f = id('b');
      const grad = (c0, c1, c2) => `<radialGradient id="${f}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c0}"/><stop offset=".6" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;
      const wrap = (defs, inner) => `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs>${defs}</defs>${floor(120, 186, 70)}${inner}</svg>`;
      const shine = `<ellipse cx="96" cy="66" rx="30" ry="14" fill="#fff" opacity=".25" transform="rotate(-25 96 66)"/>`;
      if (kind === 'soccer') return wrap(grad('#FFFFFF', '#E9ECF1', '#AEB6C3'), `<circle cx="120" cy="100" r="72" fill="url(#${f})"/>
        <path d="M120 72l26 19-10 31h-32l-10-31z" fill="#0B1F3A"/>
        <g stroke="#0B1F3A" stroke-width="3" fill="none"><path d="M120 72V40M146 91l30-10M136 122l18 26M104 122l-18 26M94 91l-30-10"/></g>
        <g fill="#0B1F3A"><path d="M108 30h24l-12 12z"/><path d="M184 70l8 22-16-4z"/><path d="M164 160l-20 8 4-16z"/><path d="M76 160l20 8-4-16z"/><path d="M56 70l-8 22 16-4z"/></g>${shine}`);
      if (kind === 'basket') return wrap(grad('#F5A25D', '#D96A1E', '#8C3B0B'), `<circle cx="120" cy="100" r="72" fill="url(#${f})"/>
        <g stroke="#2B1406" stroke-width="3.5" fill="none"><path d="M48 100h144M120 28v144"/><path d="M70 48c24 26 24 78 0 104M170 48c-24 26-24 78 0 104"/></g>${shine}`);
      if (kind === 'volley') return wrap(grad('#FFFFFF', '#EEF0F4', '#B9C0CC'), `<circle cx="120" cy="100" r="72" fill="url(#${f})"/>
        <path d="M120 28c-30 30-30 80 6 112 30 26 60 24 64-6-30 10-60-6-70-40-6-24-6-50 0-66z" fill="#1F6FEB"/>
        <path d="M56 70c30-6 70 6 92 40 14 22 16 46 4 60 28-12 40-40 38-70-34-20-90-40-134-30z" fill="#F2C230" opacity=".95"/>
        <circle cx="120" cy="100" r="72" fill="none" stroke="#0B1F3A" stroke-opacity=".15" stroke-width="2"/>${shine}`);
      if (kind === 'hand') return wrap(grad('#E4FF7A', '#C6F432', '#7FA60F'), `<circle cx="120" cy="100" r="62" fill="url(#${f})"/>
        <g stroke="#0B1F3A" stroke-width="3.5" fill="none"><path d="M70 64c30 14 70 14 100 0M70 136c30-14 70-14 100 0"/><path d="M92 44c-10 36-10 76 0 112M148 44c10 36 10 76 0 112"/></g>
        <path d="M100 86h40v28h-40z" fill="#0B1F3A" opacity=".85"/>${shine}`);
      if (kind === 'baseball' || kind === 'softball') {
        const c = kind === 'softball' ? ['#FFF8A8', '#F2E43A', '#B5A80E'] : ['#FFFFFF', '#F1F2F4', '#BCC2CC'];
        return wrap(grad(...c), `<circle cx="120" cy="100" r="64" fill="url(#${f})"/>
          <g stroke="#D92D20" stroke-width="3" fill="none"><path d="M76 52c22 30 22 66 0 96M164 52c-22 30-22 66 0 96"/></g>
          <g stroke="#D92D20" stroke-width="2.5">${[62, 76, 90, 104, 118, 132].map((y, i) => `<path d="M${84 + (i > 2 ? 5 - i : i) * 2} ${y}l8 -3M${156 - (i > 2 ? 5 - i : i) * 2} ${y}l-8 -3"/>`).join('')}</g>${shine}`);
      }
      return `<svg class="art" viewBox="0 0 240 200" aria-hidden="true"><defs>
        <radialGradient id="${f}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B0683A"/><stop offset=".6" stop-color="#7A3B1A"/><stop offset="1" stop-color="#4A220E"/></radialGradient></defs>
        ${floor(120, 182, 84)}
        <g transform="rotate(-24 120 100)">
          <ellipse cx="120" cy="100" rx="96" ry="56" fill="url(#${f})"/>
          <path d="M42 70c4 20 4 40 0 60M198 70c-4 20-4 40 0 60" stroke="#fff" stroke-width="7" fill="none"/>
          <path d="M84 70h72" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
          <g stroke="#fff" stroke-width="4" stroke-linecap="round">${[92, 104, 116, 128, 140, 152].map((x) => `<path d="M${x} 62v16"/>`).join('')}</g>
          <ellipse cx="96" cy="76" rx="40" ry="10" fill="#fff" opacity=".12"/>
        </g>
      </svg>`;
    },
  };

  function renderAll(root = document) {
    root.querySelectorAll('[data-art]').forEach((el) => {
      const fn = A[el.dataset.art];
      if (fn) el.innerHTML = fn(el.dataset.a, el.dataset.b, el.dataset.num, el.dataset.team, el.dataset.style);
    });
  }

  window.NYRArt = { ...A, renderAll, shade, isLight };
})();
