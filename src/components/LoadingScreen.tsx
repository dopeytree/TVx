import { useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  /**
   * Callback invoked after the fade-out animation completes.
   * IMPORTANT: Parent should memoize this with useCallback to ensure stable identity.
   */
  onLoadingComplete?: () => void;
  /**
   * Controls whether the loading screen should start fading out.
   * When true, the fade-out animation begins and onLoadingComplete is called after completion.
   */
  shouldFadeOut?: boolean;
}

export const LoadingScreen = ({ 
  onLoadingComplete,
  shouldFadeOut = false
}: LoadingScreenProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (shouldFadeOut && !isFadingOut) {
      setIsFadingOut(true);
      
      // Call onLoadingComplete after the 500ms fade animation completes
      const timer = setTimeout(() => {
        onLoadingComplete?.();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [shouldFadeOut, isFadingOut, onLoadingComplete]);

  return (
    <div className={`loading-screen${isFadingOut ? ' fade-out' : ''}`}>
      <div className="static-overlay"></div>
      <div className="loading-content">
        <div className="logo-container">
          <img 
            src="/logo.png" 
            alt="TVx Logo" 
            className="loading-logo"
          />
        </div>
        <div className="loading-text"></div>
      </div>
    </div>
  );
};
