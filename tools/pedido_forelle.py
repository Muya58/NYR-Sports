#!/usr/bin/env python3
"""Prepara la hoja de pedido a Forelle a partir de los pedidos de Shopify.

1. Shopify admin → Pedidos → (filtra p. ej. «Sin preparar») → Exportar → CSV.
2. python3 -I tools/pedido_forelle.py pedidos_export.csv catalogo/origen/forelle-feed.csv pedido-forelle.csv

Suma las unidades por referencia de Forelle (el SKU de cada variante es el MerchantProductNo
del feed), añade EAN, nombre, stock actual en Forelle y los pedidos de cliente que lo originan.
"""
import collections, csv, sys

if len(sys.argv) != 4:
    sys.exit(__doc__)
orders_path, feed_path, out_path = sys.argv[1:]

feed = {}
with open(feed_path, encoding='utf-8-sig', newline='') as f:
    for r in csv.DictReader(f):
        if r.get('MerchantProductNo'):
            feed[r['MerchantProductNo'].strip()] = r

need = collections.OrderedDict()
with open(orders_path, encoding='utf-8-sig', newline='') as f:
    for r in csv.DictReader(f):
        sku = (r.get('Lineitem sku') or '').strip()
        qty = int(r.get('Lineitem quantity') or 0)
        if not sku or qty <= 0:
            continue
        e = need.setdefault(sku, {'qty': 0, 'orders': [], 'name': r.get('Lineitem name', '')})
        e['qty'] += qty
        if r.get('Name') and r['Name'] not in e['orders']:
            e['orders'].append(r['Name'])

with open(out_path, 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['Referencia Forelle', 'EAN', 'Producto', 'Talla', 'Color', 'Unidades', 'Stock Forelle', 'Falta stock', 'Pedidos de cliente'])
    for sku, e in need.items():
        src = feed.get(sku, {})
        stock = int(src.get('Stock') or 0) if src else ''
        w.writerow([sku, src.get('Ean', ''), src.get('Name') or e['name'], src.get('Size', ''),
                    '' if (src.get('Color') or '').lower() in ('size', 'model') else src.get('Color', ''),
                    e['qty'], stock, 'SÍ' if src and stock < e['qty'] else '', ' '.join(e['orders'])])
missing = [s for s in need if s not in feed]
print(f'{len(need)} referencias, {sum(e["qty"] for e in need.values())} unidades → {out_path}')
if missing:
    print('SKU no encontrados en el feed (productos propios o sin referencia Forelle):', ', '.join(missing))
