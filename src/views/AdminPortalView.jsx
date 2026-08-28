import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  RotateCcw, 
  Settings, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  UserCheck, 
  AlertTriangle, 
  Sparkles,
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';

import BooksView from './BooksView';
import MembersView from './MembersView';
import TransactionsView from './TransactionsView';
import SettingsView from './SettingsView';

import { getLocalDateString } from '../services/db';

export default function AdminPortalView({ 
  settings, 
  books, 
  members, 
  transactions, 
  attendance, 
  onRefreshData,
  onOpenReceipt,
  onOpenCardPrinter,
  prefilledUidToRegister,
  onClearPrefilledUid,
  onLockAdminSession,
  onReplaySplash
}) {
  const [adminSubTab, setAdminSubTab] = useState('overview');

  // KPI Overview calculations
  const totalBooks = books.length;
  const totalPhysicalCopies = books.reduce((acc, b) => acc + (Number(b.stock) || 0), 0);
  const totalMembers = members.length;
  const activeLoans = transactions.filter(t => t.status === 'Dipinjam' || t.status === 'Terlambat').length;
  const overdueLoans = transactions.filter(t => t.status === 'Terlambat').length;
  
  const todayStr = getLocalDateString();
  const todayAttendance = (attendance || []).filter(a => {
    const aLocalDate = a.timestamp ? getLocalDateString(new Date(a.timestamp)) : a.date;
    return a.date === todayStr || aLocalDate === todayStr;
  }).length;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', gap: '20px', padding: '0 16px' }}>
      
      {/* LEFT SIDEBAR NAVIGATION FOR ADMIN PORTAL */}
      <aside className="glass-card" style={{
        width: '260px',
        flexShrink: 0,
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '90px',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 110px)',
        overflowY: 'auto'
      }}>
        <div>
          
          {/* Admin Header Title */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}>
                <ShieldCheck size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              PORTAL ADMIN
            </h3>
            <span className="badge badge-emerald" style={{ fontSize: '0.68rem', marginTop: '4px', display: 'inline-block' }}>
              🟢 Sesi Petugas Terverifikasi
            </span>
          </div>

          {/* Sub Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            
            <button
              onClick={() => setAdminSubTab('overview')}
              className={`btn ${adminSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.85rem' }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Ringkasan</span>
            </button>

            <button
              onClick={() => setAdminSubTab('books')}
              className={`btn ${adminSubTab === 'books' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.85rem' }}
            >
              <BookOpen size={18} />
              <span>Manajemen Buku & PDF</span>
            </button>

            <button
              onClick={() => setAdminSubTab('members')}
              className={`btn ${adminSubTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.85rem' }}
            >
              <Users size={18} />
              <span>Anggota & Kartu RFID</span>
            </button>

            <button
              onClick={() => setAdminSubTab('transactions')}
              className={`btn ${adminSubTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.85rem' }}
            >
              <RotateCcw size={18} />
              <span>Peminjaman & Denda</span>
            </button>

            <button
              onClick={() => setAdminSubTab('settings')}
              className={`btn ${adminSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.85rem' }}
            >
              <Settings size={18} />
              <span>Pengaturan Sekolah</span>
            </button>

          </nav>

        </div>

        {/* Lock Session Action */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onLockAdminSession}
            className="btn btn-rose"
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem' }}
          >
            <LogOut size={16} /> Keluar / Kunci Admin
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main style={{ flex: 1, minWidth: 0 }}>
        
        {/* OVERVIEW DASHBOARD */}
        {adminSubTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LayoutDashboard color="#3b82f6" /> Welcome to Admin Dashboard Perpustakaan
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Pusat kendali sirkulasi, manajemen buku, pencetakan kartu pelajar RFID, dan pengaturan sekolah.
              </p>
            </div>

            {/* Quick KPI Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL BUKU FISIK & PDF</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
                  {totalBooks} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Judul</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ANGGOTA TERDAFTAR</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {totalMembers} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Siswa/Guru</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PEMINJAMAN AKTIF</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                  {activeLoans} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Transaksi</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px', border: overdueLoans > 0 ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: overdueLoans > 0 ? '#fb7185' : 'var(--text-secondary)' }}>
                  TERLAMBAT PINJAM
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: overdueLoans > 0 ? '#fb7185' : '#34d399', marginTop: '4px' }}>
                  {overdueLoans} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Transaksi</span>
                </div>
              </div>

            </div>

            {/* Quick Action Navigation Shortcuts */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                🚀 Akses Cepat Fitur Admin Utama
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                
                <button
                  onClick={() => setAdminSubTab('books')}
                  className="glass-card"
                  style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                >
                  <BookOpen color="#3b82f6" size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Manajemen Buku</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Input buku & upload file PDF e-book.</div>
                </button>

                <button
                  onClick={() => setAdminSubTab('members')}
                  className="glass-card"
                  style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                >
                  <Users color="#10b981" size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Anggota & Cetak Kartu</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Kelola siswa & cetak kartu RFID Ultra HD.</div>
                </button>

                <button
                  onClick={() => setAdminSubTab('transactions')}
                  className="glass-card"
                  style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                >
                  <RotateCcw color="#f59e0b" size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Peminjaman & Denda</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Sirkulasi transaksi & cetak struk.</div>
                </button>

                <button
                  onClick={() => setAdminSubTab('settings')}
                  className="glass-card"
                  style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(236, 72, 153, 0.3)' }}
                >
                  <Settings color="#ec4899" size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Pengaturan Sekolah</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Ubah PIN Admin, Logo, & Backup JSON.</div>
                </button>

              </div>
            </div>

          </div>
        )}

        {adminSubTab === 'books' && (
          <BooksView books={books} onRefreshData={onRefreshData} />
        )}

        {adminSubTab === 'members' && (
          <MembersView 
            members={members}
            onRefreshData={onRefreshData}
            onOpenCardPrinter={onOpenCardPrinter}
            prefilledUidToRegister={prefilledUidToRegister}
            onClearPrefilledUid={onClearPrefilledUid}
          />
        )}

        {adminSubTab === 'transactions' && (
          <TransactionsView 
            transactions={transactions}
            members={members}
            onRefreshData={onRefreshData}
            onOpenReceipt={onOpenReceipt}
          />
        )}

        {adminSubTab === 'settings' && (
          <SettingsView 
            settings={settings}
            onRefreshData={onRefreshData}
            onReplaySplash={onReplaySplash}
          />
        )}

      </main>

    </div>
  );
}
