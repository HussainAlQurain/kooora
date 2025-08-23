package com.kooora.app.dto;

/**
 * DTO for user registration responses
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
public class SignupResponse {

    private String message;
    private boolean success;

    // Constructors
    public SignupResponse() {}

    public SignupResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
