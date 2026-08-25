import React, { useState, useRef } from 'react';
import { Printer, X, CreditCard, Cpu, Sparkles, ShieldCheck, Download, MapPin, UserCheck, Layout, Award } from 'lucide-react';

export default function CardPrinterModal({ isOpen, onClose, member, settings }) {
  const cardRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(settings?.cardTemplate || 'clean_corporate');

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  const idLabelText = settings?.idFieldLabel || 'NISN / NIP';
  const classLabelText = settings?.classFieldLabel || 'Peran / Kelas';

  const line1Address = settings?.address || 'Jalan Poros Makassar - Maros Km. 26 Maccopa';
  const line2Address = settings?.cityAddress || 'Kabupaten Maros, Sulawesi Selatan';

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

    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    // Helper to render photo safely or fallback gracefully
    const drawStudentPhoto = (context, photoImg, pX, pY, pW, pH, strokeColor = '#0284c7') => {
      // 1. Draw solid white container box
      context.fillStyle = '#ffffff';
      context.roundRect(pX, pY, pW, pH, 16);
      context.fill();
      context.strokeStyle = strokeColor;
      context.lineWidth = 3;
      context.roundRect(pX, pY, pW, pH, 16);
      context.stroke();

      // 2. Try drawing student photo
      let photoDrawn = false;
      if (photoImg && photoImg.width > 0) {
        try {
          context.save();
          context.beginPath();
          context.roundRect(pX + 3, pY + 3, pW - 6, pH - 6, 14);
          context.clip();
          context.drawImage(photoImg, pX + 3, pY + 3, pW - 6, pH - 6);
          context.restore();
          photoDrawn = true;
        } catch (err) {
          photoDrawn = false;
        }
      }

      // 3. Fallback Initial Icon if image is empty or cross-origin blocked
      if (!photoDrawn) {
        context.save();
        context.beginPath();
        context.roundRect(pX + 3, pY + 3, pW - 6, pH - 6, 14);
        context.clip();
        
        // Soft blue/emerald background
        context.fillStyle = '#e0f2fe';
        context.fillRect(pX + 3, pY + 3, pW - 6, pH - 6);
        
        // Initial letter
        context.fillStyle = '#0284c7';
        context.font = 'bold 100px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(member.name.charAt(0).toUpperCase(), pX + (pW / 2), pY + (pH / 2));
        context.restore();
        
        // Reset text alignment for subsequent draws
        context.textAlign = 'start';
        context.textBaseline = 'alphabetic';
      }
    };

    Promise.all([
      loadImage(schoolLogoUrl), 
      loadImage(schoolBgUrl), 
      loadImage(memberAvatarUrl)
    ]).then(([logoImg, bgImg, photoImg]) => {
      
      // Base Canvas Background (100% White default)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // TEMPLATE 1: PRISTINE WHITE CORPORATE (Nuansa Putih Dominan Kontras Tinggi)
      // ==========================================
      if (selectedTemplate === 'clean_corporate') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header Divider Line (Royal Blue)
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(35, 118);
        ctx.lineTo(width - 35, 118);
        ctx.stroke();

        // Kop Header Logo + School Name + Library Name
        let textStartX = 45;
        if (logoImg) {
          ctx.drawImage(logoImg, 45, 20, 80, 80);
          textStartX = 145;
        }

        ctx.fillStyle = '#0f172a'; // Extra Dark Navy
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), textStartX, 58);

        ctx.fillStyle = '#0284c7'; // Royal Blue Subtitle
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), textStartX, 88);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('⚡ SMART RFID', width - 210, 58);

        // Bulletproof Photo Frame (2.16x2.79 cm)
        drawStudentPhoto(ctx, photoImg, 45, 138, 255, 330, '#0284c7');

        // Student Information (High-Contrast Dark Navy & Slate)
        const tX = 330;
        let currY = 185;

        // Nama Siswa (Deep Black Navy 42px Bold)
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText(member.name, tX, currY);

        // Peran / Kelas (Vibrant Blue 28px Bold)
        currY += 45;
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, tX, currY);

        // NISN / NIP (Dark Slate 26px Bold)
        currY += 38;
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, tX, currY);

        // Alamat Baris 1 (Dark Slate 22px Bold)
        currY += 36;
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`Alamat 1 : ${line1Address}`, tX, currY);

        // Alamat Baris 2 Kota/Kab (Deep Navy 20px Bold)
        currY += 28;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Kota/Kab : ${line2Address}`, tX, currY);

        // Duta Baca Badge Box
        currY += 30;
        ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
        ctx.roundRect(tX, currY, 420, 48, 12);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.roundRect(tX, currY, 420, 48, 12);
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`🏆 Duta Baca: ${member.badge || 'Pembaca Baru 🌱'}`, tX + 15, currY + 32);

        // Bottom RFID UID & Issuer Footer
        const fY = 500;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(35, fY);
        ctx.lineTo(width - 35, fY);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 45, fY + 32);

        ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
        ctx.roundRect(45, fY + 42, 440, 65, 14);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.roundRect(45, fY + 42, 440, 65, 14);
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 46px monospace';
        ctx.fillText(member.rfidUid, 65, fY + 90);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', width - 440, fY + 62);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('RESI DIGITAL & VALIDASI CHIP OK', width - 440, fY + 92);
      }

      // ==========================================
      // TEMPLATE 2: MODERN VERTICAL SPLIT (DUAL TONE)
      // ==========================================
      else if (selectedTemplate === 'vertical_split') {
        // Left Panel (Dark Emerald Green)
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, 330, height);

        // Right Panel (Pristine White)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(330, 0, width - 330, height);

        // Left Panel Photo Frame (2.16x2.79 cm) BULLETPROOF DRAW
        drawStudentPhoto(ctx, photoImg, 38, 38, 255, 330, '#34d399');

        // Left Panel Gelar Badge
        ctx.fillStyle = '#022c22';
        ctx.roundRect(38, 395, 255, 195, 16);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.roundRect(38, 395, 255, 195, 16);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('STATUS GELAR:', 55, 435);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(member.badge || 'Pembaca Baru 🌱', 55, 475);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('⚡ RFID VERIFIED', 55, 535);

        // Right Panel Kop Header (High Contrast Dark Text)
        let tX = 360;
        if (logoImg) {
          ctx.drawImage(logoImg, 360, 20, 80, 80);
          tX = 455;
        }

        ctx.fillStyle = '#0f172a'; // Dark Navy Title
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), tX, 55);

        ctx.fillStyle = '#059669'; // Emerald Subtitle
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), tX, 85);

        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(360, 118);
        ctx.lineTo(width - 35, 118);
        ctx.stroke();

        // Right Panel Meta Info (High Contrast Dark Text)
        let currY = 185;

        // Nama Siswa
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText(member.name, 360, currY);

        // Peran / Kelas
        currY += 45;
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, 360, currY);

        // NISN / NIP
        currY += 38;
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, 360, currY);

        // Alamat Baris 1
        currY += 36;
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`Alamat 1 : ${line1Address}`, 360, currY);

        // Alamat Baris 2
        currY += 28;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Kota/Kab : ${line2Address}`, 360, currY);

        // RFID UID Box Right Bottom
        currY += 45;
        ctx.fillStyle = 'rgba(5, 150, 105, 0.1)';
        ctx.roundRect(360, currY, 610, 75, 16);
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.roundRect(360, currY, 610, 75, 16);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('RFID CHIP UID:', 380, currY + 28);
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 44px monospace';
        ctx.fillText(member.rfidUid, 380, currY + 62);
      }

      // ==========================================
      // TEMPLATE 3: SCHOOL LUXURY (DARK NAVY)
      // ==========================================
      else if (selectedTemplate === 'school_luxury') {
        if (bgImg) {
          ctx.drawImage(bgImg, 0, 0, width, height);
          const darkOverlay = ctx.createLinearGradient(0, 0, width, height);
          darkOverlay.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
          darkOverlay.addColorStop(0.5, 'rgba(30, 27, 75, 0.90)');
          darkOverlay.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
          ctx.fillStyle = darkOverlay;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
        }

        let textStartX = 45;
        if (logoImg) {
          ctx.drawImage(logoImg, 45, 20, 80, 80);
          textStartX = 145;
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), textStartX, 58);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), textStartX, 88);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('⚡ SMART RFID', width - 210, 58);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(35, 118);
        ctx.lineTo(width - 35, 118);
        ctx.stroke();

        drawStudentPhoto(ctx, photoImg, 45, 138, 255, 330, '#fbbf24');

        const tX = 330;
        let currY = 185;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText(member.name, tX, currY);

        currY += 45;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, tX, currY);

        currY += 38;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, tX, currY);

        currY += 36;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px sans-serif';
        ctx.fillText(`Alamat 1 : ${line1Address}`, tX, currY);

        currY += 28;
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Kota/Kab : ${line2Address}`, tX, currY);

        currY += 30;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.roundRect(tX, currY, 420, 48, 12);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.roundRect(tX, currY, 420, 48, 12);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`🏆 Duta Baca: ${member.badge || 'Pembaca Baru 🌱'}`, tX + 15, currY + 32);

        const fY = 500;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(35, fY);
        ctx.lineTo(width - 35, fY);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 45, fY + 32);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.roundRect(45, fY + 42, 440, 65, 14);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.roundRect(45, fY + 42, 440, 65, 14);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 46px monospace';
        ctx.fillText(member.rfidUid, 65, fY + 90);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', width - 440, fY + 62);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('RESI DIGITAL & VALIDASI CHIP OK', width - 440, fY + 92);
      }

      // ==========================================
      // TEMPLATE 4: ROYAL GOLD DIPLOMA (BLUE & GOLD)
      // ==========================================
      else {
        ctx.fillStyle = '#172554';
        ctx.fillRect(0, 0, width, height);

        if (logoImg) {
          ctx.drawImage(logoImg, 50, 25, 85, 85);
        }

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 30px serif';
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), 155, 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px serif';
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), 155, 90);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(35, 118);
        ctx.lineTo(width - 35, 118);
        ctx.stroke();

        drawStudentPhoto(ctx, photoImg, 45, 138, 255, 330, '#eab308');

        const tX = 330;
        let currY = 185;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText(member.name, tX, currY);

        currY += 45;
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, tX, currY);

        currY += 38;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, tX, currY);

        currY += 36;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px sans-serif';
        ctx.fillText(`Alamat 1 : ${line1Address}`, tX, currY);

        currY += 28;
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Kota/Kab : ${line2Address}`, tX, currY);

        currY += 30;
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.roundRect(tX, currY, 420, 48, 12);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 24px serif';
        ctx.fillText(`👑 ${member.badge || 'Pembaca Utama ⭐'}`, tX + 15, currY + 32);

        const fY = 500;
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(35, fY);
        ctx.lineTo(width - 35, fY);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 46px monospace';
        ctx.fillText(`UID: ${member.rfidUid}`, 45, fY + 70);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 22px serif';
        ctx.fillText('KARTU RESMI ANGGOTA PERPUSTAKAAN', width - 460, fY + 70);
      }

      // ==========================================
      // FINE 1PX CROP GUIDELINES FOR CUTTING STICKERS
      // ==========================================
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.roundRect(1, 1, width - 2, height - 2, 32);
      ctx.stroke();

      // Corner crop marks
      const cLen = 25;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;

      ctx.beginPath(); ctx.moveTo(0, cLen); ctx.lineTo(0, 0); ctx.lineTo(cLen, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - cLen, 0); ctx.lineTo(width, 0); ctx.lineTo(width, cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, height - cLen); ctx.lineTo(0, height); ctx.lineTo(cLen, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - cLen, height); ctx.lineTo(width, height); ctx.lineTo(width, height - cLen); ctx.stroke();

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
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        
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
              <Layout size={16} /> Pilih Desain Arsitektur Template Kartu:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedTemplate('clean_corporate')}
                className={`btn ${selectedTemplate === 'clean_corporate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                ⚪ Pristine White Corporate
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('vertical_split')}
                className={`btn ${selectedTemplate === 'vertical_split' ? 'btn-emerald' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                📱 Modern Vertical Split
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('school_luxury')}
                className={`btn ${selectedTemplate === 'school_luxury' ? 'btn-amber' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                🏫 Kop Gedung Luxury
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('royal_gold')}
                className={`btn ${selectedTemplate === 'royal_gold' ? 'btn-amber' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                👑 Royal Gold Emblem
              </button>
            </div>
          </div>

          {/* ON-SCREEN PREVIEW dynamically rendering the selected template layout */}
          <div ref={cardRef} style={{
            width: '450px',
            height: '280px',
            borderRadius: '18px',
            backgroundImage: selectedTemplate === 'school_luxury'
              ? `linear-gradient(rgba(15, 23, 42, 0.88), rgba(30, 27, 75, 0.90)), url('/sekolah.jpeg')`
              : selectedTemplate === 'vertical_split'
              ? `linear-gradient(to right, #064e3b 38%, #ffffff 38%)`
              : selectedTemplate === 'royal_gold'
              ? `linear-gradient(135deg, #172554 0%, #0f172a 60%, #1e1b4b 100%)`
              : `none`,
            backgroundColor: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#ffffff' : 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0f172a' : '#ffffff',
            padding: '18px',
            position: 'relative',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
            border: '1px solid #cbd5e1', // Thin 1px crop guide outline!
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}>
            
            {/* Top Card Header with Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderBottom: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '2px solid #0284c7' : '2px solid rgba(245, 158, 11, 0.6)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={settings?.schoolLogoUrl || settings?.logoUrl || '/perpustakaansmart.png'} 
                  alt="Logo" 
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0f172a' : '#ffffff' }}>
                    {settings?.schoolName || 'SDIT QURRATU A\'YUN AL-ISLAMI'}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0284c7' : '#fbbf24', fontWeight: 700 }}>
                    {settings?.libraryName || 'MAKTABAH AL-QIRO\'AH'}
                  </div>
                </div>
              </div>
              <Cpu size={22} color={selectedTemplate === 'clean_corporate' ? '#0284c7' : selectedTemplate === 'vertical_split' ? '#059669' : '#fbbf24'} title="Smart RFID Microchip" />
            </div>

            {/* Middle Card Content: 2.16 x 2.79 cm Photo + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', zIndex: 1, flex: 1 }}>
              
              {/* 2.16 x 2.79 cm Photo Frame */}
              <div style={{
                width: '108px', // Exact 2.16 x 2.79 cm ratio
                height: '140px',
                borderRadius: '12px',
                border: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '2px solid #0284c7' : '2px solid #fbbf24',
                padding: '2px',
                background: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerText = member.name.charAt(0).toUpperCase();
                    e.target.parentNode.style.fontSize = '3rem';
                    e.target.parentNode.style.fontWeight = 'bold';
                    e.target.parentNode.style.color = '#0284c7';
                    e.target.parentNode.style.background = '#e0f2fe';
                  }}
                />
              </div>

              {/* Member Information Details (2-Line Address Included) */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0f172a' : '#ffffff' }}>
                  {member.name}
                </h4>
                
                <div style={{ fontSize: '0.85rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0284c7' : '#fbbf24', fontWeight: 800 }}>
                  {classLabelText} : {member.role || 'Siswa'} - {member.classGrade || 'Umum'}
                </div>
                
                <div style={{ fontSize: '0.78rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#1e293b' : '#cbd5e1', fontWeight: 700 }}>
                  {idLabelText} : <strong>{member.nisn || '00001'}</strong>
                </div>

                {/* 2-LINE SEPARATE ADDRESS DISPLAY */}
                <div style={{ fontSize: '0.68rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#334155' : '#cbd5e1', lineHeight: '1.2' }}>
                  <div>Alamat: {line1Address}</div>
                  <div style={{ color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0f172a' : '#94a3b8', fontWeight: 700 }}>{line2Address}</div>
                </div>

                <div style={{
                  background: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? 'rgba(2, 132, 199, 0.08)' : 'rgba(245, 158, 11, 0.2)',
                  border: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '1px solid #0284c7' : '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0369a1' : '#fbbf24',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderTop: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '1px solid #e2e8f0' : '1px solid rgba(245, 158, 11, 0.4)', paddingTop: '6px' }}>
              <div>
                <div style={{ fontSize: '0.58rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>KODE CHIP RFID (UID ANGGOTA)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 900, color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0369a1' : '#34d399', letterSpacing: '1px' }}>
                  {member.rfidUid}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#0f172a' : '#fbbf24', fontWeight: 800 }}>
                  KARTU ANGGOTA PERPUSTAKAAN
                </div>
                <div style={{ fontSize: '0.58rem', color: (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') ? '#64748b' : '#94a3b8', fontWeight: 700 }}>
                  RESI DIGITAL & VALIDASI CHIP OK
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            ✨ <strong>Diperbaiki 100%:</strong> Pasfoto siswa pada template <strong>Modern Vertical Split</strong> kini selalu tampil utuh & terlindungi dengan *Fallback Initial Badge*!
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
