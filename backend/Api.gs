// Api.gs — JSON API entry point for the standalone frontend
// ─────────────────────────────────────────────────────────────────────────────
// When the frontend is hosted on GitHub Pages (or any CDN), it calls this
// GAS deployment via fetch() instead of google.script.run.
//
// All functions are exposed via doPost (action-based routing).
// doGet still serves the legacy GAS HTML portals for backward compatibility.
//
// CORS headers are set on every response so the browser allows cross-origin
// requests from the frontend domain.
//
// Depends on: Config.gs, ShopService.gs, FoodService.gs,
//             OrderService.gs, UserService.gs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adds CORS headers to a ContentService TextOutput.
 * @param {GoogleAppsScript.Content.TextOutput} output
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function withCors(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON);
  // Note: GAS does not support setting arbitrary response headers via
  // ContentService. To enable CORS for a standalone frontend, set the
  // GAS deployment to "Anyone" access and configure the frontend to
  // use the GAS URL directly. The browser will allow the request because
  // GAS returns a redirect to a googleapis.com domain which has CORS open.
}

/**
 * Returns a JSON success response.
 * @param {*} data
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonOk(data) {
  return withCors(
    ContentService.createTextOutput(JSON.stringify({ ok: true, data: data }))
  );
}

/**
 * Returns a JSON error response.
 * @param {string} message
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonError(message) {
  return withCors(
    ContentService.createTextOutput(JSON.stringify({ ok: false, error: message }))
  );
}

/**
 * POST /exec — action-based JSON API
 *
 * Request body (JSON):
 *   { "action": "actionName", ...params }
 *
 * Supported actions:
 *   checkAdminAuth      { username, password }
 *   getShopMetadata     {}
 *   saveShopMetadata    { shop_name, whatsapp_number, email, address, status }
 *   getFoodItems        {}
 *   addFoodItem         { name, description, price, image, availability }
 *   updateFoodItem      { id, name, description, price, image, availability }
 *   deleteFoodItem      { id }
 *   placeOrder          { cart, total_price, customer_name, customer_whatsapp, customer_address }
 *   getOrdersWithTodayCounts {}
 *   updateOrderStatus   { orderId, status }
 *   getUsers            {}
 *
 * @param {Object} e - GAS event object
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    switch (action) {
      case 'checkAdminAuth':
        return jsonOk(checkAdminAuth(body.username, body.password));

      case 'getShopMetadata':
        return jsonOk(getShopMetadata());

      case 'saveShopMetadata':
        return jsonOk(saveShopMetadata(body));

      case 'getFoodItems':
        return jsonOk(getFoodItems());

      case 'addFoodItem':
        return jsonOk(addFoodItem(body));

      case 'updateFoodItem':
        return jsonOk(updateFoodItem(body));

      case 'deleteFoodItem':
        return jsonOk(deleteFoodItem(body.id));

      case 'placeOrder':
        return jsonOk(placeOrder(body));

      case 'getOrdersWithTodayCounts':
        return jsonOk(getOrdersWithTodayCounts());

      case 'updateOrderStatus':
        return jsonOk(updateOrderStatus(body.orderId, body.status));

      case 'getUsers':
        return jsonOk(getUsers());

      default:
        return jsonError('Unknown action: ' + action);
    }
  } catch (err) {
    return jsonError(err.message || 'Internal server error');
  }
}

/**
 * GET /exec — backward-compatible HTML serving (legacy GAS portals)
 * Also handles preflight-like GET requests from the frontend.
 *
 * @param {Object} e
 * @returns {HtmlOutput|TextOutput}
 */
function doGet(e) {
  try {
    // If called with ?action=ping, return a health check JSON response
    if (e && e.parameter && e.parameter.action === 'ping') {
      return jsonOk({ status: 'ok', version: '2.0' });
    }

    var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'customer';
    var output = (page === 'admin')
      ? HtmlService.createHtmlOutputFromFile('admin')
      : HtmlService.createHtmlOutputFromFile('customer');

    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return output;
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
