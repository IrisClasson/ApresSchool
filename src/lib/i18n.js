import enTranslations from '../../locales/en.json'
import svTranslations from '../../locales/sv.json'

const translations = {
  en: enTranslations,
  sv: svTranslations
}

class I18n {
  constructor() {
    // Try to get saved language from localStorage, default to 'en'
    this.currentLocale = localStorage.getItem('language') || 'en'
  }

  setLocale(locale) {
    if (translations[locale]) {
      this.currentLocale = locale
      localStorage.setItem('language', locale)
      // Trigger a custom event so components can re-render
      window.dispatchEvent(new Event('languagechange'))
    }
  }

  getLocale() {
    return this.currentLocale
  }

  t(key, params = {}) {
    const keys = key.split('.')
    let value = translations[this.currentLocale]

    // Navigate through the nested object
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Key not found, return the key itself as fallback
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    // If no translation found, return key
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    // Replace parameters in the string
    if (typeof value === 'string') {
      return this.replaceParams(value, params)
    }

    return value
  }

  replaceParams(str, params) {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }

  // Handle plural forms (basic implementation)
  // Format: "{count, plural, one {# item} other {# items}}"
  plural(key, count, params = {}) {
    let str = this.t(key, params)

    if (typeof str !== 'string') return str

    // Simple plural handling
    const pluralMatch = str.match(/\{count, plural, one \{([^}]+)\} other \{([^}]+)\}\}/)
    if (pluralMatch) {
      const [, singular, plural] = pluralMatch
      const form = count === 1 ? singular : plural
      str = form.replace(/#/g, count)
    }

    return this.replaceParams(str, { ...params, count })
  }
}

// Create singleton instance
const i18n = new I18n()

export default i18n
