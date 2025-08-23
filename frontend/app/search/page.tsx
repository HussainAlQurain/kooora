'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  UserGroupIcon, 
  TrophyIcon,
  UserIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

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
}

interface Team {
  id: number
  name: string
  shortName: string
  country: Country
}

interface Player {
  id: number
  firstName: string
  lastName: string
  team: Team
  position: string
  country: Country
}

interface SearchResults {
  teams: Team[]
  players: Player[]
  leagues: League[]
  totalResults: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [results, setResults] = useState<SearchResults>({
    teams: [],
    players: [],
    leagues: [],
    totalResults: 0
  })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async (searchQuery: string, type: string) => {
    if (!searchQuery.trim()) {
      setResults({ teams: [], players: [], leagues: [], totalResults: 0 })
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      let teams: Team[] = []
      let players: Player[] = []
      let leagues: League[] = []

      if (type === 'all' || type === 'teams') {
        const teamsResponse = await fetch(`/api/public/teams`)
        if (teamsResponse.ok) {
          const allTeams = await teamsResponse.json()
          teams = allTeams.filter((team: Team) => 
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.shortName.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 10)
        }
      }

      if (type === 'all' || type === 'players') {
        const playersResponse = await fetch(`/api/players?page=0&size=50`)
        if (playersResponse.ok) {
          const playersData = await playersResponse.json()
          players = playersData.content.filter((player: Player) => 
            player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (player.firstName + ' ' + player.lastName).toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 10)
        }
      }

      if (type === 'all' || type === 'leagues') {
        const leaguesResponse = await fetch(`/api/public/leagues`)
        if (leaguesResponse.ok) {
          const allLeagues = await leaguesResponse.json()
          leagues = allLeagues.filter((league: League) => 
            league.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 10)
        }
      }

      setResults({
        teams,
        players,
        leagues,
        totalResults: teams.length + players.length + leagues.length
      })

    } catch (error) {
      console.error('Search error:', error)
      setResults({ teams: [], players: [], leagues: [], totalResults: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query, searchType)
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, searchType)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [query, searchType])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <MagnifyingGlassIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Search Football Data</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Find teams, players, leagues, and more across our football database
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for teams, players, leagues..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                  >
                    <option value="all">All Results</option>
                    <option value="teams">Teams Only</option>
                    <option value="players">Players Only</option>
                    <option value="leagues">Leagues Only</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <div className="space-y-8">
            {/* Results Summary */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {results.totalResults > 0 
                  ? `Found ${results.totalResults} result${results.totalResults !== 1 ? 's' : ''} for "${query}"`
                  : `No results found for "${query}"`
                }
              </h2>
            </div>

            {/* Teams Results */}
            {results.teams.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <UserGroupIcon className="h-6 w-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Teams ({results.teams.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.teams.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <UserGroupIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{team.name}</h4>
                          <p className="text-sm text-gray-500">{team.shortName}</p>
                          <p className="text-xs text-gray-400">{team.country.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Players Results */}
            {results.players.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <UserIcon className="h-6 w-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Players ({results.players.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.players.map((player) => (
                    <Link key={player.id} href={`/players/${player.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {player.firstName} {player.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">{player.position}</p>
                          <p className="text-xs text-gray-400">{player.team.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Leagues Results */}
            {results.leagues.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <TrophyIcon className="h-6 w-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Leagues ({results.leagues.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.leagues.map((league) => (
                    <div key={league.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <TrophyIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{league.name}</h4>
                          <p className="text-sm text-gray-500">{league.season}</p>
                          <p className="text-xs text-gray-400">{league.country.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.totalResults === 0 && hasSearched && !loading && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or search type
                </p>
                <div className="text-sm text-gray-400">
                  <p>Search tips:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Try different keywords</li>
                    <li>• Check your spelling</li>
                    <li>• Use shorter search terms</li>
                    <li>• Try searching for team names, player names, or league names</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!hasSearched && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Searches</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => { setQuery('Manchester'); setSearchType('teams'); }}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <UserGroupIcon className="h-5 w-5 text-primary-600 mb-1" />
                <div className="text-sm font-medium text-gray-900">Manchester</div>
                <div className="text-xs text-gray-500">Teams</div>
              </button>
              
              <button
                onClick={() => { setQuery('Haaland'); setSearchType('players'); }}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <UserIcon className="h-5 w-5 text-primary-600 mb-1" />
                <div className="text-sm font-medium text-gray-900">Haaland</div>
                <div className="text-xs text-gray-500">Players</div>
              </button>
              
              <button
                onClick={() => { setQuery('Premier League'); setSearchType('leagues'); }}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <TrophyIcon className="h-5 w-5 text-primary-600 mb-1" />
                <div className="text-sm font-medium text-gray-900">Premier League</div>
                <div className="text-xs text-gray-500">Leagues</div>
              </button>
              
              <button
                onClick={() => { setQuery('Real Madrid'); setSearchType('teams'); }}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <UserGroupIcon className="h-5 w-5 text-primary-600 mb-1" />
                <div className="text-sm font-medium text-gray-900">Real Madrid</div>
                <div className="text-xs text-gray-500">Teams</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
