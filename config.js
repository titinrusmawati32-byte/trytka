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
  gasUrl: "https://script.google.com/macros/s/AKfycbxchCziXW-pnhSOleY9l_geIgXJvWEqkwLkAOEnHuok8WP5MrV_5M1GIWIxLHbIEuQF/exec",

  // Pengaturan Gateway Proxy Vercel
  // Jika di-deploy di Vercel: set useProxy: true agar bebas kendala CORS
  // Jika diuji coba langsung / platform lain: sistem otomatis fallback
  useProxy: true,
  proxyUrl: "/api/gas"
};

// Mengambil URL GAS dari config atau dari localStorage (jika disetel langsung di web)
function getGasUrl() {
  const localUrl = localStorage.getItem('custom_gas_url');
  if (localUrl && localUrl.trim() !== '' && localUrl.startsWith('http')) {
    return localUrl.trim();
  }
  return APP_CONFIG.gasUrl;
}

// Jangan ubah fungsi pembantu ini
function getEffectiveApiEndpoint() {
  const activeGasUrl = getGasUrl();
  if (APP_CONFIG.useProxy && window.location.protocol.startsWith('http') && !window.location.hostname.includes('script.google.com')) {
    return APP_CONFIG.proxyUrl;
  }
  return activeGasUrl;
}
