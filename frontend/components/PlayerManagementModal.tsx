'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  UserIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Country {
  id: number
  name: string
  code: string
}

interface Team {
  id: number
  name: string
  shortName: string
}

interface Player {
  id?: number
  firstName: string
  lastName: string
  position: string
  team: Team
  country: Country
  dateOfBirth?: string
  jerseyNumber?: number
  heightCm?: number
  weightKg?: number
  photoUrl?: string
  nationality?: string
  isActive: boolean
}

interface PlayerManagementModalProps {
  isOpen: boolean
  onClose: () => void
  player?: Player | null
  onSave: () => void
}

const positions = [
  'GOALKEEPER',
  'DEFENDER',
  'MIDFIELDER',
  'FORWARD'
]

export default function PlayerManagementModal({ isOpen, onClose, player, onSave }: PlayerManagementModalProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Player>({
    firstName: '',
    lastName: '',
    position: 'MIDFIELDER',
    team: { id: 0, name: '', shortName: '' },
    country: { id: 0, name: '', code: '' },
    dateOfBirth: '',
    jerseyNumber: undefined,
    heightCm: undefined,
    weightKg: undefined,
    photoUrl: '',
    nationality: '',
    isActive: true
  })

  useEffect(() => {
    if (isOpen) {
      fetchCountries()
      fetchTeams()
      if (player) {
        setFormData({
          ...player,
          dateOfBirth: player.dateOfBirth ? player.dateOfBirth.split('T')[0] : '',
          jerseyNumber: player.jerseyNumber || undefined,
          heightCm: player.heightCm || undefined,
          weightKg: player.weightKg || undefined
        })
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          position: 'MIDFIELDER',
          team: { id: 0, name: '', shortName: '' },
          country: { id: 0, name: '', code: '' },
          dateOfBirth: '',
          jerseyNumber: undefined,
          heightCm: undefined,
          weightKg: undefined,
          photoUrl: '',
          nationality: '',
          isActive: true
        })
      }
    }
  }, [isOpen, player])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/public/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
        if (!player && data.length > 0) {
          setFormData(prev => ({ ...prev, country: data[0] }))
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
      toast.error('Failed to load countries')
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/public/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
        if (!player && data.length > 0) {
          setFormData(prev => ({ ...prev, team: data[0] }))
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.position || !formData.team.id || !formData.country.id) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const url = player ? `/api/players/${player.id}` : '/api/players'
      const method = player ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          teamId: formData.team.id,
          countryId: formData.country.id
        })
      })

      if (response.ok) {
        toast.success(player ? 'Player updated successfully!' : 'Player created successfully!')
        onSave()
        onClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to save player')
      }
    } catch (error) {
      console.error('Error saving player:', error)
      toast.error('Failed to save player')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'teamId') {
      const selectedTeam = teams.find(t => t.id === parseInt(value))
      if (selectedTeam) {
        setFormData(prev => ({ ...prev, team: selectedTeam }))
      }
    } else if (name === 'countryId') {
      const selectedCountry = countries.find(c => c.id === parseInt(value))
      if (selectedCountry) {
        setFormData(prev => ({ ...prev, country: selectedCountry }))
      }
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? undefined : parseInt(value) 
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {player ? 'Edit Player' : 'Add New Player'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Cristiano"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ronaldo"
              />
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <select
                name="position"
                id="position"
                required
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {positions.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div>
              <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
                Team *
              </label>
              <select
                name="teamId"
                id="teamId"
                required
                value={formData.team.id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="countryId"
                id="countryId"
                required
                value={formData.country.id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Jersey Number */}
            <div>
              <label htmlFor="jerseyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Jersey Number
              </label>
              <input
                type="number"
                name="jerseyNumber"
                id="jerseyNumber"
                value={formData.jerseyNumber || ''}
                onChange={handleInputChange}
                min="1"
                max="99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="7"
              />
            </div>

            {/* Height */}
            <div>
              <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="heightCm"
                id="heightCm"
                value={formData.heightCm || ''}
                onChange={handleInputChange}
                min="150"
                max="220"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="185"
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                id="weightKg"
                value={formData.weightKg || ''}
                onChange={handleInputChange}
                min="50"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="84"
              />
            </div>

            {/* Nationality */}
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                id="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Portuguese"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Photo URL
            </label>
            <div className="flex">
              <input
                type="url"
                name="photoUrl"
                id="photoUrl"
                value={formData.photoUrl}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/photo.jpg"
              />
              <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50">
                {formData.photoUrl ? (
                  <img 
                    src={formData.photoUrl} 
                    alt="Photo preview" 
                    className="w-8 h-8 object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <UserIcon className="h-4 w-4 mr-2" />
              )}
              {player ? 'Update Player' : 'Create Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
