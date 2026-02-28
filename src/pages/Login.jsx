import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../lib/authService'
import { useTranslation } from '../contexts/LanguageContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
          <h1>{t('app.logoWithEmoji')}</h1>
          <h2>{t('auth.login.title')}</h2>
          <p>{t('auth.login.subtitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">{t('auth.login.username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('auth.login.usernamePlaceholder')}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.login.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label>{t('auth.login.roleLabel')}</label>
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
                {t('auth.login.roleParent')}
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
                {t('auth.login.roleKid')}
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? t('auth.login.submittingButton') : t('auth.login.submitButton')}
          </button>

          <div className="auth-footer">
            <p>
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="auth-link">{t('auth.login.registerLink')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
