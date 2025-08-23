package com.kooora.app.dto;

/**
 * DTO for user login responses
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
public class LoginResponse {

    private String accessToken;
    private String tokenType;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String accessToken, String tokenType) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
    }

    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
}
