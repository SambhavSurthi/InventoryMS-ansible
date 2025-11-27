package com.ims.inventoryms.service;

import com.ims.inventoryms.dto.CategoryRequest;
import com.ims.inventoryms.dto.CategoryResponse;
import com.ims.inventoryms.entity.Category;
import com.ims.inventoryms.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for category management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    /**
     * Get all categories (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findActiveCategories();
        return categories.stream().map(this::mapToCategoryResponse).toList();
    }
    
    /**
     * Get all active categories
     */
    @Transactional(readOnly = true)
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findActiveCategories();
    }
    
    /**
     * Get all categories with pagination
     */
    @Transactional(readOnly = true)
    public Page<Category> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }
    
    /**
     * Get category by ID (DTO-based)
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        return mapToCategoryResponse(category);
    }
    
    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public Category getCategoryByIdEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
    }
    
    /**
     * Create a new category (DTO-based)
     */
    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        // Check if category name already exists
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + categoryRequest.getName());
        }
        
        // Create new category
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setIsActive(categoryRequest.getIsActive());
        
        // Set parent category if provided
        if (categoryRequest.getParentCategoryId() != null) {
            Category parentCategory = categoryRepository.findById(categoryRequest.getParentCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found with id: " + categoryRequest.getParentCategoryId()));
            category.setParentCategory(parentCategory);
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Category created successfully: {}", savedCategory.getName());
        
        return mapToCategoryResponse(savedCategory);
    }
    
    /**
     * Create a new category
     */
    public Category createCategory(Category category) {
        // Check if category name already exists
        if (categoryRepository.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + category.getName());
        }
        
        // Validate parent category if provided
        if (category.getParentCategory() != null) {
            Category parentCategory = categoryRepository.findById(category.getParentCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found with id: " + category.getParentCategory().getId()));
            category.setParentCategory(parentCategory);
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Category created successfully: {}", savedCategory.getName());
        
        return savedCategory;
    }
    
    /**
     * Update category by ID (DTO-based)
     */
    public CategoryResponse updateCategory(Long id, CategoryRequest categoryRequest) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        // Check if category name already exists (excluding current category)
        if (!existingCategory.getName().equals(categoryRequest.getName()) && 
            categoryRepository.existsByName(categoryRequest.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + categoryRequest.getName());
        }
        
        // Update category fields
        existingCategory.setName(categoryRequest.getName());
        existingCategory.setDescription(categoryRequest.getDescription());
        existingCategory.setIsActive(categoryRequest.getIsActive());
        
        // Set parent category if provided
        if (categoryRequest.getParentCategoryId() != null) {
            if (categoryRequest.getParentCategoryId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            
            Category parentCategory = categoryRepository.findById(categoryRequest.getParentCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found with id: " + categoryRequest.getParentCategoryId()));
            existingCategory.setParentCategory(parentCategory);
        } else {
            existingCategory.setParentCategory(null);
        }
        
        Category savedCategory = categoryRepository.save(existingCategory);
        
        log.info("Category updated successfully: {}", savedCategory.getName());
        
        return mapToCategoryResponse(savedCategory);
    }
    
    /**
     * Update category by ID
     */
    public Category updateCategory(Long id, Category category) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        // Check if category name already exists (excluding current category)
        if (!existingCategory.getName().equals(category.getName()) && 
            categoryRepository.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + category.getName());
        }
        
        // Validate parent category if provided
        if (category.getParentCategory() != null) {
            if (category.getParentCategory().getId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            
            Category parentCategory = categoryRepository.findById(category.getParentCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found with id: " + category.getParentCategory().getId()));
            category.setParentCategory(parentCategory);
        }
        
        // Update category fields
        existingCategory.setName(category.getName());
        existingCategory.setDescription(category.getDescription());
        existingCategory.setParentCategory(category.getParentCategory());
        existingCategory.setIsActive(category.getIsActive());
        
        Category savedCategory = categoryRepository.save(existingCategory);
        
        log.info("Category updated successfully: {}", savedCategory.getName());
        
        return savedCategory;
    }
    
    /**
     * Delete category by ID
     */
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        // Check if category has subcategories
        List<Category> subCategories = categoryRepository.findByParentCategoryId(id);
        if (!subCategories.isEmpty()) {
            throw new IllegalArgumentException("Cannot delete category with subcategories. Please delete or move subcategories first.");
        }
        
        // Check if category has products
        long productCount = categoryRepository.countProductsByCategoryId(id);
        if (productCount > 0) {
            throw new IllegalArgumentException("Cannot delete category with products. Please move or delete products first.");
        }
        
        categoryRepository.delete(category);
        
        log.info("Category deleted successfully: {}", category.getName());
    }
    
    
    /**
     * Toggle category active status
     */
    public Category toggleCategoryStatus(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        category.setIsActive(!category.getIsActive());
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Category status toggled to {} for category: {}", savedCategory.getIsActive(), savedCategory.getName());
        
        return savedCategory;
    }
    
    /**
     * Get category hierarchy
     */
    @Transactional(readOnly = true)
    public Category getCategoryHierarchy(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        // Load subcategories
        List<Category> subCategories = categoryRepository.findByParentCategoryId(id);
        category.setSubCategories(subCategories);
        
        return category;
    }
    
    /**
     * Move category to different parent
     */
    public Category moveCategory(Long categoryId, Long newParentId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
        
        if (newParentId != null) {
            if (newParentId.equals(categoryId)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            
            Category parentCategory = categoryRepository.findById(newParentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found with id: " + newParentId));
            category.setParentCategory(parentCategory);
        } else {
            category.setParentCategory(null);
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Category moved successfully: {} to parent: {}", savedCategory.getName(), 
                savedCategory.getParentCategory() != null ? savedCategory.getParentCategory().getName() : "root");
        
        return savedCategory;
    }
    
    /**
     * Get category statistics
     */
    @Transactional(readOnly = true)
    public CategoryStats getCategoryStats(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        long productCount = categoryRepository.countProductsByCategoryId(id);
        List<Category> subCategories = categoryRepository.findByParentCategoryId(id);
        
        return new CategoryStats(category, productCount, subCategories.size());
    }
    
    /**
     * Category statistics data class
     */
    public static class CategoryStats {
        private final Category category;
        private final long productCount;
        private final int subCategoryCount;
        
        public CategoryStats(Category category, long productCount, int subCategoryCount) {
            this.category = category;
            this.productCount = productCount;
            this.subCategoryCount = subCategoryCount;
        }
        
        public Category getCategory() { return category; }
        public long getProductCount() { return productCount; }
        public int getSubCategoryCount() { return subCategoryCount; }
    }
    
    /**
     * Get root categories (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        List<Category> categories = categoryRepository.findRootCategories();
        return categories.stream().map(this::mapToCategoryResponse).toList();
    }
    
    /**
     * Get subcategories by parent ID (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getSubCategories(Long parentId) {
        List<Category> subcategories = categoryRepository.findByParentCategoryId(parentId);
        return subcategories.stream().map(this::mapToCategoryResponse).toList();
    }
    
    /**
     * Search categories (DTO-based)
     */
    @Transactional(readOnly = true)
    public Page<CategoryResponse> searchCategories(String search, Pageable pageable) {
        Page<Category> categories = categoryRepository.searchCategories(search, pageable);
        return categories.map(this::mapToCategoryResponse);
    }
    
    /**
     * Map Category entity to CategoryResponse DTO
     */
    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .productCount(categoryRepository.countProductsByCategoryId(category.getId()))
                .isActive(category.getIsActive())
                .hasParent(category.hasParent())
                .hasSubCategories(category.hasSubCategories())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
