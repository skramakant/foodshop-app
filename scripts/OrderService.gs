// OrderService.gs — Order placement and order management
// ─────────────────────────────────────────────────────────────────────────────
// Handles all read/write operations on the `orders` sheet,
// and the user upsert in the `users` sheet when an order is placed.
// Depends on: Config.gs, DataMapper.gs
// ─────────────────────────────────────────────────────────────────────────────

var VALID_ORDER_STATUSES = ['received', 'payment_received', 'in_progress', 'completed'];

/**
 * Places an order:
 *   1. Appends a new row to the orders sheet (status = 'received')
 *   2. Upserts the customer record in the users sheet
 *
 * Called by: customer.html (Step 3 — Confirm Order)
 *
 * @param {{ cart, total_price, customer_name, customer_whatsapp, customer_address }} orderData
 * @returns {{ success: true, order_id: string }}
 */
function placeOrder(orderData) {
  try {
    var orderId   = Utilities.getUuid();
    var timestamp = new Date().toISOString();
    var ss        = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. Append to orders sheet
    var ordersSheet = ss.getSheetByName(SHEET_ORDERS);
    if (!ordersSheet) throw new Error('Sheet "' + SHEET_ORDERS + '" not found.');
    ordersSheet.appendRow(orderToRow(orderData, orderId, 'received', timestamp));

    // 2. Upsert users sheet — WhatsApp number is the ONLY unique key
    //    Deduplicate: if multiple rows exist for same number, keep first, delete rest
    var usersSheet = ss.getSheetByName(SHEET_USERS);
    if (!usersSheet) throw new Error('Sheet "' + SHEET_USERS + '" not found.');

    var userRows     = usersSheet.getDataRange().getValues();
    var matchedRows  = []; // all row indices (1-based) matching this WhatsApp

    for (var i = 1; i < userRows.length; i++) {
      if (String(userRows[i][0]) === String(orderData.customer_whatsapp)) {
        matchedRows.push(i + 1); // 1-based sheet row
      }
    }

    // Delete duplicate rows (keep only the first match, delete the rest bottom-up)
    if (matchedRows.length > 1) {
      for (var d = matchedRows.length - 1; d >= 1; d--) {
        usersSheet.deleteRow(matchedRows[d]);
      }
      // Re-read after deletion
      userRows = usersSheet.getDataRange().getValues();
      matchedRows = [];
      for (var k = 1; k < userRows.length; k++) {
        if (String(userRows[k][0]) === String(orderData.customer_whatsapp)) {
          matchedRows.push(k + 1);
        }
      }
    }

    var foundRowIdx = matchedRows.length > 0 ? matchedRows[0] : -1;
    var existingPin = foundRowIdx !== -1 ? String(userRows[foundRowIdx - 1][5] || '') : '';

    // PIN is generated once and never changes for a WhatsApp number
    var pin = existingPin || String(Math.floor(100000 + Math.random() * 900000));

    if (foundRowIdx !== -1) {
      var currentCount = Number(userRows[foundRowIdx - 1][3]) || 0;
      // Update name(col2), address(col3), order_count(col4), last_updated(col5), pin(col6)
      usersSheet.getRange(foundRowIdx, 2, 1, 5).setValues([
        [orderData.customer_name, orderData.customer_address, currentCount + 1, timestamp, pin]
      ]);
    } else {
      usersSheet.appendRow(userToRow(
        orderData.customer_whatsapp,
        orderData.customer_name,
        orderData.customer_address,
        1,
        timestamp,
        pin
      ));
    }

    return { success: true, order_id: orderId, pin: pin };
  } catch (e) {
    throw new Error('placeOrder failed: ' + e.message);
  }
}

/**
 * Returns all orders plus today's status counts.
 *
 * Called by: admin.html (Orders tab on load)
 *
 * @returns {{ orders: Order[], today_counts: { received, payment_received, in_progress, completed } }}
 */
function getOrdersWithTodayCounts() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ORDERS);
    if (!sheet) throw new Error('Sheet "' + SHEET_ORDERS + '" not found.');

    var rows   = sheet.getDataRange().getValues();
    var orders = [];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]) orders.push(rowToOrder(rows[i]));
    }

    var todayStr = new Date().toDateString();
    var counts   = { received: 0, payment_received: 0, in_progress: 0, completed: 0 };

    orders.forEach(function(order) {
      if (new Date(order.timestamp).toDateString() === todayStr) {
        if (counts.hasOwnProperty(order.status)) counts[order.status]++;
      }
    });

    return { orders: orders, today_counts: counts };
  } catch (e) {
    throw new Error('getOrdersWithTodayCounts failed: ' + e.message);
  }
}

/**
 * Updates the status of a single order (matched by order_id in column A).
 *
 * Called by: admin.html (Orders tab → status dropdown change)
 *
 * @param {string} orderId
 * @param {string} status  — must be one of VALID_ORDER_STATUSES
 * @returns {{ success: true }}
 */
function updateOrderStatus(orderId, status) {
  try {
    if (VALID_ORDER_STATUSES.indexOf(status) === -1) {
      throw new Error('Invalid status "' + status + '". Must be one of: ' + VALID_ORDER_STATUSES.join(', '));
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ORDERS);
    if (!sheet) throw new Error('Sheet "' + SHEET_ORDERS + '" not found.');

    var rows = sheet.getDataRange().getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(orderId)) {
        sheet.getRange(i + 1, 7, 1, 1).setValues([[status]]);  // col 7 = status
        return { success: true };
      }
    }
    throw new Error('Order "' + orderId + '" not found.');
  } catch (e) {
    throw new Error('updateOrderStatus failed: ' + e.message);
  }
}

/**
 * Returns all orders for a customer verified by WhatsApp number + PIN.
 * PIN is stored in the users sheet (col 5).
 *
 * @param {string} whatsapp
 * @param {string} pin
 * @returns {{ orders: Array }|{ error: string }}
 */
function getOrdersByPin(whatsapp, pin) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. Verify PIN against users sheet
    var usersSheet = ss.getSheetByName(SHEET_USERS);
    if (!usersSheet) throw new Error('Sheet "' + SHEET_USERS + '" not found.');

    var userRows = usersSheet.getDataRange().getValues();
    var verified = false;
    for (var i = 1; i < userRows.length; i++) {
      if (String(userRows[i][0]) === String(whatsapp) &&
          String(userRows[i][5]) === String(pin)) {
        verified = true;
        break;
      }
    }
    if (!verified) return { error: 'Invalid WhatsApp number or PIN.' };

    // 2. Fetch all orders for this WhatsApp number
    var ordersSheet = ss.getSheetByName(SHEET_ORDERS);
    if (!ordersSheet) throw new Error('Sheet "' + SHEET_ORDERS + '" not found.');

    var rows   = ordersSheet.getDataRange().getValues();
    var orders = [];
    for (var j = 1; j < rows.length; j++) {
      if (rows[j][0] && String(rows[j][4]) === String(whatsapp)) {
        orders.push(rowToOrder(rows[j]));
      }
    }
    return { orders: orders };
  } catch (e) {
    throw new Error('getOrdersByPin failed: ' + e.message);
  }
}

/**
 * Returns all orders for a WhatsApp number — admin use only (no PIN check).
 *
 * @param {string} whatsapp
 * @returns {Array}
 */
function getOrdersByWhatsAppAdmin(whatsapp) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ORDERS);
    if (!sheet) throw new Error('Sheet "' + SHEET_ORDERS + '" not found.');
    var rows   = sheet.getDataRange().getValues();
    var orders = [];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && String(rows[i][4]) === String(whatsapp)) {
        orders.push(rowToOrder(rows[i]));
      }
    }
    return orders;
  } catch (e) {
    throw new Error('getOrdersByWhatsAppAdmin failed: ' + e.message);
  }
}
