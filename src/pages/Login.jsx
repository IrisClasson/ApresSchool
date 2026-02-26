import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../lib/authService'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'parent'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    const result = await authService.login(
      formData.username,
      formData.password,
      formData.role
    )

    setLoading(false)

    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'parent') {
        navigate('/')
      } else {
        navigate('/kid')
      }
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>⛷️ Apres School</h1>
          <h2>Welcome Back!</h2>
          <p>Log in to continue your learning journey</p>
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
              placeholder="Enter your username"
              required
              autoComplete="username"
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
              placeholder="Enter your password"
              required
              autoComplete="current-password"
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

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Register here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
