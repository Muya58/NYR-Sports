---
estado: tema y catálogo preparados, pendiente de tienda
tags: [proyecto, shopify]
---
# 🛍️ Migración a Shopify

**Decisión (12/10/2026):** la tienda se monta en Shopify. La web actual (repo) es el diseño de referencia.

## Pendiente de José
- [ ] Hablar con el socio: ¿usamos su tienda Shopify existente o una nueva?
- [ ] Darme acceso a la tienda elegida

## Plan
1. **Estructura** (gratis durante la prueba): colecciones Fútbol, Baloncesto, Vóley, Balonmano, Fútbol americano, Béisbol y softball, Calzado, Forelle. Productos en borrador con tallas como variantes.
2. **Tema**: convertir el diseño del repo en un tema Shopify (logo, colores, configurador, filtro Forelle) y subirlo sin publicar.
3. **Catálogo real**: fotos, precios, marcas.
4. **Antes de abrir**: plan de pago, Shopify Payments (+ PayPal, Bizum/Redsys vía apps), envíos e impuestos, textos legales, dominio.

## A tener en cuenta
- **Canarias**: IGIC en lugar de IVA y paso por aduana → zonas de envío e impuestos separadas (Península, Baleares, Canarias). Confirmar con gestoría.
- **B2B** (clubes/colegios): B2B nativo solo en Shopify Plus → usar descuentos automáticos por volumen, pedidos en borrador o app de presupuestos.
- **Personalización** (dorsal, nombre, colores): guardar como propiedades de línea del pedido para producción.

## Avance 15/10/2026
- Tema a medida listo: `shopify-theme/` → `dist/nyr-sports-theme.zip` (guía en `shopify-theme/README.md`).
- Catálogo Forelle convertido: `catalogo/shopify/forelle-productos-0X.csv` (2.525 productos, borrador).
- Ver [[2026-10-15]].
