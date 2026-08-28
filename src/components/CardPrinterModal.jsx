import React, { useState, useRef } from 'react';
import { Printer, X, CreditCard, Cpu, Sparkles, ShieldCheck, Download, MapPin, UserCheck, Layout, Award } from 'lucide-react';
import defaultLogo from '../assets/logo.png';

export default function CardPrinterModal({ isOpen, onClose, member, settings }) {
  const cardRef = useRef(null);
  const photoDomRef = useRef(null);
  const logoDomRef = useRef(null);

  // 3 Rock-solid templates: clean_corporate (default), school_luxury, royal_gold
  const [selectedTemplate, setSelectedTemplate] = useState(
    settings?.cardTemplate && settings.cardTemplate !== 'vertical_split' 
      ? settings.cardTemplate 
      : 'clean_corporate'
  );

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  const idLabelText = settings?.idFieldLabel || 'NISN / NIP';
  const classLabelText = settings?.classFieldLabel || 'Peran / Kelas';

  const line1Address = settings?.address || 'Jalan Poros Makassar - Maros Km. 26 Maccopa';
  const line2Address = settings?.cityAddress || '';

  // Convert HTML Card to ULTRA HIGH RESOLUTION PNG (2426 x 1530 px @ 600 DPI) for CorelDraw / Sticker Printing
  const handleDownloadPNG = () => {
    // Ultra 600 DPI Crisp Resolution (2426px x 1530px)
    const width = 2426; 
    const height = 1530;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Enable maximum text smoothing & high quality image interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Scale factor ratio (2.4x scaling from 1011x638 base)
    const s = 2.4;

    const schoolLogoUrl = (settings?.schoolLogoUrl && settings.schoolLogoUrl.trim()) 
      ? settings.schoolLogoUrl 
      : ((settings?.logoUrl && settings.logoUrl.trim() && settings.logoUrl.startsWith('data:')) ? settings.logoUrl : defaultLogo);
    const schoolBgUrl = '/sekolah.jpeg';

    const loadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      if (src.startsWith('http') && !src.includes('data:image')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = () => {
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = () => resolve(null);
        retryImg.src = src;
      };
      img.src = src;
    });

    const memberAvatarSrc = member.avatar || `https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80`;

    Promise.all([
      loadImage(schoolLogoUrl),
      loadImage(schoolBgUrl),
      loadImage(memberAvatarSrc)
    ]).then(([logoImg, bgImg, loadedPhotoImg]) => {
      
      const domPhoto = photoDomRef.current;
      const domLogo = logoDomRef.current;

      const activePhotoImg = (loadedPhotoImg && loadedPhotoImg.width > 0) ? loadedPhotoImg : (domPhoto && domPhoto.complete && domPhoto.naturalWidth > 0 ? domPhoto : null);
      const activeLogoImg = (logoImg && logoImg.width > 0) ? logoImg : (domLogo && domLogo.complete && domLogo.naturalWidth > 0 ? domLogo : null);

      // Helper function to render Photo Box Bulletproof at 600 DPI
      const renderUltraPhotoBox = (pX, pY, pW, pH, strokeColor = '#0284c7') => {
        const scaledX = pX * s;
        const scaledY = pY * s;
        const scaledW = pW * s;
        const scaledH = pH * s;
        const radius = 16 * s;

        // 1. Draw solid white container box
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(scaledX, scaledY, scaledW, scaledH, radius);
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4 * s;
        ctx.roundRect(scaledX, scaledY, scaledW, scaledH, radius);
        ctx.stroke();

        let photoDrawn = false;

        // 2. Draw photo if valid
        if (activePhotoImg) {
          try {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(scaledX + (4 * s), scaledY + (4 * s), scaledW - (8 * s), scaledH - (8 * s), radius - (2 * s));
            ctx.clip();
            ctx.drawImage(activePhotoImg, scaledX + (4 * s), scaledY + (4 * s), scaledW - (8 * s), scaledH - (8 * s));
            ctx.restore();
            photoDrawn = true;
          } catch (e) {
            photoDrawn = false;
          }
        }

        // 3. Fallback Initial Badge if photo is missing
        if (!photoDrawn) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(scaledX + (4 * s), scaledY + (4 * s), scaledW - (8 * s), scaledH - (8 * s), radius - (2 * s));
          ctx.clip();

          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(scaledX + (4 * s), scaledY + (4 * s), scaledW - (8 * s), scaledH - (8 * s));

          ctx.fillStyle = '#0284c7';
          ctx.font = `bold ${80 * s}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(member.name.charAt(0).toUpperCase(), scaledX + (scaledW / 2), scaledY + (scaledH / 2));

          ctx.restore();
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        }
      };

      // Base Canvas Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // TEMPLATE 1: PRISTINE WHITE CORPORATE (DEFAULT - Nuansa Putih Dominan Kontras Tinggi)
      // ==========================================
      if (selectedTemplate === 'clean_corporate' || selectedTemplate === 'vertical_split') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header Divider Line (Royal Blue)
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(35 * s, 118 * s);
        ctx.lineTo((1011 - 35) * s, 118 * s);
        ctx.stroke();

        // Kop Header Logo + School Name + Library Name
        let textStartX = 45 * s;
        if (activeLogoImg) {
          ctx.drawImage(activeLogoImg, 45 * s, 20 * s, 80 * s, 80 * s);
          textStartX = 145 * s;
        }

        ctx.fillStyle = '#0f172a'; // Extra Dark Navy
        ctx.font = `bold ${30 * s}px sans-serif`;
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), textStartX, 58 * s);

        ctx.fillStyle = '#0284c7'; // Royal Blue Subtitle
        ctx.font = `bold ${20 * s}px sans-serif`;
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), textStartX, 88 * s);

        ctx.fillStyle = '#0284c7';
        ctx.font = `bold ${20 * s}px monospace`;
        ctx.fillText('⚡ SMART RFID', (1011 - 210) * s, 58 * s);

        // Bulletproof Photo Frame (2.16x2.79 cm)
        renderUltraPhotoBox(45, 138, 255, 330, '#0284c7');

        // Student Information (High-Contrast Dark Navy & Slate)
        const tX = 330 * s;
        let currY = 185 * s;

        // Nama Siswa (Deep Black Navy Bold)
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${42 * s}px sans-serif`;
        ctx.fillText(member.name, tX, currY);

        // Peran / Kelas (Vibrant Blue Bold)
        currY += 45 * s;
        ctx.fillStyle = '#0284c7';
        ctx.font = `bold ${28 * s}px sans-serif`;
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, tX, currY);

        // NISN / NIP (Dark Slate Bold)
        currY += 38 * s;
        ctx.fillStyle = '#1e293b';
        ctx.font = `bold ${26 * s}px sans-serif`;
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, tX, currY);

        // Alamat 2 Baris Presisi (Aligned EXACTLY under "J" of "Jalan")
        currY += 36 * s;
        ctx.font = `bold ${22 * s}px sans-serif`;
        ctx.fillStyle = '#334155';
        
        const labelPrefix = 'Alamat : ';
        ctx.fillText(labelPrefix, tX, currY);
        const exactLabelWidth = ctx.measureText(labelPrefix).width;

        ctx.font = `${22 * s}px sans-serif`;
        ctx.fillText(line1Address, tX + exactLabelWidth, currY);

        if (line2Address && line2Address.trim() !== '') {
          currY += 34 * s;
          ctx.font = `bold ${21 * s}px sans-serif`;
          ctx.fillStyle = '#0f172a';
          ctx.fillText(line2Address, tX + exactLabelWidth, currY);
        }

        // Duta Baca Badge Box
        currY += 34 * s;
        ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
        ctx.roundRect(tX, currY, 420 * s, 48 * s, 12 * s);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5 * s;
        ctx.roundRect(tX, currY, 420 * s, 48 * s, 12 * s);
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = `bold ${24 * s}px sans-serif`;
        ctx.fillText(`🏆 Duta Baca: ${member.badge || 'Pembaca Baru 🌱'}`, tX + (15 * s), currY + (32 * s));

        // Bottom RFID UID & Issuer Footer
        const fY = 500 * s;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(35 * s, fY);
        ctx.lineTo((1011 - 35) * s, fY);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${18 * s}px monospace`;
        ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 45 * s, fY + (32 * s));

        ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
        ctx.roundRect(45 * s, fY + (42 * s), 440 * s, 65 * s, 14 * s);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2 * s;
        ctx.roundRect(45 * s, fY + (42 * s), 440 * s, 65 * s, 14 * s);
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = `bold ${46 * s}px monospace`;
        ctx.fillText(member.rfidUid, 65 * s, fY + (90 * s));

        // Right-aligned footer text (NO CUTOFF / OVERFLOW)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${22 * s}px sans-serif`;
        ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', (1011 - 45) * s, fY + (62 * s));

        ctx.fillStyle = '#64748b';
        ctx.font = `bold ${18 * s}px sans-serif`;
        ctx.fillText('RESI DIGITAL & VALIDASI CHIP OK', (1011 - 45) * s, fY + (92 * s));
        ctx.textAlign = 'left';
      }

      // ==========================================
      // TEMPLATE 2: SCHOOL LUXURY (DARK NAVY)
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

        let textStartX = 45 * s;
        if (activeLogoImg) {
          ctx.drawImage(activeLogoImg, 45 * s, 20 * s, 80 * s, 80 * s);
          textStartX = 145 * s;
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${30 * s}px sans-serif`;
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), textStartX, 58 * s);

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${20 * s}px sans-serif`;
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), textStartX, 88 * s);

        ctx.fillStyle = '#34d399';
        ctx.font = `bold ${20 * s}px monospace`;
        ctx.fillText('⚡ SMART RFID', (1011 - 210) * s, 58 * s);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(35 * s, 118 * s);
        ctx.lineTo((1011 - 35) * s, 118 * s);
        ctx.stroke();

        renderUltraPhotoBox(45, 138, 255, 330, '#fbbf24');

        const tX = 330 * s;
        let currY = 185 * s;

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${42 * s}px sans-serif`;
        ctx.fillText(member.name, tX, currY);

        currY += 45 * s;
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${28 * s}px sans-serif`;
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, tX, currY);

        currY += 38 * s;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `bold ${26 * s}px sans-serif`;
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, tX, currY);

        // Alamat Seamless 2 Baris Presisi
        currY += 36 * s;
        ctx.font = `bold ${22 * s}px sans-serif`;
        ctx.fillStyle = '#cbd5e1';
        
        const labelPrefix = 'Alamat : ';
        ctx.fillText(labelPrefix, tX, currY);
        const exactLabelWidth = ctx.measureText(labelPrefix).width;

        ctx.font = `${22 * s}px sans-serif`;
        ctx.fillText(line1Address, tX + exactLabelWidth, currY);

        if (line2Address && line2Address.trim() !== '') {
          currY += 34 * s;
          ctx.font = `bold ${21 * s}px sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(line2Address, tX + exactLabelWidth, currY);
        }

        currY += 34 * s;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.roundRect(tX, currY, 420 * s, 48 * s, 12 * s);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5 * s;
        ctx.roundRect(tX, currY, 420 * s, 48 * s, 12 * s);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${24 * s}px sans-serif`;
        ctx.fillText(`🏆 Duta Baca: ${member.badge || 'Pembaca Baru 🌱'}`, tX + (15 * s), currY + (32 * s));

        const fY = 500 * s;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(35 * s, fY);
        ctx.lineTo((1011 - 35) * s, fY);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${18 * s}px monospace`;
        ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 45 * s, fY + (32 * s));

        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.roundRect(45 * s, fY + (42 * s), 440 * s, 65 * s, 14 * s);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2 * s;
        ctx.roundRect(45 * s, fY + (42 * s), 440 * s, 65 * s, 14 * s);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = `bold ${46 * s}px monospace`;
        ctx.fillText(member.rfidUid, 65 * s, fY + (90 * s));

        // Right-aligned footer text (NO CUTOFF / OVERFLOW)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${22 * s}px sans-serif`;
        ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', (1011 - 45) * s, fY + (62 * s));

        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${18 * s}px sans-serif`;
        ctx.fillText('RESI DIGITAL & VALIDASI CHIP OK', (1011 - 45) * s, fY + (92 * s));
        ctx.textAlign = 'left';
      }

      // ==========================================
      // TEMPLATE 3: ROYAL GOLD DIPLOMA (BLUE & GOLD)
      // ==========================================
      else {
        ctx.fillStyle = '#172554';
        ctx.fillRect(0, 0, width, height);

        let textStartX = 50 * s;
        if (activeLogoImg) {
          ctx.drawImage(activeLogoImg, 50 * s, 20 * s, 80 * s, 80 * s);
          textStartX = 145 * s;
        }

        ctx.fillStyle = '#fde047';
        ctx.font = `bold ${30 * s}px serif`;
        ctx.fillText((settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI").toUpperCase(), textStartX, 58 * s);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${20 * s}px serif`;
        ctx.fillText((settings?.libraryName || 'MAKTABAH AL-QIRO\'AH').toUpperCase(), textStartX, 88 * s);

        ctx.fillStyle = '#fde047';
        ctx.font = `bold ${20 * s}px monospace`;
        ctx.fillText('⚡ SMART RFID', (1011 - 210) * s, 58 * s);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(35 * s, 118 * s);
        ctx.lineTo((1011 - 35) * s, 118 * s);
        ctx.stroke();

        renderUltraPhotoBox(45, 138, 255, 330, '#eab308');

        const tX = 330 * s;
        let currY = 185 * s;

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${42 * s}px sans-serif`;
        ctx.fillText(member.name, tX, currY);

        currY += 45 * s;
        ctx.fillStyle = '#fde047';
        ctx.font = `bold ${28 * s}px sans-serif`;
        ctx.fillText(`${classLabelText} : ${member.role || 'Siswa'} - ${member.classGrade || 'Umum'}`, tX, currY);

        currY += 38 * s;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `bold ${26 * s}px sans-serif`;
        ctx.fillText(`${idLabelText} : ${member.nisn || '00001'}`, tX, currY);

        // Alamat Seamless 2 Baris Presisi
        currY += 36 * s;
        ctx.font = `bold ${22 * s}px sans-serif`;
        ctx.fillStyle = '#cbd5e1';
        
        const labelPrefix = 'Alamat : ';
        ctx.fillText(labelPrefix, tX, currY);
        const exactLabelWidth = ctx.measureText(labelPrefix).width;

        ctx.font = `${22 * s}px sans-serif`;
        ctx.fillText(line1Address, tX + exactLabelWidth, currY);

        if (line2Address && line2Address.trim() !== '') {
          currY += 34 * s;
          ctx.font = `bold ${21 * s}px sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(line2Address, tX + exactLabelWidth, currY);
        }

        currY += 34 * s;
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.roundRect(tX, currY, 420 * s, 48 * s, 12 * s);
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5 * s;
        ctx.roundRect(tX, currY, 420 * s, 48 * s, 12 * s);
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = `bold ${24 * s}px serif`;
        ctx.fillText(`👑 ${member.badge || 'Pembaca Utama ⭐'}`, tX + (15 * s), currY + (32 * s));

        const fY = 500 * s;
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(35 * s, fY);
        ctx.lineTo((1011 - 35) * s, fY);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${18 * s}px monospace`;
        ctx.fillText('KODE CHIP RFID (UID ANGGOTA)', 45 * s, fY + (32 * s));

        ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.roundRect(45 * s, fY + (42 * s), 440 * s, 65 * s, 14 * s);
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2 * s;
        ctx.roundRect(45 * s, fY + (42 * s), 440 * s, 65 * s, 14 * s);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = `bold ${46 * s}px monospace`;
        ctx.fillText(member.rfidUid, 65 * s, fY + (90 * s));

        // Right-aligned footer text UNIFIED 2-LINES (NO OVERFLOW / CUTOFF!)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fde047';
        ctx.font = `bold ${22 * s}px sans-serif`;
        ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', (1011 - 45) * s, fY + (62 * s));

        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${18 * s}px sans-serif`;
        ctx.fillText('RESI DIGITAL & VALIDASI CHIP OK', (1011 - 45) * s, fY + (92 * s));
        ctx.textAlign = 'left';
      }

      // ==========================================
      // FINE 1PX CROP GUIDELINES FOR CUTTING STICKERS
      // ==========================================
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.roundRect(2, 2, width - 4, height - 4, 32 * s);
      ctx.stroke();

      // Corner crop marks
      const cLen = 25 * s;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;

      ctx.beginPath(); ctx.moveTo(0, cLen); ctx.lineTo(0, 0); ctx.lineTo(cLen, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - cLen, 0); ctx.lineTo(width, 0); ctx.lineTo(width, cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, height - cLen); ctx.lineTo(0, height); ctx.lineTo(cLen, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - cLen, height); ctx.lineTo(width, height); ctx.lineTo(width, height - cLen); ctx.stroke();

      // Trigger High Quality PNG Download
      const link = document.createElement('a');
      const cleanName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kartu_RFID_UltraHD_${cleanName}_${member.rfidUid}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
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
          
          {/* TEMPLATE CHOOSER BAR (3 ROCK-SOLID TEMPLATES) */}
          <div className="no-print" style={{ width: '100%', marginBottom: '16px', background: 'rgba(59, 130, 246, 0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layout size={16} /> Pilih Desain Template Kartu:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedTemplate('clean_corporate')}
                className={`btn ${selectedTemplate === 'clean_corporate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '8px 12px' }}
              >
                ⚪ Pristine White Corporate
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('school_luxury')}
                className={`btn ${selectedTemplate === 'school_luxury' ? 'btn-amber' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '8px 12px' }}
              >
                🏫 Kop Gedung Luxury
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('royal_gold')}
                className={`btn ${selectedTemplate === 'royal_gold' ? 'btn-amber' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '8px 12px' }}
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
              : selectedTemplate === 'royal_gold'
              ? `linear-gradient(135deg, #172554 0%, #0f172a 60%, #1e1b4b 100%)`
              : `none`,
            backgroundColor: selectedTemplate === 'clean_corporate' ? '#ffffff' : 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: selectedTemplate === 'clean_corporate' ? '#0f172a' : '#ffffff',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderBottom: selectedTemplate === 'clean_corporate' ? '2px solid #0284c7' : '2px solid rgba(245, 158, 11, 0.6)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  ref={logoDomRef}
                  crossOrigin="anonymous"
                  src={settings?.schoolLogoUrl || settings?.logoUrl || '/perpustakaansmart.png'} 
                  alt="Logo" 
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: selectedTemplate === 'clean_corporate' ? '#0f172a' : '#ffffff' }}>
                    {settings?.schoolName || 'SDIT QURRATU A\'YUN AL-ISLAMI'}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: selectedTemplate === 'clean_corporate' ? '#0284c7' : '#fbbf24', fontWeight: 700 }}>
                    {settings?.libraryName || 'MAKTABAH AL-QIRO\'AH'}
                  </div>
                </div>
              </div>
              <Cpu size={22} color={selectedTemplate === 'clean_corporate' ? '#0284c7' : '#fbbf24'} title="Smart RFID Microchip" />
            </div>

            {/* Middle Card Content: 2.16 x 2.79 cm Photo + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', zIndex: 1, flex: 1 }}>
              
              {/* 2.16 x 2.79 cm Photo Frame */}
              <div style={{
                width: '108px', // Exact 2.16 x 2.79 cm ratio
                height: '140px',
                borderRadius: '12px',
                border: selectedTemplate === 'clean_corporate' ? '2px solid #0284c7' : '2px solid #fbbf24',
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
                  ref={photoDomRef}
                  crossOrigin="anonymous"
                  src={member.avatar || `https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80`}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                  onError={e => {
                    e.target.style.display = 'none';
                    if (e.target.parentNode) {
                      e.target.parentNode.innerText = member.name.charAt(0).toUpperCase();
                      e.target.parentNode.style.fontSize = '3rem';
                      e.target.parentNode.style.fontWeight = 'bold';
                      e.target.parentNode.style.color = '#0284c7';
                      e.target.parentNode.style.background = '#e0f2fe';
                    }
                  }}
                />
              </div>

              {/* Member Information Details (Clean Seamless 2-Line Address) */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: selectedTemplate === 'clean_corporate' ? '#0f172a' : '#ffffff' }}>
                  {member.name}
                </h4>
                
                <div style={{ fontSize: '0.85rem', color: selectedTemplate === 'clean_corporate' ? '#0284c7' : '#fbbf24', fontWeight: 800 }}>
                  {classLabelText} : {member.role || 'Siswa'} - {member.classGrade || 'Umum'}
                </div>
                
                <div style={{ fontSize: '0.78rem', color: selectedTemplate === 'clean_corporate' ? '#1e293b' : '#cbd5e1', fontWeight: 700 }}>
                  {idLabelText} : <strong>{member.nisn || '00001'}</strong>
                </div>

                {/* CLEAN SEAMLESS 2-LINE ADDRESS (PERFECTLY ALIGNED UNDER LETTER "J" OF "Jalan") */}
                <div style={{ fontSize: '0.68rem', color: selectedTemplate === 'clean_corporate' ? '#334155' : '#cbd5e1', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ fontWeight: 800, whiteSpace: 'pre' }}>Alamat : </span>
                    <span>{line1Address}</span>
                  </div>
                  {line2Address && line2Address.trim() !== '' && (
                    <div style={{ paddingLeft: '48px', color: selectedTemplate === 'clean_corporate' ? '#0f172a' : '#94a3b8', fontWeight: 700, marginTop: '2px' }}>
                      {line2Address}
                    </div>
                  )}
                </div>

                <div style={{
                  background: selectedTemplate === 'clean_corporate' ? 'rgba(2, 132, 199, 0.08)' : 'rgba(245, 158, 11, 0.2)',
                  border: selectedTemplate === 'clean_corporate' ? '1px solid #0284c7' : '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: selectedTemplate === 'clean_corporate' ? '#0369a1' : '#fbbf24',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, borderTop: selectedTemplate === 'clean_corporate' ? '1px solid #e2e8f0' : '1px solid rgba(245, 158, 11, 0.4)', paddingTop: '6px' }}>
              <div>
                <div style={{ fontSize: '0.58rem', color: selectedTemplate === 'clean_corporate' ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>KODE CHIP RFID (UID ANGGOTA)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 900, color: selectedTemplate === 'clean_corporate' ? '#0369a1' : '#34d399', letterSpacing: '1px' }}>
                  {member.rfidUid}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: selectedTemplate === 'clean_corporate' ? '#0f172a' : '#fbbf24', fontWeight: 800 }}>
                  KARTU ANGGOTA PERPUSTAKAAN
                </div>
                <div style={{ fontSize: '0.58rem', color: selectedTemplate === 'clean_corporate' ? '#64748b' : '#94a3b8', fontWeight: 700 }}>
                  RESI DIGITAL & VALIDASI CHIP OK
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            ✨ <strong>Layout Footer Diseragamkan:</strong> Teks <i>"KARTU ANGGOTA PERPUSTAKAAN"</i> kini sejajar rapi di kanan dengan margin aman tanpa terpotong!
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
