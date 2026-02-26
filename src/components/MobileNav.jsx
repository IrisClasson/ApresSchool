import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import authService from '../lib/authService'
import './MobileNav.css'

function MobileNav({ currentUser, unreadCount, isKid }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="mobile-nav">
      {/* Message Icon with Badge */}
      <Link
        to={isKid ? "/kid-messages" : "/messages"}
        className="mobile-message-icon"
        onClick={closeMenu}
      >
        💬
        {unreadCount > 0 && (
          <span className="mobile-message-badge">{unreadCount}</span>
        )}
      </Link>

      {/* Hamburger Button */}
      <button
        className={`hamburger-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isOpen && <div className="mobile-nav-overlay" onClick={closeMenu}></div>}

      {/* Slide-out Menu */}
      <nav className={`mobile-nav-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-nav-user">
            <span className="user-icon">👤</span>
            <span className="user-name">{currentUser?.username}</span>
          </div>
          <button className="close-btn" onClick={closeMenu}>✕</button>
        </div>

        <div className="mobile-nav-links">
          {!isKid ? (
            <>
              <Link
                to="/"
                className={isActive('/') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🏠</span>
                Dashboard
              </Link>
              <Link
                to="/stats"
                className={isActive('/stats') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">📊</span>
                Stats
              </Link>
              <Link
                to="/messages"
                className={isActive('/messages') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">💬</span>
                Messages
                {unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </Link>
              <Link
                to="/manage-kids"
                className={isActive('/manage-kids') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">👥</span>
                Manage Kids
              </Link>
              <Link
                to="/kid"
                className={isActive('/kid') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎮</span>
                Kid View
              </Link>
              <Link
                to="/creative-break"
                className={isActive('/creative-break') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎨</span>
                Creative Break
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/kid"
                className={isActive('/kid') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎯</span>
                Your Missions
              </Link>
              <Link
                to="/kid-messages"
                className={isActive('/kid-messages') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">💬</span>
                Messages
                {unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </Link>
              <Link
                to="/link-parent"
                className={isActive('/link-parent') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">👨‍👩‍👧‍👦</span>
                Link Parent
              </Link>
              <Link
                to="/creative-break"
                className={isActive('/creative-break') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎨</span>
                Creative Break
              </Link>
            </>
          )}
        </div>

        <div className="mobile-nav-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon"></span>
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

export default MobileNav
