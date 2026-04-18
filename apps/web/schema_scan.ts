import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

async function run() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim()?.replace(/['"]/g, '');
    const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim()?.replace(/['"]/g, '');
    
    if (!url || !key) {
      fs.writeFileSync('schema_debug.txt', 'Env vars not found');
      return;
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('events').select('*').limit(1);
    
    if (error) {
      fs.writeFileSync('schema_debug.txt', 'DB_ERROR: ' + JSON.stringify(error));
    } else if (data && data.length > 0) {
      fs.writeFileSync('schema_debug.txt', 'COLS: ' + JSON.stringify(Object.keys(data[0])));
    } else {
      fs.writeFileSync('schema_debug.txt', 'NO_DATA');
    }
  } catch (err: any) {
    fs.writeFileSync('schema_debug.txt', 'FATAL: ' + err.message);
  }
}

run();
