import { Channel } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import { Tv, Clapperboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

export const ChannelList = ({ channels, selectedChannel, onSelectChannel }: ChannelListProps) => {
  const groupedChannels = channels.reduce((acc, channel) => {
    const group = channel.group || 'Uncategorized';
    if (!acc[group]) acc[group] = [];
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {Object.entries(groupedChannels).map(([group, groupChannels]) => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">{group}</h3>
            <div className="space-y-2">
              {groupChannels.map((channel) => (
                <Card
                  key={channel.id}
                  className={`p-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-glow ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gradient-primary border-primary'
                      : 'bg-card hover:bg-secondary/50 border-border'
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                          <Tv className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{channel.name}</p>
                      </div>
                    </div>
                    <div>
                      {(channel.name.toLowerCase().includes('shows') || channel.group?.toLowerCase().includes('shows')) && <Tv className="w-4 h-4 text-muted-foreground" />}
                      {(channel.name.toLowerCase().includes('movies') || channel.group?.toLowerCase().includes('movies')) && <Clapperboard className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
