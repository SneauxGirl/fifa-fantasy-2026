import React from 'react';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle Component
 * Simple button to toggle between light and dark mode
 *
 * Usage in TopNav or settings:
 * <ThemeToggle />
 */
export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        padding: '0.5rem',
        cursor: 'pointer',
        color: 'var(--text-primary)',
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
