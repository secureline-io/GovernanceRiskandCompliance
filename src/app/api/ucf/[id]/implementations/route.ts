import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/ucf/:id/implementations?org_id= - Get org's implementations of this UCF control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json(
        { error: 'org_id query parameter is required' },
        { status: 400 }
      );
    }

    // Verify the UCF control exists
    const { data: ucfControl, error: controlError } = await supabase
      .from('ucf_controls')
      .select('id, code, title')
      .eq('id', id)
      .single();

    if (controlError) {
      if (controlError.code === 'PGRST116') {
        return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
      }
      console.error('Error fetching UCF control:', controlError);
      return NextResponse.json({ error: controlError.message }, { status: 500 });
    }

    // Fetch implementations for this UCF control and org
    const { data: implementations, error } = await supabase
      .from('ucf_control_implementations')
      .select(`
        id,
        implementation_status,
        notes,
        created_at,
        updated_at,
        controls(
          id,
          code,
          name,
          description,
          category,
          status,
          control_type,
          control_nature
        )
      `)
      .eq('ucf_control_id', id)
      .eq('org_id', orgId)
      .order('created_at');

    if (error) {
      console.error('Error fetching implementations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ucf_control: ucfControl,
        org_id: orgId,
        implementations: implementations || [],
        total_count: implementations?.length || 0,
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

// POST /api/ucf/:id/implementations - Link org control
// Body: { org_id, control_id, implementation_status, notes }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    const { org_id, control_id, implementation_status, notes } = body;

    if (!org_id || !control_id) {
      return NextResponse.json(
        { error: 'org_id and control_id are required' },
        { status: 400 }
      );
    }

    // Verify the UCF control exists
    const { data: ucfControl, error: ucfError } = await supabase
      .from('ucf_controls')
      .select('id')
      .eq('id', id)
      .single();

    if (ucfError || !ucfControl) {
      return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
    }

    // Verify the org control exists and belongs to the org
    const { data: orgControl, error: orgControlError } = await supabase
      .from('controls')
      .select('id, org_id')
      .eq('id', control_id)
      .eq('org_id', org_id)
      .single();

    if (orgControlError || !orgControl) {
      return NextResponse.json(
        { error: 'Control not found or does not belong to the specified organization' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('ucf_control_implementations')
      .insert({
        ucf_control_id: id,
        org_id,
        control_id,
        implementation_status: implementation_status || 'planned',
        notes: notes || null,
        created_by: user?.id || null,
      })
      .select(`
        id,
        implementation_status,
        notes,
        created_at,
        controls(id, code, name)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This control is already linked to this UCF control for this organization' },
          { status: 409 }
        );
      }
      console.error('Error creating implementation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'ucf_implementation.created',
        p_resource_type: 'ucf_control_implementations',
        p_resource_id: data.id,
        p_changes: { new: data },
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create implementation' },
      { status: 500 }
    );
  }
}
