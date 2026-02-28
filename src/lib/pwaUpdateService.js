// PWA Update Detection and Management Service
// Checks for app updates and prompts user to reload

class PWAUpdateService {
  constructor() {
    this.registration = null
    this.updateAvailable = false
    this.listeners = []
  }

  // Initialize the update service
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA Update] Service workers not supported')
      return
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('[PWA Update] Service worker registered')

      // Check for updates immediately
      await this.checkForUpdates()

      // Check for updates every 60 seconds
      setInterval(() => this.checkForUpdates(), 60000)

      // Listen for service worker updates
      this.registration.addEventListener('updatefound', () => {
        console.log('[PWA Update] New update found!')
        const newWorker = this.registration.installing

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker installed and old one is still controlling
            console.log('[PWA Update] New version available!')
            this.updateAvailable = true
            this.notifyListeners({ type: 'update-available' })
          }
        })
      })

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA Update] Controller changed, reloading...')
        window.location.reload()
      })

    } catch (error) {
      console.error('[PWA Update] Service worker registration failed:', error)
    }
  }

  // Check for updates manually
  async checkForUpdates() {
    if (!this.registration) return

    try {
      await this.registration.update()
      console.log('[PWA Update] Checked for updates')
    } catch (error) {
      console.error('[PWA Update] Update check failed:', error)
    }
  }

  // Force update by skipping waiting and reloading
  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.log('[PWA Update] No update waiting')
      return
    }

    // Tell the waiting service worker to skip waiting and activate
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // The controllerchange event will trigger a reload
  }

  // Add listener for update events
  onUpdate(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach(listener => listener(event))
  }

  // Get current app version
  async getCurrentVersion() {
    try {
      const response = await fetch('/version.json?' + Date.now()) // Cache bust
      const data = await response.json()
      return data
    } catch (error) {
      console.error('[PWA Update] Failed to fetch version:', error)
      return null
    }
  }

  // Clear all caches (nuclear option for forcing fresh content)
  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('[PWA Update] All caches cleared')
      return true
    } catch (error) {
      console.error('[PWA Update] Failed to clear caches:', error)
      return false
    }
  }

  // Force hard reload (clears cache and reloads)
  async forceHardReload() {
    console.log('[PWA Update] Forcing hard reload...')

    // Clear all caches
    await this.clearAllCaches()

    // Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(reg => reg.unregister()))

    // Hard reload from server
    window.location.reload(true)
  }
}

// Create singleton instance
const pwaUpdateService = new PWAUpdateService()

export default pwaUpdateService
