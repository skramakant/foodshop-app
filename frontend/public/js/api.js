/**
 * api.js — All communication with the GAS backend
 *
 * Set GAS_API_URL to your deployed GAS Web App URL.
 * All functions return Promises that resolve with the response data
 * or reject with an Error.
 */

// ── Configuration ─────────────────────────────────────────────────────────
// Both values injected at deploy time via GitHub Secrets — never hardcoded here
const GAS_API_URL = 'REPLACE_WITH_GAS_API_URL';
const GAS_API_KEY = 'REPLACE_WITH_YOUR_API_KEY';

// ── Core fetch helper ──────────────────────────────────────────────────────
async function gasRequest(action, payload = {}) {
  const body = JSON.stringify({ action, apiKey: GAS_API_KEY, ...payload });
  const res = await fetch(GAS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result !== undefined ? data.result : data;
}

// ── Shop ───────────────────────────────────────────────────────────────────
export const getShopMetadata   = ()     => gasRequest('getShopMetadata');
export const saveShopMetadata  = (data) => gasRequest('saveShopMetadata', { data });

// ── Food Items ─────────────────────────────────────────────────────────────
export const getFoodItems  = ()     => gasRequest('getFoodItems');
export const addFoodItem   = (item) => gasRequest('addFoodItem',  { item });
export const updateFoodItem= (item) => gasRequest('updateFoodItem',{ item });
export const deleteFoodItem= (id)   => gasRequest('deleteFoodItem',{ id });

// ── Orders ─────────────────────────────────────────────────────────────────
export const placeOrder              = (orderData) => gasRequest('placeOrder', { orderData });
export const getOrdersWithTodayCounts= ()          => gasRequest('getOrdersWithTodayCounts');
export const updateOrderStatus       = (orderId, status) => gasRequest('updateOrderStatus', { orderId, status });

// ── Users ──────────────────────────────────────────────────────────────────
export const getUsers = () => gasRequest('getUsers');

// ── Order tracking ─────────────────────────────────────────────────────────
export const getOrdersByPin = (whatsapp, pin) => gasRequest('getOrdersByPin', { whatsapp, pin });

// ── Auth ───────────────────────────────────────────────────────────────────
export const checkAdminAuth = (username, password) =>
  gasRequest('checkAdminAuth', { username, password });
