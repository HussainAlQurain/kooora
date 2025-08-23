package com.kooora.app.controller;

import com.kooora.app.entity.Player;
import com.kooora.app.repository.PlayerRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for player management
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/players")
@Tag(name = "Players", description = "Player management APIs")
@CrossOrigin(origins = "*")
public class PlayerController {

    private static final Logger logger = LoggerFactory.getLogger(PlayerController.class);

    @Autowired
    private PlayerRepository playerRepository;

    @GetMapping
    @Operation(summary = "Get all players", description = "Retrieve all active players with pagination")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Player>> getAllPlayers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Player> players = playerRepository.findByIsActiveTrue(pageable);

        // Force initialize simple fields to avoid LazyInitializationException during serialization
        players.forEach(p -> {
            if (p.getTeam() != null) {
                p.getTeam().getName();
            }
            if (p.getCountry() != null) {
                p.getCountry().getName();
            }
        });

        return ResponseEntity.ok(players);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get player by ID", description = "Retrieve a specific player by their ID")
    public ResponseEntity<Player> getPlayerById(@PathVariable Long id) {
        Optional<Player> player = playerRepository.findById(id);
        
        if (player.isPresent() && player.get().getIsActive()) {
            return ResponseEntity.ok(player.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/team/{teamId}")
    @Operation(summary = "Get players by team", description = "Retrieve all players for a specific team")
    public ResponseEntity<List<Player>> getPlayersByTeam(@PathVariable Long teamId) {
        List<Player> players = playerRepository.findByTeamIdAndIsActiveTrue(teamId);
        return ResponseEntity.ok(players);
    }

    @GetMapping("/search")
    @Operation(summary = "Search players", description = "Search players by name")
    public ResponseEntity<List<Player>> searchPlayers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        
        Page<Player> playersPage = playerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseAndIsActiveTrue(
            query, query, PageRequest.of(0, limit));
        List<Player> players = playersPage.getContent();
        
        return ResponseEntity.ok(players);
    }

    @PostMapping
    @Operation(summary = "Create player", description = "Create a new player")
    public ResponseEntity<Player> createPlayer(@Valid @RequestBody Player player) {
        logger.info("Creating new player: {} {}", player.getFirstName(), player.getLastName());
        
        player.setIsActive(true);
        Player savedPlayer = playerRepository.save(player);
        
        logger.info("Player created with ID: {}", savedPlayer.getId());
        return ResponseEntity.ok(savedPlayer);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update player", description = "Update an existing player")
    public ResponseEntity<Player> updatePlayer(@PathVariable Long id, @Valid @RequestBody Player playerDetails) {
        Optional<Player> optionalPlayer = playerRepository.findById(id);
        
        if (optionalPlayer.isPresent()) {
            Player player = optionalPlayer.get();
            
            // Update fields
            player.setFirstName(playerDetails.getFirstName());
            player.setLastName(playerDetails.getLastName());
            player.setDateOfBirth(playerDetails.getDateOfBirth());
            player.setNationality(playerDetails.getNationality());
            player.setPosition(playerDetails.getPosition());
            player.setJerseyNumber(playerDetails.getJerseyNumber());
            player.setHeightCm(playerDetails.getHeightCm());
            player.setWeightKg(playerDetails.getWeightKg());
            player.setPhotoUrl(playerDetails.getPhotoUrl());
            player.setTeam(playerDetails.getTeam());
            
            Player updatedPlayer = playerRepository.save(player);
            logger.info("Player updated: {}", updatedPlayer.getId());
            
            return ResponseEntity.ok(updatedPlayer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete player", description = "Soft delete a player (mark as inactive)")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        Optional<Player> optionalPlayer = playerRepository.findById(id);
        
        if (optionalPlayer.isPresent()) {
            Player player = optionalPlayer.get();
            player.setIsActive(false);
            playerRepository.save(player);
            
            logger.info("Player soft deleted: {}", id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/statistics/{playerId}")
    @Operation(summary = "Get player statistics", description = "Get comprehensive statistics for a player")
    public ResponseEntity<String> getPlayerStatistics(@PathVariable Long playerId) {
        // Placeholder for player statistics
        // In a real application, this would query match statistics, goals, assists, etc.
        return ResponseEntity.ok("Player statistics feature coming soon!");
    }
}
