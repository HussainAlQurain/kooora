'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CpuChipIcon,
  TrophyIcon,
  HomeIcon,
  MapPinIcon,
  UserIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface Team {
  id: number
  name: string
}

interface PredictionData {
  homeTeam: Team
  awayTeam: Team
  predictions: {
    ensemble: {
      homeWin: number
      draw: number
      awayWin: number
    }
    formBased: {
      homeWin: number
      draw: number
      awayWin: number
    }
    headToHead: {
      homeWin: number
      draw: number
      awayWin: number
    }
    statistical: {
      homeWin: number
      draw: number
      awayWin: number
    }
    homeAdvantage: {
      homeWin: number
      draw: number
      awayWin: number
    }
  }
  scorePrediction: {
    mostLikelyScore: {
      home: number
      away: number
    }
    expectedGoals: {
      home: number
      away: number
    }
    likelyScores: Array<{
      homeScore: number
      awayScore: number
      probability: number
    }>
  }
  playerPredictions: Array<{
    player: {
      id: number
      name: string
      position: string
      side: string
    }
    goalProbability: number
    assistProbability: number
    keyPlayerRating: number
  }>
  confidence: number
  homeTeamStats: {
    avgGoalsFor: number
    avgGoalsAgainst: number
    winRate: number
  }
  awayTeamStats: {
    avgGoalsFor: number
    avgGoalsAgainst: number
    winRate: number
  }
}

interface MatchPredictionProps {
  homeTeamId: number
  awayTeamId: number
  className?: string
}

export default function MatchPrediction({ homeTeamId, awayTeamId, className = "" }: MatchPredictionProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('ensemble')

  useEffect(() => {
    fetchPrediction()
  }, [homeTeamId, awayTeamId])

  const fetchPrediction = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/predictions/match/${homeTeamId}/vs/${awayTeamId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction')
      }
      
      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      console.error('Error fetching prediction:', err)
      setError('Failed to load prediction')
    } finally {
      setLoading(false)
    }
  }

  const formatPercentage = (value: number) => {
    return Math.round(value * 100)
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'homeWin': return 'bg-blue-500'
      case 'draw': return 'bg-yellow-500'
      case 'awayWin': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600'
    if (confidence >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPlayerPerformanceColor = (probability: number) => {
    if (probability >= 0.5) return 'text-green-600'
    if (probability >= 0.3) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
          <span className="text-gray-600">Generating AI prediction...</span>
        </div>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-12">
          <CpuChipIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || 'Failed to load prediction'}</p>
          <button
            onClick={fetchPrediction}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { ensemble } = prediction.predictions
  const mostLikelyOutcome = 
    ensemble.homeWin > ensemble.draw && ensemble.homeWin > ensemble.awayWin ? 'homeWin' :
    ensemble.awayWin > ensemble.draw ? 'awayWin' : 'draw'

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CpuChipIcon className="h-6 w-6 text-primary-600" />
            AI Match Prediction
          </h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)} bg-gray-100`}>
            <SparklesIcon className="h-4 w-4" />
            {Math.round(prediction.confidence)}% Confidence
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <HomeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{prediction.homeTeam.name}</h3>
            <p className="text-sm text-gray-500">Home</p>
          </div>
          
          <div className="text-center px-6">
            <div className="text-3xl font-bold text-gray-400 mb-2">VS</div>
            <div className="text-sm text-gray-500">
              {prediction.scorePrediction.mostLikelyScore.home} - {prediction.scorePrediction.mostLikelyScore.away}
            </div>
            <p className="text-xs text-gray-400">Predicted Score</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <MapPinIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{prediction.awayTeam.name}</h3>
            <p className="text-sm text-gray-500">Away</p>
          </div>
        </div>
      </div>

      {/* Main Prediction */}
      <div className="p-6">
        {/* Outcome Probabilities */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5" />
            Match Outcome Probability
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{prediction.homeTeam.name} Win</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${formatPercentage(ensemble.homeWin)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {formatPercentage(ensemble.homeWin)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Draw</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${formatPercentage(ensemble.draw)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {formatPercentage(ensemble.draw)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{prediction.awayTeam.name} Win</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${formatPercentage(ensemble.awayWin)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {formatPercentage(ensemble.awayWin)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Prediction */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Score Predictions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Goals</h4>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  {prediction.scorePrediction.expectedGoals.home}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-2xl font-bold text-red-600">
                  {prediction.scorePrediction.expectedGoals.away}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Most Likely Score</h4>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  {prediction.scorePrediction.mostLikelyScore.home}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-2xl font-bold text-red-600">
                  {prediction.scorePrediction.mostLikelyScore.away}
                </span>
              </div>
            </div>
          </div>

          {/* Alternative Scores */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Other Likely Scores</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.scorePrediction.likelyScores.slice(1, 6).map((score, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{score.homeScore}-{score.awayScore}</span>
                  <span className="text-gray-500 ml-2">({Math.round(score.probability)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player Predictions */}
        {prediction.playerPredictions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Key Player Predictions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction.playerPredictions.map((playerPred, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{playerPred.player.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      playerPred.player.side === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {playerPred.player.position}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Goal Probability:</span>
                      <span className={`font-semibold ${getPlayerPerformanceColor(playerPred.goalProbability)}`}>
                        {Math.round(playerPred.goalProbability * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Assist Probability:</span>
                      <span className={`font-semibold ${getPlayerPerformanceColor(playerPred.assistProbability)}`}>
                        {Math.round(playerPred.assistProbability * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Form Rating:</span>
                      <span className="font-semibold text-gray-900">
                        {playerPred.keyPlayerRating}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Stats Comparison */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5" />
            Team Performance Stats
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team Stats */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">{prediction.homeTeam.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Avg Goals For:</span>
                  <span className="font-semibold text-blue-900">
                    {prediction.homeTeamStats.avgGoalsFor.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Avg Goals Against:</span>
                  <span className="font-semibold text-blue-900">
                    {prediction.homeTeamStats.avgGoalsAgainst.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Win Rate:</span>
                  <span className="font-semibold text-blue-900">
                    {Math.round(prediction.homeTeamStats.winRate * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Away Team Stats */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-3">{prediction.awayTeam.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Avg Goals For:</span>
                  <span className="font-semibold text-red-900">
                    {prediction.awayTeamStats.avgGoalsFor.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Avg Goals Against:</span>
                  <span className="font-semibold text-red-900">
                    {prediction.awayTeamStats.avgGoalsAgainst.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Win Rate:</span>
                  <span className="font-semibold text-red-900">
                    {Math.round(prediction.awayTeamStats.winRate * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <CpuChipIcon className="h-4 w-4" />
            AI Algorithm Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatPercentage(prediction.predictions.formBased.homeWin)}%
              </div>
              <div className="text-gray-600">Form-Based</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {formatPercentage(prediction.predictions.headToHead.homeWin)}%
              </div>
              <div className="text-gray-600">Head-to-Head</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {formatPercentage(prediction.predictions.statistical.homeWin)}%
              </div>
              <div className="text-gray-600">Statistical</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {formatPercentage(prediction.predictions.homeAdvantage.homeWin)}%
              </div>
              <div className="text-gray-600">Home Advantage</div>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-500">
              Ensemble model combines all algorithms for final prediction
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
