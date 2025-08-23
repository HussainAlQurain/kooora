package com.kooora.app.entity;

import jakarta.persistence.*;

/**
 * Match Event entity representing events that occur during a match
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "match_events")
public class MatchEvent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "minute", nullable = false)
    private Integer minute;

    @Column(name = "additional_time")
    private Integer additionalTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    // For substitutions - player coming off
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_out_id")
    private Player playerOut;

    // For substitutions - player coming on
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_in_id")
    private Player playerIn;

    @Column(name = "is_home_team")
    private Boolean isHomeTeam;

    /**
     * Event types that can occur during a match
     */
    public enum EventType {
        GOAL,
        PENALTY_GOAL,
        OWN_GOAL,
        YELLOW_CARD,
        RED_CARD,
        SUBSTITUTION,
        PENALTY_MISS,
        OFFSIDE,
        CORNER,
        FREE_KICK,
        THROW_IN,
        KICKOFF,
        HALF_TIME,
        FULL_TIME,
        EXTRA_TIME_START,
        PENALTY_SHOOTOUT,
        VAR_CHECK,
        INJURY,
        CELEBRATION,
        BOOKING
    }

    /**
     * Get display text for the minute including additional time
     */
    public String getDisplayMinute() {
        if (additionalTime != null && additionalTime > 0) {
            return minute + "+" + additionalTime;
        }
        return minute.toString();
    }

    /**
     * Check if this is a scoring event
     */
    public boolean isScoringEvent() {
        return eventType == EventType.GOAL || 
               eventType == EventType.PENALTY_GOAL || 
               eventType == EventType.OWN_GOAL;
    }

    /**
     * Check if this is a card event
     */
    public boolean isCardEvent() {
        return eventType == EventType.YELLOW_CARD || eventType == EventType.RED_CARD;
    }

    /**
     * Check if this is a substitution event
     */
    public boolean isSubstitutionEvent() {
        return eventType == EventType.SUBSTITUTION;
    }

    /**
     * Get event icon/emoji for display
     */
    public String getEventIcon() {
        switch (eventType) {
            case GOAL:
            case PENALTY_GOAL:
                return "⚽";
            case OWN_GOAL:
                return "⚽";  // Could use different icon
            case YELLOW_CARD:
                return "🟨";
            case RED_CARD:
                return "🟥";
            case SUBSTITUTION:
                return "🔄";
            case PENALTY_MISS:
                return "❌";
            case CORNER:
                return "🚩";
            case VAR_CHECK:
                return "📺";
            case INJURY:
                return "🩹";
            default:
                return "⚪";
        }
    }

    /**
     * Get formatted event description
     */
    public String getFormattedDescription() {
        StringBuilder sb = new StringBuilder();
        
        sb.append(getEventIcon()).append(" ");
        
        if (player != null) {
            sb.append(player.getFirstName()).append(" ").append(player.getLastName());
        }
        
        if (eventType == EventType.SUBSTITUTION && playerOut != null && playerIn != null) {
            sb.append(" (").append(playerOut.getFirstName()).append(" ").append(playerOut.getLastName())
              .append(" → ").append(playerIn.getFirstName()).append(" ").append(playerIn.getLastName())
              .append(")");
        }
        
        if (description != null && !description.isEmpty()) {
            sb.append(" - ").append(description);
        }
        
        return sb.toString();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Integer getMinute() {
        return minute;
    }

    public void setMinute(Integer minute) {
        this.minute = minute;
    }

    public Integer getAdditionalTime() {
        return additionalTime;
    }

    public void setAdditionalTime(Integer additionalTime) {
        this.additionalTime = additionalTime;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Player getPlayerOut() {
        return playerOut;
    }

    public void setPlayerOut(Player playerOut) {
        this.playerOut = playerOut;
    }

    public Player getPlayerIn() {
        return playerIn;
    }

    public void setPlayerIn(Player playerIn) {
        this.playerIn = playerIn;
    }

    public Boolean getIsHomeTeam() {
        return isHomeTeam;
    }

    public void setIsHomeTeam(Boolean isHomeTeam) {
        this.isHomeTeam = isHomeTeam;
    }
}
