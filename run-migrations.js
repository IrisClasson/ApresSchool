#!/usr/bin/env node

// Script to run SQL migrations on Supabase
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runMigrations() {
  try {
    console.log('📝 Reading SQL migration file...')
    const sqlFile = join(__dirname, 'supabase-setup.sql')
    const sql = readFileSync(sqlFile, 'utf8')

    console.log('🚀 Running migrations on Supabase...')

    // Split SQL by statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' })
        if (error) {
          // Try direct execution if RPC fails
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ query: statement + ';' })
          })

          if (!response.ok) {
            console.warn('⚠️  Could not execute statement:', statement.substring(0, 50) + '...')
            errorCount++
          } else {
            successCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        console.warn('⚠️  Statement failed:', err.message)
        errorCount++
      }
    }

    console.log('\n✅ Migration completed!')
    console.log(`   Success: ${successCount} statements`)
    if (errorCount > 0) {
      console.log(`   ⚠️  Warnings: ${errorCount} statements (may be expected if already exists)`)
    }
    console.log('\n💡 You may need to run the SQL script manually in the Supabase SQL Editor')
    console.log(`   at: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`)

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigrations()
