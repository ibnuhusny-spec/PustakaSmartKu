// WhatsApp Gateway & Foonte Helper Service for PustakaSmart RFID

/**
 * Format and sanitize phone numbers for WhatsApp (e.g. 08123456789 -> 628123456789)
 */
export function formatWaNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, ''); // Remove non-digits
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Replace dynamic placeholders in WhatsApp message templates
 */
export function formatWaMessage(template, data = {}) {
  if (!template) return '';
  let msg = template;
  
  const replacements = {
    '{nama}': data.nama || data.name || 'Anggota',
    '{kelas}': data.kelas || data.classGrade || '-',
    '{peran}': data.peran || data.role || 'Anggota',
    '{judul_buku}': data.judul_buku || data.bookTitle || 'Buku Perpustakaan',
    '{tgl_pinjam}': data.tgl_pinjam || data.borrowDate || '-',
    '{tgl_kembali}': data.tgl_kembali || data.dueDate || data.returnDate || '-',
    '{denda}': typeof data.denda === 'number' ? data.denda.toLocaleString('id-ID') : (data.fine || '0'),
    '{saldo}': typeof data.saldo === 'number' ? data.saldo.toLocaleString('id-ID') : (data.balance || '0'),
    '{nama_sekolah}': data.nama_sekolah || data.schoolName || 'Perpustakaan Digital',
    '{nota}': data.nota || data.trxId || '-'
  };

  for (const [placeholder, val] of Object.entries(replacements)) {
    msg = msg.split(placeholder).join(val);
  }

  return msg;
}

/**
 * Send WhatsApp notification using Foonte REST API or direct wa.me fallback
 */
export async function sendWhatsAppNotification({ targetPhone, message, foonteApiToken }) {
  const cleanNumber = formatWaNumber(targetPhone);
  if (!cleanNumber) {
    return { success: false, error: 'Nomor WhatsApp tidak valid atau kosong.' };
  }

  const token = (foonteApiToken || '').trim();

  // If Foonte API Token is configured, attempt background HTTP POST call via server API or direct
  if (token) {
    try {
      let resData = null;
      // Try local server proxy endpoint first
      try {
        const proxyRes = await fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: cleanNumber, message, token })
        });
        if (proxyRes.ok) {
          resData = await proxyRes.json();
        }
      } catch (proxyErr) {
        console.warn('Backend proxy WA unavailable, attempting direct fetch:', proxyErr);
      }

      // Direct fetch fallback if proxy wasn't available
      if (!resData) {
        const directRes = await fetch('https://api.foonte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ target: cleanNumber, message })
        });
        resData = await directRes.json();
      }

      if (resData && (resData.status === true || resData.detail === 'success' || resData.status === 'true')) {
        return { success: true, method: 'foonte', message: '✅ Pesan WhatsApp berhasil terkirim via Foonte Gateway!' };
      } else {
        console.warn('⚠️ Foonte API response error:', resData);
        openDirectWaLink(cleanNumber, message);
        return { 
          success: true, 
          method: 'wa_link', 
          message: `⚠️ Foonte (${resData?.reason || 'Token tidak aktif'}). Menampilkan tab WhatsApp Direct.` 
        };
      }
    } catch (err) {
      console.error('❌ Error sending WhatsApp via Foonte:', err);
      openDirectWaLink(cleanNumber, message);
      return { success: true, method: 'wa_link', message: '⚠️ Membuka WhatsApp Direct...' };
    }
  }

  // Fallback: Open Direct wa.me URL link
  openDirectWaLink(cleanNumber, message);
  return { success: true, method: 'wa_link', message: '📱 Membuka link WhatsApp Direct...' };
}

/**
 * Helper to open WhatsApp Web / App directly in a new tab
 */
export function openDirectWaLink(targetPhone, message) {
  const cleanNumber = formatWaNumber(targetPhone);
  if (!cleanNumber) return;
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
