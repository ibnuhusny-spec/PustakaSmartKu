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
  LayoutDashboard,
  Award,
  Sparkles
} from 'lucide-react';

import defaultLogo from '../assets/logo.png';
import { getTrialDaysRemaining } from '../services/licenseService';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onOpenRfidSimulator, 
  settings,
  isAdminAuthed,
  onOpenAdminPortal,
  onOpenLicenseModal
}) {
  const publicTabs = [
    { id: 'kiosk', label: 'Mode Kios Mandiri', icon: Radio },
    { id: 'catalog', label: 'Katalog OPAC', icon: Search },
    { id: 'attendance', label: 'Presensi Kehadiran', icon: UserCheck },
    { id: 'leaderboard', label: 'Duta Baca', icon: Trophy },
  ];

  const daysRemaining = getTrialDaysRemaining(settings?.trialStartDate);
  const isPro = settings?.licenseType === 'pro';

  // Determine active logo source with reliable fallback to bundled defaultLogo
  const logoSrc = (settings?.schoolLogoUrl && settings.schoolLogoUrl.trim()) 
    ? settings.schoolLogoUrl 
    : ((settings?.logoUrl && settings.logoUrl.trim() && settings.logoUrl.startsWith('data:')) ? settings.logoUrl : defaultLogo);

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
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={logoSrc} 
              alt="Logo Sekolah" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = defaultLogo; }}
            />
          </div>

          <div>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              margin: 0, 
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              PustakaSmart <span style={{ color: '#10b981' }}>RFID</span>
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI"}</span>
            </div>
          </div>
        </div>

        {/* Center Tabs Navigation Bar */}
        <nav style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          {publicTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : (theme === 'light' ? '#334155' : '#94a3b8')} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Unified Single Admin Portal Drawer Button */}
          <button
            onClick={onOpenAdminPortal}
            className={`nav-tab ${activeTab === 'admin_portal' ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'admin_portal' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : (theme === 'light' ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)'),
              color: activeTab === 'admin_portal' ? '#ffffff' : (theme === 'light' ? '#047857' : '#34d399'),
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: theme === 'light' && activeTab !== 'admin_portal' ? '1px solid #a7f3d0' : 'none',
              boxShadow: activeTab === 'admin_portal' ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <ShieldCheck size={16} color={activeTab === 'admin_portal' ? '#ffffff' : (theme === 'light' ? '#047857' : '#34d399')} />
            <span>🔐 Portal Admin</span>
          </button>
        </nav>

        {/* Right Tools & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* License Status Badge Button */}
          <button
            type="button"
            onClick={onOpenLicenseModal}
            className="btn btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: isPro ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
              background: isPro ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isPro ? '#34d399' : '#fbbf24',
              fontWeight: 700
            }}
          >
            <Award size={14} />
            <span>{isPro ? '✨ PRO LICENSE' : `⏱️ Trial (${daysRemaining} Hari)`}</span>
          </button>

          {/* Simulation Helper Tool */}
          <button 
            onClick={onOpenRfidSimulator}
            className="btn btn-secondary"
            title="Simulator RFID Test Tap Card"
            style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Radio size={14} color="#10b981" />
            <span style={{ display: 'none', '@media (minWidth: 640px)': { display: 'inline' } }}>Simulasi RFID</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', minWidth: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#3b82f6" />}
          </button>
        </div>

      </div>
    </header>
  );
}
