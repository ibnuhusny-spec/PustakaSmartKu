// Anti-Piracy Dynamic License, Hardware ID (HDD Serial Number) & Lockout Verification Service

let cachedNativeHddSerial = '';

/**
 * Fetch Physical Hard Disk Serial Number from Backend SQLite Server (Electron Native CMD/WMIC Query)
 */
export async function fetchNativeHddSerial() {
  if (cachedNativeHddSerial) return cachedNativeHddSerial;
  try {
    const res = await fetch('http://localhost:3001/api/hardware-id');
    if (res.ok) {
      const data = await res.json();
      if (data.hardwareId) {
        cachedNativeHddSerial = data.hardwareId;
        return data.hardwareId;
      }
    }
  } catch (e) {
    // Fallback to browser FP
  }
  return getDeviceFingerprint();
}

/**
 * Generates a Hardware / Device Fingerprint Hash (Screen Res + Hardware Cores + Timezone + Platform)
 */
export function getDeviceFingerprint() {
  if (typeof window === 'undefined') return 'FP-DEFAULT';
  if (cachedNativeHddSerial) return cachedNativeHddSerial;

  const platform = navigator.platform || 'Win32';
  const screenRes = `${window.screen?.width || 1280}x${window.screen?.height || 720}`;
  const cores = navigator.hardwareConcurrency || 4;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Makassar';
  
  const fpRaw = `${platform}:${screenRes}:${cores}:${tz}`;
  let hash = 0;
  for (let i = 0; i < fpRaw.length; i++) {
    hash = ((hash << 5) - hash) + fpRaw.charCodeAt(i);
    hash |= 0;
  }
  return `HDD-${Math.abs(hash).toString(36).toUpperCase()}`;
}

/**
 * Generates a unique School Registration ID bound to BOTH School Name & School Email & Physical Hard Disk Serial Number (HID)
 */
export function generateSchoolRegistrationId(schoolName = '', schoolEmail = '', customHddSerial = '') {
  const cleanName = (schoolName || 'PUSTAKASMART SCHOOL').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanEmail = (schoolEmail || 'PERPUSTAKAAN@SCH.ID').toLowerCase().trim();
  const hdd = customHddSerial || cachedNativeHddSerial || getDeviceFingerprint();
  const combinedStr = `${cleanName}:${cleanEmail}:${hdd}`;

  let hash = 0;
  for (let i = 0; i < combinedStr.length; i++) {
    hash = ((hash << 5) - hash) + combinedStr.charCodeAt(i);
    hash |= 0;
  }
  
  const positiveHash = Math.abs(hash).toString(36).toUpperCase();
  const prefix = cleanName.substring(0, 4).padEnd(4, 'X');
  return `ID-${prefix}-${positiveHash}`;
}

/**
 * Generates the 100% Unique PRO License Key bound to School Registration ID (HID + Email + School Name)
 */
export function generateProLicenseKeyForSchool(registrationId = '') {
  const cleanId = (registrationId || '').trim().toUpperCase();
  if (!cleanId) return '';

  let hash = 5381;
  for (let i = 0; i < cleanId.length; i++) {
    hash = ((hash << 5) + hash) + cleanId.charCodeAt(i);
    hash |= 0;
  }
  
  const keyPart1 = Math.abs(hash % 8999 + 1000);
  const keyPart2 = Math.abs((hash * 31) % 8999 + 1000);
  
  return `PRO-${cleanId.replace('ID-', '')}-${keyPart1}-${keyPart2}`;
}

/**
 * Calculates remaining days in 30-day trial period & persists trial start globally per Physical Hard Disk Serial (HID)
 */
export function getTrialDaysRemaining(startDateStr) {
  if (typeof window === 'undefined') return 30;

  const hdd = cachedNativeHddSerial || getDeviceFingerprint();
  const storageKey = `pustakasmart_hid_trial_${hdd}`;
  
  let savedTrialStart = localStorage.getItem(storageKey);
  if (!savedTrialStart) {
    savedTrialStart = startDateStr || new Date().toISOString().split('T')[0];
    localStorage.setItem(storageKey, savedTrialStart);
  }

  const start = new Date(savedTrialStart);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remaining = 30 - diffDays;
  return Math.max(0, remaining);
}

/**
 * Validates if a License Key is valid specifically for THIS school name & email & physical hard disk combination
 */
export function validateDynamicLicenseKey(inputKey, schoolName, schoolEmail) {
  if (!inputKey || !schoolName) return false;
  const cleanInput = inputKey.trim().toUpperCase();
  
  // Master emergency vendor key
  if (cleanInput === 'PUSTAKASMART-FULL-MASTER-KEY-2026') return true;

  const regId = generateSchoolRegistrationId(schoolName, schoolEmail);
  const expectedKey = generateProLicenseKeyForSchool(regId);
  
  return cleanInput === expectedKey;
}
