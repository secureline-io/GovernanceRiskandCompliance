import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/vendors/[id]/assessments - List assessments for a vendor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: vendorId } = await params;

    const { data: assessments, error } = await supabase
      .from('vendor_assessments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('assessment_date', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: assessments });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vendors/[id]/assessments - Create a new assessment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: vendorId } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      assessment_type,
      questionnaire_template,
      summary,
      documents
    } = body;

    const { data: assessment, error } = await supabase
      .from('vendor_assessments')
      .insert({
        vendor_id: vendorId,
        assessment_date: new Date().toISOString().split('T')[0],
        assessment_type: assessment_type || 'initial',
        questionnaire_template,
        summary,
        documents,
        status: 'in_progress',
        assessor_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update vendor's last_assessed_at and next_assessment_date
    const nextAssessmentDate = new Date();
    nextAssessmentDate.setFullYear(nextAssessmentDate.getFullYear() + 1);

    await supabase
      .from('vendors')
      .update({
        last_assessed_at: new Date().toISOString(),
        next_assessment_date: nextAssessmentDate.toISOString().split('T')[0]
      })
      .eq('id', vendorId);

    return NextResponse.json({ data: assessment }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/vendors/[id]/assessments - Complete/update an assessment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: vendorId } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessment_id, score, risk_rating, summary, issues_count, status } = body;

    if (!assessment_id) {
      return NextResponse.json({ error: 'assessment_id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (score !== undefined) updateData.score = score;
    if (risk_rating) updateData.risk_rating = risk_rating;
    if (summary) updateData.summary = summary;
    if (issues_count !== undefined) updateData.issues_count = issues_count;
    if (status) updateData.status = status;
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    const { data: assessment, error } = await supabase
      .from('vendor_assessments')
      .update(updateData)
      .eq('id', assessment_id)
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating assessment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update vendor's risk_level based on assessment
    if (risk_rating) {
      await supabase
        .from('vendors')
        .update({ risk_level: risk_rating })
        .eq('id', vendorId);
    }

    return NextResponse.json({ data: assessment });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
