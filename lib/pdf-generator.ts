'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { HistoriaClinica } from './form-schema';

const PAGE_IDS = ['pdf-page-1', 'pdf-page-2', 'pdf-page-3', 'pdf-page-4', 'pdf-page-5'];

const sanitize = (s: string) =>
  s.replace(/[^a-z0-9\-_]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'sin-nombre';

export async function generarHistoriaClinicaPDF(data: HistoriaClinica) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < PAGE_IDS.length; i++) {
    const id = PAGE_IDS[i];
    const elemento = document.getElementById(id);
    if (!elemento) {
      throw new Error(`No se encontró el elemento #${id}`);
    }

    const canvas = await html2canvas(elemento, {
      scale: 1.5,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    // Si la imagen es más alta que la página, la escalamos para que entre.
    const finalHeight = Math.min(imgHeight, pdfHeight);
    const finalWidth = (canvas.width * finalHeight) / canvas.height;
    const offsetX = (pdfWidth - finalWidth) / 2;
    pdf.addImage(imgData, 'JPEG', offsetX, 0, finalWidth, finalHeight);
  }

  const fecha = data.consentimiento.fecha || new Date().toISOString().slice(0, 10);
  const nombre = sanitize(data.consentimiento.nombreCompleto || 'paciente');
  pdf.save(`historia-clinica-${nombre}-${fecha}.pdf`);
}
