import { useState, useEffect } from 'react';
import { preloadService } from '../utils/preloadService';

interface LoadingScreenProps {
  onLoadComplete: () => void;
  minDisplayTime?: number; // Minimum time to show loading screen in ms
}

const LoadingScreen = ({ 
  onLoadComplete, 
  minDisplayTime = 2000 
}: LoadingScreenProps): JSX.Element => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  
  // Start preloading resources
  useEffect(() => {
    preloadService.startPreloading();
    
    // Set minimum display time flag after timeout
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDisplayTime);
    
    return () => clearTimeout(timer);
  }, [minDisplayTime]);
  
  // Update progress and loading text
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const currentProgress = preloadService.getLoadingProgress();
      setProgress(currentProgress);
      
      // Update loading text based on progress
      if (currentProgress < 20) {
        setLoadingText('Preparing cosmic journey...');
      } else if (currentProgress < 40) {
        setLoadingText('Loading planetary textures...');
      } else if (currentProgress < 60) {
        setLoadingText('Positioning stars...');
      } else if (currentProgress < 80) {
        setLoadingText('Calibrating orbits...');
      } else {
        setLoadingText('Almost ready for launch!');
      }
      
      // Complete loading when progress is 100% and min time has elapsed
      if (currentProgress >= 100 && minTimeElapsed) {
        clearInterval(updateInterval);
        onLoadComplete();
      }
    }, 100);
    
    return () => clearInterval(updateInterval);
  }, [onLoadComplete, minTimeElapsed]);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '1rem',
        fontWeight: 'bold',
        letterSpacing: '1px',
      }}>
        Full Stack Madrid
      </h1>
      
      <div style={{
        fontSize: '1rem',
        marginBottom: '2rem',
        opacity: 0.7,
      }}>
        {loadingText}
      </div>
      
      {/* Progress bar container */}
      <div style={{
        width: '70%',
        maxWidth: '400px',
        height: '8px',
        backgroundColor: '#222',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#5d9cec',
          borderRadius: '4px',
          transition: 'width 0.3s ease-out',
        }} />
      </div>
      
      {/* Progress percentage */}
      <div style={{
        marginTop: '0.5rem',
        fontSize: '0.8rem',
      }}>
        {progress}%
      </div>
      
      {/* Stars background (simulated with CSS) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, rgba(33, 33, 33, 0.8) 0%, rgba(0, 0, 0, 0.8) 100%)',
        zIndex: -1,
      }}>
        {/* Generate 50 random stars with CSS */}
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 2 + 1;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const opacity = Math.random() * 0.7 + 0.3;
          const animationDuration = Math.random() * 3 + 2;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: '#fff',
                left: `${left}%`,
                top: `${top}%`,
                opacity,
                animation: `twinkle ${animationDuration}s infinite alternate`,
              }}
            />
          );
        })}
        
        {/* Add keyframe animation to the document */}
        <style>
          {`
            @keyframes twinkle {
              0% {
                opacity: 0.3;
              }
              100% {
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default LoadingScreen;
