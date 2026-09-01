import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, ShieldCheck, SwitchCamera, Video, AlertCircle } from 'lucide-react';
import { playSoundEffect } from '../services/audioService';

export default function WebcamCaptureModal({
  isOpen,
  onClose,
  onCapture,
  mode = 'avatar', // 'avatar' or 'idCard'
  title = 'Foto Kamera Langsung'
}) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Enumerate video devices
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setCapturedImage(null);
    setErrorMessage('');

    async function getCameraDevices() {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
        if (isMounted) {
          setDevices(videoInputs);
          if (videoInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputs[0].deviceId);
          }
        }
      } catch (err) {
        console.warn('Enumerate devices error:', err);
      }
    }

    getCameraDevices();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const [activeResolution, setActiveResolution] = useState('');

  // Start MediaStream whenever selectedDeviceId or isOpen changes
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      return;
    }

    let isCancelled = false;
    setIsCameraLoading(true);
    setErrorMessage('');
    setActiveResolution('');

    async function startCamera() {
      stopCameraStream();

      try {
        // High-Definition Full HD 1080p / HD 720p constraints
        const constraints = {
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false
        };

        let mediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (fallbackErr) {
          // Fallback to basic video if 1080p/720p strict request fails
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
            audio: false
          });
        }

        if (!isCancelled) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.onloadedmetadata = () => {
              const w = videoRef.current.videoWidth;
              const h = videoRef.current.videoHeight;
              setActiveResolution(`${w} x ${h} ${w >= 1920 ? 'Full HD 1080p' : w >= 1280 ? 'HD 720p' : 'SD'}`);
            };
          }
          setIsCameraLoading(false);
        } else {
          mediaStream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (!isCancelled) {
          setIsCameraLoading(false);
          setErrorMessage('❌ Tidak dapat mengakses Kamera. Pastikan izin kamera telah diberikan di browser/laptop Anda.');
        }
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      stopCameraStream();
    };
  }, [isOpen, selectedDeviceId]);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      playSoundEffect('scan');
    } catch (e) {}

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;

    if (mode === 'avatar') {
      // Crop center square with 600x600 high resolution
      const size = Math.min(vWidth, vHeight);
      const startX = (vWidth - size) / 2;
      const startY = (vHeight - size) / 2;

      canvas.width = 600;
      canvas.height = 600;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, 600, 600);
    } else {
      // ID Card mode: 1.58:1 aspect ratio with ZERO distortion
      let srcW = vWidth;
      let srcH = Math.round(vWidth / 1.58);
      if (srcH > vHeight) {
        srcH = vHeight;
        srcW = Math.round(vHeight * 1.58);
      }
      const startX = (vWidth - srcW) / 2;
      const startY = (vHeight - srcH) / 2;

      canvas.width = 1000;
      canvas.height = 633;
      ctx.drawImage(video, startX, startY, srcW, srcH, 0, 0, 1000, 633);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
  };

  const handleConfirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCameraStream();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={e => { if (e.target === e.currentTarget) { stopCameraStream(); onClose(); } }}
      style={{ zIndex: 4000 }}
    >
      <div 
        className="modal-container glass-card" 
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: mode === 'avatar' ? '480px' : '620px', width: '92%', padding: '24px', borderRadius: '20px' }}
      >
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {mode === 'avatar' ? 'Ambil Foto Profil Siswa / Guru' : 'Foto Dokumen KTP / Kartu Identitas'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => { stopCameraStream(); onClose(); }} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Selector & Info */}
        <div style={{ margin: '14px 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {devices.length > 0 && !capturedImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <SwitchCamera size={16} color="var(--primary-color)" />
              <select
                className="form-input"
                value={selectedDeviceId}
                onChange={e => setSelectedDeviceId(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px' }}
              >
                {devices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Kamera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeResolution && !capturedImage && (
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '12px' }}>
              📷 {activeResolution}
            </span>
          )}
        </div>

        {/* Camera Stream Viewport / Snapshot Preview */}
        <div style={{ position: 'relative', marginTop: '12px', borderRadius: '16px', overflow: 'hidden', background: '#090d16', border: '2px solid var(--border-color)', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Flash animation */}
          {flashEffect && (
            <div style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 10, transition: 'opacity 0.2s ease-out' }} />
          )}

          {errorMessage ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#fb7185' }}>
              <AlertCircle size={36} style={{ marginBottom: '10px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{errorMessage}</div>
            </div>
          ) : capturedImage ? (
            /* Snapshot Preview */
            <img 
              src={capturedImage} 
              alt="Hasil Snapshot Kamera" 
              style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', display: 'block' }} 
            />
          ) : (
            /* Live Camera Stream */
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCameraLoading && (
                <div style={{ position: 'absolute', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <RefreshCw size={18} className="spin" /> Membuka Kamera Web...
                </div>
              )}
              
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', display: isCameraLoading ? 'none' : 'block' }} 
              />

              {/* Overlay Frame Guide */}
              {!isCameraLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {mode === 'avatar' ? (
                    <div style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      border: '3px dashed #38bdf8',
                      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingBottom: '12px'
                    }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', padding: '3px 8px', borderRadius: '10px', fontWeight: 800 }}>
                        Posisikan Wajah
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      width: '85%',
                      height: '65%',
                      borderRadius: '12px',
                      border: '3px dashed #34d399',
                      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.5)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingBottom: '10px'
                    }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.85)', color: '#34d399', padding: '4px 10px', borderRadius: '10px', fontWeight: 800 }}>
                        Posisikan KTP / Kartu Identitas
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Canvas element */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Action Controls */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {capturedImage ? (
            <>
              <button 
                type="button"
                onClick={handleRetake}
                className="btn btn-secondary"
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={15} /> Ulangi Foto
              </button>
              <button 
                type="button"
                onClick={handleConfirmImage}
                className="btn btn-primary"
                style={{ borderRadius: '10px', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Check size={16} /> Gunakan Foto Ini
              </button>
            </>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => { stopCameraStream(); onClose(); }}
                className="btn btn-secondary"
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleTakeSnapshot}
                disabled={isCameraLoading || !!errorMessage}
                className="btn btn-primary"
                style={{ 
                  borderRadius: '10px', 
                  padding: '8px 22px', 
                  fontSize: '0.88rem', 
                  fontWeight: 800, 
                  opacity: isCameraLoading || !!errorMessage ? 0.6 : 1,
                  cursor: isCameraLoading || !!errorMessage ? 'not-allowed' : 'pointer'
                }}
              >
                <Camera size={18} /> Ambil Jepretan (Snapshot)
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
