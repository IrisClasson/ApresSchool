import { useState, useEffect } from 'react'
import { getFilteredSessions, calculateSummaries, getChallengeTypeCounts } from '../lib/statsService'
import StatsFilter from '../components/StatsFilter'
import StatsSummary from '../components/StatsSummary'
import SessionList from '../components/SessionList'
import SessionDetail from '../components/SessionDetail'
import './ParentStats.css'

function ParentStats() {
  const [filters, setFilters] = useState({
    dateRange: '30',
    challengeType: 'all'
  })
  const [sessions, setSessions] = useState([])
  const [summaries, setSummaries] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [challengeTypes, setChallengeTypes] = useState([])

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = () => {
    // Get filtered sessions
    const filteredSessions = getFilteredSessions(filters)
    setSessions(filteredSessions)

    // Calculate summaries
    const summariesData = calculateSummaries(filteredSessions)
    setSummaries(summariesData)

    // Get challenge types for filter
    const types = getChallengeTypeCounts()
    setChallengeTypes(types.map(t => t.type))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSessionClick = (session) => {
    setSelectedSession(session)
  }

  const handleCloseDetail = () => {
    setSelectedSession(null)
  }

  return (
    <div className="parent-stats">
      <div className="stats-header">
        <h2>📊 Challenge Statistics</h2>
        <p className="stats-subtitle">Track your child's learning progress and performance</p>
      </div>

      {/* Filters */}
      <StatsFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        challengeTypes={challengeTypes}
      />

      {/* Summary Cards */}
      {summaries && <StatsSummary summaries={summaries} />}

      {/* Session List */}
      <SessionList
        sessions={sessions}
        onSessionClick={handleSessionClick}
      />

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

export default ParentStats
