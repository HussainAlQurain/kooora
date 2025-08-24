'use client'

import { useState, useEffect } from 'react'
import { 
  TrophyIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  MapPinIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import DynamicLiveScoreWidget from '../components/DynamicLiveScoreWidget'
import Link from 'next/link'

interface Country {
  id: number
  name: string
  code: string
  flagUrl?: string
}

interface League {
  id: number
  name: string
  country: Country
  season: string
  status: string
}

interface Team {
  id: number
  name: string
  shortName: string
  country: Country
  logoUrl?: string
}

interface Match {
  id: number
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  leagueName: string
  leagueLogo?: string
  matchDate: string
  status: string
  homeScore?: number
  awayScore?: number
  venue?: string
}

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, leaguesRes, teamsRes, matchesRes] = await Promise.all([
          fetch('/api/public/countries'),
          fetch('/api/public/leagues'),
          fetch('/api/public/teams'),
          fetch('/api/public/matches/upcoming?limit=6')
        ])

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json()
          setCountries(countriesData.slice(0, 5)) // Show only first 5
        }

        if (leaguesRes.ok) {
          const leaguesData = await leaguesRes.json()
          setLeagues(leaguesData.slice(0, 6)) // Show only first 6
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json()
          setTeams(teamsData.slice(0, 8)) // Show only first 8
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.slice(0, 6)) // Show only first 6
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const features = [
    {
      name: 'Live Matches',
      description: 'Follow live football matches with real-time updates and scores',
      icon: CalendarIcon,
    },
    {
      name: 'League Tables',
      description: 'View comprehensive league standings and team statistics',
      icon: ChartBarIcon,
    },
    {
      name: 'Team Profiles',
      description: 'Explore detailed team information, players, and history',
      icon: UserGroupIcon,
    },
    {
      name: 'Player Stats',
      description: 'Access player statistics, performance metrics, and rankings',
      icon: StarIcon,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Kooora
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your ultimate destination for football leagues, matches, teams, and players
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/leagues" className="btn-primary text-lg px-8 py-3">
                Explore Leagues
              </Link>
              <Link href="/matches" className="btn-secondary text-lg px-8 py-3">
                View Matches
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for football
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From live match updates to comprehensive statistics, Kooora provides all the tools 
              you need to stay connected with the beautiful game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-4">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Scores Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Live Scores
            </h2>
            <p className="text-xl text-gray-600">
              Follow matches as they happen
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <DynamicLiveScoreWidget autoRefresh={true} showDetails={true} />
          </div>
        </div>
      </div>

      {/* Countries Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top Football Nations
            </h2>
            <p className="text-xl text-gray-600">
              Explore football from around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {countries.filter(country => country).map((country) => (
              <div key={country.id} className="card text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4">
                  {country.flagUrl ? (
                    <img 
                      src={country.flagUrl} 
                      alt={`${country.name} flag`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <MapPinIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{country.name}</h3>
                <p className="text-sm text-gray-500">{country.code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leagues Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Leagues
            </h2>
            <p className="text-xl text-gray-600">
              Follow the most exciting football competitions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leagues.filter(league => league && league.country).map((league) => (
              <div key={league.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <TrophyIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{league.name}</h3>
                    <p className="text-sm text-gray-500">{league.country?.name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{league.season}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    league.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {league.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Matches Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Matches
            </h2>
            <p className="text-xl text-gray-600">
              Don't miss these exciting upcoming fixtures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.filter(match => match).map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                    {match.leagueName}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    match.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    match.status === 'LIVE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                      {match.homeTeamLogo ? (
                        <img 
                          src={match.homeTeamLogo} 
                          alt={`${match.homeTeamName} logo`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 truncate">{match.homeTeamName}</span>
                  </div>
                  
                  <div className="px-4 text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {match.homeScore !== undefined && match.awayScore !== undefined 
                        ? `${match.homeScore} - ${match.awayScore}` 
                        : 'vs'
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center flex-1 justify-end">
                    <span className="font-medium text-gray-900 truncate">{match.awayTeamName}</span>
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center ml-3">
                      {match.awayTeamLogo ? (
                        <img 
                          src={match.awayTeamLogo} 
                          alt={`${match.awayTeamName} logo`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  {new Date(match.matchDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Teams
            </h2>
            <p className="text-xl text-gray-600">
              Discover legendary football clubs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teams.filter(team => team && team.country).map((team) => (
              <div key={team.id} className="card text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 mx-auto mb-4">
                  {team.logoUrl ? (
                    <img 
                      src={team.logoUrl} 
                      alt={`${team.name} logo`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <UserGroupIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{team.shortName}</p>
                <p className="text-xs text-gray-400">{team.country?.name || 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to dive into football?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of football fans and never miss a moment of the action.
          </p>
          <Link href="/leagues" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors duration-200">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
