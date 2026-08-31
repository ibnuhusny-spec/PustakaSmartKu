import React, { useState } from 'react';
import { Printer, X, Tag, Bookmark, Sparkles, Layers, Sliders, CheckSquare, FileText } from 'lucide-react';
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

  if (!isOpen || !books || books.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const schoolName = settings?.schoolName || 'PERPUSTAKAAN SMART';
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
      widthCm: 3.0,
      heightCm: 4.0,
      widthPx: '113px',
      heightPx: '151px',
      fontSizeDdc: '0.85rem',
      fontSizeCode: '0.9rem',
      gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
      labelName: 'Standar Perpusnas (3 x 4 cm)'
    },
    jumbo: {
      widthCm: 3.5,
      heightCm: 5.0,
      widthPx: '132px',
      heightPx: '189px',
      fontSizeDdc: '0.95rem',
      fontSizeCode: '1.0rem',
      gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
      labelName: 'Jumbo (3.5 x 5 cm)'
    },
    compact: {
      widthCm: 2.5,
      heightCm: 3.8,
      widthPx: '94px',
      heightPx: '143px',
      fontSizeDdc: '0.75rem',
      fontSizeCode: '0.8rem',
      gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7',
      labelName: 'Kecil / Slim (2.5 x 3.8 cm)'
    }
  };

  const currentSize = sizeConfig[labelSize] || sizeConfig.standard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:overflow-visible print:static">
      
      {/* Dynamic CSS for Print Mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #book-label-print-area, #book-label-print-area * {
            visibility: visible;
          }
          #book-label-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0.5cm !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-after {
            page-break-after: always;
          }
          .print-label-item {
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-6xl bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:w-full print:max-w-none print:bg-white print:m-0">
        
        {/* Header (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Tag size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Cetak Label Punggung Buku
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  {labelItems.length} Label ({books.length} Judul Buku)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Format Standar Perpusnas RI &bull; DDC &bull; Pengarang &bull; Judul &bull; Salinan
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 print:p-0 print:block">
          
          {/* Controls Panel (Hidden when printing) */}
          <div className="lg:col-span-1 space-y-5 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 no-print">
            <div className="flex items-center gap-2 font-semibold text-white text-sm pb-2 border-b border-slate-700/60">
              <Sliders size={16} className="text-blue-400" />
              Pengaturan Cetak
            </div>

            {/* Size Selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Ukuran Label</label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="standard">Standar Perpusnas (3 x 4 cm)</option>
                <option value="jumbo">Jumbo (3.5 x 5 cm)</option>
                <option value="compact">Slim / Saku (2.5 x 3.8 cm)</option>
              </select>
            </div>

            {/* Copy Count Selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Jumlah Salinan Label</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useStockCopies}
                    onChange={(e) => setUseStockCopies(e.target.checked)}
                    className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                  />
                  Sesuai Stok Buku (c.1, c.2, dst.)
                </label>
                {!useStockCopies && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Salinan per buku:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={copiesPerBook}
                      onChange={(e) => setCopiesPerBook(parseInt(e.target.value) || 1)}
                      className="w-16 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 text-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
              <label className="block text-xs text-slate-400 font-medium mb-1">Tampilan Label</label>
              
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showColorBar}
                  onChange={(e) => setShowColorBar(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                />
                Pita Warna DDC (Color Bar)
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showCategoryPrefix}
                  onChange={(e) => setShowCategoryPrefix(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                />
                Prefiks Kode Kategori (F/R/J)
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                />
                Logo Perpustakaan
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                />
                ID Buku / Barcode Mini
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-800"
                />
                Garis Bantu Potong (Cut Margins)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-700/60 space-y-2">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
              >
                <Printer size={18} />
                Cetak Label Sekarang
              </button>
              
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Batal / Kembali
              </button>
            </div>
          </div>

          {/* Preview & Print Area */}
          <div className="lg:col-span-3 bg-slate-950/60 p-4 rounded-xl border border-slate-700/50 min-h-[400px] flex flex-col justify-between print:p-0 print:border-none print:bg-white print:min-h-0">
            
            <div className="mb-3 flex items-center justify-between no-print">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <FileText size={14} className="text-blue-400" />
                Pratinjau Cetak ({currentSize.labelName})
              </span>
              <span className="text-xs text-slate-500">
                Gunakan Kertas Stiker A4 atau Label Roll Printer
              </span>
            </div>

            {/* Printable Container */}
            <div 
              id="book-label-print-area" 
              className="w-full bg-slate-900/40 p-4 rounded-lg border border-slate-800 overflow-x-auto print:p-0 print:border-none print:bg-white"
            >
              <div className="flex flex-wrap gap-3 justify-start print:gap-2">
                {labelItems.map((item, idx) => (
                  <div
                    key={`${item.book.id}-${item.copyIndex}-${idx}`}
                    className={`print-label-item bg-white text-slate-900 flex flex-col justify-between overflow-hidden relative transition-all ${
                      showCutLines ? 'border border-dashed border-slate-400 print:border-slate-400' : 'border border-slate-200'
                    }`}
                    style={{
                      width: currentSize.widthPx,
                      height: currentSize.heightPx,
                      boxSizing: 'border-box',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Top DDC Color Bar */}
                    {showColorBar && (
                      <div 
                        className="w-full h-2 print:h-2" 
                        style={{ backgroundColor: item.ddcColor }}
                        title={`DDC Color: ${item.book.ddc}`}
                      />
                    )}

                    {/* Optional Logo & Header */}
                    {showLogo && (
                      <div className="px-1.5 pt-1 flex items-center justify-center gap-1 text-[8px] font-bold text-slate-700 border-b border-slate-200 pb-0.5">
                        {logoUrl && (
                          <img src={logoUrl} alt="Logo" className="w-3.5 h-3.5 object-contain" />
                        )}
                        <span className="truncate max-w-[80px] uppercase text-[7px]">
                          {schoolName}
                        </span>
                      </div>
                    )}

                    {/* Main Call Number Content */}
                    <div className="flex-1 flex flex-col items-center justify-center px-1 py-1 text-center font-mono font-bold leading-tight select-text">
                      {/* Line 1: DDC Code */}
                      <div 
                        className="text-slate-950 font-black tracking-tight border-b border-slate-300 w-full pb-0.5 mb-0.5"
                        style={{ fontSize: currentSize.fontSizeDdc }}
                      >
                        {item.callNumber.ddcLine}
                      </div>

                      {/* Line 2: 3-Letter Author Code (Capital) */}
                      <div 
                        className="text-slate-900 font-extrabold uppercase tracking-wider"
                        style={{ fontSize: currentSize.fontSizeCode }}
                      >
                        {item.callNumber.authorLine}
                      </div>

                      {/* Line 3: 1-Letter Title Code (lowercase) */}
                      <div 
                        className="text-slate-800 font-bold lowercase my-0.5"
                        style={{ fontSize: currentSize.fontSizeCode }}
                      >
                        {item.callNumber.titleLine}
                      </div>

                      {/* Line 4: Copy / Exemplar */}
                      <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                        {item.callNumber.copyLine}
                      </div>
                    </div>

                    {/* Optional Footer: Book ID / Mini Barcode */}
                    {showBarcode && (
                      <div className="bg-slate-100 border-t border-slate-200 px-1 py-0.5 text-center">
                        <div className="text-[7px] text-slate-600 font-mono truncate">
                          ID: {item.book.id || 'BK-001'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Notice (Hidden when printing) */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between no-print">
              <span>Tips: Saat mencetak, pastikan memilih skala <strong>100% (Actual Size)</strong> di dialog printer.</span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
              >
                <Printer size={15} /> Cetak
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
