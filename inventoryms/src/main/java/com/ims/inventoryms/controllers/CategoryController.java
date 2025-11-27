package com.ims.inventoryms.controllers;

import com.ims.inventoryms.dto.CategoryRequest;
import com.ims.inventoryms.dto.CategoryResponse;
import com.ims.inventoryms.service.CategoryService;
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

import java.util.List;

/**
 * REST controller for category management endpoints
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {
    
    private final CategoryService categoryService;
    
    /**
     * Get all categories (Public)
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        log.info("Fetching all categories");
        
        List<CategoryResponse> categories = categoryService.getAllCategories();
        
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get category by ID (Public)
     */
    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        log.info("Fetching category by ID: {}", id);
        
        CategoryResponse category = categoryService.getCategoryById(id);
        
        return ResponseEntity.ok(category);
    }
    
    /**
     * Create new category (Admin only)
     */
    @PostMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        log.info("Creating new category: {}", categoryRequest.getName());
        
        CategoryResponse category = categoryService.createCategory(categoryRequest);
        
        log.info("Category created successfully with ID: {}", category.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }
    
    /**
     * Update category by ID (Admin only)
     */
    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, 
                                                          @Valid @RequestBody CategoryRequest categoryRequest) {
        log.info("Updating category with ID: {}", id);
        
        CategoryResponse category = categoryService.updateCategory(id, categoryRequest);
        
        log.info("Category updated successfully: {}", category.getName());
        
        return ResponseEntity.ok(category);
    }
    
    /**
     * Delete category by ID (Admin only)
     */
    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        log.info("Deleting category with ID: {}", id);
        
        categoryService.deleteCategory(id);
        
        log.info("Category deleted successfully");
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Search categories (Public)
     */
    @GetMapping("/categories/search")
    public ResponseEntity<Page<CategoryResponse>> searchCategories(@RequestParam String search,
                                                                  @PageableDefault(size = 10) Pageable pageable) {
        log.info("Searching categories with query: {}", search);
        
        Page<CategoryResponse> categories = categoryService.searchCategories(search, pageable);
        
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get root categories (Public)
     */
    @GetMapping("/categories/root")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        log.info("Fetching root categories");
        
        List<CategoryResponse> categories = categoryService.getRootCategories();
        
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get subcategories by parent ID (Public)
     */
    @GetMapping("/categories/{id}/subcategories")
    public ResponseEntity<List<CategoryResponse>> getSubCategories(@PathVariable Long id) {
        log.info("Fetching subcategories for parent ID: {}", id);
        
        List<CategoryResponse> subcategories = categoryService.getSubCategories(id);
        
        return ResponseEntity.ok(subcategories);
    }
}
