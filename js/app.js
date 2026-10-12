/* NYR Sports — tienda (catálogo, bolsa y checkout) sin dependencias. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const Art = window.NYRArt;
  let io; // IntersectionObserver de animaciones .reveal
  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const money = (n) => eur.format(n);

  const NAVY = '#01144C', LIME = '#B8FC0B', WHITE = '#F2F4F7', BLACK = '#1D1D1F', ROYAL = '#1F6FEB', MAROON = '#B3122E';

  /* ---------------- Catálogo ----------------
     sport: futbol · baloncesto · voley · balonmano · americano · beisbol · multi
     brand: 'Forelle' para la gama en distribución exclusiva.
     art: [render, colorA, colorB, dorsal, equipo, estilo] — ver js/art.js
     Productos y precios de ejemplo: sustituir por el catálogo real. */
  const SIZES = {
    ropa: ['4XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    casco: ['S', 'M', 'L', 'XL'],
    hombrera: ['S', 'M', 'L', 'XL', '2XL'],
    bota: ['39', '40', '41', '42', '43', '44', '45', '46', '47'],
    guante: ['S', 'M', 'L', 'XL'],
    mitt: ['11"', '11,5"', '12"', '12,5"'],
    bate: ['30"', '31"', '32"', '33"'],
    cap: ['S/M', 'L/XL'],
    balmano: ['1', '2', '3'],
    bal: ['3', '4', '5'],
    bal7: ['5', '6', '7'],
    unica: [],
  };
  const SPORTS = {
    futbol: 'Fútbol', baloncesto: 'Baloncesto', voley: 'Vóley', balonmano: 'Balonmano',
    americano: 'Fútbol americano', beisbol: 'Béisbol y softball', multi: 'Multideporte',
  };

  const PRODUCTS = [
    // Equipaciones personalizables (fabricación propia)
    { id: 'fu-kit', sport: 'futbol', name: 'Equipación Fútbol Pro', sub: 'Camiseta + pantalón + medias', price: 39, art: ['jersey', NAVY, LIME, '9', '', 'soccer'], sizes: 'ropa', custom: true, tag: 'Más vendido', desc: 'Kit completo sublimado en tejido técnico de secado rápido. Escudo, dorsal y nombre incluidos.' },
    { id: 'fu-gk', sport: 'futbol', name: 'Equipación Portero', sub: 'Manga larga · acolchado', price: 45, art: ['jersey', LIME, BLACK, '1', '', 'soccer'], sizes: 'ropa', custom: true, desc: 'Camiseta de manga larga con refuerzo en codos y pantalón acolchado. Colores de alta visibilidad.' },
    { id: 'bk-kit', sport: 'baloncesto', name: 'Equipación Baloncesto Reversible', sub: 'Camiseta + pantalón', price: 42, art: ['tank', ROYAL, WHITE, '23'], sizes: 'ropa', custom: true, tag: 'Reversible', desc: 'Dos colores en una sola prenda, ideal para entrenamientos y partidos. Malla transpirable de alto gramaje.' },
    { id: 'bk-short', sport: 'baloncesto', name: 'Pantalón Baloncesto', sub: 'Largo · cintura elástica', price: 19, art: ['shorts', ROYAL, WHITE], sizes: 'ropa', custom: false, desc: 'Pantalón amplio con franja lateral personalizable y cintura con cordón interior.' },
    { id: 'vo-kit', sport: 'voley', name: 'Equipación Vóley', sub: 'Corte femenino y masculino', price: 36, art: ['jersey', MAROON, WHITE, '7', '', 'soccer'], sizes: 'ropa', custom: true, desc: 'Ajuste ceñido y elástico para máxima libertad de movimiento. Tejido ligero de secado rápido.' },
    { id: 'hb-kit', sport: 'balonmano', name: 'Equipación Balonmano', sub: 'Camiseta + pantalón', price: 38, art: ['jersey', '#0E8A4F', WHITE, '14', '', 'soccer'], sizes: 'ropa', custom: true, desc: 'Costuras reforzadas para el contacto y tejido elástico en hombros. Numeración sublimada.' },
    { id: 'af-jersey', sport: 'americano', name: 'Jersey Fútbol Americano', sub: 'Malla técnica · sublimado', price: 49, art: ['jersey', NAVY, LIME, '27'], sizes: 'ropa', custom: true, desc: 'Corte atlético con paneles de malla y refuerzos en hombros, compatible con hombreras.' },
    { id: 'bs-jersey', sport: 'beisbol', name: 'Camiseta Béisbol', sub: 'Abotonada · sublimada', price: 44, art: ['jersey', WHITE, NAVY, '7', 'Bravos', 'baseball'], sizes: 'ropa', custom: true, desc: 'Camiseta abotonada con nombre del equipo en script y numeración. Para béisbol y softball.' },
    { id: 'bs-cap', sport: 'beisbol', name: 'Gorra Béisbol Personalizada', sub: 'Bordado 3D', price: 18, art: ['cap', NAVY, LIME], sizes: 'cap', desc: 'Gorra de seis paneles con escudo bordado en relieve y cierre ajustable.' },
    { id: 'mu-short', sport: 'multi', name: 'Pantalón Técnico Multideporte', sub: 'Entrenamiento', price: 15, art: ['shorts', NAVY, LIME], sizes: 'ropa', desc: 'Pantalón corto ligero para entrenamiento de cualquier deporte. Personalizable con escudo.' },
    // Forelle — distribución exclusiva
    { id: 'fo-helmet', sport: 'americano', brand: 'Forelle', name: 'Casco Fútbol Americano', sub: 'Adulto · con máscara', price: 289, art: ['helmet', NAVY, LIME], sizes: 'casco', tag: 'Exclusiva', desc: 'Casco de policarbonato con acolchado interior ajustable y máscara de acero. Gama Forelle.' },
    { id: 'fo-pads', sport: 'americano', brand: 'Forelle', name: 'Hombreras', sub: 'Todas las posiciones', price: 169, art: ['pads', NAVY, LIME], sizes: 'hombrera', desc: 'Hombreras ligeras con ventilación y ajuste de doble lazo. Gama Forelle.' },
    { id: 'fo-gloves', sport: 'americano', brand: 'Forelle', name: 'Guantes Receptor', sub: 'Palma de agarre', price: 39, art: ['gloves', NAVY, LIME], sizes: 'guante', desc: 'Guantes con palma de alto agarre y dorso transpirable. Gama Forelle.' },
    { id: 'fo-ball', sport: 'americano', brand: 'Forelle', name: 'Balón Fútbol Americano', sub: 'Composite', price: 45, art: ['ball', 'football'], sizes: 'unica', desc: 'Balón de piel compuesta con laces de alto agarre. Gama Forelle.' },
    { id: 'fo-bat', sport: 'beisbol', brand: 'Forelle', name: 'Bate de Aluminio', sub: 'Béisbol · aleación', price: 79, art: ['bat'], sizes: 'bate', tag: 'Exclusiva', desc: 'Bate de aluminio equilibrado con empuñadura antideslizante. Gama Forelle.' },
    { id: 'fo-mitt', sport: 'beisbol', brand: 'Forelle', name: 'Guante de Béisbol', sub: 'Piel · infield / outfield', price: 69, art: ['mitt'], sizes: 'mitt', desc: 'Guante de piel con bolsillo profundo y ajuste en muñeca. Gama Forelle.' },
    { id: 'fo-softball', sport: 'beisbol', brand: 'Forelle', name: 'Bolas de Softball', sub: '12" · pack de 12', price: 54, art: ['ball', 'softball'], sizes: 'unica', desc: 'Bolas de softball de 12 pulgadas para entrenamiento y competición. Gama Forelle.' },
    // Calzado
    { id: 'ca-futbol', sport: 'futbol', type: 'calzado', name: 'Botas de Fútbol', sub: 'Tacos moldeados · césped artificial', price: 69, art: ['cleat', NAVY, LIME, 'studs'], sizes: 'bota', desc: 'Botas ligeras con empeine de punto técnico y suela de tacos moldeados para césped natural y artificial.' },
    { id: 'ca-sala', sport: 'futbol', type: 'calzado', name: 'Zapatillas Fútbol Sala', sub: 'Suela de goma no marcante', price: 59, art: ['cleat', WHITE, NAVY, 'indoor'], sizes: 'bota', desc: 'Suela de goma no marcante con máxima tracción en pista y puntera reforzada.' },
    { id: 'ca-basket', sport: 'baloncesto', type: 'calzado', name: 'Zapatillas Baloncesto', sub: 'Amortiguación · sujeción de tobillo', price: 89, art: ['cleat', BLACK, LIME, 'indoor'], sizes: 'bota', desc: 'Amortiguación reactiva y collar acolchado para saltos y cambios de dirección.' },
    { id: 'ca-indoor', sport: 'voley', type: 'calzado', name: 'Zapatillas Indoor', sub: 'Vóley y balonmano', price: 75, art: ['cleat', ROYAL, WHITE, 'indoor'], sizes: 'bota', desc: 'Zapatilla de pista con suela de goma gum para vóley y balonmano.' },
    { id: 'ca-americano', sport: 'americano', type: 'calzado', name: 'Botas Fútbol Americano', sub: 'Caña media · tacos', price: 99, art: ['cleat', BLACK, WHITE, 'studs'], sizes: 'bota', desc: 'Estabilidad lateral y soporte de tobillo con placa de tacos para hierba y césped artificial.' },
    // Balones
    { id: 'ba-futbol', sport: 'futbol', name: 'Balón de Fútbol', sub: 'Termosellado · talla 3 a 5', price: 29, art: ['ball', 'soccer'], sizes: 'bal', desc: 'Balón termosellado de bote regular para césped natural y artificial.' },
    { id: 'ba-basket', sport: 'baloncesto', name: 'Balón de Baloncesto', sub: 'Interior / exterior · 5 a 7', price: 32, art: ['ball', 'basket'], sizes: 'bal7', desc: 'Composite de agarre profundo para pista interior y exterior.' },
    { id: 'ba-voley', sport: 'voley', name: 'Balón de Vóley', sub: 'Microfibra · talla 5', price: 34, art: ['ball', 'volley'], sizes: 'unica', desc: 'Superficie de microfibra con paneles laminados para un toque suave.' },
    { id: 'ba-hand', sport: 'balonmano', name: 'Balón de Balonmano', sub: 'Tallas 1 a 3', price: 27, art: ['ball', 'hand'], sizes: 'balmano', desc: 'Agarre óptimo con o sin resina. Tallas para todas las categorías.' },
  ];

  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const draw = (art) => Art[art[0]](...art.slice(1));
  const artOf = (p) => draw(p.art);
  const itemArt = (i) => draw(i.art || byId[i.id].art);
  const withNum = (art, num, team) => {
    const a = [...art];
    a[3] = num; if (team !== undefined) a[4] = team;
    return a;
  };
  const catLabel = (p) => [SPORTS[p.sport], p.brand].filter(Boolean).join(' · ');

  /* ---------------- Tienda ---------------- */
  function card(p) {
    return `<article class="product reveal" data-id="${p.id}" tabindex="0" aria-label="${p.name}, ${money(p.price)}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      ${p.brand ? `<span class="brand-tag">${p.brand}</span>` : ''}
      <div class="product__art">${artOf(p)}</div>
      <div class="product__info">
        <h3>${p.name}</h3>
        <p class="muted">${p.sub}</p>
        <div class="product__row">
          <b>${p.custom ? '<small>desde</small> ' : ''}${money(p.price)}</b>
          <button class="add" data-quick="${p.id}" aria-label="Añadir ${p.name}">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>`;
  }
  function renderGrid(el, list) {
    el.innerHTML = list.map(card).join('');
    observeReveal(el);
  }
  function filterShop(f) {
    $$('#filters button').forEach((b) => {
      const on = b.dataset.f === f;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
      // Centra la pestaña activa sin desplazar la página
      if (on) b.parentElement.scrollTo({ left: b.offsetLeft - (b.parentElement.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    });
    const list = f === 'todo' ? PRODUCTS
      : f === 'forelle' ? PRODUCTS.filter((p) => p.brand === 'Forelle')
      : f === 'calzado' ? PRODUCTS.filter((p) => p.type === 'calzado')
      : PRODUCTS.filter((p) => p.sport === f || (p.sport === 'multi' && f !== 'americano' && f !== 'beisbol'));
    renderGrid($('#gridShop'), list);
  }
  filterShop('todo');
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) filterShop(b.dataset.f);
  });
  $$('[data-filter]').forEach((a) => a.addEventListener('click', () => filterShop(a.dataset.filter)));

  document.addEventListener('click', (e) => {
    const quick = e.target.closest('[data-quick]');
    if (quick) { e.stopPropagation(); openProduct(quick.dataset.quick); return; }
    const prod = e.target.closest('.product');
    if (prod) openProduct(prod.dataset.id);
    const opener = e.target.closest('[data-open]');
    if (opener) openProduct(opener.dataset.open);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList?.contains('product')) openProduct(e.target.dataset.id);
  });

  /* ---------------- Art estático ---------------- */
  Art.renderAll();

  /* ---------------- Configurador ---------------- */
  // Cada deporte se asocia al producto que se añade al pedido
  const CFG_SPORT = {
    futbol: { id: 'fu-kit', kind: 'jersey', style: 'soccer' },
    baloncesto: { id: 'bk-kit', kind: 'tank' },
    voley: { id: 'vo-kit', kind: 'jersey', style: 'soccer' },
    balonmano: { id: 'hb-kit', kind: 'jersey', style: 'soccer' },
    americano: { id: 'af-jersey', kind: 'jersey', style: 'football' },
    beisbol: { id: 'bs-jersey', kind: 'jersey', style: 'baseball' },
  };
  const cfg = { sport: 'futbol', a: NAVY, an: 'Navy', b: LIME, bn: 'Lima' };
  const cfgArt = () => {
    const s = CFG_SPORT[cfg.sport];
    const num = $('#cfgNum').value.replace(/\D/g, '') || '0';
    const team = $('#cfgTeam').value.trim();
    return s.kind === 'tank' ? ['tank', cfg.a, cfg.b, num, team] : ['jersey', cfg.a, cfg.b, num, team, s.style];
  };
  function drawConfig() {
    const art = cfgArt();
    $('#configArt').innerHTML = draw(art);
    $('#configCaption').textContent = `${SPORTS[cfg.sport]} · ${$('#cfgKit').value} · ${cfg.an} / ${cfg.bn} · #${art[3]}`;
    $('#cfgPrice').textContent = money(byId[CFG_SPORT[cfg.sport].id].price);
  }
  $('#cfgSport').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    cfg.sport = b.dataset.s;
    $$('#cfgSport button').forEach((x) => x.classList.toggle('is-on', x === b));
    drawConfig();
  });
  $$('.swatches').forEach((group) =>
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', group).forEach((x) => x.classList.toggle('is-on', x === b));
      cfg[group.dataset.target] = b.dataset.c;
      cfg[group.dataset.target + 'n'] = b.dataset.n;
      drawConfig();
    })
  );
  ['#cfgNum', '#cfgTeam', '#cfgKit'].forEach((s) => $(s).addEventListener('input', drawConfig));
  $('#cfgAdd').addEventListener('click', () => {
    const art = cfgArt();
    const team = $('#cfgTeam').value.trim();
    addToCart({
      id: CFG_SPORT[cfg.sport].id, size: 'M', qty: 15,
      custom: `${$('#cfgKit').value} · ${cfg.an}/${cfg.bn} · #${art[3]}${team ? ' · ' + team : ''}`,
      art,
    });
  });
  drawConfig();

  /* ---------------- Modal de producto ---------------- */
  const pm = { id: null, size: null, qty: 1 };
  function openProduct(pid) {
    const p = byId[pid];
    if (!p) return;
    const sizes = SIZES[p.sizes] || [];
    Object.assign(pm, { id: pid, size: sizes[Math.floor(sizes.length / 2)] || null, qty: 1 });
    $('#pmArt').innerHTML = artOf(p);
    $('#pmCat').textContent = catLabel(p);
    $('#pmTitle').textContent = p.name;
    $('#pmPrice').textContent = (p.custom ? 'Desde ' : '') + money(p.price);
    $('#pmDesc').textContent = p.desc;
    $('#pmQty').textContent = '1';
    $('#pmOptions').innerHTML = `
      ${sizes.length ? `<p class="opt-label">Talla <a href="#" class="fine" onclick="return false">Guía de tallas</a></p>
      <div class="sizes" role="radiogroup">${sizes.map((s) => `<button type="button" role="radio" aria-checked="${s === pm.size}" class="${s === pm.size ? 'is-on' : ''}" data-size="${s}">${s}</button>`).join('')}</div>` : ''}
      ${p.custom ? `<div class="row"><label class="field"><span>Dorsal</span><input id="pmNum" inputmode="numeric" maxlength="2" placeholder="00"></label>
      <label class="field"><span>Nombre en espalda</span><input id="pmName" maxlength="14" placeholder="Opcional"></label></div>
      <p class="fine">Pedidos de 15 o más unidades: descuento por volumen aplicado automáticamente.</p>` : ''}`;
    $$('#pmOptions [data-size]').forEach((b) =>
      b.addEventListener('click', () => {
        pm.size = b.dataset.size;
        $$('#pmOptions [data-size]').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); });
      })
    );
    if (p.custom) {
      $('#pmNum').addEventListener('input', (e) => {
        const n = e.target.value.replace(/\D/g, '');
        e.target.value = n;
        $('#pmArt').innerHTML = draw(withNum(p.art, n || p.art[3]));
      });
    }
    openOverlay('#productOverlay');
  }
  $$('[data-q]').forEach((b) =>
    b.addEventListener('click', () => {
      pm.qty = Math.max(1, Math.min(99, pm.qty + Number(b.dataset.q)));
      $('#pmQty').textContent = pm.qty;
    })
  );
  $('#pmAdd').addEventListener('click', () => {
    const p = byId[pm.id];
    let custom = '', art;
    if (p.custom) {
      const n = $('#pmNum').value, nm = $('#pmName').value.trim();
      if (n || nm) {
        custom = [n && `#${n}`, nm].filter(Boolean).join(' · ');
        art = withNum(p.art, n || p.art[3]);
      }
    }
    addToCart({ id: p.id, size: pm.size, qty: pm.qty, custom, art });
    closeOverlay('#productOverlay');
  });

  /* ---------------- Bolsa ---------------- */
  const FREE_SHIP = 150;
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('nyr-cart')) || []; } catch (_) { cart = []; }
  cart = cart.filter((i) => byId[i.id] && (!i.art || Art[i.art[0]]));
  const save = () => { try { localStorage.setItem('nyr-cart', JSON.stringify(cart)); } catch (_) {} };
  const keyOf = (i) => `${i.id}|${i.size || ''}|${i.custom || ''}`;
  const volumeRate = (qty) => (qty >= 60 ? 0.22 : qty >= 30 ? 0.15 : qty >= 15 ? 0.1 : 0);
  const lineTotal = (i) => {
    const p = byId[i.id];
    const disc = p.custom ? volumeRate(i.qty) : 0;
    return p.price * i.qty * (1 - disc);
  };
  const subtotal = () => cart.reduce((s, i) => s + lineTotal(i), 0);
  const count = () => cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(item) {
    const k = keyOf(item);
    const found = cart.find((i) => keyOf(i) === k);
    if (found) found.qty = Math.min(999, found.qty + item.qty);
    else cart.push(item);
    save();
    renderCart();
    bumpBadge();
    toast(`${byId[item.id].name} añadido a la bolsa`, 'Ver bolsa', () => openOverlay('#cartOverlay'));
  }

  function renderCart() {
    const c = count();
    const badge = $('#cartCount');
    badge.hidden = c === 0;
    badge.textContent = c;
    const sub = subtotal();
    const left = Math.max(0, FREE_SHIP - sub);
    $('#shipMeter p').innerHTML = left > 0 ? `Te faltan <b>${money(left)}</b> para el envío gratis` : '<b>¡Envío estándar gratis!</b>';
    $('#shipMeter i').style.width = `${Math.min(100, (sub / FREE_SHIP) * 100)}%`;
    $('#cartFoot').hidden = c === 0;
    $('#cartSubtotal').textContent = money(sub);
    $('#cartList').innerHTML = c === 0
      ? `<li class="empty"><div>${Art.jersey('#D9DDE4', '#EEF0F4', '', '', 'soccer')}</div><p>Tu bolsa está vacía.</p><a href="#equipamiento" class="link-arrow" data-close>Descubrir equipamiento</a></li>`
      : cart.map((i, idx) => {
          const p = byId[i.id];
          const disc = p.custom ? volumeRate(i.qty) : 0;
          return `<li class="line">
            <div class="line__art">${itemArt(i)}</div>
            <div class="line__info">
              <b>${p.name}</b>
              <small>${[i.size && `Talla ${i.size}`, i.custom].filter(Boolean).join(' · ')}</small>
              ${disc ? `<small class="save">−${disc * 100}% por volumen</small>` : ''}
              <div class="line__ctl">
                <div class="qty qty--sm"><button data-dec="${idx}" aria-label="Menos">−</button><output>${i.qty}</output><button data-inc="${idx}" aria-label="Más">+</button></div>
                <button class="link" data-rm="${idx}">Eliminar</button>
              </div>
            </div>
            <b class="line__price">${money(lineTotal(i))}</b>
          </li>`;
        }).join('');
  }
  $('#cartList').addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.inc) cart[t.dataset.inc].qty++;
    if (t.dataset.dec) { const i = cart[t.dataset.dec]; i.qty > 1 ? i.qty-- : cart.splice(t.dataset.dec, 1); }
    if (t.dataset.rm) cart.splice(t.dataset.rm, 1);
    save(); renderCart();
  });
  function bumpBadge() {
    const b = $('#cartBtn');
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  $('#cartBtn').addEventListener('click', () => openOverlay('#cartOverlay'));
  renderCart();

  /* ---------------- Overlays ---------------- */
  let lastFocus = null;
  function openOverlay(sel) {
    lastFocus = document.activeElement;
    $('#toast').classList.remove('is-on');
    const o = $(sel);
    o.hidden = false;
    requestAnimationFrame(() => o.classList.add('is-open'));
    document.body.classList.add('lock');
    setTimeout(() => o.querySelector('button, input, a')?.focus({ preventScroll: true }), 50);
  }
  function closeOverlay(sel) {
    const o = typeof sel === 'string' ? $(sel) : sel;
    o.classList.remove('is-open');
    setTimeout(() => { o.hidden = true; }, 280);
    if (!$$('.overlay.is-open, .checkout.is-open').length) document.body.classList.remove('lock');
    lastFocus?.focus?.({ preventScroll: true });
  }
  $$('.overlay').forEach((o) =>
    o.addEventListener('click', (e) => {
      if (e.target === o || e.target.closest('[data-close]')) closeOverlay(o);
    })
  );
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $$('.overlay.is-open');
    if (open.length) closeOverlay(open[open.length - 1]);
    else if (!$('#checkout').hidden) closeCheckout();
    else if (!$('#search').hidden) toggleSearch(false);
  });

  /* ---------------- Buscador ---------------- */
  function toggleSearch(force) {
    const s = $('#search');
    const show = force ?? s.hidden;
    s.hidden = !show;
    if (show) { $('#searchInput').value = ''; $('#searchResults').innerHTML = ''; $('#searchInput').focus(); }
  }
  $('#searchBtn').addEventListener('click', () => toggleSearch());
  $('#searchInput').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const hits = q ? PRODUCTS.filter((p) => norm(`${p.name} ${p.sub} ${SPORTS[p.sport]} ${p.brand || ''} ${p.type || ''}`).includes(q)).slice(0, 6) : [];
    $('#searchResults').innerHTML = q && !hits.length
      ? '<p class="muted">Sin resultados.</p>'
      : hits.map((p) => `<button class="hit" data-open="${p.id}"><span>${artOf(p)}</span><b>${p.name}</b><small>${money(p.price)}</small></button>`).join('');
  });
  $('#searchResults').addEventListener('click', () => toggleSearch(false));

  /* ---------------- Checkout ---------------- */
  const co = { step: 1, ship: 'std', promo: 0, pay: 'card' };
  const shipCost = () => (co.ship === 'exp' ? 9.9 : co.ship === 'club' ? 0 : subtotal() >= FREE_SHIP ? 0 : 4.9);
  const discount = () => subtotal() * co.promo;
  const total = () => subtotal() - discount() + shipCost();

  function renderSummary() {
    $('#sumList').innerHTML = cart.map((i) => {
      const p = byId[i.id];
      return `<li><div class="sum-art">${itemArt(i)}<span>${i.qty}</span></div>
        <div><b>${p.name}</b><small>${[i.size && `Talla ${i.size}`, i.custom].filter(Boolean).join(' · ')}</small></div>
        <b>${money(lineTotal(i))}</b></li>`;
    }).join('');
    $('#sumSub').textContent = money(subtotal());
    $('#sumDiscRow').hidden = !co.promo;
    $('#sumDisc').textContent = `−${money(discount())}`;
    $('#sumShip').textContent = co.step < 2 ? 'Siguiente paso' : shipCost() ? money(shipCost()) : 'Gratis';
    $('#sumTotal').textContent = money(total());
    $('#sumTotalTop').textContent = money(total());
    $('#payTotal').textContent = money(total());
    $('[data-ship-price="std"]').textContent = subtotal() >= FREE_SHIP ? 'Gratis' : money(4.9);
  }

  function goStep(n) {
    co.step = n;
    $$('#checkout .step').forEach((s) => s.classList.toggle('is-on', Number(s.dataset.step) === n));
    $$('#progress li').forEach((li, i) => {
      li.classList.toggle('is-on', i + 1 === n);
      li.classList.toggle('is-done', i + 1 < n);
    });
    $('#checkout').classList.toggle('is-done', n === 4);
    const v = (s) => $(s).value.trim();
    const recap = `<div><small>Contacto</small><span>${esc(v('#coEmail'))}</span><button class="link" data-prev="1">Cambiar</button></div>
      <div><small>Enviar a</small><span>${esc(`${v('#coAddr')}, ${v('#coZip')} ${v('#coCity')}, ${v('#coCountry')}`)}</span><button class="link" data-prev="1">Cambiar</button></div>`;
    $('#recap1').innerHTML = recap;
    const shipLabel = $(`#shipOptions input[value="${co.ship}"]`).closest('.opt').querySelector('b').textContent;
    $('#recap2').innerHTML = recap + `<div><small>Método</small><span>${shipLabel}</span><button class="link" data-prev="2">Cambiar</button></div>`;
    renderSummary();
    $('.checkout__main').scrollTo?.({ top: 0, behavior: 'smooth' });
    $('#checkout').scrollTo?.({ top: 0, behavior: 'smooth' });
  }
  const esc = (t) => t.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  function validate(fields) {
    let ok = true;
    fields.forEach(([sel, test]) => {
      const el = $(sel);
      const good = test ? test(el.value.trim()) : el.value.trim().length > 0;
      el.closest('.field').classList.toggle('is-error', !good);
      if (!good && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  const STEP1 = [
    ['#coEmail', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)],
    ['#coName'], ['#coLast'], ['#coAddr'],
    ['#coZip', (v) => /^\d{4,5}$/.test(v)], ['#coCity'],
    ['#coPhone', (v) => v.replace(/\D/g, '').length >= 9],
  ];

  $('#checkout').addEventListener('click', (e) => {
    const next = e.target.closest('[data-next]');
    const prev = e.target.closest('[data-prev]');
    if (next) {
      const n = Number(next.dataset.next);
      if (n === 2 && !validate(STEP1)) return;
      goStep(n);
    }
    if (prev) goStep(Number(prev.dataset.prev));
    if (e.target.closest('[data-close-checkout]')) { e.preventDefault(); closeCheckout(); }
    if (e.target.closest('[data-express]')) {
      const btn = e.target.closest('[data-express]');
      btn.classList.add('is-loading');
      setTimeout(() => { btn.classList.remove('is-loading'); finishOrder('pago exprés'); }, 1200);
    }
  });
  $('#checkout').addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-error'));
  $('#shipOptions').addEventListener('change', (e) => { co.ship = e.target.value; renderSummary(); });

  function openCheckout() {
    if (!cart.length) return;
    closeOverlay('#cartOverlay');
    const c = $('#checkout');
    c.hidden = false;
    requestAnimationFrame(() => c.classList.add('is-open'));
    document.body.classList.add('lock');
    goStep(1);
  }
  function closeCheckout() {
    const c = $('#checkout');
    c.classList.remove('is-open');
    setTimeout(() => { c.hidden = true; }, 300);
    document.body.classList.remove('lock');
  }
  $('#checkoutBtn').addEventListener('click', openCheckout);

  $('#summaryToggle').addEventListener('click', (e) => {
    const s = $('#summary');
    s.classList.toggle('is-open');
    e.currentTarget.setAttribute('aria-expanded', s.classList.contains('is-open'));
  });

  $('#promoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = $('#promoInput').value.trim().toUpperCase();
    if (code === 'EQUIPO10') {
      co.promo = 0.1;
      $('#promoMsg').innerHTML = '<span class="ok">✓ EQUIPO10 aplicado: −10%</span>';
    } else {
      $('#promoMsg').innerHTML = '<span class="err">Código no válido</span>';
    }
    renderSummary();
  });

  // Métodos de pago
  $$('.paytabs button').forEach((b) =>
    b.addEventListener('click', () => {
      co.pay = b.dataset.pay;
      $$('.paytabs button').forEach((x) => x.classList.toggle('is-on', x === b));
      $$('.paypane').forEach((p) => p.classList.toggle('is-on', p.dataset.pane === co.pay));
    })
  );

  // Tarjeta en vivo
  const brandOf = (n) => (/^4/.test(n) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(n) ? 'MASTERCARD' : /^3[47]/.test(n) ? 'AMEX' : 'TARJETA');
  $('#cardNum').addEventListener('input', (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = d.replace(/(.{4})/g, '$1 ').trim();
    $('#ccNum').textContent = (d + '•'.repeat(16 - d.length)).replace(/(.{4})/g, '$1 ').trim();
    $('#ccBrand').textContent = brandOf(d);
  });
  $('#cardName').addEventListener('input', (e) => { $('#ccName').textContent = e.target.value.toUpperCase() || 'NOMBRE APELLIDO'; });
  $('#cardExp').addEventListener('input', (e) => {
    let d = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (d.length > 2) d = `${d.slice(0, 2)}/${d.slice(2)}`;
    e.target.value = d;
    $('#ccExp').textContent = d || 'MM/AA';
  });
  $('#cardCvc').addEventListener('focus', () => $('#cc').classList.add('is-flip'));
  $('#cardCvc').addEventListener('blur', () => $('#cc').classList.remove('is-flip'));
  $('#cardCvc').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });

  const luhn = (n) => {
    let s = 0;
    [...n].reverse().forEach((d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; });
    return n.length >= 13 && s % 10 === 0;
  };
  const expOk = (v) => {
    const m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m || +m[1] < 1 || +m[1] > 12) return false;
    const now = new Date();
    return new Date(2000 + +m[2], +m[1]) > now;
  };

  $('#payBtn').addEventListener('click', () => {
    if (co.pay === 'card' && !validate([
      ['#cardNum', (v) => luhn(v.replace(/\D/g, ''))],
      ['#cardName'],
      ['#cardExp', expOk],
      ['#cardCvc', (v) => /^\d{3,4}$/.test(v)],
    ])) return;
    const b = $('#payBtn');
    b.classList.add('is-loading');
    b.disabled = true;
    setTimeout(() => { b.classList.remove('is-loading'); b.disabled = false; finishOrder(co.pay); }, 1400);
  });

  function finishOrder() {
    const id = `NYR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
    const name = $('#coName').value.trim();
    const email = $('#coEmail').value.trim();
    $('#doneMsg').textContent = `${name ? `Gracias, ${name}. ` : 'Gracias. '}Hemos recibido tu pedido de ${money(total())}${email ? ` y te enviaremos la confirmación a ${email}` : ''}.`;
    $('#orderId').textContent = `Pedido ${id}`;
    goStep(4);
    cart = []; save(); renderCart();
    co.promo = 0;
  }

  /* ---------------- Formularios ---------------- */
  $('#quoteBtn').addEventListener('click', () => $('#distribucion').scrollIntoView({ behavior: 'smooth' }));
  $('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    let ok = true;
    $$('input[required]', f).forEach((i) => {
      const good = i.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value) : i.value.trim();
      i.closest('.field').classList.toggle('is-error', !good);
      if (!good) ok = false;
    });
    if (!ok) return;
    f.innerHTML = `<div class="done done--sm"><svg viewBox="0 0 80 80" class="done__check"><circle cx="40" cy="40" r="36"/><path d="M25 41l10 10 21-22"/></svg><h3>Solicitud enviada</h3><p class="muted">Un gestor de cuenta te escribirá en menos de 24 h.</p></div>`;
  });
  $('#quoteForm').addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-error'));
  $('#newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.reset();
    toast('¡Gracias! Te avisaremos de las novedades.');
  });

  /* ---------------- Toast ---------------- */
  let tt;
  function toast(msg, action, fn) {
    const t = $('#toast');
    t.innerHTML = `<span>${msg}</span>${action ? `<button>${action}</button>` : ''}`;
    if (action) t.querySelector('button').onclick = () => { t.classList.remove('is-on'); fn(); };
    t.classList.add('is-on');
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove('is-on'), 3200);
  }

  /* ---------------- Nav, menú, animaciones ---------------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('#menuBtn').addEventListener('click', (e) => {
    const open = nav.classList.toggle('is-menu');
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('is-menu')));

  function observeReveal(root = document) {
    const els = $$('.reveal:not(.is-in)', root);
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    io ||= new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  }
  observeReveal();

  const statIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    statIO.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, suf = el.dataset.suffix || '', plus = suf ? '' : '+';
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
      el.textContent = `${plus}${Math.round(to * e)}${suf}`;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  $$('[data-count]').forEach((el) => statIO.observe(el));

  $('#year').textContent = new Date().getFullYear();
})();
