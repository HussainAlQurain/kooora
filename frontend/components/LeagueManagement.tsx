'use client'

import { useState, useEffect } from 'react'
import { 
  TrophyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface League {
  id: number
  name: string
  season: string
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING' | 'SUSPENDED'
  startDate?: string
  endDate?: string
  logoUrl?: string
  country: {
    id: number
    name: string
    code: string
  }
  isActive: boolean
  teamsCount?: number
  matchesCount?: number
  completedMatches?: number
}

interface Standing {
  id: number
  position: number
  team: {
    id: number
    name: string
    shortName: string
    logoUrl?: string
  }
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form?: string[]
}

interface LeagueManagementProps {
  className?: string
}

export default function LeagueManagement({ className = "" }: LeagueManagementProps) {
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [standingsLoading, setStandingsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'standings' | 'settings'>('overview')

  useEffect(() => {
    fetchLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague && activeTab === 'standings') {
      fetchStandings()
    }
  }, [selectedLeague, activeTab])

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/public/leagues')
      if (response.ok) {
        const data = await response.json()
        setLeagues(data)
        if (data.length > 0) {
          setSelectedLeague(data[0])
        }
      } else {
        // Mock data for demonstration
        const mockLeagues: League[] = [
          {
            id: 1,
            name: "Premier League",
            season: "2024/25",
            status: "ACTIVE",
            startDate: "2024-08-17",
            endDate: "2025-05-25",
            logoUrl: "https://via.placeholder.com/100",
            country: { id: 1, name: "England", code: "EN" },
            isActive: true,
            teamsCount: 20,
            matchesCount: 380,
            completedMatches: 128
          },
          {
            id: 2,
            name: "La Liga",
            season: "2024/25",
            status: "ACTIVE",
            startDate: "2024-08-18",
            endDate: "2025-06-01",
            country: { id: 2, name: "Spain", code: "ES" },
            isActive: true,
            teamsCount: 20,
            matchesCount: 380,
            completedMatches: 115
          },
          {
            id: 3,
            name: "Bundesliga",
            season: "2024/25",
            status: "UPCOMING",
            startDate: "2024-08-24",
            endDate: "2025-05-17",
            country: { id: 3, name: "Germany", code: "DE" },
            isActive: true,
            teamsCount: 18,
            matchesCount: 306,
            completedMatches: 0
          }
        ]
        setLeagues(mockLeagues)
        setSelectedLeague(mockLeagues[0])
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
      toast.error('Failed to load leagues')
    } finally {
      setLoading(false)
    }
  }

  const fetchStandings = async () => {
    if (!selectedLeague) return
    
    setStandingsLoading(true)
    try {
      const response = await fetch(`/api/standings/league/${selectedLeague.id}`)
      if (response.ok) {
        const data = await response.json()
        setStandings(data)
      } else {
        // Mock standings data
        const mockStandings: Standing[] = [
          {
            id: 1,
            position: 1,
            team: { id: 1, name: "Manchester City", shortName: "MCI", logoUrl: "https://via.placeholder.com/40" },
            matchesPlayed: 15,
            wins: 12,
            draws: 2,
            losses: 1,
            goalsFor: 38,
            goalsAgainst: 15,
            goalDifference: 23,
            points: 38,
            form: ['W', 'W', 'D', 'W', 'W']
          },
          {
            id: 2,
            position: 2,
            team: { id: 2, name: "Arsenal", shortName: "ARS" },
            matchesPlayed: 15,
            wins: 11,
            draws: 3,
            losses: 1,
            goalsFor: 35,
            goalsAgainst: 16,
            goalDifference: 19,
            points: 36,
            form: ['W', 'D', 'W', 'W', 'L']
          },
          {
            id: 3,
            position: 3,
            team: { id: 3, name: "Liverpool", shortName: "LIV" },
            matchesPlayed: 14,
            wins: 10,
            draws: 3,
            losses: 1,
            goalsFor: 32,
            goalsAgainst: 18,
            goalDifference: 14,
            points: 33,
            form: ['W', 'W', 'D', 'W', 'W']
          },
          {
            id: 4,
            position: 4,
            team: { id: 4, name: "Newcastle", shortName: "NEW" },
            matchesPlayed: 15,
            wins: 8,
            draws: 4,
            losses: 3,
            goalsFor: 28,
            goalsAgainst: 22,
            goalDifference: 6,
            points: 28,
            form: ['D', 'W', 'L', 'W', 'D']
          },
          {
            id: 5,
            position: 5,
            team: { id: 5, name: "Manchester United", shortName: "MUN" },
            matchesPlayed: 15,
            wins: 7,
            draws: 3,
            losses: 5,
            goalsFor: 24,
            goalsAgainst: 26,
            goalDifference: -2,
            points: 24,
            form: ['L', 'W', 'D', 'L', 'W']
          }
        ]
        setStandings(mockStandings)
      }
    } catch (error) {
      console.error('Error fetching standings:', error)
      toast.error('Failed to load standings')
    } finally {
      setStandingsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <PlayIcon className="h-4 w-4 text-green-600" />
      case 'COMPLETED': return <CheckCircleIcon className="h-4 w-4 text-blue-600" />
      case 'UPCOMING': return <CalendarIcon className="h-4 w-4 text-yellow-600" />
      case 'SUSPENDED': return <PauseIcon className="h-4 w-4 text-red-600" />
      default: return <StopIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'UPCOMING': return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500 text-white'
      case 'D': return 'bg-yellow-500 text-white'
      case 'L': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPositionChange = (position: number) => {
    // Mock position change logic
    if (position <= 2) return { type: 'up', value: 1 }
    if (position === 5) return { type: 'down', value: 1 }
    return null
  }

  const calculateProgress = () => {
    if (!selectedLeague || !selectedLeague.matchesCount || !selectedLeague.completedMatches) return 0
    return Math.round((selectedLeague.completedMatches / selectedLeague.matchesCount) * 100)
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrophyIcon className="h-8 w-8 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">League Management</h2>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create League
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* League List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Leagues</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {leagues.map((league) => (
                <div
                  key={league.id}
                  onClick={() => setSelectedLeague(league)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedLeague?.id === league.id ? 'bg-primary-50 border-r-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {league.logoUrl ? (
                        <img src={league.logoUrl} alt={league.name} className="w-10 h-10 rounded mr-3" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                          <TrophyIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{league.name}</h4>
                        <p className="text-sm text-gray-500">{league.season} • {league.country.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(league.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* League Details */}
        <div className="lg:col-span-2">
          {selectedLeague ? (
            <div className="space-y-6">
              {/* League Info Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    {selectedLeague.logoUrl ? (
                      <img src={selectedLeague.logoUrl} alt={selectedLeague.name} className="w-16 h-16 rounded mr-4" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center mr-4">
                        <TrophyIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedLeague.name}</h3>
                      <p className="text-gray-600">{selectedLeague.season} • {selectedLeague.country.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedLeague.status)}`}>
                      {selectedLeague.status}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Season Progress</span>
                    <span>{calculateProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedLeague.teamsCount}</div>
                    <div className="text-sm text-gray-500">Teams</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedLeague.completedMatches}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {(selectedLeague.matchesCount || 0) - (selectedLeague.completedMatches || 0)}
                    </div>
                    <div className="text-sm text-gray-500">Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedLeague.matchesCount}</div>
                    <div className="text-sm text-gray-500">Total Matches</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', name: 'Overview', icon: EyeIcon },
                      { id: 'standings', name: 'Standings', icon: TrophyIcon },
                      { id: 'settings', name: 'Settings', icon: PencilIcon }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                          flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                          ${activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">League Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedLeague.startDate ? new Date(selectedLeague.startDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedLeague.endDate ? new Date(selectedLeague.endDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'standings' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Current Standings</h4>
                        <button
                          onClick={fetchStandings}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Refresh
                        </button>
                      </div>
                      
                      {standingsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="animate-pulse bg-gray-100 h-16 rounded"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Pos</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">MP</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">W</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">D</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">L</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">GD</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Pts</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Form</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings.map((standing) => {
                                const positionChange = getPositionChange(standing.position)
                                return (
                                  <tr key={standing.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center">
                                        <span className="font-semibold text-gray-900">{standing.position}</span>
                                        {positionChange && (
                                          <div className={`ml-2 ${positionChange.type === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {positionChange.type === 'up' ? (
                                              <ArrowUpIcon className="h-4 w-4" />
                                            ) : (
                                              <ArrowDownIcon className="h-4 w-4" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center">
                                        {standing.team.logoUrl ? (
                                          <img src={standing.team.logoUrl} alt={standing.team.name} className="w-6 h-6 mr-3" />
                                        ) : (
                                          <div className="w-6 h-6 bg-gray-200 rounded mr-3"></div>
                                        )}
                                        <span className="font-medium text-gray-900">{standing.team.name}</span>
                                      </div>
                                    </td>
                                    <td className="text-center py-3 px-4 text-gray-900">{standing.matchesPlayed}</td>
                                    <td className="text-center py-3 px-4 text-green-600 font-semibold">{standing.wins}</td>
                                    <td className="text-center py-3 px-4 text-yellow-600 font-semibold">{standing.draws}</td>
                                    <td className="text-center py-3 px-4 text-red-600 font-semibold">{standing.losses}</td>
                                    <td className="text-center py-3 px-4 text-gray-900">{standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}</td>
                                    <td className="text-center py-3 px-4 font-bold text-gray-900">{standing.points}</td>
                                    <td className="text-center py-3 px-4">
                                      <div className="flex justify-center space-x-1">
                                        {standing.form?.map((result, i) => (
                                          <span
                                            key={i}
                                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${getFormColor(result)}`}
                                          >
                                            {result}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">League Settings</h4>
                        <p className="text-gray-600">Configure league parameters, scoring rules, and competition format.</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-center text-gray-500">League settings panel coming soon...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a League</h3>
              <p className="text-gray-500">Choose a league from the list to view details and manage settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
