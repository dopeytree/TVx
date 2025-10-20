import { useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minLoadingTime?: number;
}

export const LoadingScreen = ({ 
  onLoadingComplete, 
  minLoadingTime = 2500 
}: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onLoadingComplete?.();
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime, onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div className="loading-screen">
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
