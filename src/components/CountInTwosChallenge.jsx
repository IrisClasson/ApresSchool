import { useState, useEffect } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { generateCountInTwosChallenge, getSuggestedTimeEstimate } from '../lib/countInTwosService'
import CountInTwosGame from './CountInTwosGame'
import './NumberBondsChallenge.css'

function CountInTwosChallenge({ onSubmit, onCancel }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    gameDuration: 60,
    difficulty: 'easy',
    timeEstimate: 10,
    nagLevel: 'normal'
  })
  const [showPreview, setShowPreview] = useState(false)

  // Auto-calculate suggested time estimate when difficulty changes
  useEffect(() => {
    const suggestedTime = getSuggestedTimeEstimate(formData.difficulty)
    setFormData(prev => ({
      ...prev,
      timeEstimate: suggestedTime
    }))
  }, [formData.difficulty])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gameDuration' || name === 'timeEstimate'
        ? parseInt(value)
        : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Generate the count in twos challenge
    const challenge = generateCountInTwosChallenge({
      gameDuration: formData.gameDuration,
      difficulty: formData.difficulty
    })

    // Add additional fields
    const completeChallenge = {
      ...challenge,
      timeEstimate: formData.timeEstimate,
      nagLevel: formData.nagLevel,
      points: formData.difficulty === 'easy' ? 10 : formData.difficulty === 'hard' ? 30 : 20
    }

    onSubmit(completeChallenge)
  }

  const handlePreviewComplete = (gameResult) => {
    // Just close preview when game completes in preview mode
    setShowPreview(false)
    alert(`${t('countInTwosChallenge.previewComplete')}\n${t('countInTwosChallenge.score')}: ${gameResult.score}\n${t('countInTwosChallenge.numbersCollected')}: ${gameResult.collectedNumbers?.join(', ')}\n\n${t('countInTwosChallenge.nowCreate')}`)
  }

  return (
    <div className="card number-bonds-challenge">
      <div className="challenge-header">
        <h3>🏃 {t('countInTwosChallenge.title')}</h3>
        <p className="challenge-subtitle">{t('countInTwosChallenge.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Game Duration */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gameDuration">
              {t('countInTwosChallenge.gameDuration')}
              <span className="help-text">{t('countInTwosChallenge.gameDurationHelp')}</span>
            </label>
            <select
              id="gameDuration"
              name="gameDuration"
              value={formData.gameDuration}
              onChange={handleChange}
              className="form-select"
            >
              <option value={30}>30 {t('countInTwosChallenge.seconds')}</option>
              <option value={60}>60 {t('countInTwosChallenge.seconds')}</option>
              <option value={90}>90 {t('countInTwosChallenge.seconds')}</option>
              <option value={120}>120 {t('countInTwosChallenge.seconds')}</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="form-group">
            <label htmlFor="difficulty">
              {t('countInTwosChallenge.difficulty')}
              <span className="help-text">{t('countInTwosChallenge.difficultyHelp')}</span>
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="form-select"
            >
              <option value="easy">{t('countInTwosChallenge.easy')} (10 pts)</option>
              <option value="medium">{t('countInTwosChallenge.medium')} (20 pts)</option>
              <option value="hard">{t('countInTwosChallenge.hard')} (30 pts)</option>
            </select>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeEstimate">
              {t('countInTwosChallenge.timeEstimate')}
            </label>
            <input
              type="number"
              id="timeEstimate"
              name="timeEstimate"
              min="5"
              max="120"
              value={formData.timeEstimate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Nag Level */}
          <div className="form-group">
            <label htmlFor="nagLevel">
              {t('countInTwosChallenge.reminderLevel')}
            </label>
            <select
              id="nagLevel"
              name="nagLevel"
              value={formData.nagLevel}
              onChange={handleChange}
              className="form-select"
            >
              <option value="gentle">{t('countInTwosChallenge.gentle')}</option>
              <option value="normal">{t('countInTwosChallenge.normal')}</option>
              <option value="relentless">{t('countInTwosChallenge.relentless')}</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {t('countInTwosChallenge.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-game"
            onClick={() => setShowPreview(true)}
          >
            🎮 {t('countInTwosChallenge.previewGame')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('countInTwosChallenge.createChallenge')}
          </button>
        </div>
      </form>

      {/* Game Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-modal-content">
            <div className="preview-header">
              <h3>🎮 {t('countInTwosChallenge.gamePreview')}</h3>
              <button
                className="btn-close-preview"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
            <div className="preview-body">
              <p className="preview-instructions">
                {t('countInTwosChallenge.previewInstructions')}
              </p>
              <CountInTwosGame
                gameDuration={formData.gameDuration}
                difficulty={formData.difficulty}
                onComplete={handlePreviewComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountInTwosChallenge
