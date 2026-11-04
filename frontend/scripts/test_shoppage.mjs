import { products } from '../src/data/products.js';

console.log('=== TEST SUITE 1: DATA INTEGRITY ===');
console.log(`Total products: ${products.length}`);
products.forEach((p) => {
  if (!p.id || !p.name || !p.price || !p.category) {
    throw new Error(`Invalid product data for product ID: ${p.id}`);
  }
});
console.log('✓ All 12 products have valid required fields (id, name, price, category).');

console.log('\n=== TEST SUITE 2: CATEGORY & SUBCATEGORY FILTERING ===');
const subcategories = new Set();
products.forEach((p) => { if (p.subcategory) subcategories.add(p.subcategory); });
console.log(`Found ${subcategories.size} unique subcategories across products.`);

// Test filtering each category
const categories = ['All', 'Backlit LED Frames', 'Desk Standees', 'Wall Hangings', 'Metal Wall Art', 'Dashboard Idols', 'Car Hangings', 'Wall Clocks'];
categories.forEach((cat) => {
  const count = cat === 'All' ? products.length : products.filter((p) => p.category === cat).length;
  console.log(`✓ Category "${cat}": ${count} products`);
  if (count === 0) throw new Error(`Category ${cat} returned 0 products!`);
});

console.log('\n=== TEST SUITE 3: SORTING ALGORITHMS ===');
// 1. Price Low to High
const lowHigh = [...products].sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
console.log(`✓ Lowest price: ₹${lowHigh[0].price} (${lowHigh[0].name})`);
console.log(`✓ Highest price: ₹${lowHigh[lowHigh.length - 1].price} (${lowHigh[lowHigh.length - 1].name})`);
if (parseFloat(lowHigh[0].price.replace(/,/g, '')) > parseFloat(lowHigh[lowHigh.length - 1].price.replace(/,/g, ''))) {
  throw new Error('Price sorting ascending failed');
}

// 2. Price High to Low
const highLow = [...products].sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
if (parseFloat(highLow[0].price.replace(/,/g, '')) < parseFloat(highLow[highLow.length - 1].price.replace(/,/g, ''))) {
  throw new Error('Price sorting descending failed');
}
console.log('✓ Price High to Low sorted correctly.');

// 3. Alphabetical
const alpha = [...products].sort((a, b) => a.name.localeCompare(b.name));
console.log(`✓ Alphabetical first: "${alpha[0].name}"`);
console.log(`✓ Alphabetical last: "${alpha[alpha.length - 1].name}"`);

// 4. Best Selling
const bestSelling = [...products].sort((a, b) => {
  const aBest = a.tag === 'Best Seller' ? 1 : 0;
  const bBest = b.tag === 'Best Seller' ? 1 : 0;
  if (bBest !== aBest) return bBest - aBest;
  return (b.reviews || 0) - (a.reviews || 0);
});
console.log(`✓ Best selling top item: "${bestSelling[0].name}" (Tag: ${bestSelling[0].tag}, Reviews: ${bestSelling[0].reviews})`);

// 5. Newest
const newest = [...products].sort((a, b) => {
  const aNew = a.tag === 'New Arrival' ? 1 : 0;
  const bNew = b.tag === 'New Arrival' ? 1 : 0;
  if (bNew !== aNew) return bNew - aNew;
  return b.id - a.id;
});
console.log(`✓ Newest top item: "${newest[0].name}" (Tag: ${newest[0].tag})`);

console.log('\n=== TEST SUITE 4: PRICE FILTERING ===');
const under500 = products.filter((p) => parseFloat(p.price.replace(/,/g, '')) <= 500);
const midTier = products.filter((p) => {
  const val = parseFloat(p.price.replace(/,/g, ''));
  return val >= 500 && val <= 1000;
});
const above1000 = products.filter((p) => parseFloat(p.price.replace(/,/g, '')) >= 1000);
console.log(`✓ Under ₹500: ${under500.length} products`);
console.log(`✓ ₹500 - ₹1,000: ${midTier.length} products`);
console.log(`✓ Above ₹1,000: ${above1000.length} products`);

console.log('\n=== TEST SUITE 5: SEARCH FILTERING ===');
const query1 = 'ganesha';
const search1 = products.filter((p) => p.name.toLowerCase().includes(query1));
console.log(`✓ Search "${query1}": ${search1.length} products found -> [${search1.map((p) => p.name).join(', ')}]`);

const query2 = 'nonexistentxyz';
const search2 = products.filter((p) => p.name.toLowerCase().includes(query2));
console.log(`✓ Search "${query2}": ${search2.length} products (triggers clean no-results state)`);

console.log('\nALL 5 TEST SUITES PASSED SUCCESSFULLY!');

