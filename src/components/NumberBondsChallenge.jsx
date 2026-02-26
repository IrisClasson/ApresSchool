import { useState, useEffect } from 'react'
import { generateNumberBondsChallenge, getSuggestedTimeEstimate } from '../lib/numberBondsService'
import NumberBondsGame from './NumberBondsGame'
import './NumberBondsChallenge.css'

function NumberBondsChallenge({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    targetNumber: 10,
    visualStyle: 'equation',
    problemCount: 10,
    difficulty: 'easy',
    timeEstimate: 10,
    nagLevel: 'normal'
  })
  const [showPreview, setShowPreview] = useState(false)

  // Auto-calculate suggested time estimate when problem count or difficulty changes
  useEffect(() => {
    const suggestedTime = getSuggestedTimeEstimate(formData.problemCount, formData.difficulty)
    setFormData(prev => ({
      ...prev,
      timeEstimate: suggestedTime
    }))
  }, [formData.problemCount, formData.difficulty])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetNumber' || name === 'problemCount' || name === 'timeEstimate'
        ? parseInt(value)
        : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Generate the number bonds challenge
    const challenge = generateNumberBondsChallenge({
      targetNumber: formData.targetNumber,
      problemCount: formData.problemCount,
      visualStyle: formData.visualStyle,
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
    alert(`Preview complete!\nScore: ${gameResult.score}/${gameResult.total} (${gameResult.percentage}%)\n\nNow create the challenge for your kid!`)
  }

  const visualStyleDescriptions = {
    'equation': 'Show complete equations (e.g., 3 + 7 = 10)',
    'fill-in': 'Fill-in-the-blank format (e.g., __ + 7 = 10)',
    'circles': 'Visual representation with circles to split'
  }

  return (
    <div className="card number-bonds-challenge">
      <div className="challenge-header">
        <h3>⛷️ Create Number Bonds Challenge</h3>
        <p className="challenge-subtitle">Help kids master number composition and decomposition</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Target Number Selection */}
        <div className="form-group">
          <label htmlFor="targetNumber">
            Target Number
            <span className="help-text">The sum kids will make bonds to</span>
          </label>
          <select
            id="targetNumber"
            name="targetNumber"
            value={formData.targetNumber}
            onChange={handleChange}
            className="form-select"
          >
            <option value={5}>Bonds to 5 (Beginner)</option>
            <option value={10}>Bonds to 10 (Most Common)</option>
            <option value={15}>Bonds to 15 (Intermediate)</option>
            <option value={20}>Bonds to 20 (Advanced)</option>
            <option value={25}>Bonds to 25 (Challenge)</option>
          </select>
        </div>

        {/* Visual Style Selection */}
        <div className="form-group">
          <label htmlFor="visualStyle">
            Visual Style
            <span className="help-text">How problems will be displayed</span>
          </label>
          <select
            id="visualStyle"
            name="visualStyle"
            value={formData.visualStyle}
            onChange={handleChange}
            className="form-select"
          >
            <option value="equation">Equation Format</option>
            <option value="fill-in">Fill-in-the-Blanks</option>
            <option value="circles">Visual Circles</option>
          </select>
          <p className="style-description">{visualStyleDescriptions[formData.visualStyle]}</p>
        </div>

        {/* Problem Count */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="problemCount">
              Number of Problems
            </label>
            <input
              type="number"
              id="problemCount"
              name="problemCount"
              min="1"
              max="20"
              value={formData.problemCount}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Difficulty Level */}
          <div className="form-group">
            <label htmlFor="difficulty">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="form-select"
            >
              <option value="easy">Easy (10 pts)</option>
              <option value="medium">Medium (20 pts)</option>
              <option value="hard">Hard (30 pts)</option>
            </select>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeEstimate">
              Time Estimate (minutes)
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
              Reminder Level
            </label>
            <select
              id="nagLevel"
              name="nagLevel"
              value={formData.nagLevel}
              onChange={handleChange}
              className="form-select"
            >
              <option value="gentle">Gentle</option>
              <option value="normal">Normal</option>
              <option value="relentless">Relentless</option>
            </select>
          </div>
        </div>

        {/* Challenge Summary */}
        <div className="challenge-summary">
          <h4>Challenge Summary</h4>
          <ul>
            <li><strong>Title:</strong> Number Bonds to {formData.targetNumber}</li>
            <li><strong>Problems:</strong> {formData.problemCount} problems</li>
            <li><strong>Format:</strong> {visualStyleDescriptions[formData.visualStyle]}</li>
            <li><strong>Estimated Time:</strong> {formData.timeEstimate} minutes</li>
            <li><strong>Points:</strong> {formData.difficulty === 'easy' ? 10 : formData.difficulty === 'hard' ? 30 : 20} points</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-game"
            onClick={() => setShowPreview(true)}
          >
            🎮 Preview Game
          </button>
          <button type="submit" className="btn btn-primary">
            Create Number Bonds Challenge
          </button>
        </div>
      </form>

      {/* Game Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-modal-content">
            <div className="preview-header">
              <h3>🎮 Game Preview - Try it out!</h3>
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
                This is how your child will experience the game.
                Try it out! Find the number bonds that make {formData.targetNumber}!
              </p>
              <NumberBondsGame
                targetNumber={formData.targetNumber}
                totalProblems={formData.problemCount}
                onComplete={handlePreviewComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NumberBondsChallenge
