import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/integrations - list integrations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (error) {
      console.error('Error fetching integrations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stats = {
      active: integrations?.filter((i: any) => i.status === 'active').length || 0,
      error: integrations?.filter((i: any) => i.sync_status === 'error').length || 0,
      total: integrations?.length || 0
    };

    return NextResponse.json({ data: integrations, stats });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/integrations - create integration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { org_id, name, type, api_key, description } = body;

    if (!org_id || !name || !type) {
      return NextResponse.json({ error: 'org_id, name and type are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        org_id,
        name,
        type,
        api_key: api_key || null,
        description: description || null,
        status: 'pending',
        sync_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'integrations',
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
