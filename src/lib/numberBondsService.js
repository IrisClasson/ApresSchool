// Number Bonds Challenge Generator
// Template-based generation for number bonds problems

/**
 * Generates all unique number bond pairs for a target number
 * @param {number} targetNumber - The target sum (e.g., 10)
 * @returns {Array} Array of [num1, num2] pairs
 */
const generateNumberBondPairs = (targetNumber) => {
  const pairs = []
  // Generate pairs from 0 to targetNumber/2 to avoid duplicates
  for (let i = 0; i <= Math.floor(targetNumber / 2); i++) {
    pairs.push([i, targetNumber - i])
  }
  return pairs
}

/**
 * Shuffles an array randomly
 */
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Formats number bonds problems based on visual style
 * @param {Array} pairs - Array of number bond pairs
 * @param {string} visualStyle - Format: 'equation', 'fill-in', 'circles'
 * @param {number} targetNumber - The target sum
 * @returns {Array} Formatted problems
 */
const formatProblems = (pairs, visualStyle, targetNumber) => {
  switch (visualStyle) {
    case 'equation':
      return pairs.map(([a, b]) => ({
        type: 'equation',
        display: `${a} + ${b} = ${targetNumber}`,
        problem: `${a} + ${b}`,
        answer: targetNumber,
        parts: [a, b]
      }))

    case 'fill-in':
      return pairs.map(([a, b]) => {
        // Randomly hide either the first or second number
        const hideFirst = Math.random() > 0.5
        return {
          type: 'fill-in',
          display: hideFirst ? `__ + ${b} = ${targetNumber}` : `${a} + __ = ${targetNumber}`,
          problem: hideFirst ? `__ + ${b}` : `${a} + __`,
          answer: hideFirst ? a : b,
          parts: [a, b],
          missing: hideFirst ? 'first' : 'second'
        }
      })

    case 'circles':
      return pairs.map(([a, b]) => ({
        type: 'circles',
        display: `${targetNumber} = ${a} + ${b}`,
        problem: `Break ${targetNumber} into two parts`,
        answer: `${a} and ${b}`,
        parts: [a, b],
        visual: {
          total: targetNumber,
          part1: a,
          part2: b
        }
      }))

    default:
      return formatProblems(pairs, 'equation', targetNumber)
  }
}

/**
 * Generates a complete number bonds challenge
 * @param {Object} config - Challenge configuration
 * @param {number} config.targetNumber - Target sum (5, 10, 15, 20, 25)
 * @param {number} config.problemCount - Number of problems (10-50)
 * @param {string} config.visualStyle - Display format
 * @param {string} config.difficulty - Challenge difficulty
 * @returns {Object} Challenge object
 */
export const generateNumberBondsChallenge = (config) => {
  const {
    targetNumber = 10,
    problemCount = 20,
    visualStyle = 'equation',
    difficulty = 'easy'
  } = config

  // Generate all possible pairs
  const allPairs = generateNumberBondPairs(targetNumber)

  // Shuffle and select the requested number of problems
  // If more problems requested than unique pairs, repeat with shuffling
  let selectedPairs = []
  while (selectedPairs.length < problemCount) {
    const shuffled = shuffleArray(allPairs)
    selectedPairs = [...selectedPairs, ...shuffled]
  }
  selectedPairs = selectedPairs.slice(0, problemCount)

  // Format problems according to visual style
  const problems = formatProblems(selectedPairs, visualStyle, targetNumber)

  // Generate challenge details
  const visualStyleNames = {
    'equation': 'Equation Format',
    'fill-in': 'Fill-in-the-Blanks',
    'circles': 'Visual Circles'
  }

  const title = `Number Bonds to ${targetNumber}`
  const description = `Complete ${problemCount} number bonds problems for target ${targetNumber}. Format: ${visualStyleNames[visualStyle]}.`

  return {
    title,
    description,
    subject: 'math',
    difficulty,
    challengeType: 'number-bonds',
    numberBondsConfig: {
      targetNumber,
      visualStyle,
      problemCount,
      problems
    }
  }
}

/**
 * Get suggested time estimate based on problem count and difficulty
 */
export const getSuggestedTimeEstimate = (problemCount, difficulty) => {
  const baseTimePerProblem = {
    easy: 0.5,    // 30 seconds per problem
    medium: 1,    // 1 minute per problem
    hard: 1.5     // 1.5 minutes per problem
  }

  const timeInMinutes = Math.ceil(problemCount * baseTimePerProblem[difficulty])
  return Math.max(5, Math.min(120, timeInMinutes)) // Clamp between 5 and 120 minutes
}
