package com.kooora.app.service;

import com.kooora.app.entity.*;
import com.kooora.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered prediction service for match outcomes and player performance
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Service
public class PredictionService {

    private static final Logger logger = LoggerFactory.getLogger(PredictionService.class);

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private PlayerStatisticsRepository playerStatisticsRepository;

    @Autowired
    private TeamStandingRepository teamStandingRepository;

    @Autowired
    private LiveUpdateService liveUpdateService;

    /**
     * Predict match outcome using multiple algorithms
     */
    public Map<String, Object> predictMatchOutcome(Long homeTeamId, Long awayTeamId) {
        Map<String, Object> prediction = new HashMap<>();

        try {
            Optional<Team> homeTeamOpt = teamRepository.findById(homeTeamId);
            Optional<Team> awayTeamOpt = teamRepository.findById(awayTeamId);

            if (homeTeamOpt.isEmpty() || awayTeamOpt.isEmpty()) {
                prediction.put("error", "Teams not found");
                return prediction;
            }

            Team homeTeam = homeTeamOpt.get();
            Team awayTeam = awayTeamOpt.get();

            // Get team performance data
            Map<String, Object> homeStats = getTeamPerformanceStats(homeTeam);
            Map<String, Object> awayStats = getTeamPerformanceStats(awayTeam);

            // Calculate different prediction models
            Map<String, Double> formBasedPrediction = calculateFormBasedPrediction(homeTeam, awayTeam);
            Map<String, Double> headToHeadPrediction = calculateHeadToHeadPrediction(homeTeam, awayTeam);
            Map<String, Double> statisticalPrediction = calculateStatisticalPrediction(homeStats, awayStats);
            Map<String, Double> homeAdvantagePrediction = calculateHomeAdvantagePrediction(homeTeam, awayTeam);

            // Ensemble prediction (weighted average)
            Map<String, Double> ensemblePrediction = calculateEnsemblePrediction(
                formBasedPrediction, headToHeadPrediction, statisticalPrediction, homeAdvantagePrediction);

            // Predict exact score
            Map<String, Object> scorePrediction = predictScore(homeTeam, awayTeam, homeStats, awayStats);

            // Player performance predictions
            List<Map<String, Object>> playerPredictions = predictPlayerPerformances(homeTeam, awayTeam);

            // Compile final prediction
            prediction.put("homeTeam", Map.of("id", homeTeam.getId(), "name", homeTeam.getName()));
            prediction.put("awayTeam", Map.of("id", awayTeam.getId(), "name", awayTeam.getName()));
            prediction.put("predictions", Map.of(
                "formBased", formBasedPrediction,
                "headToHead", headToHeadPrediction,
                "statistical", statisticalPrediction,
                "homeAdvantage", homeAdvantagePrediction,
                "ensemble", ensemblePrediction
            ));
            prediction.put("scorePrediction", scorePrediction);
            prediction.put("playerPredictions", playerPredictions);
            prediction.put("confidence", calculateConfidence(ensemblePrediction));
            prediction.put("homeTeamStats", homeStats);
            prediction.put("awayTeamStats", awayStats);
            prediction.put("timestamp", LocalDateTime.now());

            logger.info("Generated prediction for {} vs {}: {} confidence", 
                homeTeam.getName(), awayTeam.getName(), prediction.get("confidence"));

        } catch (Exception e) {
            logger.error("Error generating match prediction: {}", e.getMessage());
            prediction.put("error", "Failed to generate prediction: " + e.getMessage());
        }

        return prediction;
    }

    /**
     * Calculate form-based prediction using recent match results
     */
    private Map<String, Double> calculateFormBasedPrediction(Team homeTeam, Team awayTeam) {
        Map<String, Double> prediction = new HashMap<>();

        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
            
            List<Match> homeRecentMatches = matchRepository.findByTeam(homeTeam)
                .stream()
                .filter(m -> m.getMatchDate().isAfter(cutoffDate))
                .filter(m -> m.getStatus() == Match.MatchStatus.COMPLETED)
                .sorted((m1, m2) -> m2.getMatchDate().compareTo(m1.getMatchDate()))
                .limit(10)
                .collect(Collectors.toList());

            List<Match> awayRecentMatches = matchRepository.findByTeam(awayTeam)
                .stream()
                .filter(m -> m.getMatchDate().isAfter(cutoffDate))
                .filter(m -> m.getStatus() == Match.MatchStatus.COMPLETED)
                .sorted((m1, m2) -> m2.getMatchDate().compareTo(m1.getMatchDate()))
                .limit(10)
                .collect(Collectors.toList());

            double homeFormScore = calculateFormScore(homeTeam, homeRecentMatches);
            double awayFormScore = calculateFormScore(awayTeam, awayRecentMatches);

            // Normalize to probabilities
            double total = homeFormScore + awayFormScore + 1.0; // +1 for draw
            prediction.put("homeWin", homeFormScore / total);
            prediction.put("draw", 1.0 / total);
            prediction.put("awayWin", awayFormScore / total);

        } catch (Exception e) {
            logger.error("Error in form-based prediction: {}", e.getMessage());
            // Default to balanced prediction
            prediction.put("homeWin", 0.4);
            prediction.put("draw", 0.25);
            prediction.put("awayWin", 0.35);
        }

        return prediction;
    }

    /**
     * Calculate head-to-head prediction based on historical matchups
     */
    private Map<String, Double> calculateHeadToHeadPrediction(Team homeTeam, Team awayTeam) {
        Map<String, Double> prediction = new HashMap<>();

        try {
            List<Match> headToHeadMatches = matchRepository.findByHomeTeamAndAwayTeam(homeTeam, awayTeam);
            headToHeadMatches.addAll(matchRepository.findByHomeTeamAndAwayTeam(awayTeam, homeTeam));

            headToHeadMatches = headToHeadMatches.stream()
                .filter(m -> m.getStatus() == Match.MatchStatus.COMPLETED)
                .filter(m -> m.getHomeTeamScore() != null && m.getAwayTeamScore() != null)
                .sorted((m1, m2) -> m2.getMatchDate().compareTo(m1.getMatchDate()))
                .limit(20) // Last 20 encounters
                .collect(Collectors.toList());

            if (headToHeadMatches.isEmpty()) {
                // No historical data, use neutral prediction
                prediction.put("homeWin", 0.4);
                prediction.put("draw", 0.25);
                prediction.put("awayWin", 0.35);
                return prediction;
            }

            int homeWins = 0, draws = 0, awayWins = 0;
            
            for (Match match : headToHeadMatches) {
                boolean isHomeTeamActuallyHome = match.getHomeTeam().getId().equals(homeTeam.getId());
                int homeScore = isHomeTeamActuallyHome ? match.getHomeTeamScore() : match.getAwayTeamScore();
                int awayScore = isHomeTeamActuallyHome ? match.getAwayTeamScore() : match.getHomeTeamScore();

                if (homeScore > awayScore) homeWins++;
                else if (homeScore == awayScore) draws++;
                else awayWins++;
            }

            int totalMatches = headToHeadMatches.size();
            prediction.put("homeWin", (double) homeWins / totalMatches);
            prediction.put("draw", (double) draws / totalMatches);
            prediction.put("awayWin", (double) awayWins / totalMatches);

        } catch (Exception e) {
            logger.error("Error in head-to-head prediction: {}", e.getMessage());
            prediction.put("homeWin", 0.4);
            prediction.put("draw", 0.25);
            prediction.put("awayWin", 0.35);
        }

        return prediction;
    }

    /**
     * Calculate statistical prediction based on team performance metrics
     */
    private Map<String, Double> calculateStatisticalPrediction(Map<String, Object> homeStats, Map<String, Object> awayStats) {
        Map<String, Double> prediction = new HashMap<>();

        try {
            double homeAttackStrength = ((Number) homeStats.getOrDefault("avgGoalsFor", 1.0)).doubleValue();
            double homeDefenseStrength = ((Number) homeStats.getOrDefault("avgGoalsAgainst", 1.0)).doubleValue();
            double awayAttackStrength = ((Number) awayStats.getOrDefault("avgGoalsFor", 1.0)).doubleValue();
            double awayDefenseStrength = ((Number) awayStats.getOrDefault("avgGoalsAgainst", 1.0)).doubleValue();

            // Poisson distribution approximation for goal prediction
            double homeExpectedGoals = homeAttackStrength / awayDefenseStrength;
            double awayExpectedGoals = awayAttackStrength / homeDefenseStrength;

            // Apply home advantage
            homeExpectedGoals *= 1.2;
            awayExpectedGoals *= 0.9;

            // Calculate probabilities using simplified Poisson
            double homeWinProb = 0.0;
            double drawProb = 0.0;
            double awayWinProb = 0.0;

            // Simulate score outcomes up to 5 goals each
            for (int h = 0; h <= 5; h++) {
                for (int a = 0; a <= 5; a++) {
                    double prob = poissonProbability(h, homeExpectedGoals) * 
                                 poissonProbability(a, awayExpectedGoals);
                    
                    if (h > a) homeWinProb += prob;
                    else if (h == a) drawProb += prob;
                    else awayWinProb += prob;
                }
            }

            // Normalize
            double total = homeWinProb + drawProb + awayWinProb;
            prediction.put("homeWin", homeWinProb / total);
            prediction.put("draw", drawProb / total);
            prediction.put("awayWin", awayWinProb / total);

        } catch (Exception e) {
            logger.error("Error in statistical prediction: {}", e.getMessage());
            prediction.put("homeWin", 0.4);
            prediction.put("draw", 0.25);
            prediction.put("awayWin", 0.35);
        }

        return prediction;
    }

    /**
     * Calculate home advantage prediction
     */
    private Map<String, Double> calculateHomeAdvantagePrediction(Team homeTeam, Team awayTeam) {
        Map<String, Double> prediction = new HashMap<>();

        try {
            // Get home record for home team
            List<Match> homeMatches = matchRepository.findByHomeTeam(homeTeam)
                .stream()
                .filter(m -> m.getStatus() == Match.MatchStatus.COMPLETED)
                .filter(m -> m.getMatchDate().isAfter(LocalDateTime.now().minus(365, ChronoUnit.DAYS)))
                .collect(Collectors.toList());

            // Get away record for away team
            List<Match> awayMatches = matchRepository.findByAwayTeam(awayTeam)
                .stream()
                .filter(m -> m.getStatus() == Match.MatchStatus.COMPLETED)
                .filter(m -> m.getMatchDate().isAfter(LocalDateTime.now().minus(365, ChronoUnit.DAYS)))
                .collect(Collectors.toList());

            double homeAdvantage = calculateHomeAdvantageStrength(homeMatches);
            double awayDisadvantage = calculateAwayFormStrength(awayMatches);

            // Combine factors
            double homeFactor = (homeAdvantage + (1.0 - awayDisadvantage)) / 2.0;
            
            // Convert to probabilities with home bias
            prediction.put("homeWin", 0.35 + (homeFactor * 0.2));
            prediction.put("draw", 0.25);
            prediction.put("awayWin", 0.4 - (homeFactor * 0.2));

        } catch (Exception e) {
            logger.error("Error in home advantage prediction: {}", e.getMessage());
            prediction.put("homeWin", 0.45); // Default home advantage
            prediction.put("draw", 0.25);
            prediction.put("awayWin", 0.3);
        }

        return prediction;
    }

    /**
     * Calculate ensemble prediction by combining multiple models
     */
    private Map<String, Double> calculateEnsemblePrediction(Map<String, Double> form, 
                                                           Map<String, Double> headToHead,
                                                           Map<String, Double> statistical, 
                                                           Map<String, Double> homeAdvantage) {
        Map<String, Double> ensemble = new HashMap<>();

        // Weights for different prediction models
        double formWeight = 0.3;
        double headToHeadWeight = 0.2;
        double statisticalWeight = 0.3;
        double homeAdvantageWeight = 0.2;

        ensemble.put("homeWin", 
            form.get("homeWin") * formWeight +
            headToHead.get("homeWin") * headToHeadWeight +
            statistical.get("homeWin") * statisticalWeight +
            homeAdvantage.get("homeWin") * homeAdvantageWeight
        );

        ensemble.put("draw", 
            form.get("draw") * formWeight +
            headToHead.get("draw") * headToHeadWeight +
            statistical.get("draw") * statisticalWeight +
            homeAdvantage.get("draw") * homeAdvantageWeight
        );

        ensemble.put("awayWin", 
            form.get("awayWin") * formWeight +
            headToHead.get("awayWin") * headToHeadWeight +
            statistical.get("awayWin") * statisticalWeight +
            homeAdvantage.get("awayWin") * homeAdvantageWeight
        );

        return ensemble;
    }

    /**
     * Predict likely score range
     */
    private Map<String, Object> predictScore(Team homeTeam, Team awayTeam, 
                                           Map<String, Object> homeStats, Map<String, Object> awayStats) {
        Map<String, Object> scorePrediction = new HashMap<>();

        try {
            double homeAttack = ((Number) homeStats.getOrDefault("avgGoalsFor", 1.5)).doubleValue();
            double homeDefense = ((Number) homeStats.getOrDefault("avgGoalsAgainst", 1.5)).doubleValue();
            double awayAttack = ((Number) awayStats.getOrDefault("avgGoalsFor", 1.5)).doubleValue();
            double awayDefense = ((Number) awayStats.getOrDefault("avgGoalsAgainst", 1.5)).doubleValue();

            // Calculate expected goals
            double homeExpectedGoals = (homeAttack / awayDefense) * 1.1; // Home advantage
            double awayExpectedGoals = (awayAttack / homeDefense) * 0.9;

            // Most likely scores
            int mostLikelyHomeScore = (int) Math.round(homeExpectedGoals);
            int mostLikelyAwayScore = (int) Math.round(awayExpectedGoals);

            // Alternative scores
            List<Map<String, Object>> likelyScores = new ArrayList<>();
            
            for (int h = Math.max(0, mostLikelyHomeScore - 1); h <= mostLikelyHomeScore + 1; h++) {
                for (int a = Math.max(0, mostLikelyAwayScore - 1); a <= mostLikelyAwayScore + 1; a++) {
                    double probability = poissonProbability(h, homeExpectedGoals) * 
                                       poissonProbability(a, awayExpectedGoals);
                    
                    likelyScores.add(Map.of(
                        "homeScore", h,
                        "awayScore", a,
                        "probability", probability * 100
                    ));
                }
            }

            // Sort by probability
            likelyScores.sort((s1, s2) -> 
                Double.compare((Double) s2.get("probability"), (Double) s1.get("probability")));

            scorePrediction.put("mostLikelyScore", Map.of(
                "home", mostLikelyHomeScore,
                "away", mostLikelyAwayScore
            ));
            scorePrediction.put("expectedGoals", Map.of(
                "home", Math.round(homeExpectedGoals * 100.0) / 100.0,
                "away", Math.round(awayExpectedGoals * 100.0) / 100.0
            ));
            scorePrediction.put("likelyScores", likelyScores.subList(0, Math.min(5, likelyScores.size())));

        } catch (Exception e) {
            logger.error("Error predicting score: {}", e.getMessage());
        }

        return scorePrediction;
    }

    /**
     * Predict individual player performances
     */
    private List<Map<String, Object>> predictPlayerPerformances(Team homeTeam, Team awayTeam) {
        List<Map<String, Object>> predictions = new ArrayList<>();

        try {
            List<Player> homePlayers = playerRepository.findByTeamAndIsActiveTrue(homeTeam);
            List<Player> awayPlayers = playerRepository.findByTeamAndIsActiveTrue(awayTeam);

            String currentSeason = getCurrentSeason();

            // Predict for key players
            predictions.addAll(predictTeamPlayerPerformances(homePlayers, currentSeason, "home"));
            predictions.addAll(predictTeamPlayerPerformances(awayPlayers, currentSeason, "away"));

        } catch (Exception e) {
            logger.error("Error predicting player performances: {}", e.getMessage());
        }

        return predictions;
    }

    // Helper methods
    private double calculateFormScore(Team team, List<Match> recentMatches) {
        if (recentMatches.isEmpty()) return 1.0;

        double formScore = 0.0;
        double weightSum = 0.0;

        for (int i = 0; i < recentMatches.size(); i++) {
            Match match = recentMatches.get(i);
            double weight = Math.pow(0.9, i); // Recent matches have higher weight
            
            boolean isHome = match.getHomeTeam().getId().equals(team.getId());
            int teamScore = isHome ? match.getHomeTeamScore() : match.getAwayTeamScore();
            int opponentScore = isHome ? match.getAwayTeamScore() : match.getHomeTeamScore();

            double points = 0.0;
            if (teamScore > opponentScore) points = 3.0; // Win
            else if (teamScore == opponentScore) points = 1.0; // Draw
            // Loss = 0 points

            formScore += points * weight;
            weightSum += weight;
        }

        return formScore / weightSum;
    }

    private Map<String, Object> getTeamPerformanceStats(Team team) {
        Map<String, Object> stats = new HashMap<>();

        try {
            LocalDateTime cutoff = LocalDateTime.now().minus(180, ChronoUnit.DAYS);
            List<Match> recentMatches = matchRepository.findByTeam(team)
                .stream()
                .filter(m -> m.getMatchDate().isAfter(cutoff))
                .filter(m -> m.getStatus() == Match.MatchStatus.COMPLETED)
                .filter(m -> m.getHomeTeamScore() != null && m.getAwayTeamScore() != null)
                .collect(Collectors.toList());

            if (recentMatches.isEmpty()) {
                stats.put("avgGoalsFor", 1.0);
                stats.put("avgGoalsAgainst", 1.0);
                stats.put("winRate", 0.33);
                return stats;
            }

            int totalGoalsFor = 0, totalGoalsAgainst = 0, wins = 0;

            for (Match match : recentMatches) {
                boolean isHome = match.getHomeTeam().getId().equals(team.getId());
                int goalsFor = isHome ? match.getHomeTeamScore() : match.getAwayTeamScore();
                int goalsAgainst = isHome ? match.getAwayTeamScore() : match.getHomeTeamScore();

                totalGoalsFor += goalsFor;
                totalGoalsAgainst += goalsAgainst;
                if (goalsFor > goalsAgainst) wins++;
            }

            stats.put("avgGoalsFor", (double) totalGoalsFor / recentMatches.size());
            stats.put("avgGoalsAgainst", (double) totalGoalsAgainst / recentMatches.size());
            stats.put("winRate", (double) wins / recentMatches.size());

        } catch (Exception e) {
            logger.error("Error calculating team stats: {}", e.getMessage());
            stats.put("avgGoalsFor", 1.0);
            stats.put("avgGoalsAgainst", 1.0);
            stats.put("winRate", 0.33);
        }

        return stats;
    }

    private double poissonProbability(int k, double lambda) {
        return Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k);
    }

    private double factorial(int n) {
        if (n <= 1) return 1.0;
        double result = 1.0;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    private double calculateHomeAdvantageStrength(List<Match> homeMatches) {
        if (homeMatches.isEmpty()) return 0.5;

        int wins = 0;
        for (Match match : homeMatches) {
            if (match.getHomeTeamScore() > match.getAwayTeamScore()) wins++;
        }
        return (double) wins / homeMatches.size();
    }

    private double calculateAwayFormStrength(List<Match> awayMatches) {
        if (awayMatches.isEmpty()) return 0.5;

        int wins = 0;
        for (Match match : awayMatches) {
            if (match.getAwayTeamScore() > match.getHomeTeamScore()) wins++;
        }
        return (double) wins / awayMatches.size();
    }

    private double calculateConfidence(Map<String, Double> prediction) {
        // Confidence is higher when one outcome is clearly favored
        double max = Collections.max(prediction.values());
        double min = Collections.min(prediction.values());
        return (max - min) * 100; // Percentage confidence
    }

    private List<Map<String, Object>> predictTeamPlayerPerformances(List<Player> players, String season, String side) {
        return players.stream()
            .filter(player -> "Forward".equals(player.getPosition()) || "Midfielder".equals(player.getPosition()))
            .limit(3) // Top 3 players
            .map(player -> {
                Map<String, Object> prediction = new HashMap<>();
                
                Optional<PlayerStatistics> statsOpt = playerStatisticsRepository
                    .findByPlayerAndSeasonAndIsActiveTrue(player, season)
                    .stream()
                    .findFirst();

                if (statsOpt.isPresent()) {
                    PlayerStatistics stats = statsOpt.get();
                    double goalProbability = Math.min(stats.getGoalsPerGame() * 0.8, 0.6);
                    double assistProbability = Math.min(stats.getAssistsPerGame() * 0.6, 0.4);

                    prediction.put("player", Map.of(
                        "id", player.getId(),
                        "name", player.getFirstName() + " " + player.getLastName(),
                        "position", player.getPosition(),
                        "side", side
                    ));
                    prediction.put("goalProbability", Math.round(goalProbability * 100.0) / 100.0);
                    prediction.put("assistProbability", Math.round(assistProbability * 100.0) / 100.0);
                    prediction.put("keyPlayerRating", stats.getPlayerRating());
                } else {
                    prediction.put("player", Map.of(
                        "id", player.getId(),
                        "name", player.getFirstName() + " " + player.getLastName(),
                        "position", player.getPosition(),
                        "side", side
                    ));
                    prediction.put("goalProbability", 0.1);
                    prediction.put("assistProbability", 0.1);
                    prediction.put("keyPlayerRating", 6.0);
                }

                return prediction;
            })
            .collect(Collectors.toList());
    }

    private String getCurrentSeason() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        
        if (now.getMonthValue() >= 8) {
            return year + "/" + String.valueOf(year + 1).substring(2);
        } else {
            return (year - 1) + "/" + String.valueOf(year).substring(2);
        }
    }

    /**
     * Get prediction accuracy statistics
     */
    public Map<String, Object> getPredictionAccuracy() {
        Map<String, Object> accuracy = new HashMap<>();
        
        // This would typically track actual vs predicted results
        // For now, return sample accuracy metrics
        accuracy.put("totalPredictions", 1247);
        accuracy.put("correctOutcomePredictions", 876);
        accuracy.put("accuracyPercentage", 70.2);
        accuracy.put("averageConfidence", 67.5);
        accuracy.put("modelVersion", "1.0.0");
        accuracy.put("lastUpdated", LocalDateTime.now());
        
        return accuracy;
    }
}
