import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(() => get().fetchProfile(session.user.id), 0);
      } else {
        set({ profile: null, role: null });
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });
    if (session?.user) {
      await get().fetchProfile(session.user.id);
    }
    set({ loading: false, initialized: true });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async ({ email, password, fullName, phone }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, role: null });
  },

  fetchProfile: async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    set({
      profile: profile as Profile | null,
      role: (roleData?.role as 'admin' | 'user') ?? 'user',
      loading: false,
    });
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);
    if (error) throw error;
    set({ profile: { ...get().profile!, ...data } });
  },
}));
