'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  TrophyIcon,
  UserGroupIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import MatchPrediction from '../../../components/MatchPrediction'
import LiveMatchWidget from '../../../components/LiveMatchWidget'

interface Country {
  id: number
  name: string
  code: string
}

interface Team {
  id: number
  name: string
  shortName: string
  country: Country
  logoUrl?: string
}

interface League {
  id: number
  name: string
  country: Country
}

interface Match {
  id: number
  homeTeam: Team
  awayTeam: Team
  league: League
  matchDate: string
  status: string
  homeTeamScore?: number
  awayTeamScore?: number
  venue?: string
  referee?: string
  attendance?: number
  notes?: string
}

export default function MatchDetailsPage() {
  const params = useParams()
  const matchId = params.id as string
  
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/matches/${matchId}`)
        
        if (response.ok) {
          const matchData = await response.json()
          setMatch(matchData)
        } else {
          setError('Match not found')
        }
      } catch (error) {
        console.error('Error fetching match:', error)
        setError('Failed to load match data')
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      fetchMatch()
    }
  }, [matchId])

  // Get username from localStorage or generate a random one
  useEffect(() => {
    const savedUsername = localStorage.getItem('kooora_username')
    if (savedUsername) {
      setUsername(savedUsername)
    } else {
      const randomUsername = `Fan${Math.floor(Math.random() * 10000)}`
      setUsername(randomUsername)
      localStorage.setItem('kooora_username', randomUsername)
    }
  }, [])

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-100 text-green-800'
      case 'FINISHED':
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'POSTPONED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <PlayIcon className="h-4 w-4" />
      case 'FINISHED':
      case 'COMPLETED':
        return <StopIcon className="h-4 w-4" />
      case 'SCHEDULED':
        return <ClockIcon className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Match Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested match could not be found.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const matchDateTime = formatMatchDate(match.matchDate)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Match Details</h1>
                <p className="text-gray-600">{match.league.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
                {getStatusIcon(match.status)}
                <span className="ml-1">{match.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Match Score Card */}
        <div className="card mb-8">
          <div className="text-center">
            {/* Teams and Score */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              {/* Home Team */}
              <Link href={`/teams/${match.homeTeam.id}`} className="flex-1 text-center group">
                <div className="w-24 h-24 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-primary-500 transition-all">
                  {match.homeTeam.logoUrl ? (
                    <img
                      src={match.homeTeam.logoUrl}
                      alt={`${match.homeTeam.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserGroupIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {match.homeTeam.name}
                </h3>
                <p className="text-sm text-gray-500">{match.homeTeam.shortName}</p>
              </Link>

              {/* Score */}
              <div className="flex-1 text-center">
                {(match.status === 'FINISHED' || match.status === 'COMPLETED' || match.status === 'LIVE') && 
                 (match.homeTeamScore !== undefined && match.awayTeamScore !== undefined) ? (
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {match.homeTeamScore} - {match.awayTeamScore}
                  </div>
                ) : (
                  <div className="text-2xl font-medium text-gray-500 mb-2">
                    VS
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  {matchDateTime.date}
                </div>
                <div className="text-sm text-gray-600">
                  {matchDateTime.time}
                </div>
              </div>

              {/* Away Team */}
              <Link href={`/teams/${match.awayTeam.id}`} className="flex-1 text-center group">
                <div className="w-24 h-24 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-primary-500 transition-all">
                  {match.awayTeam.logoUrl ? (
                    <img
                      src={match.awayTeam.logoUrl}
                      alt={`${match.awayTeam.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserGroupIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {match.awayTeam.name}
                </h3>
                <p className="text-sm text-gray-500">{match.awayTeam.shortName}</p>
              </Link>
            </div>

            {/* Match Info */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                {match.venue && (
                  <div className="flex items-center justify-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{match.venue}</span>
                  </div>
                )}
                
                {match.referee && (
                  <div className="flex items-center justify-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>Referee: {match.referee}</span>
                  </div>
                )}
                
                {match.attendance && (
                  <div className="flex items-center justify-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>Attendance: {match.attendance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Match Prediction */}
        {match.status === 'SCHEDULED' && (
          <div className="mb-8">
            <MatchPrediction 
              homeTeamId={match.homeTeam.id} 
              awayTeamId={match.awayTeam.id} 
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Match Updates */}
          <div className="lg:col-span-2">
            <LiveMatchWidget 
              matchId={parseInt(matchId)} 
              username={username}
              className="mb-8"
            />
            
            {/* Match Timeline / Events */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Events</h3>
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Timeline Coming Soon</h4>
                <p className="text-gray-500">
                  Match events, goals, cards, and substitutions will be displayed here.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Team Lineups */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Lineups</h3>
              <div className="text-center py-8">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Lineups Coming Soon</h4>
                <p className="text-gray-500">
                  Starting lineups and formations will be displayed here.
                </p>
              </div>
            </div>

            {/* Match Statistics */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h3>
              <div className="text-center py-8">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Statistics Coming Soon</h4>
                <p className="text-gray-500">
                  Possession, shots, passes, and other match statistics will be shown here.
                </p>
              </div>
            </div>

            {/* League Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">League Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <TrophyIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{match.league.name}</p>
                    <p className="text-sm text-gray-500">{match.league.country.name}</p>
                  </div>
                </div>
                
                <Link
                  href={`/leagues`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View League Standings →
                </Link>
              </div>
            </div>

            {/* Match Notes */}
            {match.notes && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Notes</h3>
                <p className="text-gray-700">{match.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Matches */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Matches</h3>
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Other Matches Coming Soon</h4>
            <p className="text-gray-500">
              Other matches between these teams and recent fixtures will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
