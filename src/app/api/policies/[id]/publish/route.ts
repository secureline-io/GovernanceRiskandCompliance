import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/policies/[id]/publish - Publish a policy and create acknowledgement tasks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: policyId } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      user_ids, // Array of user IDs to assign acknowledgements to
      due_date  // Optional due date for acknowledgements
    } = body;

    // Get the policy
    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .select('*')
      .eq('id', policyId)
      .single();

    if (policyError || !policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Update policy to 'active' status
    const { error: updateError } = await supabase
      .from('policies')
      .update({
        status: 'active',
        published_at: new Date().toISOString()
      })
      .eq('id', policyId);

    if (updateError) {
      console.error('Error publishing policy:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Get users to assign acknowledgements to
    let targetUserIds = user_ids;

    // If no specific users provided, get all org members
    if (!targetUserIds || targetUserIds.length === 0) {
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('org_id', policy.org_id)
        .eq('is_external_auditor', false);

      targetUserIds = members?.map(m => m.user_id) || [];
    }

    // Create acknowledgement records
    if (targetUserIds.length > 0) {
      // First, remove any existing pending acknowledgements for this policy
      await supabase
        .from('policy_acknowledgements')
        .delete()
        .eq('policy_id', policyId)
        .eq('status', 'pending');

      // Create new acknowledgement requests
      const acknowledgements = targetUserIds.map((userId: string) => ({
        policy_id: policyId,
        user_id: userId,
        status: 'pending',
        due_date: due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 14 days
      }));

      const { error: ackError, data: createdAcks } = await supabase
        .from('policy_acknowledgements')
        .insert(acknowledgements)
        .select();

      if (ackError) {
        console.error('Error creating acknowledgements:', ackError);
        // Don't fail the request, policy is already published
      }

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_org_id: policy.org_id,
        p_action: 'publish',
        p_resource_type: 'policies',
        p_resource_id: policyId,
        p_changes: {
          status: 'published',
          acknowledgements_created: createdAcks?.length || 0,
          target_users: targetUserIds.length
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          policy_id: policyId,
          acknowledgements_created: createdAcks?.length || 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        policy_id: policyId,
        acknowledgements_created: 0
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
