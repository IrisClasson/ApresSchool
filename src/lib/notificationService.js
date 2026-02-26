// Notification Service for Push Notifications

class NotificationService {
  constructor() {
    this.permission = 'default'
    this.broadcastChannel = null
    this.initializePermission()
    this.initializeBroadcastChannel()
  }

  initializeBroadcastChannel() {
    // Use BroadcastChannel for cross-tab notifications
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('apres-school-notifications')

      // Listen for notifications from other tabs
      this.broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data

        switch (type) {
          case 'NEW_MESSAGE':
            this.showNotification(data.title, data.options)
            break
          case 'NEW_CHALLENGE':
            this.showNotification(data.title, data.options)
            break
          case 'CHEER':
            this.showNotification(data.title, data.options)
            break
          case 'CHALLENGE_UPDATE':
            this.showNotification(data.title, data.options)
            break
        }
      }
    }
  }

  initializePermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  async showNotification(title, options = {}) {
    // Ensure we have permission
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        console.warn('Notification permission not granted')
        return null
      }
    }

    try {
      // Check if service worker is available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker for persistent notifications
        const registration = await navigator.serviceWorker.ready
        return await registration.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: options.tag || 'apres-school-notification',
          requireInteraction: false,
          ...options
        })
      } else {
        // Fallback to regular notification
        return new Notification(title, {
          icon: '/icon-192.png',
          vibrate: [200, 100, 200],
          ...options
        })
      }
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }

  async notifyNewMessage(message) {
    const senderName = message.sender_role === 'parent' ? 'Parent' : 'Kid'

    const title = '💬 New Message'
    const options = {
      body: `${senderName}: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`,
      tag: 'message-notification',
      data: {
        type: 'message',
        messageId: message.id,
        url: message.sender_role === 'parent' ? '/kid-messages' : '/messages'
      }
    }

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'NEW_MESSAGE',
        data: { title, options }
      })
    }

    return await this.showNotification(title, options)
  }

  async notifyNewChallenge(challenge) {
    const title = '🎯 New Challenge!'
    const options = {
      body: `${challenge.title}\n${challenge.points} points · ${challenge.timeEstimate} min`,
      tag: 'challenge-notification',
      data: {
        type: 'challenge',
        challengeId: challenge.id,
        url: '/kid'
      }
    }

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'NEW_CHALLENGE',
        data: { title, options }
      })
    }

    return await this.showNotification(title, options)
  }

  async notifyChallengeUpdate(challenge, status) {
    const statusEmojis = {
      accepted: '✅',
      completed: '🎉',
      rejected: '❌'
    }

    const statusText = {
      accepted: 'accepted',
      completed: 'completed',
      rejected: 'rejected'
    }

    const title = `${statusEmojis[status]} Challenge ${statusText[status]}!`
    const options = {
      body: challenge.title,
      tag: 'challenge-update-notification',
      data: {
        type: 'challenge-update',
        challengeId: challenge.id,
        url: '/'
      }
    }

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'CHALLENGE_UPDATE',
        data: { title, options }
      })
    }

    return await this.showNotification(title, options)
  }

  async notifyCheer(cheer) {
    const title = '🎉 You got a cheer!'
    const options = {
      body: `${cheer.emoji} ${cheer.message}`,
      tag: 'cheer-notification',
      requireInteraction: true, // Keep visible until acknowledged
      data: {
        type: 'cheer',
        cheerId: cheer.id
      }
    }

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'CHEER',
        data: { title, options }
      })
    }

    return await this.showNotification(title, options)
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window
  }

  // Get current permission status
  getPermission() {
    return this.permission
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService()
export default notificationService
