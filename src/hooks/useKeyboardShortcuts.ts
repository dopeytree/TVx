import { useEffect } from 'react';

export const useKeyboardShortcuts = (callbacks: {
  onSettings?: () => void;
  onFullscreen?: () => void;
  onToggleGuide?: () => void;
  onToggleStats?: () => void;
  onToggleMute?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName);
      
      // , for settings (just comma, not Ctrl/Cmd + ,)
      if (event.key === ',') {
        if (!isTyping) {
          event.preventDefault();
          callbacks.onSettings?.();
        }
      }

      // F for fullscreen
      if (event.key === 'f' || event.key === 'F') {
        if (!isTyping) {
          event.preventDefault();
          callbacks.onFullscreen?.();
        }
      }

      // G for toggle full TV guide
      if (event.key === 'g' || event.key === 'G') {
        if (!isTyping) {
          event.preventDefault();
          callbacks.onToggleGuide?.();
        }
      }

      // S for toggle stats
      if (event.key === 's' || event.key === 'S') {
        if (!isTyping) {
          event.preventDefault();
          callbacks.onToggleStats?.();
        }
      }

      // M for toggle mute
      if (event.key === 'm' || event.key === 'M') {
        if (!isTyping) {
          event.preventDefault();
          callbacks.onToggleMute?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};
