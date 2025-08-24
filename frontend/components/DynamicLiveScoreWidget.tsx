'use client'

import dynamic from 'next/dynamic'

interface LiveScoreWidgetProps {
  matchId?: number
  autoRefresh?: boolean
  refreshInterval?: number
  showDetails?: boolean
  className?: string
}

// Dynamically import LiveScoreWidget with no SSR
const LiveScoreWidget = dynamic(() => import('./LiveScoreWidget'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-24 mx-auto mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-8"></div>
                <div className="flex items-center space-x-3">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default function DynamicLiveScoreWidget(props: LiveScoreWidgetProps) {
  return <LiveScoreWidget {...props} />
}
