@echo off
chcp 65001 >nul
title SiSiswa TKA SD - Auto Git Push ke GitHub
color 0B

echo ===================================================================
echo       SiSiswa TKA SD - Automasi GitHub Push
echo       Target: https://github.com/titinrusmawati32-byte/trytka.git
echo ===================================================================
echo.

set REPO_URL=https://github.com/titinrusmawati32-byte/trytka.git

:: 1. Periksa apakah Git sudah terinstall
git --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git belum terinstall di komputer ini atau belum masuk ke PATH!
    echo Silakan install Git terlebih dahulu dari: https://git-scm.com/
    echo.
    pause
    exit /b
)

:: 2. Inisialisasi Git lokal jika belum ada
if not exist ".git" (
    echo [1/5] Inisialisasi repositori Git lokal...
    git init
    git branch -M main
) else (
    echo [1/5] Repositori Git lokal terdeteksi.
    git branch -M main >nul 2>&1
)

:: 3. Set remote origin ke repository target
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/5] Menambahkan remote origin: %REPO_URL%
    git remote add origin %REPO_URL%
) else (
    echo [2/5] Memperbarui remote origin: %REPO_URL%
    git remote set-url origin %REPO_URL%
)

:: 4. Tambahkan seluruh berkas
echo [3/5] Menambahkan seluruh berkas (git add .)...
git add .

:: 5. Buat commit
echo [4/5] Membuat commit...
git commit -m "Deploy SiSiswa TKA SD Platform v1.0 - Ambulu Jember" >nul 2>&1

:: 6. Push ke GitHub
echo [5/5] Mengunggah perubahan ke GitHub (git push -u origin main)...
git push -u origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ===================================================================
    echo   BERHASIL! Seluruh berkas telah ter-upload ke:
    echo   https://github.com/titinrusmawati32-byte/trytka
    echo ===================================================================
    echo.
    echo Langkah selanjutnya:
    echo 1. Buka Vercel Dashboard (https://vercel.com)
    echo 2. Import repository 'trytka'
    echo 3. Tambahkan Environment Variable GAS_URL di Vercel Settings
    echo 4. Klik Deploy!
) else (
    color 0E
    echo.
    echo ===================================================================
    echo   CATATAN:
    echo   Jika push ditolak karena repository di GitHub sudah memiliki file
    echo   (seperti README bawaan), kita lakukan sinkronisasi rebase dulu:
    echo ===================================================================
    echo Menjalankan: git pull origin main --rebase ...
    git pull origin main --rebase
    echo Mencoba push kembali...
    git push -u origin main
)

echo.
pause
