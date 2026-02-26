import { useState } from 'react'
import authService from '../lib/authService'
import './LinkParent.css'

function LinkParent({ onLinked }) {
  const [parentCode, setParentCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!parentCode || parentCode.length !== 6) {
      setError('Parent code must be 6 characters')
      setLoading(false)
      return
    }

    const result = await authService.linkToParent(parentCode.toUpperCase())
    setLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        if (onLinked) onLinked()
      }, 2000)
    } else {
      setError(result.error || 'Failed to link to parent')
    }
  }

  if (success) {
    return (
      <div className="link-parent-card success">
        <div className="success-icon">✓</div>
        <h3>Successfully Linked!</h3>
        <p>Your account is now linked to your parent.</p>
      </div>
    )
  }

  return (
    <div className="link-parent-card">
      <div className="link-parent-header">
        <h3>Link to Parent Account</h3>
        <p>Enter your parent's code to connect your accounts</p>
      </div>

      <form onSubmit={handleSubmit} className="link-parent-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="parentCode">Parent Code</label>
          <input
            type="text"
            id="parentCode"
            value={parentCode}
            onChange={(e) => setParentCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character code"
            maxLength="6"
            required
            disabled={loading}
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontFamily: 'Courier New, monospace',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}
          />
          <small>Ask your parent for their 6-character code</small>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || parentCode.length !== 6}
        >
          {loading ? 'Linking...' : 'Link to Parent'}
        </button>
      </form>
    </div>
  )
}

export default LinkParent
