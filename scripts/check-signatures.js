
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSignatures() {
  const { data, error } = await supabase
    .from('historias_clinicas')
    .select('id, paciente_nombre, consentimiento, firma_final')
    .ilike('paciente_nombre', '%miguel%')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error querying Supabase:', error);
    return;
  }

  console.log('Found records for Miguel:');
  data.forEach(r => {
    console.log(`ID: ${r.id}`);
    console.log(`Paciente: ${r.paciente_nombre}`);
    console.log(`Firma Consentimiento: ${r.consentimiento?.firma ? 'EXISTS (length: ' + r.consentimiento.firma.length + ')' : 'MISSING'}`);
    console.log(`Firma Final: ${r.firma_final ? 'EXISTS (length: ' + r.firma_final.length + ')' : 'MISSING'}`);
    console.log('---');
  });
}

checkSignatures();
