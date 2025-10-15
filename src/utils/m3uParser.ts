import { Channel } from "@/types/iptv";
import { logger } from "./logger";

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n').map(line => line.trim());
  const channels: Channel[] = [];
  
  let currentChannel: Partial<Channel> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      
      currentChannel = {
        id: idMatch ? idMatch[1] : `channel-${channels.length}`,
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'Uncategorized',
      };
    } else if (line && !line.startsWith('#') && currentChannel) {
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = null;
    }
  }
  
  logger.log(`Loaded ${channels.length} channels`);
  return channels;
};
