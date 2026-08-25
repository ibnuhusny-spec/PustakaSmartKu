import React, { useEffect } from 'react';
import { UserCheck, Sparkles, CheckCircle, Volume2, X } from 'lucide-react';

export default function AttendanceBanner({ attendance, onClose }) {
  if (!attendance) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [attendance, onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      maxWidth: '420px',
      width: '100%',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
      color: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      boxShadow: '0 15px 35px rgba(16, 185, 129, 0.5)',
      backdropFilter: 'blur(12px)',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#ffffff',
            padding: '2px',
            flexShrink: 0
          }}>
            <img 
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(attendance.memberName)}`}
              alt={attendance.memberName}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
              <UserCheck size={14} /> Presensi RFID Berhasil
            </div>
            <h4 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800 }}>
              {attendance.memberName}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', opacity: 0.95 }}>
              {attendance.classGrade} • {new Date(attendance.timestamp).toLocaleTimeString('id-ID')}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> Kehadiran dicatat & +5 Poin Membaca
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.9 }}>
          {attendance.rfidUid}
        </span>
      </div>
    </div>
  );
}
