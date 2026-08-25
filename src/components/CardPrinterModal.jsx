import React, { useRef } from 'react';
import { Printer, X, CreditCard, Cpu, Sparkles, ShieldCheck, Download, MapPin, UserCheck } from 'lucide-react';

export default function CardPrinterModal({ isOpen, onClose, member, settings }) {
  const cardRef = useRef(null);

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert HTML Card to HD PNG Image for CorelDraw / Photoshop / Sticker Printing
  const handleDownloadPNG = () => {
    const width = 1011; // High resolution 300 DPI for CR80 card (85.6mm)
    const height = 638;  // High resolution 300 DPI for CR80 card (53.98mm)

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const schoolLogoUrl = settings?.logoUrl || '/perpustakaansmart.png';
    const memberAvatarUrl = member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`;

    // Helper to load image as Promise
    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    Promise.all([loadImage(schoolLogoUrl), loadImage(memberAvatarUrl)]).then(([logoImg, photoImg]) => {
      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.4, '#1e1b4b');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.roundRect(0, 0, width, height, 36);
      ctx.fill();

      // Card Border Glow Accent
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 6;
      ctx.roundRect(4, 4, width - 8, height - 8, 32);
      ctx.stroke();

      // --- KOP KARTU HEADER ---
      let headerTextStartX = 40;

      // Draw School Logo if available
      if (logoImg) {
        ctx.drawImage(logoImg, 40, 25, 80, 80);
        headerTextStartX = 135;
      }

      // Kop School Name (Bold & Large)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), headerTextStartX, 60);

      // Kop Library Subtitle
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText((settings?.libraryName || 'PERPUSTAKAAN DIGITAL SMART RFID').toUpperCase(), headerTextStartX, 90);

      // Smart Chip Microchip Label Top Right
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('⚡ SMART RFID', width - 200, 60);

      // Kop Divider Line
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(35, 120);
      ctx.lineTo(width - 35, 120);
      ctx.stroke();

      // --- 2x3 PROPORTIONAL ENLARGED PHOTO BOX (Left) ---
      const photoX = 40;
      const photoY = 145;
      const photoW = 240; // 2x3 Ratio (240px wide x 340px high)
      const photoH = 340;

      // Photo Frame White & Gold Border
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.stroke();

      // Draw Photo Inside Frame
      if (photoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX + 4, photoY + 4, photoW - 8, photoH - 8, 16);
        ctx.clip();
        ctx.drawImage(photoImg, photoX + 4, photoY + 4, photoW - 8, photoH - 8);
        ctx.restore();
      } else {
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 60px sans-serif';
        ctx.fillText(member.name.charAt(0), photoX + 90, photoY + 180);
      }

      // --- BALANCED STUDENT INFORMATION (Right Side) ---
      const textX = 310;
      let currY = 185;

      // Nama Lengkap Siswa / Guru (Enlarged Bold)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(member.name, textX, currY);

      // Kelas & Jabatan
      currY += 45;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`Peran / Kelas :  ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, textX, currY);

      // NISN
      currY += 40;
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`NISN / NIP       :  ${member.nisn || '00001'}`, textX, currY);

      // Alamat Sekolah / Perpustakaan
      currY += 40;
      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      const addressText = settings?.address || 'Jl. Raya Pendidikan No. 45, Jakarta';
      ctx.fillText(`Alamat           :  ${addressText.length > 35 ? addressText.substring(0, 35) + '...' : addressText}`, textX, currY);

      // Status Badge Duta Baca Box Right Side
      currY += 50;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.roundRect(textX, currY, 400, 50, 12);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.roundRect(textX, currY, 400, 50, 12);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`🏆 Duta Baca: ${member.badge || 'Pembaca Baru 🌱'}`, textX + 15, currY + 33);

      // --- BOTTOM FOOTER: RFID UID CODE BAR ---
      const footerY = 510;

      // Footer Top Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(35, footerY);
      ctx.lineTo(width - 35, footerY);
      ctx.stroke();

      // RFID Chip Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 40, footerY + 35);

      // RFID UID Box Badge (Bright Green & Bold Monospace)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.roundRect(40, footerY + 45, 420, 60, 12);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.roundRect(40, footerY + 45, 420, 60, 12);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 42px monospace';
      ctx.fillText(member.rfidUid, 60, footerY + 90);

      // Card Validity Note Bottom Right
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('KARTU RESMI PERPUSTAKAAN DIGITAL', width - 420, footerY + 80);

      // Trigger High Quality PNG Download
      const link = document.createElement('a');
      const cleanName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kartu_RFID_${cleanName}_${member.rfidUid}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        
        <div className="modal-header no-print">
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Cetak & Download Kartu Pelajar RFID Digital</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body printable-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Credit Card sized ID Badge ON-SCREEN PREVIEW */}
          <div ref={cardRef} style={{
            width: '420px',
            height: '265px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%)',
            color: '#ffffff',
            padding: '16px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            border: '2px solid rgba(59, 130, 246, 0.4)',
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
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            {/* Top Card Header with Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderBottom: '2px solid rgba(96, 165, 250, 0.4)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={settings?.logoUrl || '/perpustakaansmart.png'} 
                  alt="Logo" 
                  style={{ width: '38px', height: '38px', objectFit: 'contain' }} 
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff' }}>
                    {settings?.schoolName || 'SDIT QURRATU A\'YUN AL-ISLAMI'}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#60a5fa', fontWeight: 700 }}>
                    {settings?.libraryName || 'PERPUSTAKAAN DIGITAL SMART RFID'}
                  </div>
                </div>
              </div>
              <Cpu size={20} color="#fbbf24" title="Smart RFID Microchip" />
            </div>

            {/* Middle Card Content: 2x3 Photo + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', zIndex: 1, flex: 1 }}>
              
              {/* 2x3 Enlarged Photo Frame */}
              <div style={{
                width: '95px',
                height: '135px',
                borderRadius: '12px',
                border: '3px solid #fbbf24',
                padding: '2px',
                background: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <img 
                  src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                />
              </div>

              {/* Member Information Details */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#ffffff' }}>
                  {member.name}
                </h4>
                
                <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>
                  {member.role || 'Siswa'}: {member.classGrade || 'Umum'}
                </div>
                
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  NISN / NIP: <strong>{member.nisn || '00001'}</strong>
                </div>

                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Alamat: {settings?.address || 'Jl. Raya Pendidikan No. 45, Jakarta'}
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  color: '#fbbf24',
                  fontWeight: 700,
                  marginTop: '2px',
                  display: 'inline-block'
                }}>
                  🏆 {member.badge || 'Pembaca Baru 🌱'}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer with RFID UID Code */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '6px' }}>
              <div>
                <div style={{ fontSize: '0.55rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>KODE CHIP RFID (UID)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, color: '#34d399', letterSpacing: '1px' }}>
                  {member.rfidUid}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700 }}>
                KARTU RESMI PERPUSTAKAAN
              </div>
            </div>

          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            💡 <strong>Sudah Diperbaiki:</strong> Kop Logo Sekolah tampil jelas, Pasfoto diperbesar (Proporsi 2x3 cm), dan Teks Informasi Siswa ditata Seimbang Rapi 300 DPI untuk Cetak Stiker CorelDraw!
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
