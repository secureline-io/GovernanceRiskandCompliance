import { NextRequest, NextResponse } from 'next/server';
import { getFrameworks, createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/frameworks - List all frameworks
export async function GET() {
  try {
    const frameworks = await getFrameworks();
    return NextResponse.json({ data: frameworks });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch frameworks';
    console.error('Error fetching frameworks:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/frameworks - Create a custom framework
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, name, description, category } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    const { data: framework, error } = await supabase
      .from('frameworks')
      .insert({
        code,
        name,
        description,
        category,
        is_custom: true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating framework:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: framework }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
