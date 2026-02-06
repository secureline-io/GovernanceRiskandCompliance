import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/cloud-accounts - list cloud accounts with finding counts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    const { data: accounts, error } = await supabase
      .from('cloud_accounts')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cloud accounts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch finding counts in parallel
    const accountsWithCounts = await Promise.all(
      (accounts || []).map(async (a: any) => {
        const { count } = await supabase
          .from('cspm_findings')
          .select('id', { count: 'exact', head: true })
          .eq('cloud_account_id', a.id);

        return { ...a, findings_count: count || 0 };
      })
    );

    return NextResponse.json({ data: accountsWithCounts });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cloud-accounts - create cloud account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { org_id, provider, account_id, account_name, regions } = body;

    if (!org_id || !provider || !account_id) {
      return NextResponse.json({ error: 'org_id, provider and account_id are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cloud_accounts')
      .insert({
        org_id,
        provider,
        account_id,
        account_name: account_name || null,
        regions: regions || [],
        sync_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cloud account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'cloud_accounts',
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
