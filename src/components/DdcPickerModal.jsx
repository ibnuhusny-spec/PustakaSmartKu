import React, { useState } from 'react';
import { Search, Bookmark, Check, X, BookOpen, Tag, Sparkles } from 'lucide-react';
import { DDC_MAIN_CLASSES, DDC_DETAILED_DATABASE } from '../services/ddcData';

export default function DdcPickerModal({ isOpen, onClose, onSelectDdc, currentCode = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainClass, setSelectedMainClass] = useState('ALL');

  if (!isOpen) return null;

  const filteredList = DDC_DETAILED_DATABASE.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedMainClass === 'ALL' || item.mainClass === selectedMainClass;
    return matchesSearch && matchesClass;
  });

  const handleSelect = (item) => {
    onSelectDdc(item);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', maxHeight: '85vh' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Bookmark size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Pencari & Pemilih Klasifikasi DDC Detail</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Dewey Decimal Classification (DDC) Lengkap & Spesifik Sub-Kategori
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          
          {/* Live Search Field */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Cari nomor kode atau nama topik DDC (Contoh: Al-Qur'an, Fiqih, 297, Komputer, Fisika, Biografi)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
              autoFocus
            />
          </div>

          {/* Main Class Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => setSelectedMainClass('ALL')}
              className="btn"
              style={{
                fontSize: '0.78rem',
                padding: '5px 12px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                background: selectedMainClass === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: selectedMainClass === 'ALL' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              Semua (000 - 900)
            </button>
            {DDC_MAIN_CLASSES.map(cls => (
              <button
                key={cls.code}
                onClick={() => setSelectedMainClass(cls.code)}
                className="btn"
                style={{
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                  background: selectedMainClass === cls.code ? cls.color : 'var(--bg-secondary)',
                  color: selectedMainClass === cls.code ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {cls.code}
              </button>
            ))}
          </div>

          {/* Results Count Info */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Menampilkan <strong>{filteredList.length}</strong> Kode DDC Klasifikasi Detail:</span>
            <span>* Klik tombol "Pilih" untuk menerapkan ke form buku</span>
          </div>

          {/* DDC Items Grid / List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
            {filteredList.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                Tidak ada klasifikasi DDC yang cocok dengan kata kunci pencarian Anda.
              </div>
            ) : (
              filteredList.map(item => {
                const isSelected = currentCode === item.code;
                return (
                  <div
                    key={item.code}
                    onClick={() => handleSelect(item)}
                    style={{
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          background: '#10b981',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          DDC {item.code}
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                          {item.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.label}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`btn ${isSelected ? 'btn-emerald' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                    >
                      {isSelected ? <Check size={14} /> : <Sparkles size={14} />}
                      <span>{isSelected ? 'Terpilih' : 'Pilih'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
