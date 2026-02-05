import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/policies/[id] - Get policy details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: policy, error } = await supabase
      .from('policies')
      .select(`
        *,
        policy_acknowledgements(
          id,
          status,
          due_date,
          acknowledged_at,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
      }
      console.error('Error fetching policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: policy });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/policies/[id] - Update a policy
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current state for audit log
    const { data: oldPolicy } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .single();

    // If content is being updated, increment version
    if (body.content_markdown && body.content_markdown !== oldPolicy?.content_markdown) {
      body.version = (oldPolicy?.version || 1) + 1;
    }

    const { data: policy, error } = await supabase
      .from('policies')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    if (oldPolicy) {
      await supabase.rpc('log_audit_event', {
        p_org_id: policy.org_id,
        p_action: 'update',
        p_resource_type: 'policies',
        p_resource_id: policy.id,
        p_changes: { old: oldPolicy, new: policy }
      });
    }

    return NextResponse.json({ data: policy });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/policies/[id] - Archive a policy
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

    // Soft delete by setting status to 'archived'
    const { data: policy, error } = await supabase
      .from('policies')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    await supabase.rpc('log_audit_event', {
      p_org_id: policy.org_id,
      p_action: 'archive',
      p_resource_type: 'policies',
      p_resource_id: policy.id,
      p_changes: { status: 'archived' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
