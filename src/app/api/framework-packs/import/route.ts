import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/supabase/server';

// POST /api/framework-packs/import - Import a JSON framework pack
// Body structure:
// {
//   framework: { code, name, description, category, version, ... },
//   requirements: [{ code, title, description, category, parent_code, is_mandatory, sort_order, typical_evidence_types }],
//   ucf_mappings: [{ ucf_control_code, requirement_code, mapping_strength, mapping_notes }]
// }
//
// Steps:
// 1. Upsert framework (by code)
// 2. Insert requirements (resolve parent_code -> parent_id)
// 3. Create ucf_requirement_mappings (match by ucf_control_code and requirement code)
// 4. Record in framework_packs table
// 5. Return import summary
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const { framework, requirements, ucf_mappings } = body;

    if (!framework || !framework.code || !framework.name) {
      return NextResponse.json(
        { error: 'framework object with code and name is required' },
        { status: 400 }
      );
    }

    const summary = {
      framework_upserted: false,
      framework_id: null as string | null,
      requirements_inserted: 0,
      requirements_skipped: 0,
      ucf_mappings_created: 0,
      ucf_mappings_skipped: 0,
      errors: [] as string[],
    };

    // Step 1: Upsert framework by code
    const { data: existingFramework } = await supabase
      .from('frameworks')
      .select('id')
      .eq('code', framework.code)
      .single();

    let frameworkId: string;

    if (existingFramework) {
      // Update existing framework
      const { data: updatedFw, error: updateError } = await supabase
        .from('frameworks')
        .update({
          name: framework.name,
          description: framework.description || null,
          category: framework.category || null,
          version: framework.version || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingFramework.id)
        .select()
        .single();

      if (updateError) {
        summary.errors.push(`Framework update failed: ${updateError.message}`);
        return NextResponse.json({ error: 'Failed to update framework', summary }, { status: 500 });
      }

      frameworkId = updatedFw.id;
      summary.framework_upserted = true;
      summary.framework_id = frameworkId;
    } else {
      // Insert new framework
      const { data: newFw, error: insertError } = await supabase
        .from('frameworks')
        .insert({
          code: framework.code,
          name: framework.name,
          description: framework.description || null,
          category: framework.category || null,
          version: framework.version || null,
          is_custom: false,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (insertError) {
        summary.errors.push(`Framework insert failed: ${insertError.message}`);
        return NextResponse.json({ error: 'Failed to create framework', summary }, { status: 500 });
      }

      frameworkId = newFw.id;
      summary.framework_upserted = true;
      summary.framework_id = frameworkId;
    }

    // Step 2: Insert requirements (resolve parent_code -> parent_id)
    // First pass: insert requirements without parent_id, building a code->id map
    const requirementCodeToId: Record<string, string> = {};

    if (requirements && Array.isArray(requirements)) {
      // Sort requirements so parents come before children (those without parent_code first)
      const sorted = [...requirements].sort((a, b) => {
        if (!a.parent_code && b.parent_code) return -1;
        if (a.parent_code && !b.parent_code) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });

      for (const req of sorted) {
        if (!req.code || !req.title) {
          summary.requirements_skipped++;
          summary.errors.push(`Skipped requirement with missing code or title`);
          continue;
        }

        // Check if this requirement already exists for this framework
        const { data: existingReq } = await supabase
          .from('framework_requirements')
          .select('id')
          .eq('framework_id', frameworkId)
          .eq('code', req.code)
          .single();

        if (existingReq) {
          // Already exists, record the mapping and skip
          requirementCodeToId[req.code] = existingReq.id;
          summary.requirements_skipped++;
          continue;
        }

        // Resolve parent_code to parent_id
        let parentId = null;
        if (req.parent_code && requirementCodeToId[req.parent_code]) {
          parentId = requirementCodeToId[req.parent_code];
        }

        const { data: newReq, error: reqError } = await supabase
          .from('framework_requirements')
          .insert({
            framework_id: frameworkId,
            code: req.code,
            title: req.title,
            description: req.description || null,
            category: req.category || null,
            parent_id: parentId,
            is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
            sort_order: req.sort_order || null,
            display_order: req.sort_order || null,
            typical_evidence_types: req.typical_evidence_types || null,
          })
          .select('id')
          .single();

        if (reqError) {
          summary.requirements_skipped++;
          summary.errors.push(`Requirement ${req.code}: ${reqError.message}`);
          continue;
        }

        requirementCodeToId[req.code] = newReq.id;
        summary.requirements_inserted++;
      }
    }

    // Step 3: Create ucf_requirement_mappings (match by ucf_control_code and requirement code)
    if (ucf_mappings && Array.isArray(ucf_mappings)) {
      for (const mapping of ucf_mappings) {
        if (!mapping.ucf_control_code || !mapping.requirement_code) {
          summary.ucf_mappings_skipped++;
          summary.errors.push('Skipped UCF mapping with missing ucf_control_code or requirement_code');
          continue;
        }

        // Resolve ucf_control_code to ucf_control_id
        const { data: ucfControl } = await supabase
          .from('ucf_controls')
          .select('id')
          .eq('code', mapping.ucf_control_code)
          .single();

        if (!ucfControl) {
          summary.ucf_mappings_skipped++;
          summary.errors.push(`UCF control not found: ${mapping.ucf_control_code}`);
          continue;
        }

        // Resolve requirement_code to requirement_id
        const requirementId = requirementCodeToId[mapping.requirement_code];
        if (!requirementId) {
          // Try to look up in the database directly
          const { data: reqLookup } = await supabase
            .from('framework_requirements')
            .select('id')
            .eq('framework_id', frameworkId)
            .eq('code', mapping.requirement_code)
            .single();

          if (!reqLookup) {
            summary.ucf_mappings_skipped++;
            summary.errors.push(`Requirement not found: ${mapping.requirement_code}`);
            continue;
          }

          requirementCodeToId[mapping.requirement_code] = reqLookup.id;
        }

        const resolvedReqId = requirementCodeToId[mapping.requirement_code];

        // Check if mapping already exists
        const { data: existingMapping } = await supabase
          .from('ucf_requirement_mappings')
          .select('id')
          .eq('ucf_control_id', ucfControl.id)
          .eq('requirement_id', resolvedReqId)
          .single();

        if (existingMapping) {
          summary.ucf_mappings_skipped++;
          continue;
        }

        const { error: mappingError } = await supabase
          .from('ucf_requirement_mappings')
          .insert({
            ucf_control_id: ucfControl.id,
            requirement_id: resolvedReqId,
            mapping_strength: mapping.mapping_strength || 'strong',
            mapping_notes: mapping.mapping_notes || null,
            created_by: user?.id || null,
          });

        if (mappingError) {
          summary.ucf_mappings_skipped++;
          summary.errors.push(`UCF mapping ${mapping.ucf_control_code}->${mapping.requirement_code}: ${mappingError.message}`);
          continue;
        }

        summary.ucf_mappings_created++;
      }
    }

    // Step 4: Record in framework_packs table
    try {
      await supabase
        .from('framework_packs')
        .insert({
          framework_id: frameworkId,
          pack_version: framework.version || '1.0.0',
          imported_by: user?.id || null,
          import_summary: summary,
          requirements_count: summary.requirements_inserted + summary.requirements_skipped,
          ucf_mappings_count: summary.ucf_mappings_created,
        });
    } catch (e) {
      // Non-critical - pack tracking is informational
      summary.errors.push('Failed to record framework pack import (non-critical)');
    }

    // Step 5: Return import summary
    return NextResponse.json({
      data: {
        message: 'Framework pack imported successfully',
        summary,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error during framework pack import:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import framework pack' },
      { status: 500 }
    );
  }
}
