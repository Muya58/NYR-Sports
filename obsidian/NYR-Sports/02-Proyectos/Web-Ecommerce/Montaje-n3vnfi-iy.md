---
fecha: 2026-10-16
proyecto: "[[Shopify]]"
tags: [shopify, guion, n3vnfi-iy]
estado: pendiente-conector
---
# Guion de montaje en `n3vnfi-iy`

Para ejecutar **en cuanto el conector de Shopify esté conectado a `n3vnfi-iy`**
(claude.ai → Personalizar → Conectores, y abrir una sesión nueva). Repite lo hecho en `t03nyq-fk`.

> [!important] Handles fijos
> El tema (`dist/nyr-sports-theme.zip`) ya trae `templates/index.json` apuntando a estos handles.
> Si las colecciones se crean con **exactamente** estos handles, el paso 3 queda hecho sin editar el tema.

## 1. Tema (sin publicar)
1. `stagedUploadsCreate` → `resource: THEME_ARCHIVE`, `filename: nyr-sports-theme.zip`,
   `mimeType: application/zip`, `httpMethod: POST`, `fileSize` = tamaño del zip.
2. Subir el zip con los `parameters` devueltos (POST multipart, el fichero al final).
3. `themeCreate(source: <resourceUrl>, name: "NYR Sports", role: UNPUBLISHED)`.
4. Esperar a que `theme.processing` sea `false` y anotar el ID.

## 2. Colecciones automáticas (`collectionCreate`)
Regla: `column: TAG, relation: EQUALS, condition: <etiqueta>`, `appliedDisjunctively: false`.

| Título | Handle | Etiqueta |
|---|---|---|
| Fútbol americano | `futbol-americano` | `futbol-americano` |
| Béisbol y softball | `beisbol-y-softball` | `beisbol-softball` |
| Calzado | `calzado` | `calzado` |
| Catálogo Forelle | `catalogo-forelle` | `forelle` |
| Cascos | `cascos` | `cascos` |
| Hombreras | `hombreras` | `hombreras` |
| Bates | `bates` | `bates` |
| Guantes de béisbol | `guantes-de-beisbol` | `guantes-de-beisbol` |
| Fan shop | `fan-shop` | `fan-shop` |
| En stock | `en-stock` | `en-stock` |

Después: `publishablePublish` de cada colección en el canal **Tienda online**.

## 3. Portada
Comprobar en el editor del tema que «Tienda por colecciones», el mosaico de deportes y la banda Forelle
muestran productos. Si algún handle difiere, editar `templates/index.json` del tema (`themeFilesUpsert`).

## 4. Menús y Contacto
- `main-menu`: Fútbol americano · Béisbol y softball · Calzado · Fan shop · Personaliza (`/#personaliza`) · Contacto (`/pages/contact`).
- `footer`: Contacto y presupuestos · Catálogo Forelle · En stock · Buscar (`/search`).
- Página **Contacto** (handle `contact`) con `templateSuffix: "contact"`; si ya existe, solo cambiar la plantilla.

## 5. Revisión
- Contar productos por colección (que ninguna quede a 0).
- Vista previa: `https://n3vnfi-iy.myshopify.com/?preview_theme_id=<ID>`.
- José reimporta `dist/reimportar-1-producto.csv` (Rawlings Cal Raleigh).
