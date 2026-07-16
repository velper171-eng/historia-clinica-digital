'use client';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import html2canvas from 'html2canvas';
import type { HistoriaClinica } from './form-schema';
import { ENFERMEDADES, ALERGIAS } from './form-schema';
import { INJECTION_POINTS } from './injection-points';

const sanitize = (s: string) =>
  s.replace(/[^a-z0-9\-_]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'sin-nombre';

const GOLD_COLOR = 'B6A27F'; // RELIV Champagne Gold
const BRONZE_COLOR = '4A3F35'; // RELIV Bronze

function createHeading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2) {
  const isH1 = level === HeadingLevel.HEADING_1;
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: isH1 ? BRONZE_COLOR : GOLD_COLOR,
        size: isH1 ? 28 : 22,
      })
    ],
    heading: level,
    spacing: { before: 240, after: 120 },
  });
}

function createField(label: string, value: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: BRONZE_COLOR }),
      new TextRun({ text: value || '—' }),
    ],
    spacing: { after: 80 },
  });
}

function createDiseaseTable(dataPersonales: Record<string, { presenta: boolean; observacion?: string }>, dataFamiliares: Record<string, { presenta: boolean; observacion?: string }>) {
  const rows = ENFERMEDADES.map(e => {
    const personal = dataPersonales[e.key]?.presenta ? '✔' : '—';
    const familiar = dataFamiliares[e.key]?.presenta ? '✔' : '—';
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: e.label, bold: true, color: BRONZE_COLOR }),
                new TextRun({ text: `\n(${e.descripcion})`, size: 16, color: '7E6E65' })
              ]
            })
          ],
          width: { size: 60, type: WidthType.PERCENTAGE }
        }),
        new TableCell({ children: [new Paragraph({ text: personal, alignment: 'center' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ text: familiar, alignment: 'center' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Tipo de Enfermedad', bold: true, color: BRONZE_COLOR })] })],
            shading: { fill: 'F9F7F2' }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Personal', bold: true, color: BRONZE_COLOR })], alignment: 'center' })],
            shading: { fill: 'F9F7F2' }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Familiar', bold: true, color: BRONZE_COLOR })], alignment: 'center' })],
            shading: { fill: 'F9F7F2' }
          }),
        ],
      }),
      ...rows
    ]
  });
}

function createAllergyTable(alergicos: any) {
  const rows = ALERGIAS.map(a => {
    const presenta = alergicos[a.key] ? '✔' : '—';
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(a.label)], width: { size: 70, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ text: presenta, alignment: 'center' })], width: { size: 30, type: WidthType.PERCENTAGE } }),
      ]
    });
  });

  // Agregar otros
  const otrosPresenta = alergicos.otros.presenta ? '✔' : '—';
  const otrosDesc = alergicos.otros.descripcion ? ` (Otros: ${alergicos.otros.descripcion})` : '';
  rows.push(new TableRow({
    children: [
      new TableCell({ children: [new Paragraph(`Otros${otrosDesc}`)], width: { size: 70, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: otrosPresenta, alignment: 'center' })], width: { size: 30, type: WidthType.PERCENTAGE } }),
    ]
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Sustancia / Medicamento', bold: true, color: BRONZE_COLOR })] })],
            shading: { fill: 'F9F7F2' }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Presenta', bold: true, color: BRONZE_COLOR })], alignment: 'center' })],
            shading: { fill: 'F9F7F2' }
          }),
        ]
      }),
      ...rows
    ]
  });
}

function createHistoryItems(entries: { texto: string; fecha: string }[]) {
  if (!entries || entries.length === 0) return [];
  return entries.map(e => new Paragraph({
    children: [
      new TextRun({ text: `[${e.fecha}]: `, bold: true, color: GOLD_COLOR }),
      new TextRun({ text: e.texto }),
    ],
    indent: { left: 240 },
    spacing: { after: 60 },
  }));
}

export async function generarHistoriaClinicaWord(data: HistoriaClinica) {
  const children: (Paragraph | Table)[] = [];
  const c = data.consentimiento;

  // Título principal
  children.push(createHeading('RELIV - CENTRO COSMÉTICO Y DE BIENESTAR', HeadingLevel.HEADING_1));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'HISTORIA CLÍNICA Y CONSENTIMIENTO INFORMADO', bold: true, size: 24, color: BRONZE_COLOR })
    ],
    spacing: { after: 200 }
  }));

  // ====== 1. Consentimiento Informado ======
  children.push(createHeading('1. Consentimiento Informado'));
  children.push(createField('Yo', c.nombreCompleto));
  children.push(createField(`Identificado con ${c.tipoDocumento}`, c.numeroDocumento));
  children.push(createField('Autorizo a la profesional', c.autorizadoA || 'Isabel Velasquez'));
  
  children.push(new Paragraph({ children: [new TextRun({ text: 'Para la realización de:', bold: true, color: BRONZE_COLOR })], spacing: { before: 100, after: 40 } }));
  children.push(new Paragraph({ text: c.procedimiento }));
  if (data.procedimientosAnteriores.length > 0) {
    children.push(...createHistoryItems(data.procedimientosAnteriores));
  }

  children.push(new Paragraph({ children: [new TextRun({ text: 'Riesgos y efectos secundarios informados:', bold: true, color: BRONZE_COLOR })], spacing: { before: 100, after: 40 } }));
  children.push(new Paragraph({ text: c.riesgosInformados }));
  if (c.riesgosInformadosAnteriores.length > 0) {
    children.push(...createHistoryItems(c.riesgosInformadosAnteriores));
  }

  children.push(new Paragraph({
    children: [
      new TextRun({
        text: 'Declaro que he sido debidamente informado(a) de los riesgos y efectos secundarios del procedimiento. Con todo lo anterior, dejo constancia de que entendí toda la información suministrada y acepto la realización del procedimiento. Además, certifico que llené este documento con información veraz, bajo la gravedad de juramento, el cual se entiende prestado al poner mi firma en este documento.',
        italics: true,
        size: 18,
        color: BRONZE_COLOR
      })
    ],
    spacing: { before: 120, after: 120 }
  }));

  children.push(createField('Fecha Consentimiento', c.fecha));
  children.push(new Paragraph({ text: '[Firma Digital 1 registrada en el consentimiento informado]', spacing: { after: 120 } }));

  // ====== 2. Antecedentes Patológicos ======
  children.push(createHeading('2. Antecedentes Patológicos'));
  children.push(createDiseaseTable(data.antecedentesPersonales, data.antecedentesFamiliares));
  children.push(new Paragraph({ text: '' }));
  
  children.push(new Paragraph({ children: [new TextRun({ text: 'Observaciones sobre Antecedentes Patológicos:', bold: true, color: BRONZE_COLOR })], spacing: { before: 100, after: 40 } }));
  children.push(new Paragraph({ text: data.observacionesPatologicos || 'Sin observaciones.' }));
  if (data.observacionesPatologicosAnteriores.length > 0) {
    children.push(...createHistoryItems(data.observacionesPatologicosAnteriores));
  }

  // ====== 3. Antecedentes Medicamentosos ======
  children.push(createHeading('3. Antecedentes Medicamentosos'));
  children.push(new Paragraph({ text: data.medicamentos || 'Ninguno registrado.', spacing: { after: 80 } }));
  if (data.medicamentosAnteriores.length > 0) {
    children.push(...createHistoryItems(data.medicamentosAnteriores));
  }

  // ====== 4. Antecedentes Alérgicos ======
  children.push(createHeading('4. Antecedentes Alérgicos'));
  children.push(createAllergyTable(data.alergicos));
  children.push(new Paragraph({ text: '' }));
  
  children.push(new Paragraph({ children: [new TextRun({ text: 'Síntomas presentados / Observaciones de alergias:', bold: true, color: BRONZE_COLOR })], spacing: { before: 100, after: 40 } }));
  children.push(new Paragraph({ text: data.observacionesAlergias || 'Sin observaciones.' }));
  if (data.observacionesAlergiasAnteriores.length > 0) {
    children.push(...createHistoryItems(data.observacionesAlergiasAnteriores));
  }

  // ====== 5. Antecedentes Quirúrgicos y Condiciones Adicionales ======
  children.push(createHeading('5. Antecedentes Quirúrgicos y Condiciones Adicionales'));
  children.push(createField('Procedimientos Quirúrgicos previos', data.quirurgicos || 'Ninguno'));
  if (data.quirurgicosAnteriores.length > 0) {
    children.push(...createHistoryItems(data.quirurgicosAnteriores));
  }
  children.push(createField('Condición que interfiera con la recuperación', data.condicionRecuperacion || 'Ninguna'));
  if (data.condicionRecuperacionAnteriores.length > 0) {
    children.push(...createHistoryItems(data.condicionRecuperacionAnteriores));
  }
  children.push(createField('Estado de gestación (embarazo)', data.estadoGestacion || 'No'));
  children.push(createField('Fecha de Registro Final', data.fechaFinal));
  children.push(new Paragraph({ text: '[Firma Digital 2 registrada en el registro final]', spacing: { after: 120 } }));

  // ====== 6. Evaluación Facial y Sesiones ======
  children.push(createHeading('6. Evaluación Facial y Sesiones'));
  children.push(createField('Tipo de cutis', data.tipoCutis));
  children.push(createField('Sesiones programadas', data.sesionesProgramadas.toString()));
  if (data.fechasSesiones && data.fechasSesiones.length > 0) {
    const fechasFormateadas = data.fechasSesiones.map((f, i) => `Sesión ${i + 1}: ${f || 'No definida'}`).join(' | ');
    children.push(createField('Fechas de sesiones', fechasFormateadas));
  }
  children.push(createField('Observaciones generales', data.observacionesGenerales || 'Ninguna'));
  if (data.observacionesGeneralesAnteriores.length > 0) {
    children.push(...createHistoryItems(data.observacionesGeneralesAnteriores));
  }

  // ====== 7. Diagrama Facial (Puntos de Aplicación) ======
  children.push(createHeading('7. Puntos de Aplicación (Diagrama Facial)'));
  
  const resumenAplicaciones = data.puntosInyeccion
    .filter(p => p.activo || p.aplicacionesAnteriores.length > 0)
    .map(p => {
      const def = INJECTION_POINTS.find(d => d.id === p.id);
      let t = `${def?.zona} - ${def?.nombre}`;
      if (p.activo) t += ` (Actual: ${p.unidades} U)`;
      if (p.aplicacionesAnteriores.length > 0) {
        t += ` [Previos: ${p.aplicacionesAnteriores.map(a => `${a.unidades}U (${a.fecha})`).join(', ')}]`;
      }
      return t;
    });

  if (resumenAplicaciones.length > 0) {
    resumenAplicaciones.forEach(text => {
      children.push(new Paragraph({ text: `• ${text}`, spacing: { after: 40 }, indent: { left: 240 } }));
    });
  } else {
    children.push(new Paragraph({ text: 'No se registraron aplicaciones.', spacing: { after: 80 } }));
  }

  // Capturar imagen del diagrama
  const elemento = document.getElementById('pdf-page-4');
  if (elemento) {
    try {
      const canvas = await html2canvas(elemento, { scale: 1.5, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const base64Data = imgData.replace(/^data:image\/jpeg;base64,/, "");
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const maxWidth = 500;
      const width = canvas.width;
      const height = canvas.height;
      const ratio = maxWidth / width;

      children.push(new Paragraph({
        children: [
          new ImageRun({
            data: bytes,
            type: "jpg",
            transformation: {
              width: width * ratio,
              height: height * ratio
            }
          })
        ],
        spacing: { before: 200 }
      }));
    } catch (e) {
      console.error('Error capturando FaceDiagram para docx', e);
    }
  }

  // ====== 8. Evolución y Observaciones de Procedimientos ======
  children.push(createHeading('8. Evolución y Observaciones de Procedimientos'));
  children.push(createField('Registro sesión actual', data.evolucionProcedimientos || 'Sin evolución registrada.'));
  if (data.evolucionProcedimientosAnteriores && data.evolucionProcedimientosAnteriores.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: "Historial de evolución:", bold: true, color: BRONZE_COLOR })],
      spacing: { before: 200, after: 80 }
    }));
    children.push(...createHistoryItems(data.evolucionProcedimientosAnteriores));
  }

  // ====== 9. Valoración Antropométrica ======
  children.push(createHeading('9. Valoración Antropométrica'));
  children.push(createField('Edad', `${data.antropometria.edad} años`));
  children.push(createField('Talla', `${data.antropometria.talla} cm`));
  children.push(createField('Masa Corporal', `${data.antropometria.masaCorporal} kg`));
  children.push(createField('Densidad Corporal (DC)', data.antropometria.dc));
  children.push(createField('% Grasa Corporal', `${data.antropometria.porcentajeGrasa}%`));

  children.push(new Paragraph({
    children: [new TextRun({ text: "Pliegues Cutáneos (mm):", bold: true, color: BRONZE_COLOR })],
    spacing: { before: 140, after: 60 }
  }));
  const pliegues = [
    `Tríceps: ${data.antropometria.plTriceps}`,
    `Subescapular: ${data.antropometria.plSubescapular}`,
    `Bíceps: ${data.antropometria.plBiceps}`,
    `Cresta Ilíaca: ${data.antropometria.plCrestaIliaca}`,
    `Supraespinal: ${data.antropometria.plSupraespinal}`,
    `Abdominal: ${data.antropometria.plAbdominal}`,
    `Muslo: ${data.antropometria.plMuslo}`,
    `Pierna: ${data.antropometria.plPierna}`
  ];
  pliegues.forEach(p => children.push(new Paragraph({ text: `• ${p}`, indent: { left: 240 }, spacing: { after: 30 } })));

  children.push(new Paragraph({
    children: [new TextRun({ text: "Somatotipo Heath-Carter:", bold: true, color: BRONZE_COLOR })],
    spacing: { before: 140, after: 60 }
  }));
  children.push(createField('Endomorfia', data.antropometria.endomorfia));
  children.push(createField('Mesomorfia', data.antropometria.mesomorfia));
  children.push(createField('Ectomorfia', data.antropometria.ectomorfia));

  children.push(new Paragraph({
    children: [new TextRun({ text: "Diagnóstico y Recomendaciones:", bold: true, color: BRONZE_COLOR })],
    spacing: { before: 140, after: 60 }
  }));
  children.push(createField('Estado Saludable', data.antropometria.evaluacionSaludable));
  children.push(createField('Tendencia Grasa', data.antropometria.evaluacionGrasa));
  children.push(createField('Respuesta Calórica', data.antropometria.evaluacionRespuestaCalorica));
  children.push(createField('Sensibilidad Digestiva', data.antropometria.evaluacionSensibilidadDigestiva));
  children.push(createField('Margen Muscular', data.antropometria.evaluacionMargenMuscular));
  children.push(createField('Fase de Definición', data.antropometria.evaluacionFaseDefinicion));
  children.push(createField('Tipo de Volumen', data.antropometria.evaluacionVolumen));

  // Generar documento
  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const fecha = data.consentimiento.fecha || new Date().toISOString().slice(0, 10);
  const nombre = sanitize(data.consentimiento.nombreCompleto || 'paciente');
  a.download = `historia-clinica-${nombre}-${fecha}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
