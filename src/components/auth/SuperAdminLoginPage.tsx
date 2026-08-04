import React, { useState } from 'react';
import { api } from '../../services/api';
import { AuthUser } from './LoginPage';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Server, KeyRound } from 'lucide-react';

interface SuperAdminLoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const SuperAdminLoginPage: React.FC<SuperAdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your Super Admin email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your master password.');
      return;
    }

    setIsLoading(true);
    try {
      const loginResult = await api.login(email, password, 'platform_master');
      setIsLoading(false);

      if (loginResult && loginResult.success && loginResult.user) {
        // Security check: reject company users trying to access the superadmin portal
        const role = loginResult.user.role;
        const isSuperAdmin = role === 'superadmin' || role === 'super_admin';
        if (!isSuperAdmin) {
          setErrorMsg('Access denied. This portal is restricted to platform super administrators only.');
          return;
        }

        // Store session under dedicated superadmin key for getSuperAdminHeader()
        localStorage.setItem('payrollpro_superadmin_session', JSON.stringify({
          token: loginResult.token,
          user: loginResult.user
        }));

        onLoginSuccess(loginResult.user);
      } else {
        setErrorMsg(loginResult?.message || 'Invalid Super Admin credentials. Access denied.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Could not connect to authentication server.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Animated Gradient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-extrabold text-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white font-serif">
              PayrollPro Control Plane
            </span>
            <span className="block text-[10px] text-emerald-400 font-mono tracking-wider uppercase">
              Super Admin Fleet & Tenant Management
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 border border-emerald-800/60 rounded-full px-3 py-1 bg-emerald-950/40 backdrop-blur-md">
          <Server className="w-3.5 h-3.5" />
          <span>Platform Control Plane • Restricted Access</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/30 relative">
          
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-white mb-1 font-serif">
              Super Admin Sign In
            </h1>
            <p className="text-xs text-slate-400">
              Master authentication for multi-tenant SaaS fleet provisioning
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Super Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@payrollpro.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Access Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Platform Control Plane</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-4 text-center text-[11px] text-slate-500">
        PayrollPro Superadmin Portal &copy; {new Date().getFullYear()} • Restricted Administrator Access
      </footer>
    </div>
  );
};
