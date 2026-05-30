import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

const Dashboard = ({ setPage, setSelectedProductId }) => {
  const { getAuthHeader } = useAuth();
  
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Orders
      const ordersRes = await fetch('/api/orders', { headers: getAuthHeader() });
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      // 2. Fetch Products
      const productsRes = await fetch('/api/products');
      const products = productsRes.ok ? await productsRes.json() : [];

      // 3. Fetch Customers
      const customersRes = await fetch('/api/users', { headers: getAuthHeader() });
      const customers = customersRes.ok ? await customersRes.json() : [];

      // 4. Calculate Summaries
      const totalSales = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalCustomers = customers.filter(c => c.role === 'customer').length;

      setMetrics({
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers
      });

      // Recent 5 orders
      setRecentOrders(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));

      // Products with stock <= 10
      setLowStockProducts(products.filter(p => (p.stock || 0) <= 10));

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Cards configuration
  const cardItems = [
    { 
      title: 'Total Revenue', 
      value: `₹${metrics.totalSales?.toFixed(2)}`, 
      sub: '+12% month-on-month', 
      icon: DollarSign, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      trend: true
    },
    { 
      title: 'Total Purchases', 
      value: metrics.totalOrders, 
      sub: '+8.4% this week', 
      icon: ShoppingBag, 
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      trend: true
    },
    { 
      title: 'Total Products', 
      value: metrics.totalProducts, 
      sub: '4 catalog categories', 
      icon: Package, 
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      trend: null
    },
    { 
      title: 'Active Customers', 
      value: metrics.totalCustomers, 
      sub: '+2 new profiles today', 
      icon: Users, 
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      trend: true
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of system health, analytical transactions, and stock levels.</p>
        </div>
      </div>

      {/* Grid of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{card.title}</span>
                <span className="text-2xl font-extrabold text-slate-900 block">{card.value}</span>
                <div className="flex items-center text-xs">
                  {card.trend !== null && (
                    <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  )}
                  <span className="text-slate-400 font-semibold">{card.sub}</span>
                </div>
              </div>
              <div className={`p-4 rounded-xl border ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics SVG Graph Chart */}
      <section className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Weekly Revenue Analysis</h3>
            <p className="text-xs text-slate-400 font-medium">Visualizing sales growth curves (simulated data).</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center">
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            +18.3% vs Last Week
          </span>
        </div>
        
        {/* Simple inline SVG chart */}
        <div className="w-full h-48 bg-slate-50 rounded-xl relative overflow-hidden flex items-end">
          <svg className="w-full h-full absolute inset-0 pt-6" viewBox="0 0 700 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" />
            
            {/* Shaded Area under Curve */}
            <path
              d="M0,150 L50,120 L150,110 L250,90 L350,115 L450,70 L550,55 L700,30 L700,150 Z"
              fill="url(#chartGradient)"
            />
            {/* Curve path line */}
            <path
              d="M0,120 C50,120 100,115 150,110 C200,105 230,92 250,90 C270,88 330,120 350,115 C370,110 430,75 450,70 C470,65 530,60 550,55 C570,50 650,30 700,30"
              fill="none"
              stroke="#ea580c"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Data point circle */}
            <circle cx="550" cy="55" r="4.5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="700" cy="30" r="4.5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
          
          {/* Label lines */}
          <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </section>

      {/* Split details layout: 2 columns (Recent orders & stock warnings) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Col 1: Recent Orders (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Recent Transactions</h3>
            <button 
              onClick={() => setPage('admin-orders')} 
              className="text-xs text-brand-600 font-semibold hover:underline flex items-center space-x-1 outline-none"
            >
              <span>Manage Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-bold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total Charged</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="text-slate-600">
                    <td className="py-3 font-mono font-bold text-brand-700">{order._id.substring(0, 8)}...</td>
                    <td className="py-3">{order.shippingAddress?.name}</td>
                    <td className="py-3 font-bold text-slate-900">₹{order.totalPrice?.toFixed(2)}</td>
                    <td className="py-3">
                      {order.status === 'Delivered' ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                          Delivered
                        </span>
                      ) : order.status === 'Shipped' ? (
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                          Shipped
                        </span>
                      ) : order.status === 'Packed' ? (
                        <span className="text-[10px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full border border-cyan-100">
                          Packed
                        </span>
                      ) : order.status === 'Processing' ? (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                          Processing
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
                          Placed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 2: Low Stock Warnings (1/3 width) */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center">
              <AlertTriangle className="h-4.5 w-4.5 mr-1.5 text-amber-500" />
              Stock Alerts
            </h3>
            <button 
              onClick={() => setPage('admin-inventory')} 
              className="text-xs text-brand-600 font-semibold hover:underline outline-none"
            >
              Update Stock
            </button>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-xs border border-slate-100 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <img src={p.image} alt={p.name} className="h-8 w-8 object-cover rounded-lg border" />
                    <span className="font-semibold text-slate-700 truncate max-w-[100px]">{p.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    p.stock === 0 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 font-medium text-xs">
                ✅ All inventory levels are healthy!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
