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
}

export interface EPGData {
  [channelId: string]: Program[];
}
