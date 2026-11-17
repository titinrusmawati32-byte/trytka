/**
 * =========================================================================================
 * KONFIGURASI UTAMA APLIKASI SISWA TKA SD
 * Wilayah Kerja: Koorwil Bidang Pendidikan Kecamatan Ambulu, Kabupaten Jember
 * =========================================================================================
 * 
 * PETUNJUK:
 * Tempelkan (paste) URL Web App Google Apps Script Anda (yang berakhiran /exec)
 * pada variabel 'gasUrl' di bawah ini:
 */

const APP_CONFIG = {
  appName: "SiSiswa TKA SD",
  wilayah: "Kecamatan Ambulu, Kabupaten Jember",
  versi: "1.0.0-ENTERPRISE",

  // PASTE URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI:
  gasUrl: "TEMPEL_URL_GOOGLE_APPS_SCRIPT_DI_SINI",

  // Pengaturan Gateway Proxy Vercel
  // Jika di-deploy di Vercel: set useProxy: true agar bebas kendala CORS
  // Jika diuji coba langsung / platform lain: sistem otomatis fallback
  useProxy: true,
  proxyUrl: "/api/gas"
};

// Jangan ubah fungsi pembantu ini
function getEffectiveApiEndpoint() {
  // Jika useProxy aktif dan file dibuka lewat web server (bukan file:///)
  if (APP_CONFIG.useProxy && window.location.protocol.startsWith('http') && !window.location.hostname.includes('script.google.com')) {
    return APP_CONFIG.proxyUrl;
  }
  // Fallback langsung ke URL Google Apps Script
  return APP_CONFIG.gasUrl;
}
