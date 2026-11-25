@echo off
cd /d "%~dp0"
if not exist "app\login\page.js" (
  echo WRONG FOLDER. Put this file inside the nyz-lol folder, next to package.json and the app folder.
  pause
  exit /b
)
if exist .git rmdir /s /q .git
git init
git config user.name "nyz"
git config user.email "nyz@example.com"
git add .
git commit -m "nyz.lol"
git branch -M main
git remote add origin https://github.com/4e4p/vexn-website.git
git push -u origin main --force
echo.
echo Finished. If you see "main -> main" above, it worked.
pause
