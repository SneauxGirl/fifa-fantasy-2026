# Theme System: Light/Dark Mode

## Overview

The app uses **CSS Custom Properties (CSS Variables)** for theming, with automatic system preference detection and manual override capability.

**Features:**
- ✅ Respects system preference (`prefers-color-scheme`)
- ✅ Allows manual light/dark toggle
- ✅ Persists user choice to localStorage
- ✅ No page reload needed
- ✅ Smooth transitions between themes
- ✅ Works with CSS Modules

---

## How It Works

### 1. **Initialization** (main.tsx)
On app load, the theme system:
1. Checks localStorage for saved preference
2. Falls back to system preference (light/dark)
3. Sets `data-theme` attribute on `<html>` element
4. CSS automatically adjusts via `@media (prefers-color-scheme: dark)`

### 2. **CSS Variables** (tokens.css)
All color values are CSS variables:
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --border-color: #dee2e6;
  /* ... etc */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #121212;
    --text-primary: #e8e8e8;
    --border-color: #3a3a3a;
    /* ... etc */
  }
}
```

### 3. **Manual Override** (via data-theme attribute)
When user toggles theme:
```html
<!-- Light mode -->
<html data-theme="light">

<!-- Dark mode -->
<html data-theme="dark">

<!-- System preference (default) -->
<html data-theme="system">
```

---

## Using in Components

### Option A: Use CSS Variables Directly (Recommended)

In your `.module.scss` files:
```scss
// RosterDragZone.module.scss
.container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.header {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
}

.button {
  background-color: var(--color-primary);
  color: white;

  &:hover {
    background-color: var(--color-primary-dark);
  }
}
```

### Option B: Use useTheme Hook (For Logic)

Get theme state in components:
```typescript
import { useTheme } from '../../hooks/useTheme';

export const Dashboard = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Is dark? {isDark ? 'Yes' : 'No'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### Option C: Add Theme Toggle Button

Use the ready-made ThemeToggle component:
```typescript
import { ThemeToggle } from '../../components/Navigation';

export const TopNav = () => {
  return (
    <nav>
      <h1>My App</h1>
      <ThemeToggle /> {/* Light/Dark toggle button */}
    </nav>
  );
};
```

---

## Available CSS Variables

### Colors
```css
--color-primary           /* Blue */
--color-primary-dark      /* Darker blue for hover */
--color-primary-light     /* Light blue for backgrounds */
--color-success           /* Green */
--color-warning           /* Orange */
--color-danger            /* Red */
--color-info              /* Cyan */
```

### Backgrounds
```css
--bg-primary              /* Main background (white/dark) */
--bg-secondary            /* Secondary background (light gray/dark gray) */
--bg-tertiary             /* Tertiary background (lighter gray/darker gray) */
--bg-hover                /* Hover state background */
--bg-active               /* Active/pressed state background */
```

### Text
```css
--text-primary            /* Main text color */
--text-secondary          /* Secondary text (description, metadata) */
--text-muted              /* Muted text (disabled, subtle) */
--text-inverse            /* Inverse text (text on dark backgrounds) */
```

### Borders & Shadows
```css
--border-color            /* Normal borders */
--border-light            /* Light borders */
--shadow-sm               /* Small shadow */
--shadow-md               /* Medium shadow */
--shadow-lg               /* Large shadow */
```

### Typography
```css
--font-family             /* System font stack */
--font-size-sm            /* 0.875rem */
--font-size-base          /* 1rem */
--font-size-lg            /* 1.125rem */
--font-size-xl            /* 1.5rem */
```

### Spacing
```css
--spacing-xs              /* 0.25rem */
--spacing-sm              /* 0.5rem */
--spacing-md              /* 1rem */
--spacing-lg              /* 1.5rem */
--spacing-xl              /* 2rem */
```

### Z-Index
```css
--z-dropdown              /* 1000 */
--z-sticky                /* 1020 */
--z-fixed                 /* 1030 */
--z-modal                 /* 1040 */
--z-tooltip               /* 1070 */
```

---

## Examples

### Example 1: Card Component
```scss
// Card.module.scss
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.cardTitle {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.cardText {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.cardButton {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: var(--color-primary-dark);
  }
}
```

### Example 2: Form Input
```scss
// Input.module.scss
.input {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: var(--spacing-sm);
  border-radius: 4px;
  font-family: var(--font-family);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  &:disabled {
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
    cursor: not-allowed;
  }
}
```

### Example 3: Alert Message
```scss
// Alert.module.scss
.alertSuccess {
  background-color: var(--color-success);
  color: var(--text-inverse);
  padding: var(--spacing-md);
  border-radius: 4px;
}

.alertDanger {
  background-color: var(--color-danger);
  color: var(--text-inverse);
  padding: var(--spacing-md);
  border-radius: 4px;
}

.alertWarning {
  background-color: var(--color-warning);
  color: var(--text-inverse);
  padding: var(--spacing-md);
  border-radius: 4px;
}
```

---

## Advanced: Adding a Third Theme

Want to add high-contrast mode? Add to `tokens.css`:
```css
body[data-theme="high-contrast"] {
  --color-primary: #0000ff;
  --bg-primary: #000000;
  --text-primary: #ffffff;
  /* ... etc, maximize contrast */
}
```

Then in `useTheme.ts`, add 'high-contrast' to the `Theme` type:
```typescript
type Theme = 'light' | 'dark' | 'high-contrast' | 'system';
```

---

## Troubleshooting

### Colors not changing when toggling theme?
- Make sure you're using `var(--color-name)` in your CSS
- Check that your `.module.scss` file is being imported
- Reload the page (sometimes needed for CSS Module cache)

### Theme not persisting on page refresh?
- Check localStorage in DevTools: `localStorage.getItem('theme')`
- Make sure `initTheme()` is called in `main.tsx`

### Want to test dark mode in browser?
Chrome DevTools → Rendering → Emulate CSS media feature prefers-color-scheme → Select "prefers-color-scheme: dark"

---

## File Structure

```
/src/styles/
├── tokens.css              # CSS variables for light & dark
├── THEME_GUIDE.md          # This file

/src/hooks/
├── useTheme.ts             # Theme management hook

/src/components/Navigation/
├── ThemeToggle.tsx         # Light/Dark toggle button
├── ... other components
```
