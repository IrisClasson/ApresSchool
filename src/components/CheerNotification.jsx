import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import './CheerNotification.css'

function CheerNotification({ recipientId, onPauseChange }) {
  const [currentCheer, setCurrentCheer] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for new cheers every 2 seconds
    const interval = setInterval(() => {
      checkForCheers()
    }, 2000)

    // Check immediately on mount
    checkForCheers()

    return () => clearInterval(interval)
  }, [recipientId])

  const checkForCheers = () => {
    const unreadCheers = localDB.getUnreadCheers(recipientId)
    if (unreadCheers.length > 0 && !currentCheer) {
      const cheer = unreadCheers[0]
      setCurrentCheer(cheer)
      setIsVisible(true)

      // Notify parent component to pause
      if (onPauseChange) {
        onPauseChange(true)
      }
    }
  }

  const handleDismiss = () => {
    if (currentCheer) {
      localDB.markCheerAsRead(currentCheer.id)
      setIsVisible(false)

      // Notify parent component to unpause
      if (onPauseChange) {
        onPauseChange(false)
      }

      // Wait for animation to finish before clearing
      setTimeout(() => {
        setCurrentCheer(null)
        // Check for next cheer
        checkForCheers()
      }, 300)
    }
  }

  if (!currentCheer || !isVisible) {
    return null
  }

  return (
    <div className="cheer-notification-overlay">
      <div className="cheer-notification-backdrop" onClick={handleDismiss} />
      <div className="cheer-notification-card">
        <div className="cheer-emoji">{currentCheer.emoji}</div>
        <div className="cheer-from">From Parent</div>
        <div className="cheer-message">{currentCheer.message}</div>
        <button className="btn btn-primary cheer-dismiss-btn" onClick={handleDismiss}>
          Awesome! Let's continue
        </button>
        <div className="cheer-sparkles">
          <span className="sparkle">✨</span>
          <span className="sparkle">⭐</span>
          <span className="sparkle">💫</span>
          <span className="sparkle">🌟</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">⭐</span>
        </div>
      </div>
    </div>
  )
}

export default CheerNotification
