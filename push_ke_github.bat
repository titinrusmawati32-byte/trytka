@echo off
chcp 65001 >nul
title SiSiswa TKA SD - Auto Git Push ke GitHub
color 0B

echo ===================================================================
echo       SiSiswa TKA SD - Automasi GitHub Push & Auto Resolve
echo       Target: https://github.com/titinrusmawati32-byte/trytka.git
echo ===================================================================
echo.

set REPO_URL=https://github.com/titinrusmawati32-byte/trytka.git

:: 0. Batalkan proses rebase/merge macet jika ada
echo [1/5] Mengatasi konflik / rebase macet...
git rebase --abort 2>nul
git merge --abort 2>nul

:: 1. Pastikan branch main
git branch -M main 2>nul

:: 2. Set remote origin
git remote set-url origin %REPO_URL% 2>nul || git remote add origin %REPO_URL% 2>nul

:: 3. Tambahkan seluruh berkas
echo [2/5] Menambahkan seluruh berkas lokal...
git add -A

:: 4. Buat commit
echo [3/5] Menyimpan commit...
git commit -m "feat: Redesign Student UI to Smart Learning with Exam Token Gating and Lock Control" 2>nul

:: 5. Push ke GitHub dengan Force Push bersih
echo [4/5] Mengunggah perubahan ke GitHub...
git push -u origin main --force

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ===================================================================
    echo   BERHASIL 100%! Seluruh berkas telah ter-upload ke GitHub!
    echo   https://github.com/titinrusmawati32-byte/trytka
    echo ===================================================================
    echo.
    echo Vercel akan otomatis melakukan deploy dalam hitungan detik ke:
    echo https://trytka-theta.vercel.app
) else (
    color 0C
    echo.
    echo ===================================================================
    echo   Push gagal. Periksa koneksi internet Anda atau hak akses GitHub.
    echo ===================================================================
)

echo.
pause
