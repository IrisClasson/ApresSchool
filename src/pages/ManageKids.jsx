import { useState, useEffect } from 'react'
import authService from '../lib/authService'
import './ManageKids.css'

function ManageKids() {
  const [parentCode, setParentCode] = useState('')
  const [kids, setKids] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    // Get parent code
    const codeResult = await authService.getMyParentCode()
    if (codeResult.success) {
      setParentCode(codeResult.parentCode)
    }

    // Get kids
    const kidsResult = await authService.getMyKids()
    if (kidsResult.success) {
      setKids(kidsResult.kids)
    }

    setLoading(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(parentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="manage-kids-page">
        <div className="loading-state">Loading...</div>
      </div>
    )
  }

  return (
    <div className="manage-kids-page">
      <div className="page-header">
        <h1>Manage Kids</h1>
        <p className="page-subtitle">Share your parent code with kids to link their accounts</p>
      </div>

      {/* Parent Code Section */}
      <div className="parent-code-section">
        <div className="section-header">
          <h2>Your Parent Code</h2>
          <p>Kids need this code to link their account to yours</p>
        </div>

        <div className="parent-code-display">
          <div className="code-box">
            <span className="code-label">Parent Code:</span>
            <span className="code-value">{parentCode}</span>
          </div>
          <button
            className="btn btn-primary copy-btn"
            onClick={handleCopyCode}
          >
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        <div className="code-instructions">
          <h3>How to add a kid:</h3>
          <ol>
            <li>Share your parent code: <strong>{parentCode}</strong></li>
            <li>Kid goes to registration page and selects "Kid" role</li>
            <li>Kid enters your parent code during registration</li>
            <li>Kid account will be automatically linked to yours!</li>
          </ol>
        </div>
      </div>

      {/* Linked Kids Section */}
      <div className="linked-kids-section">
        <div className="section-header">
          <h2>Linked Kids ({kids.length})</h2>
          <p>Kids connected to your account</p>
        </div>

        {kids.length === 0 ? (
          <div className="empty-state">
            <p>No kids linked yet. Share your parent code to get started!</p>
          </div>
        ) : (
          <div className="kids-list">
            {kids.map((kid) => (
              <div key={kid.id} className="kid-card">
                <div className="kid-info">
                  <div className="kid-icon">👤</div>
                  <div className="kid-details">
                    <div className="kid-username">{kid.username}</div>
                    <div className="kid-date">
                      Joined {new Date(kid.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="kid-status">
                  <span className="status-badge">Linked</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageKids
