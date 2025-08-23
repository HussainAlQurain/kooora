package com.kooora.app.controller;

import com.kooora.app.entity.PlayerStatistics;
import com.kooora.app.entity.Player;
import com.kooora.app.entity.League;
import com.kooora.app.repository.PlayerStatisticsRepository;
import com.kooora.app.repository.PlayerRepository;
import com.kooora.app.repository.LeagueRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * Controller for handling player statistics operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/player-statistics")
@Tag(name = "Player Statistics", description = "Player statistics management APIs")
@CrossOrigin(origins = "*")
public class PlayerStatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(PlayerStatisticsController.class);

    @Autowired
    private PlayerStatisticsRepository playerStatisticsRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private LeagueRepository leagueRepository;

    @GetMapping
    @Operation(summary = "Get all player statistics", description = "Retrieve paginated list of all player statistics")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved player statistics")
    public ResponseEntity<Page<PlayerStatistics>> getAllPlayerStatistics(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "goals") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "DESC") String direction) {

        try {
            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
            
            Page<PlayerStatistics> statistics = playerStatisticsRepository.findAll(pageable);
            
            logger.info("Retrieved {} player statistics", statistics.getTotalElements());
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error retrieving player statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get player statistics by ID", description = "Retrieve specific player statistics by ID")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved player statistics")
    @ApiResponse(responseCode = "404", description = "Player statistics not found")
    public ResponseEntity<PlayerStatistics> getPlayerStatisticsById(
            @Parameter(description = "Player statistics ID") @PathVariable Long id) {

        try {
            Optional<PlayerStatistics> statistics = playerStatisticsRepository.findById(id);
            
            if (statistics.isPresent()) {
                logger.info("Retrieved player statistics with ID: {}", id);
                return ResponseEntity.ok(statistics.get());
            } else {
                logger.warn("Player statistics not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving player statistics with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/player/{playerId}")
    @Operation(summary = "Get statistics by player", description = "Retrieve all statistics for a specific player")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved player statistics")
    @ApiResponse(responseCode = "404", description = "Player not found")
    public ResponseEntity<List<PlayerStatistics>> getStatisticsByPlayer(
            @Parameter(description = "Player ID") @PathVariable Long playerId) {

        try {
            Optional<Player> player = playerRepository.findById(playerId);
            
            if (player.isPresent()) {
                List<PlayerStatistics> statistics = playerStatisticsRepository.findByPlayerAndIsActiveTrue(player.get());
                logger.info("Retrieved {} statistics for player ID: {}", statistics.size(), playerId);
                return ResponseEntity.ok(statistics);
            } else {
                logger.warn("Player not found with ID: {}", playerId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving statistics for player {}: {}", playerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/league/{leagueId}")
    @Operation(summary = "Get statistics by league", description = "Retrieve all statistics for a specific league")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved league statistics")
    @ApiResponse(responseCode = "404", description = "League not found")
    public ResponseEntity<Page<PlayerStatistics>> getStatisticsByLeague(
            @Parameter(description = "League ID") @PathVariable Long leagueId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "goals") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "DESC") String direction) {

        try {
            Optional<League> league = leagueRepository.findById(leagueId);
            
            if (league.isPresent()) {
                Sort.Direction sortDirection = Sort.Direction.fromString(direction);
                Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
                
                Page<PlayerStatistics> statistics = playerStatisticsRepository.findByLeagueAndIsActiveTrue(league.get(), pageable);
                logger.info("Retrieved {} statistics for league ID: {}", statistics.getTotalElements(), leagueId);
                return ResponseEntity.ok(statistics);
            } else {
                logger.warn("League not found with ID: {}", leagueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving statistics for league {}: {}", leagueId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/league/{leagueId}/season/{season}")
    @Operation(summary = "Get statistics by league and season", description = "Retrieve statistics for a specific league and season")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics")
    @ApiResponse(responseCode = "404", description = "League not found")
    public ResponseEntity<Page<PlayerStatistics>> getStatisticsByLeagueAndSeason(
            @Parameter(description = "League ID") @PathVariable Long leagueId,
            @Parameter(description = "Season") @PathVariable String season,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "goals") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "DESC") String direction) {

        try {
            Optional<League> league = leagueRepository.findById(leagueId);
            
            if (league.isPresent()) {
                Sort.Direction sortDirection = Sort.Direction.fromString(direction);
                Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
                
                Page<PlayerStatistics> statistics = playerStatisticsRepository.findByLeagueAndSeasonAndIsActiveTrue(
                    league.get(), season, pageable);
                logger.info("Retrieved {} statistics for league {} season {}", statistics.getTotalElements(), leagueId, season);
                return ResponseEntity.ok(statistics);
            } else {
                logger.warn("League not found with ID: {}", leagueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving statistics for league {} season {}: {}", leagueId, season, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/top-scorers")
    @Operation(summary = "Get top scorers", description = "Retrieve top goal scorers for a season or league")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved top scorers")
    public ResponseEntity<List<PlayerStatistics>> getTopScorers(
            @Parameter(description = "League ID (optional)") @RequestParam(required = false) Long leagueId,
            @Parameter(description = "Season") @RequestParam(required = false) String season,
            @Parameter(description = "Limit") @RequestParam(defaultValue = "10") int limit) {

        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<PlayerStatistics> topScorers;

            if (leagueId != null && season != null) {
                Optional<League> league = leagueRepository.findById(leagueId);
                if (league.isPresent()) {
                    topScorers = playerStatisticsRepository.findTopScorersByLeagueAndSeason(league.get(), season, pageable);
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else if (season != null) {
                topScorers = playerStatisticsRepository.findTopScorersBySeason(season, pageable);
            } else {
                // Get current season top scorers
                topScorers = playerStatisticsRepository.findCurrentSeasonStatistics()
                    .stream()
                    .sorted((a, b) -> b.getGoals().compareTo(a.getGoals()))
                    .limit(limit)
                    .toList();
            }

            logger.info("Retrieved {} top scorers", topScorers.size());
            return ResponseEntity.ok(topScorers);
        } catch (Exception e) {
            logger.error("Error retrieving top scorers: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/top-assists")
    @Operation(summary = "Get top assist providers", description = "Retrieve top assist providers for a season or league")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved top assist providers")
    public ResponseEntity<List<PlayerStatistics>> getTopAssists(
            @Parameter(description = "League ID (optional)") @RequestParam(required = false) Long leagueId,
            @Parameter(description = "Season") @RequestParam(required = false) String season,
            @Parameter(description = "Limit") @RequestParam(defaultValue = "10") int limit) {

        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<PlayerStatistics> topAssists;

            if (leagueId != null && season != null) {
                Optional<League> league = leagueRepository.findById(leagueId);
                if (league.isPresent()) {
                    topAssists = playerStatisticsRepository.findTopAssistsByLeagueAndSeason(league.get(), season, pageable);
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else if (season != null) {
                topAssists = playerStatisticsRepository.findTopAssistsBySeason(season, pageable);
            } else {
                // Get current season top assists
                topAssists = playerStatisticsRepository.findCurrentSeasonStatistics()
                    .stream()
                    .sorted((a, b) -> b.getAssists().compareTo(a.getAssists()))
                    .limit(limit)
                    .toList();
            }

            logger.info("Retrieved {} top assist providers", topAssists.size());
            return ResponseEntity.ok(topAssists);
        } catch (Exception e) {
            logger.error("Error retrieving top assists: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/best-players")
    @Operation(summary = "Get best players by goals+assists", description = "Retrieve best players by combined goals and assists")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved best players")
    public ResponseEntity<List<PlayerStatistics>> getBestPlayers(
            @Parameter(description = "League ID") @RequestParam Long leagueId,
            @Parameter(description = "Season") @RequestParam String season,
            @Parameter(description = "Limit") @RequestParam(defaultValue = "10") int limit) {

        try {
            Optional<League> league = leagueRepository.findById(leagueId);
            
            if (league.isPresent()) {
                Pageable pageable = PageRequest.of(0, limit);
                List<PlayerStatistics> bestPlayers = playerStatisticsRepository.findBestPlayersByLeagueAndSeason(
                    league.get(), season, pageable);
                
                logger.info("Retrieved {} best players for league {} season {}", bestPlayers.size(), leagueId, season);
                return ResponseEntity.ok(bestPlayers);
            } else {
                logger.warn("League not found with ID: {}", leagueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving best players: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/best-goalkeepers")
    @Operation(summary = "Get best goalkeepers", description = "Retrieve best goalkeepers by clean sheets and saves")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved best goalkeepers")
    public ResponseEntity<List<PlayerStatistics>> getBestGoalkeepers(
            @Parameter(description = "League ID") @RequestParam Long leagueId,
            @Parameter(description = "Season") @RequestParam String season,
            @Parameter(description = "Limit") @RequestParam(defaultValue = "10") int limit) {

        try {
            Optional<League> league = leagueRepository.findById(leagueId);
            
            if (league.isPresent()) {
                Pageable pageable = PageRequest.of(0, limit);
                List<PlayerStatistics> bestGoalkeepers = playerStatisticsRepository.findBestGoalkeepersByLeagueAndSeason(
                    league.get(), season, pageable);
                
                logger.info("Retrieved {} best goalkeepers for league {} season {}", bestGoalkeepers.size(), leagueId, season);
                return ResponseEntity.ok(bestGoalkeepers);
            } else {
                logger.warn("League not found with ID: {}", leagueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving best goalkeepers: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/by-position")
    @Operation(summary = "Get statistics by position", description = "Retrieve statistics for players in a specific position")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics by position")
    public ResponseEntity<List<PlayerStatistics>> getStatisticsByPosition(
            @Parameter(description = "Player position") @RequestParam String position,
            @Parameter(description = "League ID") @RequestParam Long leagueId,
            @Parameter(description = "Season") @RequestParam String season,
            @Parameter(description = "Limit") @RequestParam(defaultValue = "20") int limit) {

        try {
            Optional<League> league = leagueRepository.findById(leagueId);
            
            if (league.isPresent()) {
                Pageable pageable = PageRequest.of(0, limit);
                List<PlayerStatistics> statistics = playerStatisticsRepository.findByPositionAndLeagueAndSeasonOrderByPerformance(
                    position, league.get(), season, pageable);
                
                logger.info("Retrieved {} statistics for position {} in league {} season {}", 
                    statistics.size(), position, leagueId, season);
                return ResponseEntity.ok(statistics);
            } else {
                logger.warn("League not found with ID: {}", leagueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving statistics by position: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/team/{teamId}/season/{season}")
    @Operation(summary = "Get team statistics", description = "Retrieve all player statistics for a team in a specific season")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved team statistics")
    public ResponseEntity<List<PlayerStatistics>> getTeamStatistics(
            @Parameter(description = "Team ID") @PathVariable Long teamId,
            @Parameter(description = "Season") @PathVariable String season) {

        try {
            List<PlayerStatistics> statistics = playerStatisticsRepository.findByTeamAndSeason(teamId, season);
            
            logger.info("Retrieved {} statistics for team {} season {}", statistics.size(), teamId, season);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error retrieving team statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search player statistics", description = "Search player statistics by player name")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved search results")
    public ResponseEntity<List<PlayerStatistics>> searchPlayerStatistics(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Limit") @RequestParam(defaultValue = "20") int limit) {

        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<PlayerStatistics> statistics = playerStatisticsRepository.searchByPlayerName(query, pageable);
            
            logger.info("Found {} statistics matching query: {}", statistics.size(), query);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error searching player statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/seasons")
    @Operation(summary = "Get available seasons", description = "Retrieve all available seasons")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved seasons")
    public ResponseEntity<List<String>> getAvailableSeasons() {
        try {
            List<String> seasons = playerStatisticsRepository.findDistinctSeasons();
            logger.info("Retrieved {} available seasons", seasons.size());
            return ResponseEntity.ok(seasons);
        } catch (Exception e) {
            logger.error("Error retrieving seasons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/summary/league/{leagueId}/season/{season}")
    @Operation(summary = "Get league statistics summary", description = "Get statistical summary for a league and season")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics summary")
    public ResponseEntity<Map<String, Object>> getLeagueStatisticsSummary(
            @Parameter(description = "League ID") @PathVariable Long leagueId,
            @Parameter(description = "Season") @PathVariable String season) {

        try {
            Optional<League> league = leagueRepository.findById(leagueId);
            
            if (league.isPresent()) {
                Object[] averages = playerStatisticsRepository.getAverageStatsByLeagueAndSeason(league.get(), season);
                long playersWithGoals = playerStatisticsRepository.countPlayersWithMinGoals(1, league.get(), season);
                long playersWithAssists = playerStatisticsRepository.countPlayersWithMinAssists(1, league.get(), season);
                
                Map<String, Object> summary = new HashMap<>();
                summary.put("averageGoals", averages[0]);
                summary.put("averageAssists", averages[1]);
                summary.put("averageAppearances", averages[2]);
                summary.put("averageMinutesPlayed", averages[3]);
                summary.put("playersWithGoals", playersWithGoals);
                summary.put("playersWithAssists", playersWithAssists);
                
                logger.info("Generated statistics summary for league {} season {}", leagueId, season);
                return ResponseEntity.ok(summary);
            } else {
                logger.warn("League not found with ID: {}", leagueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error generating statistics summary: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Operation(summary = "Create player statistics", description = "Create new player statistics record")
    @ApiResponse(responseCode = "201", description = "Player statistics created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlayerStatistics> createPlayerStatistics(
            @Valid @RequestBody PlayerStatistics playerStatistics) {

        try {
            PlayerStatistics savedStatistics = playerStatisticsRepository.save(playerStatistics);
            logger.info("Created player statistics with ID: {}", savedStatistics.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedStatistics);
        } catch (Exception e) {
            logger.error("Error creating player statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update player statistics", description = "Update existing player statistics")
    @ApiResponse(responseCode = "200", description = "Player statistics updated successfully")
    @ApiResponse(responseCode = "404", description = "Player statistics not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlayerStatistics> updatePlayerStatistics(
            @Parameter(description = "Player statistics ID") @PathVariable Long id,
            @Valid @RequestBody PlayerStatistics updatedStatistics) {

        try {
            Optional<PlayerStatistics> existingStatistics = playerStatisticsRepository.findById(id);
            
            if (existingStatistics.isPresent()) {
                updatedStatistics.setId(id);
                PlayerStatistics savedStatistics = playerStatisticsRepository.save(updatedStatistics);
                logger.info("Updated player statistics with ID: {}", id);
                return ResponseEntity.ok(savedStatistics);
            } else {
                logger.warn("Player statistics not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating player statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete player statistics", description = "Soft delete player statistics (set as inactive)")
    @ApiResponse(responseCode = "204", description = "Player statistics deleted successfully")
    @ApiResponse(responseCode = "404", description = "Player statistics not found")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlayerStatistics(
            @Parameter(description = "Player statistics ID") @PathVariable Long id) {

        try {
            Optional<PlayerStatistics> existingStatistics = playerStatisticsRepository.findById(id);
            
            if (existingStatistics.isPresent()) {
                PlayerStatistics statistics = existingStatistics.get();
                statistics.setIsActive(false);
                playerStatisticsRepository.save(statistics);
                logger.info("Soft deleted player statistics with ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                logger.warn("Player statistics not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting player statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
