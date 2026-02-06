/**
 * Super Admin Setup Script
 * Run this ONCE to create the initial super admin user.
 *
 * Usage: node scripts/setup-admin.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ashish.mathur@secureline.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@3211';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Ashish Mathur';

async function setupAdmin() {
  console.log('🔧 Secureline GRC - Super Admin Setup\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Test connection
  console.log('1. Testing connection...');
  const { error: testErr } = await supabase.from('organizations').select('id').limit(1);
  if (testErr) {
    console.error('❌ Connection failed:', testErr.message);
    console.log('\nMake sure SUPABASE_SERVICE_ROLE_KEY is correct.');
    process.exit(1);
  }
  console.log('   ✅ Connected to Supabase\n');

  // 2. Create auth user
  console.log('2. Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: ADMIN_NAME,
      is_super_admin: true,
    },
  });

  let userId;
  if (authError) {
    if (authError.message.includes('already') || authError.message.includes('exists') || authError.message.includes('duplicate')) {
      console.log('   ⚠️  User already exists, looking up...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === ADMIN_EMAIL);
      if (existing) {
        userId = existing.id;
        console.log('   ✅ Found existing user:', userId, '\n');
      } else {
        console.error('❌ Could not find existing user');
        process.exit(1);
      }
    } else {
      console.error('❌ Auth error:', authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log('   ✅ Created user:', userId, '\n');
  }

  // 3. Create/update profile
  console.log('3. Setting up user profile...');
  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: userId,
    email: ADMIN_EMAIL,
    full_name: ADMIN_NAME,
    is_super_admin: true,
    job_title: 'Platform Administrator',
    is_active: true,
  });

  if (profileError) {
    console.error('❌ Profile error:', profileError.message);
  } else {
    console.log('   ✅ Profile created\n');
  }

  // 4. Create default organization
  console.log('4. Creating default organization...');
  let orgId;

  // Check if org exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'secureline')
    .single();

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log('   ⚠️  Organization already exists:', orgId, '\n');
  } else {
    const { data: newOrg, error: orgError } = await supabase
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
      console.error('❌ Org error:', orgError.message);
    } else {
      orgId = newOrg.id;
      console.log('   ✅ Organization created:', orgId, '\n');
    }
  }

  // 5. Add user as org owner
  if (orgId) {
    console.log('5. Adding as organization owner...');
    const { error: memError } = await supabase
      .from('organization_members')
      .upsert({
        org_id: orgId,
        user_id: userId,
        role: 'owner',
      }, { onConflict: 'org_id,user_id' });

    if (memError) {
      // Try insert if upsert fails
      const { error: insError } = await supabase
        .from('organization_members')
        .insert({
          org_id: orgId,
          user_id: userId,
          role: 'owner',
        });

      if (insError && !insError.message.includes('duplicate')) {
        console.error('❌ Membership error:', insError.message);
      } else {
        console.log('   ✅ Added as owner\n');
      }
    } else {
      console.log('   ✅ Added as owner\n');
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('  🎉 SUPER ADMIN SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  Email:    ' + ADMIN_EMAIL);
  console.log('  Password: ' + ADMIN_PASSWORD);
  console.log('  Role:     Super Admin (Owner)');
  console.log('  Org:      Secureline');
  console.log('');
  console.log('  You can now log in at /login');
  console.log('═══════════════════════════════════════════');
}

setupAdmin().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
