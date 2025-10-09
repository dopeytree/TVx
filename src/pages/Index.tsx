import { useState, useEffect, useRef } from "react";
import { Channel, EPGData, Program, AppSettings } from "@/types/iptv";
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
import { Tv, FileText, Upload, Settings, Menu, Maximize, Volume2, VolumeX, Sparkles, Star, X, Play, Clock, Clapperboard } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<EPGData>({});
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const [muted, setMuted] = useState(false);
  const [fullGuideOpen, setFullGuideOpen] = useState(false);
  const [focusedProgram, setFocusedProgram] = useState<{program: Program, channel: Channel} | null>(null);
  const lastColors = useRef(new Map<string, string>());

  const [fullGuideExpanded, setFullGuideExpanded] = useState(false);

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('tvx-favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('guide');

  const [selectedPoster, setSelectedPoster] = useState<Program | null>(null);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

  const getCurrentProgram = (channel: Channel | null): Program | null => {
    if (!channel || !epgData[channel.id]) return null;
    const now = new Date();
    return epgData[channel.id].find(program => 
      program.start <= now && program.end > now
    ) || null;
  };

  useEffect(() => {
    const program = getCurrentProgram(selectedChannel);
    setCurrentProgram(program);
  }, [selectedChannel, epgData]);

  useEffect(() => {
    if (currentProgram) {
      // Reset idle when program changes
      setIsIdle(false);
      setSidebarVisible(true);
    }
  }, [currentProgram]);

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
      setSidebarVisible(true);
      clearTimeout(timeout);
      const idleTime = settingsOpen ? 20000 : 3000;
      timeout = setTimeout(() => {
        if (!fullGuideOpen) {
          setIsIdle(true);
          setSidebarVisible(false);
        }
      }, idleTime);
    };
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle(); // initial
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
    };
  }, [fullGuideOpen, settingsOpen]);

  useEffect(() => {
    if (fullGuideOpen) {
      const timer = setTimeout(() => {
        setFullGuideExpanded(true);
        setSidebarVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setFullGuideExpanded(false);
      setSidebarVisible(true);
    }
  }, [fullGuideOpen]);

  useEffect(() => {
    if (fullGuideExpanded) {
      const handleMouseMove = () => {
        setFullGuideExpanded(false);
        setSidebarVisible(true);
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [fullGuideExpanded]);

  useEffect(() => {
    document.body.style.cursor = isIdle ? 'none' : 'default';
  }, [isIdle]);

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

  const toggleFavorite = (program: Program) => {
    const key = `${program.title}-${program.start.getTime()}`;
    setFavorites(prev => {
      const newFav = new Set(prev);
      if (newFav.has(key)) {
        newFav.delete(key);
      } else {
        newFav.add(key);
      }
      localStorage.setItem('tvx-favorites', JSON.stringify([...newFav]));
      return newFav;
    });
  };

  const currentPrograms = selectedChannel ? epgData[selectedChannel.id] || [] : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = channels.findIndex(c => c.id === selectedChannel?.id);
        if (currentIndex > 0) {
          setSelectedChannel(channels[currentIndex - 1]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = channels.findIndex(c => c.id === selectedChannel?.id);
        if (currentIndex < channels.length - 1) {
          setSelectedChannel(channels[currentIndex + 1]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [channels, selectedChannel]);

  return (
    <div className={`h-screen bg-background grid overflow-hidden ${sidebarVisible ? 'lg:grid-cols-[70%_30%]' : 'grid-cols-[1fr]'}`}>
      <main className={`space-y-6 h-full ${sidebarVisible ? 'pt-4 pl-4' : 'p-[30px]'}`}>
        <VideoPlayer channel={selectedChannel} settings={settings} muted={muted} isFullGuide={fullGuideOpen} isFullGuideExpanded={fullGuideExpanded} />
        
        {selectedChannel && !fullGuideOpen && activeTab === 'guide' && (
          <EPGView key={selectedChannel.id} programs={currentPrograms} channelName={selectedChannel.name} isIdle={isIdle} onPosterClick={setSelectedPoster} />
        )}
        
        {selectedChannel && fullGuideOpen && !fullGuideExpanded && (
          <div className="h-[50vh] overflow-auto bg-card border border-border rounded-lg">
            {focusedProgram ? (
              <div className="flex flex-1 h-full relative">
                {/* Dimmed background */}
                <div className="absolute inset-0 bg-black/50 z-10" onClick={() => setFocusedProgram(null)} />
                {/* Expanded program */}
                <div className="absolute z-20 bg-card border border-border rounded-lg p-6 shadow-lg max-w-md" 
                     style={{ 
                       left: Math.max(200, Math.min(window.innerWidth - 400, (focusedProgram.program.start.getTime() - new Date().getTime()) / 1000 / 60 * 4 + 200)), 
                       top: channels.findIndex(c => c.id === focusedProgram.program.channelId) * 64 + 60 
                     }}>
                  <button 
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-muted rounded"
                    onClick={() => setFocusedProgram(null)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-4 mb-4">
                    {focusedProgram.channel.logo && (
                      <img
                        src={focusedProgram.channel.logo}
                        alt={`${focusedProgram.channel.name} logo`}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{focusedProgram.program.title}</h3>
                      {focusedProgram.program.subTitle && (
                        <h4 className="text-base font-semibold mb-1 text-primary italic">{focusedProgram.program.subTitle}</h4>
                      )}
                      <div className="text-sm text-muted-foreground mb-1">
                        <Play className="w-3 h-3 inline mr-1" />
                        {focusedProgram.program.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - {focusedProgram.program.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        <Clock className="w-3 h-3 inline mx-1" />
                        {Math.round((focusedProgram.program.end.getTime() - focusedProgram.program.start.getTime()) / 1000 / 60)}min
                      </div>
                      {focusedProgram.program.season && focusedProgram.program.episode && (
                        <div className="text-sm text-muted-foreground mb-1 italic">
                          Season {focusedProgram.program.season} Episode {focusedProgram.program.episode}
                        </div>
                      )}
                      {focusedProgram.program.description && (
                        <p className="text-sm mb-4">{focusedProgram.program.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setSelectedChannel(focusedProgram.channel); setFullGuideOpen(false); setFocusedProgram(null); }}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <div className="ml-auto">
                      <Star 
                        className={`w-5 h-5 cursor-pointer ${favorites.has(`${focusedProgram.program.title}-${focusedProgram.program.start.getTime()}`) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        onClick={() => toggleFavorite(focusedProgram.program)}
                      />
                    </div>
                  </div>
                </div>
                {/* Grid underneath */}
                <div className="flex flex-1 h-full">
                  {/* Channel column */}
                  <div className="w-48 flex-shrink-0 border-r border-border overflow-y-auto">
                    <div className="h-12 border-b border-border bg-muted flex items-center px-4 font-semibold">Channel</div>
                    {channels.map((channel, index) => {
                      const cleanName = channel.name.replace(/\b(movies?|shows?)\b/gi, '').trim();
                      const isMovie = channel.name.toLowerCase().includes('movie') || channel.group?.toLowerCase().includes('movie');
                      const isShow = channel.name.toLowerCase().includes('show') || channel.group?.toLowerCase().includes('show');
                      return (
                        <div key={channel.id} className={`h-16 border-b border-border flex items-center px-4 cursor-pointer hover:bg-secondary/50 ${channel.id === selectedChannel?.id ? 'bg-primary text-primary-foreground' : index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}`} onClick={() => setSelectedChannel(channel)}>
                          <div className="flex items-center gap-3 flex-1">
                            {channel.logo ? (
                              <img
                                src={channel.logo}
                                alt={`${channel.name} logo`}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                                <Tv className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{cleanName}</p>
                            </div>
                            <div>
                              {isMovie && <Clapperboard className="w-4 h-4 text-muted-foreground" />}
                              {isShow && <Tv className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Programs grid */}
                  <div className="flex-1">
                    <div className="relative" style={{ width: '2880px', height: channels.length * 64 + 48 + 'px' }}>
                      {/* Time headers */}
                      <div className="absolute top-0 left-0 right-0 h-12 border-b border-border bg-muted flex">
                        {Array.from({ length: 12 }, (_, i) => {
                          const time = new Date();
                          time.setMinutes(0);
                          time.setHours(time.getHours() + i);
                          const hour = time.getHours();
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          const ampm = hour >= 12 ? 'pm' : 'am';
                          return (
                            <div key={i} style={{ width: '240px' }} className="border-r border-border flex items-center justify-start pl-2 text-sm font-medium">
                              | {displayHour}{ampm}
                            </div>
                          );
                        })}
                      </div>
                      {/* Programs */}
                      {channels.map((channel, channelIndex) => 
                        (epgData[channel.id] || []).map(program => {
                          const now = new Date();
                          const baseTime = new Date(now);
                          baseTime.setMinutes(0, 0, 0);
                          const startMinutes = (program.start.getTime() - baseTime.getTime()) / 1000 / 60;
                          const durationMinutes = (program.end.getTime() - program.start.getTime()) / 1000 / 60;
                          const left = Math.max(0, startMinutes * 4); // 4px per minute
                          const width = Math.max(40, durationMinutes * 4);
                          const top = channelIndex * 64 + 48;
                          const isFavorite = favorites.has(`${program.title}-${program.start.getTime()}`);
                          const colors = ['bg-blue-500/30', 'bg-green-500/30', 'bg-purple-500/30', 'bg-red-500/30', 'bg-yellow-500/30', 'bg-pink-500/30', 'bg-indigo-500/30', 'bg-teal-500/30'];
                          const lastColor = lastColors.current.get(channel.id) || '';
                          let colorIndex = Math.abs(program.title.length + program.start.getTime()) % colors.length;
                          let selectedColor = colors[colorIndex];
                          if (selectedColor === lastColor) {
                            selectedColor = colors[(colorIndex + 1) % colors.length];
                          }
                          lastColors.current.set(channel.id, selectedColor);
                          
                          return (
                            <div
                              key={`${channel.id}-${program.start.getTime()}`}
                              className={`absolute p-2 ${selectedColor} text-white rounded cursor-pointer hover:opacity-80`}
                              style={{ left: left + 'px', top: top + 'px', width: width + 'px', height: '56px' }}
                              onClick={() => {
                                const channel = channels.find(c => c.id === program.channelId);
                                if (channel) setFocusedProgram({ program, channel });
                              }}
                            >
                              <div className="absolute bottom-1 right-1">
                                <Star 
                                  className={`w-3 h-3 ${isFavorite ? 'fill-white text-white' : 'text-white/70'}`} 
                                />
                              </div>
                              <div className="font-semibold text-xs truncate">{program.title}</div>
                              <div className="text-xs opacity-90 truncate">
                                <Play className="w-2 h-2 inline mr-1" />
                                {program.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({Math.round((program.end.getTime() - program.start.getTime()) / 1000 / 60)}min)
                              </div>
                              {program.subTitle && <div className="text-xs opacity-80 truncate italic">{program.subTitle}</div>}
                              {program.season && program.episode && <div className="text-xs opacity-80 italic">E{program.episode}</div>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 overflow-auto">
                {/* Channel column */}
                <div className="w-48 flex-shrink-0 border-r border-border">
                  <div className="h-12 border-b border-border bg-muted flex items-center px-4 font-semibold">Channel</div>
                  {channels.map((channel, index) => (
                    <div key={channel.id} className={`h-16 border-b border-border flex items-center px-4 cursor-pointer hover:bg-secondary/50 ${channel.id === selectedChannel?.id ? 'bg-primary text-primary-foreground' : index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}`} onClick={() => setSelectedChannel(channel)}>
                      {channel.logo && (
                        <img
                          src={channel.logo}
                          alt={`${channel.name} logo`}
                          className="w-8 h-8 rounded object-cover mr-3"
                        />
                      )}
                      <span className="font-medium">{channel.name}</span>
                    </div>
                  ))}
                </div>
                {/* Programs grid */}
                <div className="flex-1">
                  <div className="relative" style={{ width: '2880px', height: channels.length * 64 + 48 + 'px' }}>
                    {/* Time headers */}
                    <div className="absolute top-0 left-0 right-0 h-12 border-b border-border bg-muted flex">
                      {Array.from({ length: 12 }, (_, i) => {
                        const time = new Date();
                        time.setMinutes(0);
                        time.setHours(time.getHours() + i);
                        const hour = time.getHours();
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? 'pm' : 'am';
                        return (
                          <div key={i} style={{ width: '240px' }} className="border-r border-border flex items-center justify-start pl-2 text-sm font-medium">
                            | {displayHour}{ampm}
                          </div>
                        );
                      })}
                    </div>
                    {/* Programs */}
                    {channels.map((channel, channelIndex) => 
                      (epgData[channel.id] || []).map(program => {
                        const now = new Date();
                        const baseTime = new Date(now);
                        baseTime.setMinutes(0, 0, 0);
                        const startMinutes = (program.start.getTime() - baseTime.getTime()) / 1000 / 60;
                        const durationMinutes = (program.end.getTime() - program.start.getTime()) / 1000 / 60;
                        const left = Math.max(0, startMinutes * 4); // 4px per minute
                        const width = Math.max(40, durationMinutes * 4);
                        const top = channelIndex * 64 + 48;
                        const isFavorite = favorites.has(`${program.title}-${program.start.getTime()}`);
                        const colors = ['bg-blue-500/30', 'bg-green-500/30', 'bg-purple-500/30', 'bg-red-500/30', 'bg-yellow-500/30', 'bg-pink-500/30', 'bg-indigo-500/30', 'bg-teal-500/30'];
                        const lastColor = lastColors.current.get(channel.id) || '';
                        let colorIndex = Math.abs(program.title.length + program.start.getTime()) % colors.length;
                        let selectedColor = colors[colorIndex];
                        if (selectedColor === lastColor) {
                          selectedColor = colors[(colorIndex + 1) % colors.length];
                        }
                        lastColors.current.set(channel.id, selectedColor);
                        
                        return (
                          <div
                            key={`${channel.id}-${program.start.getTime()}`}
                            className={`absolute p-2 ${selectedColor} text-white rounded cursor-pointer hover:opacity-80`}
                            style={{ left: left + 'px', top: top + 'px', width: width + 'px', height: '56px' }}
                            onClick={() => {
                              const channel = channels.find(c => c.id === program.channelId);
                              if (channel) setFocusedProgram({ program, channel });
                            }}
                          >
                            <div className="absolute bottom-1 right-1">
                              <Star 
                                className={`w-3 h-3 ${isFavorite ? 'fill-white text-white' : 'text-white/70'}`} 
                              />
                            </div>
                            <div className="font-semibold text-xs truncate">{program.title}</div>
                            <div className="text-xs opacity-90 truncate">
                              <Play className="w-2 h-2 inline mr-1" />
                              {program.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({Math.round((program.end.getTime() - program.start.getTime()) / 1000 / 60)}min)
                            </div>
                            {program.subTitle && <div className="text-xs opacity-80 truncate italic">{program.subTitle}</div>}
                            {program.season && program.episode && <div className="text-xs opacity-80 italic">E{program.episode}</div>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {selectedChannel && activeTab === 'info' && (
          <div className={`bg-card border border-border rounded-lg p-4 relative transition-opacity duration-3000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
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
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Vintage Effect:</span>
                    <span>{selectedChannel?.group?.toLowerCase().includes('movie') || selectedChannel?.group?.toLowerCase().includes('film') ? 'Low (0.001)' : 'High (0.002)'}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-foreground">
                  {(() => {
                    const movieKeywords = ['movie', 'film'];
                    const showKeywords = ['show', 'tv', 'program'];
                    const isMovie = movieKeywords.some(k => selectedChannel?.group?.toLowerCase().includes(k));
                    const effectLevel = isMovie ? 'Low (0.001)' : 'High (0.002)';
                    return <div>Vintage Effect: {effectLevel}</div>;
                  })()}
                  {selectedPoster.credits?.director && selectedPoster.credits.director.length > 0 && (
                    <div>Director: {selectedPoster.credits.director.join(', ')}</div>
                  )}
                  {selectedPoster.credits?.actor && selectedPoster.credits.actor.length > 0 && (
                    <div>Actors: {selectedPoster.credits.actor.slice(0, 2).join(', ')}</div>
                  )}
                  {selectedPoster.year && <div>Year: {selectedPoster.year}</div>}
                  <div className="mt-2">
                    <a
                      href={`https://www.imdb.com/find?q=${encodeURIComponent(selectedPoster.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View on IMDB
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {sidebarVisible && (
        <aside className={`flex flex-col h-full gap-4 p-4 transition-opacity duration-3000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
          <div className={`bg-card border border-border rounded-lg transition-opacity duration-1000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {!selectedPoster && <h1 className="text-xl font-bold">TVx</h1>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => document.documentElement.requestFullscreen()}
                  className="hover:bg-secondary"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMuted(!muted)}
                  className="hover:bg-secondary"
                  title="Toggle Mute"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateSettings({ ...settings, vintageTV: !settings.vintageTV })}
                  className="hover:bg-secondary"
                  title="Toggle Vintage Filter"
                >
                  <Sparkles className={`w-5 h-5 ${settings.vintageTV ? 'text-primary' : ''}`} />
                </Button>
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
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden flex-1 max-h-[500px]">
            {selectedPoster ? (
              <div className="p-4 relative mb-4">
                <img src={selectedPoster.image || selectedPoster.icon} alt="Poster" className="w-full object-contain rounded" />
                <X
                  className="absolute top-2 right-2 w-6 h-6 cursor-pointer text-white bg-black/50 rounded-full p-1"
                  onClick={() => setSelectedPoster(null)}
                />
                <div className="mt-2 text-sm text-foreground">
                  {selectedPoster.credits?.director && selectedPoster.credits.director.length > 0 && (
                    <div>Director: {selectedPoster.credits.director.join(', ')}</div>
                  )}
                  {selectedPoster.credits?.actor && selectedPoster.credits.actor.length > 0 && (
                    <div>Actors: {selectedPoster.credits.actor.slice(0, 2).join(', ')}</div>
                  )}
                  {selectedPoster.year && <div>Year: {selectedPoster.year}</div>}
                  <div className="mt-2">
                    <a
                      href={`https://www.imdb.com/find?q=${encodeURIComponent(selectedPoster.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View on IMDB
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
            {settingsOpen ? (
              <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSave={updateSettings} inline />
            ) : (
              <ChannelList
                channels={channels}
                selectedChannel={selectedChannel}
                onSelectChannel={setSelectedChannel}
              />
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setFullGuideOpen(true)}
            className="w-full mb-4"
          >
            Full TV Guide
          </Button>
          <div className="flex items-center gap-2">
            <div className={`bg-card border border-border rounded-lg transition-opacity duration-1000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
              <div className="flex">
                <button 
                  className={`flex-1 p-3 hover:bg-secondary/50 ${activeTab === 'guide' ? 'bg-primary text-primary-foreground' : ''}`} 
                  onClick={() => { setActiveTab('guide'); setFullGuideOpen(false); }}
                >
                  TV Guide
                </button>
                <button 
                  className={`flex-1 p-3 hover:bg-secondary/50 ${activeTab === 'info' ? 'bg-primary text-primary-foreground' : ''}`} 
                  onClick={() => { setActiveTab('info'); setFullGuideOpen(false); }}
                >
                  Channel Info
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Index;
