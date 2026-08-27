import React, { useState } from 'react';
import { Search, BookOpen, Layers, MapPin, Eye, FileText, CheckCircle2, X, ExternalLink } from 'lucide-react';

export default function CatalogView({ books }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeEbook, setActiveEbook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);

  const categories = ['Semua', 'Novel / Fiksi', 'Sejarah / Sastra', 'Sains & Teknologi', 'Komputer & IT', 'Pengembangan Diri', 'Agama & Keimanan'];

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
        {filteredBooks.map(book => (
          <div key={book.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={book.coverUrl} 
                alt={book.title}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <span className="badge badge-purple" style={{ position: 'absolute', top: '10px', left: '10px', backdropFilter: 'blur(8px)' }}>
                {book.category}
              </span>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {book.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                  Oleh: {book.author} ({book.year})
                </p>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#f59e0b" /> {book.shelf || 'Rak A1'}
                  </div>
                  <div>ISBN: {book.isbn}</div>
                  <div style={{ color: book.available > 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                    Ketersediaan: {book.available} dari {book.stock} Eksemplar
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setDetailBook(book)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                >
                  <Eye size={14} /> Detail
                </button>
                <button 
                  onClick={() => setActiveEbook(book)}
                  className="btn btn-emerald"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                >
                  <FileText size={14} /> E-Book
                </button>
              </div>
            </div>
          </div>
        ))}
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
                  <div><strong>Lokasi Rak:</strong> {detailBook.shelf}</div>
                  <div><strong>ISBN:</strong> {detailBook.isbn}</div>
                  <div><strong>Stok:</strong> {detailBook.available} / {detailBook.stock} tersedia</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  {detailBook.description || 'Kisah lengkap mengenai topik buku yang informatif dan bermanfaat bagi siswa.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL E-BOOK READER PREVIEW MODAL */}
      {activeEbook && (
        <div className="modal-overlay" onClick={() => setActiveEbook(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText color="#10b981" size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>E-Book Digital Reader: {activeEbook.title}</h3>
              </div>
              <button onClick={() => setActiveEbook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={18}/></button>
            </div>
            
            <div className="modal-body" style={{ padding: '16px' }}>
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
