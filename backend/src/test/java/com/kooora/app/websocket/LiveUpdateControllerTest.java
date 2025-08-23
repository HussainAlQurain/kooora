package com.kooora.app.websocket;

import com.kooora.app.controller.LiveUpdateController;
import com.kooora.app.service.LiveUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LiveUpdateController
 */
@ExtendWith(SpringExtension.class)
public class LiveUpdateControllerTest {

    @Mock
    private LiveUpdateService liveUpdateService;

    @Mock
    private SimpMessageHeaderAccessor headerAccessor;

    @InjectMocks
    private LiveUpdateController liveUpdateController;

    private Map<String, Object> sessionAttributes;

    @BeforeEach
    public void setUp() {
        sessionAttributes = new HashMap<>();
        when(headerAccessor.getSessionAttributes()).thenReturn(sessionAttributes);
    }

    @Test
    public void testJoinMatch_Success() {
        // Given
        Map<String, Object> joinMessage = new HashMap<>();
        joinMessage.put("username", "testuser");
        joinMessage.put("matchId", "123");

        // When
        Map<String, Object> result = liveUpdateController.joinMatch(joinMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("USER_JOINED", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals(123L, result.get("matchId"));
        assertTrue(result.get("message").toString().contains("testuser joined match 123"));
        assertNotNull(result.get("timestamp"));

        // Verify session attributes are set
        assertEquals("testuser", sessionAttributes.get("username"));
        assertEquals(123L, sessionAttributes.get("matchId"));
    }

    @Test
    public void testJoinMatch_InvalidMatchId() {
        // Given
        Map<String, Object> joinMessage = new HashMap<>();
        joinMessage.put("username", "testuser");
        joinMessage.put("matchId", "invalid");

        // When
        Map<String, Object> result = liveUpdateController.joinMatch(joinMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("ERROR", result.get("type"));
        assertEquals("Failed to join match updates", result.get("message"));
    }

    @Test
    public void testLeaveMatch_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        sessionAttributes.put("matchId", 123L);
        Map<String, Object> leaveMessage = new HashMap<>();

        // When
        Map<String, Object> result = liveUpdateController.leaveMatch(leaveMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("USER_LEFT", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals(123L, result.get("matchId"));
        assertTrue(result.get("message").toString().contains("testuser left match 123"));
    }

    @Test
    public void testHandleMatchChat_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        Map<String, Object> chatMessage = new HashMap<>();
        chatMessage.put("message", "Great goal!");
        chatMessage.put("matchId", "123");

        // When
        Map<String, Object> result = liveUpdateController.handleMatchChat(chatMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("CHAT_MESSAGE", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals("Great goal!", result.get("message"));
        assertEquals(123L, result.get("matchId"));
    }

    @Test
    public void testSubscribeToLeague_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        Map<String, Object> subscriptionMessage = new HashMap<>();
        subscriptionMessage.put("leagueId", "456");

        // When
        Map<String, Object> result = liveUpdateController.subscribeToLeague(subscriptionMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("LEAGUE_SUBSCRIBED", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals(456L, result.get("leagueId"));
        assertTrue(result.get("message").toString().contains("subscribed to league 456"));
    }

    @Test
    public void testSubscribeToPlayer_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        Map<String, Object> subscriptionMessage = new HashMap<>();
        subscriptionMessage.put("playerId", "789");

        // When
        Map<String, Object> result = liveUpdateController.subscribeToPlayer(subscriptionMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("PLAYER_SUBSCRIBED", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals(789L, result.get("playerId"));
        assertTrue(result.get("message").toString().contains("subscribed to player 789"));
    }

    @Test
    public void testSubmitMatchPrediction_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        Map<String, Object> predictionMessage = new HashMap<>();
        predictionMessage.put("matchId", "123");
        predictionMessage.put("prediction", "2-1");
        predictionMessage.put("type", "score");

        // When
        Map<String, Object> result = liveUpdateController.submitMatchPrediction(predictionMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("MATCH_PREDICTION", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals(123L, result.get("matchId"));
        assertEquals("2-1", result.get("prediction"));
        assertEquals("score", result.get("predictionType"));
    }

    @Test
    public void testSubmitMatchReaction_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        Map<String, Object> reactionMessage = new HashMap<>();
        reactionMessage.put("matchId", "123");
        reactionMessage.put("emoji", "⚽");
        reactionMessage.put("eventId", "event1");

        // When
        Map<String, Object> result = liveUpdateController.submitMatchReaction(reactionMessage, headerAccessor);

        // Then
        assertNotNull(result);
        assertEquals("MATCH_REACTION", result.get("type"));
        assertEquals("testuser", result.get("username"));
        assertEquals(123L, result.get("matchId"));
        assertEquals("⚽", result.get("emoji"));
        assertEquals("event1", result.get("eventId"));
    }

    @Test
    public void testRequestMatchData_Success() {
        // Given
        sessionAttributes.put("username", "testuser");
        Map<String, Object> requestMessage = new HashMap<>();
        requestMessage.put("matchId", "123");

        // When/Then - Should not throw exception
        assertDoesNotThrow(() -> 
            liveUpdateController.requestMatchData(requestMessage, headerAccessor)
        );
    }

    @Test
    public void testHandlePing_Success() {
        // Given
        Map<String, Object> pingMessage = new HashMap<>();
        pingMessage.put("ping", "test");

        // When
        Map<String, Object> result = liveUpdateController.handlePing(pingMessage);

        // Then
        assertNotNull(result);
        assertEquals("PONG", result.get("type"));
        assertNotNull(result.get("timestamp"));
    }
}
