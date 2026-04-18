import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

async function run() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim()?.replace(/['"]/g, '');
    const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim()?.replace(/['"]/g, '');
    if (!url || !key) return;
    const supabase = createClient(url, key);
    
    // Attempt an empty insert to see which field is missing
    const { error } = await supabase.from('events').insert({ name: 'TEST_PROBE' }).select();
    fs.writeFileSync('probe.log', JSON.stringify(error || { success: true }));
  } catch (err: any) {
    fs.writeFileSync('probe.log', 'FATAL: ' + err.message);
  }
}
run();
