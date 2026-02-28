import { useState, useEffect } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { generateEvenOddChallenge, getSuggestedTimeEstimate } from '../lib/evenOddService'
import EvenOddGame from './EvenOddGame'
import './NumberBondsChallenge.css'

function EvenOddChallenge({ onSubmit, onCancel }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    targetType: 'even',
    numberRange: 20,
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
      [name]: name === 'numberRange' || name === 'gameDuration' || name === 'timeEstimate'
        ? parseInt(value)
        : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Generate the even/odd challenge
    const challenge = generateEvenOddChallenge({
      targetType: formData.targetType,
      numberRange: formData.numberRange,
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
    alert(`${t('evenOddChallenge.previewComplete')}\n${t('evenOddChallenge.score')}: ${gameResult.score}\n${t('evenOddChallenge.totalSum')}: ${gameResult.runningSum}\n\n${t('evenOddChallenge.nowCreate')}`)
  }

  return (
    <div className="card number-bonds-challenge">
      <div className="challenge-header">
        <h3>🔢 {t('evenOddChallenge.title')}</h3>
        <p className="challenge-subtitle">{t('evenOddChallenge.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Target Type Selection */}
        <div className="form-group">
          <label htmlFor="targetType">
            {t('evenOddChallenge.targetType')}
            <span className="help-text">{t('evenOddChallenge.targetTypeHelp')}</span>
          </label>
          <select
            id="targetType"
            name="targetType"
            value={formData.targetType}
            onChange={handleChange}
            className="form-select"
          >
            <option value="even">{t('evenOddChallenge.even')}</option>
            <option value="odd">{t('evenOddChallenge.odd')}</option>
          </select>
        </div>

        {/* Number Range Selection */}
        <div className="form-group">
          <label htmlFor="numberRange">
            {t('evenOddChallenge.numberRange')}
            <span className="help-text">{t('evenOddChallenge.numberRangeHelp')}</span>
          </label>
          <select
            id="numberRange"
            name="numberRange"
            value={formData.numberRange}
            onChange={handleChange}
            className="form-select"
          >
            <option value={10}>{t('evenOddChallenge.range1to10')}</option>
            <option value={20}>{t('evenOddChallenge.range1to20')}</option>
            <option value={50}>{t('evenOddChallenge.range1to50')}</option>
            <option value={100}>{t('evenOddChallenge.range1to100')}</option>
          </select>
        </div>

        {/* Game Duration */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gameDuration">
              {t('evenOddChallenge.gameDuration')}
            </label>
            <select
              id="gameDuration"
              name="gameDuration"
              value={formData.gameDuration}
              onChange={handleChange}
              className="form-select"
            >
              <option value={30}>30 {t('evenOddChallenge.seconds')}</option>
              <option value={60}>60 {t('evenOddChallenge.seconds')}</option>
              <option value={90}>90 {t('evenOddChallenge.seconds')}</option>
              <option value={120}>120 {t('evenOddChallenge.seconds')}</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="form-group">
            <label htmlFor="difficulty">
              {t('evenOddChallenge.difficulty')}
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="form-select"
            >
              <option value="easy">{t('evenOddChallenge.easy')} (10 pts)</option>
              <option value="medium">{t('evenOddChallenge.medium')} (20 pts)</option>
              <option value="hard">{t('evenOddChallenge.hard')} (30 pts)</option>
            </select>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeEstimate">
              {t('evenOddChallenge.timeEstimate')}
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
              {t('evenOddChallenge.reminderLevel')}
            </label>
            <select
              id="nagLevel"
              name="nagLevel"
              value={formData.nagLevel}
              onChange={handleChange}
              className="form-select"
            >
              <option value="gentle">{t('evenOddChallenge.gentle')}</option>
              <option value="normal">{t('evenOddChallenge.normal')}</option>
              <option value="relentless">{t('evenOddChallenge.relentless')}</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {t('evenOddChallenge.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-game"
            onClick={() => setShowPreview(true)}
          >
            🎮 {t('evenOddChallenge.previewGame')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('evenOddChallenge.createChallenge')}
          </button>
        </div>
      </form>

      {/* Game Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-modal-content">
            <div className="preview-header">
              <h3>🎮 {t('evenOddChallenge.gamePreview')}</h3>
              <button
                className="btn-close-preview"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
            <div className="preview-body">
              <EvenOddGame
                targetType={formData.targetType}
                gameDuration={formData.gameDuration}
                numberRange={formData.numberRange}
                onComplete={handlePreviewComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvenOddChallenge
