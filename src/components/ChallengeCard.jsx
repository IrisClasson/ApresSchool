import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FeedbackModal from './FeedbackModal'
import { localDB } from '../lib/supabase'
import './ChallengeCard.css'

function ChallengeCard({ challenge, onAccept, onComplete }) {
  const navigate = useNavigate()
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [result, setResult] = useState('')

  const handleComplete = () => {
    // Show feedback modal instead of completing immediately
    setShowCompleteForm(false)
    setShowFeedback(true)
  }

  const handleFeedbackSubmit = (feedback) => {
    // Add feedback to challenge
    localDB.addFeedbackToChallenge(challenge.id, feedback)

    // Complete the challenge with session data including feedback
    const sessionData = {
      duration: 0,
      scoreBreakdown: { correct: 0, wrong: 0, total: 0 },
      score: 0
    }

    // Create session with feedback
    localDB.addSession({
      challengeId: challenge.id,
      challengeType: challenge.subject || 'general',
      difficulty: challenge.difficulty,
      started_at: challenge.accepted_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration: 0,
      scoreBreakdown: { correct: 0, wrong: 0, total: 0 },
      feedback
    })

    onComplete(challenge.id, result, sessionData)
    setShowFeedback(false)
    setResult('')
  }

  const handleFeedbackSkip = () => {
    // Complete without feedback
    const sessionData = {
      duration: 0,
      scoreBreakdown: { correct: 0, wrong: 0, total: 0 },
      score: 0
    }

    // Create session without feedback
    localDB.addSession({
      challengeId: challenge.id,
      challengeType: challenge.subject || 'general',
      difficulty: challenge.difficulty,
      started_at: challenge.accepted_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration: 0,
      scoreBreakdown: { correct: 0, wrong: 0, total: 0 },
      feedback: null
    })

    onComplete(challenge.id, result, sessionData)
    setShowFeedback(false)
    setResult('')
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#27AE60',
      medium: '#F39C12',
      hard: '#E74C3C'
    }
    return colors[difficulty] || '#999'
  }

  // Check if this is a number bonds challenge (game-enabled)
  const isNumberBondsChallenge = challenge.challengeType === 'number-bonds' ||
                                 challenge.title?.toLowerCase().includes('number bonds') ||
                                 challenge.subject === 'number-bonds'

  const handlePlayGame = () => {
    navigate(`/play-bonds?challenge=${challenge.id}`)
  }

  return (
    <div className="challenge-card">
      <div className="challenge-card-header">
        <span className="subject-badge" style={{ background: getDifficultyColor(challenge.difficulty) }}>
          {challenge.subject}
        </span>
        <span className="points-badge">+{challenge.difficulty === 'easy' ? 10 : challenge.difficulty === 'hard' ? 30 : 20} pts</span>
      </div>

      <h3>{challenge.title}</h3>
      <p className="challenge-desc">{challenge.description}</p>

      <div className="challenge-info">
        <div className="info-item">
          <span className="icon">⏱️</span>
          <span>{challenge.timeEstimate} min</span>
        </div>
        <div className="info-item">
          <span className="icon">📊</span>
          <span>{challenge.difficulty}</span>
        </div>
        <div className="info-item">
          <span className="icon">🔔</span>
          <span>{challenge.nagLevel}</span>
        </div>
      </div>

      {challenge.status === 'pending' && (
        <button
          className="btn btn-primary btn-full"
          onClick={() => onAccept(challenge.id)}
        >
          Accept Mission
        </button>
      )}

      {challenge.status === 'accepted' && !showCompleteForm && (
        <>
          {isNumberBondsChallenge && (
            <button
              className="btn btn-game btn-full"
              onClick={handlePlayGame}
              style={{ marginBottom: '0.5rem' }}
            >
              🎮 Play Number Bonds Game
            </button>
          )}
          <button
            className="btn btn-success btn-full"
            onClick={() => setShowCompleteForm(true)}
          >
            Mark as Complete
          </button>
        </>
      )}

      {showCompleteForm && (
        <div className="complete-form">
          <textarea
            placeholder="Add any notes about your work (optional)..."
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows="3"
          />
          <div className="button-group">
            <button
              className="btn"
              onClick={() => setShowCompleteForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleComplete}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          challengeTitle={challenge.title}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
        />
      )}
    </div>
  )
}

export default ChallengeCard
