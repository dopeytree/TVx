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
import { AppSettings } from "@/types/iptv";
import { Save, Keyboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsDialog = ({ open, onOpenChange, settings, onSave }: SettingsDialogProps) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

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
