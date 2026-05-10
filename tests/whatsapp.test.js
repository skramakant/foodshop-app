// tests/whatsapp.test.js — Tests for lib/whatsapp.js
// Feature: foodshop-app
// Covers: buildWhatsAppMessage, buildWaMeUrl

const { buildWhatsAppMessage, buildWaMeUrl } = require('../lib/whatsapp');

const singleItemCart = [{ id: 'item-1', name: 'Chicken Burger', price: 5.0, quantity: 2 }];
const multiItemCart = [
  { id: 'item-1', name: 'Chicken Burger', price: 5.0, quantity: 2 },
  { id: 'item-2', name: 'Fries', price: 2.5, quantity: 1 },
];
const customerName = 'Jane Smith';
const customerWhatsApp = '+1234567890';
const customerAddress = '123 Main St, Apt 4B';

// --- buildWhatsAppMessage ---

test('buildWhatsAppMessage: contains item name in output', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain('Chicken Burger');
});

test('buildWhatsAppMessage: contains quantity in output', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain('x2');
});

test('buildWhatsAppMessage: contains price in output', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain('$5');
});

test('buildWhatsAppMessage: contains total in output', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  // 2 × $5.00 = $10.00
  expect(msg).toContain('Total: $10');
});

test('buildWhatsAppMessage: contains customer name', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain('Customer Name: Jane Smith');
});

test('buildWhatsAppMessage: contains customer WhatsApp number', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain(customerWhatsApp);
});

test('buildWhatsAppMessage: contains delivery address', () => {
  const msg = buildWhatsAppMessage(singleItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain(customerAddress);
});

test('buildWhatsAppMessage: handles multiple items', () => {
  const msg = buildWhatsAppMessage(multiItemCart, customerName, customerWhatsApp, customerAddress);
  expect(msg).toContain('Chicken Burger');
  expect(msg).toContain('Fries');
  // Total: 2×5 + 1×2.5 = 12.5
  expect(msg).toContain('Total: $12.5');
});

// --- buildWaMeUrl ---

test('buildWaMeUrl: returns correct URL format starting with https://wa.me/', () => {
  const url = buildWaMeUrl('971501234567', 'Hello');
  expect(url).toMatch(/^https:\/\/wa\.me\//);
});

test('buildWaMeUrl: URL contains encoded message', () => {
  const message = 'Hello World';
  const url = buildWaMeUrl('971501234567', message);
  expect(url).toContain(encodeURIComponent(message));
});

test('buildWaMeUrl: shop number is in the URL', () => {
  const shopNumber = '971501234567';
  const url = buildWaMeUrl(shopNumber, 'test');
  expect(url).toContain(shopNumber);
});
