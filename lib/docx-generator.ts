'use client';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import html2canvas from 'html2canvas';
import type { HistoriaClinica } from './form-schema';
import { ENFERMEDADES, ALERGIAS } from './form-schema';

const sanitize = (s: string) =>
  s.replace(/[^a-z0-9\-_]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'sin-nombre';

function createHeading(text: string, level: any = HeadingLevel.HEADING_2) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

function createField(label: string, value: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value || '—' }),
    ],
    spacing: { after: 120 },
  });
}

function createDiseaseTable(title: string, dataObj: any) {
  const rows = ENFERMEDADES.map(e => {
    const presenta = dataObj[e.key].presenta ? 'Sí' : 'No';
    const obs = dataObj[e.key].observacion || '';
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(e.label)], width: { size: 40, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph(presenta)], width: { size: 10, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph(obs)], width: { size: 50, type: WidthType.PERCENTAGE } }),
      ],
    });
  });

  return [
    new Paragraph({ children: [new TextRun({ text: title, bold: true })], spacing: { before: 200, after: 100 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Enfermedad', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Presenta', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Observación', bold: true })] })] }),
          ],
        }),
        ...rows
      ]
    })
  ];
}

export async function generarHistoriaClinicaWord(data: HistoriaClinica) {
  const children: any[] = [];

  // Título principal
  children.push(createHeading('HISTORIA CLÍNICA Y SEGUIMIENTO', HeadingLevel.HEADING_1));

  // 1. Consentimiento Informado
  children.push(createHeading('1. Consentimiento Informado'));
  children.push(createField('Paciente', data.consentimiento.nombreCompleto));
  children.push(createField(`Identificado con ${data.consentimiento.tipoDocumento}`, data.consentimiento.numeroDocumento));
  children.push(createField('Autorizado a la profesional', data.consentimiento.autorizadoA));
  children.push(createField('Procedimiento', data.consentimiento.procedimiento));
  children.push(createField('Riesgos Informados', data.consentimiento.riesgosInformados));
  children.push(createField('Fecha', data.consentimiento.fecha));

  // 2. Antecedentes Patológicos
  children.push(createHeading('2. Antecedentes Patológicos'));
  children.push(...createDiseaseTable('Personales', data.antecedentesPersonales));
  children.push(...createDiseaseTable('Familiares', data.antecedentesFamiliares));
  children.push(createField('Observaciones Patológicas', data.observacionesPatologicos));

  // 3. Medicamentos y Alergias
  children.push(createHeading('3. Medicamentos y Alergias'));
  children.push(createField('Medicamentos en casa', data.medicamentos));
  
  const alergiasTexto = ALERGIAS.map(a => `${a.label}: ${data.alergicos[a.key as keyof typeof data.alergicos] ? 'Sí' : 'No'}`).join(', ');
  const alergiasOtros = `Otros: ${data.alergicos.otros.presenta ? 'Sí (' + data.alergicos.otros.descripcion + ')' : 'No'}`;
  children.push(createField('Alergias presentadas', `${alergiasTexto}, ${alergiasOtros}`));
  children.push(createField('Observaciones Alergias', data.observacionesAlergias));

  // 4. Quirúrgicos
  children.push(createHeading('4. Quirúrgicos'));
  children.push(createField('Antecedentes Quirúrgicos', data.quirurgicos));

  // 5. Condiciones Finales, Cutis y Sesiones
  children.push(createHeading('5. Condiciones Finales y Sesiones'));
  children.push(createField('Interferencias en la recuperación', data.condicionRecuperacion));
  children.push(createField('Estado de gestación', data.estadoGestacion));
  children.push(createField('Tipo de cutis', data.tipoCutis));
  children.push(createField('Sesiones programadas', data.sesionesProgramadas.toString()));
  
  if (data.fechasSesiones && data.fechasSesiones.length > 0) {
    const fechasFormateadas = data.fechasSesiones.map((f, i) => `Sesión ${i + 1}: ${f || 'No definida'}`).join(' | ');
    children.push(createField('Fechas de sesiones', fechasFormateadas));
  }
  children.push(createField('Observaciones generales', data.observacionesGenerales));

  // 6. Diagrama Facial
  children.push(createHeading('6. Puntos de Aplicación (Diagrama Facial)'));
  
  // Capturar imagen del diagrama
  const elemento = document.getElementById('pdf-page-4');
  if (elemento) {
    const canvas = await html2canvas(elemento, { scale: 1.5, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = imgData.replace(/^data:image\/jpeg;base64,/, "");
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Scale image down to fit word page (around 600px width max)
    const maxWidth = 550;
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
      ]
    }));
  }

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
