import {
  BarChart3,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  User,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('navigation.dashboard'), href: '/', icon: Home },
    { name: t('navigation.menu'), href: '/menu', icon: Menu },
    { name: t('navigation.orders'), href: '/orders', icon: ShoppingCart },
    { name: t('navigation.users'), href: '/users', icon: Users },
    { name: t('navigation.reports'), href: '/reports', icon: BarChart3 },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
  ];

  const languages = [
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsLanguageOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsLanguageOpen(false);
  };

  const handleLogout = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะออกจากระบบ?')) {
      localStorage.removeItem('thaitable_token');
      localStorage.removeItem('thaitable_user');
      window.location.href = '/login';
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
                              <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
                  aria-label="เปิดเมนู"
                >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <div className="flex-shrink-0 ml-4 md:ml-0">
                <Link to="/" className="flex items-center">
                  <h1 className="text-xl font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                    ThaiTable
                  </h1>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-yellow-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsLanguageOpen(!isLanguageOpen))}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md transition-colors"
                  aria-expanded={isLanguageOpen ? 'true' : 'false'}
                  aria-haspopup="true"
                  aria-label="เลือกภาษา"
                >
                  <span role="img" aria-label={`${currentLanguage.name} flag`}>
                    {currentLanguage.flag}
                  </span>
                  <span className="hidden sm:inline">{currentLanguage.name}</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>

                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => handleLanguageChange(language.code)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleLanguageChange(language.code))}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        aria-label={`เปลี่ยนเป็นภาษา ${language.name}`}
                      >
                        <span role="img" aria-label={`${language.name} flag`} className="mr-2">
                          {language.flag}
                        </span>
                        {language.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsUserMenuOpen(!isUserMenuOpen))}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md transition-colors"
                  aria-expanded={isUserMenuOpen ? 'true' : 'false'}
                  aria-haspopup="true"
                  aria-label="เมนูผู้ใช้"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Admin</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                      type="button"
                      onClick={handleLogout}
                      onKeyDown={(e) => handleKeyDown(e, handleLogout)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      aria-label="ออกจากระบบ"
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      {t('navigation.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 mr-3" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-yellow-600 text-white px-4 py-2 rounded-md z-50"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
    </div>
  );
};

export default Layout;
