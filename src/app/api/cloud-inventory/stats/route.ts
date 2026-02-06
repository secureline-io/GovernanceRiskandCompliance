import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/supabase/server';

// GET /api/cloud-inventory/stats - Get inventory dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { client: supabase } = await getWriteClient();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('org_id');
    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Get all assets for this org
    const { data: assets, error } = await supabase
      .from('assets')
      .select('service, resource_type, region, environment, criticality, lifecycle_state, internet_exposed, data_classification, provider, account_id, tags')
      .eq('org_id', orgId);

    if (error) throw error;

    const allAssets = assets || [];

    // Calculate stats
    const totalAssets = allAssets.length;
    const activeAssets = allAssets.filter(a => a.lifecycle_state === 'active' || !a.lifecycle_state).length;
    const staleAssets = allAssets.filter(a => a.lifecycle_state === 'stale').length;
    const exposedAssets = allAssets.filter(a => a.internet_exposed).length;

    // By service
    const byService: Record<string, number> = {};
    allAssets.forEach(a => {
      const svc = a.service || 'unknown';
      byService[svc] = (byService[svc] || 0) + 1;
    });

    // By resource type
    const byResourceType: Record<string, number> = {};
    allAssets.forEach(a => {
      byResourceType[a.resource_type] = (byResourceType[a.resource_type] || 0) + 1;
    });

    // By region
    const byRegion: Record<string, number> = {};
    allAssets.forEach(a => {
      const r = a.region || 'unknown';
      byRegion[r] = (byRegion[r] || 0) + 1;
    });

    // By environment
    const byEnvironment: Record<string, number> = {};
    allAssets.forEach(a => {
      const env = a.environment || 'untagged';
      byEnvironment[env] = (byEnvironment[env] || 0) + 1;
    });

    // By criticality
    const byCriticality: Record<string, number> = {};
    allAssets.forEach(a => {
      const c = a.criticality || 'medium';
      byCriticality[c] = (byCriticality[c] || 0) + 1;
    });

    // By data classification
    const byClassification: Record<string, number> = {};
    allAssets.forEach(a => {
      const c = a.data_classification || 'unclassified';
      byClassification[c] = (byClassification[c] || 0) + 1;
    });

    // Untagged count (assets without environment tag)
    const untaggedAssets = allAssets.filter(a => !a.environment).length;

    // Get cloud accounts count
    const { data: accounts } = await supabase
      .from('cloud_accounts')
      .select('id, provider, status')
      .eq('org_id', orgId);

    const connectedAccounts = (accounts || []).filter(a => a.status === 'connected').length;

    // Get latest discovery job
    const { data: lastJob } = await supabase
      .from('discovery_jobs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      data: {
        summary: {
          total_assets: totalAssets,
          active_assets: activeAssets,
          stale_assets: staleAssets,
          exposed_assets: exposedAssets,
          untagged_assets: untaggedAssets,
          connected_accounts: connectedAccounts,
          total_accounts: (accounts || []).length,
        },
        by_service: Object.entries(byService).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        by_resource_type: Object.entries(byResourceType).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        by_region: Object.entries(byRegion).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        by_environment: Object.entries(byEnvironment).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        by_criticality: Object.entries(byCriticality).map(([name, count]) => ({ name, count })),
        by_classification: Object.entries(byClassification).map(([name, count]) => ({ name, count })),
        last_sync: lastJob || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
