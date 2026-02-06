import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await request.json();
    const { email, password, full_name, setup_key } = body;

    // Security: require a setup key for initial admin creation
    // In production, remove this endpoint after initial setup
    if (setup_key !== 'SECURELINE_INIT_2026') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if any super admin already exists
    const { data: existingAdmins } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('is_super_admin', true)
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Super admin already exists. Use the admin panel to manage users.' },
        { status: 409 }
      );
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || 'Super Admin',
        is_super_admin: true,
      },
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        full_name: full_name || 'Super Admin',
        is_super_admin: true,
        job_title: 'Platform Administrator',
      });

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Create a default organization for the super admin
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Secureline',
        slug: 'secureline',
        industry: 'Technology',
        stage: 'enterprise',
        subscription_tier: 'enterprise',
      })
      .select()
      .single();

    if (orgError) {
      console.error('Org creation failed:', orgError);
    }

    // Add super admin as owner of the org
    if (org) {
      await supabase
        .from('organization_members')
        .insert({
          org_id: org.id,
          user_id: userId,
          role: 'owner',
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      user_id: userId,
      org_id: org?.id,
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to setup admin';
    console.error('Setup admin error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
