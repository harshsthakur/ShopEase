import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, CreditCard, ShieldCheck, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';

const Checkout = ({ setPage }) => {
  const { user, getAuthHeader } = useAuth();
  const { cartItems, subtotal, tax, shipping, total, clearCart } = useCart();

  // Form Fields State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91',
    address: '',
    city: '',
    postalCode: '',
    country: 'India'
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  // Gift Box States
  const [isGift, setIsGift] = useState(false);
  const [giftDetails, setGiftDetails] = useState({
    recipientName: '',
    recipientPhone: '+91',
    deliveryAddress: '',
    giftMessage: '',
    deliveryDate: '',
    giftWrapping: false,
    greetingCard: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGiftPhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+91')) {
      const digits = val.replace(/\D/g, '');
      let suffix = digits;
      if (digits.startsWith('91')) {
        suffix = digits.slice(2);
      }
      val = '+91' + suffix;
    }
    const rest = val.substring(3).replace(/\D/g, '');
    const limitedRest = rest.slice(0, 10);
    setGiftDetails({ ...giftDetails, recipientPhone: '+91' + limitedRest });
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    
    // Ensure it always starts with '+91'
    if (!val.startsWith('+91')) {
      const digits = val.replace(/\D/g, '');
      let suffix = digits;
      if (digits.startsWith('91')) {
        suffix = digits.slice(2);
      }
      val = '+91' + suffix;
    }
    
    const rest = val.substring(3).replace(/\D/g, '');
    const limitedRest = rest.slice(0, 10);
    setFormData({ ...formData, phone: '+91' + limitedRest });
  };

  const handleCardChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const finalTotal = total + (isGift && giftDetails.giftWrapping ? 50 : 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple fields check
    if (!formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      setError('Please fill in all shipping address fields.');
      setLoading(false);
      return;
    }

    // Phone validation
    const phoneDigits = formData.phone.substring(3);
    if (phoneDigits.length !== 10 || !/^\d{10}$/.test(phoneDigits)) {
      setError('Please enter a valid 10-digit phone number after +91.');
      setLoading(false);
      return;
    }

    // Gift validation
    if (isGift) {
      if (!giftDetails.recipientName || !giftDetails.recipientPhone || !giftDetails.deliveryAddress || !giftDetails.deliveryDate) {
        setError('Please fill in all recipient gifting fields.');
        setLoading(false);
        return;
      }
      const recPhoneDigits = giftDetails.recipientPhone.substring(3);
      if (recPhoneDigits.length !== 10 || !/^\d{10}$/.test(recPhoneDigits)) {
        setError('Please enter a valid 10-digit recipient phone number after +91.');
        setLoading(false);
        return;
      }
    }

    if (!cardData.cardNumber || !cardData.cardExpiry || !cardData.cardCvc) {
      setError('Please fill in all card payment details.');
      setLoading(false);
      return;
    }

    try {
      const orderItems = cartItems.map(item => ({
        product: item.product,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        isSubscription: item.isSubscription || false,
        planId: item.planId || null,
        products: item.products || null
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          orderItems,
          shippingAddress: formData,
          totalPrice: finalTotal,
          giftDetails: isGift ? { isGift: true, ...giftDetails } : { isGift: false }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      // Success
      setOrderSuccess(data);
      clearCart(); // empty cart
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If order is completed successfully, show receipt screen
  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center space-y-6 animate-fade-in">
        <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-9 w-9 text-emerald-600 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Order Placed Successfully!</h2>
          <p className="text-slate-500 text-sm">
            Thank you for shopping with ShopEase. Your order has been processed and is preparing for dispatch.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-left text-xs space-y-2 text-slate-600">
          <div><span className="font-semibold text-slate-800">Order ID:</span> {orderSuccess._id}</div>
          <div><span className="font-semibold text-slate-800">Recipient:</span> {orderSuccess.shippingAddress.name}</div>
          <div><span className="font-semibold text-slate-800">Deliver To:</span> {orderSuccess.shippingAddress.address}, {orderSuccess.shippingAddress.city}</div>
          <div><span className="font-semibold text-slate-800">Total Charged:</span> ₹{orderSuccess.totalPrice.toFixed(2)}</div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => setPage('orders')}
            className="btn-primary w-full py-2.5"
          >
            Track Order Status
          </button>
          <button
            onClick={() => setPage('products')}
            className="btn-secondary w-full py-2.5"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty during direct url checkout, redirect back
  if (cartItems.length === 0) {
    setTimeout(() => setPage('cart'), 0);
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back to Cart link */}
      <div>
        <button
          onClick={() => setPage('cart')}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold cursor-pointer outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Cart</span>
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Shipping Address */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
              <span className="h-6 w-6 bg-brand-50 text-brand-600 text-xs font-extrabold rounded-full flex items-center justify-center mr-2.5">1</span>
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="input-field py-2 px-3 text-sm font-semibold"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="India">India</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Line</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Street Address, Apt #, Suite"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleFormChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleFormChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 1.5: Send as Gift Toggle and Fields */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Gift className="h-5.5 w-5.5 text-brand-600 mr-2.5" />
                Send as Premium Gift Box
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            {isGift && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs font-semibold text-slate-650">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Recipient Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter recipient's name"
                    value={giftDetails.recipientName}
                    onChange={(e) => setGiftDetails({ ...giftDetails, recipientName: e.target.value })}
                    className="input-field py-2 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Recipient Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91XXXXXXXXXX"
                    value={giftDetails.recipientPhone}
                    onChange={handleGiftPhoneChange}
                    className="input-field py-2 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Delivery Address</label>
                  <input 
                    type="text" 
                    placeholder="Recipient's complete delivery address"
                    value={giftDetails.deliveryAddress}
                    onChange={(e) => setGiftDetails({ ...giftDetails, deliveryAddress: e.target.value })}
                    className="input-field py-2 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Delivery Date</label>
                  <input 
                    type="date" 
                    value={giftDetails.deliveryDate}
                    onChange={(e) => setGiftDetails({ ...giftDetails, deliveryDate: e.target.value })}
                    className="input-field py-2 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Custom Gift Message</label>
                  <textarea 
                    rows="2" 
                    placeholder="Wishing you a very happy celebration! Enjoy these wellness treats."
                    value={giftDetails.giftMessage}
                    onChange={(e) => setGiftDetails({ ...giftDetails, giftMessage: e.target.value })}
                    className="input-field py-2 px-3 text-sm font-medium"
                  />
                </div>

                <div className="flex flex-wrap gap-6 pt-2 font-bold text-xs text-slate-700 md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={giftDetails.giftWrapping}
                      onChange={(e) => setGiftDetails({ ...giftDetails, giftWrapping: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span>Premium Gift Wrapping (+₹50)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={giftDetails.greetingCard}
                      onChange={(e) => setGiftDetails({ ...giftDetails, greetingCard: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span>Include Festival Greeting Card (Free)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Mock Payment Details */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
              <span className="h-6 w-6 bg-brand-50 text-brand-600 text-xs font-extrabold rounded-full flex items-center justify-center mr-2.5">2</span>
              Payment Details (Mock)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <CreditCard className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Credit Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  required
                  placeholder="4111 2222 3333 4444"
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                <input
                  type="text"
                  name="cardExpiry"
                  required
                  placeholder="MM/YY"
                  value={cardData.cardExpiry}
                  onChange={handleCardChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CVC Security Code</label>
                <input
                  type="password"
                  name="cardCvc"
                  required
                  maxLength="4"
                  placeholder="•••"
                  value={cardData.cardCvc}
                  onChange={handleCardChange}
                  className="input-field py-2 px-3 text-sm"
                />
              </div>
              <div className="flex items-center text-xs font-medium text-slate-400 md:col-span-3 pt-2">
                <ShieldCheck className="h-4.5 w-4.5 mr-1 text-emerald-500" />
                This is a mock shop portal. Transactions are fully simulated.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              Order Review
            </h2>

            {/* Cart items summary */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-xs font-bold">{item.qty}x</span>
                    <span className="text-slate-700 font-medium truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals Grid */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Sales Tax</span>
                <span className="font-semibold text-slate-800">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              {isGift && giftDetails.giftWrapping && (
                <div className="flex justify-between text-slate-500">
                  <span>Gift Wrapping fee</span>
                  <span className="font-semibold text-slate-800">₹50.00</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg border border-rose-100 font-medium">
                {error}
              </div>
            )}

            {/* Order Submission Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing...' : 'Authorize & Pay'}</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
