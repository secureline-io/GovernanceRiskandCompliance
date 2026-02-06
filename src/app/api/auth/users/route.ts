import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function requireSuperAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const adminClient = await getAdminClient();
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_super_admin) {
    throw new Error('Forbidden: Super admin access required');
  }

  return { user, adminClient };
}

// GET /api/auth/users - List all users (super admin only)
export async function GET(request: Request) {
  try {
    const { adminClient } = await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');

    if (orgId) {
      // Get users for specific org
      const { data: members, error } = await adminClient
        .from('organization_members')
        .select(`
          id,
          role,
          is_external_auditor,
          created_at,
          user_id,
          user_profiles (
            id,
            email,
            full_name,
            avatar_url,
            job_title,
            is_super_admin,
            is_active,
            last_login_at
          )
        `)
        .eq('org_id', orgId);

      if (error) throw error;
      return NextResponse.json({ data: members });
    }

    // Get all user profiles
    const { data: profiles, error } = await adminClient
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: profiles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/auth/users - Create a new user (super admin only)
export async function POST(request: Request) {
  try {
    const { adminClient } = await requireSuperAdmin();
    const body = await request.json();
    const { email, password, full_name, job_title, role, org_id } = body;

    if (!email || !password || !org_id) {
      return NextResponse.json(
        { error: 'email, password, and org_id are required' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || '' },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .upsert({
        id: userId,
        email,
        full_name: full_name || '',
        job_title: job_title || null,
        is_super_admin: false,
      });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // Add to organization
    const { error: memberError } = await adminClient
      .from('organization_members')
      .insert({
        org_id,
        user_id: userId,
        role: role || 'viewer',
      });

    if (memberError) {
      await adminClient.auth.admin.deleteUser(userId);
      throw memberError;
    }

    return NextResponse.json({
      data: { id: userId, email, full_name, role },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
