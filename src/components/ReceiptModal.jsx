import React, { useState } from 'react';
import { Printer, X, CheckCircle2, CreditCard, BookOpen, RotateCcw, Smartphone, Send } from 'lucide-react';
import defaultLogo from '../assets/logo.png';
import { sendWhatsAppNotification, formatWaMessage } from '../services/waService';

export default function ReceiptModal({ isOpen, onClose, transaction, member, settings }) {
  const [waSending, setWaSending] = useState(false);
  const [waStatusMsg, setWaStatusMsg] = useState('');
  const [waTargetMode, setWaTargetMode] = useState('both'); // 'student', 'parent', 'both'

  if (!isOpen || !transaction) return null;

  // Safely extract actual transaction object if wrapped in { transaction: tx }
  const actualTx = transaction?.transaction || transaction;

  // Detect whether this is a Return or Loan receipt
  const isReturn = actualTx.status === 'Dikembalikan' || !!actualTx.returnDate;

  // Robust data fallbacks so fields are NEVER blank
  const notaNo = actualTx.id || actualTx.txId || 'TX-273131';
  const issueDate = actualTx.issueDate || actualTx.date || new Date().toISOString().split('T')[0];
  const returnDate = actualTx.returnDate || new Date().toISOString().split('T')[0];
  const dueDate = actualTx.dueDate || '-';
  
  const borrowerName = actualTx.memberName || member?.name || 'Siswa / Anggota';
  const borrowerClass = member?.classGrade || member?.role || actualTx.classGrade || 'Siswa';
  const borrowerRole = member?.role || 'Siswa';
  const rfidUid = actualTx.rfidUid || member?.rfidUid || '-';
  const bookTitle = actualTx.bookTitle || 'Buku Perpustakaan';

  const memberPhone = member?.phone || '';
  const parentPhone = member?.parentPhone || '';

  const handlePrint = () => {
    const oldTitle = document.title;
    try {
      const cleanMember = borrowerName.replace(/[^a-zA-Z0-9]/g, '_');
      const prefix = isReturn ? 'Struk_Pengembalian' : 'Struk_Peminjaman';
      document.title = `${prefix}_${cleanMember}_${notaNo}`;
    } catch (e) {}

    window.print();

    setTimeout(() => {
      document.title = oldTitle;
      if (onClose) onClose();
    }, 400);
  };

  const handleSendWa = async (customTarget = null) => {
    setWaSending(true);
    setWaStatusMsg('');

    // Determine target phone numbers
    let targets = [];
    const chosenTarget = customTarget || waTargetMode;

    if (chosenTarget === 'student' && memberPhone) {
      targets.push(memberPhone);
    } else if (chosenTarget === 'parent' && parentPhone) {
      targets.push(parentPhone);
    } else if (chosenTarget === 'both') {
      if (memberPhone) targets.push(memberPhone);
      if (parentPhone) targets.push(parentPhone);
    }

    if (targets.length === 0) {
      // Fallback if target selected didn't have phone
      if (memberPhone) targets.push(memberPhone);
      else if (parentPhone) targets.push(parentPhone);
    }

    if (targets.length === 0) {
      setWaSending(false);
      setWaStatusMsg('⚠️ Belum ada Nomor WhatsApp yang terdaftar untuk anggota ini.');
      return;
    }

    // Determine template based on Role (Student vs Teacher/General) and Type (Loan vs Return)
    let template = '';
    const isStudent = borrowerRole === 'Siswa';

    if (isReturn) {
      template = isStudent 
        ? (settings?.waTemplateReturnStudent || "Yth. Orang Tua / Wali dari {nama} ({kelas}),\n\nTerima kasih, buku berikut telah dikembalikan ke perpustakaan:\n📖 *{judul_buku}*\n📅 Tgl Kembali: {tgl_kembali}\n💰 Denda: Rp {denda}\n\n_{nama_sekolah}_")
        : (settings?.waTemplateReturnGeneral || "Yth. Bapak/Ibu {nama} ({peran}),\n\nTerima kasih, buku berikut telah dikembalikan ke perpustakaan:\n📖 *{judul_buku}*\n📅 Tgl Kembali: {tgl_kembali}\n💰 Denda: Rp {denda}\n\n_{nama_sekolah}_");
    } else {
      template = isStudent 
        ? (settings?.waTemplateStudent || "Yth. Orang Tua / Wali dari {nama} ({kelas}),\n\nTerima kasih telah membaca. Siswa ybs meminjam buku:\n📖 *{judul_buku}*\n📅 Tgl Pinjam: {tgl_pinjam}\n⏰ Batas Kembalikan: {tgl_kembali}\n\n_{nama_sekolah}_")
        : (settings?.waTemplateGeneral || "Yth. Bapak/Ibu {nama} ({peran}),\n\nTerima kasih telah membaca. Anda baru saja meminjam buku:\n📖 *{judul_buku}*\n📅 Tgl Pinjam: {tgl_pinjam}\n⏰ Batas Kembalikan: {tgl_kembali}\n\n_{nama_sekolah}_");
    }

    const messageData = {
      nama: borrowerName,
      kelas: borrowerClass,
      peran: borrowerRole,
      judul_buku: bookTitle,
      tgl_pinjam: issueDate,
      tgl_kembali: isReturn ? returnDate : dueDate,
      denda: actualTx.fineAmount || 0,
      saldo: member?.balance || 0,
      nama_sekolah: settings?.schoolName || "Perpustakaan Digital",
      nota: notaNo
    };

    const formattedMessage = formatWaMessage(template, messageData);
    let lastResult = null;

    for (const target of targets) {
      lastResult = await sendWhatsAppNotification({
        targetPhone: target,
        message: formattedMessage,
        foonteApiToken: settings?.foonteApiToken
      });
    }

    setWaSending(false);
    if (lastResult?.message) {
      setWaStatusMsg(lastResult.message);
    }
  };

  const activeSchoolLogo = (settings?.schoolLogoUrl && settings.schoolLogoUrl.trim()) 
    ? settings.schoolLogoUrl 
    : ((settings?.logoUrl && settings.logoUrl.trim() && settings.logoUrl.startsWith('data:')) ? settings.logoUrl : defaultLogo);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 3500 }}>
      <div className="modal-container" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        <div className="modal-header no-print">
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isReturn ? <RotateCcw size={18} color="#10b981" /> : <BookOpen size={18} color="#3b82f6" />}
            {isReturn ? 'Struk Pengembalian Buku' : 'Struk Peminjaman Buku'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body printable-area">
          <div style={{
            background: '#ffffff',
            color: '#111827',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px dashed #94a3b8',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            {/* Header with School Logo & Clear Title */}
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px dashed #94a3b8', paddingBottom: '12px' }}>
              {activeSchoolLogo && (
                <img 
                  src={activeSchoolLogo} 
                  alt="Logo Instansi" 
                  style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '6px' }} 
                  onError={e => { e.target.src = defaultLogo; }}
                />
              )}
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-main)', color: '#0f172a' }}>
                {settings?.schoolName || 'SDIT Qurratu A\'yun Al-Islami'}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                {settings?.libraryName || 'Maktabah Al-Qiro\'ah'}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.70rem', color: '#64748b' }}>
                {settings?.address || 'Jalan Poros Makassar - Maros Km. 26 Maccopa'}
              </p>

              {/* Receipt Type Banner */}
              <div style={{
                marginTop: '10px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: isReturn ? '#ecfdf5' : '#eff6ff',
                color: isReturn ? '#047857' : '#1d4ed8',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.5px',
                border: isReturn ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                display: 'inline-block'
              }}>
                *** {isReturn ? 'STRUK PENGEMBALIAN BUKU' : 'STRUK PEMINJAMAN BUKU'} ***
              </div>
            </div>

            {/* Transaction Info */}
            <div style={{ marginBottom: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>No. Nota:</strong> {notaNo}</div>
              <div><strong>Tgl Transaksi:</strong> {isReturn ? returnDate : issueDate}</div>
              <div><strong>Peminjam:</strong> {borrowerName} ({borrowerClass})</div>
              <div><strong>RFID UID:</strong> {rfidUid}</div>
            </div>

            {/* Book Info Box */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                📖 {bookTitle}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                {isReturn ? (
                  <>
                    <span>Tgl Pinjam: {issueDate}</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>
                      [DIKEMBALIKAN]
                    </span>
                  </>
                ) : (
                  <>
                    <span>Batas Pinjam: {dueDate}</span>
                    <span style={{ fontWeight: 700, color: actualTx.status === 'Terlambat' ? '#ef4444' : '#10b981' }}>
                      [{actualTx.status || 'Dipinjam'}]
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Fine Section */}
            {actualTx.fineAmount > 0 && (
              <div style={{ background: '#fef2f2', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '14px', color: '#991b1b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Denda Keterlambatan:</span>
                  <span>Rp {Number(actualTx.fineAmount).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ fontSize: '0.72rem', marginTop: '2px', color: '#b91c1c' }}>
                  Status Pelunasan: {actualTx.finePaid ? 'LUNAS (E-Wallet RFID)' : 'BELUM LUNAS'}
                </div>
              </div>
            )}

            {/* Footer Notice - Custom message for Return vs Loan */}
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
              {isReturn ? (
                <>
                  <div>Buku telah berhasil dikembalikan ke perpustakaan.</div>
                  <div>Terima kasih atas kedisiplinan & ketaatan Anda!</div>
                </>
              ) : (
                <>
                  <div>Terima kasih telah membaca di perpustakaan.</div>
                  <div>Jaga buku ini dengan baik & kembalikan tepat waktu.</div>
                </>
              )}
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
                Powered by PustakaSmart RFID School System
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* WHATSAPP DIGITAL RECEIPT SENDING BUTTON */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={16} /> 📲 Kirim Struk Digital via WhatsApp
              </span>
              {settings?.foonteApiToken ? (
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>⚡ Foonte Gateway Aktif</span>
              ) : (
                <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>📱 WhatsApp Direct</span>
              )}
            </div>

            {(memberPhone || parentPhone) ? (
              <div>
                {/* Target Radio Selection if both exist */}
                {(memberPhone && parentPhone) && (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '0.75rem' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="radio" 
                        name="waTarget" 
                        value="both" 
                        checked={waTargetMode === 'both'} 
                        onChange={() => setWaTargetMode('both')} 
                      />
                      <span>Keduanya (Siswa & Ortu)</span>
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="radio" 
                        name="waTarget" 
                        value="student" 
                        checked={waTargetMode === 'student'} 
                        onChange={() => setWaTargetMode('student')} 
                      />
                      <span>Pribadi ({memberPhone})</span>
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="radio" 
                        name="waTarget" 
                        value="parent" 
                        checked={waTargetMode === 'parent'} 
                        onChange={() => setWaTargetMode('parent')} 
                      />
                      <span>Ortu ({parentPhone})</span>
                    </label>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={() => handleSendWa()}
                  disabled={waSending}
                  className="btn btn-emerald"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 800 }}
                >
                  <Send size={15} />
                  <span>{waSending ? 'Mengirim WhatsApp...' : 'Kirim Pesan Struk WA Sekarang'}</span>
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>
                ⚠️ Anggota ini belum memiliki nomor WA terdaftar di database.
              </div>
            )}

            {waStatusMsg && (
              <div style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: 700, color: '#34d399' }}>
                {waStatusMsg}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Tutup
            </button>
            <button onClick={handlePrint} className="btn btn-emerald">
              <Printer size={16} /> {isReturn ? 'Cetak Struk Pengembalian' : 'Cetak Struk Peminjaman'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
