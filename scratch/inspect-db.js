const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://himlilailjianqkctziy.supabase.co';
const supabaseAnonKey = 'sb_publishable_KjAAA2SquezOmb-ofHTy5g_f6_Krsu3';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Consultando historias clínicas...');
  const { data, error } = await supabase
    .from('historias_clinicas')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total de registros encontrados: ${data.length}\n`);

  data.forEach((r) => {
    console.log(`ID: ${r.id}`);
    console.log(`Paciente: ${r.paciente_nombre} | Doc: ${r.paciente_documento}`);
    
    // Analizar el JSONB 'datos'
    const datos = r.datos || {};
    const consentimiento = datos.consentimiento || {};
    
    console.log(`Nombre en consentimiento: ${consentimiento.nombreCompleto}`);
    console.log(`Documento en consentimiento: ${consentimiento.numeroDocumento}`);
    
    // Verificar si el nombre/documento del registro coincide con el del consentimiento
    const nombreCoincide = r.paciente_nombre === consentimiento.nombreCompleto;
    const docCoincide = r.paciente_documento === consentimiento.numeroDocumento;
    
    if (!nombreCoincide || !docCoincide) {
      console.log(`⚠️ ALERTA: Mismatch en coincidencia!`);
      console.log(`   DB paciente_nombre: "${r.paciente_nombre}" vs Consentimiento nombreCompleto: "${consentimiento.nombreCompleto}"`);
      console.log(`   DB paciente_documento: "${r.paciente_documento}" vs Consentimiento numeroDocumento: "${consentimiento.numeroDocumento}"`);
    }

    // Mostrar el historial de procedimientos si tiene
    const procAnt = datos.procedimientosAnteriores || [];
    if (procAnt.length > 0) {
      console.log(`   Historial de procedimientos (${procAnt.length} entradas):`);
      procAnt.forEach(p => {
        console.log(`     - [${p.fecha}]: ${p.texto}`);
      });
    }
    console.log('--------------------------------------------------');
  });
}

run();
