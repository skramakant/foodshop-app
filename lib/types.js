// lib/types.js — Client-side data structure shapes as JSDoc typedefs
// These type definitions are used across both portal HTML files and the lib/ modules.

/**
 * Shop settings as stored in the `admin` sheet and returned by getShopMetadata().
 *
 * @typedef {Object} ShopMetadata
 * @property {string} shop_name - Display name shown in Customer Portal header
 * @property {string} whatsapp_number - International format, digits only (e.g. 971501234567)
 * @property {string} email - Shop contact email address
 * @property {string} address - Shop physical address
 * @property {'open'|'closed'} status - Current shop open/closed status
 */

/**
 * A food item as stored in the `food_items` sheet and returned by getFoodItems().
 *
 * @typedef {Object} FoodItem
 * @property {string} id - UUID generated on creation (absent when creating a new item)
 * @property {string} name - Display name of the food item
 * @property {string} description - Short description shown on the food card
 * @property {number} price - Price as a positive numeric value
 * @property {string} image - URL to the item's image (external URL or Google Drive share link)
 * @property {'available'|'not_available'} availability - Whether the item can be ordered
 */

/**
 * A single item in the customer's cart.
 *
 * @typedef {Object} CartItem
 * @property {string} id - The food item's UUID (references FoodItem.id)
 * @property {string} name - Display name (copied from FoodItem at time of adding to cart)
 * @property {number} price - Unit price (copied from FoodItem at time of adding to cart)
 * @property {number} quantity - Positive integer; setting to 0 removes the item from the cart
 */

/**
 * The payload sent to placeOrder() when a customer confirms an order.
 *
 * @typedef {Object} OrderPayload
 * @property {CartItem[]} cart - Array of cart items in the order
 * @property {number} total_price - Sum of (price × quantity) for all items in the cart
 * @property {string} customer_name - Customer's full name
 * @property {string} customer_whatsapp - Customer's WhatsApp number (digits only, no leading +)
 * @property {string} customer_address - Customer's delivery address (non-empty string)
 */

/**
 * A customer record as stored in the `users` sheet and returned by getUsers().
 *
 * @typedef {Object} User
 * @property {string} whatsapp_number - Primary key — international format digits
 * @property {string} name - Customer name from most recent order
 * @property {string} address - Most recent delivery address
 * @property {number} order_count - Total number of orders placed; incremented on each order
 * @property {string} last_updated - ISO 8601 timestamp of last order
 */

/**
 * An order record as stored in the `orders` sheet.
 *
 * @typedef {Object} Order
 * @property {string} order_id - UUID generated server-side
 * @property {CartItem[]} cart_details - JSON-parsed array of cart items
 * @property {number} total_price - Sum of price × quantity
 * @property {string} customer_name - Customer's full name
 * @property {string} customer_whatsapp - Customer's WhatsApp number
 * @property {string} customer_address - Delivery address
 * @property {'received'|'payment_received'|'in_progress'|'completed'} status - Current order status
 * @property {string} timestamp - ISO 8601 server-generated timestamp
 */

/**
 * Today's order counts grouped by status, returned inside getOrdersWithTodayCounts().
 *
 * @typedef {Object} StatusCounts
 * @property {number} received
 * @property {number} payment_received
 * @property {number} in_progress
 * @property {number} completed
 */

module.exports = {};
