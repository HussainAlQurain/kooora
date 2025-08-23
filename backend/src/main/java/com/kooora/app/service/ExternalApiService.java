package com.kooora.app.service;

import com.kooora.app.entity.*;
import com.kooora.app.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Service for integrating with external football APIs for automatic data fetching
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Service
public class ExternalApiService {

    private static final Logger logger = LoggerFactory.getLogger(ExternalApiService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TeamStandingRepository teamStandingRepository;

    @Autowired
    private PlayerStatisticsRepository playerStatisticsRepository;

    @Autowired
    private LiveUpdateService liveUpdateService;

    // External API configuration
    @Value("${external.api.football.url:https://api.football-data.org/v4}")
    private String footballApiUrl;

    @Value("${external.api.football.key:}")
    private String footballApiKey;

    @Value("${external.api.enabled:false}")
    private boolean apiEnabled;

    // Rate limiting
    private final Map<String, Long> lastApiCall = new HashMap<>();
    private final long API_RATE_LIMIT = 60000; // 1 minute between calls

    /**
     * Fetch and update league standings
     */
    @Async
    public CompletableFuture<Void> updateLeagueStandings(Long leagueId) {
        if (!apiEnabled || footballApiKey.isEmpty()) {
            logger.info("External API is disabled or no API key provided");
            return CompletableFuture.completedFuture(null);
        }

        try {
            Optional<League> leagueOpt = leagueRepository.findById(leagueId);
            if (leagueOpt.isEmpty()) {
                logger.warn("League not found: {}", leagueId);
                return CompletableFuture.completedFuture(null);
            }

            League league = leagueOpt.get();
            String apiEndpoint = footballApiUrl + "/competitions/" + league.getId() + "/standings";

            if (!canMakeApiCall(apiEndpoint)) {
                logger.info("Rate limiting: skipping API call for {}", apiEndpoint);
                return CompletableFuture.completedFuture(null);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", footballApiKey);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                apiEndpoint, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseData = objectMapper.readTree(response.getBody());
                processStandingsData(league, responseData);
                
                // Broadcast standings update
                liveUpdateService.broadcastLeagueStandingsUpdate(leagueId);
                
                logger.info("Successfully updated standings for league: {}", league.getName());
            }

        } catch (HttpClientErrorException e) {
            logger.error("HTTP error updating league standings: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("Error updating league standings for league {}: {}", leagueId, e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Fetch and update live match scores
     */
    @Async
    public CompletableFuture<Void> updateLiveMatches() {
        if (!apiEnabled || footballApiKey.isEmpty()) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            String apiEndpoint = footballApiUrl + "/matches";

            if (!canMakeApiCall(apiEndpoint)) {
                return CompletableFuture.completedFuture(null);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", footballApiKey);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

            Map<String, String> params = new HashMap<>();
            params.put("status", "LIVE");
            params.put("dateFrom", LocalDate.now().toString());
            params.put("dateTo", LocalDate.now().toString());

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                apiEndpoint + "?status=LIVE", HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseData = objectMapper.readTree(response.getBody());
                processLiveMatchesData(responseData);
                logger.info("Successfully updated live matches");
            }

        } catch (Exception e) {
            logger.error("Error updating live matches: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Fetch and update player statistics
     */
    @Async
    public CompletableFuture<Void> updatePlayerStatistics(Long leagueId, String season) {
        if (!apiEnabled || footballApiKey.isEmpty()) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            String apiEndpoint = footballApiUrl + "/competitions/" + leagueId + "/scorers";

            if (!canMakeApiCall(apiEndpoint)) {
                return CompletableFuture.completedFuture(null);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", footballApiKey);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                apiEndpoint, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseData = objectMapper.readTree(response.getBody());
                processPlayerStatisticsData(leagueId, season, responseData);
                logger.info("Successfully updated player statistics for league: {}", leagueId);
            }

        } catch (Exception e) {
            logger.error("Error updating player statistics: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Fetch and update team information
     */
    @Async
    public CompletableFuture<Void> updateTeamInformation(Long leagueId) {
        if (!apiEnabled || footballApiKey.isEmpty()) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            String apiEndpoint = footballApiUrl + "/competitions/" + leagueId + "/teams";

            if (!canMakeApiCall(apiEndpoint)) {
                return CompletableFuture.completedFuture(null);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", footballApiKey);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                apiEndpoint, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseData = objectMapper.readTree(response.getBody());
                processTeamData(responseData);
                logger.info("Successfully updated team information for league: {}", leagueId);
            }

        } catch (Exception e) {
            logger.error("Error updating team information: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Scheduled task to update live matches every 30 seconds
     */
    @Scheduled(fixedDelay = 30000) // 30 seconds
    public void scheduledLiveMatchUpdate() {
        if (apiEnabled) {
            updateLiveMatches();
        }
    }

    /**
     * Scheduled task to update standings every 10 minutes
     */
    @Scheduled(fixedDelay = 600000) // 10 minutes
    public void scheduledStandingsUpdate() {
        if (apiEnabled) {
            List<League> activeLeagues = leagueRepository.findByStatus(League.LeagueStatus.ACTIVE);
            for (League league : activeLeagues) {
                updateLeagueStandings(league.getId());
            }
        }
    }

    /**
     * Scheduled task to update player statistics every hour
     */
    @Scheduled(fixedDelay = 3600000) // 1 hour
    public void scheduledPlayerStatsUpdate() {
        if (apiEnabled) {
            List<League> activeLeagues = leagueRepository.findByStatus(League.LeagueStatus.ACTIVE);
            for (League league : activeLeagues) {
                updatePlayerStatistics(league.getId(), getCurrentSeason());
            }
        }
    }

    private boolean canMakeApiCall(String endpoint) {
        Long lastCall = lastApiCall.get(endpoint);
        long currentTime = System.currentTimeMillis();
        
        if (lastCall == null || (currentTime - lastCall) > API_RATE_LIMIT) {
            lastApiCall.put(endpoint, currentTime);
            return true;
        }
        
        return false;
    }

    private void processStandingsData(League league, JsonNode responseData) {
        try {
            JsonNode standings = responseData.get("standings");
            if (standings != null && standings.isArray()) {
                for (JsonNode standing : standings) {
                    JsonNode table = standing.get("table");
                    if (table != null && table.isArray()) {
                        for (JsonNode teamStanding : table) {
                            processTeamStanding(league, teamStanding);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error processing standings data: {}", e.getMessage());
        }
    }

    private void processTeamStanding(League league, JsonNode teamStandingData) {
        try {
            JsonNode teamNode = teamStandingData.get("team");
            if (teamNode == null) return;

            String teamName = teamNode.get("name").asText();
            Optional<Team> teamOpt = teamRepository.findByName(teamName);
            
            if (teamOpt.isPresent()) {
                Team team = teamOpt.get();
                
                // Update or create team standing
                Optional<TeamStanding> standingOpt = teamStandingRepository.findByTeamAndLeague(team, league);
                TeamStanding standing = standingOpt.orElse(new TeamStanding(team, league));
                
                standing.setPosition(teamStandingData.get("position").asInt());
                standing.setMatchesPlayed(teamStandingData.get("playedGames").asInt());
                standing.setWins(teamStandingData.get("won").asInt());
                standing.setDraws(teamStandingData.get("draw").asInt());
                standing.setLosses(teamStandingData.get("lost").asInt());
                standing.setGoalsFor(teamStandingData.get("goalsFor").asInt());
                standing.setGoalsAgainst(teamStandingData.get("goalsAgainst").asInt());
                standing.setGoalDifference(teamStandingData.get("goalDifference").asInt());
                standing.setPoints(teamStandingData.get("points").asInt());
                
                teamStandingRepository.save(standing);
            }
        } catch (Exception e) {
            logger.error("Error processing team standing: {}", e.getMessage());
        }
    }

    private void processLiveMatchesData(JsonNode responseData) {
        try {
            JsonNode matches = responseData.get("matches");
            if (matches != null && matches.isArray()) {
                for (JsonNode matchData : matches) {
                    processLiveMatch(matchData);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing live matches data: {}", e.getMessage());
        }
    }

    private void processLiveMatch(JsonNode matchData) {
        try {
            // Extract match information
            String homeTeamName = matchData.get("homeTeam").get("name").asText();
            String awayTeamName = matchData.get("awayTeam").get("name").asText();
            
            Optional<Team> homeTeam = teamRepository.findByName(homeTeamName);
            Optional<Team> awayTeam = teamRepository.findByName(awayTeamName);
            
            if (homeTeam.isPresent() && awayTeam.isPresent()) {
                // Find existing match
                List<Match> existingMatches = matchRepository.findByHomeTeamAndAwayTeam(homeTeam.get(), awayTeam.get());
                
                for (Match match : existingMatches) {
                    // Update match score and status
                    JsonNode score = matchData.get("score");
                    if (score != null) {
                        JsonNode fullTime = score.get("fullTime");
                        if (fullTime != null) {
                            Integer homeScore = fullTime.get("homeTeam").asInt();
                            Integer awayScore = fullTime.get("awayTeam").asInt();
                            
                            match.setHomeTeamScore(homeScore);
                            match.setAwayTeamScore(awayScore);
                        }
                    }
                    
                    String status = matchData.get("status").asText();
                    match.setStatus(convertStatus(status));
                    
                    Match updatedMatch = matchRepository.save(match);
                    
                    // Broadcast live update
                    liveUpdateService.broadcastMatchUpdate(updatedMatch);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing live match: {}", e.getMessage());
        }
    }

    private void processPlayerStatisticsData(Long leagueId, String season, JsonNode responseData) {
        try {
            Optional<League> leagueOpt = leagueRepository.findById(leagueId);
            if (leagueOpt.isEmpty()) return;
            
            League league = leagueOpt.get();
            JsonNode scorers = responseData.get("scorers");
            
            if (scorers != null && scorers.isArray()) {
                for (JsonNode scorerData : scorers) {
                    processPlayerStatistic(league, season, scorerData);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing player statistics data: {}", e.getMessage());
        }
    }

    private void processPlayerStatistic(League league, String season, JsonNode scorerData) {
        try {
            JsonNode playerNode = scorerData.get("player");
            if (playerNode == null) return;
            
            String playerName = playerNode.get("name").asText();
            String[] nameParts = playerName.split(" ", 2);
            String firstName = nameParts.length > 0 ? nameParts[0] : "";
            String lastName = nameParts.length > 1 ? nameParts[1] : "";
            
            Optional<Player> playerOpt = playerRepository.findByFirstNameAndLastName(firstName, lastName);
            
            if (playerOpt.isPresent()) {
                Player player = playerOpt.get();
                
                // Update or create player statistics
                Optional<PlayerStatistics> statsOpt = playerStatisticsRepository
                    .findByPlayerAndLeagueAndSeasonAndIsActiveTrue(player, league, season);
                
                PlayerStatistics stats = statsOpt.orElse(new PlayerStatistics(player, league, season));
                
                stats.setGoals(scorerData.get("numberOfGoals").asInt());
                stats.setAppearances(scorerData.has("appearances") ? scorerData.get("appearances").asInt() : stats.getAppearances());
                
                PlayerStatistics savedStats = playerStatisticsRepository.save(stats);
                
                // Broadcast stats update
                liveUpdateService.broadcastPlayerStatsUpdate(savedStats);
            }
        } catch (Exception e) {
            logger.error("Error processing player statistic: {}", e.getMessage());
        }
    }

    private void processTeamData(JsonNode responseData) {
        try {
            JsonNode teams = responseData.get("teams");
            if (teams != null && teams.isArray()) {
                for (JsonNode teamData : teams) {
                    processTeam(teamData);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing team data: {}", e.getMessage());
        }
    }

    private void processTeam(JsonNode teamData) {
        try {
            String teamName = teamData.get("name").asText();
            Optional<Team> teamOpt = teamRepository.findByName(teamName);
            
            if (teamOpt.isPresent()) {
                Team team = teamOpt.get();
                
                // Update team information
                if (teamData.has("shortName")) {
                    team.setShortName(teamData.get("shortName").asText());
                }
                if (teamData.has("crestUrl")) {
                    team.setLogoUrl(teamData.get("crestUrl").asText());
                }
                if (teamData.has("founded")) {
                    team.setFoundedYear(teamData.get("founded").asInt());
                }
                if (teamData.has("venue")) {
                    team.setStadiumName(teamData.get("venue").asText());
                }
                if (teamData.has("website")) {
                    team.setWebsite(teamData.get("website").asText());
                }
                
                teamRepository.save(team);
            }
        } catch (Exception e) {
            logger.error("Error processing team: {}", e.getMessage());
        }
    }

    private Match.MatchStatus convertStatus(String externalStatus) {
        switch (externalStatus.toUpperCase()) {
            case "LIVE":
            case "IN_PLAY":
                return Match.MatchStatus.LIVE;
            case "FINISHED":
            case "FULL_TIME":
                return Match.MatchStatus.COMPLETED;
            case "SCHEDULED":
            case "TIMED":
                return Match.MatchStatus.SCHEDULED;
            case "CANCELLED":
                return Match.MatchStatus.CANCELLED;
            case "POSTPONED":
                return Match.MatchStatus.POSTPONED;
            default:
                return Match.MatchStatus.SCHEDULED;
        }
    }

    private String getCurrentSeason() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        
        // Football season typically runs from August to May
        if (now.getMonthValue() >= 8) {
            return year + "/" + String.valueOf(year + 1).substring(2);
        } else {
            return (year - 1) + "/" + String.valueOf(year).substring(2);
        }
    }

    /**
     * Manual trigger for data synchronization
     */
    public void syncAllData() {
        if (!apiEnabled) {
            logger.info("External API is disabled");
            return;
        }
        
        logger.info("Starting manual data synchronization");
        
        List<League> activeLeagues = leagueRepository.findByStatus(League.LeagueStatus.ACTIVE);
        String currentSeason = getCurrentSeason();
        
        for (League league : activeLeagues) {
            updateLeagueStandings(league.getId());
            updatePlayerStatistics(league.getId(), currentSeason);
            updateTeamInformation(league.getId());
        }
        
        updateLiveMatches();
        
        logger.info("Manual data synchronization completed");
    }

    /**
     * Get API status and statistics
     */
    public Map<String, Object> getApiStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", apiEnabled);
        status.put("hasApiKey", !footballApiKey.isEmpty());
        status.put("apiUrl", footballApiUrl);
        status.put("lastApiCalls", lastApiCall.size());
        status.put("rateLimitMs", API_RATE_LIMIT);
        
        return status;
    }
}
