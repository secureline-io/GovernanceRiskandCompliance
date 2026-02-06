import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/incidents/[id] - get incident with timeline
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: incident, error } = await supabase
      .from('incidents')
      .select(`*, incident_timeline(*)`)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: incident });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/incidents/[id] - update incident
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
    const { data: oldIncident } = await supabase.from('incidents').select('*').eq('id', id).single();

    const { data: incident, error } = await supabase
      .from('incidents')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (oldIncident) {
      await supabase.rpc('log_audit_event', {
        p_org_id: incident.org_id,
        p_action: 'update',
        p_resource_type: 'incidents',
        p_resource_id: incident.id,
        p_changes: { old: oldIncident, new: incident }
      });
    }

    return NextResponse.json({ data: incident });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/incidents/[id]
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

    const { data: incident, error } = await supabase
      .from('incidents')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error closing incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.rpc('log_audit_event', {
      p_org_id: incident.org_id,
      p_action: 'archive',
      p_resource_type: 'incidents',
      p_resource_id: incident.id,
      p_changes: { status: 'closed' }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
