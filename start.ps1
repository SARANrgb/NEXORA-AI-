$backend = Start-Process -FilePath "venv\Scripts\python.exe" -ArgumentList "-m uvicorn main:app --reload --port 8000" -WorkingDirectory "backend" -PassThru -NoNewWindow
$frontend = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "frontend" -PassThru -NoNewWindow

Write-Host "Started backend and frontend. Press any key to stop."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $backend.Id
Stop-Process -Id $frontend.Id
