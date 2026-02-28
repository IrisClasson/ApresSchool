import { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../lib/i18n'
import authService from '../lib/authService'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(i18n.getLocale())

  useEffect(() => {
    // Load user's language preference on mount
    const loadUserLanguage = async () => {
      const user = await authService.getCurrentUser()
      if (user && user.language) {
        i18n.setLocale(user.language)
        setLocale(user.language)
      }
    }
    loadUserLanguage()

    // Listen for language changes
    const handleLanguageChange = () => {
      setLocale(i18n.getLocale())
    }

    window.addEventListener('languagechange', handleLanguageChange)
    return () => window.removeEventListener('languagechange', handleLanguageChange)
  }, [])

  const changeLanguage = async (newLocale) => {
    i18n.setLocale(newLocale)
    setLocale(newLocale)

    // Save to database if user is logged in
    const user = await authService.getCurrentUser()
    if (user) {
      await authService.updateLanguagePreference(newLocale)
    }
  }

  const t = (key, params) => i18n.t(key, params)
  const plural = (key, count, params) => i18n.plural(key, count, params)

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t, plural }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
