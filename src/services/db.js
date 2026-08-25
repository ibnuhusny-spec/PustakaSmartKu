import {
  DEFAULT_SETTINGS,
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_ATTENDANCE
} from './initialData';

const KEYS = {
  SETTINGS: 'pustakasmart_settings',
  BOOKS: 'pustakasmart_books',
  MEMBERS: 'pustakasmart_members',
  TRANSACTIONS: 'pustakasmart_transactions',
  ATTENDANCE: 'pustakasmart_attendance',
  QUIZZES: 'pustakasmart_quizzes'
};

const DEFAULT_QUIZZES = [
  {
    id: 'Q-101',
    question: 'Siapakah pengarang novel monumental "Bumi Manusia" yang menjadi karya sastra sejarah Indonesia?',
    options: ['Andrea Hirata', 'Pramoedya Ananta Toer', 'Tere Liye', 'Habiburrahman El Shirazy'],
    correctIdx: 1,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-102',
    question: 'Apa nama novel karya Andrea Hirata yang menceritakan perjuangan 10 murid di Belitung?',
    options: ['Laskar Pelangi', 'Perahu Kertas', 'Ronggeng Dukuh Paruk', 'Negeri 5 Menara'],
    correctIdx: 0,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-103',
    question: 'Berapa jumlah planet dalam tata surya kita setelah Pluto diklasifikasikan sebagai planet kerdil?',
    options: ['7 Planet', '8 Planet', '9 Planet', '10 Planet'],
    correctIdx: 1,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-104',
    question: 'Siapakah pahlawan nasional Indonesia yang dikenal sebagai Bapak Pendidikan Nasional?',
    options: ['Ki Hajar Dewantara', 'IR. Soekarno', 'B.J. Habibie', 'Jenderal Soedirman'],
    correctIdx: 0,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-105',
    question: 'Komputer pertama kali memproses data dalam bentuk bilangan biner. Sistem biner terdiri dari angka...',
    options: ['1 dan 2', '0 dan 1', '1 dan 10', '0 dan 9'],
    correctIdx: 1,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-106',
    question: 'Siapakah penulis sastra klasik Indonesia karya "Tenggelamnya Kapal Van der Wijck"?',
    options: ['Prof. Dr. HAMKA', 'Sutan Takdir Alisjahbana', 'Chairil Anwar', 'Marah Roesli'],
    correctIdx: 0,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-107',
    question: 'Proses fotosintesis pada tumbuhan hijau menghasilkan oksigen dan senyawa gula berupa...',
    options: ['Protein', 'Glukosa', 'Karbohidrat Kompleks', 'Lemak'],
    correctIdx: 1,
    rewardPoints: 15,
    penaltyPoints: 20
  },
  {
    id: 'Q-108',
    question: 'Siapakah ilmuwan fisika penemu teori relativitas khusus dan umum?',
    options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Galileo Galilei'],
    correctIdx: 1,
    rewardPoints: 15,
    penaltyPoints: 20
  }
];

// Initialize DB
export const initDB = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(KEYS.BOOKS)) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MEMBERS)) {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.QUIZZES)) {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
  }
};

// --- SETTINGS ---
export const getSettings = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || DEFAULT_SETTINGS;
};

export const saveSettings = (newSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(newSettings));
  return newSettings;
};

// --- QUIZZES ---
export const getQuizzes = () => {
  initDB();
  const stored = JSON.parse(localStorage.getItem(KEYS.QUIZZES));
  return (stored && stored.length > 0) ? stored : DEFAULT_QUIZZES;
};

export const saveQuiz = (quizData) => {
  const quizzes = getQuizzes();
  const existingIdx = quizzes.findIndex(q => q.id === quizData.id);
  
  if (existingIdx >= 0) {
    quizzes[existingIdx] = { ...quizzes[existingIdx], ...quizData };
  } else {
    const newQuiz = {
      ...quizData,
      id: quizData.id || `Q-${Date.now().toString().slice(-4)}`,
      rewardPoints: Number(quizData.rewardPoints) || 15,
      penaltyPoints: Number(quizData.penaltyPoints) || 20,
    };
    quizzes.unshift(newQuiz);
  }
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
  return quizzes;
};

export const deleteQuiz = (quizId) => {
  const quizzes = getQuizzes().filter(q => q.id !== quizId);
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
  return quizzes;
};

// --- BOOKS ---
export const getBooks = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.BOOKS)) || [];
};

export const saveBook = (bookData) => {
  const books = getBooks();
  const existingIdx = books.findIndex(b => b.id === bookData.id);
  const totalStock = Math.max(0, Number(bookData.stock) || 1);

  if (existingIdx >= 0) {
    const oldBook = books[existingIdx];
    const currentlyLoaned = oldBook.stock - oldBook.available;
    const newAvailable = Math.max(0, totalStock - currentlyLoaned);

    books[existingIdx] = { 
      ...oldBook, 
      ...bookData,
      stock: totalStock,
      available: newAvailable,
      ddc: bookData.ddc || '800'
    };
  } else {
    const newBook = {
      ...bookData,
      id: bookData.id || `B-${Date.now().toString().slice(-4)}`,
      stock: totalStock,
      available: totalStock,
      ddc: bookData.ddc || '800',
      coverUrl: bookData.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    };
    books.unshift(newBook);
  }
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  return books;
};

export const deleteBook = (bookId) => {
  const books = getBooks().filter(b => b.id !== bookId);
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  return books;
};

export const clearSampleBooks = () => {
  localStorage.setItem(KEYS.BOOKS, JSON.stringify([]));
};

export const importBooksCSV = (csvContent) => {
  try {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) throw new Error('File CSV kosong.');

    const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const titleIdx = headers.findIndex(h => h.includes('judul') || h.includes('title'));
    const authorIdx = headers.findIndex(h => h.includes('penulis') || h.includes('pengarang') || h.includes('author'));
    const categoryIdx = headers.findIndex(h => h.includes('kategori') || h.includes('category'));
    const ddcIdx = headers.findIndex(h => h.includes('ddc') || h.includes('klasifikasi') || h.includes('klas'));
    const isbnIdx = headers.findIndex(h => h.includes('isbn') || h.includes('barcode'));
    const shelfIdx = headers.findIndex(h => h.includes('rak') || h.includes('shelf') || h.includes('lokasi'));
    const stockIdx = headers.findIndex(h => h.includes('stok') || h.includes('stock') || h.includes('jumlah'));

    if (titleIdx === -1 || authorIdx === -1) {
      throw new Error('Header CSV minimal harus memiliki kolom "Judul" dan "Penulis".');
    }

    const currentBooks = getBooks();
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;]/).map(c => c.trim().replace(/['"]/g, ''));
      if (!cols[titleIdx] || !cols[authorIdx]) continue;

      const title = cols[titleIdx];
      const author = cols[authorIdx];
      const category = categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx] : 'Umum';
      const ddc = ddcIdx !== -1 && cols[ddcIdx] ? cols[ddcIdx] : '800';
      const isbn = isbnIdx !== -1 && cols[isbnIdx] ? cols[isbnIdx] : `978-602-${Math.floor(100+Math.random()*900)}-${i}`;
      const shelf = shelfIdx !== -1 && cols[shelfIdx] ? cols[shelfIdx] : 'Rak A1';
      const stock = stockIdx !== -1 && !isNaN(cols[stockIdx]) ? Number(cols[stockIdx]) : 3;

      const bookObj = {
        id: `B-${Date.now().toString().slice(-4)}-${i}`,
        title,
        author,
        publisher: 'Penerbit Sekolah',
        year: 2024,
        category,
        ddc,
        isbn,
        shelf,
        stock: stock,
        available: stock,
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        description: 'Buku literasi inventaris sekolah.',
        ebookContent: 'Pratinjau konten digital buku...'
      };

      currentBooks.unshift(bookObj);
      importedCount++;
    }

    localStorage.setItem(KEYS.BOOKS, JSON.stringify(currentBooks));
    return importedCount;
  } catch (err) {
    throw new Error(`Gagal Impor Buku CSV: ${err.message}`);
  }
};

// --- MEMBERS ---
export const getMembers = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.MEMBERS)) || [];
};

export const getMemberByRfid = (rfidUid) => {
  if (!rfidUid) return null;
  const members = getMembers();
  const cleanUid = String(rfidUid).trim().toUpperCase();
  return members.find(m => m.rfidUid && String(m.rfidUid).trim().toUpperCase() === cleanUid) || null;
};

export const saveMember = (memberData) => {
  const members = getMembers();
  const cleanUid = String(memberData.rfidUid).trim().toUpperCase();
  const existingIdx = members.findIndex(m => m.id === memberData.id || (m.rfidUid && String(m.rfidUid).trim().toUpperCase() === cleanUid));
  
  if (existingIdx >= 0) {
    members[existingIdx] = { 
      ...members[existingIdx], 
      ...memberData,
      rfidUid: cleanUid
    };
  } else {
    const newMember = {
      ...memberData,
      id: memberData.id || `M-${Date.now().toString().slice(-4)}`,
      rfidUid: cleanUid,
      balance: Number(memberData.balance) || 10000,
      points: Number(memberData.points) || 10,
      badge: memberData.badge || 'Pembaca Baru 🌱',
      avatar: memberData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(memberData.name)}`,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    members.unshift(newMember);
  }
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  return members;
};

export const deleteMember = (memberId) => {
  const members = getMembers().filter(m => m.id !== memberId);
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  return members;
};

export const updateMemberBalance = (memberId, amountChange) => {
  const members = getMembers();
  const idx = members.findIndex(m => m.id === memberId);
  if (idx >= 0) {
    members[idx].balance = Math.max(0, (members[idx].balance || 0) + amountChange);
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  }
  return members;
};

export const importMembersCSV = (csvContent) => {
  try {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) throw new Error('File CSV kosong.');

    const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'));
    const rfidIdx = headers.findIndex(h => h.includes('rfid') || h.includes('uid') || h.includes('card') || h.includes('kartu'));
    const classIdx = headers.findIndex(h => h.includes('kelas') || h.includes('class') || h.includes('grade'));
    const nisnIdx = headers.findIndex(h => h.includes('nisn') || h.includes('nip') || h.includes('id'));
    const roleIdx = headers.findIndex(h => h.includes('peran') || h.includes('role') || h.includes('jabatan'));
    const balanceIdx = headers.findIndex(h => h.includes('saldo') || h.includes('balance') || h.includes('wallet'));

    if (nameIdx === -1 || rfidIdx === -1) {
      throw new Error('Header CSV minimal harus memiliki kolom "Nama" dan "RFID" (atau UID).');
    }

    const currentMembers = getMembers();
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;]/).map(c => c.trim().replace(/['"]/g, ''));
      if (!cols[nameIdx] || !cols[rfidIdx]) continue;

      const name = cols[nameIdx];
      const rfidUid = String(cols[rfidIdx]).trim().toUpperCase();
      const classGrade = classIdx !== -1 && cols[classIdx] ? cols[classIdx] : 'Siswa';
      const nisn = nisnIdx !== -1 && cols[nisnIdx] ? cols[nisnIdx] : Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const role = roleIdx !== -1 && cols[roleIdx] ? cols[roleIdx] : 'Siswa';
      const balance = balanceIdx !== -1 && !isNaN(cols[balanceIdx]) ? Number(cols[balanceIdx]) : 10000;

      const existingIdx = currentMembers.findIndex(m => m.rfidUid === rfidUid);
      const memberObj = {
        id: existingIdx >= 0 ? currentMembers[existingIdx].id : `M-${Date.now().toString().slice(-4)}-${i}`,
        rfidUid,
        name,
        classGrade,
        nisn,
        role,
        balance,
        points: 10,
        badge: 'Pembaca Aktif ⭐',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        registeredAt: new Date().toISOString().split('T')[0]
      };

      if (existingIdx >= 0) {
        currentMembers[existingIdx] = { ...currentMembers[existingIdx], ...memberObj };
      } else {
        currentMembers.unshift(memberObj);
      }
      importedCount++;
    }

    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(currentMembers));
    return importedCount;
  } catch (err) {
    throw new Error(`Gagal Impor CSV: ${err.message}`);
  }
};

// --- TRANSACTIONS & LOANS ---
export const getTransactions = () => {
  initDB();
  const txs = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS)) || [];
  const settings = getSettings();
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  return txs.map(tx => {
    if (tx.status === 'Dipinjam' && tx.dueDate) {
      const due = new Date(tx.dueDate);
      if (today > due) {
        const diffTime = Math.abs(today - due);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fine = diffDays * (settings.finePerDay || 1000);
        return { ...tx, status: 'Terlambat', fineAmount: fine, finePaid: false };
      }
    }
    return tx;
  });
};

export const createLoanTransaction = (member, book) => {
  const settings = getSettings();
  const books = getBooks();
  const txs = getTransactions();
  
  // Check book stock availability
  const bookIdx = books.findIndex(b => b.id === book.id);
  if (bookIdx < 0 || books[bookIdx].available <= 0) {
    throw new Error(`Stok buku "${book.title}" sedang habis / seluruhnya sedang dipinjam.`);
  }

  // Get active loans for this student
  const activeLoans = txs.filter(t => t.memberId === member.id && (t.status === 'Dipinjam' || t.status === 'Terlambat'));

  // RULE 1: Prevent duplicate loan of the EXACT SAME BOOK if not returned yet!
  const existingBookLoan = activeLoans.find(
    t => t.bookId === book.id || t.bookTitle.toLowerCase() === book.title.toLowerCase()
  );
  if (existingBookLoan) {
    throw new Error(`Anda sedang meminjam buku "${book.title}". Harap kembalikan buku tersebut terlebih dahulu sebelum meminjamnya lagi!`);
  }

  // RULE 2: Enforce max books loan limit per student
  if (activeLoans.length >= (settings.maxBooksPerStudent || 3)) {
    throw new Error(`Siswa telah mencapai batas maksimum peminjaman (${settings.maxBooksPerStudent} buku).`);
  }

  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (settings.maxLoanDays || 7));

  const newTx = {
    id: `TRX-${Date.now().toString().slice(-6)}`,
    rfidUid: member.rfidUid,
    memberId: member.id,
    memberName: member.name,
    bookId: book.id,
    bookTitle: book.title,
    issueDate: issueDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    returnDate: null,
    status: 'Dipinjam',
    fineAmount: 0,
    finePaid: true,
    notes: 'Peminjaman Kios Mandiri RFID'
  };

  // Reduce book available count by 1
  books[bookIdx].available = Math.max(0, books[bookIdx].available - 1);
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));

  // Award reading points to member
  const members = getMembers();
  const mIdx = members.findIndex(m => m.id === member.id);
  if (mIdx >= 0) {
    members[mIdx].points = (members[mIdx].points || 0) + 10;
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  }

  txs.unshift(newTx);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));

  return newTx;
};

export const returnBookTransaction = (txId, payFineWithWallet = false) => {
  const txs = getTransactions();
  const idx = txs.findIndex(t => t.id === txId);
  if (idx < 0) throw new Error('Transaksi peminjaman tidak ditemukan.');

  const tx = txs[idx];
  const members = getMembers();
  const mIdx = members.findIndex(m => m.id === tx.memberId);
  
  if (tx.fineAmount > 0 && !tx.finePaid) {
    if (payFineWithWallet && mIdx >= 0) {
      if (members[mIdx].balance < tx.fineAmount) {
        throw new Error(`Saldo kartu RFID tidak mencukupi (Rp ${members[mIdx].balance.toLocaleString('id-ID')}). Butuh Rp ${tx.fineAmount.toLocaleString('id-ID')}`);
      }
      members[mIdx].balance -= tx.fineAmount;
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
      tx.finePaid = true;
    }
  }

  tx.returnDate = new Date().toISOString().split('T')[0];
  tx.status = 'Dikembalikan';
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));

  // Restore book available count by +1 (capped at total stock)
  const books = getBooks();
  const bIdx = books.findIndex(b => b.id === tx.bookId);
  if (bIdx >= 0) {
    books[bIdx].available = Math.min(books[bIdx].stock, (books[bIdx].available || 0) + 1);
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  }

  return tx;
};

// --- ATTENDANCE ---
export const getAttendance = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.ATTENDANCE)) || [];
};

export const recordAttendance = (member, purpose = 'Membaca & Presensi') => {
  const attendance = getAttendance();
  const settings = getSettings();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // 1. Anti-spam 2-minute cooldown check (prevents rapid double tap)
  const recent = attendance.find(
    a => a.rfidUid === member.rfidUid && a.date === dateStr && (now - new Date(a.timestamp)) < 120000
  );
  if (recent) {
    return recent;
  }

  // 2. Count how many attendance check-ins this student ALREADY DID TODAY
  const todayCheckIns = attendance.filter(a => a.rfidUid === member.rfidUid && a.date === dateStr);

  const newAtt = {
    id: `ATT-${Date.now().toString().slice(-6)}`,
    rfidUid: member.rfidUid,
    memberName: member.name,
    classGrade: member.classGrade || 'Siswa',
    purpose: purpose,
    timestamp: now.toISOString(),
    date: dateStr
  };

  attendance.unshift(newAtt);
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));

  // 3. Award +5 Points ONLY IF student has NOT exceeded the daily attendance point cap!
  const maxDailyPointsAtt = settings.maxDailyAttendancePoints || 1; // Default: Max 1x per day!

  if (todayCheckIns.length < maxDailyPointsAtt) {
    const members = getMembers();
    const mIdx = members.findIndex(m => m.id === member.id);
    if (mIdx >= 0) {
      members[mIdx].points = (members[mIdx].points || 0) + 5;
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    }
  }

  return newAtt;
};

// --- BACKUP, RESTORE & CLEAR ---
export const exportData = () => {
  const data = {
    settings: getSettings(),
    books: getBooks(),
    members: getMembers(),
    transactions: getTransactions(),
    attendance: getAttendance(),
    quizzes: getQuizzes(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.books) localStorage.setItem(KEYS.BOOKS, JSON.stringify(data.books));
    if (data.members) localStorage.setItem(KEYS.MEMBERS, JSON.stringify(data.members));
    if (data.transactions) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.attendance) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    if (data.quizzes) localStorage.setItem(KEYS.QUIZZES, JSON.stringify(data.quizzes));
    return true;
  } catch (err) {
    console.error('Import error:', err);
    return false;
  }
};

export const clearAllData = () => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(KEYS.BOOKS, JSON.stringify([]));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
};

export const resetToDefault = () => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
};
