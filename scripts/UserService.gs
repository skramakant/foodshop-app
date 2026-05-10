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

    var rows  = sheet.getDataRange().getValues();
    var users = [];
    for (var i = 1; i < rows.length; i++) {       // i=0 is the header row
      if (rows[i][0]) users.push(rowToUser(rows[i]));
    }
    return users;
  } catch (e) {
    throw new Error('getUsers failed: ' + e.message);
  }
}
