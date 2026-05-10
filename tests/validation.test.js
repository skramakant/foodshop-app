// tests/validation.test.js — Tests for lib/validation.js
// Feature: foodshop-app
// Covers: validateFoodItem, validateWhatsAppNumber, validateOrderPopup, validateShopSettings

const { validateFoodItem, validateWhatsAppNumber, validateOrderPopup, validateShopSettings } = require('../lib/validation');

// ---------------------------------------------------------------------------
// validateFoodItem — Unit tests (Task 2.1)
// ---------------------------------------------------------------------------

describe('validateFoodItem', () => {
  const validItem = {
    name: 'Chicken Burger',
    description: 'Tasty burger',
    image: 'https://example.com/burger.jpg',
    price: 5.99,
    availability: 'available',
  };

  test('valid item passes', () => {
    const result = validateFoodItem(validItem);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('missing name fails with error on name field', () => {
    const result = validateFoodItem({ ...validItem, name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('name');
  });

  test('missing description fails', () => {
    const result = validateFoodItem({ ...validItem, description: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('description');
  });

  test('missing image fails', () => {
    const result = validateFoodItem({ ...validItem, image: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('image');
  });

  test('price = 0 fails', () => {
    const result = validateFoodItem({ ...validItem, price: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('price');
  });

  test('negative price fails', () => {
    const result = validateFoodItem({ ...validItem, price: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('price');
  });

  test('invalid availability fails', () => {
    const result = validateFoodItem({ ...validItem, availability: 'lunch' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('availability');
  });

  test('all fields missing fails', () => {
    const result = validateFoodItem({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('name');
    expect(result.errors).toHaveProperty('description');
    expect(result.errors).toHaveProperty('image');
    expect(result.errors).toHaveProperty('price');
    expect(result.errors).toHaveProperty('availability');
  });
});

// TODO: Property test P2: Food item validation rejects incomplete records (Task 2.2)
// TODO: Property test P9: WhatsApp number validation rejects non-numeric input (Task 2.4)
// TODO: Property test P4: Order popup validation rejects incomplete submissions (Task 2.6)

// ---------------------------------------------------------------------------
// validateOrderPopup — Unit tests (Task 2.3)
// ---------------------------------------------------------------------------

describe('validateOrderPopup', () => {
  const validPopup = {
    customer_name: 'Jane Smith',
    customer_whatsapp: '971501234567',
    customer_address: '123 Main St',
  };

  test('valid name, whatsapp and address passes', () => {
    const result = validateOrderPopup(validPopup);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('empty name fails with error on customer_name field', () => {
    const result = validateOrderPopup({ ...validPopup, customer_name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_name');
    expect(result.errors).not.toHaveProperty('customer_whatsapp');
    expect(result.errors).not.toHaveProperty('customer_address');
  });

  test('whitespace-only name fails', () => {
    const result = validateOrderPopup({ ...validPopup, customer_name: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_name');
  });

  test('empty whatsapp fails with error on customer_whatsapp field', () => {
    const result = validateOrderPopup({ ...validPopup, customer_whatsapp: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_whatsapp');
    expect(result.errors).not.toHaveProperty('customer_address');
  });

  test('whitespace-only whatsapp fails', () => {
    const result = validateOrderPopup({ ...validPopup, customer_whatsapp: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_whatsapp');
  });

  test('empty address fails with error on customer_address field', () => {
    const result = validateOrderPopup({ ...validPopup, customer_address: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_address');
    expect(result.errors).not.toHaveProperty('customer_whatsapp');
  });

  test('whitespace-only address fails', () => {
    const result = validateOrderPopup({ ...validPopup, customer_address: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_address');
  });

  test('all fields empty fails with errors on all three fields', () => {
    const result = validateOrderPopup({ customer_name: '', customer_whatsapp: '', customer_address: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('customer_name');
    expect(result.errors).toHaveProperty('customer_whatsapp');
    expect(result.errors).toHaveProperty('customer_address');
  });
});

// ---------------------------------------------------------------------------
// validateWhatsAppNumber — Unit tests (Task 2.3)
// ---------------------------------------------------------------------------

describe('validateWhatsAppNumber', () => {
  test('valid number with digits only passes', () => {
    const result = validateWhatsAppNumber('971501234567');
    expect(result.valid).toBe(true);
    expect(result.error).toBe('');
  });

  test('valid number with leading + passes', () => {
    const result = validateWhatsAppNumber('+971501234567');
    expect(result.valid).toBe(true);
    expect(result.error).toBe('');
  });

  test('empty string fails', () => {
    const result = validateWhatsAppNumber('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('string with letters fails', () => {
    const result = validateWhatsAppNumber('97150abc4567');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('string with spaces fails', () => {
    const result = validateWhatsAppNumber('971 501 234 567');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('string with special characters fails', () => {
    const result = validateWhatsAppNumber('971-501-234-567');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('only "+" fails (no digits)', () => {
    const result = validateWhatsAppNumber('+');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// validateShopSettings — Unit tests (Task 2.5)
// ---------------------------------------------------------------------------

describe('validateShopSettings', () => {
  const validSettings = {
    shop_name: 'My Food Shop',
    whatsapp_number: '971501234567',
    email: 'shop@example.com',
    address: '123 Main St, Dubai',
    status: 'open',
  };

  test('valid settings passes', () => {
    const result = validateShopSettings(validSettings);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('empty shop_name fails', () => {
    const result = validateShopSettings({ ...validSettings, shop_name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('shop_name');
  });

  test('invalid whatsapp fails', () => {
    const result = validateShopSettings({ ...validSettings, whatsapp_number: 'not-a-number' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('whatsapp_number');
  });

  test('empty email fails', () => {
    const result = validateShopSettings({ ...validSettings, email: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('email');
  });

  test('empty address fails', () => {
    const result = validateShopSettings({ ...validSettings, address: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('address');
  });

  test('invalid status fails', () => {
    const result = validateShopSettings({ ...validSettings, status: 'maybe' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('status');
  });

  test('all fields empty fails', () => {
    const result = validateShopSettings({ shop_name: '', whatsapp_number: '', email: '', address: '', status: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('shop_name');
    expect(result.errors).toHaveProperty('whatsapp_number');
    expect(result.errors).toHaveProperty('email');
    expect(result.errors).toHaveProperty('address');
    expect(result.errors).toHaveProperty('status');
  });
});
