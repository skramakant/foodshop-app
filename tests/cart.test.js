// tests/cart.test.js — Tests for lib/cart.js
// Feature: foodshop-app
// Covers: addToCart, removeFromCart, updateQuantity, calcTotal

// TODO: Property test P3: Cart total is always the sum of price × quantity (Task 3.2)

const { addToCart, removeFromCart, updateQuantity, calcTotal } = require('../lib/cart');

// ---------------------------------------------------------------------------
// addToCart
// ---------------------------------------------------------------------------

describe('addToCart', () => {
  test('adds a new item to an empty cart', () => {
    const cart = [];
    const item = { id: '1', name: 'Burger', price: 5.0, quantity: 1 };
    const result = addToCart(cart, item);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(item);
  });

  test('adds a new item to a non-empty cart', () => {
    const existing = { id: '1', name: 'Burger', price: 5.0, quantity: 1 };
    const cart = [existing];
    const newItem = { id: '2', name: 'Fries', price: 2.5, quantity: 1 };
    const result = addToCart(cart, newItem);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(newItem);
  });

  test('increments quantity when adding an item that already exists in the cart', () => {
    const item = { id: '1', name: 'Burger', price: 5.0, quantity: 2 };
    const cart = [item];
    const result = addToCart(cart, { id: '1', name: 'Burger', price: 5.0, quantity: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  test('does not mutate the original cart', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 1 }];
    const original = [...cart];
    addToCart(cart, { id: '2', name: 'Fries', price: 2.5, quantity: 1 });
    expect(cart).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// removeFromCart
// ---------------------------------------------------------------------------

describe('removeFromCart', () => {
  test('removes an item by id', () => {
    const cart = [
      { id: '1', name: 'Burger', price: 5.0, quantity: 1 },
      { id: '2', name: 'Fries', price: 2.5, quantity: 1 },
    ];
    const result = removeFromCart(cart, '1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  test('returns a copy of the cart unchanged when id is not found', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 1 }];
    const result = removeFromCart(cart, 'nonexistent');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('returns an empty array when removing the only item', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 1 }];
    const result = removeFromCart(cart, '1');
    expect(result).toHaveLength(0);
  });

  test('does not mutate the original cart', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 1 }];
    const original = [...cart];
    removeFromCart(cart, '1');
    expect(cart).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// updateQuantity
// ---------------------------------------------------------------------------

describe('updateQuantity', () => {
  test('updates the quantity of an existing item', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 1 }];
    const result = updateQuantity(cart, '1', 3);
    expect(result[0].quantity).toBe(3);
  });

  test('removes the item when quantity is set to 0', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 2 }];
    const result = updateQuantity(cart, '1', 0);
    expect(result).toHaveLength(0);
  });

  test('removes the item when quantity is set to a negative number', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 2 }];
    const result = updateQuantity(cart, '1', -1);
    expect(result).toHaveLength(0);
  });

  test('leaves other items unchanged when updating one item', () => {
    const cart = [
      { id: '1', name: 'Burger', price: 5.0, quantity: 1 },
      { id: '2', name: 'Fries', price: 2.5, quantity: 1 },
    ];
    const result = updateQuantity(cart, '1', 5);
    expect(result[0].quantity).toBe(5);
    expect(result[1].quantity).toBe(1);
  });

  test('does not mutate the original cart', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 1 }];
    const original = [{ ...cart[0] }];
    updateQuantity(cart, '1', 4);
    expect(cart).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// calcTotal
// ---------------------------------------------------------------------------

describe('calcTotal', () => {
  test('returns 0 for an empty cart', () => {
    expect(calcTotal([])).toBe(0);
  });

  test('returns the correct total for a single item', () => {
    const cart = [{ id: '1', name: 'Burger', price: 5.0, quantity: 3 }];
    expect(calcTotal(cart)).toBe(15.0);
  });

  test('returns the correct sum for multiple items', () => {
    const cart = [
      { id: '1', name: 'Burger', price: 5.0, quantity: 2 },  // 10.00
      { id: '2', name: 'Fries', price: 2.5, quantity: 1 },   //  2.50
      { id: '3', name: 'Drink', price: 1.5, quantity: 4 },   //  6.00
    ];
    expect(calcTotal(cart)).toBeCloseTo(18.5);
  });

  test('handles items with quantity 1', () => {
    const cart = [{ id: '1', name: 'Burger', price: 7.99, quantity: 1 }];
    expect(calcTotal(cart)).toBeCloseTo(7.99);
  });
});
