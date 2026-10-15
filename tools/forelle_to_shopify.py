#!/usr/bin/env python3
"""Convierte el feed XML de Forelle (ArrayOfProduct) en CSV de importación de productos de Shopify.

Uso:
  python3 -I tools/forelle_to_shopify.py FEED.xml SALIDA_DIR [--status draft|active]
         [--no-price | --markup 1.0] [--policy continue|deny] [--only-stock] [--skip-fanzone]
         [--translations catalogo/traduccion/es.json] [--per-file 500]

- Agrupa las variantes (CHILD) por ParentId; los SINGLE son productos de una variante.
- Opciones: «Talla» y/o «Color» según lo que varíe; si hay combinaciones repetidas usa «Modelo».
- Etiquetas: deporte, tipo, subcategoría, «forelle», «calzado», género.
- Precio = Price del feed × markup (redondeado a ,95 si markup != 1), o 0 con --no-price
  (el tema muestra «Precio a consultar»). El PVP del feed se guarda en la etiqueta «pvp-de-XX».
- --policy continue: se puede vender sin stock (bajo pedido a Forelle).
- --translations: JSON {sha1(párrafo en inglés): párrafo en español}; lo no traducido queda en inglés.
- Estado por defecto: draft (no visible hasta que se publique).
"""
import argparse, collections, csv, hashlib, html, json, os, re, sys, unicodedata
import xml.etree.ElementTree as ET

SPORT = {
    'American Football': ('Fútbol americano', 'futbol-americano'),
    'Baseball/Softball': ('Béisbol y softball', 'beisbol-softball'),
    'Fanzone': ('Fanzone', 'fanzone'),
    'Other Sports': ('Otros deportes', 'otros-deportes'),
    '': ('Otros', 'otros'),
}
TYPE1 = {
    'American Football Gloves': 'Guantes', 'Apparel  Protection': 'Ropa y protecciones', 'Balls': 'Balones y bolas',
    'Fan Shop': 'Fan shop', 'Helmets': 'Cascos', 'Match  Training Equipment': 'Material de entrenamiento',
    'Shoes (US size)': 'Calzado', 'Shoulder Pads': 'Hombreras', 'Bats': 'Bates', 'Batting Gloves': 'Guantes de bateo',
    'Catcher Equipment': 'Equipo de receptor', 'Gloves (LH = Left Hand catch)': 'Guantes de béisbol',
    'NBA': 'NBA', 'NHL Fan Merchandise': 'NHL', 'Basketball': 'Baloncesto', 'Volleyball': 'Vóley', 'Soccer': 'Fútbol',
    'Hockey': 'Hockey', 'Street Hockey': 'Hockey', 'Lacrosse': 'Lacrosse', 'Rugby': 'Rugby', 'Cricket': 'Críquet',
    'Golf': 'Golf', 'Racquet Sports': 'Raqueta',
}
TYPE2 = {
    'Adult': 'Adulto', 'Youth': 'Juvenil', 'Women': 'Mujer', 'Junior': 'Junior', 'Pee Wee': 'Pee Wee',
    'Molded Cleats': 'Tacos moldeados', 'Shirts  Long Sleeves': 'Camisetas', 'Accessories': 'Accesorios',
    'Facemask for American Football Helmet': 'Máscaras', 'Girdles  Pants': 'Pantalones y fajas', 'Catching Kit': 'Kits de receptor',
    'Bag for sports equipment': 'Bolsas', 'Batting Helmets': 'Cascos de bateo', 'Wood Baseball Bat': 'Bates de madera',
    'Padding  Accessories': 'Acolchados', 'Protective Gear': 'Protecciones', 'Jerseys  Shirts': 'Jerseys',
    'Footballs': 'Balones', 'Replica Helmets': 'Cascos réplica', 'Baseball Glove': 'Guantes de béisbol',
    'Player essentials': 'Accesorios de jugador', 'Caps  Hats': 'Gorras', 'Varsity Shoulder Pads': 'Hombreras varsity',
    'Softball glove': 'Guantes de softball', 'Socks': 'Calcetines', 'Mouthguard': 'Protectores bucales',
    'Fastpitch Softball Bat': 'Bates fastpitch', 'Various': 'Varios', "Men's Pants": 'Pantalones hombre',
    "Women's Pants": 'Pantalones mujer', 'Baseballglove for child': 'Guantes infantiles', 'Balls': 'Bolas',
    'Helmet Components': 'Recambios de casco', 'Youth Helmets': 'Cascos juveniles', 'Youth Pants': 'Pantalones juveniles',
    'Catcher Glove': 'Manoplas de receptor', 'Catcher Helmets': 'Cascos de receptor', 'Visors': 'Visores',
    'Chin Straps': 'Barboquejos', 'Training Balls': 'Bolas de entrenamiento', 'Baseball Bat': 'Bates de béisbol',
    'Assorted catcher equipment': 'Equipo de receptor', 'Team  Field Equipment': 'Material de campo', 'Masks': 'Máscaras',
    'Baseball shoes with metal spikes': 'Tacos metálicos', 'Chest Protectors': 'Petos', 'Flag Football Equipment': 'Flag football',
    'Training Equipment': 'Entrenamiento', 'Batting Tee': 'Tees de bateo', 'First Base glove': 'Guantes de primera base',
    'Umpire/Referee Equipment': 'Árbitro', 'Leg Guards': 'Espinilleras', 'Practice Bat': 'Bates de entrenamiento',
    'Baseballs': 'Bolas de béisbol', 'Pitching Machine': 'Máquinas lanzadoras', "Coach's Helmets": 'Cascos de entrenador',
    'Skull Caps': 'Gorros', 'Slowpitch Softball Bat': 'Bates slowpitch', 'Turf shoes for synthetic surfaces': 'Calzado turf',
    'Matchday Equipment': 'Día de partido', 'Youth Shoulder Pads': 'Hombreras juveniles', 'Softballs': 'Bolas de softball',
    'Shoulder Pad Components': 'Recambios de hombreras', 'Shoulderpads for women': 'Hombreras mujer', 'Chairs': 'Sillas',
    'Youth Balls': 'Balones juveniles', 'Throwing Machine': 'Máquinas lanzadoras', 'Metal Cleats': 'Tacos metálicos',
    'Junior-Varsity Shoulder Pads': 'Hombreras junior varsity',
}
GENDER = {'Adult': 'adulto', 'Youth': 'juvenil', 'Women': 'mujer', 'Men': 'hombre', 'Girls': 'nina', 'Junior': 'junior', 'Boys': 'nino', 'Senior': 'senior'}
NO_COLOR = {'', 'size', 'model', 'color'}
HEADER = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
          'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
          'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
          'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping',
          'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
          'Variant Image', 'Variant Weight Unit', 'Status']


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def txt(p, t):
    # El feed trae entidades HTML escapadas dos veces (p. ej. «&amp;»)
    return html.unescape((p.findtext(t) or '').strip())


def ext(p, t):
    return html.unescape((p.findtext('ExtraData/' + t) or '').strip())


HAND = {'left hand catch': 'Guante en mano izquierda', 'right hand catch': 'Guante en mano derecha',
        'left hand throw': 'Guante en mano derecha', 'right hand throw': 'Guante en mano izquierda'}


def clean_color(c):
    return '' if c.strip().lower() in NO_COLOR else c.strip()


def base_title(p):
    """Quita del nombre la talla y el color que el feed añade al final."""
    name = re.sub(r'\s+', ' ', txt(p, 'Name'))
    size, color = txt(p, 'Size'), txt(p, 'Color')
    tails = [color, size, size.replace('.', ','), 'Size', 'Color', 'Model']
    changed = True
    while changed:
        changed = False
        for t in tails:
            if t and name.lower().endswith(' ' + t.lower()):
                name = name[: -len(t) - 1].rstrip(' |-')
                changed = True
    name = re.sub(r'\s*\|\s*(Left|Right) Hand (Catch|Throw)$', '', name, flags=re.I)
    return name.strip()


TR = {}


def para_key(s):
    return hashlib.sha1(s.encode('utf-8')).hexdigest()[:16]


CSS_JUNK = re.compile(r'^[.#]?[\w-]+(\s+[\w.-]+)*\s*\{|^[\w-]+\s*:\s*[^.]*;\s*$|^\}$')


def paragraphs(p):
    parts = [s.strip() for s in re.split(r'\s{2,}', txt(p, 'Description')) if s.strip()]
    return [s for s in parts if not CSS_JUNK.match(s)]


def body_html(p):
    out = ''.join(f'<p>{html.escape(TR.get(para_key(s), s))}</p>' for s in paragraphs(p))
    gpsr = ext(p, 'GPSRMarketParticipant')
    if gpsr:
        out += f'<p><small>Responsable en la UE (GPSR): {html.escape(gpsr)}</small></p>'
    return out


def price(v, markup):
    v = float(v or 0) * markup
    if markup != 1 and v > 1:
        v = int(v) + 0.95
    return f'{v:.2f}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('feed'); ap.add_argument('out')
    ap.add_argument('--status', default='draft', choices=['draft', 'active'])
    ap.add_argument('--markup', type=float, default=1.0)
    ap.add_argument('--only-stock', action='store_true')
    ap.add_argument('--skip-fanzone', action='store_true')
    ap.add_argument('--per-file', type=int, default=500)
    ap.add_argument('--no-price', action='store_true')
    ap.add_argument('--policy', default='continue', choices=['continue', 'deny'])
    ap.add_argument('--translations')
    a = ap.parse_args()
    if a.translations and os.path.exists(a.translations):
        TR.update(json.load(open(a.translations, encoding='utf-8')))

    products = ET.parse(a.feed).getroot().findall('Product')
    # Agrupación: CHILD por ParentId. Los SINGLE que son tallas/manos del mismo modelo
    # se unen por GroupNo o, si no lo tienen, por el nombre sin talla ni color.
    groups = collections.OrderedDict()
    singles = []
    for p in products:
        t = txt(p, 'Type')
        if t == 'PARENT':
            continue
        if t == 'CHILD':
            groups.setdefault(txt(p, 'ParentId'), []).append(p)
        else:
            singles.append(p)
    by_group = collections.Counter(txt(p, 'GroupNo') for p in singles if txt(p, 'GroupNo'))
    by_title = collections.Counter(base_title(p).lower() for p in singles if not txt(p, 'GroupNo'))
    for p in singles:
        gno = txt(p, 'GroupNo')
        varies = txt(p, 'Size') or clean_color(txt(p, 'Color'))
        if gno and by_group[gno] > 1:
            key = 'G' + gno
        elif not gno and varies and by_title[base_title(p).lower()] > 1:
            key = 'T' + slug(base_title(p))
        else:
            key = txt(p, 'Id')
        groups.setdefault(key, []).append(p)

    os.makedirs(a.out, exist_ok=True)
    rows_by_file, handles, stats = [], set(), collections.Counter()
    current = []
    for key, vs in groups.items():
        first = vs[0]
        sport_raw = ext(first, 'Sport')
        if a.skip_fanzone and sport_raw == 'Fanzone':
            stats['skip_fanzone'] += 1; continue
        if a.only_stock and not any(int(txt(v, 'Stock') or 0) > 0 for v in vs):
            stats['skip_nostock'] += 1; continue

        titles = collections.Counter(base_title(v) for v in vs)
        title = max(titles.items(), key=lambda kv: (kv[1], len(kv[0])))[0] or txt(first, 'Name')
        handle = slug(f'{title}-{key.lstrip("GT")[:12]}')[:240]
        if handle in handles:
            handle = f'{handle}-{key}'
        handles.add(handle)

        sizes = [txt(v, 'Size') for v in vs]
        colors = [clean_color(txt(v, 'Color')) for v in vs]
        opts = []
        if len(vs) > 1 and len(set(sizes)) > 1:
            if all(s.lower() in HAND for s in sizes):
                opts.append(('Mano', [HAND[s.lower()] for s in sizes]))
            else:
                opts.append(('Talla (US)' if ext(first, 'Type1').startswith('Shoes') else 'Talla', sizes))
        if len(vs) > 1 and len(set(colors)) > 1: opts.append(('Color', colors))
        combos = list(zip(*[o[1] for o in opts])) if opts else []
        if len(vs) > 1 and (not opts or len(set(combos)) != len(vs)):
            opts = [('Modelo', [txt(v, 'Name') for v in vs])]
            if len(set(opts[0][1])) != len(vs):
                opts = [('Modelo', [f"{txt(v, 'Name')} ({txt(v, 'MerchantProductNo')})" for v in vs])]
            stats['modelo_fallback'] += 1

        sport_es, sport_tag = SPORT.get(sport_raw, SPORT[''])
        t1 = ext(first, 'Type1'); t2 = ext(first, 'Type2')
        ptype = TYPE1.get(t1, t1 or 'Otros')
        tags = {sport_tag, 'forelle', slug(ptype)}
        if t2: tags.add('sub-' + slug(TYPE2.get(t2, t2)))
        if t1.startswith('Shoes'): tags.add('calzado')
        g = GENDER.get(ext(first, 'Gender'))
        if g: tags.add(g)
        if any(int(txt(v, 'Stock') or 0) > 0 for v in vs): tags.add('en-stock')
        pvp = txt(first, 'Price')
        if pvp: tags.add('pvp-de-' + str(round(float(pvp))))

        images = []
        for v in vs:
            for t in ['ImageUrl'] + [f'ExtraImageUrl{i}' for i in range(1, 10)]:
                u = txt(v, t)
                if u and u not in images:
                    images.append(u)
        images = images[:20]

        rows = []
        for i, v in enumerate(vs):
            r = dict.fromkeys(HEADER, '')
            r['Handle'] = handle
            if i == 0:
                r.update({'Title': title, 'Body (HTML)': body_html(first), 'Vendor': txt(first, 'Brand') or 'Forelle',
                          'Type': ptype, 'Tags': ', '.join(sorted(tags)), 'Published': 'FALSE' if a.status == 'draft' else 'TRUE',
                          'Gift Card': 'FALSE', 'Status': a.status})
            for n, (oname, ovals) in enumerate(opts[:3], start=1):
                r[f'Option{n} Name'] = oname if i == 0 else ''
                r[f'Option{n} Value'] = ovals[i] or '—'
            if not opts:
                r['Option1 Name'] = 'Title' if i == 0 else ''
                r['Option1 Value'] = 'Default Title'
            r.update({'Variant SKU': txt(v, 'MerchantProductNo'), 'Variant Grams': '0', 'Variant Inventory Tracker': 'shopify',
                      'Variant Inventory Qty': str(max(0, int(txt(v, 'Stock') or 0))), 'Variant Inventory Policy': a.policy,
                      'Variant Fulfillment Service': 'manual', 'Variant Price': '0.00' if a.no_price else price(txt(v, 'Price'), a.markup),
                      'Variant Requires Shipping': 'TRUE', 'Variant Taxable': 'TRUE', 'Variant Barcode': txt(v, 'Ean'),
                      'Variant Weight Unit': 'kg', 'Variant Image': txt(v, 'ImageUrl') if len(vs) > 1 else ''})
            lp = txt(v, 'ListPrice')
            if not a.no_price and lp and float(lp) > float(txt(v, 'Price') or 0):
                r['Variant Compare At Price'] = price(lp, a.markup)
            if i < len(images):
                r.update({'Image Src': images[i], 'Image Position': str(i + 1), 'Image Alt Text': title})
            rows.append(r)
        for j in range(len(vs), len(images)):
            r = dict.fromkeys(HEADER, '')
            r.update({'Handle': handle, 'Image Src': images[j], 'Image Position': str(j + 1), 'Image Alt Text': title})
            rows.append(r)

        current.append(rows)
        stats['products'] += 1; stats['variants'] += len(vs); stats[sport_tag] += 1
        if len(current) >= a.per_file:
            rows_by_file.append(current); current = []
    if current:
        rows_by_file.append(current)

    for n, chunk in enumerate(rows_by_file, start=1):
        path = os.path.join(a.out, f'forelle-productos-{n:02d}.csv')
        with open(path, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=HEADER)
            w.writeheader()
            for rows in chunk:
                w.writerows(rows)
        print(f'{path}  {os.path.getsize(path) / 1e6:.1f} MB  {len(chunk)} productos')
    stats['translated_paragraphs_used'] = len(TR)
    print(dict(stats))


if __name__ == '__main__':
    main()
