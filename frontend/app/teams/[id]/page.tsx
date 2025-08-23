'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  UserGroupIcon, 
  MapPinIcon, 
  CalendarIcon,
  HomeIcon,
  ArrowLeftIcon,
  UserIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  UsersIcon
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
  foundedYear: number
  stadiumName: string
  stadiumCapacity: number
  website: string
  logoUrl: string
  country: Country
}

interface Player {
  id: number
  firstName: string
  lastName: string
  position: string
  jerseyNumber: string
  nationality: string
  dateOfBirth: string
  photoUrl: string
}

interface TeamStanding {
  id: number
  position: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  matchesPlayed: number
}

export default function TeamProfilePage() {
  const params = useParams()
  const teamId = params.id as string
  
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        
        // Fetch team data, players, and standings in parallel
        const [teamResponse, playersResponse, standingsResponse] = await Promise.all([
          fetch(`/api/public/teams`),
          fetch(`/api/players/team/${teamId}`),
          fetch(`/api/leagues/1/standings`) // Assuming Premier League for now
        ])
        
        // Process team data
        if (teamResponse.ok) {
          const teamsData = await teamResponse.json()
          const teamData = teamsData.find((t: Team) => t.id === parseInt(teamId))
          if (teamData) {
            setTeam(teamData)
          } else {
            setError('Team not found')
          }
        }
        
        // Process players data
        if (playersResponse.ok) {
          const playersData = await playersResponse.json()
          setPlayers(playersData)
        }
        
        // Process standings data
        if (standingsResponse.ok) {
          const standingsData = await standingsResponse.json()
          const teamStanding = standingsData.find((s: any) => s.team.id === parseInt(teamId))
          if (teamStanding) {
            setStandings([teamStanding])
          }
        }
        
      } catch (error) {
        console.error('Error fetching team data:', error)
        setError('Failed to load team data')
      } finally {
        setLoading(false)
      }
    }

    if (teamId) {
      fetchTeamData()
    }
  }, [teamId])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getPositionColor = (position: string) => {
    const pos = position.toLowerCase()
    if (pos.includes('goalkeeper')) return 'bg-yellow-100 text-yellow-800'
    if (pos.includes('defender') || pos.includes('defence')) return 'bg-blue-100 text-blue-800'
    if (pos.includes('midfielder') || pos.includes('midfield')) return 'bg-green-100 text-green-800'
    if (pos.includes('forward') || pos.includes('striker') || pos.includes('winger')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const groupPlayersByPosition = (players: Player[]) => {
    const groups = {
      Goalkeepers: players.filter(p => p.position.toLowerCase().includes('goalkeeper')),
      Defenders: players.filter(p => p.position.toLowerCase().includes('defender') || p.position.toLowerCase().includes('defence')),
      Midfielders: players.filter(p => p.position.toLowerCase().includes('midfielder') || p.position.toLowerCase().includes('midfield')),
      Forwards: players.filter(p => p.position.toLowerCase().includes('forward') || p.position.toLowerCase().includes('striker') || p.position.toLowerCase().includes('winger'))
    }
    return groups
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested team could not be found.'}</p>
          <Link
            href="/search"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  const playerGroups = groupPlayersByPosition(players)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/search"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserGroupIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                  <p className="text-gray-600">{team.shortName} • {team.country.name}</p>
                </div>
              </div>
            </div>
            {standings.length > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">#{standings[0].position}</div>
                <div className="text-sm text-gray-500">League Position</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Info Sidebar */}
          <div className="lg:col-span-1">
            {/* Basic Information */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Founded</span>
                  </div>
                  <span className="font-medium text-gray-900">{team.foundedYear}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>Country</span>
                  </div>
                  <span className="font-medium text-gray-900">{team.country.name}</span>
                </div>
                
                {team.stadiumName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <HomeIcon className="h-5 w-5 mr-2" />
                      <span>Stadium</span>
                    </div>
                    <span className="font-medium text-gray-900">{team.stadiumName}</span>
                  </div>
                )}
                
                {team.stadiumCapacity && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <UsersIcon className="h-5 w-5 mr-2" />
                      <span>Capacity</span>
                    </div>
                    <span className="font-medium text-gray-900">{team.stadiumCapacity.toLocaleString()}</span>
                  </div>
                )}
                
                {team.website && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <span>Website</span>
                    </div>
                    <a 
                      href={team.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      Visit
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Current Season Stats */}
            {standings.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Performance</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{standings[0].wins}</div>
                      <div className="text-sm text-gray-500">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{standings[0].draws}</div>
                      <div className="text-sm text-gray-500">Draws</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{standings[0].losses}</div>
                      <div className="text-sm text-gray-500">Losses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{standings[0].points}</div>
                      <div className="text-sm text-gray-500">Points</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goals For:</span>
                      <span className="font-medium text-gray-900">{standings[0].goalsFor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goals Against:</span>
                      <span className="font-medium text-gray-900">{standings[0].goalsAgainst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal Difference:</span>
                      <span className={`font-medium ${standings[0].goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {standings[0].goalDifference >= 0 ? '+' : ''}{standings[0].goalDifference}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Squad */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Squad</h3>
                <span className="text-sm text-gray-500">{players.length} players</span>
              </div>
              
              {players.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(playerGroups).map(([position, positionPlayers]) => (
                    positionPlayers.length > 0 && (
                      <div key={position}>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            position === 'Goalkeepers' ? 'bg-yellow-400' :
                            position === 'Defenders' ? 'bg-blue-400' :
                            position === 'Midfielders' ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          {position}
                          <span className="ml-2 text-sm text-gray-500">({positionPlayers.length})</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {positionPlayers.map((player) => (
                            <Link
                              key={player.id}
                              href={`/players/${player.id}`}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                            >
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                {player.photoUrl ? (
                                  <img
                                    src={player.photoUrl}
                                    alt={`${player.firstName} ${player.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900">
                                    {player.firstName} {player.lastName}
                                  </p>
                                  {player.jerseyNumber && (
                                    <span className="text-sm font-medium text-gray-500">
                                      #{player.jerseyNumber}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <span>{player.position}</span>
                                  <span>Age {calculateAge(player.dateOfBirth)}</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Players Found</h4>
                  <p className="text-gray-500">
                    No players are currently registered for this team.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Matches Placeholder */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Matches</h3>
              <div className="text-center py-8">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Match History Coming Soon</h4>
                <p className="text-gray-500">
                  Recent match results and upcoming fixtures will be displayed here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
