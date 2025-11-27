package com.ims.inventoryms.repository;

import com.ims.inventoryms.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity operations
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find category by name
     */
    Optional<Category> findByName(String name);
    
    /**
     * Check if category exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Find active categories
     */
    @Query("SELECT c FROM Category c WHERE c.isActive = true")
    List<Category> findActiveCategories();
    
    /**
     * Find categories by parent category
     */
    @Query("SELECT c FROM Category c WHERE c.parentCategory.id = :parentId AND c.isActive = true")
    List<Category> findByParentCategoryId(@Param("parentId") Long parentId);
    
    /**
     * Find root categories (no parent)
     */
    @Query("SELECT c FROM Category c WHERE c.parentCategory IS NULL AND c.isActive = true")
    List<Category> findRootCategories();
    
    /**
     * Search categories by name
     */
    @Query("SELECT c FROM Category c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "c.isActive = true")
    Page<Category> searchCategories(@Param("search") String search, Pageable pageable);
    
    /**
     * Count products in category
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    long countProductsByCategoryId(@Param("categoryId") Long categoryId);
    
    /**
     * Find categories with product count
     */
    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.name")
    List<Category> findAllActiveCategoriesOrderByName();
}
