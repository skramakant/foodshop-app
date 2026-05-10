// lib/validation.js — Pure validation functions
// These functions are pure JS with no GAS dependencies, testable in Node.js.

const VALID_AVAILABILITY = ['available', 'not_available'];

/**
 * Validates a food item object.
 *
 * @param {Object} item - The food item to validate
 * @param {string} item.name - Display name (must be non-empty)
 * @param {string} item.description - Description (must be non-empty)
 * @param {string} item.image - Image URL (must be non-empty)
 * @param {number} item.price - Price (must be a positive number > 0)
 * @param {string} item.availability - Availability status (must be 'available' or 'not_available')
 * @returns {{ valid: boolean, errors: Object }} Result with validity flag and field-level errors
 */
function validateFoodItem(item) {
  const errors = {};

  if (!item || typeof item.name !== 'string' || item.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!item || typeof item.description !== 'string' || item.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!item || typeof item.image !== 'string' || item.image.trim() === '') {
    errors.image = 'Image is required';
  }

  if (!item || typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
    errors.price = 'Price must be a positive number';
  }

  if (!item || !VALID_AVAILABILITY.includes(item.availability)) {
    errors.availability = 'Availability must be available or not_available';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a WhatsApp number.
 *
 * Strips a leading '+' if present, then checks that the remaining string
 * is non-empty and contains only digit characters.
 *
 * @param {string} value - The WhatsApp number to validate (e.g. "+971501234567" or "971501234567")
 * @returns {{ valid: boolean, error: string }} Result with validity flag and error message
 */
function validateWhatsAppNumber(value) {
  if (typeof value !== 'string') {
    return { valid: false, error: 'WhatsApp number must be a string' };
  }

  // Strip leading '+' if present
  const stripped = value.startsWith('+') ? value.slice(1) : value;

  if (stripped.length === 0) {
    return { valid: false, error: 'WhatsApp number is required' };
  }

  if (!/^\d+$/.test(stripped)) {
    return { valid: false, error: 'WhatsApp number must contain digits only' };
  }

  return { valid: true, error: '' };
}

/**
 * Validates the Order Popup submission fields.
 *
 * @param {Object} params
 * @param {string} params.customer_name     - Customer's name (must be non-empty, non-whitespace)
 * @param {string} params.customer_whatsapp - Customer's WhatsApp number (must be non-empty, non-whitespace)
 * @param {string} params.customer_address  - Customer's delivery address (must be non-empty, non-whitespace)
 * @returns {{ valid: boolean, errors: Object }} Result with validity flag and field-level errors
 */
function validateOrderPopup({ customer_name, customer_whatsapp, customer_address } = {}) {
  const errors = {};

  if (typeof customer_name !== 'string' || customer_name.trim() === '') {
    errors.customer_name = 'Name is required';
  }

  if (typeof customer_whatsapp !== 'string' || customer_whatsapp.trim() === '') {
    errors.customer_whatsapp = 'WhatsApp number is required';
  }

  if (typeof customer_address !== 'string' || customer_address.trim() === '') {
    errors.customer_address = 'Delivery address is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates shop settings.
 *
 * @param {Object} params
 * @param {string} params.shop_name       - Shop name (must be non-empty)
 * @param {string} params.whatsapp_number - WhatsApp number (validated via validateWhatsAppNumber)
 * @param {string} params.email           - Email address (must be non-empty)
 * @param {string} params.address         - Shop address (must be non-empty)
 * @param {string} params.status          - Shop status (must be 'open' or 'closed')
 * @returns {{ valid: boolean, errors: Object }} Result with validity flag and field-level errors
 */
function validateShopSettings({ shop_name, whatsapp_number, email, address, status } = {}) {
  const errors = {};

  if (typeof shop_name !== 'string' || shop_name.trim() === '') {
    errors.shop_name = 'Shop name is required';
  }

  const waResult = validateWhatsAppNumber(whatsapp_number);
  if (!waResult.valid) {
    errors.whatsapp_number = waResult.error;
  }

  if (typeof email !== 'string' || email.trim() === '') {
    errors.email = 'Email is required';
  }

  if (typeof address !== 'string' || address.trim() === '') {
    errors.address = 'Address is required';
  }

  if (status !== 'open' && status !== 'closed') {
    errors.status = 'Status must be open or closed';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = { validateFoodItem, validateWhatsAppNumber, validateOrderPopup, validateShopSettings };
