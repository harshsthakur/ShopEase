import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const AdminLogin = ({ setPage }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result.success) {
      if (result.role === 'admin') {
        setPage('admin-dashboard');
      } else {
        // Log out immediately if customer logs in to admin portal
        setError('Access Denied: Customer accounts are not authorized to access the Admin Console.');
        setLoading(false);
      }
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 text-slate-100 rounded-3xl shadow-2xl space-y-6 animate-fade-in border border-slate-800">
      
      <div className="text-center space-y-2">
        <div className="h-12 w-12 bg-brand-600/20 text-brand-400 rounded-full flex items-center justify-center mx-auto border border-brand-500/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Console Login</h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Secure Administrator Sign-In
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Email</label>
          <input
            type="email"
            required
            placeholder="admin@shopease.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/40 text-rose-400 text-xs p-3 rounded-lg border border-rose-900/50 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2.5 mt-2 bg-gradient-to-r from-brand-600 to-violet-600 hover:shadow-brand-500/10"
        >
          {loading ? 'Authenticating...' : 'Enter Console'}
        </button>
      </form>

      <div className="bg-slate-800/50 p-3 rounded-xl text-[10px] text-slate-400 font-semibold space-y-1 text-center">
        <span>Default Admin: </span>
        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white select-all">admin@shopease.com</span>
        <span> / </span>
        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white select-all">admin123</span>
      </div>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
        <button
          onClick={() => setPage('home')}
          className="hover:text-slate-300 font-medium transition-colors outline-none cursor-pointer"
        >
          Return to Customer Storefront
        </button>
      </div>

    </div>
  );
};

export default AdminLogin;
