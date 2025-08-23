package com.kooora.app.config;

import com.kooora.app.service.RealDataService;
import com.kooora.app.entity.Role;
import com.kooora.app.entity.User;
import com.kooora.app.repository.RoleRepository;
import com.kooora.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.kooora.app.service.LiveDataSimulatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data loader for populating database with real football data
 * 
 * @author Kooora Team
 * @version 2.0.0
 */
@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);
    
    @Autowired
    private RealDataService realDataService;
    
    @Autowired
    private LiveDataSimulatorService liveDataSimulatorService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.username:admin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        logger.info("🚀 Loading real football data...");
        
        // Initialize real football data
        realDataService.initializeRealData();
        
        // Ensure roles and default admin exist
        initializeAdminUser();

        // Initialize live match simulation  
        liveDataSimulatorService.initializeLiveMatches();
        
        logger.info("✅ Data loading completed with live match simulation!");
    }

    private void initializeAdminUser() {
        try {
            // Ensure roles
            if (!roleRepository.existsByName(Role.RoleName.ROLE_USER)) {
                roleRepository.save(new Role(Role.RoleName.ROLE_USER, "Standard user role"));
            }
            if (!roleRepository.existsByName(Role.RoleName.ROLE_ADMIN)) {
                roleRepository.save(new Role(Role.RoleName.ROLE_ADMIN, "Administrator role"));
            }

            // Create admin if missing
            if (userRepository.findByUsername(adminUsername).isEmpty()) {
                User admin = new User();
                admin.setUsername(adminUsername);
                admin.setEmail("admin@kooora.local");
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setFirstName("System");
                admin.setLastName("Admin");
                admin.setIsActive(true);
                admin.addRole(roleRepository.findByName(Role.RoleName.ROLE_USER).orElseGet(() -> new Role(Role.RoleName.ROLE_USER)));
                admin.addRole(roleRepository.findByName(Role.RoleName.ROLE_ADMIN).orElseGet(() -> new Role(Role.RoleName.ROLE_ADMIN)));
                userRepository.save(admin);
                logger.info("✅ Default admin user seeded (username: {})", adminUsername);
            }
        } catch (Exception e) {
            logger.warn("⚠️ Failed to seed admin user: {}", e.getMessage());
        }
    }
}