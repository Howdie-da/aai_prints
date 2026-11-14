import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  ShoppingBag,
  Tag,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  User,
  Copy,
  Check,
  Printer,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './CheckoutPage.css';

// Indian States and Union Territories list
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

// Helper to safely parse numeric price
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export default function CheckoutPage({
  onNavigateHome,
  onNavigateShop,
  onNavigateCart,
  onSelectProduct,
}) {
  const { cart, cartCount, clearCart } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  // ── Form State ──
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    apartment: user?.addresses?.[0]?.apartment || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'Maharashtra',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    orderNotes: '',
    saveAddress: false,
  });

  // Pre-fill user data when user logs in / profile loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.addresses?.[0]?.street || '',
        apartment: prev.apartment || user.addresses?.[0]?.apartment || '',
        city: prev.city || user.addresses?.[0]?.city || '',
        state: prev.state || user.addresses?.[0]?.state || 'Maharashtra',
        postalCode: prev.postalCode || user.addresses?.[0]?.postalCode || '',
      }));
    }
  }, [user]);

  // Delivery options: 'standard' | 'express'
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Payment method: 'cod' | 'online'
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Form field errors
  const [errors, setErrors] = useState({});

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Submission / Loading / Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isCopiedOrderNum, setIsCopiedOrderNum] = useState(false);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = parsePrice(item.price);
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }, [cart]);

  // Discount calculation
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'flat') {
      return Math.min(subtotal, appliedCoupon.amount);
    }
    if (appliedCoupon.type === 'percentage') {
      const calc = (subtotal * appliedCoupon.percent) / 100;
      return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // Shipping fee calculation
  const shippingFee = useMemo(() => {
    if (shippingMethod === 'express') return 99;
    return subtotal >= 500 ? 0 : 49;
  }, [shippingMethod, subtotal]);

  // Final total
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Quick Address Selector (if user has saved addresses)
  const handleSelectSavedAddress = (addr) => {
    setFormData((prev) => ({
      ...prev,
      street: addr.street || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || prev.state,
      postalCode: addr.postalCode || '',
    }));
  };

  // Validate form before order placement
  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = '10-digit mobile number is required';
    } else {
      const cleanedPhone = formData.phone.replace(/[^0-9]/g, '');
      if (cleanedPhone.length < 10) {
        errs.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    if (!formData.street.trim()) errs.street = 'Street address / House No. is required';
    if (!formData.city.trim()) errs.city = 'City / District is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.postalCode.trim()) {
      errs.postalCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode.trim().replace(/\s/g, ''))) {
      errs.postalCode = 'Please enter a valid 6-digit Indian PIN code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Coupon Application
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      // 1. Check local pre-configured promo coupons
      if (code === 'AAI100') {
        if (subtotal < 499) {
          setCouponError('Coupon AAI100 requires a minimum order of ₹499');
          setIsApplyingCoupon(false);
          return;
        }
        setAppliedCoupon({ code: 'AAI100', type: 'flat', amount: 100 });
        setCouponInput('');
        setIsApplyingCoupon(false);
        return;
      }

      if (code === 'WELCOME10') {
        setAppliedCoupon({ code: 'WELCOME10', type: 'percentage', percent: 10, maxDiscount: 300 });
        setCouponInput('');
        setIsApplyingCoupon(false);
        return;
      }

      if (code === 'FESTIVE15') {
        if (subtotal < 999) {
          setCouponError('Coupon FESTIVE15 requires a minimum order of ₹999');
          setIsApplyingCoupon(false);
          return;
        }
        setAppliedCoupon({ code: 'FESTIVE15', type: 'percentage', percent: 15, maxDiscount: 500 });
        setCouponInput('');
        setIsApplyingCoupon(false);
        return;
      }

      // 2. Try validating via backend API if available
      try {
        const previewRes = await api.post('/orders/checkout-preview', { couponCode: code });
        if (previewRes?.data?.pricing?.discount > 0) {
          setAppliedCoupon({
            code,
            type: 'flat',
            amount: previewRes.data.pricing.discount,
          });
          setCouponInput('');
          setIsApplyingCoupon(false);
          return;
        }
      } catch (backendErr) {
        // Fallback message
      }

      setCouponError('Invalid or expired coupon code. Try AAI100 or WELCOME10.');
    } catch {
      setCouponError('Could not apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Place Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const errorEl = document.querySelector(`[name="${firstErrorKey}"]`);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorEl.focus();
      }
      return;
    }

    if (cart.length === 0) return;

    setIsSubmitting(true);

    const generatedOrderNumber = `AAI-${Date.now().toString().slice(-6)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const orderPayload = {
      orderNumber: generatedOrderNumber,
      orderDate: new Date().toISOString(),
      items: cart.map((item) => ({
        id: item.id || item._id,
        name: item.name,
        price: parsePrice(item.price),
        quantity: item.quantity || 1,
        image: item.image,
        variantName: item.selectedVariant?.label || item.variantName || null,
      })),
      shippingAddress: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        street: formData.street.trim(),
        apartment: formData.apartment.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
      },
      shippingMethod,
      paymentMethod,
      orderNotes: formData.orderNotes.trim(),
      pricing: {
        subtotal,
        discount,
        couponCode: appliedCoupon?.code || null,
        shippingFee,
        total: finalTotal,
      },
      status: paymentMethod === 'cod' ? 'confirmed' : 'paid',
    };

    try {
      // Attempt backend order creation if authenticated
      if (isAuthenticated) {
        try {
          const res = await api.post('/orders', {
            shippingAddress: orderPayload.shippingAddress,
            couponCode: appliedCoupon?.code || null,
            paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
          });
          if (res?.data?.order?.orderNumber) {
            orderPayload.orderNumber = res.data.order.orderNumber;
          }
        } catch (apiErr) {
          console.warn('[Checkout] Backend sync optional fallback:', apiErr.message);
        }
      }

      // Persist order in local history storage
      try {
        const existingOrders = JSON.parse(localStorage.getItem('aaiprints_orders') || '[]');
        const updatedOrders = [orderPayload, ...existingOrders];
        localStorage.setItem('aaiprints_orders', JSON.stringify(updatedOrders));
      } catch (storageErr) {
        console.error('Failed to save order to localStorage:', storageErr);
      }

      // Clear shopping cart
      clearCart();

      // Show Confirmation Screen
      setConfirmedOrder(orderPayload);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('[Checkout Error]', err);
      alert('There was an issue processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Order Number Helper
  const handleCopyOrderNumber = () => {
    if (confirmedOrder?.orderNumber) {
      navigator.clipboard.writeText(confirmedOrder.orderNumber);
      setIsCopiedOrderNum(true);
      setTimeout(() => setIsCopiedOrderNum(false), 2000);
    }
  };

  // Format delivery estimated date (+4 business days)
  const estimatedDeliveryDate = useMemo(() => {
    const now = new Date();
    const daysToAdd = shippingMethod === 'express' ? 2 : 4;
    now.setDate(now.getDate() + daysToAdd);
    return now.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [shippingMethod]);

  // ════════════════════════════════════════════════════════════════
  // 1. ORDER CONFIRMATION / SUCCESS VIEW
  // ════════════════════════════════════════════════════════════════
  if (confirmedOrder) {
    return (
      <div className="checkout-page checkout-page--success">
        <div className="checkout-container">
          <motion.div
            className="checkout-success-card"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Success Icon */}
            <div className="success-badge-wrap">
              <div className="success-badge-halo" />
              <div className="success-badge-icon">
                <CheckCircle2 size={46} strokeWidth={2.4} />
              </div>
            </div>

            <span className="success-eyebrow">ORDER CONFIRMED</span>
            <h1 className="success-title">Thank You for Your Order!</h1>
            <p className="success-subtitle">
              Your  piece from Ananta Art International is being carefully prepared for secure transit.
            </p>

            {/* Order Reference Box */}
            <div className="success-order-ref-box">
              <div className="success-order-num-group">
                <span className="success-ref-label">Order Reference:</span>
                <span className="success-ref-code">{confirmedOrder.orderNumber}</span>
                <button
                  type="button"
                  className="success-copy-btn"
                  onClick={handleCopyOrderNumber}
                  title="Copy Order ID"
                >
                  {isCopiedOrderNum ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopiedOrderNum ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="success-eta-group">
                <Truck size={17} className="success-eta-icon" />
                <span>
                  Estimated Delivery by <strong>{estimatedDeliveryDate}</strong>
                </span>
              </div>
            </div>

            {/* Order Summary Grid */}
            <div className="success-details-grid">
              {/* Shipping Address Recap */}
              <div className="success-detail-card">
                <h3 className="success-detail-heading">
                  <MapPin size={16} />
                  <span>Delivery Address</span>
                </h3>
                <p className="success-detail-name">
                  <strong>{confirmedOrder.shippingAddress.fullName}</strong>
                </p>
                <p className="success-detail-text">{confirmedOrder.shippingAddress.street}</p>
                {confirmedOrder.shippingAddress.apartment && (
                  <p className="success-detail-text">{confirmedOrder.shippingAddress.apartment}</p>
                )}
                <p className="success-detail-text">
                  {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} –{' '}
                  {confirmedOrder.shippingAddress.postalCode}
                </p>
                <p className="success-detail-contact">
                  <Phone size={13} /> {confirmedOrder.shippingAddress.phone}
                </p>
                <p className="success-detail-contact">
                  <Mail size={13} /> {confirmedOrder.shippingAddress.email}
                </p>
              </div>

              {/* Payment & Method Recap */}
              <div className="success-detail-card">
                <h3 className="success-detail-heading">
                  <CreditCard size={16} />
                  <span>Payment &amp; Delivery</span>
                </h3>
                <div className="success-keyval">
                  <span>Payment Mode:</span>
                  <strong>
                    {confirmedOrder.paymentMethod === 'cod'
                      ? 'Cash on Delivery (Pay at Doorstep)'
                      : 'Online / UPI Payment'}
                  </strong>
                </div>
                <div className="success-keyval">
                  <span>Delivery Mode:</span>
                  <strong>
                    {confirmedOrder.shippingMethod === 'express'
                      ? 'Express Courier (1–2 Days)'
                      : 'Standard Safe Delivery'}
                  </strong>
                </div>
                <div className="success-keyval">
                  <span>Subtotal:</span>
                  <span>₹{confirmedOrder.pricing.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {confirmedOrder.pricing.discount > 0 && (
                  <div className="success-keyval success-keyval--discount">
                    <span>Discount ({confirmedOrder.pricing.couponCode}):</span>
                    <span>−₹{confirmedOrder.pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="success-keyval">
                  <span>Shipping:</span>
                  <span>
                    {confirmedOrder.pricing.shippingFee === 0
                      ? 'FREE'
                      : `₹${confirmedOrder.pricing.shippingFee}`}
                  </span>
                </div>
                <div className="success-keyval success-keyval--total">
                  <span>Total Amount:</span>
                  <strong>₹{confirmedOrder.pricing.total.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="success-items-list-wrap">
              <h3 className="success-items-heading">Items in this Order ({confirmedOrder.items.length})</h3>
              <div className="success-items-list">
                {confirmedOrder.items.map((it, idx) => (
                  <div key={idx} className="success-item-row">
                    <div className="success-item-img-wrap">
                      {it.image ? (
                        <img src={it.image} alt={it.name} className="success-item-img" />
                      ) : (
                        <div className="success-item-img-empty">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                    </div>
                    <div className="success-item-info">
                      <h4 className="success-item-name">{it.name}</h4>
                      {it.variantName && (
                        <span className="success-item-variant">Variant: {it.variantName}</span>
                      )}
                      <span className="success-item-qty">Quantity: {it.quantity}</span>
                    </div>
                    <div className="success-item-price">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assurance Strip */}
            <div className="success-assurance-strip">
              <span>✦ Real-Time SMS &amp; WhatsApp Updates</span>
              <span>✦ Damage-Free Transit Packaging</span>
              <span>✦ 7-Day Easy Replacement</span>
            </div>

            {/* Action Buttons */}
            <div className="success-actions">
              <button
                type="button"
                className="success-btn-primary"
                onClick={onNavigateShop}
              >
                <span>Continue Shopping</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="success-btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // 2. EMPTY CART VIEW
  // ════════════════════════════════════════════════════════════════
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <div className="checkout-container">
            <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
              Home
            </button>
            <span className="breadcrumb-separator">/</span>
            <button type="button" className="breadcrumb-link" onClick={onNavigateCart}>
              Cart
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Checkout</span>
          </div>
        </nav>

        <div className="checkout-container">
          <div className="checkout-empty-card">
            <div className="checkout-empty-icon">
              <ShoppingBag size={46} strokeWidth={1.5} />
            </div>
            <h1 className="checkout-empty-title">Your Cart is Empty</h1>
            <p className="checkout-empty-desc">
              You do not have any items in your cart to checkout. Browse our  spiritual idols, illuminated frames, and wall decor to start shopping.
            </p>
            <button
              type="button"
              className="checkout-empty-btn"
              onClick={onNavigateShop}
            >
              <span>Explore Collections</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // 3. MAIN CHECKOUT FORM & SUMMARY VIEW
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="checkout-page">
      {/* ── Breadcrumb ── */}
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <div className="checkout-container">
          <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          <button type="button" className="breadcrumb-link" onClick={onNavigateCart}>
            Cart
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Secure Checkout</span>
        </div>
      </nav>

      <div className="checkout-container">
        {/* Page Heading & Security Badge */}
        <header className="checkout-header">
          <div className="checkout-header-title-box">
            <button
              type="button"
              className="checkout-back-link"
              onClick={onNavigateCart}
              title="Return to Cart"
            >
              <ArrowLeft size={16} />
              <span>Return to Cart</span>
            </button>
            <h1 className="checkout-title">Express Secure Checkout</h1>
          </div>
          <div className="checkout-security-pill">
            <Lock size={14} />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </header>

        {/* Two-Column Checkout Layout */}
        <div className="checkout-layout">
          {/* ══════════════════════════════════════════
              LEFT COLUMN: Form Inputs
             ══════════════════════════════════════════ */}
          <div className="checkout-form-column">
            <form onSubmit={handlePlaceOrder} noValidate>
              {/* ── Step 1: Contact Information ── */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <div className="checkout-step-num">1</div>
                  <div className="checkout-step-title-box">
                    <h2 className="checkout-step-title">Contact Information</h2>
                    <span className="checkout-step-sub">
                      We'll send your invoice and delivery updates here
                    </span>
                  </div>
                </div>

                <div className="checkout-fields-grid checkout-fields-grid--2col">
                  {/* Email */}
                  <div className={`checkout-field ${errors.email ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-email">
                      <Mail size={13} />
                      <span>Email Address *</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <span className="checkout-error-msg">
                        <AlertCircle size={12} /> {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className={`checkout-field ${errors.phone ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-phone">
                      <Phone size={13} />
                      <span>Mobile Number *</span>
                    </label>
                    <div className="checkout-phone-input-wrap">
                      <span className="checkout-phone-prefix">+91</span>
                      <input
                        id="checkout-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        maxLength={12}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && (
                      <span className="checkout-error-msg">
                        <AlertCircle size={12} /> {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Step 2: Shipping Address ── */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <div className="checkout-step-num">2</div>
                  <div className="checkout-step-title-box">
                    <h2 className="checkout-step-title">Delivery Address</h2>
                    <span className="checkout-step-sub">
                      Where should we deliver your  piece?
                    </span>
                  </div>
                </div>

                {/* Saved Address Quick Selector (if user has saved addresses) */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="checkout-saved-addresses-box">
                    <span className="checkout-saved-title">Saved Delivery Addresses:</span>
                    <div className="checkout-saved-chips">
                      {user.addresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="checkout-saved-chip"
                          onClick={() => handleSelectSavedAddress(addr)}
                        >
                          <MapPin size={12} />
                          <span>
                            {addr.street}, {addr.city} ({addr.postalCode})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="checkout-fields-grid">
                  {/* Full Name */}
                  <div className={`checkout-field ${errors.fullName ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-name">
                      <User size={13} />
                      <span>Full Name *</span>
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Sharma"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <span className="checkout-error-msg">
                        <AlertCircle size={12} /> {errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className={`checkout-field ${errors.street ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-street">
                      <MapPin size={13} />
                      <span>Flat / House No. &amp; Street Address *</span>
                    </label>
                    <input
                      id="checkout-street"
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="House/Flat No., Building Name, Road"
                      autoComplete="street-address"
                    />
                    {errors.street && (
                      <span className="checkout-error-msg">
                        <AlertCircle size={12} /> {errors.street}
                      </span>
                    )}
                  </div>

                  {/* Apartment / Landmark (Optional) */}
                  <div className="checkout-field">
                    <label htmlFor="checkout-apt">
                      <span>Apartment, Suite, Landmark (Optional)</span>
                    </label>
                    <input
                      id="checkout-apt"
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="Near Temple / Opposite Park / 4th Floor"
                    />
                  </div>

                  {/* City, State & PIN Code in 3 Columns */}
                  <div className="checkout-fields-grid checkout-fields-grid--3col">
                    {/* City */}
                    <div className={`checkout-field ${errors.city ? 'has-error' : ''}`}>
                      <label htmlFor="checkout-city">
                        <span>City / District *</span>
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai, Pune, Delhi..."
                        autoComplete="address-level2"
                      />
                      {errors.city && (
                        <span className="checkout-error-msg">
                          <AlertCircle size={12} /> {errors.city}
                        </span>
                      )}
                    </div>

                    {/* State */}
                    <div className={`checkout-field ${errors.state ? 'has-error' : ''}`}>
                      <label htmlFor="checkout-state">
                        <span>State *</span>
                      </label>
                      <select
                        id="checkout-state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        autoComplete="address-level1"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <span className="checkout-error-msg">
                          <AlertCircle size={12} /> {errors.state}
                        </span>
                      )}
                    </div>

                    {/* PIN Code */}
                    <div className={`checkout-field ${errors.postalCode ? 'has-error' : ''}`}>
                      <label htmlFor="checkout-pincode">
                        <span>PIN Code *</span>
                      </label>
                      <input
                        id="checkout-pincode"
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="400001"
                        maxLength={6}
                        autoComplete="postal-code"
                      />
                      {errors.postalCode && (
                        <span className="checkout-error-msg">
                          <AlertCircle size={12} /> {errors.postalCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Save address checkbox (if authenticated) */}
                  {isAuthenticated && (
                    <label className="checkout-checkbox-label">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleChange}
                      />
                      <span>Save this address to my profile for fast 1-click checkout</span>
                    </label>
                  )}
                </div>
              </section>

              {/* ── Step 3: Delivery Options ── */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <div className="checkout-step-num">3</div>
                  <div className="checkout-step-title-box">
                    <h2 className="checkout-step-title">Shipping &amp; Delivery Option</h2>
                    <span className="checkout-step-sub">
                      All artworks ship with reinforced corner protectors and tamper-evident seals
                    </span>
                  </div>
                </div>

                <div className="checkout-radio-group">
                  {/* Standard Delivery */}
                  <label
                    className={`checkout-radio-card ${shippingMethod === 'standard' ? 'is-selected' : ''
                      }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                    />
                    <div className="checkout-radio-content">
                      <div className="checkout-radio-top">
                        <span className="checkout-radio-name">
                          <Truck size={16} />
                          <strong>Standard Safe Delivery (3–5 Business Days)</strong>
                        </span>
                        <span className="checkout-radio-price">
                          {subtotal >= 500 ? (
                            <strong className="text-free">FREE</strong>
                          ) : (
                            '₹49'
                          )}
                        </span>
                      </div>
                      <p className="checkout-radio-desc">
                        Full transit insurance included. Dispatches within 24 hours.
                      </p>
                    </div>
                  </label>

                  {/* Express Courier */}
                  <label
                    className={`checkout-radio-card ${shippingMethod === 'express' ? 'is-selected' : ''
                      }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                    />
                    <div className="checkout-radio-content">
                      <div className="checkout-radio-top">
                        <span className="checkout-radio-name">
                          <Sparkles size={16} />
                          <strong>Express Priority Courier (1–2 Business Days)</strong>
                        </span>
                        <span className="checkout-radio-price">
                          <strong>₹99</strong>
                        </span>
                      </div>
                      <p className="checkout-radio-desc">
                        Air-priority dispatch via BlueDart / Delhivery Express.
                      </p>
                    </div>
                  </label>
                </div>
              </section>

              {/* ── Step 4: Payment Method ── */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <div className="checkout-step-num">4</div>
                  <div className="checkout-step-title-box">
                    <h2 className="checkout-step-title">Payment Method</h2>
                    <span className="checkout-step-sub">
                      Choose your preferred payment method
                    </span>
                  </div>
                </div>

                <div className="checkout-radio-group">
                  {/* Cash on Delivery */}
                  <label
                    className={`checkout-radio-card ${paymentMethod === 'cod' ? 'is-selected' : ''
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="checkout-radio-content">
                      <div className="checkout-radio-top">
                        <span className="checkout-radio-name">
                          <ShoppingBag size={16} />
                          <strong>Cash on Delivery (Pay at Doorstep)</strong>
                        </span>
                        <span className="checkout-badge-pill">POPULAR</span>
                      </div>
                      <p className="checkout-radio-desc">
                        Pay in cash or scan UPI QR code directly with delivery agent upon arrival.
                      </p>
                    </div>
                  </label>

                  {/* UPI & Online Payment */}
                  <label
                    className={`checkout-radio-card ${paymentMethod === 'online' ? 'is-selected' : ''
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div className="checkout-radio-content">
                      <div className="checkout-radio-top">
                        <span className="checkout-radio-name">
                          <CreditCard size={16} />
                          <strong>Instant Online Payment (UPI / Cards / NetBanking)</strong>
                        </span>
                        <span className="checkout-badge-pill checkout-badge-pill--green">
                          INSTANT
                        </span>
                      </div>
                      <p className="checkout-radio-desc">
                        Google Pay, PhonePe, Paytm, BHIM, Credit/Debit Cards, NetBanking.
                      </p>
                      {/* Mini UPI Provider Badges */}
                      <div className="checkout-upi-icons-strip">
                        <span className="checkout-upi-pill">GPay</span>
                        <span className="checkout-upi-pill">PhonePe</span>
                        <span className="checkout-upi-pill">Paytm</span>
                        <span className="checkout-upi-pill">UPI QR</span>
                        <span className="checkout-upi-pill">Cards</span>
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* ── Step 5: Special Instructions / Order Notes (Optional) ── */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <div className="checkout-step-num">5</div>
                  <div className="checkout-step-title-box">
                    <h2 className="checkout-step-title">Order Notes / Dedication (Optional)</h2>
                    <span className="checkout-step-sub">
                      Any special delivery notes or devotional dedication?
                    </span>
                  </div>
                </div>

                <div className="checkout-field">
                  <textarea
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Please leave with security guard, or spiritual gift dedication note..."
                    maxLength={250}
                  />
                </div>
              </section>

              {/* Mobile CTA Placement */}
              <div className="checkout-mobile-cta-wrap">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="checkout-place-order-btn"
                >
                  <Lock size={16} />
                  <span>
                    {isSubmitting
                      ? 'PROCESSING ORDER...'
                      : `CONFIRM & PLACE ORDER • ₹${finalTotal.toLocaleString('en-IN')}`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN: Sticky Order Summary & Items
             ══════════════════════════════════════════ */}
          <aside className="checkout-summary-column">
            <div className="checkout-summary-card">
              <h2 className="checkout-summary-title">Order Summary ({cartCount})</h2>

              {/* Items List */}
              <div className="checkout-items-preview">
                {cart.map((item) => {
                  const unitPrice = parsePrice(item.price);
                  const qty = item.quantity || 1;
                  const itemTotal = unitPrice * qty;
                  const hasImage = Boolean(item.image && !item.image.includes('placeholder'));

                  return (
                    <div key={item.cartItemId || item.id} className="checkout-item-row">
                      <div className="checkout-item-thumb-wrap">
                        {hasImage ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="checkout-item-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <div className="checkout-item-thumb-empty">
                            <ShoppingBag size={18} />
                          </div>
                        )}
                        <span className="checkout-item-qty-badge">{qty}</span>
                      </div>

                      <div className="checkout-item-info">
                        <h4 className="checkout-item-title">{item.name}</h4>
                        {item.selectedVariant?.label && (
                          <span className="checkout-item-variant">
                            {item.selectedVariant.label}
                          </span>
                        )}
                        <span className="checkout-item-unit-price">
                          ₹{unitPrice.toLocaleString('en-IN')} each
                        </span>
                      </div>

                      <div className="checkout-item-total">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code / Coupon Section */}
              <div className="checkout-coupon-box">
                {appliedCoupon ? (
                  <div className="checkout-coupon-applied-pill">
                    <div className="checkout-coupon-pill-left">
                      <Tag size={15} />
                      <span>
                        Code <strong>{appliedCoupon.code}</strong> applied (−₹
                        {discount.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="checkout-coupon-remove-btn"
                      onClick={handleRemoveCoupon}
                      title="Remove Coupon"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="checkout-coupon-form">
                    <div className="checkout-coupon-input-wrap">
                      <Tag size={14} className="checkout-coupon-icon" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError('');
                        }}
                        placeholder="Discount code (try AAI100)"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="checkout-coupon-btn"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponError && (
                  <span className="checkout-coupon-error">
                    <AlertCircle size={12} /> {couponError}
                  </span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="checkout-breakdown">
                <div className="checkout-breakdown-row">
                  <span>Items Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="checkout-breakdown-row checkout-breakdown-row--discount">
                    <span>Promotional Savings</span>
                    <span>−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="checkout-breakdown-row">
                  <span>Shipping &amp; Handling</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong className="text-free">FREE</strong>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                {subtotal < 500 && shippingMethod === 'standard' && (
                  <p className="checkout-free-shipping-hint">
                    Add ₹{(500 - subtotal).toLocaleString('en-IN')} more to unlock{' '}
                    <strong>FREE Standard Shipping</strong>!
                  </p>
                )}

                <div className="checkout-breakdown-divider" />

                <div className="checkout-breakdown-row checkout-breakdown-row--total">
                  <span>Total Payable</span>
                  <strong>₹{finalTotal.toLocaleString('en-IN')}</strong>
                </div>

                <p className="checkout-tax-note">Inclusive of all GST &amp; applicable taxes</p>
              </div>

              {/* Desktop Place Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="checkout-place-order-btn"
              >
                <Lock size={16} />
                <span>
                  {isSubmitting
                    ? 'PROCESSING ORDER...'
                    : `PLACE ORDER • ₹${finalTotal.toLocaleString('en-IN')}`}
                </span>
              </button>

              {/* Trust Features */}
              <div className="checkout-trust-box">
                <div className="checkout-trust-item">
                  <ShieldCheck size={16} className="checkout-trust-icon" />
                  <span>100% Authentic  Artworks</span>
                </div>
                <div className="checkout-trust-item">
                  <Truck size={16} className="checkout-trust-icon" />
                  <span>Transit Damage Replacement Guarantee</span>
                </div>
                <div className="checkout-trust-item">
                  <HelpCircle size={16} className="checkout-trust-icon" />
                  <span>Customer Support: help@aaiprints.com</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
