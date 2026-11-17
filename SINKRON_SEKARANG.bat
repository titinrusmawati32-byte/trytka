@echo off
chcp 65001 >nul
title SINKRONISASI BERSIH KE GITHUB (SiSiswa TKA SD)
color 0B

echo ===================================================================
echo     MEMPERBAIKI GIT REBASE & SINKRONISASI KE GITHUB OTOMATIS
echo     Target: https://github.com/titinrusmawati32-byte/trytka.git
echo ===================================================================
echo.

echo [1/5] Membatalkan proses rebase/merge yang tersangkut conflict...
git rebase --abort 2>nul
git merge --abort 2>nul

echo [2/5] Memastikan branch utama adalah 'main'...
git branch -M main

echo [3/5] Menambahkan seluruh pembaruan desain dan backend...
git add -A

echo [4/5] Menyimpan commit pembaruan Fix Gambar Soal, Tombol Kembali ke Beranda, Setting Ujian & Fix Code.gs...
git commit -m "fix(image): optimize image compression, prevent broken images in cbt, add back to dashboard button in staging preview"

echo [5/5] Melakukan Force Push bersih ke GitHub...
git push -u origin main --force

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ===================================================================
    echo   BERHASIL 100%! Seluruh file lokal sudah terunggah ke GitHub!
    echo   Repository: https://github.com/titinrusmawati32-byte/trytka
    echo ===================================================================
    echo.
    echo Vercel akan otomatis mendeteksi pembaruan ini dan men-deploy
    echo tampilan baru dalam 10 - 20 detik ke:
    echo https://trytka-theta.vercel.app
    echo.
) else (
    color 0C
    echo.
    echo ===================================================================
    echo   Gagal melakukan push. Pastikan koneksi internet Anda aktif.
    echo ===================================================================
)

echo.
pause
