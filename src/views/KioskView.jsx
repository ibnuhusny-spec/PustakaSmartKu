import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  UserCheck, 
  BookOpen, 
  RotateCcw, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Search,
  PlusCircle,
  X,
  ShieldCheck,
  Award,
  Calendar
} from 'lucide-react';
import { getMemberByRfid, createLoanTransaction, returnBookTransaction, recordAttendance } from '../services/db';
import { speakText, playSoundEffect } from '../services/audioService';
import confetti from 'canvas-confetti';

export default function KioskView({ 
  members, 
  books, 
  transactions, 
  onRefreshData,
  onOpenReceipt,
  onRegisterUnregisteredCard,
  settings 
}) {
  const [activeStep, setActiveStep] = useState('menu'); // menu, attendance, borrow, return, balance
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  // Listen directly to live RFID scan events (NEVER triggers on tab switch)
  useEffect(() => {
    const handleLiveRfidScan = (e) => {
      const { rfidUid } = e.detail;
      if (!rfidUid) return;

      const member = getMemberByRfid(rfidUid);

      if (!member) {
        playSoundEffect('error');
        setMessage({ 
          type: 'error', 
          text: `Kartu RFID Fisik Terdeteksi (UID: ${rfidUid}), namun belum terdaftar di database perpustakaan!`,
          uid: rfidUid
        });
        return;
      }

      // Member found on live tap!
      setSelectedMember(member);

      // Check active step: DO NOT play "Selamat Datang" voice during Borrow or Return!
      if (activeStep === 'borrow' || activeStep === 'return') {
        playSoundEffect('scan');
        setMessage({ 
          type: 'success', 
          text: `Kartu RFID Terverifikasi: ${member.name} (${member.classGrade}). Saldo RFID: Rp ${member.balance.toLocaleString('id-ID')} | Poin: ${member.points} pts.` 
        });
      } else {
        // Attendance / Presensi Mode: Record Attendance & play Selamat Datang Voice
        playSoundEffect('success');
        recordAttendance(member, 'Presensi Mandiri Kios RFID');
        onRefreshData();
        
        setMessage({ 
          type: 'success', 
          text: `Selamat Datang, ${member.name}! Presensi kehadiran Anda telah dicatat.` 
        });
        speakText(`Selamat datang di perpustakaan, ${member.name}!`, settings.enableVoice);
        
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
        setActiveStep('balance');
      }
    };

    window.addEventListener('rfid-scanned', handleLiveRfidScan);
    return () => window.removeEventListener('rfid-scanned', handleLiveRfidScan);
  }, [settings, onRefreshData, activeStep]);

  const handleBorrow = (book) => {
    if (!selectedMember) {
      setMessage({ type: 'amber', text: 'Silakan Tempelkan Kartu RFID Anda terlebih dahulu!' });
      return;
    }

    try {
      const tx = createLoanTransaction(selectedMember, book);
      onRefreshData();
      playSoundEffect('success');
      confetti({ particleCount: 50, spread: 70 });

      setMessage({ type: 'success', text: `Peminjaman buku "${book.title}" untuk ${selectedMember.name} berhasil!` });
      onOpenReceipt(tx, selectedMember);
      setActiveStep('menu');
    } catch (err) {
      playSoundEffect('error');
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleReturn = (tx, payWithWallet) => {
    try {
      const updatedTx = returnBookTransaction(tx.id, payWithWallet);
      onRefreshData();
      playSoundEffect('success');
      confetti({ particleCount: 60, spread: 80 });

      if (updatedTx.fineAmount > 0) {
        setMessage({ type: 'success', text: `Buku dikembalikan. Denda Rp ${updatedTx.fineAmount.toLocaleString('id-ID')} telah ${payWithWallet ? 'DIBAYAR LUNAS via Saldo RFID' : 'dicatat'}.` });
      } else {
        setMessage({ type: 'success', text: `Pengembalian buku "${tx.bookTitle}" tepat waktu berhasil!` });
      }

      onOpenReceipt(updatedTx, selectedMember);
      setActiveStep('menu');
    } catch (err) {
      playSoundEffect('error');
      setMessage({ type: 'error', text: err.message });
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeLoans = selectedMember 
    ? transactions.filter(t => t.memberId === selectedMember.id && (t.status === 'Dipinjam' || t.status === 'Terlambat'))
    : [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Kiosk Mode Hero Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        padding: '28px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '28px'
      }}>
        <div className="rfid-pulse" style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: '#ffffff',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
        }}>
          <Radio size={36} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
          Mode Kios Mandiri Siswa & RFID Tap
        </h2>
        <p style={{ fontSize: '1rem', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto' }}>
          Tempelkan Kartu RFID Fisik pada alat USB reader untuk presensi & transaksi otomatis.
        </p>

        {/* Selected Active Member Card Banner */}
        {selectedMember && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(59, 130, 246, 0.18)',
            border: '1.5px solid rgba(59, 130, 246, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src={selectedMember.avatar}
                alt={selectedMember.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1e293b', border: '2px solid #60a5fa' }}
              />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedMember.name} <span style={{ fontSize: '0.8rem', background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>{selectedMember.classGrade}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                  NISN/ID: <strong>{selectedMember.nisn || selectedMember.id}</strong> • 
                  Saldo RFID: <strong style={{ color: '#34d399' }}>Rp {selectedMember.balance.toLocaleString('id-ID')}</strong> • 
                  Poin: <strong style={{ color: '#fbbf24' }}>{selectedMember.points} pts</strong> ({selectedMember.badge || 'Pembaca Baru 🌱'})
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMember(null)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Ganti / Reset Kartu
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Alert Message */}
      {message && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: message.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : (message.type === 'amber' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
          border: `1px solid ${message.type === 'error' ? 'rgba(244, 63, 94, 0.4)' : (message.type === 'amber' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)')}`,
          color: message.type === 'error' ? '#fb7185' : (message.type === 'amber' ? '#fbbf24' : '#34d399')
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', fontWeight: 600, flex: 1 }}>
            {message.type === 'error' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
            <div>
              <span>{message.text}</span>
              {message.uid && (
                <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.9 }}>
                  Nomor Chip RFID Kartu Anda: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>{message.uid}</code>
                </div>
              )}
            </div>
          </div>

          {message.uid && (
            <button 
              onClick={() => onRegisterUnregisteredCard(message.uid)}
              className="btn btn-emerald"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              <PlusCircle size={16} /> Daftarkan Kartu Ini Sekarang
            </button>
          )}

          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Kiosk Action Grid (4 Big Touch Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div 
          onClick={() => setActiveStep('attendance')}
          className="glass-card"
          style={{
            padding: '24px',
            cursor: 'pointer',
            border: activeStep === 'attendance' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
            background: activeStep === 'attendance' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <UserCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>1. Presensi Kehadiran</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Tap kartu RFID fisik/virtual untuk presensi & dengarkan ucapan salam.
          </p>
        </div>

        <div 
          onClick={() => setActiveStep('borrow')}
          className="glass-card"
          style={{
            padding: '24px',
            cursor: 'pointer',
            border: activeStep === 'borrow' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            background: activeStep === 'borrow' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <BookOpen size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>2. Pinjam Buku Cepat</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Tap kartu RFID Anda & pilih buku kesukaanmu untuk dipinjam.
          </p>
        </div>

        <div 
          onClick={() => setActiveStep('return')}
          className="glass-card"
          style={{
            padding: '24px',
            cursor: 'pointer',
            border: activeStep === 'return' ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
            background: activeStep === 'return' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <RotateCcw size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>3. Kembalikan & Denda</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Kembalikan buku & bayar denda keterlambatan via Saldo Kartu RFID.
          </p>
        </div>

        <div 
          onClick={() => setActiveStep('balance')}
          className="glass-card"
          style={{
            padding: '24px',
            cursor: 'pointer',
            border: activeStep === 'balance' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
            background: activeStep === 'balance' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <CreditCard size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>4. Cek Saldo & Pinjaman</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Lihat daftar buku yang sedang dipinjam & sisa e-wallet kartu.
          </p>
        </div>

      </div>

      {/* BORROW SUB-VIEW */}
      {activeStep === 'borrow' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="#3b82f6" /> Peminjaman Buku Sekolah
          </h3>

          {!selectedMember ? (
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px dashed rgba(59, 130, 246, 0.5)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <Radio size={36} color="#3b82f6" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Silakan Tempelkan Kartu RFID Anda di Mesin Reader</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Identitas anggota, foto, kelas, saldo, dan daftar buku yang sedang dipinjam akan otomatis ditampilkan di layar.
              </p>
            </div>
          ) : (
            /* Student Identity & Currently Borrowed Books Panel */
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} /> IDENTITAS ANGGOTA & PINJAMAN AKTIF ({selectedMember.name})
              </div>

              {activeLoans.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Anggota belum memiliki pinjaman aktif (Bisa meminjam hingga {settings.maxBooksPerStudent || 3} buku).
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px' }}>Judul Buku Dipinjam</th>
                        <th style={{ padding: '6px' }}>Tanggal Pinjam</th>
                        <th style={{ padding: '6px' }}>Jatuh Tempo</th>
                        <th style={{ padding: '6px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoans.map(l => (
                        <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '6px', fontWeight: 700 }}>{l.bookTitle}</td>
                          <td style={{ padding: '6px' }}>{l.issueDate}</td>
                          <td style={{ padding: '6px', color: '#fb7185', fontWeight: 700 }}>{l.dueDate}</td>
                          <td style={{ padding: '6px' }}>
                            <span className={`badge ${l.status === 'Terlambat' ? 'badge-rose' : 'badge-blue'}`}>{l.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Cari judul buku, penulis, atau kategori..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {filteredBooks.map(book => {
              const isAlreadyBorrowedByStudent = activeLoans.some(
                l => l.bookId === book.id || l.bookTitle.toLowerCase() === book.title.toLowerCase()
              );

              return (
                <div 
                  key={book.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: isAlreadyBorrowedByStudent ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                        {book.category}
                      </span>
                      {isAlreadyBorrowedByStudent && (
                        <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                          Sedang Dipinjam
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)' }}>
                      {book.title}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {book.author}
                    </p>
                    <div style={{ fontSize: '0.75rem', marginTop: '6px', color: book.available > 0 ? '#34d399' : '#fb7185' }}>
                      Stok Tersedia: <strong>{book.available}</strong> / {book.stock}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBorrow(book)}
                    disabled={book.available <= 0 || isAlreadyBorrowedByStudent}
                    className={`btn ${isAlreadyBorrowedByStudent ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ marginTop: '14px', width: '100%', fontSize: '0.82rem', padding: '8px' }}
                  >
                    {isAlreadyBorrowedByStudent 
                      ? 'Sedang Dipinjam Anda' 
                      : (book.available > 0 ? 'Pinjam Sekarang' : 'Stok Habis')
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RETURN SUB-VIEW */}
      {activeStep === 'return' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={20} color="#f59e0b" /> Pengembalian Buku & Identitas Anggota
          </h3>

          {!selectedMember ? (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px dashed rgba(245, 158, 11, 0.5)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <Radio size={36} color="#f59e0b" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Silakan Tempelkan Kartu RFID Anda di Mesin Reader</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Identitas anggota dan daftar buku yang harus dikembalikan akan otomatis ditampilkan tanpa ucapan suara.
              </p>
            </div>
          ) : activeLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '10px' }} />
              <h4>Tidak ada buku yang sedang dipinjam oleh {selectedMember.name}.</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} /> DAFTAR BUKU YANG HARUS DIKEMBALIKAN OLEH {selectedMember.name.toUpperCase()} ({selectedMember.classGrade}):
              </div>

              {activeLoans.map(tx => (
                <div 
                  key={tx.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: tx.status === 'Terlambat' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <span className={`badge ${tx.status === 'Terlambat' ? 'badge-rose' : 'badge-blue'}`}>
                      {tx.status}
                    </span>
                    <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.05rem', fontWeight: 700 }}>
                      {tx.bookTitle}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Tgl Pinjam: {tx.issueDate} • Batas Kembali: <strong style={{ color: '#fb7185' }}>{tx.dueDate}</strong>
                    </div>
                    {tx.fineAmount > 0 && (
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fb7185', marginTop: '4px' }}>
                        Denda Terlambat: Rp {tx.fineAmount.toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {tx.fineAmount > 0 ? (
                      <button 
                        onClick={() => handleReturn(tx, true)}
                        className="btn btn-emerald"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <CreditCard size={16} /> Bayar Denda via Saldo & Kembalikan
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReturn(tx, false)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <RotateCcw size={16} /> Kembalikan Buku Ini
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BALANCE SUB-VIEW */}
      {activeStep === 'balance' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#8b5cf6" /> Informasi Saldo & Riwayat Siswa:
          </h3>

          {!selectedMember ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Silakan Tap Kartu RFID Anda di atas terlebih dahulu untuk mengecek saldo.
            </p>
          ) : (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SALDO E-WALLET RFID</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                    Rp {selectedMember.balance.toLocaleString('id-ID')}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL POIN MEMBACA</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                    {selectedMember.points} Poin
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PINJAMAN AKTIF</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                    {activeLoans.length} / {settings.maxBooksPerStudent || 3} Buku
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Buku yang Sedang Dipinjam:</h4>
              {activeLoans.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tidak ada buku yang sedang dipinjam saat ini.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeLoans.map(l => (
                    <div key={l.id} style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{l.bookTitle}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Batas Kembali: {l.dueDate}</div>
                      </div>
                      <span className={`badge ${l.status === 'Terlambat' ? 'badge-rose' : 'badge-blue'}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
