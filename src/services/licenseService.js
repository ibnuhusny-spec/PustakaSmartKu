// 30-Day Trial & Pro License Verification Service

export const VALID_PRO_KEYS = [
  'PUSTAKASMART-FULL-LICENSE',
  'PUSTAKA-PRO-2026',
  'SMART-LIBRARY-PRO',
  'PUSTAKA-GOLD-2026'
];

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
 * Validates a License Key submitted by a school
 */
export function validateLicenseKey(inputKey) {
  if (!inputKey) return false;
  const cleanKey = inputKey.trim().toUpperCase();

  // Master keys check
  if (VALID_PRO_KEYS.includes(cleanKey)) return true;

  // Custom key pattern: PUSTAKA-[ANYTHING]-2026
  if (cleanKey.startsWith('PUSTAKA-') && cleanKey.endsWith('-2026') && cleanKey.length >= 14) {
    return true;
  }

  return false;
}
