import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';

// GET /api/organizations - List organizations user has access to
export async function GET(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();

    if (user) {
      // Get organizations through membership
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          role,
          is_external_auditor,
          access_expires_at,
          organizations(
            id,
            name,
            slug,
            industry,
            stage,
            subscription_tier,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching organizations:', memberError);
        return NextResponse.json({ error: memberError.message }, { status: 500 });
      }

      const organizations = memberships
        ?.filter(m => !m.access_expires_at || new Date(m.access_expires_at) > new Date())
        .map(m => ({
          ...m.organizations,
          role: m.role,
          is_external_auditor: m.is_external_auditor
        }));

      return NextResponse.json({ data: organizations });
    }

    // Admin client fallback - return all orgs
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: orgs });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const { name, slug, industry, stage } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        industry,
        stage,
        subscription_tier: 'free'
      })
      .select()
      .single();

    if (orgError) {
      if (orgError.code === '23505') {
        return NextResponse.json(
          { error: 'An organization with this slug already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating organization:', orgError);
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // Add the creating user as owner
    if (user) {
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'owner',
          invited_by: user.id
        });

      if (memberError) {
        console.error('Error adding owner member:', memberError);
        await supabase.from('organizations').delete().eq('id', org.id);
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
      }
    }

    return NextResponse.json({ data: org }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
