package com.ims.inventoryms.controllers;

import com.ims.inventoryms.dto.LoginRequest;
import com.ims.inventoryms.dto.LoginResponse;
import com.ims.inventoryms.dto.UserRequest;
import com.ims.inventoryms.dto.UserResponse;
import com.ims.inventoryms.service.AuthService;
import com.ims.inventoryms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private final AuthService authService;
    private final UserService userService;
    
    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());
        
        LoginResponse response = authService.login(loginRequest);
        
        log.info("Login successful for user: {}", loginRequest.getUsername());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * User registration endpoint (Admin only)
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest userRequest) {
        log.info("Registration attempt for user: {}", userRequest.getUsername());
        
        UserResponse response = userService.createUser(userRequest);
        
        log.info("User registered successfully: {}", userRequest.getUsername());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Refresh token endpoint
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        log.info("Token refresh request");
        
        LoginResponse response = authService.refreshToken(refreshTokenRequest.getRefreshToken());
        
        log.info("Token refreshed successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * User logout endpoint
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        log.info("Logout request");
        
        // In a stateless JWT system, logout is handled on the client side
        // by removing the token. We could implement a blacklist for tokens
        // if needed for enhanced security.
        
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Logged out successfully")
                .build());
    }
    
    /**
     * DTO for refresh token request
     */
    public static class RefreshTokenRequest {
        private String refreshToken;
        
        public String getRefreshToken() {
            return refreshToken;
        }
        
        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
    
    /**
     * Generic API response DTO
     */
    public static class ApiResponse {
        private boolean success;
        private String message;
        
        public static ApiResponseBuilder builder() {
            return new ApiResponseBuilder();
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public static class ApiResponseBuilder {
            private boolean success;
            private String message;
            
            public ApiResponseBuilder success(boolean success) {
                this.success = success;
                return this;
            }
            
            public ApiResponseBuilder message(String message) {
                this.message = message;
                return this;
            }
            
            public ApiResponse build() {
                ApiResponse response = new ApiResponse();
                response.success = this.success;
                response.message = this.message;
                return response;
            }
        }
    }
}
