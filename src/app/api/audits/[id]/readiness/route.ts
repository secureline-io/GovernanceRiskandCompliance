import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/audits/[id]/readiness - list readiness items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || undefined;

    let query = supabase
      .from('audit_readiness_items')
      .select('*')
      .eq('audit_id', id)
      .order('created_at', { ascending: false });

    if (orgId) query = query.eq('org_id', orgId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching readiness items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/audits/[id]/readiness - create readiness checklist item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();

    const { id } = await params;
    const body = await request.json();
    const { org_id, title, category, assigned_to, due_date, notes } = body;

    if (!org_id || !title || !category) {
      return NextResponse.json({ error: 'org_id, title and category are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('audit_readiness_items')
      .insert({
        audit_id: id,
        org_id,
        title,
        category,
        assigned_to: assigned_to || null,
        due_date: due_date || null,
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating readiness item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'readiness.created',
        p_resource_type: 'audit_readiness_items',
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
