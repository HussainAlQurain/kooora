package com.kooora.app.controller;

import com.kooora.app.entity.Country;
import com.kooora.app.entity.League;
import com.kooora.app.entity.Team;
import com.kooora.app.dto.*;
import com.kooora.app.service.LiveDataSimulatorService;
import java.util.stream.Collectors;
import com.kooora.app.repository.CountryRepository;
import com.kooora.app.repository.LeagueRepository;
import com.kooora.app.repository.TeamRepository;
import com.kooora.app.repository.MatchRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Public controller for non-authenticated endpoints
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/public")
@Tag(name = "Public", description = "Public APIs accessible without authentication")
@CrossOrigin(origins = "*")
public class PublicController {

    private static final Logger logger = LoggerFactory.getLogger(PublicController.class);

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private LiveDataSimulatorService liveDataSimulatorService;

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the API is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("API is running!");
    }

    @GetMapping("/countries")
    @Operation(summary = "Get all countries", description = "Retrieve all active countries")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Country>> getAllCountries() {
        logger.info("Fetching all countries");
        List<Country> countries = countryRepository.findAll();
        return ResponseEntity.ok(countries);
    }

    @GetMapping("/leagues")
    @Operation(summary = "Get all leagues", description = "Retrieve all active leagues")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LeagueDTO>> getAllLeagues() {
        logger.info("Fetching all leagues with DTO");
        try {
            List<League> leagues = leagueRepository.findAll();
            List<LeagueDTO> leagueDTOs = leagues.stream()
                .map(LeagueDTO::new)
                .collect(Collectors.toList());
            logger.info("Successfully fetched {} leagues", leagueDTOs.size());
            return ResponseEntity.ok(leagueDTOs);
        } catch (Exception e) {
            logger.error("Error fetching leagues: ", e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/teams")
    @Operation(summary = "Get all teams", description = "Retrieve all active teams") 
    @Transactional(readOnly = true)
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        logger.info("Fetching all teams with DTO");
        try {
            List<Team> teams = teamRepository.findAll();
            List<TeamDTO> teamDTOs = teams.stream()
                .map(TeamDTO::new)
                .collect(Collectors.toList());
            logger.info("Successfully fetched {} teams", teamDTOs.size());
            return ResponseEntity.ok(teamDTOs);
        } catch (Exception e) {
            logger.error("Error fetching teams: ", e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/matches")
    @Operation(summary = "Get matches by status", description = "Retrieve matches filtered by status")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchSimpleDTO>> getMatchesByStatus(@RequestParam(required = false) String status) {
        logger.info("✅ MATCHES ENDPOINT CALLED with status: {}", status);
        
        try {
            List<com.kooora.app.entity.Match> matches;
            
            if (status != null && status.contains("LIVE")) {
                // Get live matches
                matches = liveDataSimulatorService.getCurrentLiveMatches();
                logger.info("📺 Found {} live matches", matches.size());
            } else {
                // Get today's matches
                matches = liveDataSimulatorService.getTodayMatches();
                logger.info("📅 Found {} matches for today", matches.size());
            }
            
            List<MatchSimpleDTO> matchDTOs = matches.stream()
                .map(MatchSimpleDTO::new)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(matchDTOs);
            
        } catch (Exception e) {
            logger.error("Error fetching matches: ", e);
            return ResponseEntity.ok(List.of());
        }
    }
    
    @GetMapping("/matches/live")
    @Operation(summary = "Get live matches", description = "Get all currently live matches")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchSimpleDTO>> getLiveMatches() {
        logger.info("📺 Getting live matches");
        
        try {
            List<com.kooora.app.entity.Match> liveMatches = liveDataSimulatorService.getCurrentLiveMatches();
            List<MatchSimpleDTO> matchDTOs = liveMatches.stream()
                .map(MatchSimpleDTO::new)
                .collect(Collectors.toList());
                
            logger.info("✅ Found {} live matches", matchDTOs.size());
            return ResponseEntity.ok(matchDTOs);
            
        } catch (Exception e) {
            logger.error("Error fetching live matches: ", e);
            return ResponseEntity.ok(List.of());
        }
    }
    
    @GetMapping("/matches/today")
    @Operation(summary = "Get today's matches", description = "Get all matches scheduled for today")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchSimpleDTO>> getTodayMatches() {
        logger.info("📅 Getting today's matches");
        
        try {
            List<com.kooora.app.entity.Match> todayMatches = liveDataSimulatorService.getTodayMatches();
            List<MatchSimpleDTO> matchDTOs = todayMatches.stream()
                .map(MatchSimpleDTO::new)
                .collect(Collectors.toList());
                
            logger.info("✅ Found {} matches for today", matchDTOs.size());
            return ResponseEntity.ok(matchDTOs);
            
        } catch (Exception e) {
            logger.error("Error fetching today's matches: ", e);
            return ResponseEntity.ok(List.of());
        }
    }
    
    @GetMapping("/matches/upcoming")
    @Operation(summary = "Get upcoming matches", description = "Get upcoming scheduled matches")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchSimpleDTO>> getUpcomingMatches(
            @RequestParam(defaultValue = "10") int limit) {
        logger.info("⏰ Getting {} upcoming matches", limit);
        
        try {
            // Get upcoming matches from repository
            List<com.kooora.app.entity.Match> upcomingMatches = matchRepository.findUpcomingMatches()
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
                
            List<MatchSimpleDTO> matchDTOs = upcomingMatches.stream()
                .map(MatchSimpleDTO::new)
                .collect(Collectors.toList());
                
            logger.info("✅ Found {} upcoming matches", matchDTOs.size());
            return ResponseEntity.ok(matchDTOs);
            
        } catch (Exception e) {
            logger.error("Error fetching upcoming matches: ", e);
            return ResponseEntity.ok(List.of());
        }
    }
}