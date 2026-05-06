'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, User, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFormStore } from '@/lib/form-store';

export default function ExistentesPage() {
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const loadData = useFormStore((s) => s.loadData);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('historias_clinicas')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setRecords(data || []);
    } catch (e) {
      console.error(e);
      setError('Error al cargar las historias clínicas');
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((r) =>
    r.paciente_nombre?.toLowerCase().includes(query.toLowerCase()) ||
    r.paciente_documento?.includes(query)
  );

  const handleSelect = (record: any) => {
    // El objeto 'datos' contiene toda la HistoriaClinica
    const fullData = {
      ...record.datos,
      id: record.id, // Aseguramos que el ID de la DB esté presente
    };
    loadData(fullData);
    router.push('/nueva');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Historias Clínicas Existentes</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-8">
        {/* Buscador */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre del paciente o documento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="mb-4 animate-spin" size={40} />
            <p>Cargando registros...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
            <p>{error}</p>
            <button onClick={fetchRecords} className="mt-4 font-semibold underline">Reintentar</button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <User size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No se encontraron pacientes</h3>
            <p className="text-slate-500">Intenta con otro nombre o documento, o crea una nueva historia.</p>
            <Link href="/nueva" className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95">
              Crear Nueva Historia
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {filteredRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => handleSelect(record)}
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-700">
                      {record.paciente_nombre || 'Sin nombre'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        Doc: {record.paciente_documento || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600">
                  <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Continuar</span>
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
