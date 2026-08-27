import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { saveBook, deleteBook, clearSampleBooks, importBooksCSV } from '../services/db';

export default function BooksView({ books, onRefreshData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeEbook, setActiveEbook] = useState(null);
  const [csvText, setCsvText] = useState('');

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
    coverUrl: '',
    description: '',
    ebookContent: '',
    pdfUrl: '' // PDF File Data URI or Online Link
  });

  const categoryCovers = {
    'Novel / Fiksi': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    'Sejarah / Sastra': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    'Sains & Teknologi': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    'Komputer & IT': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    'Pengembangan Diri': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    'Agama & Keimanan': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    'Umum': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80',
  };

  // Smart DDC Map
  const ddcCategoryMap = {
    'Novel / Fiksi': '813',       // 800 Sastra / Fiksi
    'Sejarah / Sastra': '959',    // 900 Sejarah
    'Sains & Teknologi': '530',   // 500 Sains Murni
    'Komputer & IT': '005',       // 000 Komputer & Pemrograman
    'Pengembangan Diri': '158',   // 100 Psikologi & Pengemabangan Diri
    'Agama & Keimanan': '297',    // 200 Agama Islam
    'Umum': '000'
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

  // Inventory Statistics Calculations
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (Number(b.stock) || 0), 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + (Number(b.available) || 0), 0);
  const totalLoanedCopies = totalCopies - totalAvailableCopies;
  const outOfStockBooks = books.filter(b => b.available <= 0);

  const handleGenerateCover = () => {
    const defaultCover = categoryCovers[formData.category] || categoryCovers['Umum'];
    setFormData(prev => ({ ...prev, coverUrl: defaultCover }));
  };

  // Smart Auto-DDC Suggestion Generator based on Title & Category
  const handleAutoRecommendDDC = () => {
    const titleLower = formData.title.toLowerCase();
    
    if (titleLower.includes('islam') || titleLower.includes('quran') || titleLower.includes('hadits') || titleLower.includes('fiqih') || titleLower.includes('doa') || titleLower.includes('shalat') || titleLower.includes('rasul') || titleLower.includes('nabi')) {
      setFormData(prev => ({ ...prev, ddc: '297', category: 'Agama & Keimanan' }));
    } else if (titleLower.includes('komputer') || titleLower.includes('web') || titleLower.includes('react') || titleLower.includes('javascript') || titleLower.includes('python') || titleLower.includes('program') || titleLower.includes('coding') || titleLower.includes('it') || titleLower.includes('software')) {
      setFormData(prev => ({ ...prev, ddc: '005', category: 'Komputer & IT' }));
    } else if (titleLower.includes('fisika') || titleLower.includes('kimia') || titleLower.includes('biologi') || titleLower.includes('matematika') || titleLower.includes('sains') || titleLower.includes('ipa') || titleLower.includes('hitung')) {
      setFormData(prev => ({ ...prev, ddc: '530', category: 'Sains & Teknologi' }));
    } else if (titleLower.includes('sejarah') || titleLower.includes('bangsa') || titleLower.includes('pahlawan') || titleLower.includes('perang') || titleLower.includes('indonesia') || titleLower.includes('kemerdekaan')) {
      setFormData(prev => ({ ...prev, ddc: '959', category: 'Sejarah / Sastra' }));
    } else if (titleLower.includes('psikologi') || titleLower.includes('sukses') || titleLower.includes('pikiran') || titleLower.includes('bahagia') || titleLower.includes('stoisisme') || titleLower.includes('teras') || titleLower.includes('diri')) {
      setFormData(prev => ({ ...prev, ddc: '158', category: 'Pengembangan Diri' }));
    } else {
      const suggestedDdc = ddcCategoryMap[formData.category] || '800';
      setFormData(prev => ({ ...prev, ddc: suggestedDdc }));
    }
  };

  // Local Image Upload Handler
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
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Local PDF Upload Handler (Converts PDF to Data URI / File URL)
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Mohon pilih file dalam format PDF (.pdf)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setFormData(prev => ({ ...prev, pdfUrl: evt.target.result }));
      alert('✓ File PDF E-Book berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setFormData({ 
        ...book,
        ddc: book.ddc || '813',
        pdfUrl: book.pdfUrl || ''
      });
    } else {
      const defaultCategory = 'Novel / Fiksi';
      setFormData({
        id: `B-${Math.floor(100 + Math.random() * 900)}`,
        title: '',
        author: '',
        isbn: '',
        category: defaultCategory,
        ddc: ddcCategoryMap[defaultCategory],
        publisher: '',
        year: new Date().getFullYear(),
        shelf: 'Rak A1',
        stock: 5,
        available: 5,
        coverUrl: categoryCovers[defaultCategory],
        description: '',
        ebookContent: '',
        pdfUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert('Judul buku dan nama penulis wajib diisi!');
      return;
    }

    saveBook(formData);
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
            {totalTitles} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Judul</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL EKSEMPLAR FISIK</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {totalCopies} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Buku</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SEDANG DIPINJAM SISWA</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            {totalLoanedCopies} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Buku</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', border: outOfStockBooks.length > 0 ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: outOfStockBooks.length > 0 ? '#fb7185' : 'var(--text-secondary)' }}>
            STOK HABIS / PERLU RESTOK
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: outOfStockBooks.length > 0 ? '#fb7185' : '#34d399', marginTop: '4px' }}>
            {outOfStockBooks.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Judul</span>
          </div>
        </div>
      </div>

      {/* Warning Banner if Out of Stock Books exist */}
      {outOfStockBooks.length > 0 && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fb7185'
        }}>
          <AlertTriangle size={24} />
          <div>
            <strong style={{ fontSize: '0.95rem' }}>Peringatan Inventaris: Terdapat {outOfStockBooks.length} judul buku yang stoknya HABIS!</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
              Buku yang stoknya habis dipinjam seluruhnya: {outOfStockBooks.map(b => `"${b.title}"`).join(', ')}. Silakan tambah stok atau tunggu siswa mengembalikan buku.
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen color="#3b82f6" /> Managemen Inventaris & E-Book PDF Sekolah
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Input buku fisik, upload E-Book PDF online, scan ISBN barcode, dan kelola katalog perpustakaan.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-emerald">
              <FileSpreadsheet size={16} /> Import Data Buku (CSV/Excel)
            </button>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <Plus size={16} /> Tambah Buku / E-Book Baru
            </button>
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
                <th style={{ padding: '12px', color: '#fbbf24' }}>Nomor Klasifikasi DDC</th>
                <th style={{ padding: '12px' }}>Kategori & Rak</th>
                <th style={{ padding: '12px' }}>E-Book Digital / PDF</th>
                <th style={{ padding: '12px' }}>Stok Tersedia</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Inventaris buku masih kosong. Klik <strong>"+ Tambah Buku Baru"</strong> untuk menginput buku atau PDF E-Book pertama Anda!
                  </td>
                </tr>
              ) : (
                filteredBooks.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={b.coverUrl} alt={b.title} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontSize: '0.95rem' }}>{b.title}</div>
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
                      <div style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {b.shelf}
                      </div>
                    </td>
                    
                    {/* E-Book PDF Status Badge & Quick Reader */}
                    <td style={{ padding: '12px' }}>
                      {b.pdfUrl || b.ebookContent ? (
                        <button
                          onClick={() => setActiveEbook(b)}
                          className="btn btn-emerald"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FileText size={14} /> Baca E-Book PDF
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fisik Sahaja</span>
                      )}
                    </td>

                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {b.available <= 0 ? (
                        <span className="badge badge-rose" style={{ fontSize: '0.78rem' }}>
                          🔴 HABIS (0/{b.stock})
                        </span>
                      ) : (
                        <span style={{ color: '#34d399' }}>
                          {b.available} / {b.stock} Buku
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
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL TAMBAH / EDIT BUKU & E-BOOK PDF */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
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
                
                <div className="form-group">
                  <label className="form-label">Judul Buku *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Laskar Pelangi / Fisika Modern Class XII"
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
                      placeholder="Contoh: Erlangga (2024)"
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
                    <FileText size={20} /> File E-Book Online (PDF / Google Drive / URL Link)
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 12px 0' }}>
                    Upload file PDF dari laptop/HP Anda atau masukkan link Google Drive / PDF online agar siswa dapat <strong>membaca buku secara digital!</strong>
                  </p>

                  {/* File Upload PDF Button */}
                  <div style={{ marginBottom: '10px' }}>
                    <label 
                      className="btn btn-emerald"
                      style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                    >
                      <FolderOpen size={16} />
                      <span>Upload File PDF (.pdf) dari Komputer/HP Anda...</span>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <input 
                      type="text"
                      className="form-input"
                      value={formData.pdfUrl || ''}
                      onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
                      placeholder="Atau paste link URL File PDF / Google Drive PDF..."
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>

                  {formData.pdfUrl && (
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} /> File/URL PDF E-Book Siap Dibaca Digital!
                    </div>
                  )}
                </div>

                {/* DDC CLASSIFICATION FIELD */}
                <div className="form-group" style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.4)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="form-label" style={{ color: '#fbbf24', margin: 0, fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={18} /> Nomor Klasifikasi Buku (DDC / Dewey Decimal) *
                    </label>
                    
                    <button
                      type="button"
                      onClick={handleAutoRecommendDDC}
                      className="btn btn-emerald"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      <Sparkles size={14} /> ✨ Rekomendasi Otomatis DDC
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.ddc}
                      onChange={e => setFormData({ ...formData, ddc: e.target.value })}
                      placeholder="Contoh: 813"
                      style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', width: '160px', color: '#fbbf24', background: '#1e293b' }}
                      required
                    />

                    <select
                      className="form-select"
                      value=""
                      onChange={e => { if (e.target.value) setFormData({ ...formData, ddc: e.target.value }); }}
                      style={{ flex: 1, fontSize: '0.85rem' }}
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
                      <option value="Novel / Fiksi">Novel / Fiksi</option>
                      <option value="Sejarah / Sastra">Sejarah / Sastra</option>
                      <option value="Sains & Teknologi">Sains & Teknologi</option>
                      <option value="Komputer & IT">Komputer & IT</option>
                      <option value="Pengembangan Diri">Pengembangan Diri</option>
                      <option value="Agama & Keimanan">Agama & Keimanan</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lokasi Rak Buku</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.shelf}
                      onChange={e => setFormData({ ...formData, shelf: e.target.value })}
                      placeholder="Contoh: Rak A1 - Novel"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">ISBN / Barcode</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.isbn}
                      onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="Scan Barcode / ketik ISBN"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Stok Eksemplar</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value), available: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stok Tersedia</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.available}
                      onChange={e => setFormData({ ...formData, available: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                {/* Cover Image Selection Options */}
                <div className="form-group">
                  <label className="form-label">Gambar Sampul Buku</label>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <label 
                      className="btn btn-secondary"
                      style={{ cursor: 'pointer', fontSize: '0.82rem', width: '100%', justifyContent: 'flex-start' }}
                    >
                      <FolderOpen size={16} color="#10b981" />
                      <span>Upload Foto Sampul dari Komputer / HP Anda...</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLocalImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.coverUrl}
                      onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="Atau paste URL gambar / biarkan auto..."
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

      {/* E-BOOK DIGITAL READER MODAL WITH EMBEDDED PDF VIEWER */}
      {activeEbook && (
        <div className="modal-overlay" onClick={() => setActiveEbook(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText color="#10b981" size={22} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>E-Book Digital Reader: {activeEbook.title}</h3>
              </div>
              <button onClick={() => setActiveEbook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div className="modal-body" style={{ padding: '16px' }}>
              
              {/* If PDF URL exists, render embed PDF viewer iframe or direct PDF link */}
              {activeEbook.pdfUrl ? (
                <div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>
                      📄 File PDF E-Book Online Siap Dibaca
                    </span>
                    <a 
                      href={activeEbook.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-emerald"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      <ExternalLink size={14} /> Buka PDF Layar Penuh / Download
                    </a>
                  </div>

                  <iframe 
                    src={activeEbook.pdfUrl} 
                    title={activeEbook.title}
                    style={{ width: '100%', height: '520px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff' }}
                  />
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
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
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

    </div>
  );
}
