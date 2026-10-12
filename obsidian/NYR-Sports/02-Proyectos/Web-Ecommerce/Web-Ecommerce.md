---
estado: prototipo funcional
inicio: 2026-10-12
tags: [proyecto, web]
---
# 🛒 Web e-commerce NYR Sports

**Estado:** prototipo funcional (front-end) · Repo `muya58/nyr-sports`, rama `claude/relaxed-keller-sriibd`

## Archivos
- `index.html` — estructura de todas las secciones, modal, bolsa y checkout
- `css/styles.css` — tokens de diseño y estilos (responsive)
- `js/art.js` — renders SVG de producto (casco, hombreras, botas, jersey, pantalón, guantes, balón)
- `js/app.js` — catálogo, buscador, configurador, bolsa, checkout
- `assets/logo.svg` — logo de cristal

## Cómo verlo
`npx serve .` en la carpeta del repo y abrir `http://localhost:3000`.

## Cómo editar productos
Array `PRODUCTS` en `js/app.js`: `id, sport, brand, name, sub, price, art, sizes, custom, tag, desc`.
- `sport`: futbol · baloncesto · voley · balonmano · americano · beisbol · multi
- `brand: 'Forelle'` → aparece con etiqueta y en el filtro Forelle

## Reglas de negocio implementadas
- Envío estándar 4,90 € · gratis desde 150 € · exprés 9,90 € · entrega en club gratis
- Equipaciones personalizables: −10% (15+), −15% (30+), −22% (60+)
- Código promo demo: `EQUIPO10` (−10%)

## Para producción
- [ ] Pasarela real (Stripe / Redsys / Bizum) y backend de pedidos
- [ ] Fotografía real · SEO (schema Product) · analítica · legal (cookies, RGPD)
- [ ] Hosting (Vercel / Netlify) y dominio

## Historial
- [[2026-10-12]] — creación del prototipo
- [[2026-10-12]] (sesión 2) — reorientación multideporte, multimarca y Forelle
