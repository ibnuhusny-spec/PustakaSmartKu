import React from 'react';
import { Printer, X, CreditCard, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

export default function CardPrinterModal({ isOpen, onClose, member, settings }) {
  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        <div className="modal-header no-print">
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Cetak Kartu Pelajar RFID Digital</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body printable-area" style={{ display: 'flex', justifyContent: 'center' }}>
          
          {/* Credit Card sized ID Badge (85.6mm x 53.98mm ratio) */}
          <div style={{
            width: '360px',
            height: '225px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            color: '#ffffff',
            padding: '18px',
            position: 'relative',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}>
            {/* Glossy Overlay */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            {/* Top Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#818cf8' }}>
                  {settings.schoolName || 'SMA NEGERI 1 SMART LITERACY'}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                  KARTU TANDA ANGGOTA PERPUSTAKAAN RFID
                </div>
              </div>
              <Cpu size={22} color="#fbbf24" title="Smart RFID Microchip" />
            </div>

            {/* Middle Card Content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', zIndex: 1 }}>
              {/* Photo */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                border: '2px solid #6366f1',
                padding: '2px',
                background: '#ffffff',
                flexShrink: 0
              }}>
                <img 
                  src={member.avatar}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', borderRadius: '10px' }}
                />
              </div>

              {/* Member Meta */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#f8fafc' }}>
                  {member.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {member.role}: {member.classGrade}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  NISN: {member.nisn || '0051239841'}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
              <div>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase' }}>RFID UID CODE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: '#34d399', letterSpacing: '1px' }}>
                  {member.rfidUid}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>DUTA BACA</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24' }}>
                  {member.badge || 'Pembaca Aktif ⭐'}
                </div>
              </div>
            </div>

          </div>

        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-emerald" onClick={handlePrint}>
            <Printer size={16} /> Cetak Kartu RFID (Printer PVC / Kartu)
          </button>
        </div>

      </div>
    </div>
  );
}
