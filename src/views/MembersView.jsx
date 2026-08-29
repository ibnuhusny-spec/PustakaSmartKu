import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  CreditCard, 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload,
  PlusCircle,
  Radio,
  Printer,
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { saveMember, deleteMember, clearSampleMembers, updateMemberBalance, importMembersCSV, syncLocalToSqliteServer } from '../services/db';

export default function MembersView({ 
  members, 
  onRefreshData, 
  onOpenCardPrinter,
  prefilledUidToRegister,
  onClearPrefilledUid
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const [globalToast, setGlobalToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, memberId: null, memberName: '', isAll: false });
  const nameInputRef = useRef(null);
  const rfidInputRef = useRef(null);

  const handleClearAllMembers = () => {
    setDeleteConfirm({
      isOpen: true,
      memberId: null,
      memberName: 'SEMUA DATA ANGGOTA',
      isAll: true
    });
  };

  const [topUpData, setTopUpData] = useState({ memberId: '', name: '', amount: 10000 });
  const [formData, setFormData] = useState({
    id: '',
    rfidUid: '',
    name: '',
    role: 'Siswa',
    classGrade: 'X MIPA 1',
    nisn: '',
    email: '',
    phone: '',
    balance: 10000,
    points: 10,
    badge: 'Pembaca Baru 🌱',
    avatar: ''
  });

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.classGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.rfidUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.nisn && m.nisn.includes(searchTerm))
  );

  // Compress local student photo upload to lightweight 20KB thumbnail
  const handleLocalPhotoUpload = (e) => {
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, avatar: compressedDataUrl }));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = () => {
    const robotAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.name || 'Student')}`;
    setFormData(prev => ({ ...prev, avatar: robotAvatar }));
  };

  useEffect(() => {
    const handleGlobalRfidScanInMembers = (e) => {
      if (e.detail && e.detail.rfidUid) {
        const scannedUid = e.detail.rfidUid.toUpperCase();
        setFormData(prev => ({
          ...prev,
          rfidUid: scannedUid,
          id: prev.id || `M-${Math.floor(10000 + Math.random() * 90000)}`
        }));
        setIsImportModalOpen(false);
        setIsTopUpOpen(false);
        setIsModalOpen(true);
      }
    };

    window.addEventListener('rfid-scanned', handleGlobalRfidScanInMembers);
    window.addEventListener('rfid-scan', handleGlobalRfidScanInMembers);
    return () => {
      window.removeEventListener('rfid-scanned', handleGlobalRfidScanInMembers);
      window.removeEventListener('rfid-scan', handleGlobalRfidScanInMembers);
    };
  }, []);

  const handleOpenModal = (member = null) => {
    setIsImportModalOpen(false);
    setIsTopUpOpen(false);
    if (member) {
      setFormData({ ...member });
    } else {
      setFormData({
        id: `M-${Math.floor(10000 + Math.random() * 90000)}`,
        rfidUid: prefilledUidToRegister || '',
        name: '',
        role: 'Siswa',
        classGrade: 'X MIPA 1',
        nisn: '',
        email: '',
        phone: '',
        balance: 10000,
        points: 10,
        badge: 'Pembaca Baru 🌱',
        avatar: ''
      });
    }
    setIsModalOpen(true);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      id: '',
      rfidUid: '',
      name: '',
      role: 'Siswa',
      classGrade: 'X MIPA 1',
      nisn: '',
      email: '',
      phone: '',
      balance: 10000,
      points: 10,
      badge: 'Pembaca Baru 🌱',
      avatar: ''
    });
    if (onClearPrefilledUid) onClearPrefilledUid();
  };

  const checkDuplicateRfid = (rfidUid, currentId) => {
    if (!rfidUid || !members) return null;
    return members.find(m => m.rfidUid && m.rfidUid.trim().toUpperCase() === rfidUid.trim().toUpperCase() && m.id !== currentId);
  };

  const handleSave = async (e, keepOpenForNext = false) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorToast(null);

    if (!formData.name || !formData.name.trim()) {
      setErrorToast('⚠️ Nama Lengkap Siswa / Guru wajib diisi!');
      setTimeout(() => setErrorToast(null), 4000);
      if (nameInputRef.current) nameInputRef.current.focus();
      return false;
    }

    if (!formData.rfidUid || !formData.rfidUid.trim()) {
      setErrorToast('⚠️ Kode Chip RFID (UID) wajib diisi! Tempelkan kartu RFID ke reader.');
      setTimeout(() => setErrorToast(null), 4000);
      if (rfidInputRef.current) rfidInputRef.current.focus();
      return false;
    }

    const cleanRfid = formData.rfidUid.trim().toUpperCase();
    const duplicate = checkDuplicateRfid(cleanRfid, formData.id);
    if (duplicate) {
      setErrorToast(`⚠️ KARTU RFID TERSEBUT SUDAH TERDAFTAR!\nKartu RFID "${cleanRfid}" sudah dimiliki oleh ${duplicate.name} (${duplicate.classGrade}). Silakan tempelkan Kartu RFID FISIK LAIN yang belum terdaftar.`);
      setFormData(prev => ({ ...prev, rfidUid: '' }));
      setTimeout(() => {
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
        }
      }, 50);
      return false;
    }

    const newId = (formData.id && String(formData.id).trim()) ? formData.id : `M-${Math.floor(10000 + Math.random() * 90000)}`;

    const finalAvatar = (formData.avatar && formData.avatar.trim())
      ? formData.avatar.trim()
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`;

    const memberToSave = { ...formData, id: newId, rfidUid: cleanRfid, avatar: finalAvatar };

    await saveMember(memberToSave);
    await syncLocalToSqliteServer();
    onRefreshData();

    if (keepOpenForNext) {
      const currentClass = formData.classGrade;
      setFormData({
        id: `M-${Math.floor(10000 + Math.random() * 90000)}`,
        rfidUid: '',
        name: '',
        role: 'Siswa',
        classGrade: currentClass || 'X MIPA 1',
        nisn: '',
        email: '',
        phone: '',
        balance: 10000,
        points: 10,
        badge: 'Pembaca Baru 🌱',
        avatar: ''
      });
      if (onClearPrefilledUid) onClearPrefilledUid();
      setSuccessToast(`✅ BERHASIL DISIMPAN! Data "${memberToSave.name}" (${memberToSave.classGrade}) telah tersimpan. Silakan tempelkan Kartu RFID / isi nama Siswa berikutnya...`);
      setTimeout(() => setSuccessToast(null), 5000);
      setTimeout(() => {
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
        }
      }, 50);
    } else {
      handleCloseModal();
      setGlobalToast(`BERHASIL! Data anggota "${memberToSave.name}" (${memberToSave.classGrade}) telah tersimpan.`);
      setTimeout(() => setGlobalToast(null), 4000);
    }

    return true;
  };

  const handleDelete = (member) => {
    setDeleteConfirm({
      isOpen: true,
      memberId: member.id,
      memberName: member.name,
      isAll: false
    });
  };

  const handleExecuteDelete = () => {
    if (deleteConfirm.isAll) {
      clearSampleMembers();
    } else if (deleteConfirm.memberId) {
      deleteMember(deleteConfirm.memberId);
    }
    onRefreshData();
    setDeleteConfirm({ isOpen: false, memberId: null, memberName: '', isAll: false });
  };

  const handleOpenTopUp = (member) => {
    setTopUpData({ memberId: member.id, name: member.name, amount: 10000 });
    setIsTopUpOpen(true);
  };

  const handleSaveTopUp = (e) => {
    e.preventDefault();
    if (topUpData.amount <= 0) return;
    updateMemberBalance(topUpData.memberId, topUpData.amount);
    onRefreshData();
    setIsTopUpOpen(false);
    alert(`Isi ulang saldo kartu Rp ${topUpData.amount.toLocaleString('id-ID')} untuk ${topUpData.name} BERHASIL!`);
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
      alert('Silakan pilih file CSV atau tempelkan teks CSV!');
      return;
    }
    try {
      const count = importMembersCSV(csvText);
      onRefreshData();
      setIsImportModalOpen(false);
      setCsvText('');
      alert(`BERHASIL! ${count} data anggota telah berhasil diimpor!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "Nama,RFID,Kelas,NISN,Peran,Saldo\n" +
      "Ahmad Fauzi,RFID-1001,XII IPA 1,0051239841,Siswa,25000\n" +
      "Siti Rahmawati,RFID-1002,XI IPS 2,0068741235,Siswa,15000\n" +
      "Dra. Hj. Nurhayati,RFID-1004,Guru Bahasa Indonesia,197508122001122001,Guru,100000\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_anggota_rfid.csv';
    a.click();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {globalToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={22} />
          <span>{globalToast}</span>
        </div>
      )}

      {/* Registered Unregistered Card Alert Banner */}
      {prefilledUidToRegister && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid #f59e0b',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Radio size={24} color="#f59e0b" />
            <div>
              <strong style={{ color: '#fbbf24' }}>KARTU RFID BARU TERDETEKSI: {prefilledUidToRegister}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Kartu ini belum terdaftar. Klik tombol "+ Daftarkan Kartu Ini Sekarang" untuk menghubungkannya dengan siswa!
              </div>
            </div>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-emerald">
            + Daftarkan Kartu Ini Sekarang
          </button>
        </div>
      )}

      {/* Main Glass Container */}
      <div className="glass-card" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users color="#3b82f6" /> Managemen Anggota, Foto Siswa & Kartu RFID
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Registrasi foto siswa asli, pemetaan chip RFID, top up saldo dompet digital, & cetak kartu ID fisik.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-emerald">
              <FileSpreadsheet size={16} /> Import Data CSV / Excel
            </button>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <UserPlus size={16} /> Registrasi Anggota Baru
            </button>

            {members.length > 0 && (
              <button onClick={handleClearAllMembers} className="btn btn-rose" title="Kosongkan seluruh data anggota dummy">
                <Trash2 size={16} /> Bersihkan Semua Anggota
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Cari nama siswa, kelas, NISN, atau Kode UID Kartu RFID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Foto & Nama Siswa/Guru</th>
                <th style={{ padding: '12px' }}>Kelas / Peran</th>
                <th style={{ padding: '12px' }}>Kode Kartu RFID (UID)</th>
                <th style={{ padding: '12px' }}>Saldo RFID</th>
                <th style={{ padding: '12px' }}>Poin Literasi</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Aksi & Cetak Kartu</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Belum ada data anggota yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={m.avatar} 
                        alt={m.name} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', background: '#1e293b', border: '2px solid var(--border-color)' }} 
                      />
                      <div>
                        <div style={{ fontSize: '0.95rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NISN: {m.nisn || '-'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{m.classGrade}</div>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{m.role}</span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                      {m.rfidUid}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      Rp {(m.balance || 0).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#fbbf24' }}>{m.points || 0} pts</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{m.badge || 'Pembaca Aktif ⭐'}</div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => onOpenCardPrinter(m)}
                          className="btn btn-emerald"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                          title="Cetak Kartu Tanda Anggota RFID PVC"
                        >
                          <Printer size={14} /> Cetak Kartu
                        </button>
                        <button 
                          onClick={() => handleOpenTopUp(m)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                          title="Isi Ulang Saldo Dompet RFID"
                        >
                          <CreditCard size={14} /> Top Up
                        </button>
                        <button 
                          onClick={() => handleOpenModal(m)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(m)}
                          className="btn btn-rose"
                          style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                          title="Hapus Anggota Ini"
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

      {/* TOP UP BALANCE MODAL */}
      {isTopUpOpen && (
        <div className="modal-overlay" onClick={() => setIsTopUpOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard color="#3b82f6" /> Top Up Saldo Kartu RFID
              </h3>
              <button onClick={() => setIsTopUpOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveTopUp}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  Isi ulang saldo dompet RFID untuk: <strong style={{ color: '#34d399' }}>{topUpData.name}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">Nominal Top Up (Rp) *</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={topUpData.amount}
                    onChange={e => setTopUpData({ ...topUpData, amount: Number(e.target.value) })}
                    step="5000"
                    min="1000"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[10000, 20000, 50000, 100000].map(amt => (
                    <button 
                      key={amt} 
                      type="button" 
                      onClick={() => setTopUpData({ ...topUpData, amount: amt })}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', flex: 1 }}
                    >
                      +Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsTopUpOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Saldo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MEMBERS CSV MODAL */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet color="#10b981" /> Import Data Anggota dari CSV / Excel
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={18}/></button>
            </div>
            <div className="modal-body">
              
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Unggah file **CSV / Excel** daftar siswa/guru Anda. Kolom yang dibutuhkan minimal memiliki judul **`Nama`** dan **`RFID`** (kode UID).
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button onClick={downloadSampleCSV} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                  <Download size={14} /> Download Format Contoh CSV Anggota
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
                <label className="form-label">Atau Paste / Tempelkan Teks CSV Di Sini:</label>
                <textarea 
                  className="form-textarea"
                  rows="5"
                  placeholder="Nama,RFID,Kelas,NISN,Peran,Saldo&#10;Ahmad Fauzi,RFID-1001,XII IPA 1,0051239841,Siswa,25000..."
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Batal</button>
              <button className="btn btn-emerald" onClick={handleProcessImport}>
                <Upload size={16} /> Impor Data Anggota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL WITH REAL STUDENT PHOTO UPLOAD */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div 
            className="modal-container" 
            onClick={e => e.stopPropagation()} 
            onMouseDown={e => e.stopPropagation()} 
            style={{ maxWidth: '600px' }}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Form Registrasi Siswa / Guru & Foto Kartu</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                
                {successToast && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    color: '#10b981',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <CheckCircle2 size={20} />
                    <span>{successToast}</span>
                  </div>
                )}

                {errorToast && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <AlertTriangle size={20} />
                    <span style={{ whiteSpace: 'pre-line' }}>{errorToast}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nama Lengkap Siswa / Guru *</label>
                  <input 
                    ref={nameInputRef}
                    type="text" 
                    className="form-input" 
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama siswa..."
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Kode Chip RFID (UID Kartu Fisik) *</span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>⚡ Reader Siap Tempel</span>
                    </label>
                    <input 
                      ref={rfidInputRef}
                      type="text" 
                      className="form-input" 
                      value={formData.rfidUid || ''}
                      onChange={e => setFormData({ ...formData, rfidUid: e.target.value.toUpperCase() })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      placeholder="Tempelkan kartu RFID fisik ke reader..."
                      style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 700 }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kelas / Jabatan Guru *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.classGrade}
                      onChange={e => setFormData({ ...formData, classGrade: e.target.value })}
                      placeholder="Contoh: XII IPA 1 / Guru"
                      required
                    />
                  </div>
                </div>

                {/* REAL STUDENT PHOTO UPLOAD FIELD */}
                <div className="form-group" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '16px' }}>
                  <label className="form-label" style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                    <ImageIcon size={18} /> Upload Foto Asli Siswa / Guru (Untuk Kartu RFID PVC)
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                    
                    {/* Photo Preview */}
                    <div style={{ 
                      width: '70px', 
                      height: '70px', 
                      borderRadius: '50%', 
                      background: '#1e293b', 
                      border: '2px solid #34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Photo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={28} color="#34d399" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <label 
                        className="btn btn-emerald"
                        style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                      >
                        <FolderOpen size={16} />
                        <span>Pilih Foto Asli dari Komputer/HP...</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleLocalPhotoUpload}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={formData.avatar}
                          onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="Atau paste URL foto / buat avatar robot..."
                          style={{ fontSize: '0.78rem' }}
                        />
                        <button 
                          type="button"
                          onClick={handleGenerateAvatar}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          title="Buat Avatar Robot Otomatis"
                        >
                          <Sparkles size={14} /> Avatar Robot
                        </button>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Foto asli yang diunggah akan **otomatis tercetak di Kartu Pelajar RFID**!
                      </div>
                    </div>

                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NISN / NIP</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.nisn}
                      onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                      placeholder="Nomor Induk Siswa..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Peran</label>
                    <select 
                      className="form-select"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Siswa">Siswa</option>
                      <option value="Guru">Guru</option>
                      <option value="Staf / Karyawan">Staf / Karyawan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Saldo Awal Kartu (Rp)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.balance}
                      onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                      step="5000"
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="button" className="btn btn-emerald" onClick={(e) => handleSave(e, true)}>
                  <Sparkles size={16} /> ⚡ Simpan & Lanjut Input Siswa Berikutnya
                </button>
                <button type="button" className="btn btn-primary" onClick={(e) => handleSave(e, false)}>
                  Simpan & Selesai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION REACT MODAL (NO NATIVE BROWSER DIALOG FREEZE) */}
      {deleteConfirm.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ isOpen: false, memberId: null, memberName: '', isAll: false })}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              Konfirmasi Hapus Data
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus <strong>"{deleteConfirm.memberName}"</strong> dari database perpustakaan? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ minWidth: '100px' }}
                onClick={() => setDeleteConfirm({ isOpen: false, memberId: null, memberName: '', isAll: false })}
              >
                Batal
              </button>
              <button 
                type="button"
                className="btn btn-rose"
                style={{ minWidth: '120px' }}
                onClick={handleExecuteDelete}
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
