package com.ims.inventoryms.config;

import com.ims.inventoryms.entity.Role;
import com.ims.inventoryms.entity.User;
import com.ims.inventoryms.repository.RoleRepository;
import com.ims.inventoryms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Data initializer to populate default roles and admin user
 * Runs on application startup to ensure the system has required data
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");
        
        // Initialize roles
        initializeRoles();
        
        // Initialize default admin user
        initializeDefaultAdmin();
        
        log.info("Data initialization completed successfully!");
    }
    
    /**
     * Initialize default roles if they don't exist
     */
    private void initializeRoles() {
        log.info("Initializing roles...");
        
        // Create ADMIN role
        if (!roleRepository.existsByName(Role.RoleName.ADMIN)) {
            Role adminRole = new Role();
            adminRole.setName(Role.RoleName.ADMIN);
            adminRole.setDescription("System Administrator with full access");
            roleRepository.save(adminRole);
            log.info("Created ADMIN role");
        }
        
        // Create MANAGER role
        if (!roleRepository.existsByName(Role.RoleName.MANAGER)) {
            Role managerRole = new Role();
            managerRole.setName(Role.RoleName.MANAGER);
            managerRole.setDescription("Manager with inventory and reporting access");
            roleRepository.save(managerRole);
            log.info("Created MANAGER role");
        }
        
        // Create SALES role
        if (!roleRepository.existsByName(Role.RoleName.SALES)) {
            Role salesRole = new Role();
            salesRole.setName(Role.RoleName.SALES);
            salesRole.setDescription("Sales representative with order processing access");
            roleRepository.save(salesRole);
            log.info("Created SALES role");
        }
    }
    
    /**
     * Initialize default admin user if it doesn't exist
     */
    private void initializeDefaultAdmin() {
        log.info("Initializing default admin user...");
        
        if (!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
            
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@inventoryms.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setFirstName("System");
            adminUser.setLastName("Administrator");
            adminUser.setPhone("1234567890");
            adminUser.setRole(adminRole);
            adminUser.setIsActive(true);
            adminUser.setIsAccountNonExpired(true);
            adminUser.setIsAccountNonLocked(true);
            adminUser.setIsCredentialsNonExpired(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            log.info("Created default admin user: admin/admin123");
        } else {
            log.info("Default admin user already exists");
        }
        
        // Create default manager user
        if (!userRepository.existsByUsername("manager")) {
            Role managerRole = roleRepository.findByName(Role.RoleName.MANAGER)
                    .orElseThrow(() -> new RuntimeException("MANAGER role not found"));
            
            User managerUser = new User();
            managerUser.setUsername("manager");
            managerUser.setEmail("manager@inventoryms.com");
            managerUser.setPassword(passwordEncoder.encode("manager123"));
            managerUser.setFirstName("Inventory");
            managerUser.setLastName("Manager");
            managerUser.setPhone("1234567891");
            managerUser.setRole(managerRole);
            managerUser.setIsActive(true);
            managerUser.setIsAccountNonExpired(true);
            managerUser.setIsAccountNonLocked(true);
            managerUser.setIsCredentialsNonExpired(true);
            managerUser.setCreatedAt(LocalDateTime.now());
            managerUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(managerUser);
            log.info("Created default manager user: manager/manager123");
        }
        
        // Create default sales user
        if (!userRepository.existsByUsername("sales")) {
            Role salesRole = roleRepository.findByName(Role.RoleName.SALES)
                    .orElseThrow(() -> new RuntimeException("SALES role not found"));
            
            User salesUser = new User();
            salesUser.setUsername("sales");
            salesUser.setEmail("sales@inventoryms.com");
            salesUser.setPassword(passwordEncoder.encode("sales123"));
            salesUser.setFirstName("Sales");
            salesUser.setLastName("Representative");
            salesUser.setPhone("1234567892");
            salesUser.setRole(salesRole);
            salesUser.setIsActive(true);
            salesUser.setIsAccountNonExpired(true);
            salesUser.setIsAccountNonLocked(true);
            salesUser.setIsCredentialsNonExpired(true);
            salesUser.setCreatedAt(LocalDateTime.now());
            salesUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(salesUser);
            log.info("Created default sales user: sales/sales123");
        }
    }
}
