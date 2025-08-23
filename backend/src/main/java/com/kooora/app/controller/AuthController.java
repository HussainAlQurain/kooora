package com.kooora.app.controller;

import com.kooora.app.dto.LoginRequest;
import com.kooora.app.dto.LoginResponse;
import com.kooora.app.dto.SignupRequest;
import com.kooora.app.dto.SignupResponse;
import com.kooora.app.entity.Role;
import com.kooora.app.entity.User;
import com.kooora.app.repository.RoleRepository;
import com.kooora.app.repository.UserRepository;
import com.kooora.app.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Authentication controller for user login and registration
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for user: {}", loginRequest.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateToken(authentication);

            logger.info("User {} logged in successfully", loginRequest.getUsername());

            return ResponseEntity.ok(new LoginResponse(jwt, "Bearer"));
        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401).body(new LoginResponse(null, ""));
        }
    }

    @PostMapping("/signup")
    @Operation(summary = "User registration", description = "Register a new user account")
    public ResponseEntity<SignupResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        logger.info("Registration attempt for user: {}", signupRequest.getUsername());

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new SignupResponse("Error: Username is already taken!", false));
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new SignupResponse("Error: Email is already in use!", false));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);

        logger.info("User {} registered successfully", signupRequest.getUsername());

        return ResponseEntity.ok(new SignupResponse("User registered successfully!", true));
    }

    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Test endpoint to verify authentication")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Authentication working!");
    }

    @GetMapping("/test-admin")
    @Operation(summary = "Admin diagnostics", description = "Check admin user existence and roles")
    public ResponseEntity<?> testAdmin() {
        return userRepository.findByUsername("admin")
                .map(u -> ResponseEntity.ok().body(
                        new java.util.LinkedHashMap<>() {{
                            put("exists", true);
                            put("username", u.getUsername());
                            put("roles", u.getRoles().stream().map(r -> r.getName().name()).toArray());
                        }}
                ))
                .orElseGet(() -> ResponseEntity.ok().body(
                        new java.util.LinkedHashMap<>() {{ put("exists", false); }}
                ));
    }
}
