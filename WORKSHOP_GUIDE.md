# 🎓 Workshop Guide: Building Ski Mission Control with Claude Code

## Workshop Overview (4 hours)

This guide walks through how this app was built with Claude Code and provides ideas for extending it during your workshop.

## ⏱️ Time Breakdown

### Hour 1: Setup & Core Features (DONE ✅)
- ✅ Vite + React project setup
- ✅ Routing structure (Parent/Kid views)
- ✅ localStorage-based data management
- ✅ Basic UI with ski theme

### Hour 2: Dashboard & Challenge Management (DONE ✅)
- ✅ Parent Dashboard with stats
- ✅ Create Challenge form
- ✅ Challenge List component
- ✅ Kid View with challenge cards

### Hour 3: AI & Notifications (DONE ✅)
- ✅ AI math problem generator
- ✅ Browser notification system
- ✅ Sound effects
- ✅ Gamification (points & badges)

### Hour 4: Polish & Documentation (DONE ✅)
- ✅ README and documentation
- ✅ Code cleanup
- ✅ Workshop guide

## 🎯 Workshop Activities

### Activity 1: Add a New Badge Type (20 minutes)

**Goal**: Create a "Speed Demon" badge for completing challenges quickly

**Steps**:
1. Open `src/components/KidStats.jsx`
2. Add the badge definition to the `badges` object
3. Open `src/pages/KidView.jsx`
4. In `handleCompleteChallenge`, add logic to check completion time
5. Award the badge if completed in under 10 minutes

**Code hint**:
```javascript
// Calculate time taken
const timeTaken = new Date() - new Date(challenge.accepted_at)
const minutesTaken = timeTaken / (1000 * 60)

if (minutesTaken < 10 && !newStats.badges.includes('speed-demon')) {
  newStats.badges.push('speed-demon')
}
```

### Activity 2: Add a Hint System (30 minutes)

**Goal**: Let kids request hints for difficult challenges

**Steps**:
1. Add a `hints` array to challenge data structure
2. Create a "Request Hint" button in `ChallengeCard.jsx`
3. Use Claude API to generate contextual hints
4. Track hint usage (maybe reduce points for using hints)

### Activity 3: Photo Upload (25 minutes)

**Goal**: Let kids submit photos of completed work

**Steps**:
1. Add file input to complete form in `ChallengeCard.jsx`
2. Convert to base64 or use FileReader API
3. Store in challenge result
4. Display in Parent Dashboard

### Activity 4: Parent Notifications (15 minutes)

**Goal**: Notify parents when kids complete challenges

**Steps**:
1. Create `ParentView` context/hook
2. Add notification on challenge state change
3. Show notification badge on Parent Dashboard

## 🧠 Discussion Topics

### Architecture Decisions
- **Why localStorage?** Fast to implement, no backend needed for demo
- **Component structure?** Reusable, single responsibility
- **State management?** Props + hooks for simple app, could use Context for larger app

### AI Integration
- **Local generation vs API**: Tradeoffs in cost, quality, latency
- **Prompt engineering**: How to structure prompts for consistent output
- **Error handling**: Always have fallbacks

### Production Considerations
- Real database (Supabase, Firebase)
- Authentication and multi-user support
- Mobile responsiveness
- PWA features (offline, install)
- Analytics and monitoring

## 💡 Extension Ideas

### Easy (15-30 min each)
- [ ] Add more challenge subjects (reading, science)
- [ ] Timer component for time-limited challenges
- [ ] Dark mode toggle
- [ ] Export completed challenges as PDF

### Medium (30-60 min each)
- [ ] Challenge templates (save and reuse)
- [ ] Multi-child support (profiles)
- [ ] Calendar view of challenges
- [ ] Reward system (unlock games/videos)

### Advanced (1-2 hours each)
- [ ] Real-time sync with Supabase
- [ ] Video chat for homework help
- [ ] AI tutor integration
- [ ] Mobile app with React Native

## 🎤 Presentation Tips

### Demo Flow
1. **Parent View**: Show creating a challenge with AI generation
2. **Switch to Kid View**: Show accepting the challenge (notification!)
3. **Complete**: Show completion with points and badges
4. **Back to Parent**: Show updated stats

### Key Features to Highlight
- **Speed**: Built in 4 hours with Claude Code
- **AI Integration**: Smart challenge generation
- **Real-world Use Case**: Actually useful for ski trip!
- **Extensible**: Easy to add features

### Code Highlights
- **Component reusability**: `ChallengeCard` used in multiple contexts
- **Service layer**: Clean separation (aiService, notifications)
- **Progressive enhancement**: Works without API keys

## 🐛 Common Issues & Solutions

### Notifications not working?
- Check browser permissions
- Safari requires user interaction first
- Some browsers block in incognito mode

### AI generation fails?
- Check API key in .env
- Falls back to local generation automatically
- Check network/CORS issues

### Data not persisting?
- Check browser localStorage limits (usually 5-10MB)
- Clear storage if testing: `localStorage.clear()`

## 📚 Resources

- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

**Happy Coding!** 🎿⛷️
