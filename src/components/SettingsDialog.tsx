import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AppSettings } from "@/types/iptv";
import { Save, Keyboard, X, Link, FileText, Zap, Play, Sparkles, Film, Contrast, Focus, Droplets, Clock, Layers, Bell, ChevronDown, ChevronUp, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onGlobalSave?: (settings: AppSettings) => void;
  inline?: boolean;
}

export const SettingsDialog = ({ open, onOpenChange, settings, onSave, onGlobalSave, inline }: SettingsDialogProps) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Start 20 second timeout when settings open
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        handleClose();
        // Switch to theater mode after closing
        setTimeout(() => {
          if (onGlobalSave) {
            onGlobalSave({ ...localSettings, vintageTV: true });
          }
          toast.info('Entering theater mode');
        }, 100);
      }, 20000); // 20 seconds
      setTimeoutId(id);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open]);

  // Auto-save for immediate changes (toggles, selects, sliders) with notifications
  const updateSetting = (newSettings: AppSettings, notification?: string) => {
    setLocalSettings(newSettings);
    if (onGlobalSave) {
      onGlobalSave(newSettings);
    }
    if (notification && newSettings.showNotifications) {
      toast.info(notification);
    }
  };

  // For text inputs, just update local state (will save on blur or close)
  const updateLocalSetting = (newSettings: AppSettings) => {
    setLocalSettings(newSettings);
  };

  const handleClose = () => {
    // Save any pending text input changes
    if (onGlobalSave) {
      onGlobalSave(localSettings);
    }
    onSave(localSettings);
    onOpenChange(false);
  };

  const content = (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          General
        </h3>
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Show Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Display toast notifications for actions
              </p>
            </div>
            <Switch
              checked={localSettings.showNotifications}
              onCheckedChange={(checked) => {
                const newSettings = { ...localSettings, showNotifications: checked };
                updateSetting(newSettings);
                if (checked) {
                  toast.info('Enabled: Notifications');
                }
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Sources
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="m3u-url" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              M3U Playlist URL
            </Label>
            <Input
              id="m3u-url"
              placeholder="https://example.com/playlist.m3u"
              value={localSettings.m3uUrl || ''}
              onChange={(e) => updateLocalSetting({ ...localSettings, m3uUrl: e.target.value })}
              className={`mt-1 bg-background ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-md' : ''}`}
            />
          </div>
          <div>
            <Label htmlFor="xmltv-url" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              XMLTV EPG URL
            </Label>
            <Input
              id="xmltv-url"
              placeholder="https://example.com/epg.xml"
              value={localSettings.xmltvUrl || ''}
              onChange={(e) => updateLocalSetting({ ...localSettings, xmltvUrl: e.target.value })}
              className={`mt-1 bg-background ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-md' : ''}`}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Playback
        </h3>
        <div>
          <Label htmlFor="quality" className="flex items-center gap-2">
            <Focus className="w-4 h-4" />
            Video Quality
          </Label>
          <Select
            value={localSettings.videoQuality}
            onValueChange={(value: any) => 
              updateSetting(
                { ...localSettings, videoQuality: value },
                `Video quality: ${value.charAt(0).toUpperCase() + value.slice(1)}`
              )
            }
          >
            <SelectTrigger id="quality" className={`mt-1 bg-background ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-md' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`bg-card ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-border'}`}>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              VHS Buffering Screen
            </Label>
            <p className="text-sm text-muted-foreground">
              VHS loading animation during buffering
            </p>
          </div>
          <Switch
            checked={localSettings.showLoadingVideo}
            onCheckedChange={(checked) => {
              const newSettings = { ...localSettings, showLoadingVideo: checked };
              updateSetting(newSettings);
              toast.info(checked ? 'Loading animation enabled' : 'Loading animation disabled');
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Vintage TV Effect
            </Label>
            <p className="text-sm text-muted-foreground">
              Retro CRT-style distortion & effects
            </p>
          </div>
          <Switch
            checked={localSettings.vintageTV}
            onCheckedChange={(checked) => {
              const newSettings = { ...localSettings, vintageTV: checked };
              updateSetting(newSettings);
              toast.info(checked ? 'Vintage TV filter enabled' : 'Vintage TV filter disabled');
            }}
          />
        </div>
        {localSettings.vintageTV && (
          <>
            <Separator />
            
            {/* Advanced TV Effects Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors text-sm"
            >
              <span className="font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Advanced TV Effects
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvanced && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Contrast className="w-4 h-4" />
                    Vignette Strength
              </Label>
              <Slider
                value={[localSettings.vignetteStrength]}
                onValueChange={(value) => updateSetting({ ...localSettings, vignetteStrength: value[0] })}
                max={1.0}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{localSettings.vignetteStrength.toFixed(2)}</span>
                <span>1.0</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Focus className="w-4 h-4" />
                Vignette Radius
              </Label>
              <Slider
                value={[localSettings.vignetteRadius]}
                onValueChange={(value) => updateSetting({ ...localSettings, vignetteRadius: value[0] })}
                max={1.0}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{localSettings.vignetteRadius.toFixed(2)}</span>
                <span>1.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Radius where vignette starts (0 = center, 1.0 = edges)
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Chromatic Aberration
              </Label>
              <Slider
                value={[localSettings.rgbShiftStrength]}
                onValueChange={(value) => updateSetting({ ...localSettings, rgbShiftStrength: value[0] })}
                max={0.01}
                min={0.0001}
                step={0.0001}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.0001</span>
                <span>{localSettings.rgbShiftStrength.toFixed(4)}</span>
                <span>0.01</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust color separation effect (0.0001 = subtle, 0.01 = strong)
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Edge Glass Mirage
              </Label>
              <Slider
                value={[localSettings.edgeAberration]}
                onValueChange={(value) => updateSetting({ ...localSettings, edgeAberration: value[0] })}
                max={10}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{localSettings.edgeAberration.toFixed(1)}</span>
                <span>10</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Subtle vaseline-like blur on outer 40px edge (0 = off)
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Frame Edge Blur
              </Label>
              <Slider
                value={[localSettings.frameEdgeBlur]}
                onValueChange={(value) => updateSetting({ ...localSettings, frameEdgeBlur: value[0] })}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{localSettings.frameEdgeBlur.toFixed(0)}px</span>
                <span>50</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Anti-aliased edge blur (2-5 = clean AA, 10-20 = soft blur, 30+ = heavy fade)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Center Sharpness
              </Label>
              <Slider
                value={[localSettings.centerSharpness]}
                onValueChange={(value) => updateSetting({ ...localSettings, centerSharpness: value[0] })}
                max={1.0}
                min={0}
                step={0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{localSettings.centerSharpness.toFixed(2)}</span>
                <span>1.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sharpens the center of the image with a feathered circle (0.2-0.4 = subtle, 0.6+ = strong)
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="sharpen-first" className="flex-1 text-sm cursor-pointer">
                Apply Sharpening First
              </Label>
              <Switch
                id="sharpen-first"
                checked={localSettings.sharpenFirst}
                onCheckedChange={(checked) => 
                  updateSetting(
                    { ...localSettings, sharpenFirst: checked },
                    checked ? 'Sharpening applied before effects' : 'Sharpening applied after effects'
                  )
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle whether sharpening is applied before (ON) or after (OFF) other CRT effects
            </p>
              </>
            )}
          </>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Appearance
        </h3>
        <div>
          <Label htmlFor="clock-style" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Clock Style
          </Label>
          <Select
            value={localSettings.clockStyle}
            onValueChange={(value: any) => {
              const styleNames: Record<string, string> = {
                'neon': 'Neon',
                'minimal': 'Minimal',
                'retro': 'Retro 7-Segment'
              };
              const newSettings = { ...localSettings, clockStyle: value };
              updateSetting(newSettings, `Clock style: ${styleNames[value]}`);
              const styleNames: Record<string, string> = {
                neon: 'Neon Blue',
                flip: 'Flip Clock',
                matrix: 'Matrix',
                digital: 'Digital LCD',
                minimal: 'Minimal',
                retro: 'Retro Red'
              };
              toast.info(`Clock style: ${styleNames[value] || value}`);
            }}
          >
            <SelectTrigger id="clock-style" className={`mt-1 bg-background ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-md' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`bg-card ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-border'}`}>
              <SelectItem value="neon">Neon Blue</SelectItem>
              <SelectItem value="flip">Flip Clock</SelectItem>
              <SelectItem value="matrix">Matrix (VHS Green)</SelectItem>
              <SelectItem value="digital">Digital LCD</SelectItem>
              <SelectItem value="minimal">Minimal Text</SelectItem>
              <SelectItem value="retro">Retro Red 7-Segment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Panel Style
            </Label>
            <p className="text-sm text-muted-foreground">
              Shadow style removes borders
            </p>
          </div>
          <Switch
            checked={localSettings.panelStyle === 'shadow'}
            onCheckedChange={(checked) => {
              const newSettings = { ...localSettings, panelStyle: (checked ? 'shadow' : 'bordered') as 'shadow' | 'bordered' };
              updateSetting(newSettings);
              toast.info(checked ? 'Shadow style enabled' : 'Bordered style enabled');
            }}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Up/Down Arrow
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
              ↑ / ↓
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Toggle Full TV Guide
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">G</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Toggle Stats
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">S</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Toggle Mute
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">M</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Settings
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
              .
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Toggle Fullscreen
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">F</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Play/Pause
            </span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">Space</kbd>
          </div>
        </div>
      </div>

      <Separator />
      
      <div className="flex items-center justify-center">
        <a
          href="https://github.com/dopeytree/TVx"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="h-[500px] flex flex-col relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 h-8 w-8 hover:bg-secondary"
        >
          <X className="w-4 h-4" />
        </Button>
        <ScrollArea className="flex-1">
          <div className="p-4 pr-12">
            {content}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl bg-card ${localSettings.panelStyle === 'shadow' ? 'border-none shadow-2xl' : 'border-border'}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your IPTV viewer preferences and sources
          </DialogDescription>
        </DialogHeader>

        {content}

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose} className={`${localSettings.panelStyle === 'shadow' ? 'border-none shadow-md hover:shadow-lg' : ''}`}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
