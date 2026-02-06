import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/vendors/[id] - Get vendor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(`
        *,
        vendor_assessments(
          id,
          assessment_date,
          assessment_type,
          questionnaire_template,
          score,
          risk_rating,
          summary,
          issues_count,
          documents,
          status,
          completed_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }
      console.error('Error fetching vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: vendor });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/vendors/[id] - Update a vendor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    // Get current state for audit log
    const { data: oldVendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    if (oldVendor) {
      await supabase.rpc('log_audit_event', {
        p_org_id: vendor.org_id,
        p_action: 'update',
        p_resource_type: 'vendors',
        p_resource_id: vendor.id,
        p_changes: { old: oldVendor, new: vendor }
      });
    }

    return NextResponse.json({ data: vendor });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vendors/[id] - Archive a vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;

    // Soft delete by setting status to 'inactive'
    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({ status: 'inactive' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    await supabase.rpc('log_audit_event', {
      p_org_id: vendor.org_id,
      p_action: 'archive',
      p_resource_type: 'vendors',
      p_resource_id: vendor.id,
      p_changes: { status: 'inactive' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
