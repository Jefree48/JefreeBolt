import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    }
  }
);

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      await supabase.auth.signOut();
      return null;
    }
    return session?.user ?? null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Helper function to get user preferences
export const getUserPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

// Helper function to update user preferences
export const updateUserPreferences = async (userId: string, preferences: Partial<Database['public']['Tables']['user_preferences']['Update']>) => {
  try {
    // First check if preferences exist
    const existingPrefs = await getUserPreferences(userId);

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        // If no existing preferences, include defaults
        family_size: preferences.family_size ?? existingPrefs?.family_size ?? 1,
        menu_days: preferences.menu_days ?? existingPrefs?.menu_days ?? 3,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};