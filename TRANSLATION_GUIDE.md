# Translation Implementation Guide

## ✅ What's Already Done

1. **Infrastructure**
   - ✅ i18n system (`src/lib/i18n.js`)
   - ✅ Language context (`src/contexts/LanguageContext.jsx`)
   - ✅ English translations (`locales/en.json`)
   - ✅ Swedish translations (`locales/sv.json`)
   - ✅ Language switcher in mobile nav

2. **Completed Pages**
   - ✅ Login page
   - ✅ Register page
   - ✅ App header (desktop & mobile navigation)
   - ✅ Mobile navigation menu

## 🔧 How to Add Translations to Remaining Pages

### Pattern for Every Component

```jsx
// 1. Import the hook
import { useTranslation } from '../contexts/LanguageContext'

// 2. Use it in your component
function MyComponent() {
  const { t } = useTranslation()  // Get the translation function

  return (
    <div>
      {/* Replace hardcoded text with t() calls */}
      <h2>{t('parentDashboard.title')}</h2>
      <button>{t('parentDashboard.createChallenge')}</button>

      {/* With parameters */}
      <p>{t('messages.placeholder', { name: 'John' })}</p>
    </div>
  )
}
```

## 📝 Quick Reference for Remaining Pages

### ParentDashboard.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function ParentDashboard() {
  const { t } = useTranslation()

  // Replace these strings:
  "Parent Dashboard" → {t('parentDashboard.title')}
  "+ Create Challenge" → {t('parentDashboard.createChallenge')}
  "Cancel" → {t('parentDashboard.cancel')}
  "No Kids Linked Yet" → {t('parentDashboard.noKidsTitle')}
  "Link a kid account..." → {t('parentDashboard.noKidsMessage')}
  "Total Challenges" → {t('parentDashboard.stats.total')}
  "Pending" → {t('parentDashboard.stats.pending')}
  "Accepted" → {t('parentDashboard.stats.accepted')}
  "Completed" → {t('parentDashboard.stats.completed')}
}
```

### KidView.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function KidView() {
  const { t } = useTranslation()

  // Replace:
  "Your Missions" → {t('kidView.title')}
  "🎨 Take a Creative Break!" → {t('kidView.creativeBreakButton')}
  "No active missions!" → {t('kidView.noMissionsTitle')}
  "Check back later..." → {t('kidView.noMissionsMessage')}
  "Completed Missions" → {t('kidView.completedSection')}
  "Completed" → {t('kidView.completedBadge')}
}
```

### ManageKids.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function ManageKids() {
  const { t } = useTranslation()

  // Replace:
  "Manage Kids" → {t('manageKids.title')}
  "Your Parent Code" → {t('manageKids.parentCodeTitle')}
  "📋 Copy Code" → {t('manageKids.copyButton')}
  "✓ Copied!" → {t('manageKids.copiedButton')}
  "Linked Kids" → {t('manageKids.linkedKidsTitle', { count: kids.length })}
  "Loading..." → {t('manageKids.loadingState')}
}
```

### CreateChallenge.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function CreateChallenge({ onSubmit, onCancel }) {
  const { t } = useTranslation()

  // Replace:
  "Create New Challenge" → {t('createChallenge.title')}
  "Title" → {t('createChallenge.titleLabel')}
  "Subject" → {t('createChallenge.subject')}
  "Math" → {t('createChallenge.subjects.math')}
  "Reading" → {t('createChallenge.subjects.reading')}
  // ... etc
}
```

### ChallengeCard.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function ChallengeCard({ challenge, onAccept, onComplete }) {
  const { t } = useTranslation()

  // Replace:
  "Accept Mission" → {t('challengeCard.acceptMission')}
  "Mark as Complete" → {t('challengeCard.markAsComplete')}
  "🎮 Play Number Bonds Game" → {t('challengeCard.playNumberBondsGame')}
  "Cancel" → {t('challengeCard.cancel')}
  "Submit" → {t('challengeCard.submit')}
}
```

### KidStats.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function KidStats({ stats }) {
  const { t } = useTranslation()

  // Replace:
  "Vertical Meters" → {t('kidStats.verticalMeters')}
  "Streak" → {t('kidStats.streak')}
  "Badges" → {t('kidStats.badges')}
  "100 Points" → {t('kidStats.badgeNames.century')}
  // ... etc
}
```

### FeedbackModal.jsx
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function FeedbackModal({ onSubmit, onSkip, challengeTitle }) {
  const { t } = useTranslation()

  // Replace:
  "🎉 Great job!" → {t('feedback.title')}
  "Did you like it?" → {t('feedback.sentimentLabel')}
  "How hard was it?" → {t('feedback.difficultyLabel')}
  "Skip" → {t('feedback.skip')}
  "Submit Feedback" → {t('feedback.submit')}
}
```

### Messages Pages (ParentMessages.jsx & KidMessages.jsx)
```jsx
import { useTranslation } from '../contexts/LanguageContext'

function ParentMessages() {
  const { t } = useTranslation()

  // Replace:
  "💬 Messages" → {t('messages.title')}
  "Chat with your kid..." → {t('messages.parentSubtitle')}
  "No kids linked yet" → {t('messages.noKids')}
  "Chatting with:" → {t('messages.chattingWith')}
  "Send a message to..." → {t('messages.placeholder', { name: kidName })}
}
```

## 🎯 Priority Order

Translate in this order for best user experience:

1. **ParentDashboard** - Main parent interface
2. **KidView** - Main kid interface
3. **ManageKids** - Kid management
4. **CreateChallenge** - Challenge creation
5. **ChallengeCard** - Challenge display
6. **KidStats** - Stats display
7. **FeedbackModal** - Feedback collection
8. **Messages** - Messaging interface

## ✨ Testing

After each page update:
1. Save the file (Vite will hot-reload)
2. Open mobile menu → change language to SV
3. Verify all text changed to Swedish
4. Change back to EN
5. Verify text returned to English

## 📚 All Translation Keys

See `/locales/en.json` for the complete list of available translation keys.

## 🆘 Need Help?

- Check `/locales/README.md` for detailed i18n documentation
- Look at `Login.jsx` or `Register.jsx` for complete examples
- All keys are in `/locales/en.json` and `/locales/sv.json`
