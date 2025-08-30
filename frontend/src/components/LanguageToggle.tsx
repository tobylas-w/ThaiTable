import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LanguageToggle = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'th' ? 'en' : 'th'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
      title={`Switch to ${i18n.language === 'th' ? 'English' : 'Thai'}`}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {i18n.language === 'th' ? 'EN' : 'TH'}
      </span>
    </button>
  )
}

export default LanguageToggle
