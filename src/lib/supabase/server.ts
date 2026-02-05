import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any

// Server-side client with cookie handling for authenticated requests
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<AnyDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client with service role key (bypasses RLS for admin operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Helper functions for common server-side operations
export async function getFrameworks() {
  const client = supabaseAdmin || await createServerSupabaseClient()
  const { data, error } = await client
    .from('frameworks')
    .select(`
      *,
      framework_requirements(count)
    `)
    .order('name')

  if (error) throw error
  return data
}

export async function getOrganization(orgId: string) {
  const client = supabaseAdmin || await createServerSupabaseClient()
  const { data, error } = await client
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) throw error
  return data
}

export async function getControls(orgId: string) {
  const client = supabaseAdmin || await createServerSupabaseClient()
  const { data, error } = await client
    .from('controls')
    .select('*')
    .eq('org_id', orgId)
    .order('code')

  if (error) throw error
  return data
}

export async function getFindings(orgId: string) {
  const client = supabaseAdmin || await createServerSupabaseClient()
  const { data, error } = await client
    .from('findings')
    .select('*')
    .eq('org_id', orgId)
    .order('first_detected_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getRisks(orgId: string) {
  const client = supabaseAdmin || await createServerSupabaseClient()
  const { data, error } = await client
    .from('risks')
    .select('*')
    .eq('org_id', orgId)
    .order('inherent_risk_score', { ascending: false })

  if (error) throw error
  return data
}
