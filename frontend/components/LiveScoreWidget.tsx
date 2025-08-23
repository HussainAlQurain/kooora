'use client'

import { useState, useEffect } from 'react'
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  FireIcon,
  TrophyIcon,
  CalendarIcon,
  EyeIcon,
  WifiIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useWebSocketConnection } from '../hooks/useWebSocket'
import { webSocketClient } from '../utils/websocket'

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
  additionalTime?: number
  league: {
    id: number
    name: string
    logoUrl?: string
  }
  stadium?: string
  attendance?: number
  lastEvent?: {
    type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION'
    player: string
    team: string
    minute: number
  }
}

interface LiveScoreWidgetProps {
  matchId?: number
  autoRefresh?: boolean
  refreshInterval?: number
  showDetails?: boolean
  className?: string
}

export default function LiveScoreWidget({
  matchId,
  autoRefresh = true,
  refreshInterval = 10000,
  showDetails = true,
  className = ""
}: LiveScoreWidgetProps) {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  
  const { isConnected } = useWebSocketConnection()

  useEffect(() => {
    fetchLiveMatches()
    
    // Subscribe to real-time match updates
    const unsubscribeMatchesTopic = '/topic/matches'
    const unsubscribeMatches = webSocketClient.subscribe(unsubscribeMatchesTopic, (update: any) => {
      console.log('Received match update:', update)
      updateMatchInState(update)
      setLastUpdate(new Date())
    })

    // Subscribe to match events
    const unsubscribeEventsTopic = '/topic/events'
    const unsubscribeEvents = webSocketClient.subscribe(unsubscribeEventsTopic, (event: any) => {
      console.log('Received match event:', event)
      setRecentEvents(prev => [event, ...prev.slice(0, 4)]) // Keep last 5 events
      
      // Update match score if event includes score
      if (event.homeScore !== undefined && event.awayScore !== undefined) {
        updateMatchScore(event.matchId, event.homeScore, event.awayScore)
      }
      
      // Update last event for the match
      updateLastEvent(event.matchId, event)
      setLastUpdate(new Date())
    })

    // Subscribe to status changes
    const unsubscribeStatusTopic = '/topic/match-status'
    const unsubscribeStatus = webSocketClient.subscribe(unsubscribeStatusTopic, (statusChange: any) => {
      console.log('Received status change:', statusChange)
      updateMatchStatus(statusChange.matchId, statusChange.newStatus)
      setLastUpdate(new Date())
    })
    
    // Set up auto-refresh as fallback (reduced frequency since we have real-time updates)
    let interval: NodeJS.Timeout | undefined
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveMatches()
        setLastUpdate(new Date())
      }, refreshInterval * 2) // Double the interval since we have real-time updates
    }

    return () => {
      if (unsubscribeMatches) webSocketClient.unsubscribe(unsubscribeMatchesTopic)
      if (unsubscribeEvents) webSocketClient.unsubscribe(unsubscribeEventsTopic)
      if (unsubscribeStatus) webSocketClient.unsubscribe(unsubscribeStatusTopic)
      if (interval) clearInterval(interval)
    }
  }, [matchId, autoRefresh, refreshInterval])

  // Join live matches for real-time updates
  useEffect(() => {
    if (isConnected && matches.length > 0) {
      matches.forEach(match => {
        if (match.status === 'LIVE' || match.status === 'HALF_TIME') {
          webSocketClient.joinMatch(match.id, 'LiveScoreWidget')
        }
      })
    }
  }, [isConnected, matches])

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
        // Mock live data for demonstration
        const mockMatches: LiveMatch[] = [
          {
            id: 1,
            homeTeam: { id: 1, name: "Manchester City", shortName: "MCI", logoUrl: "https://via.placeholder.com/40" },
            awayTeam: { id: 2, name: "Arsenal", shortName: "ARS", logoUrl: "https://via.placeholder.com/40" },
            homeScore: 2,
            awayScore: 1,
            status: "LIVE",
            minute: 67,
            additionalTime: 0,
            league: { id: 1, name: "Premier League" },
            stadium: "Etihad Stadium",
            attendance: 55000,
            lastEvent: {
              type: "GOAL",
              player: "E. Haaland",
              team: "MCI",
              minute: 65
            }
          },
          {
            id: 2,
            homeTeam: { id: 3, name: "Real Madrid", shortName: "RMA" },
            awayTeam: { id: 4, name: "Barcelona", shortName: "BAR" },
            homeScore: 0,
            awayScore: 0,
            status: "HALF_TIME",
            minute: 45,
            additionalTime: 2,
            league: { id: 2, name: "La Liga" },
            stadium: "Santiago Bernabéu",
            attendance: 81000
          },
          {
            id: 3,
            homeTeam: { id: 5, name: "Bayern Munich", shortName: "BAY" },
            awayTeam: { id: 6, name: "Borussia Dortmund", shortName: "BVB" },
            homeScore: 3,
            awayScore: 2,
            status: "FULL_TIME",
            minute: 90,
            additionalTime: 4,
            league: { id: 3, name: "Bundesliga" },
            stadium: "Allianz Arena",
            attendance: 75000,
            lastEvent: {
              type: "GOAL",
              player: "J. Musiala",
              team: "BAY",
              minute: 88
            }
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

  const updateMatchInState = (update: any) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === update.matchId 
          ? {
              ...match,
              homeScore: update.homeScore ?? match.homeScore,
              awayScore: update.awayScore ?? match.awayScore,
              status: update.status ?? match.status
            }
          : match
      )
    )
  }

  const updateMatchScore = (matchId: number, homeScore: number, awayScore: number) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, homeScore, awayScore }
          : match
      )
    )
  }

  const updateMatchStatus = (matchId: number, status: any) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, status }
          : match
      )
    )
  }

  const updateLastEvent = (matchId: number, event: any) => {
    const eventTypeMap: any = {
      'GOAL': 'GOAL',
      'PENALTY_GOAL': 'GOAL',
      'YELLOW_CARD': 'YELLOW_CARD',
      'RED_CARD': 'RED_CARD',
      'SUBSTITUTION': 'SUBSTITUTION'
    }

    const lastEvent = {
      type: eventTypeMap[event.eventType] || event.eventType,
      player: event.player || 'Unknown',
      team: event.team,
      minute: parseInt(event.minute) || 0
    }

    setMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, lastEvent }
          : match
      )
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE': return <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
      case 'HALF_TIME': return <PauseIcon className="h-4 w-4 text-yellow-600" />
      case 'FULL_TIME': return <StopIcon className="h-4 w-4 text-gray-600" />
      case 'SCHEDULED': return <ClockIcon className="h-4 w-4 text-blue-600" />
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (match: LiveMatch) => {
    switch (match.status) {
      case 'LIVE':
        return `${match.minute}'${match.additionalTime ? `+${match.additionalTime}` : ''}`
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
          {match.homeTeam?.logoUrl ? (
            <img src={match.homeTeam.logoUrl} alt={match.homeTeam?.name || 'Home'} className="w-8 h-8" />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold">{(match.homeTeam?.shortName || '?').slice(0, 2)}</span>
            </div>
          )}
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
          {match.awayTeam?.logoUrl ? (
            <img src={match.awayTeam.logoUrl} alt={match.awayTeam?.name || 'Away'} className="w-8 h-8" />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold">{(match.awayTeam?.shortName || '?').slice(0, 2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Last Event */}
      {match.lastEvent && (
        <div className="flex items-center text-xs text-gray-600 mb-2">
          <FireIcon className="h-3 w-3 mr-1 text-orange-500" />
          <span>
            {match.lastEvent.minute}' {match.lastEvent.player} 
            {match.lastEvent.type === 'GOAL' && ' ⚽'}
            {match.lastEvent.type === 'YELLOW_CARD' && ' 🟨'}
            {match.lastEvent.type === 'RED_CARD' && ' 🟥'}
            {match.lastEvent.type === 'SUBSTITUTION' && ' 🔄'}
          </span>
        </div>
      )}

      {/* Additional Details */}
      {showDetails && (
        <div className="space-y-1 text-xs text-gray-500">
          {match.stadium && (
            <div className="flex items-center">
              <span>📍 {match.stadium}</span>
            </div>
          )}
          {match.attendance && (
            <div className="flex items-center">
              <span>👥 {match.attendance.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Real-time indicator for live matches */}
      {match.status === 'LIVE' && isConnected && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center space-x-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <span>Live Updates Active</span>
          </span>
        </div>
      )}

      {/* View Details Button */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link 
          href={`/matches/${match.id}`}
          className="flex items-center justify-center text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          <EyeIcon className="h-3 w-3 mr-1" />
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
            {/* Connection Status */}
            <div className={`flex items-center space-x-1 text-xs ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
              {isConnected ? (
                <WifiIcon className="h-3 w-3" />
              ) : (
                <ExclamationTriangleIcon className="h-3 w-3" />
              )}
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            {autoRefresh && (
              <div className="text-xs text-gray-500">
                Updated {formatLastUpdate()}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Events Ticker */}
        {recentEvents.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <div className="text-xs font-medium text-blue-800 mb-1">Latest Events</div>
            <div className="space-y-1">
              {recentEvents.slice(0, 2).map((event, index) => (
                <div key={`${event.matchId}-${event.timestamp}-${index}`} className="text-xs text-blue-700 flex items-center space-x-2">
                  <span className="font-medium">{event.minute}'</span>
                  <span>
                    {event.eventType === 'GOAL' && '⚽'}
                    {event.eventType === 'YELLOW_CARD' && '🟨'}
                    {event.eventType === 'RED_CARD' && '🟥'}
                    {event.eventType === 'SUBSTITUTION' && '🔄'}
                  </span>
                  <span>{event.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
