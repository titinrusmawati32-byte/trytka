// Vercel Serverless Function: Reverse Proxy untuk Google Apps Script
// Mengatasi masalah CORS dan HTTP 302 Redirect dari Google Apps Script Web App

export default async function handler(req, res) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tangani preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let bodyObj = null;
    if (typeof req.body === 'object' && req.body !== null) {
      bodyObj = req.body;
    } else if (typeof req.body === 'string') {
      try {
        bodyObj = JSON.parse(req.body);
      } catch (e) {}
    }

    // Ambil URL target Google Apps Script dari config payload, query, atau Environment Variable
    const gasUrl =
      (bodyObj && bodyObj.gasUrl) ||
      req.query.gasUrl ||
      process.env.GAS_URL;

    if (!gasUrl || gasUrl === 'TEMPEL_URL_GOOGLE_APPS_SCRIPT_DI_SINI') {
      return res.status(400).json({
        success: false,
        message: 'Parameter GAS_URL belum diisi di public/config.js atau Environment Variable Vercel.'
      });
    }

    let fetchOptions = {
      method: req.method,
      redirect: 'follow', // Wajib: mengikuti 302 redirect dari Google Apps Script
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (req.method === 'POST') {
      const payloadBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      fetchOptions.body = payloadBody;
    }

    // Panggil Google Apps Script Web App
    const response = await fetch(gasUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const textData = await response.text();
      try {
        const parsed = JSON.parse(textData);
        return res.status(response.status).json(parsed);
      } catch (err) {
        return res.status(response.status).send(textData);
      }
    }
  } catch (error) {
    console.error('GAS Proxy Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal terhubung ke Google Apps Script backend: ' + error.message
    });
  }
}
