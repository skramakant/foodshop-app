// lib/dataMapper.js — Row-to-object and object-to-row converters for all four sheets
// Column order must match the schema defined in the design document.
// These functions are pure JS with no GAS dependencies, testable in Node.js.

// ─── admin sheet ───────────────────────────────────────────────────────────
// Columns: shop_name (0), whatsapp_number (1), email (2), address (3), status (4)

/**
 * Convert an admin sheet row array to a shop settings object.
 * @param {Array} row - [shop_name, whatsapp_number, email, address, status]
 * @returns {{ shop_name: string, whatsapp_number: string, email: string, address: string, status: string }}
 */
function rowToAdminSettings(row) {
  return {
    shop_name: row[0],
    whatsapp_number: row[1],
    email: row[2],
    address: row[3],
    status: row[4],
  };
}

/**
 * Convert a shop settings object to a row array.
 * @param {{ shop_name: string, whatsapp_number: string, email: string, address: string, status: string }} obj
 * @returns {Array}
 */
function adminSettingsToRow(obj) {
  return [obj.shop_name, obj.whatsapp_number, obj.email, obj.address, obj.status];
}

// ─── food_items sheet ──────────────────────────────────────────────────────
// Columns: id (0), name (1), description (2), price (3), image (4), availability (5)

/**
 * Convert a food_items sheet row array to a FoodItem object.
 * @param {Array} row - [id, name, description, price, image, availability]
 * @returns {{ id: string, name: string, description: string, price: number, image: string, availability: string }}
 */
function rowToFoodItem(row) {
  return {
    id: row[0],
    name: row[1],
    description: row[2],
    price: Number(row[3]),
    image: row[4],
    availability: row[5],
  };
}

/**
 * Convert a FoodItem object to a row array.
 * @param {{ id: string, name: string, description: string, price: number, image: string, availability: string }} item
 * @returns {Array}
 */
function foodItemToRow(item) {
  return [item.id, item.name, item.description, item.price, item.image, item.availability];
}

// ─── users sheet ──────────────────────────────────────────────────────────
// Columns: whatsapp_number (0), name (1), address (2), order_count (3), last_updated (4)

/**
 * Convert a users sheet row array to a user object.
 * @param {Array} row - [whatsapp_number, name, address, order_count, last_updated]
 * @returns {{ whatsapp_number: string, name: string, address: string, order_count: number, last_updated: string }}
 */
function rowToUser(row) {
  return {
    whatsapp_number: row[0],
    name: row[1],
    address: row[2],
    order_count: Number(row[3]),
    last_updated: row[4],
  };
}

/**
 * Convert user fields to a row array.
 * @param {string} whatsapp - WhatsApp number
 * @param {string} name - Customer name
 * @param {string} address - Delivery address
 * @param {number} orderCount - Total order count
 * @param {string} timestamp - ISO 8601 timestamp
 * @returns {Array}
 */
function userToRow(whatsapp, name, address, orderCount, timestamp) {
  return [whatsapp, name, address, orderCount, timestamp];
}

// ─── orders sheet ─────────────────────────────────────────────────────────
// Columns: order_id (0), cart_details (1), total_price (2), customer_name (3),
//          customer_whatsapp (4), customer_address (5), status (6), timestamp (7)

/**
 * Convert an orders sheet row array to an order object.
 * cart_details is JSON-parsed from its stored string form.
 * @param {Array} row - [order_id, cart_details, total_price, customer_name, customer_whatsapp, customer_address, status, timestamp]
 * @returns {{ order_id: string, cart_details: Array, total_price: number, customer_name: string, customer_whatsapp: string, customer_address: string, status: string, timestamp: string }}
 */
function rowToOrder(row) {
  return {
    order_id: row[0],
    cart_details: JSON.parse(row[1]),
    total_price: Number(row[2]),
    customer_name: row[3],
    customer_whatsapp: row[4],
    customer_address: row[5],
    status: row[6],
    timestamp: row[7],
  };
}

/**
 * Convert an OrderPayload + metadata to a row array.
 * cart is JSON-stringified for storage.
 * @param {{ cart: Array, total_price: number, customer_name: string, customer_whatsapp: string, customer_address: string }} payload
 * @param {string} orderId - Generated order UUID
 * @param {string} status - Order status
 * @param {string} timestamp - ISO 8601 server-generated timestamp
 * @returns {Array}
 */
function orderToRow(payload, orderId, status, timestamp) {
  return [
    orderId,
    JSON.stringify(payload.cart),
    payload.total_price,
    payload.customer_name,
    payload.customer_whatsapp,
    payload.customer_address,
    status,
    timestamp,
  ];
}

module.exports = {
  rowToAdminSettings,
  adminSettingsToRow,
  rowToFoodItem,
  foodItemToRow,
  rowToUser,
  userToRow,
  rowToOrder,
  orderToRow,
};
