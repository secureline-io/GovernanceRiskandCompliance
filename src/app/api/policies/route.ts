import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/policies - List policies for an organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('org_id');
    const status = searchParams.get('status');
    const policyType = searchParams.get('policy_type');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('policies')
      .select(`
        *,
        policy_acknowledgements(
          id,
          status,
          user_id
        )
      `)
      .eq('org_id', orgId)
      .order('title');

    if (status) {
      query = query.eq('status', status);
    }
    if (policyType) {
      query = query.eq('policy_type', policyType);
    }

    const { data: policies, error } = await query;

    if (error) {
      console.error('Error fetching policies:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate acknowledgement stats for each policy
    const policiesWithStats = policies?.map(policy => {
      const acks = policy.policy_acknowledgements || [];
      const totalAcks = acks.length;
      const acknowledgedCount = acks.filter((a: { status: string }) => a.status === 'acknowledged').length;
      const pendingCount = acks.filter((a: { status: string }) => a.status === 'pending').length;
      const overdueCount = acks.filter((a: { status: string }) => a.status === 'overdue').length;

      return {
        ...policy,
        acknowledgement_stats: {
          total: totalAcks,
          acknowledged: acknowledgedCount,
          pending: pendingCount,
          overdue: overdueCount,
          completion_rate: totalAcks > 0 ? Math.round((acknowledgedCount / totalAcks) * 100) : 0
        }
      };
    });

    return NextResponse.json({ data: policiesWithStats });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/policies - Create a new policy
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      org_id,
      title,
      policy_type,
      content_markdown,
      review_date
    } = body;

    if (!org_id || !title) {
      return NextResponse.json(
        { error: 'org_id and title are required' },
        { status: 400 }
      );
    }

    const { data: policy, error } = await supabase
      .from('policies')
      .insert({
        org_id,
        title,
        policy_type,
        content_markdown,
        review_date,
        status: 'draft',
        version: 1,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    await supabase.rpc('log_audit_event', {
      p_org_id: org_id,
      p_action: 'create',
      p_resource_type: 'policies',
      p_resource_id: policy.id,
      p_changes: { new: policy }
    });

    return NextResponse.json({ data: policy }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
