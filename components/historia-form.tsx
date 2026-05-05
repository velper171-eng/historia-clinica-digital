'use client';

import { useMemo, useState } from 'react';
import { useFormStore } from '../lib/form-store';
import { generarHistoriaClinicaPDF } from '../lib/pdf-generator';
import { DiseaseChecklist } from './disease-checklist';
import { AllergyChecklist } from './allergy-checklist';
import { SignaturePad } from './signature-pad';
import { FaceDiagram } from './face-diagram';
import { PdfDocument } from './pdf/pdf-document';
import { INJECTION_POINTS, ZONAS_INYECCION } from '../lib/injection-points';
import { supabase } from '../lib/supabase';

export function HistoriaForm() {
  const data = useFormStore();
  const reset = useFormStore((s) => s.reset);
  const [generating, setGenerating] = useState(false);
  const [generatingWord, setGeneratingWord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const activeIds = useMemo(
    () => new Set(data.puntosInyeccion.filter((p) => p.activo).map((p) => p.id)),
    [data.puntosInyeccion]
  );

  const activosPorZona = useMemo(() => {
    const map = new Map<string, number>();
    for (const z of ZONAS_INYECCION) map.set(z, 0);
    for (const p of data.puntosInyeccion) {
      if (!p.activo) continue;
      const def = INJECTION_POINTS.find((d) => d.id === p.id);
      if (!def) continue;
      map.set(def.zona, (map.get(def.zona) ?? 0) + 1);
    }
    return map;
  }, [data.puntosInyeccion]);

  const totalPuntos = activeIds.size;

  const handleDownload = async () => {
    setGenerating(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 50));
      await generarHistoriaClinicaPDF(data);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadWord = async () => {
    setGeneratingWord(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const { generarHistoriaClinicaWord } = await import('@/lib/docx-generator');
      await generarHistoriaClinicaWord(data);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Error al generar el Word');
    } finally {
      setGeneratingWord(false);
    }
  };

  const handleSave = async () => {
    console.log('Iniciando guardado...', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Presente' : 'Faltante'
    });
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: supabaseError, data: insertData } = await supabase.from('historias_clinicas').insert({
        paciente_nombre: data.consentimiento.nombreCompleto,
        paciente_documento: data.consentimiento.numeroDocumento,
        datos: data,
      }).select();

      if (supabaseError) {
        console.error('Error de Supabase:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Guardado exitoso:', insertData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert('¡Historia clínica guardada con éxito!');
    } catch (e) {
      console.error('Error capturado:', e);
      const msg = e instanceof Error ? e.message : 'Error al guardar en la base de datos';
      setError(msg);
      alert('Error al guardar: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('¿Seguro que desea descartar los datos y empezar una nueva historia clínica?')) {
      reset();
      if (typeof window !== 'undefined') window.location.reload();
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-32">
      {/* ====== HEADER ====== */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-emerald-800">
          Historia clínica
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Historia clínica y seguimiento</h1>
        <p className="mt-1 text-sm text-slate-600">
          Diligencie los campos y descargue el PDF o Word cuando esté listo.
        </p>
      </div>

      {/* ====== SECCIÓN 1: CONSENTIMIENTO ====== */}
      <Section number="1" title="Consentimiento informado">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Yo (nombre completo)
          </label>
          <input
            type="text"
            value={data.consentimiento.nombreCompleto}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ nombreCompleto: e.target.value })
            }
            className={inputClass}
            placeholder="Nombres y apellidos"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de documento</label>
            <select
              value={data.consentimiento.tipoDocumento}
              onChange={(e) =>
                useFormStore.getState().setConsentimiento({
                  tipoDocumento: e.target.value as 'CC' | 'CE' | 'Pasaporte',
                })
              }
              className={inputClass}
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Número de documento</label>
            <input
              type="text"
              value={data.consentimiento.numeroDocumento}
              onChange={(e) =>
                useFormStore.getState().setConsentimiento({ numeroDocumento: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            En pleno uso de mis facultades mentales, autorizo a la profesional
          </label>
          <div className={inputClass + " bg-slate-50 font-semibold text-slate-900"}>
            Isabel Velasquez
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Para la realización de</label>
          <textarea
            rows={2}
            value={data.consentimiento.procedimiento}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ procedimiento: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Riesgos y efectos secundarios informados
          </label>
          <textarea
            rows={3}
            value={data.consentimiento.riesgosInformados}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ riesgosInformados: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Con todo lo anterior, dejo constancia que entendí toda la información suministrada,
          y por ello acepto la realización del procedimiento.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
            <input
              type="date"
              value={data.consentimiento.fecha}
              onChange={(e) =>
                useFormStore.getState().setConsentimiento({ fecha: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <SignaturePad
              value={data.consentimiento.firma}
              onChange={(firma) => useFormStore.getState().setConsentimiento({ firma })}
              label="Firma del paciente"
            />
          </div>
        </div>
      </Section>

      {/* ====== SECCIÓN 2: ANTECEDENTES PATOLÓGICOS PERSONALES ====== */}
      <Section number="2" title="Antecedentes patológicos personales">
        <p className="text-sm text-slate-600">
          Marque las enfermedades que <strong>el paciente</strong> ha sufrido o sufre actualmente.
        </p>
        <DiseaseChecklist
          idPrefix="ant-personales"
          value={data.antecedentesPersonales}
          onChange={useFormStore.getState().setAntecedentesPersonales}
        />
      </Section>

      {/* ====== SECCIÓN 3: ANTECEDENTES PATOLÓGICOS FAMILIARES ====== */}
      <Section number="3" title="Antecedentes patológicos familiares">
        <p className="text-sm text-slate-600">
          Marque las enfermedades que <strong>familiares directos</strong> han sufrido o sufren actualmente.
        </p>
        <DiseaseChecklist
          idPrefix="ant-familiares"
          value={data.antecedentesFamiliares}
          onChange={useFormStore.getState().setAntecedentesFamiliares}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observaciones generales (patológicos)
          </label>
          <textarea
            rows={2}
            value={data.observacionesPatologicos}
            onChange={(e) => useFormStore.getState().setObservacionesPatologicos(e.target.value)}
            className={inputClass}
            placeholder="Detalles adicionales"
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 4: MEDICAMENTOS ====== */}
      <Section number="4" title="Medicamentos">
        <p className="text-sm text-slate-600">
          Describa los medicamentos que toma en casa.
        </p>
        <textarea
          rows={4}
          value={data.medicamentos}
          onChange={(e) => useFormStore.getState().setMedicamentos(e.target.value)}
          className={inputClass}
          placeholder="Liste cada medicamento, dosis y frecuencia"
        />
      </Section>

      {/* ====== SECCIÓN 5: ALERGIAS ====== */}
      <Section number="5" title="Alergias">
        <p className="text-sm text-slate-600">
          Marque las alergias medicamentosas presentadas.
        </p>
        <AllergyChecklist
          value={data.alergicos}
          onChange={useFormStore.getState().setAlergicos}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observaciones (síntomas)
          </label>
          <textarea
            rows={2}
            value={data.observacionesAlergias}
            onChange={(e) => useFormStore.getState().setObservacionesAlergias(e.target.value)}
            className={inputClass}
            placeholder="Síntomas presentados"
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 6: QUIRÚRGICOS ====== */}
      <Section number="6" title="Antecedentes quirúrgicos">
        <textarea
          rows={3}
          value={data.quirurgicos}
          onChange={(e) => useFormStore.getState().setQuirurgicos(e.target.value)}
          className={inputClass}
          placeholder="Cirugías previas y detalles relevantes"
        />
      </Section>

      {/* ====== SECCIÓN 7: CONDICIONES FINALES ====== */}
      <Section number="7" title="Condiciones finales">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ¿Conoce alguna condición que interfiera con la recuperación?
          </label>
          <textarea
            rows={2}
            value={data.condicionRecuperacion}
            onChange={(e) => useFormStore.getState().setCondicionRecuperacion(e.target.value)}
            className={inputClass}
            placeholder='Describa o responda "No"'
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ¿Sabe o sospecha estado de gestación?
          </label>
          <select
            value={data.estadoGestacion}
            onChange={(e) => useFormStore.getState().setEstadoGestacion(e.target.value as 'Sí' | 'No' | 'No aplica')}
            className={inputClass}
          >
            <option value="No">No</option>
            <option value="Sí">Sí</option>
            <option value="No aplica">No aplica</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
            <input
              type="date"
              value={data.fechaFinal}
              onChange={(e) => useFormStore.getState().setFechaFinal(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <SignaturePad
              value={data.firmaFinal}
              onChange={useFormStore.getState().setFirmaFinal}
              label="Firma final del paciente"
            />
          </div>
        </div>
      </Section>

      {/* ====== SECCIÓN 8: EVALUACIÓN FACIAL Y SESIONES ====== */}
      <Section number="8" title="Evaluación facial y sesiones">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de cutis</label>
            <select
              value={data.tipoCutis}
              onChange={(e) => useFormStore.getState().setTipoCutis(e.target.value as "Normal" | "Seca" | "Grasa" | "Mixta")}
              className={inputClass}
            >
              <option value="Normal">Normal</option>
              <option value="Seca">Seca</option>
              <option value="Grasa">Grasa</option>
              <option value="Mixta">Mixta</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sesiones programadas</label>
            <input
              type="number"
              min={1}
              value={data.sesionesProgramadas}
              onChange={(e) => {
                const num = parseInt(e.target.value) || 1;
                useFormStore.getState().setSesionesProgramadas(num);
                const currentFechas = [...data.fechasSesiones];
                while (currentFechas.length < num) currentFechas.push('');
                useFormStore.getState().setFechasSesiones(currentFechas.slice(0, num));
              }}
              className={inputClass}
            />
          </div>
        </div>

        {data.sesionesProgramadas > 0 && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Fechas de sesiones</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: data.sesionesProgramadas }).map((_, i) => (
                <div key={i}>
                  <div className="mb-1 text-xs text-slate-500">Sesión {i + 1}</div>
                  <input
                    type="date"
                    value={data.fechasSesiones[i] || ''}
                    onChange={(e) => {
                      const newFechas = [...data.fechasSesiones];
                      newFechas[i] = e.target.value;
                      useFormStore.getState().setFechasSesiones(newFechas);
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observaciones generales
          </label>
          <textarea
            rows={3}
            value={data.observacionesGenerales}
            onChange={(e) => useFormStore.getState().setObservacionesGenerales(e.target.value)}
            className={inputClass}
            placeholder="Anotaciones adicionales..."
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 9: PUNTOS DE INYECCIÓN ====== */}
      <Section number="9" title="Puntos de inyección">
        <p className="text-sm text-slate-600">
          Haga click en los puntos para marcar dónde se aplicará la toxina.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
          <div className="flex justify-center">
            <FaceDiagram
              activeIds={activeIds}
              onTogglePoint={useFormStore.getState().togglePuntoInyeccion}
              width={460}
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
              <div className="text-2xl font-semibold text-emerald-600">{totalPuntos}</div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Por zona
              </div>
              <ul className="space-y-1 text-sm">
                {ZONAS_INYECCION.map((zona) => {
                  const count = activosPorZona.get(zona) ?? 0;
                  return (
                    <li key={zona} className="flex items-center justify-between">
                      <span className={count > 0 ? 'text-slate-800' : 'text-slate-400'}>{zona}</span>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          count > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500',
                        ].join(' ')}
                      >
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ====== ACCIONES SECUNDARIAS ====== */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Descartar y empezar de nuevo
        </button>
      </div>

      {/* ====== BARRA INFERIOR FIJA: DESCARGAR PDF ====== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{data.consentimiento.nombreCompleto || '—'}</span>
            {' · '}
            <span className="text-slate-500">{totalPuntos} puntos marcados</span>
            {error && <span className="ml-3 text-red-600">{error}</span>}
            {success && <span className="ml-3 font-semibold text-emerald-600">¡Guardado con éxito!</span>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || generating || generatingWord}
              className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : '💾 Guardar'}
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              disabled={generatingWord || generating}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {generatingWord ? 'Generando Word…' : '📝 Descargar Word'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={generating || generatingWord}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {generating ? 'Generando PDF…' : '📄 Descargar PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* PDF oculto */}
      <div
        aria-hidden
        style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none', opacity: 0 }}
      >
        <PdfDocument data={data} />
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
          {number}
        </span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
