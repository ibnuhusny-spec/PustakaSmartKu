function generateSchoolRegistrationId(schoolName = '', schoolEmail = '', customHddSerial = '') {
  const cleanName = (schoolName || 'PUSTAKASMART SCHOOL').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanEmail = (schoolEmail || 'PERPUSTAKAAN@SCH.ID').toLowerCase().trim();
  const hdd = customHddSerial || 'FP-DEFAULT';
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

function generateProLicenseKeyForSchool(registrationId = '') {
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

const schoolName = "SDIT QURRATU A'YUN AL-ISLAMI";
const schoolEmail = "perpustakaan@sditqurratuayun.sch.id";
const hddSerial = "HID-IHKMRQ";

const regId = generateSchoolRegistrationId(schoolName, schoolEmail, hddSerial);
console.log('Generated regId:', regId);
const expectedKey = generateProLicenseKeyForSchool(regId);
console.log('Expected key:', expectedKey);
