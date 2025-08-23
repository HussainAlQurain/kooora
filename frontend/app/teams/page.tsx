'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  HomeIcon
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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterTeams()
  }, [teams, searchQuery, countryFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [teamsResponse, countriesResponse] = await Promise.all([
        fetch('/api/public/teams'),
        fetch('/api/public/countries')
      ])
      
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        setTeams(teamsData)
      } else {
        setError('Failed to load teams')
      }

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        setCountries(countriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const filterTeams = () => {
    let filtered = teams

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.country.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply country filter
    if (countryFilter) {
      filtered = filtered.filter(team => team.country.name === countryFilter)
    }

    setFilteredTeams(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterTeams()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCountryFilter('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
              <p className="mt-2 text-gray-600">
                Explore football teams from around the world
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search teams by name or country..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.name}>{country.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Search
              </button>
              
              {(searchQuery || countryFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredTeams.length} of {teams.length} teams
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
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teams</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Teams Grid */}
        {!loading && !error && (
          <>
            {filteredTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    {/* Team Header */}
                    <div className="flex items-center mb-4">
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
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {team.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {team.shortName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Team Details */}
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{team.country.name}</span>
                      </div>
                      
                      {team.foundedYear && (
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Founded {team.foundedYear}</span>
                        </div>
                      )}
                      
                      {team.stadiumName && (
                        <div className="flex items-center text-gray-600">
                          <HomeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{team.stadiumName}</span>
                        </div>
                      )}
                      
                      {team.stadiumCapacity && (
                        <div className="text-xs text-gray-500 mt-2">
                          Capacity: {team.stadiumCapacity.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    {/* View Team Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                        View Team Details →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Featured Teams Section */}
        {!loading && !error && teams.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Teams</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teams.slice(0, 4).map((team) => (
                <Link
                  key={`featured-${team.id}`}
                  href={`/teams/${team.id}`}
                  className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={`${team.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserGroupIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{team.shortName}</div>
                  <div className="text-xs text-gray-500">{team.country.name}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
