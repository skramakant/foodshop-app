# Food Shop App

A food shop web application with a mobile-first customer portal and an admin portal.

- **Customer Portal** — browse menu, add to cart, place orders via WhatsApp, track orders with PIN
- **Admin Portal** — manage food items, shop settings, orders (auto-refresh + notifications), and customers

**Architecture:**
- **Frontend** — standalone HTML/CSS/JS deployed on GitHub Pages
- **Backend** — Google Apps Script Web App connected to Google Sheets as the database

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
│       ├── utils.js      ← Shared utilities
│       ├── customer.js   ← Customer portal logic
│       └── admin.js      ← Admin portal logic
├── src/
│   ├── css/input.css     ← Tailwind source
│   └── js/               ← Source JS modules
├── tailwind.config.js
└── package.json

scripts/                  ← Google Apps Script backend
├── Main.gs               ← HTTP router (doGet + doPost) + API key validation
├── Config.gs             ← Constants, credentials, app config
├── ShopService.gs        ← Shop settings read/write
├── FoodService.gs        ← Food item CRUD
├── OrderService.gs       ← Order placement, management, PIN-based lookup
├── UserService.gs        ← Customer records
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
- Order via WhatsApp (deep-link) or silent order
- **My Orders** — enter WhatsApp number + 6-digit PIN to view all orders and status
- Pull-to-refresh on menu

### Admin Portal
- Login with username/password (24-hour session persistence)
- Left sidebar navigation (desktop) + bottom tab bar (mobile)
- **Shop tab** — configure name, WhatsApp, email, address, status
- **Food tab** — add/edit/delete menu items
- **Orders tab** — all-time stats + today's stats, order cards with status dropdown, auto-refresh every 60s with bell notification + sound
- **Customers tab** — view all customers and order counts

---

## Backend Deployment (Google Apps Script)

### First-time setup

**1. Create a Google Sheets spreadsheet**
- Go to [sheets.google.com](https://sheets.google.com) → new blank spreadsheet
- Copy the **Spreadsheet ID** from the URL

**2. Create the Apps Script project**
- Go to [script.google.com](https://script.google.com) → New project

**3. Copy all script files**

Create each file in the Apps Script editor (click **+** → Script):

| Local file | Apps Script file name |
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

**4. Set your Spreadsheet ID**

In `Config.gs`:
```javascript
var SPREADSHEET_ID = 'your-spreadsheet-id-here';
```

**5. Set Script Properties**

Apps Script → **Project Settings → Script Properties**:

| Key | Value | Description |
|---|---|---|
| `CURRENCY_SYMBOL` | `Rs` | Currency prefix (e.g. `AED`, `$`) |
| `ADMIN_USERNAME` | `admin` | Admin portal login username |
| `ADMIN_PASSWORD` | `admin123` | Admin portal login password |
| `API_KEY` | `your-secret-key` | API key — must match `GAS_API_KEY` GitHub Secret |

Generate a strong API key:
```bash
openssl rand -hex 32
```

**6. Initialise the spreadsheet**

- Select `setupSpreadsheet` in the function dropdown → click **▶ Run**
- This creates 4 sheets: `admin`, `food_items`, `users`, `orders`
- The `users` sheet has a `pin` column (col F) — add it manually if the sheet already exists

**7. Deploy as a Web App**

- **Deploy → New deployment**
- Type: **Web app** | Execute as: **Me** | Who has access: **Anyone**
- Copy the Web App URL

---

### Updating the backend

When you change any `.gs` file:
1. Update the file in Apps Script editor
2. **Deploy → Manage deployments → edit → New version → Deploy**

---

## Frontend Deployment (GitHub Pages)

### GitHub Secrets setup (required before first deploy)

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**:

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

- **API key** — every request from the frontend includes an API key validated by the backend
- **Secrets** — `GAS_API_URL` and `GAS_API_KEY` are stored as GitHub Secrets, injected at deploy time, never in the repo
- **Admin auth** — admin portal requires username/password checked against Script Properties
- **PIN-based order lookup** — customers need both WhatsApp number + 6-digit PIN to view orders

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
- Check `GAS_API_KEY` GitHub Secret matches `API_KEY` in Script Properties
- Redeploy GAS after updating Script Properties

**Menu not loading**
- Check GitHub Actions completed successfully (Actions tab)
- Verify `GAS_API_URL` GitHub Secret is correct

**Admin login fails**
- Check `ADMIN_USERNAME` / `ADMIN_PASSWORD` in Script Properties
- Default: `admin` / `admin123`

**My Orders shows "Invalid WhatsApp number or PIN"**
- Customer must use the exact WhatsApp number entered when ordering
- PIN is in the WhatsApp confirmation message (🔑 Your PIN: XXXXXX)
- PIN is generated once per WhatsApp number and never changes

**GAS changes not live**
- Must create a **New version** in Manage Deployments — saving alone is not enough

**CSS changes not applying**
- Run `npm run build` in `frontend/` and push the updated `public/css/app.css`
