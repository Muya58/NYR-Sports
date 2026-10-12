# NYR Sports — Web e-commerce

Landing y tienda online minimalista (estética Apple) para distribución de material de fútbol americano.
Navy `#0B1F3A` para estructura, lima `#C6F432` para llamadas a la acción. HTML/CSS/JS sin dependencias.

## Ver en local
```bash
npx serve .
```

## Estructura
- `index.html` — landing, catálogo, modal de producto, bolsa y checkout
- `css/styles.css` — sistema de diseño y responsive
- `js/app.js` — catálogo (`PRODUCTS`), configurador de uniformes, bolsa, checkout
- `js/art.js` — renders SVG de producto
- `assets/logo.svg` — logo de cristal
- `assets/img/hero-athlete.jpg` — (opcional) foto de hero; si existe se muestra sobre el render
- `obsidian/NYR-Sports/` — vault de Obsidian con diario y documentación del proyecto

> El pago es una simulación de UX. Para producción conectar Stripe / Redsys / Bizum y un backend de pedidos.

![Vista escritorio](docs/preview-checkout.png)
