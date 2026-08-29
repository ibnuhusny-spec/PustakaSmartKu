import React, { useState } from 'react';
import { Search, BookOpen, Layers, MapPin, Eye, FileText, CheckCircle2, X, ExternalLink, Globe, Smartphone } from 'lucide-react';

export default function CatalogView({ books }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeEbook, setActiveEbook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);

  const categories = ['Semua', 'Novel / Fiksi', 'Sejarah / Sastra', 'Sains & Teknologi', 'Komputer & IT', 'Pengembangan Diri', 'Agama & Keimanan'];

  // Smart PDF URL Formatter (Auto-converts Google Drive links to universal preview mode)
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

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCat = selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Search Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search color="#3b82f6" /> Katalog OPAC (Online Public Access Catalog)
        </h2>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Cari judul buku, nama penulis, ISBN, atau kata kunci..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '46px', fontSize: '1rem', height: '48px' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {filteredBooks.map(book => {
          const hasDigitalPdf = Boolean(book.pdfUrl || book.ebookContent);
          const isDigitalOnly = hasDigitalPdf && Number(book.stock) === 0;

          return (
            <div key={book.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={book.coverUrl} 
                  alt={book.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                
                {/* Compact, High-Contrast Sleek Badges */}
                <div style={{ position: 'absolute', top: '6px', left: '6px', right: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(4px)',
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    {book.category}
                  </span>
                  {isDigitalOnly && (
                    <span style={{
                      background: 'rgba(6, 78, 59, 0.95)',
                      color: '#34d399',
                      border: '1px solid rgba(52, 211, 153, 0.5)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                    }}>
                      📱 DIGITAL E-BOOK
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                    {book.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    Oleh: {book.author} ({book.year})
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isDigitalOnly ? '#34d399' : '#f59e0b', fontWeight: 700 }}>
                      <MapPin size={13} /> {isDigitalOnly ? 'Rak E-Book Digital' : (book.shelf || 'Rak A1')}
                    </div>
                    {book.isbn && <div>ISBN: {book.isbn}</div>}
                    
                    {/* Dynamic Availability Display */}
                    {isDigitalOnly ? (
                      <div style={{ color: '#34d399', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}>
                        <Smartphone size={13} /> 📱 E-Book Digital (Akses 24/7)
                      </div>
                    ) : (
                      <div style={{ color: book.available > 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                        Ketersediaan: {book.available} dari {book.stock} Fisik
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact, Perfectly Centered Card Action Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button 
                    onClick={() => setDetailBook(book)}
                    className="btn btn-secondary catalog-card-btn"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <Eye size={13} /> <span>{hasDigitalPdf ? 'Detail' : 'Detail Informasi'}</span>
                  </button>
                  {hasDigitalPdf && (
                    <button 
                      onClick={() => setActiveEbook(book)}
                      className="btn btn-emerald catalog-card-btn"
                      style={{ flex: 1, minWidth: 0, fontWeight: 800 }}
                    >
                      <FileText size={13} /> <span>Baca PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {detailBook && (
        <div className="modal-overlay" onClick={() => setDetailBook(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Detail Informasi Buku</h3>
              <button onClick={() => setDetailBook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={18}/></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <img src={detailBook.coverUrl} alt={detailBook.title} style={{ width: '140px', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h3 style={{ margin: '0 0 6px 0' }}>{detailBook.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 10px 0' }}>Penulis: {detailBook.author} | Penerbit: {detailBook.publisher}</p>
                <div style={{ fontSize: '0.85rem', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Kategori:</strong> {detailBook.category}</div>
                  <div><strong>Format:</strong> {(detailBook.pdfUrl || detailBook.ebookContent) && Number(detailBook.stock) === 0 ? '📱 Digital E-Book Only' : '📚 Buku Fisik'}</div>
                  <div><strong>Lokasi Rak:</strong> {detailBook.shelf}</div>
                  {detailBook.isbn && <div><strong>ISBN:</strong> {detailBook.isbn}</div>}
                  <div>
                    <strong>Ketersediaan:</strong> {
                      (detailBook.pdfUrl || detailBook.ebookContent) && Number(detailBook.stock) === 0 
                        ? '📱 Akses Digital Online 24/7' 
                        : `${detailBook.available} / ${detailBook.stock} eksemplar fisik`
                    }
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  {detailBook.description || 'Kisah lengkap mengenai topik buku yang informatif dan bermanfaat bagi siswa.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL E-BOOK DIGITAL READER PREVIEW MODAL */}
      {activeEbook && (
        <div className="modal-overlay" onClick={() => setActiveEbook(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '880px', width: '92%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText color="#10b981" size={22} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>E-Book Digital Reader: {activeEbook.title}</h3>
              </div>
              <button onClick={() => setActiveEbook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={20}/></button>
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
                  <p>{activeEbook.ebookContent || activeEbook.description || 'Ini adalah pratinjau E-Book digital. Buku ini berisi pengetahuan berharga untuk pengembangan wawasan literasi sekolah.'}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveEbook(null)}>Tutup Reader</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
