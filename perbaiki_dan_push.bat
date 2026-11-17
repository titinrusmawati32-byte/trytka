@echo off
chcp 65001 >nul
title Perbaikan Git Conflict & Force Push
color 0B

echo ===================================================================
echo     SOLUSI OTOMATIS: PERBAIKAN GIT CONFLICT & PUSH BERSIH
echo ===================================================================
echo.

echo [1/5] Membatalkan proses rebase/merge yang macet...
git rebase --abort 2>nul
git merge --abort 2>nul

echo [2/5] Memastikan branch utama adalah 'main'...
git branch -M main 2>nul

echo [3/5] Menambahkan seluruh berkas lokal terbaru...
git add -A

echo [4/5] Menyimpan commit pembaruan...
git commit -m "Fix GAS_URL parameter and enable automatic fallback in api/gas.js and public/config.js" 2>nul

echo [5/5] Memperbarui GitHub (Force Push)...
git push -u origin main --force

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ===================================================================
    echo   BERHASIL 100%! Seluruh kode telah sinkron ke GitHub!
    echo   Repository: https://github.com/titinrusmawati32-byte/trytka
    echo ===================================================================
    echo.
    echo Vercel akan otomatis men-deploy versi terbaru dalam 10-20 detik.
) else (
    color 0C
    echo.
    echo ===================================================================
    echo   Gagal melakukan push. Pastikan koneksi internet Anda aktif.
    echo ===================================================================
)

echo.
pause
