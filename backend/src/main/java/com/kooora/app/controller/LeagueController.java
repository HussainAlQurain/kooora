package com.kooora.app.controller;

import com.kooora.app.entity.League;
import com.kooora.app.entity.TeamStanding;
import com.kooora.app.repository.LeagueRepository;
import com.kooora.app.repository.TeamStandingRepository;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for league management and standings
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/leagues")
@Tag(name = "Leagues", description = "League management and standings APIs")
@CrossOrigin(origins = "*")
public class LeagueController {

    private static final Logger logger = LoggerFactory.getLogger(LeagueController.class);

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private TeamStandingRepository teamStandingRepository;

    @GetMapping
    @Operation(summary = "Get all leagues", description = "Retrieve all leagues with pagination")
    public ResponseEntity<Page<League>> getAllLeagues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<League> leagues = leagueRepository.findAll(pageable);
        
        return ResponseEntity.ok(leagues);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get league by ID", description = "Retrieve a specific league by its ID")
    public ResponseEntity<League> getLeagueById(@PathVariable Long id) {
        Optional<League> league = leagueRepository.findById(id);
        
        if (league.isPresent()) {
            return ResponseEntity.ok(league.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/standings")
    @Operation(summary = "Get league standings", description = "Retrieve the current standings/table for a league")
    public ResponseEntity<List<TeamStanding>> getLeagueStandings(@PathVariable Long id) {
        List<TeamStanding> standings = teamStandingRepository.findByLeagueIdOrderByPositionAsc(id);
        return ResponseEntity.ok(standings);
    }

    @GetMapping("/{id}/standings/detailed")
    @Operation(summary = "Get detailed league standings", description = "Retrieve detailed standings with all statistics")
    public ResponseEntity<List<TeamStanding>> getDetailedLeagueStandings(@PathVariable Long id) {
        List<TeamStanding> standings = teamStandingRepository.findByLeagueIdAndIsActiveTrueOrderByPositionAsc(id);
        return ResponseEntity.ok(standings);
    }

    @GetMapping("/country/{countryId}")
    @Operation(summary = "Get leagues by country", description = "Retrieve all leagues for a specific country")
    public ResponseEntity<List<League>> getLeaguesByCountry(@PathVariable Long countryId) {
        List<League> leagues = leagueRepository.findByCountryIdAndIsActiveTrue(countryId);
        return ResponseEntity.ok(leagues);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active leagues", description = "Retrieve all currently active leagues")
    public ResponseEntity<List<League>> getActiveLeagues() {
        List<League> leagues = leagueRepository.findByIsActiveTrue();
        return ResponseEntity.ok(leagues);
    }

    @GetMapping("/current-season")
    @Operation(summary = "Get current season leagues", description = "Retrieve leagues for the current season")
    public ResponseEntity<List<League>> getCurrentSeasonLeagues() {
        // For now, return all active leagues
        // In a real application, this would filter by current season dates
        List<League> leagues = leagueRepository.findByIsActiveTrue();
        return ResponseEntity.ok(leagues);
    }

    @PostMapping
    @Operation(summary = "Create league", description = "Create a new league")
    public ResponseEntity<League> createLeague(@Valid @RequestBody League league) {
        logger.info("Creating new league: {}", league.getName());
        
        League savedLeague = leagueRepository.save(league);
        
        logger.info("League created with ID: {}", savedLeague.getId());
        return ResponseEntity.ok(savedLeague);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update league", description = "Update an existing league")
    public ResponseEntity<League> updateLeague(@PathVariable Long id, @Valid @RequestBody League leagueDetails) {
        Optional<League> optionalLeague = leagueRepository.findById(id);
        
        if (optionalLeague.isPresent()) {
            League league = optionalLeague.get();
            
            // Update fields
            league.setName(leagueDetails.getName());
            league.setCountry(leagueDetails.getCountry());
            league.setSeason(leagueDetails.getSeason());
            league.setStartDate(leagueDetails.getStartDate());
            league.setEndDate(leagueDetails.getEndDate());
            league.setLogoUrl(leagueDetails.getLogoUrl());
            league.setStatus(leagueDetails.getStatus());
            league.setIsActive(leagueDetails.getIsActive());
            
            League updatedLeague = leagueRepository.save(league);
            logger.info("League updated: {}", updatedLeague.getId());
            
            return ResponseEntity.ok(updatedLeague);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete league", description = "Delete a league")
    public ResponseEntity<Void> deleteLeague(@PathVariable Long id) {
        Optional<League> optionalLeague = leagueRepository.findById(id);
        
        if (optionalLeague.isPresent()) {
            leagueRepository.deleteById(id);
            logger.info("League deleted: {}", id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/statistics")
    @Operation(summary = "Get league statistics", description = "Get comprehensive statistics for a league")
    public ResponseEntity<String> getLeagueStatistics(@PathVariable Long id) {
        // Placeholder for league statistics
        // In a real application, this would calculate various statistics
        return ResponseEntity.ok("League statistics feature coming soon!");
    }

    @PostMapping("/{id}/recalculate-standings")
    @Operation(summary = "Recalculate league standings", description = "Recalculate standings based on match results")
    public ResponseEntity<String> recalculateStandings(@PathVariable Long id) {
        // Placeholder for standings recalculation
        // In a real application, this would recalculate standings based on match results
        logger.info("Recalculating standings for league: {}", id);
        return ResponseEntity.ok("Standings recalculation feature coming soon!");
    }
}
