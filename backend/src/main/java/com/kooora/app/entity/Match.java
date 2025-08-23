package com.kooora.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import jakarta.validation.constraints.Size;

/**
 * Match entity representing football matches between teams
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "matches")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Match extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Team homeTeam;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Team awayTeam;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private League league;

    @Column(name = "match_date", nullable = false)
    private LocalDateTime matchDate;

    @Column(name = "home_team_score")
    private Integer homeTeamScore;

    @Column(name = "away_team_score")
    private Integer awayTeamScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MatchStatus status = MatchStatus.SCHEDULED;

    @Size(max = 255)
    @Column(name = "stadium")
    private String stadium;

    @Size(max = 255)
    @Column(name = "referee")
    private String referee;

    @Column(name = "attendance")
    private Integer attendance;

    @Size(max = 1000)
    @Column(name = "notes")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Match() {}

    public Match(Team homeTeam, Team awayTeam, League league, LocalDateTime matchDate) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.league = league;
        this.matchDate = matchDate;
    }

    // Getters and Setters
    public Team getHomeTeam() {
        return homeTeam;
    }

    public void setHomeTeam(Team homeTeam) {
        this.homeTeam = homeTeam;
    }

    public Team getAwayTeam() {
        return awayTeam;
    }

    public void setAwayTeam(Team awayTeam) {
        this.awayTeam = awayTeam;
    }

    public League getLeague() {
        return league;
    }

    public void setLeague(League league) {
        this.league = league;
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

    // Alias methods for MatchController compatibility
    public Integer getHomeScore() {
        return homeTeamScore;
    }

    public void setHomeScore(Integer homeScore) {
        this.homeTeamScore = homeScore;
    }

    public Integer getAwayScore() {
        return awayTeamScore;
    }

    public void setAwayScore(Integer awayScore) {
        this.awayTeamScore = awayScore;
    }

    public String getVenue() {
        return stadium;
    }

    public void setVenue(String venue) {
        this.stadium = venue;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getScore() {
        if (homeTeamScore != null && awayTeamScore != null) {
            return homeTeamScore + " - " + awayTeamScore;
        }
        return "TBD";
    }

    public Team getWinner() {
        if (homeTeamScore != null && awayTeamScore != null) {
            if (homeTeamScore > awayTeamScore) {
                return homeTeam;
            } else if (awayTeamScore > homeTeamScore) {
                return awayTeam;
            }
        }
        return null; // Draw or match not finished
    }

    @Override
    public String toString() {
        return "Match{" +
                "id=" + getId() +
                ", homeTeam=" + (homeTeam != null ? homeTeam.getName() : "null") +
                ", awayTeam=" + (awayTeam != null ? awayTeam.getName() : "null") +
                ", league=" + (league != null ? league.getName() : "null") +
                ", matchDate=" + matchDate +
                ", score=" + getScore() +
                ", status=" + status +
                '}';
    }

    /**
     * Enum defining match statuses
     */
    public enum MatchStatus {
        SCHEDULED,
        LIVE,
        COMPLETED,
        FINISHED,
        CANCELLED,
        POSTPONED
    }
}
