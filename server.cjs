// Express + SQLite Central Server for PustakaSmart RFID Multi-Computer Library System

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static Vite production Web UI assets from 'dist' directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pustakasmart.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening SQLite database:', err.message);
  } else {
    console.log('⚡ SQLite Database connected successfully at:', dbPath);
  }
});

// Helper for Promisified Queries
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

// Fetch Physical Hard Disk Serial Number (HID) via Native Windows CMD / PowerShell
function getHardDiskSerialNumber() {
  try {
    if (process.platform === 'win32') {
      // Method A: Physical Disk Serial Number via WMIC
      const wmicOut = execSync('wmic diskdrive get serialnumber', { encoding: 'utf8', timeout: 1500 });
      const lines = wmicOut.split('\n').map(l => l.trim()).filter(l => l && !l.toLowerCase().includes('serialnumber'));
      if (lines.length > 0 && lines[0] && lines[0].length >= 4) {
        return `HDD-${lines[0].replace(/[^A-Z0-9]/gi, '').toUpperCase()}`;
      }

      // Method B: Drive Volume Serial Number via CMD vol c:
      const volOut = execSync('vol c:', { encoding: 'utf8', timeout: 1500 });
      const match = volOut.match(/([A-Z0-9]{4}-[A-Z0-9]{4})/i);
      if (match) {
        return `VOL-${match[1].replace('-', '').toUpperCase()}`;
      }
    }
  } catch (e) {
    console.warn('Physical HDD Serial Query Fallback:', e.message);
  }

  // Fallback CPU & Machine ID
  const platform = process.platform;
  const cpus = os.cpus();
  const model = cpus.length > 0 ? cpus[0].model : 'CPU';
  const rawFp = `${platform}:${model}:${os.hostname()}`;
  let hash = 0;
  for (let i = 0; i < rawFp.length; i++) {
    hash = ((hash << 5) - hash) + rawFp.charCodeAt(i);
    hash |= 0;
  }
  return `HID-${Math.abs(hash).toString(36).toUpperCase()}`;
}

// Initialize Database Schemas & Default Tables
async function initDatabaseSchemas() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      category TEXT,
      ddc TEXT,
      publisher TEXT,
      year INTEGER,
      shelf TEXT,
      stock INTEGER,
      available INTEGER,
      coverUrl TEXT,
      description TEXT,
      ebookContent TEXT,
      pdfUrl TEXT
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      rfidUid TEXT UNIQUE,
      name TEXT NOT NULL,
      role TEXT,
      classGrade TEXT,
      nisn TEXT,
      email TEXT,
      phone TEXT,
      balance INTEGER,
      points INTEGER,
      badge TEXT,
      avatar TEXT,
      registeredAt TEXT
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      rfidUid TEXT,
      memberId TEXT,
      memberName TEXT,
      bookId TEXT,
      bookTitle TEXT,
      issueDate TEXT,
      dueDate TEXT,
      returnDate TEXT,
      status TEXT,
      fineAmount INTEGER,
      finePaid INTEGER,
      notes TEXT
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      rfidUid TEXT,
      memberName TEXT,
      classGrade TEXT,
      purpose TEXT,
      timestamp TEXT,
      date TEXT
    );
  `);

  console.log('✓ SQLite Database Schemas Verified.');
}

initDatabaseSchemas().catch(console.error);

// Get Server LAN IPv4 Address
function getLocalServerIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

// REST API ENDPOINTS

// 0. Hardware ID API (Physical Hard Disk Serial Number)
app.get('/api/hardware-id', (req, res) => {
  const hddSerial = getHardDiskSerialNumber();
  res.json({
    hardwareId: hddSerial,
    platform: process.platform,
    hostname: os.hostname()
  });
});

// 1. Health & Server Info
app.get('/api/health', (req, res) => {
  const lanIp = getLocalServerIp();
  const hddSerial = getHardDiskSerialNumber();
  res.json({
    status: 'ok',
    mode: 'client-server',
    database: 'SQLite',
    dbPath,
    hardwareId: hddSerial,
    serverIp: lanIp,
    serverUrl: `http://${lanIp}:${PORT}`
  });
});

// 2. Settings APIs
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch (e) {
        settings[r.key] = r.value;
      }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    for (const key in newSettings) {
      const valStr = JSON.stringify(newSettings[key]);
      await dbRun(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, valStr]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Books APIs
app.get('/api/books', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM books ORDER BY title ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const b = req.body;
    await dbRun(`
      INSERT OR REPLACE INTO books (
        id, title, author, isbn, category, ddc, publisher, year, shelf, stock, available, coverUrl, description, ebookContent, pdfUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      b.id, b.title, b.author, b.isbn || '', b.category || 'Novel / Fiksi', b.ddc || '800',
      b.publisher || '', Number(b.year) || 2024, b.shelf || 'Rak A1', Number(b.stock) || 0,
      Number(b.available) || 0, b.coverUrl || '', b.description || '', b.ebookContent || '', b.pdfUrl || ''
    ]);
    res.json({ success: true, book: b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books', async (req, res) => {
  try {
    await dbRun('DELETE FROM books');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Members APIs
app.get('/api/members', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM members ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const m = req.body;
    await dbRun(`
      INSERT OR REPLACE INTO members (
        id, rfidUid, name, role, classGrade, nisn, email, phone, balance, points, badge, avatar, registeredAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      m.id, m.rfidUid, m.name, m.role || 'Siswa', m.classGrade || '', m.nisn || '',
      m.email || '', m.phone || '', Number(m.balance) || 0, Number(m.points) || 0,
      m.badge || 'Pembaca Baru 🌱', m.avatar || '', m.registeredAt || new Date().toISOString().split('T')[0]
    ]);
    res.json({ success: true, member: m });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members', async (req, res) => {
  try {
    await dbRun('DELETE FROM members');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Transactions APIs
app.get('/api/transactions', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM transactions ORDER BY issueDate DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const t = req.body;
    await dbRun(`
      INSERT OR REPLACE INTO transactions (
        id, rfidUid, memberId, memberName, bookId, bookTitle, issueDate, dueDate, returnDate, status, fineAmount, finePaid, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      t.id, t.rfidUid, t.memberId, t.memberName, t.bookId, t.bookTitle,
      t.issueDate, t.dueDate, t.returnDate || null, t.status,
      Number(t.fineAmount) || 0, t.finePaid ? 1 : 0, t.notes || ''
    ]);
    res.json({ success: true, transaction: t });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions', async (req, res) => {
  try {
    await dbRun('DELETE FROM transactions');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Attendance APIs
app.get('/api/attendance', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM attendance ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const a = req.body;
    await dbRun(`
      INSERT OR REPLACE INTO attendance (
        id, rfidUid, memberName, classGrade, purpose, timestamp, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      a.id, a.rfidUid, a.memberName, a.classGrade, a.purpose,
      a.timestamp || new Date().toISOString(), a.date || new Date().toISOString().split('T')[0]
    ]);
    res.json({ success: true, attendance: a });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Bulk Sync / Import Database Endpoint
app.post('/api/sync-bulk', async (req, res) => {
  try {
    const { books, members, transactions, attendance, settings } = req.body;

    if (books && Array.isArray(books)) {
      await dbRun('DELETE FROM books');
      for (const b of books) {
        await dbRun(`
          INSERT OR REPLACE INTO books (
            id, title, author, isbn, category, ddc, publisher, year, shelf, stock, available, coverUrl, description, ebookContent, pdfUrl
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          b.id, b.title, b.author, b.isbn || '', b.category || 'Novel / Fiksi', b.ddc || '800',
          b.publisher || '', Number(b.year) || 2024, b.shelf || 'Rak A1', Number(b.stock) || 0,
          Number(b.available) || 0, b.coverUrl || '', b.description || '', b.ebookContent || '', b.pdfUrl || ''
        ]);
      }
    }

    if (members && Array.isArray(members)) {
      await dbRun('DELETE FROM members');
      for (const m of members) {
        await dbRun(`
          INSERT OR REPLACE INTO members (
            id, rfidUid, name, role, classGrade, nisn, email, phone, balance, points, badge, avatar, registeredAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          m.id, m.rfidUid, m.name, m.role || 'Siswa', m.classGrade || '', m.nisn || '',
          m.email || '', m.phone || '', Number(m.balance) || 0, Number(m.points) || 0,
          m.badge || 'Pembaca Baru 🌱', m.avatar || '', m.registeredAt || new Date().toISOString().split('T')[0]
        ]);
      }
    }

    if (transactions && Array.isArray(transactions)) {
      await dbRun('DELETE FROM transactions');
      for (const t of transactions) {
        await dbRun(`
          INSERT OR REPLACE INTO transactions (
            id, rfidUid, memberId, memberName, bookId, bookTitle, issueDate, dueDate, returnDate, status, fineAmount, finePaid, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          t.id, t.rfidUid, t.memberId, t.memberName, t.bookId, t.bookTitle,
          t.issueDate, t.dueDate, t.returnDate || null, t.status,
          Number(t.fineAmount) || 0, t.finePaid ? 1 : 0, t.notes || ''
        ]);
      }
    }

    if (attendance && Array.isArray(attendance)) {
      await dbRun('DELETE FROM attendance');
      for (const a of attendance) {
        await dbRun(`
          INSERT OR REPLACE INTO attendance (
            id, rfidUid, memberName, classGrade, purpose, timestamp, date
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          a.id, a.rfidUid, a.memberName, a.classGrade, a.purpose,
          a.timestamp || new Date().toISOString(), a.date || new Date().toISOString().split('T')[0]
        ]);
      }
    }

    if (settings) {
      for (const key in settings) {
        const valStr = JSON.stringify(settings[key]);
        await dbRun(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, valStr]);
      }
    }

    res.json({ success: true, message: 'Bulk database sync completed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve SPA index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('🚀 PustakaSmart RFID Backend Active.');
  }
});

// Start Express Server (Listen on all network interfaces '0.0.0.0' for LAN HP & Client devices)
const server = app.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLocalServerIp();
  const hddSerial = getHardDiskSerialNumber();
  console.log(`===================================================`);
  console.log(`🚀 PustakaSmart RFID Client-Server SQLite Backend`);
  console.log(`🔑 Hardware ID (HDD Serial) : ${hddSerial}`);
  console.log(`📍 Local Server URL         : http://localhost:${PORT}`);
  console.log(`🌐 LAN Network URL          : http://${lanIp}:${PORT}`);
  console.log(`💾 SQLite File Path         : ${dbPath}`);
  console.log(`===================================================`);
});

module.exports = { app, server, getLocalServerIp, getHardDiskSerialNumber };
