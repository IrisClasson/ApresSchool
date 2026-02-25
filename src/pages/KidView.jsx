import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import ChallengeCard from '../components/ChallengeCard'
import KidStats from '../components/KidStats'
import { requestNotificationPermission, notifyChallengeAccepted, notifyChallengeCompleted } from '../lib/notifications'
import './KidView.css'

function KidView() {
  const [challenges, setChallenges] = useState([])
  const [stats, setStats] = useState({ points: 0, badges: [], streak: 0 })

  useEffect(() => {
    loadData()
    // Request notification permission on load
    requestNotificationPermission()
  }, [])

  const loadData = () => {
    const challengeData = localDB.getChallenges()
    setChallenges(challengeData)
    const statsData = localDB.getKidStats()
    setStats(statsData)
  }

  const handleAcceptChallenge = (id) => {
    const challenge = challenges.find(c => c.id === id)
    const updated = localDB.updateChallenge(id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    if (updated) {
      setChallenges(challenges.map(c => c.id === id ? updated : c))
      // Send notification
      notifyChallengeAccepted(challenge.title)
    }
  }

  const handleCompleteChallenge = (id, result) => {
    const challenge = challenges.find(c => c.id === id)
    const pointsEarned = calculatePoints(challenge)

    const updated = localDB.updateChallenge(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
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
      setChallenges(challenges.map(c => c.id === id ? updated : c))

      // Send completion notification
      notifyChallengeCompleted(challenge.title, pointsEarned)
    }
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
    </div>
  )
}

export default KidView
