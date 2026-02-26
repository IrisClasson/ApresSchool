import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../lib/authService'
import './Login.css' // Reuse login styles

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'parent',
    parentCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newParentCode, setNewParentCode] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await authService.register(
      formData.username,
      formData.password,
      formData.role,
      formData.parentCode || null
    )

    setLoading(false)

    if (result.success) {
      // If parent, show their new parent code before redirecting
      if (result.user.role === 'parent' && result.parentCode) {
        setNewParentCode(result.parentCode)
      } else {
        // Kid - redirect immediately
        navigate('/kid')
      }
    } else {
      setError(result.error)
    }
  }

  // Show parent code after successful parent registration
  if (newParentCode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>⛷️ Apres School</h1>
            <h2>Account Created!</h2>
            <p>Save your parent code - kids will need it to link their accounts</p>
          </div>

          <div className="parent-code-display" style={{
            background: 'var(--deep-burgundy)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            border: '3px solid var(--sage-green)'
          }}>
            <div style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>
              Your Parent Code
            </div>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              fontSize: '3rem',
              fontWeight: '800',
              fontFamily: 'Inter, monospace',
              letterSpacing: '0.2em',
              color: 'var(--deep-burgundy)',
              marginBottom: '1rem'
            }}>
              {newParentCode}
            </div>
            <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500' }}>
              Kids will enter this code during registration to link to your account
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ width: '100%' }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>⛷️ Apres School</h1>
          <h2>Create Account</h2>
          <p>Join us and start your learning adventure!</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username (min 3 characters)"
              required
              autoComplete="username"
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password (min 6 characters)"
              required
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="parent"
                  checked={formData.role === 'parent'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                Parent
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="kid"
                  checked={formData.role === 'kid'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                Kid
              </label>
            </div>
          </div>

          {formData.role === 'kid' && (
            <div className="form-group">
              <label htmlFor="parentCode">Parent Code</label>
              <input
                type="text"
                id="parentCode"
                name="parentCode"
                value={formData.parentCode}
                onChange={handleChange}
                placeholder="Enter your parent's code (6 characters)"
                required
                maxLength="6"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '1.2rem'
                }}
              />
              <small style={{ color: 'var(--soft-brown)', fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
                Ask your parent for their parent code to link your account
              </small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Log in here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
