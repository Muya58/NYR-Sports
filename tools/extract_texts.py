#!/usr/bin/env python3
"""Extrae los párrafos únicos en inglés del feed de Forelle para traducirlos.

Uso: python3 -I tools/extract_texts.py FEED.xml catalogo/traduccion [--batch 250]
Genera pendiente/lote-NNN.json con {clave: texto_en} solo para los párrafos que aún
no estén en catalogo/traduccion/es.json.
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import forelle_to_shopify as F
import xml.etree.ElementTree as ET

ap = argparse.ArgumentParser(); ap.add_argument('feed'); ap.add_argument('out'); ap.add_argument('--batch', type=int, default=250)
a = ap.parse_args()
done_path = os.path.join(a.out, 'es.json')
done = json.load(open(done_path, encoding='utf-8')) if os.path.exists(done_path) else {}
seen = {}
for p in ET.parse(a.feed).getroot().findall('Product'):
    for s in F.paragraphs(p):
        k = F.para_key(s)
        if k not in done:
            seen.setdefault(k, s)
os.makedirs(os.path.join(a.out, 'pendiente'), exist_ok=True)
items = sorted(seen.items(), key=lambda kv: kv[1])
for n in range(0, len(items), a.batch):
    with open(os.path.join(a.out, 'pendiente', f'lote-{n // a.batch + 1:03d}.json'), 'w', encoding='utf-8') as f:
        json.dump(dict(items[n:n + a.batch]), f, ensure_ascii=False, indent=0)
print(f'pendientes: {len(items)} párrafos, {sum(len(v) for _, v in items)} caracteres, {-(-len(items) // a.batch)} lotes; ya traducidos: {len(done)}')
