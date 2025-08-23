package com.kooora.app.service;

import com.kooora.app.entity.Match;
import com.kooora.app.entity.MatchEvent;
import com.kooora.app.entity.PlayerStatistics;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for broadcasting live updates via WebSocket
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Service
public class LiveUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(LiveUpdateService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Broadcast match score update
     */
    public void broadcastMatchUpdate(Match match) {
        try {
            Map<String, Object> update = new HashMap<>();
            update.put("type", "MATCH_UPDATE");
            update.put("matchId", match.getId());
            update.put("homeTeam", match.getHomeTeam().getName());
            update.put("awayTeam", match.getAwayTeam().getName());
            update.put("homeScore", match.getHomeTeamScore());
            update.put("awayScore", match.getAwayTeamScore());
            update.put("status", match.getStatus());
            update.put("timestamp", LocalDateTime.now());

            // Broadcast to all subscribers of match updates
            messagingTemplate.convertAndSend("/topic/matches", update);
            
            // Broadcast to specific match subscribers
            messagingTemplate.convertAndSend("/topic/match/" + match.getId(), update);

            logger.info("Broadcasted match update for match ID: {}", match.getId());
        } catch (Exception e) {
            logger.error("Error broadcasting match update: {}", e.getMessage());
        }
    }

    /**
     * Broadcast match event (goal, card, substitution, etc.)
     */
    public void broadcastMatchEvent(MatchEvent matchEvent) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "MATCH_EVENT");
            event.put("matchId", matchEvent.getMatch().getId());
            event.put("eventType", matchEvent.getEventType());
            event.put("minute", matchEvent.getDisplayMinute());
            event.put("description", matchEvent.getFormattedDescription());
            event.put("player", matchEvent.getPlayer() != null ? 
                matchEvent.getPlayer().getFirstName() + " " + matchEvent.getPlayer().getLastName() : null);
            event.put("team", matchEvent.getTeam().getName());
            event.put("isHomeTeam", matchEvent.getIsHomeTeam());
            event.put("homeScore", matchEvent.getHomeScore());
            event.put("awayScore", matchEvent.getAwayScore());
            event.put("timestamp", LocalDateTime.now());

            // Broadcast to all match event subscribers
            messagingTemplate.convertAndSend("/topic/events", event);
            
            // Broadcast to specific match subscribers
            messagingTemplate.convertAndSend("/topic/match/" + matchEvent.getMatch().getId() + "/events", event);

            logger.info("Broadcasted match event: {} for match ID: {}", 
                matchEvent.getEventType(), matchEvent.getMatch().getId());
        } catch (Exception e) {
            logger.error("Error broadcasting match event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast live match status change
     */
    public void broadcastMatchStatusChange(Match match, Match.MatchStatus oldStatus) {
        try {
            Map<String, Object> statusChange = new HashMap<>();
            statusChange.put("type", "MATCH_STATUS_CHANGE");
            statusChange.put("matchId", match.getId());
            statusChange.put("homeTeam", match.getHomeTeam().getName());
            statusChange.put("awayTeam", match.getAwayTeam().getName());
            statusChange.put("oldStatus", oldStatus);
            statusChange.put("newStatus", match.getStatus());
            statusChange.put("timestamp", LocalDateTime.now());

            // Broadcast to all match status subscribers
            messagingTemplate.convertAndSend("/topic/match-status", statusChange);
            
            // Broadcast to specific match subscribers
            messagingTemplate.convertAndSend("/topic/match/" + match.getId() + "/status", statusChange);

            logger.info("Broadcasted match status change for match ID: {} from {} to {}", 
                match.getId(), oldStatus, match.getStatus());
        } catch (Exception e) {
            logger.error("Error broadcasting match status change: {}", e.getMessage());
        }
    }

    /**
     * Broadcast league standings update
     */
    public void broadcastLeagueStandingsUpdate(Long leagueId) {
        try {
            Map<String, Object> update = new HashMap<>();
            update.put("type", "STANDINGS_UPDATE");
            update.put("leagueId", leagueId);
            update.put("timestamp", LocalDateTime.now());

            // Broadcast to league standings subscribers
            messagingTemplate.convertAndSend("/topic/league/" + leagueId + "/standings", update);

            logger.info("Broadcasted standings update for league ID: {}", leagueId);
        } catch (Exception e) {
            logger.error("Error broadcasting standings update: {}", e.getMessage());
        }
    }

    /**
     * Broadcast player statistics update
     */
    public void broadcastPlayerStatsUpdate(PlayerStatistics playerStats) {
        try {
            Map<String, Object> update = new HashMap<>();
            update.put("type", "PLAYER_STATS_UPDATE");
            update.put("playerId", playerStats.getPlayer().getId());
            update.put("playerName", playerStats.getPlayer().getFirstName() + " " + 
                playerStats.getPlayer().getLastName());
            update.put("leagueId", playerStats.getLeague().getId());
            update.put("season", playerStats.getSeason());
            update.put("goals", playerStats.getGoals());
            update.put("assists", playerStats.getAssists());
            update.put("appearances", playerStats.getAppearances());
            update.put("timestamp", LocalDateTime.now());

            // Broadcast to player stats subscribers
            messagingTemplate.convertAndSend("/topic/player-stats", update);
            
            // Broadcast to specific player subscribers
            messagingTemplate.convertAndSend("/topic/player/" + playerStats.getPlayer().getId() + "/stats", update);

            logger.info("Broadcasted player stats update for player ID: {}", playerStats.getPlayer().getId());
        } catch (Exception e) {
            logger.error("Error broadcasting player stats update: {}", e.getMessage());
        }
    }

    /**
     * Broadcast general notification
     */
    public void broadcastNotification(String title, String message, String type) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "NOTIFICATION");
            notification.put("title", title);
            notification.put("message", message);
            notification.put("notificationType", type);
            notification.put("timestamp", LocalDateTime.now());

            // Broadcast to all notification subscribers
            messagingTemplate.convertAndSend("/topic/notifications", notification);

            logger.info("Broadcasted notification: {}", title);
        } catch (Exception e) {
            logger.error("Error broadcasting notification: {}", e.getMessage());
        }
    }

    /**
     * Send private message to specific user
     */
    public void sendPrivateMessage(String username, String title, String message) {
        try {
            Map<String, Object> privateMsg = new HashMap<>();
            privateMsg.put("type", "PRIVATE_MESSAGE");
            privateMsg.put("title", title);
            privateMsg.put("message", message);
            privateMsg.put("timestamp", LocalDateTime.now());

            // Send to specific user
            messagingTemplate.convertAndSendToUser(username, "/queue/messages", privateMsg);

            logger.info("Sent private message to user: {}", username);
        } catch (Exception e) {
            logger.error("Error sending private message: {}", e.getMessage());
        }
    }

    /**
     * Broadcast live match commentary
     */
    public void broadcastMatchCommentary(Long matchId, String commentary, String commentator) {
        try {
            Map<String, Object> comment = new HashMap<>();
            comment.put("type", "MATCH_COMMENTARY");
            comment.put("matchId", matchId);
            comment.put("commentary", commentary);
            comment.put("commentator", commentator);
            comment.put("timestamp", LocalDateTime.now());

            // Broadcast to match commentary subscribers
            messagingTemplate.convertAndSend("/topic/match/" + matchId + "/commentary", comment);

            logger.info("Broadcasted commentary for match ID: {}", matchId);
        } catch (Exception e) {
            logger.error("Error broadcasting commentary: {}", e.getMessage());
        }
    }

    /**
     * Broadcast system alert (maintenance, downtime, etc.)
     */
    public void broadcastSystemAlert(String alert, String severity) {
        try {
            Map<String, Object> systemAlert = new HashMap<>();
            systemAlert.put("type", "SYSTEM_ALERT");
            systemAlert.put("alert", alert);
            systemAlert.put("severity", severity);
            systemAlert.put("timestamp", LocalDateTime.now());

            // Broadcast to all connected clients
            messagingTemplate.convertAndSend("/topic/system", systemAlert);

            logger.info("Broadcasted system alert: {}", alert);
        } catch (Exception e) {
            logger.error("Error broadcasting system alert: {}", e.getMessage());
        }
    }

    /**
     * Broadcast injury update
     */
    public void broadcastInjuryUpdate(Long playerId, String playerName, String injuryStatus, String expectedReturn) {
        try {
            Map<String, Object> injury = new HashMap<>();
            injury.put("type", "INJURY_UPDATE");
            injury.put("playerId", playerId);
            injury.put("playerName", playerName);
            injury.put("injuryStatus", injuryStatus);
            injury.put("expectedReturn", expectedReturn);
            injury.put("timestamp", LocalDateTime.now());

            // Broadcast to injury update subscribers
            messagingTemplate.convertAndSend("/topic/injuries", injury);
            
            // Broadcast to specific player subscribers
            messagingTemplate.convertAndSend("/topic/player/" + playerId + "/injury", injury);

            logger.info("Broadcasted injury update for player: {}", playerName);
        } catch (Exception e) {
            logger.error("Error broadcasting injury update: {}", e.getMessage());
        }
    }

    /**
     * Broadcast transfer news
     */
    public void broadcastTransferNews(String playerName, String fromTeam, String toTeam, String transferType) {
        try {
            Map<String, Object> transfer = new HashMap<>();
            transfer.put("type", "TRANSFER_NEWS");
            transfer.put("playerName", playerName);
            transfer.put("fromTeam", fromTeam);
            transfer.put("toTeam", toTeam);
            transfer.put("transferType", transferType);
            transfer.put("timestamp", LocalDateTime.now());

            // Broadcast to transfer news subscribers
            messagingTemplate.convertAndSend("/topic/transfers", transfer);

            logger.info("Broadcasted transfer news: {} from {} to {}", playerName, fromTeam, toTeam);
        } catch (Exception e) {
            logger.error("Error broadcasting transfer news: {}", e.getMessage());
        }
    }
}
