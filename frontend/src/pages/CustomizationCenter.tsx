import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ComputerDesktopIcon,
  EyeIcon,
  MoonIcon,
  PaintBrushIcon,
  SparklesIcon,
  SunIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useThemeStore,
  type ColorScheme,
  type FontSize,
  type LayoutDensity,
  type ThemeMode
} from '../stores/themeStore';

const CustomizationCenter: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'accessibility' | 'preview'>('theme');
  
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

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'dark', 
      label: 'Dark Mode', 
      icon: <MoonIcon className="h-6 w-6" />, 
      description: 'Easy on the eyes, perfect for low-light environments'
    },
    { 
      value: 'light', 
      label: 'Light Mode', 
      icon: <SunIcon className="h-6 w-6" />, 
      description: 'Clean and bright, ideal for well-lit spaces'
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: <ComputerDesktopIcon className="h-6 w-6" />, 
      description: 'Automatically matches your device settings'
    },
  ];

  const colorSchemeOptions: { 
    value: ColorScheme; 
    label: string; 
    preview: string; 
    description: string;
    accent: string;
  }[] = [
    { 
      value: 'thai-gold', 
      label: 'Thai Gold', 
      preview: 'bg-yellow-500', 
      description: 'Warm and welcoming, inspired by Thai culture',
      accent: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    },
    { 
      value: 'blue', 
      label: 'Ocean Blue', 
      preview: 'bg-blue-500', 
      description: 'Professional and calming, like deep waters',
      accent: 'bg-gradient-to-r from-blue-400 to-blue-600'
    },
    { 
      value: 'green', 
      label: 'Forest Green', 
      preview: 'bg-green-500', 
      description: 'Natural and refreshing, eco-friendly vibes',
      accent: 'bg-gradient-to-r from-green-400 to-green-600'
    },
    { 
      value: 'purple', 
      label: 'Royal Purple', 
      preview: 'bg-purple-500', 
      description: 'Elegant and sophisticated, premium feel',
      accent: 'bg-gradient-to-r from-purple-400 to-purple-600'
    },
  ];

  const fontSizeOptions: { value: FontSize; label: string; description: string; example: string }[] = [
    { value: 'small', label: 'Small', description: '14px base', example: 'text-sm' },
    { value: 'medium', label: 'Medium', description: '16px base', example: 'text-base' },
    { value: 'large', label: 'Large', description: '18px base', example: 'text-lg' },
  ];

  const layoutDensityOptions: { value: LayoutDensity; label: string; description: string; visual: string }[] = [
    { value: 'compact', label: 'Compact', description: 'More content, less spacing', visual: 'Tight' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing', visual: 'Balanced' },
    { value: 'spacious', label: 'Spacious', description: 'More spacing, easier to read', visual: 'Roomy' },
  ];

  const tabs = [
    { id: 'theme', name: 'Theme & Colors', icon: SwatchIcon },
    { id: 'layout', name: 'Layout & Typography', icon: AdjustmentsHorizontalIcon },
    { id: 'accessibility', name: 'Accessibility', icon: EyeIcon },
    { id: 'preview', name: 'Preview Styles', icon: SparklesIcon },
  ];

  const PreviewCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card mb-density-md">
      <div className="card-header">
        <h4 className="text-heading text-lg">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-density-md py-density-lg">
        {/* Header */}
        <div className="mb-density-xl">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-text-secondary hover:text-text-primary mb-density-md transition-theme"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <PaintBrushIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-heading">Customization Center</h1>
              <p className="text-body text-lg">Personalize your ThaiTable experience with advanced theming options</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-primary mb-density-xl">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-theme ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-density-xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-density-xl">
            {/* Theme & Colors Tab */}
            {activeTab === 'theme' && (
              <>
                {/* Theme Mode Selection */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-2xl font-semibold text-heading flex items-center">
                      <MoonIcon className="h-6 w-6 mr-3" />
                      Theme Mode
                    </h2>
                    <p className="text-body">Choose how you want your interface to appear</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-density-md">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setMode(option.value)}
                        className={`p-density-lg rounded-xl border-2 transition-theme text-left ${
                          mode === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                            : 'border-border-primary hover:border-primary-300 hover:bg-background-tertiary'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${mode === option.value ? 'bg-primary-100 dark:bg-primary-800' : 'bg-background-tertiary'}`}>
                            {option.icon}
                          </div>
                          <span className="font-semibold text-heading">{option.label}</span>
                        </div>
                        <p className="text-body text-sm">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme Selection */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-2xl font-semibold text-heading flex items-center">
                      <SwatchIcon className="h-6 w-6 mr-3" />
                      Color Scheme
                    </h2>
                    <p className="text-body">Select your preferred color palette and accent</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-density-md">
                    {colorSchemeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setColorScheme(option.value)}
                        className={`p-density-lg rounded-xl border-2 transition-theme text-left ${
                          colorScheme === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                            : 'border-border-primary hover:border-primary-300 hover:bg-background-tertiary'
                        }`}
                      >
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`w-12 h-12 ${option.accent} rounded-xl shadow-md`}></div>
                          <div>
                            <h3 className="font-semibold text-heading">{option.label}</h3>
                            <p className="text-body text-sm">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Layout & Typography Tab */}
            {activeTab === 'layout' && (
              <>
                {/* Font Size */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-2xl font-semibold text-heading">Font Size</h2>
                    <p className="text-body">Adjust text size for optimal readability</p>
                  </div>
                  
                  <div className="space-y-density-md">
                    {fontSizeOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-4 cursor-pointer p-density-sm rounded-lg hover:bg-background-tertiary transition-theme">
                        <input
                          type="radio"
                          name="fontSize"
                          value={option.value}
                          checked={fontSize === option.value}
                          onChange={() => setFontSize(option.value)}
                          className="text-primary-600 focus:ring-primary-500 h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-heading">{option.label}</span>
                            <span className="text-muted">({option.description})</span>
                          </div>
                          <p className={`text-body mt-1 ${option.example}`}>
                            Sample text in {option.label.toLowerCase()} size
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Layout Density */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-2xl font-semibold text-heading">Layout Density</h2>
                    <p className="text-body">Control spacing and information density</p>
                  </div>
                  
                  <div className="space-y-density-md">
                    {layoutDensityOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-4 cursor-pointer p-density-sm rounded-lg hover:bg-background-tertiary transition-theme">
                        <input
                          type="radio"
                          name="layoutDensity"
                          value={option.value}
                          checked={layoutDensity === option.value}
                          onChange={() => setLayoutDensity(option.value)}
                          className="text-primary-600 focus:ring-primary-500 h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-heading">{option.label}</span>
                            <span className="text-muted text-sm px-2 py-1 bg-background-tertiary rounded">{option.visual}</span>
                          </div>
                          <p className="text-body text-sm mt-1">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-2xl font-semibold text-heading flex items-center">
                    <EyeIcon className="h-6 w-6 mr-3" />
                    Accessibility Options
                  </h2>
                  <p className="text-body">Enhance usability and comfort</p>
                </div>
                
                <div className="space-y-density-lg">
                  <div className="p-density-md border border-border-primary rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <h3 className="font-medium text-heading">Reduced Motion</h3>
                        <p className="text-body text-sm mt-1">Minimize animations and transitions for sensitive users</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">Motion Sensitivity</span>
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded">Performance</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={reducedMotion}
                          onChange={(e) => setReducedMotion(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-theme cursor-pointer ${
                            reducedMotion ? 'bg-primary-600' : 'bg-border-primary'
                          }`}
                          onClick={() => setReducedMotion(!reducedMotion)}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="p-density-md border border-border-primary rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <h3 className="font-medium text-heading">High Contrast</h3>
                        <p className="text-body text-sm mt-1">Increase contrast between text and backgrounds</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded">Visual Clarity</span>
                          <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded">Accessibility</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={highContrast}
                          onChange={(e) => setHighContrast(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-theme cursor-pointer ${
                            highContrast ? 'bg-primary-600' : 'bg-border-primary'
                          }`}
                          onClick={() => setHighContrast(!highContrast)}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              highContrast ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-density-lg">
                <PreviewCard title="Navigation & Buttons">
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <button className="btn-primary">Primary Action</button>
                      <button className="btn-secondary">Secondary Action</button>
                    </div>
                    <nav className="flex space-x-4">
                      <a href="#" className="nav-item nav-item-active">Active Link</a>
                      <a href="#" className="nav-item">Regular Link</a>
                      <a href="#" className="nav-item">Another Link</a>
                    </nav>
                  </div>
                </PreviewCard>

                <PreviewCard title="Form Elements">
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Sample Input</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Enter some text..."
                        defaultValue="Sample text content"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Select Dropdown</label>
                      <select className="input-field">
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    </div>
                  </div>
                </PreviewCard>

                <PreviewCard title="Content Cards">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card">
                      <h4 className="text-heading font-semibold mb-2">Card Title</h4>
                      <p className="text-body mb-3">This is some sample content in a card. It demonstrates how text appears with the current theme.</p>
                      <div className="flex space-x-2">
                        <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded">Tag</span>
                        <span className="text-xs px-2 py-1 bg-background-tertiary text-text-secondary rounded">Label</span>
                      </div>
                    </div>
                    <div className="card">
                      <h4 className="text-heading font-semibold mb-2">Another Card</h4>
                      <p className="text-body mb-3">Cards adapt to your chosen theme and maintain consistent spacing based on your density settings.</p>
                      <button className="btn-primary text-sm">Action Button</button>
                    </div>
                  </div>
                </PreviewCard>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-density-lg">
              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-heading">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={resetToDefaults}
                    className="w-full btn-secondary text-left"
                  >
                    Reset to Defaults
                  </button>
                  <div className="divider border-t"></div>
                  <div className="text-sm text-muted">
                    <p className="mb-2">Current Settings:</p>
                    <ul className="space-y-1">
                      <li>• Theme: <span className="text-text-secondary capitalize">{mode}</span></li>
                      <li>• Colors: <span className="text-text-secondary">{colorSchemeOptions.find(c => c.value === colorScheme)?.label}</span></li>
                      <li>• Font: <span className="text-text-secondary capitalize">{fontSize}</span></li>
                      <li>• Density: <span className="text-text-secondary capitalize">{layoutDensity}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-heading">Tips</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Pro Tip:</strong> Use system theme to automatically switch between light and dark based on your device settings.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200">
                      <strong>Accessibility:</strong> Enable reduced motion if you're sensitive to animations or want better performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationCenter;
