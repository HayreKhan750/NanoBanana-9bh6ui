import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { sendOtp, verifyOtpAndSetPassword, signInWithPassword, mapSupabaseUser } from '@/lib/authService';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'login' | 'register' | 'otp';

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return toast.error('Enter email and password');
    setLoading(true);
    try {
      const user = await signInWithPassword(email, password);
      login(mapSupabaseUser(user));
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await sendOtp(email);
      toast.success('OTP sent to your email');
      setMode('otp');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndRegister() {
    if (!otp || !password) return toast.error('Enter OTP and create a password');
    setLoading(true);
    try {
      const user = await verifyOtpAndSetPassword(email, otp, password);
      login(mapSupabaseUser(user));
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0A0A0F 0%, #1A0A2E 50%, #0A1A2E 100%)" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 opacity-20 blur-3xl rounded-full" style={{ background: "radial-gradient(circle, #F5C518, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 opacity-10 blur-3xl rounded-full" style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: "linear-gradient(135deg, #F5C518, #F0B429)" }}>
            🍌
          </div>
          <h1 className="text-2xl font-black text-white">Nano Banana AI</h1>
          <p className="text-sm text-white/50 mt-1">Cinematic Presentation Studio</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8">
          {mode === 'login' && (
            <>
              <h2 className="text-lg font-bold text-white mb-6">Sign In</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="studio-input w-full pl-10 pr-4 py-3 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="studio-input w-full pl-10 pr-4 py-3 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="btn-banana w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Sign In
                </button>
              </div>
              <p className="text-center text-sm text-white/40 mt-6">
                No account?{' '}
                <button onClick={() => setMode('register')} className="font-semibold" style={{ color: '#F5C518' }}>
                  Create one
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2 className="text-lg font-bold text-white mb-6">Create Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="studio-input w-full pl-10 pr-4 py-3 text-sm"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-xl text-xs text-white/50" style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)" }}>
                  We'll send a 4-digit OTP to verify your email, then you can set your password.
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn-banana w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Send Verification Code
                </button>
              </div>
              <p className="text-center text-sm text-white/40 mt-6">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="font-semibold" style={{ color: '#F5C518' }}>
                  Sign in
                </button>
              </p>
            </>
          )}

          {mode === 'otp' && (
            <>
              <h2 className="text-lg font-bold text-white mb-2">Verify & Set Password</h2>
              <p className="text-sm text-white/50 mb-6">Enter the 4-digit code sent to <span style={{ color: '#F5C518' }}>{email}</span></p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    className="studio-input w-full px-4 py-3 text-center text-2xl font-bold tracking-widest"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="studio-input w-full pl-10 pr-4 py-3 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleVerifyAndRegister}
                  disabled={loading}
                  className="btn-banana w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Create Account & Continue
                </button>
                <button
                  onClick={() => { setMode('register'); setOtp(''); }}
                  className="w-full py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Continue as guest to explore without saving
        </p>
        <button
          onClick={() => navigate('/')}
          className="block mx-auto mt-2 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}
