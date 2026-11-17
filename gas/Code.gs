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

      // Bank Soal Tradisional
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

      // Manajemen 2 Folder Bank Soal (Literasi & Numerasi)
      case "proktorGetBankTemplates":
        response = proktorGetBankTemplates(payload);
        break;
      case "proktorGetTemplateQuestions":
        response = proktorGetTemplateQuestions(payload);
        break;
      case "proktorSaveTemplateBatch":
        response = proktorSaveTemplateBatch(payload);
        break;
      case "proktorDeleteTemplate":
        response = proktorDeleteTemplate(payload);
        break;
      case "proktorPublishTemplatesToExam":
        response = proktorPublishTemplatesToExam(payload);
        break;
      case "proktorGetActiveExamInfo":
        response = proktorGetActiveExamInfo(payload);
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

      // Manajemen Akses Ujian & Token
      case "proktorGetExamSettings":
        response = proktorGetExamSettings(payload);
        break;
      case "proktorSetExamSettings":
        response = proktorSetExamSettings(payload);
        break;

      // Sisi Siswa (CBT Engine)
      case "siswaVerifyTokenLembaga":
        response = siswaVerifyTokenLembaga(payload);
        break;
      case "siswaGetExamPackages":
        response = siswaGetExamPackages(payload);
        break;
      case "siswaVerifyExamToken":
        response = siswaVerifyExamToken(payload);
        break;
      case "siswaLoginAndGetSoal":
        response = siswaLoginAndGetSoal(payload);
        break;
      case "siswaSubmitUjian":
        response = siswaSubmitUjian(payload);
        break;
      case "siswaGetPembahasan":
        response = siswaGetPembahasan(payload);
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

  // Sheet Bank Soal (2 Folder: LITERASI & NUMERASI)
  const bankHeaders = [
    "idSoal", "kategori", "namaTemplate", "mapel", "pertanyaan", "gambarUrl", "opsiA", "opsiB", "opsiC", "opsiD", "kunci", "bobot", "pembahasan"
  ];
  const bankSheet = getOrCreateSheet(ss, "BankSoal_" + sampleNpsn, bankHeaders);
  if (bankSheet.getLastRow() <= 1) {
    // Template Literasi
    bankSheet.appendRow([
      "LIT-001", "LITERASI", "Template Literasi 01 (Teks Informasi)", "Bahasa Indonesia",
      "Bacalah kutipan berikut: 'Sungai Bedadung mengalir membelah Kabupaten Jember. Airnya menjadi tumpuan irigasi ribuan hektar sawah petani.' Pokok pikiran paragraf tersebut adalah...",
      "", "Sungai Bedadung tercemar limbah", "Manfaat Sungai Bedadung bagi pengairan sawah di Jember", "Petani Jember enggan bercocok tanam", "Banjir tahunan di Sungai Bedadung", "B", 1,
      "Gagasan utama paragraf adalah manfaat Sungai Bedadung sebagai tumpuan irigasi sawah para petani."
    ]);
    bankSheet.appendRow([
      "LIT-002", "LITERASI", "Template Literasi 01 (Teks Informasi)", "Bahasa Indonesia",
      "Kecamatan Ambulu memiliki objek wisata Pantai Watu Ulo dan Pantai Pasir Putih Malikan (Papuma). Nilai ekonomi keberadaan tempat wisata ini bagi masyarakat sekitar adalah...",
      "", "Memicu kemacetan jalan raya", "Membuka lapangan kerja dan usaha UMKM warga lokal", "Mengurangi hasil panen nelayan", "Menyebabkan sampah di pemukiman", "B", 1,
      "Tempat wisata memberikan dampak ekonomi positif berupa lapangan kerja dan usaha warga sekitar."
    ]);

    // Template Numerasi
    bankSheet.appendRow([
      "NUM-001", "NUMERASI", "Template Numerasi 01 (Hitung Campuran & Geometri)", "Matematika",
      "Hasil dari (144 : 12) + (15 x 6) - 25 adalah...",
      "", "72", "77", "87", "92", "B", 1,
      "(144 : 12) = 12. (15 x 6) = 90. 12 + 90 - 25 = 102 - 25 = 77."
    ]);
    bankSheet.appendRow([
      "NUM-002", "NUMERASI", "Template Numerasi 01 (Hitung Campuran & Geometri)", "Matematika",
      "Pak Rudi memiliki sebidang tanah berbentuk persegi panjang dengan panjang 24 meter dan lebar 15 meter. Berapakah luas tanah Pak Rudi seluruhnya?",
      "", "360 m²", "380 m²", "390 m²", "400 m²", "A", 1,
      "Luas persegi panjang = Panjang x Lebar = 24 m x 15 m = 360 m²."
    ]);
  }

  // Sheet Soal (Ujian Aktif)
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

/**
 * =========================================================================================
 * LOGIKA BISNIS: 2 FOLDER BANK SOAL (LITERASI & NUMERASI)
 * =========================================================================================
 */

function proktorGetBankTemplates(payload) {
  const { npsn } = payload;
  if (!npsn) return { success: false, message: "NPSN wajib diisi." };

  const ss = getSpreadsheet();
  const bankHeaders = [
    "idSoal", "kategori", "namaTemplate", "mapel", "pertanyaan", "gambarUrl", "opsiA", "opsiB", "opsiC", "opsiD", "kunci", "bobot", "pembahasan"
  ];
  const sheet = getOrCreateSheet(ss, "BankSoal_" + npsn, bankHeaders);
  const rows = sheetToObjects(sheet);

  const result = {
    LITERASI: [],
    NUMERASI: []
  };

  const groupMap = {
    LITERASI: new Map(),
    NUMERASI: new Map()
  };

  rows.forEach(r => {
    let kat = String(r.kategori || "LITERASI").trim().toUpperCase();
    if (kat !== "NUMERASI") kat = "LITERASI";

    const tName = String(r.namaTemplate || "Template Standar").trim();
    if (!groupMap[kat].has(tName)) {
      groupMap[kat].set(tName, {
        namaTemplate: tName,
        kategori: kat,
        mapel: r.mapel || (kat === "LITERASI" ? "Bahasa Indonesia" : "Matematika"),
        totalSoal: 0,
        samplePertanyaan: r.pertanyaan
      });
    }

    const tObj = groupMap[kat].get(tName);
    tObj.totalSoal++;
  });

  groupMap.LITERASI.forEach(val => result.LITERASI.push(val));
  groupMap.NUMERASI.forEach(val => result.NUMERASI.push(val));

  return {
    success: true,
    data: result
  };
}

function proktorGetTemplateQuestions(payload) {
  const { npsn, kategori, namaTemplate } = payload;
  if (!npsn || !namaTemplate) return { success: false, message: "Parameter tidak lengkap." };

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("BankSoal_" + npsn);
  if (!sheet) return { success: true, data: [] };

  const rows = sheetToObjects(sheet);
  const filtered = rows.filter(r => {
    const katMatch = kategori ? (String(r.kategori).trim().toUpperCase() === String(kategori).trim().toUpperCase()) : true;
    return katMatch && String(r.namaTemplate).trim() === String(namaTemplate).trim();
  });

  return {
    success: true,
    total: filtered.length,
    data: filtered
  };
}

function proktorSaveTemplateBatch(payload) {
  const { npsn, kategori, namaTemplate, mapel, soalList } = payload;
  if (!npsn || !namaTemplate || !soalList || !Array.isArray(soalList) || soalList.length === 0) {
    return { success: false, message: "Nama template dan daftar soal wajib diisi." };
  }

  const ss = getSpreadsheet();
  const bankHeaders = [
    "idSoal", "kategori", "namaTemplate", "mapel", "pertanyaan", "gambarUrl", "opsiA", "opsiB", "opsiC", "opsiD", "kunci", "bobot", "pembahasan"
  ];
  const sheet = getOrCreateSheet(ss, "BankSoal_" + npsn, bankHeaders);

  const kat = String(kategori || "LITERASI").trim().toUpperCase();
  const prefix = kat === "NUMERASI" ? "NUM" : "LIT";

  const rows = soalList.map((item, idx) => {
    const idSoal = item.idSoal || (`${prefix}-` + Utilities.getUuid().substring(0, 8).toUpperCase());
    return [
      idSoal,
      kat,
      namaTemplate.trim(),
      item.mapel || mapel || (kat === "LITERASI" ? "Bahasa Indonesia" : "Matematika"),
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

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, bankHeaders.length).setValues(rows);

  return {
    success: true,
    message: `${rows.length} butir soal berhasil disimpan ke Folder ${kat} dalam template "${namaTemplate}".`
  };
}

function proktorDeleteTemplate(payload) {
  const { npsn, kategori, namaTemplate } = payload;
  if (!npsn || !namaTemplate) return { success: false, message: "Parameter tidak lengkap." };

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("BankSoal_" + npsn);
  if (!sheet) return { success: false, message: "Bank soal belum tersedia." };

  const rows = sheetToObjects(sheet);
  let deletedCount = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const katMatch = kategori ? (String(r.kategori).trim().toUpperCase() === String(kategori).trim().toUpperCase()) : true;
    if (katMatch && String(r.namaTemplate).trim() === String(namaTemplate).trim()) {
      sheet.deleteRow(r._rowIndex);
      deletedCount++;
    }
  }

  return {
    success: true,
    message: `Template "${namaTemplate}" berhasil dihapus (${deletedCount} butir soal dihapus).`
  };
}

function proktorPublishTemplatesToExam(payload) {
  const { npsn, templateNames, targetPaket } = payload;
  if (!npsn || !templateNames || !Array.isArray(templateNames) || templateNames.length === 0) {
    return { success: false, message: "Pilih minimal 1 template untuk dipublikasikan." };
  }

  const ss = getSpreadsheet();
  const bankSheet = ss.getSheetByName("BankSoal_" + npsn);
  if (!bankSheet) return { success: false, message: "Bank soal belum ada." };

  const bankRows = sheetToObjects(bankSheet);
  const targetSet = new Set(templateNames.map(t => String(t).trim()));

  const selectedQuestions = bankRows.filter(r => targetSet.has(String(r.namaTemplate).trim()));

  if (selectedQuestions.length === 0) {
    return { success: false, message: "Tidak ditemukan butir soal pada template yang dipilih." };
  }

  // Siapkan sheet Soal_{npsn}
  const soalHeaders = [
    "idSoal", "paket", "mapel", "pertanyaan", "gambarUrl", "opsiA", "opsiB", "opsiC", "opsiD", "kunci", "bobot", "pembahasan"
  ];
  let soalSheet = ss.getSheetByName("Soal_" + npsn);
  if (!soalSheet) {
    soalSheet = getOrCreateSheet(ss, "Soal_" + npsn, soalHeaders);
  } else {
    // Kosongkan soal aktif lama jika ada
    const lastRow = soalSheet.getLastRow();
    if (lastRow > 1) {
      soalSheet.deleteRows(2, lastRow - 1);
    }
  }

  const pName = String(targetPaket || "PAKET-A").trim().toUpperCase();

  const newRows = selectedQuestions.map((q, idx) => [
    q.idSoal || ("SOAL-" + (idx + 1)),
    pName,
    q.mapel || "Literasi & Numerasi TKA SD",
    q.pertanyaan,
    q.gambarUrl || "",
    q.opsiA,
    q.opsiB,
    q.opsiC,
    q.opsiD,
    q.kunci,
    Number(q.bobot) || 1,
    q.pembahasan || ""
  ]);

  soalSheet.getRange(2, 1, newRows.length, soalHeaders.length).setValues(newRows);

  return {
    success: true,
    message: `Berhasil mempublikasikan ${newRows.length} butir soal dari template [${templateNames.join(", ")}] menjadi Paket Ujian Aktif!`,
    totalSoal: newRows.length,
    paket: pName
  };
}

function proktorGetActiveExamInfo(payload) {
  const { npsn } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Soal_" + npsn);
  if (!sheet) return { success: true, totalSoal: 0, paket: "BELUM_ADA" };

  const list = sheetToObjects(sheet);
  const paket = list.length > 0 ? list[0].paket : "-";

  return {
    success: true,
    totalSoal: list.length,
    paket: paket
  };
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
 * MANAJEMEN AKSES UJIAN, KUNCI ADMIN & TOKEN PENGAWAS
 * =========================================================================================
 */

function getSchoolExamSettings(npsn) {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty("EXAM_SETTINGS_" + npsn);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch(e) {}
  }

  // Default settings awal
  return {
    isExamLocked: false,
    activeToken: "TKA26",
    packages: [
      {
        idPaket: "LIT",
        namaPaket: "Paket 1: Literasi Membaca",
        mapel: "Literasi Membaca",
        jumlahSoal: 20,
        durasiMenit: 45,
        isLocked: false,
        keterangan: "Bahasa Indonesia & Pemahaman Wacana"
      },
      {
        idPaket: "NUM",
        namaPaket: "Paket 2: Numerasi Berhitung",
        mapel: "Numerasi Berhitung",
        jumlahSoal: 20,
        durasiMenit: 45,
        isLocked: false,
        keterangan: "Matematika & Pemecahan Masalah"
      },
      {
        idPaket: "GABUNGAN",
        namaPaket: "Paket 3: Try Out Lengkap TKA SD",
        mapel: "Literasi & Numerasi",
        jumlahSoal: 40,
        durasiMenit: 60,
        isLocked: false,
        keterangan: "Simulasi Penuh Literasi + Numerasi"
      }
    ]
  };
}

function setSchoolExamSettings(npsn, settings) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("EXAM_SETTINGS_" + npsn, JSON.stringify(settings));
}

function proktorGetExamSettings(payload) {
  const { npsn } = payload;
  if (!npsn) return { success: false, message: "NPSN wajib diisi." };
  const settings = getSchoolExamSettings(npsn);
  return {
    success: true,
    data: settings
  };
}

function proktorSetExamSettings(payload) {
  const { npsn, settings } = payload;
  if (!npsn || !settings) return { success: false, message: "Parameter tidak lengkap." };
  setSchoolExamSettings(npsn, settings);
  return {
    success: true,
    message: "Pengaturan akses ujian & token berhasil diperbarui.",
    data: settings
  };
}

function siswaGetExamPackages(payload) {
  const { npsn } = payload;
  if (!npsn) return { success: false, message: "NPSN wajib diisi." };
  const settings = getSchoolExamSettings(npsn);

  // Sensor token rahasia sebelum dikirim ke browser siswa
  const sanitizedPackages = settings.packages.map(p => ({
    idPaket: p.idPaket,
    namaPaket: p.namaPaket,
    mapel: p.mapel,
    jumlahSoal: p.jumlahSoal,
    durasiMenit: p.durasiMenit,
    isLocked: settings.isExamLocked || p.isLocked,
    keterangan: p.keterangan
  }));

  return {
    success: true,
    isExamLocked: settings.isExamLocked,
    packages: sanitizedPackages
  };
}

function siswaVerifyExamToken(payload) {
  const { npsn, nisn, idPaket, tokenInput } = payload;
  if (!npsn || !tokenInput) {
    return { success: false, message: "Token ujian wajib diisi." };
  }

  const settings = getSchoolExamSettings(npsn);

  // 1. Cek apakah seluruh ujian sedang dikunci admin
  if (settings.isExamLocked) {
    return {
      success: false,
      message: "Ujian saat ini masih DIKUNCI oleh Pengawas/Admin. Harap tunggu hingga waktu ujian resmi dibuka."
    };
  }

  // Cek apakah paket ini secara spesifik dikunci
  const targetPkg = settings.packages.find(p => p.idPaket === idPaket);
  if (targetPkg && targetPkg.isLocked) {
    return {
      success: false,
      message: "Paket ujian ini masih DIKUNCI oleh Pengawas/Admin. Belum waktunya untuk dikerjakan."
    };
  }

  // 2. Cek Token Ujian dari Guru
  const cleanInput = String(tokenInput).trim().toUpperCase();
  const validToken = String(settings.activeToken || "TKA26").trim().toUpperCase();

  if (cleanInput !== validToken) {
    return {
      success: false,
      message: "Token Ujian salah! Silakan tanyakan token resmi pada Bapak/Ibu Guru pengawas di kelas."
    };
  }

  // 3. Ambil Soal Sesuai Paket
  const ss = getSpreadsheet();
  const soalSheet = ss.getSheetByName("Soal_" + npsn);
  let sanitizedSoalList = [];

  if (soalSheet) {
    const allSoal = sheetToObjects(soalSheet);
    let filtered = allSoal;
    if (idPaket === "LIT") {
      filtered = allSoal.filter(s => String(s.mapel).toLowerCase().includes("literasi"));
    } else if (idPaket === "NUM") {
      filtered = allSoal.filter(s => String(s.mapel).toLowerCase().includes("numerasi"));
    }
    if (filtered.length === 0) filtered = allSoal;

    sanitizedSoalList = filtered.map((s, index) => ({
      nomor: index + 1,
      idSoal: String(s.idSoal),
      mapel: s.mapel || "Literasi & Numerasi",
      pertanyaan: s.pertanyaan,
      gambarUrl: s.gambarUrl || "",
      opsiA: s.opsiA,
      opsiB: s.opsiB,
      opsiC: s.opsiC,
      opsiD: s.opsiD
    }));
  }

  return {
    success: true,
    message: "Token ujian valid! Selamat mengerjakan.",
    paketInfo: targetPkg || {
      idPaket: idPaket,
      namaPaket: "Paket Ujian",
      durasiMenit: 60
    },
    soalList: sanitizedSoalList
  };
}

/**
 * =========================================================================================
 * LOGIKA BISNIS: PORTAL CBT SISWA (LOCAL-FIRST & ANTI-LEAK ENGINE)
 * =========================================================================================
 */

function siswaVerifyTokenLembaga(payload) {
  const { kodeUnik, npsn } = payload;
  if (!kodeUnik && !npsn) {
    return { success: false, message: "Token / Kode Unik Lembaga wajib diisi." };
  }

  const ss = getSpreadsheet();
  const masterSheet = ss.getSheetByName("Master_Sekolah");
  let daftarSekolah = masterSheet ? sheetToObjects(masterSheet) : MASTER_SEKOLAH_DEFAULT;
  if (!daftarSekolah || daftarSekolah.length === 0) daftarSekolah = MASTER_SEKOLAH_DEFAULT;

  let sekolah = null;
  if (kodeUnik) {
    const clean = String(kodeUnik).trim().toUpperCase();
    sekolah = daftarSekolah.find(s => 
      String(s.kodeUnik).trim().toUpperCase() === clean || 
      String(s.npsn).trim() === clean
    );
  }
  if (!sekolah && npsn) {
    sekolah = daftarSekolah.find(s => String(s.npsn).trim() === String(npsn).trim());
  }

  if (!sekolah) {
    return { success: false, message: "Token / Kode Lembaga tidak valid. Pastikan Anda memasukkan kode unik yang benar dari sekolah." };
  }

  return {
    success: true,
    message: "Token lembaga valid.",
    sekolah: {
      npsn: sekolah.npsn,
      namaSekolah: sekolah.namaSekolah,
      kodeUnik: sekolah.kodeUnik
    }
  };
}

function siswaLoginAndGetSoal(payload) {
  let { kodeUnik, npsn, nisn, nis, nama, kelas, tokenUjian } = payload;
  if (!nisn) {
    return { success: false, message: "NISN Siswa wajib diisi." };
  }

  const ss = getSpreadsheet();

  // 1. Validasi / Resolusi Lembaga berdasarkan kodeUnik atau npsn
  let sekolah = null;
  const masterSheet = ss.getSheetByName("Master_Sekolah");
  let daftarSekolah = masterSheet ? sheetToObjects(masterSheet) : MASTER_SEKOLAH_DEFAULT;
  if (!daftarSekolah || daftarSekolah.length === 0) daftarSekolah = MASTER_SEKOLAH_DEFAULT;

  if (kodeUnik) {
    const cleanKode = String(kodeUnik).trim().toUpperCase();
    sekolah = daftarSekolah.find(s => 
      String(s.kodeUnik).trim().toUpperCase() === cleanKode || 
      String(s.npsn).trim() === cleanKode
    );
  }
  if (!sekolah && npsn) {
    sekolah = daftarSekolah.find(s => String(s.npsn).trim() === String(npsn).trim());
  }

  if (!sekolah) {
    return { 
      success: false, 
      message: "Kode Lembaga / PIN tidak valid. Pastikan Anda memasukkan kode unik lembaga yang benar." 
    };
  }

  const targetNpsn = sekolah.npsn;
  const namaSekolah = sekolah.namaSekolah;

  // 2. Cek & Kelola Data Peserta di Peserta_{targetNpsn}
  const pesertaSheet = getOrCreateSheet(ss, "Peserta_" + targetNpsn, [
    "nisn", "nis", "nama", "kelas", "tokenUjian", "statusUjian", "mulaiUjian", "selesaiUjian"
  ]);
  const pesertaList = sheetToObjects(pesertaSheet);
  let siswa = pesertaList.find(p => String(p.nisn).trim() === String(nisn).trim());

  const cleanNis = nis ? String(nis).trim() : "-";
  const cleanNama = nama ? String(nama).trim().toUpperCase() : "SISWA";
  const cleanKelas = kelas ? String(kelas).trim() : "VI";
  const cleanToken = tokenUjian ? String(tokenUjian).trim().toUpperCase() : "AUTO";
  const waktuMulai = new Date().toISOString();

  // Jika siswa belum ada di database, LAKUKAN REGISTRASI MANDIRI OTOMATIS
  if (!siswa) {
    if (!nama || String(nama).trim() === "") {
      return { 
        success: false, 
        message: "Nama lengkap siswa wajib diisi untuk pencatatan pertama kali di database sekolah." 
      };
    }

    pesertaSheet.appendRow([
      String(nisn).trim(),
      cleanNis,
      cleanNama,
      cleanKelas,
      cleanToken,
      "SEDANG_MENGERJAKAN",
      waktuMulai,
      ""
    ]);

    siswa = {
      nisn: String(nisn).trim(),
      nis: cleanNis,
      nama: cleanNama,
      kelas: cleanKelas,
      tokenUjian: cleanToken,
      statusUjian: "SEDANG_MENGERJAKAN",
      mulaiUjian: waktuMulai
    };
  } else {
    // Jika siswa sudah ada, perbarui data jika ada nilai baru
    if (nis && (!siswa.nis || siswa.nis === "-")) {
      pesertaSheet.getRange(siswa._rowIndex, 2).setValue(cleanNis);
      siswa.nis = cleanNis;
    }
    if (nama && (!siswa.nama || siswa.nama.trim() === "" || siswa.nama === "SISWA")) {
      pesertaSheet.getRange(siswa._rowIndex, 3).setValue(cleanNama);
      siswa.nama = cleanNama;
    }
    if (kelas && (!siswa.kelas || siswa.kelas.trim() === "")) {
      pesertaSheet.getRange(siswa._rowIndex, 4).setValue(cleanKelas);
      siswa.kelas = cleanKelas;
    }
  }

  // Jika siswa SUDAH SELESAI mengerjakan ujian sebelumnya:
  const isFinished = (String(siswa.statusUjian) === "SELESAI");

  // 3. Ambil Soal Ujian (ANTI-LEAK: Kunci & Pembahasan DIHILANGKAN untuk ujian aktif)
  const soalSheet = ss.getSheetByName("Soal_" + targetNpsn);
  let sanitizedSoalList = [];
  const targetPaket = "PAKET-A";

  if (soalSheet) {
    const allSoal = sheetToObjects(soalSheet);
    let filteredSoal = allSoal.filter(s => String(s.paket).toUpperCase() === targetPaket);
    if (filteredSoal.length === 0) filteredSoal = allSoal;

    sanitizedSoalList = filteredSoal.map((s, index) => ({
      nomor: index + 1,
      idSoal: String(s.idSoal),
      mapel: s.mapel || "Literasi & Numerasi",
      pertanyaan: s.pertanyaan,
      gambarUrl: s.gambarUrl || "",
      opsiA: s.opsiA,
      opsiB: s.opsiB,
      opsiC: s.opsiC,
      opsiD: s.opsiD
    }));
  }

  // Ambil hasil nilai jika sudah selesai
  let hasilNilai = null;
  if (isFinished) {
    const nilaiSheet = ss.getSheetByName("Nilai_" + targetNpsn);
    if (nilaiSheet) {
      const listNilai = sheetToObjects(nilaiSheet);
      const rekap = listNilai.find(n => String(n.nisn).trim() === String(nisn).trim());
      if (rekap) {
        hasilNilai = {
          nama: rekap.nama || siswa.nama,
          nisn: String(rekap.nisn),
          nis: rekap.nis || siswa.nis || cleanNis,
          kelas: rekap.kelas || siswa.kelas,
          paket: rekap.paket || targetPaket,
          nilaiAkhir: Number(rekap.nilaiAkhir) || 0,
          jumlahSoal: Number(rekap.jumlahSoal) || sanitizedSoalList.length,
          jumlahBenar: Number(rekap.jumlahBenar) || 0,
          jumlahSalah: Number(rekap.jumlahSalah) || 0,
          jumlahKosong: Number(rekap.jumlahKosong) || 0,
          timestamp: rekap.timestamp
        };
      }
    }
  }

  // Catat waktu mulai jika belum
  if (!isFinished && String(siswa.statusUjian) !== "SEDANG_MENGERJAKAN") {
    pesertaSheet.getRange(siswa._rowIndex, 6, 1, 2).setValues([["SEDANG_MENGERJAKAN", new Date().toISOString()]]);
  }

  return {
    success: true,
    message: isFinished 
      ? "Selamat datang kembali! Anda telah menyelesaikan ujian ini." 
      : "Identitas (" + siswa.nama + ") berhasil dicatat di database " + namaSekolah + ". Selamat mengerjakan!",
    isFinished: isFinished,
    sekolah: {
      npsn: targetNpsn,
      namaSekolah: namaSekolah,
      kodeUnik: sekolah.kodeUnik
    },
    siswa: {
      nisn: String(siswa.nisn),
      nis: siswa.nis || cleanNis,
      nama: siswa.nama,
      kelas: siswa.kelas || "VI",
      paket: targetPaket,
      statusUjian: siswa.statusUjian,
      durasiMenit: 60
    },
    soalList: sanitizedSoalList,
    hasilNilai: hasilNilai
  };
}

function siswaSubmitUjian(payload) {
  const { npsn, nisn, nis, paket, jawaban } = payload;
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
  let nisSiswa = nis || "-";

  if (pesertaSheet) {
    const pesertaList = sheetToObjects(pesertaSheet);
    const target = pesertaList.find(p => String(p.nisn) === String(nisn));
    if (target) {
      namaSiswa = target.nama;
      kelasSiswa = target.kelas;
      if (target.nis) nisSiswa = target.nis;
      // Update status peserta menjadi SELESAI
      pesertaSheet.getRange(target._rowIndex, 6, 1, 3).setValues([["SELESAI", target.mulaiUjian || "", new Date().toISOString()]]);
    }
  }

  // 4. Catat ke Sheet Nilai
  const nilaiHeaders = [
    "idNilai", "timestamp", "nisn", "nis", "nama", "kelas", "paket", "mapel",
    "jumlahSoal", "jumlahBenar", "jumlahSalah", "jumlahKosong", "nilaiAkhir", "detailJawaban"
  ];
  const nilaiSheet = getOrCreateSheet(ss, "Nilai_" + npsn, nilaiHeaders);

  const idNilai = "NILAI-" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const timestamp = new Date().toISOString();

  nilaiSheet.appendRow([
    idNilai,
    timestamp,
    String(nisn),
    nisSiswa,
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
      nis: nisSiswa,
      paket: paket || "PAKET-A",
      nilaiAkhir: nilaiAkhir,
      jumlahSoal: jumlahSoal,
      jumlahBenar: jumlahBenar,
      jumlahSalah: jumlahSalah,
      jumlahKosong: jumlahKosong
    }
  };
}

function siswaGetPembahasan(payload) {
  const { npsn, nisn, paket } = payload;
  if (!npsn || !nisn) {
    return { success: false, message: "NPSN dan NISN wajib diisi." };
  }

  const ss = getSpreadsheet();
  const nilaiSheet = ss.getSheetByName("Nilai_" + npsn);
  if (!nilaiSheet) {
    return { success: false, message: "Belum ada rekaman nilai ujian untuk sekolah ini." };
  }

  const listNilai = sheetToObjects(nilaiSheet);
  const rekap = listNilai.find(n => String(n.nisn).trim() === String(nisn).trim());
  if (!rekap) {
    return { success: false, message: "Hasil ujian peserta belum ditemukan. Pastikan sudah menyelesaikan ujian." };
  }

  let detailJawaban = [];
  try {
    if (rekap.detailJawaban) {
      detailJawaban = JSON.parse(rekap.detailJawaban);
    }
  } catch (e) {
    detailJawaban = [];
  }

  // Ambil soal dengan KUNCI & PEMBAHASAN LENGKAP
  const soalSheet = ss.getSheetByName("Soal_" + npsn);
  if (!soalSheet) {
    return { success: false, message: "Data bank soal tidak ditemukan." };
  }

  const allSoal = sheetToObjects(soalSheet);
  const targetPaket = paket || "PAKET-A";
  let filteredSoal = allSoal.filter(s => String(s.paket).toUpperCase() === String(targetPaket).toUpperCase());
  if (filteredSoal.length === 0) filteredSoal = allSoal;

  const listPembahasan = filteredSoal.map((s, index) => {
    const idSoal = String(s.idSoal);
    const ans = detailJawaban.find(d => String(d.idSoal) === idSoal);
    const status = ans ? ans.status : "KOSONG";
    const jawabanSiswa = ans && ans.siswa ? ans.siswa : "-";
    const kunciResmi = String(s.kunci).trim().toUpperCase();

    return {
      nomor: index + 1,
      idSoal: idSoal,
      mapel: s.mapel || "Literasi & Numerasi",
      pertanyaan: s.pertanyaan,
      gambarUrl: s.gambarUrl || "",
      opsiA: s.opsiA,
      opsiB: s.opsiB,
      opsiC: s.opsiC,
      opsiD: s.opsiD,
      kunci: kunciResmi,
      pembahasan: s.pembahasan || "Pembahasan resmi disiapkan oleh Tim Pengembang Soal.",
      jawabanSiswa: jawabanSiswa,
      status: status
    };
  });

  return {
    success: true,
    hasil: {
      nama: rekap.nama,
      nisn: String(rekap.nisn),
      kelas: rekap.kelas,
      paket: rekap.paket,
      nilaiAkhir: Number(rekap.nilaiAkhir) || 0,
      jumlahSoal: Number(rekap.jumlahSoal) || listPembahasan.length,
      jumlahBenar: Number(rekap.jumlahBenar) || 0,
      jumlahSalah: Number(rekap.jumlahSalah) || 0,
      jumlahKosong: Number(rekap.jumlahKosong) || 0,
      timestamp: rekap.timestamp
    },
    listPembahasan: listPembahasan
  };
}
