import { NextResponse } from 'next/server';
import { getControls } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const controls = await getControls(orgId);
    return NextResponse.json(controls);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch controls' },
      { status: 500 }
    );
  }
}
