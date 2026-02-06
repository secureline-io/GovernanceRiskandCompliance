import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function requireSuperAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');
  if (!supabaseServiceKey) throw new Error('Service role key not configured');

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_super_admin) throw new Error('Forbidden');

  return { user, adminClient };
}

// PATCH /api/auth/users/[id] - Update user role or profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { adminClient } = await requireSuperAdmin();
    const body = await request.json();

    const { role, org_id, full_name, job_title, is_active } = body;

    // Update profile if fields provided
    const profileUpdate: Record<string, unknown> = {};
    if (full_name !== undefined) profileUpdate.full_name = full_name;
    if (job_title !== undefined) profileUpdate.job_title = job_title;
    if (is_active !== undefined) profileUpdate.is_active = is_active;

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await adminClient
        .from('user_profiles')
        .update(profileUpdate)
        .eq('id', id);

      if (error) throw error;
    }

    // Update role if provided
    if (role && org_id) {
      const { error } = await adminClient
        .from('organization_members')
        .update({ role })
        .eq('user_id', id)
        .eq('org_id', org_id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/auth/users/[id] - Deactivate user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, adminClient } = await requireSuperAdmin();

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Deactivate profile (soft delete)
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', id);

    if (profileError) throw profileError;

    // Remove from all organizations
    const { error: memberError } = await adminClient
      .from('organization_members')
      .delete()
      .eq('user_id', id);

    if (memberError) throw memberError;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
