import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash, Edit, TrendingUp, ShoppingBag, Calendar, Eye, Users, CheckCircle, Sparkles, X, Gift, AlertCircle } from 'lucide-react';

const FestivalManagement = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form Fields State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  
  // Theme Color Configurations
  const [themePrimary, setThemePrimary] = useState('#EA580C');
  const [themeSecondary, setThemeSecondary] = useState('#D97706');
  const [themeText, setThemeText] = useState('#7C2D12');
  const [themeBg, setThemeBg] = useState('#FFEDD5');
  const [themeBorder, setThemeBorder] = useState('#FED7AA');
  const [themeBadgeBg, setThemeBadgeBg] = useState('#FFEDD5');
  const [themeBadgeText, setThemeBadgeText] = useState('#9A3412');
  const [themeBadgeLabel, setThemeBadgeLabel] = useState('⭐ Bestseller');

  // Arrays
  const [featuredProductsStr, setFeaturedProductsStr] = useState('');
  const [offers, setOffers] = useState([]);
  const [newOffer, setNewOffer] = useState({ title: '', type: 'discount', value: 0 });
  const [giftBoxes, setGiftBoxes] = useState([]);
  const [newBox, setNewBox] = useState({ name: '', price: 0, contentsStr: '', description: '', image: '' });

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/festivals', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      } else {
        throw new Error('Failed to load campaigns catalog');
      }
    } catch (err) {
      setError(err.message || 'Error fetching campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Format date helper for html inputs
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setKey('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setBannerImage('');
    setThemePrimary('#EA580C');
    setThemeSecondary('#D97706');
    setThemeText('#7C2D12');
    setThemeBg('#FFEDD5');
    setThemeBorder('#FED7AA');
    setThemeBadgeBg('#FFEDD5');
    setThemeBadgeText('#9A3412');
    setThemeBadgeLabel('⭐ Bestseller');
    setFeaturedProductsStr('');
    setOffers([]);
    setGiftBoxes([]);
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (campaign) => {
    setEditingId(campaign._id);
    setName(campaign.name);
    setKey(campaign.key);
    setDescription(campaign.description);
    setStartDate(formatDateForInput(campaign.startDate));
    setEndDate(formatDateForInput(campaign.endDate));
    setBannerImage(campaign.bannerImage);
    setThemePrimary(campaign.theme?.primaryColor || '#EA580C');
    setThemeSecondary(campaign.theme?.secondaryColor || '#D97706');
    setThemeText(campaign.theme?.textColor || '#7C2D12');
    setThemeBg(campaign.theme?.bgColor || '#FFEDD5');
    setThemeBorder(campaign.theme?.borderColor || '#FED7AA');
    setThemeBadgeBg(campaign.theme?.badgeBg || '#FFEDD5');
    setThemeBadgeText(campaign.theme?.badgeText || '#9A3412');
    setThemeBadgeLabel(campaign.theme?.badgeLabel || '⭐ Bestseller');
    setFeaturedProductsStr(campaign.featuredProducts?.join(', ') || '');
    setOffers(campaign.offers || []);
    setGiftBoxes(campaign.giftBoxes || []);
    setShowModal(true);
  };

  // Save (Create/Update) campaign
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    
    // Parse arrays
    const featuredProds = featuredProductsStr.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      key,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      bannerImage,
      theme: {
        primaryColor: themePrimary,
        secondaryColor: themeSecondary,
        textColor: themeText,
        bgColor: themeBg,
        borderColor: themeBorder,
        badgeBg: themeBadgeBg,
        badgeText: themeBadgeText,
        badgeLabel: themeBadgeLabel
      },
      featuredProducts: featuredProds,
      offers,
      giftBoxes
    };

    try {
      const url = editingId ? `/api/festivals/${editingId}` : '/api/festivals';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingId ? 'Campaign updated!' : 'Campaign created!');
        setShowModal(false);
        fetchCampaigns();
      } else {
        const data = await res.json();
        alert(data.message || 'Error saving campaign');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating campaign');
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign? All analytics data will be lost.')) return;

    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert('Campaign deleted successfully.');
        fetchCampaigns();
      } else {
        alert('Error deleting campaign.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Offers management
  const handleAddOffer = () => {
    if (!newOffer.title) return;
    setOffers([...offers, { ...newOffer, value: Number(newOffer.value) }]);
    setNewOffer({ title: '', type: 'discount', value: 0 });
  };

  const handleRemoveOffer = (idx) => {
    setOffers(offers.filter((_, i) => i !== idx));
  };

  // Gift Box management
  const handleAddGiftBox = () => {
    if (!newBox.name || !newBox.price) return;
    const contents = newBox.contentsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    setGiftBoxes([...giftBoxes, {
      name: newBox.name,
      price: Number(newBox.price),
      contents,
      description: newBox.description,
      image: newBox.image || 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=600&q=80'
    }]);

    setNewBox({ name: '', price: 0, contentsStr: '', description: '', image: '' });
  };

  const handleRemoveGiftBox = (idx) => {
    setGiftBoxes(giftBoxes.filter((_, i) => i !== idx));
  };

  // Analytics helper metrics
  const now = new Date();
  const activeCamp = campaigns.find(f => new Date(f.startDate) <= now && new Date(f.endDate) >= now);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.analytics?.revenue || 0), 0);
  const totalOrders = campaigns.reduce((acc, c) => acc + (c.analytics?.orderCount || 0), 0);
  const totalViews = campaigns.reduce((acc, c) => acc + (c.analytics?.views || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.analytics?.conversions || 0), 0);
  
  // Calculate average conversion rate
  const avgConversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold text-slate-650">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Festival Countdown Store Management</h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">Control seasonal banners, countdowns, gifts, and promotions.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="btn-primary py-2.5 px-4 font-bold flex items-center space-x-1.5 shadow-md shadow-brand-500/10 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Launch New Campaign</span>
        </button>
      </div>

      {/* 1. CAMPAIGN ANALYTICS OVERVIEW */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Festival Campaign</span>
            <div className="text-sm font-bold text-slate-800 flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
              {activeCamp ? activeCamp.name : 'None Active'}
            </div>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Calendar className="h-5 w-5" /></div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Campaign Revenue Generated</span>
            <div className="text-base font-black text-slate-800">₹{totalRevenue}</div>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Campaign Orders Log</span>
            <div className="text-base font-black text-slate-800">{totalOrders} Orders</div>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShoppingBag className="h-5 w-5" /></div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg. Campaign Conversion Rate</span>
            <div className="text-base font-black text-slate-800">{avgConversionRate}%</div>
          </div>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Eye className="h-5 w-5" /></div>
        </div>

      </section>

      {/* 2. CAMPAIGNS LIST TABLE */}
      <section className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-medium">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Calendar className="h-12 w-12 text-slate-350 mx-auto" />
            <h3 className="font-bold text-slate-700">No campaigns created yet.</h3>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-medium">Launch a seasonal campaign to customize the storefront look dynamically.</p>
          </div>
        ) : (
          <div className="responsive-table-container">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="table-header">Campaign / Key</th>
                  <th className="table-header">Active Dates</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Views / Orders</th>
                  <th className="table-header">Revenue</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  const start = new Date(camp.startDate);
                  const end = new Date(camp.endDate);
                  const isActive = start <= now && end >= now;
                  const isUpcoming = start > now;
                  const isPast = end < now;

                  let badgeClass = 'text-rose-600 bg-rose-50 border-rose-100';
                  let badgeText = 'Expired / Past';

                  if (isActive) {
                    badgeClass = 'text-emerald-600 bg-emerald-50 border-emerald-100 animate-pulse';
                    badgeText = 'Live / Active';
                  } else if (isUpcoming) {
                    badgeClass = 'text-amber-600 bg-amber-50 border-amber-100';
                    badgeText = 'Upcoming';
                  }

                  return (
                    <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="table-cell">
                        <div className="font-bold text-slate-800">{camp.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">/{camp.key}</div>
                      </td>
                      <td className="table-cell font-medium">
                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </td>
                      <td className="table-cell font-semibold">
                        <div className="flex items-center text-slate-600">
                          <Eye className="h-3 w-3 mr-1 text-slate-400" /> {camp.analytics?.views || 0} views
                        </div>
                        <div className="flex items-center text-slate-500 text-[10px] mt-0.5">
                          <ShoppingBag className="h-3 w-3 mr-1 text-slate-400" /> {camp.analytics?.orderCount || 0} orders
                        </div>
                      </td>
                      <td className="table-cell font-bold text-slate-850">
                        ₹{camp.analytics?.revenue || 0}
                      </td>
                      <td className="table-cell text-right space-x-2">
                        <button 
                          onClick={() => handleOpenEdit(camp)}
                          className="p-1.5 border hover:bg-brand-50 border-slate-200 hover:border-brand-200 text-slate-600 hover:text-brand-650 rounded-lg cursor-pointer outline-none"
                          title="Edit Campaign Details"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCampaign(camp._id)}
                          className="p-1.5 border hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-500 rounded-lg cursor-pointer outline-none"
                          title="Delete Campaign"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. ADD/EDIT CAMPAIGN MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center">
                <Sparkles className="h-5 w-5 mr-1 text-brand-600" />
                {editingId ? 'Edit Festival Campaign' : 'Configure New Festival Campaign'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 outline-none cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCampaign} className="p-6 space-y-6">
              
              {/* Row 1: Core Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Campaign Name</label>
                  <input type="text" required placeholder="e.g. Holi Special" value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2 px-3 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">URL Slug / Key</label>
                  <input type="text" required placeholder="e.g. holi-special" disabled={!!editingId} value={key} onChange={(e) => setKey(e.target.value)} className="input-field py-2 px-3 text-xs disabled:bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Banner Image URL</label>
                  <input type="text" required placeholder="Unsplash or uploaded image URL" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="input-field py-2 px-3 text-xs" />
                </div>
              </div>

              {/* Row 2: Dates & Products */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Campaign Start Date</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field py-2 px-3 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Campaign End Date</label>
                  <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field py-2 px-3 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Promoted Product Names (comma separated)</label>
                  <input type="text" placeholder="e.g. Dry Fruit Modak, Amla Juice" value={featuredProductsStr} onChange={(e) => setFeaturedProductsStr(e.target.value)} className="input-field py-2 px-3 text-xs" />
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Campaign Description</label>
                <textarea required rows="2" placeholder="Write a catchy tagline or introduction for this seasonal theme page." value={description} onChange={(e) => setDescription(e.target.value)} className="input-field py-2 px-3 text-xs" />
              </div>

              {/* Row 4: Theme Color Customization */}
              <div className="border border-slate-100 p-4 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-800 flex items-center">
                  Theme Customizer & Aesthetics Settings
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Primary Hex</label>
                    <input type="color" value={themePrimary} onChange={(e) => setThemePrimary(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Secondary Hex</label>
                    <input type="color" value={themeSecondary} onChange={(e) => setThemeSecondary(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Text Color</label>
                    <input type="color" value={themeText} onChange={(e) => setThemeText(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Bg Hex</label>
                    <input type="color" value={themeBg} onChange={(e) => setThemeBg(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Badge Label / Title</label>
                    <input type="text" placeholder="e.g. 🥭 Seasonal Special" value={themeBadgeLabel} onChange={(e) => setThemeBadgeLabel(e.target.value)} className="input-field py-2 px-3 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Badge Text Color</label>
                    <input type="color" value={themeBadgeText} onChange={(e) => setThemeBadgeText(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Badge Background</label>
                    <input type="color" value={themeBadgeBg} onChange={(e) => setThemeBadgeBg(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 outline-none" />
                  </div>
                </div>
              </div>

              {/* Row 5: Offers Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-100 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center">
                    Offers Configuration
                  </h4>

                  <div className="flex items-end gap-2 text-xs">
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] text-slate-400 font-bold">Offer title</label>
                      <input type="text" placeholder="Buy 2 Get 1 Free" value={newOffer.title} onChange={(e) => setNewOffer(p => ({ ...p, title: e.target.value }))} className="input-field py-1.5 px-3 text-xs" />
                    </div>
                    <button type="button" onClick={handleAddOffer} className="btn-secondary py-2 font-bold cursor-pointer">Add</button>
                  </div>

                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {offers.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic">No offers defined yet.</div>
                    ) : (
                      offers.map((o, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700">{o.title}</span>
                          <button type="button" onClick={() => handleRemoveOffer(idx)} className="text-rose-500 hover:text-rose-600 outline-none cursor-pointer"><Trash className="h-3.5 w-3.5" /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Gift Boxes Config */}
                <div className="border border-slate-100 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center">
                    Custom Curated Gift Boxes
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Box Name" value={newBox.name} onChange={(e) => setNewBox(p => ({ ...p, name: e.target.value }))} className="input-field py-1.5 px-3 text-xs" />
                      <input type="number" placeholder="Price (₹)" value={newBox.price || ''} onChange={(e) => setNewBox(p => ({ ...p, price: e.target.value }))} className="input-field py-1.5 px-3 text-xs" />
                    </div>
                    <input type="text" placeholder="Included contents (comma separated)" value={newBox.contentsStr} onChange={(e) => setNewBox(p => ({ ...p, contentsStr: e.target.value }))} className="input-field py-1.5 px-3 text-xs" />
                    <input type="text" placeholder="Box Image URL" value={newBox.image} onChange={(e) => setNewBox(p => ({ ...p, image: e.target.value }))} className="input-field py-1.5 px-3 text-xs" />
                    <textarea rows="1" placeholder="Description of the Box..." value={newBox.description} onChange={(e) => setNewBox(p => ({ ...p, description: e.target.value }))} className="input-field py-1.5 px-3 text-xs" />
                    <button type="button" onClick={handleAddGiftBox} className="w-full btn-secondary py-1.5 font-bold cursor-pointer">Add Gift Box</button>
                  </div>

                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {giftBoxes.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic">No gift boxes defined.</div>
                    ) : (
                      giftBoxes.map((gb, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="font-bold text-slate-800 block">{gb.name} (₹{gb.price})</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{gb.contents?.join(', ')}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveGiftBox(idx)} className="text-rose-500 hover:text-rose-600 outline-none cursor-pointer"><Trash className="h-3.5 w-3.5" /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary py-2 px-6 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-8 font-bold cursor-pointer">Save Campaign</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FestivalManagement;
