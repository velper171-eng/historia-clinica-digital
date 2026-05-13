'use client';

import Link from "next/link";
import { PlusCircle, Database, ArrowRight, ClipboardList } from "lucide-react";
import { useFormStore } from "@/lib/form-store";

export default function Home() {
  const reset = useFormStore((s) => s.reset);

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-blush px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <div className="mb-8 flex justify-center animate-in fade-in zoom-in duration-1000">
            <img 
              src="/logo-reliv.png" 
              alt="RELIV Centro de Bienestar" 
              className="h-48 w-auto object-contain drop-shadow-2xl mix-blend-multiply" 
            />
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-stone md:text-6xl font-serif">
            Historia Clínica <span className="text-sage">Digital</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-bold text-stone/80 sm:text-xl">
            Gestión profesional de registros clínicos para medicina estética. 
            Seguridad, precisión y rapidez en cada procedimiento.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Opción: Nueva Historia */}
          <Link
            href="/nueva"
            onClick={() => reset()}
            className="group relative flex flex-col rounded-3xl border border-stone/20 bg-white p-8 shadow-sm transition-all hover:border-sage hover:shadow-2xl hover:shadow-sage/10"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand/30 text-sage transition-colors group-hover:bg-sage group-hover:text-white">
              <PlusCircle size={28} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-stone">
              Nueva Historia Clínica
            </h2>
            <p className="mb-6 text-stone/70">
              Inicie el protocolo de evaluación para nuevos pacientes. Este módulo integra el diligenciamiento de anamnesis, consentimiento informado legalmente vinculante y herramientas de mapeo facial de alta precisión.
            </p>
            <div className="mt-auto flex items-center font-semibold text-sage transition-transform group-hover:translate-x-1">
              Comenzar ahora <ArrowRight className="ml-2" size={18} />
            </div>
          </Link>

          {/* Opción: Historia Existente */}
          <Link
            href="/existentes"
            className="group relative flex flex-col rounded-3xl border border-stone/20 bg-white p-8 shadow-sm transition-all hover:border-stone hover:shadow-2xl hover:shadow-stone/10"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand/30 text-stone transition-colors group-hover:bg-stone group-hover:text-white">
              <Database size={28} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-stone">
              Historias Existentes
            </h2>
            <p className="mb-6 text-stone/70">
              Acceda a la base de datos centralizada para el seguimiento evolutivo de pacientes. Permite la edición técnica de registros previos, revisión de antecedentes y exportación de documentación clínica en formatos oficiales
            </p>
            <div className="mt-auto flex items-center font-semibold text-stone transition-transform group-hover:translate-x-1">
              Buscar paciente <ArrowRight className="ml-2" size={18} />
            </div>
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold text-stone/40 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sage" />
            Consentimiento Digital
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sage" />
            Mapeo Facial HD
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sage" />
            Exportación PDF/Word
          </div>
        </div>
      </div>
    </main>
  );
}
