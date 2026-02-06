import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/cspm/findings - list CSPM findings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const severity = searchParams.get('severity');
    const cloudAccountId = searchParams.get('cloud_account_id');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('cspm_findings')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (severity) query = query.eq('severity', severity);
    if (cloudAccountId) query = query.eq('cloud_account_id', cloudAccountId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching CSPM findings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cspm/findings - create finding
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { org_id, cloud_account_id, title, severity, description, resource_id, status } = body;

    if (!org_id || !cloud_account_id || !title || !severity) {
      return NextResponse.json({ error: 'org_id, cloud_account_id, title and severity are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cspm_findings')
      .insert({
        org_id,
        cloud_account_id,
        title,
        severity,
        description: description || null,
        resource_id: resource_id || null,
        status: status || 'open'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating CSPM finding:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'finding.created',
        p_resource_type: 'cspm_findings',
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
