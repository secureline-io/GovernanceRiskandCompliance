import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/incidents/[id]/timeline - list timeline events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('incident_timeline')
      .select('*')
      .eq('incident_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching timeline:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/incidents/[id]/timeline - add timeline event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { event_type, description, author } = body;

    if (!event_type || !description) {
      return NextResponse.json({ error: 'event_type and description are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('incident_timeline')
      .insert({
        incident_id: id,
        event_type,
        description,
        author: author || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
