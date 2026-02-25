import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import ParentDashboard from './pages/ParentDashboard'
import KidView from './pages/KidView'
import SnowballGamePage from './pages/SnowballGamePage'
import PresenceIndicator from './components/PresenceIndicator'
import presenceService from './lib/presenceService'
import './App.css'

function AppHeader() {
  const location = useLocation()

  useEffect(() => {
    // Determine role from current route
    const isKidRoute = location.pathname.startsWith('/kid') || location.pathname.startsWith('/play')
    const role = isKidRoute ? 'kid' : 'parent'
    const userId = role === 'parent' ? 'parent-1' : 'kid-1'

    // Start presence tracking
    presenceService.startTracking(userId, role)

    // Cleanup on unmount
    return () => {
      presenceService.stopTracking()
    }
  }, [location.pathname])

  // Determine other user to show
  const isKidRoute = location.pathname.startsWith('/kid') || location.pathname.startsWith('/play')
  const otherUserId = isKidRoute ? 'parent-1' : 'kid-1'
  const otherUserName = isKidRoute ? 'Parent' : 'Kid'

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>⛷️ Ski Mission Control</h1>
      </div>
      <nav>
        <Link to="/">Parent Dashboard</Link>
        <Link to="/kid">Kid View</Link>
      </nav>
      <div className="header-presence">
        <PresenceIndicator userId={otherUserId} userName={otherUserName} />
      </div>
    </header>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <AppHeader />
        <main>
          <Routes>
            <Route path="/" element={<ParentDashboard />} />
            <Route path="/kid" element={<KidView />} />
            <Route path="/play" element={<SnowballGamePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
