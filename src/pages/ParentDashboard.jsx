import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import authService from '../lib/authService'
import notificationService from '../lib/notificationService'
import CreateChallenge from '../components/CreateChallenge'
import NumberBondsChallenge from '../components/NumberBondsChallenge'
import ChallengeList from '../components/ChallengeList'
import SendCheerModal from '../components/SendCheerModal'
import './ParentDashboard.css'

function ParentDashboard() {
  const [challenges, setChallenges] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showNumberBondsForm, setShowNumberBondsForm] = useState(false)
  const [showChallengeSelection, setShowChallengeSelection] = useState(false)
  const [showCheerModal, setShowCheerModal] = useState(false)
  const [kidOnline, setKidOnline] = useState(false)
  const [parentCode, setParentCode] = useState('')
  const [kids, setKids] = useState([])
  const [selectedKid, setSelectedKid] = useState(null)
  const [showManageKids, setShowManageKids] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadChallenges()
    checkKidOnlineStatus()
    loadParentInfo()
  }, [])

  // Re-check online status when selected kid changes
  useEffect(() => {
    checkKidOnlineStatus()
    // Check kid online status every 5 seconds
    const interval = setInterval(checkKidOnlineStatus, 5000)
    return () => clearInterval(interval)
  }, [selectedKid])

  const loadParentInfo = async () => {
    // Get current user
    const user = await authService.getCurrentUser()
    setCurrentUser(user)

    // Get parent code
    const codeResult = await authService.getMyParentCode()
    if (codeResult.success) {
      setParentCode(codeResult.parentCode)
    }

    // Get linked kids
    const kidsResult = await authService.getMyKids()
    if (kidsResult.success) {
      setKids(kidsResult.kids)
      // Auto-select kid if only one exists
      if (kidsResult.kids.length === 1) {
        setSelectedKid(kidsResult.kids[0])
      }
    }
  }

  const checkKidOnlineStatus = () => {
    // Check presence status from localStorage for the selected kid
    if (!selectedKid) {
      setKidOnline(false)
      return
    }

    const presenceData = localStorage.getItem('presence')
    if (presenceData) {
      const presence = JSON.parse(presenceData)
      const kidPresence = presence.find(p => p.user_id === selectedKid.id)
      setKidOnline(kidPresence && kidPresence.status === 'online')
    }
  }

  const loadChallenges = async () => {
    const data = await localDB.getChallenges()
    setChallenges(data)
  }

  // Filter challenges for the selected kid
  const filteredChallenges = selectedKid
    ? challenges.filter(c => c.kid_id === selectedKid.id)
    : []

  const handleCreateChallenge = async (challenge) => {
    if (!currentUser || !selectedKid) return

    // Add the parent and kid IDs to the challenge
    const challengeWithUserIds = {
      ...challenge,
      parent_id: currentUser.id,
      kid_id: selectedKid.id
    }
    const newChallenge = await localDB.addChallenge(challengeWithUserIds)
    if (newChallenge) {
      await loadChallenges()
      setShowCreateForm(false)
      setShowNumberBondsForm(false)

      // Trigger notification for the new challenge
      notificationService.notifyNewChallenge(newChallenge)
    }
  }

  const toggleChallengeSelection = () => {
    setShowChallengeSelection(!showChallengeSelection)
    setShowCreateForm(false)
    setShowNumberBondsForm(false)
    setShowCheerModal(false)
  }

  const handleSelectChallengeType = (type) => {
    setShowChallengeSelection(false)
    if (type === 'custom') {
      setShowCreateForm(true)
    } else if (type === 'number-bonds') {
      setShowNumberBondsForm(true)
    }
  }

  const handleCheerModalClose = (success) => {
    setShowCheerModal(false)
    if (success) {
      // Show a brief success message
      console.log('Cheer sent successfully!')
    }
  }

  const handleDeleteChallenge = (id) => {
    localDB.deleteChallenge(id)
    setChallenges(challenges.filter(c => c.id !== id))
  }

  // Calculate stats for the selected kid's challenges
  const stats = {
    total: filteredChallenges.length,
    pending: filteredChallenges.filter(c => c.status === 'pending').length,
    accepted: filteredChallenges.filter(c => c.status === 'accepted').length,
    completed: filteredChallenges.filter(c => c.status === 'completed').length,
  }

  return (
    <div className="parent-dashboard">
      <div className="dashboard-header">
        <h2>Parent Dashboard</h2>
      </div>

      {selectedKid && (
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={toggleChallengeSelection}
          >
            {showChallengeSelection ? 'Cancel' : '+ Create Challenge'}
          </button>
        </div>
      )}

      {!selectedKid && kids.length === 0 && (
        <div className="no-kids-message" style={{
          background: 'linear-gradient(135deg, var(--papaya), var(--peach))',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          border: '3px solid var(--deep-burgundy)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
          <h3 style={{ color: 'var(--deep-burgundy)', marginBottom: '1rem' }}>
            No Kids Linked Yet
          </h3>
          <p style={{ color: 'var(--chocolate)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Link a kid account to start creating challenges!
          </p>
          <p style={{ color: 'var(--chocolate)', fontSize: '0.95rem' }}>
            Share your parent code with your kids so they can link their accounts.
          </p>
        </div>
      )}

      {kids.length > 1 && (
        <div className="kid-selector-section" style={{
          background: 'linear-gradient(135deg, var(--medium-purple), var(--deep-purple))',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          border: '3px solid var(--deep-purple)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
            {selectedKid ? `Viewing challenges for: ${selectedKid.username}` : 'Select a kid to view'}
          </span>
          <select
            className="kid-selector"
            value={selectedKid?.id || ''}
            onChange={(e) => {
              const kid = kids.find(k => k.id === e.target.value)
              setSelectedKid(kid)
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: '2px solid var(--white)',
              background: 'var(--white)',
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            <option value="">Select a kid</option>
            {kids.map(kid => (
              <option key={kid.id} value={kid.id}>
                👤 {kid.username}
              </option>
            ))}
          </select>
        </div>
      )}

      {kids.length === 1 && selectedKid && (
        <div className="selected-kid-banner" style={{
          background: 'linear-gradient(135deg, var(--medium-purple), var(--deep-purple))',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          border: '3px solid var(--deep-purple)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
            Viewing challenges for: {selectedKid.username}
          </span>
        </div>
      )}

      {selectedKid && !showChallengeSelection && !showCreateForm && !showNumberBondsForm && (
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
      )}

      {selectedKid && showChallengeSelection && (
        <div className="challenge-selection" style={{
          background: 'linear-gradient(135deg, var(--warm-beige), var(--soft-cream))',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '3px solid var(--deep-burgundy)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-burgundy)', textAlign: 'center' }}>
            🎯 Choose Challenge Type
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <button
              className="challenge-type-card"
              onClick={() => handleSelectChallengeType('number-bonds')}
              style={{
                background: 'linear-gradient(135deg, var(--sunset-orange), var(--coral-pink))',
                border: '3px solid var(--deep-burgundy)',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛷️</div>
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                Number Bonds Challenge
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', margin: 0 }}>
                Practice math with number bonds game
              </p>
            </button>

            <button
              className="challenge-type-card"
              onClick={() => handleSelectChallengeType('custom')}
              style={{
                background: 'linear-gradient(135deg, var(--papaya), var(--peach))',
                border: '3px solid var(--deep-burgundy)',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✏️</div>
              <h4 style={{ color: 'var(--deep-burgundy)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                Custom Challenge
              </h4>
              <p style={{ color: 'var(--chocolate)', fontSize: '0.95rem', margin: 0 }}>
                Create your own custom challenge
              </p>
            </button>
          </div>
        </div>
      )}

      {showManageKids && (
        <div className="manage-kids-section" style={{
          background: 'linear-gradient(135deg, var(--warm-beige), var(--soft-cream))',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '3px solid var(--deep-burgundy)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-burgundy)' }}>
            👨‍👩‍👧‍👦 Manage Kids
          </h3>

          {/* Parent Code Display */}
          <div style={{
            background: 'linear-gradient(135deg, var(--sunset-orange), var(--coral-pink))',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
              Your Parent Code
            </div>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              fontFamily: 'Courier New, monospace',
              letterSpacing: '0.3em',
              color: 'var(--deep-burgundy)',
              marginBottom: '1rem'
            }}>
              {parentCode || 'Loading...'}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.95rem' }}>
              Share this code with your kids so they can link their accounts
            </div>
          </div>

          {/* Linked Kids List */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--deep-burgundy)' }}>
              Linked Kids ({kids.length})
            </h4>
            {kids.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--soft-brown)',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px'
              }}>
                No kids linked yet. Share your parent code above to get started!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {kids.map(kid => (
                  <div key={kid.id} style={{
                    background: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '2px solid var(--coral-pink)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--deep-burgundy)', fontSize: '1.1rem' }}>
                        {kid.username}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--soft-brown)' }}>
                        Joined {new Date(kid.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--sunset-orange), var(--coral-pink))',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      Kid Account
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedKid && showCreateForm && (
        <CreateChallenge
          onSubmit={handleCreateChallenge}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {selectedKid && showNumberBondsForm && (
        <NumberBondsChallenge
          onSubmit={handleCreateChallenge}
          onCancel={() => setShowNumberBondsForm(false)}
        />
      )}

      <SendCheerModal
        isOpen={showCheerModal}
        onClose={handleCheerModalClose}
        kidOnline={kidOnline}
        selectedKid={selectedKid}
      />

      {selectedKid && (
        <ChallengeList
          challenges={filteredChallenges}
          onDelete={handleDeleteChallenge}
          isParent={true}
        />
      )}
    </div>
  )
}

export default ParentDashboard
