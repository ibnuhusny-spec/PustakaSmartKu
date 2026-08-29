import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff, Delete } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose, onSuccess, adminPin = 'PustakaSmart2026', targetTabName = 'Portal Petugas Admin' }) {
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pinInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage('');
      setTimeout(() => {
        if (pinInputRef.current) pinInputRef.current.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const verifyPin = (inputVal) => {
    const cleanInput = inputVal.trim();
    const correctPin = (adminPin || '').trim();

    if (cleanInput === correctPin || cleanInput === '1234' || cleanInput === 'PustakaSmart2026') {
      setErrorMessage('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMessage('❌ PIN Admin salah! Sesi Admin tetap terkunci.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyPin(pinInput);
  };

  const handleKeypadTap = (digit) => {
    const nextVal = pinInput + digit;
    setPinInput(nextVal);
    if (errorMessage) setErrorMessage('');
    if (pinInputRef.current) pinInputRef.current.focus();
  };

  const handleKeypadDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    if (errorMessage) setErrorMessage('');
    if (pinInputRef.current) pinInputRef.current.focus();
  };

  const handleKeypadClear = () => {
    setPinInput('');
    if (errorMessage) setErrorMessage('');
    if (pinInputRef.current) pinInputRef.current.focus();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={e => {
        // Prevent accidental closing on background click
        e.stopPropagation();
      }}
      style={{ zIndex: 1200 }}
    >
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        onMouseDown={e => e.stopPropagation()} 
        style={{ maxWidth: '400px', padding: '24px', borderRadius: '20px' }}
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
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Tab <strong>"{targetTabName}"</strong> khusus Petugas. Masukkan PIN Admin untuk membuka akses.
          </p>

          {/* Input Box */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                ref={pinInputRef}
                type={showPassword ? "text" : "password"} 
                className="form-input"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ketik / Tap PIN Admin (1234)..."
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: showPassword ? '2px' : '6px',
                  fontFamily: 'var(--font-mono)',
                  paddingRight: '42px',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  borderColor: errorMessage ? '#ef4444' : 'var(--accent-primary)'
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Touchscreen Keypad (Perfect for HP & Tablet) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadTap(num)}
                className="btn btn-secondary"
                style={{
                  height: '46px',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  justifyContent: 'center'
                }}
              >
                {num}
              </button>
            ))}
            
            <button
              type="button"
              onClick={handleKeypadClear}
              className="btn btn-secondary"
              style={{
                height: '46px',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '10px',
                color: '#f87171',
                justifyContent: 'center'
              }}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => handleKeypadTap('0')}
              className="btn btn-secondary"
              style={{
                height: '46px',
                fontSize: '1.25rem',
                fontWeight: 800,
                borderRadius: '10px',
                justifyContent: 'center'
              }}
            >
              0
            </button>

            <button
              type="button"
              onClick={handleKeypadDelete}
              className="btn btn-secondary"
              style={{
                height: '46px',
                fontSize: '0.9rem',
                fontWeight: 800,
                borderRadius: '10px',
                color: '#fbbf24',
                justifyContent: 'center'
              }}
            >
              <Delete size={18} />
            </button>
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
            💡 <em>PIN Standar:</em> <code style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>1234</code> atau <code style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>PustakaSmart2026</code>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-emerald" style={{ flex: 1, fontWeight: 800 }}>
              <ShieldCheck size={18} /> Buka Akses
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
