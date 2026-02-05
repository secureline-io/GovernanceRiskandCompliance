import { NextResponse } from 'next/server';
import { getFindings } from '@/lib/supabase/server';

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

    const findings = await getFindings(orgId);
    return NextResponse.json(findings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch findings' },
      { status: 500 }
    );
  }
}
