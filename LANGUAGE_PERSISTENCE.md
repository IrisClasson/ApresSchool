# Language Persistence Feature

## Overview

User language preferences are now stored in the database and persist across sessions. When a user changes their language, it's saved to their profile and automatically loaded on next login.

## Database Schema

### Users Table
A new `language` column has been added to the `users` table:

```sql
ALTER TABLE users
ADD COLUMN language VARCHAR(10) DEFAULT 'en';
```

**Column Details:**
- **Type:** VARCHAR(10)
- **Default:** 'en' (English)
- **Values:** ISO 639-1 language codes ('en', 'sv', etc.)
- **Indexed:** Yes (for performance)

## How It Works

### 1. Registration
When a new user registers, their language is set to 'en' (English) by default:

```js
// In authService.register()
{
  username: username.toLowerCase(),
  password_hash: passwordHash,
  role,
  parent_code: newParentCode,
  parent_id: parentId,
  language: 'en' // Default language
}
```

### 2. Login
When a user logs in, their language preference is loaded and applied:

```js
// In authService.login()
this.setCurrentUser({
  id: user.id,
  username: user.username,
  role: user.role,
  language: user.language || 'en'
})
```

### 3. Language Context
The `LanguageProvider` automatically loads the user's language on mount:

```js
// In LanguageContext.jsx
useEffect(() => {
  const loadUserLanguage = async () => {
    const user = await authService.getCurrentUser()
    if (user && user.language) {
      i18n.setLocale(user.language)
      setLocale(user.language)
    }
  }
  loadUserLanguage()
}, [])
```

### 4. Changing Language
When a user changes their language via the switcher, it's saved to the database:

```js
const changeLanguage = async (newLocale) => {
  i18n.setLocale(newLocale)
  setLocale(newLocale)

  // Save to database if user is logged in
  const user = await authService.getCurrentUser()
  if (user) {
    await authService.updateLanguagePreference(newLocale)
  }
}
```

## API Methods

### authService.updateLanguagePreference(language)

Updates the user's language preference in the database.

**Parameters:**
- `language` (string): ISO 639-1 language code ('en', 'sv', etc.)

**Returns:**
```js
{
  success: boolean,
  error?: string
}
```

**Example:**
```js
const result = await authService.updateLanguagePreference('sv')
if (result.success) {
  console.log('Language updated!')
}
```

## Database Migration

To apply the language column to your Supabase database:

1. The migration file is located at: `supabase/migrations/008_add_language_preference.sql`

2. If using Supabase CLI:
```bash
supabase db reset  # Resets and applies all migrations
```

3. Or run the SQL directly in Supabase dashboard:
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

UPDATE users
SET language = 'en'
WHERE language IS NULL;
```

## User Flow

### First Time User
1. User registers → language set to 'en'
2. User changes language to 'sv' → saved to database
3. User logs out
4. User logs in → language 'sv' is loaded automatically

### Existing User (Before Migration)
1. Migration adds `language` column with default 'en'
2. User logs in → language 'en' is loaded
3. User can change language → preference is saved

## Testing

### Manual Testing Steps

1. **Register a new user**
   ```
   - Go to /register
   - Create account as parent
   - Login automatically happens
   - Default language should be English
   ```

2. **Change language**
   ```
   - Open mobile menu (hamburger icon)
   - Scroll to bottom
   - Click "SV" button
   - All text should change to Swedish
   - Close and reopen menu → SV should be highlighted
   ```

3. **Test persistence**
   ```
   - Logout
   - Login again
   - Language should still be Swedish
   - Navigation text should be in Swedish
   ```

4. **Test across devices**
   ```
   - Login on different browser/device
   - Language preference should be consistent
   ```

## Fallback Behavior

The system has multiple fallback layers:

1. **Database has language** → Use database value
2. **Database doesn't have language** → Use localStorage value
3. **localStorage empty** → Default to 'en'
4. **User not logged in** → Use localStorage only

This ensures language switching works even before login.

## Supported Languages

Currently supported:
- **en** - English
- **sv** - Swedish (Svenska)

To add more languages:
1. Create new JSON file in `/locales/` (e.g., `de.json`)
2. Translate all keys
3. Import in `/src/lib/i18n.js`
4. Add button to language switcher UI

## Technical Notes

- Language preference is stored in both localStorage (for performance) and database (for persistence)
- localStorage is synced when database is updated
- The user session object includes the language field
- Language changes trigger a re-render of all components using `useTranslation()`
- Database column is indexed for faster lookups
