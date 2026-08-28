// Master Data Klasifikasi DDC (Dewey Decimal Classification) Detail & Spesifik Perpustakaan Sekolah/Umum

export const DDC_MAIN_CLASSES = [
  { code: '000', name: '000 - Karya Umum, Komputer & Informasi', color: '#3b82f6' },
  { code: '100', name: '100 - Filsafat & Psikologi', color: '#8b5cf6' },
  { code: '200', name: '200 - Agama (Termasuk 297 Agama Islam)', color: '#10b981' },
  { code: '300', name: '300 - Ilmu Social, PPKn & Kebudayaan', color: '#06b6d4' },
  { code: '400', name: '400 - Bahasa & Linguistik', color: '#f59e0b' },
  { code: '500', name: '500 - Sains Murni, IPA & Matematika', color: '#34d399' },
  { code: '600', name: '600 - Teknologi, Kedokteran & Ketrampilan', color: '#ec4899' },
  { code: '700', name: '700 - Kesenian, Olahraga & Rekreasi', color: '#a855f7' },
  { code: '800', name: '800 - Sastra, Novel & Karya Cerita', color: '#f43f5e' },
  { code: '900', name: '900 - Sejarah, Geografi & Biografi Tokoh', color: '#eab308' }
];

export const DDC_DETAILED_DATABASE = [
  // --- 000 KARYA UMUM & KOMPUTER ---
  { code: '000', mainClass: '000', label: '000 - Karya Umum & Komputer (Generalities)', category: 'Komputer & IT' },
  { code: '001', mainClass: '000', label: '001 - Ilmu Pengetahuan Umum & Metodologi', category: 'Komputer & IT' },
  { code: '004', mainClass: '000', label: '004 - Pengolahan Data & Komputer', category: 'Komputer & IT' },
  { code: '005', mainClass: '000', label: '005 - Pemrograman Komputer, Algoritma & Software', category: 'Komputer & IT' },
  { code: '006', mainClass: '000', label: '006 - Kecerdasan Buatan (AI), Multimedia & Grafis', category: 'Komputer & IT' },
  { code: '020', mainClass: '000', label: '020 - Ilmu Perpustakaan & Informasi', category: 'Umum' },
  { code: '030', mainClass: '000', label: '030 - Ensiklopedia Umum', category: 'Umum' },
  { code: '070', mainClass: '000', label: '070 - Media Massa, Jurnalistik & Penerbitan', category: 'Umum' },

  // --- 100 FILSAFAT & PSIKOLOGI ---
  { code: '100', mainClass: '100', label: '100 - Filsafat Umum', category: 'Pengembangan Diri' },
  { code: '150', mainClass: '100', label: '150 - Psikologi Umum', category: 'Pengembangan Diri' },
  { code: '152', mainClass: '100', label: '152 - Persepsi, Emosi & Motivasi', category: 'Pengembangan Diri' },
  { code: '153', mainClass: '100', label: '153 - Proses Mental, Daya Ingat & Kecerdasan', category: 'Pengembangan Diri' },
  { code: '155', mainClass: '100', label: '155 - Psikologi Perkembangan & Anak', category: 'Pengembangan Diri' },
  { code: '158', mainClass: '100', label: '158 - Psikologi Terapan & Pengembangan Diri', category: 'Pengembangan Diri' },
  { code: '170', mainClass: '100', label: '170 - Etika, Moral & Karakter', category: 'Pengembangan Diri' },

  // --- 200 AGAMA & SPESIFIK AGAMA ISLAM (297) ---
  { code: '200', mainClass: '200', label: '200 - Agama Umum', category: 'Agama & Keimanan' },
  { code: '297', mainClass: '200', label: '297 - Agama Islam (Umum)', category: 'Agama & Keimanan' },
  { code: '297.1', mainClass: '200', label: '297.1 - Al-Qur\'an, Tafsir & Ilmu Al-Qur\'an', category: 'Agama & Keimanan' },
  { code: '297.2', mainClass: '200', label: '297.2 - Aqidah, Keimanan & Tauhid', category: 'Agama & Keimanan' },
  { code: '297.3', mainClass: '200', label: '297.3 - Fiqih, Syariah, Shalat & Ibadah', category: 'Agama & Keimanan' },
  { code: '297.4', mainClass: '200', label: '297.4 - Akhlak, Adab & Tasawuf Islam', category: 'Agama & Keimanan' },
  { code: '297.5', mainClass: '200', label: '297.5 - Muamalat, Ekonomi Islam & Hukum Islam', category: 'Agama & Keimanan' },
  { code: '297.6', mainClass: '200', label: '297.6 - Sejarah Islam, Tarikh & Kebudayaan Islam', category: 'Agama & Keimanan' },
  { code: '297.7', mainClass: '200', label: '297.7 - Hadits Nabi & Ulumul Hadits', category: 'Agama & Keimanan' },
  { code: '297.8', mainClass: '200', label: '297.8 - Pemikiran Islam & Tokoh Cendekiawan Islam', category: 'Agama & Keimanan' },
  { code: '297.9', mainClass: '200', label: '297.9 - Kisah Nabi, Rasul & Sahabat Nabi', category: 'Agama & Keimanan' },

  // --- 300 ILMU-ILMU SOSIAL ---
  { code: '300', mainClass: '300', label: '300 - Ilmu-Ilmu Sosial Umum', category: 'Sejarah / Sastra' },
  { code: '320', mainClass: '300', label: '320 - Ilmu Politik, Pemerintahan & PPKn', category: 'Sejarah / Sastra' },
  { code: '330', mainClass: '300', label: '330 - Ilmu Ekonomi, Perbankan & Bisnis', category: 'Sejarah / Sastra' },
  { code: '340', mainClass: '300', label: '340 - Ilmu Hukum & Perundang-undangan', category: 'Sejarah / Sastra' },
  { code: '370', mainClass: '300', label: '370 - Pendidikan, Pengajaran & Sekolah', category: 'Pengembangan Diri' },
  { code: '390', mainClass: '300', label: '390 - Adat Istiadat, Kebudayaan & Tradisi', category: 'Sejarah / Sastra' },

  // --- 400 BAHASA & LINGUISTIK ---
  { code: '400', mainClass: '400', label: '400 - Bahasa & Linguistik Umum', category: 'Umum' },
  { code: '420', mainClass: '400', label: '420 - Bahasa Inggris & Grammar', category: 'Umum' },
  { code: '492.7', mainClass: '400', label: '492.7 - Bahasa Arab & Nahwu Shorof', category: 'Agama & Keimanan' },
  { code: '499.221', mainClass: '400', label: '499.221 - Bahasa Indonesia & EYD', category: 'Umum' },

  // --- 500 SAINS MURNI, IPA & MATEMATIKA ---
  { code: '500', mainClass: '500', label: '500 - Sains Murni / IPA Umum', category: 'Sains & Teknologi' },
  { code: '510', mainClass: '500', label: '510 - Matematika, Aljabar & Geometri', category: 'Sains & Teknologi' },
  { code: '520', mainClass: '500', label: '520 - Astronomi, Tata Surya & Antariksa', category: 'Sains & Teknologi' },
  { code: '530', mainClass: '500', label: '530 - Fisika & Mekanika', category: 'Sains & Teknologi' },
  { code: '540', mainClass: '500', label: '540 - Kimia & Reaksi Kimia', category: 'Sains & Teknologi' },
  { code: '550', mainClass: '500', label: '550 - Geologi, Ilmu Bumi & Cuaca', category: 'Sains & Teknologi' },
  { code: '570', mainClass: '500', label: '570 - Biologi & Ekosistem Alam', category: 'Sains & Teknologi' },
  { code: '580', mainClass: '500', label: '580 - Botani / Ilmu Tumbuhan', category: 'Sains & Teknologi' },
  { code: '590', mainClass: '500', label: '590 - Zoologi / Ilmu Hewan & Satwa', category: 'Sains & Teknologi' },

  // --- 600 TEKNOLOGI & ILMU TERAPAN ---
  { code: '600', mainClass: '600', label: '600 - Teknologi & Ilmu Terapan Umum', category: 'Sains & Teknologi' },
  { code: '610', mainClass: '600', label: '610 - Kedokteran, Kesehatan & Gizi', category: 'Sains & Teknologi' },
  { code: '620', mainClass: '600', label: '620 - Teknik & Rekayasa Mesin', category: 'Sains & Teknologi' },
  { code: '630', mainClass: '600', label: '630 - Pertanian, Peternakan & Perkebunan', category: 'Sains & Teknologi' },
  { code: '640', mainClass: '600', label: '640 - Tata Boga, Kuliner & Keterampilan Rumah Tangga', category: 'Pengembangan Diri' },
  { code: '650', mainClass: '600', label: '650 - Manajemen Perusahaan, Akuntansi & Pemasaran', category: 'Pengembangan Diri' },

  // --- 700 KESENIAN, OLAHRAGA & REKREASI ---
  { code: '700', mainClass: '700', label: '700 - Kesenian & Kebudayaan Umum', category: 'Umum' },
  { code: '740', mainClass: '700', label: '740 - Seni Rupa, Desain, Gambar & Kaligrafi', category: 'Umum' },
  { code: '780', mainClass: '700', label: '780 - Seni Musik & Musikologi', category: 'Umum' },
  { code: '796', mainClass: '700', label: '796 - Olahraga, Penjasorkes & Permainan', category: 'Umum' },

  // --- 800 SASTRA, NOVEL & FIKSI ---
  { code: '800', mainClass: '800', label: '800 - Sastra Umum', category: 'Novel / Fiksi' },
  { code: '808', mainClass: '808', label: '808 - Panduan Menulis, Retorika & Antologi', category: 'Novel / Fiksi' },
  { code: '813', mainClass: '800', label: '813 - Novel / Fiksi Indonesia & Dunia', category: 'Novel / Fiksi' },
  { code: '899.221', mainClass: '800', label: '899.221 - Sastra Indonesia (Puisi, Pantun, Cerpen)', category: 'Novel / Fiksi' },

  // --- 900 SEJARAH, GEOGRAFI & BIOGRAFI ---
  { code: '900', mainClass: '900', label: '900 - Sejarah & Geografi Umum', category: 'Sejarah / Sastra' },
  { code: '910', mainClass: '900', label: '910 - Geografi, Peta & Penjelajahan Dunia', category: 'Sejarah / Sastra' },
  { code: '920', mainClass: '900', label: '920 - Biografi Tokoh, Sahabat & Pahlawan', category: 'Sejarah / Sastra' },
  { code: '959', mainClass: '900', label: '959 - Sejarah Indonesia & Asia Tenggara', category: 'Sejarah / Sastra' }
];

/**
 * Intelligent Auto-DDC Classification Engine based on Book Title & Keywords
 */
export function recommendDdcFromTitle(title = '', currentCategory = '') {
  if (!title) return { code: '800', category: currentCategory || 'Novel / Fiksi' };
  const t = title.toLowerCase().trim();

  // Islamic DDC Subdivisions (297.1 - 297.9)
  if (t.includes('quran') || t.includes('qur\'an') || t.includes('tafsir') || t.includes('tajwid') || t.includes('juz')) {
    return { code: '297.1', category: 'Agama & Keimanan' };
  }
  if (t.includes('aqidah') || t.includes('akidah') || t.includes('tauhid') || t.includes('iman') || t.includes('malaikat') || t.includes('kiamat')) {
    return { code: '297.2', category: 'Agama & Keimanan' };
  }
  if (t.includes('fiqih') || t.includes('fikih') || t.includes('shalat') || t.includes('salat') || t.includes('zakat') || t.includes('puasa') || t.includes('haji') || t.includes('wudhu') || t.includes('syariah')) {
    return { code: '297.3', category: 'Agama & Keimanan' };
  }
  if (t.includes('akhlak') || t.includes('adab') || t.includes('tasawuf') || t.includes('dzikir') || t.includes('zikir') || t.includes('doa')) {
    return { code: '297.4', category: 'Agama & Keimanan' };
  }
  if (t.includes('muamalat') || t.includes('ekonomi islam') || t.includes('bank syariah') || t.includes('risiba')) {
    return { code: '297.5', category: 'Agama & Keimanan' };
  }
  if (t.includes('sejarah islam') || t.includes('tarikh') || t.includes('peradaban islam')) {
    return { code: '297.6', category: 'Agama & Keimanan' };
  }
  if (t.includes('hadits') || t.includes('hadis') || t.includes('bukhari') || t.includes('muslim') || t.includes('arbain')) {
    return { code: '297.7', category: 'Agama & Keimanan' };
  }
  if (t.includes('sahabat') || t.includes('kisah nabi') || t.includes('rasul') || t.includes('muhammad') || t.includes('khulafaur') || t.includes('abu bakar') || t.includes('umar') || t.includes('utsman') || t.includes('ali')) {
    return { code: '297.9', category: 'Agama & Keimanan' };
  }

  // Computer & Programming (005, 006)
  if (t.includes('pemrograman') || t.includes('coding') || t.includes('react') || t.includes('javascript') || t.includes('python') || t.includes('html') || t.includes('web') || t.includes('php') || t.includes('java') || t.includes('c++')) {
    return { code: '005', category: 'Komputer & IT' };
  }
  if (t.includes('kecerdasan buatan') || t.includes('ai') || t.includes('multimedia') || t.includes('grafis') || t.includes('photoshop')) {
    return { code: '006', category: 'Komputer & IT' };
  }

  // Mathematics & Science (510, 520, 530, 540, 570)
  if (t.includes('matematika') || t.includes('aljabar') || t.includes('geometri') || t.includes('kalkulus') || t.includes('hitung')) {
    return { code: '510', category: 'Sains & Teknologi' };
  }
  if (t.includes('astronomi') || t.includes('tata surya') || t.includes('planet') || t.includes('bintang') || t.includes('antariksa')) {
    return { code: '520', category: 'Sains & Teknologi' };
  }
  if (t.includes('fisika') || t.includes('relativitas') || t.includes('energi') || t.includes('gerak')) {
    return { code: '530', category: 'Sains & Teknologi' };
  }
  if (t.includes('kimia') || t.includes('molekul') || t.includes('unsur') || t.includes('reaksi')) {
    return { code: '540', category: 'Sains & Teknologi' };
  }
  if (t.includes('biologi') || t.includes('sel') || t.includes('genetik') || t.includes('ekosistem')) {
    return { code: '570', category: 'Sains & Teknologi' };
  }

  // Languages (420, 492.7, 499.221)
  if (t.includes('bahasa arab') || t.includes('nahwu') || t.includes('shorof') || t.includes('kosa kata arab')) {
    return { code: '492.7', category: 'Agama & Keimanan' };
  }
  if (t.includes('bahasa inggris') || t.includes('english') || t.includes('grammar') || t.includes('vocabulary')) {
    return { code: '420', category: 'Umum' };
  }
  if (t.includes('bahasa indonesia') || t.includes('eyd') || t.includes('ejaan')) {
    return { code: '499.221', category: 'Umum' };
  }

  // History & Biography (920, 959)
  if (t.includes('biografi') || t.includes('kisah hidup') || t.includes('pahlawan') || t.includes('soekarno') || t.includes('habibie')) {
    return { code: '920', category: 'Sejarah / Sastra' };
  }
  if (t.includes('sejarah') || t.includes('kemerdekaan') || t.includes('perang') || t.includes('indonesia')) {
    return { code: '959', category: 'Sejarah / Sastra' };
  }

  // Self Development (158)
  if (t.includes('psikologi') || t.includes('motivasi') || t.includes('sukses') || t.includes('pengembangan diri') || t.includes('kebiasaan') || t.includes('habit')) {
    return { code: '158', category: 'Pengembangan Diri' };
  }

  // Default Novels / Fiction (813)
  if (t.includes('novel') || t.includes('cerita') || t.includes('fiksi') || t.includes('dongeng') || t.includes('komik')) {
    return { code: '813', category: 'Novel / Fiksi' };
  }

  return { code: '800', category: currentCategory || 'Novel / Fiksi' };
}
