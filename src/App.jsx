import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ParentDashboard from './pages/ParentDashboard'
import ParentStats from './pages/ParentStats'
import ParentMessages from './pages/ParentMessages'
import ManageKids from './pages/ManageKids'
import KidView from './pages/KidView'
import KidMessages from './pages/KidMessages'
import LinkParent from './pages/LinkParent'
import NumberBondsGamePage from './pages/NumberBondsGamePage'
import SnowballGamePage from './pages/SnowballGamePage'
import Login from './pages/Login'
import Register from './pages/Register'
import PresenceIndicator from './components/PresenceIndicator'
import AppVersion from './components/AppVersion'
import MobileNav from './components/MobileNav'
import presenceService from './lib/presenceService'
import authService from './lib/authService'
import notificationService from './lib/notificationService'
import { localDB } from './lib/supabase'
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem',
        color: 'var(--deep-burgundy)'
      }}>
        Loading...
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppHeader() {
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // IMPORTANT: All hooks must be called before any early returns
  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)
      setLoading(false)

      // Request notification permissions after user is loaded (only if authenticated)
      if (user && notificationService.isSupported()) {
        // Wait a bit before asking for permissions to not overwhelm the user
        setTimeout(() => {
          notificationService.requestPermission()
        }, 2000)
      }
    }
    loadUser()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
      } else if (event === 'SIGNED_IN') {
        const user = await authService.getCurrentUser()
        setCurrentUser(user)

        // Request notification permissions on sign in
        if (user && notificationService.isSupported()) {
          setTimeout(() => {
            notificationService.requestPermission()
          }, 2000)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Only run if we have a current user
    if (!currentUser) return

    // Use actual user role from authenticated user
    const role = currentUser.role
    const userId = role === 'parent' ? 'parent-1' : 'kid-1'

    // Start presence tracking
    presenceService.startTracking(userId, role)

    // Update unread message count
    const count = localDB.getUnreadCount(userId, role)
    setUnreadCount(count)

    // Set up interval to check for new messages
    const interval = setInterval(() => {
      const newCount = localDB.getUnreadCount(userId, role)
      setUnreadCount(newCount)
    }, 3000) // Check every 3 seconds

    // Cleanup on unmount
    return () => {
      presenceService.stopTracking()
      clearInterval(interval)
    }
  }, [currentUser])

  // Don't show header on login/register pages or if not authenticated
  if (loading || !currentUser || location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  // Determine if current user is a kid
  const isKid = currentUser?.role === 'kid'
  const otherUserId = isKid ? 'parent-1' : 'kid-1'
  const otherUserName = isKid ? 'Parent' : 'Kid'

  return (
    <>
      {/* Desktop Header */}
      <header className="app-header desktop-header">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <h1>⛷️ Apres School</h1>
          </Link>
        </div>
        <nav>
        {!isKid ? (
          <>
            <Link to="/">Parent Dashboard</Link>
            <Link to="/stats">Stats</Link>
            <Link to="/messages" className="nav-link-with-badge">
              Messages
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </Link>
            <Link to="/manage-kids">Manage Kids</Link>
            <Link to="/kid">Kid View</Link>
          </>
        ) : (
          <>
            <Link to="/kid">Your Missions</Link>
            <Link to="/kid-messages" className="nav-link-with-badge">
              Messages
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </Link>
          </>
        )}
      </nav>
        <div className="header-right">
          <div className="header-user-info">
            <span className="user-badge">👤 {currentUser.username}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="header-presence">
            <PresenceIndicator userId={otherUserId} userName={otherUserName} />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        currentUser={currentUser}
        unreadCount={unreadCount}
        isKid={isKid}
      />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <AppHeader />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <ParentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute>
                <ParentStats />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <ParentMessages />
              </ProtectedRoute>
            } />
            <Route path="/manage-kids" element={
              <ProtectedRoute>
                <ManageKids />
              </ProtectedRoute>
            } />
            <Route path="/kid" element={
              <ProtectedRoute>
                <KidView />
              </ProtectedRoute>
            } />
            <Route path="/kid-messages" element={
              <ProtectedRoute>
                <KidMessages />
              </ProtectedRoute>
            } />
            <Route path="/link-parent" element={
              <ProtectedRoute>
                <LinkParent />
              </ProtectedRoute>
            } />
            <Route path="/play-bonds" element={
              <ProtectedRoute>
                <NumberBondsGamePage />
              </ProtectedRoute>
            } />
            <Route path="/play" element={
              <ProtectedRoute>
                <SnowballGamePage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <AppVersion />
      </div>
    </Router>
  )
}

export default App
