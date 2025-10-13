import { useState, useEffect, useRef, useCallback } from "react";
import { Channel, EPGData, Program, AppSettings } from "@/types/iptv";
import { parseM3U } from "@/utils/m3uParser";
import { parseXMLTV } from "@/utils/xmltvParser";
import { loadFromUrl } from "@/utils/urlLoader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChannelList } from "@/components/ChannelList";
import { EPGView } from "@/components/EPGView";
import { FileUploader } from "@/components/FileUploader";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Poster } from "@/components/Poster";
import { ClockDisplay } from "@/components/ClockDisplay";
import { useSettings } from "@/hooks/useSettings";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Tv, FileText, Upload, Settings, Menu, Maximize, Volume2, VolumeX, Star, X, Play, Clock, Clapperboard, Film, RotateCw, Book, BookOpen, History } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<EPGData>({});
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Helper function to get panel classes based on style setting
  const getPanelClasses = (baseClasses: string = '') => {
    if (settings.panelStyle === 'shadow') {
      // Shadow style: no border, use shadow and slightly darker background
      return `bg-card/95 shadow-lg ${baseClasses}`;
    }
    // Bordered style (default)
    return `bg-card border border-border ${baseClasses}`;
  };

  // Helper function for sidebar panels (darker in shadow mode)
  const getSidebarPanelClasses = (baseClasses: string = '') => {
    if (settings.panelStyle === 'shadow') {
      // Shadow style: lighter background similar to outline button
      return `bg-secondary/50 shadow-lg ${baseClasses}`;
    }
    // Bordered style (default)
    return `bg-card border border-border ${baseClasses}`;
  };

  const handleSettingsToggle = () => {
    if (settingsOpen) {
      // Save settings and close
      updateSettings(localSettings);
      toast.success('Saved: Settings');
      setSettingsOpen(false);
    } else {
      // Close poster if open, then open settings
      setSelectedPoster(null);
      setLocalSettings(settings);
      setSettingsOpen(true);
    }
  };
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
  const [isScrolling, setIsScrolling] = useState(false);
  const channelListRef = useRef<HTMLDivElement>(null);
  const epgViewRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const fullGuideRef = useRef<HTMLDivElement>(null);
  const mainTimelineRef = useRef<HTMLDivElement>(null);
  const selectedChannelRowRef = useRef<HTMLDivElement>(null);
  
  // Refs to track current state for idle timeout
  const fullGuideOpenRef = useRef(fullGuideOpen);
  const focusedProgramRef = useRef(focusedProgram);
  const settingsOpenRef = useRef(settingsOpen);
  
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false); // Track if user clicked video to hide everything
  const [activeTab, setActiveTab] = useState('guide');
  const [statsOpen, setStatsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [guideResetKey, setGuideResetKey] = useState(0);

  const [selectedPoster, setSelectedPoster] = useState<Program | null>(null);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

  const handleClosePoster = useCallback(() => {
    setSelectedPoster(null);
  }, []);

  const handlePosterToggle = useCallback((program: Program | null) => {
    setSelectedPoster(program);
  }, []);

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
    
    // If poster is open, update it to show the current program of the new channel
    if (selectedPoster && program && (program.image || program.icon)) {
      setSelectedPoster(program);
    }

    // Save selected channel to localStorage and show notification
    if (selectedChannel) {
      localStorage.setItem('last-watched-channel', selectedChannel.id);
      // Only show notification if channels are loaded (not on initial load)
      if (channels.length > 0) {
        const cleanName = selectedChannel.name.replace(/\b(movies?|shows?|history|doc|documentary)\b/gi, '').trim();
        const nameLower = selectedChannel.name.toLowerCase();
        const groupLower = selectedChannel.group?.toLowerCase() || '';
        
        // Determine icon based on channel name/group
        let icon = null;
        if (nameLower.includes('movie') || groupLower.includes('movie')) {
          icon = <Clapperboard className="w-4 h-4 inline-block" />;
        } else if (nameLower.includes('show') || groupLower.includes('show')) {
          icon = <Tv className="w-4 h-4 inline-block" />;
        } else if (nameLower.includes('history') || groupLower.includes('history')) {
          icon = <History className="w-4 h-4 inline-block" />;
        } else if (nameLower.includes('doc')) {
          icon = <History className="w-4 h-4 inline-block" />;
        }
        
        toast.info(
          <span className="flex items-center gap-2">
            Now Playing: {cleanName} {icon}
          </span>
        );
      }
    }
  }, [selectedChannel, epgData]);

  useEffect(() => {
    if (currentProgram) {
      // Reset idle when program changes
      setIsIdle(false);
      setSidebarVisible(true);
    }
  }, [currentProgram]);

  useEffect(() => {
    // Reset idle timer when popup/poster is opened
    if (focusedProgram || selectedPoster) {
      setIsIdle(false);
      setSidebarVisible(true);
    }
  }, [focusedProgram, selectedPoster]);

  const handleM3ULoad = (content: string) => {
    try {
      const parsedChannels = parseM3U(content);
      setChannels(parsedChannels);
      
      // Try to restore last watched channel
      const lastWatchedId = localStorage.getItem('last-watched-channel');
      let channelToSelect = null;
      
      if (lastWatchedId) {
        channelToSelect = parsedChannels.find(ch => ch.id === lastWatchedId);
      }
      
      // If no last watched or channel not found, use first channel
      if (!channelToSelect && parsedChannels.length > 0) {
        channelToSelect = parsedChannels[0];
      }
      
      if (channelToSelect) {
        setSelectedChannel(channelToSelect);
      }
      
      toast.success(`Loaded: ${parsedChannels.length} Channels`);
    } catch (error) {
      toast.error('Error: Failed to Parse M3U File');
      console.error(error);
    }
  };

  const handleXMLTVLoad = (content: string) => {
    try {
      const parsedEPG = parseXMLTV(content);
      setEpgData(parsedEPG);
      const programCount = Object.values(parsedEPG).reduce((sum, progs) => sum + progs.length, 0);
      toast.success(`Loaded: EPG Data for ${Object.keys(parsedEPG).length} Channels (${programCount} Programs)`);
    } catch (error) {
      toast.error('Error: Failed to Parse XMLTV File');
      console.error(error);
    }
  };

  const loadFromUrls = async () => {
    if (!settings.m3uUrl && !settings.xmltvUrl) {
      toast.error('Error: Please Configure URLs in Settings First');
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
      toast.error('Error: Failed to Load from URLs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (settings.autoLoad && (settings.m3uUrl || settings.xmltvUrl)) {
      loadFromUrls();
    } else if (!settings.m3uUrl && !settings.xmltvUrl) {
      // First startup - no sources configured
      const hasSeenWelcome = localStorage.getItem('tvx-welcome-shown');
      if (!hasSeenWelcome && settings.showNotifications) {
        setTimeout(() => {
          toast.info('Welcome: Please Configure M3U and XMLTV Sources to Get Started');
          setSettingsOpen(true);
          localStorage.setItem('tvx-welcome-shown', 'true');
        }, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoLoad, settings.m3uUrl, settings.xmltvUrl]);

  // Keep refs in sync with state
  useEffect(() => {
    fullGuideOpenRef.current = fullGuideOpen;
  }, [fullGuideOpen]);

  useEffect(() => {
    focusedProgramRef.current = focusedProgram;
  }, [focusedProgram]);

  useEffect(() => {
    settingsOpenRef.current = settingsOpen;
  }, [settingsOpen]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let scrollTimeout: NodeJS.Timeout;
    let posterTimeout: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      if (!theaterMode) {
        setSidebarVisible(true);
      }
      clearTimeout(timeout);
      clearTimeout(posterTimeout);
      
      // Different idle times based on context:
      // - Settings open: 20s (user is configuring)
      // - Full guide with popup open: 25s (user is reading program details)
      // - Scrolling: 10s (user is actively navigating)  
      // - Default: 3s (normal viewing)
      // - Full guide or focused program: Don't use 3s timeout, use 10s instead
      let idleTime: number;
      if (settingsOpen) {
        idleTime = 20000;
      } else if (focusedProgram && fullGuideOpen) {
        idleTime = 25000; // 25s when popup is open in full guide
      } else if (fullGuideOpen || focusedProgram) {
        idleTime = 10000;
      } else if (isScrolling) {
        idleTime = 10000;
      } else {
        idleTime = 3000;
      }
      
      // Close poster at 9s when in full guide mode (before idle timeout at 10s)
      if (fullGuideOpen && selectedPoster) {
        posterTimeout = setTimeout(() => {
          setSelectedPoster(null);
        }, 9000);
      }
      
      // Set the idle timeout - will trigger based on context
      timeout = setTimeout(() => {
        setIsIdle(true);
        setSidebarVisible(false);
        setSelectedPoster(null); // Close poster when idle
        // Note: focusedProgram popup stays open even when idle
      }, idleTime);
    };

    const handleScrollStart = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      resetIdle(); // Reset idle timer when scrolling starts
    };

    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // Consider scrolling stopped after 1s of no scroll events
    };

    // Add scroll listeners to specific scrollable areas
    const scrollableElements = [
      channelListRef.current,
      epgViewRef.current,
      settingsRef.current,
      fullGuideRef.current,
      // Also listen to any ScrollArea viewports that might be dynamically created
      ...Array.from(document.querySelectorAll('[data-radix-scroll-area-viewport]')),
      // Also listen to any elements with overflow scroll
      ...Array.from(document.querySelectorAll('.overflow-auto, .overflow-y-auto'))
    ].filter(Boolean);

    scrollableElements.forEach((element) => {
      element?.addEventListener('scroll', handleScrollStart, { passive: true });
      element?.addEventListener('scroll', handleScrollEnd, { passive: true });
    });

    // Also listen for wheel events (desktop scrolling)
    const handleWheel = (e: WheelEvent) => {
      // Check if the event target is within our scrollable areas
      const target = e.target as Element;
      const isInScrollableArea = scrollableElements.some(el => el.contains(target));
      if (isInScrollableArea && Math.abs(e.deltaY) > 0) {
        handleScrollStart();
        // For wheel events, reset the scroll timeout to extend the scrolling state
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 1000);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('click', resetIdle);
    resetIdle(); // initial

    return () => {
      clearTimeout(timeout);
      clearTimeout(scrollTimeout);
      clearTimeout(posterTimeout);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('wheel', handleWheel);

      scrollableElements.forEach((element) => {
        element?.removeEventListener('scroll', handleScrollStart);
        element?.removeEventListener('scroll', handleScrollEnd);
      });
    };
  }, [fullGuideOpen, settingsOpen, selectedPoster, isScrolling, focusedProgram, theaterMode]);

  useEffect(() => {
    if (fullGuideOpen) {
      let expansionTimer: NodeJS.Timeout;
      
      const resetExpansionTimer = () => {
        clearTimeout(expansionTimer);
        const expansionTime = focusedProgram ? 25000 : 10000; // 25s with popup, 10s without
        expansionTimer = setTimeout(() => {
          // Close full guide after idle timeout so video player can resize properly
          setFullGuideOpen(false);
          setFullGuideExpanded(false);
          // Keep sidebar visible when guide closes
          setSidebarVisible(true);
        }, expansionTime);
      };

      // Listen for user activity to reset the expansion timer
      const handleActivity = () => {
        resetExpansionTimer();
      };

      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('wheel', handleActivity);
      
      resetExpansionTimer(); // Start initial timer

      return () => {
        clearTimeout(expansionTimer);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('wheel', handleActivity);
      };
    } else {
      setFullGuideExpanded(false);
      setSidebarVisible(true);
    }
  }, [fullGuideOpen, focusedProgram]);

  // Show sidebar when poster is selected in full guide
  useEffect(() => {
    if (selectedPoster && fullGuideOpen) {
      setSidebarVisible(true);
    }
  }, [selectedPoster, fullGuideOpen]);

  // Auto-scroll main timeline to show current time
  useEffect(() => {
    if (fullGuideOpen && fullGuideExpanded && mainTimelineRef.current) {
      const now = new Date();
      const baseTime = new Date(now);
      baseTime.setMinutes(0, 0, 0);
      baseTime.setHours(baseTime.getHours() - 1);
      const minutesFromBase = (now.getTime() - baseTime.getTime()) / 1000 / 60;
      const currentTimePosition = minutesFromBase * 4; // 4px per minute
      // Scroll to position where current time is visible, with some padding to the left
      mainTimelineRef.current.scrollLeft = Math.max(0, currentTimePosition - 200);
    }
  }, [fullGuideOpen, fullGuideExpanded]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fullGuideExpanded) {
      const handleMouseMove = () => {
        setFullGuideExpanded(false);
        setSidebarVisible(true);
      };

      const handleScroll = () => {
        setFullGuideExpanded(false);
        setSidebarVisible(true);
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Also listen for scroll events on the full guide
      const fullGuideElement = fullGuideRef.current;
      if (fullGuideElement) {
        fullGuideElement.addEventListener('scroll', handleScroll, { passive: true });
        // Also listen on child scrollable elements
        const scrollableChildren = fullGuideElement.querySelectorAll('[data-radix-scroll-area-viewport], .overflow-auto, .overflow-x-auto, .overflow-y-auto');
        scrollableChildren.forEach((element) => {
          element.addEventListener('scroll', handleScroll, { passive: true });
        });
      }

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (fullGuideElement) {
          fullGuideElement.removeEventListener('scroll', handleScroll);
          const scrollableChildren = fullGuideElement.querySelectorAll('[data-radix-scroll-area-viewport], .overflow-auto, .overflow-x-auto, .overflow-y-auto');
          scrollableChildren.forEach((element) => {
            element.removeEventListener('scroll', handleScroll);
          });
        }
      };
    }
  }, [fullGuideExpanded]);

  useEffect(() => {
    document.body.style.cursor = isIdle ? 'none' : 'default';
  }, [isIdle]);

  useKeyboardShortcuts({
    onSettings: () => {
      setTheaterMode(false);
      setSettingsOpen(true);
    },
    onFullscreen: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    onToggleGuide: () => {
      setTheaterMode(false);
      setFullGuideOpen(!fullGuideOpen);
      toast.info(fullGuideOpen ? 'Closed: Full TV Guide' : 'Opened: Full TV Guide');
    },
    onToggleStats: () => {
      setTheaterMode(false);
      setStatsOpen(!statsOpen);
      toast.info(statsOpen ? 'Closed: Stats' : 'Opened: Stats');
    },
    onToggleMute: () => {
      setMuted(!muted);
      toast.info(!muted ? 'Muted: Audio' : 'Unmuted: Audio');
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

  // Scroll selected channel into view in full guide
  useEffect(() => {
    if (fullGuideOpen && selectedChannelRowRef.current) {
      selectedChannelRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedChannel, fullGuideOpen]);

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

  const handleVideoPlayerClick = () => {
    // 3-state cycle: Full TV Guide → Normal View → Theater Mode → Full TV Guide
    
    if (fullGuideOpen) {
      // State 1: Full TV Guide is open → Go to Normal View
      setFullGuideOpen(false);
      setFullGuideExpanded(false);
      setFocusedProgram(null);
      setSelectedPoster(null);
      setTheaterMode(false);
      setIsIdle(false);
      setSidebarVisible(true);
      setActiveTab('guide'); // Show EPG panels
      
    } else if (!theaterMode && sidebarVisible) {
      // State 2: Normal View (sidebar + EPG visible) → Go to Theater Mode
      setTheaterMode(true);
      setIsIdle(true);
      setSidebarVisible(false);
      setSettingsOpen(false);
      
    } else {
      // State 3: Theater Mode → Go to Full TV Guide
      setTheaterMode(false);
      setFullGuideOpen(true);
      setIsIdle(false);
      setSidebarVisible(true);
    }
  };

  return (
    <div className={`h-screen grid overflow-hidden ${sidebarVisible ? 'lg:grid-cols-[75%_25%]' : 'grid-cols-[1fr]'} ${settings.panelStyle === 'shadow' ? 'bg-slate-950' : 'bg-background'}`}>
      <main className={`space-y-6 h-full ${sidebarVisible ? 'pt-4 pl-4' : 'p-[30px]'}`}>
        <div onClick={handleVideoPlayerClick} className="cursor-pointer">
          <VideoPlayer channel={selectedChannel} settings={settings} muted={muted} isFullGuide={fullGuideOpen} isFullGuideExpanded={fullGuideExpanded} />
        </div>
        
        {selectedChannel && !fullGuideOpen && activeTab === 'guide' && (
          <div ref={epgViewRef}>
            <EPGView key={selectedChannel.id} programs={currentPrograms} channelName={selectedChannel.name} isIdle={isIdle} onPosterClick={handlePosterToggle} selectedPoster={selectedPoster} panelStyle={settings.panelStyle} />
          </div>
        )}
        
        {selectedChannel && fullGuideOpen && !fullGuideExpanded && (
          <div key={guideResetKey} className={`h-[50vh] ${getPanelClasses('rounded-lg relative')}`}>
            <div className="absolute top-2 left-2 z-30 flex gap-2">
              <div className={`text-sm font-bold px-3 py-1 bg-background/80 ${settings.panelStyle === 'shadow' ? 'shadow-md' : 'border border-border'} rounded-md`}>
                Full TV Guide
              </div>
              <div className={`text-sm font-normal px-3 py-1 bg-background/80 ${settings.panelStyle === 'shadow' ? 'shadow-md' : 'border border-border'} rounded-md`}>
                {currentTime.toLocaleDateString('en-GB', { weekday: 'long' })}
              </div>
              <div className={`text-sm font-normal px-3 py-1 bg-background/80 ${settings.panelStyle === 'shadow' ? 'shadow-md' : 'border border-border'} rounded-md`}>
                {currentTime.getDate()}{['th', 'st', 'nd', 'rd'][(currentTime.getDate() % 10 > 3 || Math.floor(currentTime.getDate() % 100 / 10) === 1) ? 0 : currentTime.getDate() % 10]} {currentTime.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="absolute top-2 right-2 z-30 flex gap-2">
              <button
                className={`w-8 h-8 flex items-center justify-center bg-background/80 hover:bg-background ${settings.panelStyle === 'shadow' ? 'shadow-md' : 'border border-border'} rounded-md transition-colors`}
                onClick={() => {
                  // Increment key to force instant remount
                  setGuideResetKey(prev => prev + 1);
                }}
                title="Reset to Current Time"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center bg-background/80 hover:bg-background ${settings.panelStyle === 'shadow' ? 'shadow-md' : 'border border-border'} rounded-md transition-colors`}
                onClick={() => setFullGuideOpen(false)}
                title="Close Full TV Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={fullGuideRef} className="h-full overflow-auto pt-12">
            {focusedProgram ? (
              <div className="flex flex-1 h-full relative">
                {/* Dimmed background */}
                <div className="absolute inset-0 bg-black/50 z-10" onClick={() => setFocusedProgram(null)} />
                {/* Expanded program */}
                <div className={`absolute z-20 ${getPanelClasses('rounded-lg p-6 shadow-lg')} w-[420px] min-w-[420px]`} 
                     style={{ 
                       left: Math.max(200, Math.min(window.innerWidth - 450, (focusedProgram.program.start.getTime() - new Date().getTime()) / 1000 / 60 * 4 + 200)), 
                       top: (() => {
                         const channelIndex = channels.findIndex(c => c.id === focusedProgram.program.channelId);
                         // Account for: header (48px) + channel rows (48px each) + scroll offset
                         const scrollOffset = fullGuideRef.current?.scrollTop || 0;
                         const headerHeight = 48;
                         const channelRowTop = headerHeight + (channelIndex * 48);
                         // Position relative to viewport, accounting for scroll
                         const viewportRelativeTop = channelRowTop - scrollOffset - 290; // Move up 290px
                         const popupHeight = 400;
                         const containerHeight = fullGuideRef.current?.clientHeight || window.innerHeight * 0.65;
                         // Clamp to visible area with padding
                         return Math.max(20, Math.min(viewportRelativeTop, containerHeight - popupHeight - 20)) + 'px';
                       })()
                     }}>
                  <button 
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-muted rounded"
                    onClick={() => setFocusedProgram(null)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-start gap-4 mb-4 w-full">
                    {/* Poster artwork or channel logo with channel name */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 w-32">
                      {(focusedProgram.program.image || focusedProgram.program.icon) ? (
                        <img
                          src={focusedProgram.program.image || focusedProgram.program.icon}
                          alt="Poster"
                          className="w-32 h-auto max-h-[200px] object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const searchYear = focusedProgram.program.year 
                              ? (typeof focusedProgram.program.year === 'number' && focusedProgram.program.year > 9999
                                  ? String(focusedProgram.program.year).substring(0, 4)
                                  : focusedProgram.program.year)
                              : '';
                            const googleSearchQuery = searchYear 
                              ? `${focusedProgram.program.title} (${searchYear})`
                              : focusedProgram.program.title;
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`, '_blank');
                          }}
                        />
                      ) : focusedProgram.channel.logo ? (
                        <img
                          src={focusedProgram.channel.logo}
                          alt={`${focusedProgram.channel.name} logo`}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : null}
                      {/* Channel name with icon */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {focusedProgram.channel.name.toLowerCase().includes('movie') ? (
                          <Clapperboard className="w-3 h-3" />
                        ) : (
                          <Tv className="w-3 h-3" />
                        )}
                        <span className="text-center">
                          {focusedProgram.channel.name.replace(/\b(movies?|shows?)\b/gi, '').trim()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{focusedProgram.program.title}</h3>
                        {(() => {
                          const now = new Date();
                          const isNowPlaying = focusedProgram.program.start <= now && focusedProgram.program.end > now;
                          if (isNowPlaying) {
                            return (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500 text-white flex items-center gap-0.5">
                                <Play className="w-2 h-2 fill-white" />
                                NOW
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      {focusedProgram.program.subTitle && (
                        <h4 className="text-base font-semibold mb-1 text-white italic">{focusedProgram.program.subTitle}</h4>
                      )}
                      <div className="text-sm text-muted-foreground mb-1">
                        <Play className="w-3 h-3 inline mr-1" />
                        {focusedProgram.program.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - {focusedProgram.program.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {Math.round((focusedProgram.program.end.getTime() - focusedProgram.program.start.getTime()) / 1000 / 60)}min
                      </div>
                      {focusedProgram.program.season && focusedProgram.program.episode && (
                        <div className="text-sm text-white mb-1 italic font-medium">
                          Season {focusedProgram.program.season} Episode {focusedProgram.program.episode}
                        </div>
                      )}
                      {focusedProgram.program.description && (
                        <p className="text-sm mb-2 line-clamp-4">
                          {focusedProgram.program.description}
                        </p>
                      )}
                      {/* Year and More Info link */}
                      <div className="text-sm flex items-center gap-3 mb-2">
                        {focusedProgram.program.year && (
                          <span>
                            <span className="font-medium">Year:</span> {typeof focusedProgram.program.year === 'number' && focusedProgram.program.year > 9999
                              ? String(focusedProgram.program.year).substring(0, 4)
                              : focusedProgram.program.year}
                          </span>
                        )}
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            focusedProgram.program.year 
                              ? `${focusedProgram.program.title} (${typeof focusedProgram.program.year === 'number' && focusedProgram.program.year > 9999
                                  ? String(focusedProgram.program.year).substring(0, 4)
                                  : focusedProgram.program.year})`
                              : focusedProgram.program.title
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          More Info
                        </a>
                      </div>
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
                  <div className={`w-48 flex-shrink-0 overflow-y-auto ${settings.panelStyle === 'shadow' ? '' : 'border-r border-border'}`}>
                    <div className={`h-16 bg-muted flex items-center px-4 font-semibold ${settings.panelStyle === 'shadow' ? '' : 'border-b border-border'}`}>Channel</div>
                    {channels.map((channel, index) => {
                      const cleanName = channel.name.replace(/\b(movies?|shows?|history|doc|documentary)\b/gi, '').trim();
                      const isMovie = channel.name.toLowerCase().includes('movie') || channel.group?.toLowerCase().includes('movie');
                      const isShow = channel.name.toLowerCase().includes('show') || channel.group?.toLowerCase().includes('show');
                      const isHistory = channel.name.toLowerCase().includes('history') || channel.group?.toLowerCase().includes('history');
                      const isDoc = channel.name.toLowerCase().includes('doc') || channel.group?.toLowerCase().includes('doc');
                      return (
                        <div 
                          key={channel.id} 
                          ref={channel.id === selectedChannel?.id ? selectedChannelRowRef : null}
                          className={`h-16 flex items-center px-3 cursor-pointer hover:bg-secondary/50 ${settings.panelStyle === 'shadow' ? '' : 'border-b border-border'} ${channel.id === selectedChannel?.id ? 'bg-gradient-primary text-primary-foreground' : index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}`} 
                          onClick={() => {
                            setSelectedChannel(channel);
                            // Show poster for current program of clicked channel
                            const currentProg = getCurrentProgram(channel);
                            if (currentProg && (currentProg.image || currentProg.icon)) {
                              setSelectedPoster(currentProg);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {channel.logo ? (
                              <img
                                src={channel.logo}
                                alt={`${channel.name} logo`}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                                <Tv className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{cleanName}</p>
                            </div>
                            <div>
                              {isMovie && <Clapperboard className="w-3 h-3 text-muted-foreground" />}
                              {isShow && <Tv className="w-3 h-3 text-muted-foreground" />}
                              {isHistory && <History className="w-3 h-3 text-muted-foreground" />}
                              {isDoc && <History className="w-3 h-3 text-muted-foreground" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Add padding at bottom to allow scrolling to last channel */}
                    <div className="h-[calc(65vh-200px)]"></div>
                  </div>
                  {/* Programs grid */}
                  <div className="flex-1">
                    {/* 12-hour timeline starting at current hour */}
                    <div className="relative" style={{ width: '2880px', height: channels.length * 64 + 64 + 'px' }}>
                      {/* Time headers */}
                      <div className={`absolute top-0 left-0 right-0 h-16 bg-muted flex ${settings.panelStyle === 'shadow' ? '' : 'border-b border-border'}`}>
                        {Array.from({ length: 12 }, (_, i) => {
                          const time = new Date();
                          time.setMinutes(0, 0, 0);
                          time.setHours(time.getHours() + i);
                          const hour = time.getHours();
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          return (
                            <div key={i} style={{ width: '240px' }} className={`flex items-center justify-start pl-2 text-sm font-medium ${settings.panelStyle === 'shadow' ? '' : 'border-r border-border'}`}>
                              {displayHour} {ampm}
                            </div>
                          );
                        })}
                      </div>
                      {/* Programs */}
                      {channels.map((channel, channelIndex) => {
                        const now = new Date();
                        const baseTime = new Date(now);
                        baseTime.setMinutes(0, 0, 0);
                        const endTime = new Date(baseTime);
                        endTime.setHours(endTime.getHours() + 12);
                        
                        // Filter, deduplicate, and sort programs to show only those within the 12-hour window
                        const visiblePrograms = (epgData[channel.id] || [])
                          .filter(program => {
                            // Show program if it starts before the end of the window and ends after the beginning
                            return program.start < endTime && program.end > baseTime;
                          })
                          // Deduplicate programs with same title and start time
                          .filter((program, index, self) => 
                            index === self.findIndex(p => 
                              p.title === program.title && 
                              p.start.getTime() === program.start.getTime()
                            )
                          )
                          .sort((a, b) => a.start.getTime() - b.start.getTime());
                        
                        return visiblePrograms.map((program, programIndex) => {
                          const now = new Date();
                          const baseTime = new Date(now);
                          baseTime.setMinutes(0, 0, 0);
                          
                          // Calculate the actual display start (clipped to base time if program started earlier)
                          const displayStart = program.start < baseTime ? baseTime : program.start;
                          const displayEnd = program.end;
                          
                          const startMinutes = (displayStart.getTime() - baseTime.getTime()) / 1000 / 60;
                          const durationMinutes = (displayEnd.getTime() - displayStart.getTime()) / 1000 / 60;
                          const left = Math.max(0, startMinutes * 4); // 4px per minute
                          const width = Math.max(40, durationMinutes * 4);
                          const showText = width >= 80; // Only show text if width is at least 80px
                          const top = channelIndex * 64 + 64;
                          const isFavorite = favorites.has(`${program.title}-${program.start.getTime()}`);
                          // Check if this program is currently playing AND on the selected channel
                          const isNowPlaying = program.start <= now && program.end > now && channel.id === selectedChannel?.id;
                          // Version 1: Alternating dark/light slate colors
                          // const colors = ['bg-slate-700/50', 'bg-slate-600/50'];
                          // Version 2: Alternating background/no background (comment out version 1, uncomment this)
                          const colors = ['bg-slate-700/40', 'bg-transparent'];
                          // Use program index for consistent alternating pattern
                          const selectedColor = colors[programIndex % colors.length];
                          
                          return (
                            <div
                              key={`${channel.id}-${program.start.getTime()}-${programIndex}`}
                              className={`absolute p-2 ${isNowPlaying ? 'ring-2 ring-cyan-400 bg-cyan-900/30' : selectedColor} text-white rounded cursor-pointer hover:opacity-80`}
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
                              {showText && (
                                <>
                                  <div className="font-semibold text-xs truncate">{program.title}</div>
                                  <div className="text-xs opacity-90 truncate">
                                    <Play className="w-2 h-2 inline mr-1" />
                                    {program.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({Math.round((program.end.getTime() - program.start.getTime()) / 1000 / 60)}min)
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        });
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 overflow-auto">
                {/* Channel column */}
                <div className={`w-48 flex-shrink-0 ${settings.panelStyle === 'shadow' ? '' : 'border-r border-border'}`}>
                  <div className={`h-12 bg-muted flex items-center px-4 font-semibold ${settings.panelStyle === 'shadow' ? '' : 'border-b border-border'}`}>Channel</div>
                  {channels.map((channel, index) => {
                    const cleanName = channel.name.replace(/\b(movies?|shows?|history|doc|documentary)\b/gi, '').trim();
                    const isMovie = channel.name.toLowerCase().includes('movie') || channel.group?.toLowerCase().includes('movie');
                    const isShow = channel.name.toLowerCase().includes('show') || channel.group?.toLowerCase().includes('show');
                    const isHistory = channel.name.toLowerCase().includes('history') || channel.group?.toLowerCase().includes('history');
                    const isDoc = channel.name.toLowerCase().includes('doc') || channel.group?.toLowerCase().includes('doc');
                    return (
                      <div 
                        key={channel.id} 
                        ref={channel.id === selectedChannel?.id ? selectedChannelRowRef : null}
                        className={`h-12 flex items-center px-3 cursor-pointer hover:bg-secondary/50 ${settings.panelStyle === 'shadow' ? '' : 'border-b border-border'} ${channel.id === selectedChannel?.id ? 'bg-gradient-primary text-primary-foreground' : index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}`} 
                        onClick={() => {
                          setSelectedChannel(channel);
                          // Show poster for current program of clicked channel
                          const currentProg = getCurrentProgram(channel);
                          if (currentProg && (currentProg.image || currentProg.icon)) {
                            setSelectedPoster(currentProg);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {channel.logo ? (
                            <img
                              src={channel.logo}
                              alt={`${channel.name} logo`}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                              <Tv className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{cleanName}</p>
                          </div>
                          <div>
                            {isMovie && <Clapperboard className="w-3 h-3 text-muted-foreground" />}
                            {isShow && <Tv className="w-3 h-3 text-muted-foreground" />}
                            {isHistory && <History className="w-3 h-3 text-muted-foreground" />}
                            {isDoc && <History className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Add padding at bottom to allow scrolling to last channel */}
                  <div className="h-screen"></div>
                </div>
                {/* Programs grid */}
                <div ref={mainTimelineRef} className="flex-1 overflow-x-auto">
                  {/* 13-hour timeline: 1 hour past + 12 hours future */}
                  <div className="relative" style={{ width: '3120px', height: channels.length * 48 + 48 + 'px' }}>
                    {/* Time headers */}
                    <div className={`absolute top-0 left-0 right-0 h-12 bg-muted flex ${settings.panelStyle === 'shadow' ? '' : 'border-b border-border'}`}>
                      {Array.from({ length: 13 }, (_, i) => {
                        const time = new Date();
                        time.setMinutes(0, 0, 0);
                        // Start from 1 hour ago
                        time.setHours(time.getHours() - 1 + i);
                        const hour = time.getHours();
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        return (
                          <div key={i} style={{ width: '240px' }} className={`flex items-center justify-start pl-2 text-sm font-medium ${settings.panelStyle === 'shadow' ? '' : 'border-r border-border'}`}>
                            {displayHour} {ampm}
                          </div>
                        );
                      })}
                    </div>
                    {/* Current time indicator line */}
                    {(() => {
                      const now = new Date();
                      const baseTime = new Date(now);
                      baseTime.setMinutes(0, 0, 0);
                      baseTime.setHours(baseTime.getHours() - 1);
                      const minutesFromBase = (now.getTime() - baseTime.getTime()) / 1000 / 60;
                      const leftPosition = minutesFromBase * 4; // 4px per minute
                      return (
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 z-10 pointer-events-none"
                          style={{ left: `${leftPosition}px`, backgroundColor: '#00d9ff', boxShadow: '0 0 10px #00d9ff' }}
                        >
                          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#00d9ff', boxShadow: '0 0 5px #00d9ff' }}></div>
                        </div>
                      );
                    })()}
                    {/* Programs */}
                    {channels.map((channel, channelIndex) => {
                      const now = new Date();
                      const baseTime = new Date(now);
                      baseTime.setMinutes(0, 0, 0);
                      // Start from 1 hour ago
                      baseTime.setHours(baseTime.getHours() - 1);
                      const endTime = new Date(baseTime);
                      endTime.setHours(endTime.getHours() + 13); // 13 hours total
                      
                      // Filter, deduplicate, and sort programs
                      const visiblePrograms = (epgData[channel.id] || [])
                        .filter(program => {
                          // Show program if it overlaps with the viewing window
                          return program.start < endTime && program.end > baseTime;
                        })
                        // Deduplicate programs with same title and start time
                        .filter((program, index, self) => 
                          index === self.findIndex(p => 
                            p.title === program.title && 
                            p.start.getTime() === program.start.getTime()
                          )
                        )
                        .sort((a, b) => a.start.getTime() - b.start.getTime());
                      
                      return visiblePrograms.map((program, programIndex) => {
                        const now = new Date();
                        const baseTime = new Date(now);
                        baseTime.setMinutes(0, 0, 0);
                        baseTime.setHours(baseTime.getHours() - 1);
                        
                        // Calculate display start (clipped to base time if program started earlier)
                        const displayStart = program.start < baseTime ? baseTime : program.start;
                        const displayEnd = program.end;
                        
                        const startMinutes = (displayStart.getTime() - baseTime.getTime()) / 1000 / 60;
                        const durationMinutes = (displayEnd.getTime() - displayStart.getTime()) / 1000 / 60;
                        const left = Math.max(0, startMinutes * 4); // 4px per minute
                        const width = Math.max(40, durationMinutes * 4);
                        const showText = width >= 80; // Only show text if width is sufficient
                        const top = channelIndex * 48 + 48;
                        const isFavorite = favorites.has(`${program.title}-${program.start.getTime()}`);
                        // Check if this program is currently playing AND on the selected channel
                        const isNowPlaying = program.start <= now && program.end > now && channel.id === selectedChannel?.id;
                        // Version 1: Alternating dark/light slate colors
                        // const colors = ['bg-slate-700/50', 'bg-slate-600/50'];
                        // Version 2: Alternating background/no background (comment out version 1, uncomment this)
                        const colors = ['bg-slate-700/40', 'bg-transparent'];
                        // Use program index for consistent alternating pattern
                        const selectedColor = colors[programIndex % colors.length];
                        
                        return (
                          <div
                            key={`${channel.id}-${program.start.getTime()}-${programIndex}`}
                            className={`absolute p-2 ${isNowPlaying ? 'ring-2 ring-cyan-400 bg-cyan-900/30' : selectedColor} text-white rounded cursor-pointer hover:opacity-80`}
                            style={{ left: left + 'px', top: top + 'px', width: width + 'px', height: '40px' }}
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
                            {showText && (
                              <>
                                <div className="font-semibold text-xs truncate">{program.title}</div>
                                <div className="text-xs opacity-90 truncate">
                                  <Play className="w-2 h-2 inline mr-1" />
                                  {program.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({Math.round((program.end.getTime() - program.start.getTime()) / 1000 / 60)}min)
                                </div>
                              </>
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </main>
      {sidebarVisible && (
        <aside className={`flex flex-col h-full gap-4 p-4 transition-opacity duration-3000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
          <div className={`${getSidebarPanelClasses('rounded-lg')} transition-opacity duration-1000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">TVx</h1>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="scale-125">
                  <ClockDisplay time={currentTime} style={settings.clockStyle} />
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    document.documentElement.requestFullscreen();
                    toast.info('Entered: Fullscreen Mode');
                  }}
                  className="hover:bg-secondary"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newMutedState = !muted;
                    setMuted(newMutedState);
                    toast.info(newMutedState ? 'Muted: Audio' : 'Unmuted: Audio');
                  }}
                  className="hover:bg-secondary"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSettingsToggle}
                  className="hover:bg-secondary"
                  title={settingsOpen ? "Save Settings (Ctrl/Cmd + ,)" : "Settings (Ctrl/Cmd + ,)"}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          {!fullGuideOpen && (
            <Button
              variant="outline"
              onClick={() => {
                setTheaterMode(false);
                setFullGuideOpen(true);
                toast.info('Opened: Full TV Guide');
              }}
              className={`w-full ${settings.panelStyle === 'shadow' ? 'border-none shadow-md hover:shadow-lg' : ''}`}
            >
              Channel Guide
            </Button>
          )}
          {fullGuideOpen && (
            <Button
              variant="outline"
              onClick={() => { setActiveTab('guide'); setFullGuideOpen(false); }}
              className={`w-full ${settings.panelStyle === 'shadow' ? 'border-none shadow-md hover:shadow-lg' : ''}`}
            >
              Full TV Guide
            </Button>
          )}
          <div className={`${getSidebarPanelClasses('rounded-lg relative max-h-[500px]')}`}>
            {selectedPoster ? (
              <Poster program={selectedPoster} onClose={handleClosePoster} isIdle={isIdle} />
            ) : settingsOpen ? (
              <div ref={settingsRef}>
                <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={localSettings} onSave={setLocalSettings} onGlobalSave={updateSettings} inline />
              </div>
            ) : (
              <div ref={channelListRef} className="h-full overflow-y-auto">
                <ChannelList
                  channels={channels}
                  selectedChannel={selectedChannel}
                  panelStyle={settings.panelStyle}
                  onSelectChannel={(channel) => {
                    setSelectedChannel(channel);
                    // Show poster for current program when in full guide
                    if (fullGuideOpen) {
                      const currentProg = getCurrentProgram(channel);
                      if (currentProg && (currentProg.image || currentProg.icon)) {
                        setSelectedPoster(currentProg);
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
          {selectedChannel && !statsOpen && (
            <Button
              variant="outline"
              onClick={() => setStatsOpen(true)}
              className={`w-full ${settings.panelStyle === 'shadow' ? 'border-none shadow-md hover:shadow-lg' : ''}`}
            >
              Stats
            </Button>
          )}
          {selectedChannel && statsOpen && (
            <div className={`${getSidebarPanelClasses('rounded-lg relative')}`}>
              <div className="p-3 pr-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStatsOpen(false)}
                  className="absolute top-1 right-1 h-5 w-5 hover:bg-secondary"
                >
                  <X className="w-3 h-3" />
                </Button>
                <div 
                  className="font-mono text-[10px] cursor-pointer hover:text-primary break-all" 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedChannel.url);
                    toast.success('Copied: Stream URL');
                  }}
                  title="Click to copy URL"
                >
                  {selectedChannel.url}
                </div>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};

export default Index;
