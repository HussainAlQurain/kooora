package com.kooora.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Player Statistics entity for tracking comprehensive player performance
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "player_statistics", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"player_id", "league_id", "season"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PlayerStatistics extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id", nullable = false)
    private League league;

    @NotNull
    @Column(name = "season", nullable = false, length = 20)
    private String season;

    // Appearance Statistics
    @Min(0)
    @Column(name = "appearances", nullable = false)
    private Integer appearances = 0;

    @Min(0)
    @Column(name = "starts", nullable = false)
    private Integer starts = 0;

    @Min(0)
    @Column(name = "substitute_appearances", nullable = false)
    private Integer substituteAppearances = 0;

    @Min(0)
    @Column(name = "minutes_played", nullable = false)
    private Integer minutesPlayed = 0;

    // Goal Statistics
    @Min(0)
    @Column(name = "goals", nullable = false)
    private Integer goals = 0;

    @Min(0)
    @Column(name = "assists", nullable = false)
    private Integer assists = 0;

    @Min(0)
    @Column(name = "penalty_goals", nullable = false)
    private Integer penaltyGoals = 0;

    @Min(0)
    @Column(name = "own_goals", nullable = false)
    private Integer ownGoals = 0;

    @Min(0)
    @Column(name = "hat_tricks", nullable = false)
    private Integer hatTricks = 0;

    // Card Statistics
    @Min(0)
    @Column(name = "yellow_cards", nullable = false)
    private Integer yellowCards = 0;

    @Min(0)
    @Column(name = "red_cards", nullable = false)
    private Integer redCards = 0;

    @Min(0)
    @Column(name = "second_yellow_cards", nullable = false)
    private Integer secondYellowCards = 0;

    // Performance Statistics
    @Min(0)
    @Column(name = "shots", nullable = false)
    private Integer shots = 0;

    @Min(0)
    @Column(name = "shots_on_target", nullable = false)
    private Integer shotsOnTarget = 0;

    @Min(0)
    @Column(name = "passes", nullable = false)
    private Integer passes = 0;

    @Min(0)
    @Column(name = "pass_completion_percentage")
    private Double passCompletionPercentage;

    @Min(0)
    @Column(name = "key_passes", nullable = false)
    private Integer keyPasses = 0;

    @Min(0)
    @Column(name = "crosses", nullable = false)
    private Integer crosses = 0;

    @Min(0)
    @Column(name = "successful_crosses", nullable = false)
    private Integer successfulCrosses = 0;

    // Defensive Statistics
    @Min(0)
    @Column(name = "tackles", nullable = false)
    private Integer tackles = 0;

    @Min(0)
    @Column(name = "successful_tackles", nullable = false)
    private Integer successfulTackles = 0;

    @Min(0)
    @Column(name = "interceptions", nullable = false)
    private Integer interceptions = 0;

    @Min(0)
    @Column(name = "clearances", nullable = false)
    private Integer clearances = 0;

    @Min(0)
    @Column(name = "blocks", nullable = false)
    private Integer blocks = 0;

    @Min(0)
    @Column(name = "aerial_duels_won", nullable = false)
    private Integer aerialDuelsWon = 0;

    @Min(0)
    @Column(name = "aerial_duels_total", nullable = false)
    private Integer aerialDuelsTotal = 0;

    // Goalkeeper Statistics (if applicable)
    @Min(0)
    @Column(name = "saves", nullable = false)
    private Integer saves = 0;

    @Min(0)
    @Column(name = "goals_conceded", nullable = false)
    private Integer goalsConceded = 0;

    @Min(0)
    @Column(name = "clean_sheets", nullable = false)
    private Integer cleanSheets = 0;

    @Min(0)
    @Column(name = "penalties_saved", nullable = false)
    private Integer penaltiesSaved = 0;

    @Min(0)
    @Column(name = "punches", nullable = false)
    private Integer punches = 0;

    @Min(0)
    @Column(name = "high_claims", nullable = false)
    private Integer highClaims = 0;

    // Additional Performance Metrics
    @Column(name = "player_rating")
    private Double playerRating;

    @Min(0)
    @Column(name = "fouls_committed", nullable = false)
    private Integer foulsCommitted = 0;

    @Min(0)
    @Column(name = "fouls_suffered", nullable = false)
    private Integer foulsSuffered = 0;

    @Min(0)
    @Column(name = "offsides", nullable = false)
    private Integer offsides = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public PlayerStatistics() {}

    public PlayerStatistics(Player player, League league, String season) {
        this.player = player;
        this.league = league;
        this.season = season;
    }

    // Calculated Properties
    public Double getGoalsPerGame() {
        if (appearances > 0) {
            return (double) goals / appearances;
        }
        return 0.0;
    }

    public Double getAssistsPerGame() {
        if (appearances > 0) {
            return (double) assists / appearances;
        }
        return 0.0;
    }

    public Double getGoalsPlusAssistsPerGame() {
        if (appearances > 0) {
            return (double) (goals + assists) / appearances;
        }
        return 0.0;
    }

    public Double getMinutesPerGoal() {
        if (goals > 0) {
            return (double) minutesPlayed / goals;
        }
        return 0.0;
    }

    public Double getAverageMinutesPerGame() {
        if (appearances > 0) {
            return (double) minutesPlayed / appearances;
        }
        return 0.0;
    }

    public Double getShotAccuracy() {
        if (shots > 0) {
            return (double) shotsOnTarget / shots * 100;
        }
        return 0.0;
    }

    public Double getConversionRate() {
        if (shots > 0) {
            return (double) goals / shots * 100;
        }
        return 0.0;
    }

    public Double getTackleSuccessRate() {
        if (tackles > 0) {
            return (double) successfulTackles / tackles * 100;
        }
        return 0.0;
    }

    public Double getCrossAccuracy() {
        if (crosses > 0) {
            return (double) successfulCrosses / crosses * 100;
        }
        return 0.0;
    }

    public Double getAerialDuelSuccessRate() {
        if (aerialDuelsTotal > 0) {
            return (double) aerialDuelsWon / aerialDuelsTotal * 100;
        }
        return 0.0;
    }

    public Double getSavePercentage() {
        int totalShots = saves + goalsConceded;
        if (totalShots > 0) {
            return (double) saves / totalShots * 100;
        }
        return 0.0;
    }

    public Double getCleanSheetPercentage() {
        if (appearances > 0) {
            return (double) cleanSheets / appearances * 100;
        }
        return 0.0;
    }

    public Integer getTotalGoalContributions() {
        return goals + assists;
    }

    public Integer getTotalCards() {
        return yellowCards + redCards + secondYellowCards;
    }

    public Boolean isTopPerformer() {
        return goals >= 15 || assists >= 10 || getTotalGoalContributions() >= 20;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public League getLeague() {
        return league;
    }

    public void setLeague(League league) {
        this.league = league;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public Integer getAppearances() {
        return appearances;
    }

    public void setAppearances(Integer appearances) {
        this.appearances = appearances;
    }

    public Integer getStarts() {
        return starts;
    }

    public void setStarts(Integer starts) {
        this.starts = starts;
    }

    public Integer getSubstituteAppearances() {
        return substituteAppearances;
    }

    public void setSubstituteAppearances(Integer substituteAppearances) {
        this.substituteAppearances = substituteAppearances;
    }

    public Integer getMinutesPlayed() {
        return minutesPlayed;
    }

    public void setMinutesPlayed(Integer minutesPlayed) {
        this.minutesPlayed = minutesPlayed;
    }

    public Integer getGoals() {
        return goals;
    }

    public void setGoals(Integer goals) {
        this.goals = goals;
    }

    public Integer getAssists() {
        return assists;
    }

    public void setAssists(Integer assists) {
        this.assists = assists;
    }

    public Integer getPenaltyGoals() {
        return penaltyGoals;
    }

    public void setPenaltyGoals(Integer penaltyGoals) {
        this.penaltyGoals = penaltyGoals;
    }

    public Integer getOwnGoals() {
        return ownGoals;
    }

    public void setOwnGoals(Integer ownGoals) {
        this.ownGoals = ownGoals;
    }

    public Integer getHatTricks() {
        return hatTricks;
    }

    public void setHatTricks(Integer hatTricks) {
        this.hatTricks = hatTricks;
    }

    public Integer getYellowCards() {
        return yellowCards;
    }

    public void setYellowCards(Integer yellowCards) {
        this.yellowCards = yellowCards;
    }

    public Integer getRedCards() {
        return redCards;
    }

    public void setRedCards(Integer redCards) {
        this.redCards = redCards;
    }

    public Integer getSecondYellowCards() {
        return secondYellowCards;
    }

    public void setSecondYellowCards(Integer secondYellowCards) {
        this.secondYellowCards = secondYellowCards;
    }

    public Integer getShots() {
        return shots;
    }

    public void setShots(Integer shots) {
        this.shots = shots;
    }

    public Integer getShotsOnTarget() {
        return shotsOnTarget;
    }

    public void setShotsOnTarget(Integer shotsOnTarget) {
        this.shotsOnTarget = shotsOnTarget;
    }

    public Integer getPasses() {
        return passes;
    }

    public void setPasses(Integer passes) {
        this.passes = passes;
    }

    public Double getPassCompletionPercentage() {
        return passCompletionPercentage;
    }

    public void setPassCompletionPercentage(Double passCompletionPercentage) {
        this.passCompletionPercentage = passCompletionPercentage;
    }

    public Integer getKeyPasses() {
        return keyPasses;
    }

    public void setKeyPasses(Integer keyPasses) {
        this.keyPasses = keyPasses;
    }

    public Integer getCrosses() {
        return crosses;
    }

    public void setCrosses(Integer crosses) {
        this.crosses = crosses;
    }

    public Integer getSuccessfulCrosses() {
        return successfulCrosses;
    }

    public void setSuccessfulCrosses(Integer successfulCrosses) {
        this.successfulCrosses = successfulCrosses;
    }

    public Integer getTackles() {
        return tackles;
    }

    public void setTackles(Integer tackles) {
        this.tackles = tackles;
    }

    public Integer getSuccessfulTackles() {
        return successfulTackles;
    }

    public void setSuccessfulTackles(Integer successfulTackles) {
        this.successfulTackles = successfulTackles;
    }

    public Integer getInterceptions() {
        return interceptions;
    }

    public void setInterceptions(Integer interceptions) {
        this.interceptions = interceptions;
    }

    public Integer getClearances() {
        return clearances;
    }

    public void setClearances(Integer clearances) {
        this.clearances = clearances;
    }

    public Integer getBlocks() {
        return blocks;
    }

    public void setBlocks(Integer blocks) {
        this.blocks = blocks;
    }

    public Integer getAerialDuelsWon() {
        return aerialDuelsWon;
    }

    public void setAerialDuelsWon(Integer aerialDuelsWon) {
        this.aerialDuelsWon = aerialDuelsWon;
    }

    public Integer getAerialDuelsTotal() {
        return aerialDuelsTotal;
    }

    public void setAerialDuelsTotal(Integer aerialDuelsTotal) {
        this.aerialDuelsTotal = aerialDuelsTotal;
    }

    public Integer getSaves() {
        return saves;
    }

    public void setSaves(Integer saves) {
        this.saves = saves;
    }

    public Integer getGoalsConceded() {
        return goalsConceded;
    }

    public void setGoalsConceded(Integer goalsConceded) {
        this.goalsConceded = goalsConceded;
    }

    public Integer getCleanSheets() {
        return cleanSheets;
    }

    public void setCleanSheets(Integer cleanSheets) {
        this.cleanSheets = cleanSheets;
    }

    public Integer getPenaltiesSaved() {
        return penaltiesSaved;
    }

    public void setPenaltiesSaved(Integer penaltiesSaved) {
        this.penaltiesSaved = penaltiesSaved;
    }

    public Integer getPunches() {
        return punches;
    }

    public void setPunches(Integer punches) {
        this.punches = punches;
    }

    public Integer getHighClaims() {
        return highClaims;
    }

    public void setHighClaims(Integer highClaims) {
        this.highClaims = highClaims;
    }

    public Double getPlayerRating() {
        return playerRating;
    }

    public void setPlayerRating(Double playerRating) {
        this.playerRating = playerRating;
    }

    public Integer getFoulsCommitted() {
        return foulsCommitted;
    }

    public void setFoulsCommitted(Integer foulsCommitted) {
        this.foulsCommitted = foulsCommitted;
    }

    public Integer getFoulsSuffered() {
        return foulsSuffered;
    }

    public void setFoulsSuffered(Integer foulsSuffered) {
        this.foulsSuffered = foulsSuffered;
    }

    public Integer getOffsides() {
        return offsides;
    }

    public void setOffsides(Integer offsides) {
        this.offsides = offsides;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    @Override
    public String toString() {
        return "PlayerStatistics{" +
                "id=" + id +
                ", player=" + (player != null ? player.getFirstName() + " " + player.getLastName() : "null") +
                ", league=" + (league != null ? league.getName() : "null") +
                ", season='" + season + '\'' +
                ", goals=" + goals +
                ", assists=" + assists +
                ", appearances=" + appearances +
                ", minutesPlayed=" + minutesPlayed +
                '}';
    }
}
