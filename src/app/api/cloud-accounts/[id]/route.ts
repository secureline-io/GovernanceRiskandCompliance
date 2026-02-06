import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/cloud-accounts/[id] - get account with findings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: account, error } = await supabase
      .from('cloud_accounts')
      .select(`*, cspm_findings(*)`)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching cloud account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: account });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/cloud-accounts/[id] - update account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data: oldAccount } = await supabase.from('cloud_accounts').select('*').eq('id', id).single();

    const { data: account, error } = await supabase
      .from('cloud_accounts')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cloud account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (oldAccount) {
      await supabase.rpc('log_audit_event', {
        p_org_id: account.org_id,
        p_action: 'update',
        p_resource_type: 'cloud_accounts',
        p_resource_id: account.id,
        p_changes: { old: oldAccount, new: account }
      });
    }

    return NextResponse.json({ data: account });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cloud-accounts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: account, error } = await supabase
      .from('cloud_accounts')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting cloud account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.rpc('log_audit_event', {
      p_org_id: account.org_id,
      p_action: 'delete',
      p_resource_type: 'cloud_accounts',
      p_resource_id: account.id,
      p_changes: { deleted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
