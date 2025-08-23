'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon,
  TrophyIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowsUpDownIcon
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

export default function PlayerProfilePage() {
  const params = useParams()
  const playerId = params.id as string
  
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/players/${playerId}`)
        
        if (response.ok) {
          const playerData = await response.json()
          setPlayer(playerData)
        } else {
          setError('Player not found')
        }
      } catch (error) {
        console.error('Error fetching player:', error)
        setError('Failed to load player data')
      } finally {
        setLoading(false)
      }
    }

    if (playerId) {
      fetchPlayer()
    }
  }, [playerId])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPositionColor = (position: string) => {
    const pos = position.toLowerCase()
    if (pos.includes('goalkeeper')) return 'bg-yellow-100 text-yellow-800'
    if (pos.includes('defender') || pos.includes('defence')) return 'bg-blue-100 text-blue-800'
    if (pos.includes('midfielder') || pos.includes('midfield')) return 'bg-green-100 text-green-800'
    if (pos.includes('forward') || pos.includes('striker') || pos.includes('winger')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Player Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested player could not be found.'}</p>
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {player.firstName} {player.lastName}
                </h1>
                <p className="text-gray-600">Player Profile</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(player.position)}`}>
                {player.position}
              </span>
              {player.jerseyNumber && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Photo and Basic Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={`${player.firstName} ${player.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {player.firstName} {player.lastName}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <Link 
                      href={`/teams/${player.team.id}`}
                      className="hover:text-primary-600 font-medium"
                    >
                      {player.team.name}
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{player.nationality}</span>
                  </div>
                  
                  <div className="flex items-center justify-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{calculateAge(player.dateOfBirth)} years old</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Stats */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Stats</h3>
              <div className="space-y-4">
                {player.heightCm && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <ArrowsUpDownIcon className="h-5 w-5 mr-2" />
                      <span>Height</span>
                    </div>
                    <span className="font-medium text-gray-900">{player.heightCm} cm</span>
                  </div>
                )}
                
                {player.weightKg && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <ScaleIcon className="h-5 w-5 mr-2" />
                      <span>Weight</span>
                    </div>
                    <span className="font-medium text-gray-900">{player.weightKg} kg</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Date of Birth</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatDate(player.dateOfBirth)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Details and Stats */}
          <div className="lg:col-span-2">
            {/* Career Overview */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Team</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{player.team.name}</p>
                      <p className="text-sm text-gray-500">{player.team.shortName}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Position Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primary Position:</span>
                      <span className="font-medium text-gray-900">{player.position}</span>
                    </div>
                    {player.jerseyNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jersey Number:</span>
                        <span className="font-medium text-gray-900">#{player.jerseyNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Season Statistics Placeholder */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Statistics</h3>
              <div className="text-center py-8">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Statistics Coming Soon</h4>
                <p className="text-gray-500">
                  Detailed player statistics including goals, assists, cards, and performance metrics will be available soon.
                </p>
              </div>
            </div>

            {/* Recent Matches Placeholder */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Matches</h3>
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Match History Coming Soon</h4>
                <p className="text-gray-500">
                  Recent match performances and detailed match statistics will be displayed here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
