import { useState, useEffect } from "react";
import { Channel, EPGData } from "@/types/iptv";
import { parseM3U } from "@/utils/m3uParser";
import { parseXMLTV } from "@/utils/xmltvParser";
import { loadFromUrl } from "@/utils/urlLoader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChannelList } from "@/components/ChannelList";
import { EPGView } from "@/components/EPGView";
import { FileUploader } from "@/components/FileUploader";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useSettings } from "@/hooks/useSettings";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tv, FileText, Upload, Settings } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<EPGData>({});
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  const handleM3ULoad = (content: string) => {
    try {
      const parsedChannels = parseM3U(content);
      setChannels(parsedChannels);
      if (parsedChannels.length > 0) {
        setSelectedChannel(parsedChannels[0]);
      }
      toast.success(`Loaded ${parsedChannels.length} channels`);
    } catch (error) {
      toast.error('Failed to parse M3U file');
      console.error(error);
    }
  };

  const handleXMLTVLoad = (content: string) => {
    try {
      const parsedEPG = parseXMLTV(content);
      setEpgData(parsedEPG);
      const programCount = Object.values(parsedEPG).reduce((sum, progs) => sum + progs.length, 0);
      toast.success(`Loaded EPG data for ${Object.keys(parsedEPG).length} channels (${programCount} programs)`);
    } catch (error) {
      toast.error('Failed to parse XMLTV file');
      console.error(error);
    }
  };

  const loadFromUrls = async () => {
    if (!settings.m3uUrl && !settings.xmltvUrl) {
      toast.error('Please configure URLs in settings first');
      return;
    }

    setIsLoading(true);

    try {
      if (settings.m3uUrl) {
        const m3uContent = await loadFromUrl(settings.m3uUrl);
        handleM3ULoad(m3uContent);
      }

      if (settings.xmltvUrl) {
        const xmltvContent = await loadFromUrl(settings.xmltvUrl);
        handleXMLTVLoad(xmltvContent);
      }
    } catch (error) {
      toast.error('Failed to load from URLs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (settings.autoLoad && (settings.m3uUrl || settings.xmltvUrl)) {
      loadFromUrls();
    }
  }, []);

  useKeyboardShortcuts({
    onSettings: () => setSettingsOpen(true),
    onFullscreen: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
  });

  const currentPrograms = selectedChannel ? epgData[selectedChannel.id] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Tv className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">IPTV Viewer</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="hover:bg-secondary"
              title="Settings (Ctrl/Cmd + ,)"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={updateSettings}
      />

      {channels.length === 0 ? (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to IPTV Viewer</h2>
              <p className="text-muted-foreground">Upload your playlist and EPG files to get started</p>
            </div>
            <div className="space-y-4">
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
              
              {(settings.m3uUrl || settings.xmltvUrl) && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-3">Or load from configured URLs</p>
                  <Button
                    onClick={loadFromUrls}
                    disabled={isLoading}
                    className="bg-gradient-primary"
                    size="lg"
                  >
                    {isLoading ? 'Loading...' : 'Load from URLs'}
                  </Button>
                </div>
              )}
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
