package com.kooora.app.service;

import com.kooora.app.entity.*;
import com.kooora.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service that simulates live football data to provide realistic match updates
 * Creates live-looking matches with dynamic scores and statuses
 */
@Service
@Transactional
public class LiveDataSimulatorService {
    
    private static final Logger logger = LoggerFactory.getLogger(LiveDataSimulatorService.class);
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private LeagueRepository leagueRepository;
    
    // Track live matches and their progression
    private final Map<Long, MatchProgression> liveMatches = new HashMap<>();
    
    /**
     * Initialize realistic match schedule
     */
    public void initializeLiveMatches() {
        logger.info("🎮 Initializing live match simulation...");
        
        try {
            // Clear existing matches
            matchRepository.deleteAll();
            
            // Create realistic match schedule
            createTodayMatches();
            createUpcomingMatches();
            createRecentMatches();
            
            logger.info("✅ Live match simulation initialized successfully!");
            
        } catch (Exception e) {
            logger.error("❌ Error initializing live matches: ", e);
        }
    }
    
    /**
     * Create matches happening today with some live
     */
    private void createTodayMatches() {
        List<Team> teams = teamRepository.findAll();
        List<League> leagues = leagueRepository.findAll();
        
        if (teams.size() < 4 || leagues.isEmpty()) return;
        
        LocalDateTime now = LocalDateTime.now();
        
        // Create matches throughout the day
        List<LocalDateTime> matchTimes = Arrays.asList(
            now.withHour(15).withMinute(0), // 3:00 PM
            now.withHour(17).withMinute(30), // 5:30 PM  
            now.withHour(20).withMinute(0)   // 8:00 PM
        );
        
        Collections.shuffle(teams);
        League premierLeague = leagues.stream()
            .filter(l -> l.getName().contains("Premier"))
            .findFirst()
            .orElse(leagues.get(0));
            
        for (int i = 0; i < Math.min(matchTimes.size(), teams.size() / 2); i++) {
            Team homeTeam = teams.get(i * 2);
            Team awayTeam = teams.get(i * 2 + 1);
            LocalDateTime matchTime = matchTimes.get(i);
            
            Match match = createRealisticMatch(homeTeam, awayTeam, premierLeague, matchTime);
            
            // Determine match status based on time
            if (matchTime.isBefore(now.minusMinutes(90))) {
                // Match finished
                match.setStatus(Match.MatchStatus.COMPLETED);
                setRealisticFinalScore(match);
            } else if (matchTime.isBefore(now.plusMinutes(15))) {
                // Match is live or about to start
                match.setStatus(Match.MatchStatus.LIVE);
                setRealisticLiveScore(match);
            } else {
                // Match is scheduled
                match.setStatus(Match.MatchStatus.SCHEDULED);
            }
            
            Match saved = matchRepository.save(match);
            if (saved.getStatus() == Match.MatchStatus.LIVE) {
                liveMatches.put(saved.getId(), new MatchProgression(matchTime));
            }
            logger.info("📅 Created match: {} vs {} at {}", 
                homeTeam.getName(), awayTeam.getName(), matchTime);
        }
    }
    
    /**
     * Create upcoming matches for the next few days
     */
    private void createUpcomingMatches() {
        List<Team> teams = teamRepository.findAll();
        List<League> leagues = leagueRepository.findAll();
        
        if (teams.size() < 6 || leagues.isEmpty()) return;
        
        Collections.shuffle(teams);
        
        // Create matches for next 3 days
        for (int day = 1; day <= 3; day++) {
            LocalDateTime matchDay = LocalDateTime.now().plusDays(day).withHour(16).withMinute(0);
            
            League league = leagues.get(day % leagues.size());
            
            for (int i = 0; i < 2 && i * 2 + 1 < teams.size(); i++) {
                Team homeTeam = teams.get((day * 2 + i * 2) % teams.size());
                Team awayTeam = teams.get((day * 2 + i * 2 + 1) % teams.size());
                
                if (homeTeam.getId().equals(awayTeam.getId())) continue;
                
                LocalDateTime matchTime = matchDay.plusHours(i * 2);
                Match match = createRealisticMatch(homeTeam, awayTeam, league, matchTime);
                match.setStatus(Match.MatchStatus.SCHEDULED);
                
                matchRepository.save(match);
            }
        }
    }
    
    /**
     * Create some completed matches from recent days
     */
    private void createRecentMatches() {
        List<Team> teams = teamRepository.findAll();
        List<League> leagues = leagueRepository.findAll();
        
        if (teams.size() < 4 || leagues.isEmpty()) return;
        
        Collections.shuffle(teams);
        
        // Create matches for past 2 days
        for (int day = 1; day <= 2; day++) {
            LocalDateTime matchDay = LocalDateTime.now().minusDays(day).withHour(18).withMinute(0);
            
            League league = leagues.get(day % leagues.size());
            
            Team homeTeam = teams.get(day * 2 - 2);
            Team awayTeam = teams.get(day * 2 - 1);
            
            Match match = createRealisticMatch(homeTeam, awayTeam, league, matchDay);
            match.setStatus(Match.MatchStatus.COMPLETED);
            setRealisticFinalScore(match);
            
            matchRepository.save(match);
        }
    }
    
    /**
     * Update live matches every minute
     */
    @Scheduled(fixedRate = 60000) // Every 60 seconds
    public void updateLiveMatches() {
        if (liveMatches.isEmpty()) return;
        
        LocalDateTime now = LocalDateTime.now();
        List<Long> completedMatches = new ArrayList<>();
        
        for (Map.Entry<Long, MatchProgression> entry : liveMatches.entrySet()) {
            Long matchId = entry.getKey();
            MatchProgression progression = entry.getValue();
            
            if (matchId == null) {
                completedMatches.add(matchId);
                continue;
            }

            Optional<Match> matchOpt = matchRepository.findById(matchId);
            if (matchOpt.isEmpty()) {
                completedMatches.add(matchId);
                continue;
            }
            
            Match match = matchOpt.get();
            
            // Calculate match minute
            long minutesElapsed = ChronoUnit.MINUTES.between(progression.startTime, now);
            
            if (minutesElapsed > 95) {
                // Match finished
                match.setStatus(Match.MatchStatus.COMPLETED);
                setRealisticFinalScore(match);
                completedMatches.add(matchId);
                logger.info("⚽ Match finished: {} {} - {} {}", 
                    match.getHomeTeam().getName(), match.getHomeScore(),
                    match.getAwayScore(), match.getAwayTeam().getName());
            } else if (minutesElapsed > 45 && minutesElapsed < 50) {
                // Half time (still shown as LIVE)
                match.setStatus(Match.MatchStatus.LIVE);
                updateLiveScore(match, (int) minutesElapsed);
            } else if (minutesElapsed >= 0) {
                // Live match
                match.setStatus(Match.MatchStatus.LIVE);
                updateLiveScore(match, (int) minutesElapsed);
            }
            
            matchRepository.save(match);
        }
        
        // Remove completed matches
        completedMatches.forEach(liveMatches::remove);
    }
    
    private Match createRealisticMatch(Team homeTeam, Team awayTeam, League league, LocalDateTime matchTime) {
        Match match = new Match();
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setLeague(league);
        match.setMatchDate(matchTime);
        match.setVenue(homeTeam.getStadiumName());
        match.setReferee(getRandomReferee());
        match.setAttendance(ThreadLocalRandom.current().nextInt(25000, 75000));
        return match;
    }
    
    private void setRealisticFinalScore(Match match) {
        // Realistic football scores
        int[] possibleScores = {0, 1, 2, 3, 4, 5};
        int[] weights = {10, 25, 30, 20, 10, 5}; // Weighted probability
        
        int homeScore = getWeightedRandomScore(possibleScores, weights);
        int awayScore = getWeightedRandomScore(possibleScores, weights);
        
        // Slightly favor home team
        if (ThreadLocalRandom.current().nextDouble() < 0.1) {
            homeScore++;
        }
        
        match.setHomeScore(homeScore);
        match.setAwayScore(awayScore);
    }
    
    private void setRealisticLiveScore(Match match) {
        // Live matches usually have lower scores
        int homeScore = ThreadLocalRandom.current().nextInt(0, 3);
        int awayScore = ThreadLocalRandom.current().nextInt(0, 3);
        
        match.setHomeScore(homeScore);
        match.setAwayScore(awayScore);
    }
    
    private void updateLiveScore(Match match, int minute) {
        // Chance of goal every minute (realistic probability)
        double goalProbability = 0.02; // 2% per minute
        
        if (ThreadLocalRandom.current().nextDouble() < goalProbability) {
            if (ThreadLocalRandom.current().nextBoolean()) {
                match.setHomeScore(match.getHomeScore() + 1);
                logger.info("⚽ GOAL! {} scores! {}' - {} {} - {} {}", 
                    match.getHomeTeam().getName(), minute,
                    match.getHomeTeam().getName(), match.getHomeScore(),
                    match.getAwayScore(), match.getAwayTeam().getName());
            } else {
                match.setAwayScore(match.getAwayScore() + 1);
                logger.info("⚽ GOAL! {} scores! {}' - {} {} - {} {}", 
                    match.getAwayTeam().getName(), minute,
                    match.getHomeTeam().getName(), match.getHomeScore(),
                    match.getAwayScore(), match.getAwayTeam().getName());
            }
        }
    }
    
    private int getWeightedRandomScore(int[] scores, int[] weights) {
        int totalWeight = Arrays.stream(weights).sum();
        int randomWeight = ThreadLocalRandom.current().nextInt(totalWeight);
        
        int currentWeight = 0;
        for (int i = 0; i < scores.length; i++) {
            currentWeight += weights[i];
            if (randomWeight < currentWeight) {
                return scores[i];
            }
        }
        return 0;
    }
    
    private String getRandomReferee() {
        String[] referees = {
            "Michael Oliver", "Anthony Taylor", "Craig Pawson", 
            "Mike Dean", "Martin Atkinson", "Kevin Friend",
            "Paul Tierney", "Stuart Attwell", "Andre Marriner", 
            "Chris Kavanagh", "Jonathan Moss", "David Coote"
        };
        return referees[ThreadLocalRandom.current().nextInt(referees.length)];
    }
    
    /**
     * Get current live matches for API
     */
    public List<Match> getCurrentLiveMatches() {
        return matchRepository.findByStatus(Match.MatchStatus.LIVE);
    }
    
    /**
     * Get today's matches
     */
    public List<Match> getTodayMatches() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return matchRepository.findByMatchDateBetween(startOfDay, endOfDay);
    }
    
    /**
     * Track match progression
     */
    private static class MatchProgression {
        final LocalDateTime startTime;
        int currentMinute = 0;
        
        MatchProgression(LocalDateTime startTime) {
            this.startTime = startTime;
        }
    }
}
