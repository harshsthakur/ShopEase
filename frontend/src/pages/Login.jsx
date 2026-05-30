import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = ({ setPage }) => {
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
        setPage('home');
      }
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl space-y-6 animate-fade-in">
      <div className="text-center space-y-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h1>
        <p className="text-xs text-slate-400 font-medium">
          Welcome back! Access your account, wishlist, and orders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Mail className="h-3.5 w-3.5 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Lock className="h-3.5 w-3.5 mr-1" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg border border-rose-100 font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2.5"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Info helper */}
      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] space-y-1 text-slate-500 font-medium">
        <div className="font-bold text-slate-700 uppercase tracking-wider">Demo Credentials:</div>
        <div>Customer: <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">customer@shopease.com</span> / password: <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">customer123</span></div>
        <div>Admin: <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">admin@shopease.com</span> / password: <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">admin123</span></div>
      </div>

      <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
        New to ShopEase?{' '}
        <button
          onClick={() => setPage('register')}
          className="text-brand-600 font-semibold hover:underline outline-none cursor-pointer"
        >
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default Login;
