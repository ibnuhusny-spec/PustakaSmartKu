/**
 * Utility Service for Book Spine Label (Call Number) Generation
 * Standard: Perpustakaan Nasional Republik Indonesia (Perpusnas RI)
 */

/**
 * Common titles to strip when parsing author names
 */
const TITLES_TO_STRIP = [
  'prof.', 'prof', 'dr.', 'dr', 'dra.', 'dra', 'drs.', 'drs', 'ir.', 'ir',
  'h.', 'h', 'hj.', 'hj', 'kh.', 'kh', 'm.pd', 'm.kom', 's.kom', 's.pd',
  's.t', 'm.t', 'ph.d', 'phd', 'st', 'mt', 'spd', 'mpd'
];

/**
 * Formats author name according to library cataloging rules (inverted)
 * and extracts the 3-letter uppercase code.
 * Example: "Andrea Hirata" -> "Hirata, Andrea" -> "HIR"
 * Example: "Budi Santoso" -> "SAN"
 */
export function parseAuthorCode(authorName) {
  if (!authorName || typeof authorName !== 'string' || !authorName.trim()) {
    return 'ANO'; // Anonim
  }

  let cleaned = authorName.trim();

  // Strip common academic/religious titles
  const words = cleaned.split(/\s+/).filter(w => {
    const lower = w.toLowerCase().replace(/[,.]/g, '');
    return !TITLES_TO_STRIP.includes(lower);
  });

  if (words.length === 0) {
    return 'ANO';
  }

  let mainName = '';
  if (words.length === 1) {
    mainName = words[0];
  } else {
    // Family name / last name comes first in library indexing
    mainName = words[words.length - 1];
  }

  // Remove non-alphanumeric characters
  const alphaOnly = mainName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  
  if (alphaOnly.length === 0) return 'ANO';
  if (alphaOnly.length < 3) return alphaOnly.padEnd(3, 'X');
  return alphaOnly.substring(0, 3);
}

/**
 * Extracts 1-letter lowercase title code from book title.
 * Ignores English articles (The, A, An).
 * Example: "Laskar Pelangi" -> "l"
 * Example: "The Lean Startup" -> "l"
 */
export function parseTitleCode(title) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'a';
  }

  let trimmed = title.trim();

  // Strip leading articles
  trimmed = trimmed.replace(/^(the|a|an)\s+/i, '');

  const firstChar = trimmed.charAt(0).toLowerCase();
  
  // Return character or fallback if non-alphabet
  if (/[a-z]/.test(firstChar)) {
    return firstChar;
  }
  return firstChar.toLowerCase() || 'a';
}

/**
 * Generates structured 4-line Call Number for a book
 * @param {Object} book Book object
 * @param {number} copyNumber Copy/exemplar number (default 1)
 * @param {boolean} includePrefix Whether to include category prefix (e.g. F for Fiksi, R for Referensi)
 */
export function generateCallNumber(book, copyNumber = 1, includePrefix = false) {
  let ddcLine = (book?.ddc || '800').trim();

  // Optional category prefix
  if (includePrefix && book?.category) {
    const cat = book.category.toLowerCase();
    if (cat.includes('fiksi') || cat.includes('novel')) {
      ddcLine = `F/${ddcLine}`;
    } else if (cat.includes('referensi') || cat.includes('ensiklopedia') || cat.includes('kamus')) {
      ddcLine = `R/${ddcLine}`;
    } else if (cat.includes('anak') || cat.includes('komik')) {
      ddcLine = `J/${ddcLine}`;
    }
  }

  const authorLine = parseAuthorCode(book?.author);
  const titleLine = parseTitleCode(book?.title);
  const copyLine = `c.${copyNumber}`;

  return {
    ddcLine,
    authorLine,
    titleLine,
    copyLine,
    fullText: `${ddcLine} ${authorLine} ${titleLine} ${copyLine}`
  };
}

/**
 * Returns Hex Color Code based on DDC 10 Main Classes
 * Useful for DDC Color Bar printing
 */
export function getDdcColor(ddcCode) {
  if (!ddcCode) return '#3b82f6';
  const cleanCode = ddcCode.replace(/[^0-9]/g, '');
  const firstDigit = cleanCode.charAt(0) || '0';

  const DDC_COLORS = {
    '0': '#475569', // 000 Karya Umum / Komputer (Slate)
    '1': '#8b5cf6', // 100 Filsafat & Psikologi (Violet)
    '2': '#eab308', // 200 Agama (Amber/Kuning)
    '3': '#2563eb', // 300 Ilmu Sosial (Biru)
    '4': '#06b6d4', // 400 Bahasa (Cyan)
    '5': '#16a34a', // 500 Sains & IPA (Hijau)
    '6': '#ea580c', // 600 Teknologi & Terapan (Oranye)
    '7': '#db2777', // 700 Kesenian & Olahraga (Pink)
    '8': '#e11d48', // 800 Sastra & Fiksi (Merah)
    '9': '#0891b2'  // 900 Sejarah & Geografi (Teal)
  };

  return DDC_COLORS[firstDigit] || '#3b82f6';
}
