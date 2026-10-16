#!/usr/bin/env python3
"""Convierte los CSV de catalogo/shopify en JSONL para una importación masiva de Shopify
(bulkOperationRunMutation con productSet, identificando cada producto por su handle).

Uso: python3 -I tools/csv_to_productset_jsonl.py LOCATION_GID SALIDA.jsonl [--limit N] [--sample]
  --sample: elige una muestra variada (por deporte/tipo) en vez de los primeros N.
"""
import argparse, collections, csv, glob, json, os

ap = argparse.ArgumentParser()
ap.add_argument('location'); ap.add_argument('out')
ap.add_argument('--limit', type=int, default=0); ap.add_argument('--sample', action='store_true')
ap.add_argument('--src', default='catalogo/shopify')
a = ap.parse_args()

products = collections.OrderedDict()
for f in sorted(glob.glob(os.path.join(a.src, '*.csv'))):
    with open(f, encoding='utf-8', newline='') as fh:
        for r in csv.DictReader(fh):
            products.setdefault(r['Handle'], []).append(r)


def to_input(rows):
    head = rows[0]
    names = [head[f'Option{i} Name'] for i in (1, 2, 3) if head[f'Option{i} Name']]
    variant_rows = [r for r in rows if r['Option1 Value']]
    if names == ['Title']:
        names = ['Title']
    options = []
    for i, n in enumerate(names, start=1):
        vals = []
        for r in variant_rows:
            v = r[f'Option{i} Value']
            if v not in vals:
                vals.append(v)
        options.append({'name': n, 'values': [{'name': v} for v in vals]})
    variants = []
    for r in variant_rows:
        v = {
            'optionValues': [{'optionName': n, 'name': r[f'Option{i} Value']} for i, n in enumerate(names, start=1)],
            'price': r['Variant Price'] or '0.00',
            'sku': r['Variant SKU'] or None,
            'inventoryPolicy': 'CONTINUE' if r['Variant Inventory Policy'] == 'continue' else 'DENY',
            'inventoryItem': {'tracked': True, 'requiresShipping': True},
            'inventoryQuantities': [{'locationId': a.location, 'name': 'available',
                                     'quantity': int(r['Variant Inventory Qty'] or 0)}],
            'taxable': True,
        }
        if r['Variant Barcode']:
            v['barcode'] = r['Variant Barcode']
        if r['Variant Compare At Price']:
            v['compareAtPrice'] = r['Variant Compare At Price']
        variants.append({k: val for k, val in v.items() if val is not None})
    files = [{'originalSource': r['Image Src'], 'contentType': 'IMAGE', 'alt': r['Image Alt Text'] or head['Title']}
             for r in sorted((r for r in rows if r['Image Src']), key=lambda r: int(r['Image Position'] or 0))]
    return {
        'identifier': {'handle': head['Handle']},
        'input': {
            'handle': head['Handle'], 'title': head['Title'], 'descriptionHtml': head['Body (HTML)'],
            'vendor': head['Vendor'], 'productType': head['Type'],
            'tags': [t.strip() for t in head['Tags'].split(',') if t.strip()],
            'status': head['Status'].upper() or 'DRAFT',
            'productOptions': options, 'variants': variants, 'files': files,
        },
    }


items = list(products.values())
if a.sample:
    by = collections.defaultdict(list)
    for rows in items:
        by[(rows[0]['Type'], 'img' if any(r['Image Src'] for r in rows) else 'noimg')].append(rows)
    picked, i = [], 0
    while len(picked) < (a.limit or 40) and any(by.values()):
        for k in sorted(by):
            if by[k] and len(picked) < (a.limit or 40):
                # preferimos productos con foto y con varias variantes
                by[k].sort(key=lambda rs: (-(k[1] == 'img'), -len([r for r in rs if r['Option1 Value']])))
                picked.append(by[k].pop(0))
    items = picked
elif a.limit:
    items = items[:a.limit]

with open(a.out, 'w', encoding='utf-8') as fh:
    for rows in items:
        fh.write(json.dumps(to_input(rows), ensure_ascii=False) + '\n')
print(f'{len(items)} productos → {a.out} ({os.path.getsize(a.out) / 1e6:.2f} MB)')
