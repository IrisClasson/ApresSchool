import { useState, useEffect } from 'react'
import presenceService from '../lib/presenceService'
import './PresenceIndicator.css'

function PresenceIndicator({ userId, userName, showLabel = true }) {
  const [presence, setPresence] = useState({
    status: 'offline',
    lastSeen: null
  })

  useEffect(() => {
    // Get initial presence
    updatePresence()

    // Subscribe to presence changes
    const unsubscribe = presenceService.subscribe(() => {
      updatePresence()
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [userId])

  const updatePresence = () => {
    if (userId) {
      const userPresence = presenceService.getPresence(userId)
      setPresence(userPresence)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#27AE60' // Green
      case 'away':
        return '#F39C12' // Orange
      case 'offline':
      default:
        return '#95A5A6' // Gray
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Away'
      case 'offline':
      default:
        return 'Offline'
    }
  }

  const formatLastSeen = () => {
    if (presence.status === 'online') return 'Active now'
    if (presence.status === 'away') return 'Away'
    if (!presence.lastSeen) return 'Never online'

    return `Last seen ${presenceService.constructor.formatLastSeen(presence.lastSeen)}`
  }

  return (
    <div className="presence-indicator">
      <div
        className={`status-dot ${presence.status}`}
        style={{ backgroundColor: getStatusColor(presence.status) }}
        title={formatLastSeen()}
      >
        <div className="status-pulse"></div>
      </div>
      {showLabel && (
        <div className="presence-info">
          <span className="presence-name">{userName || 'User'}</span>
          <span className="presence-status">{formatLastSeen()}</span>
        </div>
      )}
    </div>
  )
}

export default PresenceIndicator
