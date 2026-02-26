import { useState, useEffect } from 'react'
import './InAppNotification.css'

function InAppNotification({ message, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`in-app-notification ${isExiting ? 'exiting' : ''}`}
      onClick={handleClose}
    >
      <div className="notification-content">
        <span className="notification-icon">{message.icon || '💬'}</span>
        <div className="notification-text">
          <div className="notification-title">{message.title}</div>
          {message.body && <div className="notification-body">{message.body}</div>}
        </div>
      </div>
    </div>
  )
}

export default InAppNotification
