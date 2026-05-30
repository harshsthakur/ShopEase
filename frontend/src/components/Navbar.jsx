import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Leaf,
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  UserCheck,
  ArrowRight
} from 'lucide-react';

const Navbar = ({ currentPath, setPage }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [activeCampaign, setActiveCampaign] = useState(null);
  const [upcomingCampaign, setUpcomingCampaign] = useState(null);

  useEffect(() => {
    const fetchActiveCampaign = async () => {
      try {
        const res = await fetch('/api/festivals/active');
        if (res.ok) {
          const data = await res.json();
          setActiveCampaign(data.activeFestival);
          setUpcomingCampaign(data.upcomingFestival);
        }
      } catch (err) {
        console.error('Navbar campaign fetch error:', err);
      }
    };
    fetchActiveCampaign();
  }, [currentPath]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = user?.wishlist?.length || 0;

  const handleNav = (page) => {
    setPage(page);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNav('home');
  };

  return (
    <>
      {/* Dynamic Announcement Banner */}
      {(activeCampaign || upcomingCampaign) && (
        <div 
          className="text-white text-center py-2.5 px-4 text-xs font-bold transition-all relative z-50 flex items-center justify-center space-x-1.5 overflow-hidden shadow-inner"
          style={{
            background: `linear-gradient(90deg, ${activeCampaign?.theme?.primaryColor || upcomingCampaign?.theme?.primaryColor || '#EA580C'} 0%, ${activeCampaign?.theme?.secondaryColor || upcomingCampaign?.theme?.secondaryColor || '#D97706'} 100%)`
          }}
        >
          {activeCampaign ? (
            <div className="flex items-center space-x-1 animate-pulse-subtle">
              <span>🎉 {activeCampaign.name} Collection is Live! Get seasonal discounts & exclusive gift boxes.</span>
              <button 
                onClick={() => handleNav(`festival/${activeCampaign.key}`)}
                className="underline hover:text-yellow-250 font-black ml-1.5 inline-flex items-center cursor-pointer outline-none"
              >
                Explore Campaign <ArrowRight className="h-3 w-3 ml-0.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span>⏰ Prepare for {upcomingCampaign.name}! Curated Traditional Collection launching soon.</span>
              <button 
                onClick={() => handleNav(`festival/${upcomingCampaign.key}`)}
                className="underline hover:text-yellow-250 font-black ml-1.5 inline-flex items-center cursor-pointer outline-none"
              >
                Sneak Peek <ArrowRight className="h-3 w-3 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      )}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNav('home')} 
              className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-gradient cursor-pointer outline-none"
            >
              <Leaf className="h-7 w-7 text-emerald-500 animate-pulse-subtle" />
              <span>ShopEase</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNav('home')}
              className={`text-sm font-medium transition-colors cursor-pointer outline-none ${
                currentPath === 'home' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('products')}
              className={`text-sm font-medium transition-colors cursor-pointer outline-none ${
                currentPath === 'products' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => handleNav('categories')}
              className={`text-sm font-medium transition-colors cursor-pointer outline-none ${
                currentPath === 'categories' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNav('subscriptions')}
              className={`text-sm font-medium transition-colors cursor-pointer outline-none ${
                currentPath === 'subscriptions' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Subscription Boxes
            </button>

            {activeCampaign && (
              <button
                onClick={() => handleNav(`festival/${activeCampaign.key}`)}
                className={`text-sm font-extrabold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer outline-none flex items-center space-x-1 ${
                  currentPath === `festival/${activeCampaign.key}` ? 'text-amber-705' : ''
                }`}
              >
                <span className="animate-bounce-subtle">🪔</span>
                <span>{activeCampaign.name} Store</span>
              </button>
            )}
            <button
              onClick={() => handleNav('about')}
              className={`text-sm font-medium transition-colors cursor-pointer outline-none ${
                currentPath === 'about' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`text-sm font-medium transition-colors cursor-pointer outline-none ${
                currentPath === 'contact' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Wishlist */}
            <button
              onClick={() => handleNav(user ? 'wishlist' : 'login')}
              className="relative p-2 text-slate-600 hover:text-brand-600 transition-colors cursor-pointer outline-none"
            >
              <Heart className="h-5.5 w-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-rose-500 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => handleNav('cart')}
              className="relative p-2 text-slate-600 hover:text-brand-600 transition-colors cursor-pointer outline-none"
            >
              <ShoppingBag className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-brand-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1 p-1 text-slate-700 hover:text-brand-600 font-medium transition-colors cursor-pointer outline-none"
                >
                  <UserIcon className="h-5 w-5 text-brand-600" />
                  <span className="text-sm max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 animate-slide-up">
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNav('admin-dashboard')}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer outline-none"
                      >
                        <LayoutDashboard className="h-4.5 w-4.5 mr-2 text-brand-500" />
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => handleNav('profile')}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer outline-none"
                    >
                      <UserCheck className="h-4.5 w-4.5 mr-2 text-brand-500" />
                      My Profile
                    </button>
                    <button
                      onClick={() => handleNav('orders')}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer outline-none"
                    >
                      <ShoppingBag className="h-4.5 w-4.5 mr-2 text-brand-500" />
                      Order History
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer outline-none"
                    >
                      <LogOut className="h-4.5 w-4.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="btn-primary py-1.5 px-4 text-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors cursor-pointer outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-3 px-4 space-y-3 animate-fade-in shadow-xl">
          <button
            onClick={() => handleNav('home')}
            className={`block w-full text-left py-2 font-medium ${
              currentPath === 'home' ? 'text-brand-600' : 'text-slate-600'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('products')}
            className={`block w-full text-left py-2 font-medium ${
              currentPath === 'products' ? 'text-brand-600' : 'text-slate-600'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => handleNav('categories')}
            className={`block w-full text-left py-2 font-medium ${
              currentPath === 'categories' ? 'text-brand-600' : 'text-slate-600'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => handleNav('subscriptions')}
            className={`block w-full text-left py-2 font-medium ${
              currentPath === 'subscriptions' ? 'text-brand-600' : 'text-slate-600'
            }`}
          >
            Subscription Boxes
          </button>
          {activeCampaign && (
            <button
              onClick={() => handleNav(`festival/${activeCampaign.key}`)}
              className="block w-full text-left py-2 font-black text-amber-600 flex items-center space-x-1"
            >
              <span>🪔</span>
              <span>{activeCampaign.name} Store</span>
            </button>
          )}

          <button
            onClick={() => handleNav('about')}
            className={`block w-full text-left py-2 font-medium ${
              currentPath === 'about' ? 'text-brand-600' : 'text-slate-600'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`block w-full text-left py-2 font-medium ${
              currentPath === 'contact' ? 'text-brand-600' : 'text-slate-600'
            }`}
          >
            Contact
          </button>
          
          <div className="border-t border-slate-100 pt-2"></div>
          
          <button
            onClick={() => handleNav(user ? 'wishlist' : 'login')}
            className="flex items-center space-x-2 py-2 text-slate-600"
          >
            <Heart className="h-5 w-5 text-rose-500" />
            <span>Wishlist ({wishlistCount})</span>
          </button>
          <button
            onClick={() => handleNav('cart')}
            className="flex items-center space-x-2 py-2 text-slate-600"
          >
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            <span>Cart ({cartCount})</span>
          </button>

          {user ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                Signed in as: {user.name}
              </div>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="flex items-center w-full py-2 text-slate-600 hover:text-brand-600"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2 text-brand-500" />
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => handleNav('profile')}
                className="flex items-center w-full py-2 text-slate-600 hover:text-brand-600"
              >
                <UserCheck className="h-5 w-5 mr-2 text-brand-500" />
                My Profile
              </button>
              <button
                onClick={() => handleNav('orders')}
                className="flex items-center w-full py-2 text-slate-600 hover:text-brand-600"
              >
                <ShoppingBag className="h-5 w-5 mr-2 text-brand-500" />
                Order History
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full py-2 text-rose-600 font-semibold"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="w-full btn-primary py-2 text-center"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;
