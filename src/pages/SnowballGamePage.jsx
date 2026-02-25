import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SnowballGame from '../components/SnowballGame'
import { localDB } from '../lib/supabase'
import './SnowballGamePage.css'

function SnowballGamePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')
  const [challenge, setChallenge] = useState(null)

  useEffect(() => {
    if (challengeId) {
      const challenges = localDB.getChallenges()
      const found = challenges.find(c => c.id === challengeId)
      setChallenge(found)
    }
  }, [challengeId])

  const handleComplete = (gameResult) => {
    if (challengeId) {
      // Update challenge as completed
      const updated = localDB.updateChallenge(challengeId, {
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
      if (gameResult.score >= 100 && !newStats.badges.includes('speed-demon')) {
        newStats.badges.push('speed-demon')
      }

      localDB.updateKidStats(newStats)
    }

    // Navigate back to kid view after a short delay
    setTimeout(() => {
      navigate('/kid')
    }, 3000)
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
      />
    </div>
  )
}

export default SnowballGamePage
