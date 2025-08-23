package com.kooora.app.repository;

import com.kooora.app.entity.TeamStanding;
import com.kooora.app.entity.Team;
import com.kooora.app.entity.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for TeamStanding entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface TeamStandingRepository extends JpaRepository<TeamStanding, Long> {

    /**
     * Find standings by league
     */
    List<TeamStanding> findByLeague(League league);

    /**
     * Find standings by league ordered by points (descending) and goal difference (descending)
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.league = :league ORDER BY ts.points DESC, ts.goalDifference DESC")
    List<TeamStanding> findByLeagueOrderByPointsAndGoalDifference(@Param("league") League league);

    /**
     * Find standings by team
     */
    List<TeamStanding> findByTeam(Team team);

    /**
     * Find standing by team and league
     */
    Optional<TeamStanding> findByTeamAndLeague(Team team, League league);

    /**
     * Find active standings
     */
    List<TeamStanding> findByIsActiveTrue();

    /**
     * Find standings by league and active status
     */
    List<TeamStanding> findByLeagueAndIsActiveTrue(League league);

    /**
     * Find top teams by league (top N positions)
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.league = :league AND ts.isActive = true ORDER BY ts.points DESC, ts.goalDifference DESC")
    List<TeamStanding> findTopTeamsByLeague(@Param("league") League league);

    /**
     * Find standings by points range
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.points BETWEEN :minPoints AND :maxPoints")
    List<TeamStanding> findByPointsBetween(@Param("minPoints") Integer minPoints, @Param("maxPoints") Integer maxPoints);

    /**
     * Find standings by league and points range
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.league = :league AND ts.points BETWEEN :minPoints AND :maxPoints")
    List<TeamStanding> findByLeagueAndPointsBetween(@Param("league") League league, @Param("minPoints") Integer minPoints, @Param("maxPoints") Integer maxPoints);

    /**
     * Find standings by matches played range
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.matchesPlayed BETWEEN :minMatches AND :maxMatches")
    List<TeamStanding> findByMatchesPlayedBetween(@Param("minMatches") Integer minMatches, @Param("maxMatches") Integer maxMatches);

    /**
     * Find standings by league and matches played range
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.league = :league AND ts.matchesPlayed BETWEEN :minMatches AND :maxMatches")
    List<TeamStanding> findByLeagueAndMatchesPlayedBetween(@Param("league") League league, @Param("minMatches") Integer minMatches, @Param("maxMatches") Integer maxMatches);

    /**
     * Find standings by position range
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.position BETWEEN :minPosition AND :maxPosition")
    List<TeamStanding> findByPositionBetween(@Param("minPosition") Integer minPosition, @Param("maxPosition") Integer maxPosition);

    /**
     * Find standings by league and position range
     */
    @Query("SELECT ts FROM TeamStanding ts WHERE ts.league = :league AND ts.position BETWEEN :minPosition AND :maxPosition")
    List<TeamStanding> findByLeagueAndPositionBetween(@Param("league") League league, @Param("minPosition") Integer minPosition, @Param("maxPosition") Integer maxPosition);

    /**
     * Count teams in a league
     */
    long countByLeague(League league);

    /**
     * Find standings by team name containing the given string
     */
    @Query("SELECT ts FROM TeamStanding ts JOIN ts.team t WHERE t.name LIKE %:teamName%")
    List<TeamStanding> findByTeamNameContaining(@Param("teamName") String teamName);

    /**
     * Find standings by league ID ordered by position
     */
    List<TeamStanding> findByLeagueIdOrderByPositionAsc(Long leagueId);

    /**
     * Find active standings by league ID ordered by position
     */
    List<TeamStanding> findByLeagueIdAndIsActiveTrueOrderByPositionAsc(Long leagueId);
}
