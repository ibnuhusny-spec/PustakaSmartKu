import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  CreditCard, 
  Printer, 
  Radio, 
  Edit, 
  Trash2, 
  X, 
  DollarSign, 
  FileSpreadsheet, 
  Download, 
  Upload,
  CheckCircle2
} from 'lucide-react';
import { saveMember, deleteMember, updateMemberBalance, importMembersCSV, clearAllData } from '../services/db';
import { playSoundEffect } from '../services/audioService';

export default function MembersView({ 
  members, 
  onRefreshData, 
  onOpenCardPrinter, 
  prefilledUidToRegister,
  onClearPrefilledUid 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [selectedMemberForTopup, setSelectedMemberForTopup] = useState(null);
  const [topupAmount, setTopupAmount] = useState(10000);
  const [csvText, setCsvText] = useState('');
  const [scanNotification, setScanNotification] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    rfidUid: '',
    name: '',
    role: 'Siswa',
    classGrade: 'X MIPA 1',
    nisn: '',
    email: '',
    phone: '081234567890',
    balance: 10000,
  });

  // Listen to global RFID scan event when Add Member modal is open
  useEffect(() => {
    const handleRfidScanInModal = (e) => {
      const { rfidUid } = e.detail;
      if (isAddModalOpen && rfidUid) {
        setFormData(prev => ({ ...prev, rfidUid: rfidUid }));
        playSoundEffect('scan');
        setScanNotification(`Kode UID Kartu ${rfidUid} berhasil dibaca!`);
        setTimeout(() => setScanNotification(null), 4000);
      }
    };

    window.addEventListener('rfid-scanned', handleRfidScanInModal);
    return () => window.removeEventListener('rfid-scanned', handleRfidScanInModal);
  }, [isAddModalOpen]);

  // Handle prefilled UID from Kiosk View
  useEffect(() => {
    if (prefilledUidToRegister) {
      setFormData({
        id: '',
        rfidUid: prefilledUidToRegister,
        name: '',
        role: 'Siswa',
        classGrade: 'X MIPA 1',
        nisn: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        email: '',
        phone: '081234567890',
        balance: 10000,
      });
      setIsAddModalOpen(true);
      if (onClearPrefilledUid) onClearPrefilledUid();
    }
  }, [prefilledUidToRegister]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.classGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.rfidUid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = (memberToEdit = null) => {
    if (memberToEdit) {
      setFormData({ ...memberToEdit });
    } else {
      setFormData({
        id: '',
        rfidUid: '',
        name: '',
        role: 'Siswa',
        classGrade: 'X MIPA 1',
        nisn: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        email: '',
        phone: '081234567890',
        balance: 10000,
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.rfidUid.trim()) {
      alert('Nama Siswa dan UID RFID wajib diisi! Tempelkan kartu RFID Anda untuk mengisi UID.');
      return;
    }
    saveMember(formData);
    onRefreshData();
    setIsAddModalOpen(false);
    playSoundEffect('success');
    alert(`BERHASIL! Siswa "${formData.name}" dengan Kartu RFID (${formData.rfidUid}) telah terdaftar.`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus anggota ini?')) {
      deleteMember(id);
      onRefreshData();
    }
  };

  const handleClearAllSample = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA ANGGOTA & DUMMY SAMPLE? Data akan dikosongkan agar Anda dapat mengimpor data asli.')) {
      clearAllData();
      onRefreshData();
      alert('Seluruh data sample berhasil dikosongkan! Database siap diimpor.');
    }
  };

  const handleTopup = (e) => {
    e.preventDefault();
    if (!selectedMemberForTopup) return;
    updateMemberBalance(selectedMemberForTopup.id, Number(topupAmount));
    onRefreshData();
    setIsTopupModalOpen(false);
    alert(`Berhasil isi saldo Rp ${Number(topupAmount).toLocaleString('id-ID')} untuk ${selectedMemberForTopup.name}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      alert('Silakan pilih file CSV/Excel atau tempelkan teks CSV!');
      return;
    }
    try {
      const count = importMembersCSV(csvText);
      onRefreshData();
      setIsImportModalOpen(false);
      setCsvText('');
      alert(`BERHASIL! ${count} data siswa dari aplikasi presensi Anda telah diimpor dan terdaftar di perpustakaan!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "Nama,Kelas,RFID_UID,NISN,Saldo\n" +
      "Ahmad Fauzi,XII IPA 1,RFID-1001,0051239841,25000\n" +
      "Siti Rahmawati,XI IPS 2,RFID-1002,0068741235,15000\n" +
      "Budi Santoso,X MIPA 3,RFID-1003,0071122334,5000\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_siswa_rfid.csv';
    a.click();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      <div className="glass-card" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users color="#3b82f6" /> Managemen Anggota & Integrasi Data Presensi RFID
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Impor data siswa dari aplikasi presensi Anda via CSV/Excel atau daftarkan kartu RFID baru.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-emerald">
              <FileSpreadsheet size={16} /> Import Data Presensi Siswa (CSV/Excel)
            </button>
            <button onClick={() => handleOpenAdd()} className="btn btn-primary">
              <Plus size={16} /> Registrasi Anggota RFID Baru
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Cari nama anggota, kelas, NISN, atau RFID UID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <button onClick={handleClearAllSample} className="btn btn-rose" style={{ fontSize: '0.8rem' }}>
            <Trash2 size={14} /> Kosongkan Data Sample
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Foto & Nama Siswa</th>
                <th style={{ padding: '12px' }}>Peran / Kelas</th>
                <th style={{ padding: '12px' }}>RFID UID</th>
                <th style={{ padding: '12px' }}>Saldo RFID</th>
                <th style={{ padding: '12px' }}>Poin Membaca</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Aksi Pustakawan</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Belum ada data siswa terdaftar. Klik tombol <strong>"+ Registrasi Anggota RFID Baru"</strong> atau <strong>"Import Data Presensi Siswa (CSV/Excel)"</strong> untuk menambah siswa!
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={m.avatar} alt={m.name} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b' }} />
                      <div>
                        <div>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NISN: {m.nisn}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${m.role === 'Guru' ? 'badge-purple' : 'badge-blue'}`}>{m.classGrade}</span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 700 }}>
                      {m.rfidUid}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>
                      Rp {m.balance.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#fbbf24' }}>
                      {m.points} pts
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => { setSelectedMemberForTopup(m); setIsTopupModalOpen(true); }}
                          className="btn btn-emerald"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                          title="Top-up Saldo Kartu"
                        >
                          <DollarSign size={14} /> Top-Up
                        </button>
                        <button 
                          onClick={() => onOpenCardPrinter(m)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                          title="Cetak Kartu RFID"
                        >
                          <Printer size={14} /> Kartu
                        </button>
                        <button 
                          onClick={() => handleOpenAdd(m)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="btn btn-rose"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* IMPORT MEMBERS CSV MODAL */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet color="#10b981" /> Import Data Siswa dari Aplikasi Presensi RFID
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <div className="modal-body">
              
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Unggah file **CSV / Excel** hasil export dari aplikasi presensi RFID Anda. Kolom yang dibutuhkan minimal memiliki judul **`Nama`** dan **`RFID`** (atau UID).
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button onClick={downloadSampleCSV} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                  <Download size={14} /> Download Format Contoh CSV
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Pilih File CSV / Excel (.csv)</label>
                <input 
                  type="file" 
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Atau Paste / Tempelkan Isi Teks CSV Di Sini:</label>
                <textarea 
                  className="form-textarea"
                  rows="5"
                  placeholder="Nama,Kelas,RFID_UID,NISN&#10;Ahmad Fauzi,XII IPA 1,0004928120,0051239841..."
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Batal</button>
              <button className="btn btn-emerald" onClick={handleProcessImport}>
                <Upload size={16} /> Impor Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL (STAYS OPEN SECURELY) */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Form Registrasi Anggota RFID</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Radio size={20} color="#60a5fa" className="rfid-pulse" />
                  <span><strong>Panduan:</strong> Tempelkan kartu RFID Anda pada reader sekarang, nomor UID akan terisi otomatis di bawah!</span>
                </div>

                {scanNotification && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> {scanNotification}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">RFID UID Code (Tempel Kartu Anda) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.rfidUid}
                    onChange={e => setFormData({ ...formData, rfidUid: e.target.value })}
                    placeholder="Tempelkan kartu RFID Anda ke alat..."
                    required
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Lengkap Siswa / Guru *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ketik Nama Siswa..."
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Peran</label>
                    <select 
                      className="form-select"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Siswa">Siswa</option>
                      <option value="Guru">Guru</option>
                      <option value="Staf">Staf Perpustakaan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kelas / Jabatan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.classGrade}
                      onChange={e => setFormData({ ...formData, classGrade: e.target.value })}
                      placeholder="Contoh: XII IPA 1"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NISN / NIP</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.nisn}
                      onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Saldo Awal RFID (Rp)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.balance}
                      onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="button" className="btn btn-emerald" onClick={handleSave}>Simpan Anggota Baru</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP-UP SALDO MODAL */}
      {isTopupModalOpen && selectedMemberForTopup && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Top-Up Saldo E-Wallet RFID</h3>
              <button onClick={() => setIsTopupModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleTopup}>
              <div className="modal-body">
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img src={selectedMemberForTopup.avatar} alt={selectedMemberForTopup.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                  <h4 style={{ margin: '6px 0 2px 0' }}>{selectedMemberForTopup.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Saldo Saat Ini: <strong style={{ color: '#34d399' }}>Rp {selectedMemberForTopup.balance.toLocaleString('id-ID')}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nominal Top-Up Saldo (Rp)</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={topupAmount}
                    onChange={e => setTopupAmount(Number(e.target.value))}
                    step="5000"
                    min="1000"
                    required
                    style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {[10000, 20000, 50000, 100000].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTopupAmount(amt)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    >
                      +Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsTopupModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-emerald">Isi Saldo Sekarang</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
