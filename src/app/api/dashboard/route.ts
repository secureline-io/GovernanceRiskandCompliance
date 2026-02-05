import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/dashboard - Get dashboard summary for an organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Fetch all dashboard data in parallel
    const [
      controlStatsResult,
      riskStatsResult,
      findingsResult,
      evidenceResult,
      frameworksResult,
      recentActivityResult,
      vendorsResult,
      tasksResult
    ] = await Promise.all([
      // Control status summary
      supabase.rpc('get_control_status_summary', { p_org_id: orgId }),

      // Risk counts by severity
      supabase.rpc('get_risks_by_severity', { p_org_id: orgId }),

      // Open findings by severity
      supabase
        .from('findings')
        .select('severity')
        .eq('org_id', orgId)
        .eq('status', 'open'),

      // Evidence count and recent
      supabase
        .from('evidence')
        .select('id, collected_at')
        .eq('org_id', orgId)
        .order('collected_at', { ascending: false })
        .limit(100),

      // Framework compliance status
      supabase
        .from('mv_compliance_summary')
        .select('*')
        .eq('org_id', orgId),

      // Recent audit logs
      supabase
        .from('audit_logs')
        .select('id, action, resource_type, occurred_at, user_id')
        .eq('org_id', orgId)
        .order('occurred_at', { ascending: false })
        .limit(10),

      // Vendor stats
      supabase
        .from('vendors')
        .select('id, risk_level, last_assessed_at')
        .eq('org_id', orgId)
        .eq('status', 'active'),

      // Open tasks
      supabase
        .from('evidence_tasks')
        .select('id, status, priority, due_date')
        .eq('org_id', orgId)
        .in('status', ['open', 'in_progress'])
    ]);

    // Process control stats
    const controlStats = controlStatsResult.data?.[0] || {
      total_controls: 0,
      compliant: 0,
      non_compliant: 0,
      not_tested: 0
    };

    // Process findings by severity
    const findings = findingsResult.data || [];
    const findingsBySeverity = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      total: findings.length
    };

    // Process vendor stats
    const vendors = vendorsResult.data || [];
    const unassessedVendors = vendors.filter(v => !v.last_assessed_at).length;
    const highRiskVendors = vendors.filter(v =>
      v.risk_level === 'high' || v.risk_level === 'critical'
    ).length;

    // Calculate compliance percentage
    const compliancePercentage = controlStats.total_controls > 0
      ? Math.round((controlStats.compliant / controlStats.total_controls) * 100)
      : 0;

    // Process tasks
    const tasks = tasksResult.data || [];
    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < new Date()
    ).length;

    // Evidence stats
    const evidenceItems = evidenceResult.data || [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEvidence = evidenceItems.filter(
      e => new Date(e.collected_at) > thirtyDaysAgo
    ).length;

    return NextResponse.json({
      data: {
        compliance: {
          percentage: compliancePercentage,
          controls: controlStats,
          frameworks: frameworksResult.data || []
        },
        risks: {
          by_severity: riskStatsResult.data || [],
          open_count: (riskStatsResult.data || []).reduce(
            (sum: number, r: { count: number }) => sum + r.count, 0
          )
        },
        findings: findingsBySeverity,
        evidence: {
          total: evidenceItems.length,
          recent_30_days: recentEvidence
        },
        vendors: {
          total: vendors.length,
          unassessed: unassessedVendors,
          high_risk: highRiskVendors
        },
        tasks: {
          open: tasks.length,
          overdue: overdueTasks
        },
        recent_activity: recentActivityResult.data || []
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
