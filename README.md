# ⛷️ Apres School

**A fun homework challenge app for parents and kids during ski trips!**

Built for an AI workshop showcasing Claude Code capabilities.

## 🎯 What It Does

Manage kids' homework remotely during your ski trip:
- **Parents** create challenges with difficulty levels and nagging modes
- **Kids** accept missions, complete them, and earn points
- **AI-powered** math challenge generator
- **Real-time notifications** with sound effects
- **Gamification** with points, badges, and ski-themed rewards

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open http://localhost:5173
```

## 📱 Features

### Parent Dashboard
- Create custom challenges for any subject
- Set difficulty (Easy/Medium/Hard)
- Configure "nag level" (Gentle/Normal/Relentless)
- AI-generated math challenges
- Track challenge status in real-time
- View statistics

### Kid View
- See active missions
- Accept challenges
- **Play the Snowball Game!** - Interactive number bonds game
- Complete and submit work
- Earn points and badges
- Track progress with ski-themed stats

### 🎮 Snowball Game (NEW!)
- **Gamified number bonds learning** - Roll down a snowy hill!
- Control a snowball with your mouse/touch
- Collect correct number pairs that make the target number
- Avoid wrong numbers or lose lives
- Track progress with visual number bond display
- Win condition: Collect all number bonds for the target
- Animated mountain scenery and ski-themed graphics

### AI Math Generator
- Generates age-appropriate math problems
- Adapts to difficulty level
- Can integrate with Claude API for advanced generation

### Notification System
- Browser notifications for challenge events
- Sound effects for engagement
- Scheduled reminders based on nag level

## 🎮 Gamification

- **Points System**: Earn 10/20/30 points based on difficulty
- **Badges**: Unlock achievements like "Century" (100 points) and "Hat Trick" (3 in a row)
- **Ski Theme**: "Vertical Meters" instead of points, mountain imagery

## 🔧 Configuration

### Optional: Claude API Integration

Create a `.env` file:

```bash
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

The app works without the API key (using local generation) but can use Claude for more sophisticated challenge generation.

### Optional: Supabase Integration

For real-time syncing across devices:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Currently uses localStorage for demo purposes.

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Custom CSS with ski theme
- **State**: localStorage (upgradeable to Supabase)
- **AI**: Claude API integration ready
- **Notifications**: Browser Notification API

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChallengeCard.jsx
│   ├── ChallengeList.jsx
│   ├── CreateChallenge.jsx
│   └── KidStats.jsx
├── pages/              # Route pages
│   ├── ParentDashboard.jsx
│   └── KidView.jsx
├── lib/                # Services and utilities
│   ├── supabase.js     # Database (localStorage fallback)
│   ├── aiService.js    # AI challenge generation
│   └── notifications.js # Notification system
├── App.jsx             # Main app component
└── main.jsx           # Entry point
```

## 🎨 Customization Ideas

1. **Add more subjects**: Extend beyond math to science, reading, etc.
2. **Custom badges**: Create ski-themed achievements
3. **Photo submission**: Let kids upload photos of completed work
4. **Parent notifications**: Alert parents when challenges are completed
5. **Leaderboards**: For families with multiple kids
6. **Streak bonuses**: Extra points for consecutive days

## 🧪 Workshop Demo Flow

1. **Start** (5 min): Show the running app, explain the use case
2. **Code Tour** (10 min): Walk through key components
3. **Live Coding** (30 min): Add a new feature together
   - Suggested: Add a new badge type
   - Or: Create a "hint" system for challenges
4. **AI Integration** (15 min): Demonstrate Claude API usage
5. **Q&A** (10 min): Discuss architecture, deployment, scaling

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy the dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

## 📝 Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] Push notifications via service worker
- [ ] Offline support with PWA
- [ ] Multi-language support
- [ ] Teacher/school version
- [ ] Analytics dashboard for parents

## 🤝 Contributing

This is a workshop demo project, but feel free to fork and extend it!

## 📄 License

MIT - Built for educational purposes

---

**Built with Claude Code** - Demonstrating rapid full-stack development with AI assistance
