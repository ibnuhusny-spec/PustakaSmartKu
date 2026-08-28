// Web Speech API & Authentic Indonesian Female Voice Engine for PustakaSmart RFID

let audioCtx = null;
let currentAudio = null;
let cachedIndonesianFemaleVoice = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Pre-warm and find authentic Indonesian Female Voice (Microsoft Gadis / Google Bahasa Indonesia / id-ID Female)
const getIndonesianFemaleVoice = () => {
  if (cachedIndonesianFemaleVoice) return cachedIndonesianFemaleVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // STRICT RULE: Only match voices that are explicitly Indonesian (id-ID / Indonesia / Gadis)
  let bestVoice = voices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    const isIndo = lang.startsWith('id') || name.includes('indonesia') || name.includes('gadis');
    const isFemale = name.includes('gadis') || name.includes('female') || name.includes('wanita') || name.includes('google') || name.includes('natural');
    return isIndo && isFemale;
  });

  if (!bestVoice) {
    bestVoice = voices.find(v => {
      const name = (v.name || '').toLowerCase();
      const lang = (v.lang || '').toLowerCase();
      return lang.startsWith('id') || name.includes('indonesia');
    });
  }

  if (bestVoice) {
    cachedIndonesianFemaleVoice = bestVoice;
  }

  return bestVoice;
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedIndonesianFemaleVoice = null;
      getIndonesianFemaleVoice();
    };
    getIndonesianFemaleVoice();
  } catch (e) {}
}

// Clean Indonesian Speech Sanitizer for Natural Pronunciation
const sanitizeIndonesianSpeechText = (rawText = '') => {
  if (!rawText) return '';
  return rawText
    .replace(/\bRadiant\b/gi, 'Radian')
    .replace(/\bRFID\b/gi, 'Er Ef I De')
    .replace(/\bOPAC\b/gi, 'O-Pak')
    .replace(/\bNISN\b/gi, 'En I Es En')
    .replace(/\bNIP\b/gi, 'En I Pe')
    .replace(/\bRp\.?\s*/gi, 'Rupiah ')
    .replace(/\bpts\b/gi, 'poin')
    .replace(/\bPDF\b/gi, 'Pe De Ef')
    .replace(/\bIT\b/g, 'I Te');
};

// Play synthesized Futuristic & Game Sound FX
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
    } else if (type === 'ting' || type === 'quiz_correct') {
      // Crisp Crystal Bell Chime ("TING!")
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g1 = ctx.createGain();
      const g2 = ctx.createGain();

      o1.type = 'sine';
      o2.type = 'sine';

      // High C7 (2093 Hz) + E7 (2637 Hz) bell harmonic
      o1.frequency.setValueAtTime(2093, now);
      o2.frequency.setValueAtTime(2637, now);

      g1.gain.setValueAtTime(0.4, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      g2.gain.setValueAtTime(0.3, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      o1.connect(g1);
      o2.connect(g2);
      g1.connect(ctx.destination);
      g2.connect(ctx.destination);

      o1.start(now);
      o2.start(now);
      o1.stop(now + 0.6);
      o2.stop(now + 0.6);
    } else if (type === 'quiz_wrong') {
      // Gentle double buzz tone
      [180, 140].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.12);
        g.gain.setValueAtTime(0.35, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);
        o.start(now + idx * 0.12);
        o.stop(now + idx * 0.12 + 0.2);
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
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

// Fallback to local Web Speech API - STRICTLY INDONESIAN VOICE ONLY
const speakWebSpeechFallback = (cleanText) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const femaleVoice = getIndonesianFemaleVoice();
  // CRITICAL SECURITY FIX: If no Indonesian voice is installed on Windows OS, NEVER fallback to English male voice (Microsoft David)
  if (!femaleVoice) {
    console.warn('No Indonesian voice installed on OS; skipping WebSpeech fallback to prevent foreign male voice reading Indonesian.');
    return;
  }

  try {
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.25; // Tuned pitch for clear, pleasant Indonesian Female Voice
    utterance.voice = femaleVoice;

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }, 50);
  } catch (err) {
    console.warn('Web Speech fallback failed:', err);
  }
};

// Text-To-Speech Authentic Indonesian Female Voice Engine (Google Neural Female Stream First)
export const speakText = (text, enabled = true) => {
  if (!enabled || !text || !text.trim()) return;

  // STRICT REQUIREMENT: Only play TTS sound for Welcome Greetings and Quiz Start Greeting!
  const lower = text.toLowerCase();
  const isAllowedVoice = lower.includes('selamat datang') || 
                         lower.includes('selamat membaca') || 
                         lower.includes('silakan menjawab');

  if (!isAllowedVoice) {
    return;
  }

  // Synchronously stop any previous speech to avoid double overlapping sound
  stopSpeech();

  const cleanText = sanitizeIndonesianSpeechText(text);

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.substring(0, 180))}&tl=id&client=tw-ob`;
    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;
    currentAudio = audio;

    let hasFallenBack = false;

    audio.onended = () => {
      currentAudio = null;
    };

    audio.onerror = () => {
      if (!hasFallenBack) {
        hasFallenBack = true;
        speakWebSpeechFallback(cleanText);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (!hasFallenBack) {
          hasFallenBack = true;
          speakWebSpeechFallback(cleanText);
        }
      });
    }
  } catch (err) {
    speakWebSpeechFallback(cleanText);
  }
};
