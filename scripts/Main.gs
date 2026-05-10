// Main.gs — HTTP entry point (doGet router)
// ─────────────────────────────────────────────────────────────────────────────
// This is the only file that handles incoming web requests.
// All business logic lives in the *Service.gs files.
//
// URL routing:
//   ?page=admin    → serves admin.html  (requires login)
//   ?page=customer → serves customer.html
//   (no param)     → serves customer.html  (default)
//
// Depends on: (none — only uses HtmlService and ContentService)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Routes incoming GET requests to the appropriate HTML portal.
 *
 * @param {Object} e - GAS event object (e.parameter contains query params)
 * @returns {HtmlOutput|TextOutput}
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
