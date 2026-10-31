"""
Script de backup automatizado para EcoMarket
Copia de seguridad de base de datos y archivos
"""

import os
import shutil
import sqlite3
import datetime
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, BASE_DIR, UPLOAD_FOLDER

def crear_backup():
    """Crea un backup completo de la base de datos y archivos."""
    
    # Fecha actual para el nombre del backup
    fecha = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(BASE_DIR, 'backups')
    backup_file = os.path.join(backup_dir, f'ecomarket_backup_{fecha}.zip')
    
    # Crear directorio de backups si no existe
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"Iniciando backup: {fecha}")
    print(f"Directorio de backups: {backup_dir}")
    
    try:
        with zipfile.ZipFile(backup_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Backup de base de datos
            if os.path.exists(DB_PATH):
                print("Backup de base de datos...")
                zipf.write(DB_PATH, 'ecomarket.db')
                print(f"Base de datos agregada: {DB_PATH}")
            else:
                print("Base de datos no encontrada, omitiendo...")
            
            # Backup de archivos subidos
            if os.path.exists(UPLOAD_FOLDER):
                print("Backup de archivos subidos...")
                for root, dirs, files in os.walk(UPLOAD_FOLDER):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, BASE_DIR)
                        zipf.write(file_path, arcname)
                print(f"Archivos subidos agregados: {UPLOAD_FOLDER}")
            else:
                print("Directorio de uploads no encontrado, omitiendo...")
            
            # Backup de configuración
            config_files = [
                'requirements.txt',
                'app.py',
                'manifest.json',
            ]
            
            for config_file in config_files:
                config_path = os.path.join(BASE_DIR, config_file)
                if os.path.exists(config_path):
                    print(f"Backup de configuración: {config_file}")
                    zipf.write(config_path, config_file)
        
        # Tamaño del backup
        backup_size = os.path.getsize(backup_file) / (1024 * 1024)  # MB
        print(f"\nBackup completado exitosamente!")
        print(f"Archivo: {backup_file}")
        print(f"Tamaño: {backup_size:.2f} MB")
        
        # Limpiar backups antiguos (mantener últimos 5)
        limpiar_backups_antiguos(backup_dir, max_backups=5)
        
        return True
        
    except Exception as e:
        print(f"Error creando backup: {e}")
        return False

def limpiar_backups_antiguos(backup_dir, max_backups=5):
    """Elimina backups antiguos manteniendo solo los más recientes."""
    
    if not os.path.exists(backup_dir):
        return
    
    # Obtener lista de backups ordenados por fecha
    backups = []
    for file in os.listdir(backup_dir):
        if file.startswith('ecomarket_backup_') and file.endswith('.zip'):
            file_path = os.path.join(backup_dir, file)
            backups.append((file_path, os.path.getmtime(file_path)))
    
    # Ordenar por fecha (más reciente primero)
    backups.sort(key=lambda x: x[1], reverse=True)
    
    # Eliminar backups antiguos
    if len(backups) > max_backups:
        for backup_file, _ in backups[max_backups:]:
            try:
                os.remove(backup_file)
                print(f"Backup antiguo eliminado: {backup_file}")
            except Exception as e:
                print(f"Error eliminando backup antiguo {backup_file}: {e}")

def restaurar_backup(backup_file):
    """Restaura un backup desde un archivo zip."""
    
    print(f"Restaurando backup: {backup_file}")
    
    if not os.path.exists(backup_file):
        print("Archivo de backup no encontrado")
        return False
    
    try:
        with zipfile.ZipFile(backup_file, 'r') as zipf:
            # Extraer en el directorio base
            zipf.extractall(BASE_DIR)
        
        print("Backup restaurado exitosamente!")
        return True
        
    except Exception as e:
        print(f"Error restaurando backup: {e}")
        return False

def listar_backups():
    """Lista todos los backups disponibles."""
    
    backup_dir = os.path.join(BASE_DIR, 'backups')
    
    if not os.path.exists(backup_dir):
        print("No hay directorio de backups")
        return
    
    backups = []
    for file in os.listdir(backup_dir):
        if file.startswith('ecomarket_backup_') and file.endswith('.zip'):
            file_path = os.path.join(backup_dir, file)
            size = os.path.getsize(file_path) / (1024 * 1024)  # MB
            date = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
            backups.append((file, size, date))
    
    if not backups:
        print("No hay backups disponibles")
        return
    
    # Ordenar por fecha (más reciente primero)
    backups.sort(key=lambda x: x[2], reverse=True)
    
    print(f"\nBackups disponibles ({len(backups)}):")
    print("-" * 80)
    for file, size, date in backups:
        print(f"{file} - {size:.2f} MB - {date.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Script de backup automatizado')
    parser.add_argument('--crear', action='store_true', help='Crear nuevo backup')
    parser.add_argument('--listar', action='store_true', help='Listar backups disponibles')
    parser.add_argument('--restaurar', type=str, help='Restaurar backup específico')
    
    args = parser.parse_args()
    
    if args.crear:
        crear_backup()
    elif args.listar:
        listar_backups()
    elif args.restaurar:
        backup_file = os.path.join(BASE_DIR, 'backups', args.restaurar)
        restaurar_backup(backup_file)
    else:
        # Por defecto crear backup
        crear_backup()