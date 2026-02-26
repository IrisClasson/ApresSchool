import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SnowballGame from '../components/SnowballGame'
import FeedbackModal from '../components/FeedbackModal'
import CheerNotification from '../components/CheerNotification'
import { localDB } from '../lib/supabase'
import './SnowballGamePage.css'

function SnowballGamePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')
  const [challenge, setChallenge] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [isGamePaused, setIsGamePaused] = useState(false)

  useEffect(() => {
    const loadChallenge = async () => {
      if (challengeId) {
        console.log('🎮 SnowballGamePage loading challenge:', challengeId)
        const challenges = await localDB.getChallenges()
        console.log('📦 All challenges:', challenges.length)
        const found = challenges.find(c => c.id === challengeId)
        console.log('🎯 Found challenge:', found)
        setChallenge(found)
      }
    }
    loadChallenge()
  }, [challengeId])

  const handleComplete = (result) => {
    // Store game result and show feedback modal
    setGameResult(result)
    setShowFeedback(true)
  }

  const handleFeedbackSubmit = (feedback) => {
    if (challengeId && gameResult) {
      // Create a session entry with feedback
      localDB.addSession({
        challengeId,
        challengeType: challenge.subject || 'number-bonds',
        difficulty: challenge.difficulty,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration: Math.round(gameResult.duration || 0),
        scoreBreakdown: {
          correct: gameResult.score,
          wrong: 0,
          total: gameResult.score
        },
        feedback // Include feedback in session
      })

      // Update challenge as completed
      localDB.updateChallenge(challengeId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: {
          score: gameResult.score,
          collectedPairs: gameResult.collectedPairs,
          targetNumber: gameResult.targetNumber,
          completedGame: true
        }
      })

      // Add feedback to challenge
      localDB.addFeedbackToChallenge(challengeId, feedback)

      // Update kid stats
      updateKidStats(gameResult)
    }

    // Navigate back to kid view
    navigate('/kid')
  }

  const handleFeedbackSkip = () => {
    if (challengeId && gameResult) {
      // Create session without feedback
      localDB.addSession({
        challengeId,
        challengeType: challenge.subject || 'number-bonds',
        difficulty: challenge.difficulty,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration: Math.round(gameResult.duration || 0),
        scoreBreakdown: {
          correct: gameResult.score,
          wrong: 0,
          total: gameResult.score
        },
        feedback: null
      })

      // Update challenge as completed
      localDB.updateChallenge(challengeId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: {
          score: gameResult.score,
          collectedPairs: gameResult.collectedPairs,
          targetNumber: gameResult.targetNumber,
          completedGame: true
        }
      })

      // Update kid stats
      updateKidStats(gameResult)
    }

    // Navigate back to kid view
    navigate('/kid')
  }

  const updateKidStats = (result) => {
    const stats = localDB.getKidStats()
    const pointsEarned = challenge?.difficulty === 'easy' ? 10 : challenge?.difficulty === 'hard' ? 30 : 20

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
    if (result.score >= 100 && !newStats.badges.includes('speed-demon')) {
      newStats.badges.push('speed-demon')
    }

    localDB.updateKidStats(newStats)
  }

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit? Your progress will not be saved.')) {
      navigate('/kid')
    }
  }

  if (!challenge) {
    return (
      <div className="snowball-game-page">
        <div className="game-loading">
          <h2>Loading Challenge...</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/kid')}>
            Back to Missions
          </button>
        </div>
      </div>
    )
  }

  // Extract target number from challenge description or default to 10
  const targetNumber = challenge.description?.match(/\d+/)?.[0] || challenge.targetNumber || 10

  return (
    <div className="snowball-game-page">
      <div className="game-page-header">
        <div className="challenge-info">
          <h1>{challenge.title}</h1>
          <p className="challenge-description">{challenge.description}</p>
        </div>
        <button className="btn btn-danger" onClick={handleQuit}>
          Quit Game
        </button>
      </div>

      <SnowballGame
        targetNumber={parseInt(targetNumber)}
        onComplete={handleComplete}
        isPaused={isGamePaused}
      />

      {/* Cheer Notification */}
      <CheerNotification
        recipientId="kid-1"
        onPauseChange={setIsGamePaused}
      />

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

export default SnowballGamePage
