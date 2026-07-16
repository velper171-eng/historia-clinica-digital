'use client';

import type { HistoriaClinica } from '../../lib/form-schema';
import { ENFERMEDADES, ALERGIAS } from '../../lib/form-schema';
import { INJECTION_POINTS } from '../../lib/injection-points';
import { FaceDiagram } from '../face-diagram';

type Props = { data: HistoriaClinica };

// Premium Styles
const PAGE_STYLE: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  padding: '18mm 20mm',
  background: '#FFFFFF',
  color: '#4A3F35', // RELIV Bronze
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '10pt',
  lineHeight: 1.5,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

const HEADER_LINE_STYLE: React.CSSProperties = {
  borderBottom: '2px solid #B6A27F', // Champagne Gold
  paddingBottom: '8px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'between',
  alignItems: 'center',
};

const BRAND_NAME_STYLE: React.CSSProperties = {
  color: '#B6A27F',
  fontWeight: 900,
  fontSize: '12pt',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const DOC_TITLE_STYLE: React.CSSProperties = {
  color: '#4A3F35',
  fontWeight: 500,
  fontSize: '9pt',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  color: '#4A3F35',
  fontSize: '11pt',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid rgba(182, 162, 127, 0.3)',
  paddingBottom: '4px',
  marginTop: '16px',
  marginBottom: '10px',
};

const TABLE_HEADER_STYLE: React.CSSProperties = {
  background: '#F9F7F2',
  borderBottom: '2px solid #B6A27F',
  fontWeight: 700,
  fontSize: '8.5pt',
  color: '#4A3F35',
  textTransform: 'uppercase',
  padding: '6px 8px',
  textAlign: 'left',
};

const TABLE_CELL_STYLE: React.CSSProperties = {
  borderBottom: '1px solid #F0ECE4',
  padding: '6px 8px',
  fontSize: '9pt',
  color: '#5E503F',
  verticalAlign: 'top',
};

const CARD_BOX_STYLE: React.CSSProperties = {
  border: '1px solid #E7D2A7',
  borderRadius: '8px',
  background: '#F9F7F2',
  padding: '10px 14px',
  fontSize: '9.5pt',
  color: '#4A3F35',
  minHeight: '40px',
};

const formatDate = (iso: string) => {
  if (!iso) return '____ / ____ / ______';
  const [y, m, d] = iso.split('-');
  return `${d} / ${m} / ${y}`;
};

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div style={HEADER_LINE_STYLE}>
      <span style={BRAND_NAME_STYLE}>RELIV</span>
      <span style={DOC_TITLE_STYLE}>{subtitle}</span>
    </div>
  );
}

function Footer({ pageNum, totalPages }: { pageNum: number; totalPages: number }) {
  return (
    <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '8pt', color: '#B6A27F', paddingTop: '10px' }}>
      Página {pageNum} de {totalPages} · RELIV Centro de Bienestar
    </div>
  );
}

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontWeight: 700, fontSize: '9pt', color: '#4A3F35', textTransform: 'uppercase', width: 'fit-content', whiteSpace: 'nowrap' }}>
        {label}:
      </span>
      <span style={{ flex: 1, borderBottom: '1px dotted #B6A27F', paddingBottom: 1, color: '#5E503F', fontWeight: 500 }}>
        {value || '—'}
      </span>
    </div>
  );
}

function SignatureBlock({ label, firma, fecha }: { label: string; firma: string; fecha: string }) {
  return (
    <div style={{ marginTop: 24, display: 'flex', gap: 40 }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 70,
            borderBottom: '1.5px solid #B6A27F',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: '#F9F7F2',
            borderRadius: '6px 6px 0 0',
            padding: 4,
          }}
        >
          {firma && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firma} alt="firma" style={{ maxHeight: 62, maxWidth: '100%', objectFit: 'contain' }} />
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: '8.5pt', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', color: '#4A3F35' }}>
          {label}
        </div>
      </div>
      <div style={{ width: 180 }}>
        <div
          style={{
            height: 70,
            borderBottom: '1.5px solid #B6A27F',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: '#F9F7F2',
            borderRadius: '6px 6px 0 0',
            paddingBottom: 8,
            fontSize: '11pt',
            fontWeight: 'bold',
            color: '#4A3F35',
          }}
        >
          {formatDate(fecha)}
        </div>
        <div style={{ textAlign: 'center', fontSize: '8.5pt', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', color: '#4A3F35' }}>
          Fecha
        </div>
      </div>
    </div>
  );
}

function HistorySection({ entries }: { entries: { texto: string; fecha: string }[] }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2.5px solid #B6A27F', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {entries.map((e, idx) => (
        <div key={idx} style={{ fontSize: '8.5pt', color: '#5E503F' }}>
          <span style={{ fontWeight: 700, color: '#B6A27F' }}>[{formatDate(e.fecha)}]:</span> {e.texto}
        </div>
      ))}
    </div>
  );
}

export function PdfDocument({ data }: Props) {
  const c = data.consentimiento;
  const activeIds = new Set(data.puntosInyeccion.filter((p) => p.activo).map((p) => p.id));
  const tieneInyecciones = data.puntosInyeccion.some((p) => p.activo || p.aplicacionesAnteriores.length > 0);
  const tieneAntropometria = !!(data.antropometria.masaCorporal?.trim() || data.antropometria.talla?.trim());

  let totalPages = 3;
  let p4Number = 0;
  let p5Number = 0;
  let p6Number = 0;

  if (tieneInyecciones) {
    totalPages++;
    p4Number = totalPages;
  }
  totalPages++;
  p5Number = totalPages;

  if (tieneAntropometria) {
    totalPages++;
    p6Number = totalPages;
  }

  return (
    <div style={{ background: '#E2E8F0', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
      {/* ====== PÁGINA 1: CONSENTIMIENTO INFORMADO ====== */}
      <div id="pdf-page-1" style={PAGE_STYLE}>
        <Header subtitle="Consentimiento Informado" />

        <div style={{ textAlign: 'center', margin: '15px 0 25px 0' }}>
          <h1 style={{ fontSize: '15pt', fontWeight: 900, letterSpacing: '0.02em', color: '#4A3F35', margin: 0, textTransform: 'uppercase' }}>
            Consentimiento Informado para Procedimiento
          </h1>
          <div style={{ height: '3px', width: '60px', background: '#B6A27F', margin: '8px auto 0 auto', borderRadius: '2px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: 20 }}>
          <FieldLine label="Paciente" value={c.nombreCompleto} />
          <FieldLine label={`Documento (${c.tipoDocumento})`} value={c.numeroDocumento} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <FieldLine label="Autorización a la profesional" value={c.autorizadoA || 'Isabel Velasquez'} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <span style={{ fontWeight: 700, fontSize: '9pt', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Procedimiento a Realizar:
          </span>
          <div style={CARD_BOX_STYLE}>
            {c.procedimiento}
            <HistorySection entries={data.procedimientosAnteriores} />
          </div>
        </div>

        <div style={{ marginBottom: 15 }}>
          <span style={{ fontWeight: 700, fontSize: '9pt', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Riesgos y Efectos Secundarios Informados:
          </span>
          <div style={{ ...CARD_BOX_STYLE, fontSize: '9pt', lineHeight: 1.4, minHeight: '120px' }}>
            {c.riesgosInformados}
            <HistorySection entries={c.riesgosInformadosAnteriores} />
          </div>
        </div>

        <p style={{ textAlign: 'justify', fontSize: '9pt', lineHeight: 1.5, color: '#5E503F', border: '1px solid rgba(182,162,127,0.3)', padding: '12px', borderRadius: '8px', background: '#F9F7F2' }}>
          <strong>DECLARACIÓN:</strong> Con todo lo anterior, dejo constancia que entendí toda la información
          suministrada, y por ello acepto la realización del procedimiento. Además certifico que llené este consentimiento informado y el cuestionario de antecedentes personales con información veraz, bajo la gravedad de juramento que se entiende prestado al poner mi firma en este documento.
        </p>

        <SignatureBlock label="Firma del Paciente" firma={c.firma} fecha={c.fecha} />

        <Footer pageNum={1} totalPages={totalPages} />
      </div>

      {/* ====== PÁGINA 2: ANTECEDENTES PATOLÓGICOS Y MEDICAMENTOS ====== */}
      <div id="pdf-page-2" style={PAGE_STYLE}>
        <Header subtitle="Historial Clínico - Antecedentes I" />

        <h2 style={SECTION_TITLE_STYLE}>I. Cuestionario de Antecedentes Personales</h2>

        <div style={{ margin: '10px 0 5px 0', fontSize: '9pt', fontWeight: 600 }}>
          1. Antecedentes Patológicos (Personales y Familiares)
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 5 }}>
          <thead>
            <tr>
              <th style={TABLE_HEADER_STYLE}>Tipo de Enfermedad</th>
              <th style={{ ...TABLE_HEADER_STYLE, width: '80px', textAlign: 'center' }}>Personal</th>
              <th style={{ ...TABLE_HEADER_STYLE, width: '80px', textAlign: 'center' }}>Familiar</th>
            </tr>
          </thead>
          <tbody>
            {ENFERMEDADES.map((e) => {
              const personal = data.antecedentesPersonales[e.key]?.presenta;
              const familiar = data.antecedentesFamiliares[e.key]?.presenta;
              return (
                <tr key={e.key}>
                  <td style={TABLE_CELL_STYLE}>
                    <strong style={{ color: '#4A3F35' }}>{e.label}</strong>
                    <div style={{ fontSize: '7.5pt', color: '#7E6E65', marginTop: 2 }}>{e.descripcion}</div>
                  </td>
                  <td style={{ ...TABLE_CELL_STYLE, textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', color: '#B6A27F' }}>
                    {personal ? '✔' : '—'}
                  </td>
                  <td style={{ ...TABLE_CELL_STYLE, textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', color: '#B6A27F' }}>
                    {familiar ? '✔' : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 14 }}>
          <span style={{ fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Observaciones sobre Antecedentes Patológicos:
          </span>
          <div style={{ ...CARD_BOX_STYLE, minHeight: '60px' }}>
            {data.observacionesPatologicos || 'Sin observaciones.'}
            <HistorySection entries={data.observacionesPatologicosAnteriores} />
          </div>
        </div>

        <h2 style={SECTION_TITLE_STYLE}>2. Antecedentes Medicamentosos</h2>
        <div style={{ fontSize: '8.5pt', color: '#7E6E65', marginBottom: 6 }}>
          Medicamentos tomados en casa (ej. para dolor, presión, azúcar, anticoagulantes):
        </div>
        <div style={{ ...CARD_BOX_STYLE, minHeight: '80px' }}>
          {data.medicamentos || 'Ninguno registrado.'}
          <HistorySection entries={data.medicamentosAnteriores} />
        </div>

        <Footer pageNum={2} totalPages={totalPages} />
      </div>

      {/* ====== PÁGINA 3: ALERGIAS, QUIRÚRGICOS Y RECOMENDACIONES ====== */}
      <div id="pdf-page-3" style={PAGE_STYLE}>
        <Header subtitle="Historial Clínico - Antecedentes II" />

        <h2 style={SECTION_TITLE_STYLE}>3. Antecedentes Alérgicos</h2>
        <div style={{ fontSize: '8.5pt', color: '#7E6E65', marginBottom: 6 }}>
          Alergias a medicamentos u otras sustancias:
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TABLE_HEADER_STYLE}>Sustancia / Medicamento</th>
              <th style={{ ...TABLE_HEADER_STYLE, width: '90px', textAlign: 'center' }}>Presenta</th>
            </tr>
          </thead>
          <tbody>
            {ALERGIAS.map((a) => (
              <tr key={a.key}>
                <td style={TABLE_CELL_STYLE}>{a.label}</td>
                <td style={{ ...TABLE_CELL_STYLE, textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', color: '#B6A27F' }}>
                  {data.alergicos[a.key] ? '✔' : '—'}
                </td>
              </tr>
            ))}
            <tr>
              <td style={TABLE_CELL_STYLE}>
                Otros: <span style={{ fontStyle: 'italic', color: '#7E6E65' }}>{data.alergicos.otros.descripcion || '—'}</span>
              </td>
              <td style={{ ...TABLE_CELL_STYLE, textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', color: '#B6A27F' }}>
                {data.alergicos.otros.presenta ? '✔' : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Síntomas Presentados en Alergias:
          </span>
          <div style={{ ...CARD_BOX_STYLE, minHeight: '40px' }}>
            {data.observacionesAlergias || 'Sin observaciones.'}
            <HistorySection entries={data.observacionesAlergiasAnteriores} />
          </div>
        </div>

        <h2 style={SECTION_TITLE_STYLE}>4. Antecedentes Quirúrgicos y Condiciones Adicionales</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: 5 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              Procedimientos Quirúrgicos:
            </span>
            <div style={{ ...CARD_BOX_STYLE, minHeight: '60px', fontSize: '8.5pt' }}>
              {data.quirurgicos || 'Ninguno.'}
              <HistorySection entries={data.quirurgicosAnteriores} />
            </div>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              Condición que interfiera en recuperación:
            </span>
            <div style={{ ...CARD_BOX_STYLE, minHeight: '60px', fontSize: '8.5pt' }}>
              {data.condicionRecuperacion || 'Ninguna.'}
              <HistorySection entries={data.condicionRecuperacionAnteriores} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: '30px' }}>
          <FieldLine label="Estado de gestación (embarazo)" value={data.estadoGestacion || 'No'} />
          <FieldLine label="Tipo de Cutis" value={data.tipoCutis || 'Normal'} />
        </div>

        {/* Recomendaciones Resumidas */}
        <div style={{ marginTop: 12, border: '1px solid #B6A27F', borderRadius: '8px', background: '#F9F7F2', padding: '10px 14px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '9pt', color: '#4A3F35', textTransform: 'uppercase', marginBottom: 4 }}>Recomendaciones Clínicas Clave</div>
          <div style={{ fontSize: '8pt', color: '#5E503F', lineHeight: 1.3 }}>
            • Evitar exposición solar y calor (sauna, vapor) una semana antes y después.<br />
            • No consumir alcohol una semana antes/después del procedimiento.<br />
            • Evitar gesticulación excesiva por 3 días (Botox) o 15 días (Hilos), y no maquillar por 6-8 horas.
          </div>
        </div>

        <SignatureBlock label="Firma de Registro del Paciente" firma={data.firmaFinal} fecha={data.fechaFinal} />

        <Footer pageNum={3} totalPages={totalPages} />
      </div>

      {/* ====== PÁGINA 4: DIAGRAMA FACIAL (PUNTOS DE APLICACIÓN) ====== */}
      {tieneInyecciones && (
        <div id="pdf-page-4" style={PAGE_STYLE}>
          <Header subtitle="Diagrama Facial y Puntos de Inyección" />

          <div style={{ textAlign: 'center', margin: '5px 0 15px 0' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 900, color: '#4A3F35', margin: 0, textTransform: 'uppercase' }}>
              Mapeo de Puntos de Aplicación
            </h2>
            <div style={{ fontSize: '8.5pt', color: '#7E6E65', marginTop: 4 }}>
              Paciente: <strong>{c.nombreCompleto || '—'}</strong> · Documento: {c.numeroDocumento}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#B6A27F', marginBottom: 4, textTransform: 'uppercase' }}>Rostro Femenino</div>
              <div style={{ background: '#F9F7F2', border: '1px solid #F0ECE4', padding: '6px', borderRadius: '12px' }}>
                <FaceDiagram activeIds={activeIds} readOnly width={260} gender="mujer" />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#B6A27F', marginBottom: 4, textTransform: 'uppercase' }}>Rostro Masculino</div>
              <div style={{ background: '#F9F7F2', border: '1px solid #F0ECE4', padding: '6px', borderRadius: '12px' }}>
                <FaceDiagram activeIds={activeIds} readOnly width={260} gender="hombre" />
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '9pt', color: '#4A3F35', borderBottom: '2.5px solid #B6A27F', paddingBottom: 4, marginBottom: 8, textTransform: 'uppercase' }}>
              Detalle Técnico de Aplicación de Toxina (Sesión Actual y Previas)
            </div>
            {data.puntosInyeccion.some(p => p.activo || p.aplicacionesAnteriores.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x:20px, y:8px', maxHeight: '180px', overflow: 'hidden' }}>
                {data.puntosInyeccion
                  .filter(p => p.activo || p.aplicacionesAnteriores.length > 0)
                  .map(p => {
                    const def = INJECTION_POINTS.find(d => d.id === p.id);
                    const isFemenino = p.id.startsWith('m-');
                    return (
                      <div key={p.id} style={{ borderBottom: '1px solid #F0ECE4', paddingBottom: 4, fontSize: '8.5pt' }}>
                        <div style={{ fontWeight: 700, color: '#4A3F35' }}>
                          <span style={{ color: isFemenino ? '#B6A27F' : '#5E503F', marginRight: 4, fontWeight: 'bold' }}>
                            [{isFemenino ? '♀' : '♂'}]
                          </span>
                          {def?.zona} - {def?.nombre}
                        </div>
                        {p.activo && (
                          <div style={{ color: '#5F715B', fontWeight: 700, marginTop: 1, fontSize: '8pt' }}>
                            Aplicado Hoy: {p.unidades} U
                          </div>
                        )}
                        {p.aplicacionesAnteriores.length > 0 && (
                          <div style={{ fontSize: '7.5pt', color: '#7E6E65' }}>
                            Histórico: {p.aplicacionesAnteriores.map(a => `${a.unidades}U (${formatDate(a.fecha)})`).join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            ) : (
              <div style={{ color: '#7E6E65', fontStyle: 'italic', fontSize: '9pt', marginTop: 10 }}>
                No se han registrado aplicaciones de toxina botulínica en este paciente.
              </div>
            )}
          </div>

          <div style={{ fontSize: '8pt', color: '#7E6E65', borderTop: '1px solid #F0ECE4', paddingTop: 8, marginTop: 10 }}>
            * Los puntos marcados en verde en el diagrama corresponden a la dosificación y puntos inyectados en la sesión actual.
          </div>

          <Footer pageNum={p4Number} totalPages={totalPages} />
        </div>
      )}

      {/* ====== PÁGINA 5: EVOLUCIÓN Y OBSERVACIONES ====== */}
      <div id="pdf-page-5" style={PAGE_STYLE}>
        <Header subtitle="Seguimiento Clínico - Evolución" />

        <div style={{ textAlign: 'center', margin: '5px 0 15px 0' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 900, color: '#4A3F35', margin: 0, textTransform: 'uppercase' }}>
            Evolución y Observaciones Clínicas
          </h2>
          <div style={{ fontSize: '8.5pt', color: '#7E6E65', marginTop: 4 }}>
            Seguimiento de sesiones y evolución estética del paciente.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '20px', marginBottom: 15 }}>
          <FieldLine label="Sesiones Programadas" value={(data.sesionesProgramadas || 1).toString()} />
          <FieldLine label="Tipo de Cutis" value={data.tipoCutis || 'Normal'} />
        </div>

        {data.fechasSesiones && data.fechasSesiones.length > 0 && (
          <div style={{ marginBottom: 15, fontSize: '9pt' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Calendario de Sesiones:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.fechasSesiones.map((f, i) => (
                <div key={i} style={{ background: '#F9F7F2', border: '1px solid #E7D2A7', borderRadius: '6px', padding: '4px 10px', fontSize: '8pt', fontWeight: 600 }}>
                  Sesión {i + 1}: {f ? formatDate(f) : '—'}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 15 }}>
          <span style={{ fontWeight: 700, fontSize: '9pt', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Anotaciones de la Sesión Actual:
          </span>
          <div style={{ ...CARD_BOX_STYLE, minHeight: '100px', lineHeight: 1.4 }}>
            {data.evolucionProcedimientos || 'No se registraron observaciones específicas para esta sesión.'}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: '9pt', textTransform: 'uppercase', display: 'block', marginBottom: 6, borderBottom: '2px solid #B6A27F', paddingBottom: 4 }}>
            Historial Evolutivo de Procedimientos:
          </span>
          {data.evolucionProcedimientosAnteriores && data.evolucionProcedimientosAnteriores.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '240px', overflow: 'hidden' }}>
              {data.evolucionProcedimientosAnteriores.slice(0, 4).map((e, idx) => (
                <div key={idx} style={{ padding: '8px 12px', border: '1px solid #F0ECE4', borderRadius: '6px', background: '#F9F7F2' }}>
                  <div style={{ fontSize: '8pt', fontWeight: 700, color: '#B6A27F', marginBottom: 2 }}>
                    Fecha: {formatDate(e.fecha)}
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#5E503F', whiteSpace: 'pre-wrap' }}>
                    {e.texto}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#7E6E65', fontStyle: 'italic', fontSize: '9pt' }}>
              No existen registros de evolución anteriores.
            </div>
          )}
        </div>

        <Footer pageNum={p5Number} totalPages={totalPages} />
      </div>

      {/* ====== PÁGINA 6: VALORACIÓN ANTROPOMÉTRICA ====== */}
      {tieneAntropometria && (
        <div id="pdf-page-6" style={PAGE_STYLE}>
          <Header subtitle="Composición Corporal y Valoración" />

          <div style={{ textAlign: 'center', margin: '5px 0 15px 0' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 900, color: '#4A3F35', margin: 0, textTransform: 'uppercase' }}>
              Valoración Antropométrica y Composición
            </h2>
            <div style={{ fontSize: '8.5pt', color: '#7E6E65', marginTop: 4 }}>
              Estudio de pliegues corporales, somatotipo e índices metabólicos.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
            <div style={{ flex: 1, background: '#F9F7F2', borderRadius: '8px', border: '1px solid #E7D2A7', padding: '10px 14px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '9pt', color: '#B6A27F', textTransform: 'uppercase', borderBottom: '1px solid rgba(182,162,127,0.2)', paddingBottom: 2, marginBottom: 6 }}>Medidas Básicas</div>
              <div style={{ fontSize: '8.5pt' }}><FieldLine label="Edad" value={`${data.antropometria.edad} años`} /></div>
              <div style={{ fontSize: '8.5pt' }}><FieldLine label="Talla" value={`${data.antropometria.talla} cm`} /></div>
              <div style={{ fontSize: '8.5pt' }}><FieldLine label="Masa Corporal" value={`${data.antropometria.masaCorporal} kg`} /></div>
            </div>
            <div style={{ flex: 1, background: '#F9F7F2', borderRadius: '8px', border: '1px solid #E7D2A7', padding: '10px 14px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '9pt', color: '#B6A27F', textTransform: 'uppercase', borderBottom: '1px solid rgba(182,162,127,0.2)', paddingBottom: 2, marginBottom: 6 }}>Composición Corporal</div>
              <div style={{ fontSize: '8.5pt' }}><FieldLine label="Densidad Corporal" value={data.antropometria.dc} /></div>
              <div style={{ fontSize: '8.5pt' }}><FieldLine label="% Grasa Corporal" value={`${data.antropometria.porcentajeGrasa} %`} /></div>
            </div>
          </div>

          <div style={{ marginBottom: 15 }}>
            <div style={{ fontWeight: 'bold', fontSize: '9pt', color: '#4A3F35', textTransform: 'uppercase', marginBottom: 6 }}>Pliegues Cutáneos (mm)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[['Tríceps', data.antropometria.plTriceps],
                ['Subescapular', data.antropometria.plSubescapular],
                ['Bíceps', data.antropometria.plBiceps],
                ['Cresta Ilíaca', data.antropometria.plCrestaIliaca],
                ['Supraespinal', data.antropometria.plSupraespinal],
                ['Abdominal', data.antropometria.plAbdominal],
                ['Muslo', data.antropometria.plMuslo],
                ['Pierna', data.antropometria.plPierna]].map(([label, val]) => (
                  <div key={label} style={{ background: '#F9F7F2', border: '1px solid #F0ECE4', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '7pt', color: '#7E6E65', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '10pt', fontWeight: 800, color: '#4A3F35', marginTop: 2 }}>{val || '—'}</div>
                  </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 15 }}>
            <div style={{ fontWeight: 'bold', fontSize: '9pt', color: '#4A3F35', textTransform: 'uppercase', marginBottom: 6 }}>Somatotipo Heath-Carter</div>
            <div style={{ display: 'flex', gap: 15 }}>
              {[['Endomorfia', data.antropometria.endomorfia, '#C18C5D'],
                ['Mesomorfia', data.antropometria.mesomorfia, '#5F715B'],
                ['Ectomorfia', data.antropometria.ectomorfia, '#4A8BB7']].map(([label, val, color]) => (
                  <div key={label} style={{ flex: 1, background: '#F9F7F2', border: '1px solid #E7D2A7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '7.5pt', color: '#7E6E65', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '14pt', fontWeight: 900, color: color, marginTop: 2 }}>{val || '0.0'}</div>
                  </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones y Tendencias */}
          <div style={{ flex: 1, background: '#F9F7F2', border: '1px solid #B6A27F', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '9.5pt', color: '#4A3F35', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid rgba(182, 162, 127, 0.2)', paddingBottom: 4 }}>
              Diagnóstico Antropométrico y Enfoque Clínico
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x:20px, y:6px', fontSize: '8.5pt', color: '#5E503F' }}>
              <div><strong>Tasa Metabólica (TMB):</strong> {data.antropometria.perfilTMB || '—'} kcal/día</div>
              <div><strong>Gasto Diario (GET):</strong> {data.antropometria.perfilGET || '—'} kcal/día</div>
              <div><strong>Estado Saludable:</strong> {data.antropometria.evaluacionSaludable || '—'}</div>
              <div><strong>Tendencia Grasa:</strong> {data.antropometria.evaluacionGrasa || '—'}</div>
              <div><strong>Ratio Grasa/Magra:</strong> {data.antropometria.perfilCocienteGrasaMasaMagra || '—'}</div>
              <div><strong>Sensibilidad Digestiva:</strong> {data.antropometria.evaluacionSensibilidadDigestiva || '—'}</div>
              <div><strong>Potencial Muscular:</strong> {data.antropometria.evaluacionMargenMuscular || '—'}</div>
              <div><strong>Prioridad Nutricional:</strong> {data.antropometria.tendenciaPrioridadNutricional || '—'}</div>
            </div>
          </div>

          <Footer pageNum={p6Number} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
