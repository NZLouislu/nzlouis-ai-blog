import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL as string
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string

async function main() {
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('posts').select('id').limit(1)
  if (error) {
    console.error('Connect failed:', error.message)
    process.exit(1)
  }
  console.log('Connect ok:', data?.length ?? 0)
}

main()