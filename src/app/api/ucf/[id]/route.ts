import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/ucf/:id - Get single UCF control with cross-framework impact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Fetch the UCF control with its requirement mappings
    const { data: control, error } = await supabase
      .from('ucf_controls')
      .select(`
        *,
        ucf_requirement_mappings(
          id,
          mapping_strength,
          mapping_notes,
          framework_requirements(
            id,
            code,
            title,
            category,
            frameworks(id, code, name)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
      }
      console.error('Error fetching UCF control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Call the RPC to get cross-framework impact data
    let cross_impact = null;
    try {
      const { data: impactData, error: rpcError } = await supabase
        .rpc('get_ucf_cross_impact', { p_ucf_control_id: id });

      if (!rpcError) {
        cross_impact = impactData;
      } else {
        console.error('Error calling get_ucf_cross_impact:', rpcError);
      }
    } catch (e) {
      // RPC may not exist yet - non-critical
      console.error('get_ucf_cross_impact RPC not available:', e);
    }

    return NextResponse.json({
      data: {
        ...control,
        cross_impact,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/ucf/:id - Update UCF control
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    // Get the current state for audit logging
    const { data: oldControl } = await supabase
      .from('ucf_controls')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldControl) {
      return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
    }

    const { data: control, error } = await supabase
      .from('ucf_controls')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating UCF control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: null,
        p_action: 'ucf_control.updated',
        p_resource_type: 'ucf_controls',
        p_resource_id: control.id,
        p_changes: { old: oldControl, new: control },
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ data: control });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ucf/:id - Delete UCF control
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;

    // Get the control for audit logging
    const { data: control } = await supabase
      .from('ucf_controls')
      .select('*')
      .eq('id', id)
      .single();

    if (!control) {
      return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('ucf_controls')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting UCF control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: null,
        p_action: 'ucf_control.deleted',
        p_resource_type: 'ucf_controls',
        p_resource_id: id,
        p_changes: { deleted: control },
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
