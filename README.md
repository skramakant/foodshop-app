# Food Shop App

A food shop web application with a mobile-first customer portal and an admin portal.

- **Customer Portal** — browse menu, add to cart, place orders via WhatsApp
- **Admin Portal** — manage food items, shop settings, orders, and customers

**Architecture:**
- **Frontend** — standalone HTML/CSS/JS deployed on GitHub Pages (no iframe issues, proper mobile support)
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
│       ├── api.js        ← All GAS API calls
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
├── Main.gs               ← HTTP router (doGet + doPost)
├── Config.gs             ← Constants, credentials, app config
├── ShopService.gs        ← Shop settings read/write
├── FoodService.gs        ← Food item CRUD
├── OrderService.gs       ← Order placement and management
├── UserService.gs        ← Customer records
├── DataMapper.gs         ← Row ↔ object converters
├── Validation.gs         ← Input validation
└── Setup.gs              ← One-time spreadsheet initialisation

html/                     ← Legacy GAS HTML portals (kept for reference)
tests/                    ← Unit and property tests
lib/                      ← Pure JS modules (shared with tests)
```

---

## Backend Deployment (Google Apps Script)

### First-time setup

**1. Create a Google Sheets spreadsheet**

- Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
- Name it (e.g. `Food Shop Database`)
- Copy the **Spreadsheet ID** from the URL:
  ```
  https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  ```

**2. Create the Apps Script project**

- Go to [script.google.com](https://script.google.com) and create a **New project**
- Name it (e.g. `Food Shop App`)

**3. Copy all script files**

For each file in the `scripts/` folder, create a matching file in the Apps Script editor:

- Click **+** next to Files → **Script**
- Name it exactly (e.g. `Config`, `Main`, `ShopService`, etc.)
- Paste the contents of the corresponding local file

Files to copy:
```
Config.gs → Config
DataMapper.gs → DataMapper
Validation.gs → Validation
ShopService.gs → ShopService
FoodService.gs → FoodService
OrderService.gs → OrderService
UserService.gs → UserService
Setup.gs → Setup
Main.gs → Main
```

**4. Set your Spreadsheet ID**

In `Config.gs`, replace the empty string:
```javascript
var SPREADSHEET_ID = 'your-spreadsheet-id-here';
```

**5. Set Script Properties**

In Apps Script → **Project Settings → Script Properties**, add:

| Key | Value | Description |
|-----|-------|-------------|
| `CURRENCY_SYMBOL` | `Rs` | Currency shown on prices (e.g. `AED`, `$`) |
| `ADMIN_USERNAME` | `admin` | Admin portal login username |
| `ADMIN_PASSWORD` | `admin123` | Admin portal login password |

**6. Initialise the spreadsheet**

- In the Apps Script editor, select `setupSpreadsheet` from the function dropdown
- Click **▶ Run** and authorise when prompted
- This creates the four required sheets: `admin`, `food_items`, `users`, `orders`

**7. Deploy as a Web App**

- Click **Deploy → New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Click **Deploy** and copy the Web App URL

---

### Updating the backend

When you change any `.gs` file:

1. Open the Apps Script editor and update the file content
2. **Deploy → Manage deployments → edit → New version → Deploy**

The URL stays the same — no need to update the frontend.

---

## Frontend Deployment (GitHub Pages)

### First-time setup

**1. Set your GAS API URL**

Open `frontend/public/js/api.js` and replace the placeholder:
```javascript
const GAS_API_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

**2. Push to GitHub**

```bash
cd /path/to/minifood
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**3. Enable GitHub Pages**

- Go to your repo → **Settings → Pages**
- Source: **GitHub Actions**
- Save

The `.github/workflows/deploy.yml` file handles automatic deployment on every push to `main`.

**4. Access your portals**

| Portal | URL |
|--------|-----|
| Customer | `https://YOUR_USERNAME.github.io/YOUR_REPO/` |
| Admin | `https://YOUR_USERNAME.github.io/YOUR_REPO/admin.html` |

---

### Updating the frontend

After making changes to any file in `frontend/public/`:

```bash
git add .
git commit -m "Your change description"
git push
```

GitHub Actions deploys automatically. Check the **Actions** tab for status.

### Rebuilding CSS (after style changes)

If you change `frontend/src/css/input.css` or `tailwind.config.js`:

```bash
cd frontend
npm install          # first time only
npm run build        # rebuilds public/css/app.css
cp src/js/*.js public/js/
git add .
git commit -m "Rebuild CSS"
git push
```

---

## Admin Portal

| Feature | Details |
|---------|---------|
| Login | Username/password set in Script Properties |
| Session | Persists for 24 hours (localStorage) |
| Shop tab | Configure shop name, WhatsApp, email, address, status |
| Food tab | Add/edit/delete menu items with image, price, availability |
| Orders tab | View all orders, update status, auto-refreshes every 60s with bell notification |
| Users tab | View all customers and their order counts |

## Order Statuses

| Status | Meaning |
|--------|---------|
| `received` | Order just placed |
| `payment_received` | Payment confirmed |
| `in_progress` | Being prepared |
| `completed` | Delivered/fulfilled |

## Spreadsheet Schema

| Sheet | Columns |
|-------|---------|
| `admin` | `shop_name`, `whatsapp_number`, `email`, `address`, `status` |
| `food_items` | `id`, `name`, `description`, `price`, `image`, `availability` |
| `users` | `whatsapp_number`, `name`, `address`, `order_count`, `last_updated` |
| `orders` | `order_id`, `cart_details`, `total_price`, `customer_name`, `customer_whatsapp`, `customer_address`, `status`, `timestamp` |

---

## Troubleshooting

**Menu not loading / API errors**
- Verify `GAS_API_URL` in `frontend/public/js/api.js` is correct
- Check the GAS deployment is set to "Anyone" access
- Open browser DevTools → Network tab to inspect the API response

**Admin login fails**
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Script Properties
- Default credentials: `admin` / `admin123`

**Changes not showing after push**
- Check the GitHub Actions tab — the workflow must complete successfully
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

**CSS changes not applying**
- Run `npm run build` in the `frontend/` folder and push the updated `public/css/app.css`

**GAS backend changes not live**
- You must create a **New version** in Manage Deployments — saving the file alone is not enough
