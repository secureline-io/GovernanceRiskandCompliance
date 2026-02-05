# GRC Platform - Database Setup Guide

This guide will help you set up the Supabase database for the GRC Platform.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI (optional but recommended)

```bash
npm install -g supabase
```

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: grc-platform (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for provisioning (~2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

3. Also go to **Settings** > **Database** and copy:
   - **Connection string** (URI format)

## Step 3: Configure Environment Variables

1. Copy the `.env.local` file in your project root
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

## Step 4: Deploy Database Schema

### Option A: Using the Supabase Dashboard (Recommended for Beginners)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/deploy_schema.sql`
5. Paste into the SQL editor
6. Click "Run" or press Cmd/Ctrl + Enter
7. Wait for execution (should take ~30 seconds)

### Option B: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or run the consolidated schema
psql "$DATABASE_URL" < supabase/deploy_schema.sql
```

### Option C: Using Node.js Script

```bash
# Install pg library
npm install pg

# Run the deployment script
node supabase/deploy.js
```

## Step 5: Seed Sample Data

To populate your database with SOC 2 framework data and sample records:

```bash
# Using Supabase Dashboard
1. Go to SQL Editor
2. Open supabase/seed/soc2_framework.sql
3. Run the query

# OR using CLI
psql "$DATABASE_URL" < supabase/seed/soc2_framework.sql
```

## Step 6: Set Up Row Level Security (RLS)

The database migrations include RLS policies. To verify they're enabled:

1. Go to **Authentication** > **Policies** in Supabase dashboard
2. You should see policies for each table
3. Policies ensure users can only access data from their organization

## Step 7: Verify Installation

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - organizations
   - organization_members
   - frameworks
   - framework_requirements
   - controls
   - control_requirement_mappings
   - framework_instances
   - evidence
   - evidence_control_mappings
   - evidence_comments
   - audit_logs
   - cloud_accounts
   - assets
   - cspm_policies
   - findings
   - risks
   - risk_assessments
   - risk_treatments
   - policies
   - policy_reviews
   - policy_acknowledgments
   - vendors
   - vendor_assessments
   - vendor_reviews

3. Check that the `soc2_framework` seed data loaded:
   ```sql
   SELECT code, name FROM frameworks WHERE code = 'SOC2';
   SELECT COUNT(*) FROM framework_requirements WHERE framework_id IN (
     SELECT id FROM frameworks WHERE code = 'SOC2'
   );
   ```

## Database Schema Overview

### Core Tenancy (Migration 001)
- `organizations` - Root tenant entities
- `organization_members` - Users and role-based access control

### Compliance (Migration 002)
- `frameworks` - SOC 2, ISO 27001, custom frameworks
- `framework_requirements` - Individual requirements (CC1.1, A.5.1, etc.)
- `controls` - Organization-specific controls
- `control_requirement_mappings` - Links controls to requirements
- `framework_instances` - Tracks compliance progress per framework

### Evidence (Migration 003)
- `evidence` - Documents, screenshots, logs
- `evidence_control_mappings` - Links evidence to controls
- `evidence_comments` - Audit trail and collaboration
- `audit_logs` - Complete activity logging

### CSPM - Cloud Security (Migration 004)
- `cloud_accounts` - AWS/Azure/GCP connections
- `assets` - Discovered cloud resources
- `cspm_policies` - Security detection rules
- `findings` - Policy violations and security issues

### Risk Management (Migration 005)
- `risks` - Risk register
- `risk_assessments` - Periodic assessments
- `risk_treatments` - Mitigation actions

### Governance (Migration 006)
- `policies` - Policy documents
- `policy_reviews` - Review workflow
- `policy_acknowledgments` - Employee sign-offs

### Vendor Management (Migration 007)
- `vendors` - Third-party vendor directory
- `vendor_assessments` - Security assessments
- `vendor_reviews` - Periodic reviews

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran all migrations in order (001 through 009)
- Check that migrations completed without errors

### Error: "permission denied"
- Verify your service role key is correct in `.env.local`
- Check RLS policies are properly configured

### Can't connect to database
- Verify your Supabase project URL is correct
- Check that your IP isn't blocked (Supabase allows all IPs by default)
- Ensure your database password is correct

### Slow queries
- Check indexes are created (included in migrations)
- Consider upgrading your Supabase plan for better performance

## Next Steps

1. **Authentication**: Set up Supabase Auth for user sign-in
2. **Storage**: Configure Supabase Storage for evidence file uploads
3. **API**: The Next.js app includes API routes that connect to these tables
4. **Testing**: Add sample data to test the application

## Support

- Supabase Docs: https://supabase.com/docs
- Project GitHub: [Your repo URL]
- Contact: [Your email]
