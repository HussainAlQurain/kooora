package com.kooora.app.controller;

import com.kooora.app.service.LiveUpdateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket controller for handling real-time live updates
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Controller
public class LiveUpdateController {

    private static final Logger logger = LoggerFactory.getLogger(LiveUpdateController.class);

    @Autowired
    private LiveUpdateService liveUpdateService;

    /**
     * Handle user joining a match room for live updates
     */
    @MessageMapping("/match.join")
    @SendTo("/topic/public")
    public Map<String, Object> joinMatch(@Payload Map<String, Object> joinMessage, 
                                        SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) joinMessage.get("username");
            Long matchId = Long.valueOf(joinMessage.get("matchId").toString());
            
            // Add username and matchId to session attributes
            headerAccessor.getSessionAttributes().put("username", username);
            headerAccessor.getSessionAttributes().put("matchId", matchId);

            Map<String, Object> response = new HashMap<>();
            response.put("type", "USER_JOINED");
            response.put("username", username);
            response.put("matchId", matchId);
            response.put("message", username + " joined match " + matchId + " live updates");
            response.put("timestamp", LocalDateTime.now());

            logger.info("User {} joined match {} for live updates", username, matchId);
            return response;
        } catch (Exception e) {
            logger.error("Error handling match join: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to join match updates");
            return errorResponse;
        }
    }

    /**
     * Handle user leaving a match room
     */
    @MessageMapping("/match.leave")
    @SendTo("/topic/public")
    public Map<String, Object> leaveMatch(@Payload Map<String, Object> leaveMessage, 
                                         SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            Long matchId = (Long) headerAccessor.getSessionAttributes().get("matchId");

            Map<String, Object> response = new HashMap<>();
            response.put("type", "USER_LEFT");
            response.put("username", username);
            response.put("matchId", matchId);
            response.put("message", username + " left match " + matchId + " live updates");
            response.put("timestamp", LocalDateTime.now());

            logger.info("User {} left match {} live updates", username, matchId);
            return response;
        } catch (Exception e) {
            logger.error("Error handling match leave: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to leave match updates");
            return errorResponse;
        }
    }

    /**
     * Handle chat messages during live matches
     */
    @MessageMapping("/match.chat")
    @SendTo("/topic/match/chat")
    public Map<String, Object> handleMatchChat(@Payload Map<String, Object> chatMessage, 
                                              SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            String message = (String) chatMessage.get("message");
            Long matchId = Long.valueOf(chatMessage.get("matchId").toString());

            Map<String, Object> response = new HashMap<>();
            response.put("type", "CHAT_MESSAGE");
            response.put("username", username);
            response.put("message", message);
            response.put("matchId", matchId);
            response.put("timestamp", LocalDateTime.now());

            logger.info("Chat message from {} in match {}: {}", username, matchId, message);
            return response;
        } catch (Exception e) {
            logger.error("Error handling chat message: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to send chat message");
            return errorResponse;
        }
    }

    /**
     * Handle user subscribing to specific leagues
     */
    @MessageMapping("/league.subscribe")
    @SendTo("/topic/league/subscription")
    public Map<String, Object> subscribeToLeague(@Payload Map<String, Object> subscriptionMessage, 
                                                 SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            Long leagueId = Long.valueOf(subscriptionMessage.get("leagueId").toString());

            Map<String, Object> response = new HashMap<>();
            response.put("type", "LEAGUE_SUBSCRIBED");
            response.put("username", username);
            response.put("leagueId", leagueId);
            response.put("message", username + " subscribed to league " + leagueId + " updates");
            response.put("timestamp", LocalDateTime.now());

            logger.info("User {} subscribed to league {} updates", username, leagueId);
            return response;
        } catch (Exception e) {
            logger.error("Error handling league subscription: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to subscribe to league");
            return errorResponse;
        }
    }

    /**
     * Handle user subscribing to player updates
     */
    @MessageMapping("/player.subscribe")
    @SendTo("/topic/player/subscription")
    public Map<String, Object> subscribeToPlayer(@Payload Map<String, Object> subscriptionMessage, 
                                                SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            Long playerId = Long.valueOf(subscriptionMessage.get("playerId").toString());

            Map<String, Object> response = new HashMap<>();
            response.put("type", "PLAYER_SUBSCRIBED");
            response.put("username", username);
            response.put("playerId", playerId);
            response.put("message", username + " subscribed to player " + playerId + " updates");
            response.put("timestamp", LocalDateTime.now());

            logger.info("User {} subscribed to player {} updates", username, playerId);
            return response;
        } catch (Exception e) {
            logger.error("Error handling player subscription: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to subscribe to player");
            return errorResponse;
        }
    }

    /**
     * Handle prediction submissions during live matches
     */
    @MessageMapping("/match.prediction")
    @SendTo("/topic/match/predictions")
    public Map<String, Object> submitMatchPrediction(@Payload Map<String, Object> predictionMessage, 
                                                     SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            Long matchId = Long.valueOf(predictionMessage.get("matchId").toString());
            String prediction = (String) predictionMessage.get("prediction");
            String predictionType = (String) predictionMessage.get("type"); // "score", "winner", "next_goal", etc.

            Map<String, Object> response = new HashMap<>();
            response.put("type", "MATCH_PREDICTION");
            response.put("username", username);
            response.put("matchId", matchId);
            response.put("prediction", prediction);
            response.put("predictionType", predictionType);
            response.put("timestamp", LocalDateTime.now());

            logger.info("Prediction from {} for match {}: {} ({})", username, matchId, prediction, predictionType);
            return response;
        } catch (Exception e) {
            logger.error("Error handling match prediction: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to submit prediction");
            return errorResponse;
        }
    }

    /**
     * Handle emoji reactions during live matches
     */
    @MessageMapping("/match.reaction")
    @SendTo("/topic/match/reactions")
    public Map<String, Object> submitMatchReaction(@Payload Map<String, Object> reactionMessage, 
                                                   SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            Long matchId = Long.valueOf(reactionMessage.get("matchId").toString());
            String emoji = (String) reactionMessage.get("emoji");
            String eventId = (String) reactionMessage.get("eventId"); // Optional: reaction to specific event

            Map<String, Object> response = new HashMap<>();
            response.put("type", "MATCH_REACTION");
            response.put("username", username);
            response.put("matchId", matchId);
            response.put("emoji", emoji);
            response.put("eventId", eventId);
            response.put("timestamp", LocalDateTime.now());

            logger.info("Reaction from {} for match {}: {}", username, matchId, emoji);
            return response;
        } catch (Exception e) {
            logger.error("Error handling match reaction: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to submit reaction");
            return errorResponse;
        }
    }

    /**
     * Handle user requesting live match data
     */
    @MessageMapping("/match.request-data")
    public void requestMatchData(@Payload Map<String, Object> requestMessage, 
                                SimpMessageHeaderAccessor headerAccessor) {
        try {
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            Long matchId = Long.valueOf(requestMessage.get("matchId").toString());

            // Here you would typically fetch current match data and send it back
            // For now, we'll just log the request
            logger.info("User {} requested data for match {}", username, matchId);

            // You could implement this to fetch and send current match state:
            // Match match = matchService.getMatchById(matchId);
            // liveUpdateService.sendPrivateMessage(username, "Match Data", matchData);

        } catch (Exception e) {
            logger.error("Error handling match data request: {}", e.getMessage());
        }
    }

    /**
     * Handle heartbeat/ping messages to keep connection alive
     */
    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public Map<String, Object> handlePing(@Payload Map<String, Object> pingMessage) {
        Map<String, Object> pong = new HashMap<>();
        pong.put("type", "PONG");
        pong.put("timestamp", LocalDateTime.now());
        return pong;
    }
}
