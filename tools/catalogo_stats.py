#!/usr/bin/env python3
"""
catalogo_stats.py — Utilidad en Python para EcoMarket

Analiza data/products.json y genera un reporte estadístico del catálogo:
  - Total de productos
  - Productos por categoría
  - Productos por condición (nuevo/usado)
  - Precio mínimo, máximo y promedio
  - Stock total

Uso:
    python tools/catalogo_stats.py data/products.json
"""

import json
import sys
from pathlib import Path
from collections import defaultdict


def main():
    ruta = sys.argv[1] if len(sys.argv) > 1 else "data/products.json"
    ruta = Path(ruta)
    
    if not ruta.exists():
        print(f"[ERROR] No se pudo abrir: {ruta}")
        return 1
    
    try:
        with open(ruta, 'r', encoding='utf-8') as f:
            productos = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON inválido: {e}")
        return 1
    
    if not isinstance(productos, list):
        print(f"[ERROR] Se esperaba una lista de productos")
        return 1
    
    if len(productos) == 0:
        print(f"[ERROR] No se encontraron productos en {ruta}")
        return 2
    
    # Calcular estadísticas
    stats = {
        'productos': len(productos),
        'stock_total': 0,
        'precio_min': float('inf'),
        'precio_max': float('-inf'),
        'precio_sum': 0.0,
        'por_categoria': defaultdict(int),
        'por_condicion': defaultdict(int)
    }
    
    for prod in productos:
        if not isinstance(prod, dict):
            continue
            
        # Precio
        precio = float(prod.get('precio', 0))
        stats['precio_min'] = min(stats['precio_min'], precio)
        stats['precio_max'] = max(stats['precio_max'], precio)
        stats['precio_sum'] += precio
        
        # Stock
        stats['stock_total'] += int(prod.get('stock', 0))
        
        # Categoría
        categoria = prod.get('categoria', '(sin dato)')
        stats['por_categoria'][categoria] += 1
        
        # Condición
        condicion = prod.get('condicion', '(sin dato)')
        stats['por_condicion'][condicion] += 1
    
    # Mostrar reporte
    print(f"\n== EcoMarket: Reporte del catálogo ({ruta}) ==")
    print(f"Total de productos : {stats['productos']}")
    print(f"Stock total        : {stats['stock_total']}")
    print(f"Precio mínimo     : S/. {stats['precio_min']:.2f}")
    print(f"Precio máximo     : S/. {stats['precio_max']:.2f}")
    print(f"Precio promedio   : S/. {stats['precio_sum'] / stats['productos']:.2f}")
    
    print("\nPor categoría:")
    for cat, count in sorted(stats['por_categoria'].items()):
        print(f"  - {cat} : {count}")
    
    print("\nPor condición:")
    for cond, count in sorted(stats['por_condicion'].items()):
        print(f"  - {cond} : {count}")
    
    print("\n[OK] Reporte generado correctamente.")
    return 0


if __name__ == "__main__":
    sys.exit(main())