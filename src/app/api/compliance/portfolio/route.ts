import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/compliance/portfolio?org_id=&framework_ids=id1,id2,id3
// Calls the calculate_portfolio_coverage database function
// Also returns:
// - overlapping UCF controls (mapped to 2+ of the selected frameworks)
// - gaps (requirements with no mapping)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const frameworkIdsParam = searchParams.get('framework_ids');

    if (!orgId) {
      return NextResponse.json(
        { error: 'org_id query parameter is required' },
        { status: 400 }
      );
    }

    if (!frameworkIdsParam) {
      return NextResponse.json(
        { error: 'framework_ids query parameter is required (comma-separated)' },
        { status: 400 }
      );
    }

    const frameworkIds = frameworkIdsParam.split(',').map(id => id.trim()).filter(Boolean);

    if (frameworkIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one framework_id is required' },
        { status: 400 }
      );
    }

    // Call the calculate_portfolio_coverage RPC
    let portfolioCoverage = null;
    try {
      const { data: coverageData, error: rpcError } = await supabase
        .rpc('calculate_portfolio_coverage', {
          p_org_id: orgId,
          p_framework_ids: frameworkIds,
        });

      if (rpcError) {
        console.error('Error calling calculate_portfolio_coverage:', rpcError);
      } else {
        portfolioCoverage = coverageData;
      }
    } catch (e) {
      console.error('calculate_portfolio_coverage RPC not available:', e);
    }

    // Find overlapping UCF controls (mapped to 2+ of the selected frameworks)
    const { data: allMappings, error: mappingsError } = await supabase
      .from('ucf_requirement_mappings')
      .select(`
        ucf_control_id,
        ucf_controls(id, code, title, category),
        framework_requirements(
          id,
          code,
          title,
          framework_id,
          frameworks(id, code, name)
        )
      `)
      .in('framework_requirements.framework_id', frameworkIds);

    if (mappingsError) {
      console.error('Error fetching UCF mappings:', mappingsError);
      return NextResponse.json({ error: mappingsError.message }, { status: 500 });
    }

    // Group by UCF control and count unique frameworks
    const ucfControlFrameworks: Record<string, {
      ucf_control: any;
      frameworks: Set<string>;
      framework_details: Map<string, any>;
    }> = {};

    (allMappings || []).forEach((mapping: any) => {
      const req = mapping.framework_requirements;
      if (!req || !req.frameworks) return;

      const ucfId = mapping.ucf_control_id;
      if (!ucfControlFrameworks[ucfId]) {
        ucfControlFrameworks[ucfId] = {
          ucf_control: mapping.ucf_controls,
          frameworks: new Set(),
          framework_details: new Map(),
        };
      }

      const fwId = req.framework_id;
      ucfControlFrameworks[ucfId].frameworks.add(fwId);
      ucfControlFrameworks[ucfId].framework_details.set(fwId, {
        id: req.frameworks.id,
        code: req.frameworks.code,
        name: req.frameworks.name,
      });
    });

    // Filter to only UCF controls mapped to 2+ of the selected frameworks
    const overlapping_controls = Object.values(ucfControlFrameworks)
      .filter(entry => entry.frameworks.size >= 2)
      .map(entry => ({
        ucf_control: entry.ucf_control,
        frameworks_count: entry.frameworks.size,
        frameworks: Array.from(entry.framework_details.values()),
      }))
      .sort((a, b) => b.frameworks_count - a.frameworks_count);

    // Find gaps: requirements in selected frameworks with no UCF mapping
    const { data: allRequirements, error: reqError } = await supabase
      .from('framework_requirements')
      .select(`
        id,
        code,
        title,
        category,
        is_mandatory,
        framework_id,
        frameworks(id, code, name)
      `)
      .in('framework_id', frameworkIds);

    if (reqError) {
      console.error('Error fetching requirements:', reqError);
      return NextResponse.json({ error: reqError.message }, { status: 500 });
    }

    // Get all requirement IDs that have UCF mappings
    const { data: mappedReqIds, error: mappedError } = await supabase
      .from('ucf_requirement_mappings')
      .select('requirement_id');

    if (mappedError) {
      console.error('Error fetching mapped requirement IDs:', mappedError);
      return NextResponse.json({ error: mappedError.message }, { status: 500 });
    }

    const mappedSet = new Set((mappedReqIds || []).map((m: any) => m.requirement_id));

    const gaps = (allRequirements || [])
      .filter((req: any) => !mappedSet.has(req.id))
      .map((req: any) => ({
        requirement_id: req.id,
        code: req.code,
        title: req.title,
        category: req.category,
        is_mandatory: req.is_mandatory,
        framework: req.frameworks ? {
          id: req.frameworks.id,
          code: req.frameworks.code,
          name: req.frameworks.name,
        } : null,
      }));

    return NextResponse.json({
      data: {
        org_id: orgId,
        framework_ids: frameworkIds,
        portfolio_coverage: portfolioCoverage,
        overlapping_controls,
        overlapping_controls_count: overlapping_controls.length,
        gaps,
        gaps_count: gaps.length,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate portfolio coverage' },
      { status: 500 }
    );
  }
}
