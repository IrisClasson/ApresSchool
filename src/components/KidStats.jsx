import './KidStats.css'

function KidStats({ stats }) {
  const badges = {
    'century': { emoji: '💯', name: '100 Points', desc: 'Earned 100 points' },
    'streak-3': { emoji: '🔥', name: 'Hat Trick', desc: '3 challenges in a row' },
    'streak-5': { emoji: '⚡', name: 'On Fire', desc: '5 challenges in a row' },
    'early-bird': { emoji: '🌅', name: 'Early Bird', desc: 'Completed before 9am' },
    'night-owl': { emoji: '🦉', name: 'Night Owl', desc: 'Completed after 8pm' },
    'speed-demon': { emoji: '🏃', name: 'Speed Demon', desc: 'Completed in record time' }
  }

  return (
    <div className="kid-stats">
      <div className="stats-panel">
        <div className="stat-item info-card">
          <span className="stat-icon">⛰️</span>
          <div>
            <div className="stat-number">{stats.points}</div>
            <div className="stat-label">Vertical Meters</div>
          </div>
        </div>

        <div className="stat-item info-card">
          <span className="stat-icon">🔥</span>
          <div>
            <div className="stat-number">{stats.streak}</div>
            <div className="stat-label">Streak</div>
          </div>
        </div>

        <div className="stat-item info-card">
          <span className="stat-icon">🏆</span>
          <div>
            <div className="stat-number">{stats.badges.length}</div>
            <div className="stat-label">Badges</div>
          </div>
        </div>
      </div>

      {stats.badges.length > 0 && (
        <div className="badges-display">
          {stats.badges.map(badgeId => {
            const badge = badges[badgeId]
            return badge ? (
              <div key={badgeId} className="badge-item" title={badge.desc}>
                <span className="badge-emoji">{badge.emoji}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}

export default KidStats
