import './StatsFilter.css'

function StatsFilter({ filters, onFilterChange, challengeTypes }) {
  const handleDateRangeChange = (e) => {
    onFilterChange({ ...filters, dateRange: e.target.value })
  }

  const handleChallengeTypeChange = (e) => {
    onFilterChange({ ...filters, challengeType: e.target.value })
  }

  return (
    <div className="stats-filter">
      <div className="filter-group">
        <label htmlFor="dateRange">Date Range</label>
        <select
          id="dateRange"
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          className="filter-select"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="challengeType">Challenge Type</label>
        <select
          id="challengeType"
          value={filters.challengeType}
          onChange={handleChallengeTypeChange}
          className="filter-select"
        >
          <option value="all">All Types</option>
          {challengeTypes.map(type => (
            <option key={type} value={type}>{formatChallengeType(type)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

const formatChallengeType = (type) => {
  const formatted = {
    'number-bonds': 'Number Bonds',
    'math': 'Math',
    'reading': 'Reading',
    'writing': 'Writing',
    'science': 'Science',
    'general': 'General'
  }
  return formatted[type] || type
}

export default StatsFilter
