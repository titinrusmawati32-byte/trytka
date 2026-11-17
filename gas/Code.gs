/**
 * =========================================================================================
 * SiSiswa TKA SD - Google Apps Script Backend Engine
 * Platform Asesmen Mandiri Try Out TKA SD Multi-Tenant
 * Wilayah: Koorwil Bidang Pendidikan Kecamatan Ambulu, Kabupaten Jember
 * Versi: 1.0.0-ENTERPRISE-STRICT
 * =========================================================================================
 */

// Master Direktori 14 SDN se-Kecamatan Ambulu
const MASTER_SEKOLAH_DEFAULT = [
  { npsn: "20524058", namaSekolah: "SDN Sumberejo 04", kodeUnik: "SMB04-3918", status: "Aktif" },
  { npsn: "20524059", namaSekolah: "SDN Sumberejo 01", kodeUnik: "SMB01-1122", status: "Aktif" },
  { npsn: "20524060", namaSekolah: "SDN Sumberejo 02", kodeUnik: "SMB02-3344", status: "Aktif" },
  { npsn: "20524061", namaSekolah: "SDN Ambulu 01", kodeUnik: "AMB01-5566", status: "Aktif" },
  { npsn: "20524062", namaSekolah: "SDN Ambulu 02", kodeUnik: "AMB02-7788", status: "Aktif" },
  { npsn: "20524063", namaSekolah: "SDN Ambulu 03", kodeUnik: "AMB03-9900", status: "Aktif" },
  { npsn: "20524064", namaSekolah: "SDN Karanganyar 01", kodeUnik: "KRG01-2233", status: "Aktif" },
  { npsn: "20524065", namaSekolah: "SDN Karanganyar 02", kodeUnik: "KRG02-4455", status: "Aktif" },
  { npsn: "20524066", namaSekolah: "SDN Tegalsari 01", kodeUnik: "TGL01-6677", status: "Aktif" },
  { npsn: "20524067", namaSekolah: "SDN Tegalsari 02", kodeUnik: "TGL02-8899", status: "Aktif" },
  { npsn: "20524068", namaSekolah: "SDN Pontang 01", kodeUnik: "PTG01-1234", status: "Aktif" },
  { npsn: "20524069", namaSekolah: "SDN Pontang 02", kodeUnik: "PTG02-5678", status: "Aktif" },
  { npsn: "20524070", namaSekolah: "SDN Andongsari 01", kodeUnik: "ADG01-9012", status: "Aktif" },
  { npsn: "20524071", namaSekolah: "SDN Sabrang 01", kodeUnik: "SBR01-3456", status: "Aktif" }
];

/**
 * Entry Point: HTTP GET
 */
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  
  if (action === "getDaftarSekolah") {
    return jsonResponse(getDaftarSekolah());
  }
  
  if (action === "setupDatabase") {
    return jsonResponse(setupDatabase());
  }

  return jsonResponse({
    status: "online",
    name: "SiSiswa TKA SD Backend API",
    version: "1.0.0",
    serverTime: new Date().toISOString(),
    message: "Gunakan HTTP POST untuk eksekusi transaksi asesmen."
  });
}

/**
 * Entry Point: HTTP POST (Dilengkapi Mutex LockService)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  
  // Tunggu lock hingga 30 detik untuk mencegah race condition antar request
  try {
    lock.waitLock(30000);
  } catch (lockError) {
    return jsonResponse({
      success: false,
      message: "Server sedang sibuk memproses data lain. Silakan coba 5 detik lagi."
    });
  }

  try {
    let requestData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        return jsonResponse({ success: false, message: "Payload JSON tidak valid: " + parseError.message });
      }
    }

    const action = requestData.action;
    const payload = requestData.payload || {};

    let response = { success: false, message: "Aksi tidak dikenali: " + action };

    switch (action) {
      // Inisialisasi
      case "setupDatabase":
        response = setupDatabase();
        break;
      case "getDaftarSekolah":
        response = getDaftarSekolah();
        break;

      // Autentikasi Proktor
      case "proktorLogin":
        response = proktorLogin(payload);
        break;

      // Bank Soal
      case "proktorSaveSoalBatch":
        response = proktorSaveSoalBatch(payload);
        break;
      case "proktorGetSoalList":
        response = proktorGetSoalList(payload);
        break;
      case "proktorDeleteSoal":
        response = proktorDeleteSoal(payload);
        break;
      case "proktorClearPaket":
        response = proktorClearPaket(payload);
        break;

      // Peserta Ujian
      case "proktorSavePesertaBatch":
        response = proktorSavePesertaBatch(payload);
        break;
      case "proktorGetPesertaList":
        response = proktorGetPesertaList(payload);
        break;
      case "proktorResetSiswa":
        response = proktorResetSiswa(payload);
        break;

      // Rekapitulasi Nilai
      case "proktorGetRekapNilai":
        response = proktorGetRekapNilai(payload);
        break;

      // Sisi Siswa (CBT Engine)
      case "siswaLoginAndGetSoal":
        response = siswaLoginAndGetSoal(payload);
        break;
      case "siswaSubmitUjian":
        response = siswaSubmitUjian(payload);
        break;

      default:
        response = { success: false, message: "Action handler belum diimplementasikan: " + action };
    }

    return jsonResponse(response);

  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan internal backend: " + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================================
 * HELPER KONEKSI & SHEET RELASIONAL MULTI-TENANT
 * =========================================================================================
 */

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Mengambil atau membuat sheet baru dengan header yang rapi
 */
function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#4F46E5")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Konversi baris sheet menjadi array of object
 */
function sheetToObjects(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return data.map((row, index) => {
    let obj = { _rowIndex: index + 2 };
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

/**
 * Format Output JSON standar
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================================
 * LOGIKA BISNIS: SETUP & MASTER DATA
 * =========================================================================================
 */

function setupDatabase() {
  const ss = getSpreadsheet();
  
  // 1. Master Sekolah
  const masterHeaders = ["npsn", "namaSekolah", "kodeUnik", "status"];
  const masterSheet = getOrCreateSheet(ss, "Master_Sekolah", masterHeaders);
  
  if (masterSheet.getLastRow() <= 1) {
    const rows = MASTER_SEKOLAH_DEFAULT.map(s => [s.npsn, s.namaSekolah, s.kodeUnik, s.status]);
    masterSheet.getRange(2, 1, rows.length, masterHeaders.length).setValues(rows);
  }

  // 2. Buat sample data untuk SDN Sumberejo 04 (20524058) sebagai percontohan
  const sampleNpsn = "20524058";
  
  // Sheet Proktor
  const proktorSheet = getOrCreateSheet(ss, "Proktor_" + sampleNpsn, ["idProktor", "nama", "nip", "pin", "status"]);
  if (proktorSheet.getLastRow() <= 1) {
    proktorSheet.appendRow(["PROK-001", "Bambang Sudarsono, S.Pd.", "198507122010011012", "123456", "Aktif"]);
  }

  // Sheet Peserta
  const pesertaSheet = getOrCreateSheet(ss, "Peserta_" + sampleNpsn, [
    "nisn", "nama", "kelas", "tokenUjian", "statusUjian", "mulaiUjian", "selesaiUjian"
  ]);
  if (pesertaSheet.getLastRow() <= 1) {
    pesertaSheet.appendRow(["0123456789", "Ahmad Fauzi", "VI-A", "TKA26", "BELUM_MULAI", "", ""]);
    pesertaSheet.appendRow(["0123456790", "Siti Aisyah", "VI-A", "TKA26", "BELUM_MULAI", "", ""]);
    pesertaSheet.appendRow(["0123456791", "Budi Santoso", "VI-B", "TKA26", "BELUM_MULAI", "", ""]);
  }

  // Sheet Soal
  const soalSheet = getOrCreateSheet(ss, "Soal_" + sampleNpsn, [
    "idSoal", "paket", "mapel", "pertanyaan", "gambarUrl", "opsiA", "opsiB", "opsiC", "opsiD", "kunci", "bobot", "pembahasan"
  ]);
  if (soalSheet.getLastRow() <= 1) {
    soalSheet.appendRow([
      "SOAL-001", "PAKET-A", "Literasi & Numerasi",
      "Pak Rudi memiliki sebidang tanah berbentuk persegi panjang dengan panjang 24 meter dan lebar 15 meter. Berapakah luas tanah Pak Rudi seluruhnya?",
      "", "360 m²", "380 m²", "390 m²", "400 m²", "A", 1,
      "Luas persegi panjang = Panjang x Lebar = 24 m x 15 m = 360 m²."
    ]);
    soalSheet.appendRow([
      "SOAL-002", "PAKET-A", "Literasi & Numerasi",
      "Bacalah kutipan berikut: 'Sungai Bedadung mengalir membelah Kabupaten Jember. Airnya menjadi tumpuan irigasi ribuan hektar sawah petani.' Pokok pikiran paragraf tersebut adalah...",
      "", "Sungai Bedadung tercemar limbah", "Manfaat Sungai Bedadung bagi pengairan sawah di Jember", "Petani Jember enggan bercocok tanam", "Banjir tahunan di Sungai Bedadung", "B", 1,
      "Gagasan utama paragraf adalah manfaat Sungai Bedadung sebagai tumpuan irigasi sawah para petani."
    ]);
    soalSheet.appendRow([
      "SOAL-003", "PAKET-A", "Literasi & Numerasi",
      "Hasil dari (144 : 12) + (15 x 6) - 25 adalah...",
      "", "72", "77", "87", "92", "B", 1,
      "(144 : 12) = 12. (15 x 6) = 90. 12 + 90 - 25 = 102 - 25 = 77."
    ]);
  }

  // Sheet Nilai
  getOrCreateSheet(ss, "Nilai_" + sampleNpsn, [
    "idNilai", "timestamp", "nisn", "nama", "kelas", "paket", "mapel",
    "jumlahSoal", "jumlahBenar", "jumlahSalah", "jumlahKosong", "nilaiAkhir", "detailJawaban"
  ]);

  return {
    success: true,
    message: "Database SiSiswa TKA SD berhasil diinisialisasi untuk 14 SDN se-Kecamatan Ambulu."
  };
}

function getDaftarSekolah() {
  const ss = getSpreadsheet();
  const masterSheet = ss.getSheetByName("Master_Sekolah");
  if (!masterSheet) {
    setupDatabase();
  }
  const sheet = ss.getSheetByName("Master_Sekolah");
  const schools = sheetToObjects(sheet).map(s => ({
    npsn: String(s.npsn),
    namaSekolah: s.namaSekolah,
    status: s.status
  }));

  return {
    success: true,
    data: schools
  };
}

/**
 * =========================================================================================
 * LOGIKA BISNIS: PORTAL PROKTOR
 * =========================================================================================
 */

function proktorLogin(payload) {
  const { npsn, kodeUnik, pin } = payload;
  if (!npsn || !kodeUnik || !pin) {
    return { success: false, message: "NPSN, Kode Unik Lembaga, dan PIN wajib diisi." };
  }

  const ss = getSpreadsheet();
  
  // Validasi Sekolah & Kode Unik
  const masterSheet = ss.getSheetByName("Master_Sekolah");
  const schools = sheetToObjects(masterSheet);
  const school = schools.find(s => String(s.npsn) === String(npsn));

  if (!school) {
    return { success: false, message: "NPSN " + npsn + " tidak ditemukan dalam direktori Ambulu." };
  }
  if (String(school.kodeUnik).trim() !== String(kodeUnik).trim()) {
    return { success: false, message: "Kode Unik Lembaga salah." };
  }

  // Validasi PIN Proktor
  const proktorSheet = getOrCreateSheet(ss, "Proktor_" + npsn, ["idProktor", "nama", "nip", "pin", "status"]);
  const proctors = sheetToObjects(proktorSheet);
  
  // Fallback: jika proktor belum terdaftar, buat akun default PIN: 123456
  if (proctors.length === 0) {
    proktorSheet.appendRow(["PROK-001", "Proktor " + school.namaSekolah, "-", "123456", "Aktif"]);
  }

  const updatedProctors = sheetToObjects(proktorSheet);
  const matchedProctor = updatedProctors.find(p => String(p.pin).trim() === String(pin).trim());

  if (!matchedProctor) {
    return { success: false, message: "PIN Proktor salah. Hubungi Administrator Koorwil jika lupa PIN." };
  }

  return {
    success: true,
    message: "Login proktor berhasil.",
    proktor: {
      idProktor: matchedProctor.idProktor,
      nama: matchedProctor.nama,
      nip: matchedProctor.nip,
      sekolah: school.namaSekolah,
      npsn: String(school.npsn)
    }
  };
}

function proktorSaveSoalBatch(payload) {
  const { npsn, paket, mapel, soalList } = payload;
  if (!npsn || !soalList || !Array.isArray(soalList) || soalList.length === 0) {
    return { success: false, message: "Data soal tidak lengkap atau kosong." };
  }

  const ss = getSpreadsheet();
  const headers = [
    "idSoal", "paket", "mapel", "pertanyaan", "gambarUrl", "opsiA", "opsiB", "opsiC", "opsiD", "kunci", "bobot", "pembahasan"
  ];
  const sheet = getOrCreateSheet(ss, "Soal_" + npsn, headers);

  const rows = soalList.map((item, idx) => {
    const idSoal = item.idSoal || ("SOAL-" + Utilities.getUuid().substring(0, 8).toUpperCase());
    return [
      idSoal,
      String(paket || item.paket || "PAKET-A").toUpperCase(),
      item.mapel || mapel || "TKA SD",
      item.pertanyaan || "",
      item.gambarUrl || "",
      item.opsiA || "",
      item.opsiB || "",
      item.opsiC || "",
      item.opsiD || "",
      String(item.kunci || "A").trim().toUpperCase(),
      Number(item.bobot) || 1,
      item.pembahasan || ""
    ];
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);

  return {
    success: true,
    message: rows.length + " butir soal berhasil disimpan ke bank soal " + npsn + "."
  };
}

function proktorGetSoalList(payload) {
  const { npsn, paket } = payload;
  if (!npsn) return { success: false, message: "NPSN diperlukan." };

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Soal_" + npsn);
  if (!sheet) return { success: true, data: [] };

  let list = sheetToObjects(sheet);
  if (paket) {
    list = list.filter(item => String(item.paket).toUpperCase() === String(paket).toUpperCase());
  }

  return {
    success: true,
    total: list.length,
    data: list
  };
}

function proktorDeleteSoal(payload) {
  const { npsn, idSoal } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Soal_" + npsn);
  if (!sheet) return { success: false, message: "Bank soal belum tersedia." };

  const list = sheetToObjects(sheet);
  const target = list.find(s => String(s.idSoal) === String(idSoal));
  if (!target) return { success: false, message: "Soal dengan ID " + idSoal + " tidak ditemukan." };

  sheet.deleteRow(target._rowIndex);
  return { success: true, message: "Soal berhasil dihapus." };
}

function proktorClearPaket(payload) {
  const { npsn, paket } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Soal_" + npsn);
  if (!sheet) return { success: false, message: "Bank soal belum tersedia." };

  const list = sheetToObjects(sheet);
  // Hapus dari baris terbawah ke atas agar index baris tidak rusak
  let deletedCount = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (String(list[i].paket).toUpperCase() === String(paket).toUpperCase()) {
      sheet.deleteRow(list[i]._rowIndex);
      deletedCount++;
    }
  }

  return { success: true, message: deletedCount + " soal dari paket " + paket + " berhasil dihapus." };
}

function proktorSavePesertaBatch(payload) {
  const { npsn, pesertaList } = payload;
  if (!npsn || !pesertaList || !Array.isArray(pesertaList)) {
    return { success: false, message: "Daftar peserta tidak valid." };
  }

  const ss = getSpreadsheet();
  const headers = ["nisn", "nama", "kelas", "tokenUjian", "statusUjian", "mulaiUjian", "selesaiUjian"];
  const sheet = getOrCreateSheet(ss, "Peserta_" + npsn, headers);

  const existing = sheetToObjects(sheet);
  const existingMap = new Map();
  existing.forEach(p => existingMap.set(String(p.nisn), p));

  const newRows = [];
  pesertaList.forEach(item => {
    const nisnStr = String(item.nisn).trim();
    if (existingMap.has(nisnStr)) {
      // Update data peserta yang sudah ada
      const target = existingMap.get(nisnStr);
      sheet.getRange(target._rowIndex, 2, 1, 3).setValues([[
        item.nama || target.nama,
        item.kelas || target.kelas,
        item.tokenUjian || target.tokenUjian
      ]]);
    } else {
      newRows.push([
        nisnStr,
        item.nama || "Siswa Baru",
        item.kelas || "VI",
        item.tokenUjian || "TKA26",
        "BELUM_MULAI",
        "",
        ""
      ]);
    }
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }

  return {
    success: true,
    message: pesertaList.length + " peserta berhasil diproses (ditambahkan/diperbarui)."
  };
}

function proktorGetPesertaList(payload) {
  const { npsn } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Peserta_" + npsn);
  if (!sheet) return { success: true, data: [] };

  const list = sheetToObjects(sheet).map(p => ({
    nisn: String(p.nisn),
    nama: p.nama,
    kelas: p.kelas,
    tokenUjian: p.tokenUjian,
    statusUjian: p.statusUjian,
    mulaiUjian: p.mulaiUjian,
    selesaiUjian: p.selesaiUjian
  }));

  return { success: true, data: list };
}

function proktorResetSiswa(payload) {
  const { npsn, nisn } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Peserta_" + npsn);
  if (!sheet) return { success: false, message: "Sheet peserta belum ada." };

  const list = sheetToObjects(sheet);
  const target = list.find(p => String(p.nisn) === String(nisn));
  if (!target) return { success: false, message: "Siswa dengan NISN " + nisn + " tidak ditemukan." };

  // Reset status menjadi BELUM_MULAI
  sheet.getRange(target._rowIndex, 5, 1, 3).setValues([["BELUM_MULAI", "", ""]]);

  return { success: true, message: "Status ujian siswa " + target.nama + " berhasil di-reset." };
}

function proktorGetRekapNilai(payload) {
  const { npsn, paket } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Nilai_" + npsn);
  if (!sheet) return { success: true, data: [], statistik: { rataRata: 0, tertinggi: 0, terendah: 0, totalPeserta: 0 } };

  let list = sheetToObjects(sheet);
  if (paket) {
    list = list.filter(n => String(n.paket).toUpperCase() === String(paket).toUpperCase());
  }

  const scores = list.map(n => Number(n.nilaiAkhir) || 0);
  const totalPeserta = scores.length;
  const tertinggi = totalPeserta > 0 ? Math.max(...scores) : 0;
  const terendah = totalPeserta > 0 ? Math.min(...scores) : 0;
  const rataRata = totalPeserta > 0 ? (scores.reduce((a, b) => a + b, 0) / totalPeserta).toFixed(1) : 0;

  return {
    success: true,
    statistik: {
      totalPeserta: totalPeserta,
      rataRata: Number(rataRata),
      tertinggi: tertinggi,
      terendah: terendah
    },
    data: list
  };
}

/**
 * =========================================================================================
 * LOGIKA BISNIS: PORTAL CBT SISWA (LOCAL-FIRST & ANTI-LEAK ENGINE)
 * =========================================================================================
 */

function siswaLoginAndGetSoal(payload) {
  const { npsn, nisn, tokenUjian } = payload;
  if (!npsn || !nisn || !tokenUjian) {
    return { success: false, message: "NPSN Sekolah, NISN Siswa, dan Token Ujian wajib diisi." };
  }

  const ss = getSpreadsheet();

  // 1. Cek Peserta
  const pesertaSheet = getOrCreateSheet(ss, "Peserta_" + npsn, [
    "nisn", "nama", "kelas", "tokenUjian", "statusUjian", "mulaiUjian", "selesaiUjian"
  ]);
  const pesertaList = sheetToObjects(pesertaSheet);
  const siswa = pesertaList.find(p => String(p.nisn).trim() === String(nisn).trim());

  if (!siswa) {
    return { success: false, message: "NISN " + nisn + " belum terdaftar di sekolah ini. Hubungi proktor/guru kelas." };
  }

  if (String(siswa.tokenUjian).trim().toUpperCase() !== String(tokenUjian).trim().toUpperCase()) {
    return { success: false, message: "Token Ujian tidak valid untuk peserta ini." };
  }

  if (String(siswa.statusUjian) === "SELESAI") {
    return {
      success: false,
      message: "Anda sudah menyelesaikan ujian ini sebelumnya. Konfirmasi ke proktor jika ingin remidi/reset."
    };
  }

  // 2. Ambil Soal Ujian (ANTI-LEAK: Kunci & Pembahasan DIHILANGKAN dari payload)
  const soalSheet = ss.getSheetByName("Soal_" + npsn);
  if (!soalSheet) {
    return { success: false, message: "Bank soal untuk sekolah ini belum disiapkan oleh proktor." };
  }

  const allSoal = sheetToObjects(soalSheet);
  if (allSoal.length === 0) {
    return { success: false, message: "Belum ada soal aktif yang tersedia di sistem." };
  }

  // Filter paket (default PAKET-A jika tidak dispesifikasikan)
  const targetPaket = "PAKET-A";
  let filteredSoal = allSoal.filter(s => String(s.paket).toUpperCase() === targetPaket);
  if (filteredSoal.length === 0) {
    filteredSoal = allSoal; // Fallback ke seluruh soal jika paket tidak terpisah
  }

  // Sensor kunci jawaban dan pembahasan untuk dikirim ke browser siswa
  const sanitizedSoalList = filteredSoal.map((s, index) => ({
    nomor: index + 1,
    idSoal: String(s.idSoal),
    mapel: s.mapel,
    pertanyaan: s.pertanyaan,
    gambarUrl: s.gambarUrl || "",
    opsiA: s.opsiA,
    opsiB: s.opsiB,
    opsiC: s.opsiC,
    opsiD: s.opsiD
  }));

  // Catat waktu mulai jika siswa baru pertama kali masuk
  if (String(siswa.statusUjian) !== "SEDANG_MENGERJAKAN") {
    pesertaSheet.getRange(siswa._rowIndex, 5, 1, 2).setValues([["SEDANG_MENGERJAKAN", new Date().toISOString()]]);
  }

  return {
    success: true,
    message: "Verifikasi berhasil. Selamat mengerjakan ujian!",
    siswa: {
      nisn: String(siswa.nisn),
      nama: siswa.nama,
      kelas: siswa.kelas,
      paket: targetPaket,
      durasiMenit: 60
    },
    soalList: sanitizedSoalList
  };
}

function siswaSubmitUjian(payload) {
  const { npsn, nisn, paket, jawaban } = payload;
  if (!npsn || !nisn || !jawaban || !Array.isArray(jawaban)) {
    return { success: false, message: "Payload lembar jawaban tidak lengkap." };
  }

  const ss = getSpreadsheet();

  // 1. Ambil Kunci Resmi dari Bank Soal
  const soalSheet = ss.getSheetByName("Soal_" + npsn);
  if (!soalSheet) return { success: false, message: "Bank soal tidak ditemukan." };

  const allSoal = sheetToObjects(soalSheet);
  const keyMap = new Map();
  allSoal.forEach(s => {
    keyMap.set(String(s.idSoal), {
      kunci: String(s.kunci).trim().toUpperCase(),
      bobot: Number(s.bobot) || 1,
      mapel: s.mapel
    });
  });

  // 2. Koreksi Jawaban
  let jumlahSoal = keyMap.size;
  let jumlahBenar = 0;
  let jumlahSalah = 0;
  let jumlahKosong = 0;
  let totalBobotBenar = 0;
  let totalBobotMaksimal = 0;
  let detailKoreksi = [];

  keyMap.forEach((soalData, idSoal) => {
    totalBobotMaksimal += soalData.bobot;
    const ans = jawaban.find(j => String(j.idSoal) === idSoal);
    const pilihanSiswa = ans && ans.pilihan ? String(ans.pilihan).trim().toUpperCase() : "";

    if (!pilihanSiswa) {
      jumlahKosong++;
      detailKoreksi.push({ idSoal: idSoal, status: "KOSONG", siswa: "-", kunci: soalData.kunci });
    } else if (pilihanSiswa === soalData.kunci) {
      jumlahBenar++;
      totalBobotBenar += soalData.bobot;
      detailKoreksi.push({ idSoal: idSoal, status: "BENAR", siswa: pilihanSiswa, kunci: soalData.kunci });
    } else {
      jumlahSalah++;
      detailKoreksi.push({ idSoal: idSoal, status: "SALAH", siswa: pilihanSiswa, kunci: soalData.kunci });
    }
  });

  // Skala 0-100
  const nilaiAkhir = totalBobotMaksimal > 0 ? Math.round((totalBobotBenar / totalBobotMaksimal) * 100) : 0;

  // 3. Ambil data profil siswa
  const pesertaSheet = ss.getSheetByName("Peserta_" + npsn);
  let namaSiswa = "Peserta Ujian";
  let kelasSiswa = "VI";

  if (pesertaSheet) {
    const pesertaList = sheetToObjects(pesertaSheet);
    const target = pesertaList.find(p => String(p.nisn) === String(nisn));
    if (target) {
      namaSiswa = target.nama;
      kelasSiswa = target.kelas;
      // Update status peserta menjadi SELESAI
      pesertaSheet.getRange(target._rowIndex, 5, 1, 3).setValues([["SELESAI", target.mulaiUjian || "", new Date().toISOString()]]);
    }
  }

  // 4. Catat ke Sheet Nilai
  const nilaiHeaders = [
    "idNilai", "timestamp", "nisn", "nama", "kelas", "paket", "mapel",
    "jumlahSoal", "jumlahBenar", "jumlahSalah", "jumlahKosong", "nilaiAkhir", "detailJawaban"
  ];
  const nilaiSheet = getOrCreateSheet(ss, "Nilai_" + npsn, nilaiHeaders);

  const idNilai = "NILAI-" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const timestamp = new Date().toISOString();

  nilaiSheet.appendRow([
    idNilai,
    timestamp,
    String(nisn),
    namaSiswa,
    kelasSiswa,
    paket || "PAKET-A",
    "Literasi & Numerasi TKA SD",
    jumlahSoal,
    jumlahBenar,
    jumlahSalah,
    jumlahKosong,
    nilaiAkhir,
    JSON.stringify(detailKoreksi)
  ]);

  return {
    success: true,
    message: "Ujian berhasil dikumpulkan dan nilai berhasil dihitung.",
    hasil: {
      nama: namaSiswa,
      nisn: String(nisn),
      paket: paket || "PAKET-A",
      nilaiAkhir: nilaiAkhir,
      jumlahSoal: jumlahSoal,
      jumlahBenar: jumlahBenar,
      jumlahSalah: jumlahSalah,
      jumlahKosong: jumlahKosong
    }
  };
}
