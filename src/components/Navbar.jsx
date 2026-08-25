import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CreditCard, 
  LayoutDashboard, 
  Users, 
  History, 
  UserCheck, 
  Trophy, 
  Settings, 
  Sun, 
  Moon, 
  Radio, 
  Sparkles,
  Search
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onOpenRfidSimulator, 
  settings 
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'kiosk', label: 'Mode Kios Mandiri', icon: Radio, highlight: true },
    { id: 'catalog', label: 'Katalog OPAC', icon: Search },
    { id: 'attendance', label: 'Presensi Siswa', icon: UserCheck },
    { id: 'transactions', label: 'Peminjaman & Denda', icon: History },
    { id: 'members', label: 'Anggota RFID', icon: Users },
    { id: 'books', label: 'Manajemen Buku', icon: BookOpen },
    { id: 'leaderboard', label: 'Duta Baca', icon: Trophy },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo & School Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <CreditCard size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              PustakaSmart RFID
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              {settings.schoolName || 'Perpustakaan Digital Sekolah'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive 
                    ? (item.highlight ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'var(--accent-primary)')
                    : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? 'none' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Clock */}
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            color: 'var(--text-secondary)',
            background: 'var(--bg-secondary)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            {time.toLocaleTimeString('id-ID')}
          </div>

          {/* RFID Tap Simulator Launcher */}
          <button 
            onClick={onOpenRfidSimulator}
            className="btn btn-emerald rfid-pulse"
            title="Buka Virtual RFID Tap Scanner"
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
          >
            <Radio size={16} />
            <span>Tap RFID Simulator</span>
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            title="Ganti Tema"
            style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#3b82f6" />}
          </button>
        </div>

      </div>
    </header>
  );
}
