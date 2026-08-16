# Utilidades de EcoMarket (tools/)

Herramientas de línea de comandos para análisis y utilidades sobre el catálogo y la lógica de negocio.

## Herramientas

| Archivo | Función | Lenguaje |
|---------|---------|----------|
| `catalogo_stats.py` | Análisis de `data/products.json`: total, por categoría/condición, precio min/máx/promedio y stock | Python |
| `catalogo_stats.cpp` | Versión C++17 del análisis de catálogo (requiere compilador C++) | C++ |
| `password_strength.py` | Evalúa la fortaleza de una contraseña (misma política que el backend: ≥8, mayúscula, minúscula, número, especial) | Python |
| `password_strength.cpp` | Versión C++17 de validación de contraseñas (requiere compilador C++) | C++ |

## Uso con Python (Recomendado - Inmediato)

No requiere instalación adicional, solo Python 3:

```bash
# Análisis del catálogo
python tools/catalogo_stats.py data/products.json

# Validación de contraseña
python tools/password_strength.py "MiClave123!"
python tools/password_strength.py  # modo interactivo
```

## Compilar versiones C++ (Opcional)

Requisitos: un compilador compatible con C++17 (g++, clang++, MSVC/Clang en Windows).

```bash
# Linux / macOS
cd tools
make            # compila todas las herramientas
./catalogo_stats ../data/products.json
./password_strength "MiClave123!"

# Windows (Visual Studio / MSYS2)
g++ -std=c++17 catalogo_stats.cpp -o catalogo_stats.exe
catalogo_stats.exe ..\data\products.json
```

## Ejemplo de salida

```
== EcoMarket: Reporte del catálogo (data/products.json) ==
Total de productos : 65
Stock total        : ...
Precio promedio    : S/. 25.88
Por categoría:
  - Accesorios : 12
  - Hogar      : 16
  ...
```