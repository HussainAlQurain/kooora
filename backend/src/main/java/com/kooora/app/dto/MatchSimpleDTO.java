package com.kooora.app.dto;

import com.kooora.app.entity.Match;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class MatchSimpleDTO {
    private Long id;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime matchDate;
    
    private String homeTeamName;
    private String awayTeamName;
    private String homeTeamLogo;
    private String awayTeamLogo;
    private Integer homeScore;
    private Integer awayScore;
    private Match.MatchStatus status;
    private String leagueName;
    private String leagueLogo;
    private String venue;

    // Default constructor
    public MatchSimpleDTO() {}

    // Constructor from entity
    public MatchSimpleDTO(Match match) {
        this.id = match.getId();
        this.matchDate = match.getMatchDate();
        this.homeScore = match.getHomeScore();
        this.awayScore = match.getAwayScore();
        this.status = match.getStatus();
        this.venue = match.getVenue();
        
        // Set team information safely
        if (match.getHomeTeam() != null) {
            this.homeTeamName = match.getHomeTeam().getName();
            this.homeTeamLogo = match.getHomeTeam().getLogoUrl();
        }
        
        if (match.getAwayTeam() != null) {
            this.awayTeamName = match.getAwayTeam().getName();
            this.awayTeamLogo = match.getAwayTeam().getLogoUrl();
        }
        
        if (match.getLeague() != null) {
            this.leagueName = match.getLeague().getName();
            this.leagueLogo = match.getLeague().getLogoUrl();
        }
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDateTime matchDate) {
        this.matchDate = matchDate;
    }

    public String getHomeTeamName() {
        return homeTeamName;
    }

    public void setHomeTeamName(String homeTeamName) {
        this.homeTeamName = homeTeamName;
    }

    public String getAwayTeamName() {
        return awayTeamName;
    }

    public void setAwayTeamName(String awayTeamName) {
        this.awayTeamName = awayTeamName;
    }

    public String getHomeTeamLogo() {
        return homeTeamLogo;
    }

    public void setHomeTeamLogo(String homeTeamLogo) {
        this.homeTeamLogo = homeTeamLogo;
    }

    public String getAwayTeamLogo() {
        return awayTeamLogo;
    }

    public void setAwayTeamLogo(String awayTeamLogo) {
        this.awayTeamLogo = awayTeamLogo;
    }

    public Integer getHomeScore() {
        return homeScore;
    }

    public void setHomeScore(Integer homeScore) {
        this.homeScore = homeScore;
    }

    public Integer getAwayScore() {
        return awayScore;
    }

    public void setAwayScore(Integer awayScore) {
        this.awayScore = awayScore;
    }

    public Match.MatchStatus getStatus() {
        return status;
    }

    public void setStatus(Match.MatchStatus status) {
        this.status = status;
    }

    public String getLeagueName() {
        return leagueName;
    }

    public void setLeagueName(String leagueName) {
        this.leagueName = leagueName;
    }

    public String getLeagueLogo() {
        return leagueLogo;
    }

    public void setLeagueLogo(String leagueLogo) {
        this.leagueLogo = leagueLogo;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }
}
