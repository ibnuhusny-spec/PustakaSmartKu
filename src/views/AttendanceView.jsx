import React, { useState } from 'react';
import { UserCheck, Download, Search, Calendar, Users, Award, Clock, RefreshCw, PlusCircle, X, UserPlus, User, Edit3 } from 'lucide-react';
import { recordAttendance, getMembers } from '../services/db';
import { speakText, playSoundEffect } from '../services/audioService';

export default function AttendanceView({ attendance, onRefreshData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Manual Attendance Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [visitorType, setVisitorType] = useState('member'); // 'member' or 'guest'
  
  // Member Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // Guest Non-Member Form State
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState('Tamu / Pengunjung Umum');
  
  // Purpose State
  const [selectedPurposeOption, setSelectedPurposeOption] = useState('Membaca & Kunjungan Umum');
  const [customPurposeText, setCustomPurposeText] = useState('');

  const members = getMembers();

  const filteredAttendance = attendance.filter(att => {
    const matchesSearch = att.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          att.classGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          att.rfidUid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || att.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Calculate percentage of RFID check-ins vs Manual check-ins
  const totalCheckIns = filteredAttendance.length;
  const rfidCheckIns = filteredAttendance.filter(a => a.purpose.toLowerCase().includes('rfid')).length;
  const rfidPercentage = totalCheckIns > 0 ? Math.round((rfidCheckIns / totalCheckIns) * 100) : 100;

  const handleSaveManualAttendance = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Determine final purpose text
    const finalPurpose = selectedPurposeOption === 'Lainnya' 
      ? (customPurposeText.trim() || 'Kunjungan Khusus') 
      : selectedPurposeOption;
    
    if (visitorType === 'member') {
      if (!selectedMemberId) {
        alert('Silakan pilih nama siswa / anggota terdaftar terlebih dahulu!');
        return;
      }
      const member = members.find(m => m.id === selectedMemberId);
      if (!member) return;

      recordAttendance(member, finalPurpose);
      playSoundEffect('success');
      speakText(`Presensi manual untuk ${member.name} berhasil dicatat.`);
      alert(`Presensi manual untuk ${member.name} (${member.classGrade}) telah berhasil dicatat!`);

    } else {
      // Guest / Non-member visitor
      if (!guestName.trim()) {
        alert('Silakan ketik nama tamu / pengunjung terlebih dahulu!');
        return;
      }

      const guestMemberObj = {
        id: `GUEST-${Date.now().toString().slice(-4)}`,
        rfidUid: 'TAMU-GUEST',
        name: guestName.trim(),
        classGrade: guestRole.trim() || 'Tamu Umum',
        balance: 0,
        points: 0
      };

      recordAttendance(guestMemberObj, `Tamu: ${finalPurpose}`);
      playSoundEffect('success');
      speakText(`Selamat datang di perpustakaan, ${guestName.trim()}. Presensi tamu berhasil dicatat.`);
      alert(`Presensi Tamu Umum untuk "${guestName.trim()}" (${guestRole}) telah berhasil dicatat!`);
    }

    if (onRefreshData) onRefreshData();
    setIsManualModalOpen(false);
    setSelectedMemberId('');
    setGuestName('');
    setCustomPurposeText('');
    setSelectedPurposeOption('Membaca & Kunjungan Umum');
  };

  const exportCSV = () => {
    const headers = ['ID,Nama Siswa/Tamu,Kelas/Peran,RFID UID,Tanggal,Waktu Kunjungan,Tujuan\n'];
    const rows = filteredAttendance.map(a => 
      `"${a.id}","${a.memberName}","${a.classGrade}","${a.rfidUid}","${a.date}","${new Date(a.timestamp).toLocaleTimeString('id-ID')}","${a.purpose}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Presensi_Perpustakaan_${selectedDate || 'Semua_Tanggal'}.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL PENGUNJUNG ({selectedDate ? selectedDate : 'SEMUA WAKTU'})</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="#10b981" /> {filteredAttendance.length} Orang
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>METODE CHIP RFID</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={24} color="#3b82f6" /> {rfidPercentage}% Otomatis
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LOKASI & PERANGKAT</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
            Kios Mandiri RFID / Admin
          </div>
        </div>

      </div>

      {/* Filter & Table Container */}
      <div className="glass-card" style={{ padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck color="#10b981" /> Daftar Presensi Kunjungan Perpustakaan
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Presensi otomatis siswa RFID maupun Tamu Umum / Non-Anggota tersimpan permanen di database.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <PlusCircle size={16} /> + Presensi Manual / Tamu Umum
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <Calendar size={16} color="var(--text-secondary)" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-main)' }}
              />
            </div>

            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                title="Tampilkan riwayat presensi dari seluruh tanggal"
              >
                <RefreshCw size={14} /> Lihat Semua Tanggal
              </button>
            )}

            <button onClick={exportCSV} className="btn btn-emerald" style={{ fontSize: '0.85rem' }}>
              <Download size={16} /> Export Excel / CSV
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Cari nama siswa/tamu, kelas, atau UID RFID..."
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
                <th style={{ padding: '12px' }}>Siswa / Pengunjung</th>
                <th style={{ padding: '12px' }}>Kelas / Instansi</th>
                <th style={{ padding: '12px' }}>Kartu RFID UID</th>
                <th style={{ padding: '12px' }}>Tanggal & Waktu Tap</th>
                <th style={{ padding: '12px' }}>Tujuan Kunjungan</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Belum ada catatan presensi pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(att => (
                  <tr key={att.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(att.memberName)}`}
                        alt={att.memberName}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b' }}
                      />
                      {att.memberName}
                    </td>
                    <td style={{ padding: '12px' }}>{att.classGrade}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: att.rfidUid === 'TAMU-GUEST' ? '#f59e0b' : '#34d399', fontWeight: 600 }}>
                      {att.rfidUid}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      <div>{att.date}</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                        {new Date(att.timestamp).toLocaleTimeString('id-ID')}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${att.purpose.includes('RFID') ? 'badge-blue' : (att.purpose.includes('Tamu') ? 'badge-amber' : 'badge-purple')}`}>
                        {att.purpose}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MANUAL & GUEST ATTENDANCE MODAL - LOCKED OPEN */}
      {isManualModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck color="#3b82f6" /> Form Input Presensi (Siswa / Tamu Umum)
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveManualAttendance}>
              <div className="modal-body">
                
                {/* Tab Selection: Member vs Guest */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setVisitorType('member')}
                    className={`btn ${visitorType === 'member' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    <User size={16} /> Siswa Terdaftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitorType('guest')}
                    className={`btn ${visitorType === 'guest' ? 'btn-emerald' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    <UserPlus size={16} /> Tamu Umum / Non-Anggota
                  </button>
                </div>

                {visitorType === 'member' ? (
                  <>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Pilih siswa dari database jika siswa lupa membawa Kartu RFID Fisiknya.
                    </p>

                    <div className="form-group">
                      <label className="form-label">Pilih Nama Siswa / Anggota *</label>
                      <select 
                        className="form-select"
                        value={selectedMemberId}
                        onChange={e => setSelectedMemberId(e.target.value)}
                        required
                      >
                        <option value="">-- Pilih Nama Siswa dari Daftar --</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.classGrade}) - RFID: {m.rfidUid}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Ketik nama tamu umum / wali murid / pengawas yang berkunjung membaca tanpa perlu mendaftar kartu anggota.
                    </p>

                    <div className="form-group">
                      <label className="form-label">Nama Lengkap Tamu / Pengunjung Umum *</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Bpk. Dr. Ahmad Yani / Ibu Rina"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Instansi / Peran / Keterangan Tamu</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Wali Murid / Pengawas Dinas / Guru Tamu"
                        value={guestRole}
                        onChange={e => setGuestRole(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Purpose Selection with Custom Typed Option */}
                <div className="form-group">
                  <label className="form-label">Tujuan Kunjungan Perpustakaan</label>
                  <select 
                    className="form-select"
                    value={selectedPurposeOption}
                    onChange={e => setSelectedPurposeOption(e.target.value)}
                  >
                    <option value="Membaca & Kunjungan Umum">Membaca & Kunjungan Umum</option>
                    <option value="Studi Banding / Peninjauan">Studi Banding / Peninjauan</option>
                    <option value="Tugas Belajar & Penelitian">Tugas Belajar & Penelitian</option>
                    <option value="Pinjam & Kembalikan Buku">Pinjam & Kembalikan Buku</option>
                    <option value="Lainnya">✍️ Lainnya... (Ketik Sendiri)</option>
                  </select>
                </div>

                {/* Custom Purpose Input Box (Appears when "Lainnya" is chosen) */}
                {selectedPurposeOption === 'Lainnya' && (
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Edit3 size={14} /> Ketik Tujuan Kunjungan Khusus Anda *
                    </label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Rapat Komite Sekolah / Mengembalikan Alat Lab..."
                      value={customPurposeText}
                      onChange={e => setCustomPurposeText(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                )}

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsManualModalOpen(false)}>Batal</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveManualAttendance}>Simpan Presensi</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
