import { useState } from 'react'
import './MessageComposer.css'

function MessageComposer({ onSend, placeholder = "Type your message..." }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <textarea
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        rows="3"
        maxLength="500"
      />
      <div className="composer-footer">
        <span className="char-count">{message.length}/500</span>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!message.trim()}
        >
          Send Message 📤
        </button>
      </div>
    </form>
  )
}

export default MessageComposer
