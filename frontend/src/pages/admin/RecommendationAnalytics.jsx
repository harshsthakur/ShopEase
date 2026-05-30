import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Sparkles, Heart, Activity, TrendingUp, ShoppingBag, Eye, Users } from 'lucide-react';

const RecommendationAnalytics = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalAssessments: 0,
    goals: [],
    products: [],
    categories: [],
    conversionRate: '0%'
  });

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/recommendations/admin/analytics', { headers: getAuthHeader() });
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch (err) {
      console.error('Error fetching wellness analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-650"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Wellness Analytics</h1>
          <p className="text-sm text-slate-500">Track user health goal choices, product recommendation counts, and conversion rates.</p>
        </div>
        
        <button
          onClick={() => setPage('admin-dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Assessments</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{data.totalAssessments}</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-650">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{data.conversionRate}</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">wellness recommendations</span>
            <span className="text-2xl font-extrabold text-slate-900 block">Personalized</span>
          </div>
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-brand-650">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid of details: Goals vs Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Most Selected Health Goals */}
        <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center">
            <Activity className="h-4.5 w-4.5 text-brand-650 mr-1.5" />
            Most Selected Health Goals
          </h3>
          
          <div className="space-y-3">
            {data.goals.map((g, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-650">
                  <span>{g.goal}</span>
                  <span className="font-bold">{g.count} choices</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (g.count / (data.totalAssessments || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Most Recommended Products */}
        <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center">
            <ShoppingBag className="h-4.5 w-4.5 text-brand-650 mr-1.5" />
            Most Recommended Products
          </h3>

          <div className="responsive-table-container text-[11px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-50 uppercase tracking-wider">
                  <th className="pb-2.5">Product Name</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5 text-right">Recommend Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-650">
                {data.products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20">
                    <td className="py-2.5 font-bold text-slate-800">{p.name}</td>
                    <td className="py-2.5 capitalize">{p.category}</td>
                    <td className="py-2.5 text-right font-black text-brand-650">{p.count} times</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Categories distribution breakdown */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center">
          <Eye className="h-4.5 w-4.5 text-brand-650 mr-1.5" />
          Top Recommended Categories Distribution
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.categories.map((c, idx) => (
            <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{c.category}</span>
              <span className="text-xl font-extrabold text-slate-800">{c.value} Recommendations</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default RecommendationAnalytics;
