import { Program } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Star, Play } from "lucide-react";
import { useState } from "react";

interface EPGViewProps {
  programs: Program[];
  channelName: string;
  isIdle: boolean;
  onPosterClick: (program: Program) => void;
  selectedPoster?: Program | null;
  panelStyle?: 'bordered' | 'shadow';
}

export const EPGView = ({ programs, channelName, isIdle, onPosterClick, selectedPoster, panelStyle = 'bordered' }: EPGViewProps) => {
  const now = new Date();
  
  const currentProgram = programs.find(
    p => p.start <= now && p.end > now
  );
  
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('tvx-favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${minutes}min`;
  };

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

  const isFavorite = (program: Program) => {
    const key = `${program.title}-${program.start.getTime()}`;
    return favorites.has(key);
  };

  const truncateWords = (text: string, maxWords: number, maxChars?: number) => {
    if (!text) return text;
    
    // Simple character limit from the beginning of the entire title
    if (maxChars && text.length > maxChars) {
      const charTruncated = text.slice(0, maxChars).trim();
      console.log('CHAR TRUNCATED TO:', charTruncated + '...');
      return charTruncated + '...';
    }
    
    // Then check word limit on entire text
    const words = text.split(' ');
    if (words.length > maxWords) {
      const wordTruncated = words.slice(0, maxWords).join(' ');
      // After word truncation, check if it still exceeds char limit
      if (maxChars && wordTruncated.length > maxChars) {
        const charTruncated = wordTruncated.slice(0, maxChars).trim();
        return charTruncated + '...';
      }
      console.log('WORD TRUNCATED TO:', wordTruncated + '...');
      return wordTruncated + '...';
    }
    
    console.log('NO TRUNCATION NEEDED');
    return text;
  };

  if (programs.length === 0) {
    return (
      <Card className={`p-6 ${panelStyle === 'shadow' ? 'bg-card/95 shadow-md border-none' : 'bg-card border-border'}`}>
        <p className="text-muted-foreground">No EPG data available for this channel</p>
      </Card>
    );
  }

  const cleanName = channelName.replace(/\b(movies?|shows?)\b/gi, '').trim();

  return (
    <ScrollArea className="h-[200px]">
      <div className={`space-y-4 transition-opacity duration-3000 ${isIdle ? 'opacity-5' : 'opacity-100'}`}>
        {currentProgram && (
          <Card className={`p-4 bg-gradient-to-br from-slate-700 to-slate-800 relative w-full ${panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-slate-600 shadow-glow'}`}>
            <div className="flex items-start gap-3">
              {(currentProgram.image || currentProgram.icon) && (
                <img
                  src={currentProgram.image || currentProgram.icon}
                  alt={currentProgram.title}
                  className="w-20 h-20 rounded object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    // Toggle poster: if this program is already selected, close it (pass null)
                    if (selectedPoster && selectedPoster.title === currentProgram.title && 
                        selectedPoster.start.getTime() === currentProgram.start.getTime()) {
                      onPosterClick(null as any);
                    } else {
                      onPosterClick(currentProgram);
                    }
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="absolute top-2 right-2 bg-background/20 rounded px-2 py-0.5 text-xs font-medium">
                  Now Playing <Play className="w-3 h-3 inline" /> {formatTime(currentProgram.start)}
                </div>
                <h3 className="font-bold text-lg mb-1">
                  {truncateWords(
                    currentProgram.title + (currentProgram.subTitle ? ` - ${currentProgram.subTitle}` : ''),
                    13,
                    69
                  )}
                  {currentProgram.season && currentProgram.episode && <span className="italic"> (Episode {currentProgram.episode})</span>}
                </h3>
                <div className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(currentProgram.start, currentProgram.end)}</span>
                </div>
                <Star 
                  className={`absolute bottom-3 right-3 w-4 h-4 cursor-pointer ${isFavorite(currentProgram) ? 'fill-white text-white opacity-50' : 'text-muted-foreground'}`} 
                  onClick={() => toggleFavorite(currentProgram)} 
                />
                {currentProgram.description && (
                  <p className="text-sm text-foreground/90 line-clamp-2">{truncateWords(currentProgram.description, 42)}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          {programs.filter(p => p.start > now).map((program, index) => (
            <Card key={index} className={`p-4 hover:bg-secondary/50 transition-colors relative ${panelStyle === 'shadow' ? 'bg-card/95 shadow-md border-none' : 'bg-card border-border'}`}>
              <div className="absolute top-2 right-2 rounded px-3 py-1 text-xs font-medium flex items-center gap-1 text-white">
                <Play className="w-3 h-3" />
                {formatTime(program.start)}
              </div>
              <div className="flex items-start gap-3">
                {(program.image || program.icon) && (
                  <img
                    src={program.image || program.icon}
                    alt={program.title}
                    className="w-16 h-16 rounded object-cover flex-shrink-0 cursor-pointer"
                    onClick={() => {
                      // Toggle poster: if this program is already selected, close it (pass null)
                      if (selectedPoster && selectedPoster.title === program.title && 
                          selectedPoster.start.getTime() === program.start.getTime()) {
                        onPosterClick(null as any);
                      } else {
                        onPosterClick(program);
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Star 
                    className={`absolute bottom-2 right-2 w-4 h-4 cursor-pointer ${isFavorite(program) ? 'fill-white text-white opacity-50' : 'text-muted-foreground'}`} 
                    onClick={() => toggleFavorite(program)} 
                  />
                  <h4 className="font-semibold mb-1">
                    {truncateWords(
                      program.title + (program.subTitle ? ` - ${program.subTitle}` : ''),
                      13,
                      69
                    )}
                    {program.season && program.episode && <span className="italic"> (Episode {program.episode})</span>}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(program.start, program.end)}</span>
                    {program.category && (
                      <>
                        <span>•</span>
                        <span>{program.category}</span>
                      </>
                    )}
                  </div>
                  {program.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncateWords(program.description, 42)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
