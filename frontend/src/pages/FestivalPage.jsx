import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Gift, Sparkles, ShoppingBag, Star, Award, ShieldAlert, CheckCircle, Flame, ArrowRight, Package } from 'lucide-react';

const FestivalPage = ({ festivalId, setPage, setSelectedProductId }) => {
  const { addToCart } = useCart();
  const { user, getAuthHeader } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Recommendation wizard state
  const [budget, setBudget] = useState(1000);
  const [peopleCount, setPeopleCount] = useState(4);
  const [purpose, setPurpose] = useState('Family Celebration');
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [recSuccessMsg, setRecSuccessMsg] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCampaignActive, setIsCampaignActive] = useState(true);

  // Fetch campaign and matching products
  useEffect(() => {
    const fetchCampaignData = async () => {
      setLoading(true);
      setError(null);
      try {
        const campaignRes = await fetch(`/api/festivals/key/${festivalId}`);
        if (!campaignRes.ok) {
          throw new Error('Festival campaign not found');
        }
        const campaignData = await campaignRes.json();
        setCampaign(campaignData);

        // Fetch products catalog
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          const allProducts = await productsRes.json();
          // Filter matching products by names or categories
          const featuredNames = campaignData.featuredProducts || [];
          const filtered = allProducts.filter(p => 
            featuredNames.some(fn => p.name.toLowerCase().includes(fn.toLowerCase())) ||
            (campaignData.key === 'mango-season' && p.category === 'mango') ||
            (campaignData.key === 'ganesh-chaturthi' && p.category === 'modak') ||
            (campaignData.key === 'winter-wellness' && p.category === 'amla') ||
            (campaignData.key === 'diwali' && (p.category === 'modak' || p.category === 'amla'))
          );
          setProducts(filtered);
        }
      } catch (err) {
        setError(err.message || 'Error loading festival data');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [festivalId]);

  // Countdown timer interval
  useEffect(() => {
    if (!campaign) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(campaign.startDate).getTime();
      const end = new Date(campaign.endDate).getTime();

      let targetTime = end;
      if (now < start) {
        // Campaign hasn't started yet
        targetTime = start;
        setIsCampaignActive(false);
      } else if (now > end) {
        // Campaign finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsCampaignActive(false);
        clearInterval(timer);
        return;
      } else {
        setIsCampaignActive(true);
      }

      const difference = targetTime - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [campaign]);

  // Handle adding Gift Box to cart
  const handleAddGiftBox = (box) => {
    const giftBoxProduct = {
      _id: `giftbox-${festivalId}-${box.name.toLowerCase().replace(/ /g, '-')}`,
      name: box.name,
      price: box.price,
      image: box.image || 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=600&q=80',
      stock: 100, // Gift boxes are always in stock
      description: box.description || `Special premium pack for ${campaign?.name}`
    };
    addToCart(giftBoxProduct, 1);
    alert(`${box.name} added to cart!`);
  };

  // Run AI Recommendation Wizard
  const handleGetAiRecommendation = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiRecommendation(null);
    setRecSuccessMsg('');
    try {
      const res = await fetch('/api/festivals/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          festivalKey: festivalId,
          budget,
          peopleCount,
          purpose
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecommendation(data);
      } else {
        alert('Could not generate recommendations. Try adjusting your inputs.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Add all AI recommended items to cart
  const handleAddAllRecommended = () => {
    if (!aiRecommendation) return;

    let itemsAdded = 0;
    if (aiRecommendation.recommendedGiftBox) {
      handleAddGiftBox(aiRecommendation.recommendedGiftBox);
      itemsAdded++;
    }

    if (aiRecommendation.recommendedProducts && aiRecommendation.recommendedProducts.length > 0) {
      aiRecommendation.recommendedProducts.forEach(p => {
        // Resolve product stock details
        const catalogProd = products.find(cp => cp._id === p._id);
        const itemToCart = {
          _id: p._id,
          name: p.name,
          price: p.price,
          image: p.image,
          stock: catalogProd ? catalogProd.stock : 20
        };
        addToCart(itemToCart, 1);
        itemsAdded++;
      });
    }

    if (itemsAdded > 0) {
      setRecSuccessMsg(`Added ${itemsAdded} recommended item(s) to your cart!`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Campaign Not Found</h2>
        <p className="text-slate-500">The requested seasonal landing page could not be located or has expired.</p>
        <button onClick={() => setPage('home')} className="btn-primary">Return to Storefront</button>
      </div>
    );
  }

  const theme = campaign.theme || {
    primaryColor: '#F59E0B',
    secondaryColor: '#EA580C',
    textColor: '#78350F',
    bgColor: '#FEF9C3',
    borderColor: '#FEF08A',
    badgeBg: '#FEF9C3',
    badgeText: '#854D0E',
    badgeLabel: '✨ Special Selection'
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      
      {/* 1. HERO FESTIVAL HEADER */}
      <section 
        className="relative overflow-hidden rounded-3xl shadow-xl min-h-[360px] flex items-center p-8 sm:p-12 text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor || '#EA580C'} 30%, ${theme.secondaryColor || '#D97706'} 100%)`
        }}
      >
        {/* Banner image background overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img 
            src={campaign.bannerImage} 
            alt={campaign.name} 
            className="w-full h-full object-cover scale-105"
          />
        </div>

        {/* Dynamic graphics particles decoration */}
        <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative max-w-2xl space-y-6">
          <span 
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-inner"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-yellow-300 animate-spin-slow" />
            Seasonal Celebration
          </span>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            {campaign.name}
          </h1>

          <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed drop-shadow-sm">
            {campaign.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {campaign.offers?.map((offer, idx) => (
              <span 
                key={idx} 
                className="bg-white/95 text-slate-900 font-bold px-3 py-1 rounded-xl text-xs shadow-md border border-white/20"
              >
                🔥 {offer.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TICKING COUNTDOWN */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-bold text-slate-800 text-base flex items-center justify-center md:justify-start">
              <Clock className="h-5 w-5 mr-1.5 text-brand-600" />
              {isCampaignActive ? 'Limited Time Offers End In' : 'Celebration Launch Starting In'}
            </h3>
            <p className="text-xs text-slate-400 font-semibold">Prices revert back to normal once the campaign countdown reaches zero.</p>
          </div>

          {/* Countdown digits */}
          <div className="flex items-center gap-3">
            {[
              { val: timeLeft.days, label: 'Days' },
              { val: timeLeft.hours, label: 'Hours' },
              { val: timeLeft.minutes, label: 'Mins' },
              { val: timeLeft.seconds, label: 'Secs' }
            ].map((digit, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="bg-slate-900 text-white font-black text-2xl px-4 py-2.5 rounded-2xl shadow-inner min-w-[56px] text-center tracking-tight">
                    {String(digit.val).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{digit.label}</span>
                </div>
                {idx < 3 && <span className="text-xl font-bold text-slate-300 mx-1.5 mb-5">:</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CURATED SPECIAL GIFT BOXES */}
      {campaign.giftBoxes && campaign.giftBoxes.length > 0 && (
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight flex items-center justify-center">
              <Gift className="h-6 w-6 text-brand-600 mr-2" />
              Signature Festival Gift Boxes
            </h2>
            <p className="text-slate-450 font-medium text-xs max-w-xl mx-auto">
              Curated combinations of premium treats in gorgeous packaging, ready to send to your friends, family, and associates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaign.giftBoxes.map((box, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Gift Box Image */}
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img 
                      src={box.image || 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=600&q=80'} 
                      alt={box.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border px-3 py-1 rounded-full text-xs font-black text-brand-600 shadow-md">
                      Premium Pack
                    </div>
                  </div>

                  {/* Contents */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-800">{box.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{box.description}</p>
                    
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Included:</span>
                      <div className="flex flex-wrap gap-1">
                        {box.contents?.map((item, cidx) => (
                          <span key={cidx} className="bg-brand-50 border border-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                            🎁 {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action and price */}
                <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-lg font-black text-slate-800">
                    ₹{box.price}
                  </div>
                  <button 
                    onClick={() => handleAddGiftBox(box)}
                    className="btn-primary py-2 px-4 text-xs font-bold flex items-center space-x-1 shadow-md"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    <span>Add Box to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. FESTIVAL BESTSELLERS */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight flex items-center justify-center">
            <Award className="h-6 w-6 text-brand-600 mr-2 animate-bounce-subtle" />
            Seasonal Bestsellers Catalog
          </h2>
          <p className="text-slate-450 font-medium text-xs max-w-xl mx-auto">
            Traditional favorites and organic choices recommended for this season.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10 bg-white border rounded-2xl text-slate-400 font-medium text-xs">
            No specific catalog products listed for this campaign.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const hasStock = product.stock > 0;
              return (
                <div 
                  key={product._id} 
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div className="relative">
                    {/* Bestseller Badge */}
                    <div 
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-md border z-10"
                      style={{
                        backgroundColor: theme.badgeBg || '#FEF9C3',
                        color: theme.badgeText || '#854D0E',
                        borderColor: theme.borderColor || '#FEF08A'
                      }}
                    >
                      {theme.badgeLabel || '⭐ Bestseller'}
                    </div>

                    {/* Image */}
                    <div 
                      className="h-44 bg-slate-50 cursor-pointer overflow-hidden relative flex items-center justify-center"
                      onClick={() => { setSelectedProductId(product._id); setPage('product-details'); }}
                    >
                      {product.image && product.image !== 'fff' ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-slate-300" />
                      )}
                      
                      {!hasStock && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-extrabold text-xs">
                          OUT OF STOCK
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 
                        className="font-bold text-slate-800 text-xs hover:text-brand-650 cursor-pointer truncate"
                        onClick={() => { setSelectedProductId(product._id); setPage('product-details'); }}
                      >
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 leading-relaxed min-h-[30px]">{product.description}</p>
                      
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <span>Weight: {product.weight || 'N/A'}</span>
                        <span className="flex items-center text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                          {product.reviews && product.reviews.length > 0
                            ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
                            : '4.5'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-sm">₹{product.price}</span>
                    <button 
                      onClick={() => addToCart(product, 1)}
                      disabled={!hasStock}
                      className="btn-primary py-1.5 px-3 text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                      <span>{hasStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. AI RECOMMENDATION ENGINE / GIFTING WIZARD */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Info & Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center bg-brand-500/20 text-brand-400 font-bold border border-brand-500/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-yellow-300 animate-pulse" />
                AI Assistant Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">AI Festival Gift Recommendations</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Input your budget and celebration goals. Our AI will instantly recommend a curated combination of gift boxes and individual products.
              </p>
            </div>

            <form onSubmit={handleGetAiRecommendation} className="space-y-4 text-xs font-semibold text-slate-350">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gifting Budget (₹)</label>
                  <input 
                    type="number" 
                    min="100" 
                    max="10000" 
                    required 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:border-brand-500 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Number of People</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    required 
                    value={peopleCount} 
                    onChange={(e) => setPeopleCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:border-brand-500 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Purpose / Gifting Occasion</label>
                <select 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:border-brand-500 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                >
                  <option value="Family Celebration">Family Celebration</option>
                  <option value="Corporate Gift">Corporate Gift</option>
                  <option value="Personal Use">Personal Use</option>
                  <option value="Friends & Relatives">Friends & Relatives</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={aiLoading}
                className="w-full bg-gradient-to-r from-brand-500 to-amber-500 text-white hover:from-brand-650 hover:to-amber-600 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? 'Analyzing catalog products...' : 'Generate AI Recommendations'}
              </button>
            </form>
          </div>

          {/* Right panel: Results Output */}
          <div className="lg:col-span-7 bg-slate-800/50 border border-slate-700/50 p-6 rounded-3xl min-h-[300px] flex flex-col justify-center">
            {aiLoading ? (
              <div className="text-center py-10 space-y-3 mx-auto">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
                <p className="text-xs text-slate-400 font-bold">Scanning stock levels, gift boxes, and calculating maximum savings...</p>
              </div>
            ) : aiRecommendation ? (
              <div className="space-y-5 animate-fade-in text-xs font-semibold">
                
                {/* Result header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Suggested Budget Plan</h3>
                    <span className="text-[10px] text-slate-400 block font-bold">Optimized for: {purpose} ({peopleCount} People)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-brand-400">Total: ₹{aiRecommendation.finalTotal}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">Saved: ₹{aiRecommendation.savings}</div>
                  </div>
                </div>

                {/* Narrative explanation */}
                <div className="p-3 bg-slate-800 border border-slate-750 rounded-xl text-[11px] leading-relaxed text-slate-300 font-medium">
                  {aiRecommendation.rationale}
                </div>

                {/* Recommendations Breakdown */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recommended Selection:</span>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {/* Recommended Gift Box */}
                    {aiRecommendation.recommendedGiftBox && (
                      <div className="flex items-center justify-between bg-brand-950/20 border border-brand-850/40 p-2.5 rounded-xl text-slate-200">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 bg-brand-500/10 text-brand-400 rounded-lg flex items-center justify-center"><Gift className="h-4.5 w-4.5" /></div>
                          <div>
                            <div className="font-bold text-white text-xs">{aiRecommendation.recommendedGiftBox.name}</div>
                            <span className="text-[9px] text-slate-400 font-medium">Included contents: {aiRecommendation.recommendedGiftBox.contents?.join(', ')}</span>
                          </div>
                        </div>
                        <span className="font-bold text-white">₹{aiRecommendation.recommendedGiftBox.price}</span>
                      </div>
                    )}

                    {/* Recommended Products */}
                    {aiRecommendation.recommendedProducts?.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-slate-200">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 bg-slate-700 text-slate-400 rounded-lg overflow-hidden flex items-center justify-center">
                            {p.image && p.image !== 'fff' ? <img src={p.image} className="w-full h-full object-cover" /> : <Package className="h-4.5 w-4.5" />}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{p.name}</div>
                            <span className="text-[9px] text-slate-400 font-semibold">{p.weight} | Category: {p.category}</span>
                          </div>
                        </div>
                        <span className="font-bold text-white">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bulk action */}
                <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button 
                    onClick={handleAddAllRecommended}
                    className="w-full sm:w-auto btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4 mr-1.5" />
                    <span>Add All Items to Cart</span>
                  </button>
                  
                  {recSuccessMsg && (
                    <span className="text-emerald-400 font-bold text-xs flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {recSuccessMsg}
                    </span>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <Sparkles className="h-10 w-10 text-slate-500 mx-auto animate-pulse" />
                <h4 className="font-bold text-slate-350 text-xs">Awaiting Wizard Selections</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto font-medium">Provide your budget above and hit submit to view recommended product packs.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center">
            <Star className="h-5 w-5 text-amber-500 mr-2 fill-amber-500" />
            Customer Reviews & Experiences
          </h2>
          <p className="text-slate-450 font-medium text-xs">What our wellness-conscious community has to say about this collection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: 'Aarav Mehta',
              rating: 5,
              date: '2 weeks ago',
              comment: `Absolutely loved the fresh packaging and prompt delivery! The modaks tasted completely authentic and melt-in-the-mouth. The fact that the dry fruit box has no added sugar is a lifesaver.`,
              role: 'Verified Buyer'
            },
            {
              name: 'Pooja Sharma',
              rating: 5,
              date: '3 days ago',
              comment: `We ordered the seasonal box as corporate gifts for our team. The premium cards and packaging looked extremely premium, and everyone was thrilled with the wellness Amla candies!`,
              role: 'Corporate Customer'
            }
          ].map((rev, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">{rev.name}</h4>
                  <span className="text-[9px] text-slate-400 font-semibold">{rev.role}</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium mt-0.5">{rev.date}</span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed font-semibold italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default FestivalPage;
