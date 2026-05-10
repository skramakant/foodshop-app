// Setup.gs — One-time spreadsheet initialisation
// ─────────────────────────────────────────────────────────────────────────────
// Run setupSpreadsheet() ONCE manually from the Apps Script editor
// before first deployment. It creates the four required sheets with
// correct header rows if they do not already exist.
//
// How to run:
//   1. Open the Apps Script editor
//   2. Select "setupSpreadsheet" in the function dropdown
//   3. Click ▶ Run
//
// Depends on: Config.gs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the four required sheets with header rows.
 * Safe to re-run — skips sheets that already exist.
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var schemas = [
    {
      name:    SHEET_ADMIN,
      headers: ['shop_name', 'whatsapp_number', 'email', 'address', 'status'],
    },
    {
      name:    SHEET_FOOD_ITEMS,
      headers: ['id', 'name', 'description', 'price', 'image', 'availability'],
    },
    {
      name:    SHEET_USERS,
      headers: ['whatsapp_number', 'name', 'address', 'order_count', 'last_updated'],
    },
    {
      name:    SHEET_ORDERS,
      headers: ['order_id', 'cart_details', 'total_price', 'customer_name',
                'customer_whatsapp', 'customer_address', 'status', 'timestamp'],
    },
  ];

  schemas.forEach(function(schema) {
    var sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
      sheet.getRange(1, 1, 1, schema.headers.length).setValues([schema.headers]);
      Logger.log('Created sheet: ' + schema.name);
    } else {
      Logger.log('Sheet already exists, skipped: ' + schema.name);
    }
  });

  Logger.log('setupSpreadsheet complete.');
}
