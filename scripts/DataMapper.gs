// DataMapper.gs — Row ↔ Object converters for all four Google Sheets
// ─────────────────────────────────────────────────────────────────────────────
// Each sheet has a pair of functions:
//   rowToX(row)  — converts a raw sheet row array into a typed object
//   xToRow(obj)  — converts a typed object back into a row array for writing
//
// Column order must exactly match the sheet headers created by setupSpreadsheet().
// ─────────────────────────────────────────────────────────────────────────────

// ── admin sheet ───────────────────────────────────────────────────────────
// Columns: shop_name(0), whatsapp_number(1), email(2), address(3), status(4)

/**
 * @param {Array} row
 * @returns {{ shop_name, whatsapp_number, email, address, status }}
 */
function rowToAdminSettings(row) {
  return {
    shop_name:        String(row[0] || ''),
    whatsapp_number:  String(row[1] || ''),
    email:            String(row[2] || ''),
    address:          String(row[3] || ''),
    status:           String(row[4] || ''),
  };
}

/**
 * @param {{ shop_name, whatsapp_number, email, address, status }} obj
 * @returns {Array}
 */
function adminSettingsToRow(obj) {
  return [obj.shop_name, obj.whatsapp_number, obj.email, obj.address, obj.status];
}

// ── food_items sheet ──────────────────────────────────────────────────────
// Columns: id(0), name(1), description(2), price(3), image(4), availability(5)

/**
 * @param {Array} row
 * @returns {{ id, name, description, price, image, availability }}
 */
function rowToFoodItem(row) {
  return {
    id:           String(row[0] || ''),
    name:         String(row[1] || ''),
    description:  String(row[2] || ''),
    price:        Number(row[3]),
    image:        String(row[4] || ''),
    availability: String(row[5] || ''),
  };
}

/**
 * @param {{ id, name, description, price, image, availability }} item
 * @returns {Array}
 */
function foodItemToRow(item) {
  return [item.id, item.name, item.description, item.price, item.image, item.availability];
}

// ── users sheet ───────────────────────────────────────────────────────────
// Columns: whatsapp_number(0), name(1), address(2), order_count(3), last_updated(4)

/**
 * @param {Array} row
 * @returns {{ whatsapp_number, name, address, order_count, last_updated }}
 */
function rowToUser(row) {
  return {
    whatsapp_number: String(row[0] || ''),
    name:            String(row[1] || ''),
    address:         String(row[2] || ''),
    order_count:     Number(row[3]),
    last_updated:    String(row[4] || ''),
  };
}

/**
 * @param {string} whatsapp
 * @param {string} name
 * @param {string} address
 * @param {number} orderCount
 * @param {string} timestamp
 * @returns {Array}
 */
function userToRow(whatsapp, name, address, orderCount, timestamp) {
  return [whatsapp, name, address, orderCount, timestamp];
}

// ── orders sheet ──────────────────────────────────────────────────────────
// Columns: order_id(0), cart_details(1), total_price(2), customer_name(3),
//          customer_whatsapp(4), customer_address(5), status(6), timestamp(7)

/**
 * cart_details is stored as a JSON string and is parsed back to an array.
 * @param {Array} row
 * @returns {{ order_id, cart_details, total_price, customer_name, customer_whatsapp, customer_address, status, timestamp }}
 */
function rowToOrder(row) {
  return {
    order_id:         String(row[0] || ''),
    cart_details:     JSON.parse(row[1]),
    total_price:      Number(row[2]),
    customer_name:    String(row[3] || ''),
    customer_whatsapp: String(row[4] || ''),
    customer_address: String(row[5] || ''),
    status:           String(row[6] || ''),
    timestamp:        String(row[7] || ''),
  };
}

/**
 * cart is JSON-stringified for storage.
 * @param {{ cart, total_price, customer_name, customer_whatsapp, customer_address }} payload
 * @param {string} orderId
 * @param {string} status
 * @param {string} timestamp
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
