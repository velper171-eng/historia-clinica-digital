'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  HistoriaClinica,
  Consentimiento,
  DiseaseRecord,
  AllergyRecord,
} from './form-schema';
import { INJECTION_POINTS } from './injection-points';

const emptyEnfermedad = { presenta: false, observacion: '' };

const emptyDiseaseRecord: DiseaseRecord = {
  neurologica: { ...emptyEnfermedad },
  oftalmica: { ...emptyEnfermedad },
  cardiovascularMetabolica: { ...emptyEnfermedad },
  renal: { ...emptyEnfermedad },
  oseaMusculoesqueletica: { ...emptyEnfermedad },
  autoinmuneReumatologica: { ...emptyEnfermedad },
  otras: { ...emptyEnfermedad },
};

const emptyAllergyRecord: AllergyRecord = {
  aines: false,
  opioides: false,
  antihistaminicos: false,
  antibioticos: false,
  oseaMusculoesqueletica: false,
  anestesicosLocales: false,
  otros: { presenta: false, descripcion: '' },
};
 
const emptyAntropometria = {
  masaCorporal: '',
  talla: '',
  edad: '',
  plTriceps: '',
  plSubescapular: '',
  plBiceps: '',
  plCrestaIliaca: '',
  plSupraespinal: '',
  plAbdominal: '',
  plMuslo: '',
  plPierna: '',
  prBrazoRelajado: '',
  prBrazoFlexionado: '',
  prCintura: '',
  prCaderas: '',
  prMusloMedio: '',
  prPierna: '',
  dHumero: '',
  dBiestiloideo: '',
  dFemur: '',
  dc: '',
  porcentajeGrasa: '',
  endomorfia: '',
  mesomorfia: '',
  ectomorfia: '',
  // Evaluaciones descriptivas
  evaluacionSaludable: '',
  evaluacionGrasa: '',
  evaluacionRespuestaCalorica: '',
  evaluacionSensibilidadDigestiva: '',
  evaluacionMargenMuscular: '',
  evaluacionFaseDefinicion: '',
  evaluacionVolumen: '',
  // Nuevos campos
  perfilTMB: '',
  perfilGET: '',
  perfilCocienteGrasaMasaMagra: '',
  analisisClasificacionSomatocarta: '',
  analisisPredominanciaGenetica: '',
  analisisVarianzaPrototipo: '',
  tendenciaPrioridadNutricional: '',
  tendenciaSugerenciaProteina: '',
  tendenciaSugerenciaCarbohidratos: '',
  tendenciaEnfoqueEntrenamiento: '',
  seguimientoTasaCambioSemanal: '',
  seguimientoIAC: '',
};

const today = () => new Date().toISOString().slice(0, 10);

const initialState: HistoriaClinica = {
  id: undefined,
  consentimiento: {
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    fechaNacimiento: '',
    autorizadoA: 'Isabel Velasquez',
    procedimiento: '',
    riesgosInformados:
      'Dolor leve, eritema, edema, hematomas en los puntos de inyección, cefalea transitoria, ptosis palpebral, asimetría facial, reacción alérgica.',
    riesgosInformadosAnteriores: [],
    firma: '',
    fecha: today(),
  },
  procedimientosAnteriores: [],
  antecedentesPersonales: structuredClone(emptyDiseaseRecord),
  antecedentesFamiliares: structuredClone(emptyDiseaseRecord),
  observacionesPatologicos: '',
  observacionesPatologicosAnteriores: [],
  medicamentos: '',
  medicamentosAnteriores: [],
  alergicos: structuredClone(emptyAllergyRecord),
  observacionesAlergias: '',
  observacionesAlergiasAnteriores: [],
  quirurgicos: '',
  quirurgicosAnteriores: [],
  condicionRecuperacion: '',
  condicionRecuperacionAnteriores: [],
  estadoGestacion: 'No',
  tipoCutis: 'Normal',
  sesionesProgramadas: 1,
  fechasSesiones: [today()],
  observacionesGenerales: '',
  observacionesGeneralesAnteriores: [],
  evolucionProcedimientos: '',
  evolucionProcedimientosAnteriores: [],
  firmaFinal: '',
  fechaFinal: today(),
  puntosInyeccion: INJECTION_POINTS.map((p) => ({
    id: p.id,
    activo: false,
    aplicacionesAnteriores: [],
  })),
  antropometria: { ...emptyAntropometria },
  antropometriaHistorial: {},
};

type Store = HistoriaClinica & {
  setConsentimiento: (data: Partial<Consentimiento>) => void;
  setAntecedentesPersonales: (data: DiseaseRecord) => void;
  setAntecedentesFamiliares: (data: DiseaseRecord) => void;
  setObservacionesPatologicos: (s: string) => void;
  setMedicamentos: (s: string) => void;
  setAlergicos: (data: AllergyRecord) => void;
  setObservacionesAlergias: (s: string) => void;
  setQuirurgicos: (s: string) => void;
  setCondicionRecuperacion: (s: string) => void;
  setEstadoGestacion: (s: 'Sí' | 'No' | 'No aplica') => void;
  setTipoCutis: (s: 'Normal' | 'Seca' | 'Grasa' | 'Mixta') => void;
  setSesionesProgramadas: (n: number) => void;
  setFechasSesiones: (arr: string[]) => void;
  setObservacionesGenerales: (s: string) => void;
  setEvolucionProcedimientos: (s: string) => void;
  setFirmaFinal: (s: string) => void;
  setFechaFinal: (s: string) => void;
  togglePuntoInyeccion: (id: string) => void;
  setPuntoUnidades: (id: string, unidades: number | undefined) => void;
  setPuntoNota: (id: string, nota: string) => void;
  removePuntoInyeccion: (id: string) => void;
  setAntropometria: (data: Partial<Store['antropometria']>) => void;
  setFechaNacimiento: (fecha: string) => void;
  
  // Métodos para historial
  updateProcedimientoHistorico: (index: number, texto: string) => void;
  updateMedicamentoHistorico: (index: number, texto: string) => void;
  updateQuirurgicoHistorico: (index: number, texto: string) => void;
  updateRiesgoHistorico: (index: number, texto: string) => void;
  updatePatologicoHistorico: (index: number, texto: string) => void;
  updateAlergiaHistorico: (index: number, texto: string) => void;
  updateCondicionHistorico: (index: number, texto: string) => void;
  updateObservacionGralHistorico: (index: number, texto: string) => void;
  updateEvolucionProcedimientosHistorico: (index: number, texto: string) => void;
  commitToHistory: () => void;

  loadData: (data: HistoriaClinica) => void;
  reset: () => void;
  discardCurrentSession: () => void;
};

export const useFormStore = create<Store>()(
  persist(
    (set) => ({
      ...structuredClone(initialState),
      setConsentimiento: (data) =>
        set((s) => ({ consentimiento: { ...s.consentimiento, ...data } })),
      setAntecedentesPersonales: (data) => set({ antecedentesPersonales: data }),
      setAntecedentesFamiliares: (data) => set({ antecedentesFamiliares: data }),
      setObservacionesPatologicos: (observacionesPatologicos) =>
        set({ observacionesPatologicos }),
      setMedicamentos: (medicamentos) => set({ medicamentos }),
      setAlergicos: (alergicos) => set({ alergicos }),
      setObservacionesAlergias: (observacionesAlergias) =>
        set({ observacionesAlergias }),
      setQuirurgicos: (quirurgicos) => set({ quirurgicos }),
      setCondicionRecuperacion: (condicionRecuperacion) =>
        set({ condicionRecuperacion }),
      setEstadoGestacion: (estadoGestacion) => set({ estadoGestacion }),
      setTipoCutis: (tipoCutis) => set({ tipoCutis }),
      setSesionesProgramadas: (sesionesProgramadas) => set({ sesionesProgramadas }),
      setFechasSesiones: (fechasSesiones) => set({ fechasSesiones }),
      setObservacionesGenerales: (observacionesGenerales) => set({ observacionesGenerales }),
      setEvolucionProcedimientos: (evolucionProcedimientos) => set({ evolucionProcedimientos }),
      setFirmaFinal: (firmaFinal) => set({ firmaFinal }),
      setFechaFinal: (fechaFinal) => set({ fechaFinal }),
      togglePuntoInyeccion: (id) =>
        set((s) => ({
          puntosInyeccion: s.puntosInyeccion.map((p) =>
            p.id === id 
              ? { 
                  ...p, 
                  activo: true, 
                  unidades: (p.unidades || 0) + 1 
                } 
              : p
          ),
        })),
      setPuntoUnidades: (id, unidades) =>
        set((s) => ({
          puntosInyeccion: s.puntosInyeccion.map((p) =>
            p.id === id ? { ...p, unidades: Math.max(0, unidades || 0) } : p
          ),
        })),
      setPuntoNota: (id, nota) =>
        set((s) => ({
          puntosInyeccion: s.puntosInyeccion.map((p) =>
            p.id === id ? { ...p, nota } : p
          ),
        })),
      removePuntoInyeccion: (id) =>
        set((s) => ({
          puntosInyeccion: s.puntosInyeccion.map((p) =>
            p.id === id ? { ...p, activo: false, unidades: undefined, nota: undefined } : p
          ),
        })),
      setAntropometria: (data) =>
        set((s) => ({ antropometria: { ...s.antropometria, ...data } })),
      
      setFechaNacimiento: (fecha: string) => {
        set((s) => {
          let edadStr = s.antropometria.edad;
          if (fecha) {
            const birthDate = new Date(fecha);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            edadStr = age >= 0 ? age.toString() : '';
          }
          return {
            consentimiento: { ...s.consentimiento, fechaNacimiento: fecha },
            antropometria: { ...s.antropometria, edad: edadStr }
          };
        });
      },

      updateProcedimientoHistorico: (index, texto) =>
        set((s) => ({
          procedimientosAnteriores: s.procedimientosAnteriores.map((p, i) =>
            i === index ? { ...p, texto } : p
          ),
        })),
      updateMedicamentoHistorico: (index, texto) =>
        set((s) => ({
          medicamentosAnteriores: s.medicamentosAnteriores.map((m, i) =>
            i === index ? { ...m, texto } : m
          ),
        })),
      updateQuirurgicoHistorico: (index, texto) =>
        set((s) => ({
          quirurgicosAnteriores: s.quirurgicosAnteriores.map((q, i) =>
            i === index ? { ...q, texto } : q
          ),
        })),
      updateRiesgoHistorico: (index, texto) =>
        set((s) => ({
          consentimiento: {
            ...s.consentimiento,
            riesgosInformadosAnteriores: s.consentimiento.riesgosInformadosAnteriores.map((r, i) =>
              i === index ? { ...r, texto } : r
            ),
          },
        })),
      updatePatologicoHistorico: (index, texto) =>
        set((s) => ({
          observacionesPatologicosAnteriores: s.observacionesPatologicosAnteriores.map((p, i) =>
            i === index ? { ...p, texto } : p
          ),
        })),
      updateAlergiaHistorico: (index, texto) =>
        set((s) => ({
          observacionesAlergiasAnteriores: s.observacionesAlergiasAnteriores.map((a, i) =>
            i === index ? { ...a, texto } : a
          ),
        })),
      updateCondicionHistorico: (index, texto) =>
        set((s) => ({
          condicionRecuperacionAnteriores: s.condicionRecuperacionAnteriores.map((c, i) =>
            i === index ? { ...c, texto } : c
          ),
        })),
      updateObservacionGralHistorico: (index, texto) =>
        set((s) => ({
          observacionesGeneralesAnteriores: s.observacionesGeneralesAnteriores.map((o, i) =>
            i === index ? { ...o, texto } : o
          ),
        })),
      updateEvolucionProcedimientosHistorico: (index, texto) =>
        set((s) => ({
          evolucionProcedimientosAnteriores: s.evolucionProcedimientosAnteriores.map((e, i) =>
            i === index ? { ...e, texto } : e
          ),
        })),

      commitToHistory: () =>
        set((s) => {
          const fecha = today();
          
          const pushOrUpdate = <T extends { fecha: string }>(arr: T[], newItem: T): T[] => {
            const index = arr.findIndex((item) => item.fecha === newItem.fecha);
            if (index !== -1) {
              const updated = [...arr];
              updated[index] = newItem;
              return updated;
            }
            return [...arr, newItem];
          };

          let newProcedimientos = [...s.procedimientosAnteriores];
          if (s.consentimiento.procedimiento.trim()) {
            newProcedimientos = pushOrUpdate(newProcedimientos, { texto: s.consentimiento.procedimiento, fecha });
          }

          let newMedicamentos = [...s.medicamentosAnteriores];
          if (s.medicamentos.trim()) {
            newMedicamentos = pushOrUpdate(newMedicamentos, { texto: s.medicamentos, fecha });
          }

          let newQuirurgicos = [...s.quirurgicosAnteriores];
          if (s.quirurgicos.trim()) {
            newQuirurgicos = pushOrUpdate(newQuirurgicos, { texto: s.quirurgicos, fecha });
          }

          let newRiesgos = [...s.consentimiento.riesgosInformadosAnteriores];
          if (s.consentimiento.riesgosInformados.trim()) {
            newRiesgos = pushOrUpdate(newRiesgos, { texto: s.consentimiento.riesgosInformados, fecha });
          }

          let newPatologicos = [...s.observacionesPatologicosAnteriores];
          if (s.observacionesPatologicos.trim()) {
            newPatologicos = pushOrUpdate(newPatologicos, { texto: s.observacionesPatologicos, fecha });
          }

          let newAlergias = [...s.observacionesAlergiasAnteriores];
          if (s.observacionesAlergias.trim()) {
            newAlergias = pushOrUpdate(newAlergias, { texto: s.observacionesAlergias, fecha });
          }

          let newCondiciones = [...s.condicionRecuperacionAnteriores];
          if (s.condicionRecuperacion.trim()) {
            newCondiciones = pushOrUpdate(newCondiciones, { texto: s.condicionRecuperacion, fecha });
          }

          let newObsGral = [...s.observacionesGeneralesAnteriores];
          if (s.observacionesGenerales.trim()) {
            newObsGral = pushOrUpdate(newObsGral, { texto: s.observacionesGenerales, fecha });
          }

          let newEvolucion = [...s.evolucionProcedimientosAnteriores];
          if (s.evolucionProcedimientos.trim()) {
            newEvolucion = pushOrUpdate(newEvolucion, { texto: s.evolucionProcedimientos, fecha });
          }

          const newPuntos = s.puntosInyeccion.map((p) => {
            if (p.activo && p.unidades) {
              const existingIndex = p.aplicacionesAnteriores.findIndex(a => a.fecha === fecha);
              let updatedAplicaciones;
              if (existingIndex !== -1) {
                updatedAplicaciones = [...p.aplicacionesAnteriores];
                updatedAplicaciones[existingIndex] = { unidades: p.unidades, fecha, nota: p.nota };
              } else {
                updatedAplicaciones = [
                  ...p.aplicacionesAnteriores,
                  { unidades: p.unidades, fecha, nota: p.nota },
                ];
              }
              return {
                ...p,
                activo: false,
                unidades: undefined,
                nota: undefined,
                aplicacionesAnteriores: updatedAplicaciones,
              };
            }
            return p;
          });

          const newAntroHistorial = { ...s.antropometriaHistorial };
          Object.entries(s.antropometria).forEach(([key, valor]) => {
            if (typeof valor === 'string' && valor.trim()) {
              if (!newAntroHistorial[key]) newAntroHistorial[key] = [];
              
              const existingIndex = newAntroHistorial[key].findIndex(h => h.fecha === fecha);
              if (existingIndex !== -1) {
                newAntroHistorial[key][existingIndex] = { valor, fecha };
              } else {
                newAntroHistorial[key] = [...newAntroHistorial[key], { valor, fecha }];
              }
            }
          });

          return {
            procedimientosAnteriores: newProcedimientos,
            medicamentosAnteriores: newMedicamentos,
            quirurgicosAnteriores: newQuirurgicos,
            observacionesPatologicosAnteriores: newPatologicos,
            observacionesAlergiasAnteriores: newAlergias,
            condicionRecuperacionAnteriores: newCondiciones,
            observacionesGeneralesAnteriores: newObsGral,
            evolucionProcedimientosAnteriores: newEvolucion,
            puntosInyeccion: newPuntos,
            antropometriaHistorial: newAntroHistorial,
            consentimiento: { 
              ...s.consentimiento, 
              procedimiento: '',
              riesgosInformados: '',
              riesgosInformadosAnteriores: newRiesgos
            },
            medicamentos: '',
            quirurgicos: '',
            observacionesPatologicos: '',
            observacionesAlergias: '',
            condicionRecuperacion: '',
            observacionesGenerales: '',
            evolucionProcedimientos: '',
          };
        }),

      loadData: (data) => 
        set((s) => ({ 
          ...structuredClone(initialState), 
          ...structuredClone(data),
          procedimientosAnteriores: data.procedimientosAnteriores || [],
          medicamentosAnteriores: data.medicamentosAnteriores || [],
          quirurgicosAnteriores: data.quirurgicosAnteriores || [],
          observacionesPatologicosAnteriores: data.observacionesPatologicosAnteriores || [],
          observacionesAlergiasAnteriores: data.observacionesAlergiasAnteriores || [],
          condicionRecuperacionAnteriores: data.condicionRecuperacionAnteriores || [],
          observacionesGeneralesAnteriores: data.observacionesGeneralesAnteriores || [],
          evolucionProcedimientosAnteriores: data.evolucionProcedimientosAnteriores || [],
          consentimiento: {
            ...(data.consentimiento || s.consentimiento),
            riesgosInformadosAnteriores: data.consentimiento?.riesgosInformadosAnteriores || []
          },
          puntosInyeccion: (data.puntosInyeccion || s.puntosInyeccion).map(p => ({
            ...p,
            activo: false,
            unidades: undefined,
            nota: undefined,
            aplicacionesAnteriores: p.aplicacionesAnteriores || []
          })),
          antropometria: data.antropometria || structuredClone(emptyAntropometria),
          antropometriaHistorial: data.antropometriaHistorial || {},
        })),
      reset: () => set(structuredClone(initialState)),
      discardCurrentSession: () =>
        set((s) => ({
          consentimiento: { 
            ...s.consentimiento, 
            procedimiento: '',
            riesgosInformados: initialState.consentimiento.riesgosInformados 
          },
          medicamentos: '',
          quirurgicos: '',
          observacionesPatologicos: '',
          observacionesAlergias: '',
          condicionRecuperacion: '',
          observacionesGenerales: '',
          evolucionProcedimientos: '',
          puntosInyeccion: s.puntosInyeccion.map(p => ({
            ...p,
            activo: false,
            unidades: undefined,
            nota: undefined
          })),
          antropometria: structuredClone(emptyAntropometria),
        })),
    }),
    {
      name: 'historia-clinica-storage',
    }
  )
);
