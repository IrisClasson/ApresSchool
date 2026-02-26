import { useState, useEffect } from 'react'
import './AppVersion.css'

function AppVersion() {
  const [version, setVersion] = useState(null)

  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => setVersion(data))
      .catch(err => console.error('Failed to load version:', err))
  }, [])

  if (!version) return null

  return (
    <div className="app-version">
      v{version.version}
    </div>
  )
}

export default AppVersion
