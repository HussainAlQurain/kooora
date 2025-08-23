package com.kooora.app.dto;

import com.kooora.app.entity.Team;

public class TeamDTO {
    private Long id;
    private String name;
    private String shortName;
    private String logoUrl;
    private String stadium;
    private String city;
    private String website;
    private Integer foundedYear;
    private CountryDTO country;

    // Default constructor
    public TeamDTO() {}

    // Constructor from entity
    public TeamDTO(Team team) {
        this.id = team.getId();
        this.name = team.getName();
        this.shortName = team.getShortName();
        this.logoUrl = team.getLogoUrl();
        this.stadium = team.getStadiumName();
        this.city = null; // Team entity doesn't have city field
        this.website = team.getWebsite();
        this.foundedYear = team.getFoundedYear();
        
        // Only set country if it's loaded (avoid lazy loading issues)
        if (team.getCountry() != null) {
            this.country = new CountryDTO(team.getCountry());
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

    public String getStadium() {
        return stadium;
    }

    public void setStadium(String stadium) {
        this.stadium = stadium;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Integer getFoundedYear() {
        return foundedYear;
    }

    public void setFoundedYear(Integer foundedYear) {
        this.foundedYear = foundedYear;
    }

    public CountryDTO getCountry() {
        return country;
    }

    public void setCountry(CountryDTO country) {
        this.country = country;
    }
}
