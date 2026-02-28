import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import authService from '../lib/authService'
import { useTranslation } from '../contexts/LanguageContext'
import PresenceIndicator from './PresenceIndicator'
import './MobileNav.css'

function MobileNav({ currentUser, unreadCount, isKid }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { t, locale, changeLanguage } = useTranslation()

  // Determine other user (parent or kid) for presence
  const otherUserId = isKid ? 'parent-1' : 'kid-1'
  const otherUserName = isKid ? t('presence.parent') : t('presence.kid')

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  const handleLanguageChange = (lang) => {
    changeLanguage(lang)
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

        {/* Presence Indicator */}
        <div className="mobile-presence-section">
          <PresenceIndicator userId={otherUserId} userName={otherUserName} showLabel={true} />
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
                {t('mobileNav.dashboard')}
              </Link>
              <Link
                to="/stats"
                className={isActive('/stats') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">📊</span>
                {t('mobileNav.stats')}
              </Link>
              <Link
                to="/messages"
                className={isActive('/messages') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">💬</span>
                {t('mobileNav.messages')}
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
                {t('mobileNav.manageKids')}
              </Link>
              <Link
                to="/kid"
                className={isActive('/kid') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎮</span>
                {t('mobileNav.kidView')}
              </Link>
              <Link
                to="/creative-break"
                className={isActive('/creative-break') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎨</span>
                {t('mobileNav.creativeBreak')}
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
                {t('mobileNav.yourMissions')}
              </Link>
              <Link
                to="/kid-messages"
                className={isActive('/kid-messages') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">💬</span>
                {t('mobileNav.messages')}
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
                {t('mobileNav.linkParent')}
              </Link>
              <Link
                to="/creative-break"
                className={isActive('/creative-break') ? 'active' : ''}
                onClick={closeMenu}
              >
                <span className="nav-icon">🎨</span>
                {t('mobileNav.creativeBreak')}
              </Link>
            </>
          )}
        </div>

        <div className="mobile-nav-footer">
          <div className="language-switcher">
            <span className="nav-icon">🌐</span>
            <span style={{ marginRight: '0.75rem', fontWeight: '600' }}>Language:</span>
            <div className="language-buttons">
              <button
                className={`lang-btn ${locale === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                EN
              </button>
              <button
                className={`lang-btn ${locale === 'sv' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('sv')}
              >
                SV
              </button>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {t('mobileNav.logout')}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default MobileNav
