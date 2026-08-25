// RFID Handler for Physical USB RFID Reader (HID Keyboard Emulation) and Virtual Simulator

import { playSoundEffect } from './audioService';

let buffer = '';
let lastKeyTime = 0;
const LISTENERS = new Set();

// Emit RFID scan event to all subscribers with a unique scan event
export const emitRfidScan = (rfidUid) => {
  const cleanUid = String(rfidUid).trim().toUpperCase();
  if (!cleanUid) return;

  playSoundEffect('scan');

  const scanPayload = { rfidUid: cleanUid, timestamp: Date.now() };

  // Dispatch custom window event
  window.dispatchEvent(new CustomEvent('rfid-scanned', { detail: scanPayload }));

  // Notify registered callbacks
  LISTENERS.forEach(callback => {
    try {
      callback(scanPayload);
    } catch (e) {
      console.error('RFID Listener Error:', e);
    }
  });
};

// Subscribe to RFID scan events
export const subscribeRfid = (callback) => {
  LISTENERS.add(callback);
  return () => LISTENERS.delete(callback);
};

// Physical USB RFID Reader Keyboard Sniffer
export const initRfidKeyboardListener = () => {
  const handleKeyDown = (event) => {
    const activeElement = document.activeElement;
    const isInputElement = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );

    const currentTime = Date.now();
    const timeDiff = currentTime - lastKeyTime;
    lastKeyTime = currentTime;

    // Reset buffer if delay between keystrokes is too long (human typing vs RFID scanner)
    if (timeDiff > 250 && buffer.length > 0 && !isInputElement) {
      buffer = '';
    }

    if (event.key === 'Enter') {
      if (buffer.length >= 3) {
        const uid = buffer;
        buffer = '';
        emitRfidScan(uid);
        if (!isInputElement) {
          event.preventDefault();
        }
      }
      buffer = '';
    } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      buffer += event.key;
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

// Virtual Tap Helper
export const simulateRfidTap = (uid) => {
  emitRfidScan(uid);
};
