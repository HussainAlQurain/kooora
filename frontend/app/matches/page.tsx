'use client'

import { useState, useEffect } from 'react'
import { 
  TrophyIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

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
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'live' | 'finished'>('all')

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    filterMatches()
  }, [matches, statusFilter, searchQuery, activeTab])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/matches?page=0&size=50&sortBy=matchDate&sortDir=desc')
      
      if (response.ok) {
        const data = await response.json()
        const items = Array.isArray(data) ? data : (data?.content ?? [])
          .filter(Boolean)
          .map((m: any) => ({
            ...m,
            homeTeam: m.homeTeam || { id: 0, name: m.homeTeamName || 'Home', shortName: m.homeTeamShort || (m.homeTeamName || 'HM') },
            awayTeam: m.awayTeam || { id: 0, name: m.awayTeamName || 'Away', shortName: m.awayTeamShort || (m.awayTeamName || 'AW') },
            league: m.league || { id: 0, name: m.leagueName || 'Unknown' },
          }))
        setMatches(items)
      } else {
        setError('Failed to load matches')
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const filterMatches = () => {
    let filtered = matches

    // Apply tab filter
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(match => match.status === 'SCHEDULED')
        break
      case 'live':
        filtered = filtered.filter(match => match.status === 'LIVE')
        break
      case 'finished':
        filtered = filtered.filter(match => match.status === 'FINISHED' || match.status === 'COMPLETED')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(match => match.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(match =>
        match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.league.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredMatches(filtered)
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
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
        return <PlayIcon className="h-3 w-3" />
      case 'FINISHED':
      case 'COMPLETED':
        return <StopIcon className="h-3 w-3" />
      case 'SCHEDULED':
        return <ClockIcon className="h-3 w-3" />
      default:
        return <CalendarIcon className="h-3 w-3" />
    }
  }

  const tabs = [
    { id: 'all', name: 'All Matches', count: matches.length },
    { id: 'upcoming', name: 'Upcoming', count: matches.filter(m => m.status === 'SCHEDULED').length },
    { id: 'live', name: 'Live', count: matches.filter(m => m.status === 'LIVE').length },
    { id: 'finished', name: 'Finished', count: matches.filter(m => m.status === 'FINISHED' || m.status === 'COMPLETED').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
              <p className="mt-2 text-gray-600">
                Browse all football matches and fixtures
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches by team or league..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="LIVE">Live</option>
                  <option value="FINISHED">Finished</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="POSTPONED">Postponed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredMatches.length} of {matches.length} matches
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Matches</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchMatches}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Matches List */}
        {!loading && !error && (
          <>
            {filteredMatches.length > 0 ? (
              <div className="space-y-4">
                {filteredMatches.map((match) => {
                  const matchDateTime = formatMatchDate(match.matchDate)
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="card hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        {/* Date and Status */}
                        <div className="flex items-center space-x-4">
                          <div className="text-center min-w-16">
                            <div className="text-sm font-medium text-gray-900">
                              {matchDateTime.fullDate}
                            </div>
                            <div className="text-xs text-gray-500">
                              {matchDateTime.time}
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {getStatusIcon(match.status)}
                            <span className="ml-1">{match.status}</span>
                          </span>
                        </div>

                        {/* Teams and Score */}
                        <div className="flex-1 flex items-center justify-center space-x-4">
                          {/* Home Team */}
                          <div className="flex items-center space-x-2 flex-1 justify-end">
                            <span className="font-medium text-gray-900 text-right">
                              {match.homeTeam?.name ?? 'Home'}
                            </span>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {match.homeTeam?.logoUrl ? (
                                <img
                                  src={match.homeTeam.logoUrl}
                                  alt={`${match.homeTeam?.name ?? 'Home'} logo`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Score or VS */}
                          <div className="text-center min-w-16">
                            {(match.status === 'FINISHED' || match.status === 'COMPLETED' || match.status === 'LIVE') && 
                             (match.homeTeamScore !== undefined && match.awayTeamScore !== undefined) ? (
                              <div className="text-lg font-bold text-gray-900">
                                {match.homeTeamScore} - {match.awayTeamScore}
                              </div>
                            ) : (
                              <div className="text-sm font-medium text-gray-500">
                                VS
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {match.awayTeam?.logoUrl ? (
                                <img
                                  src={match.awayTeam.logoUrl}
                                  alt={`${match.awayTeam?.name ?? 'Away'} logo`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900">
                              {match.awayTeam?.name ?? 'Away'}
                            </span>
                          </div>
                        </div>

                        {/* League and Venue */}
                        <div className="text-right min-w-32">
                          <div className="text-sm font-medium text-gray-700">
                            {match.league?.name ?? 'Unknown'}
                          </div>
                          {match.venue && (
                            <div className="text-xs text-gray-500">
                              {match.venue}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('')
                    setActiveTab('all')
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
