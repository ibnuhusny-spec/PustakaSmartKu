import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import RFIDSimulator from './components/RFIDSimulator';
import AttendanceBanner from './components/AttendanceBanner';
import ReceiptModal from './components/ReceiptModal';
import CardPrinterModal from './components/CardPrinterModal';
import AdminPinModal from './components/AdminPinModal';
import LicenseModal from './components/LicenseModal';
import ServerConnectModal from './components/ServerConnectModal';

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
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
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
    if (!s.schoolEmail) {
      s.schoolEmail = 'perpustakaan@sditqurratuayun.sch.id';
      saveSettings(s);
    }
    if (!s.maxLoanDays || s.maxLoanDays === 7) {
      s.maxLoanDays = 3;
      saveSettings(s);
    }
    s.enableAdminPin = true;
    saveSettings(s);
    setSettings(s);
    setBooks(getBooks());
    setMembers(getMembers());
    setTransactions(getTransactions());
    setAttendance(getAttendance());
  };

  useEffect(() => {
    const initApp = async () => {
      initDB();
      refreshData();
      // Pull live SQLite database from main laptop server!
      await syncLocalToSqliteServer();
      refreshData();
    };

    initApp();

    // Helper to check if librarian is actively typing in a form input
    const isUserTypingInForm = () => {
      const activeEl = document.activeElement;
      return activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable
      );
    };

    // Auto-sync live database every 12 seconds only if not currently typing in a form
    const syncInterval = setInterval(async () => {
      if (!isUserTypingInForm()) {
        await syncLocalToSqliteServer();
        refreshData();
      }
    }, 12000);

    const handleFocus = async () => {
      if (!isUserTypingInForm()) {
        await syncLocalToSqliteServer();
        refreshData();
      }
    };

    window.addEventListener('focus', handleFocus);

    const cleanupListener = initRfidKeyboardListener();
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      cleanupListener();
    };
  }, []);

  // Sync Theme attribute and persist in LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pustakasmart_theme', theme);
  }, [theme]);

  // Anti-Inspect / Anti-DevTools Protection Listener (Disables F12, Right Click, & Ctrl+Shift+I)
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (settings?.licenseType !== 'pro') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      if (settings?.licenseType !== 'pro') {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
          (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings]);

  // Tab Navigation Switcher: Auto-lock Admin session when navigating away from Admin Portal
  const handleTabChange = (newTab) => {
    stopSpeech();
    if (activeTab === 'admin_portal' && newTab !== 'admin_portal') {
      // Auto-lock Admin Portal session as soon as librarian leaves to a public tab!
      setIsAdminAuthed(false);
      sessionStorage.removeItem('pustakasmart_admin_authed');
    }
    setActiveTab(newTab);
  };

  // Open Admin Portal (ALWAYS mandate PIN verification if not currently authed)
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
  };

  const handleActivateLicenseSuccess = async (key) => {
    const updated = {
      ...settings,
      licenseType: 'pro',
      licenseKey: key
    };
    setSettings(updated);
    await saveSettings(updated);
    await syncLocalToSqliteServer();
    setIsLicenseModalOpen(false);
  };

  // Global RFID Scan Listener
  useEffect(() => {
    const handleRfidScan = (e) => {
      const scanData = e.detail;
      if (!scanData || !scanData.rfidUid) return;
      setRfidScanEvent(scanData);

      const member = getMemberByRfid(scanData.rfidUid);
      // Auto attendance voice ONLY triggers on Attendance View tab!
      if (member && settings.autoAttendanceOnTap && activeTab === 'attendance') {
        const result = recordAttendance(scanData.rfidUid, 'Presensi Tap Mandiri');
        if (result.success) {
          setActiveAttendanceToast(result.attendance);
          if (settings.enableVoice) {
            speakText(`Selamat datang di perpustakaan, ${member.name}!`);
          }
          refreshData();
        }
      }
    };

    window.addEventListener('rfid-scanned', handleRfidScan);
    window.addEventListener('rfid-scan', handleRfidScan);
    return () => {
      window.removeEventListener('rfid-scanned', handleRfidScan);
      window.removeEventListener('rfid-scan', handleRfidScan);
    };
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
  const isTrialExpired = daysRemaining <= 0 && settings?.licenseType !== 'pro';

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} settings={settings} />;
  }

  // HARD LOCKOUT RENDER: If trial is expired, NOTHING ELSE is rendered into the DOM at all!
  if (isTrialExpired) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LicenseModal 
          isOpen={true}
          onClose={() => {}}
          onActivateSuccess={handleActivateLicenseSuccess}
          currentLicenseType={settings?.licenseType || 'trial'}
          daysRemaining={0}
          schoolName={settings?.schoolName}
          schoolEmail={settings?.schoolEmail}
          isExpiredLockout={true}
        />
      </div>
    );
  }

  return (
    <div className="app-layout">
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        theme={theme}
        setTheme={setTheme}
        onOpenRfidSimulator={() => setIsSimulatorOpen(true)}
        onOpenServerConnect={() => setIsServerModalOpen(true)}
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
        schoolName={settings?.schoolName}
        schoolEmail={settings?.schoolEmail}
        isExpiredLockout={false}
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

      <ServerConnectModal 
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onRefreshData={refreshData}
      />

    </div>
  );
}
