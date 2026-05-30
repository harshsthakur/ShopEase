import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import Subscriptions from './pages/Subscriptions';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import WellnessAssistant from './pages/WellnessAssistant';
import RecommendationAnalytics from './pages/admin/RecommendationAnalytics';
import FestivalPage from './pages/FestivalPage';
import FestivalManagement from './pages/admin/FestivalManagement';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import SalesReports from './pages/admin/SalesReports';

// Icons for Admin Navigation Panel
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Warehouse, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Store,
  LogOut,
  ShieldCheck,
  Calendar,
  Heart,
  Sparkles
} from 'lucide-react';

const AppContent = () => {
  const [page, setPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const { user, logout } = useAuth();

  const handleAdminLogout = () => {
    logout();
    setPage('home');
  };

  // Switch dispatcher to render selected page
  const renderPage = () => {
    if (page.startsWith('festival/')) {
      const festivalKey = page.replace('festival/', '');
      return (
        <FestivalPage 
          festivalId={festivalKey} 
          setPage={setPage} 
          setSelectedProductId={setSelectedProductId} 
        />
      );
    }

    switch (page) {
      // --- CUSTOMER FRONTEND ---
      case 'home':
        return (
          <Home 
            setPage={setPage} 
            setSelectedProductId={setSelectedProductId} 
            setFilterCategory={setFilterCategory} 
          />
        );
      case 'products':
        return (
          <Products 
            setPage={setPage} 
            setSelectedProductId={setSelectedProductId}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        );
      case 'product-details':
        return (
          <ProductDetails 
            productId={selectedProductId} 
            setPage={setPage} 
            setSelectedProductId={setSelectedProductId} 
          />
        );
      case 'cart':
        return <Cart setPage={setPage} />;
      case 'checkout':
        return (
          <ProtectedRoute setPage={setPage}>
            <Checkout setPage={setPage} />
          </ProtectedRoute>
        );
      case 'login':
        return <Login setPage={setPage} />;
      case 'register':
        return <Register setPage={setPage} />;
      case 'profile':
        return (
          <ProtectedRoute setPage={setPage}>
            <Profile setPage={setPage} />
          </ProtectedRoute>
        );
      case 'orders':
        return (
          <ProtectedRoute setPage={setPage}>
            <Orders setPage={setPage} />
          </ProtectedRoute>
        );
      case 'wishlist':
        return (
          <ProtectedRoute setPage={setPage}>
            <Wishlist setPage={setPage} setSelectedProductId={setSelectedProductId} />
          </ProtectedRoute>
        );
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <Contact />;
      case 'categories':
        return <Categories setPage={setPage} setFilterCategory={setFilterCategory} />;
      case 'subscriptions':
        return <Subscriptions setPage={setPage} />;
      case 'wellness-assistant':
        return <WellnessAssistant setPage={setPage} />;

      // --- ADMIN BACKEND ---
      case 'admin-login':
        return <AdminLogin setPage={setPage} />;
      case 'admin-dashboard':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <Dashboard setPage={setPage} setSelectedProductId={setSelectedProductId} />
          </ProtectedRoute>
        );
      case 'admin-products':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <ProductManagement setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-categories':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <CategoryManagement setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-inventory':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <InventoryManagement setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-orders':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <OrderManagement setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-customers':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <CustomerManagement setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-reports':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <SalesReports setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-subscriptions':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <SubscriptionManagement setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-recommendations':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <RecommendationAnalytics setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-festivals':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <FestivalManagement setPage={setPage} />
          </ProtectedRoute>
        );
      default:
        return <Home setPage={setPage} setSelectedProductId={setSelectedProductId} setFilterCategory={setFilterCategory} />;
    }
  };

  // Determine layout style: Customer Store vs. Admin Dashboard console
  const isAdminLayout = page.startsWith('admin-') && page !== 'admin-login';

  if (isAdminLayout) {
    const adminNavLinks = [
      { page: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { page: 'admin-products', label: 'Products', icon: Package },
      { page: 'admin-categories', label: 'Categories', icon: Tags },
      { page: 'admin-inventory', label: 'Inventory', icon: Warehouse },
      { page: 'admin-orders', label: 'Orders Log', icon: ShoppingBag },
      { page: 'admin-customers', label: 'Customers', icon: Users },
      { page: 'admin-reports', label: 'Sales Reports', icon: BarChart3 },
      { page: 'admin-subscriptions', label: 'Subscriptions', icon: Calendar },
      { page: 'admin-recommendations', label: 'AI Wellness Analytics', icon: Heart },
      { page: 'admin-festivals', label: 'Festival Campaigns', icon: Sparkles },
    ];

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR: Admin Console navigation */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-400 p-5 flex flex-col justify-between border-r border-slate-800 md:min-h-screen">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-2 text-white font-extrabold text-lg tracking-wider border-b border-slate-800 pb-4">
              <ShieldCheck className="h-6 w-6 text-brand-500" />
              <span>ShopEase Admin</span>
            </div>

            {/* Menu */}
            <nav className="space-y-1.5 flex flex-col font-medium text-sm">
              {adminNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = page === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => setPage(link.page)}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl transition-colors text-left outline-none cursor-pointer ${
                      isActive 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/10' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 mr-2.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Action Footer */}
          <div className="space-y-2.5 border-t border-slate-800 pt-4 mt-8 md:mt-0 font-medium text-sm">
            <button
              onClick={() => setPage('home')}
              className="flex items-center w-full px-3.5 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-left outline-none cursor-pointer"
            >
              <Store className="h-4.5 w-4.5 mr-2.5 text-brand-500" />
              <span>Storefront</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="flex items-center w-full px-3.5 py-2.5 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 rounded-xl transition-colors text-left outline-none cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5 mr-2.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN AREA: Admin Panel Page */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
          {renderPage()}
        </main>

      </div>
    );
  }

  // Standard Customer Storefront Layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentPath={page} setPage={setPage} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
