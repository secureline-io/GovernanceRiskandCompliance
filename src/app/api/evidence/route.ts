import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getWriteClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// GET /api/evidence - List evidence for an organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('org_id');
    const controlId = searchParams.get('control_id');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!orgId) {
      return NextResponse.json({ error: 'org_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('evidence')
      .select(`
        *,
        evidence_control_links(
          controls(id, code, name)
        )
      `, { count: 'exact' })
      .eq('org_id', orgId)
      .order('collected_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (source) {
      query = query.eq('source', source);
    }

    // Filter by control if specified
    if (controlId) {
      const { data: links } = await supabase
        .from('evidence_control_links')
        .select('evidence_id')
        .eq('control_id', controlId);

      if (links && links.length > 0) {
        query = query.in('id', links.map(l => l.evidence_id));
      } else {
        return NextResponse.json({ data: [], count: 0 });
      }
    }

    const { data: evidence, error, count } = await query;

    if (error) {
      console.error('Error fetching evidence:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: evidence, count, limit, offset });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/evidence - Create new evidence (append-only)
export async function POST(request: NextRequest) {
  try {
    const { client: supabase, user } = await getWriteClient();
    const body = await request.json();

    const {
      org_id,
      title,
      description,
      source,
      payload,
      file_path,
      file_type,
      file_size_bytes,
      control_ids,
      integration_id,
      audit_notes
    } = body;

    if (!org_id || !source) {
      return NextResponse.json(
        { error: 'org_id and source are required' },
        { status: 400 }
      );
    }

    // Generate SHA-256 hash from payload or file_path
    const contentToHash = payload ? JSON.stringify(payload) : file_path || '';
    const hash = crypto.createHash('sha256').update(contentToHash).digest('hex');

    // Create evidence record (immutable - no updates allowed)
    const { data: evidence, error } = await supabase
      .from('evidence')
      .insert({
        org_id,
        title,
        description,
        source,
        hash,
        payload,
        file_path,
        file_type,
        file_size_bytes,
        integration_id,
        collector_user_id: user?.id || null,
        audit_notes,
        collected_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate hash
      if (error.code === '23505' && error.message.includes('evidence_hash_unique')) {
        return NextResponse.json(
          { error: 'Evidence with this content already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating evidence:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Link evidence to controls if specified
    if (control_ids && Array.isArray(control_ids) && control_ids.length > 0) {
      const links = control_ids.map(controlId => ({
        evidence_id: evidence.id,
        control_id: controlId,
        linked_by: user?.id || null
      }));

      const { error: linkError } = await supabase
        .from('evidence_control_links')
        .insert(links);

      if (linkError) {
        console.error('Error linking evidence to controls:', linkError);
        // Don't fail the request, evidence is already created
      }
    }

    // Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_org_id: org_id,
        p_action: 'create',
        p_resource_type: 'evidence',
        p_resource_id: evidence.id,
        p_changes: { new: evidence }
      });
    } catch (auditError) {
      console.error('Error logging audit event:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({ data: evidence }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
