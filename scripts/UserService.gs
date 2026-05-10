// UserService.gs — Customer/user read operations
// ─────────────────────────────────────────────────────────────────────────────
// The users sheet is written to by OrderService.gs (upsert on order placement).
// This file only handles reading users for the admin portal.
// Depends on: Config.gs, DataMapper.gs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all customer records from the users sheet.
 * Skips the header row and any empty rows.
 *
 * Called by: admin.html (Users tab on load)
 *
 * @returns {Array<{ whatsapp_number, name, address, order_count, last_updated }>}
 */
function getUsers() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_USERS);
    if (!sheet) throw new Error('Sheet "' + SHEET_USERS + '" not found.');

    var rows = sheet.getDataRange().getValues();

    // Deduplicate by WhatsApp number — keep the row with highest order_count
    var seen = {};
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var wa    = String(rows[i][0]);
      var count = Number(rows[i][3]) || 0;
      if (!seen[wa] || count > (Number(seen[wa][3]) || 0)) {
        seen[wa] = rows[i];
      }
    }

    return Object.values(seen).map(function(row) { return rowToUser(row); });
  } catch (e) {
    throw new Error('getUsers failed: ' + e.message);
  }
}
