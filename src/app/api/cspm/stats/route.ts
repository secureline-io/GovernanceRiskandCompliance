import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/cspm/stats - aggregated CSPM statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Total accounts by provider
    const { data: accountsByProvider, error: e1 } = await supabase
      .from('cloud_accounts')
      .select('provider')
      .eq('org_id', orgId);

    // Finding severity breakdown
    const { data: findingsBySeverity, error: e2 } = await supabase
      .from('cspm_findings')
      .select('severity')
      .eq('org_id', orgId);

    // Accounts with errors
    const { data: accountsWithErrors, error: e3 } = await supabase
      .from('cloud_accounts')
      .select('id')
      .eq('org_id', orgId)
      .eq('sync_status', 'error');

    if (e1 || e2 || e3) {
      console.error('Error fetching stats:', e1 || e2 || e3);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Count by provider
    const providerCounts = (accountsByProvider || []).reduce((acc: any, a: any) => {
      acc[a.provider] = (acc[a.provider] || 0) + 1;
      return acc;
    }, {});

    // Count by severity
    const severityCounts = (findingsBySeverity || []).reduce((acc: any, f: any) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      data: {
        total_accounts: accountsByProvider?.length || 0,
        accounts_by_provider: providerCounts,
        total_findings: findingsBySeverity?.length || 0,
        findings_by_severity: severityCounts,
        accounts_with_errors: accountsWithErrors?.length || 0
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
