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

import appLogo from '../assets/logo.png';
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
  const isLight = theme === 'light';

  return (
    <header className="glass-card" style={{ 
      margin: '12px 16px 0 16px', 
      borderRadius: 'var(--radius-md)',
      padding: '12px 20px',
      position: 'sticky',
      top: '12px',
      zIndex: 100,
      background: isLight ? '#ffffff' : 'rgba(17, 24, 39, 0.85)',
      border: isLight ? '1.5px solid #cbd5e1' : '1px solid var(--border-color)',
      boxShadow: isLight ? '0 4px 16px rgba(15, 23, 42, 0.08)' : '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo & Title - Always uses PustakaSmart Software Application Logo */}
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <img 
              src={appLogo} 
              alt="Logo PustakaSmart" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = appLogo; }}
            />
          </div>

          <div>
            <h1 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 900, 
              margin: 0, 
              color: isLight ? '#0f172a' : '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              PustakaSmart <span style={{ color: '#10b981' }}>RFID</span>
            </h1>
            <div style={{ fontSize: '0.78rem', color: isLight ? '#334155' : '#cbd5e1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI"}</span>
            </div>
          </div>
        </div>

        {/* Center Tabs Navigation Bar */}
        <nav style={{ 
          display: 'flex', 
          gap: '6px', 
          background: isLight ? '#f1f5f9' : 'rgba(15, 23, 42, 0.6)', 
          padding: '5px', 
          borderRadius: '10px', 
          border: isLight ? '1.5px solid #cbd5e1' : '1px solid var(--border-color)', 
          flexWrap: 'wrap' 
        }}>
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
                  borderRadius: '8px',
                  border: isLight 
                    ? (isActive ? '1.5px solid #1d4ed8' : '1px solid #cbd5e1') 
                    : 'none',
                  background: isActive 
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                    : (isLight ? '#ffffff' : 'transparent'),
                  color: isActive 
                    ? '#ffffff' 
                    : (isLight ? '#0f172a' : '#cbd5e1'),
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isActive 
                    ? (isLight ? '0 4px 14px rgba(37, 99, 235, 0.45)' : '0 4px 14px rgba(37, 99, 235, 0.35)') 
                    : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : (isLight ? '#2563eb' : '#94a3b8')} />
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
              borderRadius: '8px',
              border: isLight 
                ? (activeTab === 'admin_portal' ? '1.5px solid #047857' : '1px solid #6ee7b7') 
                : 'none',
              background: activeTab === 'admin_portal' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : (isLight ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)'),
              color: activeTab === 'admin_portal' 
                ? '#ffffff' 
                : (isLight ? '#065f46' : '#34d399'),
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'admin_portal' ? '0 4px 14px rgba(16, 185, 129, 0.45)' : 'none'
            }}
          >
            <ShieldCheck size={16} color={activeTab === 'admin_portal' ? '#ffffff' : (isLight ? '#059669' : '#34d399')} />
            <span>🔐 Portal Admin</span>
          </button>
        </nav>

        {/* Right Tools & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* License Status Badge Button */}
          <button
            type="button"
            onClick={onOpenLicenseModal}
            className={`btn ${isPro ? 'badge-emerald' : 'badge-amber'}`}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Award size={14} />
            {isPro ? (
              <span>PRO LICENSE</span>
            ) : (
              <span>TRIAL ({daysRemaining} HARI)</span>
            )}
          </button>

          {/* RFID Hardware Simulator Floating Launcher */}
          <button 
            onClick={onOpenRfidSimulator}
            className="btn btn-secondary"
            style={{ 
              padding: '8px 12px', 
              fontSize: '0.8rem', 
              borderRadius: 'var(--radius-sm)',
              borderColor: '#10b981',
              color: isLight ? '#065f46' : '#34d399',
              background: isLight ? '#d1fae5' : 'rgba(16, 185, 129, 0.1)'
            }}
            title="Buka RFID Card Tap Simulator"
          >
            <Radio size={16} color="#10b981" />
          </button>

          {/* Theme Switcher Button */}
          <button 
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className="btn btn-secondary"
            style={{ 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)',
              border: isLight ? '1.5px solid #cbd5e1' : '1px solid var(--border-color)',
              background: isLight ? '#f1f5f9' : 'transparent',
              color: isLight ? '#0f172a' : '#ffffff'
            }}
            title={isLight ? 'Ganti ke Dark Mode' : 'Ganti ke Light Mode'}
          >
            {isLight ? <Moon size={18} color="#0f172a" /> : <Sun size={18} color="#fbbf24" />}
          </button>

        </div>

      </div>
    </header>
  );
}
