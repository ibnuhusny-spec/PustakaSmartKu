// Initial Mock Data for PustakaSmart RFID School Library System

export const DEFAULT_SETTINGS = {
  schoolName: "SDIT QURRATU A'YUN AL-ISLAMI",
  schoolEmail: "perpustakaan@sditqurratuayun.sch.id", // Dedicated School Email for License Binding
  libraryName: "MAKTABAH AL-QIRO'AH",
  address: "Jalan Poros Makassar - Maros Km. 26 Maccopa",
  cityAddress: "", // Kosong secara default sampai diisi user di pengaturan
  finePerDay: 1000, // Rp 1.000 / hari
  maxLoanDays: 3,   // 3 Hari Standar Peminjaman
  maxBooksPerStudent: 3,
  maxDailyAttendancePoints: 1, // Max 1x bonus points per day for attendance
  enableVoice: true,
  enableSoundFX: true,
  autoAttendanceOnTap: true,
  enableAdminPin: true, // Toggle PIN Admin: Set to true to strictly enforce PIN requirement!
  schoolLogoUrl: "", // Dedicated School Logo
  logoUrl: "/perpustakaansmart.png", // App Logo
  cardTemplate: "clean_corporate", // Default card template theme: clean_corporate, school_luxury, royal_gold
  idFieldLabel: "NISN / NIP", // Custom ID Label
  classFieldLabel: "Peran / Kelas", // Custom Class/Role Label
  adminPin: "PustakaSmart2026", // Strong Default Secure Admin PIN
  
  // Default Pro Licensing System
  licenseType: "pro",
  trialStartDate: new Date().toISOString().split('T')[0],
  licenseKey: "PUSTAKASMART-PRO-FULL"
};

export const INITIAL_BOOKS = [
  {
    id: "B-101",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    isbn: "978-979-3062-79-2",
    category: "Novel / Fiksi",
    publisher: "Bentang Pustaka",
    year: 2005,
    shelf: "Rak A1 - Novel",
    stock: 5,
    available: 3,
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    description: "Kisah perjuangan 10 anak di Belitung dalam menuntut ilmu di tengah keterbatasan sarana sekolah.",
    ebookContent: "Bab 1: Sepuluh Anggota Baru. Pagi itu, waktu sekolah baru akan dimulai, Belitung masih diselimuti embun dingin..."
  },
  {
    id: "B-102",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    isbn: "978-979-97312-3-5",
    category: "Sejarah / Sastra",
    publisher: "Lentera Dipantara",
    year: 1980,
    shelf: "Rak B2 - Sejarah",
    stock: 4,
    available: 2,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    description: "Novel sejarah berlatar era pergerakan nasional Indonesia di akhir abad 19 yang menceritakan perjalanan Minke.",
    ebookContent: "Panggil aku Minke. Namaku sendiri... sementara tak perlu kusebutkan. Bukan karena gila rahasia..."
  },
  {
    id: "B-103",
    title: "Fisika Modern untuk SMA/MA Class XII",
    author: "Dr. Bambang Ruwanto",
    isbn: "978-602-241-112-9",
    category: "Sains & Teknologi",
    publisher: "Erlangga",
    year: 2021,
    shelf: "Rak C3 - IPA",
    stock: 8,
    available: 7,
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
    description: "Buku panduan pembelajaran Fisika terlengkap mencakup Relativitas, Teori Kuantum, dan Fisika Inti.",
    ebookContent: "Bab 1: Radiasi Benda Hitam dan Teori Kuantum Planck..."
  },
  {
    id: "B-104",
    title: "Pemrograman Web Modern dengan JavaScript & React",
    author: "Rudi Hermawan, M.Kom",
    isbn: "978-623-010-442-1",
    category: "Komputer & IT",
    publisher: "Andi Offset",
    year: 2023,
    shelf: "Rak D1 - Komputer",
    stock: 6,
    available: 4,
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
    description: "Panduan praktis membangun aplikasi web interaktif, SPA, dan PWA modern dari tingkat dasar hingga mahir.",
    ebookContent: "Bab 1: Pengenalan Ekosistem Web Modern & Javascript ES6+..."
  },
  {
    id: "B-105",
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    isbn: "978-602-424-694-5",
    category: "Pengembangan Diri",
    publisher: "Kompas",
    year: 2018,
    shelf: "Rak E2 - Psikologi",
    stock: 7,
    available: 5,
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
    description: "Penerapan filsafat Stoisisme kuno dalam kehidupan sehari-hari untuk menjaga kedamaian mental generasi muda.",
    ebookContent: "Bab 1: Kenapa Kita Mudah Cemas? Memahami Dikotomi Kendali..."
  },
  {
    id: "B-106",
    title: "Matematika Matematikawan Cilik",
    author: "Prof. Suparman",
    isbn: "978-979-012-334-8",
    category: "Sains & Teknologi",
    publisher: "Yudhistira",
    year: 2022,
    shelf: "Rak C1 - Sains",
    stock: 10,
    available: 9,
    coverUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
    description: "Trik berhitung cepat, logika matematika menyenangkan, dan persiapan olimpiade matematika sekolah.",
    ebookContent: "Bab 1: Rahasia Keajaiban Angka Nol dan Deret Fibonacci..."
  }
];

export const INITIAL_MEMBERS = [];

export const INITIAL_TRANSACTIONS = [];

export const INITIAL_ATTENDANCE = [];
