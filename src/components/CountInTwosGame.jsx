import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import './CountInTwosGame.css'

function CountInTwosGame({ difficulty = 'medium', gameDuration = 60, onComplete }) {
  const { t } = useTranslation()
  const [currentTarget, setCurrentTarget] = useState(2) // Start counting from 2
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [gameActive, setGameActive] = useState(true)
  const [isJumping, setIsJumping] = useState(false)
  const [boxes, setBoxes] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [explosionPos, setExplosionPos] = useState(null)
  const [sparklePos, setSparklePos] = useState(null)

  const gameAreaRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const nextBoxIdRef = useRef(0)
  const collectedNumbers = useRef([])
  const lastBatchIdRef = useRef(0)
  const [groundOffset, setGroundOffset] = useState(0) // Ground scrolling position
  const groundOffsetRef = useRef(0) // Ref for continuous updates
  const currentTargetRef = useRef(currentTarget) // Ref to always access latest target

  // Game speed based on difficulty
  const scrollSpeed = difficulty === 'easy' ? 2 : difficulty === 'hard' ? 4 : 3
  const jumpDuration = 500 // milliseconds

  // Runner position (fixed)
  const runnerX = 15 // Percentage from left
  const runnerY = 69 // Percentage from top (when not jumping) - runner is 80px tall, standing on ground
  const jumpHeight = 30 // How high the runner jumps (percentage)

  // Box positioning on ground (relative to ground, not game area)
  const boxYPosition = 0 // Boxes sit at y=0 relative to ground element

  // Update ref whenever currentTarget changes
  useEffect(() => {
    currentTargetRef.current = currentTarget
  }, [currentTarget])

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
          collectedNumbers: collectedNumbers.current,
          duration: durationSeconds,
          started_at: new Date(startTimeRef.current).toISOString(),
          completed_at: endTime,
          scoreBreakdown: {
            score,
            collected: collectedNumbers.current.length,
            total: score
          }
        })
      }, 1000)
    }
  }, [gameActive, timeLeft, score, onComplete])

  // Spawn boxes in batches of 3 at positions on the road
  useEffect(() => {
    if (!gameActive) return

    const spawnBatch = () => {
      const batchId = lastBatchIdRef.current
      const colors = ['#e67e22', '#3498db', '#e91e63', '#9b59b6', '#f39c12']

      // Always use the latest target value from ref
      const targetValue = currentTargetRef.current

      // Create array of 3 boxes
      const batch = []
      const correctPosition = Math.floor(Math.random() * 3) // Random position (0, 1, or 2) for correct number

      // Starting position on the "road" (in pixels)
      // Each batch has 3 boxes at 180px spacing = ~600px total width
      // So space batches 700px apart to give room between batches
      const startPosition = 800 + (lastBatchIdRef.current * 700)

      for (let i = 0; i < 3; i++) {
        const isCorrect = i === correctPosition
        let value

        if (isCorrect) {
          value = targetValue // This is the correct number in the sequence
        } else {
          // Generate wrong numbers (not in the counting sequence)
          // Avoid the current target and numbers too close to it
          const wrongNumbers = []
          for (let n = 1; n <= 30; n++) {
            if (n !== targetValue && n !== targetValue - 2 && n !== targetValue + 2) {
              wrongNumbers.push(n)
            }
          }
          value = wrongNumbers[Math.floor(Math.random() * wrongNumbers.length)]
        }

        const color = colors[Math.floor(Math.random() * colors.length)]

        const newBox = {
          id: nextBoxIdRef.current++,
          batchId,
          value,
          isCorrect,
          roadPosition: startPosition + (i * 180), // Position on road, spaced 180px apart
          y: boxYPosition, // Relative to ground element
          collected: false,
          exploded: false,
          jumpedOver: false,
          color
        }
        batch.push(newBox)
      }

      setBoxes((prev) => [...prev, ...batch])
      lastBatchIdRef.current++
    }

    // Spawn first 3 batches immediately to fill the screen
    spawnBatch()
    spawnBatch()
    spawnBatch()

    // Spawn new batches based on scroll speed
    // At scrollSpeed 3, boxes move ~180px/sec, batches are 700px apart, so spawn every ~4 seconds
    const spawnInterval = setInterval(spawnBatch, 4000)

    return () => clearInterval(spawnInterval)
  }, [gameActive]) // Removed currentTarget from dependencies - using ref instead

  // Animation loop - scroll the ground and check collisions
  useEffect(() => {
    if (!gameActive) return

    const animate = () => {
      // Update ground offset ref
      groundOffsetRef.current += scrollSpeed

      // Update state to trigger re-render
      setGroundOffset(groundOffsetRef.current)

      // Check collisions with boxes
      const gameAreaWidth = gameAreaRef.current?.offsetWidth || 900
      const runnerPixelX = (runnerX / 100) * gameAreaWidth

      setBoxes((prevBoxes) => {
        return prevBoxes.map((box) => {
          if (box.collected || box.exploded || box.jumpedOver) return box

          // Calculate box screen position based on its road position and current ground offset
          const boxScreenX = box.roadPosition - groundOffsetRef.current

          // Box dimensions in pixels
          const boxWidth = 70
          const boxHeight = 70
          const boxLeft = boxScreenX
          const boxRight = boxScreenX + boxWidth

          // Runner dimensions
          const runnerWidth = 40
          const runnerHeight = 80
          const runnerLeft = runnerPixelX
          const runnerRight = runnerPixelX + runnerWidth

          // Check horizontal overlap
          const horizontalOverlap = boxLeft < runnerRight && boxRight > runnerLeft

          if (horizontalOverlap && !box.collected && !box.exploded && !box.jumpedOver) {
            // For vertical collision, compare runner's feet position with box top
            // Runner feet are at ground level (y: 69% + runner height)
            // Box is at ground level
            // If jumping, runner feet are higher

            const runnerIsJumpingHighEnough = isJumping // Simplification: if jumping at all, clears box

            if (runnerIsJumpingHighEnough) {
              // Successfully jumped over the box
              if (box.isCorrect) {
                // Jumped over correct box - keep target same, respawn this number
                handleJumpedOverCorrect(box)
                return { ...box, jumpedOver: true }
              } else {
                // Successfully jumped over wrong box - good job!
                return { ...box, jumpedOver: true }
              }
            } else {
              // Runner is colliding with box at ground level
              if (box.isCorrect) {
                // Ran through correct box - collect it!
                handleCorrectCollection(box)
                return { ...box, collected: true }
              } else {
                // Hit wrong box - explosion!
                handleWrongCollision(box)
                return { ...box, exploded: true }
              }
            }
          }

          return box
        }).filter((box) => {
          const boxScreenX = box.roadPosition - groundOffsetRef.current
          // Keep jumped-over boxes so they continue moving past the runner
          return boxScreenX > -100 && !box.collected && !box.exploded
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameActive, isJumping, scrollSpeed, currentTarget])

  const handleCorrectCollection = (box) => {
    // Add to score
    setScore((prev) => prev + box.value)
    collectedNumbers.current.push(box.value)

    // Show sparkle effect
    const boxScreenX = box.roadPosition - groundOffset
    setSparklePos({ x: boxScreenX, y: 70 })
    setFeedback('correct')

    setTimeout(() => {
      setSparklePos(null)
      setFeedback(null)
    }, 800)

    // Ran through correct box - increment target by 2
    const newTarget = box.value + 2
    setCurrentTarget(newTarget)

    // Update all existing boxes with the correct flag to show the new target
    setBoxes((prevBoxes) =>
      prevBoxes.map((b) =>
        b.isCorrect && !b.collected && !b.exploded && !b.jumpedOver
          ? { ...b, value: newTarget }
          : b
      )
    )
  }

  const handleJumpedOverCorrect = (box) => {
    // Jumped over correct box - keep target same, no penalty
    // Target stays the same, so this number will appear again in the next batch
    // No score change, no feedback needed
  }

  const handleWrongCollision = (box) => {
    // Deduct points
    setScore((prev) => Math.max(0, prev - 5))

    // Show explosion effect
    const boxScreenX = box.roadPosition - groundOffset
    setExplosionPos({ x: boxScreenX, y: 70 })
    setFeedback('wrong')

    setTimeout(() => {
      setExplosionPos(null)
      setFeedback(null)
    }, 800)
  }

  // Jump handler
  const handleJump = () => {
    if (!gameActive || isJumping) return

    setIsJumping(true)
    setTimeout(() => {
      setIsJumping(false)
    }, jumpDuration)
  }

  // Keyboard controls
  useEffect(() => {
    if (!gameActive) return

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleJump()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameActive, isJumping])

  // Touch/click controls
  const handleScreenTap = () => {
    handleJump()
  }

  return (
    <div className="countintwos-game" onClick={handleScreenTap}>
      <div className="game-header">
        <div className="game-info">
          <span className="time-display">⏱️ {timeLeft}s</span>
          <span className="score-display">⭐ {t('countInTwosGame.score')}: {score}</span>
        </div>
        <div className="target-display">
          {t('countInTwosGame.collectNext')}: <strong>{currentTarget}</strong>
        </div>
      </div>

      <div ref={gameAreaRef} className="game-area">
        {/* Solid ground */}
        <div className="ground"></div>

        {/* Number boxes - positioned on scrolling road */}
        {boxes.map((box) => {
          const boxScreenX = box.roadPosition - groundOffset
          return (
            <div
              key={box.id}
              className={`number-box ${box.collected ? 'collected' : ''} ${box.exploded ? 'exploded' : ''} ${box.jumpedOver ? 'jumped-over' : ''}`}
              style={{
                left: `${boxScreenX}px`,
                bottom: '15%', // Sit on ground
                background: box.color
              }}
            >
              {box.value}
            </div>
          )
        })}

        {/* Sparkle effect */}
        {sparklePos && (
          <div
            className="sparkle-effect"
            style={{
              left: `${sparklePos.x}px`,
              top: `${sparklePos.y}%`
            }}
          >
            ✨✨✨
          </div>
        )}

        {/* Explosion effect */}
        {explosionPos && (
          <div
            className="explosion-effect"
            style={{
              left: `${explosionPos.x}px`,
              top: `${explosionPos.y}%`
            }}
          >
            💥
          </div>
        )}

        {/* Runner */}
        <div
          className={`runner ${isJumping ? 'jumping' : ''}`}
          style={{
            left: `${runnerX}%`,
            top: `${isJumping ? runnerY - jumpHeight : runnerY}%`
          }}
        >
          <div className="runner-body">
            <div className="runner-head"></div>
            <div className="runner-torso"></div>
            <div className="runner-legs"></div>
          </div>
          <div className="current-target-bubble">{currentTarget}</div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback === 'correct' && (
        <div className="feedback-message correct-message">
          {t('countInTwosGame.correct')}
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="feedback-message wrong-message">
          {t('countInTwosGame.wrong')}
        </div>
      )}

      {!gameActive && (
        <div className="game-over">
          <h2>{t('countInTwosGame.gameOver')}</h2>
          <p>{t('countInTwosGame.finalScore')}: {score}</p>
          <p>{t('countInTwosGame.numbersCollected')}: {collectedNumbers.current.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

export default CountInTwosGame
