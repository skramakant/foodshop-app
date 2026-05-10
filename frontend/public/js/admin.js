/**
 * admin.js — Admin portal logic
 */

import * as API from './api.js';
import { escapeHtml, formatPrice, setCurrency, formatTimestamp, validateFoodItem, validateShopSettings } from './utils.js';

// ── Auth with 24h session persistence ─────────────────────────────────────
const SESSION_KEY = 'admin_session';
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    return (Date.now() - ts) < SESSION_TTL;
  } catch { return false; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function showPortal() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-portal').classList.remove('hidden');
  switchTab('shop');
}

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
    if (res?.success) {
      saveSession();
      showPortal();
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
  clearSession();
  document.getElementById('admin-portal').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-btn').disabled = false;
  document.getElementById('login-btn').textContent = 'Sign In';
  settingsLoaded = ordersLoaded = usersLoaded = false;
};

// Enter key on login + auto-login if session valid
document.addEventListener('DOMContentLoaded', () => {
  ['login-username', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  });
  // Auto-restore session
  if (loadSession()) showPortal();
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
let ordersRefreshTimer = null;

window.switchTab = (tabId) => {
  ['shop', 'food', 'orders', 'users'].forEach(id => {
    document.getElementById(`tab-${id}`).classList.toggle('active', id === tabId);
    document.getElementById(`tab-${id}`).classList.toggle('hidden', id !== tabId);
    document.getElementById(`tab-btn-${id}`).classList.toggle('active', id === tabId);
  });
  if (tabId === 'shop'   && !settingsLoaded) { loadSettings(); settingsLoaded = true; }
  if (tabId === 'food')                       { loadFoodItems(); }
  if (tabId === 'orders') {
    if (!ordersLoaded) { loadOrders(); ordersLoaded = true; }
    startOrdersAutoRefresh();
  } else {
    stopOrdersAutoRefresh();
  }
  if (tabId === 'users' && !usersLoaded) { loadUsers(); usersLoaded = true; }
};

// ── Orders auto-refresh ────────────────────────────────────────────────────
let lastOrderCount = 0;

function startOrdersAutoRefresh() {
  stopOrdersAutoRefresh();
  ordersRefreshTimer = setInterval(() => {
    refreshOrders();
  }, 60 * 1000); // every 60 seconds
}

function stopOrdersAutoRefresh() {
  if (ordersRefreshTimer) { clearInterval(ordersRefreshTimer); ordersRefreshTimer = null; }
}

async function refreshOrders() {
  try {
    const res    = await API.getOrdersWithTodayCounts();
    const orders = res.orders || [];
    const newCount = orders.length;
    if (lastOrderCount > 0 && newCount > lastOrderCount) {
      const diff = newCount - lastOrderCount;
      showNewOrderNotification(diff);
    }
    renderOrders(res);
  } catch (err) { /* silent refresh — don't show error on background poll */ }
}

function showNewOrderNotification(count) {
  const banner = document.getElementById('new-order-banner');
  document.getElementById('new-order-text').textContent =
    `${count} new order${count > 1 ? 's' : ''} received!`;
  banner.classList.remove('hidden');
  playNotificationSound();
  // Auto-hide after 8 seconds
  setTimeout(() => banner.classList.add('hidden'), 8000);
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Play two quick beeps
    [0, 0.25].forEach(delay => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (e) { /* audio not supported */ }
}

// ── Shop tab ───────────────────────────────────────────────────────────────
async function loadSettings() {
  try {
    const res = await API.getShopMetadata();
    const data = res;
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
    renderFoodItems(res || []);
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
    const res = await API.getOrdersWithTodayCounts();
    document.getElementById('orders-loading').classList.add('hidden');
    document.getElementById('orders-content').classList.remove('hidden');
    renderOrders(res);
  } catch (err) {
    document.getElementById('orders-loading').classList.add('hidden');
    showError(err);
  }
}

function renderOrders(data) {
  const orders = data.orders || [];

    // All-time counts by current status
    const counts = { received: 0, payment_received: 0, in_progress: 0, completed: 0 };
    orders.forEach(o => { if (counts.hasOwnProperty(o.status)) counts[o.status]++; });
    ['received','payment_received','in_progress','completed'].forEach(s => {
      document.getElementById(`count-${s}`).textContent = counts[s];
    });

    // Today's counts by current status
    const todayStr = new Date().toDateString();
    const todayCounts = { received: 0, payment_received: 0, in_progress: 0, completed: 0 };
    orders.forEach(o => {
      if (new Date(o.timestamp).toDateString() === todayStr && todayCounts.hasOwnProperty(o.status)) {
        todayCounts[o.status]++;
      }
    });
    ['received','payment_received','in_progress','completed'].forEach(s => {
      document.getElementById(`today-count-${s}`).textContent = todayCounts[s];
    });
    document.getElementById('today-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const list  = document.getElementById('orders-list');
    const empty = document.getElementById('orders-empty');
    if (!orders.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    const statusOptions = ['received','payment_received','in_progress','completed'];
    const statusLabels  = { received: 'Received', payment_received: 'Payment Received', in_progress: 'In Progress', completed: 'Completed' };

    list.innerHTML = orders.slice().reverse().map(order => {
      let cartItems = [];
      try { cartItems = typeof order.cart_details === 'string' ? JSON.parse(order.cart_details) : order.cart_details; } catch {}
      const itemsHtml = Array.isArray(cartItems)
        ? cartItems.map(ci => `<span class="inline-flex items-center gap-1 bg-white border border-slate-100 rounded-lg px-2 py-1 text-xs text-slate-600">${escapeHtml(ci.name)} <strong>×${ci.quantity}</strong></span>`).join('')
        : '';
      const selectHtml = `<select onchange="handleStatusChange('${escapeHtml(order.order_id)}', this.value, this)"
        class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer font-medium">
        ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${statusLabels[s]}</option>`).join('')}
      </select>`;

      return `
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <!-- Order header -->
          <div class="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 gap-3 flex-wrap">
            <div class="flex items-center gap-2 min-w-0">
              <span class="status-badge status-${order.status}">${statusLabels[order.status] || order.status}</span>
              <code class="text-xs text-slate-400 font-mono truncate max-w-[120px]">#${escapeHtml(order.order_id.slice(0,8))}</code>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="font-bold text-teal-700 text-sm">${formatPrice(order.total_price)}</span>
              ${selectHtml}
            </div>
          </div>
          <!-- Customer info -->
          <div class="px-4 py-3 flex flex-col gap-1.5">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-slate-400 w-5">👤</span>
              <span class="font-semibold text-slate-800">${escapeHtml(order.customer_name)}</span>
              <span class="text-slate-400 text-xs ml-auto">${formatTimestamp(order.timestamp)}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <span class="text-slate-400 w-5">📞</span>${escapeHtml(order.customer_whatsapp)}
            </div>
            <div class="flex items-start gap-2 text-sm text-slate-600">
              <span class="text-slate-400 w-5 mt-0.5">📍</span><span>${escapeHtml(order.customer_address)}</span>
            </div>
            ${itemsHtml ? `<div class="flex flex-wrap gap-1.5 mt-1">${itemsHtml}</div>` : ''}
          </div>
        </div>`;
    }).join('');

  // Track order count for new-order detection
  lastOrderCount = orders.length;
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
    const users = res || [];
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
