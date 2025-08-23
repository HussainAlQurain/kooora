'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalTeams: number
  totalPlayers: number
  totalMatches: number
  totalCountries: number
  activeLeagues: number
  upcomingMatches: number
  completedMatches: number
  topScorers: Array<{
    id: number
    name: string
    team: string
    goals: number
  }>
  recentActivity: Array<{
    id: number
    type: string
    description: string
    timestamp: string
  }>
  teamPerformance: Array<{
    team: string
    wins: number
    draws: number
    losses: number
    points: number
  }>
}

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className = "" }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      
      // Simulate fetching analytics data
      // In real app, this would call multiple API endpoints
      const [teamsRes, playersRes, matchesRes, countriesRes] = await Promise.all([
        fetch('/api/public/teams').catch(() => ({ ok: false })),
        fetch('/api/players?page=0&size=100').catch(() => ({ ok: false })),
        fetch('/api/matches?page=0&size=100').catch(() => ({ ok: false })),
        fetch('/api/public/countries').catch(() => ({ ok: false }))
      ])

      // Mock data for demonstration
      const mockStats: DashboardStats = {
        totalTeams: 6,
        totalPlayers: 18,
        totalMatches: 8,
        totalCountries: 5,
        activeLeagues: 3,
        upcomingMatches: 3,
        completedMatches: 5,
        topScorers: [
          { id: 1, name: "Lionel Messi", team: "Barcelona", goals: 15 },
          { id: 2, name: "Erling Haaland", team: "Manchester City", goals: 12 },
          { id: 3, name: "Kylian Mbappé", team: "Real Madrid", goals: 10 },
          { id: 4, name: "Harry Kane", team: "Bayern Munich", goals: 9 },
          { id: 5, name: "Mohamed Salah", team: "Liverpool", goals: 8 }
        ],
        recentActivity: [
          { id: 1, type: "MATCH", description: "Manchester City vs Arsenal completed", timestamp: "2 hours ago" },
          { id: 2, type: "PLAYER", description: "New player Lionel Messi added", timestamp: "4 hours ago" },
          { id: 3, type: "TEAM", description: "Real Madrid updated", timestamp: "6 hours ago" },
          { id: 4, type: "MATCH", description: "Barcelona vs Juventus scheduled", timestamp: "1 day ago" },
          { id: 5, type: "LEAGUE", description: "Premier League standings updated", timestamp: "1 day ago" }
        ],
        teamPerformance: [
          { team: "Manchester City", wins: 12, draws: 3, losses: 1, points: 39 },
          { team: "Arsenal", wins: 11, draws: 2, losses: 3, points: 35 },
          { team: "Real Madrid", wins: 10, draws: 4, losses: 2, points: 34 },
          { team: "Barcelona", wins: 9, draws: 3, losses: 4, points: 30 },
          { team: "Bayern Munich", wins: 8, draws: 4, losses: 4, points: 28 }
        ]
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalytics()
  }

  if (loading && !stats) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="h-6 w-6 bg-gray-300 rounded mr-3"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const StatCard = ({ icon: Icon, title, value, trend, trendValue }: any) => (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ChartBarIcon className="h-8 w-8 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <ChartBarIcon className="h-4 w-4 mr-2" />
          )}
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserGroupIcon}
          title="Total Teams"
          value={stats.totalTeams}
          trend="up"
          trendValue="+2"
        />
        <StatCard
          icon={UserIcon}
          title="Total Players"
          value={stats.totalPlayers}
          trend="up"
          trendValue="+5"
        />
        <StatCard
          icon={CalendarIcon}
          title="Total Matches"
          value={stats.totalMatches}
          trend="up"
          trendValue="+3"
        />
        <StatCard
          icon={TrophyIcon}
          title="Active Leagues"
          value={stats.activeLeagues}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Scorers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
              Top Scorers
            </h3>
            <span className="text-sm text-gray-500">This Season</span>
          </div>
          <div className="space-y-4">
            {stats.topScorers.map((scorer, index) => (
              <div key={scorer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{scorer.name}</p>
                    <p className="text-sm text-gray-500">{scorer.team}</p>
                  </div>
                </div>
                <div className="text-lg font-bold text-primary-600">
                  {scorer.goals}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`
                  w-2 h-2 rounded-full mt-2
                  ${activity.type === 'MATCH' ? 'bg-green-500' : 
                    activity.type === 'PLAYER' ? 'bg-blue-500' : 
                    activity.type === 'TEAM' ? 'bg-purple-500' : 'bg-orange-500'}
                `}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Wins</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Draws</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Losses</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Points</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Form</th>
              </tr>
            </thead>
            <tbody>
              {stats.teamPerformance.map((team, index) => (
                <tr key={team.team} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{team.team}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">{team.wins}</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-semibold">{team.draws}</td>
                  <td className="text-center py-3 px-4 text-red-600 font-semibold">{team.losses}</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900">{team.points}</td>
                  <td className="text-center py-3 px-4">
                    <div className="flex justify-center space-x-1">
                      {['W', 'W', 'D', 'W', 'L'].map((result, i) => (
                        <span
                          key={i}
                          className={`
                            w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                            ${result === 'W' ? 'bg-green-500 text-white' : 
                              result === 'D' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}
                          `}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Updates Indicator */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <div className="flex items-center">
          <div className="animate-pulse h-2 w-2 bg-green-400 rounded-full mr-2"></div>
          <span>Live data • Updates every 30 seconds</span>
        </div>
      </div>
    </div>
  )
}
