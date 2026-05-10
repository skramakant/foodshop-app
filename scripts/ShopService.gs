// ShopService.gs — Shop settings read/write
// ─────────────────────────────────────────────────────────────────────────────
// Handles the `admin` sheet (row 2 = single settings record).
// Depends on: Config.gs, DataMapper.gs, Validation.gs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads shop settings from the admin sheet (row 2).
 * Also appends currency_symbol from Script Properties.
 * Returns safe defaults if the sheet is empty.
 *
 * Called by: customer.html (on load), admin.html (Shop tab)
 *
 * @returns {{ shop_name, whatsapp_number, email, address, status, currency_symbol }}
 */
function getShopMetadata() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ADMIN);
    if (!sheet) throw new Error('Sheet "' + SHEET_ADMIN + '" not found.');

    var defaults = {
      shop_name: '', whatsapp_number: '', email: '',
      address: '', status: 'open',
      currency_symbol: getAppConfig().currency_symbol,
    };

    if (sheet.getLastRow() < 2) return defaults;

    var row = sheet.getRange(2, 1, 1, 5).getValues()[0];
    if (!row[0] && !row[1] && !row[2] && !row[3] && !row[4]) return defaults;

    var settings = rowToAdminSettings(row);
    settings.currency_symbol = getAppConfig().currency_symbol;
    return settings;
  } catch (e) {
    throw new Error('getShopMetadata failed: ' + e.message);
  }
}

/**
 * Saves shop settings to row 2 of the admin sheet.
 * Validates all five fields before writing.
 *
 * Called by: admin.html (Shop tab → Save Settings)
 *
 * @param {{ shop_name, whatsapp_number, email, address, status }} data
 * @returns {{ success: true }}
 */
function saveShopMetadata(data) {
  try {
    if (!data || typeof data.shop_name !== 'string' || data.shop_name.trim() === '') {
      throw new Error('Validation failed: shop_name is required.');
    }
    var waResult = validateWhatsAppNumber(data.whatsapp_number);
    if (!waResult.valid) throw new Error('Validation failed: ' + waResult.error);

    if (typeof data.email !== 'string' || data.email.trim() === '') {
      throw new Error('Validation failed: email is required.');
    }
    if (typeof data.address !== 'string' || data.address.trim() === '') {
      throw new Error('Validation failed: address is required.');
    }
    if (data.status !== 'open' && data.status !== 'closed') {
      throw new Error('Validation failed: status must be "open" or "closed".');
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ADMIN);
    if (!sheet) throw new Error('Sheet "' + SHEET_ADMIN + '" not found.');

    sheet.getRange(2, 1, 1, 5).setValues([adminSettingsToRow(data)]);
    return { success: true };
  } catch (e) {
    throw new Error('saveShopMetadata failed: ' + e.message);
  }
}
