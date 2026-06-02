@echo off
echo ===================================================
echo   Iniciando Agenda Web Platform (Front y Back)
echo ===================================================

echo.
echo [1/2] Iniciando Backend (FastAPI)...
:: Inicia el backend en una nueva ventana de comandos
start "Agenda Backend" cmd /k "cd backend && call .venv\Scripts\activate && uvicorn main:app --reload"

echo.
echo [2/2] Iniciando Frontend (Next.js)...
:: Inicia el frontend en una nueva ventana de comandos
start "Agenda Frontend" cmd /k "cd frontend && pnpm dev"

echo.
echo ¡Ambos servicios se están ejecutando en nuevas ventanas!
echo Puedes cerrar esta ventana.
