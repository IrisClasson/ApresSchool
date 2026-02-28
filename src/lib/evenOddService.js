// Even/Odd Number Collection Game Challenge Generator

/**
 * Generates a complete even/odd number collection challenge
 * @param {Object} config - Challenge configuration
 * @param {string} config.targetType - 'even' or 'odd'
 * @param {number} config.numberRange - Maximum number value (10, 20, 50, 100)
 * @param {number} config.gameDuration - Game time in seconds (30, 60, 90, 120)
 * @param {string} config.difficulty - Challenge difficulty ('easy', 'medium', 'hard')
 * @returns {Object} Challenge object
 */
export const generateEvenOddChallenge = (config) => {
  const {
    targetType = 'even',
    numberRange = 20,
    gameDuration = 60,
    difficulty = 'easy'
  } = config

  const targetTypeLabel = targetType === 'even' ? 'Even' : 'Odd'
  const title = `Collect ${targetTypeLabel} Numbers`
  const description = `Use the calculator to collect ${targetType} numbers! Wrong numbers cause explosions. Time: ${gameDuration}s, Range: 1-${numberRange}.`

  return {
    title,
    description,
    subject: 'math',
    difficulty,
    challengeType: 'even-odd',
    evenOddConfig: {
      targetType,
      numberRange,
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
