import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { localDB } from '../lib/supabase'
import './ChallengeCard.css'

function ChallengeCard({ challenge, onAccept, onComplete }) {
  const navigate = useNavigate()
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [result, setResult] = useState('')

  const handleComplete = () => {
    // Complete the challenge directly without feedback
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
    setShowCompleteForm(false)
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

  // Check if this is an even/odd challenge (game-enabled)
  const isEvenOddChallenge = challenge.challengeType === 'even-odd' ||
                             challenge.title?.toLowerCase().includes('collect even') ||
                             challenge.title?.toLowerCase().includes('collect odd')

  // Check if this is a count in twos challenge (game-enabled)
  const isCountInTwosChallenge = challenge.challengeType === 'count-in-twos' ||
                                 challenge.title?.toLowerCase().includes('count in twos')

  const handlePlayGame = () => {
    if (isNumberBondsChallenge) {
      navigate(`/play-bonds?challenge=${challenge.id}`)
    } else if (isEvenOddChallenge) {
      navigate(`/play-evenodd?challenge=${challenge.id}`)
    } else if (isCountInTwosChallenge) {
      navigate(`/play-countintwos?challenge=${challenge.id}`)
    }
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
          {isEvenOddChallenge && (
            <button
              className="btn btn-game btn-full"
              onClick={handlePlayGame}
              style={{ marginBottom: '0.5rem' }}
            >
              🎮 Play Even/Odd Game
            </button>
          )}
          {isCountInTwosChallenge && (
            <button
              className="btn btn-game btn-full"
              onClick={handlePlayGame}
              style={{ marginBottom: '0.5rem' }}
            >
              🎮 Play Count in Twos Game
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
    </div>
  )
}

export default ChallengeCard
