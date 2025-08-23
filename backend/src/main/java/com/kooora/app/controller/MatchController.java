package com.kooora.app.controller;

import com.kooora.app.entity.Match;
import com.kooora.app.repository.MatchRepository;
import com.kooora.app.service.LiveUpdateService;
import com.kooora.app.dto.MatchDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for match management
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/matches")
@Tag(name = "Matches", description = "Match management APIs")
@CrossOrigin(origins = "*")
public class MatchController {

    private static final Logger logger = LoggerFactory.getLogger(MatchController.class);

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private LiveUpdateService liveUpdateService;

    @GetMapping
    @Operation(summary = "Get all matches", description = "Retrieve all matches with pagination and optional status filtering")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchDTO>> getAllMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "matchDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        
        try {
            logger.info("Getting matches with status: {}", status);
            
            List<Match> matches;
            
            if (status != null && !status.trim().isEmpty()) {
                // Handle multiple status values (e.g., "LIVE,HALF_TIME")
                List<String> statusList = Arrays.asList(status.split(","))
                        .stream()
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toList());
                
                logger.info("Parsed status list: {}", statusList);
                
                List<Match.MatchStatus> matchStatuses = statusList.stream()
                        .map(s -> {
                            try {
                                return Match.MatchStatus.valueOf(s);
                            } catch (IllegalArgumentException e) {
                                logger.warn("Invalid status: {}", s);
                                return null;
                            }
                        })
                        .filter(s -> s != null)
                        .collect(Collectors.toList());
                
                logger.info("Valid match statuses: {}", matchStatuses);
                
                if (!matchStatuses.isEmpty()) {
                    // Use native query to avoid lazy loading issues
                    List<String> statusStrings = matchStatuses.stream()
                            .map(Enum::name)
                            .collect(Collectors.toList());
                    
                    List<Object[]> results = matchRepository.findMatchesByStatusNative(statusStrings);
                    logger.info("Found {} matches with native query", results.size());
                    
                    // Convert results directly to DTOs
                    List<MatchDTO> matchDTOs = results.stream()
                            .map(row -> {
                                MatchDTO dto = new MatchDTO();
                                dto.setId(((Number) row[0]).longValue());
                                dto.setMatchDate((LocalDateTime) row[1]);
                                dto.setHomeTeamScore(row[2] != null ? ((Number) row[2]).intValue() : null);
                                dto.setAwayTeamScore(row[3] != null ? ((Number) row[3]).intValue() : null);
                                dto.setStatus((String) row[4]);
                                dto.setStadium((String) row[5]);
                                dto.setReferee((String) row[6]);
                                dto.setAttendance(row[7] != null ? ((Number) row[7]).intValue() : null);
                                dto.setNotes((String) row[8]);
                                dto.setHomeTeamName((String) row[9]);
                                dto.setAwayTeamName((String) row[10]);
                                dto.setLeagueName((String) row[11]);
                                return dto;
                            })
                            .collect(Collectors.toList());
                    
                    return ResponseEntity.ok(matchDTOs);
                    
                } else {
                    logger.info("No valid statuses found, returning empty list");
                    return ResponseEntity.ok(List.of());
                }
            } else {
                // For regular queries without status filter, just return empty list for now
                logger.info("No status filter, returning empty list");
                return ResponseEntity.ok(List.of());
            }
            
        } catch (Exception e) {
            logger.error("Error getting matches: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get match by ID", description = "Retrieve a specific match by its ID")
    public ResponseEntity<Match> getMatchById(@PathVariable Long id) {
        Optional<Match> match = matchRepository.findById(id);
        
        if (match.isPresent()) {
            return ResponseEntity.ok(match.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's matches", description = "Retrieve all matches scheduled for today")
    public ResponseEntity<List<Match>> getTodayMatches() {
        List<Match> matches = matchRepository.findTodayMatches();
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/live")
    @Operation(summary = "Get live matches", description = "Retrieve all currently live matches")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Match>> getLiveMatches() {
        List<Match> matches = matchRepository.findByStatus(Match.MatchStatus.LIVE);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming matches", description = "Retrieve upcoming matches")
    public ResponseEntity<List<Match>> getUpcomingMatches(
            @RequestParam(defaultValue = "10") int limit) {
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("matchDate").ascending());
        List<Match> matches = matchRepository.findByStatusAndMatchDateAfter(
            Match.MatchStatus.SCHEDULED, LocalDateTime.now(), pageable);
        
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/completed")
    @Operation(summary = "Get completed matches", description = "Retrieve completed matches")
    public ResponseEntity<List<Match>> getCompletedMatches(
            @RequestParam(defaultValue = "10") int limit) {
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("matchDate").descending());
        List<Match> matches = matchRepository.findByStatus(Match.MatchStatus.COMPLETED, pageable);
        
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/team/{teamId}")
    @Operation(summary = "Get matches by team", description = "Retrieve all matches for a specific team")
    public ResponseEntity<List<Match>> getMatchesByTeam(@PathVariable Long teamId) {
        List<Match> matches = matchRepository.findByHomeTeamIdOrAwayTeamId(teamId, teamId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/league/{leagueId}")
    @Operation(summary = "Get matches by league", description = "Retrieve all matches for a specific league")
    public ResponseEntity<List<Match>> getMatchesByLeague(@PathVariable Long leagueId) {
        List<Match> matches = matchRepository.findByLeagueId(leagueId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get matches by date", description = "Retrieve all matches for a specific date")
    public ResponseEntity<List<Match>> getMatchesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<Match> matches = matchRepository.findByMatchDateBetween(startOfDay, endOfDay);
        return ResponseEntity.ok(matches);
    }

    @PostMapping
    @Operation(summary = "Create match", description = "Create a new match")
    public ResponseEntity<Match> createMatch(@Valid @RequestBody Match match) {
        logger.info("Creating new match: {} vs {}", 
            match.getHomeTeam().getName(), match.getAwayTeam().getName());
        
        // Set default status if not provided
        if (match.getStatus() == null) {
            match.setStatus(Match.MatchStatus.SCHEDULED);
        }
        
        Match savedMatch = matchRepository.save(match);
        
        logger.info("Match created with ID: {}", savedMatch.getId());
        return ResponseEntity.ok(savedMatch);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update match", description = "Update an existing match")
    public ResponseEntity<Match> updateMatch(@PathVariable Long id, @Valid @RequestBody Match matchDetails) {
        Optional<Match> optionalMatch = matchRepository.findById(id);
        
        if (optionalMatch.isPresent()) {
            Match match = optionalMatch.get();
            
            // Update fields
            match.setHomeTeam(matchDetails.getHomeTeam());
            match.setAwayTeam(matchDetails.getAwayTeam());
            match.setLeague(matchDetails.getLeague());
            match.setMatchDate(matchDetails.getMatchDate());
            match.setHomeScore(matchDetails.getHomeScore());
            match.setAwayScore(matchDetails.getAwayScore());
            match.setStatus(matchDetails.getStatus());
            match.setVenue(matchDetails.getVenue());
            match.setReferee(matchDetails.getReferee());
            
            Match updatedMatch = matchRepository.save(match);
            logger.info("Match updated: {}", updatedMatch.getId());
            
            // Broadcast real-time update
            liveUpdateService.broadcastMatchUpdate(updatedMatch);
            
            return ResponseEntity.ok(updatedMatch);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/score")
    @Operation(summary = "Update match score", description = "Update the score of a live match")
    public ResponseEntity<Match> updateMatchScore(
            @PathVariable Long id,
            @RequestParam Integer homeScore,
            @RequestParam Integer awayScore) {
        
        Optional<Match> optionalMatch = matchRepository.findById(id);
        
        if (optionalMatch.isPresent()) {
            Match match = optionalMatch.get();
            
            match.setHomeScore(homeScore);
            match.setAwayScore(awayScore);
            
            // If match was scheduled and we're updating score, set to live
            if (match.getStatus() == Match.MatchStatus.SCHEDULED) {
                match.setStatus(Match.MatchStatus.LIVE);
            }
            
            Match updatedMatch = matchRepository.save(match);
            logger.info("Match score updated: {} {} - {} {}", 
                match.getHomeTeam().getName(), homeScore,
                awayScore, match.getAwayTeam().getName());
            
            // Broadcast real-time score update
            liveUpdateService.broadcastMatchUpdate(updatedMatch);
            
            return ResponseEntity.ok(updatedMatch);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update match status", description = "Update the status of a match")
    public ResponseEntity<Match> updateMatchStatus(
            @PathVariable Long id,
            @RequestParam Match.MatchStatus status) {
        
        Optional<Match> optionalMatch = matchRepository.findById(id);
        
        if (optionalMatch.isPresent()) {
            Match match = optionalMatch.get();
            Match.MatchStatus oldStatus = match.getStatus();
            match.setStatus(status);
            
            Match updatedMatch = matchRepository.save(match);
            logger.info("Match status updated to {}: {}", status, updatedMatch.getId());
            
            // Broadcast real-time status change
            liveUpdateService.broadcastMatchStatusChange(updatedMatch, oldStatus);
            
            return ResponseEntity.ok(updatedMatch);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete match", description = "Delete a match")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        Optional<Match> optionalMatch = matchRepository.findById(id);
        
        if (optionalMatch.isPresent()) {
            matchRepository.deleteById(id);
            logger.info("Match deleted: {}", id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/statistics/league/{leagueId}")
    @Operation(summary = "Get league match statistics", description = "Get match statistics for a league")
    public ResponseEntity<String> getLeagueMatchStatistics(@PathVariable Long leagueId) {
        // Placeholder for match statistics
        // In a real application, this would calculate various statistics
        return ResponseEntity.ok("League match statistics feature coming soon!");
    }
}

