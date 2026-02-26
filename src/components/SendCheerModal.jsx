import { useState } from 'react'
import { localDB } from '../lib/supabase'
import notificationService from '../lib/notificationService'
import './SendCheerModal.css'

function SendCheerModal({ isOpen, onClose, kidOnline, selectedKid }) {
  const [message, setMessage] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🎉')
  const [isSending, setIsSending] = useState(false)

  const emojis = ['🎉', '🌟', '⭐', '💪', '🔥', '👏', '🏆', '💯', '✨', '🎊']

  const cheerMessages = [
    "You're doing great!",
    "Keep it up!",
    "I'm so proud of you!",
    "You got this!",
    "Amazing work!",
    "You're a superstar!",
    "Way to go!",
    "Awesome job!",
  ]

  const handleSend = () => {
    if (!message.trim() || !selectedKid) return

    setIsSending(true)

    let newMessage

    if (kidOnline) {
      // Send as real-time cheer notification to the selected kid
      const cheer = localDB.addCheer({
        sender_id: 'parent-1',
        recipient_id: selectedKid.id,
        message: message.trim(),
        emoji: selectedEmoji
      })

      // Trigger notification for cheer
      notificationService.notifyCheer(cheer)
    } else {
      // Send as regular message to the selected kid
      newMessage = localDB.addMessage({
        sender_id: 'parent-1',
        sender_role: 'parent',
        recipient_id: selectedKid.id,
        recipient_role: 'kid',
        content: `${selectedEmoji} ${message.trim()}`
      })

      // Trigger notification for message
      if (newMessage) {
        notificationService.notifyNewMessage(newMessage)
      }
    }

    setTimeout(() => {
      setIsSending(false)
      setMessage('')
      setSelectedEmoji('🎉')
      onClose(true) // Pass true to indicate success
    }, 300)
  }

  const handleQuickMessage = (msg) => {
    setMessage(msg)
  }

  if (!isOpen) return null

  return (
    <div className="send-cheer-overlay">
      <div className="send-cheer-backdrop" onClick={() => onClose(false)} />
      <div className="send-cheer-modal">
        <div className="send-cheer-header">
          <h2>
            {kidOnline ? '🎉 Send a Cheer!' : '💬 Send a Message'}
          </h2>
          {selectedKid && (
            <p className="send-cheer-recipient">
              To: <strong>{selectedKid.username}</strong>
            </p>
          )}
          <p className="send-cheer-subtitle">
            {kidOnline
              ? 'This will pause their game to show your encouragement!'
              : 'Kid is offline - sending as a message instead'}
          </p>
        </div>

        <div className="send-cheer-body">
          <div className="emoji-picker">
            <label>Choose an emoji:</label>
            <div className="emoji-grid">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="quick-messages">
            <label>Quick messages:</label>
            <div className="quick-message-grid">
              {cheerMessages.map((msg, index) => (
                <button
                  key={index}
                  className="quick-message-btn"
                  onClick={() => handleQuickMessage(msg)}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          <div className="message-input-section">
            <label>Your message:</label>
            <textarea
              className="cheer-message-input"
              placeholder="Type your encouraging message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              maxLength="150"
            />
            <div className="char-count">{message.length}/150</div>
          </div>
        </div>

        <div className="send-cheer-actions">
          <button
            className="btn btn-secondary"
            onClick={() => onClose(false)}
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending ? 'Sending...' : (kidOnline ? '🎉 Send Cheer' : '📨 Send Message')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SendCheerModal
