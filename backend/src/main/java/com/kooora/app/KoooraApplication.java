package com.kooora.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application class for Kooora Football Application
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class KoooraApplication {

    public static void main(String[] args) {
        SpringApplication.run(KoooraApplication.class, args);
    }
}
