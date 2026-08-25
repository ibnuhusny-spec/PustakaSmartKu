// Web Speech API (Text-to-Speech) & Sound FX Engine for PustakaSmart RFID

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play synthesized Futuristic Sound FX
export const playSoundEffect = (type = 'scan') => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'scan') {
      // High pitch double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      // Major triad chime (C5 - E5 - G5)
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.2, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === 'error') {
      // Low buzz tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.warn('Audio FX failed:', err);
  }
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

// Text-To-Speech Indonesian Voice Feedback
export const speakText = (text, enabled = true) => {
  if (!enabled || !('speechSynthesis' in window)) return;

  try {
    // Purge any old/stale queued speech immediately
    window.speechSynthesis.cancel();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Find Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.name.toLowerCase().includes('indonesia'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    // Wrap in setTimeout to ensure browser queue is clear
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }, 50);

  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};
