import { Program } from "@/types/iptv";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface PosterProps {
  program: Program;
  onClose: () => void;
  isIdle?: boolean;
}

export const Poster = ({ program, onClose, isIdle }: PosterProps) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const searchYear = program.year 
    ? (typeof program.year === 'number' && program.year > 9999
        ? String(program.year).substring(0, 4)
        : program.year)
    : '';
  
  const googleSearchQuery = searchYear 
    ? `${program.title} (${searchYear})`
    : program.title;

  // Close poster when idle with smooth transition
  useEffect(() => {
    if (isIdle) {
      setIsClosing(true);
      // Delay actual close to allow fade-out animation
      const timer = setTimeout(() => {
        onClose();
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isIdle, onClose]);

  return (
    <div className={`p-4 space-y-2 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      
      <button
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        onClick={onClose}
        title="Close poster"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="text-center space-y-1">
        {/* 
        <h3 className="text-lg font-bold">{program.title}</h3>
        {program.subTitle && (
        <h4 className="text-base font-semibold text-primary italic">{program.subTitle}</h4>
        )}
        {program.credits?.director && program.credits.director.length > 0 && (
        <div className="text-sm">
            <span className="font-medium">Director:</span> {program.credits.director.join(', ')}
        </div>
        )}
        {program.credits?.actor && program.credits.actor.length > 0 && (
        <div className="text-sm">
            <span className="font-medium">Actors:</span> {program.credits.actor.slice(0, 2).join(', ')}
        </div>
        )} */}
        <div className="text-sm flex items-center justify-center gap-3">
          {program.year && (
            <span>
              <span className="font-medium">Year:</span> {searchYear}
            </span>
          )}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            More Info
          </a>
        </div>
        <img
        src={program.image || program.icon}
        alt="Poster"
        className="w-full h-auto max-h-[400px] object-contain rounded cursor-pointer hover:opacity-80 transition-opacity mx-auto block"
        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`, '_blank')}
      />
      </div>
    </div>
  );
};