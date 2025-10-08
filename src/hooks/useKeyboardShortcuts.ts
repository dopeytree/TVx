import { useEffect } from 'react';

export const useKeyboardShortcuts = (callbacks: {
  onSettings?: () => void;
  onFullscreen?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + , for settings
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        callbacks.onSettings?.();
      }

      // F for fullscreen
      if (event.key === 'f' || event.key === 'F') {
        if (!['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
          event.preventDefault();
          callbacks.onFullscreen?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};
