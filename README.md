# 🚀 SiSiswa TKA SD (Platform Try Out Tes Kemampuan Akademik SD)

Platform Asesmen Mandiri CBT Siswa SD Kelas VI Multi-Tenant berbasis Google Workspace dan Vercel Serverless Edge.
Wilayah Kerja: **Koorwil Bidang Pendidikan Kecamatan Ambulu, Kabupaten Jember**.

---

## 📁 Struktur Proyek (Tahap 1)

```text
├── gas/
│   └── Code.gs              # REST API Backend Google Apps Script (Mutex Lock, Anti-Leak, Auto-Scoring)
├── api/
│   ├── gas.js               # Vercel Serverless Function: Reverse Proxy & CORS Bypass
│   └── config.js            # Provider konfigurasi dinamis Vercel
├── vercel.json              # Konfigurasi routing rewrite & header CORS
├── push_ke_github.bat       # Script automasi commit & push git Windows
└── README.md                # Panduan teknis instalasi & deployment
```

---

## 🛠️ Langkah Deployment Google Apps Script (GAS)

1. Buka [Google Sheets](https://sheets.new) baru di akun Google Anda. Beri nama: `Database SiSiswa TKA SD Ambulu`.
2. Klik menu **Ekstensi > Apps Script**.
3. Hapus seluruh kode bawaan di `Code.gs`, lalu copy-paste seluruh isi file [gas/Code.gs](gas/Code.gs).
4. Klik tombol **Save (Simpan)**.
5. Jalankan fungsi `setupDatabase()` sekali di editor Apps Script:
   - Pilih fungsi `setupDatabase` pada dropdown fungsi.
   - Klik **Run (Jalankan)** dan berikan izin (*Review Permissions > Advanced > Go to Untitled project (unsafe)*).
   - Seluruh sheet relasional (`Master_Sekolah`, `Soal_20524058`, `Peserta_20524058`, dll.) akan otomatis terbuat beserta data contoh!
6. Lakukan deployment Web App:
   - Klik tombol biru **Deploy > New deployment**.
   - Pilih jenis: **Web app**.
   - Description: `SiSiswa TKA SD Production v1.0`.
   - Execute as: **Me (email Anda)**.
   - Who has access: **Anyone (Siapa saja)** *(Wajib agar siswa dan proxy Vercel dapat mengakses)*.
   - Klik **Deploy**.
   - Salin **Web App URL** yang dihasilkan (format: `https://script.google.com/macros/s/.../exec`).

---

## 🌐 Langkah Deployment Vercel Edge

1. Push repository ini ke GitHub menggunakan `push_ke_github.bat`.
2. Buka [Vercel Dashboard](https://vercel.com) dan impor repository GitHub Anda.
3. Masuk ke **Settings > Environment Variables**, tambahkan:
   - Key: `GAS_URL`
   - Value: URL Web App Google Apps Script yang disalin di langkah sebelumnya.
4. Klik **Deploy**.
5. Sistem API Gateway kini aktif di `https://domain-anda.vercel.app/api/gas` bebas dari kendala CORS dan 302 Redirect!
