import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { localDB } from '../lib/supabase'
import authService from '../lib/authService'
import ChallengeCard from '../components/ChallengeCard'
import KidStats from '../components/KidStats'
import CheerNotification from '../components/CheerNotification'
import { requestNotificationPermission, notifyChallengeAccepted, notifyChallengeCompleted } from '../lib/notifications'
import './KidView.css'

function KidView() {
  const navigate = useNavigate()
  const [challenges, setChallenges] = useState([])
  const [stats, setStats] = useState({ points: 0, badges: [], streak: 0 })
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadData()
    // Request notification permission on load
    requestNotificationPermission()
  }, [])

  const loadData = async () => {
    // Get current user (kid)
    const user = await authService.getCurrentUser()
    setCurrentUser(user)

    if (user) {
      // Load challenges for this kid
      const challengeData = await localDB.getChallenges(user.id)
      setChallenges(challengeData)
    }

    const statsData = localDB.getKidStats()
    setStats(statsData)
  }

  const handleAcceptChallenge = async (id) => {
    const challenge = challenges.find(c => c.id === id)
    const updated = await localDB.updateChallenge(id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    if (updated) {
      await loadData()
      // Send notification
      notifyChallengeAccepted(challenge.title)
    }
  }

  const handleCompleteChallenge = async (id, result, gameData = null) => {
    const challenge = challenges.find(c => c.id === id)
    const pointsEarned = calculatePoints(challenge)

    const completedAt = new Date().toISOString()

    const updated = await localDB.updateChallenge(id, {
      status: 'completed',
      completed_at: completedAt,
      result
    })

    if (updated) {
      // Update stats
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
      setStats(newStats)
      await loadData()

      // Save session data for stats dashboard
      const sessionData = {
        challengeId: id,
        challengeType: challenge.challengeType || challenge.subject || 'general',
        difficulty: challenge.difficulty || 'medium',
        started_at: challenge.accepted_at || completedAt,
        completed_at: completedAt,
        duration: gameData?.duration || calculateDuration(challenge.accepted_at, completedAt),
        scoreBreakdown: gameData?.scoreBreakdown || {
          correct: 0,
          wrong: 0,
          total: 0
        },
        finalScore: gameData?.score || pointsEarned,
        feedback: {
          emoji: 'neutral',
          difficultyRating: 3,
          comment: ''
        }
      }

      localDB.addSession(sessionData)

      // Send completion notification
      notifyChallengeCompleted(challenge.title, pointsEarned)
    }
  }

  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return 0
    const start = new Date(startTime)
    const end = new Date(endTime)
    return Math.round((end - start) / 1000) // Duration in seconds
  }

  const calculatePoints = (challenge) => {
    const basePoints = {
      easy: 10,
      medium: 20,
      hard: 30
    }
    return basePoints[challenge.difficulty] || 10
  }

  const activeChallenges = challenges.filter(c =>
    c.status === 'pending' || c.status === 'accepted'
  )

  return (
    <div className="kid-view">
      <div className="kid-header">
        <h2>Your Missions</h2>
        <KidStats stats={stats} />
      </div>

      <div className="creative-break-promo">
        <button
          className="btn btn-game"
          onClick={() => navigate('/creative-break')}
          style={{ width: '100%', fontSize: '1.2rem', padding: '1.25rem' }}
        >
          🎨 Take a Creative Break!
        </button>
      </div>

      {activeChallenges.length === 0 ? (
        <div className="card empty-state">
          <h3>No active missions!</h3>
          <p>Check back later for new challenges from your parent.</p>
        </div>
      ) : (
        <div className="challenges-grid">
          {activeChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onAccept={handleAcceptChallenge}
              onComplete={handleCompleteChallenge}
            />
          ))}
        </div>
      )}

      <div className="completed-section">
        <h3>Completed Missions</h3>
        <div className="completed-list">
          {challenges
            .filter(c => c.status === 'completed')
            .map(challenge => (
              <div key={challenge.id} className="completed-item">
                <span>{challenge.title}</span>
                <span className="badge badge-completed">Completed</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Cheer Notification */}
      <CheerNotification recipientId="kid-1" />
    </div>
  )
}

export default KidView
