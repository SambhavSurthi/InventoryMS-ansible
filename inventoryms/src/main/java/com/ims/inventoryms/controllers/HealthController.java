package com.ims.inventoryms.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for health check endpoints
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {
    
    private final DataSource dataSource;
    
    /**
     * Application health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check requested");
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "Inventory Management System");
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
    
    /**
     * Database health check
     */
    @GetMapping("/health/db")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        log.info("Database health check requested");
        
        Map<String, Object> dbHealth = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                dbHealth.put("status", "UP");
                dbHealth.put("database", "MySQL");
                dbHealth.put("connection", "Valid");
                dbHealth.put("timestamp", LocalDateTime.now());
            } else {
                dbHealth.put("status", "DOWN");
                dbHealth.put("error", "Database connection is not valid");
                dbHealth.put("timestamp", LocalDateTime.now());
            }
        } catch (Exception e) {
            log.error("Database health check failed", e);
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
            dbHealth.put("timestamp", LocalDateTime.now());
        }
        
        return ResponseEntity.ok(dbHealth);
    }
}
