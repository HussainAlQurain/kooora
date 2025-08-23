package com.kooora.app.service;

import com.kooora.app.entity.*;
import com.kooora.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced search service with full-text search, filtering, and autocomplete
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Service
public class SearchService {

    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private PlayerStatisticsRepository playerStatisticsRepository;

    /**
     * Global search across all entities
     */
    public Map<String, Object> globalSearch(String query, int limit) {
        Map<String, Object> results = new HashMap<>();
        
        try {
            // Search players
            List<Player> players = searchPlayers(query, limit);
            results.put("players", players);

            // Search teams
            List<Team> teams = searchTeams(query, limit);
            results.put("teams", teams);

            // Search leagues
            List<League> leagues = searchLeagues(query, limit);
            results.put("leagues", leagues);

            // Search matches
            List<Match> matches = searchMatches(query, limit);
            results.put("matches", matches);

            // Search countries
            List<Country> countries = searchCountries(query, limit);
            results.put("countries", countries);

            // Add metadata
            int totalResults = players.size() + teams.size() + leagues.size() + matches.size() + countries.size();
            results.put("totalResults", totalResults);
            results.put("query", query);
            results.put("limit", limit);

            logger.info("Global search for '{}' returned {} total results", query, totalResults);

        } catch (Exception e) {
            logger.error("Error performing global search: {}", e.getMessage());
            results.put("error", "Search failed: " + e.getMessage());
        }

        return results;
    }

    /**
     * Advanced player search with filters
     */
    public Page<Player> searchPlayersAdvanced(String query, String position, String teamName, 
                                            String countryName, Integer minAge, Integer maxAge,
                                            String sortBy, String sortDir, int page, int size) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            // Start with basic search
            List<Player> allPlayers = new ArrayList<>();
            
            if (query != null && !query.trim().isEmpty()) {
                allPlayers = playerRepository.findByNameContaining(query.trim());
            } else {
                allPlayers = playerRepository.findByIsActiveTrue();
            }

            // Apply filters
            List<Player> filteredPlayers = allPlayers.stream()
                .filter(player -> position == null || position.isEmpty() || 
                    (player.getPosition() != null && player.getPosition().toLowerCase().contains(position.toLowerCase())))
                .filter(player -> teamName == null || teamName.isEmpty() || 
                    (player.getTeam() != null && player.getTeam().getName().toLowerCase().contains(teamName.toLowerCase())))
                .filter(player -> countryName == null || countryName.isEmpty() || 
                    (player.getCountry() != null && player.getCountry().getName().toLowerCase().contains(countryName.toLowerCase())))
                .filter(player -> {
                    if (minAge == null && maxAge == null) return true;
                    if (player.getDateOfBirth() == null) return false;
                    
                    int age = LocalDate.now().getYear() - player.getDateOfBirth().getYear();
                    return (minAge == null || age >= minAge) && (maxAge == null || age <= maxAge);
                })
                .collect(Collectors.toList());

            // Create page manually since we filtered in memory
            int start = Math.min(page * size, filteredPlayers.size());
            int end = Math.min(start + size, filteredPlayers.size());
            
            List<Player> pageContent = filteredPlayers.subList(start, end);
            
            return new PageImpl<>(pageContent, pageable, filteredPlayers.size());

        } catch (Exception e) {
            logger.error("Error in advanced player search: {}", e.getMessage());
            return Page.empty();
        }
    }

    /**
     * Search suggestions/autocomplete
     */
    public Map<String, List<String>> getSearchSuggestions(String query, int limit) {
        Map<String, List<String>> suggestions = new HashMap<>();
        
        try {
            if (query == null || query.trim().isEmpty()) {
                return suggestions;
            }

            String searchQuery = query.trim().toLowerCase();

            // Player suggestions
            List<String> playerSuggestions = playerRepository.findByNameContaining(searchQuery)
                .stream()
                .limit(limit)
                .map(player -> player.getFirstName() + " " + player.getLastName())
                .collect(Collectors.toList());
            suggestions.put("players", playerSuggestions);

            // Team suggestions
            List<String> teamSuggestions = teamRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .limit(limit)
                .map(Team::getName)
                .collect(Collectors.toList());
            suggestions.put("teams", teamSuggestions);

            // League suggestions
            List<String> leagueSuggestions = leagueRepository.findByNameContaining(searchQuery)
                .stream()
                .limit(limit)
                .map(League::getName)
                .collect(Collectors.toList());
            suggestions.put("leagues", leagueSuggestions);

            // Country suggestions
            List<String> countrySuggestions = countryRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .limit(limit)
                .map(Country::getName)
                .collect(Collectors.toList());
            suggestions.put("countries", countrySuggestions);

        } catch (Exception e) {
            logger.error("Error generating search suggestions: {}", e.getMessage());
        }

        return suggestions;
    }

    /**
     * Search matches with advanced filters
     */
    public Page<Match> searchMatchesAdvanced(String teamName, String leagueName, String status,
                                           LocalDate startDate, LocalDate endDate,
                                           String sortBy, String sortDir, int page, int size) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            List<Match> allMatches = matchRepository.findAll();

            // Apply filters
            List<Match> filteredMatches = allMatches.stream()
                .filter(match -> teamName == null || teamName.isEmpty() || 
                    (match.getHomeTeam().getName().toLowerCase().contains(teamName.toLowerCase()) ||
                     match.getAwayTeam().getName().toLowerCase().contains(teamName.toLowerCase())))
                .filter(match -> leagueName == null || leagueName.isEmpty() || 
                    match.getLeague().getName().toLowerCase().contains(leagueName.toLowerCase()))
                .filter(match -> status == null || status.isEmpty() || 
                    match.getStatus().toString().equalsIgnoreCase(status))
                .filter(match -> {
                    if (startDate == null && endDate == null) return true;
                    LocalDate matchDate = match.getMatchDate().toLocalDate();
                    return (startDate == null || !matchDate.isBefore(startDate)) &&
                           (endDate == null || !matchDate.isAfter(endDate));
                })
                .collect(Collectors.toList());

            // Create page
            int start = Math.min(page * size, filteredMatches.size());
            int end = Math.min(start + size, filteredMatches.size());
            
            List<Match> pageContent = filteredMatches.subList(start, end);
            
            return new PageImpl<>(pageContent, pageable, filteredMatches.size());

        } catch (Exception e) {
            logger.error("Error in advanced match search: {}", e.getMessage());
            return Page.empty();
        }
    }

    /**
     * Search player statistics with filters
     */
    public Page<PlayerStatistics> searchPlayerStatistics(String playerName, String leagueName, String season,
                                                         Integer minGoals, Integer maxGoals,
                                                         Integer minAssists, Integer maxAssists,
                                                         String sortBy, String sortDir, int page, int size) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            List<PlayerStatistics> allStats = playerStatisticsRepository.findAll();

            // Apply filters
            List<PlayerStatistics> filteredStats = allStats.stream()
                .filter(stat -> playerName == null || playerName.isEmpty() || 
                    (stat.getPlayer().getFirstName() + " " + stat.getPlayer().getLastName())
                        .toLowerCase().contains(playerName.toLowerCase()))
                .filter(stat -> leagueName == null || leagueName.isEmpty() || 
                    stat.getLeague().getName().toLowerCase().contains(leagueName.toLowerCase()))
                .filter(stat -> season == null || season.isEmpty() || 
                    stat.getSeason().equalsIgnoreCase(season))
                .filter(stat -> minGoals == null || stat.getGoals() >= minGoals)
                .filter(stat -> maxGoals == null || stat.getGoals() <= maxGoals)
                .filter(stat -> minAssists == null || stat.getAssists() >= minAssists)
                .filter(stat -> maxAssists == null || stat.getAssists() <= maxAssists)
                .filter(PlayerStatistics::getIsActive)
                .collect(Collectors.toList());

            // Create page
            int start = Math.min(page * size, filteredStats.size());
            int end = Math.min(start + size, filteredStats.size());
            
            List<PlayerStatistics> pageContent = filteredStats.subList(start, end);
            
            return new PageImpl<>(pageContent, pageable, filteredStats.size());

        } catch (Exception e) {
            logger.error("Error in player statistics search: {}", e.getMessage());
            return Page.empty();
        }
    }

    /**
     * Get popular search terms and filters
     */
    public Map<String, Object> getSearchMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        
        try {
            // Popular positions
            List<String> positions = Arrays.asList(
                "Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger", "Defender"
            );
            metadata.put("positions", positions);

            // Available seasons
            List<String> seasons = playerStatisticsRepository.findDistinctSeasons();
            metadata.put("seasons", seasons);

            // Match statuses
            List<String> statuses = Arrays.asList(
                "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED", "POSTPONED"
            );
            metadata.put("matchStatuses", statuses);

            // Popular teams (top 20 by player count)
            List<Map<String, Object>> popularTeams = teamRepository.findAll()
                .stream()
                .sorted((t1, t2) -> Integer.compare(
                    playerRepository.findByTeamAndIsActiveTrue(t2).size(),
                    playerRepository.findByTeamAndIsActiveTrue(t1).size()
                ))
                .limit(20)
                .map(team -> {
                    Map<String, Object> teamInfo = new HashMap<>();
                    teamInfo.put("id", team.getId());
                    teamInfo.put("name", team.getName());
                    teamInfo.put("shortName", team.getShortName());
                    teamInfo.put("country", team.getCountry().getName());
                    teamInfo.put("playerCount", playerRepository.findByTeamAndIsActiveTrue(team).size());
                    return teamInfo;
                })
                .collect(Collectors.toList());
            metadata.put("popularTeams", popularTeams);

            // Popular leagues
            List<Map<String, Object>> popularLeagues = leagueRepository.findByIsActiveTrue()
                .stream()
                .map(league -> {
                    Map<String, Object> leagueInfo = new HashMap<>();
                    leagueInfo.put("id", league.getId());
                    leagueInfo.put("name", league.getName());
                    leagueInfo.put("country", league.getCountry().getName());
                    leagueInfo.put("season", league.getSeason());
                    return leagueInfo;
                })
                .collect(Collectors.toList());
            metadata.put("popularLeagues", popularLeagues);

            // Countries with most players
            List<Map<String, Object>> popularCountries = countryRepository.findAll()
                .stream()
                .sorted((c1, c2) -> Integer.compare(
                    playerRepository.findByCountryAndIsActiveTrue(c2).size(),
                    playerRepository.findByCountryAndIsActiveTrue(c1).size()
                ))
                .limit(20)
                .map(country -> {
                    Map<String, Object> countryInfo = new HashMap<>();
                    countryInfo.put("id", country.getId());
                    countryInfo.put("name", country.getName());
                    countryInfo.put("code", country.getCode());
                    countryInfo.put("flagUrl", country.getFlagUrl());
                    countryInfo.put("playerCount", playerRepository.findByCountryAndIsActiveTrue(country).size());
                    return countryInfo;
                })
                .collect(Collectors.toList());
            metadata.put("popularCountries", popularCountries);

        } catch (Exception e) {
            logger.error("Error getting search metadata: {}", e.getMessage());
        }

        return metadata;
    }

    // Helper methods for basic searches
    private List<Player> searchPlayers(String query, int limit) {
        return playerRepository.findByNameContaining(query)
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    private List<Team> searchTeams(String query, int limit) {
        return teamRepository.findByNameContainingIgnoreCase(query)
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    private List<League> searchLeagues(String query, int limit) {
        return leagueRepository.findByNameContaining(query)
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    private List<Match> searchMatches(String query, int limit) {
        // Search matches by team names
        List<Match> matches = new ArrayList<>();
        
        List<Team> teams = teamRepository.findByNameContainingIgnoreCase(query);
        for (Team team : teams) {
            matches.addAll(matchRepository.findByTeam(team));
        }
        
        return matches.stream()
            .distinct()
            .limit(limit)
            .collect(Collectors.toList());
    }

    private List<Country> searchCountries(String query, int limit) {
        return countryRepository.findByNameContainingIgnoreCase(query)
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get trending searches (placeholder for future implementation)
     */
    public List<String> getTrendingSearches() {
        // This could be implemented with actual search analytics
        return Arrays.asList(
            "Messi", "Ronaldo", "Haaland", "Mbappe", "Premier League",
            "Champions League", "Manchester City", "Real Madrid", "Barcelona"
        );
    }
}
