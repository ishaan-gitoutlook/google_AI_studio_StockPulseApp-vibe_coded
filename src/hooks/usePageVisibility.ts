/**
 * Custom React hook to track browser Page Visibility state.
 * Automatically notifies when the user switches tabs or minimizes the window.
 */

import { useState, useEffect } from 'react';

export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.visibilityState === 'visible';
    }
    return true;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
