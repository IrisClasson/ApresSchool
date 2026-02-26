import { useEffect, useRef, useState } from 'react'
import authService from '../lib/authService'
import './MessageThread.css'

function MessageThread({ messages, currentUserRole, currentUserId }) {
  const messagesEndRef = useRef(null)
  const messageThreadRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [usernames, setUsernames] = useState({})
  const previousMessageCountRef = useRef(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const isNearBottom = () => {
    if (!messageThreadRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = messageThreadRef.current
    return scrollHeight - scrollTop - clientHeight < 100 // Within 100px of bottom
  }

  useEffect(() => {
    const currentCount = messages.length
    const previousCount = previousMessageCountRef.current

    // Only auto-scroll if:
    // 1. This is the first load (previousCount === 0)
    // 2. A new message was added (currentCount > previousCount) AND user is near bottom
    if (previousCount === 0 || (currentCount > previousCount && isNearBottom())) {
      scrollToBottom()
    }

    previousMessageCountRef.current = currentCount
  }, [messages])

  // Load usernames for all unique sender_ids
  useEffect(() => {
    const loadUsernames = async () => {
      const uniqueSenderIds = [...new Set(messages.map(m => m.sender_id))]
      const newUsernames = {}

      for (const senderId of uniqueSenderIds) {
        if (!usernames[senderId]) {
          const user = await authService.getUserById(senderId)
          if (user) {
            newUsernames[senderId] = user.username
          }
        }
      }

      if (Object.keys(newUsernames).length > 0) {
        setUsernames(prev => ({ ...prev, ...newUsernames }))
      }
    }

    if (messages.length > 0) {
      loadUsernames()
    }
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
    <>
      <div className="message-thread" ref={messageThreadRef}>
        {messages.map((msg) => {
          const isOwnMessage = currentUserId ? msg.sender_id === currentUserId : msg.sender_role === currentUserRole
          const senderName = usernames[msg.sender_id] || (msg.sender_role === 'parent' ? 'Parent' : 'Kid')

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
                {msg.message_type === 'drawing' ? (
                  <>
                    <p>{msg.content}</p>
                    <img
                      src={msg.image_data}
                      alt="Drawing"
                      className="message-drawing"
                      onClick={() => setSelectedImage(msg.image_data)}
                      style={{ cursor: 'pointer' }}
                    />
                  </>
                ) : (
                  msg.content
                )}
              </div>
              {!msg.is_read && !isOwnMessage && (
                <div className="unread-indicator">New</div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div className="image-modal-content">
            <img
              src={selectedImage}
              alt="Drawing enlarged"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MessageThread
