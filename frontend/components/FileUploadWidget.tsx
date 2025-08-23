'use client'

import { useState, useRef } from 'react'
import { 
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface FileUploadWidgetProps {
  category: 'teams' | 'players' | 'countries' | 'leagues'
  currentUrl?: string
  onUploadSuccess: (fileUrl: string) => void
  maxSize?: number // in MB
  accept?: string
  className?: string
  label?: string
  placeholder?: string
}

export default function FileUploadWidget({
  category,
  currentUrl,
  onUploadSuccess,
  maxSize = 5,
  accept = "image/*",
  className = "",
  label,
  placeholder
}: FileUploadWidgetProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/uploads/${category}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        onUploadSuccess(result.fileUrl)
      } else {
        toast.error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getCategoryLabel = () => {
    switch (category) {
      case 'teams': return 'Team Logo'
      case 'players': return 'Player Photo'
      case 'countries': return 'Country Flag'
      case 'leagues': return 'League Logo'
      default: return 'Image'
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
          ${dragOver 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {currentUrl ? (
          <div className="space-y-3">
            <div className="mx-auto h-20 w-20 rounded-lg overflow-hidden">
              <img 
                src={currentUrl} 
                alt="Current image" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div className="text-sm text-gray-600">
              Click or drag to replace {getCategoryLabel().toLowerCase()}
            </div>
            {uploading && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-primary-600">Uploading...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              ) : (
                <PhotoIcon className="h-12 w-12" />
              )}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900">
                {uploading ? 'Uploading...' : `Upload ${getCategoryLabel()}`}
              </div>
              <div className="text-xs text-gray-500">
                {placeholder || `Drag and drop or click to select ${getCategoryLabel().toLowerCase()}`}
              </div>
              <div className="text-xs text-gray-400">
                PNG, JPG, GIF up to {maxSize}MB
              </div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span className="text-sm font-medium text-primary-600">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-1">
          <CheckCircleIcon className="h-3 w-3 text-green-500" />
          <span>Supported: PNG, JPG, GIF, WebP</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircleIcon className="h-3 w-3 text-green-500" />
          <span>Maximum size: {maxSize}MB</span>
        </div>
        {category === 'teams' && (
          <div className="flex items-center space-x-1">
            <ArrowUpTrayIcon className="h-3 w-3 text-blue-500" />
            <span>Recommended: Square logo with transparent background</span>
          </div>
        )}
        {category === 'players' && (
          <div className="flex items-center space-x-1">
            <ArrowUpTrayIcon className="h-3 w-3 text-blue-500" />
            <span>Recommended: Portrait photo with 1:1 aspect ratio</span>
          </div>
        )}
        {category === 'countries' && (
          <div className="flex items-center space-x-1">
            <ArrowUpTrayIcon className="h-3 w-3 text-blue-500" />
            <span>Recommended: Official flag in 3:2 ratio</span>
          </div>
        )}
      </div>
    </div>
  )
}
