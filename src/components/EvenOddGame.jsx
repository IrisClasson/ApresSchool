import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import './EvenOddGame.css'

function EvenOddGame({ targetType = 'even', gameDuration = 60, numberRange = 20, difficulty = 'medium', onComplete }) {
  const { t } = useTranslation()
  const [calculatorX, setCalculatorX] = useState(50) // Percentage position
  const [fallingNumbers, setFallingNumbers] = useState([])
  const [runningSum, setRunningSum] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [gameActive, setGameActive] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [showRedFlash, setShowRedFlash] = useState(false)
  const [sparklePos, setSparklePos] = useState(null)

  const gameAreaRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const nextNumberIdRef = useRef(0)

  // Fall speed based on difficulty
  const fallSpeed = difficulty === 'easy' ? 0.5 : difficulty === 'hard' ? 1.5 : 1

  // Timer countdown
  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive])

  // Game over - call onComplete
  useEffect(() => {
    if (!gameActive && timeLeft === 0) {
      const endTime = new Date().toISOString()
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)

      setTimeout(() => {
        onComplete({
          score,
          runningSum,
          duration: durationSeconds,
          started_at: new Date(startTimeRef.current).toISOString(),
          completed_at: endTime,
          scoreBreakdown: {
            score,
            sum: runningSum,
            total: score
          }
        })
      }, 1000)
    }
  }, [gameActive, timeLeft, score, runningSum, onComplete])

  // Spawn falling numbers
  useEffect(() => {
    if (!gameActive) return

    const spawnInterval = setInterval(() => {
      const newNumber = {
        id: nextNumberIdRef.current++,
        value: Math.floor(Math.random() * numberRange) + 1,
        x: Math.random() * 80 + 10, // 10-90% to keep on screen
        y: -10
      }
      setFallingNumbers((prev) => [...prev, newNumber])
    }, 1500) // Spawn new number every 1.5 seconds

    return () => clearInterval(spawnInterval)
  }, [gameActive, numberRange])

  // Animation loop
  useEffect(() => {
    if (!gameActive) return

    const animate = () => {
      setFallingNumbers((prevNumbers) => {
        const updatedNumbers = prevNumbers.map((num) => ({
          ...num,
          y: num.y + fallSpeed // Fall speed based on difficulty
        }))

        // Check collisions
        const calculatorWidth = 15 // Percentage
        const calculatorY = 85 // Percentage from top

        updatedNumbers.forEach((num) => {
          if (
            num.y >= calculatorY &&
            num.y <= calculatorY + 10 &&
            num.x >= calculatorX - calculatorWidth / 2 &&
            num.x <= calculatorX + calculatorWidth / 2 &&
            !num.collected
          ) {
            handleCollision(num)
            num.collected = true
          }
        })

        // Remove numbers that fell off screen or were collected
        return updatedNumbers.filter((num) => num.y < 100 && !num.collected)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameActive, calculatorX, fallSpeed])

  const handleCollision = (number) => {
    const isCorrect = (targetType === 'even' && number.value % 2 === 0) ||
                      (targetType === 'odd' && number.value % 2 !== 0)

    // Always add to running sum
    setRunningSum((prev) => prev + number.value)

    if (isCorrect) {
      // Correct collection
      setScore((prev) => prev + 10)
      setFeedback('yes')
      setSparklePos({ x: calculatorX, y: 85 })
      setTimeout(() => {
        setFeedback(null)
        setSparklePos(null)
      }, 800)
    } else {
      // Wrong collection
      setScore((prev) => Math.max(0, prev - 5))
      setFeedback('no')
      setShowRedFlash(true)
      setTimeout(() => {
        setFeedback(null)
        setShowRedFlash(false)
      }, 800)
    }
  }

  // Mouse movement
  const handleMouseMove = (e) => {
    if (!gameActive || !gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setCalculatorX(Math.max(10, Math.min(90, x)))
  }

  // Touch movement
  const handleTouchMove = (e) => {
    if (!gameActive || !gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    setCalculatorX(Math.max(10, Math.min(90, x)))
  }

  // Keyboard movement
  useEffect(() => {
    if (!gameActive) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault() // Prevent page scrolling

        if (e.key === 'ArrowLeft') {
          setCalculatorX((prev) => Math.max(10, prev - 15))
        } else if (e.key === 'ArrowRight') {
          setCalculatorX((prev) => Math.min(90, prev + 15))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameActive])

  return (
    <div className={`evenodd-game ${showRedFlash ? 'red-flash' : ''}`}>
      <div className="game-header">
        <div className="game-info">
          <span className="time-display">⏱️ {timeLeft}s</span>
          <span className="score-display">⭐ {t('evenOddGame.score')}: {score}</span>
        </div>
        <div className="target-display">
          {t('evenOddGame.collect')} <strong>{targetType === 'even' ? t('evenOddGame.even') : t('evenOddGame.odd')}</strong> {t('evenOddGame.numbers')}
        </div>
      </div>

      <div
        ref={gameAreaRef}
        className="game-area"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Falling Numbers */}
        {fallingNumbers.map((num) => (
          <div
            key={num.id}
            className="falling-number"
            style={{
              left: `${num.x}%`,
              top: `${num.y}%`
            }}
          >
            {num.value}
          </div>
        ))}

        {/* Sparkle Effect */}
        {sparklePos && (
          <div
            className="sparkle-effect"
            style={{
              left: `${sparklePos.x}%`,
              top: `${sparklePos.y}%`
            }}
          >
            ✨✨✨
          </div>
        )}

        {/* Calculator */}
        <div
          className="calculator"
          style={{ left: `${calculatorX}%` }}
        >
          <div className="calculator-display">{runningSum}</div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback === 'yes' && (
        <div className="feedback-message yes-message">
          {t('evenOddGame.yes')}
        </div>
      )}
      {feedback === 'no' && (
        <div className="feedback-message no-message">
          {t('evenOddGame.no')}
        </div>
      )}

      {!gameActive && (
        <div className="game-over">
          <h2>{t('evenOddGame.gameOver')}</h2>
          <p>{t('evenOddGame.finalScore')}: {score}</p>
          <p>{t('evenOddGame.totalSum')}: {runningSum}</p>
        </div>
      )}
    </div>
  )
}

export default EvenOddGame
