import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/iptv';

const SETTINGS_KEY = 'iptv-settings';

const defaultSettings: AppSettings = {
  m3uUrl: 'http://192.168.22.2:8000/api/channels.m3u',
  xmltvUrl: 'http://192.168.22.2:8000/api/xmltv.xml',
  autoLoad: true,
  videoQuality: 'auto',
  vintageTV: true,
  vignetteStrength: 0.35,
  rgbShiftStrength: 0.0012,
  vignetteRadius: 0.75,
  showLoadingVideo: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return { settings, updateSettings };
};
