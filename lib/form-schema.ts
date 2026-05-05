import { z } from 'zod';

const enfermedadSchema = z.object({
  presenta: z.boolean(),
  observacion: z.string().default(''),
});

export const diseaseRecordSchema = z.object({
  neurologica: enfermedadSchema,
  oftalmica: enfermedadSchema,
  cardiovascularMetabolica: enfermedadSchema,
  renal: enfermedadSchema,
  oseaMusculoesqueletica: enfermedadSchema,
  autoinmuneReumatologica: enfermedadSchema,
  otras: enfermedadSchema,
});

export const allergyRecordSchema = z.object({
  aines: z.boolean(),
  opioides: z.boolean(),
  antihistaminicos: z.boolean(),
  antibioticos: z.boolean(),
  oseaMusculoesqueletica: z.boolean(),
  anestesicosLocales: z.boolean(),
  otros: z.object({
    presenta: z.boolean(),
    descripcion: z.string().default(''),
  }),
});

export const consentimientoSchema = z.object({
  nombreCompleto: z.string().min(3, 'Ingresa el nombre completo'),
  tipoDocumento: z.enum(['CC', 'CE', 'Pasaporte']),
  numeroDocumento: z.string().min(4, 'Número de documento inválido'),
  autorizadoA: z.string().min(3, 'Indica el profesional o clínica autorizada'),
  procedimiento: z.string().min(3, 'Describe el procedimiento'),
  riesgosInformados: z.string().min(10, 'Describe los riesgos informados'),
  firma: z.string().min(1, 'La firma es obligatoria'),
  fecha: z.string().min(1, 'Selecciona la fecha'),
});

export const puntoInyeccionSchema = z.object({
  id: z.string(),
  activo: z.boolean(),
  unidades: z.number().optional(),
  nota: z.string().optional(),
});

export const historiaClinicaSchema = z.object({
  consentimiento: consentimientoSchema,
  antecedentesPersonales: diseaseRecordSchema,
  antecedentesFamiliares: diseaseRecordSchema,
  observacionesPatologicos: z.string().default(''),
  medicamentos: z.string().default(''),
  alergicos: allergyRecordSchema,
  observacionesAlergias: z.string().default(''),
  quirurgicos: z.string().default(''),
  condicionRecuperacion: z.string().default(''),
  estadoGestacion: z.enum(['Sí', 'No', 'No aplica']).default('No'),
  tipoCutis: z.enum(['Normal', 'Seca', 'Grasa', 'Mixta']).default('Normal'),
  sesionesProgramadas: z.number().min(1).default(1),
  fechasSesiones: z.array(z.string()).default([]),
  observacionesGenerales: z.string().default(''),
  firmaFinal: z.string().min(1, 'La firma final es obligatoria'),
  fechaFinal: z.string().min(1, 'Selecciona la fecha'),
  puntosInyeccion: z.array(puntoInyeccionSchema),
});

export type Consentimiento = z.infer<typeof consentimientoSchema>;
export type DiseaseRecord = z.infer<typeof diseaseRecordSchema>;
export type AllergyRecord = z.infer<typeof allergyRecordSchema>;
export type PuntoInyeccion = z.infer<typeof puntoInyeccionSchema>;
export type HistoriaClinica = z.infer<typeof historiaClinicaSchema>;

export const ENFERMEDADES = [
  {
    key: 'neurologica' as const,
    label: 'Enfermedad neurológica',
    descripcion: 'Como migraña, alteración del aprendizaje o del habla, infección, aumento en la presión endocraneana, infarto cerebral previo, entre otros.',
  },
  {
    key: 'oftalmica' as const,
    label: 'Afección oftálmica',
    descripcion: 'Como desprendimiento de retina, ceguera o disminución de la agudeza visual, cataratas, trauma previo, entre otras.',
  },
  {
    key: 'cardiovascularMetabolica' as const,
    label: 'Enfermedad cardiovascular y metabólica',
    descripcion: 'Hipertensión arterial o presión alta, diabetes o azúcar alta, infarto cardiaco previo, soplo cardiaco, insuficiencia cardiaca, enfermedad vascular periférica o mala circulación.',
  },
  {
    key: 'renal' as const,
    label: 'Enfermedad renal',
    descripcion: 'Uno o ambos riñones no funcionan normalmente, artrosis.',
  },
  {
    key: 'oseaMusculoesqueletica' as const,
    label: 'Afección ósea o musculoesquelética',
    descripcion: 'Como la osteoporosis.',
  },
  {
    key: 'autoinmuneReumatologica' as const,
    label: 'Enfermedad autoinmune o reumatológica',
    descripcion: 'Como lupus, artritis reumatoide, fibromialgia, entre otras.',
  },
  {
    key: 'otras' as const,
    label: 'Otras',
    descripcion: 'Como historia de cáncer.',
  },
];

export const ALERGIAS = [
  { key: 'aines' as const, label: 'AINES (como diclofenaco, naproxeno, ibuprofeno)' },
  { key: 'opioides' as const, label: 'Opioides (como tramadol, codeína, morfina)' },
  { key: 'antihistaminicos' as const, label: 'Antihistamínicos (como loratadina, cetirizina, clorfenidramina)' },
  { key: 'antibioticos' as const, label: 'Antibióticos (como penicilinas)' },
  { key: 'oseaMusculoesqueletica' as const, label: 'Afección ósea o musculoesquelética (como la osteoporosis)' },
  { key: 'anestesicosLocales' as const, label: 'Anestésicos locales (como lidocaína)' },
];
