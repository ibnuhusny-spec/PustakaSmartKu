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
    const localBooksStr = localStorage.getItem(KEYS.BOOKS);
    const localMembersStr = localStorage.getItem(KEYS.MEMBERS);
    const localTxStr = localStorage.getItem(KEYS.TRANSACTIONS);
    const localAttStr = localStorage.getItem(KEYS.ATTENDANCE);
    const localSettingsStr = localStorage.getItem(KEYS.SETTINGS);

    const localBooks = localBooksStr !== null ? JSON.parse(localBooksStr) : INITIAL_BOOKS;
    const localMembers = localMembersStr !== null ? JSON.parse(localMembersStr) : INITIAL_MEMBERS;
    const localTx = localTxStr !== null ? JSON.parse(localTxStr) : INITIAL_TRANSACTIONS;
    const localAtt = localAttStr !== null ? JSON.parse(localAttStr) : INITIAL_ATTENDANCE;
    const localSettings = localSettingsStr !== null ? JSON.parse(localSettingsStr) : DEFAULT_SETTINGS;

    await fetch(`${activeServerUrl}/api/sync-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        books: localBooks,
        members: localMembers,
        transactions: localTx,
        attendance: localAtt,
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
  if (localStorage.getItem(KEYS.SETTINGS) === null) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (localStorage.getItem(KEYS.BOOKS) === null) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  }
  if (localStorage.getItem(KEYS.MEMBERS) === null) {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  }
  if (localStorage.getItem(KEYS.TRANSACTIONS) === null) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (localStorage.getItem(KEYS.ATTENDANCE) === null) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (localStorage.getItem(KEYS.QUIZZES) === null) {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
  }

  syncLocalToSqliteServer();
};

// SETTINGS API - Always enforce default logo if corrupted or empty
export const getSettings = () => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    const parsed = data !== null ? JSON.parse(data) : DEFAULT_SETTINGS;
    const merged = { ...DEFAULT_SETTINGS, ...parsed };
    if (!merged.logoUrl || merged.logoUrl === '' || merged.logoUrl.includes('placeholder')) {
      merged.logoUrl = '/perpustakaansmart.png';
    }
    return merged;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (newSettings) => {
  const merged = { ...getSettings(), ...newSettings };
  if (!merged.logoUrl) {
    merged.logoUrl = '/perpustakaansmart.png';
  }
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    }).catch(err => console.warn('SQLite settings save fail:', err));
  }
  
  return merged;
};

// BOOKS API
export const getBooks = () => {
  try {
    const data = localStorage.getItem(KEYS.BOOKS);
    return data !== null ? JSON.parse(data) : INITIAL_BOOKS;
  } catch (e) {
    return INITIAL_BOOKS;
  }
};

export const saveBooks = (books) => {
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/books/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(books)
    }).catch(err => console.warn('SQLite books save fail:', err));
  }
};

export const addBook = (book) => {
  const books = getBooks();
  const newBook = {
    ...book,
    id: `B-${Date.now().toString().slice(-4)}`,
    available: book.stock
  };
  const updated = [newBook, ...books];
  saveBooks(updated);
  return newBook;
};

export const updateBook = (updatedBook) => {
  const books = getBooks();
  const updated = books.map(b => b.id === updatedBook.id ? updatedBook : b);
  saveBooks(updated);
};

export const deleteBook = (id) => {
  const books = getBooks();
  const updated = books.filter(b => b.id !== id);
  saveBooks(updated);
};

// MEMBERS API
export const getMembers = () => {
  try {
    const data = localStorage.getItem(KEYS.MEMBERS);
    return data !== null ? JSON.parse(data) : INITIAL_MEMBERS;
  } catch (e) {
    return INITIAL_MEMBERS;
  }
};

export const saveMembers = (members) => {
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/members/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(members)
    }).catch(err => console.warn('SQLite members save fail:', err));
  }
};

export const addMember = (member) => {
  const members = getMembers();
  const newMember = {
    ...member,
    id: `M-${Date.now().toString().slice(-4)}`,
    balance: member.balance || 0,
    points: 0,
    badge: "Pembaca Baru 🌱",
    registeredAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newMember, ...members];
  saveMembers(updated);
  return newMember;
};

export const updateMember = (updatedMember) => {
  const members = getMembers();
  const updated = members.map(m => m.id === updatedMember.id ? updatedMember : m);
  saveMembers(updated);
};

export const deleteMember = (id) => {
  const members = getMembers();
  const updated = members.filter(m => m.id !== id);
  saveMembers(updated);
};

export const getMemberByRfid = (rfidUid) => {
  if (!rfidUid) return null;
  const members = getMembers();
  const clean = String(rfidUid).trim().toLowerCase();
  return members.find(m => m && m.rfidUid && String(m.rfidUid).trim().toLowerCase() === clean);
};

// TRANSACTIONS API
export const getTransactions = () => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data !== null ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveTransactions = (txs) => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txs)
    }).catch(err => console.warn('SQLite transactions save fail:', err));
  }
};

export const createLoanTransaction = (memberOrRfid, bookOrId) => {
  // Extract rfidUid whether passed as string or member object
  const rfidUid = (typeof memberOrRfid === 'object' && memberOrRfid !== null) 
    ? (memberOrRfid.rfidUid || memberOrRfid.id) 
    : memberOrRfid;

  // Extract bookId whether passed as string or book object
  const bookId = (typeof bookOrId === 'object' && bookOrId !== null) 
    ? bookOrId.id 
    : bookOrId;

  const member = (typeof memberOrRfid === 'object' && memberOrRfid !== null && memberOrRfid.name)
    ? memberOrRfid
    : getMemberByRfid(rfidUid);

  if (!member) {
    throw new Error('Kartu RFID belum terdaftar di database!');
  }

  const books = getBooks();
  const book = (typeof bookOrId === 'object' && bookOrId !== null && bookOrId.title)
    ? bookOrId
    : books.find(b => b.id === bookId);

  if (!book) {
    throw new Error('Buku tidak ditemukan di katalog!');
  }

  const currentAvailable = book.available !== undefined ? Number(book.available) : (Number(book.stock) || 1);
  if (currentAvailable <= 0) {
    throw new Error(`Stok fisik buku "${book.title}" sedang habis!`);
  }

  const settings = getSettings();
  const txs = getTransactions();
  const activeLoans = txs.filter(t => t.memberId === member.id && t.status !== 'Dikembalikan');

  if (activeLoans.length >= settings.maxBooksPerStudent) {
    throw new Error(`Batas maksimal pinjam (${settings.maxBooksPerStudent} buku) untuk ${member.name} telah tercapai!`);
  }

  const issueDate = new Date().toISOString().split('T')[0];
  const dueDateObj = new Date();
  const loanDays = settings.maxLoanDays || 3;
  dueDateObj.setDate(dueDateObj.getDate() + loanDays);
  const dueDate = dueDateObj.toISOString().split('T')[0];

  const newTx = {
    id: `TRX-${Date.now().toString().slice(-6)}`,
    rfidUid: member.rfidUid || rfidUid,
    memberId: member.id,
    memberName: member.name,
    bookId: book.id,
    bookTitle: book.title,
    issueDate,
    dueDate,
    returnDate: null,
    status: 'Dipinjam',
    fineAmount: 0,
    finePaid: true,
    notes: 'Peminjaman Kios Mandiri'
  };

  book.available = Math.max(0, currentAvailable - 1);
  updateBook(book);

  member.points = (member.points || 0) + 10;
  updateMember(member);

  saveTransactions([newTx, ...txs]);
  return newTx;
};

export const returnBookTransaction = (txId, payFineViaRfid = false) => {
  const txs = getTransactions();
  const tx = txs.find(t => t.id === txId);
  if (!tx || tx.status === 'Dikembalikan') {
    return { success: false, message: 'Transaksi tidak ditemukan atau sudah dikembalikan' };
  }

  const settings = getSettings();
  const today = new Date().toISOString().split('T')[0];
  let fine = 0;

  if (today > tx.dueDate) {
    const due = new Date(tx.dueDate);
    const now = new Date(today);
    const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    fine = Math.max(0, diffDays * settings.finePerDay);
  }

  const member = getMemberByRfid(tx.rfidUid);

  if (fine > 0 && payFineViaRfid && member) {
    if (member.balance < fine) {
      return { success: false, message: `Saldo RFID tidak cukup (Denda: Rp ${fine.toLocaleString()}, Saldo: Rp ${member.balance.toLocaleString()})` };
    }
    member.balance -= fine;
    tx.finePaid = true;
    updateMember(member);
  }

  tx.returnDate = today;
  tx.status = 'Dikembalikan';
  tx.fineAmount = fine;

  const books = getBooks();
  const book = books.find(b => b.id === tx.bookId);
  if (book) {
    book.available += 1;
    updateBook(book);
  }

  saveTransactions(txs);
  return { success: true, transaction: tx, fine, member };
};

export const updateMemberBalance = (rfidUid, amountToAdd) => {
  const member = getMemberByRfid(rfidUid);
  if (!member) return { success: false, message: 'Anggota tidak ditemukan' };

  member.balance = (member.balance || 0) + amountToAdd;
  updateMember(member);
  return { success: true, member };
};

// ATTENDANCE API
export const getAttendance = () => {
  try {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data !== null ? JSON.parse(data) : INITIAL_ATTENDANCE;
  } catch (e) {
    return INITIAL_ATTENDANCE;
  }
};

export const saveAttendance = (records) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  
  if (isSqliteConnected) {
    fetch(`${activeServerUrl}/api/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records)
    }).catch(err => console.warn('SQLite attendance save fail:', err));
  }
};

export const recordAttendance = (rfidUid, purpose = 'Membaca & Meminjam Buku') => {
  const member = getMemberByRfid(rfidUid);
  if (!member) return { success: false, message: 'Kartu RFID belum terdaftar' };

  const records = getAttendance();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const newRecord = {
    id: `ATT-${Date.now().toString().slice(-6)}`,
    rfidUid,
    memberName: member.name,
    classGrade: member.classGrade,
    purpose,
    timestamp: now.toISOString(),
    date: todayStr
  };

  const settings = getSettings();
  const maxPointsPerDay = settings.maxDailyAttendancePoints !== undefined ? settings.maxDailyAttendancePoints : 1;
  const todayAttendanceCount = records.filter(r => r.rfidUid === rfidUid && r.date === todayStr).length;

  if (todayAttendanceCount < maxPointsPerDay) {
    member.points = (member.points || 0) + 5;
    if (member.points >= 300) member.badge = "Pembina Literasi 🌟";
    else if (member.points >= 150) member.badge = "Penjelajah Sastra 🚀";
    else if (member.points >= 50) member.badge = "Kutu Buku 📚";
    updateMember(member);
  }

  saveAttendance([newRecord, ...records]);
  return { success: true, attendance: newRecord, member };
};

// QUIZ API
export const getQuizzes = () => {
  try {
    const data = localStorage.getItem(KEYS.QUIZZES);
    return data !== null ? JSON.parse(data) : DEFAULT_QUIZZES;
  } catch (e) {
    return DEFAULT_QUIZZES;
  }
};

export const saveQuiz = (quiz) => {
  const quizzes = getQuizzes();
  const updated = [quiz, ...quizzes];
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(updated));
};

export const deleteQuiz = (id) => {
  const quizzes = getQuizzes();
  const updated = quizzes.filter(q => q.id !== id);
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(updated));
};

// BACKUP & RESTORE
export const exportData = () => {
  return JSON.stringify({
    settings: getSettings(),
    books: getBooks(),
    members: getMembers(),
    transactions: getTransactions(),
    attendance: getAttendance(),
    quizzes: getQuizzes(),
    exportedAt: new Date().toISOString()
  }, null, 2);
};

export const importData = (jsonStr) => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.settings) saveSettings(parsed.settings);
    if (parsed.books) saveBooks(parsed.books);
    if (parsed.members) saveMembers(parsed.members);
    if (parsed.transactions) saveTransactions(parsed.transactions);
    if (parsed.attendance) saveAttendance(parsed.attendance);
    if (parsed.quizzes) localStorage.setItem(KEYS.QUIZZES, JSON.stringify(parsed.quizzes));
    return true;
  } catch (e) {
    console.error('Import Error:', e);
    return false;
  }
};

export const resetToDefault = () => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
};

// HELPER EXPORTS FOR VIEWS
export const getLocalDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const deleteAttendanceRecord = (id) => {
  const records = getAttendance();
  const updated = records.filter(r => r.id !== id);
  saveAttendance(updated);
};

export const clearAllAttendanceLogs = () => {
  saveAttendance([]);
};

export const saveMember = (member) => {
  const members = getMembers();
  const exists = members.some(m => m.id === member.id);
  if (exists) {
    updateMember(member);
  } else {
    const newMember = {
      ...member,
      id: member.id || `M-${Date.now().toString().slice(-4)}`,
      balance: member.balance || 0,
      points: member.points || 0,
      badge: member.badge || "Pembaca Baru 🌱",
      registeredAt: member.registeredAt || new Date().toISOString().split('T')[0]
    };
    const updated = [newMember, ...members];
    saveMembers(updated);
  }
};

export const resetAllMemberPoints = () => {
  const members = getMembers();
  const updated = members.map(m => ({ ...m, points: 0, badge: 'Pembaca Baru 🌱' }));
  saveMembers(updated);
};

export const deleteTransaction = (id) => {
  const txs = getTransactions();
  const updated = txs.filter(t => t.id !== id);
  saveTransactions(updated);
};

export const clearSampleTransactions = () => {
  saveTransactions([]);
};

export const clearAllMembers = () => {
  saveMembers([]);
};

export const saveBook = (book) => {
  const books = getBooks();
  const exists = books.some(b => b.id === book.id);
  if (exists) {
    updateBook(book);
  } else {
    const newBook = {
      ...book,
      id: book.id || `B-${Date.now().toString().slice(-4)}`,
      available: book.available !== undefined ? book.available : book.stock
    };
    const updated = [newBook, ...books];
    saveBooks(updated);
  }
};

export const clearSampleBooks = () => {
  saveBooks([]);
};

export const importBooksCSV = (booksList) => {
  const current = getBooks();
  const updated = [...booksList, ...current];
  saveBooks(updated);
};

export const clearSampleMembers = () => {
  saveMembers([]);
};

export const importMembersCSV = (membersList) => {
  const current = getMembers();
  const updated = [...membersList, ...current];
  saveMembers(updated);
};


