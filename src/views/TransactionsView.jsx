import React, { useState } from 'react';
import { History, Search, CreditCard, RotateCcw, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { returnBookTransaction } from '../services/db';

export default function TransactionsView({ 
  transactions, 
  members, 
  onRefreshData, 
  onOpenReceipt 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = 
      tx.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.rfidUid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleReturnAction = (tx, payWithWallet) => {
    try {
      const member = members.find(m => m.id === tx.memberId);
      const updatedTx = returnBookTransaction(tx.id, payWithWallet);
      onRefreshData();
      onOpenReceipt(updatedTx, member);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      <div className="glass-card" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History color="#3b82f6" /> Managemen Peminjaman & Denda Keterlambatan
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Kelola sirkulasi buku, status keterlambatan, dan pelunasan denda via e-wallet RFID.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['Semua', 'Dipinjam', 'Terlambat', 'Dikembalikan'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className="btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-md)',
                  background: filterStatus === st ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: filterStatus === st ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Cari nama anggota, judul buku, atau RFID UID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>ID Transaksi</th>
                <th style={{ padding: '12px' }}>Anggota & RFID</th>
                <th style={{ padding: '12px' }}>Buku Dipinjam</th>
                <th style={{ padding: '12px' }}>Tgl Pinjam / Kembali</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Denda</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Aksi Pustakawan</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Tidak ada transaksi peminjaman ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTxs.map(tx => {
                  const member = members.find(m => m.id === tx.memberId);
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{tx.id}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{tx.memberName}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399' }}>{tx.rfidUid}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{tx.bookTitle}</td>
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>Pinjam: {tx.issueDate}</div>
                        <div>Batas: <strong style={{ color: tx.status === 'Terlambat' ? '#fb7185' : 'inherit' }}>{tx.dueDate}</strong></div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          tx.status === 'Dikembalikan' ? 'badge-emerald' : (tx.status === 'Terlambat' ? 'badge-rose' : 'badge-blue')
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: tx.fineAmount > 0 ? '#fb7185' : 'inherit' }}>
                        {tx.fineAmount > 0 ? `Rp ${tx.fineAmount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {tx.status !== 'Dikembalikan' && (
                            tx.fineAmount > 0 ? (
                              <button 
                                onClick={() => handleReturnAction(tx, true)}
                                className="btn btn-emerald"
                                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                              >
                                <CreditCard size={14} /> Potong Saldo RFID
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleReturnAction(tx, false)}
                                className="btn btn-primary"
                                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                              >
                                <RotateCcw size={14} /> Kembali
                              </button>
                            )
                          )}
                          <button 
                            onClick={() => onOpenReceipt(tx, member)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                            title="Cetak Struk Transaksi"
                          >
                            <Printer size={14} /> Struk
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
