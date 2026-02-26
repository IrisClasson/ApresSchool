import './ChallengeList.css'

function ChallengeList({ challenges, onDelete, isParent }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      accepted: 'badge-accepted',
      completed: 'badge-completed'
    }
    return `badge ${badges[status] || 'badge-pending'}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (challenges.length === 0) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#666' }}>
          No challenges yet. Create your first challenge!
        </p>
      </div>
    )
  }

  return (
    <div className="challenge-list">
      <h3>All Challenges</h3>
      <div className="challenges">
        {challenges.map(challenge => (
          <div key={challenge.id} className="challenge-item card">
            <div className="challenge-header">
              <div>
                <h4>{challenge.title}</h4>
                <div className="challenge-meta">
                  <span className="subject-tag">{challenge.subject}</span>
                  <span className={getStatusBadge(challenge.status)}>
                    {challenge.status}
                  </span>
                </div>
              </div>
              {isParent && challenge.status === 'pending' && (
                <button
                  className="btn-delete"
                  onClick={() => onDelete(challenge.id)}
                  title="Delete challenge"
                >
                  ✕
                </button>
              )}
            </div>

            {challenge.description && (
              <p className="challenge-description">{challenge.description}</p>
            )}

            <div className="challenge-details">
              <div className="detail-item">
                <span className="detail-label">Difficulty:</span>
                <span className="detail-value">{challenge.difficulty}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{challenge.timeEstimate} min</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nag Level:</span>
                <span className="detail-value">{challenge.nagLevel}</span>
              </div>
            </div>

            <div className="challenge-timeline">
              <div className="timeline-item">
                <small>Created: {formatDate(challenge.created_at)}</small>
              </div>
              {challenge.accepted_at && (
                <div className="timeline-item">
                  <small>Accepted: {formatDate(challenge.accepted_at)}</small>
                </div>
              )}
              {challenge.completed_at && (
                <div className="timeline-item">
                  <small>Completed: {formatDate(challenge.completed_at)}</small>
                </div>
              )}
            </div>

            {/* Kid Feedback Display (for completed challenges) */}
            {challenge.status === 'completed' && challenge.feedback && (
              <div className="challenge-feedback">
                <div className="feedback-header">
                  <strong>Kid's Feedback:</strong>
                </div>
                <div className="feedback-content">
                  <div className="feedback-item">
                    <span className="feedback-icon">
                      {challenge.feedback.sentiment === 'like' && '😀'}
                      {challenge.feedback.sentiment === 'neutral' && '😐'}
                      {challenge.feedback.sentiment === 'dislike' && '😞'}
                    </span>
                    <span className="feedback-text">
                      {challenge.feedback.sentiment === 'like' && 'Loved it!'}
                      {challenge.feedback.sentiment === 'neutral' && 'It was okay'}
                      {challenge.feedback.sentiment === 'dislike' && 'Didn\'t like it'}
                    </span>
                  </div>
                  <div className="feedback-item">
                    <span className="feedback-label">Difficulty:</span>
                    <span className="feedback-rating">
                      {'⭐'.repeat(challenge.feedback.difficulty)}
                      {'☆'.repeat(5 - challenge.feedback.difficulty)}
                    </span>
                  </div>
                  {challenge.feedback.comment && (
                    <div className="feedback-comment">
                      <span className="feedback-label">Comment:</span>
                      <p>"{challenge.feedback.comment}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChallengeList
