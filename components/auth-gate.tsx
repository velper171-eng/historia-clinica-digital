'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Lock, User, Key, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, login } = useAuthStore();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación con persistencia
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md px-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-800 shadow-2xl">
          <div className="bg-emerald-600 p-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold">Acceso Privado</h2>
            <p className="mt-2 text-emerald-100 text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Usuario"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm font-medium text-red-400 border border-red-500/20">
                Credenciales incorrectas. Intenta de nuevo.
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-900/20"
            >
              Entrar al sistema <ArrowRight size={18} />
            </button>
          </form>

          <div className="border-t border-slate-700 bg-slate-900/50 px-8 py-4 flex items-center justify-center gap-2 text-[11px] text-slate-500 uppercase tracking-widest font-bold">
            <ShieldCheck size={14} className="text-emerald-500" />
            Conexión Segura Isabel Velasquez
          </div>
        </div>
      </div>
    </div>
  );
}
