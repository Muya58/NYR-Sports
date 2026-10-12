/* NYR Sports — tienda (catálogo, bolsa y checkout) sin dependencias. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const Art = window.NYRArt;
  let io; // IntersectionObserver de animaciones .reveal
  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const money = (n) => eur.format(n);

  const NAVY = '#0B1F3A', LIME = '#C6F432', WHITE = '#F2F4F7', BLACK = '#1D1D1F', ROYAL = '#1F6FEB', MAROON = '#B3122E';

  /* ---------------- Catálogo ---------------- */
  const SIZES = {
    ropa: ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    casco: ['S', 'M', 'L', 'XL'],
    hombrera: ['S', 'M', 'L', 'XL', '2XL'],
    bota: ['39', '40', '41', '42', '43', '44', '45', '46', '47'],
    guante: ['S', 'M', 'L', 'XL'],
    unica: [],
  };

  const PRODUCTS = [
    // Uniformes
    { id: 'u-pro', cat: 'uniformes', name: 'Jersey Pro Elite', sub: 'Sublimado · Malla técnica', price: 49, art: ['jersey', NAVY, LIME, '27'], sizes: 'ropa', custom: true, tag: 'Más vendido', desc: 'Corte atlético con paneles de malla ventilada y refuerzos en hombros. Numeración y nombre sublimados que no se agrietan.' },
    { id: 'u-away', cat: 'uniformes', name: 'Jersey Visitante Pro', sub: 'Sublimado · Malla técnica', price: 49, art: ['jersey', WHITE, NAVY, '12'], sizes: 'ropa', custom: true, desc: 'La versión visitante de nuestro jersey más vendido. Tejido de secado rápido y costuras planas.' },
    { id: 'u-school', cat: 'uniformes', name: 'Kit Colegio Varsity', sub: 'Jersey + pantalón', price: 69, art: ['jersey', ROYAL, WHITE, '08'], sizes: 'ropa', custom: true, tag: 'Tarifa edu', desc: 'Equipación completa para colegios y academias con escudo bordado. Tallas infantiles y adultas.' },
    { id: 'u-flag', cat: 'uniformes', name: 'Kit Flag Football Junior', sub: 'Camiseta + cinturón', price: 34, art: ['jersey', LIME, NAVY, '05'], sizes: 'ropa', custom: true, desc: 'Ligero y resistente, pensado para escuelas de flag football. Incluye cinturón con banderines.' },
    { id: 'u-pants', cat: 'uniformes', name: 'Pantalón Game Day', sub: 'Protecciones integradas', price: 39, art: ['pants', WHITE, NAVY], sizes: 'ropa', desc: 'Licra de 4 vías con bolsillos para protecciones de muslo y rodilla. Franja lateral personalizable.' },
    { id: 'u-train', cat: 'uniformes', name: 'Camiseta Practice', sub: 'Entrenamiento', price: 24, art: ['jersey', MAROON, WHITE, '44'], sizes: 'ropa', custom: true, desc: 'Camiseta de entrenamiento reversible en dos colores. Perfecta para dividir equipos en el entrenamiento.' },
    // Cascos
    { id: 'h-pro', cat: 'cascos', name: 'Casco NYR Pro Shell', sub: 'Adulto · 5★ Virginia Tech', price: 389, art: ['helmet', NAVY, LIME], sizes: 'casco', tag: 'Nuevo', desc: 'Carcasa de policarbonato y espuma TPU de triple densidad con ajuste por aire en 7 zonas. Incluye máscara de acero ligero.' },
    { id: 'h-speed', cat: 'cascos', name: 'Casco Speed Flex', sub: 'Adulto · Panel flexible', price: 299, art: ['helmet', BLACK, LIME], sizes: 'casco', desc: 'Panel frontal flexible que reduce la energía de impacto. Acolchado interior extraíble y lavable.' },
    { id: 'h-youth', cat: 'cascos', name: 'Casco Varsity Youth', sub: 'Juvenil · NOCSAE', price: 219, art: ['helmet', WHITE, NAVY], sizes: 'casco', desc: 'Diseñado para jugadores de 8 a 15 años. Ligero, homologado y con barboquejo de copa rígida.' },
    // Hombreras
    { id: 'p-lite', cat: 'hombreras', name: 'Hombreras Air Lite', sub: 'Skill · QB / WR / DB', price: 179, art: ['pads', NAVY, LIME], sizes: 'hombrera', tag: 'Ultraligeras', desc: 'Perfil bajo para máxima movilidad. Arco de PE y espuma perforada para una ventilación total.' },
    { id: 'p-line', cat: 'hombreras', name: 'Hombreras Lineman Max', sub: 'Línea · OL / DL', price: 249, art: ['pads', BLACK, LIME], sizes: 'hombrera', desc: 'Protección de cobertura amplia para el juego en trinchera. Placas reforzadas y cierre de doble lazo.' },
    { id: 'p-youth', cat: 'hombreras', name: 'Hombreras Youth Flex', sub: 'Juvenil · Todas las posiciones', price: 119, art: ['pads', ROYAL, WHITE], sizes: 'hombrera', desc: 'Ajuste versátil para jugadores en crecimiento. Ligeras, resistentes y fáciles de ajustar.' },
    // Botas
    { id: 'b-velo', cat: 'botas', name: 'Botas Velocity Low', sub: 'Skill · Tacos moldeados', price: 139, art: ['cleat', NAVY, LIME], sizes: 'bota', tag: 'Nuevo', desc: 'Placa de tracción agresiva y empeine de punto técnico. Ligereza pensada para receptores y backs.' },
    { id: 'b-trench', cat: 'botas', name: 'Botas Trench Mid', sub: 'Línea · Caña media', price: 159, art: ['cleat', BLACK, WHITE], sizes: 'bota', desc: 'Estabilidad lateral y soporte de tobillo para linieros. Mediasuela de alta densidad.' },
    { id: 'b-rookie', cat: 'botas', name: 'Botas Rookie Junior', sub: 'Juvenil · Multitaco', price: 79, art: ['cleat', WHITE, NAVY], sizes: 'bota', desc: 'Comodidad desde el primer día. Ideal para escuelas y primeras temporadas.' },
    // Accesorios
    { id: 'a-grip', cat: 'accesorios', name: 'Guantes Grip Receiver', sub: 'Palma de silicona', price: 49, art: ['gloves', NAVY, LIME], sizes: 'guante', desc: 'Agarre máximo en cualquier condición. Dorso transpirable y cierre de velcro.' },
    { id: 'a-line', cat: 'accesorios', name: 'Guantes Lineman', sub: 'Acolchado reforzado', price: 45, art: ['gloves', BLACK, WHITE], sizes: 'guante', desc: 'Protección acolchada en nudillos y dedos para el contacto en la línea.' },
    { id: 'a-ball', cat: 'accesorios', name: 'Balón Oficial Composite', sub: 'Talla 9 · Oficial', price: 59, art: ['ball'], sizes: 'unica', desc: 'Piel compuesta de grano profundo y laces de alto agarre. Homologado para competición.' },
  ];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const artOf = (p, override) => {
    const [kind, ...args] = p.art;
    return Art[kind](...(override || args));
  };

  /* ---------------- Grids ---------------- */
  function card(p) {
    return `<article class="product reveal" data-id="${p.id}" tabindex="0" aria-label="${p.name}, ${money(p.price)}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      <div class="product__art">${artOf(p)}</div>
      <div class="product__info">
        <h3>${p.name}</h3>
        <p class="muted">${p.sub}</p>
        <div class="product__row">
          <b>${money(p.price)}</b>
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
  renderGrid($('#gridUniforms'), PRODUCTS.filter((p) => p.cat === 'uniformes'));
  const gear = PRODUCTS.filter((p) => p.cat !== 'uniformes');
  function filterGear(f) {
    $$('#filters button').forEach((b) => {
      const on = b.dataset.f === f;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
    });
    renderGrid($('#gridGear'), f === 'todo' ? gear : gear.filter((p) => p.cat === f));
  }
  filterGear('todo');
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) filterGear(b.dataset.f);
  });
  $$('[data-filter]').forEach((a) => a.addEventListener('click', () => filterGear(a.dataset.filter)));

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
  $('#heroArt').innerHTML = Art.helmet(NAVY, LIME);
  $('#featureArt').innerHTML = Art.helmet('#132B4F', LIME);

  /* ---------------- Configurador ---------------- */
  const cfg = { a: NAVY, an: 'Navy', b: LIME, bn: 'Lima' };
  function drawConfig() {
    const num = $('#cfgNum').value.replace(/\D/g, '') || '0';
    const team = $('#cfgTeam').value.trim();
    $('#configArt').innerHTML = Art.jersey(cfg.a, cfg.b, num, team);
    $('#configCaption').textContent = `${$('#cfgKit').value} · ${cfg.an} / ${cfg.bn} · #${num}`;
  }
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
    const num = $('#cfgNum').value.replace(/\D/g, '') || '0';
    const team = $('#cfgTeam').value.trim();
    addToCart({
      id: 'u-pro', size: 'M', qty: 15,
      custom: `${$('#cfgKit').value} · ${cfg.an}/${cfg.bn} · #${num}${team ? ' · ' + team : ''}`,
      art: ['jersey', cfg.a, cfg.b, num, team],
    });
  });
  drawConfig();

  /* ---------------- Modal de producto ---------------- */
  const pm = { id: null, size: null, qty: 1 };
  function openProduct(pid) {
    const p = byId[pid];
    if (!p) return;
    Object.assign(pm, { id: pid, size: SIZES[p.sizes][Math.floor(SIZES[p.sizes].length / 2)] || null, qty: 1 });
    $('#pmArt').innerHTML = artOf(p);
    $('#pmCat').textContent = p.cat === 'uniformes' ? 'Uniformes' : p.cat[0].toUpperCase() + p.cat.slice(1);
    $('#pmTitle').textContent = p.name;
    $('#pmPrice').textContent = money(p.price);
    $('#pmDesc').textContent = p.desc;
    $('#pmQty').textContent = '1';
    const sizes = SIZES[p.sizes];
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
        const [, a, b] = p.art;
        $('#pmArt').innerHTML = Art.jersey(a, b, n || p.art[3]);
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
        art = ['jersey', p.art[1], p.art[2], n || p.art[3]];
      }
    }
    addToCart({ id: p.id, size: pm.size, qty: pm.qty, custom, art });
    closeOverlay('#productOverlay');
  });

  /* ---------------- Bolsa ---------------- */
  const FREE_SHIP = 150;
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('nyr-cart')) || []; } catch (_) { cart = []; }
  cart = cart.filter((i) => byId[i.id]);
  const save = () => { try { localStorage.setItem('nyr-cart', JSON.stringify(cart)); } catch (_) {} };
  const keyOf = (i) => `${i.id}|${i.size || ''}|${i.custom || ''}`;
  const volumeRate = (qty) => (qty >= 60 ? 0.22 : qty >= 30 ? 0.15 : qty >= 15 ? 0.1 : 0);
  const lineTotal = (i) => {
    const p = byId[i.id];
    const disc = p.cat === 'uniformes' ? volumeRate(i.qty) : 0;
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
      ? `<li class="empty"><div>${Art.helmet('#C9CED8', '#E5E8EE')}</div><p>Tu bolsa está vacía.</p><a href="#equipamiento" class="link-arrow" data-close>Descubrir equipamiento</a></li>`
      : cart.map((i, idx) => {
          const p = byId[i.id];
          const disc = p.cat === 'uniformes' ? volumeRate(i.qty) : 0;
          return `<li class="line">
            <div class="line__art">${artOf(p, i.art && i.art.slice(1))}</div>
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
    const hits = q ? PRODUCTS.filter((p) => norm(`${p.name} ${p.sub} ${p.cat}`).includes(q)).slice(0, 6) : [];
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
      return `<li><div class="sum-art">${artOf(p, i.art && i.art.slice(1))}<span>${i.qty}</span></div>
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
