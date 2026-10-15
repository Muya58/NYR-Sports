# Tema Shopify «NYR Sports»

Tema Online Store 2.0 a medida, con el diseño de la web de referencia (raíz del repo).
Validado con Theme Check oficial de Shopify: **0 errores, 0 avisos**.

Paquete listo para subir: [`dist/nyr-sports-theme.zip`](../dist/nyr-sports-theme.zip)

## 1. Subir el tema
1. Shopify admin → **Tienda online → Temas → Añadir tema → Subir archivo zip**.
2. Elige `nyr-sports-theme.zip`. Se sube **sin publicar**: puedes previsualizarlo y editarlo antes.
3. **Personalizar** abre el editor visual: todos los textos, colores, imágenes y secciones son editables.

## 2. Importar el catálogo Forelle
Los CSV están en [`catalogo/shopify/`](../catalogo/shopify/) (generados con `tools/forelle_to_shopify.py`).
1. **Productos → Importar** → sube `forelle-productos-01.csv` (y luego 02, 03…).
2. Los productos entran como **borrador** (no visibles) con fotos, tallas, colores, stock, EAN y SKU.
3. Para regenerar con otro margen o solo con stock:
   `python3 -I tools/forelle_to_shopify.py feed.xml catalogo/shopify --markup 1.0 --only-stock`

## 3. Crear colecciones automáticas (Productos → Colecciones → Crear)
Tipo **Automatizada**, condición «Etiqueta del producto es igual a»:

| Colección | Etiqueta |
|---|---|
| Fútbol americano | `futbol-americano` |
| Béisbol y softball | `beisbol-softball` |
| Calzado | `calzado` |
| Forelle | `forelle` |
| Cascos | `cascos` |
| Hombreras | `hombreras` |
| Bates | `bates` |
| Guantes de béisbol | `guantes-de-beisbol` |
| En stock | `en-stock` |

Después, en el editor del tema → sección **Tienda por colecciones**, asigna cada pestaña a su colección,
y en **Deportes (mosaico)** enlaza cada tarjeta.

## 4. Menús (Tienda online → Navegación)
- `main-menu`: Deportes, Personaliza (`/#personaliza`), Tienda, Forelle (colección), Clubes (`/#clubes`).
- `footer`: Envíos, Devoluciones, Guía de tallas, Contacto, Privacidad.

## 5. Filtros de colección
Instala la app gratuita **Search & Discovery** y activa filtros: Disponibilidad, Precio, Marca (Vendor),
Tipo de producto, Talla, Talla (US), Color, Mano. El tema los muestra automáticamente.

## 6. Configurador de equipaciones
Crea un producto por deporte (p. ej. «Equipación Fútbol Pro») con tallas como variantes y la etiqueta
`personalizable`. En el editor → sección **Configurador**, asigna cada producto a su deporte.
La personalización (deporte, colores, dorsal, equipo) llega al pedido como propiedades de línea.

## 7. Descuentos por volumen (Descuentos → Crear → Importe de descuento en productos, automático)
- −10% con cantidad mínima 15 · −15% con mínimo 30 · −22% con mínimo 60, aplicados a la colección
  de equipaciones personalizables. Shopify aplica automáticamente el mejor.

## 8. Checkout
El checkout lo gestiona Shopify (seguro y rápido). Personaliza su aspecto en
**Ajustes → Checkout → Personalizar**: logo, navy `#01144C` como color principal y lima `#B8FC0B` en botones.

## 9. Envíos e impuestos
- Zonas: **Península**, **Baleares** y **Canarias** por separado.
- Canarias: IGIC en lugar de IVA y despacho de aduanas → configurar en Ajustes → Impuestos (consultar gestoría).

## Renders sin foto
Mientras un producto no tenga foto, el tema puede mostrar un render vectorial si le pones una etiqueta
`art:tipo|colorA|colorB|dorsal|equipo|estilo` (p. ej. `art:jersey|#01144C|#B8FC0B|9||soccer`).
