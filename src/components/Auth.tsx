import React, { useState } from 'react';
import Logo from './Logo';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  User, 
  Building2, 
  ShieldCheck,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ name: 'Dr. Richardson', role: 'Provider' });
    }, 1500);
  };

  return (
    <div className="flex-1 bg-zinc-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4" iconClassName="w-8 h-8" />
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">Vantum Clinic</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">AI Co-Pilot Care Journey</p>
        </div>

        <motion.div 
          layout
          className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl border border-zinc-100 relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Welcome Back</h2>
              <p className="text-zinc-500 text-sm mt-1">Sign in to access your assigned patient panel.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="doctor@hospital.com"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">256-bit AES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
