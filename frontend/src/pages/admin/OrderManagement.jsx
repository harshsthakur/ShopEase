import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, Eye, X, ArrowLeft, Calendar, Truck, User } from 'lucide-react';

const OrderManagement = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // holds order object for detail modal

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { headers: getAuthHeader() });
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

  const getOrderDetailsSummary = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) return 'No items';
    const itemsStr = order.orderItems
      .map(item => `${item.qty}x ${item.name}`)
      .join(', ');
    return `${itemsStr} (₹${(order.totalPrice || 0).toFixed(2)})`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(`Order status updated to ${newStatus}!`);
        fetchOrders();
        // Update selected order modal if open
        if (selectedOrder && selectedOrder._id === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      } else {
        alert('Failed to update order status.');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Orders</h1>
          <p className="text-sm text-slate-500">Track shipments, process invoices, and update delivery states.</p>
        </div>
        
        <button
          onClick={() => setPage('admin-dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Datatable */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-header">Customer Name</th>
                <th className="table-header">Email Address</th>
                <th className="table-header">Phone Number</th>
                <th className="table-header">Order Details</th>
                <th className="table-header">Order Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50/10 transition-colors">
                  <td className="table-cell font-bold text-slate-800">{o.shippingAddress?.name}</td>
                  <td className="table-cell text-slate-600">{o.shippingAddress?.email}</td>
                  <td className="table-cell text-slate-600 font-semibold">{o.shippingAddress?.phone}</td>
                  <td className="table-cell text-slate-500 font-medium max-w-xs truncate" title={getOrderDetailsSummary(o)}>
                    {getOrderDetailsSummary(o)}
                  </td>
                  <td className="table-cell">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                      className={`font-bold px-3 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        o.status === 'Delivered' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : o.status === 'Shipped' 
                            ? 'bg-amber-50 border-amber-200 text-amber-600' 
                            : o.status === 'Packed'
                              ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                              : o.status === 'Processing'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="View Receipt"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL: Order Receipts and items */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
          />

          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-xl mx-4 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-3 mb-6 flex flex-col sm:flex-row justify-between sm:items-center">
              <span>Receipt ID: {selectedOrder._id.substring(0, 12)}...</span>
              <span className="text-xs font-semibold text-slate-400">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
            </h3>

            <div className="space-y-6 text-xs text-slate-600">
              
              {/* Order Status Bar */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center">
                  <Truck className="h-4.5 w-4.5 mr-1.5 text-brand-600" />
                  Delivery Management:
                </span>
                
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  className={`font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                    selectedOrder.status === 'Delivered' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                      : selectedOrder.status === 'Shipped' 
                        ? 'bg-amber-50 border-amber-200 text-amber-600' 
                        : selectedOrder.status === 'Packed'
                          ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                          : selectedOrder.status === 'Processing'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Items</h4>
                <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                  {selectedOrder.orderItems?.map((item) => (
                    <div 
                      key={item.product}
                      className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-xl"
                    >
                      <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded-lg border" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-800 truncate">{item.name}</h5>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.qty}x @ ₹{item.price?.toFixed(2)}</span>
                      </div>
                      <span className="font-bold text-slate-800">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Customer Details
                  </h4>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800">{selectedOrder.shippingAddress?.name}</div>
                    <div>Email: {selectedOrder.shippingAddress?.email}</div>
                    <div>Phone: {selectedOrder.shippingAddress?.phone}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Address</h4>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1">
                    <div>{selectedOrder.shippingAddress?.address}</div>
                    <div>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</div>
                    <div>{selectedOrder.shippingAddress?.country}</div>
                  </div>
                </div>
              </div>

              {/* Price calculations */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">Total Price Paid:</span>
                <span className="text-lg font-extrabold text-slate-900">₹{selectedOrder.totalPrice?.toFixed(2)}</span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
