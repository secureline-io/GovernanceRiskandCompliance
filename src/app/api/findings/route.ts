import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getFindings } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required (org_id)' },
        { status: 400 }
      );
    }

    const findings = await getFindings(orgId);
    return NextResponse.json({ data: findings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch findings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { org_id, title, description, severity, policy_id, asset_id, remediation_guidance } = body;

    if (!org_id || !title || !severity) {
      return NextResponse.json(
        { error: 'org_id, title, and severity are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('findings')
      .insert({
        org_id,
        title,
        description: description || null,
        severity,
        status: 'open',
        policy_id: policy_id || null,
        asset_id: asset_id || null,
        remediation_guidance: remediation_guidance || null,
        first_detected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'finding.created',
        p_resource_type: 'finding',
        p_resource_id: data.id,
        p_changes: { new: data },
      });
    } catch (e) {}

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create finding' },
      { status: 500 }
    );
  }
}
