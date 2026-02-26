import { useEffect, useRef } from 'react'
import './MessageThread.css'

function MessageThread({ messages, currentUserRole, currentUserId }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (messages.length === 0) {
    return (
      <div className="message-thread empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No messages yet</h3>
          <p>Start a conversation by sending a message below!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="message-thread">
      {messages.map((msg) => {
        const isOwnMessage = currentUserId ? msg.sender_id === currentUserId : msg.sender_role === currentUserRole
        const senderName = msg.sender_role === 'parent' ? 'Parent' : 'Kid'

        return (
          <div
            key={msg.id}
            className={`message-bubble ${isOwnMessage ? 'own' : 'other'} ${!msg.is_read && !isOwnMessage ? 'unread' : ''}`}
          >
            <div className="message-header">
              <span className="message-sender">{senderName}</span>
              <span className="message-time">{formatTimestamp(msg.created_at)}</span>
            </div>
            <div className="message-content">
              {msg.content}
            </div>
            {!msg.is_read && !isOwnMessage && (
              <div className="unread-indicator">New</div>
            )}
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageThread
