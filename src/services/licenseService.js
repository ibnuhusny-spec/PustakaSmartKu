// Anti-Piracy Dynamic License & Lockout Verification Service

/**
 * Generates a unique School Registration ID bound to BOTH School Name & School Email
 */
export function generateSchoolRegistrationId(schoolName = '', schoolEmail = '') {
  const cleanName = (schoolName || 'PUSTAKASMART SCHOOL').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanEmail = (schoolEmail || 'PERPUSTAKAAN@SCH.ID').toLowerCase().trim();
  const combinedStr = `${cleanName}:${cleanEmail}`;

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
 * Generates the 100% Unique PRO License Key bound to School Registration ID & Email
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
 * Calculates remaining days in 30-day trial period
 */
export function getTrialDaysRemaining(startDateStr) {
  if (!startDateStr) return 30;
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remaining = 30 - diffDays;
  return Math.max(0, remaining);
}

/**
 * Validates if a License Key is valid specifically for THIS school name & email combination
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
