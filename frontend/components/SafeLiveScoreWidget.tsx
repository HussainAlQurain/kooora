'use client'

import { useState, useEffect } from 'react'
import { 
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface LiveMatch {
  id: number
  homeTeam: {
    id: number
    name: string
    shortName: string
    logoUrl?: string
  }
  awayTeam: {
    id: number
    name: string
    shortName: string
    logoUrl?: string
  }
  homeScore: number
  awayScore: number
  status: 'LIVE' | 'HALF_TIME' | 'FULL_TIME' | 'SCHEDULED' | 'CANCELLED'
  minute?: number
  league: {
    id: number
    name: string
    logoUrl?: string
  }
  stadium?: string
}

interface SafeLiveScoreWidgetProps {
  matchId?: number
  autoRefresh?: boolean
  refreshInterval?: number
  showDetails?: boolean
  className?: string
}

export default function SafeLiveScoreWidget({
  matchId,
  autoRefresh = true,
  refreshInterval = 30000,
  showDetails = true,
  className = ""
}: SafeLiveScoreWidgetProps) {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchLiveMatches()
    
    // Set up auto-refresh with regular HTTP polling (no WebSocket)
    let interval: NodeJS.Timeout | undefined
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveMatches()
        setLastUpdate(new Date())
      }, refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [matchId, autoRefresh, refreshInterval])

  const fetchLiveMatches = async () => {
    try {
      let url = '/api/matches'
      if (matchId) {
        url += `/${matchId}`
      } else {
        url += '?status=LIVE,HALF_TIME'
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (matchId) {
          setMatches([data])
        } else {
          setMatches(data.content || data)
        }
      } else {
        // Mock live data for demonstration (no WebSocket dependencies)
        const mockMatches: LiveMatch[] = [
          {
            id: 1,
            homeTeam: { id: 1, name: "Manchester City", shortName: "MCI" },
            awayTeam: { id: 2, name: "Arsenal", shortName: "ARS" },
            homeScore: 2,
            awayScore: 1,
            status: "LIVE",
            minute: 67,
            league: { id: 1, name: "Premier League" },
            stadium: "Etihad Stadium"
          },
          {
            id: 2,
            homeTeam: { id: 3, name: "Real Madrid", shortName: "RMA" },
            awayTeam: { id: 4, name: "Barcelona", shortName: "BAR" },
            homeScore: 0,
            awayScore: 0,
            status: "HALF_TIME",
            minute: 45,
            league: { id: 2, name: "La Liga" },
            stadium: "Santiago Bernabéu"
          }
        ]
        
        if (matchId) {
          const match = mockMatches.find(m => m.id === matchId)
          setMatches(match ? [match] : [])
        } else {
          setMatches(mockMatches.filter(m => m.status === 'LIVE' || m.status === 'HALF_TIME'))
        }
      }
    } catch (error) {
      console.error('Error fetching live matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE': return <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
      case 'HALF_TIME': return <ClockIcon className="h-4 w-4 text-yellow-600" />
      case 'FULL_TIME': return <ClockIcon className="h-4 w-4 text-gray-600" />
      case 'SCHEDULED': return <ClockIcon className="h-4 w-4 text-blue-600" />
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (match: LiveMatch) => {
    switch (match.status) {
      case 'LIVE':
        return `${match.minute}'`
      case 'HALF_TIME':
        return 'HT'
      case 'FULL_TIME':
        return 'FT'
      case 'SCHEDULED':
        return 'Scheduled'
      default:
        return match.status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-red-600 bg-red-50'
      case 'HALF_TIME': return 'text-yellow-600 bg-yellow-50'
      case 'FULL_TIME': return 'text-gray-600 bg-gray-50'
      case 'SCHEDULED': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diffMs = now.getTime() - lastUpdate.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) return `${diffSecs}s ago`
    const diffMins = Math.floor(diffSecs / 60)
    if (diffMins < 60) return `${diffMins}m ago`
    return lastUpdate.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
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
  }

  if (matches.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 text-center ${className}`}>
        <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">No live matches at the moment</p>
      </div>
    )
  }

  const MatchCard = ({ match }: { match: LiveMatch }) => (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${
      match.status === 'LIVE' ? 'border-red-200 bg-red-50 shadow-sm' : 'border-gray-200'
    }`}>
      {/* League and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-xs text-gray-600">
          <TrophyIcon className="h-3 w-3 mr-1" />
          {match.league?.name || 'Unknown League'}
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
          {getStatusIcon(match.status)}
          <span>{getStatusText(match)}</span>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold">{(match.homeTeam?.shortName || '?').slice(0, 2)}</span>
          </div>
          <span className="font-medium text-gray-900 truncate">{match.homeTeam?.shortName || 'Home'}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-center min-w-0">
          <div className={`text-xl font-bold ${match.status === 'LIVE' ? 'text-red-600' : 'text-gray-900'}`}>
            {match.homeScore}
          </div>
          <div className="text-gray-400">-</div>
          <div className={`text-xl font-bold ${match.status === 'LIVE' ? 'text-red-600' : 'text-gray-900'}`}>
            {match.awayScore}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-1 justify-end">
          <span className="font-medium text-gray-900 truncate">{match.awayTeam?.shortName || 'Away'}</span>
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold">{(match.awayTeam?.shortName || '?').slice(0, 2)}</span>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      {showDetails && match.stadium && (
        <div className="text-xs text-gray-500 mb-2">
          📍 {match.stadium}
        </div>
      )}

      {/* View Details Button */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link 
          href={`/matches/${match.id}`}
          className="flex items-center justify-center text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  )

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full mr-2"></div>
            Live Scores
          </h3>
          <div className="flex items-center space-x-2">
            {autoRefresh && (
              <div className="text-xs text-gray-500">
                Updated {formatLastUpdate()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="p-4">
        <div className="space-y-4">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{matches.length} live match{matches.length !== 1 ? 'es' : ''}</span>
          <button 
            onClick={fetchLiveMatches}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
