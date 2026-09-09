#!/usr/bin/env python3
"""
Script para iniciar el servidor de prueba de EcoMarket
"""

import os
import sys

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    
    print("Iniciando EcoMarket Server...")
    print("Local: http://127.0.0.1:5000")
    print("Red: http://192.168.1.3:5000")
    print("--------------------------------------------------")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False
    )
    
except ImportError as e:
    print(f"Error al importar la aplicacion: {e}")
    print("Asegurate de que el archivo app.py existe en el directorio actual.")
    sys.exit(1)
except Exception as e:
    print(f"Error al iniciar el servidor: {e}")
    sys.exit(1)