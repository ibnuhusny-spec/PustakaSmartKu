import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import RFIDSimulator from './components/RFIDSimulator';
import AttendanceBanner from './components/AttendanceBanner';
import ReceiptModal from './components/ReceiptModal';
import CardPrinterModal from './components/CardPrinterModal';
import AdminPinModal from './components/AdminPinModal';
import LicenseModal from './components/LicenseModal';

import KioskView from './views/KioskView';
import CatalogView from './views/CatalogView';
import AttendanceView from './views/AttendanceView';
import LeaderboardView from './views/LeaderboardView';
import AdminPortalView from './views/AdminPortalView';

import {
  initDB,
  getSettings,
  saveSettings,
  getBooks,
  getMembers,
  getTransactions,
  getAttendance,
  getMemberByRfid,
  recordAttendance
} from './services/db';

import { initRfidKeyboardListener } from './services/rfidService';
import { speakText, stopSpeech } from './services/audioService';
import { getTrialDaysRemaining } from './services/licenseService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog');
  
  // Theme state initialized from LocalStorage to persist across page refresh
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pustakasmart_theme') || 'dark';
  });

  // Admin Authentication State
  const [isAdminAuthed, setIsAdminAuthed] = useState(() => {
    return sessionStorage.getItem('pustakasmart_admin_authed') === 'true';
  });
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // Database States
  const [settings, setSettings] = useState(getSettings());
  const [books, setBooks] = useState(getBooks());
  const [members, setMembers] = useState(getMembers());
  const [transactions, setTransactions] = useState(getTransactions());
  const [attendance, setAttendance] = useState(getAttendance());

  // Active RFID scan tracker object
  const [rfidScanEvent, setRfidScanEvent] = useState(null);
  const [prefilledUidToRegister, setPrefilledUidToRegister] = useState(null);
  const [activeAttendanceToast, setActiveAttendanceToast] = useState(null);

  // Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState({ isOpen: false, tx: null, member: null });
  const [activeCardPrinterModal, setActiveCardPrinterModal] = useState({ isOpen: false, member: null });

  const refreshData = () => {
    const s = getSettings();
    if (!s.logoUrl) {
      s.logoUrl = '/perpustakaansmart.png';
      saveSettings(s);
    }
    if (!s.adminPin || s.adminPin === '1234') {
      s.adminPin = 'PustakaSmart2026';
      saveSettings(s);
    }
    setSettings(s);
    setBooks(getBooks());
    setMembers(getMembers());
    setTransactions(getTransactions());
    setAttendance(getAttendance());
  };

  useEffect(() => {
    initDB();
    refreshData();
    const cleanupListener = initRfidKeyboardListener();
    return () => cleanupListener();
  }, []);

  // Sync Theme attribute and persist in LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pustakasmart_theme', theme);
  }, [theme]);

  // Tab Navigation Switcher
  const handleTabChange = (newTab) => {
    stopSpeech();
    setActiveTab(newTab);
  };

  // Open Admin Portal (prompt PIN if not logged in)
  const handleOpenAdminPortal = () => {
    stopSpeech();
    if (isAdminAuthed) {
      setActiveTab('admin_portal');
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  const handleAdminPinSuccess = () => {
    setIsAdminAuthed(true);
    sessionStorage.setItem('pustakasmart_admin_authed', 'true');
    setIsAdminPinModalOpen(false);
    setActiveTab('admin_portal');
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthed(false);
    sessionStorage.removeItem('pustakasmart_admin_authed');
    setActiveTab('catalog');
    alert('🔒 Sesi Admin Perpustakaan berhasil dikunci! Aplikasi kini kembali ke Mode Publik Siswa.');
  };

  const handleActivateLicenseSuccess = (key) => {
    const updated = {
      ...settings,
      licenseType: 'pro',
      licenseKey: key
    };
    setSettings(updated);
    saveSettings(updated);
    setIsLicenseModalOpen(false);
  };

  // Global RFID Scan Listener
  useEffect(() => {
    const handleRfidScan = (e) => {
      const scanData = e.detail; // { rfidUid, timestamp }
      setRfidScanEvent(scanData);

      // Auto Presensi Attendance if enabled & member exists
      const member = getMemberByRfid(scanData.rfidUid);
      if (member && settings.autoAttendanceOnTap && activeTab !== 'kiosk') {
        const result = recordAttendance(scanData.rfidUid, 'Presensi Tap Mandiri');
        if (result.success) {
          setActiveAttendanceToast(result.attendance);
          if (settings.enableVoice) {
            speakText(`Selamat datang, ${member.name}. Selamat membaca di perpustakaan.`);
          }
          refreshData();
        }
      }
    };

    window.addEventListener('rfid-scan', handleRfidScan);
    return () => window.removeEventListener('rfid-scan', handleRfidScan);
  }, [settings, activeTab]);

  const handleOpenReceipt = (tx, member) => {
    setActiveReceiptModal({ isOpen: true, tx, member });
  };

  const handleOpenCardPrinter = (member) => {
    setActiveCardPrinterModal({ isOpen: true, member });
  };

  const handleRegisterUnregisteredCard = (uid) => {
    setPrefilledUidToRegister(uid);
    handleOpenAdminPortal();
  };

  const daysRemaining = getTrialDaysRemaining(settings?.trialStartDate);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} settings={settings} />;
  }

  return (
    <div className="app-layout">
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        theme={theme}
        setTheme={setTheme}
        onOpenRfidSimulator={() => setIsSimulatorOpen(true)}
        settings={settings}
        isAdminAuthed={isAdminAuthed}
        onOpenAdminPortal={handleOpenAdminPortal}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
      />

      <main style={{ paddingBottom: '40px' }}>
        {activeTab === 'kiosk' && (
          <KioskView 
            rfidScanEvent={rfidScanEvent}
            members={members}
            books={books}
            transactions={transactions}
            onRefreshData={refreshData}
            onOpenReceipt={handleOpenReceipt}
            onRegisterUnregisteredCard={handleRegisterUnregisteredCard}
            settings={settings}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogView books={books} />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView 
            attendance={attendance} 
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView 
            members={members}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'admin_portal' && (
          <AdminPortalView 
            settings={settings}
            books={books}
            members={members}
            transactions={transactions}
            attendance={attendance}
            onRefreshData={refreshData}
            onOpenReceipt={handleOpenReceipt}
            onOpenCardPrinter={handleOpenCardPrinter}
            prefilledUidToRegister={prefilledUidToRegister}
            onClearPrefilledUid={() => setPrefilledUidToRegister(null)}
            onLockAdminSession={handleLockAdminSession}
            onReplaySplash={() => setShowSplash(true)}
          />
        )}
      </main>

      {/* Modals & Floating Banners */}
      <AdminPinModal 
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminPinSuccess}
        adminPin={settings?.adminPin || 'PustakaSmart2026'}
        targetTabName="Portal Petugas Admin"
      />

      <LicenseModal 
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onActivateSuccess={handleActivateLicenseSuccess}
        currentLicenseType={settings?.licenseType || 'trial'}
        daysRemaining={daysRemaining}
      />

      <RFIDSimulator 
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        members={members}
      />

      <AttendanceBanner 
        attendance={activeAttendanceToast}
        onClose={() => setActiveAttendanceToast(null)}
      />

      <ReceiptModal 
        isOpen={activeReceiptModal.isOpen}
        onClose={() => setActiveReceiptModal({ isOpen: false, tx: null, member: null })}
        transaction={activeReceiptModal.tx}
        member={activeReceiptModal.member}
        settings={settings}
      />

      <CardPrinterModal 
        isOpen={activeCardPrinterModal.isOpen}
        onClose={() => setActiveCardPrinterModal({ isOpen: false, member: null })}
        member={activeCardPrinterModal.member}
        settings={settings}
      />

    </div>
  );
}
