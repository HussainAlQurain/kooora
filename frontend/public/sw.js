// Service Worker for Kooora PWA
// Version 1.0.0

const CACHE_NAME = 'kooora-cache-v1'
const OFFLINE_URL = '/offline'
const API_CACHE_NAME = 'kooora-api-cache-v1'

// Assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/matches',
  '/leagues',
  '/players',
  '/search',
  '/auth/login',
  '/auth/register',
  '/manifest.json'
]

// API endpoints that can be cached
const CACHEABLE_API_PATHS = [
  '/api/matches',
  '/api/leagues',
  '/api/players',
  '/api/teams',
  '/api/countries',
  '/api/player-statistics',
  '/api/standings'
]

// API endpoints that should always be fresh (no cache)
const NO_CACHE_API_PATHS = [
  '/api/auth',
  '/api/admin',
  '/api/live-updates',
  '/api/predictions'
]

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      }),
      
      // Cache API responses
      caches.open(API_CACHE_NAME).then(cache => {
        console.log('[SW] API cache ready')
        return Promise.resolve()
      })
    ]).then(() => {
      console.log('[SW] Installation complete')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete')
    })
  )
})

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip cross-origin requests (unless it's our API)
  if (url.origin !== location.origin) {
    return
  }
  
  // Handle API requests - Skip in development to let Next.js proxy handle them
  if (url.pathname.startsWith('/api/')) {
    // In development, don't intercept API calls - let Next.js handle the proxy
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return // Let browser handle the request normally
    }
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }
  
  // Handle static asset requests
  event.respondWith(handleStaticRequest(request))
})

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const isNoCache = NO_CACHE_API_PATHS.some(path => url.pathname.startsWith(path))
  const isCacheable = CACHEABLE_API_PATHS.some(path => url.pathname.startsWith(path))
  
  // Always try network first for no-cache endpoints
  if (isNoCache) {
    try {
      return await fetch(request)
    } catch (error) {
      console.log('[SW] Network failed for no-cache API:', url.pathname)
      return new Response(
        JSON.stringify({ error: 'Network unavailable', offline: true }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  // Use cache-first strategy for cacheable endpoints
  if (isCacheable) {
    try {
      const cache = await caches.open(API_CACHE_NAME)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        console.log('[SW] Serving from API cache:', url.pathname)
        
        // Update cache in background
        fetch(request).then(response => {
          if (response.status === 200) {
            cache.put(request, response.clone())
          }
        }).catch(() => {
          // Network failed, but we have cache
        })
        
        return cachedResponse
      }
      
      // No cache, try network
      const networkResponse = await fetch(request)
      
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone())
        console.log('[SW] Cached API response:', url.pathname)
      }
      
      return networkResponse
      
    } catch (error) {
      console.log('[SW] API request failed:', url.pathname, error)
      
      // Return cached version if available
      const cache = await caches.open(API_CACHE_NAME)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Return error response
      return new Response(
        JSON.stringify({ error: 'Network and cache unavailable', offline: true }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  // Default: just try network
  try {
    return await fetch(request)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    
    // Cache successful navigation responses
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
    
  } catch (error) {
    console.log('[SW] Navigation request failed, serving from cache or offline page')
    
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Serve offline page
    const offlineResponse = await cache.match(OFFLINE_URL)
    return offlineResponse || new Response('Offline', { status: 503 })
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Static request failed:', request.url)
    
    // Try cache one more time
    const cache = await caches.open(CACHE_NAME)
    return cache.match(request) || new Response('Asset not available offline', { status: 404 })
  }
}

// Handle push events
self.addEventListener('push', event => {
  console.log('[SW] Push event received')
  
  const options = {
    body: 'New match update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'match-update',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Match',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: '/matches',
      timestamp: Date.now()
    }
  }
  
  if (event.data) {
    try {
      const payload = event.data.json()
      Object.assign(options, payload)
    } catch (error) {
      console.error('[SW] Error parsing push payload:', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Kooora', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Handle sync events (background sync)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Background sync function
async function doBackgroundSync() {
  try {
    console.log('[SW] Performing background sync')
    
    // Sync critical data when back online
    const cache = await caches.open(API_CACHE_NAME)
    
    const syncEndpoints = [
      '/api/matches?status=LIVE',
      '/api/matches?today=true',
      '/api/leagues'
    ]
    
    for (const endpoint of syncEndpoints) {
      try {
        const response = await fetch(endpoint)
        if (response.status === 200) {
          await cache.put(endpoint, response.clone())
          console.log('[SW] Synced:', endpoint)
        }
      } catch (error) {
        console.log('[SW] Sync failed for:', endpoint)
      }
    }
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Send message to clients
function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message)
    })
  })
}

// Periodic background sync (when supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'live-scores-sync') {
    event.waitUntil(doBackgroundSync())
  }
})
