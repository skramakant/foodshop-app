# InstaShop — Food Shop App

A mobile-first food shop web application with a customer portal and an admin portal, powered by **InstaShop**.

> *"Your shop, online, simplified."*

- **Customer Portal** — browse menu, add to cart, place orders via WhatsApp, track orders with PIN, About InstaShop page
- **Admin Portal** — manage food items, shop settings, orders (auto-refresh + notifications), customers with order history

**Architecture:**
- **Frontend** — standalone HTML/CSS/JS (Tailwind) deployed on GitHub Pages — no iframe, proper mobile support
- **Backend** — Google Apps Script Web App + Google Sheets as database
- **Security** — API key injected at build time via GitHub Secrets, never stored in repo

---

## Project Structure

```
frontend/
├── public/               ← Deployed to GitHub Pages
│   ├── index.html        ← Customer portal
│   ├── admin.html        ← Admin portal
│   ├── css/app.css       ← Built Tailwind CSS
│   └── js/
│       ├── api.js        ← All GAS API calls (secrets injected at build time)
│       ├── cart.js       ← Cart logic
│       ├── utils.js      ← Shared utilities + validation
│       ├── customer.js   ← Customer portal logic
│       └── admin.js      ← Admin portal logic
├── src/
│   ├── css/input.css     ← Tailwind source
│   └── js/               ← Source JS modules
├── tailwind.config.js
└── package.json

scripts/                  ← Google Apps Script backend (modular)
├── Main.gs               ← HTTP router (doGet + doPost) + API key validation
├── Config.gs             ← Constants, credentials, app config
├── ShopService.gs        ← Shop settings read/write
├── FoodService.gs        ← Food item CRUD
├── OrderService.gs       ← Order placement, management, PIN-based lookup
├── UserService.gs        ← Customer records (deduplicated by WhatsApp)
├── DataMapper.gs         ← Row ↔ object converters (includes pin column)
├── Validation.gs         ← Input validation
└── Setup.gs              ← One-time spreadsheet initialisation

.github/workflows/
└── deploy.yml            ← GitHub Actions: injects secrets + deploys to Pages
```

---

## Features

### Customer Portal
- Left sidebar navigation (desktop) + bottom tab bar (mobile)
- Browse menu with images, descriptions, prices
- Add to cart with popup notification
- 3-step order flow: details → review → confirm
- Order via WhatsApp (deep-link with PIN included) or silent order
- **My Orders** — enter WhatsApp number + 6-digit PIN to view all orders and status
- Pull-to-refresh on menu
- About InstaShop page with contact details
- "Powered by InstaShop" footer

### Admin Portal (InstaShop)
- Login with username/password (24-hour session persistence via localStorage)
- Left sidebar navigation (desktop) + bottom tab bar (mobile)
- Default landing page: **Orders tab**
- **Shop tab** — configure name, WhatsApp, email, address, status, currency symbol
- **Food tab** — add/edit/delete menu items with image, price, description, availability
- **Orders tab** — all-time stats + today's stats with date, order cards with status dropdown, auto-refresh every 60s with bell notification + sound
- **Customers tab** — expandable customer cards showing PIN, address, and full order history

---

## Backend Deployment (Google Apps Script)

### First-time setup

**1. Create a Google Sheets spreadsheet**
- Go to [sheets.google.com](https://sheets.google.com) → new blank spreadsheet
- Copy the **Spreadsheet ID** from the URL

**2. Create the Apps Script project**
- Go to [script.google.com](https://script.google.com) → New project → name it

**3. Copy all script files**

Create each file in the Apps Script editor (click **+** → Script):

| Local file | Apps Script name |
|---|---|
| `scripts/Config.gs` | `Config` |
| `scripts/DataMapper.gs` | `DataMapper` |
| `scripts/Validation.gs` | `Validation` |
| `scripts/ShopService.gs` | `ShopService` |
| `scripts/FoodService.gs` | `FoodService` |
| `scripts/OrderService.gs` | `OrderService` |
| `scripts/UserService.gs` | `UserService` |
| `scripts/Setup.gs` | `Setup` |
| `scripts/Main.gs` | `Main` |

**4. Set your Spreadsheet ID** in `Config.gs`:
```javascript
var SPREADSHEET_ID = 'your-spreadsheet-id-here';
```

**5. Set Script Properties**

Apps Script → **Project Settings → Script Properties**:

| Key | Default | Description |
|---|---|---|
| `CURRENCY_SYMBOL` | `Rs` | Currency prefix (e.g. `AED`, `$`) |
| `ADMIN_USERNAME` | `admin` | Admin portal login username |
| `ADMIN_PASSWORD` | `admin123` | Admin portal login password |
| `API_KEY` | *(required)* | Must match `GAS_API_KEY` GitHub Secret |

Generate a strong API key:
```bash
openssl rand -hex 32
```

**6. Initialise the spreadsheet**

Select `setupSpreadsheet` in the function dropdown → click **▶ Run** → authorise.

This creates 4 sheets: `admin`, `food_items`, `users`, `orders`.

> **Note:** The `users` sheet needs a `pin` column (col F). If the sheet already exists, add `pin` as the header in column F manually.

**7. Deploy as a Web App**

- **Deploy → New deployment**
- Type: **Web app** | Execute as: **Me** | Who has access: **Anyone**
- Copy the Web App URL

---

### Updating the backend

When you change any `.gs` file:
1. Update the file content in Apps Script editor
2. **Deploy → Manage deployments → edit → New version → Deploy**

**Files changed recently (deploy these):**
- `Main.gs` — API key validation + new actions
- `OrderService.gs` — PIN generation, deduplication fix, new lookup functions
- `UserService.gs` — deduplication in display
- `DataMapper.gs` — `pin` column in users schema
- `Setup.gs` — `pin` in users sheet headers

---

## Frontend Deployment (GitHub Pages)

### GitHub Secrets (required before first deploy)

Go to repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
|---|---|
| `GAS_API_URL` | Your GAS Web App URL (`https://script.google.com/macros/s/.../exec`) |
| `GAS_API_KEY` | Your API key (same value as `API_KEY` in Script Properties) |

These are injected into `api.js` at build time — never stored in the repo.

### First-time deploy

```bash
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then: GitHub repo → **Settings → Pages → Source: GitHub Actions → Save**

### Accessing the portals

| Portal | URL |
|---|---|
| Customer | `https://YOUR_USERNAME.github.io/YOUR_REPO/` |
| Admin | `https://YOUR_USERNAME.github.io/YOUR_REPO/admin.html` |

### Updating the frontend

```bash
git add .
git commit -m "Your change"
git push
```

GitHub Actions deploys automatically. Check the **Actions** tab for status.

### Rebuilding CSS (after style changes)

```bash
cd frontend
npm install   # first time only
npm run build
git add frontend/public/css/app.css
git commit -m "Rebuild CSS"
git push
```

---

## Security

| Layer | Protection |
|---|---|
| API key | Every request includes a key validated by the backend |
| Secrets | `GAS_API_URL` and `GAS_API_KEY` stored as GitHub Secrets, injected at deploy time |
| Admin auth | Username/password checked against Script Properties |
| Order lookup | Customers need WhatsApp number + 6-digit PIN |
| PIN | Generated once per WhatsApp number, never changes |

---

## Spreadsheet Schema

| Sheet | Columns |
|---|---|
| `admin` | `shop_name`, `whatsapp_number`, `email`, `address`, `status` |
| `food_items` | `id`, `name`, `description`, `price`, `image`, `availability` |
| `users` | `whatsapp_number`, `name`, `address`, `order_count`, `last_updated`, `pin` |
| `orders` | `order_id`, `cart_details`, `total_price`, `customer_name`, `customer_whatsapp`, `customer_address`, `status`, `timestamp` |

---

## Order Statuses

| Status | Meaning |
|---|---|
| `received` | Order just placed |
| `payment_received` | Payment confirmed |
| `in_progress` | Being prepared |
| `completed` | Delivered/fulfilled |

---

## Troubleshooting

**API returns "Unauthorized"**
→ Check `GAS_API_KEY` GitHub Secret matches `API_KEY` in Script Properties. Redeploy GAS after updating.

**Menu not loading**
→ Check GitHub Actions completed (Actions tab). Verify `GAS_API_URL` GitHub Secret is correct.

**Admin login fails**
→ Check `ADMIN_USERNAME` / `ADMIN_PASSWORD` in Script Properties. Default: `admin` / `admin123`.

**My Orders shows "Invalid WhatsApp number or PIN"**
→ Use the exact 10-digit WhatsApp number entered when ordering. PIN is in the WhatsApp confirmation message (🔑 Your PIN: XXXXXX).

**Duplicate customers in admin**
→ The deduplication fix runs automatically on the next order placement. Existing duplicates can be manually deleted from the `users` sheet — keep the row with the PIN.

**GAS changes not live**
→ Must create a **New version** in Manage Deployments — saving alone is not enough.

**CSS changes not applying**
→ Run `npm run build` in `frontend/` and push the updated `public/css/app.css`.

---

## About InstaShop

InstaShop helps local entrepreneurs and shop owners get online instantly and reach a much larger audience. Simple, powerful, and designed for any business.

**Contact:** Ramakant — ramakant.singh17@gmail.com | WhatsApp: 7045788997
