# -*- coding: utf-8 -*-
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/work-space/within-front/src/data/spots/map-spots.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

types = {}
for s in data['spots']:
    t = s.get('type', 'unknown')
    types[t] = types.get(t, 0) + 1

print("Type distribution:")
for t, cnt in sorted(types.items(), key=lambda x: -x[1]):
    print(f"  {t}: {cnt}")
