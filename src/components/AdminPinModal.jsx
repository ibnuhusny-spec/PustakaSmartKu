import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose, onSuccess, adminPin = 'PustakaSmart2026', targetTabName = 'Pengaturan' }) {
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPin = adminPin || 'PustakaSmart2026';
    
    if (pinInput.trim() === correctPin.trim()) {
      setErrorMessage('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMessage('❌ PIN Admin salah! Akses ditolak.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '24px' }}>
        
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fb7185' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={22} color="#fb7185" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Proteksi Keamanan Admin</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Akses Fitur Khusus Petugas</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Tab <strong>"{targetTabName}"</strong> adalah area khusus Petugas Perpustakaan. Masukkan PIN Admin untuk membuka akses.
          </p>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              PIN / Password Admin Perpustakaan
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ketik PIN Admin..."
                style={{
                  fontSize: '1.05rem',
                  letterSpacing: showPassword ? 'normal' : '2px',
                  fontFamily: 'var(--font-mono)',
                  paddingRight: '42px'
                }}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
            💡 <em>PIN Bawaan Pabrik:</em> <strong>PustakaSmart2026</strong> (Dapat diubah di tab Pengaturan).
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-rose" style={{ flex: 1 }}>
              <ShieldCheck size={16} /> Buka Akses Admin
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
