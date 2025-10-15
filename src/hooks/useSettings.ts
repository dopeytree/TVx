import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/iptv';
import { logger } from '@/utils/logger';

const defaultSettings: AppSettings = {
  m3uUrl: 'http://192.168.22.2:8000/api/channels.m3u',
  xmltvUrl: 'http://192.168.22.2:8000/api/xmltv.xml',
  autoLoad: true,
  showNotifications: true,
  videoQuality: 'high',
  vintageTV: true,
  vignetteStrength: 0.35,
  rgbShiftStrength: 0.0012,
  vignetteRadius: 0.75,
  edgeAberration: 10,
  frameEdgeBlur: 10,
  centerSharpness: 0.75,
  sharpenFirst: true,
  showLoadingVideo: true,
  clockStyle: 'neon',
  panelStyle: 'shadow',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const storedSettings = await response.json();
        setSettings({ ...defaultSettings, ...storedSettings });
        await logger.info('Settings loaded from server', { keys: Object.keys(storedSettings) });
      } else {
        await logger.warn('Failed to load settings from server, using defaults');
      }
    } catch (error) {
      await logger.error('Error loading settings, falling back to localStorage', { error: error.message });
      // Fallback to localStorage for development
      const stored = localStorage.getItem('iptv-settings');
      if (stored) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        } catch (e) {
          await logger.error('Failed to parse localStorage settings', { error: e.message });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    // Log what changed
    const changes = Object.keys(newSettings).reduce((acc, key) => {
      if (settings[key as keyof AppSettings] !== newSettings[key as keyof AppSettings]) {
        acc[key] = { from: settings[key as keyof AppSettings], to: newSettings[key as keyof AppSettings] };
      }
      return acc;
    }, {} as Record<string, any>);

    if (Object.keys(changes).length > 0) {
      await logger.info('Settings changed', { changes });
    }

    // Try to save to server first
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error('Failed to save to server');
      }
      await logger.info('Settings saved to server successfully');
    } catch (error) {
      await logger.warn('Failed to save to server, falling back to localStorage', { error: error.message });
      // Fallback to localStorage
      localStorage.setItem('iptv-settings', JSON.stringify(updated));
    }
  };

  return { settings, updateSettings, isLoading };
};
