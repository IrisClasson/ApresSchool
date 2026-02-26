import './StatsSummary.css'
import { localDB } from '../lib/supabase'

function StatsSummary({ summaries }) {
  const {
    totalAttempts,
    averageScore,
    averageDifficulty,
    mostPlayedChallenge,
    totalTimeSpent
  } = summaries

  // Calculate feedback statistics
  const sessions = localDB.getSessions()
  const sessionsWithFeedback = sessions.filter(s => s.feedback)

  const feedbackStats = {
    totalFeedback: sessionsWithFeedback.length,
    likePercentage: sessionsWithFeedback.length > 0
      ? Math.round((sessionsWithFeedback.filter(s => s.feedback?.sentiment === 'like').length / sessionsWithFeedback.length) * 100)
      : 0,
    averageDifficultyRating: sessionsWithFeedback.length > 0
      ? (sessionsWithFeedback.reduce((sum, s) => sum + (s.feedback?.difficulty || 3), 0) / sessionsWithFeedback.length).toFixed(1)
      : 0
  }

  const getDifficultyLabel = (avgDifficulty) => {
    if (avgDifficulty < 1.5) return 'Easy'
    if (avgDifficulty < 2.5) return 'Medium'
    return 'Hard'
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="stats-summary">
      <div className="summary-card">
        <div className="summary-icon">📊</div>
        <div className="summary-value">{totalAttempts}</div>
        <div className="summary-label">Total Attempts</div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">🎯</div>
        <div className="summary-value">{averageScore}%</div>
        <div className="summary-label">Average Score</div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">⚡</div>
        <div className="summary-value">{getDifficultyLabel(averageDifficulty)}</div>
        <div className="summary-label">Avg Difficulty</div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">🏆</div>
        <div className="summary-value">{mostPlayedChallenge}</div>
        <div className="summary-label">Most Played</div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">⏱️</div>
        <div className="summary-value">{formatTime(totalTimeSpent)}</div>
        <div className="summary-label">Time Spent</div>
      </div>

      {feedbackStats.totalFeedback > 0 && (
        <>
          <div className="summary-card feedback-card">
            <div className="summary-icon">😀</div>
            <div className="summary-value">{feedbackStats.likePercentage}%</div>
            <div className="summary-label">Positive Feedback</div>
          </div>

          <div className="summary-card feedback-card">
            <div className="summary-icon">📝</div>
            <div className="summary-value">{feedbackStats.totalFeedback}</div>
            <div className="summary-label">Feedback Responses</div>
          </div>

          <div className="summary-card feedback-card">
            <div className="summary-icon">⭐</div>
            <div className="summary-value">{feedbackStats.averageDifficultyRating}/5</div>
            <div className="summary-label">Avg Difficulty</div>
          </div>
        </>
      )}
    </div>
  )
}

export default StatsSummary
