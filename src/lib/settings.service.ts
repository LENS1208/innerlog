import { supabase } from './supabase';
import type { UserSettings } from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../types/settings.types';

export async function getUserSettings(userId: string | null = null): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch user settings:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching user settings:', err);
    return null;
  }
}

export async function createUserSettings(
  userId: string | null,
  settings: Partial<UserSettings> = {}
): Promise<UserSettings | null> {
  try {
    const newSettings = {
      user_id: userId,
      ...DEFAULT_SETTINGS,
      ...settings,
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(newSettings)
      .select()
      .single();

    if (error) {
      console.error('Failed to create user settings:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error creating user settings:', err);
    return null;
  }
}

export async function updateUserSettings(
  userId: string | null,
  settings: Partial<UserSettings>
): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update user settings:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error updating user settings:', err);
    return null;
  }
}

export async function getOrCreateUserSettings(userId: string | null = null): Promise<UserSettings> {
  let settings = await getUserSettings(userId);

  if (!settings) {
    settings = await createUserSettings(userId);
  }

  if (!settings) {
    return {
      id: 'temp',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...DEFAULT_SETTINGS,
    };
  }

  return settings;
}
