import React, { useState } from 'react';
import { Radio, X, Zap, CheckCircle2, User, CreditCard, ShieldCheck } from 'lucide-react';
import { simulateRfidTap } from '../services/rfidService';

export default function RFIDSimulator({ isOpen, onClose, members }) {
  const [customUid, setCustomUid] = useState('');
  const [lastScanned, setLastScanned] = useState(null);

  if (!isOpen) return null;

  const handleTap = (member) => {
    setLastScanned(member);
    simulateRfidTap(member.rfidUid);
  };

  const handleCustomTap = (e) => {
    e.preventDefault();
    if (!customUid.trim()) return;
    const clean = customUid.trim().toUpperCase();
    const existing = members.find(m => m.rfidUid.toUpperCase() === clean);
    setLastScanned(existing || { name: 'Kartu Custom', rfidUid: clean, classGrade: 'Pengunjung Baru' });
    simulateRfidTap(clean);
    setCustomUid('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        onMouseDown={e => e.stopPropagation()} 
        style={{ maxWidth: '580px' }}
      >
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981'
            }}>
              <Radio size={22} className="rfid-pulse" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Virtual RFID Card Scanner Simulator</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Simulasikan tap kartu RFID fisik untuk transaksi & presensi tanpa hardware.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* Hardware status alert */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="#60a5fa" />
            <span>
              <strong>Pembaca RFID Fisik USB Aktif:</strong> Anda juga bisa menempelkan Kartu RFID asli ke USB Reader kapan saja!
            </span>
          </div>

          <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Pilih Kartu RFID Presets (Siswa & Guru):
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {members.slice(0, 6).map(member => (
              <div
                key={member.id}
                onClick={() => handleTap(member)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-emerald)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b' }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {member.classGrade} • Saldo: Rp {member.balance.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                    UID: {member.rfidUid}
                  </div>
                </div>
                <Zap size={18} color="#10b981" />
              </div>
            ))}
          </div>

          {/* Custom UID Input */}
          <form onSubmit={handleCustomTap} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Atau ketik UID Kartu RFID Custom (Contoh: RFID-9999)..."
              value={customUid}
              onChange={e => setCustomUid(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <button type="submit" className="btn btn-emerald" style={{ whiteSpace: 'nowrap' }}>
              <Zap size={16} /> Tap Custom
            </button>
          </form>

          {/* Last Scanned Feedback Banner */}
          {lastScanned && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
                <CheckCircle2 size={16} />
                <span>Berhasil Tap: <strong>{lastScanned.name}</strong> ({lastScanned.rfidUid})</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disimulasikan ✓</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
