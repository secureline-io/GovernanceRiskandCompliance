import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/evidence/[id] - Get evidence details (read-only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: evidence, error } = await supabase
      .from('evidence')
      .select(`
        *,
        evidence_control_links(
          linked_at,
          controls(
            id,
            code,
            name,
            status,
            category
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
      }
      console.error('Error fetching evidence:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log access for audit trail
    await supabase.rpc('log_audit_event', {
      p_org_id: evidence.org_id,
      p_action: 'access',
      p_resource_type: 'evidence',
      p_resource_id: evidence.id,
      p_changes: null
    });

    return NextResponse.json({ data: evidence });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Evidence is IMMUTABLE - no PATCH/PUT allowed
// The following endpoint is intentionally left out to enforce immutability

// DELETE is also restricted - evidence should be retained
// Only allowed for admin users and logs are kept
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'Evidence records are immutable and cannot be deleted' },
    { status: 403 }
  );
}
