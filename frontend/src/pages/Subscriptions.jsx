import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Leaf, Citrus, Sparkles, Cherry, Plus, Minus, ArrowRight, ShieldCheck, HeartHandshake, Calendar, MapPin, User, Phone, CheckCircle, Info } from 'lucide-react';

const Subscriptions = ({ setPage }) => {
  const { user, getAuthHeader, checkAuth } = useAuth();
  const { addToCart } = useCart();
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Box builder state
  const [selectedCustomItems, setSelectedCustomItems] = useState({}); // { productId: qty }

  const fetchPlansAndProducts = async () => {
    try {
      const plansRes = await fetch('/api/subscriptions/plans');
      const productsRes = await fetch('/api/products');
      
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (err) {
      console.error('Error loading subscriptions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansAndProducts();
  }, []);

  // Custom Box calculation helpers
  const getCustomBoxProducts = () => {
    return products.filter(p => selectedCustomItems[p._id] > 0).map(p => ({
      product: p._id,
      name: p.name,
      price: p.price,
      qty: selectedCustomItems[p._id],
      image: p.image
    }));
  };

  const getCustomBoxSummary = () => {
    const selectedItems = getCustomBoxProducts();
    const standardTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const savingsPercent = standardTotal > 0 ? 15 : 0;
    const finalPrice = Math.round(standardTotal * 0.85);
    
    return {
      selectedItems,
      standardTotal,
      savingsPercent,
      finalPrice
    };
  };

  const handleCustomQtyChange = (productId, delta) => {
    setSelectedCustomItems(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return {
        ...prev,
        [productId]: newQty
      };
    });
  };

  // Add subscription box to cart and navigate to cart page
  const handleOpenCheckout = (plan) => {
    if (!user) {
      alert('Please sign in to subscribe to a box.');
      setPage('login');
      return;
    }

    const boxProduct = {
      _id: plan.planId,
      name: plan.name,
      price: plan.price,
      image: plan.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      stock: 99999,
      isSubscription: true,
      planId: plan.planId,
      products: plan.products
    };

    addToCart(boxProduct, 1);
    alert(`${plan.name} has been added to your cart. Proceeding to Cart for payment.`);
    setPage('cart');
  };

  // Group products by category for custom box builder
  const groupedProducts = {
    amla: products.filter(p => p.category === 'amla'),
    mango: products.filter(p => p.category === 'mango'),
    modak: products.filter(p => p.category === 'modak'),
    'fruit-jam': products.filter(p => p.category === 'fruit-jam')
  };

  const customBoxMetrics = getCustomBoxSummary();

  // Color mapping utility
  const getColorClasses = (color) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          accent: 'bg-emerald-500',
          badge: 'text-emerald-600 bg-emerald-50 border-emerald-100'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          accent: 'bg-amber-500',
          badge: 'text-amber-600 bg-amber-50 border-amber-100'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-100',
          accent: 'bg-orange-500',
          badge: 'text-orange-600 bg-orange-50 border-orange-100'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-100',
          accent: 'bg-rose-500',
          badge: 'text-rose-600 bg-rose-50 border-rose-100'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-100',
          accent: 'bg-slate-500',
          badge: 'text-slate-600 bg-slate-50 border-slate-100'
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8 animate-fade-in">
      
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-900 z-0" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center space-x-1.5 bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-brand-500/20">
            <Calendar className="h-3.5 w-3.5" />
            <span>Monthly Curated Deliveries</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
            ShopEase Subscription Boxes
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Get curated monthly packages of authentic foods shipped directly to you. Subscribe to standard boxes or build your custom package to enjoy premium ingredients and savings!
          </p>
        </div>
      </section>

      {/* Subscription Plans Cards */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Curated Subscription Plans</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Handpicked collections to simplify your monthly healthy lifestyle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color);
            return (
              <div 
                key={plan._id} 
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Plan Image Header */}
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={plan.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"} 
                      alt={plan.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <span className={`absolute top-4 right-4 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors.badge}`}>
                      {plan.planId.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Plan Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                      {plan.name}
                    </h3>
                    
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-slate-400 text-xs font-semibold">/month</span>
                    </div>

                    {/* Includes */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inclusions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.includes.map((item, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg border border-slate-100">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan Benefits</span>
                      <ul className="text-xs text-slate-500 space-y-1.5">
                        {plan.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className={`h-1.5 w-1.5 rounded-full mr-2 flex-shrink-0 ${colors.accent}`} />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Plan Subscribe Action */}
                <div className="px-6 pb-6 pt-2">
                  <button 
                    onClick={() => handleOpenCheckout({
                      planId: plan.planId,
                      name: plan.name,
                      price: plan.price,
                      image: plan.image,
                      products: plan.includes.map(name => ({ name, qty: 1 }))
                    })}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all border outline-none cursor-pointer flex items-center justify-center space-x-2 ${colors.bg}`}
                  >
                    <span>Subscribe Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Custom Build-Your-Own Box Section */}
      <section className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-100 space-y-10">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center space-x-1.5 bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-orange-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Design Your Own Box</span>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Custom Subscription Box</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Choose your favorite foods from Amla, Mango, Modak, and Jams. Lock in a custom subscription and enjoy 15% discount savings!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Products Selector Grid (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Category 1: Amla */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Leaf className="h-4.5 w-4.5 text-emerald-500 mr-1.5" />
                Amla Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedProducts.amla.map((prod) => (
                  <div key={prod._id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img src={prod.image !== 'fff' ? prod.image : 'https://images.unsplash.com/photo-1546173152-318e7b25572c?auto=format&fit=crop&w=600&q=80'} alt={prod.name} className="h-12 w-12 object-cover rounded-lg border flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{prod.name}</h4>
                        <span className="text-[10px] text-slate-450 font-semibold">₹{prod.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <button onClick={() => handleCustomQtyChange(prod._id, -1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-bold text-slate-800 min-w-5 text-center">{selectedCustomItems[prod._id] || 0}</span>
                      <button onClick={() => handleCustomQtyChange(prod._id, 1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2: Mango */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Citrus className="h-4.5 w-4.5 text-amber-500 mr-1.5" />
                Mango Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedProducts.mango.map((prod) => (
                  <div key={prod._id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover rounded-lg border flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{prod.name}</h4>
                        <span className="text-[10px] text-slate-450 font-semibold">₹{prod.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <button onClick={() => handleCustomQtyChange(prod._id, -1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-bold text-slate-800 min-w-5 text-center">{selectedCustomItems[prod._id] || 0}</span>
                      <button onClick={() => handleCustomQtyChange(prod._id, 1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 3: Modak */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Sparkles className="h-4.5 w-4.5 text-orange-500 mr-1.5" />
                Modak Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedProducts.modak.map((prod) => (
                  <div key={prod._id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover rounded-lg border flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{prod.name}</h4>
                        <span className="text-[10px] text-slate-450 font-semibold">₹{prod.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <button onClick={() => handleCustomQtyChange(prod._id, -1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-bold text-slate-800 min-w-5 text-center">{selectedCustomItems[prod._id] || 0}</span>
                      <button onClick={() => handleCustomQtyChange(prod._id, 1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 4: Fruit Jam */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Cherry className="h-4.5 w-4.5 text-rose-500 mr-1.5" />
                Fruit Jam Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedProducts['fruit-jam'].map((prod) => (
                  <div key={prod._id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover rounded-lg border flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{prod.name}</h4>
                        <span className="text-[10px] text-slate-450 font-semibold">₹{prod.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <button onClick={() => handleCustomQtyChange(prod._id, -1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-bold text-slate-800 min-w-5 text-center">{selectedCustomItems[prod._id] || 0}</span>
                      <button onClick={() => handleCustomQtyChange(prod._id, 1)} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Custom Summary Receipt Dashboard (1/3 width) */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md h-fit space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center">
              <Sparkles className="h-4.5 w-4.5 mr-1.5 text-orange-500 animate-spin-slow" />
              Custom Box Summary
            </h3>

            {customBoxMetrics.selectedItems.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-450">
                <Info className="h-6.5 w-6.5 mx-auto text-slate-350" />
                <p className="text-xs font-semibold">No items selected.</p>
                <p className="text-[10px] text-slate-400 max-w-[160px] mx-auto">Increase quantities in the selector to start designing your box!</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                
                {/* List of selected items */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Products</span>
                  {customBoxMetrics.selectedItems.map((item) => (
                    <div key={item.product} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-medium text-slate-700">
                      <span className="truncate max-w-[140px]">{item.name}</span>
                      <span className="font-bold font-mono text-slate-800">{item.qty}x @ ₹{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Savings calculations */}
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-orange-700 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Standard Total Price:</span>
                    <span className="line-through text-slate-400">₹{customBoxMetrics.standardTotal}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm">
                    <span>Custom Box Savings:</span>
                    <span>15% OFF</span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-sm">Monthly Subscription:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">₹{customBoxMetrics.finalPrice}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">/month</span>
                  </div>
                </div>

                {/* Subscribe button */}
                <button
                  onClick={() => handleOpenCheckout({
                    planId: 'custom-box',
                    name: 'Custom Build Box',
                    price: customBoxMetrics.finalPrice,
                    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
                    products: customBoxMetrics.selectedItems.map(i => ({ name: i.name, qty: i.qty }))
                  })}
                  className="w-full btn-primary py-3 font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
                >
                  <span>Subscribe to Custom Box</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Subscriptions;
