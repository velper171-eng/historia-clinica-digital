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
import { Edit2, Save, Calendar, Trash2, Info } from 'lucide-react';

export function HistoriaForm() {
  const data = useFormStore();
  const reset = useFormStore((s) => s.reset);
  const [generating, setGenerating] = useState(false);
  const [generatingWord, setGeneratingWord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openHistoryIds, setOpenHistoryIds] = useState<Set<string>>(new Set());

  const toggleHistory = (id: string) => {
    const next = new Set(openHistoryIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenHistoryIds(next);
  };
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
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Primero "comiteamos" lo actual al historial si hay algo nuevo
      useFormStore.getState().commitToHistory();
      
      // Obtenemos los datos actualizados después del commit
      const updatedData = useFormStore.getState();

      const {
        id,
        consentimiento,
        procedimientosAnteriores,
        antecedentesPersonales,
        antecedentesFamiliares,
        observacionesPatologicos,
        observacionesPatologicosAnteriores,
        medicamentos,
        medicamentosAnteriores,
        alergicos,
        observacionesAlergias,
        observacionesAlergiasAnteriores,
        quirurgicos,
        quirurgicosAnteriores,
        condicionRecuperacion,
        condicionRecuperacionAnteriores,
        estadoGestacion,
        tipoCutis,
        sesionesProgramadas,
        fechasSesiones,
        observacionesGenerales,
        observacionesGeneralesAnteriores,
        firmaFinal,
        fechaFinal,
        puntosInyeccion,
      } = updatedData;

      const cleanData = {
        id,
        consentimiento,
        procedimientosAnteriores,
        antecedentesPersonales,
        antecedentesFamiliares,
        observacionesPatologicos,
        observacionesPatologicosAnteriores,
        medicamentos,
        medicamentosAnteriores,
        alergicos,
        observacionesAlergias,
        observacionesAlergiasAnteriores,
        quirurgicos,
        quirurgicosAnteriores,
        condicionRecuperacion,
        condicionRecuperacionAnteriores,
        estadoGestacion,
        tipoCutis,
        sesionesProgramadas,
        fechasSesiones,
        observacionesGenerales,
        observacionesGeneralesAnteriores,
        firmaFinal,
        fechaFinal,
        puntosInyeccion,
      };

      const payload = {
        paciente_nombre: consentimiento.nombreCompleto,
        paciente_documento: consentimiento.numeroDocumento,
        datos: cleanData,
      };

      let result;
      if (id) {
        result = await supabase
          .from('historias_clinicas')
          .upsert({ id, ...payload })
          .select();
      } else {
        result = await supabase
          .from('historias_clinicas')
          .insert(payload)
          .select();
      }

      const { error: supabaseError, data: insertData } = result;

      if (supabaseError) throw supabaseError;
      
      if (!id && insertData && insertData[0]) {
        useFormStore.getState().loadData({ ...cleanData, id: insertData[0].id });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert('¡Historia clínica guardada con éxito!');
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Error al guardar en la base de datos';
      setError(msg);
      alert('Error al guardar: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('¿Desea descartar los cambios realizados en esta sesión? Se mantendrá el historial previo.')) {
      useFormStore.getState().discardCurrentSession();
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-32">
      {/* ====== HEADER ====== */}
      <div className="mb-6 rounded-xl border border-stone/10 bg-white p-5 shadow-sm">
        <div className="mb-1 inline-block rounded-full bg-sand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone">
          Isabel Velasquez
        </div>
        <h1 className="text-2xl font-bold text-stone">Historia clínica y seguimiento</h1>
        <p className="mt-1 text-sm text-stone/60 font-medium">
          Diligencie los campos y descargue el PDF o Word cuando esté listo.
        </p>
      </div>

      {/* ====== SECCIÓN 1: CONSENTIMIENTO ====== */}
      <Section number="1" title="Consentimiento informado">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone">
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
            <label className="mb-1 block text-sm font-medium text-stone">Tipo de documento</label>
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
            <label className="mb-1 block text-sm font-medium text-stone">Número de documento</label>
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
          <label className="mb-1 block text-sm font-medium text-stone">
            En pleno uso de mis facultades mentales, autorizo a la profesional
          </label>
          <div className={inputClass + " bg-blush font-semibold text-stone border-stone/20"}>
            Isabel Velasquez
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-stone">Procedimiento a realizar (Nuevo)</label>
          <textarea
            rows={2}
            value={data.consentimiento.procedimiento}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ procedimiento: e.target.value })
            }
            className={inputClass}
            placeholder="Describa el procedimiento actual..."
          />
          
          <HistoricalEntries 
            title="Procedimientos anteriores"
            entries={data.procedimientosAnteriores}
            onEdit={(idx, val) => useFormStore.getState().updateProcedimientoHistorico(idx, val)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-stone">
            Riesgos y efectos secundarios informados (Nuevo)
          </label>
          <textarea
            rows={3}
            value={data.consentimiento.riesgosInformados}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ riesgosInformados: e.target.value })
            }
            className={inputClass}
            placeholder="Enumere los riesgos informados..."
          />
          <HistoricalEntries 
            title="Riesgos informados anteriormente"
            entries={data.consentimiento.riesgosInformadosAnteriores}
            onEdit={(idx, val) => useFormStore.getState().updateRiesgoHistorico(idx, val)}
          />
        </div>

        <div className="rounded-lg border border-stone/10 bg-blush p-3 text-xs text-stone/60 font-medium italic">
          Con todo lo anterior, dejo constancia que entendí toda la información suministrada,
          y por ello acepto la realización del procedimiento.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone">Fecha</label>
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
        <p className="text-sm text-stone/60 font-medium">
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
        <p className="text-sm text-stone/60 font-medium">
          Marque las enfermedades que <strong>familiares directos</strong> han sufrido o sufren actualmente.
        </p>
        <DiseaseChecklist
          idPrefix="ant-familiares"
          value={data.antecedentesFamiliares}
          onChange={useFormStore.getState().setAntecedentesFamiliares}
        />

        <div>
          <label className="mb-1 block text-sm font-bold text-stone">
            Observaciones generales patológicas (Nuevo)
          </label>
          <textarea
            rows={2}
            value={data.observacionesPatologicos}
            onChange={(e) => useFormStore.getState().setObservacionesPatologicos(e.target.value)}
            className={inputClass}
            placeholder="Detalles adicionales sobre antecedentes"
          />
          <HistoricalEntries 
            title="Observaciones patológicas anteriores"
            entries={data.observacionesPatologicosAnteriores}
            onEdit={(idx, val) => useFormStore.getState().updatePatologicoHistorico(idx, val)}
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 4: MEDICAMENTOS ====== */}
      <Section number="4" title="Medicamentos">
        <p className="text-sm text-stone/60 font-medium">
          Describa los medicamentos que toma en casa.
        </p>
        <label className="mb-1 block text-sm font-bold text-stone">Medicamentos (Nuevo)</label>
        <textarea
          rows={4}
          value={data.medicamentos}
          onChange={(e) => useFormStore.getState().setMedicamentos(e.target.value)}
          className={inputClass}
          placeholder="Liste cada medicamento, dosis y frecuencia"
        />

        <HistoricalEntries 
          title="Medicamentos anteriores"
          entries={data.medicamentosAnteriores}
          onEdit={(idx, val) => useFormStore.getState().updateMedicamentoHistorico(idx, val)}
        />
      </Section>

      {/* ====== SECCIÓN 5: ALERGIAS ====== */}
      <Section number="5" title="Alergias">
        <p className="text-sm text-stone/60 font-medium">
          Marque las alergias medicamentosas presentadas.
        </p>
        <AllergyChecklist
          value={data.alergicos}
          onChange={useFormStore.getState().setAlergicos}
        />
        <div>
          <label className="mb-1 block text-sm font-bold text-stone">
            Observaciones y síntomas de alergias (Nuevo)
          </label>
          <textarea
            rows={2}
            value={data.observacionesAlergias}
            onChange={(e) => useFormStore.getState().setObservacionesAlergias(e.target.value)}
            className={inputClass}
            placeholder="Síntomas presentados..."
          />
          <HistoricalEntries 
            title="Observaciones de alergias anteriores"
            entries={data.observacionesAlergiasAnteriores}
            onEdit={(idx, val) => useFormStore.getState().updateAlergiaHistorico(idx, val)}
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 6: QUIRÚRGICOS ====== */}
      <Section number="6" title="Antecedentes quirúrgicos">
        <label className="mb-1 block text-sm font-bold text-stone">Cirugías (Nuevo)</label>
        <textarea
          rows={3}
          value={data.quirurgicos}
          onChange={(e) => useFormStore.getState().setQuirurgicos(e.target.value)}
          className={inputClass}
          placeholder="Cirugías previas y detalles relevantes"
        />

        <HistoricalEntries 
          title="Antecedentes quirúrgicos anteriores"
          entries={data.quirurgicosAnteriores}
          onEdit={(idx, val) => useFormStore.getState().updateQuirurgicoHistorico(idx, val)}
        />
      </Section>

      {/* ====== SECCIÓN 7: CONDICIONES FINALES ====== */}
      <Section number="7" title="Condiciones finales">
        <div>
          <label className="mb-1 block text-sm font-bold text-stone">
            ¿Conoce alguna condición que interfiera con la recuperación? (Nuevo)
          </label>
          <textarea
            rows={2}
            value={data.condicionRecuperacion}
            onChange={(e) => useFormStore.getState().setCondicionRecuperacion(e.target.value)}
            className={inputClass}
            placeholder='Describa o responda "No"'
          />
          <HistoricalEntries 
            title="Condiciones anteriores informadas"
            entries={data.condicionRecuperacionAnteriores}
            onEdit={(idx, val) => useFormStore.getState().updateCondicionHistorico(idx, val)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone">
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
            <label className="mb-1 block text-sm font-medium text-stone">Fecha</label>
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
            <label className="mb-1 block text-sm font-medium text-stone">Tipo de cutis</label>
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
            <label className="mb-1 block text-sm font-medium text-stone">Sesiones programadas</label>
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
            <label className="mb-2 block text-sm font-medium text-stone font-bold uppercase tracking-widest text-[10px]">Fechas de sesiones</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: data.sesionesProgramadas }).map((_, i) => (
                <div key={i}>
                  <div className="mb-1 text-xs text-stone/50 font-bold uppercase">Sesión {i + 1}</div>
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
          <label className="mb-1 block text-sm font-bold text-stone">
            Observaciones generales (Nuevo)
          </label>
          <textarea
            rows={3}
            value={data.observacionesGenerales}
            onChange={(e) => useFormStore.getState().setObservacionesGenerales(e.target.value)}
            className={inputClass}
            placeholder="Anotaciones adicionales..."
          />
          <HistoricalEntries 
            title="Observaciones generales anteriores"
            entries={data.observacionesGeneralesAnteriores}
            onEdit={(idx, val) => useFormStore.getState().updateObservacionGralHistorico(idx, val)}
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 9: PUNTOS DE INYECCIÓN ====== */}
      <Section number="9" title="Puntos de inyección">
        <p className="text-sm text-stone/60 font-medium">
          Haga click en los puntos para marcar dónde se aplicará la toxina.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
          <div className="flex justify-center rounded-3xl bg-blush/30 p-4 border border-stone/5">
            <FaceDiagram
              activeIds={activeIds}
              onTogglePoint={useFormStore.getState().togglePuntoInyeccion}
              width={460}
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-stone/10 bg-white p-4 shadow-sm">
              <div className="text-[10px] uppercase tracking-widest font-bold text-stone/40">Total</div>
              <div className="text-3xl font-bold text-sage">{totalPuntos}</div>
            </div>

            <div className="rounded-2xl border border-stone/10 bg-white p-4 overflow-hidden shadow-sm">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone/40">
                Detalle por punto
              </div>
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-sand scrollbar-track-transparent">
                {ZONAS_INYECCION.map((zona) => {
                  const puntosEnZona = data.puntosInyeccion.filter(p => {
                    const def = INJECTION_POINTS.find(d => d.id === p.id);
                    return def?.zona === zona && (p.activo || p.aplicacionesAnteriores.length > 0);
                  });

                  if (puntosEnZona.length === 0) return null;

                  return (
                    <div key={zona} className="border-b border-stone/5 pb-2 last:border-0">
                      <div className="text-[9px] font-black text-stone/30 uppercase mb-2 tracking-tighter">{zona}</div>
                      {puntosEnZona.map(p => {
                        const def = INJECTION_POINTS.find(d => d.id === p.id);
                        return (
                          <div key={p.id} className="mb-3 last:mb-0">
                            <div className="flex items-center justify-between text-sm">
                              <span className={p.activo ? 'font-bold text-stone' : 'text-stone/30'}>
                                {def?.nombre}
                              </span>
                              <div className="flex items-center gap-2">
                                {p.activo && (
                                  <>
                                    <input
                                      type="number"
                                      min={0}
                                      placeholder="U"
                                      className="w-12 rounded-lg border border-stone/10 bg-blush/30 px-1 py-1 text-center text-xs font-bold text-stone"
                                      value={p.unidades || ''}
                                      onChange={(e) => useFormStore.getState().setPuntoUnidades(p.id, parseInt(e.target.value) || 0)}
                                    />
                                      <button
                                        type="button"
                                        onClick={() => toggleHistory(p.id)}
                                        className={`transition-colors ${openHistoryIds.has(p.id) ? 'text-sage' : 'text-stone/20 hover:text-sage'}`}
                                        title="Ver historial de aplicaciones"
                                      >
                                        <Info size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => useFormStore.getState().removePuntoInyeccion(p.id)}
                                        className="text-stone/20 hover:text-red-400 transition-colors"
                                        title="Quitar punto"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {openHistoryIds.has(p.id) && p.aplicacionesAnteriores.length > 0 && (
                                <div className="mt-2 space-y-1.5 rounded-xl bg-sand/20 p-2 border border-stone/5">
                                  <div className="text-[9px] font-bold uppercase tracking-widest text-stone/40">Aplicaciones previas</div>
                                  {p.aplicacionesAnteriores.map((ap, idx) => (
                                    <div key={idx} className="text-[10px] text-stone/80 flex justify-between gap-2 border-b border-stone/5 last:border-0 pb-1 last:pb-0">
                                      <span className="font-bold">{ap.fecha}</span>
                                      <span>{ap.unidades} U {ap.nota && <span className="italic text-stone/50 opacity-80">({ap.nota})</span>}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ====== ACCIONES SECUNDARIAS ====== */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleDiscard}
          className="rounded-xl border border-stone/20 bg-white px-6 py-2.5 text-sm font-bold text-stone hover:bg-blush transition-all active:scale-95"
        >
          Descartar
        </button>
      </div>

      {/* ====== BARRA INFERIOR FIJA: ACCIONES ====== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone/10 bg-white/90 px-4 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="hidden sm:block">
            <div className="text-xs font-black uppercase tracking-tighter text-stone/20">Paciente</div>
            <div className="text-sm font-bold text-stone truncate max-w-[200px]">
              {data.consentimiento.nombreCompleto || '—'}
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || generating || generatingWord}
              className="flex-1 sm:flex-none rounded-xl bg-stone px-6 py-3 text-sm font-bold text-white shadow-lg shadow-stone/20 transition-all hover:bg-stone/90 active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : '💾 Guardar'}
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              disabled={generatingWord || generating}
              className="flex-1 sm:flex-none rounded-xl border-2 border-sage bg-white px-6 py-3 text-sm font-bold text-sage transition-all hover:bg-sage hover:text-white active:scale-95 disabled:opacity-50"
            >
              {generatingWord ? '...' : '📝 Word'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={generating || generatingWord}
              className="flex-1 sm:flex-none rounded-xl bg-sage px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage/90 active:scale-95 disabled:opacity-50"
            >
              {generating ? '...' : '📄 PDF'}
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
  'w-full rounded-xl border border-stone/10 bg-white px-3 py-2.5 text-stone font-medium focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/5 transition-all placeholder:text-stone/30';

function HistoricalEntries({ 
  title, 
  entries, 
  onEdit 
}: { 
  title: string; 
  entries: { texto: string; fecha: string }[]; 
  onEdit: (index: number, value: string) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState('');

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone/5"></div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone/20">{title}</h4>
        <div className="h-px flex-1 bg-stone/5"></div>
      </div>
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div key={idx} className="relative rounded-2xl border border-stone/10 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-3 flex items-center justify-between text-[11px] font-bold text-stone/40">
              <span className="flex items-center gap-1.5 rounded-full bg-sand/30 px-3 py-1">
                <Calendar size={12} className="text-stone/30" /> {entry.fecha}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (editingIndex === idx) {
                    onEdit(idx, tempValue);
                    setEditingIndex(null);
                  } else {
                    setEditingIndex(idx);
                    setTempValue(entry.texto);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-stone/10 px-2.5 py-1 text-stone/40 transition-colors hover:bg-blush hover:text-stone active:scale-95"
              >
                {editingIndex === idx ? (
                  <><Save size={14} className="text-sage" /> Guardar</>
                ) : (
                  <><Edit2 size={14} /> Editar</>
                )}
              </button>
            </div>
            
            {editingIndex === idx ? (
              <textarea
                autoFocus
                className="w-full rounded-xl border border-sand bg-blush/20 p-3 text-sm font-bold text-stone focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/5"
                rows={3}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
            ) : (
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-stone/80 font-medium">
                {entry.texto}
              </div>
            )}
            
            {/* Indicador de registro fijo */}
            <div className="absolute -left-[2px] top-1/2 h-8 w-[4px] -translate-y-1/2 rounded-full bg-sand"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <section className="mb-6 rounded-3xl border border-stone/10 bg-white p-8 shadow-sm transition-all hover:shadow-md">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-stone">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sand text-sm font-black text-stone">
          {number}
        </span>
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
