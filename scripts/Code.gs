// Code.gs — DEPRECATED
// ─────────────────────────────────────────────────────────────────────────────
// This file has been split into focused modules. Do not add code here.
//
// Module map:
//   Config.gs       — SPREADSHEET_ID, sheet constants, getAppConfig(), checkAdminAuth()
//   DataMapper.gs   — rowTo* / *ToRow converters for all four sheets
//   Validation.gs   — validateWhatsAppNumber()
//   ShopService.gs  — getShopMetadata(), saveShopMetadata()
//   FoodService.gs  — getFoodItems(), addFoodItem(), updateFoodItem(), deleteFoodItem()
//   OrderService.gs — placeOrder(), getOrdersWithTodayCounts(), updateOrderStatus()
//   UserService.gs  — getUsers()
//   Setup.gs        — setupSpreadsheet()  (run once before first deployment)
//   Main.gs         — doGet()  (HTTP router — the only entry point)
// ─────────────────────────────────────────────────────────────────────────────
