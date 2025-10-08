import { Program } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar } from "lucide-react";

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
        <Card className="p-4 bg-gradient-primary border-primary shadow-glow">
          <div className="flex items-start gap-3">
            <div className="bg-background/20 rounded px-3 py-1 text-sm font-medium">
              NOW
            </div>
            <div className="flex-1">
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
                <p className="text-sm text-foreground/90">{currentProgram.description}</p>
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
              <Card key={index} className="p-4 bg-card hover:bg-secondary/50 transition-colors border-border">
                <div className="flex items-start gap-3">
                  <div className="text-sm font-medium text-primary min-w-[80px]">
                    {formatTime(program.start)}
                  </div>
                  <div className="flex-1">
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
                        {program.description}
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
