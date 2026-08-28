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

  // 1. Priority match for Indonesian Female Voice (Gadis / Google Bahasa Indonesia / Female id-ID)
  let bestVoice = voices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    const isIndo = lang.includes('id') || name.includes('indonesi');
    const isFemale = name.includes('gadis') || name.includes('female') || name.includes('wanita') || name.includes('google') || name.includes('natural');
    return isIndo && isFemale;
  });

  // 2. Any id-ID locale voice
  if (!bestVoice) {
    bestVoice = voices.find(v => (v.lang || '').toLowerCase().includes('id'));
  }

  // 3. Fallback to any voice with 'indonesia' in name
  if (!bestVoice) {
    bestVoice = voices.find(v => (v.name || '').toLowerCase().includes('indonesi'));
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

// Fallback to local Web Speech API with Female Voice Preference & Pitch Tuning
const speakWebSpeechFallback = (cleanText) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.92;
    utterance.pitch = 1.25; // Tuned pitch for clear, pleasant Indonesian Female Voice

    const femaleVoice = getIndonesianFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }, 50);
  } catch (err) {
    console.warn('Web Speech fallback failed:', err);
  }
};

// Text-To-Speech Authentic Indonesian Female Voice Engine (Restricted ONLY to Selamat Datang Greetings)
export const speakText = (text, enabled = true) => {
  if (!enabled || !text || !text.trim()) return;

  // STRICT REQUIREMENT: Only play TTS sound for "Selamat Datang" Greetings! All other actions use text messages.
  const lower = text.toLowerCase();
  const isWelcomeGreeting = lower.includes('selamat datang') || lower.includes('selamat membaca');
  if (!isWelcomeGreeting) {
    return;
  }

  try {
    stopSpeech();

    const cleanText = sanitizeIndonesianSpeechText(text);

    // High-Quality Natural Indonesian Female Voice Engine
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.substring(0, 180))}&tl=id&client=tw-ob`;
    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;
    currentAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Playing authentic Indonesian female welcome greeting!
      }).catch(err => {
        // Offline or blocked network: Use Web Speech API with female pitch tuning
        speakWebSpeechFallback(cleanText);
      });
    }
  } catch (err) {
    speakWebSpeechFallback(text);
  }
};
