import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { localDB } from '../lib/supabase'
import NumberBondsGame from '../components/NumberBondsGame'
import FeedbackModal from '../components/FeedbackModal'
import './NumberBondsGamePage.css'

function NumberBondsGamePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')

  const [challenge, setChallenge] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [gameResult, setGameResult] = useState(null)

  useEffect(() => {
    if (challengeId) {
      const challenges = localDB.getChallenges()
      const found = challenges.find(c => c.id === challengeId)
      if (found) {
        setChallenge(found)
      } else {
        // Challenge not found, redirect to kid view
        navigate('/kid')
      }
    } else {
      // No challenge ID, redirect
      navigate('/kid')
    }
  }, [challengeId, navigate])

  const handleGameComplete = (result) => {
    setGameResult(result)
    setShowFeedback(true)
  }

  const handleFeedbackSubmit = (feedback) => {
    if (!challenge || !gameResult) return

    // Calculate points based on difficulty
    const pointsMap = { easy: 10, medium: 20, hard: 30 }
    const pointsEarned = pointsMap[challenge.difficulty] || 20

    // Update challenge status
    const completedAt = new Date().toISOString()
    localDB.updateChallenge(challengeId, {
      status: 'completed',
      completed_at: completedAt,
      result: `Score: ${gameResult.score}/${gameResult.total} (${gameResult.percentage}%)`
    })

    // Add feedback to challenge
    localDB.addFeedbackToChallenge(challengeId, feedback)

    // Save session data with game results
    localDB.addSession({
      challengeId: challengeId,
      challengeType: challenge.challengeType || challenge.subject || 'number-bonds',
      difficulty: challenge.difficulty || 'medium',
      started_at: gameResult.started_at || challenge.accepted_at,
      completed_at: gameResult.completed_at || completedAt,
      duration: gameResult.duration || 0,
      scoreBreakdown: gameResult.scoreBreakdown || {
        correct: gameResult.score,
        wrong: gameResult.total - gameResult.score,
        total: gameResult.total
      },
      finalScore: gameResult.score,
      feedback
    })

    // Update kid stats
    const stats = localDB.getKidStats()
    const newStats = {
      points: stats.points + pointsEarned,
      badges: [...stats.badges],
      streak: stats.streak + 1
    }

    // Award badges
    if (newStats.points >= 100 && !newStats.badges.includes('century')) {
      newStats.badges.push('century')
    }
    if (newStats.streak >= 3 && !newStats.badges.includes('streak-3')) {
      newStats.badges.push('streak-3')
    }

    localDB.updateKidStats(newStats)

    // Navigate back to kid view
    navigate('/kid')
  }

  const handleFeedbackSkip = () => {
    if (!challenge || !gameResult) return

    // Calculate points based on difficulty
    const pointsMap = { easy: 10, medium: 20, hard: 30 }
    const pointsEarned = pointsMap[challenge.difficulty] || 20

    // Update challenge status
    const completedAt = new Date().toISOString()
    localDB.updateChallenge(challengeId, {
      status: 'completed',
      completed_at: completedAt,
      result: `Score: ${gameResult.score}/${gameResult.total} (${gameResult.percentage}%)`
    })

    // Save session data without feedback
    localDB.addSession({
      challengeId: challengeId,
      challengeType: challenge.challengeType || challenge.subject || 'number-bonds',
      difficulty: challenge.difficulty || 'medium',
      started_at: gameResult.started_at || challenge.accepted_at,
      completed_at: gameResult.completed_at || completedAt,
      duration: gameResult.duration || 0,
      scoreBreakdown: gameResult.scoreBreakdown || {
        correct: gameResult.score,
        wrong: gameResult.total - gameResult.score,
        total: gameResult.total
      },
      finalScore: gameResult.score,
      feedback: null
    })

    // Update kid stats
    const stats = localDB.getKidStats()
    const newStats = {
      points: stats.points + pointsEarned,
      badges: [...stats.badges],
      streak: stats.streak + 1
    }

    // Award badges
    if (newStats.points >= 100 && !newStats.badges.includes('century')) {
      newStats.badges.push('century')
    }
    if (newStats.streak >= 3 && !newStats.badges.includes('streak-3')) {
      newStats.badges.push('streak-3')
    }

    localDB.updateKidStats(newStats)

    // Navigate back to kid view
    navigate('/kid')
  }

  if (!challenge) {
    return (
      <div className="number-bonds-game-page loading">
        <p>Loading challenge...</p>
      </div>
    )
  }

  const targetNumber = challenge.numberBondsConfig?.targetNumber || 10
  const problemCount = challenge.numberBondsConfig?.problemCount || 20

  return (
    <div className="number-bonds-game-page">
      <div className="game-page-header">
        <h2>{challenge.title}</h2>
        <p>{challenge.description}</p>
      </div>

      {!showFeedback ? (
        <NumberBondsGame
          targetNumber={targetNumber}
          totalProblems={problemCount}
          onComplete={handleGameComplete}
        />
      ) : (
        <FeedbackModal
          challengeTitle={challenge.title}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
        />
      )}
    </div>
  )
}

export default NumberBondsGamePage
