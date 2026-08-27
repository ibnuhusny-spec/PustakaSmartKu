import React, { useState } from 'react';
import { Award, KeyRound, CheckCircle2, ShieldAlert, X, Sparkles, Building2 } from 'lucide-react';
import { validateLicenseKey } from '../services/licenseService';

export default function LicenseModal({ isOpen, onClose, onActivateSuccess, currentLicenseType = 'trial', daysRemaining = 30 }) {
  const [keyInput, setKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateLicenseKey(keyInput)) {
      setErrorMessage('');
      setKeyInput('');
      onActivateSuccess(keyInput.trim().toUpperCase());
      alert('🎉 SELAMAT! Lisensi Resmi PustakaSmart RFID Pro Aktif Selamanya untuk Sekolah Anda!');
    } else {
      setErrorMessage('❌ Kode Lisensi tidak valid! Hubungi pengembang untuk mendapatkan Lisensi Resmi Pro.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
        
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Aktivasi Lisensi Resmi Pro</h3>
              <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>PustakaSmart RFID School Edition</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          
          {currentLicenseType === 'trial' ? (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Status: Versi Percobaan 30 Hari (Trial)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                Sisa Masa Percobaan: <strong>{daysRemaining} Hari Lagi</strong>. Masukkan Kode Lisensi Resmi untuk mengaktifkan lisensi seumur hidup (*Lifetime*).
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Lisensi Pro Aktif Selamanya (Full Version)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                Aplikasi ini terdaftar resmi dengan Lisensi PustakaSmart Pro.
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Kode Aktivasi Lisensi Resmi (License Key)
            </label>
            <input 
              type="text" 
              className="form-input"
              value={keyInput}
              onChange={e => {
                setKeyInput(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Masukkan Kode Lisensi (Contoh: PUSTAKA-PRO-2026)..."
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '1px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase'
              }}
              autoFocus
              required
            />
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

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
            💡 <em>Ingin Membeli Lisensi Resmi?</em> Hubungi vendor penyedia aplikasi untuk mendapatkan Kode Lisensi Pro beserta Hardware RFID Reader & Kartu Pelajar RFID sekolah Anda.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Tutup
            </button>
            <button type="submit" className="btn btn-emerald" style={{ flex: 1 }}>
              <KeyRound size={16} /> Aktifkan Lisensi Pro
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
