import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

const Cart = ({ setPage }) => {
  const { user } = useAuth();
  const { 
    cartItems, 
    changeQuantity, 
    removeFromCart, 
    subtotal, 
    tax, 
    shipping, 
    total 
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.toUpperCase() === 'SHOPEASE20') {
      setPromoDiscount(subtotal * 0.2); // 20% discount
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try SHOPEASE20');
    }
  };

  const finalTotal = total - promoDiscount;

  const handleCheckoutRedirect = () => {
    if (!user) {
      alert('Please sign in to proceed to checkout!');
      setPage('login');
    } else {
      setPage('checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center space-y-6 animate-fade-in">
        <div className="h-16 w-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8 text-brand-600" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Explore our categories and find premium products to add to your list.
          </p>
        </div>
        <button
          onClick={() => setPage('products')}
          className="btn-primary w-full py-2.5"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cart Items List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.product}
              className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow"
            >
              {/* Product Thumbnail */}
              <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-20 sm:h-24">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                      {item.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">Price: ₹{item.price?.toFixed(2)}</span>
                  </div>
                  
                  {/* Total Price for single line item */}
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  {/* Quantity adjustment panel */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-1">
                    <button
                      onClick={() => changeQuantity(item.product, item.qty - 1)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 text-sm font-semibold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-slate-700 text-xs">{item.qty}</span>
                    <button
                      onClick={() => changeQuantity(item.product, item.qty + 1)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 text-sm font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer outline-none"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Card (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-slate-800">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              
              {/* Shipping helper */}
              {shipping > 0 && (
                <div className="bg-brand-50/50 text-brand-700 text-[10px] font-bold uppercase tracking-wider p-2 rounded-lg text-center">
                  Add ₹{(100 - subtotal).toFixed(2)} more for FREE shipping!
                </div>
              )}

              {/* Promo code discount */}
              {promoApplied && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount (20%)</span>
                  <span>-₹{promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. SHOPEASE20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="input-field py-1.5 px-3 text-xs placeholder-slate-400 disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={promoApplied}
                  className="btn-secondary py-1.5 px-4 text-xs font-semibold disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs text-emerald-600 font-medium">SHOPEASE20 applied successfully!</p>
              )}
              {promoError && (
                <p className="text-xs text-rose-600 font-medium">{promoError}</p>
              )}
            </form>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckoutRedirect}
              className="w-full btn-primary py-2.5 flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider pt-2">
              <ShieldCheck className="h-4 w-4 mr-1 text-slate-400" />
              Secure Payment Processing
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
