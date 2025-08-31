import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ComputerDesktopIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useThemeStore,
  type ColorScheme,
  type FontSize,
  type LayoutDensity,
  type ThemeMode
} from '../stores/themeStore';

const UserPreferences: React.FC = () => {
  const { t } = useTranslation();
  const {
    mode,
    colorScheme,
    fontSize,
    layoutDensity,
    reducedMotion,
    highContrast,
    setMode,
    setColorScheme,
    setFontSize,
    setLayoutDensity,
    setReducedMotion,
    setHighContrast,
    resetToDefaults
  } = useThemeStore();

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'dark', label: 'Dark', icon: <MoonIcon className="h-5 w-5" /> },
    { value: 'light', label: 'Light', icon: <SunIcon className="h-5 w-5" /> },
    { value: 'system', label: 'System', icon: <ComputerDesktopIcon className="h-5 w-5" /> },
  ];

  const colorSchemeOptions: { value: ColorScheme; label: string; preview: string }[] = [
    { value: 'thai-gold', label: 'Thai Gold', preview: 'bg-yellow-500' },
    { value: 'blue', label: 'Ocean Blue', preview: 'bg-blue-500' },
    { value: 'green', label: 'Forest Green', preview: 'bg-green-500' },
    { value: 'purple', label: 'Royal Purple', preview: 'bg-purple-500' },
  ];

  const fontSizeOptions: { value: FontSize; label: string; description: string }[] = [
    { value: 'small', label: 'Small', description: '14px base' },
    { value: 'medium', label: 'Medium', description: '16px base' },
    { value: 'large', label: 'Large', description: '18px base' },
  ];

  const layoutDensityOptions: { value: LayoutDensity; label: string; description: string }[] = [
    { value: 'compact', label: 'Compact', description: 'More content, less spacing' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
    { value: 'spacious', label: 'Spacious', description: 'More spacing, easier to read' },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-4xl mx-auto px-density-md py-density-lg">
        {/* Header */}
        <div className="mb-density-xl">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-text-secondary hover:text-text-primary mb-density-md transition-theme"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-heading">User Preferences</h1>
          <p className="text-body mt-2">Customize your ThaiTable experience</p>
        </div>

        <div className="space-y-density-xl">
          {/* Theme Mode Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-heading flex items-center">
                <MoonIcon className="h-6 w-6 mr-3" />
                Theme Mode
              </h2>
              <p className="text-body">Choose your preferred theme appearance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-density-md">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  className={`p-density-md rounded-lg border-2 transition-theme flex items-center space-x-3 ${mode === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-border-primary hover:border-primary-300'
                    }`}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-heading flex items-center">
                <SwatchIcon className="h-6 w-6 mr-3" />
                Color Scheme
              </h2>
              <p className="text-body">Select your preferred color palette</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-density-md">
              {colorSchemeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColorScheme(option.value)}
                  className={`p-density-md rounded-lg border-2 transition-theme ${colorScheme === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-border-primary hover:border-primary-300'
                    }`}
                >
                  <div className={`w-8 h-8 ${option.preview} rounded-full mx-auto mb-2`}></div>
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-heading flex items-center">
                <AdjustmentsHorizontalIcon className="h-6 w-6 mr-3" />
                Font Size
              </h2>
              <p className="text-body">Adjust text size for better readability</p>
            </div>

            <div className="space-y-density-sm">
              {fontSizeOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="fontSize"
                    value={option.value}
                    checked={fontSize === option.value}
                    onChange={() => setFontSize(option.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted ml-2">({option.description})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Layout Density Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-heading flex items-center">
                <AdjustmentsHorizontalIcon className="h-6 w-6 mr-3" />
                Layout Density
              </h2>
              <p className="text-body">Control spacing and layout density</p>
            </div>

            <div className="space-y-density-sm">
              {layoutDensityOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="layoutDensity"
                    value={option.value}
                    checked={layoutDensity === option.value}
                    onChange={() => setLayoutDensity(option.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted ml-2">- {option.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-heading flex items-center">
                <EyeIcon className="h-6 w-6 mr-3" />
                Accessibility
              </h2>
              <p className="text-body">Options to improve accessibility</p>
            </div>

            <div className="space-y-density-md">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium">Reduced Motion</span>
                  <p className="text-muted text-sm">Minimize animations and transitions</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="toggle-checkbox text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium">High Contrast</span>
                  <p className="text-muted text-sm">Increase contrast for better visibility</p>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="toggle-checkbox text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-heading">Reset Preferences</h3>
                <p className="text-body text-sm">Restore all settings to default values</p>
              </div>
              <button
                onClick={resetToDefaults}
                className="btn-secondary"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
