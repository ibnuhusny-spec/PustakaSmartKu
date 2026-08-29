// RFID & NFC Handler for Physical USB RFID Reader (HID Keyboard Emulation) and Virtual Simulator

import { playSoundEffect } from './audioService';

let buffer = '';
let lastKeyTime = 0;
const LISTENERS = new Set();

// Helper to detect if device is Mobile Phone or Tablet (NFC Device)
export const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|Tablet/i.test(navigator.userAgent);
};

// Emit RFID scan event to all subscribers with a unique scan event
export const emitRfidScan = (rfidUid) => {
  const cleanUid = String(rfidUid).trim().toUpperCase();
  if (!cleanUid) return;

  // Block RFID/NFC scanning processing on Mobile client devices!
  if (isMobileDevice()) {
    console.warn('📱 RFID/NFC scan ignored: Mobile client devices are view-only.');
    return;
  }

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

export const simulateRfidTap = emitRfidScan;

// Physical USB RFID Reader Keyboard Sniffer (Disabled on Mobile Phones)
export const initRfidKeyboardListener = () => {
  // If user is on HP / Tablet, disable RFID keyboard sniffing completely!
  if (isMobileDevice()) {
    console.log('📱 Mobile Device Detected: RFID Keyboard Sniffer Disabled.');
    return () => {};
  }

  let fastCharCount = 0;

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

    // Physical USB RFID Readers send characters ultra-fast (< 75ms apart).
    // Human typing is much slower (> 80ms apart).
    // If delay > 80ms, it is human typing, so clear the RFID buffer immediately!
    if (timeDiff > 80) {
      buffer = '';
      fastCharCount = 0;
    } else {
      fastCharCount++;
    }

    if (event.key === 'Enter') {
      // Only emit RFID scan if characters were received at ultra-fast hardware scanner speed
      if (buffer.length >= 4 && fastCharCount >= 3) {
        const uid = buffer.trim().toUpperCase();
        buffer = '';
        fastCharCount = 0;
        emitRfidScan(uid);
        if (!isInputElement) {
          event.preventDefault();
        }
      }
      buffer = '';
      fastCharCount = 0;
    } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      buffer += event.key;
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};
