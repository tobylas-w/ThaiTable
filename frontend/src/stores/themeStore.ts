import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'thai-gold' | 'blue' | 'green' | 'purple';
export type FontSize = 'small' | 'medium' | 'large';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

interface ThemePreferences {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  layoutDensity: LayoutDensity;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface ThemeState extends ThemePreferences {
  // Computed properties
  isDark: boolean;
  effectiveTheme: 'light' | 'dark';
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: FontSize) => void;
  setLayoutDensity: (density: LayoutDensity) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  resetToDefaults: () => void;
  applyTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const defaultPreferences: ThemePreferences = {
  mode: 'dark', // Dark mode as default
  colorScheme: 'thai-gold',
  fontSize: 'medium',
  layoutDensity: 'comfortable',
  reducedMotion: false,
  highContrast: false,
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  return mode === 'system' ? getSystemTheme() : mode;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultPreferences,
      isDark: getEffectiveTheme(defaultPreferences.mode) === 'dark',
      effectiveTheme: getEffectiveTheme(defaultPreferences.mode),

      // Actions
      setMode: (mode: ThemeMode) => {
        const effectiveTheme = getEffectiveTheme(mode);
        set({
          mode,
          effectiveTheme,
          isDark: effectiveTheme === 'dark'
        });
        get().applyTheme();
      },

      setColorScheme: (colorScheme: ColorScheme) => {
        set({ colorScheme });
        get().applyTheme();
      },

      setFontSize: (fontSize: FontSize) => {
        set({ fontSize });
        get().applyTheme();
      },

      setLayoutDensity: (layoutDensity: LayoutDensity) => {
        set({ layoutDensity });
        get().applyTheme();
      },

      setReducedMotion: (reducedMotion: boolean) => {
        set({ reducedMotion });
        get().applyTheme();
      },

      setHighContrast: (highContrast: boolean) => {
        set({ highContrast });
        get().applyTheme();
      },

      resetToDefaults: () => {
        const effectiveTheme = getEffectiveTheme(defaultPreferences.mode);
        set({
          ...defaultPreferences,
          effectiveTheme,
          isDark: effectiveTheme === 'dark',
        });
        get().applyTheme();
      },

      applyTheme: () => {
        const state = get();
        const root = document.documentElement;

        // Apply theme mode
        if (state.effectiveTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }

        // Apply color scheme
        root.setAttribute('data-color-scheme', state.colorScheme);

        // Apply font size
        root.setAttribute('data-font-size', state.fontSize);

        // Apply layout density
        root.setAttribute('data-layout-density', state.layoutDensity);

        // Apply reduced motion
        if (state.reducedMotion) {
          root.classList.add('reduce-motion');
        } else {
          root.classList.remove('reduce-motion');
        }

        // Apply high contrast
        if (state.highContrast) {
          root.classList.add('high-contrast');
        } else {
          root.classList.remove('high-contrast');
        }
      },
    }),
    {
      name: 'thai-table-theme-preferences',
      partialize: (state) => ({
        mode: state.mode,
        colorScheme: state.colorScheme,
        fontSize: state.fontSize,
        layoutDensity: state.layoutDensity,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
      }),
    }
  )
);

// Initialize theme on app start
const initializeTheme = () => {
  const { applyTheme, setMode } = useThemeStore.getState();

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const { mode } = useThemeStore.getState();
      if (mode === 'system') {
        const effectiveTheme = getEffectiveTheme('system');
        useThemeStore.setState({
          effectiveTheme,
          isDark: effectiveTheme === 'dark'
        });
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
  }

  // Apply initial theme
  applyTheme();
};

// Call initialization
if (typeof window !== 'undefined') {
  initializeTheme();
}

export { initializeTheme };
