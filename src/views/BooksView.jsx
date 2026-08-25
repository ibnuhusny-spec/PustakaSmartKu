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
  Bookmark
} from 'lucide-react';
import { saveBook, deleteBook, clearSampleBooks, importBooksCSV } from '../services/db';

export default function BooksView({ books, onRefreshData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
    ebookContent: ''
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

    let suggestedDdc = ddcCategoryMap[formData.category] || '800';

    if (titleLower.includes('agama') || titleLower.includes('islam') || titleLower.includes('quran') || titleLower.includes('hadits') || titleLower.includes('shalat') || titleLower.includes('fiqih') || titleLower.includes('pai')) {
      suggestedDdc = '297';
    } else if (titleLower.includes('komputer') || titleLower.includes('web') || titleLower.includes('coding') || titleLower.includes('python') || titleLower.includes('javascript') || titleLower.includes('it')) {
      suggestedDdc = '005';
    } else if (titleLower.includes('fisika') || titleLower.includes('kimia') || titleLower.includes('biologi') || titleLower.includes('matematika') || titleLower.includes('sains') || titleLower.includes('ipa')) {
      suggestedDdc = '530';
    } else if (titleLower.includes('sejarah') || titleLower.includes('biografi') || titleLower.includes('perang') || titleLower.includes('kerajaan')) {
      suggestedDdc = '900';
    } else if (titleLower.includes('novel') || titleLower.includes('cerita') || titleLower.includes('dongeng') || titleLower.includes('fiksi')) {
      suggestedDdc = '813';
    }

    setFormData(prev => ({ ...prev, ddc: suggestedDdc }));
    alert(`✨ Rekomendasi DDC Diterapkan: Nomor ${suggestedDdc} cocok untuk buku "${formData.title || formData.category}"!`);
  };

  // Compress local image upload to lightweight 30KB thumbnail so localStorage limit is never exceeded
  const handleLocalImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 420;
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setFormData(prev => ({ ...prev, coverUrl: compressedDataUrl }));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.ddc && b.ddc.includes(searchTerm)) ||
    b.isbn.includes(searchTerm)
  );

  const handleOpenModal = (book = null) => {
    if (book) {
      setFormData({ ...book, ddc: book.ddc || ddcCategoryMap[book.category] || '800' });
    } else {
      setFormData({
        id: '',
        title: '',
        author: '',
        isbn: `978-602-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
        category: 'Novel / Fiksi',
        ddc: '813',
        publisher: 'Penerbit Sekolah',
        year: 2024,
        shelf: 'Rak A1',
        stock: 5,
        available: 5,
        coverUrl: '',
        description: 'Buku literasi inventaris sekolah.',
        ebookContent: 'Bab 1: Pengenalan Wawasan Baru...'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!formData.title || !formData.title.trim()) {
      alert('Mohon isi Judul Buku terlebih dahulu di bagian atas form!');
      return;
    }
    if (!formData.author || !formData.author.trim()) {
      alert('Mohon isi Nama Penulis / Pengarang terlebih dahulu!');
      return;
    }

    try {
      const finalCover = (formData.coverUrl && formData.coverUrl.trim()) 
        ? formData.coverUrl.trim() 
        : (categoryCovers[formData.category] || categoryCovers['Umum']);

      const bookToSave = { 
        ...formData, 
        title: formData.title.trim(), 
        author: formData.author.trim(), 
        coverUrl: finalCover,
        ddc: formData.ddc || '800'
      };

      saveBook(bookToSave);
      onRefreshData();
      setIsModalOpen(false);
      alert(`BERHASIL! Buku "${bookToSave.title}" (Klasifikasi DDC: ${bookToSave.ddc}) telah disimpan ke inventaris.`);
    } catch (err) {
      alert(`Gagal menyimpan buku: ${err.message}`);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus buku ini dari inventaris?')) {
      deleteBook(id);
      onRefreshData();
    }
  };

  const handleClearAllSampleBooks = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA DUMMY BUKU SAMPLE? Inventaris buku akan dikosongkan agar Anda dapat menginput data buku asli.')) {
      clearSampleBooks();
      onRefreshData();
      alert('Seluruh data sample buku berhasil dikosongkan!');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      alert('Silakan pilih file CSV atau tempelkan teks CSV!');
      return;
    }
    try {
      const count = importBooksCSV(csvText);
      onRefreshData();
      setIsImportModalOpen(false);
      setCsvText('');
      alert(`BERHASIL! ${count} judul buku telah berhasil diimpor ke perpustakaan!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadSampleBooksCSV = () => {
    const csvContent = "Judul,Penulis,Kategori,DDC,ISBN,Lokasi_Rak,Stok\n" +
      "Laskar Pelangi,Andrea Hirata,Novel / Fiksi,813,978-979-3062-79-2,Rak A1 - Novel,5\n" +
      "Bumi Manusia,Pramoedya Ananta Toer,Sejarah / Sastra,959,978-979-97312-3-5,Rak B2 - Sejarah,4\n" +
      "Fisika Modern SMA,Dr. Bambang Ruwanto,Sains & Teknologi,530,978-602-241-112-9,Rak C3 - IPA,8\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_buku.csv';
    a.click();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Real-time Inventory Stat Summary Cards */}
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
              <BookOpen color="#3b82f6" /> Managemen Inventaris & Stok Buku
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Input buku manual, scan ISBN barcode, rekomendasi klasifikasi DDC otomatis, atau impor dari Excel/CSV.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-emerald">
              <FileSpreadsheet size={16} /> Import Data Buku (CSV/Excel)
            </button>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <Plus size={16} /> Tambah Buku Baru
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
                <th style={{ padding: '12px' }}>ISBN / Barcode</th>
                <th style={{ padding: '12px' }}>Stok Tersedia / Total</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Inventaris buku masih kosong. Klik <strong>"+ Tambah Buku Baru"</strong> atau <strong>"Import Data Buku (CSV/Excel)"</strong> untuk menginput buku pertama Anda!
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
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{b.isbn}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {b.available <= 0 ? (
                        <span className="badge badge-rose" style={{ fontSize: '0.78rem' }}>
                          🔴 STOK HABIS (0 / {b.stock})
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
                          <Edit size={14} /> Edit / Restok
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="btn btn-rose"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                        >
                          <Trash2 size={14} />
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

      {/* IMPORT BOOKS CSV MODAL */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet color="#10b981" /> Import Koleksi Buku dari CSV / Excel
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={18}/></button>
            </div>
            <div className="modal-body">
              
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Unggah file **CSV / Excel** daftar buku sekolah Anda. Kolom yang dibutuhkan minimal memiliki judul **`Judul`** dan **`Penulis`**. Kolom **`DDC`** opsional.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button onClick={downloadSampleBooksCSV} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                  <Download size={14} /> Download Format Contoh CSV Buku
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Pilih File CSV / Excel (.csv)</label>
                <input 
                  type="file" 
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Atau Paste / Tempelkan Teks CSV Di Sini:</label>
                <textarea 
                  className="form-textarea"
                  rows="5"
                  placeholder="Judul,Penulis,Kategori,DDC,ISBN,Lokasi_Rak,Stok&#10;Laskar Pelangi,Andrea Hirata,Novel / Fiksi,813,978-979-3062-79-2,Rak A1 - Novel,5..."
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Batal</button>
              <button className="btn btn-emerald" onClick={handleProcessImport}>
                <Upload size={16} /> Impor Koleksi Buku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Form Input Buku & Klasifikasi DDC Perpustakaan</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label">Judul Buku *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul buku..."
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

                {/* DDC CLASSIFICATION FIELD WITH SMART AUTO-RECOMMEND & HELPER */}
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
                      placeholder="Contoh: 813 (Novel/Fiksi) atau 297 (Islam)"
                      style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', width: '160px', color: '#fbbf24', background: '#1e293b' }}
                      required
                    />

                    {/* Quick Helper Selector */}
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

                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    💡 <em>Tip Klasifikasi Cepat:</em> Klik tombol <strong>"✨ Rekomendasi Otomatis DDC"</strong> di atas atau pilih kodenya dari menu di kanan.
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
                    <label className="form-label">Stok Tersedia Saat Ini</label>
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
                  <label className="form-label">Gambar Sampul Buku (Foto Komputer / HP)</label>
                  
                  {/* File Upload Input */}
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
                      title="Generasi Sampul Buku Sesuai Kategori"
                    >
                      <Sparkles size={14} /> Auto Sampul
                    </button>
                  </div>

                  {/* Image Preview */}
                  {formData.coverUrl && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={formData.coverUrl} 
                        alt="Preview" 
                        style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                      />
                      <span style={{ fontSize: '0.78rem', color: '#34d399' }}>✓ Pratinjau Sampul Gambar Berhasil Dimuat</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi / Sinopsis Buku</label>
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
                <button type="button" className="btn btn-primary" onClick={(e) => handleSave(e)}>Simpan Buku</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
