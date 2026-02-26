import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import './MessagesList.css'

function MessagesList({ currentUserId, currentUserRole, otherUserId, otherUserRole }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    loadMessages()
    // Mark all messages as read when viewing
    localDB.markAllMessagesAsRead(currentUserId, currentUserRole)
  }, [currentUserId, currentUserRole, otherUserId, otherUserRole])

  const loadMessages = () => {
    const conversation = localDB.getConversation(
      currentUserId,
      currentUserRole,
      otherUserId,
      otherUserRole
    )
    setMessages(conversation)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (messages.length === 0) {
    return (
      <div className="messages-list-empty">
        <p>No messages yet. Send a message to start the conversation!</p>
      </div>
    )
  }

  return (
    <div className="messages-list">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId && message.sender_role === currentUserRole

        return (
          <div
            key={message.id}
            className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}
          >
            <div className="message-bubble">
              <div className="message-content">{message.content}</div>
              <div className="message-time">{formatTime(message.created_at)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MessagesList
