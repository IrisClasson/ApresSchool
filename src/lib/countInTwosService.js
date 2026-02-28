// Count in Twos Running Game Challenge Generator

/**
 * Generates a complete count in twos running game challenge
 * @param {Object} config - Challenge configuration
 * @param {number} config.gameDuration - Game time in seconds (30, 60, 90, 120)
 * @param {string} config.difficulty - Challenge difficulty ('easy', 'medium', 'hard')
 * @returns {Object} Challenge object
 */
export const generateCountInTwosChallenge = (config) => {
  const {
    gameDuration = 60,
    difficulty = 'easy'
  } = config

  const title = `Count in Twos Running Game`
  const description = `Run and collect numbers counting in twos (2, 4, 6, 8...). Jump over wrong numbers! Time: ${gameDuration}s.`

  return {
    title,
    description,
    subject: 'math',
    difficulty,
    challengeType: 'count-in-twos',
    countInTwosConfig: {
      gameDuration
    }
  }
}

/**
 * Get suggested time estimate based on difficulty
 * The time estimate is for overall task completion including the game
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {number} Suggested time in minutes
 */
export const getSuggestedTimeEstimate = (difficulty) => {
  const baseTime = {
    easy: 10,     // 10 minutes for easy
    medium: 15,   // 15 minutes for medium
    hard: 20      // 20 minutes for hard
  }

  return baseTime[difficulty] || 10
}
