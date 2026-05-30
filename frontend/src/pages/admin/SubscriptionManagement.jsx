import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, Phone, MapPin, Calendar, Activity, Plus, Edit, Trash2, Check, RefreshCw, X, ShieldAlert, Award, DollarSign, Truck } from 'lucide-react';

const SubscriptionManagement = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [subscribers, setSubscribers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState({
    activeSubscribers: 0,
    monthlyRecurringRevenue: 0,
    totalSubscriptions: 0,
    growthRate: '+0.0%'
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  // CRUD Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    includes: '',
    benefits: '',
    color: 'emerald',
    image: ''
  });
  const [planError, setPlanError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const subRes = await fetch('/api/subscriptions/admin/list', { headers: getAuthHeader() });
      const statsRes = await fetch('/api/subscriptions/admin/analytics', { headers: getAuthHeader() });
      const plansRes = await fetch('/api/subscriptions/plans');

      if (subRes.ok) {
        const subsData = await subRes.json();
        setSubscribers(subsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAnalytics(statsData);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
    } catch (err) {
      console.error('Error fetching admin subscription details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update subscriber status (Pause/Resume/Cancel)
  const handleUpdateSubStatus = async (subId, action) => {
    if (!confirm(`Are you sure you want to ${action} this subscription?`)) return;
    try {
      const res = await fetch(`/api/subscriptions/${subId}/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert(`Subscription ${action}d successfully!`);
        fetchDashboardData();
        setSelectedSub(null);
      } else {
        alert('Failed to update subscription status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Manage subscriber delivery status
  const handleManageDelivery = async (subId, status) => {
    try {
      const res = await fetch(`/api/subscriptions/admin/${subId}/delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ deliveryStatus: status })
      });

      if (res.ok) {
        alert(`Shipment marked as ${status}! User notified.`);
        fetchDashboardData();
        setSelectedSub(null);
      } else {
        alert('Failed to update shipment.');
      }
    } catch (err) {
      console.error('Error updating shipment details:', err);
    }
  };

  // Toggle plan active status
  const handleTogglePlanStatus = async (planId) => {
    try {
      const res = await fetch(`/api/subscriptions/plans/${planId}/status`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to toggle status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle plan delete
  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      const res = await fetch(`/api/subscriptions/plans/${planId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert('Subscription plan deleted!');
        fetchDashboardData();
      } else {
        alert('Failed to delete plan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle CRUD Form submission
  const handleOpenPlanModal = (plan = null) => {
    setPlanError('');
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        price: plan.price.toString(),
        includes: plan.includes.join(', '),
        benefits: plan.benefits.join(', '),
        color: plan.color,
        image: plan.image
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: '',
        price: '',
        includes: '',
        benefits: '',
        color: 'emerald',
        image: ''
      });
    }
    setShowPlanModal(true);
  };

  const handlePlanFormSubmit = async (e) => {
    e.preventDefault();
    setPlanError('');

    const url = editingPlan ? `/api/subscriptions/plans/${editingPlan._id}` : '/api/subscriptions/plans';
    const method = editingPlan ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(planForm)
      });

      if (res.ok) {
        alert(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
        setShowPlanModal(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        setPlanError(data.message || 'Error processing plan form.');
      }
    } catch (err) {
      setPlanError('Network error connecting to API.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscriptions Management</h1>
          <p className="text-sm text-slate-500">Track subscribers list, configure monthly plans, and dispatch recurring box shipments.</p>
        </div>
        
        <button
          onClick={() => setPage('admin-dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Subscribers</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{analytics.activeSubscribers}</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recurring Revenue (MRR)</span>
            <span className="text-2xl font-extrabold text-slate-900 block">₹{analytics.monthlyRecurringRevenue?.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-brand-650">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Box Registrations</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{analytics.totalSubscriptions}</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Growth Momentum</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{analytics.growthRate}</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main subscribers table */}
      <section className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-base">Subscribers Overview</h3>
        </div>

        <div className="responsive-table-container">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider">
                <th className="table-header">Subscriber</th>
                <th className="table-header">Box Plan</th>
                <th className="table-header">Monthly Price</th>
                <th className="table-header">Renewal Date</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-semibold">No subscriptions purchased yet.</td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/10 transition-colors">
                    <td className="table-cell">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">{sub.shippingAddress?.name}</div>
                        <div className="text-[10px] text-slate-400">{sub.userEmail}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] border">
                        {sub.planName}
                      </span>
                    </td>
                    <td className="table-cell font-bold text-slate-900">₹{sub.price}</td>
                    <td className="table-cell text-slate-500 font-semibold">{sub.renewalDate}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        sub.status === 'Active' 
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                          : sub.status === 'Paused' 
                            ? 'text-amber-600 bg-amber-50 border-amber-100' 
                            : 'text-rose-600 bg-rose-50 border-rose-100'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <button 
                        onClick={() => setSelectedSub(sub)} 
                        className="btn-secondary py-1 px-3 text-[10px] cursor-pointer"
                      >
                        Manage Shipment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Plan Configurations Editor CRUD */}
      <section className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-base">Subscription Plans Catalog</h3>
          <button 
            onClick={() => handleOpenPlanModal()}
            className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="border border-slate-100 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">{plan.name}</h4>
                  <span className={`h-2.5 w-2.5 rounded-full ${plan.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <div className="text-lg font-black text-brand-650">₹{plan.price}<span className="text-xs text-slate-400 font-medium">/mo</span></div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Includes: {plan.includes.join(', ')}</p>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-50 text-[10px] font-bold">
                <button 
                  onClick={() => handleOpenPlanModal(plan)} 
                  className="flex-1 btn-secondary py-1 text-slate-600 hover:text-slate-900 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleTogglePlanStatus(plan._id)} 
                  className={`flex-1 py-1 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    plan.isActive 
                      ? 'bg-amber-50 border-amber-250 text-amber-600 hover:bg-amber-100' 
                      : 'bg-emerald-50 border-emerald-250 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {plan.isActive ? 'Pause' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDeletePlan(plan._id)}
                  className="btn-secondary py-1 px-2.5 text-rose-500 hover:bg-rose-50 border-rose-100 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: SHIPMENT AND STATUS UPDATES */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div onClick={() => setSelectedSub(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
          
          <div className="relative bg-white w-full max-w-md mx-4 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 animate-slide-up space-y-6 text-xs text-slate-600">
            <button 
              onClick={() => setSelectedSub(null)} 
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex justify-between">
              <span>Manage Subscriber: {selectedSub.shippingAddress?.name}</span>
            </h3>

            {/* Plan Info */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Active Subscription:</span>
                <span className="text-brand-600">{selectedSub.planName}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Monthly Pricing:</span>
                <span>₹{selectedSub.price}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Next Delivery Due:</span>
                <span className="text-slate-800 font-semibold">{selectedSub.nextDeliveryDate}</span>
              </div>
            </div>

            {/* Shipping details */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Recipient Address Details
              </h4>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">{selectedSub.shippingAddress?.name}</div>
                <div className="flex items-center text-slate-600 font-semibold"><Phone className="h-3.5 w-3.5 mr-1" /> {selectedSub.shippingAddress?.phone}</div>
                <div>{selectedSub.shippingAddress?.address}, {selectedSub.shippingAddress?.city}, {selectedSub.shippingAddress?.postalCode}</div>
              </div>
            </div>

            {/* Actions triggers */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipment & Status Delivery</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleManageDelivery(selectedSub._id, 'Shipped')}
                  disabled={selectedSub.status !== 'Active'}
                  className="btn-secondary py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1 border-brand-100 text-brand-650 cursor-pointer disabled:opacity-50"
                >
                  <Truck className="h-4 w-4" />
                  <span>Mark Shipped</span>
                </button>
                <button
                  onClick={() => handleManageDelivery(selectedSub._id, 'Delivered')}
                  disabled={selectedSub.status !== 'Active'}
                  className="btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>Mark Delivered</span>
                </button>
              </div>

              {/* Pause/Resume Subscription buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedSub.status === 'Active' ? (
                  <button
                    onClick={() => handleUpdateSubStatus(selectedSub._id, 'pause')}
                    className="w-full btn-secondary py-2 rounded-xl text-amber-600 hover:bg-amber-50 border-amber-100 font-bold cursor-pointer"
                  >
                    Pause Subscription
                  </button>
                ) : selectedSub.status === 'Paused' ? (
                  <button
                    onClick={() => handleUpdateSubStatus(selectedSub._id, 'resume')}
                    className="w-full btn-primary py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold cursor-pointer"
                  >
                    Resume Subscription
                  </button>
                ) : null}

                <button
                  onClick={() => handleUpdateSubStatus(selectedSub._id, 'cancel')}
                  disabled={selectedSub.status === 'Cancelled'}
                  className="w-full btn-secondary py-2 rounded-xl text-rose-500 hover:bg-rose-50 border-rose-100 font-bold cursor-pointer disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAN CRUD MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div onClick={() => setShowPlanModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
          
          <div className="relative bg-white w-full max-w-md mx-4 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 animate-slide-up space-y-4 text-xs text-slate-650">
            <button 
              onClick={() => setShowPlanModal(false)} 
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h3>

            <form onSubmit={handlePlanFormSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan Name</label>
                <input 
                  type="text" 
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field py-2 px-3"
                  placeholder="E.g., Immunity Booster Box"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Price (₹)</label>
                <input 
                  type="number" 
                  required
                  value={planForm.price}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, price: e.target.value }))}
                  className="input-field py-2 px-3"
                  placeholder="E.g., 499"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inclusions (comma separated)</label>
                <input 
                  type="text" 
                  required
                  value={planForm.includes}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, includes: e.target.value }))}
                  className="input-field py-2 px-3"
                  placeholder="Amla Juice, Amla Candy, Amla Powder"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Benefits (comma separated)</label>
                <input 
                  type="text" 
                  required
                  value={planForm.benefits}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, benefits: e.target.value }))}
                  className="input-field py-2 px-3"
                  placeholder="Rich in Vitamin C, Supports Immunity"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Theme Color</label>
                  <select
                    value={planForm.color}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, color: e.target.value }))}
                    className="input-field py-2 px-3 focus:outline-none"
                  >
                    <option value="emerald">Emerald Green (Amla)</option>
                    <option value="amber">Amber Yellow (Mango)</option>
                    <option value="orange">Orange Saffron (Modak)</option>
                    <option value="rose">Berry Red (Fruit Jam)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unsplash Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={planForm.image}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, image: e.target.value }))}
                    className="input-field py-2 px-3"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {planError && (
                <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg border border-rose-100 font-semibold text-[10px]">
                  {planError}
                </div>
              )}

              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="w-1/2 btn-secondary py-2 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 btn-primary py-2 rounded-xl font-bold cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionManagement;
