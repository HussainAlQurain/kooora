package com.kooora.app.repository;

import com.kooora.app.entity.Match;
import com.kooora.app.entity.Team;
import com.kooora.app.entity.League;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Match entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    /**
     * Find matches by league
     */
    List<Match> findByLeague(League league);

    /**
     * Find matches by team (home or away)
     */
    @Query("SELECT m FROM Match m WHERE m.homeTeam = :team OR m.awayTeam = :team")
    List<Match> findByTeam(@Param("team") Team team);

    /**
     * Find matches by home team
     */
    List<Match> findByHomeTeam(Team homeTeam);

    /**
     * Find matches by away team
     */
    List<Match> findByAwayTeam(Team awayTeam);

    /**
     * Find matches by status
     */
    List<Match> findByStatus(Match.MatchStatus status);

    /**
     * Find matches by league and status
     */
    List<Match> findByLeagueAndStatus(League league, Match.MatchStatus status);

    /**
     * Find matches by date range
     */
    List<Match> findByMatchDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find matches between two specific teams
     */
    List<Match> findByHomeTeamAndAwayTeam(Team homeTeam, Team awayTeam);

    /**
     * Find matches by date
     */
    List<Match> findByMatchDate(LocalDateTime matchDate);

    /**
     * Find matches after a specific date
     */
    List<Match> findByMatchDateAfter(LocalDateTime date);

    /**
     * Find matches before a specific date
     */
    List<Match> findByMatchDateBefore(LocalDateTime date);

    /**
     * Find today's matches
     */
    @Query("SELECT m FROM Match m WHERE CAST(m.matchDate AS date) = CURRENT_DATE")
    List<Match> findTodayMatches();

    /**
     * Find upcoming matches
     */
    @Query("SELECT m FROM Match m WHERE m.matchDate > CURRENT_TIMESTAMP AND m.status = 'SCHEDULED' ORDER BY m.matchDate")
    List<Match> findUpcomingMatches();

    /**
     * Find recent matches
     */
    @Query("SELECT m FROM Match m WHERE m.matchDate < CURRENT_TIMESTAMP AND m.status = 'FINISHED' ORDER BY m.matchDate DESC")
    List<Match> findRecentMatches();

    /**
     * Find live matches
     */
    List<Match> findByStatusOrderByMatchDate(Match.MatchStatus status);

    /**
     * Find matches by team and date range
     */
    @Query("SELECT m FROM Match m WHERE (m.homeTeam = :team OR m.awayTeam = :team) AND m.matchDate BETWEEN :startDate AND :endDate")
    List<Match> findByTeamAndDateRange(@Param("team") Team team, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find matches by league and date range
     */
    List<Match> findByLeagueAndMatchDateBetween(League league, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find matches by stadium
     */
    List<Match> findByStadium(String stadium);

    /**
     * Find matches by referee
     */
    List<Match> findByReferee(String referee);

    /**
     * Find matches by home team ID or away team ID
     */
    List<Match> findByHomeTeamIdOrAwayTeamId(Long homeTeamId, Long awayTeamId);

    /**
     * Find matches by league ID
     */
    List<Match> findByLeagueId(Long leagueId);

    /**
     * Find matches by status with pagination
     */
    List<Match> findByStatus(Match.MatchStatus status, Pageable pageable);

    /**
     * Find matches by status and date after with pagination
     */
    List<Match> findByStatusAndMatchDateAfter(Match.MatchStatus status, LocalDateTime date, Pageable pageable);
    
    /**
     * Find matches by multiple status values with native query
     */
    @Query(value = "SELECT m.id, m.match_date, m.home_team_score, m.away_team_score, m.status, " +
           "m.stadium, m.referee, m.attendance, m.notes, " +
           "ht.name as home_team_name, at.name as away_team_name, l.name as league_name " +
           "FROM matches m " +
           "JOIN teams ht ON m.home_team_id = ht.id " +
           "JOIN teams at ON m.away_team_id = at.id " +
           "JOIN leagues l ON m.league_id = l.id " +
           "WHERE m.status IN (:statuses) " +
           "ORDER BY m.match_date DESC", 
           nativeQuery = true)
    List<Object[]> findMatchesByStatusNative(@Param("statuses") List<String> statuses);
    
    /**
     * Find all matches with eager loading for pagination
     */
    @Query("SELECT m FROM Match m " +
           "LEFT JOIN FETCH m.homeTeam " +
           "LEFT JOIN FETCH m.awayTeam " +
           "LEFT JOIN FETCH m.league " +
           "ORDER BY m.matchDate DESC")
    List<Match> findAllWithEagerLoading(Pageable pageable);
}
