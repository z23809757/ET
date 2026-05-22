import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GradientButton } from '../ui/GradientButton';
import { GlassPanel } from '../ui/GlassPanel';
import { Mail, ArrowLeft, Compass, Anchor } from 'lucide-react';
import { AnimeBackground } from '../ui/AnimeBackground';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AnimeBackground variant="default">
        <div className="min-h-screen flex items-center justify-center px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
          >
            <GlassPanel variant="elevated" className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-emerald-cyan/20 border border-accent-emerald/30 mb-4"
              >
                <Mail size={32} className="text-accent-emerald" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white/90 mb-2">Check Your Email</h1>
              <p className="text-white/40 text-sm mb-6">
                We've sent a password reset link to <strong className="text-accent-gold">{email}</strong>
              </p>
              <Link to="/login">
                <GradientButton variant="gold" fullWidth>
                  <ArrowLeft size={16} />
                  Back to Login
                </GradientButton>
              </Link>
            </GlassPanel>
          </motion.div>
        </div>
      </AnimeBackground>
    );
  }

  return (
    <AnimeBackground variant="default">
      <div className="min-h-screen flex items-center justify-center px-4 relative">
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
              <h1 className="text-2xl font-bold text-white/90 mb-2">Forgot Password?</h1>
              <p className="text-white/40 text-sm">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoFocus
                  />
                </div>
              </div>

              <GradientButton
                type="submit"
                variant="gold"
                fullWidth
                loading={isLoading}
                size="lg"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </GradientButton>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-white/40 hover:text-accent-gold transition-colors flex items-center justify-center gap-1">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </AnimeBackground>
  );
};