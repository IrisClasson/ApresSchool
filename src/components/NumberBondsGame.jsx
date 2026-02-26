import { useState, useEffect } from 'react'
import './NumberBondsGame.css'

function NumberBondsGame({ targetNumber, totalProblems = 10, onComplete }) {
  const [currentProblem, setCurrentProblem] = useState(0)
  const [score, setScore] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [problems, setProblems] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [startTime, setStartTime] = useState(null)

  // Generate all problems at start and record start time
  useEffect(() => {
    const generatedProblems = generateProblems(targetNumber, totalProblems)
    setProblems(generatedProblems)
    setStartTime(new Date().toISOString())
  }, [targetNumber, totalProblems])

  // Generate problems with multiple choice options
  const generateProblems = (target, count) => {
    const allProblems = []

    for (let i = 0; i < count; i++) {
      // Generate a random number bond
      const firstNumber = Math.floor(Math.random() * (target + 1))
      const correctAnswer = target - firstNumber

      // Generate wrong answer options
      const wrongAnswers = []
      while (wrongAnswers.length < 3) {
        const wrongNum = Math.floor(Math.random() * (target + 5))
        if (wrongNum !== correctAnswer && !wrongAnswers.includes(wrongNum)) {
          wrongAnswers.push(wrongNum)
        }
      }

      // Combine and shuffle options
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)

      allProblems.push({
        firstNumber,
        correctAnswer,
        options
      })
    }

    return allProblems
  }

  const handleAnswerSelect = (answer) => {
    if (feedback) return // Prevent clicking during feedback

    setSelectedAnswer(answer)
    const problem = problems[currentProblem]
    const isCorrect = answer === problem.correctAnswer

    if (isCorrect) {
      setScore(score + 1)
      setFeedback({ type: 'correct', message: '✓ Correct!' })
    } else {
      setWrongCount(wrongCount + 1)
      setFeedback({ type: 'wrong', message: `✗ Wrong! The answer is ${problem.correctAnswer}` })
    }

    // Move to next problem after delay
    setTimeout(() => {
      if (currentProblem + 1 < totalProblems) {
        setCurrentProblem(currentProblem + 1)
        setFeedback(null)
        setSelectedAnswer(null)
      } else {
        // Game complete - calculate final metrics
        const endTime = new Date().toISOString()
        const durationMs = new Date(endTime) - new Date(startTime)
        const durationSeconds = Math.round(durationMs / 1000)

        const finalScore = isCorrect ? score + 1 : score
        const finalWrong = isCorrect ? wrongCount : wrongCount + 1

        onComplete({
          score: finalScore,
          total: totalProblems,
          percentage: Math.round((finalScore / totalProblems) * 100),
          scoreBreakdown: {
            correct: finalScore,
            wrong: finalWrong,
            total: totalProblems
          },
          started_at: startTime,
          completed_at: endTime,
          duration: durationSeconds
        })
      }
    }, 1500)
  }

  if (problems.length === 0) {
    return <div className="number-bonds-game loading">Loading game...</div>
  }

  const problem = problems[currentProblem]

  return (
    <div className="number-bonds-game">
      {/* Progress Bar */}
      <div className="game-progress">
        <div className="progress-text">
          Question {currentProblem + 1} of {totalProblems} | Score: {score}/{totalProblems}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentProblem + 1) / totalProblems) * 100}%` }}
          />
        </div>
      </div>

      {/* Number Bond Boxes */}
      <div className="number-bond-boxes">
        <div className="bond-box">{problem.firstNumber}</div>
        <div className={`bond-box mystery ${feedback?.type === 'correct' ? 'sparkle' : ''}`}>
          {feedback?.type === 'correct' ? selectedAnswer : '?'}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Multiple Choice Options */}
      <div className="answer-options">
        {problem.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${
              selectedAnswer === option
                ? option === problem.correctAnswer
                  ? 'correct'
                  : 'wrong'
                : ''
            }`}
            onClick={() => handleAnswerSelect(option)}
            disabled={feedback !== null}
          >
            {option}
          </button>
        ))}
      </div>

    </div>
  )
}

export default NumberBondsGame
