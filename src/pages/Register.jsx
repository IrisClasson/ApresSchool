import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../lib/authService'
import { useTranslation } from '../contexts/LanguageContext'
import './Login.css' // Reuse login styles

function Register() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
      setError(t('auth.register.errorPasswordMismatch'))
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
            <h1>{t('app.logoWithEmoji')}</h1>
            <h2>{t('auth.register.successTitle')}</h2>
            <p>{t('auth.register.successSubtitle')}</p>
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
              {t('auth.register.parentCodeLabel')}
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
              {t('auth.register.parentCodeHelper')}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ width: '100%' }}
          >
            {t('auth.register.continueButton')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('app.logoWithEmoji')}</h1>
          <h2>{t('auth.register.title')}</h2>
          <p>{t('auth.register.subtitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">{t('auth.register.username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('auth.register.usernamePlaceholder')}
              required
              autoComplete="username"
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.register.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              required
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>{t('auth.register.roleLabel')}</label>
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
                {t('auth.register.roleParent')}
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
                {t('auth.register.roleKid')}
              </label>
            </div>
          </div>

          {formData.role === 'kid' && (
            <div className="form-group">
              <label htmlFor="parentCode">{t('auth.register.parentCode')}</label>
              <input
                type="text"
                id="parentCode"
                name="parentCode"
                value={formData.parentCode}
                onChange={handleChange}
                placeholder={t('auth.register.parentCodePlaceholder')}
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
                {t('auth.register.parentCodeHelper')}
              </small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? t('auth.register.submittingButton') : t('auth.register.submitButton')}
          </button>

          <div className="auth-footer">
            <p>
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login" className="auth-link">{t('auth.register.loginLink')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
