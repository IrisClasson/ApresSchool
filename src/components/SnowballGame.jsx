import { useState, useEffect, useRef } from 'react'
import './SnowballGame.css'

function SnowballGame({ targetNumber = 10, onComplete, isPaused = false }) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playerPosition, setPlayerPosition] = useState(50) // Horizontal position only (0-100%)
  const [approachingSnowballs, setApproachingSnowballs] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [collectedPairs, setCollectedPairs] = useState([])
  const [scrollOffset, setScrollOffset] = useState(0)
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

  // Generate snowballs that approach from distance
  const generateApproachingSnowball = () => {
    const isCorrect = Math.random() > 0.3
    let number

    if (isCorrect) {
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
      do {
        number = Math.floor(Math.random() * (targetNumber + 5))
      } while (numberBonds.some(bond => bond.num2 === number))
    }

    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // Lane position (10-90%)
      distance: 100, // Start far away (100 = far, 0 = player position)
      number,
      isCorrect: numberBonds.some(bond => bond.num2 === number),
      speed: 0.8 + Math.random() * 0.7
    }
  }

  // Spawn snowballs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !gameWon) {
        setApproachingSnowballs(prev => [...prev, generateApproachingSnowball()])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [gameOver, gameWon, collectedPairs])

  // Animate scrolling background and approaching snowballs
  useEffect(() => {
    const animate = () => {
      if (gameOver || gameWon) return

      // Scroll background
      setScrollOffset(prev => (prev + 2) % 1000)

      // Move snowballs closer
      setApproachingSnowballs(prev => {
        return prev
          .map(snowball => ({
            ...snowball,
            distance: snowball.distance - snowball.speed
          }))
          .filter(snowball => {
            // Remove if passed player or too far
            if (snowball.distance < -10) {
              // Missed a correct snowball
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

    // Don't start animation if game is paused
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameOver, gameWon, collectedPairs, isPaused])

  // Check collisions with player
  useEffect(() => {
    approachingSnowballs.forEach(snowball => {
      // Collision when snowball reaches player distance (around 0-5)
      if (snowball.distance >= 0 && snowball.distance <= 8) {
        // Check if horizontally aligned (within range)
        const horizontalDiff = Math.abs(snowball.x - playerPosition)

        if (horizontalDiff < 12) { // Collision range
          if (snowball.isCorrect && !collectedPairs.includes(snowball.number)) {
            // Correct collision!
            setScore(s => s + 10)
            setCollectedPairs(prev => [...prev, snowball.number])
            setApproachingSnowballs(prev => prev.filter(s => s.id !== snowball.id))
          } else if (!snowball.isCorrect) {
            // Wrong collision!
            setLives(l => Math.max(0, l - 1))
            setApproachingSnowballs(prev => prev.filter(s => s.id !== snowball.id))
          }
        }
      }
    })
  }, [approachingSnowballs, playerPosition, collectedPairs])

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

  // Handle movement controls
  const handleMove = (clientX) => {
    if (gameAreaRef.current && !gameOver && !gameWon) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      setPlayerPosition(Math.max(10, Math.min(90, x)))
    }
  }

  const handleMouseMove = (e) => handleMove(e.clientX)
  const handleTouchMove = (e) => {
    e.preventDefault()
    handleMove(e.touches[0].clientX)
  }

  const restartGame = () => {
    setScore(0)
    setLives(3)
    setCollectedPairs([])
    setApproachingSnowballs([])
    setGameOver(false)
    setGameWon(false)
    setPlayerPosition(50)
    setScrollOffset(0)
  }

  // Calculate snowball size and opacity based on distance
  const getSnowballStyle = (snowball) => {
    // Distance: 100 = far (small), 0 = close (large)
    const scale = 0.3 + (100 - snowball.distance) / 100 * 0.7 // 0.3 to 1.0
    const opacity = 0.5 + (100 - snowball.distance) / 100 * 0.5 // 0.5 to 1.0

    return {
      scale,
      opacity: Math.min(1, opacity),
      size: 40 + (100 - snowball.distance) * 0.6 // 40px to 100px
    }
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
        onTouchStart={handleTouchMove}
      >
        {/* Scrolling Background - Trees and Slopes */}
        <div className="scrolling-landscape" style={{ transform: `translateY(${scrollOffset % 200}px)` }}>
          <div className="ski-slope left-slope"></div>
          <div className="ski-slope right-slope"></div>
          <div className="trees-container left-trees">
            {[...Array(10)].map((_, i) => (
              <div key={`tree-left-${i}`} className="tree" style={{ top: `${i * 150}px` }} />
            ))}
          </div>
          <div className="trees-container right-trees">
            {[...Array(10)].map((_, i) => (
              <div key={`tree-right-${i}`} className="tree" style={{ top: `${i * 150 + 75}px` }} />
            ))}
          </div>
        </div>

        {/* Approaching Snowballs */}
        {approachingSnowballs.map(snowball => {
          const style = getSnowballStyle(snowball)
          // Position snowballs in perspective
          const yPos = 20 + (100 - snowball.distance) * 0.65 // Top to bottom

          return (
            <div
              key={snowball.id}
              className={`approaching-snowball ${snowball.isCorrect ? 'correct' : 'incorrect'}`}
              style={{
                left: `${snowball.x}%`,
                top: `${yPos}%`,
                transform: `translate(-50%, -50%) scale(${style.scale})`,
                opacity: style.opacity,
                width: `${style.size}px`,
                height: `${style.size}px`,
              }}
            >
              <span className="snowball-number">{snowball.number}</span>
            </div>
          )
        })}

        {/* Player Snowball - Static in Center Bottom */}
        <div
          className="player-snowball-static"
          style={{
            left: `${playerPosition}%`,
          }}
        >
          <div className="snowball-inner">
            <span className="player-number">{targetNumber}</span>
          </div>
          <div className="snowball-shadow"></div>
        </div>

        {/* Instructions */}
        {approachingSnowballs.length < 2 && !gameOver && !gameWon && (
          <div className="game-instructions">
            <p>🎿 Move to catch the right snowballs!</p>
            <p>Collect pairs that make {targetNumber}</p>
          </div>
        )}

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
