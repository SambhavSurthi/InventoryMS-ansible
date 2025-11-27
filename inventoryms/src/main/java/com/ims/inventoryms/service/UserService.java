package com.ims.inventoryms.service;

import com.ims.inventoryms.dto.UserRequest;
import com.ims.inventoryms.dto.UserResponse;
import com.ims.inventoryms.entity.Role;
import com.ims.inventoryms.entity.User;
import com.ims.inventoryms.repository.RoleRepository;
import com.ims.inventoryms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for user management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Get all users with pagination
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::mapToUserResponse);
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return mapToUserResponse(user);
    }
    
    /**
     * Create a new user
     */
    public UserResponse createUser(UserRequest userRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userRequest.getUsername());
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequest.getEmail());
        }
        
        // Get role
        Role role = roleRepository.findByName(userRequest.getRole())
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + userRequest.getRole()));
        
        // Create new user
        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setPhone(userRequest.getPhone());
        user.setRole(role);
        user.setIsActive(userRequest.getIsActive());
        
        User savedUser = userRepository.save(user);
        
        log.info("User created successfully: {}", savedUser.getUsername());
        
        return mapToUserResponse(savedUser);
    }
    
    /**
     * Update user by ID
     */
    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        // Check if username already exists (excluding current user)
        if (!user.getUsername().equals(userRequest.getUsername()) && 
            userRepository.existsByUsername(userRequest.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userRequest.getUsername());
        }
        
        // Check if email already exists (excluding current user)
        if (!user.getEmail().equals(userRequest.getEmail()) && 
            userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequest.getEmail());
        }
        
        // Get role
        Role role = roleRepository.findByName(userRequest.getRole())
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + userRequest.getRole()));
        
        // Update user fields
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        
        // Only update password if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setPhone(userRequest.getPhone());
        user.setRole(role);
        user.setIsActive(userRequest.getIsActive());
        
        User savedUser = userRepository.save(user);
        
        log.info("User updated successfully: {}", savedUser.getUsername());
        
        return mapToUserResponse(savedUser);
    }
    
    /**
     * Delete user by ID
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        // Prevent deleting the current user
        User currentUser = getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Cannot delete your own account");
        }
        
        userRepository.delete(user);
        
        log.info("User deleted successfully: {}", user.getUsername());
    }
    
    /**
     * Get current user profile
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User currentUser = getCurrentUser();
        return mapToUserResponse(currentUser);
    }
    
    /**
     * Update current user profile
     */
    public UserResponse updateCurrentUserProfile(UserRequest userRequest) {
        User currentUser = getCurrentUser();
        
        // Check if email already exists (excluding current user)
        if (!currentUser.getEmail().equals(userRequest.getEmail()) && 
            userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequest.getEmail());
        }
        
        // Update only allowed fields for profile update
        currentUser.setEmail(userRequest.getEmail());
        currentUser.setFirstName(userRequest.getFirstName());
        currentUser.setLastName(userRequest.getLastName());
        currentUser.setPhone(userRequest.getPhone());
        
        // Only update password if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().trim().isEmpty()) {
            currentUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        
        User savedUser = userRepository.save(currentUser);
        
        log.info("User profile updated successfully: {}", savedUser.getUsername());
        
        return mapToUserResponse(savedUser);
    }
    
    /**
     * Search users by name or email
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String search, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(search, pageable);
        return users.map(this::mapToUserResponse);
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(String roleName) {
        List<User> users = userRepository.findByRoleName(roleName);
        return users.stream().map(this::mapToUserResponse).toList();
    }
    
    /**
     * Get users by role with pagination
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(String roleName, Pageable pageable) {
        Page<User> users = userRepository.findByRoleName(roleName, pageable);
        return users.map(this::mapToUserResponse);
    }
    
    /**
     * Activate/Deactivate user
     */
    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);
        
        log.info("User status toggled to {} for user: {}", savedUser.getIsActive(), savedUser.getUsername());
        
        return mapToUserResponse(savedUser);
    }
    
    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("No authenticated user found");
        }
        
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
    
    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(UserResponse.RoleResponse.builder()
                        .id(user.getRole().getId())
                        .name(user.getRole().getName())
                        .displayName(user.getRole().getName().getDisplayName())
                        .description(user.getRole().getDescription())
                        .build())
                .isActive(user.getIsActive())
                .isAccountNonExpired(user.getIsAccountNonExpired())
                .isAccountNonLocked(user.getIsAccountNonLocked())
                .isCredentialsNonExpired(user.getIsCredentialsNonExpired())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
