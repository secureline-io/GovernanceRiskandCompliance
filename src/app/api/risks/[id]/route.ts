import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/risks/[id] - Get risk details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: risk, error } = await supabase
      .from('risks')
      .select(`
        *,
        risk_control_links(
          id,
          effectiveness,
          notes,
          controls(
            id,
            code,
            name,
            status,
            effectiveness_score
          )
        ),
        risk_treatments(
          id,
          action,
          description,
          status,
          due_date,
          cost_estimate,
          created_at,
          completed_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
      }
      console.error('Error fetching risk:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: risk });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/risks/[id] - Update a risk
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    // Get current state for audit log
    const { data: oldRisk } = await supabase
      .from('risks')
      .select('*')
      .eq('id', id)
      .single();

    // Update last_reviewed_at if reviewing
    if (body.status || body.inherent_likelihood || body.inherent_impact) {
      body.last_reviewed_at = new Date().toISOString();
    }

    const { data: risk, error } = await supabase
      .from('risks')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    if (oldRisk) {
      await supabase.rpc('log_audit_event', {
        p_org_id: risk.org_id,
        p_action: 'update',
        p_resource_type: 'risks',
        p_resource_id: risk.id,
        p_changes: { old: oldRisk, new: risk }
      });
    }

    return NextResponse.json({ data: risk });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/risks/[id] - Archive a risk (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;

    // Soft delete by setting status to 'closed'
    const { data: risk, error } = await supabase
      .from('risks')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving risk:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    await supabase.rpc('log_audit_event', {
      p_org_id: risk.org_id,
      p_action: 'archive',
      p_resource_type: 'risks',
      p_resource_id: risk.id,
      p_changes: { status: 'closed' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
