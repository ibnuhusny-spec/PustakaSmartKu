import React from 'react';
import { Printer, X, CheckCircle2, CreditCard, BookOpen } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, transaction, member, settings }) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

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
            {/* Header with optional School Logo */}
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px dashed #94a3b8', paddingBottom: '12px' }}>
              {settings?.logoUrl && (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo Sekolah" 
                  style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '6px' }} 
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
              <div><strong>No. Nota:</strong> {transaction.id}</div>
              <div><strong>Tanggal:</strong> {new Date().toLocaleString('id-ID')}</div>
              <div><strong>Kartu RFID:</strong> {transaction.rfidUid}</div>
              <div><strong>Siswa/Guru:</strong> {transaction.memberName} ({member?.classGrade || 'Siswa'})</div>
            </div>

            <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '12px 0' }}></div>

            {/* Book Item Details */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>DETAIL BUKU:</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                {transaction.bookTitle}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                ID Buku: {transaction.bookId}
              </div>
            </div>

            {/* Status & Dates */}
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Status:</span>
                <strong style={{ color: transaction.status === 'Dikembalikan' ? '#16a34a' : '#2563eb' }}>
                  {transaction.status}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Tgl Pinjam:</span>
                <span>{transaction.issueDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Batas Kembali:</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{transaction.dueDate}</span>
              </div>
            </div>

            {/* Fine Section if applicable */}
            {transaction.fineAmount > 0 && (
              <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991b1b', fontWeight: 700 }}>
                  <span>Denda Terlambat:</span>
                  <span>Rp {transaction.fineAmount.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#b91c1c', marginTop: '4px' }}>
                  <span>Metode Bayar:</span>
                  <span>{transaction.finePaid ? 'Lunas via Saldo RFID' : 'Belum Lunas'}</span>
                </div>
              </div>
            )}

            {/* Member Wallet Balance info */}
            {member && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                <span>Sisa Saldo RFID:</span>
                <strong style={{ color: '#0f172a' }}>Rp {member.balance.toLocaleString('id-ID')}</strong>
              </div>
            )}

            {/* Footer note */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.72rem', color: '#64748b' }}>
              *** Terima Kasih Telah Membaca ***<br/>
              Harap kembalikan buku tepat waktu.
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Cetak Struk (Thermal / A4)
          </button>
        </div>

      </div>
    </div>
  );
}
