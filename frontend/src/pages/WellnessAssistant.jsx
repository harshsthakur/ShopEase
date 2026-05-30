import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Sparkles, Heart, Citrus, Activity, ShoppingCart, RefreshCw, CheckCircle, ChevronRight, AlertCircle, Info, Calendar } from 'lucide-react';

const WellnessAssistant = ({ setPage }) => {
  const { addToCart } = useCart();

  // Assessment State
  const [step, setStep] = useState('form'); // 'form' or 'results'
  const [formData, setFormData] = useState({
    age: '18–30',
    gender: 'Male',
    lifestyle: 'Working Professional',
    healthGoals: [],
    dietaryPreference: 'No Preference',
    sugarPreference: 'Moderate Sugar'
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const healthGoalsList = [
    'Improve Immunity',
    'Better Digestion',
    'Increase Energy',
    'Weight Management',
    'Healthy Snacking',
    'Family Nutrition',
    'Festival Gifting',
    "Children's Nutrition"
  ];

  const handleGoalToggle = (goal) => {
    setFormData(prev => {
      const goals = prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal];
      return {
        ...prev,
        ...prev,
        healthGoals: goals
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.healthGoals.length === 0) {
      alert('Please select at least one health goal.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/recommendations/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setStep('results');
      } else {
        alert('Failed to analyze wellness profile.');
      }
    } catch (err) {
      console.error('Wellness assessment request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    // 1. Add product to local cart state
    addToCart(product, 1);

    // 2. Log conversion in backend
    try {
      await fetch('/api/recommendations/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: results.recommendationId,
          productId: product._id
        })
      });
    } catch (err) {
      console.error('Failed to log conversion details:', err);
    }

    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col justify-center items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-650"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Analyzing wellness profile and catalog ingredients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Page Header */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-center space-y-4 shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900 z-0" />
        <div className="relative z-10 max-w-xl mx-auto space-y-3">
          <span className="inline-flex items-center space-x-1.5 bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-brand-500/20">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>AI Nutrition & Health Advisor</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Wellness Assistant
          </h1>
          <p className="text-slate-350 text-xs sm:text-sm leading-relaxed">
            Discover tailored product recommendations and daily routine schedules mapping organic food ingredients to your active lifestyle.
          </p>
        </div>
      </section>

      {/* QUESTIONNAIRE FORM STEP */}
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-6 sm:p-10 rounded-3xl shadow-sm space-y-8 text-xs text-slate-650">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center">
            Personal Health Assessment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Age Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Age Group</label>
              <select
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="input-field py-2 px-3 text-xs focus:outline-none cursor-pointer"
              >
                <option value="Below 18">Below 18</option>
                <option value="18–30">18–30 years</option>
                <option value="31–45">31–45 years</option>
                <option value="46–60">46–60 years</option>
                <option value="60+">60+ years</option>
              </select>
            </div>

            {/* Gender Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Select Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="input-field py-2 px-3 text-xs focus:outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer Not To Say">Prefer Not To Say</option>
              </select>
            </div>

            {/* Lifestyle Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Current Lifestyle</label>
              <select
                value={formData.lifestyle}
                onChange={(e) => setFormData(prev => ({ ...prev, lifestyle: e.target.value }))}
                className="input-field py-2 px-3 text-xs focus:outline-none cursor-pointer"
              >
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Athlete">Athlete / Active Gymgoer</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Senior Citizen">Senior Citizen</option>
              </select>
            </div>

          </div>

          {/* Health Goals Checklist (Multi select) */}
          <div className="space-y-3 pt-4 border-t border-slate-50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">4. What are your Health Goals? (Select one or more)</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {healthGoalsList.map((goal) => {
                const isSelected = formData.healthGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-4 border rounded-2xl flex flex-col justify-between items-start text-left cursor-pointer transition-all duration-200 outline-none select-none ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-sm' 
                        : 'border-slate-100 hover:border-slate-350 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-xs">{goal}</span>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => {}} 
                      className="mt-2.5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer" 
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary & Sugar preference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            
            {/* Dietary preferences */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">5. Dietary Preference</label>
              <div className="grid grid-cols-3 gap-3">
                {['Vegetarian', 'Vegan', 'No Preference'].map((pref) => {
                  const isSelected = formData.dietaryPreference === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, dietaryPreference: pref }))}
                      className={`py-2 px-3 border rounded-xl font-bold transition-all text-center cursor-pointer outline-none ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50 text-brand-700' 
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sugar preference */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">6. Sugar Restriction Preference</label>
              <div className="grid grid-cols-3 gap-3">
                {['Low Sugar', 'Moderate Sugar', 'No Restriction'].map((pref) => {
                  const isSelected = formData.sugarPreference === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sugarPreference: pref }))}
                      className={`py-2 px-3 border rounded-xl font-bold transition-all text-center cursor-pointer outline-none ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50 text-brand-700' 
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Submit button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              className="btn-primary w-full py-3 font-bold text-sm flex items-center justify-center space-x-1.5"
            >
              <span>Analyze & Generate Wellness Profile</span>
              <Sparkles className="h-4.5 w-4.5" />
            </button>
          </div>

        </form>
      )}

      {/* RESULTS DISPLAY STEP */}
      {step === 'results' && results && (
        <div className="space-y-10">
          
          {/* Split Analytics Section: Wellness Score & Routine */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Box: Wellness Score Circular Progress Card */}
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 flex flex-col items-center text-center">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
                <Activity className="h-4.5 w-4.5 text-brand-650 mr-1.5" />
                Current Wellness Score
              </h3>
              
              {/* Circular progress SVG */}
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute transform -rotate-95 w-full h-full">
                  <circle cx="64" cy="64" r="54" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle cx="64" cy="64" r="54" stroke="#0ea5e9" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 54}
                          strokeDashoffset={2 * Math.PI * 54 * (1 - results.wellnessScore / 100)}
                          strokeLinecap="round" />
                </svg>
                <span className="text-2xl font-black text-slate-800">{results.wellnessScore}<span className="text-xs text-slate-400 font-semibold">/100</span></span>
              </div>

              {/* Suggestions to improve */}
              <div className="space-y-3.5 text-left pt-4 border-t border-slate-50 w-full text-[11px] text-slate-500 font-medium">
                <span className="font-bold text-slate-700 text-xs block">Actionable Suggestions</span>
                {results.suggestions?.map((tip, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Monthly Wellness Routine timeline (2/3 width) */}
            <div className="md:col-span-2 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
                <Calendar className="h-4.5 w-4.5 text-brand-650 mr-1.5 animate-pulse-subtle" />
                Your Recommended Daily Routine
              </h3>

              <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
                {/* Morning */}
                <div className="relative">
                  <span className="absolute -left-9.5 top-0.5 h-7 w-7 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center font-bold text-[10px] border border-amber-100">AM</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-850 text-xs">Morning Routine</h4>
                    <p className="text-xs text-slate-500 font-semibold">{results.routine.morning}</p>
                  </div>
                </div>

                {/* Afternoon */}
                <div className="relative">
                  <span className="absolute -left-9.5 top-0.5 h-7 w-7 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center font-bold text-[10px] border border-emerald-100">PM</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-850 text-xs">Afternoon Routine</h4>
                    <p className="text-xs text-slate-500 font-semibold">{results.routine.afternoon}</p>
                  </div>
                </div>

                {/* Evening */}
                <div className="relative">
                  <span className="absolute -left-9.5 top-0.5 h-7 w-7 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center font-bold text-[10px] border border-indigo-100">PM</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-850 text-xs">Evening Routine</h4>
                    <p className="text-xs text-slate-500 font-semibold">{results.routine.evening}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* AI Recommended Products Cards Grid */}
          <section className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">AI Recommended Products</h3>
              <p className="text-xs text-slate-450">Specifically matched to your health goals, lifestyle, and dietary preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {results.recommendations?.map((prod) => (
                <div key={prod._id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    {/* Image Header with Match Score */}
                    <div className="h-44 overflow-hidden relative">
                      <img src={prod.image !== 'fff' ? prod.image : 'https://images.unsplash.com/photo-1546173152-318e7b25572c?auto=format&fit=crop&w=600&q=80'} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <span className="absolute top-3 right-3 bg-brand-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-full border border-brand-500 flex items-center space-x-1 shadow">
                        <Sparkles className="h-3 w-3 text-amber-300 mr-0.5" />
                        Match: {prod.matchScore}%
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3.5">
                      <div className="space-y-1">
                        <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">{prod.category}</span>
                        <h4 className="font-extrabold text-slate-800 text-sm truncate">{prod.name}</h4>
                      </div>

                      {/* Matching Explanation Engine */}
                      <div className="bg-teal-50/50 border border-teal-100 p-3 rounded-xl text-teal-800 text-[10px] font-semibold flex items-start leading-relaxed">
                        <Info className="h-3.5 w-3.5 text-teal-650 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>{prod.explanation}</span>
                      </div>
                      
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3">{prod.description}</p>
                    </div>
                  </div>

                  {/* Pricing and Cart button */}
                  <div className="p-5 pt-0 border-t border-slate-50 mt-2 flex items-center justify-between">
                    <span className="text-base font-black text-slate-850">₹{prod.price?.toFixed(2)}</span>
                    
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="btn-primary py-1.5 px-3.5 text-[10px] font-bold flex items-center space-x-1 outline-none cursor-pointer"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reset assessment button */}
          <div className="text-center pt-4">
            <button
              onClick={() => setStep('form')}
              className="btn-secondary py-2.5 px-6 text-xs font-bold flex items-center space-x-1.5 mx-auto cursor-pointer outline-none"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retake Health Assessment</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default WellnessAssistant;
