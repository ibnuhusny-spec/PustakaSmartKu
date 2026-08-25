import React, { useState, useRef } from 'react';
import { Printer, X, CreditCard, Cpu, Sparkles, ShieldCheck, Download, MapPin, UserCheck, Layout } from 'lucide-react';

export default function CardPrinterModal({ isOpen, onClose, member, settings }) {
  const cardRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(settings?.cardTemplate || 'school_luxury');

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  const idLabelText = settings?.idFieldLabel || 'NISN / NIP';
  const classLabelText = settings?.classFieldLabel || 'Peran / Kelas';

  // Convert HTML Card to HD PNG Image for CorelDraw / Photoshop / Sticker Printing
  const handleDownloadPNG = () => {
    const width = 1011; // High resolution 300 DPI for CR80 card (85.6mm)
    const height = 638;  // High resolution 300 DPI for CR80 card (53.98mm)

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const schoolLogoUrl = settings?.schoolLogoUrl || settings?.logoUrl || '/perpustakaansmart.png';
    const schoolBgUrl = '/sekolah.jpeg';
    const memberAvatarUrl = member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`;

    // Helper to load image as Promise
    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    // Helper function to draw multi-line text without cutting off long addresses!
    const drawMultiLineText = (context, text, x, y, maxWidth, lineHeight, font, fillStyle) => {
      context.font = font;
      context.fillStyle = fillStyle;
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line.trim(), x, currentY);
      return currentY;
    };

    Promise.all([
      loadImage(schoolLogoUrl), 
      loadImage(schoolBgUrl), 
      loadImage(memberAvatarUrl)
    ]).then(([logoImg, bgImg, photoImg]) => {
      
      // Base Card Shape Clipping
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 36);
      ctx.clip();

      // TEMPLATE THEME CONFIGURATIONS
      let accentBorderColor = '#f59e0b';
      let headerTextColor = '#ffffff';
      let libraryTextColor = '#fbbf24';
      let textColor = '#ffffff';
      let subTextColor = '#fbbf24';
      let metaTextColor = '#cbd5e1';
      let chipColor = '#34d399';

      if (selectedTemplate === 'modern_emerald') {
        accentBorderColor = '#10b981';
        libraryTextColor = '#34d399';
        subTextColor = '#34d399';
        chipColor = '#fbbf24';

        const darkOverlay = ctx.createLinearGradient(0, 0, width, height);
        darkOverlay.addColorStop(0, 'rgba(6, 78, 59, 0.92)');
        darkOverlay.addColorStop(0.5, 'rgba(15, 23, 42, 0.90)');
        darkOverlay.addColorStop(1, 'rgba(4, 47, 46, 0.95)');
        ctx.fillStyle = darkOverlay;
        ctx.fillRect(0, 0, width, height);

      } else if (selectedTemplate === 'royal_gold') {
        accentBorderColor = '#eab308';
        libraryTextColor = '#fde047';
        subTextColor = '#fde047';

        const darkOverlay = ctx.createLinearGradient(0, 0, width, height);
        darkOverlay.addColorStop(0, 'rgba(30, 58, 138, 0.94)');
        darkOverlay.addColorStop(0.5, 'rgba(15, 23, 42, 0.92)');
        darkOverlay.addColorStop(1, 'rgba(23, 37, 84, 0.95)');
        ctx.fillStyle = darkOverlay;
        ctx.fillRect(0, 0, width, height);

      } else if (selectedTemplate === 'clean_white') {
        accentBorderColor = '#0284c7';
        headerTextColor = '#0f172a';
        libraryTextColor = '#0369a1';
        textColor = '#0f172a';
        subTextColor = '#0284c7';
        metaTextColor = '#334155';
        chipColor = '#16a34a';

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

      } else {
        // school_luxury (Default)
        if (bgImg) {
          ctx.drawImage(bgImg, 0, 0, width, height);
          const darkOverlay = ctx.createLinearGradient(0, 0, width, height);
          darkOverlay.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
          darkOverlay.addColorStop(0.5, 'rgba(30, 27, 75, 0.85)');
          darkOverlay.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
          ctx.fillStyle = darkOverlay;
          ctx.fillRect(0, 0, width, height);
        } else {
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, '#0f172a');
          gradient.addColorStop(0.5, '#1e1b4b');
          gradient.addColorStop(1, '#1e293b');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      }
      ctx.restore();

      // Card Border Accent Glow
      ctx.strokeStyle = accentBorderColor;
      ctx.lineWidth = 6;
      ctx.roundRect(4, 4, width - 8, height - 8, 32);
      ctx.stroke();

      // --- KOP KARTU HEADER ---
      let headerTextStartX = 40;

      // Draw School Logo if available
      if (logoImg) {
        ctx.drawImage(logoImg, 40, 20, 90, 90);
        headerTextStartX = 145;
      }

      // Kop School Name (Bold & Large)
      ctx.fillStyle = headerTextColor;
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), headerTextStartX, 58);

      // Kop Library Subtitle
      ctx.fillStyle = libraryTextColor;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText((settings?.libraryName || 'PERPUSTAKAAN DIGITAL SMART RFID').toUpperCase(), headerTextStartX, 90);

      // Smart Chip Microchip Label Top Right
      ctx.fillStyle = chipColor;
      ctx.font = 'bold 22px monospace';
      ctx.fillText('⚡ SMART RFID', width - 210, 58);

      // Kop Divider Line (Gold Accent)
      ctx.strokeStyle = accentBorderColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(35, 122);
      ctx.lineTo(width - 35, 122);
      ctx.stroke();

      // --- PRECISE 2.16 x 2.79 cm PHOTO FRAME RATIO ---
      const photoX = 40;
      const photoY = 142;
      const photoW = 260; // 2.16 cm ratio at 300 DPI
      const photoH = 336; // 2.79 cm ratio at 300 DPI (216 : 279 ratio)

      // Photo Frame White & Accent Border
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(photoX, photoY, photoW, photoH, 18);
      ctx.fill();
      ctx.strokeStyle = accentBorderColor;
      ctx.lineWidth = 6;
      ctx.roundRect(photoX, photoY, photoW, photoH, 18);
      ctx.stroke();

      // Draw Photo Inside Frame
      if (photoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX + 4, photoY + 4, photoW - 8, photoH - 8, 14);
        ctx.clip();
        ctx.drawImage(photoImg, photoX + 4, photoY + 4, photoW - 8, photoH - 8);
        ctx.restore();
      } else {
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 65px sans-serif';
        ctx.fillText(member.name.charAt(0), photoX + 98, photoY + 180);
      }

      // --- BALANCED STUDENT INFORMATION (Enlarged Fonts, Zero Empty Space) ---
      const textX = 330;
      let currY = 185;

      // Nama Lengkap Siswa / Guru (Enlarged 42px Bold)
      ctx.fillStyle = textColor;
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(member.name, textX, currY);

      // Custom Class/Role Label
      currY += 45;
      ctx.fillStyle = subTextColor;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, textX, currY);

      // Custom ID Field Label (NISN / NIP / NIS / NIK)
      currY += 40;
      ctx.fillStyle = metaTextColor;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, textX, currY);

      // FULL MULTI-LINE SCHOOL ADDRESS (NEVER CUT OFF!)
      currY += 38;
      const fullAddress = `Alamat : ${settings?.address || 'Jl. Raya Pendidikan No. 45, Jakarta'}`;
      currY = drawMultiLineText(ctx, fullAddress, textX, currY, width - textX - 40, 28, '22px sans-serif', metaTextColor);

      // Status Badge Duta Baca Box Right Side (Enlarged)
      currY += 26;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.roundRect(textX, currY, 410, 48, 12);
      ctx.fill();
      ctx.strokeStyle = accentBorderColor;
      ctx.lineWidth = 2;
      ctx.roundRect(textX, currY, 410, 48, 12);
      ctx.stroke();

      ctx.fillStyle = subTextColor;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`🏆 Duta Baca: ${member.badge || 'Pembaca Baru 🌱'}`, textX + 15, currY + 32);

      // --- BOTTOM FOOTER: RFID UID CODE BAR & ZERO EMPTY SPACE FILL ---
      const footerY = 500;

      // Footer Top Line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(35, footerY);
      ctx.lineTo(width - 35, footerY);
      ctx.stroke();

      // RFID Chip Label
      ctx.fillStyle = metaTextColor;
      ctx.font = 'bold 20px monospace';
      ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 40, footerY + 32);

      // RFID UID Box Badge (Bright Green & Bold Monospace)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.roundRect(40, footerY + 42, 440, 65, 14);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.roundRect(40, footerY + 42, 440, 65, 14);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 46px monospace';
      ctx.fillText(member.rfidUid, 60, footerY + 90);

      // Card Issuer Note Fill (Bottom Right - Eliminates Empty Space)
      ctx.fillStyle = subTextColor;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', width - 440, footerY + 62);

      ctx.fillStyle = metaTextColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('RESI DIGITAL & VALIDASI CHIP OK', width - 440, footerY + 92);

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
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        
        <div className="modal-header no-print">
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard color="#3b82f6" /> Cetak & Download Kartu Pelajar RFID Digital
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body printable-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* TEMPLATE CHOOSER BAR */}
          <div className="no-print" style={{ width: '100%', marginBottom: '16px', background: 'rgba(59, 130, 246, 0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layout size={16} /> Pilih Desain Template Kartu:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedTemplate('school_luxury')}
                className={`btn ${selectedTemplate === 'school_luxury' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                🏫 Luxury School
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('modern_emerald')}
                className={`btn ${selectedTemplate === 'modern_emerald' ? 'btn-emerald' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                🟢 Emerald Glass
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('royal_gold')}
                className={`btn ${selectedTemplate === 'royal_gold' ? 'btn-amber' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                👑 Royal Gold
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('clean_white')}
                className={`btn ${selectedTemplate === 'clean_white' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                ⚪ Clean White
              </button>
            </div>
          </div>

          {/* Credit Card sized ID Badge ON-SCREEN PREVIEW */}
          <div ref={cardRef} style={{
            width: '450px',
            height: '280px',
            borderRadius: '20px',
            backgroundImage: selectedTemplate === 'school_luxury'
              ? `linear-gradient(rgba(15, 23, 42, 0.88), rgba(30, 27, 75, 0.90)), url('/sekolah.jpeg')`
              : selectedTemplate === 'modern_emerald'
              ? `linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #042f2e 100%)`
              : selectedTemplate === 'royal_gold'
              ? `linear-gradient(135deg, #1e3a8a 0%, #0f172a 60%, #172554 100%)`
              : `#ffffff`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: selectedTemplate === 'clean_white' ? '#0f172a' : '#ffffff',
            padding: '18px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
            border: selectedTemplate === 'clean_white' ? '2px solid #0284c7' : '2px solid rgba(245, 158, 11, 0.6)',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderBottom: '2px solid rgba(245, 158, 11, 0.6)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={settings?.schoolLogoUrl || settings?.logoUrl || '/perpustakaansmart.png'} 
                  alt="Logo" 
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: selectedTemplate === 'clean_white' ? '#0f172a' : '#ffffff' }}>
                    {settings?.schoolName || 'SDIT QURRATU A\'YUN AL-ISLAMI'}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: selectedTemplate === 'clean_white' ? '#0369a1' : '#fbbf24', fontWeight: 700 }}>
                    {settings?.libraryName || 'PERPUSTAKAAN DIGITAL SMART RFID'}
                  </div>
                </div>
              </div>
              <Cpu size={22} color={selectedTemplate === 'modern_emerald' ? '#fbbf24' : '#34d399'} title="Smart RFID Microchip" />
            </div>

            {/* Middle Card Content: 2.16 x 2.79 cm Photo + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', zIndex: 1, flex: 1 }}>
              
              {/* 2.16 x 2.79 cm Photo Frame */}
              <div style={{
                width: '108px', // Exact 2.16 x 2.79 cm ratio
                height: '140px',
                borderRadius: '12px',
                border: '3px solid #fbbf24',
                padding: '2px',
                background: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                <img 
                  src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                />
              </div>

              {/* Member Information Details */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: selectedTemplate === 'clean_white' ? '#0f172a' : '#ffffff' }}>
                  {member.name}
                </h4>
                
                <div style={{ fontSize: '0.85rem', color: selectedTemplate === 'clean_white' ? '#0284c7' : '#fbbf24', fontWeight: 800 }}>
                  {classLabelText} : {member.role || 'Siswa'} - {member.classGrade || 'Umum'}
                </div>
                
                <div style={{ fontSize: '0.78rem', color: selectedTemplate === 'clean_white' ? '#334155' : '#cbd5e1', fontWeight: 700 }}>
                  {idLabelText} : <strong>{member.nisn || '00001'}</strong>
                </div>

                {/* MULTI-LINE FULL ADDRESS */}
                <div style={{
                  fontSize: '0.7rem',
                  color: selectedTemplate === 'clean_white' ? '#475569' : '#cbd5e1',
                  lineHeight: '1.3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  Alamat : {settings?.address || 'Jl. Raya Pendidikan No. 45, Jakarta'}
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: selectedTemplate === 'clean_white' ? '#b45309' : '#fbbf24',
                  fontWeight: 800,
                  marginTop: '2px',
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  🏆 {member.badge || 'Pembaca Baru 🌱'}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer with RFID UID Code & Filled Bottom Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderTop: '1px solid rgba(245, 158, 11, 0.4)', paddingTop: '6px' }}>
              <div>
                <div style={{ fontSize: '0.58rem', color: selectedTemplate === 'clean_white' ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>KODE CHIP RFID (UID ANGGOTA)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 900, color: '#34d399', letterSpacing: '1px' }}>
                  {member.rfidUid}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: selectedTemplate === 'clean_white' ? '#0284c7' : '#fbbf24', fontWeight: 800 }}>
                  KARTU ANGGOTA PERPUSTAKAAN
                </div>
                <div style={{ fontSize: '0.58rem', color: selectedTemplate === 'clean_white' ? '#64748b' : '#94a3b8', fontWeight: 700 }}>
                  RESI DIGITAL & VALIDASI CHIP OK
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            ✨ <strong>Template Aktif:</strong> {selectedTemplate} • Label ID: <strong>"{idLabelText}"</strong> • Ukuran Tulisan Diperbesar Rapi Tanpa Area Kosong!
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
