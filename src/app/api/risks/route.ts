import { NextResponse } from 'next/server';
import { getRisks } from '@/lib/supabase/server';

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

    const risks = await getRisks(orgId);
    return NextResponse.json(risks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}
