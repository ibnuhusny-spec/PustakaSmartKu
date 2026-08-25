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
  FileText
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, setTheme, onOpenRfidSimulator, settings }) {
  const tabs = [
    { id: 'kiosk', label: 'Mode Kios Mandiri', icon: Radio },
    { id: 'catalog', label: 'Katalog OPAC', icon: Search },
    { id: 'attendance', label: 'Presensi Kehadiran', icon: UserCheck },
    { id: 'transactions', label: 'Peminjaman & Denda', icon: RotateCcw },
    { id: 'members', label: 'Anggota & Kartu RFID', icon: Users },
    { id: 'books', label: 'Manajemen Buku', icon: BookOpen },
    { id: 'leaderboard', label: 'Duta Baca', icon: Trophy },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
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
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '8px 14px', 
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Quick Utilities (Simulator & Theme Toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={onOpenRfidSimulator}
            className="btn btn-emerald"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Radio size={16} />
            <span>Tap RFID Simulator</span>
          </button>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
            title="Ganti Tema Gelap / Terang"
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#8b5cf6" />}
          </button>
        </div>

      </div>
    </header>
  );
}
