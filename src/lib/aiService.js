// AI Service for generating math challenges
// For workshop demo, we'll use a simple local generator
// You can integrate Claude API later with your Anthropic API key

const mathTopics = {
  easy: [
    { name: 'Addition', desc: 'Simple addition problems' },
    { name: 'Subtraction', desc: 'Basic subtraction' },
    { name: 'Counting', desc: 'Number counting exercises' },
  ],
  medium: [
    { name: 'Multiplication', desc: 'Times tables practice' },
    { name: 'Division', desc: 'Division problems' },
    { name: 'Fractions', desc: 'Basic fraction work' },
  ],
  hard: [
    { name: 'Word Problems', desc: 'Real-world math scenarios' },
    { name: 'Algebra', desc: 'Solve for x' },
    { name: 'Geometry', desc: 'Area and perimeter' },
  ]
}

const generateLocalMathChallenge = (difficulty = 'medium') => {
  const topics = mathTopics[difficulty]
  const topic = topics[Math.floor(Math.random() * topics.length)]

  const templates = {
    easy: [
      `Complete 20 ${topic.name.toLowerCase()} problems`,
      `Practice ${topic.name.toLowerCase()} for 15 minutes`,
      `Master ${topic.name.toLowerCase()} basics`,
    ],
    medium: [
      `Complete ${topic.name.toLowerCase()} worksheet`,
      `Solve 15 ${topic.name.toLowerCase()} problems`,
      `Practice ${topic.name.toLowerCase()} up to level 5`,
    ],
    hard: [
      `Solve 10 challenging ${topic.name.toLowerCase()}`,
      `Master advanced ${topic.name.toLowerCase()}`,
      `Complete ${topic.name.toLowerCase()} challenge set`,
    ]
  }

  const descTemplates = templates[difficulty]
  const description = descTemplates[Math.floor(Math.random() * descTemplates.length)]

  return {
    title: `Math Mission: ${topic.name}`,
    description: description,
    subject: 'math',
    difficulty: difficulty,
    timeEstimate: difficulty === 'easy' ? 15 : difficulty === 'hard' ? 45 : 30,
    nagLevel: 'normal'
  }
}

// For future integration with Claude API
const generateAIMathChallenge = async (difficulty = 'medium', age = 10) => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    // Fallback to local generation
    return generateLocalMathChallenge(difficulty)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Generate a math challenge for a ${age}-year-old child at ${difficulty} difficulty level.

          Return ONLY a JSON object with these fields:
          - title: A fun, engaging title for the challenge
          - description: Clear instructions (2-3 sentences)
          - timeEstimate: Estimated minutes to complete (number)

          Make it ski/mountain themed if possible for extra fun!`
        }]
      })
    })

    const data = await response.json()
    const content = data.content[0].text

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const aiChallenge = JSON.parse(jsonMatch[0])
      return {
        ...aiChallenge,
        subject: 'math',
        difficulty: difficulty,
        nagLevel: 'normal'
      }
    }
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
  }

  // Fallback to local generation
  return generateLocalMathChallenge(difficulty)
}

export { generateAIMathChallenge, generateLocalMathChallenge }
