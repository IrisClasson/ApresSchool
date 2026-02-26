import { localDB } from './supabase'

/**
 * Stats Service
 * Provides filtering, aggregation, and query functions for challenge session analytics
 */

/**
 * Get filtered sessions based on criteria
 * @param {Object} filters - Filter criteria
 * @param {string} filters.dateRange - '7' | '30' | 'all'
 * @param {string} filters.challengeType - Challenge type or 'all'
 * @returns {Array} Filtered sessions
 */
export const getFilteredSessions = (filters = {}) => {
  let sessions = localDB.getSessions()

  // Apply date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const days = parseInt(filters.dateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    sessions = sessions.filter(session => {
      const sessionDate = new Date(session.completed_at || session.started_at)
      return sessionDate >= cutoffDate
    })
  }

  // Apply challenge type filter
  if (filters.challengeType && filters.challengeType !== 'all') {
    sessions = sessions.filter(session => session.challengeType === filters.challengeType)
  }

  // Sort by completion date (most recent first)
  sessions.sort((a, b) => {
    const dateA = new Date(a.completed_at || a.started_at)
    const dateB = new Date(b.completed_at || b.started_at)
    return dateB - dateA
  })

  return sessions
}

/**
 * Calculate summary statistics from sessions
 * @param {Array} sessions - Array of challenge sessions
 * @returns {Object} Summary statistics
 */
export const calculateSummaries = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      averageDifficulty: 0,
      mostPlayedChallenge: 'N/A',
      totalTimeSpent: 0
    }
  }

  // Total attempts
  const totalAttempts = sessions.length

  // Average score (percentage)
  const scores = sessions
    .filter(s => s.scoreBreakdown && s.scoreBreakdown.total > 0)
    .map(s => (s.scoreBreakdown.correct / s.scoreBreakdown.total) * 100)

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0

  // Average difficulty (1=easy, 2=medium, 3=hard)
  const difficultyMap = { easy: 1, medium: 2, hard: 3 }
  const difficulties = sessions
    .filter(s => s.difficulty)
    .map(s => difficultyMap[s.difficulty] || 2)

  const avgDifficultyValue = difficulties.length > 0
    ? difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length
    : 0

  const averageDifficulty = avgDifficultyValue

  // Most played challenge type
  const challengeTypeCounts = {}
  sessions.forEach(session => {
    const type = session.challengeType || 'Unknown'
    challengeTypeCounts[type] = (challengeTypeCounts[type] || 0) + 1
  })

  const mostPlayedChallenge = Object.keys(challengeTypeCounts).reduce((a, b) =>
    challengeTypeCounts[a] > challengeTypeCounts[b] ? a : b, 'N/A'
  )

  // Total time spent (in minutes)
  const totalTimeSpent = sessions
    .filter(s => s.duration)
    .reduce((sum, s) => sum + s.duration, 0)

  return {
    totalAttempts,
    averageScore,
    averageDifficulty,
    mostPlayedChallenge,
    totalTimeSpent: Math.round(totalTimeSpent)
  }
}

/**
 * Get detailed session information by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session details
 */
export const getSessionDetails = (sessionId) => {
  return localDB.getSessionById(sessionId)
}

/**
 * Get challenge types with counts
 * @returns {Array} Array of challenge types with counts
 */
export const getChallengeTypeCounts = () => {
  const sessions = localDB.getSessions()
  const typeCounts = {}

  sessions.forEach(session => {
    const type = session.challengeType || 'Unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get score breakdown statistics
 * @param {Array} sessions - Array of sessions
 * @returns {Object} Score statistics
 */
export const getScoreStatistics = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      totalCorrect: 0,
      totalWrong: 0,
      totalQuestions: 0,
      accuracyRate: 0
    }
  }

  const totalCorrect = sessions
    .filter(s => s.scoreBreakdown)
    .reduce((sum, s) => sum + (s.scoreBreakdown.correct || 0), 0)

  const totalWrong = sessions
    .filter(s => s.scoreBreakdown)
    .reduce((sum, s) => sum + (s.scoreBreakdown.wrong || 0), 0)

  const totalQuestions = totalCorrect + totalWrong
  const accuracyRate = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0

  return {
    totalCorrect,
    totalWrong,
    totalQuestions,
    accuracyRate
  }
}

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "5m 30s")
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  } else if (remainingSeconds === 0) {
    return `${minutes}m`
  } else {
    return `${minutes}m ${remainingSeconds}s`
  }
}

/**
 * Format timestamp to readable date/time
 * @param {string} isoString - ISO timestamp
 * @returns {Object} Formatted date and time
 */
export const formatTimestamp = (isoString) => {
  if (!isoString) return { date: 'N/A', time: 'N/A' }

  const date = new Date(isoString)
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return { date: dateStr, time: timeStr }
}

/**
 * Get difficulty label with emoji
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {string} Formatted difficulty label
 */
export const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '🟢 Easy',
    medium: '🟡 Medium',
    hard: '🔴 Hard'
  }
  return labels[difficulty] || '⚪ Unknown'
}

/**
 * Get feedback emoji
 * @param {string} sentiment - 'like' | 'neutral' | 'dislike'
 * @returns {string} Emoji
 */
export const getFeedbackEmoji = (sentiment) => {
  const emojis = {
    like: '😀',
    neutral: '😐',
    dislike: '😞'
  }
  return emojis[sentiment] || '😐'
}

export default {
  getFilteredSessions,
  calculateSummaries,
  getSessionDetails,
  getChallengeTypeCounts,
  getScoreStatistics,
  formatDuration,
  formatTimestamp,
  getDifficultyLabel,
  getFeedbackEmoji
}
