'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  BellIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://')
    
    setIsInstalled(isStandalone)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install banner if not already dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed && !isStandalone) {
        setShowInstallBanner(true)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      
      // Show notification prompt if not already decided
      const notificationPromptShown = localStorage.getItem('notification-prompt-shown')
      if (Notification.permission === 'default' && !notificationPromptShown) {
        setTimeout(() => setShowNotificationPrompt(true), 5000) // Show after 5 seconds
      }
    }

    // Register service worker - TEMPORARILY DISABLED to fix webpack issues
    // if ('serviceWorker' in navigator) {
    //   registerServiceWorker()
    // }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered successfully:', registration.scope)

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('New version available')
              // Optionally show update notification
            }
          })
        }
      })

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    } catch (error) {
      console.error('Error during app installation:', error)
    }
  }

  const handleDismissInstall = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      setShowNotificationPrompt(false)
      localStorage.setItem('notification-prompt-shown', 'true')

      if (permission === 'granted') {
        console.log('Notifications enabled')
        
        // Subscribe to push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey())
          })
          
          console.log('Push subscription:', subscription)
          // Send subscription to server
          await fetch('/api/push-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
          })
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      setShowNotificationPrompt(false)
      localStorage.setItem('notification-prompt-shown', 'true')
    }
  }

  const handleDismissNotifications = () => {
    setShowNotificationPrompt(false)
    localStorage.setItem('notification-prompt-shown', 'true')
  }

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Get VAPID public key (you'll need to generate this)
  function getVapidPublicKey() {
    // This should be your VAPID public key
    // For now, using a placeholder - you'll need to generate actual VAPID keys
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HEYyMjhZM1Fz6geCMoWdcFXOj6nDPZa6rqOjI3PzEwqz4M9TjgG5nI2s8g'
  }

  return (
    <>
      {/* Install App Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ArrowDownTrayIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Install Kooora App
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add to your home screen for faster access and offline features.
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleInstallApp}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleDismissInstall}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissInstall}
                className="flex-shrink-0 ml-2"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enable Notifications Prompt */}
      {showNotificationPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Stay Updated
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get notifications for live match updates and score changes.
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleEnableNotifications}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Enable
                  </button>
                  <button
                    onClick={handleDismissNotifications}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissNotifications}
                className="flex-shrink-0 ml-2"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Update Available Notification */}
      {/* This can be added later when service worker detects updates */}
    </>
  )
}
