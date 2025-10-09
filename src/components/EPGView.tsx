import { Program } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, Star } from "lucide-react";
import { useState } from "react";

interface EPGViewProps {
  programs: Program[];
  channelName: string;
}

export const EPGView = ({ programs, channelName }: EPGViewProps) => {
  const now = new Date();
  
  const currentProgram = programs.find(
    p => p.start <= now && p.end > now
  );
  
  const upcomingPrograms = programs.filter(
    p => p.start > now
  ).slice(0, 10);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${minutes}min`;
  };

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('tvx-favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set();
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

  const isFavorite = (program: Program) => {
    const key = `${program.title}-${program.start.getTime()}`;
    return favorites.has(key);
  };

  const truncateWords = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  };

  if (programs.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-muted-foreground">No EPG data available for this channel</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" />
        TV Guide - {channelName}
      </h2>

      {currentProgram && (
        <Card className="p-4 bg-gradient-primary border-primary shadow-glow relative">
          <div className="flex items-start gap-4">
            {(currentProgram.image || currentProgram.icon) && (
              <img
                src={currentProgram.image || currentProgram.icon}
                alt={currentProgram.title}
                className="w-24 h-24 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 pr-[100px] pb-6 pt-6">
              <div className="absolute top-2 right-2 bg-background/20 rounded px-3 py-1 text-sm font-medium">
                NOW PLAYING
              </div>
              <Star 
                className={`absolute bottom-2 right-5 w-4 h-4 cursor-pointer ${isFavorite(currentProgram) ? 'fill-white text-white opacity-50' : 'text-muted-foreground'}`} 
                onClick={() => toggleFavorite(currentProgram)} 
              />
              <h3 className="font-bold text-lg mb-1">{currentProgram.title}</h3>
              <div className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
                </span>
                <span>•</span>
                <span>{formatDuration(currentProgram.start, currentProgram.end)}</span>
              </div>
              {currentProgram.description && (
                <p className="text-sm text-foreground/90 line-clamp-2">{truncateWords(currentProgram.description, 42)}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Upcoming</h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {upcomingPrograms.map((program, index) => (
              <Card key={index} className="p-4 bg-card hover:bg-secondary/50 transition-colors border-border relative">
                <div className="absolute top-2 right-2 bg-background/20 rounded px-3 py-1 text-sm font-medium text-primary">
                  {formatTime(program.start)}
                </div>
                <Star 
                  className={`absolute bottom-2 right-5 w-4 h-4 cursor-pointer ${isFavorite(program) ? 'fill-white text-white opacity-50' : 'text-muted-foreground'}`} 
                  onClick={() => toggleFavorite(program)} 
                />
                <div className="flex items-start gap-3">
                  {(program.image || program.icon) && (
                    <img
                      src={program.image || program.icon}
                      alt={program.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0 pr-[100px] pb-6 pt-6">
                    <h4 className="font-semibold mb-1">{program.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
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
        </ScrollArea>
      </div>
    </div>
  );
};
