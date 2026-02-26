import { formatTimestamp, formatDuration, getDifficultyLabel, getFeedbackEmoji } from '../lib/statsService'
import './SessionDetail.css'

function SessionDetail({ session, onClose }) {
  if (!session) return null

  const { date, time } = formatTimestamp(session.completed_at)
  const startTime = formatTimestamp(session.started_at)
  const accuracy = session.scoreBreakdown?.total > 0
    ? Math.round((session.scoreBreakdown.correct / session.scoreBreakdown.total) * 100)
    : 0

  const formatChallengeType = (type) => {
    const formatted = {
      'number-bonds': 'Number Bonds',
      'math': 'Math',
      'reading': 'Reading',
      'writing': 'Writing',
      'science': 'Science',
      'general': 'General'
    }
    return formatted[type] || type
  }

  return (
    <div className="session-detail-modal" onClick={onClose}>
      <div className="session-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>Challenge Attempt Details</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="detail-body">
          {/* Challenge Info */}
          <div className="detail-section">
            <h3>Challenge Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{formatChallengeType(session.challengeType)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Difficulty:</span>
                <span className="info-value">{getDifficultyLabel(session.difficulty)}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="detail-section">
            <h3>Timeline</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Started:</span>
                <span className="info-value">{startTime.date} at {startTime.time}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Completed:</span>
                <span className="info-value">{date} at {time}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{formatDuration(session.duration)}</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="detail-section">
            <h3>Performance</h3>
            <div className="score-visual">
              <div className="score-circle">
                <div className="score-percentage">{accuracy}%</div>
                <div className="score-label">Accuracy</div>
              </div>
              <div className="score-details">
                <div className="score-detail-item correct">
                  <span className="detail-icon">✓</span>
                  <span className="detail-label">Correct:</span>
                  <span className="detail-value">{session.scoreBreakdown?.correct || 0}</span>
                </div>
                <div className="score-detail-item wrong">
                  <span className="detail-icon">✗</span>
                  <span className="detail-label">Wrong:</span>
                  <span className="detail-value">{session.scoreBreakdown?.wrong || 0}</span>
                </div>
                <div className="score-detail-item total">
                  <span className="detail-icon">📝</span>
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">{session.scoreBreakdown?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {session.feedback && (
            <div className="detail-section">
              <h3>Kid's Feedback</h3>
              <div className="feedback-display">
                <div className="feedback-emoji">
                  {getFeedbackEmoji(session.feedback.sentiment)}
                </div>
                <div className="feedback-info">
                  <div className="feedback-item">
                    <span className="feedback-label">How they felt:</span>
                    <span className="feedback-value">
                      {session.feedback.sentiment === 'like' ? '😀 Loved it!' :
                       session.feedback.sentiment === 'dislike' ? '😞 Didn\'t like it' :
                       '😐 It was okay'}
                    </span>
                  </div>
                  <div className="feedback-item">
                    <span className="feedback-label">Difficulty rating:</span>
                    <span className="feedback-value">{session.feedback.difficulty || 3}/5</span>
                  </div>
                  {session.feedback.comment && (
                    <div className="feedback-comment">
                      <span className="feedback-label">💬 Their comment:</span>
                      <p>"{session.feedback.comment}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionDetail
