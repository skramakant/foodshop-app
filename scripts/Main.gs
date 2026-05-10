// Main.gs — HTTP entry point
// ─────────────────────────────────────────────────────────────────────────────
// doGet  → serves the legacy GAS HTML portals (admin.html / customer.html)
// doPost → JSON API for the new standalone frontend
//
// The standalone frontend (frontend/) calls doPost with:
//   { action: 'functionName', ...params }
// and receives:
//   { result: ... }  on success
//   { error: '...' } on failure
// ─────────────────────────────────────────────────────────────────────────────

// ── Allowed actions and their handler functions ───────────────────────────
var ACTION_MAP = {
  // Shop
  getShopMetadata:  function()     { return getShopMetadata(); },
  saveShopMetadata: function(p)    { return saveShopMetadata(p.data); },
  // Food
  getFoodItems:     function()     { return getFoodItems(); },
  addFoodItem:      function(p)    { return addFoodItem(p.item); },
  updateFoodItem:   function(p)    { return updateFoodItem(p.item); },
  deleteFoodItem:   function(p)    { return deleteFoodItem(p.id); },
  // Orders
  placeOrder:              function(p) { return placeOrder(p.orderData); },
  getOrdersWithTodayCounts:function()  { return getOrdersWithTodayCounts(); },
  updateOrderStatus:       function(p) { return updateOrderStatus(p.orderId, p.status); },
  // Users
  getUsers:         function()     { return getUsers(); },
  // Auth
  checkAdminAuth:   function(p)    { return checkAdminAuth(p.username, p.password); },
};

/**
 * JSON API handler for the standalone frontend.
 * Accepts POST with body: { action: string, ...params }
 * Returns: { result: any } or { error: string }
 */
function doPost(e) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;

    if (!action || !ACTION_MAP[action]) {
      throw new Error('Unknown action: ' + action);
    }

    var result = ACTION_MAP[action](body);
    return ContentService
      .createTextOutput(JSON.stringify({ result: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Routes GET requests to the legacy GAS HTML portals.
 * Still used while the old html/ portals are in service.
 */
function doGet(e) {
  try {
    var page   = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'customer';
    var output = (page === 'admin')
      ? HtmlService.createHtmlOutputFromFile('admin')
      : HtmlService.createHtmlOutputFromFile('customer');

    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return output;
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
