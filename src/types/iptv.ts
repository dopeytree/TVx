export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export interface Program {
  channelId: string;
  title: string;
  subTitle?: string;
  description?: string;
  start: Date;
  end: Date;
  category?: string;
  icon?: string;
  image?: string;
  episodeNum?: string;
  season?: number;
  episode?: number;
  year?: number;
  credits?: {
    director?: string[];
    actor?: string[];
    writer?: string[];
    presenter?: string[];
    producer?: string[];
    composer?: string[];
    editor?: string[];
    guest?: string[];
  };
  starRating?: {
    value: string;
    system: string;
  };
}

export interface AppSettings {
  m3uUrl?: string;
  xmltvUrl?: string;
  autoLoad: boolean;
  showNotifications: boolean;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  vintageTV: boolean;
  vignetteStrength: number;
  rgbShiftStrength: number;
  vignetteRadius: number;
  edgeAberration: number;
  frameEdgeBlur: number;
  centerSharpness: number;
  sharpenFirst: boolean;
  showLoadingVideo: boolean;
  clockStyle: 'flip' | 'matrix' | 'digital' | 'minimal' | 'retro' | 'neon';
  panelStyle: 'bordered' | 'shadow';
  audioFilterEnabled: boolean;
}

export interface EPGData {
  [channelId: string]: Program[];
}
