'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, User, Calendar, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFormStore } from '@/lib/form-store';

import { AuthGate } from '@/components/auth-gate';

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

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Evitar que se active el handleSelect
    if (!confirm(`¿Estás seguro de que deseas eliminar la historia clínica de ${name || 'este paciente'}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('historias_clinicas')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      // Actualizar el estado local
      setRecords(records.filter(r => r.id !== id));
      alert('Registro eliminado correctamente.');
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el registro.');
    }
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-blush pb-20">
        <header className="sticky top-0 z-10 border-b border-stone/10 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-stone/60 hover:text-stone transition-colors">
              <ArrowLeft size={16} /> Volver al inicio
            </Link>
            <h1 className="text-lg font-bold text-stone">Historias Clínicas Existentes</h1>
            <div className="w-20" />
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 pt-8">
          {/* Buscador */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre del paciente o documento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-stone/10 bg-white py-4 pl-12 pr-4 text-lg shadow-sm focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/5 transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone/50">
              <Loader2 className="mb-4 animate-spin text-sage" size={40} />
              <p className="font-bold uppercase tracking-widest text-[10px]">Cargando registros...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
              <p>{error}</p>
              <button onClick={fetchRecords} className="mt-4 font-semibold underline">Reintentar</button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-stone/20 p-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sand/30 text-stone/30">
                <User size={32} />
              </div>
              <h3 className="text-lg font-bold text-stone">No se encontraron pacientes</h3>
              <p className="text-stone/50 font-medium">Intenta con otro nombre o documento, o crea una nueva historia.</p>
              <Link href="/nueva" className="mt-6 inline-block rounded-xl bg-stone px-6 py-3 font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-stone/20">
                Crear Nueva Historia
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleSelect(record)}
                  className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-stone/10 bg-white p-5 text-left shadow-sm transition-all hover:border-sage hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/30 text-sage group-hover:bg-sage group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone">
                        {record.paciente_nombre || 'Sin nombre'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-stone/50 font-medium">
                        <span className="flex items-center gap-1">
                          Doc: {record.paciente_documento || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleDelete(e, record.id, record.paciente_nombre)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-stone/20 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Eliminar registro"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="flex items-center gap-2 text-stone/20 group-hover:text-sage transition-colors">
                      <span className="text-xs font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-tighter">Continuar</span>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGate>
  );
}
