import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/supabase/server';
import { testAWSConnection } from '@/lib/cloud/aws-discovery';
import crypto from 'crypto';

// POST /api/cloud-inventory/connect - Connect a new AWS account
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const { org_id, provider, role_arn, account_name, regions } = body;

    if (!org_id || !provider || !role_arn) {
      return NextResponse.json(
        { error: 'org_id, provider, and role_arn are required' },
        { status: 400 }
      );
    }

    // Generate external ID for this connection
    const externalId = crypto.randomUUID();

    // Test the connection
    const testResult = await testAWSConnection(role_arn, externalId);
    
    if (!testResult.success) {
      return NextResponse.json(
        { error: `Connection test failed: ${testResult.error}` },
        { status: 400 }
      );
    }

    // Create cloud account record
    const { data: account, error } = await supabase
      .from('cloud_accounts')
      .insert({
        org_id,
        provider,
        account_id: testResult.account_id,
        account_name: account_name || testResult.account_alias || `AWS ${testResult.account_id}`,
        role_arn,
        external_id: externalId,
        regions: regions || testResult.regions_accessible || ['us-east-1'],
        connection_method: 'iam_role',
        status: 'connected',
        settings: {
          identity_arn: testResult.identity_arn,
          regions_accessible: testResult.regions_accessible,
        },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This AWS account is already connected' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Log audit event (best-effort)
    if (user) {
      try {
        await supabase.rpc('log_audit_event', {
          p_org_id: org_id,
          p_user_id: user.id,
          p_action: 'cloud_account.connected',
          p_resource_type: 'cloud_account',
          p_resource_id: account.id,
          p_details: { provider, account_id: testResult.account_id },
        });
      } catch {
        // Best-effort audit logging
      }
    }

    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to connect account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/cloud-inventory/connect/test - Test connection without saving
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { role_arn } = body;

    if (!role_arn) {
      return NextResponse.json({ error: 'role_arn is required' }, { status: 400 });
    }

    const externalId = crypto.randomUUID();
    const result = await testAWSConnection(role_arn, externalId);

    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection test failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
