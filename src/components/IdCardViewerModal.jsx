import React from 'react';
import { FileText, X, Download, Printer, ShieldCheck, UserCheck, Calendar, Phone, Mail, Award } from 'lucide-react';

export default function IdCardViewerModal({ isOpen, onClose, member }) {
  if (!isOpen || !member) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dokumen Identitas KTP / Kartu Pelajar - ${member.name}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; text-align: center; color: #0f172a; }
            .card { border: 2px solid #0f172a; padding: 20px; border-radius: 12px; max-width: 650px; margin: 0 auto; }
            h2 { margin: 0 0 4px 0; color: #1e3a8a; }
            p { margin: 2px 0 16px 0; font-size: 0.9rem; color: #475569; }
            img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #cbd5e1; }
            .meta { display: flex; justify-content: space-between; text-align: left; margin-top: 16px; font-size: 0.85rem; background: #f8fafc; padding: 12px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>MAKTABAH AL-QIRO'AH - BERKAS DOKUMEN IDENTITAS ANGGOTA</h2>
            <p>Verifikasi Resmi Anggota Perpustakaan RFID Sekolah</p>
            <img src="${member.idCardUrl}" alt="KTP / Kartu Identitas ${member.name}" />
            <div class="meta">
              <div>
                <strong>Nama Anggota:</strong> ${member.name}<br/>
                <strong>Peran / Kelas:</strong> ${member.role} - ${member.classGrade || '-'}<br/>
                <strong>NISN / NIP:</strong> ${member.nisn || '-'}
              </div>
              <div>
                <strong>Kode RFID:</strong> ${member.rfidUid || '-'}<br/>
                <strong>Telepon:</strong> ${member.phone || '-'}<br/>
                <strong>Tgl Terdaftar:</strong> ${member.registeredAt || '-'}
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!member.idCardUrl) return;
    const a = document.createElement('a');
    a.href = member.idCardUrl;
    a.download = `Dokumen_KTP_Identitas_${member.name.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ zIndex: 1350 }}
    >
      <div 
        className="modal-container glass-card" 
        style={{ maxWidth: '650px', width: '92%', padding: '24px', borderRadius: '20px' }}
      >
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--primary-color)',
              flexShrink: 0
            }}>
              <img 
                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`} 
                alt={member.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {member.name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>{member.role || 'Siswa'}</span>
                <span>{member.classGrade || 'Umum'}</span>
                {member.nisn && <span>• NISN/NIP: <strong>{member.nisn}</strong></span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Security Alert Banner */}
        <div style={{
          margin: '16px 0 12px 0',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>Berkas Dokumen Identitas Resmi tersimpan di Database SQLite Server Perpustakaan.</span>
        </div>

        {/* Document Preview Box */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {member.idCardUrl ? (
            <img 
              src={member.idCardUrl} 
              alt={`Scan KTP / Kartu Identitas ${member.name}`}
              style={{
                maxWidth: '100%',
                maxHeight: '380px',
                borderRadius: '10px',
                objectFit: 'contain',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '30px' }}>
              <FileText size={44} style={{ opacity: 0.5, marginBottom: '10px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Belum Ada Berkas KTP / Kartu Identitas</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Klik tombol "Edit Anggota" untuk memfoto atau mengunggah KTP anggota ini.</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '18px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Tutup
          </button>
          
          {member.idCardUrl && (
            <>
              <button 
                type="button"
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Download size={15} /> Unduh Berkas
              </button>
              <button 
                type="button"
                onClick={handlePrint}
                className="btn btn-primary"
                style={{ borderRadius: '10px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800 }}
              >
                <Printer size={16} /> Cetak Berkas
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
