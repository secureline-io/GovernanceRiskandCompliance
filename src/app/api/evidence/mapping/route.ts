import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/evidence/mapping - evidence reuse and control gap analysis
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Fetch evidence with control linkages
    const { data: evidence, error: e1 } = await supabase
      .from('evidence')
      .select('id, title, evidence_control_links(id, controls(id, code, name))')
      .eq('org_id', orgId);

    // Fetch all controls with framework mappings
    const { data: controls, error: e2 } = await supabase
      .from('controls')
      .select('id, code, name, evidence_control_links(id), control_requirement_mappings(framework_requirements(framework_id, frameworks(id, name)))')
      .eq('org_id', orgId);

    // Fetch framework requirement counts
    const { data: frameworks, error: e3 } = await supabase
      .from('frameworks')
      .select('id, name, framework_requirements(id)');

    if (e1 || e2 || e3) {
      console.error('Error fetching mapping:', e1 || e2 || e3);
      return NextResponse.json({ error: 'Failed to fetch mapping' }, { status: 500 });
    }

    // Build evidence reuse array
    const evidenceReuse = (evidence || []).map((e: any) => {
      const linkedFrameworks = new Set<string>();
      (e.evidence_control_links || []).forEach((ecl: any) => {
        (ecl.controls?.control_requirement_mappings || []).forEach((crm: any) => {
          (crm.framework_requirements?.frameworks || []).forEach((f: any) => {
            linkedFrameworks.add(f.name);
          });
        });
      });
      return {
        evidence_id: e.id,
        title: e.title,
        linked_controls: e.evidence_control_links?.length || 0,
        linked_frameworks: Array.from(linkedFrameworks)
      };
    });

    // Build ungapped controls (controls with evidence)
    const ungappedControls = (controls || []).map((c: any) => ({
      control_id: c.id,
      code: c.code,
      name: c.name,
      has_evidence: (c.evidence_control_links?.length || 0) > 0,
      evidence_source: c.evidence_control_links?.length ? 'manual' : 'none'
    }));

    // Framework coverage
    const frameworkCoverage = (frameworks || []).map((f: any) => {
      const totalReqs = f.framework_requirements?.length || 0;
      const coveredReqs = f.framework_requirements?.filter((req: any) =>
        controls?.some((c: any) =>
          c.control_requirement_mappings?.some((crm: any) => crm.framework_requirements?.id === req.id)
        )
      ).length || 0;
      return {
        framework_id: f.id,
        name: f.name,
        total_requirements: totalReqs,
        covered: coveredReqs,
        coverage_pct: totalReqs > 0 ? Math.round((coveredReqs / totalReqs) * 100) : 0
      };
    });

    return NextResponse.json({
      data: {
        evidence_reuse: evidenceReuse,
        ungapped_controls: ungappedControls,
        framework_coverage: frameworkCoverage
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
