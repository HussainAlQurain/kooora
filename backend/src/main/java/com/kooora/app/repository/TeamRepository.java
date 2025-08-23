package com.kooora.app.repository;

import com.kooora.app.entity.Team;
import com.kooora.app.entity.Country;
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
 * Repository interface for Team entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    /**
     * Find teams by country
     */
    List<Team> findByCountry(Country country);

    /**
     * Find teams by country and active status
     */
    List<Team> findByCountryAndIsActiveTrue(Country country);

    /**
     * Find active teams
     */
    List<Team> findByIsActiveTrue();

    /**
     * Find team by name
     */
    Optional<Team> findByName(String name);

    /**
     * Find team by short name
     */
    Optional<Team> findByShortName(String shortName);

    /**
     * Check if team exists by name
     */
    boolean existsByName(String name);

    /**
     * Check if team exists by short name
     */
    boolean existsByShortName(String shortName);

    /**
     * Find teams by name containing the given string
     */
    @Query("SELECT t FROM Team t WHERE t.name LIKE %:name% OR t.shortName LIKE %:name%")
    List<Team> findByNameContaining(@Param("name") String name);

    /**
     * Find teams by country name containing the given string
     */
    @Query("SELECT t FROM Team t JOIN t.country c WHERE c.name LIKE %:countryName%")
    List<Team> findByCountryNameContaining(@Param("countryName") String countryName);

    /**
     * Find teams participating in a specific league
     */
    @Query("SELECT t FROM Team t JOIN t.leagues l WHERE l.id = :leagueId")
    List<Team> findByLeagueId(@Param("leagueId") Long leagueId);

    /**
     * Find teams by founded year range
     */
    List<Team> findByFoundedYearBetween(Integer startYear, Integer endYear);

    /**
     * Find teams by name containing the given string (case insensitive) and active status
     */
    Page<Team> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);

    /**
     * Find teams by name containing the given string (case insensitive)
     */
    List<Team> findByNameContainingIgnoreCase(String name);
}
