import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/audits?org_id=default - list audits with findings_count
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    const { data: audits, error } = await supabase
      .from('audits')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audits:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // fetch finding counts in parallel
    const auditsWithCounts = await Promise.all(
      (audits || []).map(async (a: any) => {
        const { count } = await supabase
          .from('audit_findings')
          .select('id', { count: 'exact', head: true })
          .eq('audit_id', a.id)
          .eq('org_id', orgId);

        return { ...a, findings_count: count || 0 };
      })
    );

    return NextResponse.json({ data: auditsWithCounts });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/audits - create audit
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();

    const body = await request.json();
    const { org_id, name, audit_type, auditor, lead_auditor_name, start_date, end_date, description, scope, frameworks } = body;

    if (!org_id || !name || !audit_type) {
      return NextResponse.json({ error: 'org_id, name and audit_type are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('audits')
      .insert({
        org_id,
        name,
        audit_type,
        auditor: auditor || null,
        lead_auditor_name: lead_auditor_name || null,
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
        scope: scope || [],
        frameworks: frameworks || [],
        status: 'planning'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audit:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'audits',
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
