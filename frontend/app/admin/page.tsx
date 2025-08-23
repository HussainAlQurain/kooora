'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading, user } = useAuth()

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500',
      stats: '24 users'
    },
    {
      title: 'League Management',
      description: 'Create and manage football leagues',
      icon: TrophyIcon,
      href: '/admin/leagues',
      color: 'bg-green-500',
      stats: '5 leagues'
    },
    {
      title: 'Match Management',
      description: 'Schedule and manage matches',
      icon: CalendarIcon,
      href: '/admin/matches',
      color: 'bg-purple-500',
      stats: '12 matches'
    },
    {
      title: 'Analytics',
      description: 'View app analytics and statistics',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-yellow-500',
      stats: '1.2K views'
    },
    {
      title: 'System Settings',
      description: 'Configure app settings and preferences',
      icon: Cog6ToothIcon,
      href: '/admin/settings',
      color: 'bg-gray-500',
      stats: 'Configure'
    },
    {
      title: 'Data Management',
      description: 'Import/export data and backups',
      icon: CircleStackIcon,
      href: '/admin/data',
      color: 'bg-indigo-500',
      stats: 'Sync ready'
    },
    {
      title: 'Notifications',
      description: 'Manage push notifications and alerts',
      icon: BellIcon,
      href: '/admin/notifications',
      color: 'bg-red-500',
      stats: '3 pending'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, <span className="font-medium">{user?.username}</span>. Manage your Kooora application.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Matches</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Leagues</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Page Views</p>
                <p className="text-2xl font-semibold text-gray-900">1.2K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(card.href)}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {card.stats}
                  </span>
                  <span className="text-sm text-primary-600 group-hover:text-primary-700">
                    Manage →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New user registered: john.doe@example.com</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Match updated: Arsenal vs Chelsea</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">League standings updated: Premier League</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}