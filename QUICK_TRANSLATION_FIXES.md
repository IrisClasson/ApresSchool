# Quick Translation Fixes

## Completed ✅
- Login
- Register
- App Header
- Mobile Nav
- Parent Dashboard

## Remaining Pages - Quick Reference

Copy these code snippets to complete the translations:

### 1. KidView.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text (around line 132-180):**
```jsx
<h2>{t('kidView.title')}</h2>  // was "Your Missions"
{t('kidView.creativeBreakButton')}  // was "🎨 Take a Creative Break!"
<h3>{t('kidView.noMissionsTitle')}</h3>  // was "No active missions!"
<p>{t('kidView.noMissionsMessage')}</p>  // was "Check back later..."
<h3>{t('kidView.completedSection')}</h3>  // was "Completed Missions"
{t('kidView.completedBadge')}  // was "Completed"
```

### 2. ManageKids.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
<h1>{t('manageKids.title')}</h1>  // was "Manage Kids"
<p>{t('manageKids.subtitle')}</p>  // was "Share your parent code..."
<h2>{t('manageKids.parentCodeTitle')}</h2>  // was "Your Parent Code"
{t('manageKids.copyButton')}  // was "📋 Copy Code"
{t('manageKids.copiedButton')}  // was "✓ Copied!"
{t('manageKids.loadingState')}  // was "Loading..."
```

### 3. CreateChallenge.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
<h3>{t('createChallenge.title')}</h3>  // was "Create New Challenge"
<label>{t('createChallenge.titleLabel')}</label>  // was "Title"
<label>{t('createChallenge.subject')}</label>  // was "Subject"
{t('createChallenge.subjects.math')}  // was "Math"
{t('createChallenge.subjects.reading')}  // was "Reading"
{t('createChallenge.cancel')}  // was "Cancel"
{t('createChallenge.create')}  // was "Create Challenge"
```

### 4. ChallengeCard.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
{t('challengeCard.acceptMission')}  // was "Accept Mission"
{t('challengeCard.markAsComplete')}  // was "Mark as Complete"
{t('challengeCard.playNumberBondsGame')}  // was "🎮 Play Number Bonds Game"
{t('challengeCard.cancel')}  // was "Cancel"
{t('challengeCard.submit')}  // was "Submit"
```

### 5. KidStats.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
{t('kidStats.verticalMeters')}  // was "Vertical Meters"
{t('kidStats.streak')}  // was "Streak"
{t('kidStats.badges')}  // was "Badges"
{t('kidStats.badgeNames.century')}  // was "100 Points"
```

### 6. FeedbackModal.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
<h2>{t('feedback.title')}</h2>  // was "🎉 Great job!"
<p>{t('feedback.subtitle', { challengeTitle })}</p>  // was "Tell us about..."
<label>{t('feedback.sentimentLabel')}</label>  // was "Did you like it?"
<label>{t('feedback.difficultyLabel')}</label>  // was "How hard was it?"
{t('feedback.skip')}  // was "Skip"
{t('feedback.submit')}  // was "Submit Feedback"
```

### 7. ParentMessages.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
<h2>{t('messages.title')}</h2>  // was "💬 Messages"
<p>{t('messages.parentSubtitle')}</p>  // was "Chat with your kid..."
{t('messages.noKids')}  // was "No kids linked yet"
{t('messages.chattingWith')}  // was "Chatting with:"
{t('messages.placeholder', { name: kidName })}  // was "Send a message to..."
```

### 8. KidMessages.jsx

**Add import:**
```jsx
import { useTranslation } from '../contexts/LanguageContext'
```

**Add hook:**
```jsx
const { t } = useTranslation()
```

**Replace text:**
```jsx
<h2>{t('messages.title')}</h2>  // was "💬 Messages"
<p>{t('messages.kidSubtitle')}</p>  // was "Chat with your parent"
{t('messages.noParent')}  // was "No parent linked yet"
{t('messages.placeholder', { name: 'your parent' })}  // was "Send a message..."
```

## Testing After Each Change

1. Save the file
2. Dev server auto-reloads
3. Open mobile menu → change to SV
4. Check that the text changed to Swedish
5. Change back to EN
6. Verify it's back to English

## All Keys Are Ready!

Every translation key mentioned above already exists in:
- `/locales/en.json`
- `/locales/sv.json`

You just need to:
1. Add the import
2. Add the hook
3. Replace the hardcoded strings with `t()` calls

Should take ~2 minutes per file!
