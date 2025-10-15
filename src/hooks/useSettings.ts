import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/iptv';

const SETTINGS_KEY = 'iptv-settings';

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
