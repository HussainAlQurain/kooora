package com.kooora.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Team entity representing football teams
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "teams", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Team extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @Size(max = 20)
    @Column(name = "short_name")
    private String shortName;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "country_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Country country;

    @Size(max = 255)
    @Column(name = "logo_url")
    private String logoUrl;

    @Size(max = 255)
    @Column(name = "stadium_name")
    private String stadiumName;

    @Column(name = "stadium_capacity")
    private Integer stadiumCapacity;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Size(max = 255)
    @Column(name = "website")
    private String website;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToMany(mappedBy = "teams")
    @JsonIgnore
    private Set<League> leagues = new HashSet<>();

    // Constructors
    public Team() {}

    public Team(String name, Country country) {
        this.name = name;
        this.country = country;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getStadiumName() {
        return stadiumName;
    }

    public void setStadiumName(String stadiumName) {
        this.stadiumName = stadiumName;
    }

    public Integer getStadiumCapacity() {
        return stadiumCapacity;
    }

    public void setStadiumCapacity(Integer stadiumCapacity) {
        this.stadiumCapacity = stadiumCapacity;
    }

    public Integer getFoundedYear() {
        return foundedYear;
    }

    public void setFoundedYear(Integer foundedYear) {
        this.foundedYear = foundedYear;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<League> getLeagues() {
        return leagues;
    }

    public void setLeagues(Set<League> leagues) {
        this.leagues = leagues;
    }

    public void addLeague(League league) {
        this.leagues.add(league);
        league.getTeams().add(this);
    }

    public void removeLeague(League league) {
        this.leagues.remove(league);
        league.getTeams().remove(this);
    }

    @Override
    public String toString() {
        return "Team{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", shortName='" + shortName + '\'' +
                ", country=" + (country != null ? country.getName() : "null") +
                ", foundedYear=" + foundedYear +
                ", isActive=" + isActive +
                '}';
    }
}
