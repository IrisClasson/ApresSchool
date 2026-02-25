// Notification service for challenge updates

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Play notification sound
const playSound = (type = 'default') => {
  const sounds = {
    new: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBil',
    complete: 'data:audio/wav;base64,UklGRmQEAABXQVZFZm10IBAAAAABAAEAiBcAAIgXAAABAAgAZGF0YUAEAACB/YKMkoiVjpmRloqLi4iHhoeGhYWEg4OCgYB/fn18e3p5eHd2dXRzcnFwb25tbGppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLS0pJSEdGRURDQkFAP0A+PT0',
    accept: 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAiBcAAIgXAAABAAgAZGF0YSADAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBilz',
    reminder: 'data:audio/wav;base64,UklGRjwCAABXQVZFZm10IBAAAAABAAEAiBcAAIgXAAABAAgAZGF0YRgCAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBg'
  }

  try {
    const audio = new Audio(sounds[type] || sounds.default)
    audio.volume = 0.3
    audio.play().catch(err => console.log('Sound play failed:', err))
  } catch (error) {
    console.log('Sound creation failed:', error)
  }
}

// Send browser notification
export const sendNotification = (title, body, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/ski.svg',
      badge: '/ski.svg',
      tag: options.tag || 'challenge-notification',
      requireInteraction: options.requireInteraction || false,
      ...options
    })

    // Play sound
    playSound(options.sound || 'default')

    // Auto close after delay
    if (options.autoClose !== false) {
      setTimeout(() => notification.close(), options.duration || 5000)
    }

    return notification
  }
  return null
}

// Notification types for different events
export const notifyNewChallenge = (challengeTitle) => {
  return sendNotification(
    '🎿 New Challenge Available!',
    `Mission: ${challengeTitle}`,
    { sound: 'new', tag: 'new-challenge' }
  )
}

export const notifyChallengeAccepted = (challengeTitle) => {
  return sendNotification(
    '✅ Challenge Accepted!',
    `Starting: ${challengeTitle}`,
    { sound: 'accept', tag: 'challenge-accepted', duration: 3000 }
  )
}

export const notifyChallengeCompleted = (challengeTitle, points) => {
  return sendNotification(
    '🏆 Challenge Completed!',
    `${challengeTitle} - Earned ${points} points!`,
    { sound: 'complete', tag: 'challenge-completed', requireInteraction: true }
  )
}

export const notifyReminder = (challengeTitle, nagLevel = 'normal') => {
  const messages = {
    gentle: `Hey! Don't forget about: ${challengeTitle}`,
    normal: `Reminder: ${challengeTitle} is waiting!`,
    relentless: `⚠️ TIME TO COMPLETE: ${challengeTitle}!`
  }

  return sendNotification(
    '⏰ Challenge Reminder',
    messages[nagLevel] || messages.normal,
    { sound: 'reminder', tag: 'reminder', requireInteraction: nagLevel === 'relentless' }
  )
}

// Schedule reminder for a challenge
export const scheduleReminder = (challenge, intervalMinutes = 15) => {
  if (challenge.status === 'accepted' && challenge.nagLevel !== 'gentle') {
    const intervalMs = intervalMinutes * 60 * 1000
    const timerId = setInterval(() => {
      notifyReminder(challenge.title, challenge.nagLevel)
    }, intervalMs)

    return timerId
  }
  return null
}

// Cancel scheduled reminder
export const cancelReminder = (timerId) => {
  if (timerId) {
    clearInterval(timerId)
  }
}
