/**
 * cart.js — Pure cart state functions (no side effects, no DOM)
 * Identical logic to lib/cart.js but as ES modules.
 */

export function addToCart(cart, item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    return cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
  }
  return [...cart, { ...item, quantity: item.quantity || 1 }];
}

export function removeFromCart(cart, itemId) {
  return cart.filter(c => c.id !== itemId);
}

export function updateQuantity(cart, itemId, qty) {
  if (qty <= 0) return cart.filter(c => c.id !== itemId);
  return cart.map(c => c.id === itemId ? { ...c, quantity: qty } : c);
}

export function calcTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ── Session storage persistence ────────────────────────────────────────────
export function saveCart(cart) {
  try { sessionStorage.setItem('cart', JSON.stringify(cart)); } catch {}
}

export function loadCart() {
  try {
    const stored = sessionStorage.getItem('cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}
