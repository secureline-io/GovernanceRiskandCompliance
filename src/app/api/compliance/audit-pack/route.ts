import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/compliance/audit-pack?org_id=&framework_id=
// Returns JSON export with:
// - framework metadata
// - all requirements with status (covered/gap)
// - mapped controls with evidence counts
// - coverage statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const frameworkId = searchParams.get('framework_id');

    if (!orgId) {
      return NextResponse.json(
        { error: 'org_id query parameter is required' },
        { status: 400 }
      );
    }

    if (!frameworkId) {
      return NextResponse.json(
        { error: 'framework_id query parameter is required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch framework metadata
    const { data: framework, error: fwError } = await supabase
      .from('frameworks')
      .select('*')
      .eq('id', frameworkId)
      .single();

    if (fwError) {
      if (fwError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
      }
      console.error('Error fetching framework:', fwError);
      return NextResponse.json({ error: fwError.message }, { status: 500 });
    }

    // Step 2: Fetch all requirements for this framework
    const { data: requirements, error: reqError } = await supabase
      .from('framework_requirements')
      .select(`
        id,
        code,
        title,
        description,
        category,
        is_mandatory,
        sort_order,
        display_order,
        typical_evidence_types
      `)
      .eq('framework_id', frameworkId)
      .order('display_order');

    if (reqError) {
      console.error('Error fetching requirements:', reqError);
      return NextResponse.json({ error: reqError.message }, { status: 500 });
    }

    // Step 3: Fetch org's control-requirement mappings for this framework
    const { data: controlMappings, error: mappingError } = await supabase
      .from('control_requirement_mappings')
      .select(`
        id,
        coverage_percentage,
        mapping_notes,
        controls(
          id,
          code,
          name,
          description,
          category,
          status,
          control_type,
          control_nature,
          evidence_control_links(
            evidence(
              id,
              title,
              source,
              file_type,
              collected_at
            )
          )
        ),
        framework_requirements(id)
      `)
      .eq('controls.org_id', orgId)
      .in('requirement_id', (requirements || []).map((r: any) => r.id));

    if (mappingError) {
      console.error('Error fetching control mappings:', mappingError);
      return NextResponse.json({ error: mappingError.message }, { status: 500 });
    }

    // Also check UCF-based coverage: UCF controls -> UCF implementations (org controls)
    const { data: ucfMappings, error: ucfError } = await supabase
      .from('ucf_requirement_mappings')
      .select(`
        id,
        mapping_strength,
        ucf_controls(
          id,
          code,
          title,
          ucf_control_implementations(
            id,
            implementation_status,
            controls(
              id,
              code,
              name,
              status,
              evidence_control_links(
                evidence(
                  id,
                  title,
                  source,
                  file_type,
                  collected_at
                )
              )
            )
          )
        ),
        framework_requirements(id)
      `)
      .in('requirement_id', (requirements || []).map((r: any) => r.id));

    // Build a map of requirement_id -> coverage info
    const requirementCoverage: Record<string, {
      status: 'covered' | 'partial' | 'gap';
      controls: any[];
      total_evidence_count: number;
    }> = {};

    // Initialize all requirements as gaps
    (requirements || []).forEach((req: any) => {
      requirementCoverage[req.id] = {
        status: 'gap',
        controls: [],
        total_evidence_count: 0,
      };
    });

    // Process direct control-requirement mappings
    (controlMappings || []).forEach((mapping: any) => {
      const reqId = mapping.framework_requirements?.id;
      if (!reqId || !requirementCoverage[reqId]) return;

      const control = mapping.controls;
      if (!control) return;

      const evidenceCount = control.evidence_control_links?.length || 0;

      requirementCoverage[reqId].controls.push({
        control_id: control.id,
        code: control.code,
        name: control.name,
        status: control.status,
        coverage_percentage: mapping.coverage_percentage,
        evidence_count: evidenceCount,
        mapping_type: 'direct',
      });

      requirementCoverage[reqId].total_evidence_count += evidenceCount;
      requirementCoverage[reqId].status = mapping.coverage_percentage >= 100 ? 'covered' : 'partial';
    });

    // Process UCF-based mappings
    if (!ucfError && ucfMappings) {
      ucfMappings.forEach((mapping: any) => {
        const reqId = mapping.framework_requirements?.id;
        if (!reqId || !requirementCoverage[reqId]) return;

        const ucfControl = mapping.ucf_controls;
        if (!ucfControl) return;

        const implementations = ucfControl.ucf_control_implementations || [];
        implementations.forEach((impl: any) => {
          const control = impl.controls;
          if (!control) return;

          const evidenceCount = control.evidence_control_links?.length || 0;

          // Check if this control is already listed (avoid duplicates)
          const alreadyListed = requirementCoverage[reqId].controls.some(
            (c: any) => c.control_id === control.id
          );

          if (!alreadyListed) {
            requirementCoverage[reqId].controls.push({
              control_id: control.id,
              code: control.code,
              name: control.name,
              status: control.status,
              implementation_status: impl.implementation_status,
              evidence_count: evidenceCount,
              mapping_type: 'ucf',
              ucf_control: {
                id: ucfControl.id,
                code: ucfControl.code,
                title: ucfControl.title,
              },
              mapping_strength: mapping.mapping_strength,
            });

            requirementCoverage[reqId].total_evidence_count += evidenceCount;

            // Update status if this is the first coverage
            if (requirementCoverage[reqId].status === 'gap') {
              requirementCoverage[reqId].status = 'partial';
            }
          }
        });
      });
    }

    // Build the requirements list with status
    const requirementsWithStatus = (requirements || []).map((req: any) => {
      const coverage = requirementCoverage[req.id];
      return {
        ...req,
        coverage_status: coverage.status,
        mapped_controls: coverage.controls,
        evidence_count: coverage.total_evidence_count,
      };
    });

    // Calculate coverage statistics
    const totalRequirements = requirements?.length || 0;
    const coveredCount = Object.values(requirementCoverage).filter(c => c.status === 'covered').length;
    const partialCount = Object.values(requirementCoverage).filter(c => c.status === 'partial').length;
    const gapCount = Object.values(requirementCoverage).filter(c => c.status === 'gap').length;

    const mandatoryRequirements = (requirements || []).filter((r: any) => r.is_mandatory);
    const mandatoryTotal = mandatoryRequirements.length;
    const mandatoryCovered = mandatoryRequirements.filter(
      (r: any) => requirementCoverage[r.id]?.status === 'covered'
    ).length;
    const mandatoryPartial = mandatoryRequirements.filter(
      (r: any) => requirementCoverage[r.id]?.status === 'partial'
    ).length;

    const statistics = {
      total_requirements: totalRequirements,
      covered: coveredCount,
      partial: partialCount,
      gaps: gapCount,
      coverage_percentage: totalRequirements > 0
        ? Math.round(((coveredCount + partialCount * 0.5) / totalRequirements) * 100)
        : 0,
      mandatory: {
        total: mandatoryTotal,
        covered: mandatoryCovered,
        partial: mandatoryPartial,
        gaps: mandatoryTotal - mandatoryCovered - mandatoryPartial,
        coverage_percentage: mandatoryTotal > 0
          ? Math.round(((mandatoryCovered + mandatoryPartial * 0.5) / mandatoryTotal) * 100)
          : 0,
      },
    };

    // Build the audit pack export
    const auditPack = {
      generated_at: new Date().toISOString(),
      org_id: orgId,
      framework: {
        id: framework.id,
        code: framework.code,
        name: framework.name,
        description: framework.description,
        category: framework.category,
        version: framework.version,
      },
      statistics,
      requirements: requirementsWithStatus,
    };

    return NextResponse.json({ data: auditPack });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate audit pack' },
      { status: 500 }
    );
  }
}
