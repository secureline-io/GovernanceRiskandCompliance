import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/risks/[id]/treatments - List treatments for a risk
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: riskId } = await params;

    const { data: treatments, error } = await supabase
      .from('risk_treatments')
      .select('*')
      .eq('risk_id', riskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching treatments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: treatments });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/risks/[id]/treatments - Create a treatment plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const { id: riskId } = await params;
    const body = await request.json();

    const {
      action,
      description,
      due_date,
      cost_estimate,
      responsible_user_id
    } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required (mitigate, transfer, accept, avoid)' },
        { status: 400 }
      );
    }

    const { data: treatment, error } = await supabase
      .from('risk_treatments')
      .insert({
        risk_id: riskId,
        action,
        description,
        due_date,
        cost_estimate,
        responsible_user_id: responsible_user_id || user?.id || null,
        status: 'not_started'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating treatment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update risk response if not already set
    await supabase
      .from('risks')
      .update({ risk_response: action })
      .eq('id', riskId)
      .is('risk_response', null);

    return NextResponse.json({ data: treatment }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
