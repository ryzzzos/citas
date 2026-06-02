Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Iniciando Agenda Web Platform (Front y Back)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Iniciando Backend (FastAPI)..." -ForegroundColor Yellow
# Inicia el backend en una nueva ventana de PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .venv\Scripts\activate; uvicorn main:app --reload"

Write-Host "[2/2] Iniciando Frontend (Next.js)..." -ForegroundColor Yellow
# Inicia el frontend en una nueva ventana de PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; pnpm dev"

Write-Host ""
Write-Host "¡Ambos servicios se están ejecutando en nuevas ventanas!" -ForegroundColor Green
Write-Host "Puedes cerrar esta ventana." -ForegroundColor Green
