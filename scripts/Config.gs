// Config.gs — Global constants and app configuration
// ─────────────────────────────────────────────────────────────────────────────
// This file is the single source of truth for:
//   - Spreadsheet ID
//   - Sheet name constants
//   - Script Properties config (currency, admin credentials)
//   - Admin authentication
// ─────────────────────────────────────────────────────────────────────────────

// TODO: Set this to your Google Sheets spreadsheet ID before deployment.
var SPREADSHEET_ID = '';

// ── Sheet name constants ──────────────────────────────────────────────────
var SHEET_ADMIN      = 'admin';
var SHEET_FOOD_ITEMS = 'food_items';
var SHEET_USERS      = 'users';
var SHEET_ORDERS     = 'orders';

// ── Script Properties configuration ──────────────────────────────────────
// Set these in Apps Script → Project Settings → Script Properties:
//
//   Key               | Default    | Description
//   ──────────────────|────────────|──────────────────────────────────────
//   CURRENCY_SYMBOL   | Rs         | Currency prefix shown on all prices
//   ADMIN_USERNAME    | admin      | Admin portal login username
//   ADMIN_PASSWORD    | admin123   | Admin portal login password
//
// Example values: CURRENCY_SYMBOL = "AED", ADMIN_USERNAME = "owner"

/**
 * Returns app configuration from Script Properties with safe defaults.
 * @returns {{ currency_symbol: string, admin_username: string, admin_password: string }}
 */
function getAppConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    currency_symbol: props.getProperty('CURRENCY_SYMBOL') || 'Rs',
    admin_username:  props.getProperty('ADMIN_USERNAME')  || 'admin',
    admin_password:  props.getProperty('ADMIN_PASSWORD')  || 'admin123',
  };
}

/**
 * Validates admin credentials against Script Properties.
 * Called from admin.html login screen via google.script.run.
 *
 * @param {string} username
 * @param {string} password
 * @returns {{ success: boolean }}
 */
function checkAdminAuth(username, password) {
  var config = getAppConfig();
  if (username === config.admin_username && password === config.admin_password) {
    return { success: true };
  }
  return { success: false };
}
