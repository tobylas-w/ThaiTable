import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PageStyle = 'modern' | 'minimal' | 'elevated';
export type CardVariant = 'default' | 'elevated' | 'modern' | 'minimal';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient';

interface PageStylePreferences {
  pageStyle: PageStyle;
  cardVariant: CardVariant;
  buttonVariant: ButtonVariant;
  showAnimations: boolean;
  roundedCorners: boolean;
  shadowIntensity: 'none' | 'light' | 'medium' | 'heavy';
}

interface PageStyleState extends PageStylePreferences {
  // Computed properties
  pageClassName: string;
  cardClassName: string;
  buttonClassName: string;
}

interface PageStyleActions {
  setPageStyle: (style: PageStyle) => void;
  setCardVariant: (variant: CardVariant) => void;
  setButtonVariant: (variant: ButtonVariant) => void;
  setShowAnimations: (show: boolean) => void;
  setRoundedCorners: (rounded: boolean) => void;
  setShadowIntensity: (intensity: 'none' | 'light' | 'medium' | 'heavy') => void;
  resetPageStyles: () => void;
  applyPageStyles: () => void;
}

type PageStyleStore = PageStyleState & PageStyleActions;

const defaultPreferences: PageStylePreferences = {
  pageStyle: 'modern',
  cardVariant: 'default',
  buttonVariant: 'primary',
  showAnimations: true,
  roundedCorners: true,
  shadowIntensity: 'medium',
};

const getPageClassName = (style: PageStyle): string => {
  switch (style) {
    case 'modern': return 'page-modern min-h-screen';
    case 'minimal': return 'page-minimal min-h-screen';
    case 'elevated': return 'page-elevated min-h-screen';
    default: return 'min-h-screen bg-background-primary';
  }
};

const getCardClassName = (variant: CardVariant): string => {
  switch (variant) {
    case 'elevated': return 'card-elevated';
    case 'modern': return 'card-modern';
    case 'minimal': return 'card-minimal';
    default: return 'card';
  }
};

const getButtonClassName = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'secondary': return 'btn-secondary';
    case 'ghost': return 'btn-ghost';
    case 'gradient': return 'btn-gradient';
    default: return 'btn-primary';
  }
};

export const usePageStyleStore = create<PageStyleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultPreferences,
      pageClassName: getPageClassName(defaultPreferences.pageStyle),
      cardClassName: getCardClassName(defaultPreferences.cardVariant),
      buttonClassName: getButtonClassName(defaultPreferences.buttonVariant),

      // Actions
      setPageStyle: (pageStyle: PageStyle) => {
        set({ 
          pageStyle, 
          pageClassName: getPageClassName(pageStyle)
        });
        get().applyPageStyles();
      },

      setCardVariant: (cardVariant: CardVariant) => {
        set({ 
          cardVariant, 
          cardClassName: getCardClassName(cardVariant)
        });
      },

      setButtonVariant: (buttonVariant: ButtonVariant) => {
        set({ 
          buttonVariant, 
          buttonClassName: getButtonClassName(buttonVariant)
        });
      },

      setShowAnimations: (showAnimations: boolean) => {
        set({ showAnimations });
        get().applyPageStyles();
      },

      setRoundedCorners: (roundedCorners: boolean) => {
        set({ roundedCorners });
        get().applyPageStyles();
      },

      setShadowIntensity: (shadowIntensity: 'none' | 'light' | 'medium' | 'heavy') => {
        set({ shadowIntensity });
        get().applyPageStyles();
      },

      resetPageStyles: () => {
        set({
          ...defaultPreferences,
          pageClassName: getPageClassName(defaultPreferences.pageStyle),
          cardClassName: getCardClassName(defaultPreferences.cardVariant),
          buttonClassName: getButtonClassName(defaultPreferences.buttonVariant),
        });
        get().applyPageStyles();
      },

      applyPageStyles: () => {
        const state = get();
        const root = document.documentElement;

        // Apply animation preferences
        if (!state.showAnimations) {
          root.classList.add('reduce-motion');
        } else {
          root.classList.remove('reduce-motion');
        }

        // Apply rounded corners
        if (!state.roundedCorners) {
          root.style.setProperty('--border-radius', '0px');
        } else {
          root.style.removeProperty('--border-radius');
        }

        // Apply shadow intensity
        const shadowValues = {
          none: '0 0 0 0 rgba(0, 0, 0, 0)',
          light: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          heavy: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        };
        root.style.setProperty('--shadow-intensity', shadowValues[state.shadowIntensity]);
      },
    }),
    {
      name: 'thai-table-page-style-preferences',
      partialize: (state) => ({
        pageStyle: state.pageStyle,
        cardVariant: state.cardVariant,
        buttonVariant: state.buttonVariant,
        showAnimations: state.showAnimations,
        roundedCorners: state.roundedCorners,
        shadowIntensity: state.shadowIntensity,
      }),
    }
  )
);

// Initialize page styles on app start
const initializePageStyles = () => {
  const { applyPageStyles } = usePageStyleStore.getState();
  applyPageStyles();
};

// Call initialization
if (typeof window !== 'undefined') {
  initializePageStyles();
}

export { initializePageStyles };
