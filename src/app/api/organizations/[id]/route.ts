import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/organizations/[id] - Get organization details with summary stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (orgError) {
      if (orgError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      console.error('Error fetching organization:', orgError);
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // Get summary statistics
    const [
      { data: controlStats },
      { data: riskStats },
      { data: taskStats },
      { data: vendorStats }
    ] = await Promise.all([
      // Control status summary
      supabase.rpc('get_control_status_summary', { p_org_id: id }),
      // Risk counts
      supabase.rpc('get_risks_by_severity', { p_org_id: id }),
      // Open tasks
      supabase.from('evidence_tasks')
        .select('id', { count: 'exact' })
        .eq('org_id', id)
        .in('status', ['open', 'in_progress']),
      // Vendor count
      supabase.from('vendors')
        .select('id, risk_level')
        .eq('org_id', id)
        .eq('status', 'active')
    ]);

    // Calculate vendor stats
    const vendorCount = vendorStats?.length || 0;
    const highRiskVendors = vendorStats?.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length || 0;

    return NextResponse.json({
      data: {
        ...org,
        stats: {
          controls: controlStats?.[0] || null,
          risks: riskStats || [],
          open_tasks: taskStats?.length || 0,
          vendors: {
            total: vendorCount,
            high_risk: highRiskVendors
          }
        }
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow changing slug (could break references)
    delete body.slug;

    const { data: org, error } = await supabase
      .from('organizations')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: org });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
