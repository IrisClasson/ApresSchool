// Service worker for PWA with auto-update support
// Version is fetched dynamically from /version.json
let CACHE_NAME = 'apres-school-v1' // Default, will be updated from version.json

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/version.json'
]

// Fetch version info and set cache name
async function initializeCacheName() {
  try {
    const response = await fetch('/version.json')
    const versionData = await response.json()
    CACHE_NAME = `apres-school-${versionData.cacheVersion}`
    console.log('[SW] Cache name set to:', CACHE_NAME)
    return CACHE_NAME
  } catch (error) {
    console.error('[SW] Failed to load version.json, using default cache name:', error)
    return CACHE_NAME
  }
}

// Install event - cache assets and skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    initializeCacheName()
      .then((cacheName) => {
        return caches.open(cacheName)
      })
      .then((cache) => {
        console.log('[SW] Caching assets')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        // Skip waiting to activate new service worker immediately
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    initializeCacheName()
      .then((currentCacheName) => {
        return caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== currentCacheName) {
                console.log('[SW] Deleting old cache:', cacheName)
                return caches.delete(cacheName)
              }
            })
          )
        })
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim()
      })
  )
})

// Fetch event - network first, fall back to cache for offline support
self.addEventListener('fetch', (event) => {
  // For navigation requests (page loads), always go to network first
  // and fall back to index.html for SPA routing
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, return cached index.html for SPA routing
          return caches.match('/index.html')
        })
    )
    return
  }

  // For other requests (assets, API calls), use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()
        // Use the dynamically loaded cache name
        initializeCacheName()
          .then((cacheName) => caches.open(cacheName))
          .then((cache) => {
            cache.put(event.request, responseToCache)
          })
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
      })
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)

  event.notification.close()

  // Get the URL from notification data
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus existing window and navigate to the URL
            return client.focus().then(() => {
              return client.navigate(urlToOpen)
            })
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Handle push notifications (for future real-time push from server)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  if (event.data) {
    const data = event.data.json()
    const title = data.title || 'Apres School'
    const options = {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'push-notification',
      data: data.data || {}
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  }
})
