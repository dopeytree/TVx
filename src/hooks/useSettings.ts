import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/iptv';
import { logger } from '@/utils/logger';

const defaultSettings: AppSettings = {
  m3uUrl: (window as any).ENV?.VITE_M3U_URL || 'http://your-tunarr-ip-address:8000/channels.m3u',
  xmltvUrl: (window as any).ENV?.VITE_XMLTV_URL || 'http://your-tunarr-ip-address:8000/xmltv.xml',
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

// UI settings that should be persisted in localStorage
const uiSettingsKeys: (keyof AppSettings)[] = [
  'autoLoad',
  'showNotifications',
  'videoQuality',
  'vintageTV',
  'vignetteStrength',
  'rgbShiftStrength',
  'vignetteRadius',
  'edgeAberration',
  'frameEdgeBlur',
  'centerSharpness',
  'sharpenFirst',
  'showLoadingVideo',
  'clockStyle',
  'panelStyle',
];

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isFirstRun, setIsFirstRun] = useState(true);

  // Load UI settings from localStorage
  const loadUISettings = (): Partial<AppSettings> => {
    try {
      const stored = localStorage.getItem('tvx-ui-settings');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        // Only return UI settings, filter out any URL settings that might be stored
        const uiSettings: Partial<AppSettings> = {};
        uiSettingsKeys.forEach(key => {
          if (parsed[key] !== undefined) {
            (uiSettings as any)[key] = parsed[key];
          }
        });
        return uiSettings;
      }
    } catch (error) {
      logger.error(`Error loading UI settings from localStorage: ${error}`);
    }
    logger.log('Loaded UI settings from localStorage');
    return {};
  };

  // Save UI settings to localStorage
  const saveUISettings = (settings: AppSettings) => {
    try {
      const uiSettings: Partial<AppSettings> = {};
      uiSettingsKeys.forEach(key => {
        (uiSettings as any)[key] = settings[key];
      });
      localStorage.setItem('tvx-ui-settings', JSON.stringify(uiSettings));
    } catch (error) {
      logger.error(`Error saving UI settings to localStorage: ${error}`);
    }
    logger.log('Saved UI settings to localStorage');
  };

  useEffect(() => {
    // Load UI settings from localStorage first
    const uiSettings = loadUISettings();

    // Try to load settings from /config/settings.json
    fetch('/config/settings.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Settings file not found');
        }
        return response.json();
      })
      .then(loadedSettings => {
        // Merge: URLs from external config, UI settings from localStorage (with defaults)
        const mergedSettings = {
          ...defaultSettings,
          ...uiSettings, // UI settings from localStorage take precedence over defaults
          ...loadedSettings, // External config takes precedence for URLs
        };
        setSettings(mergedSettings);
        setIsFirstRun(false);
        logger.log('Loaded settings from /config/settings.json');
      })
      .catch(() => {
        // If no settings.json, merge UI settings with defaults
        const mergedSettings = {
          ...defaultSettings,
          ...uiSettings, // UI settings from localStorage
        };
        setSettings(mergedSettings);
        setIsFirstRun(true);
      });
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setIsFirstRun(false); // Mark that we've updated settings

    // Save UI settings to localStorage
    saveUISettings(updated);
    logger.log('Settings updated');
  };

  return { settings, updateSettings, isFirstRun };
};
