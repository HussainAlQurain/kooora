package com.kooora.app.dto;

import com.kooora.app.entity.Country;

public class CountryDTO {
    private Long id;
    private String name;
    private String code;
    private String flagUrl;

    // Default constructor
    public CountryDTO() {}

    // Constructor from entity
    public CountryDTO(Country country) {
        this.id = country.getId();
        this.name = country.getName();
        this.code = country.getCode();
        this.flagUrl = country.getFlagUrl();
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getFlagUrl() {
        return flagUrl;
    }

    public void setFlagUrl(String flagUrl) {
        this.flagUrl = flagUrl;
    }
}
