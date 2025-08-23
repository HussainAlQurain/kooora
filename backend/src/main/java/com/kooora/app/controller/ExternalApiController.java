package com.kooora.app.controller;

import com.kooora.app.service.ExternalApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for managing external API integrations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/external-api")
@Tag(name = "External API", description = "External API integration management")
@CrossOrigin(origins = "*")
public class ExternalApiController {

    private static final Logger logger = LoggerFactory.getLogger(ExternalApiController.class);

    @Autowired
    private ExternalApiService externalApiService;

    @GetMapping("/status")
    @Operation(summary = "Get API status", description = "Get the status of external API integrations")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved API status")
    public ResponseEntity<Map<String, Object>> getApiStatus() {
        try {
            Map<String, Object> status = externalApiService.getApiStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            logger.error("Error getting API status: {}", e.getMessage());
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("error", "Failed to get API status");
            errorStatus.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorStatus);
        }
    }

    @PostMapping("/sync/all")
    @Operation(summary = "Sync all data", description = "Manually trigger synchronization of all data from external APIs")
    @ApiResponse(responseCode = "200", description = "Data synchronization started")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> syncAllData() {
        try {
            externalApiService.syncAllData();
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Data synchronization started");
            
            logger.info("Manual data synchronization triggered by admin");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error triggering data sync: {}", e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to start data synchronization: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/sync/standings/{leagueId}")
    @Operation(summary = "Sync league standings", description = "Manually trigger synchronization of league standings")
    @ApiResponse(responseCode = "200", description = "Standings synchronization started")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> syncLeagueStandings(
            @Parameter(description = "League ID") @PathVariable Long leagueId) {
        try {
            externalApiService.updateLeagueStandings(leagueId);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "League standings synchronization started for league " + leagueId);
            
            logger.info("Manual league standings sync triggered for league: {}", leagueId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error triggering league standings sync: {}", e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to start standings synchronization: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/sync/matches")
    @Operation(summary = "Sync live matches", description = "Manually trigger synchronization of live match data")
    @ApiResponse(responseCode = "200", description = "Live matches synchronization started")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> syncLiveMatches() {
        try {
            externalApiService.updateLiveMatches();
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Live matches synchronization started");
            
            logger.info("Manual live matches sync triggered");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error triggering live matches sync: {}", e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to start live matches synchronization: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/sync/player-stats/{leagueId}")
    @Operation(summary = "Sync player statistics", description = "Manually trigger synchronization of player statistics")
    @ApiResponse(responseCode = "200", description = "Player statistics synchronization started")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> syncPlayerStatistics(
            @Parameter(description = "League ID") @PathVariable Long leagueId,
            @Parameter(description = "Season") @RequestParam(defaultValue = "2023/24") String season) {
        try {
            externalApiService.updatePlayerStatistics(leagueId, season);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Player statistics synchronization started for league " + leagueId + " season " + season);
            
            logger.info("Manual player stats sync triggered for league: {} season: {}", leagueId, season);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error triggering player stats sync: {}", e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to start player statistics synchronization: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/sync/teams/{leagueId}")
    @Operation(summary = "Sync team information", description = "Manually trigger synchronization of team information")
    @ApiResponse(responseCode = "200", description = "Team information synchronization started")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> syncTeamInformation(
            @Parameter(description = "League ID") @PathVariable Long leagueId) {
        try {
            externalApiService.updateTeamInformation(leagueId);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Team information synchronization started for league " + leagueId);
            
            logger.info("Manual team info sync triggered for league: {}", leagueId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error triggering team info sync: {}", e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to start team information synchronization: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/health")
    @Operation(summary = "API health check", description = "Check if external APIs are reachable")
    @ApiResponse(responseCode = "200", description = "Successfully performed health check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            Map<String, Object> apiStatus = externalApiService.getApiStatus();
            boolean isHealthy = (Boolean) apiStatus.getOrDefault("enabled", false) && 
                              (Boolean) apiStatus.getOrDefault("hasApiKey", false);
            
            health.put("status", isHealthy ? "UP" : "DOWN");
            health.put("apiEnabled", apiStatus.get("enabled"));
            health.put("hasApiKey", apiStatus.get("hasApiKey"));
            health.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            logger.error("Error during health check: {}", e.getMessage());
            
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.internalServerError().body(health);
        }
    }
}
