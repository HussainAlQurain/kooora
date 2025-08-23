package com.kooora.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

/**
 * Role entity for user authorization and permissions
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Entity
@Table(name = "roles", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name")
})
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "name", unique = true, nullable = false)
    private RoleName name;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    // Constructors
    public Role() {}

    public Role(RoleName name) {
        this.name = name;
    }

    public Role(RoleName name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public RoleName getName() {
        return name;
    }

    public void setName(RoleName name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "Role{" +
                "id=" + getId() +
                ", name=" + name +
                ", description='" + description + '\'' +
                '}';
    }

    /**
     * Enum defining available roles in the system
     */
    public enum RoleName {
        ROLE_USER,
        ROLE_ADMIN,
        ROLE_MODERATOR
    }
}
