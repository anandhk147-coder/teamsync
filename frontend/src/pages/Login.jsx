import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, Check, Shield, User as UserIcon, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCard, setActiveCard] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (role, testEmail, testPass) => {
    setActiveCard(role);
    setEmail(testEmail);
    setPassword(testPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F2F5] font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 mb-1">TeamSync</h1>
          <p className="text-[14px] text-slate-500">Log in to your account</p>
        </div>

        {/* Quick Login Cards */}
        <div className="mb-6">
          <div className="text-[11px] uppercase text-slate-400 font-bold tracking-widest text-center mb-3">
            Quick Login
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Admin Card */}
            <div 
              onClick={() => handleQuickLogin('admin', 'admin@app.com', 'Admin@1234')}
              className={`relative bg-white rounded-[10px] p-[14px] cursor-pointer transition-all duration-150 border ${
                activeCard === 'admin' 
                  ? 'border-[#378ADD] shadow-[0_2px_8px_rgba(55,138,221,0.15)]' 
                  : 'border-[#E0E3EA] hover:border-[#378ADD] hover:shadow-[0_2px_8px_rgba(55,138,221,0.1)]'
              }`}
            >
              {activeCard === 'admin' && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#378ADD] rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-[#378ADD]/10 flex items-center justify-center mb-2">
                <Shield size={16} className="text-[#378ADD]" />
              </div>
              <h3 className="text-[13px] font-semibold text-slate-900">Admin</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">admin@app.com</p>
            </div>

            {/* Member Card */}
            <div 
              onClick={() => handleQuickLogin('member', 'member@test.com', 'Member@1234')}
              className={`relative bg-white rounded-[10px] p-[14px] cursor-pointer transition-all duration-150 border ${
                activeCard === 'member' 
                  ? 'border-[#378ADD] shadow-[0_2px_8px_rgba(55,138,221,0.15)]' 
                  : 'border-[#E0E3EA] hover:border-[#378ADD] hover:shadow-[0_2px_8px_rgba(55,138,221,0.1)]'
              }`}
            >
              {activeCard === 'member' && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#378ADD] rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mb-2">
                <UserIcon size={16} className="text-[#1D9E75]" />
              </div>
              <h3 className="text-[13px] font-semibold text-slate-900">Member</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">member@test.com</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-[32px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-[#378ADD] transition-colors" size={18} />
                <input
                  type="email"
                  className="w-full bg-white border border-[#E0E3EA] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#378ADD] focus:bg-[#F0F6FF] transition-all duration-150 placeholder-slate-400"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-[#378ADD] transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white border border-[#E0E3EA] rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#378ADD] focus:bg-[#F0F6FF] transition-all duration-150 placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-[#378ADD] hover:bg-[#2B6CB8] text-white rounded-[12px] py-3 text-[14px] font-semibold flex items-center justify-center space-x-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ArrowRight size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-center text-red-500 text-[13px] font-medium animate-pulse">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-[13px] text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#378ADD] hover:text-[#2B6CB8] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
