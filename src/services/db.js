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
  QUIZZES: 'pustakasmart_quizzes',
  SERVER_URL: 'pustakasmart_server_url'
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

// Server Connection State
let activeServerUrl = localStorage.getItem(KEYS.SERVER_URL) || 'http://localhost:3001';
let isSqliteConnected = false;
let serverInfo = null;

export const setServerUrl = (url) => {
  activeServerUrl = url;
  localStorage.setItem(KEYS.SERVER_URL, url);
};

export const getServerUrl = () => activeServerUrl;

// Check connection to SQLite Express Server
export const checkServerConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${activeServerUrl}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      isSqliteConnected = true;
      serverInfo = data;
      return { connected: true, info: data };
    }
  } catch (e) {
    isSqliteConnected = false;
    serverInfo = null;
  }
  return { connected: false, info: null };
};

// Sync LocalStorage to SQLite Server on startup
export const syncLocalToSqliteServer = async () => {
  const conn = await checkServerConnection();
  if (!conn.connected) return false;

  try {
    const localBooks = JSON.parse(localStorage.getItem(KEYS.BOOKS) || '[]');
    const localMembers = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const localTx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const localAtt = JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]');
    const localSettings = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');

    await fetch(`${activeServerUrl}/api/sync-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        books: localBooks.length > 0 ? localBooks : INITIAL_BOOKS,
        members: localMembers.length > 0 ? localMembers : INITIAL_MEMBERS,
        transactions: localTx.length > 0 ? localTx : INITIAL_TRANSACTIONS,
        attendance: localAtt.length > 0 ? localAtt : INITIAL_ATTENDANCE,
        settings: localSettings.schoolName ? localSettings : DEFAULT_SETTINGS
      })
    });

    await loadFromSqliteServerToLocalCache();
    return true;
  } catch (e) {
    console.warn('Sync to SQLite failed, using LocalStorage:', e);
    return false;
  }
};

const loadFromSqliteServerToLocalCache = async () => {
  try {
    const [bRes, mRes, tRes, aRes, sRes] = await Promise.all([
      fetch(`${activeServerUrl}/api/books`),
      fetch(`${activeServerUrl}/api/members`),
      fetch(`${activeServerUrl}/api/transactions`),
      fetch(`${activeServerUrl}/api/attendance`),
      fetch(`${activeServerUrl}/api/settings`)
    ]);

    if (bRes.ok) localStorage.setItem(KEYS.BOOKS, JSON.stringify(await bRes.json()));
    if (mRes.ok) localStorage.setItem(KEYS.MEMBERS, JSON.stringify(await mRes.json()));
    if (tRes.ok) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(await tRes.json()));
    if (aRes.ok) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(await aRes.json()));
    if (sRes.ok) {
      const s = await sRes.json();
      if (Object.keys(s).length > 0) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...s }));
      }
    }
  } catch (e) {
    console.warn('Cache sync error:', e);
  }
};

// Initialize DB
export const initDB = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(KEYS.BOOKS)) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  }
  if (!localStorage.getItem(KEYS.MEMBERS)) {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.QUIZZES)) {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
  }

  syncLocalToSqliteServer();
};

// SETTINGS API
export const getSettings = () => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (newSettings) => {
  const merged = { ...getSettings(), ...newSettings };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    }).catch(console.warn);
  }
  return merged;
};

// BOOKS API
export const getBooks = () => {
  try {
    const data = localStorage.getItem(KEYS.BOOKS);
    return data ? JSON.parse(data) : INITIAL_BOOKS;
  } catch (e) {
    return INITIAL_BOOKS;
  }
};

export const saveBook = (bookData) => {
  const books = getBooks();
  const index = books.findIndex(b => b.id === bookData.id);
  let updated;
  if (index >= 0) {
    updated = [...books];
    updated[index] = { ...updated[index], ...bookData };
  } else {
    updated = [bookData, ...books];
  }
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(updated));

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    }).catch(console.warn);
  }

  return updated;
};

export const deleteBook = (bookId) => {
  const books = getBooks().filter(b => b.id !== bookId);
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/books/${bookId}`, { method: 'DELETE' }).catch(console.warn);
  }

  return books;
};

export const clearSampleBooks = () => {
  localStorage.setItem(KEYS.BOOKS, JSON.stringify([]));
  return [];
};

// MEMBERS API
export const getMembers = () => {
  try {
    const data = localStorage.getItem(KEYS.MEMBERS);
    return data ? JSON.parse(data) : INITIAL_MEMBERS;
  } catch (e) {
    return INITIAL_MEMBERS;
  }
};

export const getMemberByRfid = (rfidUid) => {
  const members = getMembers();
  return members.find(m => m.rfidUid === rfidUid);
};

export const saveMember = (memberData) => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === memberData.id);
  let updated;
  if (index >= 0) {
    updated = [...members];
    updated[index] = { ...updated[index], ...memberData };
  } else {
    updated = [memberData, ...members];
  }
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(updated));

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    }).catch(console.warn);
  }

  return updated;
};

export const updateMemberBalance = (memberId, newBalance) => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === memberId);
  if (index >= 0) {
    members[index].balance = Number(newBalance) || 0;
    saveMember(members[index]);
  }
  return members;
};

export const deleteMember = (memberId) => {
  const members = getMembers().filter(m => m.id !== memberId);
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/members/${memberId}`, { method: 'DELETE' }).catch(console.warn);
  }

  return members;
};

export const importMembersCSV = (csvText) => {
  try {
    const lines = csvText.trim().split('\n');
    let imported = 0;

    lines.forEach(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 2 && parts[0] && parts[0].toLowerCase() !== 'nama') {
        const member = {
          id: `M-${Math.floor(1000 + Math.random() * 9000)}`,
          rfidUid: parts[1] || `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
          name: parts[0],
          role: parts[2] || 'Siswa',
          classGrade: parts[3] || 'Kelas 1A',
          nisn: parts[4] || '',
          email: parts[5] || '',
          phone: parts[6] || '',
          balance: Number(parts[7]) || 10000,
          points: 50,
          badge: 'Pembaca Baru 🌱',
          avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
          registeredAt: new Date().toISOString().split('T')[0]
        };
        saveMember(member);
        imported++;
      }
    });

    return imported;
  } catch (e) {
    return 0;
  }
};

// TRANSACTIONS API
export const getTransactions = () => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
};

export const issueBook = (memberRfid, bookId, notes = '') => {
  const member = getMemberByRfid(memberRfid);
  if (!member) return { success: false, message: 'Anggota RFID tidak ditemukan!' };

  const books = getBooks();
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex < 0) return { success: false, message: 'Buku tidak ditemukan!' };

  const book = books[bookIndex];
  const isDigitalOnly = (book.pdfUrl || book.ebookContent) && Number(book.stock) === 0;

  if (!isDigitalOnly && book.available <= 0) {
    return { success: false, message: 'Stok fisik buku habis!' };
  }

  const settings = getSettings();
  const activeTxCount = getTransactions().filter(
    t => t.memberId === member.id && (t.status === 'Dipinjam' || t.status === 'Terlambat')
  ).length;

  if (activeTxCount >= settings.maxBooksPerStudent) {
    return { success: false, message: `Maksimal peminjaman (${settings.maxBooksPerStudent} buku) telah tercapai!` };
  }

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + settings.maxLoanDays);

  const newTx = {
    id: `TRX-${Date.now().toString().slice(-6)}`,
    rfidUid: member.rfidUid,
    memberId: member.id,
    memberName: member.name,
    bookId: book.id,
    bookTitle: book.title,
    issueDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    returnDate: null,
    status: 'Dipinjam',
    fineAmount: 0,
    finePaid: true,
    notes
  };

  if (!isDigitalOnly) {
    books[bookIndex].available -= 1;
    saveBook(books[bookIndex]);
  }

  const txs = getTransactions();
  const updatedTxs = [newTx, ...txs];
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    }).catch(console.warn);
  }

  return { success: true, transaction: newTx, member };
};

export const returnBook = (transactionId) => {
  const txs = getTransactions();
  const txIndex = txs.findIndex(t => t.id === transactionId);
  if (txIndex < 0) return { success: false, message: 'Transaksi tidak ditemukan!' };

  const tx = txs[txIndex];
  const today = new Date().toISOString().split('T')[0];

  const due = new Date(tx.dueDate);
  const now = new Date(today);
  let fineAmount = 0;
  if (now > due) {
    const diffTime = Math.abs(now - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const settings = getSettings();
    fineAmount = diffDays * settings.finePerDay;
  }

  tx.returnDate = today;
  tx.status = 'Dikembalikan';
  tx.fineAmount = fineAmount;
  tx.finePaid = fineAmount === 0;

  txs[txIndex] = tx;
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));

  const books = getBooks();
  const bookIndex = books.findIndex(b => b.id === tx.bookId);
  if (bookIndex >= 0) {
    const book = books[bookIndex];
    if (book.available < book.stock) {
      book.available += 1;
      saveBook(book);
    }
  }

  const member = getMemberByRfid(tx.rfidUid);
  if (member) {
    member.points = (member.points || 0) + (fineAmount === 0 ? 20 : 5);
    saveMember(member);
  }

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    }).catch(console.warn);
  }

  return { success: true, transaction: tx, member };
};

export const createLoanTransaction = (memberRfid, bookId, notes = '') => issueBook(memberRfid, bookId, notes);
export const returnBookTransaction = (transactionId) => returnBook(transactionId);

// ATTENDANCE API
export const getAttendance = () => {
  try {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
  } catch (e) {
    return INITIAL_ATTENDANCE;
  }
};

export const recordAttendance = (rfidUid, purpose = 'Membaca & Meminjam Buku') => {
  const member = getMemberByRfid(rfidUid);
  if (!member) return { success: false, message: 'Kartu RFID belum terdaftar.' };

  const today = new Date().toISOString().split('T')[0];
  const atts = getAttendance();

  const newAtt = {
    id: `ATT-${Date.now().toString().slice(-6)}`,
    rfidUid: member.rfidUid,
    memberName: member.name,
    classGrade: member.classGrade,
    purpose,
    timestamp: new Date().toISOString(),
    date: today
  };

  const updatedAtts = [newAtt, ...atts];
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(updatedAtts));

  const settings = getSettings();
  const todayUserAtts = atts.filter(a => a.rfidUid === rfidUid && a.date === today);
  if (todayUserAtts.length < (settings.maxDailyAttendancePoints || 1)) {
    member.points = (member.points || 0) + 5;
    saveMember(member);
  }

  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAtt)
    }).catch(console.warn);
  }

  return { success: true, attendance: newAtt, member };
};

// QUIZZES API
export const getQuizzes = () => {
  try {
    const data = localStorage.getItem(KEYS.QUIZZES);
    return data ? JSON.parse(data) : DEFAULT_QUIZZES;
  } catch (e) {
    return DEFAULT_QUIZZES;
  }
};

export const saveQuiz = (quizData) => {
  const quizzes = getQuizzes();
  const index = quizzes.findIndex(q => q.id === quizData.id);
  let updated;
  if (index >= 0) {
    updated = [...quizzes];
    updated[index] = { ...updated[index], ...quizData };
  } else {
    updated = [quizData, ...quizzes];
  }
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(updated));
  return updated;
};

export const deleteQuiz = (quizId) => {
  const quizzes = getQuizzes().filter(q => q.id !== quizId);
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
  return quizzes;
};

// IMPORT & EXPORT
export const exportData = () => {
  return JSON.stringify({
    settings: getSettings(),
    books: getBooks(),
    members: getMembers(),
    transactions: getTransactions(),
    attendance: getAttendance()
  }, null, 2);
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) saveSettings(data.settings);
    if (data.books) localStorage.setItem(KEYS.BOOKS, JSON.stringify(data.books));
    if (data.members) localStorage.setItem(KEYS.MEMBERS, JSON.stringify(data.members));
    if (data.transactions) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.attendance) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    
    if (isSqliteConnected) {
      fetch(`${activeServerUrl}/api/sync-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(console.warn);
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const resetToDefault = () => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/sync-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        books: INITIAL_BOOKS,
        members: INITIAL_MEMBERS,
        transactions: INITIAL_TRANSACTIONS,
        attendance: INITIAL_ATTENDANCE,
        settings: DEFAULT_SETTINGS
      })
    }).catch(console.warn);
  }
};

export const importBooksCSV = (csvText) => {
  try {
    const lines = csvText.trim().split('\n');
    let imported = 0;

    lines.forEach(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 2 && parts[0] && parts[0].toLowerCase() !== 'judul') {
        const book = {
          id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
          title: parts[0],
          author: parts[1] || 'Anonim',
          ddc: parts[2] || '800',
          category: parts[3] || 'Novel / Fiksi',
          publisher: parts[4] || 'Penerbit Sekolah',
          year: Number(parts[5]) || 2024,
          shelf: parts[6] || 'Rak A1',
          stock: Number(parts[7]) || 5,
          available: Number(parts[7]) || 5,
          isbn: parts[8] || '',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
          description: 'Imported via CSV Data'
        };
        saveBook(book);
        imported++;
      }
    });

    return imported;
  } catch (e) {
    return 0;
  }
};
