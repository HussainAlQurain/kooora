'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  UserIcon,
  TrophyIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Player {
  id: number
  firstName: string
  lastName: string
  position: string
  jerseyNumber?: number
  dateOfBirth?: string
  heightCm?: number
  weightKg?: number
  photoUrl?: string
  nationality?: string
  isActive: boolean
  team: {
    id: number
    name: string
    shortName: string
  }
  country: {
    id: number
    name: string
    code: string
  }
}

interface Team {
  id: number
  name: string
  shortName: string
  logoUrl?: string
  country: {
    id: number
    name: string
  }
}

interface TeamSquadManagerProps {
  teamId?: number
  onPlayerSelect?: (player: Player) => void
  className?: string
}

export default function TeamSquadManager({ 
  teamId, 
  onPlayerSelect, 
  className = "" 
}: TeamSquadManagerProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number>(teamId || 0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [sortBy, setSortBy] = useState('jerseyNumber')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const positions = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']
  const sortOptions = [
    { value: 'jerseyNumber', label: 'Jersey Number' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'position', label: 'Position' },
    { value: 'age', label: 'Age' }
  ]

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeamId) {
      fetchPlayers()
    }
  }, [selectedTeamId])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/public/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
        if (!teamId && data.length > 0) {
          setSelectedTeamId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    }
  }

  const fetchPlayers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players?teamId=${selectedTeamId}`)
      if (response.ok) {
        const data = await response.json()
        setPlayers(data.content || data)
      } else {
        // Mock data for demonstration
        const mockPlayers: Player[] = [
          {
            id: 1,
            firstName: "Lionel",
            lastName: "Messi",
            position: "FORWARD",
            jerseyNumber: 10,
            dateOfBirth: "1987-06-24",
            heightCm: 170,
            weightKg: 72,
            photoUrl: "https://via.placeholder.com/150",
            nationality: "Argentine",
            isActive: true,
            team: { id: selectedTeamId, name: "Barcelona", shortName: "BAR" },
            country: { id: 1, name: "Argentina", code: "AR" }
          },
          {
            id: 2,
            firstName: "Marc-André",
            lastName: "ter Stegen",
            position: "GOALKEEPER",
            jerseyNumber: 1,
            dateOfBirth: "1992-04-30",
            heightCm: 187,
            weightKg: 85,
            nationality: "German",
            isActive: true,
            team: { id: selectedTeamId, name: "Barcelona", shortName: "BAR" },
            country: { id: 2, name: "Germany", code: "DE" }
          },
          {
            id: 3,
            firstName: "Pedri",
            lastName: "González",
            position: "MIDFIELDER",
            jerseyNumber: 8,
            dateOfBirth: "2002-11-25",
            heightCm: 174,
            weightKg: 60,
            nationality: "Spanish",
            isActive: true,
            team: { id: selectedTeamId, name: "Barcelona", shortName: "BAR" },
            country: { id: 3, name: "Spain", code: "ES" }
          },
          {
            id: 4,
            firstName: "Ronald",
            lastName: "Araújo",
            position: "DEFENDER",
            jerseyNumber: 4,
            dateOfBirth: "1999-03-07",
            heightCm: 188,
            weightKg: 78,
            nationality: "Uruguayan",
            isActive: true,
            team: { id: selectedTeamId, name: "Barcelona", shortName: "BAR" },
            country: { id: 4, name: "Uruguay", code: "UY" }
          }
        ]
        setPlayers(mockPlayers)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      toast.error('Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedPlayers = players
    .filter(player => {
      const matchesSearch = searchQuery === '' || 
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.jerseyNumber?.toString().includes(searchQuery)
      
      const matchesPosition = positionFilter === '' || player.position === positionFilter
      
      return matchesSearch && matchesPosition
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'jerseyNumber':
          return (a.jerseyNumber || 99) - (b.jerseyNumber || 99)
        case 'lastName':
          return a.lastName.localeCompare(b.lastName)
        case 'position':
          return a.position.localeCompare(b.position)
        case 'age':
          const ageA = a.dateOfBirth ? new Date().getFullYear() - new Date(a.dateOfBirth).getFullYear() : 0
          const ageB = b.dateOfBirth ? new Date().getFullYear() - new Date(b.dateOfBirth).getFullYear() : 0
          return ageA - ageB
        default:
          return 0
      }
    })

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GOALKEEPER': return 'bg-yellow-100 text-yellow-800'
      case 'DEFENDER': return 'bg-blue-100 text-blue-800'
      case 'MIDFIELDER': return 'bg-green-100 text-green-800'
      case 'FORWARD': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
  }

  const selectedTeam = teams.find(team => team.id === selectedTeamId)

  const PlayerCard = ({ player }: { player: Player }) => (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
      onClick={() => onPlayerSelect?.(player)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {player.photoUrl ? (
            <img 
              src={player.photoUrl} 
              alt={`${player.firstName} ${player.lastName}`}
              className="w-12 h-12 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <UserIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-sm text-gray-500">{player.nationality}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">
            {player.jerseyNumber || '--'}
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(player.position)}`}>
            {player.position}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {calculateAge(player.dateOfBirth) && (
          <div>
            <span className="text-gray-500">Age:</span>
            <span className="ml-1 font-medium">{calculateAge(player.dateOfBirth)}</span>
          </div>
        )}
        {player.heightCm && (
          <div>
            <span className="text-gray-500">Height:</span>
            <span className="ml-1 font-medium">{player.heightCm}cm</span>
          </div>
        )}
      </div>
    </div>
  )

  const PlayerListItem = ({ player }: { player: Player }) => (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex items-center justify-between"
      onClick={() => onPlayerSelect?.(player)}
    >
      <div className="flex items-center flex-1">
        <div className="text-lg font-bold text-primary-600 w-12 text-center">
          {player.jerseyNumber || '--'}
        </div>
        {player.photoUrl ? (
          <img 
            src={player.photoUrl} 
            alt={`${player.firstName} ${player.lastName}`}
            className="w-10 h-10 rounded-full object-cover mx-4"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-4">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-gray-500">{player.nationality}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPositionColor(player.position)}`}>
          {player.position}
        </span>
        <div className="ml-4 text-right">
          {calculateAge(player.dateOfBirth) && (
            <div className="text-sm text-gray-500">Age: {calculateAge(player.dateOfBirth)}</div>
          )}
          {player.heightCm && (
            <div className="text-sm text-gray-500">{player.heightCm}cm</div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 h-32"></div>
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
          <UserGroupIcon className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Squad Management</h2>
            {selectedTeam && (
              <p className="text-gray-600">{selectedTeam.name} • {filteredAndSortedPlayers.length} players</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            <ArrowsUpDownIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Team Selector */}
      {!teamId && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Choose a team...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Position Filter */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Positions</option>
            {positions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>

          {/* Add Player Button */}
          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Player
          </button>
        </div>
      </div>

      {/* Players Grid/List */}
      {filteredAndSortedPlayers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Found</h3>
          <p className="text-gray-500">
            {searchQuery || positionFilter 
              ? 'Try adjusting your search or filters'
              : 'This team has no players yet'
            }
          </p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          {filteredAndSortedPlayers.map(player => (
            viewMode === 'grid' 
              ? <PlayerCard key={player.id} player={player} />
              : <PlayerListItem key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Squad Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Squad Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {positions.map(position => {
            const count = filteredAndSortedPlayers.filter(p => p.position === position).length
            return (
              <div key={position} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">{position}S</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
