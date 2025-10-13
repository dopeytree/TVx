import { Channel } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import { Tv, Clapperboard, Book, BookOpen, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  panelStyle?: 'bordered' | 'shadow';
}

export const ChannelList = ({ channels, selectedChannel, onSelectChannel, panelStyle = 'bordered' }: ChannelListProps) => {
  const selectedChannelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChannelRef.current) {
      selectedChannelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedChannel]);

  const groupedChannels = channels.reduce((acc, channel) => {
    const group = channel.group || 'Uncategorized';
    if (!acc[group]) acc[group] = [];
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <ScrollArea className="h-[500px] p-4">
      <div className="space-y-6">
        {Object.entries(groupedChannels).map(([group, groupChannels]) => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">{group}</h3>
            <div className="space-y-2">
              {groupChannels.map((channel) => (
                <Card
                  key={channel.id}
                  ref={selectedChannel?.id === channel.id ? selectedChannelRef : null}
                  className={`p-2 cursor-pointer transition-all hover:scale-[1.02] ${
                    panelStyle === 'shadow' 
                      ? selectedChannel?.id === channel.id
                        ? 'bg-gradient-primary shadow-lg shadow-primary/30 border-none'
                        : 'bg-card/95 hover:bg-secondary/50 shadow-md hover:shadow-lg border-none'
                      : selectedChannel?.id === channel.id
                        ? 'bg-gradient-primary border-primary hover:shadow-glow'
                        : 'bg-card hover:bg-secondary/50 border-border hover:shadow-glow'
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                          <Tv className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{channel.name.replace(/\b(movies?|shows?|history|doc|documentary)\b/gi, '').trim()}</p>
                      </div>
                    </div>
                    <div>
                      {(channel.name.toLowerCase().includes('show') || channel.group?.toLowerCase().includes('show')) && <Tv className="w-3 h-3 text-muted-foreground" />}
                      {(channel.name.toLowerCase().includes('movie') || channel.group?.toLowerCase().includes('movie')) && <Clapperboard className="w-3 h-3 text-muted-foreground" />}
                      {(channel.name.toLowerCase().includes('history') || channel.group?.toLowerCase().includes('history')) && <History className="w-3 h-3 text-muted-foreground" />}
                      {(channel.name.toLowerCase().includes('doc') || channel.group?.toLowerCase().includes('doc')) && <History className="w-3 h-3 text-muted-foreground" />}
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
