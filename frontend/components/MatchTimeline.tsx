'use client'

import { useState, useEffect } from 'react'
import { 
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FlagIcon
} from '@heroicons/react/24/outline'

interface MatchEvent {
  id: number
  minute: number
  additionalTime?: number
  eventType: string
  description: string
  homeScore?: number
  awayScore?: number
  player?: {
    id: number
    firstName: string
    lastName: string
  }
  team: {
    id: number
    name: string
    shortName: string
  }
  playerOut?: {
    id: number
    firstName: string
    lastName: string
  }
  playerIn?: {
    id: number
    firstName: string
    lastName: string
  }
  isHomeTeam: boolean
}

interface MatchTimelineProps {
  matchId: number
  homeTeam: string
  awayTeam: string
  refreshInterval?: number
}

export default function MatchTimeline({ 
  matchId, 
  homeTeam, 
  awayTeam, 
  refreshInterval = 30000 
}: MatchTimelineProps) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTimeline()
    
    const interval = setInterval(fetchTimeline, refreshInterval)
    return () => clearInterval(interval)
  }, [matchId, refreshInterval])

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/match-events/match/${matchId}/timeline`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        setCurrentScore(data.currentScore || { home: 0, away: 0 })
        setError(null)
      } else {
        setError('Failed to load match timeline')
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
      setError('Failed to load match timeline')
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'GOAL':
      case 'PENALTY_GOAL':
        return '⚽'
      case 'OWN_GOAL':
        return '⚽'
      case 'YELLOW_CARD':
        return '🟨'
      case 'RED_CARD':
        return '🟥'
      case 'SUBSTITUTION':
        return '🔄'
      case 'PENALTY_MISS':
        return '❌'
      case 'CORNER':
        return '🚩'
      case 'FREE_KICK':
        return '⚽'
      case 'HALF_TIME':
        return '⏸️'
      case 'FULL_TIME':
        return '⏹️'
      case 'KICKOFF':
        return '🏁'
      case 'VAR_CHECK':
        return '📺'
      case 'INJURY':
        return '🩹'
      default:
        return '⚪'
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'GOAL':
      case 'PENALTY_GOAL':
        return 'text-green-600'
      case 'OWN_GOAL':
        return 'text-red-600'
      case 'YELLOW_CARD':
        return 'text-yellow-600'
      case 'RED_CARD':
        return 'text-red-600'
      case 'SUBSTITUTION':
        return 'text-blue-600'
      case 'HALF_TIME':
      case 'FULL_TIME':
        return 'text-gray-600'
      case 'KICKOFF':
        return 'text-green-600'
      default:
        return 'text-gray-500'
    }
  }

  const formatEventDescription = (event: MatchEvent) => {
    let description = ''
    
    if (event.player) {
      description += `${event.player.firstName} ${event.player.lastName}`
    }
    
    if (event.eventType === 'SUBSTITUTION' && event.playerOut && event.playerIn) {
      description = `${event.playerOut.firstName} ${event.playerOut.lastName} → ${event.playerIn.firstName} ${event.playerIn.lastName}`
    }
    
    if (event.description) {
      description += description ? ` - ${event.description}` : event.description
    }
    
    return description || event.eventType.replace('_', ' ').toLowerCase()
  }

  const getDisplayMinute = (event: MatchEvent) => {
    if (event.additionalTime && event.additionalTime > 0) {
      return `${event.minute}+${event.additionalTime}'`
    }
    return `${event.minute}'`
  }

  const isScoringEvent = (eventType: string) => {
    return ['GOAL', 'PENALTY_GOAL', 'OWN_GOAL'].includes(eventType)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading timeline...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Timeline</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchTimeline}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Score Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Match Timeline
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentScore.home} - {currentScore.away}
            </div>
            <div className="text-sm text-gray-500">
              {homeTeam} vs {awayTeam}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Events Yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Match events will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {events.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== events.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`
                          h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                          ${isScoringEvent(event.eventType) 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          <span className="text-sm font-medium">
                            {getEventIcon(event.eventType)}
                          </span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className={`font-medium ${getEventColor(event.eventType)}`}>
                                {formatEventDescription(event)}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({event.team.shortName})
                              </span>
                            </div>
                            {isScoringEvent(event.eventType) && (
                              <div className="mt-1 text-xs text-green-600 font-medium">
                                Score: {event.homeScore} - {event.awayScore}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {getDisplayMinute(event)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {event.isHomeTeam ? homeTeam : awayTeam}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Timeline updates automatically</span>
          <div className="flex items-center">
            <div className="animate-pulse h-2 w-2 bg-green-400 rounded-full mr-2"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}
