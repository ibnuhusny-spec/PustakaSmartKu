import React, { useState, useEffect } from 'react';
import { Wifi, Server, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, Laptop } from 'lucide-react';
import { getServerUrl, setServerUrl, checkServerConnection, syncLocalToSqliteServer } from '../services/db';

export default function ServerConnectModal({ isOpen, onClose, onRefreshData }) {
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState({ loading: false, connected: false, message: '' });

  useEffect(() => {
    if (isOpen) {
      const currentUrl = getServerUrl();
      setUrlInput(currentUrl);
      testConnection(currentUrl);
    }
  }, [isOpen]);

  const testConnection = async (targetUrl) => {
    setStatus({ loading: true, connected: false, message: 'Menguji koneksi ke Laptop Server...' });
    setServerUrl(targetUrl);
    
    const result = await checkServerConnection();
    if (result.connected) {
      await syncLocalToSqliteServer();
      if (onRefreshData) onRefreshData();
      setStatus({ 
        loading: false, 
        connected: true, 
        message: `Terhubung! Server: ${result.info?.serverIp || targetUrl}` 
      });
    } else {
      setStatus({ 
        loading: false, 
        connected: false, 
        message: `Gagal terhubung ke ${targetUrl}. Pastikan Laptop Server & HP berada di Wi-Fi yang sama.` 
      });
    }
  };

  const handleConnect = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    let clean = urlInput.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    if (!clean.includes(':3001') && !clean.includes('vercel.app')) {
      clean = `${clean}:3001`;
    }
    setUrlInput(clean);
    testConnection(clean);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        onMouseDown={e => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6'
            }}>
              <Server size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>📡 Hubungkan Ke Laptop Server Utama</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Sinkronkan HP / Tablet Anda ke database Laptop Utama di Wi-Fi Sekolah (Tanpa PIN Admin).
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          
          {/* Connection Status Banner */}
          <div style={{
            background: status.connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${status.connected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '18px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {status.loading ? (
              <RefreshCw size={20} className="spin" color="#3b82f6" />
            ) : status.connected ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <AlertCircle size={20} color="#ef4444" />
            )}
            <span style={{ color: status.connected ? '#34d399' : '#f87171', fontWeight: 700 }}>
              {status.message}
            </span>
          </div>

          <form onSubmit={handleConnect}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800 }}>URL IP Laptop Server Utama:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="Misal: http://192.168.43.95:3001"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700 }}
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={status.loading}
                  style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}
                >
                  <RefreshCw size={16} className={status.loading ? 'spin' : ''} />
                  <span>Hubungkan</span>
                </button>
              </div>
            </div>
          </form>

          {/* Practical Tips */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginTop: '16px',
            fontSize: '0.8rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa' }}>
              <Laptop size={16} /> 💡 2 Cara Paling Mudah Agar HP Terhubung:
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>
                <strong>Buka Langsung Di Browser HP</strong>: Buka Chrome/Safari di HP, lalu ketik alamat ini di address bar atas:
                <br />
                <code style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  http://192.168.43.95:3001
                </code>
              </li>
              <li>
                <strong>Wi-Fi Sama</strong>: Pastikan HP dan Laptop Server Anda terhubung ke **jaringan Wi-Fi yang sama**.
              </li>
            </ol>
          </div>

        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button 
            type="button"
            onClick={() => {
              const localUrl = 'http://localhost:3001';
              setUrlInput(localUrl);
              testConnection(localUrl);
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem' }}
          >
            Reset Ke Localhost
          </button>

          <button onClick={onClose} className="btn btn-primary">
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
