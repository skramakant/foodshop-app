// Validation.gs — Server-side input validation helpers
// ─────────────────────────────────────────────────────────────────────────────
// These functions are used by ShopService.gs and OrderService.gs before
// writing any data to Google Sheets.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a WhatsApp number.
 * Strips a leading '+' if present, then checks the remaining string
 * is non-empty and contains only digit characters.
 *
 * @param {string} value
 * @returns {{ valid: boolean, error: string }}
 */
function validateWhatsAppNumber(value) {
  if (typeof value !== 'string') {
    return { valid: false, error: 'WhatsApp number must be a string' };
  }
  var stripped = value.startsWith('+') ? value.slice(1) : value;
  if (stripped.length === 0) {
    return { valid: false, error: 'WhatsApp number is required' };
  }
  if (!/^\d+$/.test(stripped)) {
    return { valid: false, error: 'WhatsApp number must contain digits only' };
  }
  return { valid: true, error: '' };
}
