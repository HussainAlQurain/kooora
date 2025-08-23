package com.kooora.app.repository;

import com.kooora.app.entity.League;
import com.kooora.app.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for League entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface LeagueRepository extends JpaRepository<League, Long> {

    /**
     * Find leagues by country
     */
    List<League> findByCountry(Country country);

    /**
     * Find leagues by country and status
     */
    List<League> findByCountryAndStatus(Country country, League.LeagueStatus status);

    /**
     * Find leagues by season
     */
    List<League> findBySeason(String season);

    /**
     * Find active leagues
     */
    List<League> findByIsActiveTrue();

    /**
     * Find leagues by status
     */
    List<League> findByStatus(League.LeagueStatus status);

    /**
     * Find leagues by country and season
     */
    Optional<League> findByCountryAndNameAndSeason(Country country, String name, String season);

    /**
     * Find league by name
     */
    Optional<League> findByName(String name);

    /**
     * Find leagues starting after a specific date
     */
    List<League> findByStartDateAfter(LocalDate date);

    /**
     * Find leagues ending before a specific date
     */
    List<League> findByEndDateBefore(LocalDate date);

    /**
     * Find leagues by name containing the given string
     */
    @Query("SELECT l FROM League l WHERE l.name LIKE %:name%")
    List<League> findByNameContaining(@Param("name") String name);

    /**
     * Find leagues by country name containing the given string
     */
    @Query("SELECT l FROM League l JOIN l.country c WHERE c.name LIKE %:countryName%")
    List<League> findByCountryNameContaining(@Param("countryName") String countryName);

    /**
     * Find active leagues by country ID
     */
    List<League> findByCountryIdAndIsActiveTrue(Long countryId);

    /**
     * Find leagues by country and active status
     */
    List<League> findByCountryAndIsActiveTrue(Country country);
}
