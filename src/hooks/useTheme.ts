import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * useTheme Hook
 * Manages light/dark mode with system preference fallback
 *
 * Features:
 * - Detects system preference (prefers-color-scheme)
 * - Persists user choice to localStorage
 * - Allows manual override
 * - Updates data-theme attribute on document
 *
 * Usage:
 * const { theme, isDark, toggleTheme } = useTheme();
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // Get system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine initial theme
    const initialTheme = savedTheme || 'system';
    setThemeState(initialTheme);

    // Apply theme
    applyTheme(initialTheme, prefersDark);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme('system', e.matches);
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme, prefersDark: boolean) => {
    let actualTheme: 'light' | 'dark';

    if (newTheme === 'system') {
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = newTheme;
    }

    // Update DOM
    document.documentElement.setAttribute('data-theme', actualTheme);

    // Update state
    setIsDark(actualTheme === 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(newTheme, prefersDark);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
};
