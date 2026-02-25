import { useState } from 'react'
import { generateAIMathChallenge } from '../lib/aiService'
import './CreateChallenge.css'

function CreateChallenge({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'math',
    difficulty: 'medium',
    description: '',
    timeEstimate: 30,
    nagLevel: 'normal',
    points: 20
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const generateAIMath = async () => {
    try {
      const aiChallenge = await generateAIMathChallenge(formData.difficulty)
      setFormData(prev => ({
        ...prev,
        ...aiChallenge
      }))
    } catch (error) {
      console.error('Failed to generate AI challenge:', error)
      alert('Failed to generate challenge. Please try again.')
    }
  }

  return (
    <div className="card create-challenge">
      <h3>Create New Challenge</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Math Mission 1"
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <select name="subject" value={formData.subject} onChange={handleChange}>
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="science">Science</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the challenge..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Difficulty</label>
            <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="easy">Easy (10 pts)</option>
              <option value="medium">Medium (20 pts)</option>
              <option value="hard">Hard (30 pts)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Time Estimate (minutes)</label>
            <input
              type="number"
              name="timeEstimate"
              value={formData.timeEstimate}
              onChange={handleChange}
              min="5"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Nag Level</label>
            <select name="nagLevel" value={formData.nagLevel} onChange={handleChange}>
              <option value="gentle">🟢 Gentle</option>
              <option value="normal">🟡 Normal</option>
              <option value="relentless">🔴 Relentless</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="button" className="btn btn-secondary" onClick={generateAIMath}>
            ✨ Generate Math Challenge
          </button>
          <div style={{ flex: 1 }}></div>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Challenge
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateChallenge
