package com.kooora.app.dto;

import com.kooora.app.entity.League;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class LeagueDTO {
    private Long id;
    private String name;
    private String shortName;
    private String logoUrl;
    private CountryDTO country;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private String season;
    private League.LeagueStatus status;

    // Default constructor
    public LeagueDTO() {}

    // Constructor from entity
    public LeagueDTO(League league) {
        this.id = league.getId();
        this.name = league.getName();
        this.shortName = league.getName(); // League entity doesn't have shortName
        this.logoUrl = league.getLogoUrl();
        this.startDate = league.getStartDate();
        this.endDate = league.getEndDate();
        this.season = league.getSeason();
        this.status = league.getStatus();
        
        // Only set country if it's loaded (avoid lazy loading issues)
        if (league.getCountry() != null) {
            this.country = new CountryDTO(league.getCountry());
        }
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public CountryDTO getCountry() {
        return country;
    }

    public void setCountry(CountryDTO country) {
        this.country = country;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public League.LeagueStatus getStatus() {
        return status;
    }

    public void setStatus(League.LeagueStatus status) {
        this.status = status;
    }
}
