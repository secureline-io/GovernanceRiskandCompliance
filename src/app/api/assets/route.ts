import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/assets - list assets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const type = searchParams.get('type');
    const criticality = searchParams.get('criticality');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('assets')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (type) query = query.eq('type', type);
    if (criticality) query = query.eq('criticality', criticality);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching assets:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assets - create asset
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { org_id, name, type, criticality, owner, description, cloud_account_id } = body;

    if (!org_id || !name || !type) {
      return NextResponse.json({ error: 'org_id, name and type are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        org_id,
        name,
        type,
        criticality: criticality || 'medium',
        owner: owner || null,
        description: description || null,
        cloud_account_id: cloud_account_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'assets',
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
