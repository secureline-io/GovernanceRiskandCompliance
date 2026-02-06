'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'owner' | 'admin' | 'security_lead' | 'analyst' | 'auditor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  job_title: string | null;
  is_super_admin: boolean;
}

export interface OrgMembership {
  org_id: string;
  org_name: string;
  org_slug: string;
  org_industry: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  currentOrg: OrgMembership | null;
  orgs: OrgMembership[];
  loading: boolean;
  isSuperAdmin: boolean;
  switchOrg: (orgId: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  currentOrg: null,
  orgs: [],
  loading: true,
  isSuperAdmin: false,
  switchOrg: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orgs, setOrgs] = useState<OrgMembership[]>([]);
  const [currentOrg, setCurrentOrg] = useState<OrgMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name || '',
          avatar_url: profileData.avatar_url,
          job_title: profileData.job_title,
          is_super_admin: profileData.is_super_admin || false,
        });
      }

      // Fetch organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select(`
          org_id,
          role,
          organizations (
            id,
            name,
            slug,
            industry
          )
        `)
        .eq('user_id', userId);

      if (memberships && memberships.length > 0) {
        const orgList: OrgMembership[] = memberships.map((m: Record<string, unknown>) => {
          const org = m.organizations as Record<string, unknown>;
          return {
            org_id: m.org_id as string,
            org_name: (org?.name as string) || '',
            org_slug: (org?.slug as string) || '',
            org_industry: (org?.industry as string) || null,
            role: m.role as UserRole,
          };
        });
        setOrgs(orgList);

        // Restore last selected org from localStorage, or use first
        const savedOrgId = localStorage.getItem('secureline_current_org');
        const savedOrg = orgList.find(o => o.org_id === savedOrgId);
        setCurrentOrg(savedOrg || orgList[0]);
      } else if (profileData?.is_super_admin) {
        // Super admin with no org yet - fetch all orgs
        const { data: allOrgs } = await supabase
          .from('organizations')
          .select('id, name, slug, industry')
          .limit(50);

        if (allOrgs && allOrgs.length > 0) {
          const orgList: OrgMembership[] = allOrgs.map((org: Record<string, unknown>) => ({
            org_id: org.id as string,
            org_name: org.name as string,
            org_slug: org.slug as string,
            org_industry: (org.industry as string) || null,
            role: 'owner' as UserRole,
          }));
          setOrgs(orgList);
          setCurrentOrg(orgList[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setOrgs([]);
          setCurrentOrg(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const switchOrg = useCallback((orgId: string) => {
    const org = orgs.find(o => o.org_id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('secureline_current_org', orgId);
    }
  }, [orgs]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('secureline_current_org');
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrgs([]);
    setCurrentOrg(null);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const isSuperAdmin = profile?.is_super_admin || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        currentOrg,
        orgs,
        loading,
        isSuperAdmin,
        switchOrg,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
