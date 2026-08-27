import React, { useState } from 'react';
import { Award, KeyRound, CheckCircle2, ShieldAlert, X, Sparkles, Building2, Copy, Check, Lock, Wrench, ShieldCheck } from 'lucide-react';
import { 
  generateSchoolRegistrationId, 
  generateProLicenseKeyForSchool, 
  validateDynamicLicenseKey 
} from '../services/licenseService';

export default function LicenseModal({ 
  isOpen, 
  onClose, 
  onActivateSuccess, 
  currentLicenseType = 'trial', 
  daysRemaining = 30,
  schoolName = "SDIT QURRATU A'YUN AL-ISLAMI"
}) {
  const [keyInput, setKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Vendor Generator Security State
  const [showVendorPasscodeForm, setShowVendorPasscodeForm] = useState(false);
  const [vendorPasscodeInput, setVendorPasscodeInput] = useState('');
  const [isVendorUnlocked, setIsVendorUnlocked] = useState(false);
  const [vendorPasscodeError, setVendorPasscodeError] = useState('');

  const [vendorSchoolIdInput, setVendorSchoolIdInput] = useState('');
  const [generatedVendorKey, setGeneratedVendorKey] = useState('');

  if (!isOpen) return null;

  const regId = generateSchoolRegistrationId(schoolName);

  const handleCopyRegId = () => {
    navigator.clipboard.writeText(regId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDynamicLicenseKey(keyInput, schoolName)) {
      setErrorMessage('');
      setKeyInput('');
      onActivateSuccess(keyInput.trim().toUpperCase());
      alert(`🎉 SELAMAT! Lisensi Resmi PustakaSmart RFID Pro Aktif Selamanya Khusus Untuk "${schoolName}"!`);
    } else {
      setErrorMessage(`❌ Kode Lisensi tidak cocok untuk "${schoolName}"! Kode lisensi terikat khusus per nama sekolah dan tidak dapat dibagikan.`);
    }
  };

  const handleUnlockVendorTool = (e) => {
    e.preventDefault();
    // Secret Passcode for Vendor Key Generator Access
    if (vendorPasscodeInput.trim() === 'VENDOR2026' || vendorPasscodeInput.trim() === 'PustakaSmart2026') {
      setIsVendorUnlocked(true);
      setVendorPasscodeError('');
    } else {
      setVendorPasscodeError('❌ Passcode Vendor Salah! Akses khusus Pemilik/Pengembang Software.');
    }
  };

  const handleGenerateVendorKey = (e) => {
    e.preventDefault();
    if (!vendorSchoolIdInput.trim()) return;
    const key = generateProLicenseKeyForSchool(vendorSchoolIdInput.trim());
    setGeneratedVendorKey(key);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', padding: '24px' }}>
        
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Aktivasi Lisensi Unik Sekolah</h3>
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
                Sisa Masa Percobaan: <strong>{daysRemaining} Hari Lagi</strong>. Masukkan Kode Lisensi Pro khusus sekolah Anda.
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
                Terdaftar Resmi Khusus Untuk: <strong>{schoolName}</strong>
              </div>
            </div>
          )}

          {/* DYNAMIC SCHOOL REGISTRATION ID DISPLAY */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, marginBottom: '4px' }}>
              🏫 ID REGISTRASI SEKOLAH ANDA:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399', fontSize: '1rem', letterSpacing: '1px' }}>
                {regId}
              </span>
              <button
                type="button"
                onClick={handleCopyRegId}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {isCopied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin ID'}</span>
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
              💡 Kirimkan ID Registrasi Sekolah di atas ke Pengembang/Vendor untuk menerima Kode Lisensi Pro khusus sekolah Anda.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Kode Aktivasi Lisensi Pro (Khusus {schoolName})
            </label>
            <input 
              type="text" 
              className="form-input"
              value={keyInput}
              onChange={e => {
                setKeyInput(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Paste Kode Lisensi Pro Sekolah Anda (Contoh: PRO-SDIT-...)..."
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                letterSpacing: '1px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase'
              }}
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
              lineHeight: '1.4'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Tutup
            </button>
            <button type="submit" className="btn btn-emerald" style={{ flex: 1 }}>
              <KeyRound size={16} /> Aktifkan Lisensi Pro
            </button>
          </div>

        </form>

        {/* SECURE PASSCODE-PROTECTED VENDOR KEY GENERATOR */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowVendorPasscodeForm(!showVendorPasscodeForm)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Lock size={12} /> {showVendorPasscodeForm ? 'Tutup Area Vendor' : '🛠️ Area Khusus Pemilik / Vendor Software'}
          </button>

          {showVendorPasscodeForm && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(30, 41, 59, 0.9)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px dashed #3b82f6',
              textAlign: 'left'
            }}>
              {!isVendorUnlocked ? (
                <form onSubmit={handleUnlockVendorTool}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fb7185', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Masukkan Passcode Rahasia Vendor
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={vendorPasscodeInput}
                      onChange={e => {
                        setVendorPasscodeInput(e.target.value);
                        if (vendorPasscodeError) setVendorPasscodeError('');
                      }}
                      placeholder="Passcode Vendor (Default: VENDOR2026)..."
                      style={{ fontSize: '0.8rem' }}
                      required
                    />
                    <button type="submit" className="btn btn-rose" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      Buka Keygen
                    </button>
                  </div>
                  {vendorPasscodeError && (
                    <div style={{ color: '#fb7185', fontSize: '0.75rem', marginTop: '6px', fontWeight: 700 }}>
                      {vendorPasscodeError}
                    </div>
                  )}
                </form>
              ) : (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> Key Generator Pemilik Software (Unlocked)
                  </div>
                  <form onSubmit={handleGenerateVendorKey} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={vendorSchoolIdInput}
                      onChange={e => setVendorSchoolIdInput(e.target.value)}
                      placeholder="Paste ID Registrasi Sekolah Pembeli (ID-SDIT...)..."
                      style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                    <button type="submit" className="btn btn-emerald" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      Generate Key
                    </button>
                  </form>

                  {generatedVendorKey && (
                    <div style={{ background: '#0f172a', padding: '8px', borderRadius: '4px', border: '1px solid #10b981', color: '#34d399', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 800, wordBreak: 'break-all' }}>
                      {generatedVendorKey}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
