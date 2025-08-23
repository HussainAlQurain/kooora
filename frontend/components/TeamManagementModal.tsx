'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  UserGroupIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Country {
  id: number
  name: string
  code: string
}

interface Team {
  id?: number
  name: string
  shortName: string
  country: Country
  foundedYear?: number
  stadiumName?: string
  stadiumCapacity?: number
  logoUrl?: string
  website?: string
  isActive: boolean
}

interface TeamManagementModalProps {
  isOpen: boolean
  onClose: () => void
  team?: Team | null
  onSave: () => void
}

export default function TeamManagementModal({ isOpen, onClose, team, onSave }: TeamManagementModalProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Team>({
    name: '',
    shortName: '',
    country: { id: 0, name: '', code: '' },
    foundedYear: undefined,
    stadiumName: '',
    stadiumCapacity: undefined,
    logoUrl: '',
    website: '',
    isActive: true
  })

  useEffect(() => {
    if (isOpen) {
      fetchCountries()
      if (team) {
        setFormData({
          ...team,
          foundedYear: team.foundedYear || undefined,
          stadiumCapacity: team.stadiumCapacity || undefined
        })
      } else {
        setFormData({
          name: '',
          shortName: '',
          country: { id: 0, name: '', code: '' },
          foundedYear: undefined,
          stadiumName: '',
          stadiumCapacity: undefined,
          logoUrl: '',
          website: '',
          isActive: true
        })
      }
    }
  }, [isOpen, team])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/public/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
        if (!team && data.length > 0) {
          setFormData(prev => ({ ...prev, country: data[0] }))
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
      toast.error('Failed to load countries')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.shortName || !formData.country.id) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const url = team ? `/api/teams/${team.id}` : '/api/teams'
      const method = team ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          countryId: formData.country.id
        })
      })

      if (response.ok) {
        toast.success(team ? 'Team updated successfully!' : 'Team created successfully!')
        onSave()
        onClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to save team')
      }
    } catch (error) {
      console.error('Error saving team:', error)
      toast.error('Failed to save team')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'countryId') {
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
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {team ? 'Edit Team' : 'Add New Team'}
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
            {/* Team Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Manchester United"
              />
            </div>

            {/* Short Name */}
            <div>
              <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 mb-2">
                Short Name *
              </label>
              <input
                type="text"
                name="shortName"
                id="shortName"
                required
                value={formData.shortName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="MAN UTD"
              />
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

            {/* Founded Year */}
            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                name="foundedYear"
                id="foundedYear"
                value={formData.foundedYear || ''}
                onChange={handleInputChange}
                min="1800"
                max="2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="1878"
              />
            </div>

            {/* Stadium Name */}
            <div>
              <label htmlFor="stadiumName" className="block text-sm font-medium text-gray-700 mb-2">
                Stadium Name
              </label>
              <input
                type="text"
                name="stadiumName"
                id="stadiumName"
                value={formData.stadiumName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Old Trafford"
              />
            </div>

            {/* Stadium Capacity */}
            <div>
              <label htmlFor="stadiumCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                Stadium Capacity
              </label>
              <input
                type="number"
                name="stadiumCapacity"
                id="stadiumCapacity"
                value={formData.stadiumCapacity || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="74310"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <div className="flex">
              <input
                type="url"
                name="logoUrl"
                id="logoUrl"
                value={formData.logoUrl}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/logo.png"
              />
              <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50">
                {formData.logoUrl ? (
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="w-8 h-8 object-cover rounded"
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

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              id="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://www.manutd.com"
            />
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
                <UserGroupIcon className="h-4 w-4 mr-2" />
              )}
              {team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
