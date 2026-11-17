// Vercel Serverless Function: Konfigurasi Publik Dinamis
// Menyediakan URL backend dan data master sekolah secara aman ke frontend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    appName: 'SiSiswa TKA SD',
    wilayah: 'Kecamatan Ambulu, Kabupaten Jember',
    gasUrlConfigured: !!process.env.GAS_URL,
    // Jika GAS_URL diset di Vercel, client cukup memanggil endpoint proxy internal '/api/gas'
    apiEndpoint: '/api/gas',
    timestamp: new Date().toISOString()
  });
}
