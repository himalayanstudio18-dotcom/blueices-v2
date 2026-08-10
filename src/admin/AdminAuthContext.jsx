import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logActivity } from './activityLogApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = not checked yet, null = signed out
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStaffRow(userId) {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, role')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('[admin] failed to load staff row', error);
      return null;
    }
    return data;
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      if (data.session) {
        setStaff(await loadStaffRow(data.session.user.id));
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession) {
        setLoading(true);
        const staffRow = await loadStaffRow(newSession.user.id);
        setStaff(staffRow);
        setLoading(false);
        /* Only a genuine sign-in fires 'SIGNED_IN' — restoring an
           existing session on page load fires 'INITIAL_SESSION'
           instead, so a refresh never logs a spurious login. */
        if (event === 'SIGNED_IN' && staffRow) {
          logActivity(staffRow, { action: 'login', entity: 'account', detail: 'Signed in' });
        }
      } else {
        setStaff(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    if (staff) logActivity(staff, { action: 'logout', entity: 'account', detail: 'Signed out' });
    await supabase.auth.signOut();
  }

  async function refreshStaff() {
    if (!session) return;
    setStaff(await loadStaffRow(session.user.id));
  }

  const value = {
    session,
    user: session?.user ?? null,
    staff,
    role: staff?.role ?? null,
    loading,
    isAuthenticated: !!session,
    isRecognizedStaff: !!staff,
    signIn,
    signOut,
    refreshStaff,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
