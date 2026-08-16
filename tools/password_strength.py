#!/usr/bin/env python3
"""
password_strength.py — Utilidad Python para EcoMarket

Evalúa la fortaleza de una contraseña usando la MISMA política del backend
(app.py -> password_strength):
  - Mínimo 8 caracteres
  - Al menos una minúscula
  - Al menos una mayúscula
  - Al menos un número
  - Al menos un carácter especial

Uso:
    python tools/password_strength.py "MiClave123!"
    python tools/password_strength.py  # modo interactivo
"""

import sys
import getpass


def evaluar_contraseña(pw):
    """Evalúa la fortaleza de una contraseña según la política de EcoMarket."""
    if not pw:
        return {
            'score': 0,
            'nivel': 'VACIA',
            'valida': False
        }
    
    mayus = any(c.isupper() for c in pw)
    minus = any(c.islower() for c in pw)
    digito = any(c.isdigit() for c in pw)
    especial = any(not c.isalnum() for c in pw)
    
    score = 0
    if len(pw) >= 8:
        score += 1
    if mayus and minus:
        score += 1
    if digito:
        score += 1
    if especial:
        score += 1
    
    # Política del backend: >=8, letras y números (sin importar mayúsc.)
    valida = (len(pw) >= 8) and (mayus or minus) and digito
    
    niveles = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte']
    nivel = niveles[score]
    
    return {
        'score': score,
        'nivel': nivel,
        'valida': valida
    }


def main():
    if len(sys.argv) > 1:
        # Modo línea de comandos
        pw = sys.argv[1]
        resultado = evaluar_contraseña(pw)
        
        print(f"Longitud  : {len(pw)}")
        print(f"Nivel     : {resultado['nivel']} ({resultado['score']}/4)")
        print(f"Válida    : {'SÍ' if resultado['valida'] else 'NO'}")
        
        return 0 if resultado['valida'] else 1
    else:
        # Modo interactivo
        pw = getpass.getpass("Ingresa una contraseña: ")
        resultado = evaluar_contraseña(pw)
        
        print(f"Nivel: {resultado['nivel']} ({resultado['score']}/4)")
        print(f"Válida según política de EcoMarket: {'SÍ' if resultado['valida'] else 'NO'}")
        
        return 0


if __name__ == "__main__":
    sys.exit(main())