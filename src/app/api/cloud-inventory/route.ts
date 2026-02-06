import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/supabase/server';

// GET /api/cloud-inventory - List cloud assets with filters
export async function GET(request: NextRequest) {
  try {
    const { client: supabase } = await getWriteClient();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('org_id');
    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Build query with filters
    let query = supabase
      .from('assets')
      .select('*')
      .eq('org_id', orgId)
      .order('last_seen_at', { ascending: false });

    // Apply filters
    const service = searchParams.get('service');
    if (service) query = query.eq('service', service);

    const provider = searchParams.get('provider');
    if (provider) query = query.eq('provider', provider);

    const region = searchParams.get('region');
    if (region) query = query.eq('region', region);

    const environment = searchParams.get('environment');
    if (environment) query = query.eq('environment', environment);

    const criticality = searchParams.get('criticality');
    if (criticality) query = query.eq('criticality', criticality);

    const lifecycle = searchParams.get('lifecycle_state');
    if (lifecycle) query = query.eq('lifecycle_state', lifecycle);

    const exposed = searchParams.get('internet_exposed');
    if (exposed === 'true') query = query.eq('internet_exposed', true);
    if (exposed === 'false') query = query.eq('internet_exposed', false);

    const classification = searchParams.get('data_classification');
    if (classification) query = query.eq('data_classification', classification);

    const accountId = searchParams.get('account_id');
    if (accountId) query = query.eq('account_id', accountId);

    const resourceType = searchParams.get('resource_type');
    if (resourceType) query = query.eq('resource_type', resourceType);

    // Search by name or ARN
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`resource_name.ilike.%${search}%,resource_arn.ilike.%${search}%,resource_id.ilike.%${search}%`);
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: assets, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      data: assets || [],
      pagination: {
        page,
        limit,
        total: count || (assets?.length || 0),
        totalPages: Math.ceil((count || assets?.length || 0) / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch assets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
