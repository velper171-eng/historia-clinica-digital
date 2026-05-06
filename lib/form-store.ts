'use client';

import { create } from 'zustand';
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

const today = () => new Date().toISOString().slice(0, 10);

const initialState: HistoriaClinica = {
  id: undefined,
  consentimiento: {
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
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
  firmaFinal: '',
  fechaFinal: today(),
  puntosInyeccion: INJECTION_POINTS.map((p) => ({
    id: p.id,
    activo: false,
    aplicacionesAnteriores: [],
  })),
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
  setFirmaFinal: (s: string) => void;
  setFechaFinal: (s: string) => void;
  togglePuntoInyeccion: (id: string) => void;
  setPuntoUnidades: (id: string, unidades: number | undefined) => void;
  setPuntoNota: (id: string, nota: string) => void;
  
  // Métodos para historial
  updateProcedimientoHistorico: (index: number, texto: string) => void;
  updateMedicamentoHistorico: (index: number, texto: string) => void;
  updateQuirurgicoHistorico: (index: number, texto: string) => void;
  updateRiesgoHistorico: (index: number, texto: string) => void;
  updatePatologicoHistorico: (index: number, texto: string) => void;
  updateAlergiaHistorico: (index: number, texto: string) => void;
  updateCondicionHistorico: (index: number, texto: string) => void;
  updateObservacionGralHistorico: (index: number, texto: string) => void;
  commitToHistory: () => void;

  loadData: (data: HistoriaClinica) => void;
  reset: () => void;
};

export const useFormStore = create<Store>((set) => ({
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
        p.id === id ? { ...p, unidades } : p
      ),
    })),
  setPuntoNota: (id, nota) =>
    set((s) => ({
      puntosInyeccion: s.puntosInyeccion.map((p) =>
        p.id === id ? { ...p, nota } : p
      ),
    })),

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

  commitToHistory: () =>
    set((s) => {
      const fecha = today();
      const newProcedimientos = [...s.procedimientosAnteriores];
      if (s.consentimiento.procedimiento.trim()) {
        newProcedimientos.push({ texto: s.consentimiento.procedimiento, fecha });
      }

      const newMedicamentos = [...s.medicamentosAnteriores];
      if (s.medicamentos.trim()) {
        newMedicamentos.push({ texto: s.medicamentos, fecha });
      }

      const newQuirurgicos = [...s.quirurgicosAnteriores];
      if (s.quirurgicos.trim()) {
        newQuirurgicos.push({ texto: s.quirurgicos, fecha });
      }

      const newRiesgos = [...s.consentimiento.riesgosInformadosAnteriores];
      if (s.consentimiento.riesgosInformados.trim()) {
        newRiesgos.push({ texto: s.consentimiento.riesgosInformados, fecha });
      }

      const newPatologicos = [...s.observacionesPatologicosAnteriores];
      if (s.observacionesPatologicos.trim()) {
        newPatologicos.push({ texto: s.observacionesPatologicos, fecha });
      }

      const newAlergias = [...s.observacionesAlergiasAnteriores];
      if (s.observacionesAlergias.trim()) {
        newAlergias.push({ texto: s.observacionesAlergias, fecha });
      }

      const newCondiciones = [...s.condicionRecuperacionAnteriores];
      if (s.condicionRecuperacion.trim()) {
        newCondiciones.push({ texto: s.condicionRecuperacion, fecha });
      }

      const newObsGral = [...s.observacionesGeneralesAnteriores];
      if (s.observacionesGenerales.trim()) {
        newObsGral.push({ texto: s.observacionesGenerales, fecha });
      }

      const newPuntos = s.puntosInyeccion.map((p) => {
        if (p.activo && p.unidades) {
          return {
            ...p,
            activo: false,
            unidades: undefined,
            nota: undefined,
            aplicacionesAnteriores: [
              ...p.aplicacionesAnteriores,
              { unidades: p.unidades, fecha, nota: p.nota },
            ],
          };
        }
        return p;
      });

      return {
        procedimientosAnteriores: newProcedimientos,
        medicamentosAnteriores: newMedicamentos,
        quirurgicosAnteriores: newQuirurgicos,
        observacionesPatologicosAnteriores: newPatologicos,
        observacionesAlergiasAnteriores: newAlergias,
        condicionRecuperacionAnteriores: newCondiciones,
        observacionesGeneralesAnteriores: newObsGral,
        puntosInyeccion: newPuntos,
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
      };
    }),

  loadData: (data) => 
    set((s) => ({ 
      ...structuredClone(initialState), 
      ...structuredClone(data),
      // Aseguramos que los arreglos de historial existan si el registro es viejo
      procedimientosAnteriores: data.procedimientosAnteriores || [],
      medicamentosAnteriores: data.medicamentosAnteriores || [],
      quirurgicosAnteriores: data.quirurgicosAnteriores || [],
      observacionesPatologicosAnteriores: data.observacionesPatologicosAnteriores || [],
      observacionesAlergiasAnteriores: data.observacionesAlergiasAnteriores || [],
      condicionRecuperacionAnteriores: data.condicionRecuperacionAnteriores || [],
      observacionesGeneralesAnteriores: data.observacionesGeneralesAnteriores || [],
      consentimiento: {
        ...(data.consentimiento || s.consentimiento),
        riesgosInformadosAnteriores: data.consentimiento?.riesgosInformadosAnteriores || []
      },
      puntosInyeccion: (data.puntosInyeccion || s.puntosInyeccion).map(p => ({
        ...p,
        aplicacionesAnteriores: p.aplicacionesAnteriores || []
      }))
    })),
  reset: () => set(structuredClone(initialState)),
}));
