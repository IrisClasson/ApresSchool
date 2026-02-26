import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../lib/authService'
import './LinkParent.css'

function LinkParent() {
  const [parentCode, setParentCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasParent, setHasParent] = useState(false)
  const [parentInfo, setParentInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkParentStatus()
  }, [])

  const checkParentStatus = async () => {
    const result = await authService.getMyParent()
    if (result.success && result.parent) {
      setHasParent(true)
      setParentInfo(result.parent)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authService.linkToParent(parentCode)

    if (result.success) {
      // Success! Redirect to kid dashboard
      navigate('/kid')
    } else {
      setError(result.error || 'Failed to link to parent')
    }

    setLoading(false)
  }

  if (hasParent && parentInfo) {
    return (
      <div className="link-parent-page">
        <div className="link-parent-card">
          <div className="success-icon">✅</div>
          <h2>Parent Already Linked!</h2>
          <div className="parent-info">
            <div className="info-label">Connected to:</div>
            <div className="info-value">👤 {parentInfo.username}</div>
          </div>
          <p className="info-text">
            You're already connected to your parent. They can send you challenges and messages!
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/kid')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="link-parent-page">
      <div className="link-parent-card">
        <h2>👨‍👩‍👧‍👦 Link to Your Parent</h2>
        <p className="subtitle">
          Enter your parent's code to connect your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="parentCode">Parent Code</label>
            <input
              id="parentCode"
              type="text"
              value={parentCode}
              onChange={(e) => setParentCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              disabled={loading}
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.3em',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading || parentCode.length !== 6}
          >
            {loading ? 'Connecting...' : 'Link to Parent'}
          </button>
        </form>

        <div className="help-section">
          <h3>💡 Need Help?</h3>
          <ul>
            <li>Ask your parent for their 6-character parent code</li>
            <li>They can find it in the "Manage Kids" section</li>
            <li>Make sure to enter the code exactly as shown</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LinkParent
