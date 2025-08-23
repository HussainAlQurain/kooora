package com.kooora.app.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kooora.app.entity.*;
import com.kooora.app.service.LiveUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LiveUpdateService
 */
@ExtendWith(SpringExtension.class)
public class LiveUpdateServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private LiveUpdateService liveUpdateService;

    private Match mockMatch;
    private Team homeTeam;
    private Team awayTeam;
    private MatchEvent mockMatchEvent;
    private Player mockPlayer;
    private PlayerStatistics mockPlayerStats;
    private League mockLeague;

    @BeforeEach
    public void setUp() {
        // Setup mock entities
        homeTeam = new Team();
        homeTeam.setId(1L);
        homeTeam.setName("Home Team");

        awayTeam = new Team();
        awayTeam.setId(2L);
        awayTeam.setName("Away Team");

        mockMatch = new Match();
        mockMatch.setId(123L);
        mockMatch.setHomeTeam(homeTeam);
        mockMatch.setAwayTeam(awayTeam);
        mockMatch.setHomeTeamScore(2);
        mockMatch.setAwayTeamScore(1);
        mockMatch.setStatus(Match.MatchStatus.LIVE);

        mockPlayer = new Player();
        mockPlayer.setId(456L);
        mockPlayer.setFirstName("John");
        mockPlayer.setLastName("Doe");

        mockMatchEvent = new MatchEvent();
        mockMatchEvent.setId(789L);
        mockMatchEvent.setMatch(mockMatch);
        mockMatchEvent.setEventType(MatchEvent.EventType.GOAL);
        mockMatchEvent.setMinute(45);
        mockMatchEvent.setAdditionalTime(2);
        mockMatchEvent.setDescription("Goal scored by John Doe");
        mockMatchEvent.setPlayer(mockPlayer);
        mockMatchEvent.setTeam(homeTeam);
        mockMatchEvent.setIsHomeTeam(true);
        mockMatchEvent.setHomeScore(2);
        mockMatchEvent.setAwayScore(1);

        mockLeague = new League();
        mockLeague.setId(101L);
        mockLeague.setName("Test League");

        mockPlayerStats = new PlayerStatistics();
        mockPlayerStats.setId(102L);
        mockPlayerStats.setPlayer(mockPlayer);
        mockPlayerStats.setLeague(mockLeague);
        mockPlayerStats.setSeason("2024-25");
        mockPlayerStats.setGoals(10);
        mockPlayerStats.setAssists(5);
        mockPlayerStats.setAppearances(20);
    }

    @Test
    public void testBroadcastMatchUpdate_Success() {
        // When
        liveUpdateService.broadcastMatchUpdate(mockMatch);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate, times(2)).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        // Check destinations
        assertTrue(destinationCaptor.getAllValues().contains("/topic/matches"));
        assertTrue(destinationCaptor.getAllValues().contains("/topic/match/123"));

        // Check message content
        Map<String, Object> message = messageCaptor.getValue();
        assertEquals("MATCH_UPDATE", message.get("type"));
        assertEquals(123L, message.get("matchId"));
        assertEquals("Home Team", message.get("homeTeam"));
        assertEquals("Away Team", message.get("awayTeam"));
        assertEquals(2, message.get("homeScore"));
        assertEquals(1, message.get("awayScore"));
        assertEquals(Match.MatchStatus.LIVE, message.get("status"));
        assertNotNull(message.get("timestamp"));
    }

    @Test
    public void testBroadcastMatchEvent_Success() {
        // When
        liveUpdateService.broadcastMatchEvent(mockMatchEvent);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate, times(2)).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        // Check destinations
        assertTrue(destinationCaptor.getAllValues().contains("/topic/events"));
        assertTrue(destinationCaptor.getAllValues().contains("/topic/match/123/events"));

        // Check message content
        Map<String, Object> message = messageCaptor.getValue();
        assertEquals("MATCH_EVENT", message.get("type"));
        assertEquals(123L, message.get("matchId"));
        assertEquals(MatchEvent.EventType.GOAL, message.get("eventType"));
        assertEquals("45+2", message.get("minute"));
        assertNotNull(message.get("description"));
        assertEquals("John Doe", message.get("player"));
        assertEquals("Home Team", message.get("team"));
        assertEquals(true, message.get("isHomeTeam"));
        assertEquals(2, message.get("homeScore"));
        assertEquals(1, message.get("awayScore"));
    }

    @Test
    public void testBroadcastMatchStatusChange_Success() {
        // Given
        Match.MatchStatus oldStatus = Match.MatchStatus.SCHEDULED;

        // When
        liveUpdateService.broadcastMatchStatusChange(mockMatch, oldStatus);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate, times(2)).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        // Check destinations
        assertTrue(destinationCaptor.getAllValues().contains("/topic/match-status"));
        assertTrue(destinationCaptor.getAllValues().contains("/topic/match/123/status"));

        // Check message content
        Map<String, Object> message = messageCaptor.getValue();
        assertEquals("MATCH_STATUS_CHANGE", message.get("type"));
        assertEquals(123L, message.get("matchId"));
        assertEquals("Home Team", message.get("homeTeam"));
        assertEquals("Away Team", message.get("awayTeam"));
        assertEquals(Match.MatchStatus.SCHEDULED, message.get("oldStatus"));
        assertEquals(Match.MatchStatus.LIVE, message.get("newStatus"));
    }

    @Test
    public void testBroadcastLeagueStandingsUpdate_Success() {
        // Given
        Long leagueId = 456L;

        // When
        liveUpdateService.broadcastLeagueStandingsUpdate(leagueId);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        assertEquals("/topic/league/456/standings", destinationCaptor.getValue());

        Map<String, Object> message = messageCaptor.getValue();
        assertEquals("STANDINGS_UPDATE", message.get("type"));
        assertEquals(456L, message.get("leagueId"));
        assertNotNull(message.get("timestamp"));
    }

    @Test
    public void testBroadcastPlayerStatsUpdate_Success() {
        // When
        liveUpdateService.broadcastPlayerStatsUpdate(mockPlayerStats);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate, times(2)).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        // Check destinations
        assertTrue(destinationCaptor.getAllValues().contains("/topic/player-stats"));
        assertTrue(destinationCaptor.getAllValues().contains("/topic/player/456/stats"));

        // Check message content
        Map<String, Object> message = messageCaptor.getValue();
        assertEquals("PLAYER_STATS_UPDATE", message.get("type"));
        assertEquals(456L, message.get("playerId"));
        assertEquals("John Doe", message.get("playerName"));
        assertEquals(101L, message.get("leagueId"));
        assertEquals("2024-25", message.get("season"));
        assertEquals(10, message.get("goals"));
        assertEquals(5, message.get("assists"));
        assertEquals(20, message.get("appearances"));
    }

    @Test
    public void testBroadcastNotification_Success() {
        // Given
        String title = "Test Notification";
        String message = "This is a test notification";
        String type = "INFO";

        // When
        liveUpdateService.broadcastNotification(title, message, type);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        assertEquals("/topic/notifications", destinationCaptor.getValue());

        Map<String, Object> notification = messageCaptor.getValue();
        assertEquals("NOTIFICATION", notification.get("type"));
        assertEquals(title, notification.get("title"));
        assertEquals(message, notification.get("message"));
        assertEquals(type, notification.get("notificationType"));
        assertNotNull(notification.get("timestamp"));
    }

    @Test
    public void testSendPrivateMessage_Success() {
        // Given
        String username = "testuser";
        String title = "Private Message";
        String message = "Hello testuser!";

        // When
        liveUpdateService.sendPrivateMessage(username, title, message);

        // Then
        ArgumentCaptor<String> usernameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate).convertAndSendToUser(
            usernameCaptor.capture(), 
            destinationCaptor.capture(), 
            messageCaptor.capture()
        );

        assertEquals(username, usernameCaptor.getValue());
        assertEquals("/queue/messages", destinationCaptor.getValue());

        Map<String, Object> privateMsg = messageCaptor.getValue();
        assertEquals("PRIVATE_MESSAGE", privateMsg.get("type"));
        assertEquals(title, privateMsg.get("title"));
        assertEquals(message, privateMsg.get("message"));
        assertNotNull(privateMsg.get("timestamp"));
    }

    @Test
    public void testBroadcastMatchCommentary_Success() {
        // Given
        Long matchId = 123L;
        String commentary = "Great save by the goalkeeper!";
        String commentator = "John Smith";

        // When
        liveUpdateService.broadcastMatchCommentary(matchId, commentary, commentator);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        assertEquals("/topic/match/123/commentary", destinationCaptor.getValue());

        Map<String, Object> comment = messageCaptor.getValue();
        assertEquals("MATCH_COMMENTARY", comment.get("type"));
        assertEquals(matchId, comment.get("matchId"));
        assertEquals(commentary, comment.get("commentary"));
        assertEquals(commentator, comment.get("commentator"));
        assertNotNull(comment.get("timestamp"));
    }

    @Test
    public void testBroadcastSystemAlert_Success() {
        // Given
        String alert = "System maintenance scheduled";
        String severity = "WARNING";

        // When
        liveUpdateService.broadcastSystemAlert(alert, severity);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        assertEquals("/topic/system", destinationCaptor.getValue());

        Map<String, Object> systemAlert = messageCaptor.getValue();
        assertEquals("SYSTEM_ALERT", systemAlert.get("type"));
        assertEquals(alert, systemAlert.get("alert"));
        assertEquals(severity, systemAlert.get("severity"));
        assertNotNull(systemAlert.get("timestamp"));
    }

    @Test
    public void testBroadcastInjuryUpdate_Success() {
        // Given
        Long playerId = 456L;
        String playerName = "John Doe";
        String injuryStatus = "Injured";
        String expectedReturn = "2 weeks";

        // When
        liveUpdateService.broadcastInjuryUpdate(playerId, playerName, injuryStatus, expectedReturn);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate, times(2)).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        // Check destinations
        assertTrue(destinationCaptor.getAllValues().contains("/topic/injuries"));
        assertTrue(destinationCaptor.getAllValues().contains("/topic/player/456/injury"));

        Map<String, Object> injury = messageCaptor.getValue();
        assertEquals("INJURY_UPDATE", injury.get("type"));
        assertEquals(playerId, injury.get("playerId"));
        assertEquals(playerName, injury.get("playerName"));
        assertEquals(injuryStatus, injury.get("injuryStatus"));
        assertEquals(expectedReturn, injury.get("expectedReturn"));
        assertNotNull(injury.get("timestamp"));
    }

    @Test
    public void testBroadcastTransferNews_Success() {
        // Given
        String playerName = "John Doe";
        String fromTeam = "Team A";
        String toTeam = "Team B";
        String transferType = "Permanent";

        // When
        liveUpdateService.broadcastTransferNews(playerName, fromTeam, toTeam, transferType);

        // Then
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(messagingTemplate).convertAndSend(destinationCaptor.capture(), messageCaptor.capture());

        assertEquals("/topic/transfers", destinationCaptor.getValue());

        Map<String, Object> transfer = messageCaptor.getValue();
        assertEquals("TRANSFER_NEWS", transfer.get("type"));
        assertEquals(playerName, transfer.get("playerName"));
        assertEquals(fromTeam, transfer.get("fromTeam"));
        assertEquals(toTeam, transfer.get("toTeam"));
        assertEquals(transferType, transfer.get("transferType"));
        assertNotNull(transfer.get("timestamp"));
    }

    @Test
    public void testBroadcastMatchUpdate_ExceptionHandling() {
        // Given
        Match nullMatch = null;

        // When/Then - Should not throw exception, should log error
        assertDoesNotThrow(() -> liveUpdateService.broadcastMatchUpdate(nullMatch));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Map.class));
    }

    @Test
    public void testBroadcastMatchEvent_ExceptionHandling() {
        // Given
        MatchEvent nullEvent = null;

        // When/Then - Should not throw exception, should log error
        assertDoesNotThrow(() -> liveUpdateService.broadcastMatchEvent(nullEvent));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Map.class));
    }
}
