# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ski Mission Control** is a gamified homework challenge app for parents and kids during ski trips. Parents create challenges via a dashboard, kids accept and complete missions through their view, earning points and badges. Built with React + Vite as a workshop demo showcasing AI-assisted development.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Data Layer Strategy

The app uses a **dual-mode data layer** (src/lib/supabase.js:1-70):
- **localStorage mode** (default): All data persists in browser storage via `localDB` helper object
- **Supabase mode** (optional): Enabled when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables are set
- The `useLocalStorage` flag (src/lib/supabase.js:14) determines which mode is active

When adding data operations, implement both localStorage fallback and Supabase integration paths.

### Challenge Lifecycle

Challenges flow through three states tracked in the database:
1. **pending**: Parent created, waiting for kid acceptance
2. **accepted**: Kid has committed to the challenge
3. **completed**: Kid submitted completion with optional result data

State transitions occur in KidView (src/pages/KidView.jsx:25-71):
- `handleAcceptChallenge`: pending → accepted (triggers notification)
- `handleCompleteChallenge`: accepted → completed (awards points, updates stats, checks badge eligibility)

### AI Challenge Generation

src/lib/aiService.js:1-115 provides two generation modes:
- **Local fallback** (generateLocalMathChallenge): Template-based generation using predefined topics and difficulty levels
- **Claude API** (generateAIMathChallenge): Uses Claude 3 Haiku for dynamic, themed challenge generation when `VITE_ANTHROPIC_API_KEY` is configured

The AI service automatically falls back to local generation if API integration fails or isn't configured.

### Points and Gamification System

Points calculation (src/pages/KidView.jsx:73-80):
- Easy: 10 points
- Medium: 20 points
- Hard: 30 points

Badge awards (src/pages/KidView.jsx:56-62):
- `century`: Awarded at 100 total points
- `streak-3`: Awarded at 3 consecutive completions

Stats persist in localStorage/Supabase including `points`, `badges` array, and `streak` counter.

### Notification System

Browser notifications (src/lib/notifications.js) trigger on:
- Challenge acceptance
- Challenge completion
- Scheduled reminders based on "nag level" (gentle/normal/relentless)

Permission must be requested before notifications work. KidView requests permission on mount (src/pages/KidView.jsx:15).

## Component Structure

**Pages** (route-level components):
- `ParentDashboard`: CRUD operations for challenges, statistics display
- `KidView`: Challenge acceptance/completion, stats tracking, completed history

**Shared Components**:
- `ChallengeCard`: Individual challenge UI with action buttons (context-aware: shows accept/complete for kids, view-only for parents)
- `ChallengeList`: Renders filtered challenge arrays
- `CreateChallenge`: Form with difficulty selection, subject, time estimate, and "nag level"
- `KidStats`: Displays points, badges, and streak

## Environment Variables

Optional configuration via `.env`:

```bash
# Claude API integration for AI challenge generation
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Supabase for cross-device syncing (replaces localStorage)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

App functions fully without any environment variables using local fallbacks.

## Key Design Patterns

- **Progressive Enhancement**: Features work with localStorage, upgrade gracefully to Supabase/Claude API when configured
- **State Colocation**: Component state management using React hooks, data operations through unified `localDB` interface
- **Notification-First**: Actions trigger browser notifications to maintain engagement across tabs
- **Ski Theming**: All UI uses mountain/ski terminology ("missions", "vertical meters" for points)
