import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GradientButton } from '../ui/GradientButton';
import { GlassPanel } from '../ui/GlassPanel';
import { Mail, Lock, Eye, EyeOff, Compass, Anchor } from 'lucide-react';
import { AnimeBackground } from '../ui/AnimeBackground';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back, Captain!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimeBackground variant="default">
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassPanel variant="elevated" className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold-amber/20 border border-accent-gold/30 mb-4"
              >
                <div className="relative">
                  <Compass size={32} className="text-accent-gold" />
                  <Anchor size={14} className="absolute -bottom-1 -right-1 text-accent-cyan" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white/90 mb-2">Welcome Back</h1>
              <p className="text-white/40 text-sm">
                Continue your financial voyage across the Grand Line
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30 transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-all"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button 
                  type="button"
<<<<<<< HEAD
                  onClick={() => toast.info('Reset link would be sent to your email')}
=======
                  onClick={() => toast('Reset link would be sent to your email')}
>>>>>>> eead2da (Small Changes)
                  className="text-xs text-white/30 hover:text-accent-gold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <GradientButton
                type="submit"
                variant="gold"
                fullWidth
                loading={isLoading}
                size="lg"
              >
                {isLoading ? 'Setting sail...' : 'Board the Ship'}
              </GradientButton>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-4">
              <div className="border-t border-white/10" />
            </div>
            
            <div className="text-center mb-4">
              <span className="text-xs text-white/30">New to the crew?</span>
            </div>

            {/* Sign Up Link */}
            <Link to="/signup" className="block">
              <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium text-center">
                Create New Logbook
              </div>
            </Link>
          </GlassPanel>

          {/* Footer */}
          <p className="text-center text-2xs text-white/20 mt-6">
            ⚓ Grand Line Financial Tracker — Chart your course to treasure ⚓
          </p>
        </motion.div>
      </div>
    </AnimeBackground>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> eead2da (Small Changes)
