import { useEffect, useState } from 'react';

interface FlipClockProps {
  time: Date;
}

export const FlipClock = ({ time }: FlipClockProps) => {
  const [prevTime, setPrevTime] = useState(time);
  const [flipping, setFlipping] = useState({ hours: false, minutes: false });
  const [colonVisible, setColonVisible] = useState(true);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  const prevHours = prevTime.getHours().toString().padStart(2, '0');
  const prevMinutes = prevTime.getMinutes().toString().padStart(2, '0');

  useEffect(() => {
    if (hours !== prevHours) {
      setFlipping(prev => ({ ...prev, hours: true }));
      setTimeout(() => {
        setFlipping(prev => ({ ...prev, hours: false }));
        setPrevTime(time);
      }, 300);
    }
    if (minutes !== prevMinutes) {
      setFlipping(prev => ({ ...prev, minutes: true }));
      setTimeout(() => {
        setFlipping(prev => ({ ...prev, minutes: false }));
        setPrevTime(time);
      }, 300);
    }
  }, [time, hours, minutes, prevHours, prevMinutes]);

  // Flashing colon
  useEffect(() => {
    const interval = setInterval(() => {
      setColonVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-0.5 font-mono text-sm">
      <FlipDigit digit={hours[0]} flipping={flipping.hours} />
      <FlipDigit digit={hours[1]} flipping={flipping.hours} />
      <span className={`mx-0.5 transition-opacity duration-100 ${colonVisible ? 'opacity-100' : 'opacity-20'}`}>
        :
      </span>
      <FlipDigit digit={minutes[0]} flipping={flipping.minutes} />
      <FlipDigit digit={minutes[1]} flipping={flipping.minutes} />
    </div>
  );
};

interface FlipDigitProps {
  digit: string;
  flipping: boolean;
}

const FlipDigit = ({ digit, flipping }: FlipDigitProps) => {
  return (
    <div className="relative w-5 h-7 bg-gradient-to-b from-secondary/80 to-secondary rounded-sm overflow-hidden shadow-inner">
      <div className={`absolute inset-0 flex items-center justify-center text-foreground font-bold transition-transform duration-300 ${flipping ? 'animate-flip' : ''}`}>
        {digit}
      </div>
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      {/* Middle separator line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black/20" />
      {/* Bottom shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/30" />
    </div>
  );
};
