package com.kooora.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Simple match controller to test API response
 * 
 * @author Kooora Team  
 * @version 1.0.0
 */
@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*")
public class SimpleMatchController {

    @GetMapping("/simple-matches")
    public ResponseEntity<List<String>> getSimpleMatches(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(List.of("No live matches currently", "API is working"));
    }
}
