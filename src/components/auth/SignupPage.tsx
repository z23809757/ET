import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GradientButton } from '../ui/GradientButton';
import { GlassPanel } from '../ui/GlassPanel';
import { Mail, Lock, User, Eye, EyeOff, Compass, Anchor } from 'lucide-react';
import { AnimeBackground } from '../ui/AnimeBackground';
import toast from 'react-hot-toast';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !displayName) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(email, password, { display_name: displayName });
      toast.success('Welcome aboard! Check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to create account. Email may already be in use.');
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
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-emerald-cyan/20 border border-accent-emerald/30 mb-4"
              >
                <div className="relative">
                  <Compass size={32} className="text-accent-emerald" />
                  <Anchor size={14} className="absolute -bottom-1 -right-1 text-accent-gold" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white/90 mb-2">Start Your Voyage</h1>
              <p className="text-white/40 text-sm">
                Create a logbook to track your financial treasure
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Captain's Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Monkey D. Luffy"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/30 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/30 transition-all"
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/30 transition-all"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/30 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <GradientButton
                type="submit"
                variant="emerald"
                fullWidth
                loading={isLoading}
                size="lg"
                className="mt-4"
              >
                {isLoading ? 'Preparing the ship...' : 'Set Sail!'}
              </GradientButton>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-4">
              <div className="border-t border-white/10" />
            </div>
            
            <div className="text-center mb-4">
              <span className="text-xs text-white/30">Already have a logbook?</span>
            </div>

            {/* Login Link */}
            <Link to="/login" className="block">
              <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium text-center">
                Return to Ship
              </div>
            </Link>
          </GlassPanel>

          {/* Footer */}
          <p className="text-center text-2xs text-white/20 mt-6">
            ⚓ Every great treasure starts with a single step ⚓
          </p>
        </motion.div>
      </div>
    </AnimeBackground>
  );
};