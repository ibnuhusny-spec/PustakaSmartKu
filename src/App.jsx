import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import RFIDSimulator from './components/RFIDSimulator';
import AttendanceBanner from './components/AttendanceBanner';
import ReceiptModal from './components/ReceiptModal';
import CardPrinterModal from './components/CardPrinterModal';

import KioskView from './views/KioskView';
import CatalogView from './views/CatalogView';
import AttendanceView from './views/AttendanceView';
import TransactionsView from './views/TransactionsView';
import MembersView from './views/MembersView';
import BooksView from './views/BooksView';
import LeaderboardView from './views/LeaderboardView';
import SettingsView from './views/SettingsView';

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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('kiosk');
  
  // Theme state initialized from LocalStorage to persist across page refresh
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pustakasmart_theme') || 'dark';
  });

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
    // Set default logo to /perpustakaansmart.png if none specified
    if (!s.logoUrl) {
      s.logoUrl = '/perpustakaansmart.png';
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

  // Stop speech when switching tabs
  const handleTabChange = (newTab) => {
    stopSpeech();
    setActiveTab(newTab);
  };

  // Global RFID Scan Listener
  useEffect(() => {
    const handleRfidScan = (e) => {
      const scanData = e.detail; // { rfidUid, timestamp }
      setRfidScanEvent(scanData);

      // Auto Presensi Attendance if enabled & member exists
      const member = getMemberByRfid(scanData.rfidUid);
      if (member && settings.autoAttendanceOnTap && activeTab !== 'kiosk') {
        const att = recordAttendance(member, 'Presensi Otomatis RFID');
        refreshData();
        setActiveAttendanceToast(att);
        speakText(`Selamat datang, ${member.name}!`, settings.enableVoice);
      }
    };

    window.addEventListener('rfid-scanned', handleRfidScan);
    return () => window.removeEventListener('rfid-scanned', handleRfidScan);
  }, [settings, activeTab]);

  const handleRegisterUnregisteredCard = (uid) => {
    setPrefilledUidToRegister(uid);
    setActiveTab('members');
  };

  const handleOpenReceipt = (tx, member) => {
    setActiveReceiptModal({ isOpen: true, tx, member });
  };

  const handleOpenCardPrinter = (member) => {
    setActiveCardPrinterModal({ isOpen: true, member });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Animated Luxury Splash Screen */}
      {showSplash && (
        <SplashScreen 
          onFinish={() => setShowSplash(false)}
          schoolName={settings.schoolName}
          libraryName={settings.libraryName}
        />
      )}

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        theme={theme}
        setTheme={setTheme}
        onOpenRfidSimulator={() => setIsSimulatorOpen(true)}
        settings={settings}
      />

      {/* Main App Content View */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
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

        {activeTab === 'transactions' && (
          <TransactionsView 
            transactions={transactions}
            members={members}
            onRefreshData={refreshData}
            onOpenReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'members' && (
          <MembersView 
            members={members}
            onRefreshData={refreshData}
            onOpenCardPrinter={handleOpenCardPrinter}
            prefilledUidToRegister={prefilledUidToRegister}
            onClearPrefilledUid={() => setPrefilledUidToRegister(null)}
          />
        )}

        {activeTab === 'books' && (
          <BooksView 
            books={books}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView 
            members={members}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            settings={settings}
            onRefreshData={refreshData}
            onReplaySplash={() => setShowSplash(true)}
          />
        )}
      </main>

      {/* Modals & Floating Banners */}
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
