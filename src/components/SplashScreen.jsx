import React, { useState, useEffect } from 'react';
import { BookOpen, Radio, Sparkles, ShieldCheck, Cpu, ChevronRight } from 'lucide-react';
import defaultLogo from '../assets/logo.png';

export default function SplashScreen({ onFinish, settings }) {
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

  const logoSrc = (settings?.schoolLogoUrl && settings.schoolLogoUrl.trim()) 
    ? settings.schoolLogoUrl 
    : ((settings?.logoUrl && settings.logoUrl.trim() && settings.logoUrl.startsWith('data:')) ? settings.logoUrl : defaultLogo);

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
            src={logoSrc} 
            alt="Logo PustakaSmart"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.5))',
              display: 'block'
            }}
            onError={(e) => { e.target.src = defaultLogo; }}
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
          marginBottom: '2px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          {settings?.schoolName || "SDIT QURRATU A'YUN AL-ISLAMI"}
        </div>

        <div style={{
          fontSize: '0.78rem',
          color: '#94a3b8',
          marginBottom: '28px',
          fontStyle: 'italic'
        }}>
          Sistem Perpustakaan Sekolah Digital, E-Book PDF & RFID Klien-Server
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justify: 'space-between',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#cbd5e1',
            marginBottom: '8px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="#10b981" /> System Booting...
            </span>
            <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div style={{
            height: '10px',
            width: '100%',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {/* Progress Fill */}
            <div style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #6366f1 100%)',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)',
              transition: 'width 0.1s linear'
            }} />
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div style={{
          fontSize: '0.8rem',
          color: '#94a3b8',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: 'center'
        }}>
          <Sparkles size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {statusMessage}
          </span>
        </div>

        {/* Footer Badge */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          width: '100%',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: 700 }}>
            <ShieldCheck size={14} /> SQLite Central Database
          </span>
          <span>v1.0.0 Pro Edition</span>
        </div>

      </div>
    </div>
  );
}
