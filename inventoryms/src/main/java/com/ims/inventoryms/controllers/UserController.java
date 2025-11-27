package com.ims.inventoryms.controllers;

import com.ims.inventoryms.dto.UserRequest;
import com.ims.inventoryms.dto.UserResponse;
import com.ims.inventoryms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user management endpoints
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    private final UserService userService;
    
    /**
     * Get all users (Admin only)
     */
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        
        log.info("Fetching all users with pagination: {}", pageable);
        
        Page<UserResponse> users = userService.getAllUsers(pageable);
        
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get user by ID (Admin only)
     */
    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.info("Fetching user by ID: {}", id);
        
        UserResponse user = userService.getUserById(id);
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Create new user (Admin only)
     */
    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        log.info("Creating new user: {}", userRequest.getUsername());
        
        UserResponse user = userService.createUser(userRequest);
        
        log.info("User created successfully with ID: {}", user.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    /**
     * Update user by ID (Admin only)
     */
    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, 
                                                   @Valid @RequestBody UserRequest userRequest) {
        log.info("Updating user with ID: {}", id);
        
        UserResponse user = userService.updateUser(id, userRequest);
        
        log.info("User updated successfully: {}", user.getUsername());
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Delete user by ID (Admin only)
     */
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Deleting user with ID: {}", id);
        
        userService.deleteUser(id);
        
        log.info("User deleted successfully");
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get current user profile
     */
    @GetMapping("/users/profile")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        log.info("Fetching current user profile");
        
        UserResponse user = userService.getCurrentUserProfile();
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Update current user profile
     */
    @PutMapping("/users/profile")
    public ResponseEntity<UserResponse> updateCurrentUserProfile(@Valid @RequestBody UserRequest userRequest) {
        log.info("Updating current user profile");
        
        UserResponse user = userService.updateCurrentUserProfile(userRequest);
        
        log.info("User profile updated successfully");
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Search users (Admin only)
     */
    @GetMapping("/admin/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> searchUsers(@RequestParam String search,
                                                          @PageableDefault(size = 10) Pageable pageable) {
        log.info("Searching users with query: {}", search);
        
        Page<UserResponse> users = userService.searchUsers(search, pageable);
        
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get users by role (Admin only)
     */
    @GetMapping("/admin/users/role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsersByRole(@PathVariable String roleName,
                                                             @PageableDefault(size = 10) Pageable pageable) {
        log.info("Fetching users by role: {}", roleName);
        
        Page<UserResponse> users = userService.getUsersByRole(roleName, pageable);
        
        return ResponseEntity.ok(users);
    }
    
    /**
     * Toggle user status (Admin only)
     */
    @PutMapping("/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id) {
        log.info("Toggling user status for ID: {}", id);
        
        UserResponse user = userService.toggleUserStatus(id);
        
        log.info("User status toggled to {} for user: {}", user.getIsActive(), user.getUsername());
        
        return ResponseEntity.ok(user);
    }
}
