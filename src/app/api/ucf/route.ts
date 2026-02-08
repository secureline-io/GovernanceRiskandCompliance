import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/ucf - List all UCF controls
// Supports ?category= filter
// Returns controls with mapped_requirements_count and frameworks_impacted
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Fetch all UCF controls with their requirement mappings
    let query = supabase
      .from('ucf_controls')
      .select(`
        *,
        ucf_requirement_mappings(
          id,
          framework_requirements(
            id,
            code,
            frameworks(id, code, name)
          )
        )
      `)
      .order('code');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: controls, error } = await query;

    if (error) {
      console.error('Error fetching UCF controls:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich each control with mapped_requirements_count and frameworks_impacted
    const enriched = (controls || []).map((control: any) => {
      const mappings = control.ucf_requirement_mappings || [];
      const mapped_requirements_count = mappings.length;

      const frameworkSet = new Set<string>();
      mappings.forEach((mapping: any) => {
        const fw = mapping.framework_requirements?.frameworks;
        if (fw?.code) {
          frameworkSet.add(fw.code);
        }
      });

      // Remove the raw mappings from the response to keep it clean
      const { ucf_requirement_mappings, ...rest } = control;

      return {
        ...rest,
        mapped_requirements_count,
        frameworks_impacted: Array.from(frameworkSet),
      };
    });

    return NextResponse.json({ data: enriched });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch UCF controls' },
      { status: 500 }
    );
  }
}

// POST /api/ucf - Create UCF control (admin only)
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const { code, title, description, category, objective, guidance, testing_procedures } = body;

    if (!code || !title) {
      return NextResponse.json(
        { error: 'code and title are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ucf_controls')
      .insert({
        code: code.toUpperCase(),
        title,
        description: description || null,
        category: category || null,
        objective: objective || null,
        guidance: guidance || null,
        testing_procedures: testing_procedures || null,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A UCF control with this code already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating UCF control:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: null,
        p_action: 'ucf_control.created',
        p_resource_type: 'ucf_controls',
        p_resource_id: data.id,
        p_changes: { new: data },
      });
    } catch (e) {
      // Non-critical - don't fail the request
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create UCF control' },
      { status: 500 }
    );
  }
}
