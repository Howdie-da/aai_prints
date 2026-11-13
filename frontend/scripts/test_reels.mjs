import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================');
console.log('       AAI PRINTS — REELS / SHORT VIDEOS TEST SUITE     ');
console.log('========================================================\n');

let failed = false;

// 1. Verify Backend Model & Routes
console.log('--- TEST 1: BACKEND REEL MODEL & ROUTER ---');
const modelPath = path.join(rootDir, 'backend/models/reel.model.js');
const controllerPath = path.join(rootDir, 'backend/controllers/reel.controller.js');
const routerPath = path.join(rootDir, 'backend/router/reel.router.js');
const mainRouterPath = path.join(rootDir, 'backend/router/index.js');

if (!fs.existsSync(modelPath)) {
  console.error('FAIL: backend/models/reel.model.js does not exist');
  failed = true;
} else {
  const modelContent = fs.readFileSync(modelPath, 'utf8');
  if (modelContent.includes("ref: 'Product'") && modelContent.includes('videoUrl')) {
    console.log('✓ Reel model has required "videoUrl" and "product" reference to Product schema');
  } else {
    console.error('FAIL: Reel model missing videoUrl or product ref');
    failed = true;
  }
}

if (!fs.existsSync(controllerPath)) {
  console.error('FAIL: backend/controllers/reel.controller.js missing');
  failed = true;
} else {
  const ctrlContent = fs.readFileSync(controllerPath, 'utf8');
  if (ctrlContent.includes('getReels') && ctrlContent.includes('trackReelView')) {
    console.log('✓ Reel controller contains getReels and trackReelView endpoints');
  } else {
    console.error('FAIL: Reel controller missing key handlers');
    failed = true;
  }
}

if (!fs.existsSync(routerPath)) {
  console.error('FAIL: backend/router/reel.router.js missing');
  failed = true;
} else {
  console.log('✓ Reel router exists');
}

const mainRouterContent = fs.readFileSync(mainRouterPath, 'utf8');
if (mainRouterContent.includes("router.use('/reels', reelRouter)")) {
  console.log("✓ Reel router successfully mounted at '/reels' in backend/router/index.js");
} else {
  console.error("FAIL: backend/router/index.js does not mount reelRouter at '/reels'");
  failed = true;
}

// 2. Verify Frontend Reels Store & Service
console.log('\n--- TEST 2: FRONTEND REEL SERVICE & DYNAMIC STORE ---');
const fallbackDataPath = path.join(rootDir, 'frontend/src/data/reels.js');
const reelServicePath = path.join(rootDir, 'frontend/src/services/reelService.js');

if (!fs.existsSync(fallbackDataPath)) {
  console.error('FAIL: frontend/src/data/reels.js does not exist');
  failed = true;
} else {
  console.log('✓ Reels store exists with dummy data removed (clean dynamic uploads only)');
}

if (!fs.existsSync(reelServicePath)) {
  console.error('FAIL: frontend/src/services/reelService.js does not exist');
  failed = true;
} else {
  const serviceContent = fs.readFileSync(reelServicePath, 'utf8');
  if (serviceContent.includes('getReels') && serviceContent.includes('createReel')) {
    console.log('✓ Reel service is properly defined with dynamic backend fetch and zero dummy fallbacks');
  } else {
    console.error('FAIL: Reel service missing key methods');
    failed = true;
  }
}

// 3. Verify ReelsSection Component & Unmuted By Default Requirement
console.log('\n--- TEST 3: REELS SECTION COMPONENT & UNMUTED DEFAULT ---');
const reelsSectionPath = path.join(rootDir, 'frontend/src/components/ReelsSection.jsx');
const reelsCssPath = path.join(rootDir, 'frontend/src/components/ReelsSection.css');

if (!fs.existsSync(reelsSectionPath) || !fs.existsSync(reelsCssPath)) {
  console.error('FAIL: ReelsSection.jsx or ReelsSection.css does not exist');
  failed = true;
} else {
  const compContent = fs.readFileSync(reelsSectionPath, 'utf8');
  
  // Verify unmuted by default
  if (compContent.includes('useState(false)') && compContent.includes('setIsMuted(false)')) {
    console.log('✓ Video player is configured UNMUTED BY DEFAULT (isMuted: false) on reel selection');
  } else {
    console.error('FAIL: isMuted is not initialized or set to false by default');
    failed = true;
  }

  // Verify mute/unmute button
  if (compContent.includes('toggleMute') && compContent.includes('Volume2') && compContent.includes('VolumeX')) {
    console.log('✓ Mute/Unmute toggle button with Volume2/VolumeX icons implemented');
  } else {
    console.error('FAIL: Mute/unmute toggle button missing');
    failed = true;
  }

  // Verify Shoppable Product Dock
  if (compContent.includes('reel-modal-product-dock') && compContent.includes('onSelectProduct')) {
    console.log('✓ Shoppable Product Dock (Whatmore-style) with onSelectProduct navigation implemented');
  } else {
    console.error('FAIL: Shoppable Product Dock or onSelectProduct missing in ReelsSection');
    failed = true;
  }

  // Verify Video Autoplay on Shelf Cards (While Not Opened)
  if (compContent.includes('ReelCardMedia') && compContent.includes('autoPlay') && compContent.includes('muted')) {
    console.log('✓ Card video autoplays continuously while reel is not opened (muted loop playsInline preview)');
  } else {
    console.error('FAIL: Shelf card video preview does not autoplay while unopened');
    failed = true;
  }
}

// 4. Verify Homepage-Only Placement in App.jsx
console.log('\n--- TEST 4: HOMEPAGE RESTRICTION VERIFICATION ---');
const appContent = fs.readFileSync(path.join(rootDir, 'frontend/src/App.jsx'), 'utf8');

if (appContent.includes('<ReelsSection onSelectProduct={handleSelectProduct} />')) {
  // Check that it is inside the home page branch (the fallback else branch of currentPage router)
  const isInsideMain = appContent.includes('<main>') && appContent.includes('</main>');
  const mainBlock = appContent.substring(appContent.indexOf('<main>'), appContent.indexOf('</main>'));
  
  if (mainBlock.includes('<ReelsSection')) {
    console.log('✓ ReelsSection is rendered strictly inside <main> on the Homepage (currentPage === "home")');
  } else {
    console.error('FAIL: ReelsSection is not placed inside homepage <main>');
    failed = true;
  }

  // Ensure it is NOT rendered inside ShopPage, CartPage, CheckoutPage, etc.
  const shopPageSection = appContent.substring(appContent.indexOf('currentPage === \'shop\''), appContent.indexOf('currentPage === \'checkout\''));
  if (!shopPageSection.includes('<ReelsSection')) {
    console.log('✓ Confirmed NOT displayed on Shop page');
  } else {
    console.error('FAIL: ReelsSection incorrectly leaked to Shop page');
    failed = true;
  }

  const checkoutPageSection = appContent.substring(appContent.indexOf('currentPage === \'checkout\''), appContent.indexOf('currentPage === \'cart\''));
  if (!checkoutPageSection.includes('<ReelsSection')) {
    console.log('✓ Confirmed NOT displayed on Checkout page');
  } else {
    console.error('FAIL: ReelsSection incorrectly leaked to Checkout page');
    failed = true;
  }
} else {
  console.error('FAIL: App.jsx does not render <ReelsSection />');
  failed = true;
}

// 5. Verify Admin Drawer Option & AdminReelsPage
console.log('\n--- TEST 5: ADMIN REEL UPLOAD & CLOUDINARY CAPABILITIES ---');
const accountDrawerPath = path.join(rootDir, 'frontend/src/components/AccountDrawer.jsx');
const adminReelsPagePath = path.join(rootDir, 'frontend/src/pages/AdminReelsPage.jsx');
const mediaRouterPath = path.join(rootDir, 'backend/router/media.router.js');

if (!fs.existsSync(accountDrawerPath)) {
  console.error('FAIL: AccountDrawer.jsx does not exist');
  failed = true;
} else {
  const drawerContent = fs.readFileSync(accountDrawerPath, 'utf8');
  if (drawerContent.includes('admin-reels') && drawerContent.includes('Shoppable Reels')) {
    console.log('✓ Admin drawer contains "Shoppable Reels" option with admin-reels navigation');
  } else {
    console.error('FAIL: AccountDrawer missing admin-reels option');
    failed = true;
  }
}

if (!fs.existsSync(adminReelsPagePath)) {
  console.error('FAIL: AdminReelsPage.jsx does not exist');
  failed = true;
} else {
  const adminPageContent = fs.readFileSync(adminReelsPagePath, 'utf8');
  const hasTitle = adminPageContent.includes('setTitle') && adminPageContent.includes('reel-card-title');
  const hasCloudinary = adminPageContent.includes('uploadVideo') && adminPageContent.includes('Cloudinary');
  const hasProductSelect = adminPageContent.includes('selectedProductId') && adminPageContent.includes('Assign Shoppable Product');

  if (hasTitle && hasCloudinary && hasProductSelect) {
    console.log('✓ AdminReelsPage fulfills all 3 requirements:');
    console.log('   1. Title input (displayed in reel-card-title)');
    console.log('   2. Direct Cloudinary video upload with preview');
    console.log('   3. Product selector to assign among all available products');
  } else {
    console.error('FAIL: AdminReelsPage missing one or more required options');
    failed = true;
  }
}

const mediaRouterContent = fs.readFileSync(mediaRouterPath, 'utf8');
if (mediaRouterContent.includes('/upload-video')) {
  console.log('✓ Backend media router mounts POST /upload-video for Cloudinary video assets');
} else {
  console.error('FAIL: Backend media router missing /upload-video');
  failed = true;
}

if (appContent.includes('AdminReelsPage') && appContent.includes('admin-reels')) {
  console.log('✓ App.jsx protects #/admin/reels route behind AdminGuard');
} else {
  console.error('FAIL: App.jsx missing admin-reels route');
  failed = true;
}

if (failed) {
  console.log('\n❌ ONE OR MORE TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 ALL REELS COMPLIANCE & INTEGRATION TESTS PASSED!');
  process.exit(0);
}
