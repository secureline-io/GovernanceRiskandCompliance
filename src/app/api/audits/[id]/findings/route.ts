import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/audits/[id]/findings - list findings for audit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || undefined;

    let query = supabase
      .from('audit_findings')
      .select('*')
      .eq('audit_id', id)
      .order('created_at', { ascending: false });

    if (orgId) query = query.eq('org_id', orgId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching findings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/audits/[id]/findings - create a finding under audit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { org_id, title, severity, description, control_ref, remediation_plan, due_date, assigned_to } = body;

    if (!org_id || !title || !severity) {
      return NextResponse.json({ error: 'org_id, title and severity are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('audit_findings')
      .insert({
        audit_id: id,
        org_id,
        title,
        severity,
        description: description || null,
        control_ref: control_ref || null,
        remediation_plan: remediation_plan || null,
        due_date: due_date || null,
        assigned_to: assigned_to || null,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating finding:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'finding.created',
        p_resource_type: 'audit_findings',
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
