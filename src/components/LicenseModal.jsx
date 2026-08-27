import React, { useState, useEffect } from 'react';
import { Award, KeyRound, CheckCircle2, ShieldAlert, X, Sparkles, Building2, Copy, Check, Lock, Wrench, ShieldCheck, Mail, HardDrive } from 'lucide-react';
import { 
  generateSchoolRegistrationId, 
  generateProLicenseKeyForSchool, 
  validateDynamicLicenseKey,
  fetchNativeHddSerial
} from '../services/licenseService';

export default function LicenseModal({ 
  isOpen, 
  onClose, 
  onActivateSuccess, 
  currentLicenseType = 'trial', 
  daysRemaining = 30,
  schoolName = "SDIT QURRATU A'YUN AL-ISLAMI",
  schoolEmail = "perpustakaan@sditqurratuayun.sch.id",
  isExpiredLockout = false
}) {
  const [keyInput, setKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [hddSerial, setHddSerial] = useState('');

  // Vendor Generator Security State
  const [showVendorPasscodeForm, setShowVendorPasscodeForm] = useState(false);
  const [vendorPasscodeInput, setVendorPasscodeInput] = useState('');
  const [isVendorUnlocked, setIsVendorUnlocked] = useState(false);
  const [vendorPasscodeError, setVendorPasscodeError] = useState('');

  const [vendorSchoolIdInput, setVendorSchoolIdInput] = useState('');
  const [generatedVendorKey, setGeneratedVendorKey] = useState('');
  const [isVendorKeyCopied, setIsVendorKeyCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNativeHddSerial().then(setHddSerial);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const regId = generateSchoolRegistrationId(schoolName, schoolEmail, hddSerial);

  const handleCopyRegId = () => {
    navigator.clipboard.writeText(regId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyVendorKey = () => {
    if (!generatedVendorKey) return;
    navigator.clipboard.writeText(generatedVendorKey);
    setIsVendorKeyCopied(true);
    setTimeout(() => setIsVendorKeyCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDynamicLicenseKey(keyInput, schoolName, schoolEmail)) {
      setErrorMessage('');
      setKeyInput('');
      onActivateSuccess(keyInput.trim().toUpperCase());
      alert(`🎉 SELAMAT! Lisensi Resmi PustakaSmart RFID Pro Aktif Selamanya Khusus Untuk "${schoolName}" (${schoolEmail})!`);
    } else {
      setErrorMessage(`❌ Kode Lisensi tidak cocok! Kode lisensi terikat khusus pada Serial Harddisk Physical Laptop (${hddSerial || 'HID'}), Email (${schoolEmail}) & Nama Sekolah (${schoolName}).`);
    }
  };

  const handleUnlockVendorTool = (e) => {
    e.preventDefault();
    // Custom Passcode Vendor: Iy0ut1que77
    if (vendorPasscodeInput.trim() === 'Iy0ut1que77') {
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
    <div className="modal-overlay" onClick={isExpiredLockout ? null : onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', padding: '24px' }}>
        
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isExpiredLockout ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              {isExpiredLockout ? <ShieldAlert size={24} /> : <Award size={24} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                {isExpiredLockout ? '🔒 Masa Percobaan 30 Hari Telah Berakhir' : 'Aktivasi Lisensi HID Unik Laptop'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: isExpiredLockout ? '#fb7185' : '#10b981', fontWeight: 700 }}>
                PustakaSmart RFID - Hardware Harddisk Serial Binding
              </div>
            </div>
          </div>

          {!isExpiredLockout && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* 📥 BAGIAN 1: KHUSUS SEKOLAH / PEMBELI (INPUT KODE LISENSI) */}
        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          
          {isExpiredLockout ? (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fb7185', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} /> Waktu Trial 30 Hari Telah Habis
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
                Masa percobaan 30 hari telah selesai. Masukkan **Kode Lisensi Pro** dari Vendor/Pengembang untuk membuka kembali aplikasi secara permanen.
              </div>
            </div>
          ) : currentLicenseType === 'trial' ? (
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
                Sisa Masa Percobaan: <strong>{daysRemaining} Hari Lagi</strong>.
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
                <CheckCircle2 size={16} /> Lisensi Pro HID Aktif Selamanya (Full Version)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                Terdaftar Resmi Khusus Untuk: <strong>{schoolName}</strong> ({schoolEmail})
              </div>
            </div>
          )}

          {/* DYNAMIC SCHOOL REGISTRATION ID DISPLAY BIND TO HARDWARE HARDDISK SERIAL */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🏫 STEP 1: ID REGISTRASI HARDWARE HID LAPTOP SEKOLAH ANDA:
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={14} color="#34d399" /> Serial Harddisk Physical (HID): <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{hddSerial || 'Mengambil HID Harddisk...'}</strong>
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
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📥 STEP 2: PASTE KODE LISENSI PRO DARI VENDOR DI SINI
            </label>
            <input 
              type="text" 
              className="form-input"
              value={keyInput}
              onChange={e => {
                setKeyInput(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Tempelkan Kode Lisensi Pro di sini (Contoh: PRO-SDIT-...)..."
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
            {!isExpiredLockout && (
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Tutup
              </button>
            )}
            <button type="submit" className="btn btn-emerald" style={{ flex: 1 }}>
              <KeyRound size={16} /> Aktifkan Lisensi Pro
            </button>
          </div>

        </form>

        {/* 🛠️ BAGIAN 2: KHUSUS ANDA / PEMILIK SOFTWARE (TOOL PEMBUAT KODE) */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowVendorPasscodeForm(!showVendorPasscodeForm)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Lock size={12} /> {showVendorPasscodeForm ? 'Tutup Area Pengembang' : '👑 Generator Kunci Khusus Anda (Pemilik Software)'}
          </button>

          {showVendorPasscodeForm && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(30, 41, 59, 0.95)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px dashed #3b82f6',
              textAlign: 'left'
            }}>
              {!isVendorUnlocked ? (
                <form onSubmit={handleUnlockVendorTool}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fb7185', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Masukkan Passcode Rahasia Vendor Anda
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
                      placeholder="Masukkan Passcode Vendor Rahasia..."
                      style={{ fontSize: '0.8rem' }}
                      required
                    />
                    <button type="submit" className="btn btn-rose" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      Buka Tool Generator
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
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> TOOL MEMBUAT KODE LISENSI BERSAMA (PEMILIK SOFTWARE)
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0 0 8px 0' }}>
                    Paste <strong>ID Registrasi Sekolah Pembeli</strong> (ID di STEP 1 milik laptop pembeli) di bawah ini untuk membikin Kode Lisensi Pro mereka:
                  </p>

                  <form onSubmit={handleGenerateVendorKey} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={vendorSchoolIdInput}
                      onChange={e => setVendorSchoolIdInput(e.target.value)}
                      placeholder="Paste ID Pembeli (Misal: ID-SDIT-XQ70BR)..."
                      style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                    <button type="submit" className="btn btn-emerald" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      Bikin Kode Lisensi
                    </button>
                  </form>

                  {generatedVendorKey && (
                    <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #10b981' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>KODE LISENSI PRO HASIL BUATAN ANDA (BERIKAN KE PEMBELI):</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#34d399', fontSize: '0.88rem', fontFamily: 'var(--font-mono)', fontWeight: 800, wordBreak: 'break-all' }}>
                          {generatedVendorKey}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyVendorKey}
                          className="btn btn-emerald"
                          style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                        >
                          {isVendorKeyCopied ? 'Tersalin!' : 'Copy Kode'}
                        </button>
                      </div>
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
