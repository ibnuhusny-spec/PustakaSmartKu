import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  MapPin, 
  FileSpreadsheet, 
  Download, 
  Upload,
  Sparkles,
  Image as ImageIcon,
  FolderOpen,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Tag,
  Bookmark,
  FileText,
  ExternalLink,
  Eye,
  Globe,
  Smartphone
} from 'lucide-react';
import { saveBook, deleteBook, clearSampleBooks, importBooksCSV, syncLocalToSqliteServer } from '../services/db';
import DdcPickerModal from '../components/DdcPickerModal';
import { recommendDdcFromTitle, BOOK_CATEGORIES } from '../services/ddcData';

export default function BooksView({ books, onRefreshData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDdcPickerOpen, setIsDdcPickerOpen] = useState(false);
  const [activeEbook, setActiveEbook] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [formNotice, setFormNotice] = useState('');
  const titleInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    isbn: '',
    category: 'Novel / Fiksi',
    ddc: '813',
    publisher: '',
    year: 2024,
    shelf: 'Rak A1',
    stock: 5,
    available: 5,
    pageCount: 250,
    pages: 250,
    coverUrl: '',
    description: '',
    ebookContent: '',
    pdfUrl: ''
  });

  const categoryCovers = {
    'Novel / Fiksi': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    'Agama & Keimanan': 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=400',
    'Sains & IPA': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    'Matematika': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
    'Komputer & IT': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    'Sejarah & Biografi': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400',
    'Sastra & Bahasa': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=400',
    'Pengembangan Diri': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
    'Pelajaran & Buku Teks': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    'Komik & Ensiklopedia': 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=400',
    'Umum': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'
  };

  const handleTitleChange = (newTitle) => {
    setFormData(prev => ({
      ...prev,
      title: newTitle
    }));
  };

  const handleTitleBlur = () => {
    if (formData.title && formData.title.trim()) {
      const rec = recommendDdcFromTitle(formData.title, formData.category);
      if (rec && rec.code) {
        setFormData(prev => ({
          ...prev,
          ddc: rec.code || prev.ddc,
          category: rec.category || prev.category
        }));
      }
    }
  };

  const ddcQuickList = [
    { code: '000', label: '000 - Karya Umum / Komputer & Sistem Informasi' },
    { code: '005', label: '005 - Pemrograman Komputer & Software' },
    { code: '100', label: '100 - Filsafat & Psikologi' },
    { code: '158', label: '158 - Psikologi Terapan & Pengembangan Diri' },
    { code: '200', label: '200 - Agama Umum' },
    { code: '297', label: '297 - Agama Islam & Pendidikan Agama' },
    { code: '300', label: '300 - Ilmu-Ilmu Sosial, Pendidikan & PPKn' },
    { code: '400', label: '400 - Bahasa & Linguistik' },
    { code: '500', label: '500 - Sains Murni, Matematika & IPA' },
    { code: '530', label: '530 - Fisika & Sains Terapan' },
    { code: '600', label: '600 - Teknologi, Kedokteran & Rekayasa' },
    { code: '700', label: '700 - Kesenian, Olahraga & Rekreasi' },
    { code: '800', label: '800 - Sastra, Puisi & Karya Cerita' },
    { code: '813', label: '813 - Novel / Fiksi Indonesia & Dunia' },
    { code: '900', label: '900 - Sejarah, Geografi & Biografi Tokoh' }
  ];

  const formatPdfUrlForEmbedding = (url) => {
    if (!url) return '';
    const cleanUrl = url.trim();
    if (cleanUrl.includes('drive.google.com') && cleanUrl.includes('/file/d/')) {
      const match = cleanUrl.match(/\/file\/d\/([^\/]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return cleanUrl;
  };

  // Inventory Statistics Calculations (Excluding Digital-Only Books from Physical Out-Of-Stock Warnings)
  const totalTitles = books.length;
  const totalPhysicalCopies = books.reduce((acc, b) => acc + (Number(b.stock) || 0), 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + (Number(b.available) || 0), 0);
  const totalLoanedCopies = totalPhysicalCopies - totalAvailableCopies;
  
  // Pure Physical Out Of Stock books (only physical books with stock 0 that have NO PDF)
  const outOfStockPhysicalBooks = books.filter(b => b.available <= 0 && b.stock > 0 && !b.pdfUrl && !b.ebookContent);

  const handleGenerateCover = () => {
    const defaultCover = categoryCovers[formData.category] || categoryCovers['Umum'];
    setFormData(prev => ({ ...prev, coverUrl: defaultCover }));
  };

  const handleAutoRecommendDDC = () => {
    if (!formData.title || !formData.title.trim()) {
      setFormNotice('⚠️ Silakan ketik Judul Buku terlebih dahulu!');
      setTimeout(() => setFormNotice(''), 4000);
      return;
    }
    const rec = recommendDdcFromTitle(formData.title, formData.category);
    setFormData(prev => ({ ...prev, ddc: rec.code, category: rec.category }));
    setFormNotice(`✨ Rekomendasi DDC Berhasil: DDC ${rec.code} (${rec.category})`);
    setTimeout(() => setFormNotice(''), 4000);
  };

  const handleLocalImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 700;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setFormData(prev => ({ ...prev, coverUrl: compressedDataUrl }));
        setFormNotice('✓ Sampul gambar berhasil diunggah!');
        setTimeout(() => setFormNotice(''), 3000);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setFormNotice('⚠️ Mohon pilih file dalam format PDF (.pdf)');
      setTimeout(() => setFormNotice(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setFormData(prev => ({ ...prev, pdfUrl: evt.target.result }));
      setFormNotice('✓ File PDF E-Book berhasil diunggah!');
      setTimeout(() => setFormNotice(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setFormData({ 
        ...book,
        ddc: book.ddc || '813',
        pageCount: book.pageCount || book.pages || 250,
        pages: book.pages || book.pageCount || 250,
        pdfUrl: book.pdfUrl || ''
      });
    } else {
      const defaultCategory = 'Novel / Fiksi';
      setFormData({
        id: `B-${Math.floor(100 + Math.random() * 900)}`,
        title: '',
        author: '',
        isbn: '',
        pageCount: 250,
        pages: 250,
        category: defaultCategory,
        ddc: '813',
        publisher: '',
        year: new Date().getFullYear(),
        shelf: 'Rak A1',
        stock: 5,
        available: 5,
        coverUrl: '',
        description: '',
        ebookContent: '',
        pdfUrl: ''
      });
    }
    setIsModalOpen(true);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 100);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      setFormNotice('⚠️ Judul buku dan nama penulis wajib diisi!');
      return;
    }

    const pagesNum = Number(formData.pages || formData.pageCount || 250);
    const stockNum = Number(formData.stock !== '' && formData.stock !== undefined ? formData.stock : 0);
    const availableNum = Number(formData.available !== '' && formData.available !== undefined ? formData.available : 0);

    const formattedData = {
      ...formData,
      coverUrl: (formData.coverUrl && formData.coverUrl.trim()) ? formData.coverUrl.trim() : (categoryCovers[formData.category] || categoryCovers['Novel / Fiksi']),
      pages: pagesNum,
      pageCount: pagesNum,
      stock: stockNum,
      available: availableNum,
      pdfUrl: formatPdfUrlForEmbedding(formData.pdfUrl)
    };

    await saveBook(formattedData);
    await syncLocalToSqliteServer();
    onRefreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus buku "${title}" dari inventaris?`)) {
      deleteBook(id);
      onRefreshData();
    }
  };

  const handleClearAllSampleBooks = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SELURUH BUKU di inventaris untuk menggantinya dengan buku sekolah Anda?')) {
      clearSampleBooks();
      onRefreshData();
      alert('Seluruh data contoh buku telah dikosongkan.');
    }
  };

  const handleImportCSVSubmit = (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const importedCount = importBooksCSV(csvText);
    if (importedCount > 0) {
      onRefreshData();
      setIsImportModalOpen(false);
      setCsvText('');
      alert(`Berhasil mengimpor ${importedCount} data buku baru ke inventaris!`);
    } else {
      alert('Gagal mengimpor. Pastikan format CSV sesuai petunjuk.');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.ddc && b.ddc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.shelf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.includes(searchTerm)
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Inventory KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL JUDUL BUKU</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
            {books.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Judul</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL EKSEMPLAR FISIK</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {totalPhysicalCopies} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Buku</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>E-BOOK DIGITAL PDF</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {books.filter(b => b.pdfUrl || b.ebookContent).length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>E-Book</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', border: outOfStockPhysicalBooks.length > 0 ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: outOfStockPhysicalBooks.length > 0 ? '#fb7185' : 'var(--text-secondary)' }}>
            RESTOK BUKU FISIK
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: outOfStockPhysicalBooks.length > 0 ? '#fb7185' : '#34d399', marginTop: '4px' }}>
            {outOfStockPhysicalBooks.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Judul</span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen color="#3b82f6" /> Managemen Inventaris Buku Fisik & E-Book PDF Digital
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Input buku fisik, upload PDF E-Book digital tanpa bentuk fisik, scan ISBN barcode, dan kelola rak.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-emerald">
              <FileSpreadsheet size={16} /> Import Data Buku (CSV/Excel)
            </button>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <Plus size={16} /> Tambah Buku / PDF E-Book Baru
            </button>

            {books.length > 0 && (
              <button onClick={handleClearAllSampleBooks} className="btn btn-rose" title="Kosongkan seluruh data contoh buku">
                <Trash2 size={16} /> Bersihkan Semua Buku
              </button>
            )}
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Cari judul buku, penulis, DDC, ISBN, atau rak..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <button onClick={handleClearAllSampleBooks} className="btn btn-rose" style={{ fontSize: '0.8rem' }}>
            <Trash2 size={14} /> Kosongkan Data Sample Buku
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Sampul & Judul Buku</th>
                <th style={{ padding: '12px' }}>Penulis & Penerbit</th>
                <th style={{ padding: '12px', color: '#fbbf24' }}>Nomor DDC</th>
                <th style={{ padding: '12px' }}>Kategori & Format</th>
                <th style={{ padding: '12px' }}>Akses E-Book PDF</th>
                <th style={{ padding: '12px' }}>Stok / Ketersediaan</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Inventaris buku masih kosong. Klik <strong>"+ Tambah Buku Baru"</strong> untuk menginput buku pertama Anda!
                  </td>
                </tr>
              ) : (
                filteredBooks.map(b => {
                  const isDigitalOnly = (b.pdfUrl || b.ebookContent) && Number(b.stock) === 0;
                  const hasDigitalPdf = Boolean(b.pdfUrl || b.ebookContent);

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={b.coverUrl} alt={b.title} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {b.title}
                            {isDigitalOnly && (
                              <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                📱 E-BOOK DIGITAL ONLY
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {b.id}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{b.author}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.publisher} ({b.year})</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-amber" style={{ fontSize: '0.82rem', fontWeight: 800, padding: '4px 10px' }}>
                          <Bookmark size={12} /> DDC: {b.ddc || '800'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-purple" style={{ marginBottom: '4px', fontSize: '0.72rem' }}>
                          {b.category}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: isDigitalOnly ? '#34d399' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {isDigitalOnly ? 'Rak E-Book Digital' : b.shelf}
                        </div>
                      </td>
                      
                      <td style={{ padding: '12px' }}>
                        {hasDigitalPdf ? (
                          <button
                            onClick={() => setActiveEbook(b)}
                            className="btn btn-emerald"
                            style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <FileText size={14} /> Baca PDF Online
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fisik Saja</span>
                        )}
                      </td>

                      <td style={{ padding: '12px', fontWeight: 700 }}>
                        {isDigitalOnly ? (
                          <span style={{ color: '#34d399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Smartphone size={14} /> ♾️ Akses Digital 24/7
                          </span>
                        ) : b.available <= 0 ? (
                          <span className="badge badge-rose" style={{ fontSize: '0.78rem' }}>
                            🔴 STOK HABIS (0/{b.stock})
                          </span>
                        ) : (
                          <span style={{ color: '#34d399' }}>
                            {b.available} / {b.stock} Buku Fisik
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleOpenModal(b)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(b.id, b.title)}
                            className="btn btn-rose"
                            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL TAMBAH / EDIT BUKU & E-BOOK PDF */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={e => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          onMouseDown={e => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="modal-container" 
            onClick={e => e.stopPropagation()} 
            onMouseDown={e => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen color="#3b82f6" /> {formData.id ? 'Edit Data Buku & PDF E-Book' : 'Tambah Buku / PDF E-Book Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                
                {formNotice && (
                  <div style={{
                    background: formNotice.includes('⚠️') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.18)',
                    color: formNotice.includes('⚠️') ? '#fb7185' : '#34d399',
                    border: formNotice.includes('⚠️') ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    marginBottom: '14px',
                    textAlign: 'center'
                  }}>
                    {formNotice}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Judul Buku *</label>
                  <input 
                    ref={titleInputRef}
                    type="text" 
                    className="form-input" 
                    value={formData.title}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleTitleChange(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Ketik judul buku..."
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Penulis / Pengarang *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.author}
                      onChange={e => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Nama penulis..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Penerbit & Tahun</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.publisher}
                      onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                      placeholder="Penerbit & Tahun..."
                    />
                  </div>
                </div>

                {/* E-BOOK PDF UPLOAD / URL SECTION */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  marginBottom: '16px'
                }}>
                  <label className="form-label" style={{ color: '#34d399', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 6px 0' }}>
                    <FileText size={20} /> File E-Book Online Universal (PDF / Google Drive / Direct URL)
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 12px 0' }}>
                    Jika buku ini <strong>HANYA BUKU PDF (Tanpa Buku Fisik)</strong>, cukup upload PDF/paste link Drive di sini lalu set Stok Fisik = 0 di bawah.
                  </p>

                  <div style={{ marginBottom: '10px' }}>
                    <label 
                      htmlFor="book-pdf-file-input"
                      className="btn btn-emerald"
                      style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                    >
                      <FolderOpen size={16} />
                      <span>Upload File PDF (.pdf) dari Komputer/HP Anda...</span>
                    </label>
                    <input 
                      id="book-pdf-file-input"
                      type="file" 
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <input 
                      type="text"
                      className="form-input"
                      value={formData.pdfUrl || ''}
                      onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
                      placeholder="Paste URL / Link E-Book Drive PDF..."
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>

                  {formData.pdfUrl && (
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} /> File/URL PDF E-Book Siap Dibaca di Semua Device!
                    </div>
                  )}
                </div>

                {/* DDC CLASSIFICATION FIELD */}
                <div className="form-group" style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.4)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <label className="form-label" style={{ color: '#fbbf24', margin: 0, fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={18} /> Nomor Klasifikasi Buku (DDC / Dewey Decimal) *
                    </label>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setIsDdcPickerOpen(true)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <Search size={14} /> 🔍 Cari DDC Detail (000-900)
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleAutoRecommendDDC}
                        className="btn btn-emerald"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <Sparkles size={14} /> ✨ Rekomendasi Otomatis
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.ddc}
                      onChange={e => setFormData({ ...formData, ddc: e.target.value })}
                      placeholder="Nomor DDC..."
                      style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', width: '140px', color: '#fbbf24', background: 'var(--bg-secondary)' }}
                      required
                    />

                    <select
                      className="form-select"
                      value={formData.ddc || ''}
                      onChange={e => { 
                        if (e.target.value) {
                          setFormData(prev => ({ ...prev, ddc: e.target.value }));
                        } 
                      }}
                      style={{ flex: 1, fontSize: '0.85rem', minWidth: '220px' }}
                    >
                      <option value="">-- Panduan Pilih Cepat Nomor DDC Standar --</option>
                      {ddcQuickList.map(item => (
                        <option key={item.code} value={item.code}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Kategori Buku</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {BOOK_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lokasi Rak Buku</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.shelf}
                      onChange={e => setFormData({ ...formData, shelf: e.target.value })}
                      placeholder="Lokasi rak..."
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">ISBN / Barcode</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.isbn || ''}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="Scan / ketik ISBN..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#38bdf8', fontWeight: 800 }}>Jumlah Halaman Buku</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      className="form-input" 
                      value={formData.pages !== undefined && formData.pages !== null ? formData.pages : (formData.pageCount || '')}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, pages: val, pageCount: val });
                      }}
                      placeholder="Halaman..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Stok Fisik (Isi 0 jika E-Book PDF Digital)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      className="form-input" 
                      value={formData.stock !== undefined && formData.stock !== null ? formData.stock : ''}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, stock: val, available: val });
                      }}
                      placeholder="Stok..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stok Fisik Tersedia</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      className="form-input" 
                      value={formData.available !== undefined && formData.available !== null ? formData.available : ''}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, available: val });
                      }}
                      placeholder="Tersedia..."
                    />
                  </div>
                </div>

                {/* Cover Image Selection Options */}
                <div className="form-group">
                  <label className="form-label">Gambar Sampul Buku</label>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <label 
                      htmlFor="book-cover-file-input"
                      className="btn btn-secondary"
                      style={{ cursor: 'pointer', fontSize: '0.82rem', width: '100%', justifyContent: 'flex-start' }}
                    >
                      <FolderOpen size={16} color="#10b981" />
                      <span>Upload Foto Sampul dari Komputer / HP Anda...</span>
                    </label>
                    <input 
                      id="book-cover-file-input"
                      type="file" 
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.coverUrl}
                      onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="URL foto sampul (opsional)..."
                    />
                    <button 
                      type="button"
                      onClick={handleGenerateCover}
                      className="btn btn-emerald"
                      style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                    >
                      <Sparkles size={14} /> Auto Sampul
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi / Ringkasan Buku</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tuliskan ringkasan singkat buku..."
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Buku & E-Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIVERSAL E-BOOK DIGITAL READER MODAL (SUPPORTING ALL DEVICES) */}
      {activeEbook && (
        <div className="modal-overlay" onClick={() => setActiveEbook(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} style={{ maxWidth: '880px', width: '92%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText color="#10b981" size={22} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>E-Book Digital Reader: {activeEbook.title}</h3>
              </div>
              <button onClick={() => setActiveEbook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div className="modal-body" style={{ padding: '16px' }}>
              
              {activeEbook.pdfUrl ? (
                <div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={16} /> File PDF E-Book Universal Online
                    </span>
                    
                    <a 
                      href={activeEbook.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-emerald"
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      <ExternalLink size={14} /> Buka PDF Layar Penuh / Tab Baru
                    </a>
                  </div>

                  <iframe 
                    src={formatPdfUrlForEmbedding(activeEbook.pdfUrl)} 
                    title={activeEbook.title}
                    allow="autoplay"
                    style={{ width: '100%', height: '540px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff' }}
                  />

                  <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    💡 <em>HP Android / iOS Safari:</em> Jika pratinjau belum muncul di HP Anda, klik tombol <strong>"Buka PDF Layar Penuh"</strong> di atas!
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  lineHeight: '1.8',
                  fontFamily: 'serif',
                  fontSize: '1.05rem',
                  color: 'var(--text-primary)',
                  maxHeight: '450px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)'
                }}>
                  <h2 style={{ textAlign: 'center', marginBottom: '12px', fontFamily: 'var(--font-main)' }}>{activeEbook.title}</h2>
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px', fontFamily: 'var(--font-main)' }}>
                    Karya: {activeEbook.author} ({activeEbook.publisher})
                  </p>
                  <p>{activeEbook.ebookContent || activeEbook.description || 'Pratinjau E-Book digital. Buku ini berisi pengetahuan berharga untuk pengembangan wawasan literasi sekolah.'}</p>
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveEbook(null)}>Tutup Reader</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT BUKU DARI CSV/EXCEL */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet color="#10b981" /> Impor Data Buku Massal (CSV / Excel)
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportCSVSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 0 }}>
                  Copy-paste teks data CSV / Excel Anda ke dalam kotak di bawah ini. Format kolom CSV:
                </p>
                
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#34d399', marginBottom: '14px' }}>
                  Judul,Penulis,DDC,Kategori,Penerbit,Tahun,Rak,Stok,ISBN
                </div>

                <textarea 
                  className="form-textarea" 
                  rows="6"
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Contoh isi data CSV:&#10;Sejarah Indonesia,Sartono Kartodirdjo,959,Sejarah / Sastra,Gramedia,2020,Rak B1,5,9789791234567"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-emerald">Proses Impor Buku</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DDC DETAILED PICKER MODAL */}
      <DdcPickerModal
        isOpen={isDdcPickerOpen}
        onClose={() => setIsDdcPickerOpen(false)}
        onSelectDdc={(item) => {
          setFormData(prev => ({ ...prev, ddc: item.code, category: item.category }));
        }}
        currentCode={formData.ddc}
      />

    </div>
  );
}
