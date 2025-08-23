package com.kooora.app.repository;

import com.kooora.app.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Country entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    /**
     * Find country by code
     */
    Optional<Country> findByCode(String code);

    /**
     * Find country by name
     */
    Optional<Country> findByName(String name);

    /**
     * Check if country exists by code
     */
    boolean existsByCode(String code);

    /**
     * Check if country exists by name
     */
    boolean existsByName(String name);

    /**
     * Find active countries
     */
    List<Country> findByIsActiveTrue();

    /**
     * Find countries by name containing the given string
     */
    @Query("SELECT c FROM Country c WHERE c.name LIKE %:name% OR c.code LIKE %:name%")
    List<Country> findByNameOrCodeContaining(@Param("name") String name);

    /**
     * Find countries by name containing the given string (case insensitive) and active status
     */
    List<Country> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    /**
     * Find countries by name containing the given string (case insensitive)
     */
    List<Country> findByNameContainingIgnoreCase(String name);
}
