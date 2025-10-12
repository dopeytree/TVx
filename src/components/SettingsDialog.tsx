import { useState, useEffect } from "react";
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
import { Save, Keyboard, X } from "lucide-react";
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

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    if (onGlobalSave) {
      onGlobalSave(localSettings);
    }
    onOpenChange(false);
  };

  const content = (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sources</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="m3u-url">M3U Playlist URL</Label>
            <Input
              id="m3u-url"
              placeholder="https://example.com/playlist.m3u"
              value={localSettings.m3uUrl || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, m3uUrl: e.target.value })}
              className="mt-1 bg-background"
            />
          </div>
          <div>
            <Label htmlFor="xmltv-url">XMLTV EPG URL</Label>
            <Input
              id="xmltv-url"
              placeholder="https://example.com/epg.xml"
              value={localSettings.xmltvUrl || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, xmltvUrl: e.target.value })}
              className="mt-1 bg-background"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-load on startup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically load sources when app starts
              </p>
            </div>
            <Switch
              checked={localSettings.autoLoad}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, autoLoad: checked })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Playback</h3>
        <div>
          <Label htmlFor="quality">Video Quality</Label>
          <Select
            value={localSettings.videoQuality}
            onValueChange={(value: any) => 
              setLocalSettings({ ...localSettings, videoQuality: value })
            }
          >
            <SelectTrigger id="quality" className="mt-1 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Vintage TV Effect</Label>
            <p className="text-sm text-muted-foreground">
              Apply retro CRT-style distortion and effects
            </p>
          </div>
          <Switch
            checked={localSettings.vintageTV}
            onCheckedChange={(checked) =>
              setLocalSettings({ ...localSettings, vintageTV: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Loading Video</Label>
            <p className="text-sm text-muted-foreground">
              Show VHS loading animation during buffering
            </p>
          </div>
          <Switch
            checked={localSettings.showLoadingVideo}
            onCheckedChange={(checked) =>
              setLocalSettings({ ...localSettings, showLoadingVideo: checked })
            }
          />
        </div>
        {localSettings.vintageTV && (
          <div className="space-y-2">
            <Label>Vignette Strength</Label>
            <Slider
              value={[localSettings.vignetteStrength]}
              onValueChange={(value) => setLocalSettings({ ...localSettings, vignetteStrength: value[0] })}
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
        )}
        {localSettings.vintageTV && (
          <div className="space-y-2">
            <Label>Vignette Radius</Label>
            <Slider
              value={[localSettings.vignetteRadius]}
              onValueChange={(value) => setLocalSettings({ ...localSettings, vignetteRadius: value[0] })}
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
        )}
        {localSettings.vintageTV && (
          <div className="space-y-2">
            <Label>Chromatic Aberration</Label>
            <Slider
              value={[localSettings.rgbShiftStrength]}
              onValueChange={(value) => setLocalSettings({ ...localSettings, rgbShiftStrength: value[0] })}
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
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Open Settings</span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
              Ctrl/Cmd + ,
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Toggle Fullscreen</span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">F</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Play/Pause</span>
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">Space</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="h-[500px] flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Settings</h2>
            {content}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-primary flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your IPTV viewer preferences and sources
          </DialogDescription>
        </DialogHeader>

        {content}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
