import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RefreshCw, Volume2, ShieldCheck, Database, MapPin, Radio, Award } from 'lucide-react';
import { saveSettings, exportData, importData, resetToDefault } from '../services/db';

export default function SettingsView({ settings, onRefreshData }) {
  const [formData, setFormData] = useState({ ...settings });
  const [importJsonText, setImportJsonText] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(formData);
    onRefreshData();
    alert('Pengaturan sekolah & sistem perpustakaan berhasil disimpan!');
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

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importData(importJsonText);
    if (success) {
      onRefreshData();
      alert('Data database berhasil dipulihkan!');
      setImportJsonText('');
    } else {
      alert('Gagal mengimpor data. Format JSON tidak valid.');
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
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="#3b82f6" /> Pengaturan Identitas Sekolah & Sistem Perpustakaan
          </h2>

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

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="#f59e0b" /> Alamat Lengkap Sekolah & Perpustakaan (Tampil pada Struk & Kartu) *
              </label>
              <input 
                type="text"
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Contoh: Jl. Raya Pendidikan No. 45, Komplek Masjid, Jakarta..."
                required
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

      {/* BACKUP & RESTORE DATABASE CARD */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database color="#10b981" /> Cadangan & Pemulihan Data (Offline Backup JSON)
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Seluruh data tersimpan aman di browser (*IndexedDB/LocalStorage*). Anda dapat mengekspor atau mengimpor file JSON cadangan kapan saja secara 100% gratis.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Export Box */}
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Download Backup Database</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Unduh seluruh file data buku, siswa, presensi, & transaksi dalam format file JSON.
            </p>
            <button onClick={handleExport} className="btn btn-emerald" style={{ width: '100%' }}>
              <Download size={16} /> Download Backup JSON
            </button>
          </div>

          {/* Import Box */}
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Restore / Import Data</h4>
            <textarea 
              className="form-textarea"
              rows="2"
              placeholder="Paste isi file JSON cadangan di sini..."
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              style={{ fontSize: '0.78rem', marginBottom: '10px' }}
            />
            <button onClick={handleImport} className="btn btn-primary" style={{ width: '100%' }}>
              <Upload size={16} /> Pulihkan Data
            </button>
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
