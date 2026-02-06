import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getControls } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required (org_id)' },
        { status: 400 }
      );
    }

    const controls = await getControls(orgId);
    return NextResponse.json({ data: controls });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch controls' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { org_id, code, name, description, category, control_type, control_nature, frequency, status, owner_id, implementation_details } = body;

    if (!org_id || !code || !name) {
      return NextResponse.json(
        { error: 'org_id, code, and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('controls')
      .insert({
        org_id,
        code: code.toUpperCase(),
        name,
        description: description || null,
        category: category || null,
        control_type: control_type || 'preventive',
        control_nature: control_nature || 'manual',
        frequency: frequency || null,
        status: status || 'not_tested',
        owner_id: owner_id || user?.id || null,
        implementation_details: implementation_details || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A control with this code already exists in this organization' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'control.created',
        p_resource_type: 'control',
        p_resource_id: data.id,
        p_changes: { new: data },
      });
    } catch (e) {
      // Non-critical - don't fail the request
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create control' },
      { status: 500 }
    );
  }
}
