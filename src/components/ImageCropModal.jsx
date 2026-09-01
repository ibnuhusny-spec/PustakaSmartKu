import React, { useState, useEffect, useRef } from 'react';
import { Scissors, RotateCw, ZoomIn, ZoomOut, Check, X, Move, RefreshCw, Sparkles } from 'lucide-react';
import { playSoundEffect } from '../services/audioService';

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  mode = 'avatar', // 'avatar' (1:1) or 'idCard' (1.58:1)
  onCropSave
}) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const aspect = mode === 'avatar' ? 1 : 1.58;

  // Rotation handler
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Mouse / Touch Drag Handlers for Panning
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Execute Canvas Crop
  const handleSaveCrop = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const targetWidth = mode === 'avatar' ? 600 : 1000;
      const targetHeight = Math.round(targetWidth / aspect);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.save();
      // Move origin to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Account for user dragging offsets
      const panFactor = (img.width / 340);
      const drawX = (offset.x * panFactor) - (img.width / 2);
      const drawY = (offset.y * panFactor) - (img.height / 2);

      ctx.drawImage(img, drawX, drawY, img.width, img.height);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      try {
        playSoundEffect('scan');
      } catch (e) {}

      onCropSave(croppedDataUrl);
      onClose();
    };
    img.src = imageSrc;
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ zIndex: 4500 }}
    >
      <div 
        className="modal-container glass-card" 
        style={{ maxWidth: mode === 'avatar' ? '460px' : '620px', width: '94%', padding: '22px', borderRadius: '20px' }}
      >
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ec4899' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scissors size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Fitur Potong (Crop) & Sesuaikan Gambar
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Geser, Putar, atau Perbesar Gambar Agar Presisi
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Interactive Crop Workspace */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{
            position: 'relative',
            marginTop: '14px',
            width: '100%',
            height: mode === 'avatar' ? '320px' : '340px',
            background: '#090d16',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-color)',
            userSelect: 'none'
          }}
        >
          {/* Scaled & Rotated Image */}
          <img
            src={imageSrc}
            alt="Original Crop Target"
            style={{
              maxHeight: '85%',
              maxWidth: '85%',
              objectFit: 'contain',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              pointerEvents: 'none'
            }}
          />

          {/* Crop Overlay Guide Box */}
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
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                border: '3px dashed #ec4899',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)'
              }} />
            ) : (
              <div style={{
                width: '88%',
                height: '68%',
                borderRadius: '12px',
                border: '3px dashed #3b82f6',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)'
              }} />
            )}
          </div>

          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            color: '#f472b6',
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700
          }}>
            <Move size={13} /> Klik & Klik-Tahan Geser Gambar
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ 
          margin: '14px 0 6px 0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'var(--bg-secondary)',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          
          {/* Zoom Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
            <ZoomOut size={16} color="var(--text-secondary)" />
            <input 
              type="range"
              min="0.6"
              max="2.5"
              step="0.05"
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <ZoomIn size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, minWidth: '38px', color: 'var(--text-primary)' }}>
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Rotate Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleRotate}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px' }}
              title="Putar 90 Derajat"
            >
              <RotateCw size={14} /> Putar {rotation}°
            </button>
            <button
              type="button"
              onClick={() => { setScale(1); setRotation(0); setOffset({ x: 0, y: 0 }); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 10px', borderRadius: '8px' }}
              title="Reset Pengaturan"
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={handleSaveCrop}
            className="btn btn-primary"
            style={{ borderRadius: '10px', padding: '8px 22px', fontSize: '0.88rem', fontWeight: 800, background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
          >
            <Scissors size={16} /> Potong & Simpan Berkas
          </button>
        </div>

      </div>
    </div>
  );
}
