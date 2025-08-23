'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface SearchResult {
  players: Player[]
  teams: Team[]
  leagues: League[]
  matches: Match[]
  countries: Country[]
  totalResults: number
}

interface Player {
  id: number
  firstName: string
  lastName: string
  position: string
  team: {
    name: string
    country: {
      name: string
    }
  }
  photoUrl?: string
}

interface Team {
  id: number
  name: string
  shortName: string
  country: {
    name: string
  }
  logoUrl?: string
}

interface League {
  id: number
  name: string
  country: {
    name: string
  }
  season: string
}

interface Match {
  id: number
  homeTeam: {
    name: string
  }
  awayTeam: {
    name: string
  }
  league: {
    name: string
  }
  matchDate: string
  status: string
}

interface Country {
  id: number
  name: string
  code: string
  flagUrl?: string
}

interface SearchMetadata {
  positions: string[]
  seasons: string[]
  matchStatuses: string[]
  popularTeams: Array<{
    id: number
    name: string
    shortName: string
    country: string
    playerCount: number
  }>
  popularLeagues: Array<{
    id: number
    name: string
    country: string
    season: string
  }>
  popularCountries: Array<{
    id: number
    name: string
    code: string
    flagUrl?: string
    playerCount: number
  }>
}

interface AdvancedSearchProps {
  onResultClick?: (type: string, item: any) => void
  className?: string
}

export default function AdvancedSearch({ onResultClick, className = "" }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [suggestions, setSuggestions] = useState<{[key: string]: string[]} | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null)
  const [trending, setTrending] = useState<string[]>([])
  
  // Filter states
  const [filters, setFilters] = useState({
    position: '',
    teamName: '',
    countryName: '',
    minAge: '',
    maxAge: '',
    season: '',
    status: '',
    minGoals: '',
    maxGoals: '',
    leagueName: ''
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetchMetadata()
    fetchTrending()
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      // Debounce search
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
      
      searchTimeout.current = setTimeout(() => {
        performSearch()
        fetchSuggestions()
      }, 300)
    } else {
      setResults(null)
      setSuggestions(null)
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query])

  const performSearch = async () => {
    if (!query.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/search/global?query=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    if (!query.trim()) return

    try {
      const response = await fetch(`/api/search/suggestions?query=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error('Suggestions error:', error)
    }
  }

  const fetchMetadata = async () => {
    try {
      const response = await fetch('/api/search/metadata')
      if (response.ok) {
        const data = await response.json()
        setMetadata(data)
      }
    } catch (error) {
      console.error('Metadata error:', error)
    }
  }

  const fetchTrending = async () => {
    try {
      const response = await fetch('/api/search/trending')
      if (response.ok) {
        const data = await response.json()
        setTrending(data)
      }
    } catch (error) {
      console.error('Trending error:', error)
    }
  }

  const performAdvancedSearch = async (type: string) => {
    if (!query.trim() && !hasActiveFilters()) return

    try {
      setLoading(true)
      let url = ''
      let params = new URLSearchParams()

      if (query) params.append('query', query)

      switch (type) {
        case 'players':
          url = '/api/search/players'
          if (filters.position) params.append('position', filters.position)
          if (filters.teamName) params.append('teamName', filters.teamName)
          if (filters.countryName) params.append('countryName', filters.countryName)
          if (filters.minAge) params.append('minAge', filters.minAge)
          if (filters.maxAge) params.append('maxAge', filters.maxAge)
          break
        case 'matches':
          url = '/api/search/matches'
          if (filters.teamName) params.append('teamName', filters.teamName)
          if (filters.leagueName) params.append('leagueName', filters.leagueName)
          if (filters.status) params.append('status', filters.status)
          break
        case 'player-statistics':
          url = '/api/search/player-statistics'
          if (filters.leagueName) params.append('leagueName', filters.leagueName)
          if (filters.season) params.append('season', filters.season)
          if (filters.minGoals) params.append('minGoals', filters.minGoals)
          if (filters.maxGoals) params.append('maxGoals', filters.maxGoals)
          break
      }

      const response = await fetch(`${url}?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // Update results with advanced search data
        setResults(prev => ({
          ...prev!,
          [type]: data.content || data
        }))
      }
    } catch (error) {
      console.error('Advanced search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '')
  }

  const clearFilters = () => {
    setFilters({
      position: '',
      teamName: '',
      countryName: '',
      minAge: '',
      maxAge: '',
      season: '',
      status: '',
      minGoals: '',
      maxGoals: '',
      leagueName: ''
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setSuggestions(null)
  }

  const handleTrendingClick = (term: string) => {
    setQuery(term)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'players': return <UserIcon className="h-4 w-4" />
      case 'teams': return <BuildingOfficeIcon className="h-4 w-4" />
      case 'leagues': return <TrophyIcon className="h-4 w-4" />
      case 'matches': return <ClockIcon className="h-4 w-4" />
      case 'countries': return <GlobeAltIcon className="h-4 w-4" />
      default: return <MagnifyingGlassIcon className="h-4 w-4" />
    }
  }

  const renderResults = () => {
    if (!results) return null

    const categories = [
      { key: 'players', label: 'Players', items: results.players },
      { key: 'teams', label: 'Teams', items: results.teams },
      { key: 'leagues', label: 'Leagues', items: results.leagues },
      { key: 'matches', label: 'Matches', items: results.matches },
      { key: 'countries', label: 'Countries', items: results.countries }
    ].filter(category => category.items && category.items.length > 0)

    if (categories.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No results found for "{query}"</p>
          <p className="text-sm mt-2">Try different keywords or check your spelling</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category.key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {getResultIcon(category.key)}
                {category.label}
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {category.items.length}
                </span>
              </h3>
              {category.key === 'players' && (
                <button
                  onClick={() => performAdvancedSearch('players')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Advanced Search
                </button>
              )}
            </div>
            
            <div className="grid gap-3">
              {category.items.map((item: any, index: number) => (
                <div
                  key={`${category.key}-${item.id || index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onResultClick?.(category.key, item)}
                >
                  <div className="flex items-center space-x-3">
                    {category.key === 'players' && (
                      <>
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.position} • {item.team.name} • {item.team.country.name}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {category.key === 'teams' && (
                      <>
                        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.country.name}</p>
                        </div>
                      </>
                    )}
                    
                    {category.key === 'leagues' && (
                      <>
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <TrophyIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.country.name} • {item.season}</p>
                        </div>
                      </>
                    )}
                    
                    {category.key === 'matches' && (
                      <>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ClockIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.homeTeam.name} vs {item.awayTeam.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.league.name} • {item.status}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {category.key === 'countries' && (
                      <>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {item.flagUrl ? (
                            <img src={item.flagUrl} alt={item.name} className="w-8 h-6 object-cover rounded" />
                          ) : (
                            <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.code}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-270" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players, teams, leagues, matches..."
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
            {loading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                showFilters || hasActiveFilters() 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Suggestions Dropdown */}
          {suggestions && Object.keys(suggestions).length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {Object.entries(suggestions).map(([category, items]) => (
                items.length > 0 && (
                  <div key={category} className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      {category}
                    </p>
                    {items.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Trending Searches */}
        {!query && trending.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {trending.slice(0, 8).map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(term)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Active Filters:</p>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                  >
                    {key}: {value}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                      className="hover:text-primary-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Player Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={filters.position}
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Positions</option>
                {metadata?.positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <input
                type="text"
                value={filters.teamName}
                onChange={(e) => setFilters(prev => ({ ...prev, teamName: e.target.value }))}
                placeholder="Team name..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={filters.countryName}
                onChange={(e) => setFilters(prev => ({ ...prev, countryName: e.target.value }))}
                placeholder="Country name..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select
                value={filters.season}
                onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Seasons</option>
                {metadata?.seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Match Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {metadata?.matchStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goals Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.minGoals}
                  onChange={(e) => setFilters(prev => ({ ...prev, minGoals: e.target.value }))}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={filters.maxGoals}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxGoals: e.target.value }))}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">League</label>
              <input
                type="text"
                value={filters.leagueName}
                onChange={(e) => setFilters(prev => ({ ...prev, leagueName: e.target.value }))}
                placeholder="League name..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => performSearch()}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        {results && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Found {results.totalResults} results for "{query}"
            </p>
          </div>
        )}
        
        {renderResults()}
      </div>
    </div>
  )
}