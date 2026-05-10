/**
 * utils.js — Shared utility functions
 */

// ── HTML escaping ──────────────────────────────────────────────────────────
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Price formatting ───────────────────────────────────────────────────────
let _currency = 'Rs';

export function setCurrency(symbol) {
  _currency = symbol || 'Rs';
}

export function formatPrice(num) {
  return `${_currency} ${Number(num).toFixed(2)}`;
}

// ── Timestamp formatting ───────────────────────────────────────────────────
export function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

// ── WhatsApp message builder ───────────────────────────────────────────────
export function buildWhatsAppMessage(cart, customerName, customerWhatsApp, customerAddress) {
  const itemLines = cart.map(item => {
    const subtotal = item.price * item.quantity;
    return `- ${item.name} x${item.quantity} @ ${item.price} = ${subtotal}`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return [
    '🛒 New Order', '',
    'Items:', ...itemLines, '',
    `Total: ${total}`, '',
    `Customer Name: ${customerName}`,
    `Customer WhatsApp: ${customerWhatsApp}`,
    `Delivery Address: ${customerAddress}`,
  ].join('\n');
}

export function buildWaMeUrl(shopNumber, message) {
  return `https://wa.me/${shopNumber}?text=${encodeURIComponent(message)}`;
}

// ── Validation ─────────────────────────────────────────────────────────────
export function validateOrderForm({ customer_name, customer_whatsapp, customer_address } = {}) {
  const errors = {};
  if (!customer_name?.trim())    errors.customer_name    = 'Name is required';
  if (!customer_whatsapp?.trim()) errors.customer_whatsapp = 'WhatsApp number is required';
  if (!customer_address?.trim()) errors.customer_address  = 'Delivery address is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFoodItem(item) {
  const errors = {};
  if (!item?.name?.trim())        errors.name        = 'Name is required';
  if (!item?.description?.trim()) errors.description = 'Description is required';
  if (!item?.image?.trim())       errors.image       = 'Image URL is required';
  if (!item?.price || item.price <= 0) errors.price  = 'Price must be a positive number';
  if (!['available', 'not_available'].includes(item?.availability))
    errors.availability = 'Availability is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateShopSettings({ shop_name, whatsapp_number, email, address, status } = {}) {
  const errors = {};
  if (!shop_name?.trim())       errors.shop_name       = 'Shop name is required';
  if (!whatsapp_number?.trim()) errors.whatsapp_number = 'WhatsApp number is required';
  if (!/^\d+$/.test((whatsapp_number || '').replace(/^\+/, '')))
    errors.whatsapp_number = 'WhatsApp number must contain digits only';
  if (!email?.trim())           errors.email           = 'Email is required';
  if (!address?.trim())         errors.address         = 'Address is required';
  if (!['open', 'closed'].includes(status)) errors.status = 'Status must be open or closed';
  return { valid: Object.keys(errors).length === 0, errors };
}
