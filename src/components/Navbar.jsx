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
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onOpenRfidSimulator, 
  settings,
  isAdminAuthed,
  onOpenAdminPortal
}) {
  // Public tabs visible on the top navbar
  const publicTabs = [
    { id: 'kiosk', label: 'Mode Kios Mandiri', icon: Radio },
    { id: 'catalog', label: 'Katalog OPAC', icon: Search },
    { id: 'attendance', label: 'Presensi Kehadiran', icon: UserCheck },
    { id: 'leaderboard', label: 'Duta Baca', icon: Trophy },
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

        {/* Public Tab Navigation Items */}
        <nav style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {publicTabs.map(tab => {
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
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Quick Utilities (Portal Admin Button, Simulator & Theme Toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* SINGLE UNIFIED ADMIN PORTAL BUTTON */}
          <button 
            onClick={onOpenAdminPortal}
            className={`btn ${activeTab === 'admin_portal' ? 'btn-rose' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.82rem', 
              padding: '8px 14px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              border: isAdminAuthed ? '1px solid #10b981' : '1px solid rgba(244, 63, 94, 0.4)' 
            }}
            title="Portal Masuk Khusus Petugas Admin Perpustakaan"
          >
            {isAdminAuthed ? (
              <>
                <ShieldCheck size={16} color="#34d399" />
                <span style={{ color: '#34d399', fontWeight: 800 }}>Portal Admin</span>
              </>
            ) : (
              <>
                <Lock size={16} color="#fb7185" />
                <span style={{ color: '#fb7185', fontWeight: 700 }}>Portal Admin</span>
              </>
            )}
          </button>

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
