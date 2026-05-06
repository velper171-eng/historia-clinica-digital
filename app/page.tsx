'use client';

import Link from "next/link";
import { PlusCircle, Database, ArrowRight, ClipboardList } from "lucide-react";
import { useFormStore } from "@/lib/form-store";

export default function Home() {
  const reset = useFormStore((s) => s.reset);

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <ClipboardList size={32} />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Historia Clínica Digital
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Gestión profesional de registros clínicos para medicina estética. 
            Seguridad, precisión y rapidez en cada procedimiento.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Opción: Nueva Historia */}
          <Link
            href="/nueva"
            onClick={() => reset()}
            className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-50/50"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <PlusCircle size={28} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">
              Nueva Historia Clínica
            </h2>
            <p className="mb-6 text-slate-600">
              Inicie un nuevo registro desde cero. Incluye consentimiento informado, 
              antecedentes y mapeo facial interactivo.
            </p>
            <div className="mt-auto flex items-center font-semibold text-emerald-600 transition-transform group-hover:translate-x-1">
              Comenzar ahora <ArrowRight className="ml-2" size={18} />
            </div>
          </Link>

          {/* Opción: Historia Existente */}
          <Link
            href="/existentes"
            className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Database size={28} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">
              Historias Existentes
            </h2>
            <p className="mb-6 text-slate-600">
              Busque registros anteriores para seguimiento. Edite o descargue 
              documentos de pacientes ya registrados en el sistema.
            </p>
            <div className="mt-auto flex items-center font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
              Buscar paciente <ArrowRight className="ml-2" size={18} />
            </div>
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Consentimiento Digital
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mapeo Facial HD
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Exportación PDF/Word
          </div>
        </div>
      </div>
    </main>
  );
}
