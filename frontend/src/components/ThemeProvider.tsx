import React, { useEffect } from 'react';
import { initializeTheme, useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { applyTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const cleanup = initializeTheme();

    // Apply theme immediately
    applyTheme();

    return cleanup;
  }, [applyTheme]);

  return <>{children}</>;
};

export default ThemeProvider;
