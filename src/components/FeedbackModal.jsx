import { useState } from 'react'
import './FeedbackModal.css'

/**
 * FeedbackModal Component
 * Post-challenge feedback collection for kids
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback with feedback data: { sentiment, difficulty, comment }
 * @param {Function} props.onSkip - Callback when feedback is skipped
 * @param {string} props.challengeTitle - Name of completed challenge
 */
function FeedbackModal({ onSubmit, onSkip, challengeTitle }) {
  const [sentiment, setSentiment] = useState(null) // 'like', 'neutral', 'dislike'
  const [difficulty, setDifficulty] = useState(3) // 1-5 scale
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sentiments = [
    { value: 'dislike', emoji: '😞', label: 'Didn\'t like it' },
    { value: 'neutral', emoji: '😐', label: 'It was okay' },
    { value: 'like', emoji: '😀', label: 'Loved it!' }
  ]

  const handleSubmit = () => {
    setIsSubmitting(true)

    const feedback = {
      sentiment,
      difficulty,
      comment: comment.trim(),
      timestamp: new Date().toISOString()
    }

    // Simulate a small delay for better UX
    setTimeout(() => {
      onSubmit(feedback)
    }, 300)
  }

  const handleSkip = () => {
    onSkip()
  }

  const canSubmit = sentiment !== null

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <h2>🎉 Great job!</h2>
          <p className="feedback-subtitle">Tell us about "{challengeTitle}"</p>
        </div>

        <div className="feedback-body">
          {/* Sentiment Selection */}
          <div className="feedback-section">
            <label className="feedback-label">Did you like it?</label>
            <div className="sentiment-options">
              {sentiments.map((s) => (
                <button
                  key={s.value}
                  className={`sentiment-button ${sentiment === s.value ? 'selected' : ''}`}
                  onClick={() => setSentiment(s.value)}
                  type="button"
                  aria-label={s.label}
                  disabled={isSubmitting}
                >
                  <span className="sentiment-emoji">{s.emoji}</span>
                  <span className="sentiment-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Slider */}
          <div className="feedback-section">
            <label className="feedback-label" htmlFor="difficulty-slider">
              How hard was it?
              <span className="difficulty-value">{difficulty} / 5</span>
            </label>
            <div className="difficulty-slider-container">
              <span className="slider-label">Easy</span>
              <input
                id="difficulty-slider"
                type="range"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="difficulty-slider"
                disabled={isSubmitting}
              />
              <span className="slider-label">Hard</span>
            </div>
            <div className="difficulty-indicator">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`difficulty-dot ${difficulty >= level ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Optional Comment */}
          <div className="feedback-section">
            <label className="feedback-label" htmlFor="comment-input">
              Anything to say? <span className="optional">(optional)</span>
            </label>
            <textarea
              id="comment-input"
              className="feedback-textarea"
              placeholder="What did you think? Any suggestions?"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 140))}
              maxLength={140}
              rows={3}
              disabled={isSubmitting}
            />
            <div className="char-counter">
              {comment.length} / 140
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="feedback-actions">
          <button
            className="btn btn-secondary"
            onClick={handleSkip}
            disabled={isSubmitting}
            type="button"
          >
            Skip
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            type="button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
