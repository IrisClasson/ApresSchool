import { useState, useEffect } from 'react'
import pwaUpdateService from '../lib/pwaUpdateService'
import './UpdatePrompt.css'

function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [version, setVersion] = useState(null)

  useEffect(() => {
    // Initialize PWA update service
    pwaUpdateService.init()

    // Load current version
    pwaUpdateService.getCurrentVersion().then(v => setVersion(v))

    // Listen for updates
    const unsubscribe = pwaUpdateService.onUpdate((event) => {
      if (event.type === 'update-available') {
        setShowPrompt(true)
      }
    })

    return unsubscribe
  }, [])

  const handleUpdate = async () => {
    setShowPrompt(false)
    await pwaUpdateService.applyUpdate()
    // Page will reload automatically via controllerchange event
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // User dismissed, will see update prompt again on next check
  }

  const handleForceReload = async () => {
    if (window.confirm('This will clear all cached data and reload the app. Continue?')) {
      await pwaUpdateService.forceHardReload()
    }
  }

  if (!showPrompt) return null

  return (
    <div className="update-prompt-overlay">
      <div className="update-prompt">
        <div className="update-icon">🔄</div>
        <h3>Update Available!</h3>
        <p>A new version of Apres School is available.</p>
        {version && (
          <p className="version-info">Current version: {version.version}</p>
        )}
        <div className="update-actions">
          <button className="btn-dismiss" onClick={handleDismiss}>
            Later
          </button>
          <button className="btn-update" onClick={handleUpdate}>
            Update Now
          </button>
        </div>
      </div>
    </div>
  )
}

// Separate component for force reload button (admin use)
export function ForceReloadButton() {
  const handleForceReload = async () => {
    if (window.confirm('This will clear all cached data and reload the app. Continue?')) {
      await pwaUpdateService.forceHardReload()
    }
  }

  return (
    <button
      onClick={handleForceReload}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        padding: '0.5rem 1rem',
        background: '#E74C3C',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 9999
      }}
    >
      🔄 Force Reload
    </button>
  )
}

export default UpdatePrompt
