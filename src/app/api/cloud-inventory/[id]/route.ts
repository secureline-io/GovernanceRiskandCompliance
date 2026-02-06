import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/supabase/server';

// GET /api/cloud-inventory/[id] - Get asset detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase } = await getWriteClient();
    const { id } = await params;

    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Get related findings
    const { data: findings } = await supabase
      .from('findings')
      .select('id, title, severity, status, first_detected_at')
      .eq('asset_id', id)
      .order('first_detected_at', { ascending: false })
      .limit(20);

    // Get overrides
    const { data: overrides } = await supabase
      .from('asset_overrides')
      .select('*')
      .eq('asset_id', id);

    return NextResponse.json({
      data: {
        ...asset,
        findings: findings || [],
        overrides: overrides || [],
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch asset';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/cloud-inventory/[id] - Update asset classification (manual override)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    // Only allow updating classification fields
    const allowedFields = ['criticality', 'environment', 'data_classification', 'team', 'internet_exposed', 'lifecycle_state'];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: asset, error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Record overrides
    for (const [field, value] of Object.entries(updateData)) {
      await supabase.from('asset_overrides').upsert(
        {
          asset_id: id,
          field_name: field,
          override_value: String(value),
          reason: body.reason || 'Manual override',
        },
        { onConflict: 'asset_id,field_name' }
      );
    }

    return NextResponse.json({ data: asset });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update asset';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
