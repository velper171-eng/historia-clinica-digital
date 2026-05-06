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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone/90 backdrop-blur-md px-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="overflow-hidden rounded-3xl border border-stone/10 bg-white shadow-2xl">
          <div className="bg-sage p-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold">Acceso Privado</h2>
            <p className="mt-2 text-white/80 text-sm font-medium">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-stone/30" size={18} />
                <input
                  type="text"
                  placeholder="Usuario"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full rounded-xl border border-stone/10 bg-blush/30 py-2.5 pl-10 pr-4 text-stone placeholder:text-stone/30 focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/5 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-stone/30" size={18} />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full rounded-xl border border-stone/10 bg-blush/30 py-2.5 pl-10 pr-4 text-stone placeholder:text-stone/30 focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/5 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/5 p-3 text-center text-sm font-bold text-red-400 border border-red-500/10">
                Credenciales incorrectas. Intenta de nuevo.
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage py-3.5 font-bold text-white transition-all hover:bg-sage/90 active:scale-[0.98] shadow-lg shadow-sage/20"
            >
              Entrar al sistema <ArrowRight size={18} />
            </button>
          </form>

          <div className="border-t border-stone/5 bg-blush/30 px-8 py-5 flex items-center justify-center gap-2 text-[10px] text-stone/30 uppercase tracking-widest font-black">
            <ShieldCheck size={14} className="text-sage" />
            Conexión Segura Isabel Velasquez
          </div>
        </div>
      </div>
    </div>
  );
}
