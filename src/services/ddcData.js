// Master Data Klasifikasi DDC (Dewey Decimal Classification) Detail & Spesifik Perpustakaan Sekolah/Umum

export const DDC_MAIN_CLASSES = [
  { code: '000', name: '000 - Karya Umum, Komputer & Informasi', color: '#3b82f6' },
  { code: '100', name: '100 - Filsafat & Psikologi', color: '#8b5cf6' },
  { code: '200', name: '200 - Agama (Termasuk 297 Agama Islam)', color: '#10b981' },
  { code: '300', name: '300 - Ilmu Sosial, PPKn & Kebudayaan', color: '#06b6d4' },
  { code: '400', name: '400 - Bahasa & Linguistik', color: '#f59e0b' },
  { code: '500', name: '500 - Sains Murni, IPA & Matematika', color: '#34d399' },
  { code: '600', name: '600 - Teknologi, Kedokteran & Keterampilan', color: '#ec4899' },
  { code: '700', name: '700 - Kesenian, Olahraga & Rekreasi', color: '#a855f7' },
  { code: '800', name: '800 - Sastra, Novel & Karya Cerita', color: '#f43f5e' },
  { code: '900', name: '900 - Sejarah, Geografi & Biografi Tokoh', color: '#eab308' }
];

export const BOOK_CATEGORIES = [
  "Novel / Fiksi",
  "Agama & Keimanan",
  "Sains & IPA",
  "Matematika",
  "Komputer & IT",
  "Sejarah & Biografi",
  "Sastra & Bahasa",
  "Pengembangan Diri",
  "Pelajaran & Buku Teks",
  "Komik & Ensiklopedia",
  "Umum"
];

export const DDC_DETAILED_DATABASE = [
  // --- 000 KARYA UMUM & KOMPUTER ---
  { code: '000', mainClass: '000', label: '000 - Karya Umum & Komputer (Generalities)', category: 'Komputer & IT' },
  { code: '001', mainClass: '000', label: '001 - Ilmu Pengetahuan Umum & Metodologi', category: 'Komputer & IT' },
  { code: '004', mainClass: '000', label: '004 - Pengolahan Data & Komputer', category: 'Komputer & IT' },
  { code: '005', mainClass: '000', label: '005 - Pemrograman Komputer, Algoritma & Software', category: 'Komputer & IT' },
  { code: '006', mainClass: '000', label: '006 - Kecerdasan Buatan (AI), Multimedia & Grafis', category: 'Komputer & IT' },
  { code: '020', mainClass: '000', label: '020 - Ilmu Perpustakaan & Informasi', category: 'Umum' },
  { code: '030', mainClass: '000', label: '030 - Ensiklopedia Umum & Komik Edukasi', category: 'Komik & Ensiklopedia' },
  { code: '070', mainClass: '000', label: '070 - Media Massa, Jurnalistik & Penerbitan', category: 'Umum' },

  // --- 100 FILSAFAT & PSIKOLOGI ---
  { code: '100', mainClass: '100', label: '100 - Filsafat Umum', category: 'Pengembangan Diri' },
  { code: '150', mainClass: '100', label: '150 - Psikologi Umum & Karakter', category: 'Pengembangan Diri' },
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

  // --- 300 ILMU-ILMU SOSIAL & BUKU PELAJARAN ---
  { code: '300', mainClass: '300', label: '300 - Ilmu-Ilmu Sosial Umum', category: 'Sejarah & Biografi' },
  { code: '320', mainClass: '300', label: '320 - Ilmu Politik, Pemerintahan & PPKn', category: 'Pelajaran & Buku Teks' },
  { code: '330', mainClass: '300', label: '330 - Ilmu Ekonomi, Perbankan & Bisnis', category: 'Pelajaran & Buku Teks' },
  { code: '340', mainClass: '300', label: '340 - Ilmu Hukum & Perundang-undangan', category: 'Sejarah & Biografi' },
  { code: '370', mainClass: '300', label: '370 - Pendidikan, Kurikulum & Buku Teks Sekolah', category: 'Pelajaran & Buku Teks' },
  { code: '390', mainClass: '300', label: '390 - Adat Istiadat, Kebudayaan & Tradisi', category: 'Sejarah & Biografi' },

  // --- 400 BAHASA & LINGUISTIK ---
  { code: '400', mainClass: '400', label: '400 - Bahasa & Linguistik Umum', category: 'Sastra & Bahasa' },
  { code: '420', mainClass: '400', label: '420 - Bahasa Inggris & Grammar', category: 'Sastra & Bahasa' },
  { code: '492.7', mainClass: '400', label: '492.7 - Bahasa Arab & Nahwu Shorof', category: 'Agama & Keimanan' },
  { code: '499.221', mainClass: '400', label: '499.221 - Bahasa Indonesia & EYD', category: 'Sastra & Bahasa' },

  // --- 500 SAINS MURNI, IPA & MATEMATIKA ---
  { code: '500', mainClass: '500', label: '500 - Sains Murni / IPA Umum', category: 'Sains & IPA' },
  { code: '510', mainClass: '500', label: '510 - Matematika, Aljabar & Geometri', category: 'Matematika' },
  { code: '520', mainClass: '500', label: '520 - Astronomi, Tata Surya & Antariksa', category: 'Sains & IPA' },
  { code: '530', mainClass: '500', label: '530 - Fisika & Mekanika', category: 'Sains & IPA' },
  { code: '540', mainClass: '500', label: '540 - Kimia & Reaksi Kimia', category: 'Sains & IPA' },
  { code: '550', mainClass: '500', label: '550 - Geologi, Ilmu Bumi & Cuaca', category: 'Sains & IPA' },
  { code: '570', mainClass: '500', label: '570 - Biologi & Ekosistem Alam', category: 'Sains & IPA' },
  { code: '580', mainClass: '500', label: '580 - Botani / Ilmu Tumbuhan', category: 'Sains & IPA' },
  { code: '590', mainClass: '500', label: '590 - Zoologi / Ilmu Hewan & Satwa', category: 'Sains & IPA' },

  // --- 600 TEKNOLOGI & ILMU TERAPAN ---
  { code: '600', mainClass: '600', label: '600 - Teknologi & Ilmu Terapan Umum', category: 'Sains & IPA' },
  { code: '610', mainClass: '600', label: '610 - Kedokteran, Kesehatan & Gizi', category: 'Sains & IPA' },
  { code: '620', mainClass: '600', label: '620 - Teknik & Rekayasa Mesin', category: 'Sains & IPA' },
  { code: '630', mainClass: '600', label: '630 - Pertanian, Peternakan & Perkebunan', category: 'Sains & IPA' },
  { code: '640', mainClass: '600', label: '640 - Tata Boga, Kuliner & Keterampilan Rumah Tangga', category: 'Pengembangan Diri' },
  { code: '650', mainClass: '600', label: '650 - Manajemen Perusahaan, Akuntansi & Pemasaran', category: 'Pengembangan Diri' },

  // --- 700 KESENIAN, OLAHRAGA & REKREASI ---
  { code: '700', mainClass: '700', label: '700 - Kesenian & Kebudayaan Umum', category: 'Umum' },
  { code: '741.5', mainClass: '700', label: '741.5 - Komik, Manga & Graphic Novel', category: 'Komik & Ensiklopedia' },
  { code: '740', mainClass: '700', label: '740 - Seni Rupa, Desain, Gambar & Kaligrafi', category: 'Umum' },
  { code: '780', mainClass: '700', label: '780 - Seni Musik & Musikologi', category: 'Umum' },
  { code: '796', mainClass: '700', label: '796 - Olahraga, Penjasorkes & Permainan', category: 'Umum' },

  // --- 800 SASTRA, NOVEL & FIKSI ---
  { code: '800', mainClass: '800', label: '800 - Sastra Umum', category: 'Sastra & Bahasa' },
  { code: '808', mainClass: '808', label: '808 - Panduan Menulis, Retorika & Antologi', category: 'Sastra & Bahasa' },
  { code: '813', mainClass: '800', label: '813 - Novel / Fiksi Indonesia & Dunia', category: 'Novel / Fiksi' },
  { code: '899.221', mainClass: '800', label: '899.221 - Sastra Indonesia (Puisi, Pantun, Cerpen)', category: 'Sastra & Bahasa' },

  // --- 900 SEJARAH, GEOGRAFI & BIOGRAFI ---
  { code: '900', mainClass: '900', label: '900 - Sejarah & Geografi Umum', category: 'Sejarah & Biografi' },
  { code: '910', mainClass: '900', label: '910 - Geografi, Peta & Penjelajahan Dunia', category: 'Sejarah & Biografi' },
  { code: '920', mainClass: '900', label: '920 - Biografi Tokoh, Sahabat & Pahlawan', category: 'Sejarah & Biografi' },
  { code: '959', mainClass: '900', label: '959 - Sejarah Indonesia & Asia Tenggara', category: 'Sejarah & Biografi' }
];

/**
 * Intelligent Auto-DDC & Category Classification Engine based on Famous Titles & Keywords
 */
export function recommendDdcFromTitle(title = '', currentCategory = '') {
  if (!title) return { code: '813', category: currentCategory || 'Novel / Fiksi' };
  const t = title.toLowerCase().trim();

  // 1. ISLAMIC RELIGION & KNOWLEDGE (297)
  if (t.includes('quran') || t.includes('qur\'an') || t.includes('tafsir') || t.includes('tajwid') || t.includes('juz')) {
    return { code: '297.1', category: 'Agama & Keimanan' };
  }
  if (t.includes('aqidah') || t.includes('akidah') || t.includes('tauhid') || t.includes('iman') || t.includes('malaikat') || t.includes('kiamat')) {
    return { code: '297.2', category: 'Agama & Keimanan' };
  }
  if (t.includes('fiqih') || t.includes('fikih') || t.includes('shalat') || t.includes('salat') || t.includes('zakat') || t.includes('puasa') || t.includes('haji') || t.includes('wudhu') || t.includes('syariah') || t.includes('bulughul')) {
    return { code: '297.3', category: 'Agama & Keimanan' };
  }
  if (t.includes('akhlak') || t.includes('adab') || t.includes('tasawuf') || t.includes('dzikir') || t.includes('zikir') || t.includes('doa') || t.includes('riyadhus')) {
    return { code: '297.4', category: 'Agama & Keimanan' };
  }
  if (t.includes('muamalat') || t.includes('ekonomi islam') || t.includes('bank syariah') || t.includes('risiba')) {
    return { code: '297.5', category: 'Agama & Keimanan' };
  }
  if (t.includes('sejarah islam') || t.includes('tarikh') || t.includes('peradaban islam') || t.includes('sirah') || t.includes('siroh')) {
    return { code: '297.6', category: 'Agama & Keimanan' };
  }
  if (t.includes('hadits') || t.includes('hadis') || t.includes('bukhari') || t.includes('muslim') || t.includes('arbain')) {
    return { code: '297.7', category: 'Agama & Keimanan' };
  }
  if (t.includes('sahabat') || t.includes('kisah nabi') || t.includes('rasul') || t.includes('muhammad') || t.includes('khulafaur') || t.includes('abu bakar') || t.includes('umar') || t.includes('utsman') || t.includes('ali') || t.includes('ustadz') || t.includes('kyai')) {
    return { code: '297.9', category: 'Agama & Keimanan' };
  }
  if (t.includes('islam') || t.includes('muslim') || t.includes('syariat') || t.includes('ibadah')) {
    return { code: '297', category: 'Agama & Keimanan' };
  }

  // 2. MATHEMATICS (510)
  if (t.includes('matematika') || t.includes('aljabar') || t.includes('geometri') || t.includes('kalkulus') || t.includes('trigonometri') || t.includes('statistika') || t.includes('berhitung') || t.includes('perkalian')) {
    return { code: '510', category: 'Matematika' };
  }

  // 3. NATURAL SCIENCE & IPA (500 - 590)
  if (t.includes('fisika') || t.includes('relativitas') || t.includes('energi') || t.includes('gerak') || t.includes('mekanika') || t.includes('termodinamika')) {
    return { code: '530', category: 'Sains & IPA' };
  }
  if (t.includes('kimia') || t.includes('molekul') || t.includes('unsur') || t.includes('reaksi')) {
    return { code: '540', category: 'Sains & IPA' };
  }
  if (t.includes('biologi') || t.includes('sel') || t.includes('genetik') || t.includes('ekosistem') || t.includes('anatomi') || t.includes('tumbuhan') || t.includes('hewan')) {
    return { code: '570', category: 'Sains & IPA' };
  }
  if (t.includes('astronomi') || t.includes('tata surya') || t.includes('planet') || t.includes('bintang') || t.includes('antariksa') || t.includes('bumi dan antariksa')) {
    return { code: '520', category: 'Sains & IPA' };
  }
  if (t.includes('sains') || t.includes('ipa') || t.includes('ilmu pengetahuan alam') || t.includes('eksperimen')) {
    return { code: '500', category: 'Sains & IPA' };
  }

  // 4. COMPUTERS & IT (004 - 006)
  if (t.includes('pemrograman') || t.includes('coding') || t.includes('react') || t.includes('javascript') || t.includes('python') || t.includes('html') || t.includes('web') || t.includes('php') || t.includes('java') || t.includes('c++') || t.includes('sql') || t.includes('database')) {
    return { code: '005', category: 'Komputer & IT' };
  }
  if (t.includes('kecerdasan buatan') || t.includes('ai') || t.includes('multimedia') || t.includes('grafis') || t.includes('photoshop') || t.includes('desain')) {
    return { code: '006', category: 'Komputer & IT' };
  }
  if (t.includes('komputer') || t.includes('laptop') || t.includes('informatika') || t.includes('tik') || t.includes('internet') || t.includes('software')) {
    return { code: '004', category: 'Komputer & IT' };
  }

  // 5. TEXTBOOKS & SCHOOL CURRICULUM (370)
  if (t.includes('buku siswa') || t.includes('buku guru') || t.includes('kurikulum merdeka') || t.includes('kelas 1') || t.includes('kelas 2') || t.includes('kelas 3') || t.includes('kelas 4') || t.includes('kelas 5') || t.includes('kelas 6') || t.includes('kelas vii') || t.includes('kelas viii') || t.includes('kelas ix') || t.includes('kelas x') || t.includes('kelas xi') || t.includes('kelas xii') || t.includes('lks') || t.includes('tematik') || t.includes('ppkn')) {
    return { code: '370', category: 'Pelajaran & Buku Teks' };
  }

  // 6. COMICS & ENCYCLOPEDIA (030, 741.5)
  if (t.includes('komik') || t.includes('manga') || t.includes('doraemon') || t.includes('naruto') || t.includes('conan') || t.includes('tintin') || t.includes('asterix')) {
    return { code: '741.5', category: 'Komik & Ensiklopedia' };
  }
  if (t.includes('ensiklopedia') || t.includes('encyclopedia') || t.includes('tahukah kamu')) {
    return { code: '030', category: 'Komik & Ensiklopedia' };
  }

  // 7. LANGUAGES (420, 492.7, 499.221)
  if (t.includes('bahasa arab') || t.includes('nahwu') || t.includes('shorof') || t.includes('kosa kata arab')) {
    return { code: '492.7', category: 'Agama & Keimanan' };
  }
  if (t.includes('bahasa inggris') || t.includes('english') || t.includes('grammar') || t.includes('vocabulary') || t.includes('toefl')) {
    return { code: '420', category: 'Sastra & Bahasa' };
  }
  if (t.includes('bahasa indonesia') || t.includes('eyd') || t.includes('puisi') || t.includes('pantun') || t.includes('sastra')) {
    return { code: '499.221', category: 'Sastra & Bahasa' };
  }

  // 8. HISTORY & BIOGRAPHY (920, 959)
  if (t.includes('biografi') || t.includes('kisah hidup') || t.includes('pahlawan') || t.includes('soekarno') || t.includes('habibie') || t.includes('kartini') || t.includes('diponegoro')) {
    return { code: '920', category: 'Sejarah & Biografi' };
  }
  if (t.includes('sejarah') || t.includes('kemerdekaan') || t.includes('perang') || t.includes('majapahit') || t.includes('sriwijaya') || t.includes('nusantara')) {
    return { code: '959', category: 'Sejarah & Biografi' };
  }

  // 9. SELF DEVELOPMENT & PSYCHOLOGY (158)
  if (t.includes('psikologi') || t.includes('motivasi') || t.includes('sukses') || t.includes('pengembangan diri') || t.includes('kebiasaan') || t.includes('habit') || t.includes('atomic') || t.includes('leadership') || t.includes('public speaking')) {
    return { code: '158', category: 'Pengembangan Diri' };
  }

  // 10. FAMOUS NOVELS & FICTION (813)
  if (
    t.includes('laskar pelangi') || t.includes('bumi manusia') || t.includes('ayat-ayat cinta') || 
    t.includes('sang pemimpi') || t.includes('dilan') || t.includes('negeri 5 menara') || 
    t.includes('tere liye') || t.includes('andrea hirata') || t.includes('habiburrahman') || 
    t.includes('pramoedya') || t.includes('perahu kertas') || t.includes('gadis kretek') || 
    t.includes('harry potter') || t.includes('sherlock') || t.includes('novel') || 
    t.includes('cerita') || t.includes('fiksi') || t.includes('dongeng') || t.includes('hujan') || 
    t.includes('bintang') || t.includes('komet') || t.includes('matahari')
  ) {
    return { code: '813', category: 'Novel / Fiksi' };
  }

  return { code: '813', category: currentCategory || 'Novel / Fiksi' };
}
