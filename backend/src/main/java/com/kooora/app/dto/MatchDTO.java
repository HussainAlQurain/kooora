package com.kooora.app.dto;

import com.kooora.app.entity.Match;
import java.time.LocalDateTime;

/**
 * DTO for Match entity to avoid lazy loading issues
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
public class MatchDTO {
    
    private Long id;
    private String homeTeamName;
    private String awayTeamName;
    private String leagueName;
    private LocalDateTime matchDate;
    private Integer homeTeamScore;
    private Integer awayTeamScore;
    private String status;
    private String stadium;
    private String referee;
    private Integer attendance;
    private String notes;
    
    // Constructors
    public MatchDTO() {}
    
    public MatchDTO(Match match) {
        this.id = match.getId();
        
        // Handle lazy loaded entities safely
        try {
            this.homeTeamName = match.getHomeTeam() != null ? match.getHomeTeam().getName() : "Unknown Home Team";
        } catch (Exception e) {
            this.homeTeamName = "Unknown Home Team";
        }
        
        try {
            this.awayTeamName = match.getAwayTeam() != null ? match.getAwayTeam().getName() : "Unknown Away Team";
        } catch (Exception e) {
            this.awayTeamName = "Unknown Away Team";
        }
        
        try {
            this.leagueName = match.getLeague() != null ? match.getLeague().getName() : "Unknown League";
        } catch (Exception e) {
            this.leagueName = "Unknown League";
        }
        
        this.matchDate = match.getMatchDate();
        this.homeTeamScore = match.getHomeTeamScore();
        this.awayTeamScore = match.getAwayTeamScore();
        this.status = match.getStatus() != null ? match.getStatus().toString() : null;
        this.stadium = match.getStadium();
        this.referee = match.getReferee();
        this.attendance = match.getAttendance();
        this.notes = match.getNotes();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getLeagueName() {
        return leagueName;
    }
    
    public void setLeagueName(String leagueName) {
        this.leagueName = leagueName;
    }
    
    public LocalDateTime getMatchDate() {
        return matchDate;
    }
    
    public void setMatchDate(LocalDateTime matchDate) {
        this.matchDate = matchDate;
    }
    
    public Integer getHomeTeamScore() {
        return homeTeamScore;
    }
    
    public void setHomeTeamScore(Integer homeTeamScore) {
        this.homeTeamScore = homeTeamScore;
    }
    
    public Integer getAwayTeamScore() {
        return awayTeamScore;
    }
    
    public void setAwayTeamScore(Integer awayTeamScore) {
        this.awayTeamScore = awayTeamScore;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getStadium() {
        return stadium;
    }
    
    public void setStadium(String stadium) {
        this.stadium = stadium;
    }
    
    public String getReferee() {
        return referee;
    }
    
    public void setReferee(String referee) {
        this.referee = referee;
    }
    
    public Integer getAttendance() {
        return attendance;
    }
    
    public void setAttendance(Integer attendance) {
        this.attendance = attendance;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
