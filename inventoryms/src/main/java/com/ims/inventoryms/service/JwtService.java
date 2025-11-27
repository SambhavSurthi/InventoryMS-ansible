package com.ims.inventoryms.service;

import com.ims.inventoryms.config.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Service class for JWT token operations
 */
@Service
@RequiredArgsConstructor
public class JwtService {
    
    private final JwtUtils jwtUtils;
    
    /**
     * Generate access token for user
     */
    public String generateAccessToken(UserDetails userDetails) {
        return jwtUtils.generateAccessToken(userDetails);
    }
    
    /**
     * Generate refresh token for user
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return jwtUtils.generateRefreshToken(userDetails);
    }
    
    /**
     * Extract username from token
     */
    public String extractUsername(String token) {
        return jwtUtils.extractUsername(token);
    }
    
    /**
     * Validate token
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        return jwtUtils.validateToken(token, userDetails);
    }
    
    /**
     * Check if token is refresh token
     */
    public boolean isRefreshToken(String token) {
        return jwtUtils.isRefreshToken(token);
    }
    
    /**
     * Get token expiration time
     */
    public long getExpirationTime() {
        return jwtUtils.getExpirationTime();
    }
}
