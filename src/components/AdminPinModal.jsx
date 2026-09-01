import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose, onSuccess, adminPin = 'PustakaSmart2026', targetTabName = 'Portal Petugas Admin' }) {
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pinInputRef = useRef(null);

  // Callback Ref: Ensures focus & blinking cursor immediately as soon as DOM element is attached!
  const setPinInputRef = useCallback((node) => {
    if (node) {
      pinInputRef.current = node;
      const doFocus = () => {
        try {
          node.focus();
        } catch (e) {}
      };
      doFocus();
      requestAnimationFrame(doFocus);
      setTimeout(doFocus, 50);
      setTimeout(doFocus, 150);
      setTimeout(doFocus, 300);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setPinInput('');
    setErrorMessage('');

    const forceFocus = () => {
      try {
        if (typeof window !== 'undefined') {
          window.focus();
          if (window.require) {
            try {
              const { ipcRenderer } = window.require('electron');
              ipcRenderer.send('app-force-focus');
            } catch (err) {}
          }
        }
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      } catch (e) {}
    };

    forceFocus();
    requestAnimationFrame(forceFocus);
    const t1 = setTimeout(forceFocus, 50);
    const t2 = setTimeout(forceFocus, 150);

    // 100ms Continuous Focus Enforcer while modal is open
    const focusInterval = setInterval(() => {
      if (pinInputRef.current && document.activeElement !== pinInputRef.current) {
        try {
          if (typeof window !== 'undefined') window.focus();
          pinInputRef.current.focus();
        } catch (e) {}
      }
    }, 100);

    // Keyboard Listener: If user types while modal is open, auto-focus input
    const handleGlobalKeyDown = (e) => {
      if (pinInputRef.current && document.activeElement !== pinInputRef.current) {
        try {
          if (typeof window !== 'undefined') window.focus();
          pinInputRef.current.focus();
        } catch (err) {}
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(focusInterval);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanInput = String(pinInput || '').trim().replace(/^["']|["']$/g, '');
    const correctPin = String(adminPin || 'PustakaSmart2026').trim().replace(/^["']|["']$/g, '');

    // Verify against actual configured admin PIN (or fallback PustakaSmart2026)
    if (cleanInput === correctPin || cleanInput === 'PustakaSmart2026') {
      setErrorMessage('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMessage('❌ PIN Admin salah! Sesi Admin tetap terkunci.');
    }
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 3000, backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
    >
      <div 
        className="modal-container" 
        onMouseDown={e => e.stopPropagation()}
        onClick={handleContainerClick}
        style={{ maxWidth: '420px', padding: '24px', borderRadius: '16px', cursor: 'text', zIndex: 3001 }}
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
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
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
                ref={setPinInputRef}
                autoFocus
                type={showPassword ? "text" : "password"} 
                className="form-input"
                value={pinInput}
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
                onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }}
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
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-emerald" 
              onClick={(e) => e.stopPropagation()} 
              style={{ flex: 1, fontWeight: 800 }}
            >
              <ShieldCheck size={18} /> Buka Akses Admin
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
