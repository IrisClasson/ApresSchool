import { useRef, useState, useCallback, useEffect } from 'react'
import './DrawingModal.css'

function DrawingModal({ isOpen, onClose, onSend }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FFC0CB')
  const [brushSize, setBrushSize] = useState(5)

  // Initialize canvas with white background when modal opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [isOpen])

  const colors = [
    '#069494', // Teal
    '#FF8243', // Coral
    '#FCE883', // Yellow
    '#FFC0CB', // Pink
    '#4CAF50', // Green
    '#F44336', // Red
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#000000', // Black
    '#FFFFFF', // White
  ]

  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)

    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)

    const ctx = canvasRef.current.getContext('2d')
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

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY)

    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    if (!isDrawing) return

    const touch = e.touches[0]
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY)

    const ctx = canvasRef.current.getContext('2d')
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

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleSend = () => {
    const canvas = canvasRef.current
    const imageData = canvas.toDataURL('image/png')
    onSend(imageData)
    clearCanvas()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="drawing-modal-overlay" onClick={onClose}>
      <div className="drawing-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawing-modal-header">
          <h3>Draw a Picture</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="drawing-modal-body">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          <div className="drawing-controls">
            <div className="control-section">
              <label>Color:</label>
              <div className="color-palette">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`color-button ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="control-section">
              <label>Brush Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="brush-slider"
              />
            </div>

            <div className="drawing-actions">
              <button className="btn btn-secondary" onClick={clearCanvas}>
                Clear Canvas
              </button>
              <button className="btn btn-primary" onClick={handleSend}>
                Send Drawing 🎨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrawingModal
