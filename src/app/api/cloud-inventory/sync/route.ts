import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/supabase/server';
import { discoverAWSAssets, extractEnvironment, extractTeam, extractDataClassification, determineCriticality, type DiscoveredAsset } from '@/lib/cloud/aws-discovery';
import { classifyAsset } from '@/lib/cloud/classifier';

// POST /api/cloud-inventory/sync - Trigger asset discovery sync
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const { org_id, cloud_account_id } = body;
    if (!org_id) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Get cloud account details
    let accounts;
    if (cloud_account_id) {
      const { data, error } = await supabase
        .from('cloud_accounts')
        .select('*')
        .eq('id', cloud_account_id)
        .eq('org_id', org_id)
        .single();
      if (error || !data) {
        return NextResponse.json({ error: 'Cloud account not found' }, { status: 404 });
      }
      accounts = [data];
    } else {
      // Sync all connected accounts
      const { data, error } = await supabase
        .from('cloud_accounts')
        .select('*')
        .eq('org_id', org_id)
        .eq('status', 'connected');
      if (error) throw error;
      accounts = data || [];
    }

    if (accounts.length === 0) {
      return NextResponse.json({ error: 'No connected cloud accounts found' }, { status: 400 });
    }

    const allResults = [];

    for (const account of accounts) {
      // Create discovery job record
      const { data: job, error: jobError } = await supabase
        .from('discovery_jobs')
        .insert({
          org_id,
          cloud_account_id: account.id,
          status: 'running',
          job_type: 'full',
          triggered_by: user?.id || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError) {
        console.error('Failed to create job:', jobError);
        continue;
      }

      try {
        // Run discovery
        const regions = account.regions?.length > 0
          ? account.regions
          : ['us-east-1', 'us-west-2', 'eu-west-1'];

        const result = await discoverAWSAssets(
          account.account_id,
          regions
        );

        // Upsert discovered assets
        let assetsDiscovered = 0;
        let assetsUpdated = 0;

        for (const discovered of result.assets) {
          const classification = classifyAsset(discovered);
          
          const assetData = {
            org_id,
            cloud_account_id: account.id,
            resource_id: discovered.resource_id,
            resource_type: discovered.resource_type,
            resource_name: discovered.resource_name,
            resource_arn: discovered.resource_arn,
            service: discovered.service,
            provider: discovered.provider,
            account_id: discovered.account_id,
            region: discovered.region,
            tags: discovered.tags,
            configuration: discovered.configuration,
            relationships: discovered.relationships,
            internet_exposed: discovered.internet_exposed,
            environment: classification.environment,
            team: classification.team,
            data_classification: classification.data_classification,
            criticality: classification.criticality,
            lifecycle_state: 'active',
            last_seen_at: new Date().toISOString(),
            status: 'active',
          };

          // Check if asset exists
          const { data: existing } = await supabase
            .from('assets')
            .select('id')
            .eq('org_id', org_id)
            .eq('resource_id', discovered.resource_id)
            .single();

          if (existing) {
            // Update existing
            await supabase
              .from('assets')
              .update({
                ...assetData,
                first_seen_at: undefined, // Don't overwrite first_seen
              })
              .eq('id', existing.id);
            assetsUpdated++;
          } else {
            // Insert new
            await supabase
              .from('assets')
              .insert({
                ...assetData,
                first_seen_at: new Date().toISOString(),
              });
            assetsDiscovered++;
          }
        }

        // Mark assets not seen in this scan as stale
        const { data: staleAssets } = await supabase
          .from('assets')
          .select('id')
          .eq('org_id', org_id)
          .eq('cloud_account_id', account.id)
          .lt('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const staleCount = staleAssets?.length || 0;
        if (staleCount > 0) {
          await supabase
            .from('assets')
            .update({ lifecycle_state: 'stale' })
            .eq('org_id', org_id)
            .eq('cloud_account_id', account.id)
            .lt('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        }

        // Update job as completed
        const completedAt = new Date().toISOString();
        await supabase
          .from('discovery_jobs')
          .update({
            status: 'completed',
            services_scanned: result.services_scanned,
            regions_scanned: result.regions_scanned,
            assets_discovered: assetsDiscovered,
            assets_updated: assetsUpdated,
            assets_stale: staleCount,
            errors: result.errors,
            completed_at: completedAt,
            duration_ms: result.duration_ms,
          })
          .eq('id', job.id);

        // Update cloud account stats
        const { count: totalAssets } = await supabase
          .from('assets')
          .select('id', { count: 'exact', head: true })
          .eq('cloud_account_id', account.id)
          .eq('lifecycle_state', 'active');

        await supabase
          .from('cloud_accounts')
          .update({
            last_scan_at: completedAt,
            total_assets: totalAssets || 0,
            discovered_regions: result.regions_scanned,
          })
          .eq('id', account.id);

        allResults.push({
          account_id: account.account_id,
          job_id: job.id,
          status: 'completed',
          assets_discovered: assetsDiscovered,
          assets_updated: assetsUpdated,
          assets_stale: staleCount,
          services_scanned: result.services_scanned.length,
          regions_scanned: result.regions_scanned.length,
          errors: result.errors.length,
          duration_ms: result.duration_ms,
        });
      } catch (err) {
        // Mark job as failed
        await supabase
          .from('discovery_jobs')
          .update({
            status: 'failed',
            errors: [{ error: err instanceof Error ? err.message : 'Unknown error' }],
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        allResults.push({
          account_id: account.account_id,
          job_id: job.id,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({ data: allResults });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
