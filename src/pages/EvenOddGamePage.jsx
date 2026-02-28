import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from '../contexts/LanguageContext'
import { localDB } from '../lib/supabase'
import EvenOddGame from '../components/EvenOddGame'
import './EvenOddGamePage.css'

function EvenOddGamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')

  const [challenge, setChallenge] = useState(null)

  useEffect(() => {
    const loadChallenge = async () => {
      if (challengeId) {
        console.log('🎮 EvenOddGamePage loading challenge:', challengeId)
        const challenges = await localDB.getChallenges()
        console.log('📦 All challenges:', challenges.length)
        const found = challenges.find(c => c.id === challengeId)
        console.log('🎯 Found challenge:', found)
        if (found) {
          setChallenge(found)
        } else {
          console.error('❌ Challenge not found, redirecting to /kid')
          // Challenge not found, redirect to kid view
          navigate('/kid')
        }
      } else {
        console.error('❌ No challenge ID, redirecting to /kid')
        // No challenge ID, redirect
        navigate('/kid')
      }
    }
    loadChallenge()
  }, [challengeId, navigate])

  const handleGameComplete = (result) => {
    if (!challenge) return

    // Calculate points based on difficulty
    const pointsMap = { easy: 10, medium: 20, hard: 30 }
    const pointsEarned = pointsMap[challenge.difficulty] || 20

    // Update challenge status
    const completedAt = new Date().toISOString()
    localDB.updateChallenge(challengeId, {
      status: 'completed',
      completed_at: completedAt,
      result: `Score: ${result.score}, Sum: ${result.runningSum}`
    })

    // Save session data with game results
    localDB.addSession({
      challengeId: challengeId,
      challengeType: challenge.challengeType || 'even-odd',
      difficulty: challenge.difficulty || 'medium',
      started_at: result.started_at || challenge.accepted_at,
      completed_at: result.completed_at || completedAt,
      duration: result.duration || 0,
      scoreBreakdown: result.scoreBreakdown || {
        score: result.score,
        sum: result.runningSum,
        total: result.score
      },
      finalScore: result.score,
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

    // Navigate back to kid view after a short delay to show game over screen
    setTimeout(() => {
      navigate('/kid')
    }, 2000)
  }

  if (!challenge) {
    return (
      <div className="evenodd-game-page loading">
        <p>{t('evenOddGamePage.loading')}</p>
      </div>
    )
  }

  const targetType = challenge.evenOddConfig?.targetType || 'even'
  const numberRange = challenge.evenOddConfig?.numberRange || 20
  const gameDuration = challenge.evenOddConfig?.gameDuration || 60

  return (
    <div className="evenodd-game-page">
      <div className="game-page-header">
        <h2>{challenge.title}</h2>
        <p>{challenge.description}</p>
      </div>

      <EvenOddGame
        targetType={targetType}
        numberRange={numberRange}
        gameDuration={gameDuration}
        difficulty={challenge.difficulty}
        onComplete={handleGameComplete}
      />
    </div>
  )
}

export default EvenOddGamePage
