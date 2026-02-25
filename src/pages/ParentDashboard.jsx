import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import CreateChallenge from '../components/CreateChallenge'
import ChallengeList from '../components/ChallengeList'
import './ParentDashboard.css'

function ParentDashboard() {
  const [challenges, setChallenges] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = () => {
    const data = localDB.getChallenges()
    setChallenges(data)
  }

  const handleCreateChallenge = (challenge) => {
    const newChallenge = localDB.addChallenge(challenge)
    setChallenges([...challenges, newChallenge])
    setShowCreateForm(false)
  }

  const handleDeleteChallenge = (id) => {
    localDB.deleteChallenge(id)
    setChallenges(challenges.filter(c => c.id !== id))
  }

  const stats = {
    total: challenges.length,
    pending: challenges.filter(c => c.status === 'pending').length,
    accepted: challenges.filter(c => c.status === 'accepted').length,
    completed: challenges.filter(c => c.status === 'completed').length,
  }

  return (
    <div className="parent-dashboard">
      <div className="dashboard-header">
        <h2>Parent Dashboard</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Challenge'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Challenges</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card accepted">
          <div className="stat-value">{stats.accepted}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {showCreateForm && (
        <CreateChallenge
          onSubmit={handleCreateChallenge}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <ChallengeList
        challenges={challenges}
        onDelete={handleDeleteChallenge}
        isParent={true}
      />
    </div>
  )
}

export default ParentDashboard
