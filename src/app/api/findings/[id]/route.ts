import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/findings/[id] - Get a single finding
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: finding, error } = await supabase
      .from('findings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data: finding });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch finding';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/findings/[id] - Update a finding
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { client: supabase } = await getWriteClient();
    const body = await request.json();

    // Remove id from update body if present
    const { id: _id, ...updateData } = body;

    const { data: finding, error } = await supabase
      .from('findings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating finding:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event (non-critical)
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: finding.org_id,
        p_action: 'update',
        p_resource_type: 'findings',
        p_resource_id: id,
        p_changes: { update: updateData },
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ data: finding });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update finding';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
