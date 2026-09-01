import React from 'react';
import { Printer, X, CheckCircle2, CreditCard, BookOpen } from 'lucide-react';
import defaultLogo from '../assets/logo.png';

export default function ReceiptModal({ isOpen, onClose, transaction, member, settings }) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    const oldTitle = document.title;
    try {
      const cleanMember = (transaction?.memberName || 'Anggota').replace(/[^a-zA-Z0-9]/g, '_');
      document.title = `Struk_Peminjaman_${cleanMember}_${transaction?.id || 'TX'}`;
    } catch (e) {}

    window.print();

    setTimeout(() => {
      document.title = oldTitle;
    }, 1200);
  };

  const activeSchoolLogo = (settings?.schoolLogoUrl && settings.schoolLogoUrl.trim()) 
    ? settings.schoolLogoUrl 
    : ((settings?.logoUrl && settings.logoUrl.trim() && settings.logoUrl.startsWith('data:')) ? settings.logoUrl : defaultLogo);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        <div className="modal-header no-print">
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Bukti Transaksi Perpustakaan</h3>
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
            {/* Header with School Logo */}
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px dashed #94a3b8', paddingBottom: '12px' }}>
              {activeSchoolLogo && (
                <img 
                  src={activeSchoolLogo} 
                  alt="Logo Sekolah" 
                  style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '6px' }} 
                  onError={e => { e.target.src = defaultLogo; }}
                />
              )}
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-main)', color: '#0f172a' }}>
                {settings?.schoolName || 'SDIT Qurratu A\'yun Al-Islami'}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                {settings?.libraryName || 'Maktabah Al-Qiro\'ah'}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                {settings?.address || 'Jl. Raya Pendidikan No. 45, Jakarta'}
              </p>
            </div>

            {/* Transaction Info */}
            <div style={{ marginBottom: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>No. Nota:</strong> {transaction.id || '-'}</div>
              <div><strong>Tgl Transaksi:</strong> {transaction.issueDate}</div>
              <div><strong>Peminjam:</strong> {transaction.memberName} ({member?.classGrade || 'Siswa'})</div>
              <div><strong>RFID UID:</strong> {transaction.rfidUid}</div>
            </div>

            {/* Book Info Box */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                📖 {transaction.bookTitle}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Batas Pinjam: {transaction.dueDate}</span>
                <span style={{ fontWeight: 700, color: transaction.status === 'Terlambat' ? '#ef4444' : '#10b981' }}>
                  [{transaction.status}]
                </span>
              </div>
            </div>

            {/* Fine Section */}
            {transaction.fineAmount > 0 && (
              <div style={{ background: '#fef2f2', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '14px', color: '#991b1b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Denda Keterlambatan:</span>
                  <span>Rp {transaction.fineAmount.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ fontSize: '0.72rem', marginTop: '2px', color: '#b91c1c' }}>
                  Status Pelunasan: {transaction.finePaid ? 'LUNAS (E-Wallet RFID)' : 'BELUM LUNAS'}
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
              <div>Terima kasih telah membaca di perpustakaan.</div>
              <div>Jaga buku ini dengan baik & kembalikan tepat waktu.</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
                Powered by PustakaSmart RFID School System
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>
            💡 <strong>Info:</strong> Nama file struk kini otomatis terisi. Jika menyimpan ke PDF, tombol <strong>Save</strong> di Windows langsung aktif!
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Tutup
            </button>
            <button onClick={handlePrint} className="btn btn-emerald">
              <Printer size={16} /> Cetak Struk Peminjaman
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
