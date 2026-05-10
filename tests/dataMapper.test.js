// tests/dataMapper.test.js — Unit tests for lib/dataMapper.js
// Feature: foodshop-app
// Covers: row-to-object and object-to-row converters for all four sheets (Tasks 3.1–3.4)

const {
  rowToAdminSettings,
  adminSettingsToRow,
  rowToFoodItem,
  foodItemToRow,
  rowToUser,
  userToRow,
  rowToOrder,
  orderToRow,
} = require('../lib/dataMapper');

// ─── admin sheet converters ───────────────────────────────────────────────
// Columns: shop_name (0), whatsapp_number (1), email (2), address (3), status (4)

describe('admin sheet converters', () => {
  const obj = {
    shop_name: 'Tasty Bites',
    whatsapp_number: '971501234567',
    email: 'info@tastybites.com',
    address: '42 Palm Street, Dubai',
    status: 'open',
  };
  const row = ['Tasty Bites', '971501234567', 'info@tastybites.com', '42 Palm Street, Dubai', 'open'];

  test('adminSettingsToRow produces correct column order', () => {
    const result = adminSettingsToRow(obj);
    expect(result[0]).toBe(obj.shop_name);        // col 0: shop_name
    expect(result[1]).toBe(obj.whatsapp_number);  // col 1: whatsapp_number
    expect(result[2]).toBe(obj.email);            // col 2: email
    expect(result[3]).toBe(obj.address);          // col 3: address
    expect(result[4]).toBe(obj.status);           // col 4: status
    expect(result).toHaveLength(5);
  });

  test('rowToAdminSettings produces correct field mapping', () => {
    const result = rowToAdminSettings(row);
    expect(result.shop_name).toBe(row[0]);
    expect(result.whatsapp_number).toBe(row[1]);
    expect(result.email).toBe(row[2]);
    expect(result.address).toBe(row[3]);
    expect(result.status).toBe(row[4]);
  });

  test('round-trip: rowToAdminSettings(adminSettingsToRow(obj)) equals original', () => {
    expect(rowToAdminSettings(adminSettingsToRow(obj))).toEqual(obj);
  });

  test('round-trip: adminSettingsToRow(rowToAdminSettings(row)) equals original', () => {
    expect(adminSettingsToRow(rowToAdminSettings(row))).toEqual(row);
  });
});

// ─── food_items sheet converters ──────────────────────────────────────────
// Columns: id (0), name (1), description (2), price (3), image (4), availability (5)

describe('food_items sheet converters', () => {
  const item = {
    id: 'abc-123',
    name: 'Burger',
    description: 'Juicy beef burger with lettuce and tomato',
    price: 9.99,
    image: 'https://img.example.com/burger.jpg',
    availability: 'available',
  };
  const row = [
    'abc-123',
    'Burger',
    'Juicy beef burger with lettuce and tomato',
    9.99,
    'https://img.example.com/burger.jpg',
    'available',
  ];

  test('foodItemToRow produces correct column order', () => {
    const result = foodItemToRow(item);
    expect(result[0]).toBe(item.id);           // col 0: id
    expect(result[1]).toBe(item.name);         // col 1: name
    expect(result[2]).toBe(item.description);  // col 2: description
    expect(result[3]).toBe(item.price);        // col 3: price
    expect(result[4]).toBe(item.image);        // col 4: image
    expect(result[5]).toBe(item.availability); // col 5: availability
    expect(result).toHaveLength(6);
  });

  test('rowToFoodItem produces correct field mapping', () => {
    const result = rowToFoodItem(row);
    expect(result.id).toBe(row[0]);
    expect(result.name).toBe(row[1]);
    expect(result.description).toBe(row[2]);
    expect(result.price).toBe(row[3]);
    expect(result.image).toBe(row[4]);
    expect(result.availability).toBe(row[5]);
  });

  test('rowToFoodItem converts price to Number', () => {
    const rowWithStringPrice = [
      'id-1',
      'Fries',
      'Crispy golden fries',
      '3.50',
      'https://img.example.com/fries.jpg',
      'available',
    ];
    const result = rowToFoodItem(rowWithStringPrice);
    expect(typeof result.price).toBe('number');
    expect(result.price).toBe(3.5);
  });

  test('round-trip: rowToFoodItem(foodItemToRow(item)) equals original item', () => {
    expect(rowToFoodItem(foodItemToRow(item))).toEqual(item);
  });

  test('round-trip: foodItemToRow(rowToFoodItem(row)) equals original row', () => {
    expect(foodItemToRow(rowToFoodItem(row))).toEqual(row);
  });
});

// ─── users sheet converters ───────────────────────────────────────────────
// Columns: whatsapp_number (0), name (1), address (2), order_count (3), last_updated (4)

describe('users sheet converters', () => {
  const whatsapp = '971509876543';
  const name = 'Ahmed Al-Rashid';
  const address = '42 Palm Street, Dubai';
  const orderCount = 5;
  const timestamp = '2024-01-15T10:30:00.000Z';
  const row = [whatsapp, name, address, orderCount, timestamp];

  test('userToRow produces correct column order', () => {
    const result = userToRow(whatsapp, name, address, orderCount, timestamp);
    expect(result[0]).toBe(whatsapp);     // col 0: whatsapp_number
    expect(result[1]).toBe(name);         // col 1: name
    expect(result[2]).toBe(address);      // col 2: address
    expect(result[3]).toBe(orderCount);   // col 3: order_count
    expect(result[4]).toBe(timestamp);    // col 4: last_updated
    expect(result).toHaveLength(5);
  });

  test('rowToUser produces correct field mapping', () => {
    const result = rowToUser(row);
    expect(result.whatsapp_number).toBe(row[0]);
    expect(result.name).toBe(row[1]);
    expect(result.address).toBe(row[2]);
    expect(result.order_count).toBe(row[3]);
    expect(result.last_updated).toBe(row[4]);
  });

  test('rowToUser converts order_count to Number', () => {
    const rowWithStringCount = [whatsapp, name, address, '3', timestamp];
    const result = rowToUser(rowWithStringCount);
    expect(typeof result.order_count).toBe('number');
    expect(result.order_count).toBe(3);
  });

  test('round-trip: rowToUser(userToRow(w, n, a, c, t)) equals original values', () => {
    const result = rowToUser(userToRow(whatsapp, name, address, orderCount, timestamp));
    expect(result.whatsapp_number).toBe(whatsapp);
    expect(result.name).toBe(name);
    expect(result.address).toBe(address);
    expect(result.order_count).toBe(orderCount);
    expect(result.last_updated).toBe(timestamp);
  });

  test('round-trip: userToRow(rowToUser(row)) equals original row', () => {
    const user = rowToUser(row);
    expect(userToRow(user.whatsapp_number, user.name, user.address, user.order_count, user.last_updated)).toEqual(row);
  });
});

// ─── orders sheet converters ──────────────────────────────────────────────
// Columns: order_id (0), cart_details (1), total_price (2), customer_name (3),
//          customer_whatsapp (4), customer_address (5), status (6), timestamp (7)

describe('orders sheet converters', () => {
  const payload = {
    cart: [
      { id: 'item-1', name: 'Chicken Burger', price: 5.0, quantity: 2 },
      { id: 'item-2', name: 'Fries', price: 2.5, quantity: 1 },
    ],
    total_price: 12.5,
    customer_name: 'Sara Hassan',
    customer_whatsapp: '971501234567',
    customer_address: '123 Main St, Apt 4B',
  };
  const orderId = 'order-uuid-001';
  const status = 'received';
  const timestamp = '2024-01-15T12:00:00.000Z';

  test('orderToRow produces correct column order', () => {
    const result = orderToRow(payload, orderId, status, timestamp);
    expect(result[0]).toBe(orderId);                          // col 0: order_id
    expect(result[1]).toBe(JSON.stringify(payload.cart));     // col 1: cart_details (JSON string)
    expect(result[2]).toBe(payload.total_price);              // col 2: total_price
    expect(result[3]).toBe(payload.customer_name);            // col 3: customer_name
    expect(result[4]).toBe(payload.customer_whatsapp);        // col 4: customer_whatsapp
    expect(result[5]).toBe(payload.customer_address);         // col 5: customer_address
    expect(result[6]).toBe(status);                           // col 6: status
    expect(result[7]).toBe(timestamp);                        // col 7: timestamp
    expect(result).toHaveLength(8);
  });

  test('rowToOrder produces correct field mapping', () => {
    const row = orderToRow(payload, orderId, status, timestamp);
    const result = rowToOrder(row);
    expect(result.order_id).toBe(orderId);
    expect(result.cart_details).toEqual(payload.cart);
    expect(result.total_price).toBe(payload.total_price);
    expect(result.customer_name).toBe(payload.customer_name);
    expect(result.customer_whatsapp).toBe(payload.customer_whatsapp);
    expect(result.customer_address).toBe(payload.customer_address);
    expect(result.status).toBe(status);
    expect(result.timestamp).toBe(timestamp);
  });

  test('rowToOrder converts total_price to Number', () => {
    const row = [
      orderId,
      JSON.stringify(payload.cart),
      '12.50',
      payload.customer_name,
      payload.customer_whatsapp,
      payload.customer_address,
      status,
      timestamp,
    ];
    const result = rowToOrder(row);
    expect(typeof result.total_price).toBe('number');
    expect(result.total_price).toBe(12.5);
  });

  test('rowToOrder parses cart_details from JSON string', () => {
    const row = orderToRow(payload, orderId, status, timestamp);
    const result = rowToOrder(row);
    expect(Array.isArray(result.cart_details)).toBe(true);
    expect(result.cart_details).toEqual(payload.cart);
  });

  test('round-trip: rowToOrder(orderToRow(payload, id, status, ts)) equals original payload fields', () => {
    const row = orderToRow(payload, orderId, status, timestamp);
    const result = rowToOrder(row);
    expect(result.order_id).toBe(orderId);
    expect(result.cart_details).toEqual(payload.cart);
    expect(result.total_price).toBe(payload.total_price);
    expect(result.customer_name).toBe(payload.customer_name);
    expect(result.customer_whatsapp).toBe(payload.customer_whatsapp);
    expect(result.customer_address).toBe(payload.customer_address);
    expect(result.status).toBe(status);
    expect(result.timestamp).toBe(timestamp);
  });
});
