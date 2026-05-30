import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldAlert, Award, Lock, CheckCircle, Calendar, MapPin, Gift, Bell, Phone, Play, Pause, XCircle, RefreshCw, ChevronRight, Edit2 } from 'lucide-react';

const Profile = ({ setPage }) => {
  const { user, updateProfile, getAuthHeader, checkAuth } = useAuth();

  // Tab State: 'profile', 'subscriptions', 'rewards', 'notifications'
  const [activeTab, setActiveTab] = useState('profile');

  // Existing Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Subscriptions & Notifications state
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [subLoading, setSubLoading] = useState(true);

  // Address edit state
  const [editingAddrSubId, setEditingAddrSubId] = useState(null);
  const [addrForm, setAddrForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India'
  });

  // Plan swap state
  const [swappingPlanSubId, setSwappingPlanSubId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const fetchUserData = async () => {
    setSubLoading(true);
    try {
      const subRes = await fetch('/api/subscriptions/my', { headers: getAuthHeader() });
      const notifRes = await fetch('/api/subscriptions/notifications', { headers: getAuthHeader() });
      const plansRes = await fetch('/api/subscriptions/plans');

      if (subRes.ok) {
        const subs = await subRes.json();
        setMySubscriptions(subs);
      }
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }
      if (plansRes.ok) {
        const plans = await plansRes.json();
        setAvailablePlans(plans);
      }
    } catch (err) {
      console.error('Error fetching subscription/rewards details:', err);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Existing Profile Submit handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await updateProfile(name, email, password || null);
    if (result.success) {
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.message || 'Profile update failed');
    }
    setLoading(false);
  };

  // Subscription Actions
  const handleUpdateStatus = async (subId, action) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert(`Subscription updated successfully!`);
        fetchUserData();
      } else {
        alert('Failed to update subscription status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Address edit handlers
  const handleStartEditAddress = (sub) => {
    setEditingAddrSubId(sub._id);
    setAddrForm({
      name: sub.deliveryAddress.name,
      phone: sub.deliveryAddress.phone,
      address: sub.deliveryAddress.address,
      city: sub.deliveryAddress.city,
      postalCode: sub.deliveryAddress.postalCode,
      country: sub.deliveryAddress.country || 'India'
    });
  };

  const handleSaveAddress = async (e, subId) => {
    e.preventDefault();

    // Validate phone number starting with +91 and 10 digits
    const phone = addrForm.phone.trim();
    if (!phone.startsWith('+91')) {
      alert('Phone number must start with country code +91');
      return;
    }
    
    const digitsOnly = phone.replace('+91', '');
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(digitsOnly)) {
      alert('Please enter a valid 10-digit phone number after +91.');
      return;
    }

    try {
      const res = await fetch(`/api/subscriptions/${subId}/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(addrForm)
      });

      if (res.ok) {
        alert('Shipping address updated!');
        setEditingAddrSubId(null);
        fetchUserData();
      } else {
        alert('Failed to save address.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Plan swapping handler
  const handleSavePlanSwap = async (subId) => {
    if (!selectedPlanId) return;
    const newPlanObj = availablePlans.find(p => p.planId === selectedPlanId);
    if (!newPlanObj) return;

    try {
      const res = await fetch(`/api/subscriptions/${subId}/change-plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          newPlanId: newPlanObj.planId,
          newPlanName: newPlanObj.name,
          newPrice: newPlanObj.price,
          newProducts: newPlanObj.includes.map(name => ({ name, qty: 1 }))
        })
      });

      if (res.ok) {
        alert(`Plan successfully changed to ${newPlanObj.name}!`);
        setSwappingPlanSubId(null);
        fetchUserData();
      } else {
        alert('Failed to change plan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Renewal Simulation
  const handleSimulateRenewal = async (subId) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}/renew-simulate`, {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Monthly renewal successful! You earned ${data.pointsEarned} Wellness Points.`);
        checkAuth(); // sync user balance points in header context
        fetchUserData();
      } else {
        alert('Renewal simulation failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Wellness points redemptions
  const handleRedeemPoints = async (rewardType, cost) => {
    if ((user.wellnessPoints || 0) < cost) {
      alert('Insufficient Wellness Points.');
      return;
    }

    try {
      const res = await fetch('/api/subscriptions/redeem-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ rewardType, cost })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Redemption successful! Claim code: ${data.code}`);
        checkAuth(); // sync profile points
        fetchUserData();
      } else {
        alert('Redemption failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side: Navigation Links & User Badge */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4 text-center">
            <div className="h-16 w-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto border-4 border-brand-100 shadow-inner">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-brand-650 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Points: {user?.wellnessPoints || 0}
              </span>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-purple-650 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  Admin Access
                </span>
              )}
            </div>
          </div>

          {/* Nav Tabs List */}
          <nav className="flex flex-col space-y-1 text-xs font-semibold text-slate-650">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer outline-none ${
                activeTab === 'profile' ? 'bg-brand-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border border-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4.5 w-4.5" />
                <span>Account Profile</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer outline-none ${
                activeTab === 'subscriptions' ? 'bg-brand-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border border-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4.5 w-4.5" />
                <span>My Subscriptions</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer outline-none ${
                activeTab === 'rewards' ? 'bg-brand-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border border-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gift className="h-4.5 w-4.5" />
                <span>Wellness Rewards</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer outline-none ${
                activeTab === 'notifications' ? 'bg-brand-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border border-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="h-4.5 w-4.5" />
                <span>Notifications Center</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer outline-none ${
                activeTab === 'achievements' ? 'bg-brand-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border border-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="h-4.5 w-4.5" />
                <span>Achievements & Badges</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>

        {/* Right Side: Tab Contents Panel */}
        <div className="md:col-span-3">
          
          {/* TAB 1: PROFILE INFORMATION */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
                Update Profile Details
              </h2>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field py-2 px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field py-2 px-3 text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-4 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-slate-400" />
                    Change Password (Optional)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field py-2 px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field py-2 px-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg border border-rose-100 font-medium flex items-center">
                    <ShieldAlert className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-lg border border-emerald-100 font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    Profile updated successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-2.5 text-sm cursor-pointer"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ACTIVE SUBSCRIPTION MANAGEMENT */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-xs">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
                My Subscription Boxes
              </h2>

              {subLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
                </div>
              ) : mySubscriptions.length === 0 ? (
                <div className="text-center py-10 space-y-4 text-slate-400 font-medium">
                  <p>You do not have any active monthly wellness subscription boxes yet.</p>
                  <button 
                    onClick={() => setPage('subscriptions')}
                    className="btn-primary py-2.5 px-6 font-bold"
                  >
                    Browse Subscription Plans
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {mySubscriptions.map((sub) => (
                    <div key={sub._id} className="border border-slate-150 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm hover:shadow transition-shadow">
                      
                      {/* Subscription Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-slate-800 text-sm flex items-center">
                            {sub.planName}
                            <span className={`ml-2 inline-flex items-center text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              sub.status === 'Active' 
                                ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                                : sub.status === 'Paused' 
                                  ? 'text-amber-600 bg-amber-50 border-amber-100' 
                                  : 'text-rose-600 bg-rose-50 border-rose-100'
                            }`}>
                              {sub.status}
                            </span>
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">ID: {sub._id}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-brand-600">₹{sub.price}<span className="text-xs text-slate-400 font-medium">/mo</span></div>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5 font-medium text-slate-600">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deliveries Schedule</span>
                          <div className="flex items-center"><Calendar className="h-4 w-4 text-slate-400 mr-2" /> Next Delivery: <strong className="text-slate-800 ml-1">{sub.nextDeliveryDate}</strong></div>
                          <div className="flex items-center"><RefreshCw className="h-4 w-4 text-slate-400 mr-2" /> Next Renewal: <strong className="text-slate-800 ml-1">{sub.renewalDate}</strong></div>
                        </div>

                        {/* Inclusions list */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Packed</span>
                          <div className="flex flex-wrap gap-1">
                            {sub.products?.map((item, idx) => (
                              <span key={idx} className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                                {item.qty}x {item.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-1.5 text-slate-600 font-medium">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Address</span>
                            {editingAddrSubId !== sub._id && (
                              <button onClick={() => handleStartEditAddress(sub)} className="text-[10px] font-bold text-brand-600 hover:underline flex items-center cursor-pointer outline-none">
                                <Edit2 className="h-3 w-3 mr-0.5" /> Edit
                              </button>
                            )}
                          </div>

                          {editingAddrSubId === sub._id ? (
                            <form onSubmit={(e) => handleSaveAddress(e, sub._id)} className="space-y-2 border border-brand-100 p-3 rounded-xl bg-slate-50/50 mt-1">
                              <input type="text" required placeholder="Name" className="input-field py-1 px-2.5 text-[11px]" value={addrForm.name} onChange={(e) => setAddrForm(prev => ({ ...prev, name: e.target.value }))} />
                              <input type="text" required placeholder="Phone (+91XXXXXXXXXX)" className="input-field py-1 px-2.5 text-[11px]" value={addrForm.phone} onChange={(e) => setAddrForm(prev => ({ ...prev, phone: e.target.value }))} />
                              <input type="text" required placeholder="Address" className="input-field py-1 px-2.5 text-[11px]" value={addrForm.address} onChange={(e) => setAddrForm(prev => ({ ...prev, address: e.target.value }))} />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" required placeholder="City" className="input-field py-1 px-2.5 text-[11px]" value={addrForm.city} onChange={(e) => setAddrForm(prev => ({ ...prev, city: e.target.value }))} />
                                <input type="text" required placeholder="PIN" className="input-field py-1 px-2.5 text-[11px]" value={addrForm.postalCode} onChange={(e) => setAddrForm(prev => ({ ...prev, postalCode: e.target.value }))} />
                              </div>
                              <div className="flex space-x-2 pt-1 font-bold">
                                <button type="button" onClick={() => setEditingAddrSubId(null)} className="w-1/2 btn-secondary py-1 text-[10px] cursor-pointer">Cancel</button>
                                <button type="submit" className="w-1/2 btn-primary py-1 text-[10px] cursor-pointer">Save</button>
                              </div>
                            </form>
                          ) : (
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[11px] space-y-1">
                              <div className="font-bold text-slate-800">{sub.deliveryAddress.name}</div>
                              <div className="flex items-center font-bold text-slate-600"><Phone className="h-3 w-3 mr-1" /> {sub.deliveryAddress.phone}</div>
                              <div className="flex items-start text-slate-500 font-semibold"><MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" /> {sub.deliveryAddress.address}, {sub.deliveryAddress.city}, {sub.deliveryAddress.postalCode}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Management control actions */}
                      <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2.5">
                        
                        {/* Pause / Resume Button */}
                        {sub.status === 'Active' ? (
                          <button
                            onClick={() => handleUpdateStatus(sub._id, 'pause')}
                            className="btn-secondary py-1.5 px-4 font-bold flex items-center space-x-1 border-amber-100 text-amber-600 hover:bg-amber-50 cursor-pointer"
                          >
                            <Pause className="h-3.5 w-3.5" />
                            <span>Pause Subscription</span>
                          </button>
                        ) : sub.status === 'Paused' ? (
                          <button
                            onClick={() => handleUpdateStatus(sub._id, 'resume')}
                            className="btn-primary py-1.5 px-4 font-bold flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Resume Subscription</span>
                          </button>
                        ) : null}

                        {/* Cancel Button */}
                        {sub.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(sub._id, 'cancel')}
                            className="btn-secondary py-1.5 px-4 font-bold flex items-center space-x-1 border-rose-100 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel Subscription</span>
                          </button>
                        )}

                        {/* Upgrade / Downgrade change-plan triggers */}
                        {sub.status !== 'Cancelled' && (
                          <div className="relative flex items-center">
                            {swappingPlanSubId === sub._id ? (
                              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl animate-fade-in">
                                <select 
                                  value={selectedPlanId}
                                  onChange={(e) => setSelectedPlanId(e.target.value)}
                                  className="border p-1 bg-white focus:outline-none rounded text-[10px] font-bold"
                                >
                                  <option value="">Select plan...</option>
                                  {availablePlans.filter(p => p.planId !== sub.planId && p.isActive).map(p => (
                                    <option key={p.planId} value={p.planId}>{p.name} (₹{p.price})</option>
                                  ))}
                                  {sub.planId !== 'custom-box' && <option value="custom-box">Custom Build Box</option>}
                                </select>
                                <button onClick={() => handleSavePlanSwap(sub._id)} disabled={!selectedPlanId} className="btn-primary py-1 px-2.5 text-[10px] cursor-pointer disabled:opacity-50">Confirm</button>
                                <button onClick={() => setSwappingPlanSubId(null)} className="btn-secondary py-1 px-2.5 text-[10px] cursor-pointer">X</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setSwappingPlanSubId(sub._id); setSelectedPlanId(''); }}
                                className="btn-secondary py-1.5 px-4 font-bold flex items-center space-x-1 border-brand-100 text-brand-650 hover:bg-brand-50 cursor-pointer"
                              >
                                <span>Change Plan</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* RENEWAL SIMULATION TOOL BUTTON */}
                        {sub.status === 'Active' && (
                          <button
                            onClick={() => handleSimulateRenewal(sub._id)}
                            className="ml-auto btn-secondary py-1.5 px-4 bg-brand-50 font-bold border-brand-200 text-brand-650 hover:bg-brand-100 flex items-center space-x-1 cursor-pointer animate-pulse-subtle"
                            title="Simulate renewal transaction to earn wellness points"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Simulate Renewal (+50 Pts)</span>
                          </button>
                        )}

                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WELLNESS REWARDS PORTAL */}
          {activeTab === 'rewards' && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-8 text-xs text-slate-650">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
                Wellness Rewards Center
              </h2>

              {/* Point Status Widget */}
              <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 rounded-3xl text-white flex items-center justify-between shadow-lg">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-brand-200">Total Balance</span>
                  <div className="text-3xl font-black">{user?.wellnessPoints || 0} <span className="text-sm font-semibold text-brand-100">Wellness Points</span></div>
                  <p className="text-[10px] text-brand-100">Earn 50 points for every successful monthly box renewal!</p>
                </div>
                <Gift className="h-12 w-12 text-brand-200 animate-pulse-subtle" />
              </div>

              {/* Redemption Store */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Redeem Points Store</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Coupon 1 */}
                  <div className="border border-slate-100 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-850 text-xs">15% Discount Code</h4>
                      <p className="text-[10px] text-slate-450 font-medium">Claim a promo code for 15% off standard orders.</p>
                      <div className="text-brand-600 font-bold text-xs">Cost: 200 Points</div>
                    </div>
                    <button 
                      onClick={() => handleRedeemPoints('15 Percent Discount Coupon', 200)}
                      disabled={(user?.wellnessPoints || 0) < 200}
                      className="w-full btn-primary py-2 text-[10px] cursor-pointer disabled:opacity-50"
                    >
                      Redeem Coupon
                    </button>
                  </div>

                  {/* Coupon 2 */}
                  <div className="border border-slate-100 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-850 text-xs">Free Delivery Coupon</h4>
                      <p className="text-[10px] text-slate-450 font-medium">Get a coupon to skip delivery fees on your next order.</p>
                      <div className="text-brand-600 font-bold text-xs">Cost: 300 Points</div>
                    </div>
                    <button 
                      onClick={() => handleRedeemPoints('Free Delivery Coupon', 300)}
                      disabled={(user?.wellnessPoints || 0) < 300}
                      className="w-full btn-primary py-2 text-[10px] cursor-pointer disabled:opacity-50"
                    >
                      Redeem Coupon
                    </button>
                  </div>

                  {/* Coupon 3 */}
                  <div className="border border-slate-100 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-850 text-xs">Free Product Coupon</h4>
                      <p className="text-[10px] text-slate-450 font-medium">Claim code to get a free jar of jam or Amla product.</p>
                      <div className="text-brand-600 font-bold text-xs">Cost: 500 Points</div>
                    </div>
                    <button 
                      onClick={() => handleRedeemPoints('Free Jam Product Coupon', 500)}
                      disabled={(user?.wellnessPoints || 0) < 500}
                      className="w-full btn-primary py-2 text-[10px] cursor-pointer disabled:opacity-50"
                    >
                      Redeem Coupon
                    </button>
                  </div>

                </div>
              </div>

              {/* Claims History */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-sm">Claimed Reward Codes</h3>
                <div className="space-y-2">
                  {notifications.filter(n => n.message.includes('Claim Code')).length === 0 ? (
                    <div className="text-slate-450 py-2 font-medium">No coupons claimed yet. Redemptions will appear here.</div>
                  ) : (
                    notifications.filter(n => n.message.includes('Claim Code')).map((notif, idx) => {
                      const msgParts = notif.message.split('Claim Code:');
                      const title = msgParts[0].replace('Successfully redeemed', '').replace('points for:', '').trim();
                      const code = msgParts[1]?.trim();
                      return (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 border p-3 rounded-xl">
                          <span className="font-bold text-slate-700">{title}</span>
                          <span className="bg-brand-50 border border-brand-200 text-brand-700 font-mono font-black text-xs px-3 py-1 rounded-lg">
                            {code}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS CENTER */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-xs text-slate-650">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
                Notifications Center
              </h2>

              {subLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  No subscription notifications received yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {notifications.map((notif) => {
                    let typeClass = 'bg-slate-50 border-slate-100 text-slate-700';
                    if (notif.type === 'renewal_success' || notif.type === 'delivered') {
                      typeClass = 'bg-emerald-50 border-emerald-100 text-emerald-800';
                    } else if (notif.type === 'renewal_alert' || notif.type === 'shipped') {
                      typeClass = 'bg-amber-50 border-amber-100 text-amber-800';
                    }
                    
                    return (
                      <div key={notif._id} className={`p-4 border rounded-2xl space-y-1.5 ${typeClass}`}>
                        <div className="flex justify-between font-bold">
                          <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-semibold">{notif.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS & BADGES */}
          {activeTab === 'achievements' && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-xs text-slate-650">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
                <Award className="h-5 w-5 mr-1.5 text-brand-600 animate-pulse-subtle" />
                My Festival Achievements & Badges
              </h2>
              
              <p className="text-slate-450 font-medium">
                Collect custom medals by ordering seasonal favorites, sending gifts to loved ones, and participating in wellness campaigns.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {[
                  {
                    name: '🏅 Ganesh Chaturthi Shopper',
                    description: 'Awarded when placing an order with Ganesh Chaturthi Box or a Modak during Ganesh Chaturthi campaign.',
                    hint: 'Buy a Modak or Ganesh Chaturthi Box during the Ganesh Chaturthi festival.'
                  },
                  {
                    name: '🏅 Mango Season Explorer',
                    description: 'Awarded when placing an order with Mango Celebration Box or a Mango product during Mango Season campaign.',
                    hint: 'Buy mango juice, pickle, pulp, or mango celebration box during mango season.'
                  },
                  {
                    name: '🏅 Wellness Champion',
                    description: 'Awarded when placing an order with Diwali Wellness Box or an Amla product.',
                    hint: 'Order Amla Candy, Amla Juice, Amla Powder, or a Diwali Wellness Box.'
                  },
                  {
                    name: '🏅 Festival Gift Master',
                    description: 'Awarded when placing an order with Send As Gift option checked.',
                    hint: 'Place any order and toggle "Send as Premium Gift" at checkout.'
                  }
                ].map((badge, idx) => {
                  const userBadges = user?.badges || [];
                  const isUnlocked = userBadges.includes(badge.name);

                  return (
                     <div 
                       key={idx} 
                       className={`border rounded-2xl p-5 flex items-start space-x-4 transition-all duration-300 shadow-sm ${
                         isUnlocked 
                           ? 'bg-gradient-to-br from-amber-50/40 to-yellow-50/40 border-amber-200' 
                           : 'bg-slate-50/50 border-slate-150 opacity-60'
                       }`}
                     >
                       <div 
                         className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border ${
                           isUnlocked 
                             ? 'bg-amber-100 border-amber-200 text-amber-700' 
                             : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'
                         }`}
                       >
                         {isUnlocked ? '🌟' : '🔒'}
                       </div>

                       <div className="space-y-1">
                         <h4 className={`font-bold text-xs ${isUnlocked ? 'text-amber-900' : 'text-slate-500'}`}>
                           {badge.name}
                         </h4>
                         <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                           {badge.description}
                         </p>
                         {!isUnlocked && (
                           <span className="text-[9px] text-slate-450 font-bold block italic">
                             How to unlock: {badge.hint}
                           </span>
                         )}
                         {isUnlocked && (
                           <span className="inline-flex items-center text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1">
                             Unlocked / Earned
                           </span>
                         )}
                       </div>
                     </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;
