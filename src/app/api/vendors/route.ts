import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/vendors - List vendors for an organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('org_id');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('risk_level');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('vendors')
      .select(`
        *,
        vendor_assessments(
          id,
          assessment_date,
          score,
          risk_rating,
          status,
          issues_count
        )
      `)
      .eq('org_id', orgId)
      .order('name');

    if (status) {
      query = query.eq('status', status);
    }
    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: vendors });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const {
      org_id,
      name,
      industry,
      contact_email,
      contact_name,
      website,
      description,
      risk_level,
      data_shared,
      criticality,
      contract_end_date
    } = body;

    if (!org_id || !name) {
      return NextResponse.json(
        { error: 'org_id and name are required' },
        { status: 400 }
      );
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        org_id,
        name,
        industry,
        contact_email,
        contact_name,
        website,
        description,
        risk_level: risk_level || 'medium',
        data_shared,
        criticality,
        contract_end_date,
        status: 'pending_review'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'vendors',
        p_resource_id: vendor.id,
        p_changes: { new: vendor }
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }

    return NextResponse.json({ data: vendor }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
