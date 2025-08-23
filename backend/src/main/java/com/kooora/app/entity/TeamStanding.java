package com.kooora.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

/**
 * TeamStanding entity representing team performance and rankings in leagues
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "team_standings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "league_id"})
})
public class TeamStanding extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id", nullable = false)
    private League league;

    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed = 0;

    @Column(name = "wins", nullable = false)
    private Integer wins = 0;

    @Column(name = "draws", nullable = false)
    private Integer draws = 0;

    @Column(name = "losses", nullable = false)
    private Integer losses = 0;

    @Column(name = "goals_for", nullable = false)
    private Integer goalsFor = 0;

    @Column(name = "goals_against", nullable = false)
    private Integer goalsAgainst = 0;

    @Column(name = "goal_difference", nullable = false)
    private Integer goalDifference = 0;

    @Column(name = "points", nullable = false)
    private Integer points = 0;

    @Column(name = "position")
    private Integer position;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public TeamStanding() {}

    public TeamStanding(Team team, League league) {
        this.team = team;
        this.league = league;
    }

    // Getters and Setters
    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public League getLeague() {
        return league;
    }

    public void setLeague(League league) {
        this.league = league;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public Integer getWins() {
        return wins;
    }

    public void setWins(Integer wins) {
        this.wins = wins;
    }

    public Integer getDraws() {
        return draws;
    }

    public void setDraws(Integer draws) {
        this.draws = draws;
    }

    public Integer getLosses() {
        return losses;
    }

    public void setLosses(Integer losses) {
        this.losses = losses;
    }

    public Integer getGoalsFor() {
        return goalsFor;
    }

    public void setGoalsFor(Integer goalsFor) {
        this.goalsFor = goalsFor;
    }

    public Integer getGoalsAgainst() {
        return goalsAgainst;
    }

    public void setGoalsAgainst(Integer goalsAgainst) {
        this.goalsAgainst = goalsAgainst;
    }

    public Integer getGoalDifference() {
        return goalDifference;
    }

    public void setGoalDifference(Integer goalDifference) {
        this.goalDifference = goalDifference;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    /**
     * Calculate goal difference
     */
    public void calculateGoalDifference() {
        this.goalDifference = this.goalsFor - this.goalsAgainst;
    }

    /**
     * Calculate total points (3 for win, 1 for draw, 0 for loss)
     */
    public void calculatePoints() {
        this.points = (this.wins * 3) + this.draws;
    }

    /**
     * Update standings after a match result
     */
    public void updateAfterMatch(Integer goalsFor, Integer goalsAgainst, boolean isWin, boolean isDraw) {
        this.matchesPlayed++;
        this.goalsFor += goalsFor;
        this.goalsAgainst += goalsAgainst;
        
        if (isWin) {
            this.wins++;
        } else if (isDraw) {
            this.draws++;
        } else {
            this.losses++;
        }
        
        calculateGoalDifference();
        calculatePoints();
    }

    @Override
    public String toString() {
        return "TeamStanding{" +
                "id=" + getId() +
                ", team=" + (team != null ? team.getName() : "null") +
                ", league=" + (league != null ? league.getName() : "null") +
                ", position=" + position +
                ", points=" + points +
                ", matchesPlayed=" + matchesPlayed +
                ", wins=" + wins +
                ", draws=" + draws +
                ", losses=" + losses +
                '}';
    }
}
