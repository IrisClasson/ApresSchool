import { useState } from 'react'
import { localDB } from '../lib/supabase'
import './MessageInput.css'

function MessageInput({ currentUserId, currentUserRole, recipientId, recipientRole, onMessageSent }) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSending) return

    setIsSending(true)

    const newMessage = {
      sender_id: currentUserId,
      sender_role: currentUserRole,
      recipient_id: recipientId,
      recipient_role: recipientRole,
      content: trimmedMessage
    }

    localDB.addMessage(newMessage)
    setMessage('')
    setIsSending(false)

    // Notify parent component that a message was sent
    if (onMessageSent) {
      onMessageSent(newMessage)
    }
  }

  const handleKeyDown = (e) => {
    // Submit on Enter (but not Shift+Enter for multi-line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="1"
          disabled={isSending}
        />
        <button
          type="submit"
          className="btn btn-primary message-send-btn"
          disabled={!message.trim() || isSending}
        >
          {isSending ? '...' : '📨 Send'}
        </button>
      </div>
      <div className="message-input-hint">
        Press Enter to send • Shift+Enter for new line
      </div>
    </form>
  )
}

export default MessageInput
