import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSettings } from '../types/settings.types';
import { getOrCreateUserSettings } from './settings.service';
import { DEFAULT_SETTINGS } from '../types/settings.types';

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({
    id: 'temp',
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...DEFAULT_SETTINGS,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const userSettings = await getOrCreateUserSettings(null);
      setSettings(userSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
