package com.kooora.app.controller;

import com.kooora.app.entity.*;
import com.kooora.app.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Advanced search controller with full-text search, filtering, and autocomplete
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/search")
@Tag(name = "Search", description = "Advanced search and filtering APIs")
@CrossOrigin(origins = "*")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    private SearchService searchService;

    @GetMapping("/global")
    @Operation(summary = "Global search", description = "Search across all entities (players, teams, leagues, matches, countries)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved search results")
    public ResponseEntity<Map<String, Object>> globalSearch(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Maximum results per category") @RequestParam(defaultValue = "5") int limit) {
        
        try {
            logger.info("Global search query: {} (limit: {})", query, limit);
            Map<String, Object> results = searchService.globalSearch(query, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error in global search: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/players")
    @Operation(summary = "Advanced player search", description = "Search players with advanced filters")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved player search results")
    public ResponseEntity<Page<Player>> searchPlayers(
            @Parameter(description = "Search query (name)") @RequestParam(required = false) String query,
            @Parameter(description = "Player position") @RequestParam(required = false) String position,
            @Parameter(description = "Team name") @RequestParam(required = false) String teamName,
            @Parameter(description = "Country name") @RequestParam(required = false) String countryName,
            @Parameter(description = "Minimum age") @RequestParam(required = false) Integer minAge,
            @Parameter(description = "Maximum age") @RequestParam(required = false) Integer maxAge,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "lastName") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            logger.info("Advanced player search: query={}, position={}, team={}, country={}", 
                query, position, teamName, countryName);
            
            Page<Player> results = searchService.searchPlayersAdvanced(
                query, position, teamName, countryName, minAge, maxAge, 
                sortBy, sortDir, page, size);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error in player search: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/matches")
    @Operation(summary = "Advanced match search", description = "Search matches with advanced filters")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved match search results")
    public ResponseEntity<Page<Match>> searchMatches(
            @Parameter(description = "Team name") @RequestParam(required = false) String teamName,
            @Parameter(description = "League name") @RequestParam(required = false) String leagueName,
            @Parameter(description = "Match status") @RequestParam(required = false) String status,
            @Parameter(description = "Start date") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "matchDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            logger.info("Advanced match search: team={}, league={}, status={}, dateRange={} to {}", 
                teamName, leagueName, status, startDate, endDate);
            
            Page<Match> results = searchService.searchMatchesAdvanced(
                teamName, leagueName, status, startDate, endDate, 
                sortBy, sortDir, page, size);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error in match search: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/player-statistics")
    @Operation(summary = "Search player statistics", description = "Search player statistics with filters")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved player statistics search results")
    public ResponseEntity<Page<PlayerStatistics>> searchPlayerStatistics(
            @Parameter(description = "Player name") @RequestParam(required = false) String playerName,
            @Parameter(description = "League name") @RequestParam(required = false) String leagueName,
            @Parameter(description = "Season") @RequestParam(required = false) String season,
            @Parameter(description = "Minimum goals") @RequestParam(required = false) Integer minGoals,
            @Parameter(description = "Maximum goals") @RequestParam(required = false) Integer maxGoals,
            @Parameter(description = "Minimum assists") @RequestParam(required = false) Integer minAssists,
            @Parameter(description = "Maximum assists") @RequestParam(required = false) Integer maxAssists,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "goals") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            logger.info("Player statistics search: player={}, league={}, season={}, goals={}-{}, assists={}-{}", 
                playerName, leagueName, season, minGoals, maxGoals, minAssists, maxAssists);
            
            Page<PlayerStatistics> results = searchService.searchPlayerStatistics(
                playerName, leagueName, season, minGoals, maxGoals, minAssists, maxAssists,
                sortBy, sortDir, page, size);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error in player statistics search: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Search suggestions", description = "Get autocomplete suggestions for search queries")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved search suggestions")
    public ResponseEntity<Map<String, List<String>>> getSearchSuggestions(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Maximum suggestions per category") @RequestParam(defaultValue = "5") int limit) {
        
        try {
            logger.info("Search suggestions for: {} (limit: {})", query, limit);
            Map<String, List<String>> suggestions = searchService.getSearchSuggestions(query, limit);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            logger.error("Error getting search suggestions: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/metadata")
    @Operation(summary = "Search metadata", description = "Get search filters and metadata (positions, seasons, popular teams, etc.)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved search metadata")
    public ResponseEntity<Map<String, Object>> getSearchMetadata() {
        try {
            logger.info("Fetching search metadata");
            Map<String, Object> metadata = searchService.getSearchMetadata();
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            logger.error("Error getting search metadata: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trending")
    @Operation(summary = "Trending searches", description = "Get trending search terms")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved trending searches")
    public ResponseEntity<List<String>> getTrendingSearches() {
        try {
            logger.info("Fetching trending searches");
            List<String> trendingSearches = searchService.getTrendingSearches();
            return ResponseEntity.ok(trendingSearches);
        } catch (Exception e) {
            logger.error("Error getting trending searches: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/quick/{type}")
    @Operation(summary = "Quick search", description = "Quick search for specific entity types")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved quick search results")
    public ResponseEntity<Map<String, Object>> quickSearch(
            @Parameter(description = "Entity type (players, teams, leagues, matches, countries)") @PathVariable String type,
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Maximum results") @RequestParam(defaultValue = "10") int limit) {
        
        try {
            logger.info("Quick search for {}: {} (limit: {})", type, query, limit);
            
            Map<String, Object> results = searchService.globalSearch(query, limit);
            Map<String, Object> quickResults = Map.of(
                "type", type,
                "query", query,
                "results", results.getOrDefault(type, List.of()),
                "totalResults", results.getOrDefault("totalResults", 0)
            );
            
            return ResponseEntity.ok(quickResults);
        } catch (Exception e) {
            logger.error("Error in quick search: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/save-search")
    @Operation(summary = "Save search", description = "Save a search query for future use (future feature)")
    @ApiResponse(responseCode = "200", description = "Search saved successfully")
    public ResponseEntity<Map<String, String>> saveSearch(
            @Parameter(description = "Search query to save") @RequestBody Map<String, Object> searchQuery) {
        
        try {
            // This is a placeholder for future implementation
            logger.info("Save search request: {}", searchQuery);
            
            Map<String, String> response = Map.of(
                "status", "success",
                "message", "Search saved successfully (feature coming soon)"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error saving search: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}