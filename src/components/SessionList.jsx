import { formatTimestamp, formatDuration, getDifficultyLabel } from '../lib/statsService'
import './SessionList.css'

function SessionList({ sessions, onSessionClick }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="session-list-empty">
        <div className="empty-icon">📊</div>
        <h3>No challenge attempts yet</h3>
        <p>Completed challenges will appear here with detailed statistics.</p>
      </div>
    )
  }

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
    <div className="session-list">
      <h3 className="session-list-title">Challenge Attempts</h3>
      <div className="session-list-grid">
        {sessions.map((session) => {
          const { date, time } = formatTimestamp(session.completed_at)
          const accuracy = session.scoreBreakdown?.total > 0
            ? Math.round((session.scoreBreakdown.correct / session.scoreBreakdown.total) * 100)
            : 0

          return (
            <div
              key={session.id}
              className="session-card"
              onClick={() => onSessionClick(session)}
            >
              <div className="session-header">
                <div className="session-type">
                  {formatChallengeType(session.challengeType)}
                </div>
                <div className="session-difficulty">
                  {getDifficultyLabel(session.difficulty)}
                </div>
              </div>

              <div className="session-stats">
                <div className="stat-item">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{accuracy}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duration:</span>
                  <span className="stat-value">{formatDuration(session.duration)}</span>
                </div>
              </div>

              <div className="session-breakdown">
                <span className="correct">✓ {session.scoreBreakdown?.correct || 0}</span>
                <span className="wrong">✗ {session.scoreBreakdown?.wrong || 0}</span>
                <span className="total">Total: {session.scoreBreakdown?.total || 0}</span>
              </div>

              {/* Feedback Preview */}
              {session.feedback && session.feedback.comment && (
                <div className="session-feedback-preview">
                  <span className="feedback-icon">💬</span>
                  <span className="feedback-text">"{session.feedback.comment}"</span>
                </div>
              )}

              <div className="session-footer">
                <div className="session-date">{date}</div>
                <div className="session-time">{time}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SessionList
