// Vendor License Key Generator Utility for PustakaSmart RFID
// Usage: node generate_license.cjs "Nama Sekolah" "email@sekolah.sch.id"

const schoolName = process.argv[2] || "SDIT QURRATU A'YUN AL-ISLAMI";
const schoolEmail = process.argv[3] || "perpustakaan@sditqurratuayun.sch.id";

function generateSchoolRegistrationId(name, email) {
  const cleanName = (name || 'PUSTAKASMART SCHOOL').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanEmail = (email || 'PERPUSTAKAAN@SCH.ID').toLowerCase().trim();
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

function generateProLicenseKeyForSchool(regId) {
  const cleanId = (regId || '').trim().toUpperCase();
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

const regId = generateSchoolRegistrationId(schoolName, schoolEmail);
const proKey = generateProLicenseKeyForSchool(regId);

console.log('====================================================');
console.log('🔑 GENERATOR KUNCI LISENSI RESMI PUSTAKASMART RFID');
console.log('====================================================');
console.log('🏫 Nama Instansi / Sekolah :', schoolName);
console.log('📧 Email Resmi Instansi    :', schoolEmail);
console.log('🆔 Registration ID         :', regId);
console.log('----------------------------------------------------');
console.log('💎 KUNCI LISENSI PRO RESMI :', proKey);
console.log('====================================================');
