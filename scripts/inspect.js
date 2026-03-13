import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('missing supabase env vars');
  process.exit(1);
}
const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.from('products').select('*').limit(5);
  if (error) {
    console.error('error', error);
    return;
  }
  console.log('sample', data);
}

main();
