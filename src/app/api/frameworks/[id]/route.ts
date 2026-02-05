import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/frameworks/[id] - Get framework details with requirements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Fetch framework with requirements
    const { data: framework, error } = await supabase
      .from('frameworks')
      .select(`
        *,
        framework_requirements(
          id,
          code,
          title,
          description,
          category,
          is_mandatory,
          sort_order,
          typical_evidence_types
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
      }
      console.error('Error fetching framework:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: framework });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/frameworks/[id] - Update a custom framework
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow updating custom frameworks
    const { data: existing } = await supabase
      .from('frameworks')
      .select('is_custom')
      .eq('id', id)
      .single();

    if (!existing?.is_custom) {
      return NextResponse.json(
        { error: 'Cannot modify built-in frameworks' },
        { status: 403 }
      );
    }

    const { data: framework, error } = await supabase
      .from('frameworks')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating framework:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: framework });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/frameworks/[id] - Delete a custom framework
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow deleting custom frameworks
    const { data: existing } = await supabase
      .from('frameworks')
      .select('is_custom')
      .eq('id', id)
      .single();

    if (!existing?.is_custom) {
      return NextResponse.json(
        { error: 'Cannot delete built-in frameworks' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('frameworks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting framework:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
