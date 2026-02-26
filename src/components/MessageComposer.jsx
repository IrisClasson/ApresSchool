import { useState } from 'react'
import DrawingModal from './DrawingModal'
import './MessageComposer.css'

function MessageComposer({ onSend, onSendDrawing, placeholder = "Type your message..." }) {
  const [message, setMessage] = useState('')
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleSendDrawing = (imageData) => {
    if (onSendDrawing) {
      onSendDrawing(imageData)
    }
  }

  return (
    <>
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
          <div className="composer-actions">
            <button
              type="button"
              className="btn btn-secondary btn-drawing"
              onClick={() => setIsDrawingModalOpen(true)}
            >
              🎨 Draw
            </button>
            <span className="char-count">{message.length}/500</span>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!message.trim()}
          >
            Send Message 📤
          </button>
        </div>
      </form>

      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSend={handleSendDrawing}
      />
    </>
  )
}

export default MessageComposer
