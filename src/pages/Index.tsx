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
  const [isIdle, setIsIdle] = useState(false);
  const [activeTab, setActiveTab] = useState('guide');

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
  }, [settings]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 10000);
    };
    window.addEventListener('mousemove', resetIdle);
    resetIdle(); // initial
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetIdle);
    };
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
              {(!settings.m3uUrl && !settings.xmltvUrl) && (
                <div className="text-center">
                  <p className="text-muted-foreground">Configure your playlist and EPG URLs in Settings to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            <aside className={`flex flex-col h-full gap-4 transition-opacity duration-1000 ${isIdle ? 'opacity-20' : 'opacity-100'}`}>
              <div className={`bg-card border border-border rounded-lg transition-opacity duration-1000 ${isIdle ? 'opacity-20' : 'opacity-100'}`}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary p-2 rounded-lg">
                      <Tv className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold">TVx</h1>
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
              <div className="bg-card border border-border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <ChannelList
                  channels={channels}
                  selectedChannel={selectedChannel}
                  onSelectChannel={setSelectedChannel}
                />
              </div>
              <div className={`bg-card border border-border rounded-lg transition-opacity duration-1000 ${isIdle ? 'opacity-20' : 'opacity-100'}`}>
                <div className="flex">
                  <button 
                    className={`flex-1 p-3 hover:bg-secondary/50 ${activeTab === 'guide' ? 'bg-primary text-primary-foreground' : ''}`} 
                    onClick={() => setActiveTab('guide')}
                  >
                    TV Guide
                  </button>
                  <button 
                    className={`flex-1 p-3 hover:bg-secondary/50 ${activeTab === 'info' ? 'bg-primary text-primary-foreground' : ''}`} 
                    onClick={() => setActiveTab('info')}
                  >
                    Channel Info
                  </button>
                </div>
              </div>
            </aside>

            <main className="space-y-6">
              <VideoPlayer channel={selectedChannel} settings={settings} />
              
              {selectedChannel && activeTab === 'guide' && (
                <EPGView programs={currentPrograms} channelName={selectedChannel.name} />
              )}
              
              {selectedChannel && activeTab === 'info' && (
                <div className={`bg-card border border-border rounded-lg p-4 relative transition-opacity duration-1000 ${isIdle ? 'opacity-20' : 'opacity-100'}`}>
                  <div className="flex items-start gap-4">
                    {selectedChannel.logo && (
                      <img
                        src={selectedChannel.logo}
                        alt={`${selectedChannel.name} logo`}
                        className="w-24 h-24 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 pr-[100px] pb-6 pt-6">
                      <h3 className="text-xl font-bold mb-4">{selectedChannel.name}</h3>
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
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
