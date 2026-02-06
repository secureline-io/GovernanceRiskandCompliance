import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/audits/[id] - get audit with findings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: audit, error } = await supabase
      .from('audits')
      .select(`*, audit_findings(*)`)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching audit:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: audit });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/audits/[id] - update audit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: oldAudit } = await supabase.from('audits').select('*').eq('id', id).single();

    const { data: audit, error } = await supabase
      .from('audits')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating audit:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (oldAudit) {
      await supabase.rpc('log_audit_event', {
        p_org_id: audit.org_id,
        p_action: 'update',
        p_resource_type: 'audits',
        p_resource_id: audit.id,
        p_changes: { old: oldAudit, new: audit }
      });
    }

    return NextResponse.json({ data: audit });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/audits/[id] - soft delete (set status closed)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: audit, error } = await supabase
      .from('audits')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error closing audit:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.rpc('log_audit_event', {
      p_org_id: audit.org_id,
      p_action: 'archive',
      p_resource_type: 'audits',
      p_resource_id: audit.id,
      p_changes: { status: 'closed' }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
