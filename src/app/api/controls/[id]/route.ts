import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/controls/[id] - Get control details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: control, error } = await supabase
      .from('controls')
      .select(`
        *,
        control_requirement_mappings(
          id,
          coverage_percentage,
          mapping_notes,
          framework_requirements(
            id,
            code,
            title,
            category,
            frameworks(id, code, name)
          )
        ),
        evidence_control_links(
          evidence(
            id,
            title,
            description,
            collected_at,
            source,
            file_type,
            hash
          )
        ),
        risk_control_links(
          effectiveness,
          notes,
          risks(
            id,
            title,
            category,
            inherent_risk_score,
            residual_risk_score,
            status
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Control not found' }, { status: 404 });
      }
      console.error('Error fetching control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: control });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/controls/[id] - Update a control
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

    // Get the current state for audit logging
    const { data: oldControl } = await supabase
      .from('controls')
      .select('*')
      .eq('id', id)
      .single();

    const { data: control, error } = await supabase
      .from('controls')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    if (oldControl) {
      await supabase.rpc('log_audit_event', {
        p_org_id: control.org_id,
        p_action: 'update',
        p_resource_type: 'controls',
        p_resource_id: control.id,
        p_changes: { old: oldControl, new: control }
      });
    }

    return NextResponse.json({ data: control });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/controls/[id] - Delete a control
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

    // Get the control for audit logging
    const { data: control } = await supabase
      .from('controls')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('controls')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    if (control) {
      await supabase.rpc('log_audit_event', {
        p_org_id: control.org_id,
        p_action: 'delete',
        p_resource_type: 'controls',
        p_resource_id: id,
        p_changes: { deleted: control }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
