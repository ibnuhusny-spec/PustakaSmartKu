import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RefreshCw, Volume2, ShieldCheck, Database, MapPin, Radio, Award, Image as ImageIcon, FolderOpen, Sparkles, Building2, Layout, Tag, FileText } from 'lucide-react';
import { saveSettings, exportData, importData, resetToDefault } from '../services/db';

export default function SettingsView({ settings, onRefreshData, onReplaySplash }) {
  const [formData, setFormData] = useState({ ...settings });
  const [importJsonText, setImportJsonText] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(formData);
    onRefreshData();
    alert('Pengaturan sekolah, logo instansi, & sistem perpustakaan berhasil disimpan!');
  };

  // Compress and save dedicated School Logo image (Logo Instansi Sekolah)
  const handleSchoolLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
        setFormData(prev => ({ ...prev, schoolLogoUrl: compressedDataUrl, logoUrl: compressedDataUrl }));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_PustakaSmart_RFID_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // File Upload Handler for Importing Backup JSON directly from computer file
  const handleJsonFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const jsonContent = evt.target.result;
      const success = importData(jsonContent);
      if (success) {
        onRefreshData();
        alert('🎉 BERHASIL! Seluruh data ribuan buku, anggota, presensi, & transaksi berhasil dipulihkan total!');
      } else {
        alert('❌ Gagal mengimpor data. File cadangan JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importData(importJsonText);
    if (success) {
      onRefreshData();
      alert('🎉 BERHASIL! Data database berhasil dipulihkan!');
      setImportJsonText('');
    } else {
      alert('❌ Gagal mengimpor data. Format JSON tidak valid.');
    }
  };

  const handleReset = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke setelan pabrik (Default)?')) {
      resetToDefault();
      onRefreshData();
      alert('Sistem berhasil direset ke data default.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      
      <form onSubmit={handleSave}>
        <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings color="#3b82f6" /> Pengaturan Identitas Sekolah, Logo, & Sistem Perpustakaan
            </h2>

            {onReplaySplash && (
              <button 
                type="button" 
                onClick={onReplaySplash} 
                className="btn btn-emerald"
                style={{ fontSize: '0.82rem' }}
              >
                <Sparkles size={16} /> ✨ Putar Ulang Splash Screen
              </button>
            )}
          </div>

          {/* DEDICATED SCHOOL LOGO UPLOAD SECTION */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            marginBottom: '20px'
          }}>
            <label className="form-label" style={{ color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', margin: 0 }}>
              <Building2 size={20} /> Upload Logo Resmi Sekolah / Yayasan Anda *
            </label>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 14px 0' }}>
              Upload logo sekolah Anda (misal Logo SDIT Qurratu A'yun Al-Islami / Logo Sekolah Anda). Logo sekolah ini akan <strong>dicetak otomatis pada Kop Kartu Pelajar RFID & Struk Peminjaman Buku!</strong>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              
              {/* Logo Preview Frame */}
              <div style={{ 
                width: '85px', 
                height: '85px', 
                borderRadius: '14px', 
                background: '#1e293b', 
                border: '2px dashed #fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}>
                {formData.schoolLogoUrl || formData.logoUrl ? (
                  <img src={formData.schoolLogoUrl || formData.logoUrl} alt="Logo Sekolah" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                ) : (
                  <ImageIcon size={32} color="#fbbf24" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <label 
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '10px 18px' }}
                >
                  <FolderOpen size={18} />
                  <span>Pilih & Upload File Logo Sekolah dari Komputer/HP...</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleSchoolLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.schoolLogoUrl || ''}
                    onChange={e => setFormData({ ...formData, schoolLogoUrl: e.target.value, logoUrl: e.target.value })}
                    placeholder="Atau paste link URL gambar logo sekolah..."
                    style={{ fontSize: '0.82rem' }}
                  />
                  {formData.schoolLogoUrl && (
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, schoolLogoUrl: '', logoUrl: '/perpustakaansmart.png' })}
                      className="btn btn-rose"
                      style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      Reset Logo
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* CUSTOM CARD TEMPLATE & LABEL BIODATA SECTION */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={18} /> Pengaturan Desain Template & Label Biodata Kartu RFID
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label" style={{ color: '#60a5fa' }}>Pilihan Desain Arsitektur Template Kartu</label>
                <select
                  className="form-select"
                  value={formData.cardTemplate || 'clean_corporate'}
                  onChange={e => setFormData({ ...formData, cardTemplate: e.target.value })}
                >
                  <option value="clean_corporate">⚪ Pristine White Corporate (Nuansa Putih Dominan Kontras Tinggi)</option>
                  <option value="school_luxury">🏫 Gedung Sekolah Luxury (Kop Horisontal + Background Gedung + Emas)</option>
                  <option value="royal_gold">👑 Royal Gold Emblem (Bingkai Emas & Segel Sertifikat)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#60a5fa' }}>Label Item Biodata ID (Contoh: NISN / NIP / NIS / NIK / ID PEGAWAI)</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formData.idFieldLabel || 'NISN / NIP'}
                  onChange={e => setFormData({ ...formData, idFieldLabel: e.target.value })}
                  placeholder="Contoh: NISN / NIP atau NIS atau ID PEGAWAI..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#60a5fa' }}>Label Item Peran / Kelas (Contoh: Peran / Kelas / Divisi)</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formData.classFieldLabel || 'Peran / Kelas'}
                  onChange={e => setFormData({ ...formData, classFieldLabel: e.target.value })}
                  placeholder="Contoh: Peran / Kelas atau Jabatan / Divisi..."
                />
              </div>

            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            <div className="form-group">
              <label className="form-label">Nama Sekolah *</label>
              <input 
                type="text"
                className="form-input"
                value={formData.schoolName}
                onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="Contoh: SDIT Qurratu A'yun Al-Islami"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama Perpustakaan *</label>
              <input 
                type="text"
                className="form-input"
                value={formData.libraryName}
                onChange={e => setFormData({ ...formData, libraryName: e.target.value })}
                placeholder="Contoh: Maktabah Al-Qiro'ah"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="#f59e0b" /> Alamat Sekolah (Baris 1: Jalan / Dusun / Kelurahan) *
              </label>
              <input 
                type="text"
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Contoh: Jalan Poros Makassar - Maros Km. 26 Maccopa"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa' }}>
                <MapPin size={16} /> Alamat Sekolah (Baris 2: Kota / Kabupaten / Provinsi)
              </label>
              <input 
                type="text"
                className="form-input"
                value={formData.cityAddress || ''}
                onChange={e => setFormData({ ...formData, cityAddress: e.target.value })}
                placeholder="Contoh: Kabupaten Maros, Sulawesi Selatan"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tarif Denda Per Hari (Rp)</label>
              <input 
                type="number"
                className="form-input"
                value={formData.finePerDay}
                onChange={e => setFormData({ ...formData, finePerDay: Number(e.target.value) })}
                step="500"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Durasi Peminjaman Standar (Hari)</label>
              <input 
                type="number"
                className="form-input"
                value={formData.maxLoanDays}
                onChange={e => setFormData({ ...formData, maxLoanDays: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maksimal Pinjam Buku Per Siswa</label>
              <input 
                type="number"
                className="form-input"
                value={formData.maxBooksPerStudent}
                onChange={e => setFormData({ ...formData, maxBooksPerStudent: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <Award size={16} /> Batas Maksimal Presensi Berpoin Per Hari (Poin Anti-Spam)
              </label>
              <select 
                className="form-select"
                value={formData.maxDailyAttendancePoints || 1}
                onChange={e => setFormData({ ...formData, maxDailyAttendancePoints: Number(e.target.value) })}
              >
                <option value={1}>1 Kali Per Hari (+5 Poin Maksimal / Hari)</option>
                <option value={2}>2 Kali Per Hari (+10 Poin Maksimal / Hari)</option>
                <option value={3}>3 Kali Per Hari (+15 Poin Maksimal / Hari)</option>
                <option value={999}>Tanpa Batas (Bisa Berpoin Setiap Kunjungan)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Fitur Presensi Otomatis & Suara</label>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input 
                    type="checkbox"
                    checked={formData.autoAttendanceOnTap}
                    onChange={e => setFormData({ ...formData, autoAttendanceOnTap: e.target.checked })}
                  />
                  <span>Presensi Otomatis Saat Tap Kartu di Tab Mana Saja (Auto Attendance)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input 
                    type="checkbox"
                    checked={formData.enableVoice}
                    onChange={e => setFormData({ ...formData, enableVoice: e.target.checked })}
                  />
                  <span>Indonesian Voice TTS (Suara Sambutan)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input 
                    type="checkbox"
                    checked={formData.enableSoundFX}
                    onChange={e => setFormData({ ...formData, enableSoundFX: e.target.checked })}
                  />
                  <span>Sound FX Beep</span>
                </label>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={16} /> Simpan Pengaturan Sekolah
            </button>
          </div>

        </div>
      </form>

      {/* BACKUP & RESTORE DATABASE CARD WITH DIRECT FILE UPLOAD */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database color="#10b981" /> Cadangan & Pemulihan Data Anti-Hilang (Offline Backup JSON)
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Seluruh data buku, anggota, presensi, & transaksi tersimpan aman secara otomatis di browser lokal Anda (*IndexedDB/LocalStorage*). Untuk mengamankan data jika laptop rusak/di-install ulang, Anda cukup mengunduh file cadangan <strong>Backup JSON</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Export Box */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> 1. Amankan / Download Backup File
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '16px' }}>
              Unduh seluruh file data ribuan buku, anggota, & transaksi ke file JSON. Simpan di <strong>Flashdisk atau Google Drive</strong> Anda.
            </p>
            <button onClick={handleExport} className="btn btn-emerald" style={{ width: '100%', padding: '10px' }}>
              <Download size={16} /> Download Backup JSON Sekarang
            </button>
          </div>

          {/* Import Box */}
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> 2. Pulihkan / Import Data File
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '12px' }}>
              Pilih file <code>Backup_PustakaSmart_....json</code> dari Flashdisk/Laptop Anda untuk memulihkan seluruh data dalam 2 detik:
            </p>

            <label 
              className="btn btn-primary"
              style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px' }}
            >
              <FolderOpen size={18} />
              <span>Pilih File Backup JSON dari Komputer...</span>
              <input 
                type="file" 
                accept=".json"
                onChange={handleJsonFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

        </div>

        {/* Reset Factory Settings */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Reset sistem ke data contoh pabrik (Factory Reset)
          </span>
          <button onClick={handleReset} className="btn btn-rose" style={{ fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Reset ke Sample Data
          </button>
        </div>

      </div>

    </div>
  );
}
