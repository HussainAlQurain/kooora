package com.kooora.app.repository;

import com.kooora.app.entity.Match;
import com.kooora.app.entity.MatchEvent;
import com.kooora.app.entity.Player;
import com.kooora.app.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for MatchEvent entity
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface MatchEventRepository extends JpaRepository<MatchEvent, Long> {

    /**
     * Find all events for a specific match, ordered by minute
     */
    List<MatchEvent> findByMatchOrderByMinuteAscAdditionalTimeAsc(Match match);

    /**
     * Find events by match ID, ordered by minute
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match.id = :matchId ORDER BY me.minute ASC, me.additionalTime ASC")
    List<MatchEvent> findByMatchIdOrderByMinute(@Param("matchId") Long matchId);

    /**
     * Find events by event type for a specific match
     */
    List<MatchEvent> findByMatchAndEventTypeOrderByMinuteAsc(Match match, MatchEvent.EventType eventType);

    /**
     * Find all scoring events for a match
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match = :match AND me.eventType IN ('GOAL', 'PENALTY_GOAL', 'OWN_GOAL') ORDER BY me.minute ASC")
    List<MatchEvent> findScoringEventsByMatch(@Param("match") Match match);

    /**
     * Find all card events for a match
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match = :match AND me.eventType IN ('YELLOW_CARD', 'RED_CARD') ORDER BY me.minute ASC")
    List<MatchEvent> findCardEventsByMatch(@Param("match") Match match);

    /**
     * Find events by player
     */
    Page<MatchEvent> findByPlayerOrderByCreatedAtDesc(Player player, Pageable pageable);

    /**
     * Find events by team
     */
    Page<MatchEvent> findByTeamOrderByCreatedAtDesc(Team team, Pageable pageable);

    /**
     * Count goals by player
     */
    @Query("SELECT COUNT(me) FROM MatchEvent me WHERE me.player = :player AND me.eventType IN ('GOAL', 'PENALTY_GOAL')")
    Long countGoalsByPlayer(@Param("player") Player player);

    /**
     * Count yellow cards by player
     */
    @Query("SELECT COUNT(me) FROM MatchEvent me WHERE me.player = :player AND me.eventType = 'YELLOW_CARD'")
    Long countYellowCardsByPlayer(@Param("player") Player player);

    /**
     * Count red cards by player
     */
    @Query("SELECT COUNT(me) FROM MatchEvent me WHERE me.player = :player AND me.eventType = 'RED_CARD'")
    Long countRedCardsByPlayer(@Param("player") Player player);

    /**
     * Find latest events across all matches
     */
    @Query("SELECT me FROM MatchEvent me ORDER BY me.createdAt DESC")
    Page<MatchEvent> findLatestEvents(Pageable pageable);

    /**
     * Find events in a specific minute range
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match = :match AND me.minute BETWEEN :startMinute AND :endMinute ORDER BY me.minute ASC")
    List<MatchEvent> findByMatchAndMinuteBetween(@Param("match") Match match, @Param("startMinute") Integer startMinute, @Param("endMinute") Integer endMinute);

    /**
     * Count total events for a match
     */
    Long countByMatch(Match match);

    /**
     * Find the last scoring event for a match (for current score)
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match = :match AND me.homeScore IS NOT NULL AND me.awayScore IS NOT NULL ORDER BY me.minute DESC, me.additionalTime DESC")
    List<MatchEvent> findLastScoringEventByMatch(@Param("match") Match match);

    /**
     * Find events by match and home/away team
     */
    List<MatchEvent> findByMatchAndIsHomeTeamOrderByMinuteAsc(Match match, Boolean isHomeTeam);

    /**
     * Find substitution events for a match
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match = :match AND me.eventType = 'SUBSTITUTION' ORDER BY me.minute ASC")
    List<MatchEvent> findSubstitutionsByMatch(@Param("match") Match match);

    /**
     * Check if player has been substituted off in a match
     */
    @Query("SELECT CASE WHEN COUNT(me) > 0 THEN true ELSE false END FROM MatchEvent me WHERE me.match = :match AND me.playerOut = :player AND me.eventType = 'SUBSTITUTION'")
    Boolean isPlayerSubstitutedOff(@Param("match") Match match, @Param("player") Player player);

    /**
     * Find events by multiple event types
     */
    @Query("SELECT me FROM MatchEvent me WHERE me.match = :match AND me.eventType IN :eventTypes ORDER BY me.minute ASC")
    List<MatchEvent> findByMatchAndEventTypeIn(@Param("match") Match match, @Param("eventTypes") List<MatchEvent.EventType> eventTypes);
}
