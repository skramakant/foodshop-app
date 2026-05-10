// lib/whatsapp.js — WhatsApp message construction functions
// These functions are pure JS with no GAS dependencies, testable in Node.js.

/**
 * Builds a formatted WhatsApp order message.
 *
 * @param {import('./types').CartItem[]} cart - Array of cart items
 * @param {string} customerName - Customer's full name
 * @param {string} customerWhatsApp - Customer's WhatsApp number
 * @param {string} customerAddress - Customer's delivery address
 * @returns {string} Formatted order message
 */
function buildWhatsAppMessage(cart, customerName, customerWhatsApp, customerAddress) {
  const itemLines = cart.map((item) => {
    const subtotal = item.price * item.quantity;
    return `- ${item.name} x${item.quantity} @ $${item.price} = $${subtotal}`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return [
    '🛒 New Order',
    '',
    'Items:',
    ...itemLines,
    '',
    `Total: $${total}`,
    '',
    `Customer Name: ${customerName}`,
    `Customer WhatsApp: ${customerWhatsApp}`,
    `Delivery Address: ${customerAddress}`,
  ].join('\n');
}

/**
 * Builds a wa.me deep-link URL pre-filled with the given message.
 *
 * @param {string} shopNumber - Shop's WhatsApp number (digits only, no leading +)
 * @param {string} message - The pre-formatted order message
 * @returns {string} Full wa.me URL with encoded message
 */
function buildWaMeUrl(shopNumber, message) {
  return `https://wa.me/${shopNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildWhatsAppMessage, buildWaMeUrl };
