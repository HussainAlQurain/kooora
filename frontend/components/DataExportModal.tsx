'use client'

import { useState } from 'react'
import { 
  XMarkIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface DataExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DataExportModal({ isOpen, onClose }: DataExportModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv')
  const [selectedData, setSelectedData] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })

  const dataTypes = [
    {
      id: 'teams',
      name: 'Teams',
      description: 'Team information, logos, and statistics',
      icon: TableCellsIcon,
      count: '6 teams'
    },
    {
      id: 'players',
      name: 'Players',
      description: 'Player profiles, positions, and team assignments',
      icon: TableCellsIcon,
      count: '15+ players'
    },
    {
      id: 'matches',
      name: 'Matches',
      description: 'Match schedules, results, and statistics',
      icon: CalendarIcon,
      count: '5+ matches'
    },
    {
      id: 'countries',
      name: 'Countries',
      description: 'Country information and flags',
      icon: TableCellsIcon,
      count: '5 countries'
    },
    {
      id: 'leagues',
      name: 'Leagues',
      description: 'League information and standings',
      icon: TrophyIcon,
      count: '3 leagues'
    },
    {
      id: 'standings',
      name: 'Team Standings',
      description: 'League tables and team performance',
      icon: ChartBarIcon,
      count: 'All standings'
    }
  ]

  const formatOptions = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for Excel/Sheets',
      icon: DocumentTextIcon,
      extension: '.csv'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation for developers',
      icon: DocumentArrowDownIcon,
      extension: '.json'
    }
  ]

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedData(prev => 
      prev.includes(dataType)
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    )
  }

  const handleSelectAll = () => {
    if (selectedData.length === dataTypes.length) {
      setSelectedData([])
    } else {
      setSelectedData(dataTypes.map(type => type.id))
    }
  }

  const handleExport = async () => {
    if (selectedData.length === 0) {
      toast.error('Please select at least one data type to export')
      return
    }

    setLoading(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would call the backend API
      const exportData = {
        format: selectedFormat,
        dataTypes: selectedData,
        dateRange: dateRange.from && dateRange.to ? dateRange : null,
        timestamp: new Date().toISOString()
      }

      // Create a downloadable file
      const filename = `kooora_export_${new Date().toISOString().split('T')[0]}.${selectedFormat}`
      const content = selectedFormat === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : convertToCSV(exportData)

      const blob = new Blob([content], { 
        type: selectedFormat === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Data exported successfully as ${filename}`)
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for demo
    return `Export Summary
Format: ${data.format}
Data Types: ${data.dataTypes.join(', ')}
Date Range: ${data.dateRange ? `${data.dateRange.from} to ${data.dateRange.to}` : 'All data'}
Generated: ${data.timestamp}

Note: This is a demo export. In production, actual data would be included.`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <DocumentArrowDownIcon className="h-6 w-6 mr-2 text-primary-600" />
            Export Data
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Format Selection */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Export Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatOptions.map((format) => (
                <div
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as 'csv' | 'json')}
                  className={`
                    relative rounded-lg border p-4 cursor-pointer transition-colors
                    ${selectedFormat === format.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        checked={selectedFormat === format.id}
                        onChange={() => setSelectedFormat(format.id as 'csv' | 'json')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <format.icon className="h-5 w-5 text-gray-400 mr-2" />
                        <label className="font-medium text-gray-900 cursor-pointer">
                          {format.name} {format.extension}
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {format.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Type Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Data to Export</h4>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {selectedData.length === dataTypes.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataTypes.map((dataType) => (
                <div
                  key={dataType.id}
                  onClick={() => handleDataTypeToggle(dataType.id)}
                  className={`
                    relative rounded-lg border p-4 cursor-pointer transition-colors
                    ${selectedData.includes(dataType.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={selectedData.includes(dataType.id)}
                        onChange={() => handleDataTypeToggle(dataType.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <dataType.icon className="h-5 w-5 text-gray-400 mr-2" />
                        <label className="font-medium text-gray-900 cursor-pointer">
                          {dataType.name}
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {dataType.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {dataType.count}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range (for matches and time-sensitive data) */}
          {selectedData.some(type => ['matches', 'standings'].includes(type)) && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Date Range (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Leave blank to export all available data
              </p>
            </div>
          )}

          {/* Export Summary */}
          {selectedData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Export Summary</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Format: <span className="font-medium">{selectedFormat.toUpperCase()}</span></div>
                <div>Data Types: <span className="font-medium">{selectedData.length} selected</span></div>
                {dateRange.from && dateRange.to && (
                  <div>Date Range: <span className="font-medium">{dateRange.from} to {dateRange.to}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading || selectedData.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
