import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose, onSuccess, adminPin = 'PustakaSmart2026', targetTabName = 'Portal Petugas Admin' }) {
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pinInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage('');
      const timer1 = setTimeout(() => {
        if (pinInputRef.current) pinInputRef.current.focus();
      }, 50);
      const timer2 = setTimeout(() => {
        if (pinInputRef.current) pinInputRef.current.focus();
      }, 200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanInput = pinInput.trim();
    const correctPin = (adminPin || 'PustakaSmart2026').trim();

    // Verify against actual configured admin PIN (or fallback PustakaSmart2026)
    if (cleanInput === correctPin) {
      setErrorMessage('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMessage('❌ PIN Admin salah! Sesi Admin tetap terkunci.');
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 1200 }}
    >
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        style={{ maxWidth: '420px', padding: '24px', borderRadius: '16px' }}
      >
        
        {/* Header */}
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
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                Proteksi Keamanan Admin
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Akses Fitur Khusus Petugas</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Tab <strong>"{targetTabName}"</strong> khusus Petugas. Masukkan Password/PIN Admin untuk membuka akses.
          </p>

          {/* Clean Input Box */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 800 }}>Password / PIN Admin Perpustakaan</label>
            <div style={{ position: 'relative' }}>
              <input 
                ref={pinInputRef}
                type={showPassword ? "text" : "password"} 
                className="form-input"
                value={pinInput}
                onMouseDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  setPinInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ketik Password / PIN Admin..."
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  letterSpacing: showPassword ? 'normal' : '3px',
                  fontFamily: 'var(--font-mono)',
                  paddingRight: '42px',
                  background: 'var(--bg-secondary)',
                  borderColor: errorMessage ? '#ef4444' : 'var(--border-color)'
                }}
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-emerald" style={{ flex: 1, fontWeight: 800 }}>
              <ShieldCheck size={18} /> Buka Akses Admin
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
