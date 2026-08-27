import React from 'react';
import { 
  BookOpen, 
  UserCheck, 
  RotateCcw, 
  Users, 
  Trophy, 
  Settings, 
  Radio, 
  Sun, 
  Moon,
  Search,
  FileText,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onOpenRfidSimulator, 
  settings,
  isAdminAuthed,
  onLockAdminSession,
  onOpenAdminPinModal
}) {
  const tabs = [
    { id: 'kiosk', label: 'Mode Kios Mandiri', icon: Radio, isProtected: false },
    { id: 'catalog', label: 'Katalog OPAC', icon: Search, isProtected: false },
    { id: 'attendance', label: 'Presensi Kehadiran', icon: UserCheck, isProtected: false },
    { id: 'leaderboard', label: 'Duta Baca', icon: Trophy, isProtected: false },
    { id: 'transactions', label: 'Peminjaman & Denda', icon: RotateCcw, isProtected: true },
    { id: 'members', label: 'Anggota & Kartu RFID', icon: Users, isProtected: true },
    { id: 'books', label: 'Manajemen Buku', icon: BookOpen, isProtected: true },
    { id: 'settings', label: 'Pengaturan', icon: Settings, isProtected: true },
  ];

  return (
    <header className="glass-card" style={{ 
      margin: '12px 16px 0 16px', 
      borderRadius: 'var(--radius-md)',
      padding: '12px 20px',
      position: 'sticky',
      top: '12px',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {settings?.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt="Logo Sekolah" 
              style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} 
            />
          ) : (
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <BookOpen size={24} />
            </div>
          )}

          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              {settings?.schoolName || 'PustakaSmart RFID'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              {settings?.libraryName || 'Perpustakaan Digital Sekolah'}
            </p>
          </div>
        </div>

        {/* Tab Navigation Items */}
        <nav style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showLockIcon = tab.isProtected && !isAdminAuthed;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '8px 14px', 
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {showLockIcon && <Lock size={12} color="#fb7185" style={{ marginLeft: '2px' }} />}
              </button>
            );
          })}
        </nav>

        {/* Action Quick Utilities (Admin Security Lock, Simulator & Theme Toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* ADMIN LOCK / UNLOCK STATUS BUTTON */}
          {isAdminAuthed ? (
            <button 
              onClick={onLockAdminSession}
              className="btn btn-rose"
              style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Kunci Akses Admin (Kembali ke Mode Publik Siswa)"
            >
              <Unlock size={14} /> 🔓 Admin Aktif (Kunci)
            </button>
          ) : (
            <button 
              onClick={onOpenAdminPinModal}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(244, 63, 94, 0.4)' }}
              title="Masukkan PIN Admin untuk Membuka Fitur Petugas"
            >
              <Lock size={14} color="#fb7185" /> <span style={{ color: '#fb7185' }}>Mode Siswa (Login Admin)</span>
            </button>
          )}

          <button 
            onClick={onOpenRfidSimulator}
            className="btn btn-emerald"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            title="Simulator Scanner Hardware RFID"
          >
            <Radio size={14} /> Simulator RFID
          </button>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
            title="Beralih Mode Gelap/Terang"
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#60a5fa" />}
          </button>
        </div>

      </div>
    </header>
  );
}
