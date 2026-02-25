// Presence Service - Track online/away/offline status
// Uses localStorage with polling for real-time updates

const HEARTBEAT_INTERVAL = 3000 // 3 seconds
const AWAY_TIMEOUT = 60000 // 60 seconds
const OFFLINE_TIMEOUT = 10000 // 10 seconds after last heartbeat

class PresenceService {
  constructor() {
    this.currentUser = null
    this.heartbeatTimer = null
    this.awayTimer = null
    this.listeners = new Set()
    this.lastActivity = Date.now()
    this.isVisible = !document.hidden

    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.handleActivity = this.handleActivity.bind(this)

    // Setup visibility and activity listeners
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Visibility change (tab switch, minimize)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // User activity detection
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll']
    activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true })
    })

    // Before unload - mark as offline
    window.addEventListener('beforeunload', () => {
      if (this.currentUser) {
        this.updateStatus('offline')
      }
    })
  }

  handleVisibilityChange() {
    this.isVisible = !document.hidden

    if (this.isVisible) {
      // App came to foreground
      this.lastActivity = Date.now()
      if (this.currentUser) {
        this.updateStatus('online')
        this.startHeartbeat()
      }
      this.clearAwayTimer()
    } else {
      // App went to background - start away timer
      this.startAwayTimer()
    }
  }

  handleActivity() {
    this.lastActivity = Date.now()

    // If currently away, bring back online
    if (this.currentUser && this.getCurrentStatus() === 'away') {
      this.updateStatus('online')
    }

    // Reset away timer
    this.clearAwayTimer()
    if (!this.isVisible) {
      this.startAwayTimer()
    }
  }

  startAwayTimer() {
    this.clearAwayTimer()
    this.awayTimer = setTimeout(() => {
      if (this.currentUser) {
        this.updateStatus('away')
      }
    }, AWAY_TIMEOUT)
  }

  clearAwayTimer() {
    if (this.awayTimer) {
      clearTimeout(this.awayTimer)
      this.awayTimer = null
    }
  }

  // Start presence tracking for a user
  startTracking(userId, role = 'parent') {
    this.currentUser = { userId, role }
    this.lastActivity = Date.now()

    // Set initial status
    this.updateStatus('online')

    // Start heartbeat
    this.startHeartbeat()

    // Start listening for other users
    this.startListening()
  }

  // Stop tracking
  stopTracking() {
    if (this.currentUser) {
      this.updateStatus('offline')
    }

    this.stopHeartbeat()
    this.clearAwayTimer()
    this.currentUser = null
  }

  startHeartbeat() {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.currentUser && this.isVisible) {
        const timeSinceActivity = Date.now() - this.lastActivity

        if (timeSinceActivity < AWAY_TIMEOUT) {
          this.updateStatus('online')
        } else {
          this.updateStatus('away')
        }
      }
    }, HEARTBEAT_INTERVAL)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  updateStatus(status) {
    if (!this.currentUser) return

    const presence = {
      userId: this.currentUser.userId,
      role: this.currentUser.role,
      status,
      lastSeen: Date.now(),
      timestamp: new Date().toISOString()
    }

    // Store in localStorage
    const presenceKey = `presence_${this.currentUser.userId}`
    localStorage.setItem(presenceKey, JSON.stringify(presence))

    // Notify listeners
    this.notifyListeners()
  }

  getCurrentStatus() {
    if (!this.currentUser) return 'offline'

    const presenceKey = `presence_${this.currentUser.userId}`
    const data = localStorage.getItem(presenceKey)

    if (!data) return 'offline'

    try {
      const presence = JSON.parse(data)
      return presence.status
    } catch {
      return 'offline'
    }
  }

  // Get presence for another user
  getPresence(userId) {
    const presenceKey = `presence_${userId}`
    const data = localStorage.getItem(presenceKey)

    if (!data) {
      return {
        userId,
        status: 'offline',
        lastSeen: null
      }
    }

    try {
      const presence = JSON.parse(data)
      const timeSinceUpdate = Date.now() - presence.lastSeen

      // Check if presence is stale
      if (timeSinceUpdate > OFFLINE_TIMEOUT) {
        return {
          ...presence,
          status: 'offline'
        }
      }

      return presence
    } catch {
      return {
        userId,
        status: 'offline',
        lastSeen: null
      }
    }
  }

  // Get all active presences
  getAllPresences() {
    const presences = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('presence_')) {
        const data = localStorage.getItem(key)
        try {
          const presence = JSON.parse(data)
          const timeSinceUpdate = Date.now() - presence.lastSeen

          // Mark as offline if stale
          if (timeSinceUpdate > OFFLINE_TIMEOUT) {
            presence.status = 'offline'
          }

          presences.push(presence)
        } catch {
          // Skip invalid data
        }
      }
    }

    return presences
  }

  // Subscribe to presence changes
  subscribe(callback) {
    this.listeners.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  notifyListeners() {
    const presences = this.getAllPresences()
    this.listeners.forEach(callback => {
      try {
        callback(presences)
      } catch (error) {
        console.error('Presence listener error:', error)
      }
    })
  }

  startListening() {
    // Poll for presence changes from other users
    this.stopListening()

    this.pollTimer = setInterval(() => {
      this.notifyListeners()
    }, HEARTBEAT_INTERVAL)
  }

  stopListening() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  // Cleanup
  destroy() {
    this.stopTracking()
    this.stopListening()

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll']
    activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity)
    })

    this.listeners.clear()
  }

  // Format last seen time
  static formatLastSeen(timestamp) {
    if (!timestamp) return 'Never'

    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`

    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
}

// Export singleton instance
export const presenceService = new PresenceService()

export default presenceService
