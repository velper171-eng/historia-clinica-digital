'use client';

import { useMemo, useState, useEffect } from 'react';
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

import { useSearchParams, useRouter } from 'next/navigation';

const deduplicateHistory = <T extends { fecha: string }>(entries: T[]): T[] => {
  const map = new Map<string, T>();
  entries.forEach(entry => {
    map.set(entry.fecha, entry);
  });
  return Array.from(map.values());
};

export function HistoriaForm() {
  const data = useFormStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const idFromUrl = searchParams.get('id');
  const [showDCInfo, setShowDCInfo] = useState(false);
  const [showFatInfo, setShowFatInfo] = useState(false);
  const [showEndoInfo, setShowEndoInfo] = useState(false);
  const [showMesoInfo, setShowMesoInfo] = useState(false);
  const [showEctoInfo, setShowEctoInfo] = useState(false);

  const reset = useFormStore((s) => s.reset);

  useEffect(() => {
    if (!idFromUrl) {
      if (data.id !== undefined) {
        reset();
      }
    } else {
      if (data.id !== idFromUrl) {
        const fetchPatient = async () => {
          try {
            const { data: record, error } = await supabase
              .from('historias_clinicas')
              .select('*')
              .eq('id', idFromUrl)
              .single();
            if (error) throw error;
            if (record) {
              useFormStore.getState().loadData({
                ...record.datos,
                id: record.id
              });
            }
          } catch (e) {
            console.error("Error al cargar paciente por ID de la URL:", e);
          }
        };
        fetchPatient();
      }
    }
  }, [idFromUrl, data.id, reset]);
  const [generating, setGenerating] = useState(false);
  const [generatingWord, setGeneratingWord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openHistoryIds, setOpenHistoryIds] = useState<Set<string>>(new Set());
  const [diagramGender, setDiagramGender] = useState<'mujer' | 'hombre'>('mujer');
  const [activeTab, setActiveTab] = useState<'historia' | 'antropometria'>('historia');

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

  const historyIds = useMemo(
    () => new Set(data.puntosInyeccion.filter((p) => p.aplicacionesAnteriores.length > 0).map((p) => p.id)),
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
  
  // Cast para evitar errores de tipo en el historial dinámico
  const antroHist = data.antropometriaHistorial as Record<string, { valor: string; fecha: string }[]>;

  const resultadosCalculados = useMemo(() => {
    const sumPliegues = [
      data.antropometria.plTriceps,
      data.antropometria.plSubescapular,
      data.antropometria.plBiceps,
      data.antropometria.plCrestaIliaca,
      data.antropometria.plSupraespinal,
      data.antropometria.plAbdominal,
      data.antropometria.plMuslo,
      data.antropometria.plPierna,
    ].reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

    const edad = parseFloat(data.antropometria.edad) || 0;

    if (sumPliegues === 0) return { dc: '0', grasa: '0', endo: '0', meso: '0', ecto: '0' };

    // DC = 1.112 - (0.00043499 * Σ) + (0.00000055 * Σ^2) - (0.00028826 * edad)
    const dc = 1.112 - (0.00043499 * sumPliegues) + (0.00000055 * Math.pow(sumPliegues, 2)) - (0.00028826 * edad);
    
    // %Grasa = ((4.95 / DC) - 4.50) * 100
    const grasa = dc > 0 ? ((4.95 / dc) - 4.50) * 100 : 0;

    // Heath-Carter Somatotype
    const talla = parseFloat(data.antropometria.talla) || 0;
    const masa = parseFloat(data.antropometria.masaCorporal) || 0;
    
    // 1. ENDOMORFIA
    const plTri = parseFloat(data.antropometria.plTriceps) || 0;
    const plSub = parseFloat(data.antropometria.plSubescapular) || 0;
    const plSupra = parseFloat(data.antropometria.plSupraespinal) || 0;
    
    let endo = '0';
    if (talla > 0 && plTri > 0 && plSub > 0 && plSupra > 0) {
      const sum3 = (plTri + plSub + plSupra) * (170.18 / talla);
      const e = -0.7182 + (0.1451 * sum3) - (0.00068 * Math.pow(sum3, 2)) + (0.0000014 * Math.pow(sum3, 3));
      endo = e.toFixed(2);
    }

    // 2. MESOMORFIA
    const dHum = parseFloat(data.antropometria.dHumero) || 0;
    const dFem = parseFloat(data.antropometria.dFemur) || 0;
    const prBrazo = parseFloat(data.antropometria.prBrazoFlexionado) || 0;
    const prPier = parseFloat(data.antropometria.prPierna) || 0;
    const plPier = parseFloat(data.antropometria.plPierna) || 0;

    let meso = '0';
    if (talla > 0 && dHum > 0 && dFem > 0) {
      const prBrazCorr = prBrazo - (plTri / 10);
      const prPierCorr = prPier - (plPier / 10);
      const m = (0.858 * dHum) + (0.601 * dFem) + (0.188 * prBrazCorr) + (0.161 * prPierCorr) - (0.131 * talla) + 4.5;
      meso = m.toFixed(2);
    }

    // 3. ECTOMORFIA
    let ecto = '0';
    if (talla > 0 && masa > 0) {
      const hwr = talla / Math.pow(masa, 1/3);
      let ec = 0.1;
      if (hwr >= 40.75) {
        ec = (0.732 * hwr) - 28.58;
      } else if (hwr > 38.25) {
        ec = (0.463 * hwr) - 17.63;
      }
      ecto = ec.toFixed(2);
    }

    return {
      dc: dc.toFixed(4),
      grasa: grasa.toFixed(2),
      endo,
      meso,
      ecto
    };
  }, [
    data.antropometria.plTriceps, 
    data.antropometria.plSubescapular, 
    data.antropometria.plBiceps, 
    data.antropometria.plCrestaIliaca, 
    data.antropometria.plSupraespinal, 
    data.antropometria.plAbdominal, 
    data.antropometria.plMuslo, 
    data.antropometria.plPierna, 
    data.antropometria.edad,
    data.antropometria.talla,
    data.antropometria.masaCorporal,
    data.antropometria.dHumero,
    data.antropometria.dFemur,
    data.antropometria.prBrazoFlexionado,
    data.antropometria.prPierna
  ]);

  useEffect(() => {
    if (
      data.antropometria.dc !== resultadosCalculados.dc || 
      data.antropometria.porcentajeGrasa !== resultadosCalculados.grasa ||
      data.antropometria.endomorfia !== resultadosCalculados.endo ||
      data.antropometria.mesomorfia !== resultadosCalculados.meso ||
      data.antropometria.ectomorfia !== resultadosCalculados.ecto
    ) {
      useFormStore.getState().setAntropometria({ 
        dc: resultadosCalculados.dc, 
        porcentajeGrasa: resultadosCalculados.grasa,
        endomorfia: resultadosCalculados.endo,
        mesomorfia: resultadosCalculados.meso,
        ectomorfia: resultadosCalculados.ecto
      });
    }
  }, [resultadosCalculados]);

  const somatotipoPredominante = useMemo(() => {
    const endo = parseFloat(data.antropometria.endomorfia) || 0;
    const meso = parseFloat(data.antropometria.mesomorfia) || 0;
    const ecto = parseFloat(data.antropometria.ectomorfia) || 0;

    if (endo === 0 && meso === 0 && ecto === 0) return null;

    if (endo >= meso && endo >= ecto) return 'endomorfia';
    if (meso >= endo && meso >= ecto) return 'mesomorfia';
    return 'ectomorfia';
  }, [data.antropometria.endomorfia, data.antropometria.mesomorfia, data.antropometria.ectomorfia]);

  const evaluacion = useMemo(() => {
    if (!somatotipoPredominante) return null;

    const masa = parseFloat(data.antropometria.masaCorporal) || 0;
    const grasaPerc = parseFloat(data.antropometria.porcentajeGrasa) || 0;
    const talla = (parseFloat(data.antropometria.talla) || 0) / 100; // metros
    const edad = parseFloat(data.antropometria.edad) || 0;
    const prCaderas = parseFloat(data.antropometria.prCaderas) || 0;

    // 1. Perfil Metabólico
    const masaGrasa = (masa * grasaPerc) / 100;
    const masaMagra = masa - masaGrasa;
    
    // Katch-McArdle (independiente de sexo si tenemos masa magra)
    const tmb = masaMagra > 0 ? (370 + (21.6 * masaMagra)) : 0;
    const get = tmb * 1.4; // Factor moderado base
    const cociente = masaMagra > 0 ? (masaGrasa / masaMagra).toFixed(2) : '0';

    // 2. IAC
    let iac = '0';
    if (prCaderas > 0 && talla > 0) {
      iac = ((prCaderas / Math.pow(talla, 1.5)) - 18).toFixed(2);
    }

    // 3. Somatocarta (Descripción según predominancia)
    const endo = parseFloat(data.antropometria.endomorfia) || 0;
    const meso = parseFloat(data.antropometria.mesomorfia) || 0;
    const ecto = parseFloat(data.antropometria.ectomorfia) || 0;

    const configs = {
      endomorfia: {
        titulo: 'Endomorfia Predominante',
        somatocarta: 'Endo-mesomorfo / Endomorfo puro',
        somatocartaInfo: "Como endomorfo, tu cuerpo tiene una estructura ósea más ancha y una gran facilidad natural para almacenar energía. Esto significa que ganas peso con facilidad, pero también posees una base de fuerza muy sólida. Tu metabolismo responde mejor a dietas bajas en carbohidratos y entrenamientos de alta intensidad.",
        predominancia: `${endo} (Endo) / ${meso} (Meso) / ${ecto} (Ecto)`,
        prioridad: grasaPerc > 20 ? 'Déficit Calórico / Recomposición' : 'Mantenimiento',
        prioridadInfo: grasaPerc > 20 
          ? "Dado tu porcentaje de grasa actual, nuestra prioridad es el 'Déficit Calórico'. Esto significa comer ligeramente menos de lo que gastas para que tu cuerpo use la grasa acumulada como energía, manteniendo siempre tu músculo activo."
          : "Tu nivel de grasa es saludable. La prioridad es el 'Mantenimiento', enfocándonos en mejorar tu rendimiento y calidad muscular sin cambios bruscos en el peso.",
        proteina: (masaMagra * 2.2).toFixed(1) + 'g - 2.5g',
        carbohidratos: 'Carga moderada-baja (Sensibilidad Digestiva)',
        entrenamiento: 'Alta intensidad / Frecuencia elevada',
        tasaCambio: '0.5% - 1.0% peso/semana',
        saludable: 'Variable (Vigilancia metabólica)',
        acumulacionGrasa: 'Alta tendencia a acumular',
        respuestaExcesos: 'Rápida ganancia de grasa',
        sensibilidadDigestiva: 'Baja / Buena tolerancia',
        margenMuscular: 'Bueno / Alto potencial de fuerza',
        faseDefinicion: 'Fase agresiva / estricta',
        volumen: 'Volumen controlado / cauteloso',
        clase: 'bg-amber-50 text-amber-900 border-amber-200',
        iconoClase: 'bg-amber-500',
      },
      mesomorfia: {
        titulo: 'Mesomorfia Predominante',
        somatocarta: 'Mesomorfo equilibrado',
        somatocartaInfo: "Como mesomorfo, posees 'la genética del atleta'. Tu cuerpo gana músculo con facilidad y mantiene niveles de grasa bajos sin un esfuerzo extremo. Tienes una estructura ósea media y hombros anchos, lo que te permite responder de forma excelente a casi cualquier tipo de entrenamiento de fuerza.",
        predominancia: `${endo} (Endo) / ${meso} (Meso) / ${ecto} (Ecto)`,
        prioridad: 'Recomposición / Superávit controlado',
        prioridadInfo: "Tu cuerpo es ideal para la 'Recomposición'. Podemos buscar ganar músculo y perder grasa simultáneamente o enfocarnos en un 'Superávit Controlado' para maximizar tus ganancias musculares sin ganar grasa innecesaria.",
        proteina: (masaMagra * 2.0).toFixed(1) + 'g - 2.3g',
        carbohidratos: 'Carga moderada (Ciclo de CH)',
        entrenamiento: 'Volumen alto / Enfoque en hipertrofia',
        tasaCambio: '0.25% - 0.5% peso/semana',
        saludable: 'Excelente (Estado atlético óptimo)',
        acumulacionGrasa: 'Moderada / Equilibrada',
        respuestaExcesos: 'Respuesta metabólica balanceada',
        sensibilidadDigestiva: 'Baja',
        margenMuscular: 'Excelente (Potencial genético alto)',
        faseDefinicion: 'Fase media / moderada',
        volumen: 'Volumen agresivo / superávit moderado',
        clase: 'bg-sage/10 text-sage border-sage/20',
        iconoClase: 'bg-sage',
      },
      ectomorfia: {
        titulo: 'Ectomorfia Predominante',
        somatocarta: 'Ecto-mesomorfo / Ectomorfo puro',
        somatocartaInfo: "Como ectomorfo, tu cuerpo es naturalmente delgado y con extremidades largas. Tienes un metabolismo 'muy rápido' que quema energía constantemente, lo que te protege de la ganancia de grasa pero hace que ganar músculo sea un reto que requiere una alimentación muy abundante y enfocada.",
        predominancia: `${endo} (Endo) / ${meso} (Meso) / ${ecto} (Ecto)`,
        prioridad: 'Superávit Calórico (Bulking)',
        prioridadInfo: "Tu metabolismo es muy resistente, por lo que necesitamos un 'Superávit Calórico' agresivo. Debes comer significativamente más de lo que gastas para darle a tu cuerpo el material necesario para construir nuevo tejido muscular.",
        proteina: (masaMagra * 1.8).toFixed(1) + 'g - 2.1g',
        carbohidratos: 'Carga alta (Estrategia pre/post)',
        entrenamiento: 'Bajo volumen / Alta intensidad (Fuerza)',
        tasaCambio: '0.2% - 0.3% peso/semana',
        saludable: 'Bueno (Vigilancia calórica)',
        acumulacionGrasa: 'Muy baja tendencia a acumular',
        respuestaExcesos: 'Resistente a la ganancia de grasa',
        sensibilidadDigestiva: 'Alta / Sensibilidad común',
        margenMuscular: 'Limitado / Ganancia difícil',
        faseDefinicion: 'Fase leve / mantenimiento',
        volumen: 'Volumen muy agresivo / superávit alto',
        clase: 'bg-sky-50 text-sky-900 border-sky-200',
        iconoClase: 'bg-sky-500',
      }
    };

    const res = configs[somatotipoPredominante];
    return {
      ...res,
      tmb: tmb.toFixed(0),
      get: get.toFixed(0),
      cociente,
      iac
    };
  }, [somatotipoPredominante, data.antropometria]);

  useEffect(() => {
    if (evaluacion) {
      if (
        data.antropometria.evaluacionSaludable !== evaluacion.saludable ||
        data.antropometria.evaluacionGrasa !== evaluacion.acumulacionGrasa ||
        data.antropometria.evaluacionRespuestaCalorica !== evaluacion.respuestaExcesos ||
        data.antropometria.evaluacionSensibilidadDigestiva !== evaluacion.sensibilidadDigestiva ||
        data.antropometria.evaluacionMargenMuscular !== evaluacion.margenMuscular ||
        data.antropometria.evaluacionFaseDefinicion !== evaluacion.faseDefinicion ||
        data.antropometria.evaluacionVolumen !== evaluacion.volumen ||
        data.antropometria.perfilTMB !== evaluacion.tmb ||
        data.antropometria.perfilGET !== evaluacion.get ||
        data.antropometria.perfilCocienteGrasaMasaMagra !== evaluacion.cociente ||
        data.antropometria.analisisClasificacionSomatocarta !== evaluacion.somatocarta ||
        data.antropometria.analisisPredominanciaGenetica !== evaluacion.predominancia ||
        data.antropometria.tendenciaPrioridadNutricional !== evaluacion.prioridad ||
        data.antropometria.tendenciaSugerenciaProteina !== evaluacion.proteina ||
        data.antropometria.tendenciaSugerenciaCarbohidratos !== evaluacion.carbohidratos ||
        data.antropometria.tendenciaEnfoqueEntrenamiento !== evaluacion.entrenamiento ||
        data.antropometria.seguimientoTasaCambioSemanal !== evaluacion.tasaCambio ||
        data.antropometria.seguimientoIAC !== evaluacion.iac
      ) {
        useFormStore.getState().setAntropometria({
          evaluacionSaludable: evaluacion.saludable,
          evaluacionGrasa: evaluacion.acumulacionGrasa,
          evaluacionRespuestaCalorica: evaluacion.respuestaExcesos,
          evaluacionSensibilidadDigestiva: evaluacion.sensibilidadDigestiva,
          evaluacionMargenMuscular: evaluacion.margenMuscular,
          evaluacionFaseDefinicion: evaluacion.faseDefinicion,
          evaluacionVolumen: evaluacion.volumen,
          perfilTMB: evaluacion.tmb,
          perfilGET: evaluacion.get,
          perfilCocienteGrasaMasaMagra: evaluacion.cociente,
          analisisClasificacionSomatocarta: evaluacion.somatocarta,
          analisisPredominanciaGenetica: evaluacion.predominancia,
          tendenciaPrioridadNutricional: evaluacion.prioridad,
          tendenciaSugerenciaProteina: evaluacion.proteina,
          tendenciaSugerenciaCarbohidratos: evaluacion.carbohidratos,
          tendenciaEnfoqueEntrenamiento: evaluacion.entrenamiento,
          seguimientoTasaCambioSemanal: evaluacion.tasaCambio,
          seguimientoIAC: evaluacion.iac
        });
      }
    }
  }, [evaluacion]);

  const handleDownload = async () => {
    setGenerating(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 50));
      await generarHistoriaClinicaPDF(data);
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido';
      setError(`Error al generar el PDF: ${errorMsg}`);
      alert(`Error al generar el PDF: ${errorMsg}`);
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
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido';
      setError(`Error al generar el Word: ${errorMsg}`);
      alert(`Error al generar el Word: ${errorMsg}`);
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
        evolucionProcedimientos,
        evolucionProcedimientosAnteriores,
        firmaFinal,
        fechaFinal,
        puntosInyeccion,
        antropometria,
        antropometriaHistorial,
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
        evolucionProcedimientos,
        evolucionProcedimientosAnteriores,
        firmaFinal,
        fechaFinal,
        puntosInyeccion,
        antropometria,
        antropometriaHistorial,
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
        router.replace(`/nueva?id=${insertData[0].id}`);
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
      {/* LOGO EMPRESARIAL */}
      <div className="mb-10 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <img 
          src="/logo-reliv.png" 
          alt="RELIV Centro de Bienestar" 
          className="h-32 w-auto object-contain transition-transform hover:scale-105 duration-500 mix-blend-multiply" 
        />
        <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-sand to-transparent opacity-50" />
      </div>

      {/* ====== HEADER ====== */}
      <div className="mb-6 rounded-3xl border border-stone/10 bg-white p-2 shadow-sm flex flex-col md:flex-row gap-2">
        <button
          onClick={() => setActiveTab('historia')}
          className={`flex-1 rounded-2xl px-6 py-4 text-left transition-all ${
            activeTab === 'historia' 
            ? 'bg-stone text-white shadow-lg' 
            : 'bg-transparent text-stone hover:bg-stone/5'
          }`}
        >
          <div className={`mb-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
            activeTab === 'historia' ? 'bg-white/20 text-white' : 'bg-sand text-stone'
          }`}>
            Isabel Velasquez
          </div>
          <h1 className="text-xl font-black font-serif">Historia clínica y seguimiento</h1>
          <p className={`mt-1 text-xs font-bold ${activeTab === 'historia' ? 'text-white/70' : 'text-stone/60'}`}>
            Diligencie los campos y descargue el PDF o Word cuando esté listo.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('antropometria')}
          className={`flex-1 rounded-2xl px-6 py-4 text-left transition-all ${
            activeTab === 'antropometria' 
            ? 'bg-sage text-white shadow-lg' 
            : 'bg-transparent text-stone hover:bg-sage/5'
          }`}
        >
          <h1 className="text-xl font-black font-serif">Valoración Antropométrica y Composición Corporal</h1>
          <p className={`mt-1 text-xs font-bold ${activeTab === 'antropometria' ? 'text-white/70' : 'text-stone/60'}`}>
            Evaluación de medidas corporales y composición.
          </p>
        </button>
      </div>

      {activeTab === 'historia' ? (
        <>

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
          <div className="min-w-0">
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
          <div className="min-w-0">
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
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-stone">Fecha de nacimiento</label>
            <input
              type="date"
              value={data.consentimiento.fechaNacimiento}
              onChange={(e) => useFormStore.getState().setFechaNacimiento(e.target.value)}
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
          <LabelWithHistory 
            label="Procedimiento a realizar" 
            history={data.procedimientosAnteriores}
            onRestore={(val) => useFormStore.getState().setConsentimiento({ procedimiento: val })}
          />
          <textarea
            rows={2}
            value={data.consentimiento.procedimiento}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ procedimiento: e.target.value })
            }
            className={inputClass}
            placeholder="Describa el procedimiento actual..."
          />
        </div>

        <div>
          <LabelWithHistory 
            label="Riesgos y efectos secundarios informados" 
            history={data.consentimiento.riesgosInformadosAnteriores}
            onRestore={(val) => useFormStore.getState().setConsentimiento({ riesgosInformados: val })}
          />
          <textarea
            rows={3}
            value={data.consentimiento.riesgosInformados}
            onChange={(e) =>
              useFormStore.getState().setConsentimiento({ riesgosInformados: e.target.value })
            }
            className={inputClass}
            placeholder="Enumere los riesgos informados..."
          />
        </div>

        <div className="rounded-lg border border-stone/10 bg-blush p-3 text-xs text-stone/60 font-medium italic">
          Con todo lo anterior, dejo constancia que entendí toda la información suministrada,
          y por ello acepto la realización del procedimiento.
        </div>

        <div className="space-y-6">
          <div className="max-w-[240px]">
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
          <SignaturePad
            value={data.consentimiento.firma}
            onChange={(firma) => useFormStore.getState().setConsentimiento({ firma })}
            label="Firma del paciente"
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 2: ANTECEDENTES PATOLÓGICOS ====== */}
      <Section number="2" title="Antecedentes patológicos">
        <p className="text-sm text-stone/60 font-medium">
          Marque con una X si sufre o sufrió el paciente o algún familiar directo de alguna de las siguientes enfermedades.
        </p>
        <DiseaseChecklist
          idPrefix="ant-patologicos"
          personales={data.antecedentesPersonales}
          familiares={data.antecedentesFamiliares}
          onChangePersonales={useFormStore.getState().setAntecedentesPersonales}
          onChangeFamiliares={useFormStore.getState().setAntecedentesFamiliares}
        />

        <div>
          <LabelWithHistory 
            label="Observaciones generales patológicas" 
            history={data.observacionesPatologicosAnteriores}
            onRestore={(val) => useFormStore.getState().setObservacionesPatologicos(val)}
          />
          <textarea
            rows={2}
            value={data.observacionesPatologicos}
            onChange={(e) => useFormStore.getState().setObservacionesPatologicos(e.target.value)}
            className={inputClass}
            placeholder="Detalles adicionales sobre antecedentes"
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 3: MEDICAMENTOS ====== */}
      <Section number="3" title="Medicamentos">
        <p className="text-sm text-stone/60 font-medium">
          Describa los medicamentos que toma en casa.
        </p>
        <LabelWithHistory 
          label="Medicamentos" 
          history={data.medicamentosAnteriores}
          onRestore={(val) => useFormStore.getState().setMedicamentos(val)}
        />
        <textarea
          rows={4}
          value={data.medicamentos}
          onChange={(e) => useFormStore.getState().setMedicamentos(e.target.value)}
          className={inputClass}
          placeholder="Liste cada medicamento, dosis y frecuencia"
        />
      </Section>

      {/* ====== SECCIÓN 4: ALERGIAS ====== */}
      <Section number="4" title="Alergias">
        <p className="text-sm text-stone/60 font-medium">
          Marque las alergias medicamentosas presentadas.
        </p>
        <AllergyChecklist
          value={data.alergicos}
          onChange={useFormStore.getState().setAlergicos}
        />
        <div>
          <LabelWithHistory 
            label="Síntomas presentados / Observaciones" 
            history={data.observacionesAlergiasAnteriores}
            onRestore={(val) => useFormStore.getState().setObservacionesAlergias(val)}
          />
          <textarea
            rows={2}
            value={data.observacionesAlergias}
            onChange={(e) => useFormStore.getState().setObservacionesAlergias(e.target.value)}
            className={inputClass}
            placeholder="Síntomas presentados..."
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 5: ANTECEDENTES QUIRÚRGICOS Y CONDICIONES ADICIONALES ====== */}
      <Section number="5" title="Antecedentes quirúrgicos y condiciones adicionales">
        <div>
          <LabelWithHistory 
            label="¿Le han realizado algún procedimiento quirúrgico previo?" 
            history={data.quirurgicosAnteriores}
            onRestore={(val) => useFormStore.getState().setQuirurgicos(val)}
          />
          <textarea
            rows={3}
            value={data.quirurgicos}
            onChange={(e) => useFormStore.getState().setQuirurgicos(e.target.value)}
            className={inputClass}
            placeholder="Cirugías previas y detalles relevantes"
          />
        </div>

        <div>
          <LabelWithHistory 
            label="¿Conoce alguna condición que interfiera con su recuperación? (Sí/No)" 
            history={data.condicionRecuperacionAnteriores}
            onRestore={(val) => useFormStore.getState().setCondicionRecuperacion(val)}
          />
          <textarea
            rows={2}
            value={data.condicionRecuperacion}
            onChange={(e) => useFormStore.getState().setCondicionRecuperacion(e.target.value)}
            className={inputClass}
            placeholder='Describa o responda "No"'
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone">
            ¿Sabe o sospecha que pueda estar en estado de gestación?
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

        <div className="space-y-6 pt-4 border-t border-stone/5">
          <div className="max-w-[240px]">
            <label className="mb-1 block text-sm font-medium text-stone">Fecha</label>
            <input
              type="date"
              value={data.fechaFinal}
              onChange={(e) => useFormStore.getState().setFechaFinal(e.target.value)}
              className={inputClass}
            />
          </div>
          <SignaturePad
            value={data.firmaFinal}
            onChange={useFormStore.getState().setFirmaFinal}
            label="Firma final del paciente"
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 6: EVALUACIÓN FACIAL Y SESIONES ====== */}
      <Section number="6" title="Evaluación facial y sesiones">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
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
          <LabelWithHistory 
            label="Observaciones generales" 
            history={data.observacionesGeneralesAnteriores}
            onRestore={(val) => useFormStore.getState().setObservacionesGenerales(val)}
          />
          <textarea
            rows={3}
            value={data.observacionesGenerales}
            onChange={(e) => useFormStore.getState().setObservacionesGenerales(e.target.value)}
            className={inputClass}
            placeholder="Anotaciones adicionales..."
          />
        </div>
      </Section>

      {/* ====== SECCIÓN 7: PUNTOS DE INYECCIÓN ====== */}
      <Section number="7" title="Puntos de inyección">
        <p className="text-sm text-stone/60 font-medium">
          Haga click en los puntos para marcar dónde se aplicará la toxina.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
          <div className="flex flex-col items-center gap-6">
            {/* Selector de Género Premium */}
            <div className="flex p-1 bg-stone/5 rounded-2xl border border-stone/10 shadow-inner">
              <button
                type="button"
                onClick={() => setDiagramGender('mujer')}
                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  diagramGender === 'mujer' 
                    ? 'bg-white text-sage shadow-md scale-[1.02]' 
                    : 'text-stone/40 hover:text-stone/60'
                }`}
              >
                ♀ Femenino
              </button>
              <button
                type="button"
                onClick={() => setDiagramGender('hombre')}
                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  diagramGender === 'hombre' 
                    ? 'bg-white text-stone shadow-md scale-[1.02]' 
                    : 'text-stone/40 hover:text-stone/60'
                }`}
              >
                ♂ Masculino
              </button>
            </div>

            <div className="flex justify-center rounded-[40px] bg-blush/30 p-8 border border-stone/5 shadow-inner">
              <FaceDiagram
                activeIds={activeIds}
                onTogglePoint={useFormStore.getState().togglePuntoInyeccion}
                gender={diagramGender}
                width={typeof window !== 'undefined' && window.innerWidth < 480 ? 300 : 460}
              />
            </div>
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
                                <span className="ml-2 text-[8px] opacity-30 px-1.5 py-0.5 rounded-md bg-stone/10 font-black">
                                  {def?.id.startsWith('m-') ? '♀ F' : '♂ M'}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                {p.activo && (
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="U"
                                    className="w-12 rounded-lg border border-stone/10 bg-blush/30 px-1 py-1 text-center text-xs font-bold text-stone"
                                    value={p.unidades || ''}
                                    onChange={(e) => useFormStore.getState().setPuntoUnidades(p.id, parseInt(e.target.value) || 0)}
                                  />
                                )}
                                
                                {p.aplicacionesAnteriores.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleHistory(p.id)}
                                    className={`transition-colors ${openHistoryIds.has(p.id) ? 'text-sage' : 'text-stone/20 hover:text-sage'}`}
                                    title="Ver historial de aplicaciones"
                                  >
                                    <Info size={14} />
                                  </button>
                                )}

                                {p.activo && (
                                  <button
                                    type="button"
                                    onClick={() => useFormStore.getState().removePuntoInyeccion(p.id)}
                                    className="text-stone/20 hover:text-red-400 transition-colors"
                                    title="Quitar punto"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              </div>
                              
                              {openHistoryIds.has(p.id) && p.aplicacionesAnteriores.length > 0 && (
                                <div className="mt-2 space-y-1.5 rounded-xl bg-sand/20 p-2 border border-stone/5">
                                  <div className="text-[9px] font-bold uppercase tracking-widest text-stone/40">Aplicaciones previas</div>
                                  {deduplicateHistory(p.aplicacionesAnteriores).map((ap, idx) => (
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

      {/* ====== SECCIÓN 8: EVOLUCIÓN Y OBSERVACIONES DE PROCEDIMIENTOS ====== */}
      <Section number="8" title="Evolución y Observaciones de Procedimientos">
        <p className="text-sm text-stone/60 font-medium">
          Registre las observaciones y evolución de los procedimientos realizados. Al guardar la sesión, la entrada quedará registrada de forma permanente con la fecha actual.
        </p>
        
        <div>
          <label className="mb-1 block text-sm font-medium text-stone">
            Nueva observación / evolución de procedimientos
          </label>
          <textarea
            rows={4}
            value={data.evolucionProcedimientos}
            onChange={(e) => useFormStore.getState().setEvolucionProcedimientos(e.target.value)}
            className={inputClass}
            placeholder="Escriba aquí los detalles del procedimiento realizado hoy, observaciones, evolución del paciente, etc..."
          />
        </div>

        {/* Historial general de observaciones con sus fechas */}
        <HistoricalEntries 
          title="Historial de Evolución y Observaciones"
          entries={data.evolucionProcedimientosAnteriores}
          onEdit={useFormStore.getState().updateEvolucionProcedimientosHistorico}
        />
      </Section>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleDiscard}
              className="rounded-xl border border-stone/20 bg-white px-6 py-2.5 text-sm font-bold text-stone hover:bg-blush transition-all active:scale-95"
            >
              Descartar
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {/* GRUPO 1: MEDIDAS BÁSICAS */}
          <Section number="A" title="Medidas Básicas">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AntroField 
                label="Masa Corporal (kg)" 
                value={data.antropometria.masaCorporal} 
                onChange={(v) => useFormStore.getState().setAntropometria({ masaCorporal: v })} 
                history={antroHist.masaCorporal}
              />
              <AntroField 
                label="Talla (cm)" 
                value={data.antropometria.talla} 
                onChange={(v) => useFormStore.getState().setAntropometria({ talla: v })} 
                history={antroHist.talla}
              />
              <AntroField 
                label="Edad" 
                value={data.antropometria.edad} 
                onChange={(v) => useFormStore.getState().setAntropometria({ edad: v })} 
                readOnly={true}
                history={antroHist.edad}
              />
            </div>
          </Section>

          <hr className="border-stone/10" />

          {/* GRUPO 2: PLIEGUES (PL) */}
          <Section number="B" title="Pliegues Cutáneos (PL)">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AntroField 
                label="PL Triceps" 
                value={data.antropometria.plTriceps} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plTriceps: v })} 
                history={antroHist.plTriceps}
              />
              <AntroField 
                label="PL Subescapular" 
                value={data.antropometria.plSubescapular} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plSubescapular: v })} 
                history={antroHist.plSubescapular}
              />
              <AntroField 
                label="PL Biceps" 
                value={data.antropometria.plBiceps} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plBiceps: v })} 
                history={antroHist.plBiceps}
              />
              <AntroField 
                label="PL Cresta Iliaca" 
                value={data.antropometria.plCrestaIliaca} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plCrestaIliaca: v })} 
                history={antroHist.plCrestaIliaca}
              />
              <AntroField 
                label="PL Supraespinal" 
                value={data.antropometria.plSupraespinal} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plSupraespinal: v })} 
                history={antroHist.plSupraespinal}
              />
              <AntroField 
                label="PL Abdominal" 
                value={data.antropometria.plAbdominal} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plAbdominal: v })} 
                history={antroHist.plAbdominal}
              />
              <AntroField 
                label="PL Muslo" 
                value={data.antropometria.plMuslo} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plMuslo: v })} 
                history={antroHist.plMuslo}
              />
              <AntroField 
                label="PL Pierna" 
                value={data.antropometria.plPierna} 
                onChange={(v) => useFormStore.getState().setAntropometria({ plPierna: v })} 
                history={antroHist.plPierna}
              />
            </div>
          </Section>

          <hr className="border-stone/10" />

          {/* GRUPO 3: PERÍMETROS (PR) */}
          <Section number="C" title="Perímetros (PR)">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AntroField 
                label="PR Brazo Relajado" 
                value={data.antropometria.prBrazoRelajado} 
                onChange={(v) => useFormStore.getState().setAntropometria({ prBrazoRelajado: v })} 
                history={antroHist.prBrazoRelajado}
              />
              <AntroField 
                label="PR Brazo Flexionado y Contraído" 
                value={data.antropometria.prBrazoFlexionado} 
                onChange={(v) => useFormStore.getState().setAntropometria({ prBrazoFlexionado: v })} 
                history={antroHist.prBrazoFlexionado}
              />
              <AntroField 
                label="PR Cintura" 
                value={data.antropometria.prCintura} 
                onChange={(v) => useFormStore.getState().setAntropometria({ prCintura: v })} 
                history={antroHist.prCintura}
              />
              <AntroField 
                label="PR Caderas" 
                value={data.antropometria.prCaderas} 
                onChange={(v) => useFormStore.getState().setAntropometria({ prCaderas: v })} 
                history={antroHist.prCaderas}
              />
              <AntroField 
                label="PR Muslo Medio" 
                value={data.antropometria.prMusloMedio} 
                onChange={(v) => useFormStore.getState().setAntropometria({ prMusloMedio: v })} 
                history={antroHist.prMusloMedio}
              />
              <AntroField 
                label="PR Pierna" 
                value={data.antropometria.prPierna} 
                onChange={(v) => useFormStore.getState().setAntropometria({ prPierna: v })} 
                history={antroHist.prPierna}
              />
            </div>
          </Section>

          <hr className="border-stone/10" />

          {/* GRUPO 4: DIÁMETROS (D) */}
          <Section number="D" title="Diámetros (D)">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AntroField 
                label="D Humero" 
                value={data.antropometria.dHumero} 
                onChange={(v) => useFormStore.getState().setAntropometria({ dHumero: v })} 
                history={antroHist.dHumero}
              />
              <AntroField 
                label="D Biestiloideo" 
                value={data.antropometria.dBiestiloideo} 
                onChange={(v) => useFormStore.getState().setAntropometria({ dBiestiloideo: v })} 
                history={antroHist.dBiestiloideo}
              />
              <AntroField 
                label="D Femur" 
                value={data.antropometria.dFemur} 
                onChange={(v) => useFormStore.getState().setAntropometria({ dFemur: v })} 
                history={antroHist.dFemur}
              />
            </div>
          </Section>
          
          <hr className="border-stone/10" />

          {/* SECCIÓN DE RESULTADOS CALCULADOS */}
          <section className="rounded-3xl bg-sage/5 border border-sage/20 p-8 shadow-inner overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Info size={120} className="text-sage" />
            </div>
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-black text-sage uppercase tracking-tighter">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage text-white shadow-lg shadow-sage/20">
                <Save size={20} />
              </span>
              Resultados de Composición Corporal
            </h2>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 relative z-20">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border border-stone/5 flex flex-col items-center text-center relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <LabelWithHistory 
                    label="" 
                    history={antroHist.dc}
                    onRestore={(v) => useFormStore.getState().setAntropometria({ dc: v })}
                  />
                </div>
                <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone/40 flex items-center gap-2">
                  Densidad Corporal (DC)
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowDCInfo(!showDCInfo);
                      setShowFatInfo(false);
                      setShowEndoInfo(false);
                      setShowMesoInfo(false);
                      setShowEctoInfo(false);
                    }}
                    className={`transition-colors p-1 rounded-full ${showDCInfo ? 'bg-sage/10 text-sage' : 'text-stone/20 hover:text-sage'}`}
                  >
                    <Info size={12} />
                  </button>
                </span>
                <div className="text-4xl font-black text-stone tracking-tight">
                  {data.antropometria.dc} <span className="text-sm font-medium text-stone/30">g/ml</span>
                </div>
                <p className="mt-2 text-xs text-stone/50 font-medium">Ecuación Jackson & Pollock</p>
                
                {showDCInfo && (
                  <div className="absolute inset-x-0 top-full z-[100] mt-4 mx-4 rounded-2xl border border-stone/10 bg-white p-4 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300 text-left">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-sage border-b border-sage/10 pb-1 text-center">Densidad Corporal</div>
                    <p className="text-[11px] leading-relaxed text-stone font-bold">
                      Es una medida que relaciona tu masa total con el volumen de tu cuerpo. En antropometría, se usa para estimar indirectamente qué porcentaje de tu peso es grasa y cuánto es tejido libre de grasa (músculo, hueso, etc.).
                    </p>
                    <button type="button" onClick={() => setShowDCInfo(false)} className="mt-3 w-full rounded-xl bg-stone/5 py-2 text-[9px] font-bold uppercase text-stone/40 hover:bg-stone/10 transition-colors">Cerrar</button>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-t border-l border-stone/10 bg-white" />
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border border-stone/5 flex flex-col items-center text-center relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <LabelWithHistory 
                    label="" 
                    history={antroHist.porcentajeGrasa}
                    onRestore={(v) => useFormStore.getState().setAntropometria({ porcentajeGrasa: v })}
                  />
                </div>
                <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone/40 flex items-center gap-2">
                  % Grasa Corporal
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowFatInfo(!showFatInfo);
                      setShowDCInfo(false);
                      setShowEndoInfo(false);
                      setShowMesoInfo(false);
                      setShowEctoInfo(false);
                    }}
                    className={`transition-colors p-1 rounded-full ${showFatInfo ? 'bg-sage/10 text-sage' : 'text-stone/20 hover:text-sage'}`}
                  >
                    <Info size={12} />
                  </button>
                </span>
                <div className="text-4xl font-black text-sage tracking-tight">
                  {data.antropometria.porcentajeGrasa} <span className="text-sm font-medium text-sage/30">%</span>
                </div>
                <p className="mt-2 text-xs text-stone/50 font-medium">Ecuación de Siri</p>
                
                {showFatInfo && (
                  <div className="absolute inset-x-0 top-full z-[100] mt-4 mx-4 rounded-2xl border border-stone/10 bg-white p-4 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300 text-left">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-sage border-b border-sage/10 pb-1 text-center">Porcentaje de Grasa</div>
                    <p className="text-[11px] leading-relaxed text-stone font-bold">
                      Indica qué parte de tu peso total está compuesta por tejido adiposo. Es un valor fundamental para entender tu salud metabólica y definir objetivos de pérdida de peso o ganancia muscular.
                    </p>
                    <button type="button" onClick={() => setShowFatInfo(false)} className="mt-3 w-full rounded-xl bg-stone/5 py-2 text-[9px] font-bold uppercase text-stone/40 hover:bg-stone/10 transition-colors">Cerrar</button>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-t border-l border-stone/10 bg-white" />
                  </div>
                )}
              </div>
            </div>


            <hr className="my-8 border-sage/10" />

            <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sage">Somatotipo Heath-Carter</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 relative z-10">
              <div className={`rounded-xl p-4 border transition-all duration-500 relative group ${
                somatotipoPredominante === 'endomorfia' 
                  ? 'bg-amber-50 border-amber-200 scale-105 shadow-md shadow-amber-100 ring-2 ring-amber-500/20' 
                  : 'bg-white/40 backdrop-blur-sm border-sage/5'
              } flex flex-col items-center`}>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75">
                   <LabelWithHistory 
                    label="" 
                    history={antroHist.endomorfia}
                    onRestore={(v) => useFormStore.getState().setAntropometria({ endomorfia: v })}
                  />
                </div>
                <span className={`text-[9px] font-bold uppercase mb-1 flex items-center gap-1 ${somatotipoPredominante === 'endomorfia' ? 'text-amber-600' : 'text-stone/40'}`}>
                  Endomorfia
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEndoInfo(!showEndoInfo);
                      setShowDCInfo(false);
                      setShowFatInfo(false);
                      setShowMesoInfo(false);
                      setShowEctoInfo(false);
                    }}
                    className="transition-colors"
                  >
                    <Info size={10} />
                  </button>
                </span>
                <span className={`text-2xl font-black ${somatotipoPredominante === 'endomorfia' ? 'text-amber-900' : 'text-stone'}`}>{data.antropometria.endomorfia}</span>
                {somatotipoPredominante === 'endomorfia' && <span className="mt-1 text-[8px] font-black uppercase text-amber-500 tracking-tighter">Predominante</span>}
                
                {showEndoInfo && (
                  <div className="absolute inset-x-0 top-full z-[100] mt-4 mx-0 rounded-2xl border border-stone/10 bg-white p-4 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300 text-left min-w-[200px]">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600 border-b border-amber-600/10 pb-1 text-center">Endomorfia</div>
                    <p className="text-[11px] leading-relaxed text-stone font-bold">
                      Representa la adiposidad relativa (grasa) y redondez de tu cuerpo. Un valor alto indica una mayor tendencia a almacenar energía.
                    </p>
                    <button type="button" onClick={() => setShowEndoInfo(false)} className="mt-3 w-full rounded-xl bg-stone/5 py-2 text-[9px] font-bold uppercase text-stone/40 hover:bg-stone/10 transition-colors">Cerrar</button>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-t border-l border-stone/10 bg-white" />
                  </div>
                )}
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-500 relative group ${
                somatotipoPredominante === 'mesomorfia' 
                  ? 'bg-sage/10 border-sage/20 scale-105 shadow-md shadow-sage/10 ring-2 ring-sage/20' 
                  : 'bg-white/40 backdrop-blur-sm border-sage/5'
              } flex flex-col items-center`}>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75">
                   <LabelWithHistory 
                    label="" 
                    history={antroHist.mesomorfia}
                    onRestore={(v) => useFormStore.getState().setAntropometria({ mesomorfia: v })}
                  />
                </div>
                <span className={`text-[9px] font-bold uppercase mb-1 flex items-center gap-1 ${somatotipoPredominante === 'mesomorfia' ? 'text-sage' : 'text-stone/40'}`}>
                  Mesomorfia
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowMesoInfo(!showMesoInfo);
                      setShowDCInfo(false);
                      setShowFatInfo(false);
                      setShowEndoInfo(false);
                      setShowEctoInfo(false);
                    }}
                    className="transition-colors"
                  >
                    <Info size={10} />
                  </button>
                </span>
                <span className={`text-2xl font-black ${somatotipoPredominante === 'mesomorfia' ? 'text-sage' : 'text-stone'}`}>{data.antropometria.mesomorfia}</span>
                {somatotipoPredominante === 'mesomorfia' && <span className="mt-1 text-[8px] font-black uppercase text-sage tracking-tighter">Predominante</span>}
                
                {showMesoInfo && (
                  <div className="absolute inset-x-0 top-full z-[100] mt-4 mx-0 rounded-2xl border border-stone/10 bg-white p-4 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300 text-left min-w-[200px]">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-sage border-b border-sage/10 pb-1 text-center">Mesomorfia</div>
                    <p className="text-[11px] leading-relaxed text-stone font-bold">
                      Mide la robustez musculoesquelética relativa. Refleja una mayor densidad de tejido muscular y óseo.
                    </p>
                    <button type="button" onClick={() => setShowMesoInfo(false)} className="mt-3 w-full rounded-xl bg-stone/5 py-2 text-[9px] font-bold uppercase text-stone/40 hover:bg-stone/10 transition-colors">Cerrar</button>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-t border-l border-stone/10 bg-white" />
                  </div>
                )}
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-500 relative group ${
                somatotipoPredominante === 'ectomorfia' 
                  ? 'bg-sky-50 border-sky-200 scale-105 shadow-md shadow-sky-100 ring-2 ring-sky-500/20' 
                  : 'bg-white/40 backdrop-blur-sm border-sage/5'
              } flex flex-col items-center`}>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75">
                   <LabelWithHistory 
                    label="" 
                    history={antroHist.ectomorfia}
                    onRestore={(v) => useFormStore.getState().setAntropometria({ ectomorfia: v })}
                  />
                </div>
                <span className={`text-[9px] font-bold uppercase mb-1 flex items-center gap-1 ${somatotipoPredominante === 'ectomorfia' ? 'text-sky-600' : 'text-stone/40'}`}>
                  Ectomorfia
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEctoInfo(!showEctoInfo);
                      setShowDCInfo(false);
                      setShowFatInfo(false);
                      setShowEndoInfo(false);
                      setShowMesoInfo(false);
                    }}
                    className="transition-colors"
                  >
                    <Info size={10} />
                  </button>
                </span>
                <span className={`text-2xl font-black ${somatotipoPredominante === 'ectomorfia' ? 'text-sky-900' : 'text-stone'}`}>{data.antropometria.ectomorfia}</span>
                {somatotipoPredominante === 'ectomorfia' && <span className="mt-1 text-[8px] font-black uppercase text-sky-500 tracking-tighter">Predominante</span>}
                
                {showEctoInfo && (
                  <div className="absolute inset-x-0 top-full z-[100] mt-4 mx-0 rounded-2xl border border-stone/10 bg-white p-4 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300 text-left min-w-[200px]">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-sky-600 border-b border-sky-600/10 pb-1 text-center">Ectomorfia</div>
                    <p className="text-[11px] leading-relaxed text-stone font-bold">
                      Refleja la delgadez relativa o linealidad del cuerpo. Se asocia con extremidades largas y poca grasa.
                    </p>
                    <button type="button" onClick={() => setShowEctoInfo(false)} className="mt-3 w-full rounded-xl bg-stone/5 py-2 text-[9px] font-bold uppercase text-stone/40 hover:bg-stone/10 transition-colors">Cerrar</button>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-t border-l border-stone/10 bg-white" />
                  </div>
                )}
              </div>
            </div>


            {evaluacion && (
              <div className={`mt-8 rounded-2xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${evaluacion.clase}`}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                  <span className={`h-2 w-2 rounded-full animate-pulse ${evaluacion.iconoClase}`} />
                  Evaluación del Estado y Tendencias
                </h3>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2 lg:grid-cols-4 border-b border-black/5 pb-6 mb-6">
                  <EvaluationItem 
                    label="TMB (BMR)" 
                    value={<>{evaluacion.tmb} <span className="text-[10px] opacity-40">kcal/día</span></>}
                    info="Es la cantidad de calorías que tu cuerpo quema simplemente por existir y mantener tus órganos funcionando (corazón, pulmones, cerebro) mientras estás en reposo total. Es tu 'costo de mantenimiento' básico sin contar ninguna actividad física."
                  />
                  <EvaluationItem 
                    label="Gasto Energético (GET)" 
                    value={<>{evaluacion.get} <span className="text-[10px] opacity-40">kcal/día</span></>}
                    info="Representa el total de energía que gastas en un día completo, sumando tu metabolismo basal más el movimiento diario y el ejercicio. Es la cifra clave: si comes más de esto ganarás peso, y si comes menos, perderás."
                  />
                  <EvaluationItem 
                    label="Cociente Grasa/Magra" 
                    value={<>{evaluacion.cociente} <span className="text-[10px] opacity-40">Ratio</span></>}
                    info="Esta cifra nos dice cuánta grasa tienes en comparación con tu músculo. Un número más bajo significa que tienes una composición más atlética y 'limpia'. Es mejor indicador de salud que el peso simple porque separa el tejido bueno (músculo) del excedente (grasa)."
                  />
                  <EvaluationItem 
                    label="IAC (Adiposidad)" 
                    value={<>{evaluacion.iac} <span className="text-[10px] opacity-40">Indice</span></>}
                    info="Es una forma de medir qué tanta grasa tienes usando la medida de tus caderas y tu estatura. A diferencia del IMC común, el IAC no se confunde si tienes mucho músculo, siendo más preciso para entender tu nivel de grasa real."
                  />
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                  <EvaluationItem 
                    label="Clasificación Somatocarta" 
                    value={evaluacion.somatocarta}
                    info={`Es tu 'mapa genético' corporal. ${evaluacion.somatocartaInfo}`}
                  />
                  <EvaluationItem 
                    label="Predominancia Genética" 
                    value={evaluacion.predominancia}
                    info="Son los valores numéricos que definen tu estructura física. El primer número es tu tendencia a ganar grasa (Endomorfia), el segundo tu facilidad para ganar músculo (Mesomorfia) y el tercero tu nivel de delgadez (Ectomorfia). Esta combinación nos da una visión exacta de tu punto de partida biológico."
                  />
                  <EvaluationItem 
                    label="Prioridad Nutricional" 
                    value={evaluacion.prioridad}
                    info={`Define el objetivo principal de tu alimentación ahora mismo. ${evaluacion.prioridadInfo}`}
                  />
                  <EvaluationItem 
                    label="Sugerencia Proteína" 
                    value={evaluacion.proteina}
                    info="La proteína es el 'ladrillo' que construye y mantiene tus músculos. Calculamos esta cantidad para asegurar que, incluso si estás perdiendo grasa, no pierdas tu masa muscular, manteniéndote fuerte y con un metabolismo activo."
                  />
                  <EvaluationItem 
                    label="Sugerencia Carbohidratos" 
                    value={evaluacion.carbohidratos}
                    info="Los carbohidratos son tu combustible principal. Ajustamos su cantidad según cómo tu cuerpo procesa el azúcar y cuánta energía necesitas para tus entrenamientos, evitando que se almacenen como grasa innecesaria."
                  />
                  <EvaluationItem 
                    label="Enfoque Entrenamiento" 
                    value={evaluacion.entrenamiento}
                    info="Te indica cómo deberías entrenar para obtener resultados óptimos según tu tipo de cuerpo. Algunos necesitan más repeticiones y poco descanso, mientras que otros necesitan levantar más peso y descansar más para progresar sin agotarse."
                  />
                  <EvaluationItem 
                    label="Tasa Cambio Semanal" 
                    value={evaluacion.tasaCambio}
                    info="Es la velocidad recomendada para que cambie tu peso. Perder o ganar peso demasiado rápido suele ser contraproducente (se pierde músculo o se gana mucha grasa). Esta cifra asegura que tus cambios sean saludables y duraderos."
                  />
                  <EvaluationItem 
                    label="Estado Saludable" 
                    value={evaluacion.saludable}
                    info="Una mirada general a cómo se encuentra tu equilibrio interno. Analizamos si tus niveles actuales de grasa y músculo están en un rango que favorece la longevidad y previene enfermedades metabólicas."
                  />
                  <EvaluationItem 
                    label="Acumulación de Grasa" 
                    value={evaluacion.acumulacionGrasa}
                    info="Explica con qué facilidad tu cuerpo guarda energía de reserva. Algunas personas acumulan grasa muy rápido ante pequeños excesos, mientras que otras son más resistentes. Entender esto nos permite ajustar tu dieta con precisión."
                  />
                  <EvaluationItem 
                    label="Respuesta a Excesos" 
                    value={evaluacion.respuestaExcesos}
                    info="Es la capacidad de tu metabolismo para 'quemar' o procesar una comida muy grande o un día de excesos. Nos dice si tu cuerpo es flexible y se recupera rápido o si tiende a almacenar esos excedentes inmediatamente."
                  />
                  <EvaluationItem 
                    label="Sensibilidad Digestiva" 
                    value={evaluacion.sensibilidadDigestiva}
                    info="Indica qué tan delicado es tu sistema digestivo. Ciertos biotipos procesan mejor las grasas, otros los carbohidratos. Saber esto ayuda a elegir alimentos que no te causen inflamación o pesadez."
                  />
                  <EvaluationItem 
                    label="Margen Muscular" 
                    value={evaluacion.margenMuscular}
                    info="Es tu potencial natural para desarrollar fuerza y tamaño muscular. Algunas personas tienen una base genética que les permite ganar músculo muy rápido, mientras que otras necesitan un trabajo más específico y paciente."
                  />
                  <EvaluationItem 
                    label="Fase de Definición" 
                    value={evaluacion.faseDefinicion}
                    info="Describe cómo debería ser tu estrategia cuando quieras marcar tus músculos y perder grasa. Te indica si debes ser muy estricto con las calorías o si puedes permitirte un enfoque más flexible según tu facilidad para perder tejido adiposo."
                  />
                  <EvaluationItem 
                    label="Tipo de Volumen" 
                    value={evaluacion.volumen}
                    info="Te guía sobre cómo ganar masa muscular de forma inteligente. Un volumen 'controlado' busca ganar músculo sin ganar grasa, mientras que uno 'agresivo' aprovecha una gran capacidad metabólica para crecer al máximo."
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ====== BARRA INFERIOR FIJA: ACCIONES ====== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone/10 bg-white/90 px-4 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo-reliv.png" alt="" className="h-10 w-auto object-contain opacity-80 mix-blend-multiply" />
          <div className="hidden sm:block border-l border-stone/10 pl-4">
            <div className="text-xs font-black uppercase tracking-tighter text-stone/20">Paciente</div>
            <div className="text-sm font-bold text-stone truncate max-w-[200px]">
              {data.consentimiento.nombreCompleto || '—'}
            </div>
          </div>
        </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || generating || generatingWord}
              className="flex-1 sm:flex-none rounded-xl bg-stone px-4 sm:px-6 py-3 text-sm font-bold text-white shadow-lg shadow-stone/20 transition-all hover:bg-stone/90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={18} /> {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadWord}
                disabled={generatingWord || generating}
                className="flex-1 sm:flex-none rounded-xl border-2 border-sage bg-white px-4 sm:px-6 py-3 text-sm font-bold text-sage transition-all hover:bg-sage hover:text-white active:scale-95 disabled:opacity-50"
              >
                {generatingWord ? '...' : '📝 Word'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={generating || generatingWord}
                className="flex-1 sm:flex-none rounded-xl bg-sage px-4 sm:px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage/90 active:scale-95 disabled:opacity-50"
              >
                {generating ? '...' : '📄 PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF oculto */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none', opacity: 0 }}
      >
        <PdfDocument data={data} />
      </div>
    </div>
  );
}

const inputClass =
  'block w-full max-w-full min-w-0 rounded-xl border border-stone/10 bg-white px-2 sm:px-3 py-2 text-sm text-stone font-medium focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/5 transition-all placeholder:text-stone/30';

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
        {deduplicateHistory(entries).map((entry, idx) => (
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
    <section className="mb-6 rounded-3xl border border-stone/20 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-black text-stone uppercase tracking-tight font-serif">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sand text-sm font-black text-stone font-serif">
          {number}
        </span>
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function AntroField({ 
  label, 
  value, 
  onChange,
  readOnly = false,
  history = []
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  readOnly?: boolean;
  history?: { valor: string; fecha: string }[];
}) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold uppercase tracking-widest text-stone/40">
          {label}
        </label>
        <button
          type="button"
          onClick={() => history.length > 0 && setShowHistory(!showHistory)}
          className={`transition-colors ${
            history.length > 0 
              ? (showHistory ? 'text-sage' : 'text-stone/20 hover:text-sage') 
              : 'text-stone/10 cursor-not-allowed'
          }`}
          title={history.length > 0 ? "Ver historial" : "Sin historial previo"}
        >
          <Info size={14} />
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${readOnly ? 'bg-stone/5 cursor-not-allowed font-bold' : ''}`}
        placeholder="0.0"
        readOnly={readOnly}
      />

      {showHistory && history.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-stone/10 bg-white p-3 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="mb-2 flex items-center justify-between border-b border-stone/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-tighter text-stone/40">Historial de {label}</span>
            <button type="button" onClick={() => setShowHistory(false)} className="text-stone/30 hover:text-stone">
              <Info size={12} className="rotate-180" />
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {deduplicateHistory(history).reverse().map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(h.valor);
                  setShowHistory(false);
                }}
                className="flex w-full items-center justify-between rounded-lg bg-blush/20 p-2 text-left transition-all hover:bg-blush active:scale-[0.98]"
              >
                <span className="text-sm font-bold text-stone">{h.valor}</span>
                <span className="text-[9px] font-medium text-stone/40">{h.fecha}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LabelWithHistory({ 
  label, 
  history = [], 
  onRestore 
}: { 
  label: string; 
  history?: { texto?: string; valor?: string; fecha: string }[]; 
  onRestore: (val: string) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="relative flex items-center justify-between mb-1">
      <label className="block text-[10px] font-bold uppercase opacity-50">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => history.length > 0 && setShowHistory(!showHistory)}
          className={`transition-colors ${
            history.length > 0 
              ? (showHistory ? 'text-sage' : 'text-stone/20 hover:text-sage') 
              : 'text-stone/10 cursor-not-allowed'
          }`}
          title={history.length > 0 ? "Ver historial" : "Sin historial previo"}
        >
          <Calendar size={14} />
        </button>

        {showHistory && history.length > 0 && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-stone/10 bg-white p-3 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="mb-2 flex items-center justify-between border-b border-stone/5 pb-2">
              <span className="text-[10px] font-black uppercase tracking-tighter text-stone/40">Historial</span>
              <button type="button" onClick={() => setShowHistory(false)} className="text-stone/30 hover:text-stone">
                <Info size={12} className="rotate-180" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {deduplicateHistory(history).reverse().map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onRestore(h.texto || h.valor || '');
                    setShowHistory(false);
                  }}
                  className="flex w-full flex-col gap-1 rounded-lg bg-blush/20 p-2 text-left transition-all hover:bg-blush active:scale-[0.98]"
                >
                  <span className="text-xs font-bold text-stone line-clamp-3">{h.texto || h.valor}</span>
                  <span className="text-[9px] font-medium text-stone/40">{h.fecha}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EvaluationItem({ 
  label, 
  value, 
  info 
}: { 
  label: string; 
  value: string | React.ReactNode; 
  info: string; 
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-col relative group">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-bold uppercase opacity-40 tracking-wider">{label}</span>
        <button 
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className={`transition-colors p-0.5 rounded-md ${showInfo ? 'text-sage bg-sage/10' : 'text-stone/20 hover:text-sage hover:bg-sage/5'}`}
        >
          <Info size={11} />
        </button>
      </div>
      <div className="text-sm font-bold leading-tight">{value}</div>
      
      {showInfo && (
        <div className="absolute left-0 bottom-full z-[100] mb-2 w-64 rounded-2xl border border-stone/10 bg-white p-4 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-sage border-b border-sage/10 pb-1">Descripción Detallada</div>
          <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-[12px] leading-relaxed text-stone/80 font-medium">
              {info}
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowInfo(false)}
            className="mt-3 w-full rounded-xl bg-stone/5 py-2 text-[10px] font-bold uppercase text-stone/40 hover:bg-stone/10 transition-colors"
          >
            Entendido
          </button>
          
          {/* Flecha del tooltip */}
          <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 border-b border-r border-stone/10 bg-white" />
        </div>
      )}
    </div>
  );
}
