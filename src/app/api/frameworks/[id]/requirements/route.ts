import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/frameworks/[id]/requirements - Get all requirements for a framework
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get requirements with domain information
    const { data: requirements, error } = await supabase
      .from('framework_requirements')
      .select(`
        *,
        domain:framework_domains(id, code, name)
      `)
      .eq('framework_id', id)
      .order('display_order');

    if (error) {
      console.error('Error fetching requirements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: requirements });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
