import Link from 'next/link';
import { HistoriaForm } from '../../components/historia-form';

import { AuthGate } from '../../components/auth-gate';

export default function NuevaHistoria() {
  return (
    <AuthGate>
      <main className="flex-1">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Inicio
            </Link>
            <div className="flex-1 text-center" />
            <div className="w-16" />
          </div>
        </header>
        <HistoriaForm />
      </main>
    </AuthGate>
  );
}
