'use client';

import type { HistoriaClinica } from '../../lib/form-schema';
import { ENFERMEDADES, ALERGIAS } from '../../lib/form-schema';
import { INJECTION_POINTS } from '../../lib/injection-points';
import { FaceDiagram } from '../face-diagram';

type Props = { data: HistoriaClinica };

const PAGE_STYLE: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  padding: '15mm 18mm',
  background: 'white',
  color: '#111',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '11pt',
  lineHeight: 1.4,
  boxSizing: 'border-box',
};

const formatDate = (iso: string) => {
  if (!iso) return '____ / ____ / ______';
  const [y, m, d] = iso.split('-');
  return `${d} / ${m} / ${y}`;
};

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, borderBottom: '1px solid #555', paddingBottom: 1 }}>
        {value || ' '}
      </span>
    </div>
  );
}

function SignatureBlock({ firma, fecha }: { firma: string; fecha: string }) {
  return (
    <div style={{ marginTop: 18, display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 70,
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {firma && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firma} alt="firma" style={{ maxHeight: 65, maxWidth: '100%' }} />
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: '10pt', marginTop: 3 }}>FIRMA</div>
      </div>
      <div style={{ width: 180 }}>
        <div
          style={{
            height: 70,
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 4,
          }}
        >
          {formatDate(fecha)}
        </div>
        <div style={{ textAlign: 'center', fontSize: '10pt', marginTop: 3 }}>FECHA</div>
      </div>
    </div>
  );
}

function DiseaseTable({
  rows,
}: {
  rows: { label: string; descripcion: string; presenta: boolean; observacion: string }[];
}) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '9.5pt',
        marginTop: 6,
      }}
    >
      <thead>
        <tr style={{ background: '#E0D7CD' }}>
          <th style={cellStyle(true)}>Enfermedad</th>
          <th style={{ ...cellStyle(true), width: 50, textAlign: 'center' }}>Sí</th>
          <th style={cellStyle(true)}>Observación</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td style={cellStyle(false)}>
              <div style={{ fontWeight: 700, color: '#9A8C84' }}>{r.label}</div>
              <div style={{ fontSize: '8.5pt', color: '#666' }}>{r.descripcion}</div>
            </td>
            <td style={{ ...cellStyle(false), textAlign: 'center', fontWeight: 700, color: '#A7B7A4' }}>
              {r.presenta ? 'X' : ''}
            </td>
            <td style={cellStyle(false)}>{r.observacion || ' '}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function cellStyle(header: boolean): React.CSSProperties {
  return {
    border: '1px solid #E0D7CD',
    padding: '6px 8px',
    textAlign: 'left',
    verticalAlign: 'top',
    fontWeight: header ? 700 : 400,
    color: header ? '#9A8C84' : '#444',
  };
}

function HistorySection({ entries }: { entries: { texto: string; fecha: string }[] }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '3px solid #E0D7CD' }}>
      {entries.map((e, idx) => (
        <div key={idx} style={{ marginBottom: 6, fontSize: '9pt' }}>
          <span style={{ fontWeight: 700, color: '#A7B7A4' }}>[{formatDate(e.fecha)}]:</span> {e.texto}
        </div>
      ))}
    </div>
  );
}

export function PdfDocument({ data }: Props) {
  const c = data.consentimiento;
  const activeIds = new Set(data.puntosInyeccion.filter((p) => p.activo).map((p) => p.id));
  const puntosActivosPorZona = INJECTION_POINTS.filter((p) => activeIds.has(p.id)).reduce(
    (acc, p) => {
      if (!acc[p.zona]) acc[p.zona] = [];
      acc[p.zona].push(p.nombre);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div>
      {/* ====== PÁGINA 1: CONSENTIMIENTO INFORMADO ====== */}
      <div id="pdf-page-1" style={PAGE_STYLE}>
        <h1 style={{ textAlign: 'center', fontSize: '14pt', marginBottom: 18, marginTop: 8 }}>
          CONSENTIMIENTO INFORMADO PARA<br />
          REALIZACIÓN DE PROCEDIMIENTO
        </h1>

        <FieldLine label="YO" value={c.nombreCompleto} />
        <FieldLine
          label={`IDENTIFICADO CON ${c.tipoDocumento}`}
          value={c.numeroDocumento}
        />
        <FieldLine label="EN PLENO USO DE MIS FACULTADES MENTALES, AUTORIZO A LA PROFESIONAL" value={c.autorizadoA} />

        <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 600 }}>PARA LA REALIZACIÓN DE:</div>
        <div style={{ borderBottom: '1px solid #555', minHeight: 40, paddingBottom: 4 }}>
          {c.procedimiento}
          <HistorySection entries={data.procedimientosAnteriores} />
        </div>

        <div style={{ marginTop: 14, marginBottom: 6 }}>
          ADEMÁS DE QUE FUI INFORMADO DE LOS RIESGOS Y EFECTOS SECUNDARIOS DEL PROCEDIMIENTO,
          Y QUE SON LOS SIGUIENTES:
        </div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 8,
            minHeight: 110,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {c.riesgosInformados}
          <HistorySection entries={c.riesgosInformadosAnteriores} />
          {!c.riesgosInformados && c.riesgosInformadosAnteriores.length === 0 && ' '}
        </div>

        <p style={{ marginTop: 16, textAlign: 'justify', fontSize: '10pt' }}>
          CON TODO LO ANTERIOR, DEJO CONSTANCIA QUE ENTENDÍ TODA LA INFORMACIÓN
          SUMINISTRADA, Y POR ELLO ACEPTO LA REALIZACIÓN DEL PROCEDIMIENTO. ADEMÁS
          CERTIFICO QUE LLENÉ ESTE CONSENTIMIENTO INFORMADO Y EL CUESTIONARIO DE
          ANTECEDENTES PERSONALES CON INFORMACIÓN VERAZ, BAJO LA GRAVEDAD DE
          JURAMENTO QUE SE ENTIENDE PRESTADO AL PONER LA FIRMA EN DICHOS DOCUMENTOS,
          QUE CON MI PROPIO PUÑO Y LETRA OTORGO.
        </p>

        <SignatureBlock firma={c.firma} fecha={c.fecha} />

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: '8pt', color: '#555' }}>
          Página 1 de 6
        </div>
      </div>

      {/* ====== PÁGINA 2: ANTECEDENTES PATOLÓGICOS ====== */}
      <div id="pdf-page-2" style={PAGE_STYLE}>
        <h1 style={{ textAlign: 'center', fontSize: '13pt', marginBottom: 14, marginTop: 4 }}>
          CUESTIONARIO DE ANTECEDENTES PERSONALES
        </h1>

        <h2 style={{ fontSize: '11pt', marginBottom: 4 }}>1. PATOLÓGICOS</h2>

        <div style={{ marginTop: 8, fontWeight: 600, fontSize: '10.5pt' }}>• PERSONALES</div>
        <div style={{ fontSize: '9.5pt', marginBottom: 4 }}>
          Marque con una X si sufre o sufrió usted de alguna enfermedad, en caso de ser
          positivo, amplíe la información en observaciones.
        </div>
        <DiseaseTable
          rows={ENFERMEDADES.map((e) => ({
            label: e.label,
            descripcion: e.descripcion,
            presenta: data.antecedentesPersonales[e.key].presenta,
            observacion: data.antecedentesPersonales[e.key].observacion,
          }))}
        />

        <div style={{ marginTop: 12, fontWeight: 600, fontSize: '10.5pt' }}>• FAMILIARES</div>
        <DiseaseTable
          rows={ENFERMEDADES.map((e) => ({
            label: e.label,
            descripcion: e.descripcion,
            presenta: data.antecedentesFamiliares[e.key].presenta,
            observacion: data.antecedentesFamiliares[e.key].observacion,
          }))}
        />

        <div style={{ marginTop: 14, fontWeight: 600 }}>OBSERVACIONES</div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 50,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {data.observacionesPatologicos}
          <HistorySection entries={data.observacionesPatologicosAnteriores} />
          {!data.observacionesPatologicos && data.observacionesPatologicosAnteriores.length === 0 && ' '}
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '8pt', color: '#555' }}>
          Página 2 de 6
        </div>
      </div>

      {/* ====== PÁGINA 3: MEDICAMENTOS, ALÉRGICOS, QUIRÚRGICOS, FINAL ====== */}
      <div id="pdf-page-3" style={PAGE_STYLE}>
        <h2 style={{ fontSize: '11pt', marginTop: 0, marginBottom: 6 }}>2. MEDICAMENTOSOS</h2>
        <div style={{ fontSize: '9.5pt', marginBottom: 4 }}>
          Describa los medicamentos que toma en casa.
        </div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 60,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {data.medicamentos}
          <HistorySection entries={data.medicamentosAnteriores} />
          {!data.medicamentos && data.medicamentosAnteriores.length === 0 && ' '}
        </div>

        <h2 style={{ fontSize: '11pt', marginTop: 14, marginBottom: 6 }}>3. ALÉRGICOS</h2>
        <div style={{ fontSize: '9.5pt', marginBottom: 4 }}>
          Marque con una X si ha presentado alguna alergia medicamentosa.
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            {ALERGIAS.map((a) => (
              <tr key={a.key}>
                <td style={cellStyle(false)}>{a.label}</td>
                <td style={{ ...cellStyle(false), width: 40, textAlign: 'center', fontWeight: 700 }}>
                  {data.alergicos[a.key] ? 'X' : ''}
                </td>
              </tr>
            ))}
            <tr>
              <td style={cellStyle(false)}>
                OTROS {data.alergicos.otros.descripcion ? `— ${data.alergicos.otros.descripcion}` : ''}
              </td>
              <td style={{ ...cellStyle(false), width: 40, textAlign: 'center', fontWeight: 700 }}>
                {data.alergicos.otros.presenta ? 'X' : ''}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 8, fontWeight: 600 }}>OBSERVACIONES</div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 40,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {data.observacionesAlergias}
          <HistorySection entries={data.observacionesAlergiasAnteriores} />
          {!data.observacionesAlergias && data.observacionesAlergiasAnteriores.length === 0 && ' '}
        </div>

        <h2 style={{ fontSize: '11pt', marginTop: 14, marginBottom: 6 }}>4. QUIRÚRGICOS</h2>
        <div style={{ fontSize: '9.5pt', marginBottom: 4 }}>
          Describa si le han realizado algún procedimiento quirúrgico.
        </div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 50,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {data.quirurgicos}
          <HistorySection entries={data.quirurgicosAnteriores} />
          {!data.quirurgicos && data.quirurgicosAnteriores.length === 0 && ' '}
        </div>

        <h2 style={{ fontSize: '11pt', marginTop: 14, marginBottom: 4 }}>POR ÚLTIMO</h2>
        <div style={{ fontWeight: 600, fontSize: '10pt', marginTop: 4 }}>
          ¿Conoce alguna condición que interfiera con el adecuado proceso de recuperación?
        </div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 36,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {data.condicionRecuperacion}
          <HistorySection entries={data.condicionRecuperacionAnteriores} />
          {!data.condicionRecuperacion && data.condicionRecuperacionAnteriores.length === 0 && ' '}
        </div>

        <div style={{ fontWeight: 600, fontSize: '10pt', marginTop: 8 }}>
          ¿Sabe o sospecha que pueda estar en estado de gestación?
        </div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 28,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
          }}
        >
          {data.estadoGestacion || ' '}
        </div>

        <h2 style={{ fontSize: '11pt', marginTop: 14, marginBottom: 4 }}>5. EVALUACIÓN Y SESIONES</h2>
        <table style={{ width: '100%', fontSize: '10pt', marginBottom: 8 }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', paddingBottom: 4 }}>
                <strong>Tipo de cutis:</strong> {data.tipoCutis || 'Normal'}
              </td>
              <td style={{ paddingBottom: 4 }}>
                <strong>Sesiones programadas:</strong> {data.sesionesProgramadas || 1}
              </td>
            </tr>
          </tbody>
        </table>
        
        {data.fechasSesiones && data.fechasSesiones.length > 0 && (
          <div style={{ fontSize: '9.5pt', marginBottom: 8 }}>
            <strong>Fechas:</strong> {data.fechasSesiones.map((f, i) => `Sesión ${i+1}: ${f || 'N/A'}`).join(' | ')}
          </div>
        )}

        <div style={{ fontWeight: 600, fontSize: '10pt', marginTop: 8 }}>
          Observaciones generales
        </div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 6,
            minHeight: 40,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
            marginBottom: 12
          }}
        >
          {data.observacionesGenerales}
          <HistorySection entries={data.observacionesGeneralesAnteriores} />
          {!data.observacionesGenerales && data.observacionesGeneralesAnteriores.length === 0 && ' '}
        </div>

        <SignatureBlock firma={data.firmaFinal} fecha={data.fechaFinal} />

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '8pt', color: '#555' }}>
          Página 3 de 6
        </div>
      </div>

      {/* ====== PÁGINA 4: DIAGRAMA FACIAL ====== */}
      <div id="pdf-page-4" style={PAGE_STYLE}>
        <h1 style={{ textAlign: 'center', fontSize: '13pt', marginBottom: 8, marginTop: 4 }}>
          PUNTOS DE APLICACIÓN
        </h1>
        <div style={{ textAlign: 'center', fontSize: '10pt', marginBottom: 12 }}>
          Paciente: <strong>{c.nombreCompleto || '—'}</strong> · {c.tipoDocumento} {c.numeroDocumento}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8pt', fontWeight: 700, color: '#9A8C84', marginBottom: 4 }}>ROSTRO FEMENINO</div>
              <FaceDiagram activeIds={activeIds} readOnly width={320} gender="mujer" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8pt', fontWeight: 700, color: '#9A8C84', marginBottom: 4 }}>ROSTRO MASCULINO</div>
              <FaceDiagram activeIds={activeIds} readOnly width={320} gender="hombre" />
            </div>
          </div>
          
          <div style={{ flex: 1, fontSize: '9.5pt' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, borderBottom: '2px solid #E0D7CD', paddingBottom: 4 }}>
              Resumen Detallado de Aplicaciones:
            </div>
            {data.puntosInyeccion.some(p => p.activo || p.aplicacionesAnteriores.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {data.puntosInyeccion
                  .filter(p => p.activo || p.aplicacionesAnteriores.length > 0)
                  .map(p => {
                    const def = INJECTION_POINTS.find(d => d.id === p.id);
                    const isFemenino = p.id.startsWith('m-');
                    return (
                      <div key={p.id} style={{ marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: '9pt', color: '#4A3F35' }}>
                          <span style={{ color: isFemenino ? '#C18C5D' : '#5F715B', marginRight: 4 }}>
                            [{isFemenino ? '♀ F' : '♂ M'}]
                          </span>
                          {def?.zona} - {def?.nombre}
                        </div>
                        {p.activo && (
                          <div style={{ fontSize: '9pt', color: '#059669', fontWeight: 700, marginTop: 2 }}>
                            Sesión Actual: {p.unidades} Unidades
                          </div>
                        )}
                        {p.aplicacionesAnteriores.length > 0 && (
                          <div style={{ marginTop: 2 }}>
                            {p.aplicacionesAnteriores.map((ap, idx) => (
                              <div key={idx} style={{ fontSize: '8pt', color: '#777', paddingLeft: 8 }}>
                                • {formatDate(ap.fecha)}: {ap.unidades}U
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            ) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>No se registraron aplicaciones activas ni históricas.</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: '9pt', color: '#555' }}>
          Los puntos en color verde corresponden a las zonas donde fue aplicada la toxina botulínica en la sesión actual.
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '8pt', color: '#555' }}>
          Página 4 de 6
        </div>
      </div>

      {/* ====== PÁGINA 5: EVOLUCIÓN Y OBSERVACIONES DE PROCEDIMIENTOS ====== */}
      <div id="pdf-page-5" style={PAGE_STYLE}>
        <h1 style={{ textAlign: 'center', fontSize: '13pt', marginBottom: 14, marginTop: 4 }}>
          EVOLUCIÓN Y OBSERVACIONES DE PROCEDIMIENTOS
        </h1>
        <div style={{ textAlign: 'center', fontSize: '10pt', marginBottom: 18 }}>
          Paciente: <strong>{c.nombreCompleto || '—'}</strong> · {c.tipoDocumento} {c.numeroDocumento}
        </div>

        <div style={{ marginTop: 14, fontWeight: 600 }}>REGISTRO SESIÓN ACTUAL</div>
        <div
          style={{
            border: '1px solid #94a3b8',
            padding: 10,
            minHeight: 80,
            whiteSpace: 'pre-wrap',
            fontSize: '10pt',
            marginBottom: 20
          }}
        >
          {data.evolucionProcedimientos || 'Ninguno registrado en la sesión actual.'}
        </div>

        <div style={{ marginTop: 20, fontWeight: 700, borderBottom: '2px solid #E0D7CD', paddingBottom: 4, marginBottom: 10 }}>
          HISTORIAL DE EVOLUCIÓN Y OBSERVACIONES
        </div>
        
        {data.evolucionProcedimientosAnteriores && data.evolucionProcedimientosAnteriores.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.evolucionProcedimientosAnteriores.map((e, idx) => (
              <div key={idx} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc' }}>
                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Fecha: {formatDate(e.fecha)}
                </div>
                <div style={{ fontSize: '9.5pt', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {e.texto}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic', fontSize: '9.5pt' }}>No hay registros previos de evolución.</div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'auto', fontSize: '8pt', color: '#555', paddingTop: 20 }}>
          Página 5 de 6
        </div>
      </div>

      {/* ====== PÁGINA 6: VALORACIÓN ANTROPOMÉTRICA ====== */}
      <div id="pdf-page-6" style={PAGE_STYLE}>
        <h1 style={{ textAlign: 'center', fontSize: '13pt', marginBottom: 14, marginTop: 4 }}>
          VALORACIÓN ANTROPOMÉTRICA
        </h1>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11pt', borderBottom: '1px solid #C5A059', paddingBottom: 4, color: '#C5A059' }}>Medidas Básicas</h2>
            <FieldLine label="Edad" value={`${data.antropometria.edad} años`} />
            <FieldLine label="Talla" value={`${data.antropometria.talla} cm`} />
            <FieldLine label="Masa Corporal" value={`${data.antropometria.masaCorporal} kg`} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11pt', borderBottom: '1px solid #C5A059', paddingBottom: 4, color: '#C5A059' }}>Composición</h2>
            <FieldLine label="Densidad Corporal (DC)" value={data.antropometria.dc} />
            <FieldLine label="% Grasa Corporal" value={`${data.antropometria.porcentajeGrasa}%`} />
          </div>
        </div>

        <h2 style={{ fontSize: '11pt', borderBottom: '1px solid #C5A059', paddingBottom: 4, color: '#C5A059', marginTop: 14 }}>Pliegues Cutáneos (mm)</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '9pt' }}>
          <div style={{ width: '31%' }}><FieldLine label="Tríceps" value={data.antropometria.plTriceps} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Subescapular" value={data.antropometria.plSubescapular} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Bíceps" value={data.antropometria.plBiceps} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Cresta Ilíaca" value={data.antropometria.plCrestaIliaca} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Supraespinal" value={data.antropometria.plSupraespinal} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Abdominal" value={data.antropometria.plAbdominal} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Muslo frontal" value={data.antropometria.plMuslo} /></div>
          <div style={{ width: '31%' }}><FieldLine label="Pierna medial" value={data.antropometria.plPierna} /></div>
        </div>

        <h2 style={{ fontSize: '11pt', borderBottom: '1px solid #C5A059', paddingBottom: 4, color: '#C5A059', marginTop: 14 }}>Somatotipo Heath-Carter</h2>
        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: 8, background: '#F9F7F2', borderRadius: 8 }}>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#4A3F35' }}>ENDOMORFIA</div>
            <div style={{ fontSize: '16pt', fontWeight: 900, color: '#B6A27F' }}>{data.antropometria.endomorfia}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 8, background: '#F9F7F2', borderRadius: 8 }}>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#4A3F35' }}>MESOMORFIA</div>
            <div style={{ fontSize: '16pt', fontWeight: 900, color: '#B6A27F' }}>{data.antropometria.mesomorfia}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 8, background: '#F9F7F2', borderRadius: 8 }}>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#4A3F35' }}>ECTOMORFIA</div>
            <div style={{ fontSize: '16pt', fontWeight: 900, color: '#B6A27F' }}>{data.antropometria.ectomorfia}</div>
          </div>
        </div>

        {/* RECOMENDACIONES CLÍNICAS */}
        <div style={{ background: '#F9F7F2', border: '1px solid #E7D2A7', borderRadius: 12, padding: 12 }}>
          <h3 style={{ fontSize: '10pt', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>Diagnóstico y Recomendaciones</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '8.5pt' }}>
            <div style={{ width: '48%' }}><strong>Estado Saludable:</strong> {data.antropometria.evaluacionSaludable || 'N/A'}</div>
            <div style={{ width: '48%' }}><strong>Tendencia Grasa:</strong> {data.antropometria.evaluacionGrasa || 'N/A'}</div>
            <div style={{ width: '48%' }}><strong>Respuesta Calórica:</strong> {data.antropometria.evaluacionRespuestaCalorica || 'N/A'}</div>
            <div style={{ width: '48%' }}><strong>Sensibilidad Digestiva:</strong> {data.antropometria.evaluacionSensibilidadDigestiva || 'N/A'}</div>
            <div style={{ width: '48%' }}><strong>Margen Muscular:</strong> {data.antropometria.evaluacionMargenMuscular || 'N/A'}</div>
            <div style={{ width: '48%' }}><strong>Fase de Definición:</strong> {data.antropometria.evaluacionFaseDefinicion || 'N/A'}</div>
            <div style={{ width: '48%' }}><strong>Tipo de Volumen:</strong> {data.antropometria.evaluacionVolumen || 'N/A'}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: '8pt', color: '#555' }}>
          Página 6 de 6
        </div>
      </div>
    </div>
  );
}
