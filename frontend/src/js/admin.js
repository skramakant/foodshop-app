/**
 * admin.js — Admin portal logic
 */

import * as API from './api.js';
import { escapeHtml, formatPrice, setCurrency, formatTimestamp, validateFoodItem, validateShopSettings } from './utils.js';

// ── Auth ───────────────────────────────────────────────────────────────────
window.handleLogin = async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  if (!username || !password) { errEl.textContent = 'Please enter username and password.'; return; }

  btn.disabled = true;
  btn.textContent = 'Signing in…';
  errEl.textContent = '';

  try {
    const res = await API.checkAdminAuth(username, password);
    if (res?.result?.success) {
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('admin-portal').classList.remove('hidden');
      switchTab('shop');
    } else {
      errEl.textContent = 'Invalid username or password.';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  } catch (err) {
    errEl.textContent = 'Login failed. Please try again.';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
};

window.handleLogout = () => {
  document.getElementById('admin-portal').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-btn').disabled = false;
  document.getElementById('login-btn').textContent = 'Sign In';
  settingsLoaded = ordersLoaded = usersLoaded = false;
};

// Enter key on login
document.addEventListener('DOMContentLoaded', () => {
  ['login-username', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  });
});

// ── Error banner ───────────────────────────────────────────────────────────
function showError(err) {
  const msg = err?.message || String(err || 'Something went wrong.');
  document.getElementById('error-msg-text').textContent = msg;
  const banner = document.getElementById('error-banner');
  banner.classList.remove('hidden');
  banner.classList.add('flex');
}

window.dismissError = () => {
  const banner = document.getElementById('error-banner');
  banner.classList.add('hidden');
  banner.classList.remove('flex');
};

// ── Tab switching ──────────────────────────────────────────────────────────
let settingsLoaded = false, ordersLoaded = false, usersLoaded = false;

window.switchTab = (tabId) => {
  ['shop', 'food', 'orders', 'users'].forEach(id => {
    document.getElementById(`tab-${id}`).classList.toggle('active', id === tabId);
    document.getElementById(`tab-${id}`).classList.toggle('hidden', id !== tabId);
    document.getElementById(`tab-btn-${id}`).classList.toggle('active', id === tabId);
  });
  if (tabId === 'shop'   && !settingsLoaded) { loadSettings(); settingsLoaded = true; }
  if (tabId === 'food')                       { loadFoodItems(); }
  if (tabId === 'orders' && !ordersLoaded)   { loadOrders();   ordersLoaded = true; }
  if (tabId === 'users'  && !usersLoaded)    { loadUsers();    usersLoaded = true; }
};

// ── Shop tab ───────────────────────────────────────────────────────────────
async function loadSettings() {
  try {
    const res = await API.getShopMetadata();
    const data = res.result;
    document.getElementById('shop-loading').classList.add('hidden');
    document.getElementById('settings-form').classList.remove('hidden');
    document.getElementById('s-shop-name').value = data.shop_name || '';
    document.getElementById('s-whatsapp').value  = data.whatsapp_number || '';
    document.getElementById('s-email').value     = data.email || '';
    document.getElementById('s-address').value   = data.address || '';
    document.getElementById('s-status').value    = data.status || 'open';
    if (data.currency_symbol) setCurrency(data.currency_symbol);
  } catch (err) {
    document.getElementById('shop-loading').classList.add('hidden');
    showError(err);
  }
}

window.handleSettingsSubmit = async (e) => {
  e.preventDefault();
  ['shop-name','whatsapp-number','email','address'].forEach(f => {
    document.getElementById(`err-${f}`).textContent = '';
  });
  document.getElementById('settings-success').classList.add('hidden');

  const data = {
    shop_name:       document.getElementById('s-shop-name').value,
    whatsapp_number: document.getElementById('s-whatsapp').value,
    email:           document.getElementById('s-email').value,
    address:         document.getElementById('s-address').value,
    status:          document.getElementById('s-status').value,
  };

  const { valid, errors } = validateShopSettings(data);
  if (!valid) {
    const map = { shop_name: 'err-shop-name', whatsapp_number: 'err-whatsapp-number', email: 'err-email', address: 'err-address' };
    Object.entries(errors).forEach(([f, msg]) => { const el = document.getElementById(map[f]); if (el) el.textContent = msg; });
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    await API.saveShopMetadata(data);
    document.getElementById('settings-success').classList.remove('hidden');
  } catch (err) { showError(err); }
  finally { if (btn) btn.disabled = false; }
};

// ── Food tab ───────────────────────────────────────────────────────────────
let _editingItemId = null;

async function loadFoodItems() {
  document.getElementById('food-loading').classList.remove('hidden');
  document.getElementById('food-list').classList.add('hidden');
  try {
    const res = await API.getFoodItems();
    renderFoodItems(res.result || []);
  } catch (err) {
    document.getElementById('food-loading').classList.add('hidden');
    showError(err);
  }
}

function renderFoodItems(items) {
  document.getElementById('food-loading').classList.add('hidden');
  const list  = document.getElementById('food-list');
  const empty = document.getElementById('food-empty');
  if (!items.length) { empty.classList.remove('hidden'); list.classList.add('hidden'); return; }
  empty.classList.add('hidden');
  list.classList.remove('hidden');
  list.innerHTML = items.map(item => `
    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      ${item.image ? `<img src="${escapeHtml(item.image)}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-200" onerror="this.style.display='none'" />` : '<div class="w-14 h-14 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-2xl">🍽</div>'}
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-slate-800 truncate">${escapeHtml(item.name)}</div>
        <div class="text-xs text-slate-400 truncate mt-0.5">${escapeHtml(item.description || '')}</div>
        <div class="flex items-center gap-2 mt-1">
          <span class="font-bold text-teal-700 text-sm">${formatPrice(item.price)}</span>
          <span class="badge ${item.availability === 'available' ? 'badge-available' : 'badge-not_available'} text-xs">${item.availability === 'available' ? 'Available' : 'Unavailable'}</span>
        </div>
      </div>
      <div class="flex flex-col gap-1.5 flex-shrink-0">
        <button onclick='showEditForm(${JSON.stringify(item)})' class="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1.5 rounded-lg">Edit</button>
        <button onclick="deleteItem('${escapeHtml(item.id)}')" class="text-xs bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg">Delete</button>
      </div>
    </div>`).join('');
}

window.showAddForm = () => {
  _editingItemId = null;
  resetItemForm();
  document.getElementById('item-form-title').textContent = 'Add Food Item';
  document.getElementById('item-form-wrap').classList.remove('hidden');
  document.getElementById('f-name').focus();
};

window.showEditForm = (item) => {
  if (typeof item === 'string') item = JSON.parse(item);
  _editingItemId = item.id;
  resetItemForm();
  document.getElementById('item-form-title').textContent = 'Edit Food Item';
  document.getElementById('f-item-id').value       = item.id || '';
  document.getElementById('f-name').value          = item.name || '';
  document.getElementById('f-description').value   = item.description || '';
  document.getElementById('f-price').value         = item.price ?? '';
  document.getElementById('f-image').value         = item.image || '';
  document.getElementById('f-availability').value  = item.availability || 'available';
  document.getElementById('item-form-wrap').classList.remove('hidden');
  document.getElementById('f-name').focus();
};

window.cancelItemForm = () => {
  document.getElementById('item-form-wrap').classList.add('hidden');
  resetItemForm();
  _editingItemId = null;
};

function resetItemForm() {
  document.getElementById('item-form').reset();
  document.getElementById('f-item-id').value = '';
  ['err-f-name','err-f-description','err-f-price','err-f-image','err-f-availability'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
}

window.handleItemFormSubmit = async (e) => {
  e.preventDefault();
  const item = {
    name:         document.getElementById('f-name').value,
    description:  document.getElementById('f-description').value,
    price:        parseFloat(document.getElementById('f-price').value) || NaN,
    image:        document.getElementById('f-image').value,
    availability: document.getElementById('f-availability').value,
  };
  const { valid, errors } = validateFoodItem(item);
  if (!valid) {
    const map = { name:'err-f-name', description:'err-f-description', price:'err-f-price', image:'err-f-image', availability:'err-f-availability' };
    Object.entries(errors).forEach(([f, msg]) => { const el = document.getElementById(map[f]); if (el) el.textContent = msg; });
    return;
  }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    if (_editingItemId) { item.id = _editingItemId; await API.updateFoodItem(item); }
    else                { await API.addFoodItem(item); }
    cancelItemForm();
    loadFoodItems();
  } catch (err) { showError(err); }
  finally { if (btn) btn.disabled = false; }
};

window.deleteItem = async (id) => {
  if (!confirm('Delete this food item? This cannot be undone.')) return;
  try { await API.deleteFoodItem(id); loadFoodItems(); }
  catch (err) { showError(err); }
};

// ── Orders tab ─────────────────────────────────────────────────────────────
async function loadOrders() {
  try {
    const res  = await API.getOrdersWithTodayCounts();
    const data = res.result;
    document.getElementById('orders-loading').classList.add('hidden');
    document.getElementById('orders-content').classList.remove('hidden');

    const counts = data.today_counts || {};
    ['received','payment_received','in_progress','completed'].forEach(s => {
      document.getElementById(`count-${s}`).textContent = counts[s] || 0;
    });

    const orders = data.orders || [];
    const list   = document.getElementById('orders-list');
    const empty  = document.getElementById('orders-empty');
    if (!orders.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    const statusOptions = ['received','payment_received','in_progress','completed'];
    list.innerHTML = orders.map(order => {
      let cartItems = [];
      try { cartItems = typeof order.cart_details === 'string' ? JSON.parse(order.cart_details) : order.cart_details; } catch {}
      const itemsHtml = Array.isArray(cartItems)
        ? cartItems.map(ci => `<li class="text-xs text-slate-500">${escapeHtml(ci.name)} ×${ci.quantity}</li>`).join('')
        : '';
      const selectHtml = `<select onchange="handleStatusChange('${escapeHtml(order.order_id)}', this.value, this)"
        class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer">
        ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s.replace(/_/g,' ')}</option>`).join('')}
      </select>`;
      return `
        <div class="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
          <div class="flex items-start justify-between gap-2 flex-wrap">
            <code class="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-mono break-all flex-1">${escapeHtml(order.order_id)}</code>
            ${selectHtml}
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div><span class="text-slate-400 text-xs">Customer</span><div class="font-medium">${escapeHtml(order.customer_name)}</div></div>
            <div><span class="text-slate-400 text-xs">WhatsApp</span><div class="font-medium">${escapeHtml(order.customer_whatsapp)}</div></div>
            <div class="col-span-2"><span class="text-slate-400 text-xs">Address</span><div class="font-medium">${escapeHtml(order.customer_address)}</div></div>
          </div>
          ${itemsHtml ? `<ul class="bg-white rounded-lg p-2 border border-slate-100">${itemsHtml}</ul>` : ''}
          <div class="flex justify-between items-center">
            <span class="font-bold text-teal-700">${formatPrice(order.total_price)}</span>
            <span class="text-xs text-slate-400">${formatTimestamp(order.timestamp)}</span>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('orders-loading').classList.add('hidden');
    showError(err);
  }
}

window.handleStatusChange = async (orderId, newStatus, selectEl) => {
  const prev = selectEl.dataset.prev || selectEl.value;
  selectEl.dataset.prev = newStatus;
  try {
    await API.updateOrderStatus(orderId, newStatus);
    selectEl.dataset.prev = newStatus;
  } catch (err) {
    selectEl.value = prev;
    selectEl.dataset.prev = prev;
    showError(err);
  }
};

// ── Users tab ──────────────────────────────────────────────────────────────
async function loadUsers() {
  try {
    const res   = await API.getUsers();
    const users = res.result || [];
    document.getElementById('users-loading').classList.add('hidden');
    const list  = document.getElementById('users-list');
    const empty = document.getElementById('users-empty');
    if (!users.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    list.classList.remove('hidden');
    list.innerHTML = users.map(user => `
      <div class="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">👤</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-slate-800">${escapeHtml(user.name || '—')}</div>
          <div class="text-xs text-slate-400 mt-0.5">${escapeHtml(user.whatsapp_number)}</div>
          <div class="text-xs text-slate-400 truncate">${escapeHtml(user.address || '')}</div>
        </div>
        <div class="text-center flex-shrink-0">
          <div class="text-2xl font-extrabold text-slate-800">${user.order_count || 0}</div>
          <div class="text-xs text-slate-400">orders</div>
        </div>
      </div>`).join('');
  } catch (err) {
    document.getElementById('users-loading').classList.add('hidden');
    showError(err);
  }
}
