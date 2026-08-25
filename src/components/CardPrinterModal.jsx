import React, { useRef } from 'react';
import { Printer, X, CreditCard, Cpu, Sparkles, ShieldCheck, Download, Image as ImageIcon } from 'lucide-react';

export default function CardPrinterModal({ isOpen, onClose, member, settings }) {
  const cardRef = useRef(null);

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert HTML Card to HD PNG Image for CorelDraw / Photoshop / Sticker Printing
  const handleDownloadPNG = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Use HTML5 Canvas to render high resolution PNG image of the card
    const width = 1011; // High resolution 300 DPI for CR80 card (85.6mm)
    const height = 638;  // High resolution 300 DPI for CR80 card (53.98mm)

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create gradient background matching card theme
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#312e81');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, width, height, 40);
    ctx.fill();

    // Border line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.roundRect(4, 4, width - 8, height - 8, 36);
    ctx.stroke();

    // Top Header: School Name & Subtitle
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText((settings?.schoolName || 'SMA NEGERI 1 SMART LITERACY').toUpperCase(), 40, 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('KARTU TANDA ANGGOTA PERPUSTAKAAN RFID', 40, 92);

    // Microchip Indicator text
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('⚡ SMART CHIP', width - 200, 60);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(width - 40, 115);
    ctx.stroke();

    // Load Member Avatar Image & Draw Photo Frame
    const avatarImg = new Image();
    avatarImg.crossOrigin = 'anonymous';
    avatarImg.onload = () => {
      // Draw Photo Frame
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(40, 140, 190, 240, 24);
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 6;
      ctx.roundRect(40, 140, 190, 240, 24);
      ctx.stroke();

      // Clip and Draw Photo
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(44, 144, 182, 232, 20);
      ctx.clip();
      ctx.drawImage(avatarImg, 44, 144, 182, 232);
      ctx.restore();

      // Draw Member Meta Text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(member.name, 260, 200);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${member.role || 'Siswa'}: ${member.classGrade || 'Umum'}`, 260, 250);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px sans-serif';
      ctx.fillText(`NISN: ${member.nisn || '0051239841'}`, 260, 290);

      // Bottom Section Line
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 440);
      ctx.lineTo(width - 40, 440);
      ctx.stroke();

      // RFID UID Box
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px monospace';
      ctx.fillText('KODE CHIP RFID (UID)', 40, 480);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 38px monospace';
      ctx.fillText(member.rfidUid, 40, 530);

      // Badge Info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('STATUS GELAR', width - 260, 480);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(member.badge || 'Pembaca Aktif ⭐', width - 260, 530);

      // Trigger Download
      const link = document.createElement('a');
      const cleanName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kartu_RFID_${cleanName}_${member.rfidUid}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    avatarImg.onerror = () => {
      // Fallback if image fails to load, generate canvas without image clip
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(40, 140, 190, 240, 24);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(member.name.charAt(0), 115, 270);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(member.name, 260, 200);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${member.role || 'Siswa'}: ${member.classGrade || 'Umum'}`, 260, 250);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 38px monospace';
      ctx.fillText(member.rfidUid, 40, 530);

      const link = document.createElement('a');
      const cleanName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kartu_RFID_${cleanName}_${member.rfidUid}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    avatarImg.src = member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        
        <div className="modal-header no-print">
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Cetak & Download Kartu Pelajar RFID Digital</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body printable-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Credit Card sized ID Badge (85.6mm x 53.98mm ratio) */}
          <div ref={cardRef} style={{
            width: '360px',
            height: '225px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            color: '#ffffff',
            padding: '18px',
            position: 'relative',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}>
            {/* Glossy Overlay */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            {/* Top Card Header with School Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {settings?.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#818cf8' }}>
                    {settings?.schoolName || 'SMA NEGERI 1 SMART LITERACY'}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                    KARTU TANDA ANGGOTA PERPUSTAKAAN RFID
                  </div>
                </div>
              </div>
              <Cpu size={22} color="#fbbf24" title="Smart RFID Microchip" />
            </div>

            {/* Middle Card Content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', zIndex: 1 }}>
              {/* Photo */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                border: '2px solid #6366f1',
                padding: '2px',
                background: '#ffffff',
                flexShrink: 0
              }}>
                <img 
                  src={member.avatar}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                />
              </div>

              {/* Member Meta */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#f8fafc' }}>
                  {member.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {member.role}: {member.classGrade}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  NISN: {member.nisn || '0051239841'}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
              <div>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase' }}>RFID UID CODE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: '#34d399', letterSpacing: '1px' }}>
                  {member.rfidUid}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>DUTA BACA</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24' }}>
                  {member.badge || 'Pembaca Aktif ⭐'}
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            💡 <strong>Untuk Cetak Kertas Stiker & CorelDraw:</strong> Klik tombol hijau <strong>"Download Gambar Kartu (PNG HD)"</strong> untuk mengunduh gambar kartu resolusi tinggi 300 DPI, lalu tarik (*drag & drop*) ke CorelDraw/Photoshop!
          </div>

        </div>

        <div className="modal-footer no-print" style={{ gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          
          <button className="btn btn-emerald" onClick={handleDownloadPNG}>
            <Download size={16} /> Download Gambar Kartu (PNG HD CorelDraw)
          </button>

          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Langsung (Printer PVC)
          </button>
        </div>

      </div>
    </div>
  );
}
