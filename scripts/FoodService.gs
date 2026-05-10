// FoodService.gs — Food item CRUD operations
// ─────────────────────────────────────────────────────────────────────────────
// Handles all read/write operations on the `food_items` sheet.
// Depends on: Config.gs, DataMapper.gs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all food items from the food_items sheet.
 * Skips the header row and any empty rows.
 *
 * Called by: customer.html (menu grid), admin.html (Food tab)
 *
 * @returns {Array<{ id, name, description, price, image, availability }>}
 */
function getFoodItems() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_FOOD_ITEMS);
    if (!sheet) throw new Error('Sheet "' + SHEET_FOOD_ITEMS + '" not found.');

    var rows  = sheet.getDataRange().getValues();
    var items = [];
    for (var i = 1; i < rows.length; i++) {       // i=0 is the header row
      if (rows[i][0]) items.push(rowToFoodItem(rows[i]));
    }
    return items;
  } catch (e) {
    throw new Error('getFoodItems failed: ' + e.message);
  }
}

/**
 * Appends a new food item. Generates a UUID for the id.
 *
 * Called by: admin.html (Food tab → Add Item)
 *
 * @param {{ name, description, price, image, availability }} item  (no id)
 * @returns {{ success: true, id: string }}
 */
function addFoodItem(item) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_FOOD_ITEMS);
    if (!sheet) throw new Error('Sheet "' + SHEET_FOOD_ITEMS + '" not found.');

    var newItem = {
      id:           Utilities.getUuid(),
      name:         item.name,
      description:  item.description,
      price:        item.price,
      image:        item.image,
      availability: item.availability,
    };
    sheet.appendRow(foodItemToRow(newItem));
    return { success: true, id: newItem.id };
  } catch (e) {
    throw new Error('addFoodItem failed: ' + e.message);
  }
}

/**
 * Updates an existing food item row (matched by id in column A).
 *
 * Called by: admin.html (Food tab → Save Edit)
 *
 * @param {{ id, name, description, price, image, availability }} item
 * @returns {{ success: true }}
 */
function updateFoodItem(item) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_FOOD_ITEMS);
    if (!sheet) throw new Error('Sheet "' + SHEET_FOOD_ITEMS + '" not found.');

    var rows = sheet.getDataRange().getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([foodItemToRow(item)]);
        return { success: true };
      }
    }
    throw new Error('Food item "' + item.id + '" not found.');
  } catch (e) {
    throw new Error('updateFoodItem failed: ' + e.message);
  }
}

/**
 * Deletes a food item row by id (matched in column A).
 *
 * Called by: admin.html (Food tab → Delete)
 *
 * @param {string} id
 * @returns {{ success: true }}
 */
function deleteFoodItem(id) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_FOOD_ITEMS);
    if (!sheet) throw new Error('Sheet "' + SHEET_FOOD_ITEMS + '" not found.');

    var rows = sheet.getDataRange().getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    throw new Error('Food item "' + id + '" not found.');
  } catch (e) {
    throw new Error('deleteFoodItem failed: ' + e.message);
  }
}
