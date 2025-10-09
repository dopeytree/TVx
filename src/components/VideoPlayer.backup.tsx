import { useEffect, useRef } from "react";
import { Channel } from "@/types/iptv";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  channel: Channel | null;
}

export const VideoPlayer = ({ channel }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && channel) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  }, [channel]);

  if (!channel) {
    return (
      <Card className="aspect-video w-full flex items-center justify-center bg-gradient-card border-border">
        <p className="text-muted-foreground text-lg">Select a channel to start watching</p>
      </Card>
    );
  }

  return (
    <Card className="aspect-video w-full overflow-hidden bg-black border-border shadow-glow rounded-3xl" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(263 70% 60% / 0.3)' }}>
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay
      >
        <source src={channel.url} type="application/x-mpegURL" />
        <source src={channel.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </Card>
  );
};
