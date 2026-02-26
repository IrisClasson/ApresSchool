import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../lib/authService'
import { localDB } from '../lib/supabase'
import './CreativeBreak.css'

function CreativeBreak() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#3D4A34')
  const [brushSize, setBrushSize] = useState(5)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  const colors = [
    '#3D4A34', // Deep burgundy (dark olive)
    '#A8B896', // Sage green
    '#7A8B6F', // Tangerine (muted olive)
    '#D4A574', // Amber (muted gold)
    '#C17A6F', // Terracotta
    '#6B5D4F', // Chocolate (brown)
    '#E8DCC4', // Warm beige
    '#000000', // Black
    '#FFFFFF', // White
  ]

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.closePath()
      setIsDrawing(false)
    }
  }

  // Touch events for mobile - using useCallback to maintain stable references
  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    if (!isDrawing) return

    const touch = e.touches[0]
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing, color, brushSize])

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault()
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.closePath()
      setIsDrawing(false)
    }
  }, [isDrawing])

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)

      // Store parent/kid info for later use when sending
      if (user?.role === 'kid') {
        // Get parent info
        const parentResult = await authService.getMyParent()
        if (parentResult.success && parentResult.parent) {
          localStorage.setItem('tempParentId', parentResult.parent.id)
        }
      } else if (user?.role === 'parent') {
        // Get first kid
        const kidsResult = await authService.getMyKids()
        if (kidsResult.success && kidsResult.kids.length > 0) {
          localStorage.setItem('tempKidId', kidsResult.kids[0].id)
        }
      }
    }
    loadUser()

    // Initialize canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  // Separate useEffect for touch event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      // Add touch event listeners with passive: false to allow preventDefault
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

      // Cleanup event listeners
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveToDevice = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `creative-break-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const sendDrawing = async () => {
    const canvas = canvasRef.current
    const imageData = canvas.toDataURL()

    const isKid = currentUser?.role === 'kid'
    const recipientRole = isKid ? 'parent' : 'kid'

    // Get the correct recipient ID
    let recipientId = null
    if (isKid) {
      // Kid sending to parent - get parent ID
      recipientId = localStorage.getItem('tempParentId')
      if (!recipientId) {
        alert('No parent linked. Please link to a parent first.')
        return
      }
    } else {
      // Parent sending to kid - get first kid ID
      recipientId = localStorage.getItem('tempKidId')
      if (!recipientId) {
        alert('No kids linked. Please add a kid first.')
        return
      }
    }

    // Save the drawing as a message in the database
    const message = {
      sender_id: currentUser?.id,
      sender_role: currentUser?.role,
      recipient_id: recipientId,
      recipient_role: recipientRole,
      content: '🎨 Sent you a drawing!',
      message_type: 'drawing',
      image_data: imageData
    }

    const result = await localDB.addMessage(message)

    if (result) {
      alert(`Drawing sent to ${recipientRole}! 🎨`)
      navigate(isKid ? '/kid' : '/')
    } else {
      alert('Failed to send drawing. Please try again.')
    }
  }

  const isKid = currentUser?.role === 'kid'

  return (
    <div className="creative-break">
      <div className="creative-break-header">
        <h2>🎨 Creative Break</h2>
        <p>Draw something fun and share it!</p>
      </div>

      <div className="drawing-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <div className="drawing-tools">
        <div className="tool-section">
          <label>Colors:</label>
          <div className="color-palette">
            {colors.map((c) => (
              <button
                key={c}
                className={`color-btn ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                aria-label={`Select ${c} color`}
              />
            ))}
          </div>
        </div>

        <div className="tool-section">
          <label>Brush Size:</label>
          <div className="brush-sizes">
            {[2, 5, 10, 15, 20].map((size) => (
              <button
                key={size}
                className={`brush-btn ${brushSize === size ? 'active' : ''}`}
                onClick={() => setBrushSize(size)}
              >
                <div
                  className="brush-preview"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="drawing-actions">
        <button className="btn btn-secondary" onClick={clearCanvas}>
          🗑️ Clear Canvas
        </button>
        <button className="btn btn-success" onClick={saveToDevice}>
          💾 Save to Device
        </button>
        <button className="btn btn-primary" onClick={sendDrawing}>
          📤 Send to {isKid ? 'Parent' : 'Kid'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(isKid ? '/kid' : '/')}>
          ← Back
        </button>
      </div>
    </div>
  )
}

export default CreativeBreak
