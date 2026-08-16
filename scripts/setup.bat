@echo off
REM ============================================================
REM  EcoMarket - Configuracion inicial (Windows)
REM  Crea entorno virtual e instala dependencias
REM ============================================================
setlocal

echo [1/3] Creando entorno virtual...
if not exist venv (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: No se pudo crear el entorno virtual.
        echo Asegurate de tener Python instalado: python --version
        exit /b 1
    )
)

echo [2/3] Activando entorno e instalando dependencias...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias.
    exit /b 1
)

echo [3/3] Creando archivo .env a partir de .env.example (si no existe)...
if not exist .env (
    copy .env.example .env >nul
)

echo.
echo ✔ Configuracion lista.
echo Ejecuta:  make run   (o)   python app.py
endlocal