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

export const INITIAL_MEMBERS = [
  {
    id: "M-001",
    rfidUid: "RFID-1001",
    name: "Abu Muhammad Abdillah",
    role: "Siswa",
    classGrade: "Kelas 4A Putra",
    nisn: "00001",
    email: "abu.abdillah@sch.id",
    phone: "081234567890",
    balance: 25000,
    points: 180,
    badge: "Pembaca Baru 🌱",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    registeredAt: "2026-01-10"
  },
  {
    id: "M-002",
    rfidUid: "RFID-1002",
    name: "Siti Rahmawati",
    role: "Siswa",
    classGrade: "XI IPS 2",
    nisn: "0068741235",
    email: "siti.rahma@sch.id",
    phone: "082198765432",
    balance: 15000,
    points: 140,
    badge: "Kutu Buku 📚",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    registeredAt: "2026-01-12"
  },
  {
    id: "M-003",
    rfidUid: "RFID-1003",
    name: "Budi Santoso",
    role: "Siswa",
    classGrade: "X MIPA 3",
    nisn: "0071122334",
    email: "budi.santoso@sch.id",
    phone: "085711223344",
    balance: 5000,
    points: 90,
    badge: "Penjelajah Sastra 🚀",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    registeredAt: "2026-02-01"
  },
  {
    id: "M-004",
    rfidUid: "RFID-1004",
    name: "Dra. Hj. Nurhayati, M.Pd",
    role: "Guru",
    classGrade: "Guru Bahasa Indonesia",
    nisn: "197508122001122001",
    email: "nurhayati@sch.id",
    phone: "081377889900",
    balance: 100000,
    points: 320,
    badge: "Pembina Literasi 🌟",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    registeredAt: "2026-01-01"
  },
  {
    id: "M-005",
    rfidUid: "RFID-1005",
    name: "Dewi Lestari",
    role: "Siswa",
    classGrade: "XI IPA 3",
    nisn: "0064433221",
    email: "dewi.lestari@sch.id",
    phone: "089612344321",
    balance: 0,
    points: 60,
    badge: "Pembaca Aktif ⭐",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    registeredAt: "2026-02-15"
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TRX-20260820-01",
    rfidUid: "RFID-1001",
    memberId: "M-001",
    memberName: "Abu Muhammad Abdillah",
    bookId: "B-101",
    bookTitle: "Laskar Pelangi",
    issueDate: "2026-08-10",
    dueDate: "2026-08-17",
    returnDate: null,
    status: "Terlambat",
    fineAmount: 8000,
    finePaid: false,
    notes: "Melebihi batas pinjam 8 hari"
  },
  {
    id: "TRX-20260822-02",
    rfidUid: "RFID-1002",
    memberId: "M-002",
    memberName: "Siti Rahmawati",
    bookId: "B-104",
    bookTitle: "Pemrograman Web Modern dengan JavaScript & React",
    issueDate: "2026-08-20",
    dueDate: "2026-08-27",
    returnDate: null,
    status: "Dipinjam",
    fineAmount: 0,
    finePaid: true,
    notes: "Peminjaman aktif"
  },
  {
    id: "TRX-20260815-03",
    rfidUid: "RFID-1003",
    memberId: "M-003",
    memberName: "Budi Santoso",
    bookId: "B-102",
    bookTitle: "Bumi Manusia",
    issueDate: "2026-08-01",
    dueDate: "2026-08-08",
    returnDate: "2026-08-08",
    status: "Dikembalikan",
    fineAmount: 0,
    finePaid: true,
    notes: "Dikembalikan tepat waktu"
  }
];

export const INITIAL_ATTENDANCE = [
  {
    id: "ATT-001",
    rfidUid: "RFID-1001",
    memberName: "Abu Muhammad Abdillah",
    classGrade: "Kelas 4A Putra",
    purpose: "Membaca & Meminjam Buku",
    timestamp: "2026-08-25T07:15:00.000Z",
    date: "2026-08-25"
  },
  {
    id: "ATT-002",
    rfidUid: "RFID-1002",
    memberName: "Siti Rahmawati",
    classGrade: "XI IPS 2",
    purpose: "Tugas Kelompok / Literasi",
    timestamp: "2026-08-25T07:30:00.000Z",
    date: "2026-08-25"
  },
  {
    id: "ATT-003",
    rfidUid: "RFID-1004",
    memberName: "Dra. Hj. Nurhayati, M.Pd",
    classGrade: "Guru Bahasa Indonesia",
    purpose: "Pendampingan Siswa",
    timestamp: "2026-08-25T07:45:00.000Z",
    date: "2026-08-25"
  }
];
