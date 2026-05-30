import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, Leaf, Citrus, Cherry, ShieldCheck, HeartHandshake, Clock, Gift, Bell, Flame } from 'lucide-react';

const Home = ({ setPage, setSelectedProductId, setFilterCategory }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Festival countdown states
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [upcomingCampaign, setUpcomingCampaign] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCampaignActive, setIsCampaignActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a, b) => b.rating - a.rating).slice(0, 6);
          setFeaturedProducts(sorted);
        }

        // Fetch active campaign
        const campaignRes = await fetch('/api/festivals/active');
        if (campaignRes.ok) {
          const cData = await campaignRes.json();
          setActiveCampaign(cData.activeFestival);
          setUpcomingCampaign(cData.upcomingFestival);
        }
      } catch (err) {
        console.error('Error fetching storefront products/campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const targetCampaign = activeCampaign || upcomingCampaign;
    if (!targetCampaign) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(targetCampaign.startDate).getTime();
      const end = new Date(targetCampaign.endDate).getTime();

      let targetTime = end;
      if (now < start) {
        targetTime = start;
        setIsCampaignActive(false);
      } else if (now > end) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsCampaignActive(false);
        clearInterval(timer);
        return;
      } else {
        targetTime = end;
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
  }, [activeCampaign, upcomingCampaign]);

  const categoriesList = [
    { name: 'Amla', slug: 'amla', icon: Leaf, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'Mango', slug: 'mango', icon: Citrus, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'Modak', slug: 'modak', icon: Sparkles, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { name: 'Fruit Jam', slug: 'fruit-jam', icon: Cherry, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ];

  const handleCategoryClick = (slug) => {
    setFilterCategory(slug);
    setPage('products');
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      
      {/* Dynamic Homepage Notifications Alerts */}
      {(activeCampaign || upcomingCampaign) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-2.5 text-xs font-semibold text-slate-750">
          {activeCampaign && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-2xl flex items-center justify-between shadow-sm animate-pulse-subtle">
              <div className="flex items-center space-x-2">
                <span className="text-base">🥭</span>
                <span>{activeCampaign.name} Collection is Live! Explore our premium traditional treats & custom gift boxes today.</span>
              </div>
              <button onClick={() => setPage(`festival/${activeCampaign.key}`)} className="underline hover:text-emerald-950 font-black cursor-pointer outline-none ml-2">Explore Page</button>
            </div>
          )}
          {upcomingCampaign && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-base">🪔</span>
                <span>{upcomingCampaign.name} launches in {timeLeft.days} days! Pre-order traditional modaks and health gift packages.</span>
              </div>
              <button onClick={() => setPage(`festival/${upcomingCampaign.key}`)} className="underline hover:text-amber-950 font-black cursor-pointer outline-none ml-2">Sneak Peek</button>
            </div>
          )}
          <div className="bg-brand-50 border border-brand-100 text-brand-800 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-base">🎁</span>
              <span>Premium Custom Festival Gift Boxes available from ₹699. Gift directly to friends & family!</span>
            </div>
            <button onClick={() => { if (activeCampaign) { setPage(`festival/${activeCampaign.key}`); } else { setPage('products'); } }} className="underline hover:text-brand-950 font-black cursor-pointer outline-none ml-2">Browse Gift Boxes</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl mt-4 mx-4 sm:mx-6 lg:mx-8">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-slate-900" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-8 py-24 sm:py-32 flex flex-col md:w-2/3 space-y-6">
          <span className="inline-flex items-center space-x-1.5 bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-brand-500/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Authentic & Organic Premium Foods</span>
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none animate-slide-up">
            Fresh Natural Foods <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-amber-400 to-emerald-400">Delivered to Your Doorstep</span>
          </h1>
          <p className="text-slate-350 text-base max-w-md leading-relaxed">
            Discover authentic Amla products, premium Mango specialties, and traditional Modaks made with quality ingredients.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => setPage('products')}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleCategoryClick('All')}
              className="btn-secondary bg-transparent border-slate-700 text-white hover:bg-slate-800"
            >
              View All Items
            </button>
          </div>
        </div>
      </section>

      {/* Festival Countdown Section */}
      {(activeCampaign || upcomingCampaign) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
            style={{
              backgroundColor: activeCampaign?.theme?.bgColor || upcomingCampaign?.theme?.bgColor || '#FFEDD5',
              borderColor: activeCampaign?.theme?.borderColor || upcomingCampaign?.theme?.borderColor || '#FED7AA'
            }}
          >
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span 
                className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-inner"
                style={{
                  backgroundColor: activeCampaign?.theme?.badgeBg || upcomingCampaign?.theme?.badgeBg || '#FFEDD5',
                  color: activeCampaign?.theme?.badgeText || upcomingCampaign?.theme?.badgeText || '#9A3412',
                  borderColor: activeCampaign?.theme?.borderColor || upcomingCampaign?.theme?.borderColor || '#FED7AA'
                }}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                {activeCampaign ? 'Active Festival Celebration' : 'Upcoming Festival Celebration'}
              </span>
              
              <h2 
                className="text-2xl font-black tracking-tight"
                style={{ color: activeCampaign?.theme?.textColor || upcomingCampaign?.theme?.textColor || '#7C2D12' }}
              >
                {activeCampaign ? activeCampaign.name : `Upcoming Festival Celebration: ${upcomingCampaign?.name}`}
              </h2>
              
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Prepare for the festival with our specially curated traditional collection. Explore limited-time offers and custom AI gift packages.
              </p>

              <div>
                <button
                  onClick={() => setPage(`festival/${activeCampaign ? activeCampaign.key : upcomingCampaign?.key}`)}
                  className="btn-primary py-2 px-5 text-xs font-bold inline-flex items-center space-x-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, ${activeCampaign?.theme?.primaryColor || upcomingCampaign?.theme?.primaryColor || '#EA580C'}, ${activeCampaign?.theme?.secondaryColor || upcomingCampaign?.theme?.secondaryColor || '#D97706'})`
                  }}
                >
                  <span>Explore Festival Collection</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Countdown timer widget */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center justify-center min-w-[280px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center">
                <Flame className="h-3 w-3 mr-1 text-orange-500 animate-pulse" />
                {isCampaignActive ? 'Offer Ends In:' : 'Campaign Launches In:'}
              </span>
              
              <div className="flex items-center gap-2.5">
                {[
                  { val: timeLeft.days, label: 'Days' },
                  { val: timeLeft.hours, label: 'Hrs' },
                  { val: timeLeft.minutes, label: 'Mins' },
                  { val: timeLeft.seconds, label: 'Secs' }
                ].map((digit, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-800 text-white font-black text-xl px-3 py-2 rounded-xl tracking-tight min-w-[42px] text-center">
                        {String(digit.val).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase">{digit.label}</span>
                    </div>
                    {idx < 3 && <span className="text-lg font-bold text-slate-700 mx-1">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shop by Category</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Choose from our premium categories designed to elevate your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-300 group cursor-pointer outline-none ${cat.color}`}
              >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Featured Products</h2>
            <p className="text-sm text-slate-500">
              Handpicked customer favorites with the highest ratings.
            </p>
          </div>
          <button
            onClick={() => setPage('products')}
            className="text-brand-600 font-semibold text-sm hover:text-brand-700 flex items-center space-x-1 transition-colors cursor-pointer outline-none"
          >
            <span>See All Products</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-slate-200 aspect-square rounded-2xl w-full" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                setPage={setPage}
                setSelectedProductId={setSelectedProductId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Subscription Boxes Teaser Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="text-center space-y-2.5">
          <span className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-brand-100">
            Monthly Wellness
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Curated Monthly Subscription Boxes
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Get premium wellness ingredients delivered right to your door every month. Enjoy exclusive savings and bonus rewards points.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Plan 1 */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80" 
                  alt="Immunity Booster Box" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  Immunity
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-extrabold text-slate-800 text-lg">Immunity Booster Box</h3>
                <div className="text-lg font-black text-emerald-600">₹499<span className="text-xs text-slate-400 font-medium">/month</span></div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-2" />Rich in Vitamin C</li>
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-2" />Supports Immunity</li>
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-2" />Daily Wellness</li>
                </ul>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <button onClick={() => setPage('subscriptions')} className="w-full btn-secondary text-xs py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 font-bold rounded-xl transition-all cursor-pointer">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* Plan 2 */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" 
                  alt="Mango Lover Box" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  Mangoes
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-extrabold text-slate-800 text-lg">Mango Lover Box</h3>
                <div className="text-lg font-black text-amber-600">₹699<span className="text-xs text-slate-400 font-medium">/month</span></div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full mr-2" />Seasonal Freshness</li>
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full mr-2" />Premium Mango Collection</li>
                </ul>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <button onClick={() => setPage('subscriptions')} className="w-full btn-secondary text-xs py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 font-bold rounded-xl transition-all cursor-pointer">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1605197585662-763f96f0bfbb?auto=format&fit=crop&w=600&q=80" 
                  alt="Traditional Modak Box" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  Saffron
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-extrabold text-slate-800 text-lg">Traditional Modak Box</h3>
                <div className="text-lg font-black text-orange-600">₹599<span className="text-xs text-slate-400 font-medium">/month</span></div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-orange-500 rounded-full mr-2" />Traditional Taste</li>
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-orange-500 rounded-full mr-2" />Festival Collection</li>
                </ul>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <button onClick={() => setPage('subscriptions')} className="w-full btn-secondary text-xs py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100 font-bold rounded-xl transition-all cursor-pointer">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* Plan 4 */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" 
                  alt="Family Combo Box" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  Value Combo
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-extrabold text-slate-800 text-lg">Family Combo Box</h3>
                <div className="text-lg font-black text-rose-600">₹999<span className="text-xs text-slate-400 font-medium">/month</span></div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-rose-500 rounded-full mr-2" />Best Value</li>
                  <li className="flex items-center"><span className="h-1.5 w-1.5 bg-rose-500 rounded-full mr-2" />Family Pack</li>
                </ul>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <button onClick={() => setPage('subscriptions')} className="w-full btn-secondary text-xs py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100 font-bold rounded-xl transition-all cursor-pointer">
                Subscribe Now
              </button>
            </div>
          </div>

        </div>
        <div className="text-center">
          <button onClick={() => setPage('subscriptions')} className="btn-primary py-3 px-8 text-sm font-bold flex items-center space-x-2 mx-auto cursor-pointer outline-none">
            <span>Explore All Subscription Boxes</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      {/* AI Wellness Assessment Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="inline-flex items-center space-x-1.5 bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-brand-500/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>AI Wellness Engine</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Find Products Based On Your Health Goals
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Answer a few questions about your lifestyle, diet, and body priorities. Our intelligent wellness advisor will analyze your profile to build a custom morning-to-evening routine and recommend matches.
            </p>
            <div>
              <button 
                onClick={() => setPage('wellness-assistant')}
                className="btn-primary bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-8 text-sm flex items-center space-x-2 cursor-pointer outline-none shadow-lg shadow-white/5 border border-white"
              >
                <span>Take Wellness Assessment</span>
                <ArrowRight className="h-4.5 w-4.5 text-slate-850" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600 flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Secure Shopping</h3>
              <p className="text-xs text-slate-500">
                SSL encryption ensures credit card details and profile data remain completely secure.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600 flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Premium Quality</h3>
              <p className="text-xs text-slate-500">
                Each listing is handpicked and inspected to meet our strict quality metrics.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600 flex-shrink-0">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Customer Support</h3>
              <p className="text-xs text-slate-500">
                Our support team is active 24/7 to resolve shipping, checkout, or billing queries.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
