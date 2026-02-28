# Internationalization (i18n)

This directory contains language files for the Apres School application.

## Available Languages

- **English (en)**: `en.json`
- **Swedish (sv)**: `sv.json`

## Usage in Components

Import the `useTranslation` hook from the language context:

```jsx
import { useTranslation } from '../contexts/LanguageContext'

function MyComponent() {
  const { t, locale, changeLanguage } = useTranslation()

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('auth.login.subtitle')}</p>

      {/* With parameters */}
      <p>{t('messages.placeholder', { name: 'John' })}</p>

      {/* Current language */}
      <p>Current language: {locale}</p>

      {/* Change language */}
      <button onClick={() => changeLanguage('sv')}>Svenska</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  )
}
```

## Translation Key Structure

Translation keys use dot notation to access nested objects:

- `app.*` - General app-level text
- `auth.*` - Authentication pages (login, register)
- `navigation.*` - Navigation menu items
- `parentDashboard.*` - Parent dashboard UI
- `createChallenge.*` - Challenge creation form
- `challengeCard.*` - Challenge card UI
- `kidView.*` - Kid's mission view
- `kidStats.*` - Stats display and badges
- `feedback.*` - Feedback modal
- `messages.*` - Messaging interface
- `manageKids.*` - Kid management page
- `mobileNav.*` - Mobile navigation
- `common.*` - Reusable common text

## Adding Parameters

You can pass parameters to translations using the `{variable}` syntax:

```json
{
  "greeting": "Hello {name}!"
}
```

```jsx
t('greeting', { name: 'Alice' }) // Returns: "Hello Alice!"
```

## Plural Support

For plural forms, use ICU MessageFormat syntax:

```json
{
  "minutes": "{count, plural, one {# minute} other {# minutes}}"
}
```

```jsx
plural('time.minutes', 1) // Returns: "1 minute"
plural('time.minutes', 5) // Returns: "5 minutes"
```

## Language Switching

Users can switch languages in the mobile navigation menu. The selected language is persisted in `localStorage` and will be remembered on subsequent visits.

## Adding a New Language

1. Create a new JSON file in this directory (e.g., `de.json` for German)
2. Copy the structure from `en.json`
3. Translate all text strings
4. Import the file in `/src/lib/i18n.js`:
   ```js
   import deTranslations from '../../locales/de.json'

   const translations = {
     en: enTranslations,
     sv: svTranslations,
     de: deTranslations // Add new language
   }
   ```
5. Add the language button to the UI (e.g., in `MobileNav.jsx`)

## File Structure

```
locales/
├── en.json          # English translations
├── sv.json          # Swedish translations
└── README.md        # This file
```
