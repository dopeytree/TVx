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
  description?: string;
  start: Date;
  end: Date;
  category?: string;
  icon?: string;
  image?: string;
}

export interface AppSettings {
  m3uUrl?: string;
  xmltvUrl?: string;
  autoLoad: boolean;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  vintageTV: boolean;
}

export interface EPGData {
  [channelId: string]: Program[];
}
