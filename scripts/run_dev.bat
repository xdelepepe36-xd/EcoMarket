@echo off
REM ============================================================
REM  EcoMarket - Arranque rapido (Windows)
REM ============================================================
setlocal

if not exist venv (
    echo No existe el entorno virtual. Ejecuta primero: scripts\setup.bat
    exit /b 1
)

call venv\Scripts\activate.bat
set PYTHONIOENCODING=utf-8
echo Iniciando EcoMarket en http://localhost:5000
python app.py

endlocal