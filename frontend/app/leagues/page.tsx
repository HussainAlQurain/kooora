'use client'

import { useState, useEffect } from 'react'
import { TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Country {
  id: number
  name: string
  code: string
}

interface League {
  id: number
  name: string
  country: Country
  season: string
  status: string
}

interface Team {
  id: number
  name: string
  shortName: string
}

interface TeamStanding {
  id: number
  team: Team
  position: number
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [standingsLoading, setStandingsLoading] = useState(false)

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch('/api/leagues/active')
        if (response.ok) {
          const data = await response.json()
          setLeagues(data)
          if (data.length > 0) {
            setSelectedLeague(data[0])
            fetchStandings(data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching leagues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  const fetchStandings = async (leagueId: number) => {
    setStandingsLoading(true)
    try {
      const response = await fetch(`/api/leagues/${leagueId}/standings`)
      if (response.ok) {
        const data = await response.json()
        setStandings(data)
      }
    } catch (error) {
      console.error('Error fetching standings:', error)
    } finally {
      setStandingsLoading(false)
    }
  }

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league)
    fetchStandings(league.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Football Leagues</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Explore league standings and team performance across different competitions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Leagues Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Leagues</h2>
              <div className="space-y-2">
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => handleLeagueSelect(league)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedLeague?.id === league.id
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{league.name}</div>
                    <div className="text-sm text-gray-500">{league.country.name}</div>
                    <div className="text-xs text-gray-400">{league.season}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Standings Table */}
          <div className="lg:col-span-3">
            {selectedLeague && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedLeague.name}</h2>
                    <p className="text-gray-600">{selectedLeague.country.name} • {selectedLeague.season}</p>
                  </div>
                  <ChartBarIcon className="h-6 w-6 text-primary-600" />
                </div>

                {standingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-900">#</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Team</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">MP</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">W</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">D</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">L</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">GF</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">GA</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">GD</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-900">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((standing, index) => (
                          <tr 
                            key={standing.id} 
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index < 4 ? 'bg-green-50' : 
                              index >= standings.length - 3 ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="py-3 px-2 text-center font-medium">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index < 4 ? 'bg-green-100 text-green-800' :
                                index >= standings.length - 3 ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {standing.position}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{standing.team.name}</div>
                              <div className="text-sm text-gray-500">{standing.team.shortName}</div>
                            </td>
                            <td className="py-3 px-2 text-center text-gray-900">{standing.matchesPlayed}</td>
                            <td className="py-3 px-2 text-center text-green-600 font-medium">{standing.wins}</td>
                            <td className="py-3 px-2 text-center text-yellow-600 font-medium">{standing.draws}</td>
                            <td className="py-3 px-2 text-center text-red-600 font-medium">{standing.losses}</td>
                            <td className="py-3 px-2 text-center text-gray-900">{standing.goalsFor}</td>
                            <td className="py-3 px-2 text-center text-gray-900">{standing.goalsAgainst}</td>
                            <td className={`py-3 px-2 text-center font-medium ${
                              standing.goalDifference > 0 ? 'text-green-600' :
                              standing.goalDifference < 0 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                            </td>
                            <td className="py-3 px-2 text-center font-bold text-primary-600">{standing.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {standings.length === 0 && !standingsLoading && (
                  <div className="text-center py-8 text-gray-500">
                    No standings data available for this league.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
              <span className="text-gray-600">Champions League</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
              <span className="text-gray-600">Relegation</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">MP: Matches Played</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">W: Wins</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">D: Draws</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">L: Losses</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">GF: Goals For</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">GA: Goals Against</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">GD: Goal Difference</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">Pts: Points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
