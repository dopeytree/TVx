import { useState } from "react";
import { Channel, EPGData } from "@/types/iptv";
import { parseM3U } from "@/utils/m3uParser";
import { parseXMLTV } from "@/utils/xmltvParser";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChannelList } from "@/components/ChannelList";
import { EPGView } from "@/components/EPGView";
import { FileUploader } from "@/components/FileUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tv, FileText, Upload } from "lucide-react";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<EPGData>({});
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleM3ULoad = (content: string) => {
    const parsedChannels = parseM3U(content);
    setChannels(parsedChannels);
    if (parsedChannels.length > 0) {
      setSelectedChannel(parsedChannels[0]);
    }
  };

  const handleXMLTVLoad = (content: string) => {
    const parsedEPG = parseXMLTV(content);
    setEpgData(parsedEPG);
  };

  const currentPrograms = selectedChannel ? epgData[selectedChannel.id] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Tv className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">IPTV Viewer</h1>
          </div>
        </div>
      </header>

      {channels.length === 0 ? (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to IPTV Viewer</h2>
              <p className="text-muted-foreground">Upload your playlist and EPG files to get started</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FileUploader
                label="Upload M3U Playlist"
                accept=".m3u,.m3u8"
                onFileLoad={handleM3ULoad}
                icon={<Upload className="mr-2 h-5 w-5" />}
              />
              <FileUploader
                label="Upload XMLTV EPG"
                accept=".xml,.xmltv"
                onFileLoad={handleXMLTVLoad}
                icon={<FileText className="mr-2 h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            <aside className="space-y-4">
              <div className="flex gap-2">
                <FileUploader
                  label="Change M3U"
                  accept=".m3u,.m3u8"
                  onFileLoad={handleM3ULoad}
                  icon={<Upload className="h-4 w-4" />}
                />
                <FileUploader
                  label="Change EPG"
                  accept=".xml,.xmltv"
                  onFileLoad={handleXMLTVLoad}
                  icon={<FileText className="h-4 w-4" />}
                />
              </div>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <ChannelList
                  channels={channels}
                  selectedChannel={selectedChannel}
                  onSelectChannel={setSelectedChannel}
                />
              </div>
            </aside>

            <main className="space-y-6">
              <VideoPlayer channel={selectedChannel} />
              
              {selectedChannel && (
                <Tabs defaultValue="guide" className="w-full">
                  <TabsList className="w-full bg-card border border-border">
                    <TabsTrigger value="guide" className="flex-1">TV Guide</TabsTrigger>
                    <TabsTrigger value="info" className="flex-1">Channel Info</TabsTrigger>
                  </TabsList>
                  <TabsContent value="guide" className="mt-4">
                    <EPGView programs={currentPrograms} channelName={selectedChannel.name} />
                  </TabsContent>
                  <TabsContent value="info" className="mt-4">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                      <h3 className="text-xl font-bold">{selectedChannel.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Channel ID:</span>
                          <span className="font-mono">{selectedChannel.id}</span>
                        </div>
                        {selectedChannel.group && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Group:</span>
                            <span>{selectedChannel.group}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Stream URL:</span>
                          <span className="font-mono text-xs truncate">{selectedChannel.url}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
