import React, { useState, useEffect } from 'react';
import { BookOpen, Radio, Sparkles, ShieldCheck, Cpu, ChevronRight } from 'lucide-react';

export default function SplashScreen({ onFinish, schoolName, libraryName }) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Menginisialisasi Ekosistem PustakaSmart RFID...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const statusSteps = [
      { at: 15, msg: 'Menghubungkan Perangkat USB RFID Reader & Smartchip...' },
      { at: 40, msg: 'Memuat Database Inventaris Buku & DDC Classifier...' },
      { at: 70, msg: 'Mengaktifkan Engine Suara TTS & Sistem Presensi Otomatis...' },
      { at: 90, msg: 'Menyiapkan Papan Peringkat Duta Baca & Game Kuis...' },
      { at: 100, msg: 'Sistem Perpustakaan Pintar Siap Digunakan!' }
    ];

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onFinish) onFinish();
            }, 600); // fade out duration
          }, 400);
          return 100;
        }

        const next = prev + 2;
        const matched = statusSteps.find(s => s.at === next);
        if (matched) {
          setStatusMessage(matched.msg);
        }
        return next;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 50%, #070a12 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontFamily: 'var(--font-main)',
      opacity: isFadingOut ? 0 : 1,
      transform: isFadingOut ? 'scale(1.05)' : 'scale(1)',
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    }}>
      
      {/* Background Animated Glow Orbs */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
        bottom: '10%',
        right: '15%',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Main Luxury Glass Container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '520px',
        width: '90%',
        padding: '40px 32px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.2)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Animated Glowing Logo Container */}
        <div style={{
          position: 'relative',
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
          boxShadow: '0 0 35px rgba(59, 130, 246, 0.35), inset 0 0 15px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.4)'
        }}>
          {/* Pulsing Outer Ring */}
          <div style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '28px',
            border: '2px dashed rgba(245, 158, 11, 0.6)',
            animation: 'spin 18s linear infinite',
            pointerEvents: 'none'
          }} />

          <img 
            src="/perpustakaansmart.png" 
            alt="Logo PustakaSmart"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.5))',
              display: 'block'
            }}
            onError={(e) => {
              // Fallback icon if logo fails to render
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div style="width:100px;height:100px;display:flex;align-items:center;justify-content:center;color:#60a5fa"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>';
            }}
          />
        </div>

        {/* Title & School Meta */}
        <h1 style={{
          fontSize: '1.85rem',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          margin: '0 0 4px 0',
          background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          PUSTAKASMART RFID
        </h1>

        <div style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          color: '#fbbf24',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={16} /> {schoolName || 'SDIT Qurratu A\'yun Al-Islami'}
        </div>

        <p style={{
          fontSize: '0.82rem',
          color: '#94a3b8',
          margin: '0 0 28px 0',
          maxWidth: '380px'
        }}>
          {libraryName || 'Sistem Mandiri Kios & Presensi Perpustakaan Digital'}
        </p>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', marginBottom: '14px' }}>
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#cbd5e1',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="#38bdf8" /> {statusMessage}
            </span>
            <span style={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{progress}%</span>
          </div>

          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '999px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1px'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%)',
              borderRadius: '999px',
              transition: 'width 0.1s ease-out',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)'
            }} />
          </div>
        </div>

        {/* System Badges Footer */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '8px',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#10b981" /> 100% Standalone Offline DB
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Radio size={14} color="#60a5fa" /> USB RFID Plug & Play
          </span>
        </div>

      </div>

    </div>
  );
}
