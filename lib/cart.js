// lib/cart.js — Pure cart state functions
// These functions operate on a CartItem[] array and have no side effects.
// They are pure JS with no GAS dependencies, testable in Node.js.

/**
 * Adds an item to the cart. If an item with the same id already exists,
 * increments its quantity by 1. Returns a new cart array (no mutation).
 *
 * @param {import('./types').CartItem[]} cart
 * @param {import('./types').CartItem} item
 * @returns {import('./types').CartItem[]}
 */
function addToCart(cart, item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    return cart.map((c) =>
      c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
    );
  }
  return [...cart, { ...item }];
}

/**
 * Removes the item with the matching id from the cart.
 * Returns a new cart array (no mutation). If id not found, returns a copy of the original.
 *
 * @param {import('./types').CartItem[]} cart
 * @param {string} itemId
 * @returns {import('./types').CartItem[]}
 */
function removeFromCart(cart, itemId) {
  return cart.filter((c) => c.id !== itemId);
}

/**
 * Sets the quantity for the item with the matching id.
 * If qty <= 0, removes the item from the cart.
 * Returns a new cart array (no mutation).
 *
 * @param {import('./types').CartItem[]} cart
 * @param {string} itemId
 * @param {number} qty
 * @returns {import('./types').CartItem[]}
 */
function updateQuantity(cart, itemId, qty) {
  if (qty <= 0) {
    return cart.filter((c) => c.id !== itemId);
  }
  return cart.map((c) =>
    c.id === itemId ? { ...c, quantity: qty } : c
  );
}

/**
 * Returns the sum of (price × quantity) for all items in the cart.
 * Returns 0 for an empty cart.
 *
 * @param {import('./types').CartItem[]} cart
 * @returns {number}
 */
function calcTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

module.exports = { addToCart, removeFromCart, updateQuantity, calcTotal };
