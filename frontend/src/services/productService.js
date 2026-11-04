/**
 * ─────────────────────────────────────────────────────────────
 * Aai Prints — Product Service Layer & Architecture Abstraction
 * ─────────────────────────────────────────────────────────────
 * This service encapsulates all product catalogue queries, filtering,
 * searching, and relation logic for the React frontend.
 *
 * FOR BACKEND INTEGRATION:
 * When connecting real backend APIs or a headless CMS:
 * 1. Replace the local data lookups with your API endpoints (e.g. `fetch('/api/products')`).
 * 2. Keep the function signatures identical so the React components continue
 *    to function seamlessly without code changes.
 * 3. The async functions (`fetchAllProducts`, `fetchProductById`, etc.) are
 *    provided as drop-in async bridges.
 * ─────────────────────────────────────────────────────────────
 */

import {
  products as localProducts,
  categories as localCategories,
  devotionalProducts as localDevotional,
  wallAndCarProducts as localWallAndCar,
} from '../data/products.js';

/**
 * Helper to safely extract a numeric price from a price string (e.g. '1,299' -> 1299).
 * @param {string|number} price
 * @returns {number}
 */
export function parseNumericPrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Returns all products from catalogue.
 * @returns {Array<Object>} List of product objects
 */
export function getAllProducts() {
  return localProducts;
}

/**
 * Async bridge returning all products (ready for future fetch/axios replacement).
 * @returns {Promise<Array<Object>>}
 */
export async function fetchAllProducts() {
  return Promise.resolve(localProducts);
}

/**
 * Find product by numeric ID or string ID.
 * @param {number|string} id
 * @returns {Object|null}
 */
export function getProductById(id) {
  if (id == null) return null;
  const targetId = String(id).trim();
  return localProducts.find((p) => String(p.id) === targetId) || null;
}

/**
 * Async bridge for finding product by ID.
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchProductById(id) {
  return Promise.resolve(getProductById(id));
}

/**
 * Find product by its URL-friendly slug.
 * @param {string} slug
 * @returns {Object|null}
 */
export function getProductBySlug(slug) {
  if (!slug) return null;
  const targetSlug = String(slug).toLowerCase().trim();
  return localProducts.find((p) => p.slug && p.slug.toLowerCase() === targetSlug) || null;
}

/**
 * Lookup product by either URL slug or numeric ID.
 * @param {string|number} identifier
 * @returns {Object|null}
 */
export function getProductBySlugOrId(identifier) {
  if (identifier == null) return null;
  return getProductBySlug(identifier) || getProductById(identifier) || null;
}

/**
 * Returns products matching category.
 * @param {string} category
 * @returns {Array<Object>}
 */
export function getProductsByCategory(category) {
  if (!category || category === 'All') return localProducts;
  const target = category.toLowerCase().trim();
  return localProducts.filter(
    (p) =>
      (p.category && p.category.toLowerCase() === target) ||
      (p.subcategory && p.subcategory.toLowerCase() === target)
  );
}

/**
 * Returns products matching subcategory.
 * @param {string} subcategory
 * @returns {Array<Object>}
 */
export function getProductsBySubcategory(subcategory) {
  if (!subcategory) return localProducts;
  const target = subcategory.toLowerCase().trim();
  return localProducts.filter(
    (p) => p.subcategory && p.subcategory.toLowerCase() === target
  );
}

/**
 * Case-insensitive search on product name, category, subcategory, and tag.
 * @param {string} query
 * @returns {Array<Object>}
 */
export function searchProducts(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return localProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q))
  );
}

/**
 * Returns related products, prioritizing same category while excluding current item.
 * Accepts either a product object or a productId.
 * @param {Object|number|string} productOrId
 * @param {number} limit
 * @returns {Array<Object>}
 */
export function getRelatedProducts(productOrId, limit = 4) {
  const current =
    typeof productOrId === 'object' && productOrId !== null
      ? productOrId
      : getProductById(productOrId);

  if (!current) return localProducts.slice(0, limit);

  const sameCategory = localProducts.filter(
    (p) => p.id !== current.id && p.category === current.category
  );
  const otherProducts = localProducts.filter(
    (p) => p.id !== current.id && p.category !== current.category
  );
  return [...sameCategory, ...otherProducts].slice(0, limit);
}

/**
 * Returns all unique categories available in the store.
 * @returns {Array<string>}
 */
export function getCategories() {
  return localCategories;
}

/**
 * Returns subcategories for a given category (or all if omitted).
 * @param {string} [category]
 * @returns {Array<string>}
 */
export function getSubcategories(category) {
  const pool = category && category !== 'All'
    ? getProductsByCategory(category)
    : localProducts;

  const subSet = new Set();
  pool.forEach((p) => {
    if (p.subcategory) subSet.add(p.subcategory);
  });
  return Array.from(subSet);
}

/**
 * Computes minimum and maximum prices across the entire product catalogue.
 * @returns {{ min: number, max: number }}
 */
export function getPriceBounds() {
  let min = Infinity;
  let max = -Infinity;

  localProducts.forEach((p) => {
    const val = parseNumericPrice(p.price);
    if (val < min) min = val;
    if (val > max) max = val;
  });

  return {
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
  };
}

/**
 * Curated product subsets for homepage sections.
 */
export function getDevotionalProducts() {
  return localDevotional;
}

export function getWallAndCarProducts() {
  return localWallAndCar;
}
