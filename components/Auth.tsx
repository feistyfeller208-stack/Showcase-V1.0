
import React, { useState } from 'react';
import { LockClosedIcon, EnvelopeIcon, UserIcon, PhoneIcon, TagIcon } from '@heroicons/react/24/outline';
import { signUpWithEmail, signInWithEmail } from '../services/firebase';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  // Added businessType and phone state to match the updated signUpWithEmail signature
  const [businessType, setBusinessType] = useState('Restaurant');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const businessTypes = ['Restaurant', 'Coffee Shop', 'Retail Store', 'Professional Service', 'Real Estate', 'Other'];

  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidPassword = password.length >= 6;
  const isValidBusiness = businessName.length >= 3;
  const isValidPhone = phone.length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        // Fix: Added missing businessType and phone arguments to signUpWithEmail (expected 5, got 3)
        result = await signUpWithEmail(email, password, businessName, businessType, phone);
      }

      // Check result success as firebase service catches internal errors and returns a success flag
      if (result && !result.success) {
        setError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mx-auto mb-4">S</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Showcase</h1>
          <p className="text-slate-500 mt-2 font-medium">Digital catalogs for modern business.</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 transition-all duration-500">
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Business Name" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
                  />
                </div>
                <div className="relative">
                  <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select 
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all appearance-none"
                  >
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone Number" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
                  />
                </div>
              </>
            )}
            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
              />
            </div>
            <div className="relative">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || (isLogin ? (!isValidEmail || !isValidPassword) : (!isValidEmail || !isValidPassword || !isValidBusiness || !isValidPhone))}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? 'Processing...' : (isLogin ? 'Welcome Back' : 'Get Started')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
