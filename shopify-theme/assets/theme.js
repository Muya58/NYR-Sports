/* NYR Sports — tema Shopify. Sin dependencias.
   Bolsa lateral (Ajax Cart API + Section Rendering API), selector de variantes,
   configurador de equipaciones, pestañas, filtros, menú y animaciones. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = window.NYR?.routes || { root: '/', cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change' };
  const S = window.NYR?.strings || {};
  const renderArt = (root) => window.NYRArt && window.NYRArt.renderAll(root || document);

  /* ---------------- Toast ---------------- */
  let tt;
  function toast(msg, action, fn) {
    const t = $('#toast');
    if (!t) return;
    t.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = msg;
    t.append(span);
    if (action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = action;
      b.onclick = () => { t.classList.remove('is-on'); fn(); };
      t.append(b);
    }
    t.classList.add('is-on');
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove('is-on'), 3200);
  }

  /* ---------------- Overlays ---------------- */
  let lastFocus = null;
  function openOverlay(o) {
    if (!o) return;
    lastFocus = document.activeElement;
    $('#toast')?.classList.remove('is-on');
    o.hidden = false;
    requestAnimationFrame(() => o.classList.add('is-open'));
    document.body.classList.add('lock');
    setTimeout(() => o.querySelector('button, a, input')?.focus({ preventScroll: true }), 60);
  }
  function closeOverlay(o) {
    if (!o) return;
    o.classList.remove('is-open');
    setTimeout(() => { o.hidden = true; }, 280);
    document.body.classList.remove('lock');
    lastFocus?.focus?.({ preventScroll: true });
  }
  document.addEventListener('click', (e) => {
    const o = e.target.closest('.overlay');
    if (o && (e.target === o || e.target.closest('[data-close]'))) closeOverlay(o);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $('.overlay.is-open');
    if (open) closeOverlay(open);
    else if ($('#search') && !$('#search').hidden) toggleSearch(false);
  });

  /* ---------------- Bolsa ---------------- */
  const cartOverlay = () => $('#cartOverlay');
  async function refreshCart(open) {
    try {
      const res = await fetch(`${R.root}?sections=cart-drawer`);
      const data = await res.json();
      const html = new DOMParser().parseFromString(data['cart-drawer'], 'text/html');
      const fresh = html.querySelector('#cartOverlay');
      const cur = cartOverlay();
      if (fresh && cur) {
        const wasOpen = cur.classList.contains('is-open');
        cur.innerHTML = fresh.innerHTML;
        renderArt(cur);
        if (wasOpen) cur.querySelector('.close')?.focus({ preventScroll: true });
      }
      const cart = await (await fetch(`${R.cart}.js`)).json();
      const badge = $('#cartCount');
      if (badge) { badge.hidden = cart.item_count === 0; badge.textContent = cart.item_count; }
      const btn = $('#cartBtn');
      btn?.classList.remove('bump'); void btn?.offsetWidth; btn?.classList.add('bump');
      if (open && !cartOverlay().classList.contains('is-open')) openOverlay(cartOverlay());
    } catch (err) {
      window.location.href = R.cart;
    }
  }
  async function addToCart(items, name) {
    const res = await fetch(`${R.cartAdd}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.description || data.message || S.error);
    const openDrawer = document.body.dataset.cartDrawer !== 'false';
    await refreshCart(openDrawer);
    if (!openDrawer) toast(`${name || ''} ${S.added || ''}`.trim(), S.viewCart, () => openOverlay(cartOverlay()));
    return data;
  }
  async function changeLine(line, quantity) {
    const box = cartOverlay();
    box?.classList.add('is-busy');
    await fetch(`${R.cartChange}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: Number(line), quantity: Math.max(0, Number(quantity)) }),
    });
    await refreshCart(false);
    box?.classList.remove('is-busy');
  }
  document.addEventListener('click', (e) => {
    const lineBtn = e.target.closest('#cartOverlay [data-line]');
    if (lineBtn) { changeLine(lineBtn.dataset.line, lineBtn.dataset.qty); return; }
    const cartBtn = e.target.closest('#cartBtn');
    if (cartBtn && cartOverlay()) { e.preventDefault(); openOverlay(cartOverlay()); return; }
    const quick = e.target.closest('[data-quick-add]');
    if (quick) {
      e.preventDefault();
      quick.classList.add('is-loading');
      const name = quick.closest('.product')?.querySelector('h3')?.textContent;
      addToCart([{ id: Number(quick.dataset.quickAdd), quantity: 1 }], name)
        .catch((err) => toast(err.message))
        .finally(() => quick.classList.remove('is-loading'));
    }
  });

  /* ---------------- Ficha de producto ---------------- */
  $$('[data-product-section]').forEach((sec) => {
    const form = $('[data-product-form]', sec);
    if (!form) return;
    let variants = [];
    try { variants = JSON.parse($('[data-variants]', sec).textContent); } catch (_) {}
    const idInput = $('[data-variant-id]', form);
    const addBtn = $('[data-add-btn]', form);
    const priceEl = $('[data-price]', sec);
    const main = $('[data-main-media]', sec);
    const err = $('[data-form-error]', form);

    function current() {
      const opts = $$('fieldset.opt', form).map((fs) => $('input:checked', fs)?.value);
      return variants.find((v) => v.options.every((o, i) => o === opts[i]));
    }
    function markAvailability() {
      // Tacha las opciones que no existen o están agotadas con la selección actual
      const fieldsets = $$('fieldset.opt', form);
      const sel = fieldsets.map((fs) => $('input:checked', fs)?.value);
      fieldsets.forEach((fs, idx) => {
        $$('input', fs).forEach((inp) => {
          const test = [...sel]; test[idx] = inp.value;
          const ok = variants.some((v) => v.available && v.options.every((o, i) => o === test[i]));
          inp.closest('.pill').classList.toggle('is-unavailable', !ok);
        });
      });
    }
    function update() {
      const v = current();
      $$('fieldset.opt', form).forEach((fs, i) => {
        const out = $(`[data-option-value="${i}"]`, fs);
        if (out) out.textContent = $('input:checked', fs)?.value || '';
      });
      markAvailability();
      if (!v) { addBtn.disabled = true; return; }
      idInput.value = v.id;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? addBtn.dataset.labelAdd : addBtn.dataset.labelSold;
      priceEl.innerHTML = (v.compare ? `<s class="muted">${v.compare}</s> ` : '') + v.price;
      if (v.image && main) {
        main.innerHTML = `<img src="${v.image}" alt="">`;
      }
      const url = new URL(location.href);
      url.searchParams.set('variant', v.id);
      history.replaceState({}, '', url);
    }
    form.addEventListener('change', (e) => { if (e.target.matches('[data-option]')) update(); });
    if (variants.length > 1) markAvailability();

    $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => {
      const q = $('input[name="quantity"]', form);
      q.value = Math.max(1, (Number(q.value) || 1) + Number(b.dataset.step));
    }));

    $$('[data-thumb]', sec).forEach((t) => t.addEventListener('click', () => {
      $$('[data-thumb]', sec).forEach((x) => x.classList.toggle('is-on', x === t));
      main.innerHTML = `<img src="${t.dataset.thumb}" alt="">`;
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      err.hidden = true;
      const fd = new FormData(form);
      const properties = {};
      for (const [k, v] of fd.entries()) {
        const m = /^properties\[(.+)\]$/.exec(k);
        if (m && String(v).trim()) properties[m[1]] = String(v).trim();
      }
      addBtn.classList.add('is-loading');
      addToCart([{ id: Number(fd.get('id')), quantity: Number(fd.get('quantity')) || 1, properties }], $('.pdp__title', sec)?.textContent)
        .catch((ex) => { err.textContent = ex.message; err.hidden = false; })
        .finally(() => addBtn.classList.remove('is-loading'));
    });
  });

  /* ---------------- Configurador ---------------- */
  $$('[data-configurator]').forEach((box) => {
    const sec = box.closest('section');
    let sports = [];
    try { sports = JSON.parse($('[data-config-data]', sec).textContent); } catch (_) {}
    if (!sports.length) return;
    const form = $('[data-config-form]', box);
    const st = { i: 0, a: null, an: '', b: null, bn: '' };
    $$('.swatches', form).forEach((g) => {
      const on = $('button.is-on', g) || $('button', g);
      if (on) { st[g.dataset.target] = on.dataset.c; st[g.dataset.target + 'n'] = on.dataset.n; }
    });
    const sizeSel = $('[data-config-size]', form);

    function art() {
      const s = sports[st.i];
      const num = (form.num.value.replace(/\D/g, '') || '0').slice(0, 2);
      const team = form.team.value.trim();
      return s.garment === 'tank'
        ? window.NYRArt.tank(st.a, st.b, num, team)
        : window.NYRArt.jersey(st.a, st.b, num, team, s.garment);
    }
    function fillSizes() {
      const s = sports[st.i];
      sizeSel.innerHTML = s.variants.map((v) => `<option value="${v.id}"${v.available ? '' : ' disabled'}>${v.title === 'Default Title' ? '—' : v.title}${v.available ? '' : ' ✕'}</option>`).join('');
      const firstOk = s.variants.find((v) => v.available);
      if (firstOk) sizeSel.value = firstOk.id;
      $('[data-config-price]', box).textContent = s.variants[0]?.price || '—';
      const missing = !s.variants.length;
      $('[data-config-note]', box).hidden = !missing;
      $('[data-config-add]', box).disabled = missing;
    }
    function draw() {
      if (!window.NYRArt) return;
      $('[data-config-art]', box).innerHTML = art();
      $('[data-config-caption]', box).textContent = `${sports[st.i].label} · ${form.kit.value} · ${st.an} / ${st.bn} · #${form.num.value || 0}`;
    }
    $$('[data-sport]', box).forEach((b) => b.addEventListener('click', () => {
      st.i = Number(b.dataset.sport);
      $$('[data-sport]', box).forEach((x) => x.classList.toggle('is-on', x === b));
      fillSizes(); draw();
    }));
    $$('.swatches', form).forEach((g) => g.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', g).forEach((x) => x.classList.toggle('is-on', x === b));
      st[g.dataset.target] = b.dataset.c; st[g.dataset.target + 'n'] = b.dataset.n;
      draw();
    }));
    form.addEventListener('input', draw);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = sports[st.i];
      const btn = $('[data-config-add]', box);
      btn.classList.add('is-loading');
      const properties = {
        Deporte: s.label,
        Equipación: form.kit.value,
        'Color principal': st.an,
        'Color detalle': st.bn,
        Dorsal: form.num.value || '—',
      };
      if (form.team.value.trim()) properties.Equipo = form.team.value.trim();
      addToCart([{ id: Number(sizeSel.value), quantity: Math.max(1, Number(form.qty.value) || 1), properties }], s.product)
        .catch((ex) => toast(ex.message))
        .finally(() => btn.classList.remove('is-loading'));
    });
    const init = () => { fillSizes(); draw(); };
    window.NYRArt ? init() : window.addEventListener('load', init);
  });

  /* ---------------- Pestañas de colecciones ---------------- */
  $$('[data-tabs]').forEach((tabs) => {
    const sec = tabs.closest('section');
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      $$('[data-tab]', tabs).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
      $$('[data-panel]', sec).forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
      tabs.scrollTo({ left: b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
      observeReveal(sec);
    });
  });

  /* ---------------- Filtros de colección ---------------- */
  $$('[data-filter-form]').forEach((f) => {
    let timer;
    f.addEventListener('change', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const params = new URLSearchParams(new FormData(f));
        for (const [k, v] of [...params.entries()]) if (v === '') params.delete(k);
        location.search = params.toString();
      }, 350);
    });
  });
  document.addEventListener('click', (e) => {
    $$('details.filter[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false; });
  });

  /* ---------------- Cabecera ---------------- */
  const nav = $('#nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    $('#menuBtn')?.addEventListener('click', (e) => {
      const open = nav.classList.toggle('is-menu');
      e.currentTarget.setAttribute('aria-expanded', open);
    });
  }
  function toggleSearch(force) {
    const s = $('#search');
    if (!s) return;
    const show = force ?? s.hidden;
    s.hidden = !show;
    $('#searchBtn')?.setAttribute('aria-expanded', show);
    if (show) $('#searchInput')?.focus();
  }
  $('#searchBtn')?.addEventListener('click', () => toggleSearch());

  /* ---------------- Animaciones ---------------- */
  let io;
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

  function boot() {
    renderArt();
    observeReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Editor de temas: re-renderiza al cambiar secciones
  document.addEventListener('shopify:section:load', (e) => { renderArt(e.target); observeReveal(e.target); });
})();
