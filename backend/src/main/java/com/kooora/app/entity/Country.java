package com.kooora.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Country entity representing countries where football leagues operate
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "countries", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name"),
    @UniqueConstraint(columnNames = "code")
})
public class Country extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @NotBlank
    @Size(max = 3)
    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Size(max = 255)
    @Column(name = "flag_url")
    private String flagUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Country() {}

    public Country(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public Country(String name, String code, String flagUrl) {
        this.name = name;
        this.code = code;
        this.flagUrl = flagUrl;
    }

    // Getters and Setters
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    @Override
    public String toString() {
        return "Country{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", code='" + code + '\'' +
                ", flagUrl='" + flagUrl + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
