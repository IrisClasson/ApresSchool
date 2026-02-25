import { useState, useEffect, useRef } from 'react'
import './SnowballGame.css'

function SnowballGame({ targetNumber = 10, onComplete }) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playerSnowball, setPlayerSnowball] = useState({ x: 50, y: 85 }) // Centered at bottom
  const [fallingSnowballs, setFallingSnowballs] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [collectedPairs, setCollectedPairs] = useState([])
  const gameAreaRef = useRef(null)
  const animationRef = useRef(null)

  // Generate all possible number bonds for target number
  const generateNumberBonds = () => {
    const bonds = []
    for (let i = 0; i <= targetNumber; i++) {
      bonds.push({ num1: i, num2: targetNumber - i })
    }
    return bonds
  }

  const numberBonds = generateNumberBonds()
  const totalPairsNeeded = numberBonds.length

  // Generate random snowballs (correct and incorrect)
  const generateSnowball = () => {
    const isCorrect = Math.random() > 0.3 // 70% chance of correct snowball
    let number

    if (isCorrect) {
      // Pick a number that makes a valid bond
      const availableBonds = numberBonds.filter(
        bond => !collectedPairs.some(p => p === bond.num2)
      )
      if (availableBonds.length > 0) {
        const randomBond = availableBonds[Math.floor(Math.random() * availableBonds.length)]
        number = randomBond.num2
      } else {
        number = Math.floor(Math.random() * (targetNumber + 5))
      }
    } else {
      // Incorrect number
      do {
        number = Math.floor(Math.random() * (targetNumber + 5))
      } while (numberBonds.some(bond => bond.num2 === number))
    }

    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 90 + 5, // Random x position (5-95%)
      y: -10, // Start above screen
      number,
      isCorrect: numberBonds.some(bond => bond.num2 === number),
      speed: 1 + Math.random() * 1.5, // Variable speed
      size: 40 + Math.random() * 20 // Variable size
    }
  }

  // Initialize snowballs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !gameWon) {
        setFallingSnowballs(prev => [...prev, generateSnowball()])
      }
    }, 1500) // New snowball every 1.5 seconds

    return () => clearInterval(interval)
  }, [gameOver, gameWon, collectedPairs])

  // Game loop - move snowballs down
  useEffect(() => {
    const animate = () => {
      if (gameOver || gameWon) return

      setFallingSnowballs(prev => {
        return prev
          .map(snowball => ({
            ...snowball,
            y: snowball.y + snowball.speed
          }))
          .filter(snowball => {
            // Remove if off screen
            if (snowball.y > 110) {
              // Missed a correct snowball - lose a life
              if (snowball.isCorrect && !collectedPairs.includes(snowball.number)) {
                setLives(l => Math.max(0, l - 1))
              }
              return false
            }
            return true
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
  }, [gameOver, gameWon, collectedPairs])

  // Check collisions
  useEffect(() => {
    fallingSnowballs.forEach(snowball => {
      const distance = Math.sqrt(
        Math.pow(snowball.x - playerSnowball.x, 2) +
        Math.pow(snowball.y - playerSnowball.y, 2)
      )

      // Collision detected
      if (distance < 8) {
        if (snowball.isCorrect && !collectedPairs.includes(snowball.number)) {
          // Correct collision!
          setScore(s => s + 10)
          setCollectedPairs(prev => [...prev, snowball.number])

          // Remove the snowball
          setFallingSnowballs(prev => prev.filter(s => s.id !== snowball.id))
        } else if (!snowball.isCorrect) {
          // Wrong collision!
          setLives(l => Math.max(0, l - 1))
          setFallingSnowballs(prev => prev.filter(s => s.id !== snowball.id))
        }
      }
    })
  }, [fallingSnowballs, playerSnowball, collectedPairs])

  // Check win/lose conditions
  useEffect(() => {
    if (collectedPairs.length === totalPairsNeeded) {
      setGameWon(true)
      if (onComplete) {
        setTimeout(() => {
          onComplete({ score, collectedPairs: collectedPairs.length, targetNumber })
        }, 2000)
      }
    }
    if (lives <= 0) {
      setGameOver(true)
    }
  }, [collectedPairs, lives, totalPairsNeeded])

  // Handle mouse/touch movement
  const handleMove = (clientX) => {
    if (gameAreaRef.current && !gameOver && !gameWon) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      setPlayerSnowball(prev => ({ ...prev, x: Math.max(5, Math.min(95, x)) }))
    }
  }

  const handleMouseMove = (e) => handleMove(e.clientX)
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX)

  const restartGame = () => {
    setScore(0)
    setLives(3)
    setCollectedPairs([])
    setFallingSnowballs([])
    setGameOver(false)
    setGameWon(false)
  }

  return (
    <div className="snowball-game-container">
      <div className="game-header">
        <div className="game-info">
          <div className="target-display">
            <span className="target-label">Target:</span>
            <span className="target-number">{targetNumber}</span>
          </div>
          <div className="score-display">
            <span className="score-icon">⭐</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="lives-display">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`heart ${i < lives ? 'active' : 'lost'}`}>
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="progress-display">
            <span className="progress-label">Collected:</span>
            <span className="progress-value">{collectedPairs.length}/{totalPairsNeeded}</span>
          </div>
        </div>
      </div>

      <div
        ref={gameAreaRef}
        className="game-area"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Mountain/Slope Background */}
        <div className="mountain-background">
          <div className="mountain-slope"></div>
          <div className="trees"></div>
        </div>

        {/* Player Snowball */}
        <div
          className="player-snowball"
          style={{
            left: `${playerSnowball.x}%`,
            top: `${playerSnowball.y}%`,
          }}
        >
          <div className="snowball-inner">
            <span className="player-number">{targetNumber}</span>
          </div>
          <div className="snowball-trail"></div>
        </div>

        {/* Falling Snowballs */}
        {fallingSnowballs.map(snowball => (
          <div
            key={snowball.id}
            className={`falling-snowball ${snowball.isCorrect ? 'correct' : 'incorrect'}`}
            style={{
              left: `${snowball.x}%`,
              top: `${snowball.y}%`,
              width: `${snowball.size}px`,
              height: `${snowball.size}px`,
            }}
          >
            <span className="snowball-number">{snowball.number}</span>
          </div>
        ))}

        {/* Game Over Overlay */}
        {(gameOver || gameWon) && (
          <div className="game-overlay">
            <div className="game-result">
              {gameWon ? (
                <>
                  <div className="result-icon win">🏆</div>
                  <h2 className="result-title">Amazing!</h2>
                  <p className="result-message">
                    You collected all number bonds for {targetNumber}!
                  </p>
                  <div className="result-stats">
                    <div className="stat">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{score}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Pairs</span>
                      <span className="stat-value">{collectedPairs.length}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="result-icon lose">💔</div>
                  <h2 className="result-title">Game Over</h2>
                  <p className="result-message">
                    You collected {collectedPairs.length}/{totalPairsNeeded} pairs
                  </p>
                  <button className="btn btn-primary" onClick={restartGame}>
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {fallingSnowballs.length < 3 && !gameOver && !gameWon && (
          <div className="game-instructions">
            <p>🎿 Move your mouse to control the snowball!</p>
            <p>Collect snowballs that make {targetNumber} when added</p>
            <p>Avoid wrong numbers!</p>
          </div>
        )}
      </div>

      {/* Collected Pairs Display */}
      <div className="collected-pairs">
        <h3>Collected Number Bonds:</h3>
        <div className="pairs-grid">
          {numberBonds.map((bond, idx) => (
            <div
              key={idx}
              className={`pair-item ${collectedPairs.includes(bond.num2) ? 'collected' : 'missing'}`}
            >
              <span className="pair-equation">
                {bond.num1} + {bond.num2} = {targetNumber}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SnowballGame
