package com.kooora.app.controller;

import com.kooora.app.entity.Match;
import com.kooora.app.entity.MatchEvent;
import com.kooora.app.entity.Player;
import com.kooora.app.entity.Team;
import com.kooora.app.repository.MatchEventRepository;
import com.kooora.app.repository.MatchRepository;
import com.kooora.app.repository.PlayerRepository;
import com.kooora.app.repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing match events
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/match-events")
@CrossOrigin(origins = "*")
public class MatchEventController {

    private static final Logger logger = LoggerFactory.getLogger(MatchEventController.class);

    @Autowired
    private MatchEventRepository matchEventRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    /**
     * Get all events for a specific match
     */
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<MatchEvent>> getMatchEvents(@PathVariable Long matchId) {
        try {
            List<MatchEvent> events = matchEventRepository.findByMatchIdOrderByMinute(matchId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            logger.error("Error retrieving match events for match {}", matchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get match timeline (events grouped and formatted for display)
     */
    @GetMapping("/match/{matchId}/timeline")
    public ResponseEntity<Map<String, Object>> getMatchTimeline(@PathVariable Long matchId) {
        try {
            List<MatchEvent> events = matchEventRepository.findByMatchIdOrderByMinute(matchId);
            
            Map<String, Object> timeline = new HashMap<>();
            timeline.put("matchId", matchId);
            timeline.put("events", events);
            timeline.put("totalEvents", events.size());
            
            // Get current score from last scoring event
            List<MatchEvent> scoringEvents = matchEventRepository.findLastScoringEventByMatch(
                matchRepository.findById(matchId).orElse(null)
            );
            
            if (!scoringEvents.isEmpty()) {
                MatchEvent lastScore = scoringEvents.get(0);
                timeline.put("currentScore", Map.of(
                    "home", lastScore.getHomeScore() != null ? lastScore.getHomeScore() : 0,
                    "away", lastScore.getAwayScore() != null ? lastScore.getAwayScore() : 0
                ));
            } else {
                timeline.put("currentScore", Map.of("home", 0, "away", 0));
            }
            
            return ResponseEntity.ok(timeline);
        } catch (Exception e) {
            logger.error("Error retrieving match timeline for match {}", matchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get latest events across all matches
     */
    @GetMapping("/latest")
    public ResponseEntity<Page<MatchEvent>> getLatestEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MatchEvent> events = matchEventRepository.findLatestEvents(pageable);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            logger.error("Error retrieving latest events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new match event (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchEvent> createMatchEvent(@RequestBody MatchEvent matchEvent) {
        try {
            // Validate required fields
            if (matchEvent.getMatch() == null || matchEvent.getTeam() == null || 
                matchEvent.getMinute() == null || matchEvent.getEventType() == null) {
                return ResponseEntity.badRequest().build();
            }

            // Validate match exists
            Optional<Match> match = matchRepository.findById(matchEvent.getMatch().getId());
            if (!match.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate team exists
            Optional<Team> team = teamRepository.findById(matchEvent.getTeam().getId());
            if (!team.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate player if provided
            if (matchEvent.getPlayer() != null) {
                Optional<Player> player = playerRepository.findById(matchEvent.getPlayer().getId());
                if (!player.isPresent()) {
                    return ResponseEntity.badRequest().build();
                }
            }

            MatchEvent savedEvent = matchEventRepository.save(matchEvent);
            logger.info("Match event created: {} at {}' in match {}", 
                savedEvent.getEventType(), savedEvent.getMinute(), savedEvent.getMatch().getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
        } catch (Exception e) {
            logger.error("Error creating match event", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update a match event (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchEvent> updateMatchEvent(@PathVariable Long id, @RequestBody MatchEvent matchEventDetails) {
        try {
            Optional<MatchEvent> existingEvent = matchEventRepository.findById(id);
            if (!existingEvent.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            MatchEvent matchEvent = existingEvent.get();
            
            // Update fields
            if (matchEventDetails.getMinute() != null) {
                matchEvent.setMinute(matchEventDetails.getMinute());
            }
            if (matchEventDetails.getAdditionalTime() != null) {
                matchEvent.setAdditionalTime(matchEventDetails.getAdditionalTime());
            }
            if (matchEventDetails.getEventType() != null) {
                matchEvent.setEventType(matchEventDetails.getEventType());
            }
            if (matchEventDetails.getDescription() != null) {
                matchEvent.setDescription(matchEventDetails.getDescription());
            }
            if (matchEventDetails.getHomeScore() != null) {
                matchEvent.setHomeScore(matchEventDetails.getHomeScore());
            }
            if (matchEventDetails.getAwayScore() != null) {
                matchEvent.setAwayScore(matchEventDetails.getAwayScore());
            }

            MatchEvent updatedEvent = matchEventRepository.save(matchEvent);
            logger.info("Match event updated: {}", id);
            
            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            logger.error("Error updating match event {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a match event (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMatchEvent(@PathVariable Long id) {
        try {
            if (!matchEventRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            matchEventRepository.deleteById(id);
            logger.info("Match event deleted: {}", id);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting match event {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get player statistics from match events
     */
    @GetMapping("/player/{playerId}/stats")
    public ResponseEntity<Map<String, Object>> getPlayerEventStats(@PathVariable Long playerId) {
        try {
            Optional<Player> player = playerRepository.findById(playerId);
            if (!player.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("playerId", playerId);
            stats.put("playerName", player.get().getFirstName() + " " + player.get().getLastName());
            stats.put("goals", matchEventRepository.countGoalsByPlayer(player.get()));
            stats.put("yellowCards", matchEventRepository.countYellowCardsByPlayer(player.get()));
            stats.put("redCards", matchEventRepository.countRedCardsByPlayer(player.get()));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving player event stats for player {}", playerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get scoring events for a match
     */
    @GetMapping("/match/{matchId}/goals")
    public ResponseEntity<List<MatchEvent>> getMatchGoals(@PathVariable Long matchId) {
        try {
            Optional<Match> match = matchRepository.findById(matchId);
            if (!match.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            List<MatchEvent> scoringEvents = matchEventRepository.findScoringEventsByMatch(match.get());
            return ResponseEntity.ok(scoringEvents);
        } catch (Exception e) {
            logger.error("Error retrieving goals for match {}", matchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get card events for a match
     */
    @GetMapping("/match/{matchId}/cards")
    public ResponseEntity<List<MatchEvent>> getMatchCards(@PathVariable Long matchId) {
        try {
            Optional<Match> match = matchRepository.findById(matchId);
            if (!match.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            List<MatchEvent> cardEvents = matchEventRepository.findCardEventsByMatch(match.get());
            return ResponseEntity.ok(cardEvents);
        } catch (Exception e) {
            logger.error("Error retrieving cards for match {}", matchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
