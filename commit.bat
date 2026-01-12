@echo off
chcp 65001 >nul
git add .
git commit -m "Fix: Improve button clickability with global click handler and CSS z-index fixes"
git pull origin main --allow-unrelated-histories --no-edit
git push origin main
pause
