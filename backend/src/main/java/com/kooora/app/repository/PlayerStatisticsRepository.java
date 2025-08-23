package com.kooora.app.repository;

import com.kooora.app.entity.PlayerStatistics;
import com.kooora.app.entity.Player;
import com.kooora.app.entity.League;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for PlayerStatistics entity
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface PlayerStatisticsRepository extends JpaRepository<PlayerStatistics, Long> {

    // Find by player
    List<PlayerStatistics> findByPlayerAndIsActiveTrue(Player player);
    
    Page<PlayerStatistics> findByPlayerAndIsActiveTrue(Player player, Pageable pageable);
    
    // Find by league
    List<PlayerStatistics> findByLeagueAndIsActiveTrue(League league);
    
    Page<PlayerStatistics> findByLeagueAndIsActiveTrue(League league, Pageable pageable);
    
    // Find by season
    List<PlayerStatistics> findBySeasonAndIsActiveTrue(String season);
    
    Page<PlayerStatistics> findBySeasonAndIsActiveTrue(String season, Pageable pageable);
    
    // Find by player, league and season
    Optional<PlayerStatistics> findByPlayerAndLeagueAndSeasonAndIsActiveTrue(
        Player player, League league, String season);
    
    // Find by league and season
    List<PlayerStatistics> findByLeagueAndSeasonAndIsActiveTrue(League league, String season);
    
    Page<PlayerStatistics> findByLeagueAndSeasonAndIsActiveTrue(
        League league, String season, Pageable pageable);
    
    // Find by player and season
    List<PlayerStatistics> findByPlayerAndSeasonAndIsActiveTrue(Player player, String season);
    
    // Top scorers queries
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.league = :league " +
           "AND ps.season = :season AND ps.isActive = true ORDER BY ps.goals DESC")
    List<PlayerStatistics> findTopScorersByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season, Pageable pageable);
    
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.season = :season " +
           "AND ps.isActive = true ORDER BY ps.goals DESC")
    List<PlayerStatistics> findTopScorersBySeason(
        @Param("season") String season, Pageable pageable);
    
    // Top assists queries
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.league = :league " +
           "AND ps.season = :season AND ps.isActive = true ORDER BY ps.assists DESC")
    List<PlayerStatistics> findTopAssistsByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season, Pageable pageable);
    
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.season = :season " +
           "AND ps.isActive = true ORDER BY ps.assists DESC")
    List<PlayerStatistics> findTopAssistsBySeason(
        @Param("season") String season, Pageable pageable);
    
    // Best players by goals + assists
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.league = :league " +
           "AND ps.season = :season AND ps.isActive = true ORDER BY (ps.goals + ps.assists) DESC")
    List<PlayerStatistics> findBestPlayersByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season, Pageable pageable);
    
    // Most appearances
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.league = :league " +
           "AND ps.season = :season AND ps.isActive = true ORDER BY ps.appearances DESC")
    List<PlayerStatistics> findMostAppearancesByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season, Pageable pageable);
    
    // Most cards
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.league = :league " +
           "AND ps.season = :season AND ps.isActive = true " +
           "ORDER BY (ps.yellowCards + ps.redCards + ps.secondYellowCards) DESC")
    List<PlayerStatistics> findMostCardsByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season, Pageable pageable);
    
    // Best goalkeepers
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.league = :league " +
           "AND ps.season = :season AND ps.isActive = true " +
           "AND ps.saves > 0 ORDER BY ps.cleanSheets DESC, ps.saves DESC")
    List<PlayerStatistics> findBestGoalkeepersByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season, Pageable pageable);
    
    // Player performance comparison
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.player.position = :position " +
           "AND ps.league = :league AND ps.season = :season AND ps.isActive = true " +
           "ORDER BY (ps.goals + ps.assists) DESC")
    List<PlayerStatistics> findByPositionAndLeagueAndSeasonOrderByPerformance(
        @Param("position") String position, @Param("league") League league, 
        @Param("season") String season, Pageable pageable);
    
    // Average statistics by league and season
    @Query("SELECT AVG(ps.goals), AVG(ps.assists), AVG(ps.appearances), AVG(ps.minutesPlayed) " +
           "FROM PlayerStatistics ps WHERE ps.league = :league AND ps.season = :season " +
           "AND ps.isActive = true")
    Object[] getAverageStatsByLeagueAndSeason(
        @Param("league") League league, @Param("season") String season);
    
    // Count statistics
    @Query("SELECT COUNT(ps) FROM PlayerStatistics ps WHERE ps.goals >= :minGoals " +
           "AND ps.league = :league AND ps.season = :season AND ps.isActive = true")
    long countPlayersWithMinGoals(
        @Param("minGoals") int minGoals, @Param("league") League league, @Param("season") String season);
    
    @Query("SELECT COUNT(ps) FROM PlayerStatistics ps WHERE ps.assists >= :minAssists " +
           "AND ps.league = :league AND ps.season = :season AND ps.isActive = true")
    long countPlayersWithMinAssists(
        @Param("minAssists") int minAssists, @Param("league") League league, @Param("season") String season);
    
    // Find distinct seasons
    @Query("SELECT DISTINCT ps.season FROM PlayerStatistics ps WHERE ps.isActive = true ORDER BY ps.season DESC")
    List<String> findDistinctSeasons();
    
    // Find statistics by team
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.player.team.id = :teamId " +
           "AND ps.season = :season AND ps.isActive = true")
    List<PlayerStatistics> findByTeamAndSeason(@Param("teamId") Long teamId, @Param("season") String season);
    
    // Find top performers across all leagues
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.season = :season AND ps.isActive = true " +
           "AND (ps.goals >= 20 OR ps.assists >= 15 OR (ps.goals + ps.assists) >= 25) " +
           "ORDER BY (ps.goals + ps.assists) DESC")
    List<PlayerStatistics> findTopPerformersBySeason(@Param("season") String season);
    
    // Search by player name
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.isActive = true " +
           "AND (LOWER(ps.player.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(ps.player.lastName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY (ps.goals + ps.assists) DESC")
    List<PlayerStatistics> searchByPlayerName(@Param("query") String query, Pageable pageable);
    
    // Current season statistics (assuming current season is the latest)
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.season = " +
           "(SELECT MAX(ps2.season) FROM PlayerStatistics ps2 WHERE ps2.isActive = true) " +
           "AND ps.isActive = true")
    List<PlayerStatistics> findCurrentSeasonStatistics();
    
    // Performance trends - compare seasons
    @Query("SELECT ps FROM PlayerStatistics ps WHERE ps.player = :player " +
           "AND ps.isActive = true ORDER BY ps.season DESC")
    List<PlayerStatistics> findPlayerCareerStatistics(@Param("player") Player player);
}
