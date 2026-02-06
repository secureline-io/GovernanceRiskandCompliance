import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/frameworks/[id]/domains - Get all domains for a framework
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get domains with requirement counts
    const { data: domains, error } = await supabase
      .from('framework_domains')
      .select(`
        *,
        framework_requirements(count)
      `)
      .eq('framework_id', id)
      .order('display_order');

    if (error) {
      console.error('Error fetching domains:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: domains });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
