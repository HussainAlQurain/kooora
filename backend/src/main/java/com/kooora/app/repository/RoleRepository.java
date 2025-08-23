package com.kooora.app.repository;

import com.kooora.app.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entity operations
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find role by name
     */
    Optional<Role> findByName(Role.RoleName name);

    /**
     * Check if role exists by name
     */
    boolean existsByName(Role.RoleName name);
}
