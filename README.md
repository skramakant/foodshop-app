# Food Shop App — Deployment Guide

A Google Apps Script web app with two portals:
- **Customer Portal** — browse menu, add to cart, place orders via WhatsApp
- **Admin Portal** — manage food items, shop settings, orders, and customers

All data is stored in a Google Sheets spreadsheet (no external database needed).

---

## Prerequisites

- A Google account
- Access to [Google Drive](https://drive.google.com)
- Access to [Google Sheets](https://sheets.google.com)
- Access to [Google Apps Script](https://script.google.com)

---

## Step 1 — Create the Google Sheets Spreadsheet

1. Go to [https://sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**.
2. Name it something like `Food Shop Database`.
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit
   ```
   Save this ID — you'll need it in Step 3.

---

## Step 2 — Create the Google Apps Script Project

1. Go to [https://script.google.com](https://script.google.com).
2. Click **New project**.
3. Name the project (e.g. `Food Shop App`).

---

## Step 3 — Copy the Project Files

You need to create three files in the Apps Script editor: `Code.gs`, `customer.html`, and `admin.html`.

### 3.1 — Set up `Code.gs`

1. In the Apps Script editor, click on the default file `Code.gs`.
2. **Delete all existing content**.
3. Copy the entire contents of `Code.gs` from this repository and paste it in.
4. Find this line near the top:
   ```javascript
   var SPREADSHEET_ID = '';
   ```
5. Replace the empty string with your Spreadsheet ID from Step 1:
   ```javascript
   var SPREADSHEET_ID = 'your-spreadsheet-id-here';
   ```

### 3.2 — Create `customer.html`

1. In the Apps Script editor, click the **+** button next to "Files".
2. Select **HTML**.
3. Name it exactly `customer` (Apps Script will add `.html` automatically).
4. **Delete all existing content**.
5. Copy the entire contents of `customer.html` from this repository and paste it in.

### 3.3 — Create `admin.html`

1. Repeat the same process — click **+** → **HTML**.
2. Name it exactly `admin`.
3. **Delete all existing content**.
4. Copy the entire contents of `admin.html` from this repository and paste it in.

---

## Step 4 — Initialise the Spreadsheet Sheets

This step creates the four required sheets (`admin`, `food_items`, `users`, `orders`) with the correct header rows.

1. In the Apps Script editor, make sure `Code.gs` is open.
2. In the toolbar, click the **function selector dropdown** (it shows the currently selected function).
3. Select `setupSpreadsheet` from the list.
4. Click the **▶ Run** button.
5. You will be prompted to **authorise** the script — click **Review permissions**, choose your Google account, and click **Allow**.
6. After it runs, open your Google Sheets spreadsheet and verify that four sheets have been created:
   - `admin`
   - `food_items`
   - `users`
   - `orders`

   Each sheet should have a header row with the correct column names.

---

## Step 5 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy** (top right) → **New deployment**.
2. Click the **gear icon ⚙** next to "Select type" and choose **Web app**.
3. Fill in the deployment settings:
   - **Description**: `Food Shop App v1` (or any label you like)
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` (allows customers to access without signing in)
4. Click **Deploy**.
5. You will be asked to **authorise** again — click **Authorise access** and allow.
6. After deployment, you will see a **Web app URL** like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   **Copy and save this URL** — this is your app's base URL.

---

## Step 6 — Access the Portals

| Portal | URL |
|---|---|
| Customer Portal | `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec` |
| Admin Portal | `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=admin` |

Replace `YOUR_DEPLOYMENT_ID` with the ID from your deployment URL.

---

## Step 7 — Configure Shop Settings

1. Open the **Admin Portal** (`?page=admin`).
2. Click the **Shop** tab.
3. Fill in:
   - **Shop Name** — displayed in the customer portal header
   - **WhatsApp Number** — digits only, with country code, no `+` (e.g. `971501234567`)
   - **Email** — shop contact email
   - **Address** — shop physical address
   - **Status** — set to `open` to allow orders
4. Click **Save Settings**.

---

## Step 8 — Add Food Items

1. In the Admin Portal, click the **Food** tab.
2. Fill in the form:
   - **Name** — item display name
   - **Description** — short description shown on the menu card
   - **Price** — numeric value (e.g. `12.50`)
   - **Image URL** — a public image URL or a Google Drive shareable link
   - **Availability** — `available` or `not_available`
3. Click **Add Item**.
4. Repeat for each menu item.

---

## Redeploying After Code Changes

If you update any of the files (`Code.gs`, `customer.html`, `admin.html`), you must create a **new deployment** for the changes to take effect:

1. Click **Deploy** → **Manage deployments**.
2. Click the **pencil ✏ edit** icon on your existing deployment.
3. Change the **Version** dropdown to **New version**.
4. Click **Deploy**.

> ⚠️ The Web app URL stays the same — you do not need to share a new link.

---

## Spreadsheet Sheet Reference

| Sheet | Columns |
|---|---|
| `admin` | `shop_name`, `whatsapp_number`, `email`, `address`, `status` |
| `food_items` | `id`, `name`, `description`, `price`, `image`, `availability` |
| `users` | `whatsapp_number`, `name`, `address`, `order_count`, `last_updated` |
| `orders` | `order_id`, `cart_details`, `total_price`, `customer_name`, `customer_whatsapp`, `customer_address`, `status`, `timestamp` |

---

## Order Statuses

Orders progress through these statuses, managed from the Admin Portal **Orders** tab:

| Status | Meaning |
|---|---|
| `received` | Order just placed by customer |
| `payment_received` | Payment confirmed |
| `in_progress` | Being prepared |
| `completed` | Delivered / fulfilled |

---

## Troubleshooting

**"Script function not found" error when running `setupSpreadsheet`**
— Make sure you selected `setupSpreadsheet` in the function dropdown before clicking Run.

**Changes not showing after editing files**
— You must create a new deployment version (see "Redeploying After Code Changes" above). Refreshing the URL is not enough.

**WhatsApp link doesn't open**
— This is a browser pop-up blocker issue. The order is still saved and visible in the Admin Portal. The customer sees an "Order placed successfully!" confirmation regardless.

**"Authorization required" when accessing the app**
— In the deployment settings, make sure "Who has access" is set to `Anyone`, not `Anyone with Google account`.
