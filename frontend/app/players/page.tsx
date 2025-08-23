'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Pagination from '../../components/Pagination'

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
}

interface Player {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  position: string
  jerseyNumber: string
  heightCm: number
  weightKg: number
  photoUrl: string
  team: Team
  country: Country
}

interface PlayersResponse {
  content: Player[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const pageSize = 12

  useEffect(() => {
    fetchPlayers()
  }, [currentPage, positionFilter])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/players?page=${currentPage}&size=${pageSize}&sortBy=lastName&sortDir=asc`)
      
      if (response.ok) {
        const data: PlayersResponse = await response.json()
        let filteredPlayers = data.content

        // Apply position filter
        if (positionFilter) {
          filteredPlayers = filteredPlayers.filter(player => 
            player.position.toLowerCase().includes(positionFilter.toLowerCase())
          )
        }

        // Apply search filter
        if (searchQuery) {
          filteredPlayers = filteredPlayers.filter(player =>
            player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.team.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        setPlayers(filteredPlayers)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } else {
        setError('Failed to load players')
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
    fetchPlayers()
  }

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

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Players</h1>
              <p className="mt-2 text-gray-600">
                Browse and discover football players from around the world
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
                    placeholder="Search players by name or team..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                  >
                    <option value="">All Positions</option>
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
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
            </div>
          </form>
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {players.length} of {totalElements} players
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
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Players</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchPlayers}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Players Grid */}
        {!loading && !error && (
          <>
            {players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {player.firstName} {player.lastName}
                      </h3>
                      
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                        
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          <span>{player.team.shortName || player.team.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span>{player.nationality}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Age: {calculateAge(player.dateOfBirth)}
                        </div>
                        
                        {player.jerseyNumber && (
                          <div className="text-sm font-medium text-gray-700">
                            #{player.jerseyNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPositionFilter('')
                    setCurrentPage(0)
                    fetchPlayers()
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage < 3 ? i : currentPage - 2 + i
                    if (pageNum >= totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
