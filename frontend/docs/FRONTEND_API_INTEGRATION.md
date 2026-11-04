# Aai Prints — Frontend API Integration & Data Architecture Guide

> **Audience**: Backend Development Team & API Integrators  
> **Purpose**: Technical blueprint detailing the frontend product data contracts, service abstraction layer, cart/wishlist data shapes, and integration points for transitioning from local datasets to live backend APIs.

---

## 1. Architecture Overview

The Aai Prints frontend is built with React 18 and Vite. To keep the UI components decoupled from data persistence, all product operations are centralized in a **Service Layer Abstraction** (`src/services/productService.js`).

```
┌────────────────────────────────────────────────────────┐
│                   React UI Components                  │
│ (ShopPage, ProductDetailPage, CartPage, WishlistPage)  │
└───────────────────────────▲────────────────────────────┘
                            │ Service Method Calls
┌───────────────────────────┴────────────────────────────┐
│         Product Service (src/services/productService.js)│
│  - Sync abstractions (current)                         │
│  - Async Promise bridges (ready for fetch/axios)        │
└───────────────────────────▲────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │ Current:                  │ Future API:
              │ src/data/products.js      │ e.g. GET /api/v1/products
              └───────────────────────────┘
```

---

## 2. Product Data Contract & Schema

Every product object in the catalogue strictly conforms to the following schema:

| Field | Type | Required | Description & Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `number` / `string` | **Yes** | Unique primary identifier (e.g. `1`, `2`, `3`). |
| `slug` | `string` | **Yes** | Unique URL-friendly slug used for routing (`#/product/:slug`). Must be lowercase alphanumeric with hyphens. |
| `name` | `string` | **Yes** | Full commercial product name. |
| `category` | `string` | **Yes** | Primary category matching filter and navigation systems (e.g. `'Backlit LED Frames'`, `'Wall Hangings'`, `'Dashboard Idols'`). |
| `subcategory` | `string` | No | Sub-classification tag (e.g. `'Spiritual Lighting'`, `'Wooden Models'`). |
| `price` | `string` / `number` | **Yes** | Current selling price (e.g. `'899'`). Numeric or clean string. |
| `originalPrice` | `string` / `number` | No | Authentic MSRP / pre-discount price (e.g. `'1,299'`). Strikethrough and discount badges only render when `originalPrice > price`. |
| `image` | `string` | **Yes** | Primary thumbnail image URL or path (e.g. `'/new-images/cat-backlit-led-frames.jpg'`). |
| `images` | `Array<string>` | **Yes** | Array of gallery image URLs. First entry corresponds to the primary image. |
| `availability` | `string` | **Yes** | Availability status: `'in_stock'` or `'out_of_stock'`. |
| `stockCount` | `number` | No | Real available stock count. |
| `rating` | `number` | No | Authentic review score between `1.0` and `5.0`. Displayed only when authentic. |
| `reviews` | `number` | No | Authentic total review count. |
| `tag` | `string` | No | Promotional ribbon badge: `'Best Seller'`, `'New Arrival'`, or `''`. |
| `variants` | `Array<Variant>` | No | List of product variants (size/finish). Empty array if no variants exist. |
| `description` | `string` | **Yes** | Rich product overview text. |
| `specifications`| `Object` | No | Key-value pairs detailing dimensions, material, finish, mounting, and care instructions. |

### Variant Object Structure:
```json
{
  "id": "v-1a",
  "label": "9 × 12 Inch (Warm White)",
  "inStock": true
}
```

### Complete Product Example:
```json
{
  "id": 1,
  "slug": "lord-ganesha-backlit-led-wooden-frame",
  "name": "Lord Ganesha Backlit LED Wooden Frame (9×12 Inch)",
  "category": "Backlit LED Frames",
  "subcategory": "Spiritual Lighting",
  "price": "899",
  "originalPrice": "1,299",
  "image": "/new-images/cat-backlit-led-frames.jpg",
  "images": [
    "/new-images/cat-backlit-led-frames.jpg",
    "/new-images/product-placeholder.jpg"
  ],
  "availability": "in_stock",
  "stockCount": 18,
  "rating": 4.8,
  "reviews": 14,
  "tag": "Best Seller",
  "variants": [
    { "id": "v-1a", "label": "9 × 12 Inch (Warm White)", "inStock": true },
    { "id": "v-1b", "label": "12 × 16 Inch (Warm White)", "inStock": true }
  ],
  "description": "Immerse your space in divine grace...",
  "specifications": {
    "dimensions": "9 × 12 × 1.25 Inches",
    "material": "Engineered Pine Wood & Acrylic Diffuser",
    "lighting": "12V Warm White LED Strip with 1.5m Power Adapter",
    "mounting": "Wall-mountable bracket pre-installed + Tabletop Kickstand",
    "care": "Wipe gently with a soft dry microfiber cloth.",
    "origin": "Proudly Handcrafted in India"
  }
}
```

---

## 3. Product Service API Methods

All UI components interact exclusively with [`src/services/productService.js`](file:///c:/Users/singh/ecocarry-clone/src/services/productService.js). The service exports the following standardized functions:

| Function | Parameters | Returns | Usage / Replacement Point |
| :--- | :--- | :--- | :--- |
| `getAllProducts()` | None | `Array<Product>` | Returns the complete catalogue. |
| `fetchAllProducts()` | None | `Promise<Array<Product>>` | Async bridge ready to be swapped with `fetch('/api/products')`. |
| `getProductById(id)` | `id: number|string` | `Product \| null` | Look up product by numeric or string ID. |
| `fetchProductById(id)`| `id: number|string` | `Promise<Product \| null>`| Async bridge for `fetch('/api/products/:id')`. |
| `getProductBySlug(slug)`| `slug: string` | `Product \| null` | Look up product by URL slug. |
| `getProductBySlugOrId(val)`| `val: string|number`| `Product \| null` | Flexible resolver supporting both slugs and IDs. |
| `getProductsByCategory(cat)`| `cat: string` | `Array<Product>` | Filter products by primary category name. |
| `getProductsBySubcategory(sub)`| `sub: string` | `Array<Product>` | Filter products by subcategory. |
| `searchProducts(query)` | `query: string` | `Array<Product>` | Case-insensitive search on name, category, subcategory, tag. |
| `getRelatedProducts(item, limit)`| `item: Object|id, limit: number`| `Array<Product>` | Returns related products in same category (excluding current). |
| `getCategories()` | None | `Array<string>` | Returns unique category list for menus and filters. |
| `getSubcategories(cat)` | `cat?: string` | `Array<string>` | Returns subcategories for a given category. |
| `getPriceBounds()` | None | `{ min: number, max: number }` | Returns actual catalogue price range for filter sliders. |
| `parseNumericPrice(price)` | `price: string|number` | `number` | Sanitizes string prices (e.g. `'1,499'` $\rightarrow$ `1499`). |

---

## 4. Cart & Wishlist State Contracts

Cart and Wishlist states are managed by [`src/context/WishlistContext.jsx`](file:///c:/Users/singh/ecocarry-clone/src/context/WishlistContext.jsx) and persisted in browser `localStorage`.

### Storage Keys:
- Wishlist: `aaiprints_wishlist`
- Cart: `aaiprints_cart`

### Cart Item Data Contract:
When a product is added to the cart, the item is stamped with a unique `cartItemId`:
```typescript
interface CartItem extends Product {
  cartItemId: string;   // Either `${product.id}-${variant.id}` or `${product.id}`
  quantity: number;     // Integer >= 1
  selectedVariant?: {
    id: string;
    label: string;
  };
}
```

### Key Functional Rules:
1. **Cart vs Wishlist Independence**: Removing an item from cart never mutates the wishlist, and removing from wishlist never mutates the cart.
2. **Variant Uniqueness**: Selecting variant `v-1a` and variant `v-1b` creates two distinct cart items (`1-v-1a` and `1-v-1b`), each with independent quantities.
3. **Data Sanitization**: Both states validate and filter malformed records on reload, ensuring invalid or partial data does not trigger frontend crashes.

---

## 5. Important Files for Backend Integrator

| File Path | Description |
| :--- | :--- |
| `src/services/productService.js` | **Main integration point**. Replace local dataset calls with API requests here. |
| `src/data/products.js` | Reference local product catalogue. Can serve as seed data for backend database. |
| `src/context/WishlistContext.jsx` | Cart and wishlist state manager. Can be wired to backend session / cart API. |
| `src/App.jsx` | Top-level hash router and drawer coordinator. |
| `src/pages/ShopPage.jsx` | Main catalogue page with category filtering and sorting. |
| `src/pages/ProductDetailPage.jsx` | PDP with gallery switcher, variant selector, and Add to Cart. |
| `src/pages/CartPage.jsx` | Dedicated cart view (`#/cart`) with order summary calculations. |
| `src/pages/WishlistPage.jsx` | Dedicated wishlist view (`#/wishlist`). |

---

## 6. How to Replace Local Data with Backend APIs

To connect an API endpoint (e.g. `https://api.aaiprints.com/v1/products`):

1. **Configure Environment Variable**:
   In `.env`:
   ```bash
   VITE_API_BASE_URL=https://api.aaiprints.com/v1
   ```

2. **Update `src/services/productService.js`**:
   Replace the local imports with API calls:
   ```javascript
   const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

   export async function fetchAllProducts() {
     const res = await fetch(`${API_BASE}/products`);
     if (!res.ok) throw new Error('Failed to fetch products');
     return await res.json();
   }

   export async function fetchProductById(id) {
     const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
     if (!res.ok) return null;
     return await res.json();
   }
   ```
3. Keep the return shape identical to the schema in **Section 2** to ensure zero frontend regression.

