# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Apres School** is a remote homework management app designed for parents who are away from home (like on ski trips) to send educational challenges to their kids. Parents can create skill-building assignments across different subjects, and kids work on these challenges remotely, earning points and badges for completion.

**Core Use Case**: Parents traveling or away from home want to ensure their kids stay on top of schoolwork and practice academic skills. This app provides a gamified, engaging way to assign and track homework remotely without direct supervision.

The app features:
- Parent dashboard for creating challenges across subjects (math, reading, etc.)
- Kid view for accepting, completing, and tracking missions
- Points and badge system for motivation
- AI-powered challenge generation for math problems
- Browser notifications to keep kids engaged

Built with React + Vite as a workshop demo showcasing AI-assisted development.

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

### Math Challenge System

Math challenges are selected from **predefined educational challenge types** organized by age and skill level (src/lib/aiService.js:1-115). Each challenge type focuses on a specific mathematical concept:

**Example Challenge Types**:
- **Number Bonds Mode (Age 7)**: Two numbers that make a target sum
- **Addition/Subtraction**: Basic arithmetic operations
- **Multiplication/Division**: Times tables and division practice
- **Word Problems**: Real-world math scenarios

**Generation Modes**:
- **Local generation** (generateLocalMathChallenge): Selects from predefined topics categorized by difficulty (easy/medium/hard)
- **Claude API enhancement** (generateAIMathChallenge): Optional integration that uses Claude 3 Haiku to create themed variations of predefined challenges when `VITE_ANTHROPIC_API_KEY` is configured

The system automatically falls back to local generation if API integration fails or isn't configured.

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
