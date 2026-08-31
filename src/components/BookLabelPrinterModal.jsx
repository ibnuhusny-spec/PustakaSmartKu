import React, { useState } from 'react';
import { Printer, X, Tag, Sliders, Check, FileText } from 'lucide-react';
import { generateCallNumber, getDdcColor } from '../services/labelService';
import defaultLogo from '../assets/logo.png';

export default function BookLabelPrinterModal({ isOpen, onClose, books = [], settings = {} }) {
  const [labelSize, setLabelSize] = useState('standard'); // 'standard' (3x4 cm), 'jumbo' (3.5x5 cm), 'compact' (2.5x3.8 cm)
  const [showColorBar, setShowColorBar] = useState(true);
  const [showCategoryPrefix, setShowCategoryPrefix] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showCutLines, setShowCutLines] = useState(true);
  const [useStockCopies, setUseStockCopies] = useState(false);
  const [copiesPerBook, setCopiesPerBook] = useState(1);

  // Dynamic Header Title from Admin Settings (defaults to libraryName or schoolName)
  const defaultHeader = settings?.libraryName 
    ? (settings?.schoolName ? `${settings.libraryName} - ${settings.schoolName}` : settings.libraryName)
    : (settings?.schoolName || 'PERPUSTAKAAN');

  const [headerTitle, setHeaderTitle] = useState(defaultHeader);

  if (!isOpen || !books || books.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const logoUrl = settings?.schoolLogoUrl || settings?.logoUrl || defaultLogo;

  // Flatten books into individual label entries considering copy count
  const labelItems = [];
  books.forEach(book => {
    const totalCopies = useStockCopies ? Math.max(1, book.available || book.stock || 1) : Math.max(1, copiesPerBook);
    for (let c = 1; c <= totalCopies; c++) {
      const callNumber = generateCallNumber(book, c, showCategoryPrefix);
      const ddcColor = getDdcColor(book.ddc);
      labelItems.push({
        book,
        copyIndex: c,
        callNumber,
        ddcColor
      });
    }
  });

  // Dimensional styles based on selected label size
  const sizeConfig = {
    standard: {
      widthPx: '113px',
      heightPx: '151px',
      fontSizeDdc: '0.85rem',
      fontSizeCode: '0.9rem',
      labelName: 'Standar Perpusnas (3 x 4 cm)'
    },
    jumbo: {
      widthPx: '132px',
      heightPx: '189px',
      fontSizeDdc: '0.95rem',
      fontSizeCode: '1.0rem',
      labelName: 'Jumbo (3.5 x 5 cm)'
    },
    compact: {
      widthPx: '94px',
      heightPx: '143px',
      fontSizeDdc: '0.75rem',
      fontSizeCode: '0.8rem',
      labelName: 'Kecil / Slim (2.5 x 3.8 cm)'
    }
  };

  const currentSize = sizeConfig[labelSize] || sizeConfig.standard;

  return (
    <div 
      className="modal-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      
      {/* CSS for Print Mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #book-label-print-area, #book-label-print-area * {
            visibility: visible !important;
          }
          #book-label-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0.5cm !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-label-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div 
        className="modal-container glass-card" 
        style={{
          maxWidth: '1150px',
          width: '96%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0f172a',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Printer size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Cetak Label Punggung Buku
                <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px' }}>
                  {labelItems.length} Label ({books.length} Judul Buku)
                </span>
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Format Standar Perpusnas RI &bull; DDC &bull; 3 Huruf Pengarang &bull; 1 Huruf Judul &bull; Eksemplar
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body: Controls & Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Controls Panel */}
          <div style={{ background: '#1e293b', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <Sliders size={16} color="#3b82f6" /> Pengaturan Cetak Label
            </div>

            {/* Size Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>Ukuran Kertas Label</label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="standard">Standar Perpusnas RI (3 x 4 cm)</option>
                <option value="jumbo">Jumbo (3.5 x 5 cm)</option>
                <option value="compact">Slim / Saku (2.5 x 3.8 cm)</option>
              </select>
            </div>

            {/* Copy Count Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>Jumlah Salinan Label</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={useStockCopies}
                    onChange={(e) => setUseStockCopies(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Sesuai Stok Fisik Buku (c.1, c.2, dst.)
                </label>
                {!useStockCopies && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jumlah per buku:</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={copiesPerBook}
                      onChange={(e) => setCopiesPerBook(parseInt(e.target.value) || 1)}
                      className="form-input"
                      style={{ width: '70px', padding: '4px 8px', fontSize: '0.85rem', textAlign: 'center' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Custom Header Title Input */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>Teks Nama Perpustakaan / Sekolah di Label</label>
              <input
                type="text"
                className="form-input"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                placeholder="Contoh: PERPUSTAKAAN SMA... / MAKTABAH..."
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Otomatis terisi dari Nama Perpustakaan / Sekolah di Pengaturan Admin.
              </div>
            </div>

            {/* Customization Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '2px', display: 'block' }}>Elemen Tampilan Label</label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showColorBar}
                  onChange={(e) => setShowColorBar(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Pita Warna DDC (Color Bar)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCategoryPrefix}
                  onChange={(e) => setShowCategoryPrefix(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Prefiks Kode Kategori (F/R/J)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Logo Perpustakaan Sekolah
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                ID Buku / Mini Barcode
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Garis Bantu Potong (Cut Margins)
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handlePrint}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Printer size={18} />
                Cetak Label Sekarang (Ctrl + P)
              </button>
              
              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '8px', fontSize: '0.82rem', borderRadius: '10px' }}
              >
                Tutup Window
              </button>
            </div>

          </div>

          {/* Preview & Printable Area */}
          <div style={{ background: '#090d16', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px' }}>
            
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} /> Pratinjau Kertas Cetak ({currentSize.labelName})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Gunakan Kertas Stiker A4 atau Label Roll Printer
              </span>
            </div>

            {/* Printable Container */}
            <div 
              id="book-label-print-area" 
              style={{
                width: '100%',
                background: '#ffffff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                maxHeight: '480px',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-start' }}>
                {labelItems.map((item, idx) => (
                  <div
                    key={`${item.book.id}-${item.copyIndex}-${idx}`}
                    className="print-label-item"
                    style={{
                      width: currentSize.widthPx,
                      height: currentSize.heightPx,
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: showCutLines ? '1px dashed #94a3b8' : '1px solid #cbd5e1',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* Top DDC Color Bar */}
                    {showColorBar && (
                      <div 
                        style={{ width: '100%', height: '8px', backgroundColor: item.ddcColor }} 
                        title={`DDC Color: ${item.book.ddc}`}
                      />
                    )}

                    {/* Optional Logo & Header */}
                    {showLogo && (
                      <div style={{ padding: '2px 4px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderBottom: '1px solid #e2e8f0' }}>
                        {logoUrl && (
                          <img src={logoUrl} alt="Logo" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                        )}
                        <span style={{ fontSize: '7px', fontWeight: 800, textTransform: 'uppercase', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>
                          {headerTitle || 'PERPUSTAKAAN'}
                        </span>
                      </div>
                    )}

                    {/* Main Call Number Content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 800, lineHeight: 1.2 }}>
                      {/* Line 1: DDC Code */}
                      <div style={{ fontSize: currentSize.fontSizeDdc, color: '#020617', fontWeight: 900, borderBottom: '1px solid #cbd5e1', width: '100%', paddingBottom: '2px', marginBottom: '2px' }}>
                        {item.callNumber.ddcLine}
                      </div>

                      {/* Line 2: 3-Letter Author Code (Capital) */}
                      <div style={{ fontSize: currentSize.fontSizeCode, color: '#0f172a', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.callNumber.authorLine}
                      </div>

                      {/* Line 3: 1-Letter Title Code (lowercase) */}
                      <div style={{ fontSize: currentSize.fontSizeCode, color: '#334155', fontWeight: 800, textTransform: 'lowercase', margin: '2px 0' }}>
                        {item.callNumber.titleLine}
                      </div>

                      {/* Line 4: Copy / Exemplar */}
                      <div style={{ fontSize: '10px', color: '#475569', fontWeight: 700 }}>
                        {item.callNumber.copyLine}
                      </div>
                    </div>

                    {/* Optional Footer: Book ID / Mini Barcode */}
                    {showBarcode && (
                      <div style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '2px', textAlign: 'center' }}>
                        <div style={{ fontSize: '7px', color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          ID: {item.book.id || 'BK-001'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>💡 Tips: Pilih skala <strong>100% (Actual Size)</strong> pada jendela printer untuk ukuran persis.</span>
              <button
                onClick={handlePrint}
                className="btn btn-emerald"
                style={{ fontSize: '0.78rem', padding: '4px 12px' }}
              >
                <Printer size={14} /> Cetak
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
