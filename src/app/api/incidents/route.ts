import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/incidents - list incidents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('org_id', orgId)
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: incidents });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/incidents - create incident
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { org_id, title, severity, incident_type, description, commander, affected_systems } = body;

    if (!org_id || !title || !severity) {
      return NextResponse.json({ error: 'org_id, title and severity are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        org_id,
        title,
        severity,
        incident_type: incident_type || null,
        description: description || null,
        commander: commander || null,
        affected_systems: affected_systems || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'incidents',
        p_resource_id: data.id,
        p_changes: { new: data }
      });
    } catch (e) {}

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
