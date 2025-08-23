'use client'

import { useState, useEffect } from 'react'
import { 
  WifiIcon,
  ArrowPathIcon,
  HomeIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [retryAttempts, setRetryAttempts] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Initial check
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1)
    window.location.reload()
  }

  const getCachedPages = () => {
    // These are the pages that should be available offline
    return [
      { name: 'Home', path: '/', icon: HomeIcon },
      { name: 'Matches', path: '/matches', icon: ClockIcon },
      { name: 'Leagues', path: '/leagues', icon: BookmarkIcon },
      { name: 'Players', path: '/players', icon: BookmarkIcon },
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Offline Icon */}
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <WifiIcon className={`h-10 w-10 ${
                isOnline ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-6">
            {isOnline ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Connection Restored!
                </h1>
                <p className="text-gray-600">
                  Your internet connection is back. Click retry to reload the page.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  You're Offline
                </h1>
                <p className="text-gray-600 mb-4">
                  No internet connection available. Some features may be limited, but you can still browse cached content.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleRetry}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-white font-medium transition-colors ${
                isOnline 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              {retryAttempts > 0 ? `Retry (${retryAttempts})` : 'Retry'}
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-3 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Home
            </Link>
          </div>

          {/* Offline Features */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Offline
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {getCachedPages().map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <page.icon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {page.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Previously viewed matches, player stats, and league information are cached and available offline.
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-600">
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* PWA Install Hint */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow text-center">
          <h4 className="font-semibold text-gray-900 mb-2">
            Install Kooora App
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Add Kooora to your home screen for faster access and better offline experience.
          </p>
          <p className="text-xs text-gray-500">
            Look for the "Add to Home Screen" option in your browser menu.
          </p>
        </div>
      </div>
    </div>
  )
}
