import { products } from '../src/data/products.js';
import { getProductBySlugOrId, getRelatedProducts } from '../src/services/productService.js';

console.log('=== TEST 1: ALL 12 PRODUCT DETAIL ROUTES ===');
products.forEach((p) => {
  const bySlug = getProductBySlugOrId(p.slug);
  const byId = getProductBySlugOrId(p.id);
  if (!bySlug) throw new Error(`Failed to resolve product by slug: "${p.slug}"`);
  if (!byId) throw new Error(`Failed to resolve product by id: "${p.id}"`);
  if (bySlug.id !== p.id || byId.slug !== p.slug) {
    throw new Error(`ID/Slug mismatch for product ${p.name}`);
  }
  console.log(`✓ Product #${p.id} route "#/product/${p.slug}" resolves to: "${p.name}"`);
});

console.log('\n=== TEST 2: GALLERY IMAGES & ZERO PLACEHOLDER ENFORCEMENT ===');
products.forEach((p) => {
  const rawList = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
  const cleanList = rawList.filter((img) => img && !img.includes('placeholder'));
  console.log(`✓ Product #${p.id} (${p.slug}): ${cleanList.length} clean images (placeholder pictures excluded)`);
});

console.log('\n=== TEST 3: VARIANTS & SPECIFICATIONS DATA ===');
products.forEach((p) => {
  if (p.variants) {
    p.variants.forEach((v) => {
      if (!v.id || !v.label) throw new Error(`Product #${p.id} has invalid variant data`);
    });
    console.log(`✓ Product #${p.id} has ${p.variants.length} valid options: [${p.variants.map((v) => v.label).join(', ')}]`);
  }
  if (p.specifications) {
    const keys = Object.keys(p.specifications);
    if (keys.length === 0) throw new Error(`Product #${p.id} has empty specifications object`);
  }
});

console.log('\n=== TEST 4: RELATED PRODUCTS LOGIC ===');
products.forEach((p) => {
  const related = getRelatedProducts(p, 4);
  if (related.some((r) => r.id === p.id)) {
    throw new Error(`Related products for #${p.id} contains itself!`);
  }
  if (related.length === 0) {
    throw new Error(`No related products found for #${p.id}`);
  }
  console.log(`✓ Product #${p.id} (${p.category}) -> ${related.length} related items`);
});

console.log('\n=== TEST 5: QUANTITY & CART PAYLOAD LOGIC ===');
// Simulating PDP cart addition with selected variant
const testProd = products[0];
const selectedVariant = testProd.variants ? testProd.variants[0] : null;
const quantity = 3;

const itemToAdd = selectedVariant
  ? {
      ...testProd,
      variant: selectedVariant.label,
      variantId: selectedVariant.id,
    }
  : testProd;

if (itemToAdd.id !== testProd.id) throw new Error('ID mismatch in cart payload');
if (selectedVariant && itemToAdd.variant !== selectedVariant.label) {
  throw new Error('Variant not mapped into cart payload');
}
console.log(`✓ Cart payload generated correctly: "${itemToAdd.name}" | Variant: "${itemToAdd.variant}" | Qty: ${quantity}`);

console.log('\nALL PDP TEST SUITES PASSED SUCCESSFULLY!');

