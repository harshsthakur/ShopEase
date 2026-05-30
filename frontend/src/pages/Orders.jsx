import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronDown, ChevronUp, Calendar, MapPin, Truck, CheckCircle2, Clock, Package } from 'lucide-react';

const Orders = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/orders/myorders', {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        // Sort orders by newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusStep = (status) => {
    if (status === 'Delivered') return 5;
    if (status === 'Shipped') return 4;
    if (status === 'Packed') return 3;
    if (status === 'Processing') return 2;
    return 1; // 'Order Placed'
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center space-y-6 animate-fade-in">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8 text-slate-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-800">No Orders Yet</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            You haven't placed any purchases yet. Head back to the store to get started!
          </p>
        </div>
        <button
          onClick={() => setPage('products')}
          className="btn-primary w-full py-2.5"
        >
          Browse Store Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order._id;
          const statusStep = getStatusStep(order.status);

          return (
            <div 
              key={order._id}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              
              {/* Header Box (Summaries) */}
              <div 
                onClick={() => toggleExpand(order._id)}
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Order ID: {order._id}</span>
                  <div className="flex items-center text-xs font-semibold text-slate-500 space-x-4">
                    <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>Total: <span className="text-slate-900 font-bold">₹{order.totalPrice?.toFixed(2)}</span></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                  {/* Status Badges */}
                  <div>
                    {order.status === 'Delivered' ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        Delivered
                      </span>
                    ) : order.status === 'Shipped' ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        Shipped
                      </span>
                    ) : order.status === 'Packed' ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100">
                        Packed
                      </span>
                    ) : order.status === 'Processing' ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        Processing
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        Order Placed
                      </span>
                    )}
                  </div>
                  
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </div>

              {/* Expanded details container */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/30 space-y-6 animate-slide-up">
                  
                  {/* Progress Tracker */}
                  <div className="space-y-4 max-w-xl mx-auto py-2">
                    <div className="relative flex justify-between">
                      {/* Grey connecting bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                      {/* Color active bar progress */}
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500" 
                        style={{ width: `${(statusStep - 1) * 25}%` }}
                      />

                      {/* Step 1: Order Placed */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                          statusStep >= 1 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <ShoppingBag className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-600">Placed</span>
                      </div>

                      {/* Step 2: Processing */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                          statusStep >= 2 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <Clock className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-600">Processing</span>
                      </div>

                      {/* Step 3: Packed */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                          statusStep >= 3 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <Package className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-600">Packed</span>
                      </div>

                      {/* Step 4: Shipped */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                          statusStep >= 4 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <Truck className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-600">Shipped</span>
                      </div>

                      {/* Step 5: Delivered */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                          statusStep >= 5 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-600">Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    {/* Items Purchased List (2/3 width) */}
                    <div className="md:col-span-2 space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</h4>
                      <div className="space-y-2">
                        {order.orderItems?.map((item) => (
                          <div 
                            key={item.product}
                            className="flex items-center gap-3 bg-white p-2.5 border border-slate-100 rounded-xl"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-slate-800 text-xs truncate">{item.name}</h5>
                              <span className="text-[10px] text-slate-400 font-semibold">{item.qty}x @ ₹{item.price?.toFixed(2)}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800">₹{(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shipping Details</h4>
                      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-2.5 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800">{order.shippingAddress?.name}</div>
                        <div className="flex items-start"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 flex-shrink-0 mt-0.5" /> {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</div>
                        <div>Email: {order.shippingAddress?.email}</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
