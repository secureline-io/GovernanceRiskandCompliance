import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRisks } from '@/lib/supabase/server';

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

    const risks = await getRisks(orgId);
    return NextResponse.json({ data: risks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { org_id, title, description, category, risk_source, inherent_likelihood, inherent_impact, risk_appetite, owner_id, target_resolution_date } = body;

    if (!org_id || !title) {
      return NextResponse.json(
        { error: 'org_id and title are required' },
        { status: 400 }
      );
    }

    const likelihood = inherent_likelihood || 3;
    const impact = inherent_impact || 3;
    const inherent_risk_score = likelihood * impact;

    const { data, error } = await supabase
      .from('risks')
      .insert({
        org_id,
        title,
        description: description || null,
        category: category || null,
        risk_source: risk_source || null,
        inherent_likelihood: likelihood,
        inherent_impact: impact,
        inherent_risk_score,
        risk_response: risk_appetite || null,
        status: 'open',
        owner_id: owner_id || user?.id || null,
        review_date: target_resolution_date || null,
      })
      .select()
      .single();

    if (error) throw error;

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'risk.created',
        p_resource_type: 'risk',
        p_resource_id: data.id,
        p_changes: { new: data },
      });
    } catch (e) {}

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create risk' },
      { status: 500 }
    );
  }
}
