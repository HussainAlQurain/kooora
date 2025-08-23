package com.kooora.app.repository;

import com.kooora.app.entity.Player;
import com.kooora.app.entity.Team;
import com.kooora.app.entity.Country;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Player entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    /**
     * Find players by team
     */
    List<Player> findByTeam(Team team);

    /**
     * Find players by team and active status
     */
    List<Player> findByTeamAndIsActiveTrue(Team team);

    /**
     * Find players by country
     */
    List<Player> findByCountry(Country country);

    /**
     * Find active players
     */
    List<Player> findByIsActiveTrue();

    /**
     * Find player by jersey number and team
     */
    Optional<Player> findByJerseyNumberAndTeam(String jerseyNumber, Team team);

    /**
     * Find players by position
     */
    List<Player> findByPosition(String position);

    /**
     * Find players by team and position
     */
    List<Player> findByTeamAndPosition(Team team, String position);

    /**
     * Find players by name containing the given string
     */
    @Query("SELECT p FROM Player p WHERE p.firstName LIKE %:name% OR p.lastName LIKE %:name%")
    List<Player> findByNameContaining(@Param("name") String name);

    /**
     * Find players by team name containing the given string
     */
    @Query("SELECT p FROM Player p JOIN p.team t WHERE t.name LIKE %:teamName%")
    List<Player> findByTeamNameContaining(@Param("teamName") String teamName);

    /**
     * Find players by country name containing the given string
     */
    @Query("SELECT p FROM Player p JOIN p.country c WHERE c.name LIKE %:countryName%")
    List<Player> findByCountryNameContaining(@Param("countryName") String countryName);

    /**
     * Find players by age range
     */
    @Query("SELECT p FROM Player p WHERE p.dateOfBirth BETWEEN :startDate AND :endDate")
    List<Player> findByDateOfBirthBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Find players by height range
     */
    List<Player> findByHeightCmBetween(Integer minHeight, Integer maxHeight);

    /**
     * Find players by weight range
     */
    List<Player> findByWeightKgBetween(Integer minWeight, Integer maxWeight);

    /**
     * Find players participating in a specific league (through their team)
     */
    @Query("SELECT p FROM Player p JOIN p.team t JOIN t.leagues l WHERE l.id = :leagueId")
    List<Player> findByLeagueId(@Param("leagueId") Long leagueId);

    /**
     * Find active players with pagination
     */
    Page<Player> findByIsActiveTrue(Pageable pageable);

    /**
     * Find players by team ID and active status
     */
    List<Player> findByTeamIdAndIsActiveTrue(Long teamId);

    /**
     * Search players by first name or last name containing query string with pagination
     */
    @Query("SELECT p FROM Player p WHERE (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) AND p.isActive = true")
    Page<Player> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseAndIsActiveTrue(@Param("firstName") String firstName, @Param("lastName") String lastName, Pageable pageable);

    /**
     * Find players by country and active status
     */
    List<Player> findByCountryAndIsActiveTrue(Country country);

    /**
     * Find players by position containing and active status
     */
    List<Player> findByPositionContainingIgnoreCaseAndIsActiveTrue(String position);

    /**
     * Find player by first name and last name
     */
    Optional<Player> findByFirstNameAndLastName(String firstName, String lastName);
}
