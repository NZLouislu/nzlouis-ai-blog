import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const sqlPath = 'lib/db/update blog.sql'

async function run() {
  const url = process.env.SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  if (!url || !key) {
    console.error('missing env')
    process.exit(1)
  }
  const supabase = createClient(url, key)
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const res = await fetch(url + '/rest/v1/rpc/execute_sql', {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  })
  const text = await res.text()
  console.log(text)
}

run()
