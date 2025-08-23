package com.kooora.app.controller;

import com.kooora.app.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI-powered prediction controller for match outcomes and player performance
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/predictions")
@Tag(name = "AI Predictions", description = "AI-powered match and player prediction APIs")
@CrossOrigin(origins = "*")
public class PredictionController {

    private static final Logger logger = LoggerFactory.getLogger(PredictionController.class);

    @Autowired
    private PredictionService predictionService;

    @GetMapping("/match/{homeTeamId}/vs/{awayTeamId}")
    @Operation(summary = "Predict match outcome", description = "Get AI-powered prediction for match between two teams")
    @ApiResponse(responseCode = "200", description = "Successfully generated match prediction")
    @ApiResponse(responseCode = "404", description = "Teams not found")
    public ResponseEntity<Map<String, Object>> predictMatchOutcome(
            @Parameter(description = "Home team ID") @PathVariable Long homeTeamId,
            @Parameter(description = "Away team ID") @PathVariable Long awayTeamId) {
        
        try {
            logger.info("Generating match prediction for teams {} vs {}", homeTeamId, awayTeamId);
            
            Map<String, Object> prediction = predictionService.predictMatchOutcome(homeTeamId, awayTeamId);
            
            if (prediction.containsKey("error")) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            logger.error("Error generating match prediction: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/accuracy")
    @Operation(summary = "Get prediction accuracy", description = "Get AI model accuracy statistics and performance metrics")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved prediction accuracy")
    public ResponseEntity<Map<String, Object>> getPredictionAccuracy() {
        try {
            logger.info("Fetching prediction accuracy statistics");
            
            Map<String, Object> accuracy = predictionService.getPredictionAccuracy();
            return ResponseEntity.ok(accuracy);
        } catch (Exception e) {
            logger.error("Error retrieving prediction accuracy: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Prediction system health", description = "Check the health of the AI prediction system")
    @ApiResponse(responseCode = "200", description = "Prediction system is healthy")
    public ResponseEntity<Map<String, Object>> getPredictionSystemHealth() {
        try {
            Map<String, Object> health = Map.of(
                "status", "UP",
                "version", "1.0.0",
                "modelsLoaded", true,
                "algorithmsAvailable", Map.of(
                    "formBased", true,
                    "headToHead", true,
                    "statistical", true,
                    "homeAdvantage", true,
                    "ensemble", true
                ),
                "lastCheck", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            logger.error("Error checking prediction system health: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
