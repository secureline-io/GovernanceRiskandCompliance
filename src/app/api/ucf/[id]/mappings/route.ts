import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/ucf/:id/mappings - Get all requirement mappings for this UCF control, grouped by framework
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Verify the UCF control exists
    const { data: control, error: controlError } = await supabase
      .from('ucf_controls')
      .select('id, code, title')
      .eq('id', id)
      .single();

    if (controlError) {
      if (controlError.code === 'PGRST116') {
        return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
      }
      console.error('Error fetching UCF control:', controlError);
      return NextResponse.json({ error: controlError.message }, { status: 500 });
    }

    // Fetch all mappings with their framework requirements and framework info
    const { data: mappings, error } = await supabase
      .from('ucf_requirement_mappings')
      .select(`
        id,
        mapping_strength,
        mapping_notes,
        created_at,
        framework_requirements(
          id,
          code,
          title,
          description,
          category,
          is_mandatory,
          frameworks(id, code, name, category)
        )
      `)
      .eq('ucf_control_id', id)
      .order('created_at');

    if (error) {
      console.error('Error fetching mappings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group mappings by framework
    const frameworkGroups: Record<string, {
      framework: any;
      requirements: any[];
    }> = {};

    (mappings || []).forEach((mapping: any) => {
      const req = mapping.framework_requirements;
      if (!req || !req.frameworks) return;

      const fw = req.frameworks;
      const fwId = fw.id;

      if (!frameworkGroups[fwId]) {
        frameworkGroups[fwId] = {
          framework: {
            id: fw.id,
            code: fw.code,
            name: fw.name,
            category: fw.category,
          },
          requirements: [],
        };
      }

      frameworkGroups[fwId].requirements.push({
        mapping_id: mapping.id,
        mapping_strength: mapping.mapping_strength,
        mapping_notes: mapping.mapping_notes,
        requirement: {
          id: req.id,
          code: req.code,
          title: req.title,
          description: req.description,
          category: req.category,
          is_mandatory: req.is_mandatory,
        },
      });
    });

    return NextResponse.json({
      data: {
        ucf_control: control,
        total_mappings: mappings?.length || 0,
        frameworks: Object.values(frameworkGroups),
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ucf/:id/mappings - Add mapping { requirement_id, mapping_strength, mapping_notes }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    const { requirement_id, mapping_strength, mapping_notes } = body;

    if (!requirement_id) {
      return NextResponse.json(
        { error: 'requirement_id is required' },
        { status: 400 }
      );
    }

    // Verify the UCF control exists
    const { data: control, error: controlError } = await supabase
      .from('ucf_controls')
      .select('id')
      .eq('id', id)
      .single();

    if (controlError || !control) {
      return NextResponse.json({ error: 'UCF control not found' }, { status: 404 });
    }

    // Verify the framework requirement exists
    const { data: requirement, error: reqError } = await supabase
      .from('framework_requirements')
      .select('id')
      .eq('id', requirement_id)
      .single();

    if (reqError || !requirement) {
      return NextResponse.json({ error: 'Framework requirement not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('ucf_requirement_mappings')
      .insert({
        ucf_control_id: id,
        requirement_id,
        mapping_strength: mapping_strength || 'strong',
        mapping_notes: mapping_notes || null,
        created_by: user?.id || null,
      })
      .select(`
        id,
        mapping_strength,
        mapping_notes,
        created_at,
        framework_requirements(
          id,
          code,
          title,
          frameworks(id, code, name)
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This requirement is already mapped to this UCF control' },
          { status: 409 }
        );
      }
      console.error('Error creating mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: null,
        p_action: 'ucf_mapping.created',
        p_resource_type: 'ucf_requirement_mappings',
        p_resource_id: data.id,
        p_changes: { new: data },
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create mapping' },
      { status: 500 }
    );
  }
}

// DELETE /api/ucf/:id/mappings - Remove mapping { requirement_id }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id } = await params;
    const body = await request.json();

    const { requirement_id } = body;

    if (!requirement_id) {
      return NextResponse.json(
        { error: 'requirement_id is required' },
        { status: 400 }
      );
    }

    // Get the mapping for audit logging
    const { data: mapping } = await supabase
      .from('ucf_requirement_mappings')
      .select('*')
      .eq('ucf_control_id', id)
      .eq('requirement_id', requirement_id)
      .single();

    if (!mapping) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('ucf_requirement_mappings')
      .delete()
      .eq('ucf_control_id', id)
      .eq('requirement_id', requirement_id);

    if (error) {
      console.error('Error deleting mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: null,
        p_action: 'ucf_mapping.deleted',
        p_resource_type: 'ucf_requirement_mappings',
        p_resource_id: mapping.id,
        p_changes: { deleted: mapping },
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete mapping' },
      { status: 500 }
    );
  }
}
