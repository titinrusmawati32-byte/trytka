# 🚀 SiSiswa TKA SD (Platform Try Out Tes Kemampuan Akademik SD)

Platform Asesmen Mandiri CBT Siswa SD Kelas VI Multi-Tenant berbasis Google Workspace dan Vercel Serverless Edge.  
Wilayah Kerja: **Koorwil Bidang Pendidikan Kecamatan Ambulu, Kabupaten Jember**.

---

## 📁 Struktur Berkas Proyek

```text
├── gas/
│   └── Code.gs              # REST API Backend Google Apps Script (2 Folder Bank Soal, Mutex Lock, Auto-Scoring)
├── api/
│   ├── gas.js               # Vercel Serverless: Reverse Proxy bypass CORS & 302 Redirect
│   └── config.js            # Provider konfigurasi dinamis
├── public/
│   ├── config.js            # TEMPAT MENARUH URL GOOGLE APPS SCRIPT ANDA
│   ├── index.html           # Portal Siswa CBT (Timer, Anti-Curang, Autosave, Cetak Skor)
│   ├── proktor.html         # Portal Guru/Proktor (2 Folder Bank Soal, 8 Kartu QR A4, Laporan Kop Dinas)
│   └── admin.html           # Panel Pengawas 14 SDN se-Kecamatan Ambulu
├── config.js                # Salinan config di root
├── vercel.json              # Konfigurasi routing rewrite & header CORS
├── push_ke_github.bat       # Skrip automasi push Git ke GitHub
└── README.md                # Panduan teknis
```

---

## 📚 Sistem 2 Folder Bank Soal: Literasi & Numerasi

Bank Soal sekarang terbagi menjadi **2 Folder Utama**:
1. 📘 **Folder Literasi**: Khusus mengarsipkan kumpulan template soal Bahasa Indonesia, teks fiksi, dan teks informasi/berita.
2. 📗 **Folder Numerasi**: Khusus mengarsipkan kumpulan template soal Matematika, hitung campuran, geometri, dan penalaran data.

### ⚡ Fitur "Rakit Paket Ujian Gabungan"
Proktor dapat menggabungkan 1 template dari Folder Literasi (misal 15 butir) dan 1 template dari Folder Numerasi (misal 15 butir) menjadi **Paket Ujian Aktif (Total 30 Butir Soal)** dalam 1 klik! Siswa langsung mendapatkan paket utuh bernomor urut 1–30 saat masuk menggunakan token.

---

## ⚙️ Cara Menghubungkan Google Apps Script (Sangat Mudah!)

Anda **TIDAK PERLU** lagi menyetel Environment Variables di Vercel! Cukup buka file:

👉 [public/config.js](public/config.js) (atau [config.js](config.js))

Lalu ganti teks:
```javascript
gasUrl: "TEMPEL_URL_GOOGLE_APPS_SCRIPT_DI_SINI",
```
Menjadi URL Web App Google Apps Script Anda (yang berakhiran `/exec`), contoh:
```javascript
gasUrl: "https://script.google.com/macros/s/AKfycbxAbc123.../exec",
```

Setelah itu:
1. Klik dua kali [push_ke_github.bat](push_ke_github.bat) untuk mengunggah pembaruan ke GitHub.
2. Vercel akan otomatis men-deploy versi terbaru dalam hitungan detik!
