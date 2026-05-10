/**
 * customer.js — Customer portal logic
 * Imports from api.js, cart.js, utils.js
 */

import * as API from './api.js';
import { addToCart, removeFromCart, updateQuantity, calcTotal, saveCart, loadCart } from './cart.js';
import {
  escapeHtml, formatPrice, setCurrency, buildWhatsAppMessage, buildWaMeUrl,
  validateOrderForm
} from './utils.js';

// ── State ──────────────────────────────────────────────────────────────────
let cart = loadCart();
let shopWhatsApp = '';
let shopClosed = false;
let orderViaWhatsApp = false;
let pendingCustomer = { name: '', whatsapp: '', address: '' };

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  Promise.all([
    API.getShopMetadata().then(onMetadataLoaded).catch(showError),
    API.getFoodItems().then(renderMenu).catch(showError),
  ]);
  setupPullToRefresh();
});

// ── Error banner ───────────────────────────────────────────────────────────
function showError(err) {
  const msg = err?.message || String(err || 'Something went wrong.');
  document.getElementById('error-text').textContent = msg;
  document.getElementById('error-banner').classList.remove('hidden');
  document.getElementById('error-banner').classList.add('flex');
}

window.dismissError = () => {
  document.getElementById('error-banner').classList.add('hidden');
  document.getElementById('error-banner').classList.remove('flex');
};

// ── Metadata ───────────────────────────────────────────────────────────────
function onMetadataLoaded(data) {
  if (!data) return;
  if (data.shop_name) {
    document.getElementById('shop-name').textContent = data.shop_name;
    document.title = `${data.shop_name} — Order Online`;
  }
  shopWhatsApp = data.whatsapp_number || '';
  if (data.currency_symbol) setCurrency(data.currency_symbol);

  // Shop info card
  const infoEl = document.getElementById('shop-info');
  if (data.shop_name) {
    document.getElementById('shop-info-name-val').textContent = data.shop_name;
    document.getElementById('shop-info-name').classList.remove('hidden');
    document.getElementById('shop-info-name').classList.add('flex');
  }
  if (data.whatsapp_number) {
    document.getElementById('shop-info-whatsapp-val').textContent = data.whatsapp_number;
    document.getElementById('shop-info-whatsapp').classList.remove('hidden');
    document.getElementById('shop-info-whatsapp').classList.add('flex');
  }
  if (data.email) {
    document.getElementById('shop-info-email-val').textContent = data.email;
    document.getElementById('shop-info-email').classList.remove('hidden');
    document.getElementById('shop-info-email').classList.add('flex');
  }
  if (data.address) {
    document.getElementById('shop-info-address-val').textContent = data.address;
    document.getElementById('shop-info-address').classList.remove('hidden');
    document.getElementById('shop-info-address').classList.add('flex');
  }
  const badge = document.getElementById('shop-info-status-badge');
  badge.textContent = data.status === 'closed' ? 'Closed' : 'Open';
  badge.className = `badge ${data.status === 'closed' ? 'badge-closed' : 'badge-open'}`;
  infoEl.classList.remove('hidden');

  if (data.status === 'closed') {
    shopClosed = true;
    document.getElementById('closed-banner').classList.remove('hidden');
    document.getElementById('menu-section').classList.add('opacity-60', 'pointer-events-none');
    setOrderButtonsDisabled(true);
  }
}

// ── Menu rendering ─────────────────────────────────────────────────────────
function renderMenu(items) {
  const grid = document.getElementById('menu-grid');
  if (!items?.length) {
    grid.innerHTML = '<div class="col-span-full text-center py-16 text-slate-400">No menu items available.</div>';
    return;
  }

  grid.innerHTML = items.map(item => {
    const isUnavailable = item.availability === 'not_available';
    const imgHtml = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="w-full aspect-video object-cover bg-slate-100" loading="lazy" />`
      : `<div class="w-full aspect-video bg-slate-100 flex items-center justify-center text-slate-300 text-4xl">🍽</div>`;

    const cartItem = JSON.stringify({ id: item.id, name: item.name, price: item.price, quantity: 1 });

    return `
      <article class="card overflow-hidden flex flex-col ${isUnavailable ? 'opacity-55' : ''}" aria-label="${escapeHtml(item.name)}">
        ${imgHtml}
        <div class="p-4 flex flex-col gap-2 flex-1">
          <div class="text-lg font-bold text-slate-800 leading-snug">${escapeHtml(item.name)}</div>
          ${item.description ? `<div class="text-sm text-slate-500 leading-relaxed">${escapeHtml(item.description)}</div>` : ''}
          <div class="text-xl font-extrabold text-teal-700 mt-1">${formatPrice(item.price)}</div>
          ${isUnavailable ? '<span class="inline-block bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">Unavailable</span>' : ''}
        </div>
        <div class="px-4 pb-4">
          <button
            class="btn-primary w-full text-base"
            ${isUnavailable || shopClosed ? 'disabled' : `onclick="handleAddToCart(${escapeHtml(cartItem)})"`}
            aria-label="${isUnavailable ? 'Unavailable: ' : 'Add '}${escapeHtml(item.name)}${isUnavailable ? '' : ' to cart'}"
          >${isUnavailable ? 'Unavailable' : 'Add to Cart'}</button>
        </div>
      </article>`;
  }).join('');
}

// ── Cart popup ─────────────────────────────────────────────────────────────
let popupTimer = null;
function showCartPopup(itemName) {
  document.getElementById('cart-popup-item-name').textContent = itemName;
  const popup = document.getElementById('cart-popup');
  const overlay = document.getElementById('cart-popup-overlay');
  popup.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
  popup.classList.add('opacity-100', 'scale-100');
  overlay.classList.remove('hidden');
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    popup.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
    popup.classList.remove('opacity-100', 'scale-100');
    overlay.classList.add('hidden');
  }, 1500);
}

// ── Cart actions ───────────────────────────────────────────────────────────
window.handleAddToCart = (item) => {
  if (typeof item === 'string') item = JSON.parse(item);
  cart = addToCart(cart, item);
  saveCart(cart);
  renderCart();
  showCartPopup(item.name);
};

window.handleIncrement = (itemId) => {
  const found = cart.find(c => c.id === itemId);
  if (found) { cart = updateQuantity(cart, itemId, found.quantity + 1); saveCart(cart); renderCart(); }
};

window.handleDecrement = (itemId) => {
  const found = cart.find(c => c.id === itemId);
  if (found) { cart = updateQuantity(cart, itemId, found.quantity - 1); saveCart(cart); renderCart(); }
};

window.handleRemove = (itemId) => {
  cart = removeFromCart(cart, itemId);
  saveCart(cart);
  renderCart();
};

// ── Render cart ────────────────────────────────────────────────────────────
function renderCart() {
  const list = document.getElementById('cart-items-list');
  const total = calcTotal(cart);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  // Bottom bar
  document.getElementById('bottom-cart-count').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  document.getElementById('bottom-cart-total').textContent = formatPrice(total);
  const bbadge = document.getElementById('bottom-cart-badge');
  bbadge.textContent = count;
  bbadge.dataset.count = count;
  bbadge.classList.toggle('hidden', count === 0);

  // Cart total
  document.getElementById('cart-total').textContent = formatPrice(total);

  const disabled = shopClosed || cart.length === 0;
  setOrderButtonsDisabled(disabled);

  if (!cart.length) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
        <div class="text-5xl">🛒</div>
        <div class="font-bold text-slate-800">Your cart is empty</div>
        <div class="text-sm text-slate-400">Add items from the menu to get started</div>
      </div>`;
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-50 last:border-0">
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-slate-800 truncate">${escapeHtml(item.name)}</div>
        <div class="text-xs text-slate-400 mt-0.5">${formatPrice(item.price)} each</div>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="handleDecrement('${item.id}')"
            class="w-8 h-8 border-2 border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-700 text-lg active:bg-slate-200">−</button>
          <span class="min-w-[28px] text-center font-bold text-slate-800">${item.quantity}</span>
          <button onclick="handleIncrement('${item.id}')"
            class="w-8 h-8 border-2 border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-700 text-lg active:bg-slate-200">+</button>
        </div>
      </div>
      <div class="font-bold text-teal-700 text-sm whitespace-nowrap">${formatPrice(item.price * item.quantity)}</div>
      <button onclick="handleRemove('${item.id}')"
        class="w-8 h-8 flex items-center justify-center text-red-400 rounded-lg active:bg-red-50 text-lg">✕</button>
    </div>`).join('');
}

function setOrderButtonsDisabled(disabled) {
  ['place-order-wa-btn', 'bottom-order-wa-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = disabled;
  });
}

// ── Cart panel ─────────────────────────────────────────────────────────────
window.toggleCart = () => {
  const panel = document.getElementById('cart-panel');
  panel.classList.contains('open') ? closeCart() : openCart();
};

window.openCart = () => {
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-overlay').classList.remove('hidden');
  document.getElementById('cart-panel').setAttribute('aria-hidden', 'false');
};

window.closeCart = () => {
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-overlay').classList.add('hidden');
  document.getElementById('cart-panel').setAttribute('aria-hidden', 'true');
};

// ── Order modal ────────────────────────────────────────────────────────────
window.openOrderModal = (viaWhatsApp) => {
  if (shopClosed || cart.length === 0) return;
  orderViaWhatsApp = !!viaWhatsApp;
  closeCart();
  showStep(1);
  const backdrop = document.getElementById('order-modal-backdrop');
  backdrop.classList.remove('hidden');
  backdrop.setAttribute('aria-hidden', 'false');
  clearStep1Errors();
  document.getElementById('field-customer-name').focus();
};

window.closeOrderModal = () => {
  document.getElementById('order-modal-backdrop').classList.add('hidden');
  document.getElementById('order-modal-backdrop').setAttribute('aria-hidden', 'true');
  ['field-customer-name', 'field-customer-whatsapp', 'field-customer-address'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  clearStep1Errors();
};

function showStep(step) {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`order-step-${n}`);
    el.classList.toggle('order-step', true);
    el.classList.toggle('hidden', n !== step);
    el.classList.toggle('active', n === step);
  });
  const titles = { 1: 'Place Order', 2: 'Order Summary', 3: 'Order Placed' };
  document.getElementById('order-modal-title').textContent = titles[step];
  renderModalFooter(step);
}

function renderModalFooter(step) {
  const footer = document.getElementById('order-modal-footer');
  if (step === 1) {
    footer.innerHTML = `
      <button onclick="closeOrderModal()" class="btn-secondary flex-1">Cancel</button>
      <button onclick="handleStep1Next()" class="btn-primary flex-[2]" id="step1-next-btn">Next →</button>`;
  } else if (step === 2) {
    const label = orderViaWhatsApp ? '📲 Confirm & WhatsApp' : 'Confirm Order';
    const cls   = orderViaWhatsApp ? 'btn-wa' : 'btn-primary';
    footer.innerHTML = `
      <button onclick="showStep(1)" class="btn-secondary flex-1">← Back</button>
      <button onclick="handleConfirmOrder()" class="${cls} flex-[2]" id="confirm-order-btn">${label}</button>`;
  } else {
    footer.innerHTML = `<button onclick="closeOrderModal()" class="btn-primary flex-1">Done</button>`;
  }
}

function clearStep1Errors() {
  ['customer-name', 'customer-whatsapp', 'customer-address'].forEach(f => {
    const err = document.getElementById(`err-${f}`);
    const inp = document.getElementById(`field-${f}`);
    if (err) err.textContent = '';
    if (inp) inp.classList.remove('invalid');
  });
}

window.handleStep1Next = () => {
  clearStep1Errors();
  const name     = document.getElementById('field-customer-name').value.trim();
  const whatsapp = document.getElementById('field-customer-whatsapp').value.trim();
  const address  = document.getElementById('field-customer-address').value.trim();
  const { valid, errors } = validateOrderForm({ customer_name: name, customer_whatsapp: whatsapp, customer_address: address });

  if (!valid) {
    if (errors.customer_name)    { document.getElementById('err-customer-name').textContent    = errors.customer_name;    document.getElementById('field-customer-name').classList.add('invalid'); }
    if (errors.customer_whatsapp){ document.getElementById('err-customer-whatsapp').textContent = errors.customer_whatsapp; document.getElementById('field-customer-whatsapp').classList.add('invalid'); }
    if (errors.customer_address) { document.getElementById('err-customer-address').textContent  = errors.customer_address;  document.getElementById('field-customer-address').classList.add('invalid'); }
    return;
  }

  pendingCustomer = { name, whatsapp, address };
  renderOrderSummary();
  showStep(2);
};

function renderOrderSummary() {
  document.getElementById('summary-items').innerHTML = cart.map(item => `
    <li class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 gap-3">
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-slate-800">${escapeHtml(item.name)}</div>
        <div class="text-xs text-slate-400 mt-0.5">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
      </div>
      <div class="font-bold text-teal-700 whitespace-nowrap">${formatPrice(item.price * item.quantity)}</div>
    </li>`).join('');
  document.getElementById('summary-total').textContent = formatPrice(calcTotal(cart));
  document.getElementById('summary-customer-details').innerHTML = `
    <p><strong class="text-slate-700">Name:</strong> ${escapeHtml(pendingCustomer.name)}</p>
    <p><strong class="text-slate-700">WhatsApp:</strong> ${escapeHtml(pendingCustomer.whatsapp)}</p>
    <p><strong class="text-slate-700">Address:</strong> ${escapeHtml(pendingCustomer.address)}</p>`;
}

window.handleConfirmOrder = async () => {
  const btn = document.getElementById('confirm-order-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Placing…'; }

  const orderData = {
    cart: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    total_price: calcTotal(cart),
    customer_name: pendingCustomer.name,
    customer_whatsapp: pendingCustomer.whatsapp,
    customer_address: pendingCustomer.address,
  };

  try {
    await API.placeOrder(orderData);
    cart = [];
    saveCart(cart);
    renderCart();
    if (orderViaWhatsApp) {
      const msg = buildWhatsAppMessage(orderData.cart, orderData.customer_name, orderData.customer_whatsapp, orderData.customer_address);
      window.open(buildWaMeUrl(shopWhatsApp, msg), '_blank');
    }
    showStep(3);
  } catch (err) {
    showError(err);
    if (btn) { btn.disabled = false; btn.innerHTML = orderViaWhatsApp ? '📲 Confirm & WhatsApp' : 'Confirm Order'; }
  }
};

// ── Pull-to-refresh ────────────────────────────────────────────────────────
function setupPullToRefresh() {
  let startY = 0, active = false;
  const PTR = 70;
  const ind = document.getElementById('ptr-indicator');

  document.addEventListener('touchstart', e => {
    if (window.scrollY === 0) { startY = e.touches[0].clientY; active = true; }
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!active) return;
    if (e.touches[0].clientY - startY > PTR) {
      ind.style.maxHeight = '48px';
      ind.style.padding = '12px 0';
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!active) return;
    active = false;
    if (ind.style.maxHeight === '48px') {
      ind.style.maxHeight = '0';
      ind.style.padding = '0';
      API.getFoodItems().then(renderMenu).catch(showError);
    }
  });
}
